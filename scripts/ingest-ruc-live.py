"""Publish current ICON-D2-RUC surface analysis on its actual native cells.

The coordinate tiles include a small halo, so querying across tile boundaries
selects the same nearest triangular source cell. No stations, regular grid
resampling, forecast interpolation or arbitrary lapse-rate corrections.
"""
import argparse
import base64
import datetime as dt
import gzip
import json
import runpy
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import numpy as np

UTC = dt.timezone.utc
HERE = Path(__file__).parent
MODEL = 'ICON-D2-RUC'
CORE = {'temp2', 'dew', 'wind', 'winddir', 'rh2', 'slp', 'cloud'}
INPUTS = ('T_2M', 'TD_2M', 'U_10M', 'V_10M', 'PMSL', 'RELHUM_2M', 'CLCT')
MISSING = -32768
HALO = .10


def stamp(run):
    return dt.datetime.fromisoformat(run).replace(tzinfo=UTC).isoformat()


def decode(blob, run, hour=0, maximum=False):
    import eccodes as ec
    handle = ec.codes_new_from_message(blob)
    try:
        if ec.codes_get(handle, 'gridType') != 'unstructured_grid':
            raise ValueError('Not the native triangular RUC grid')
        identity = ec.codes_get_string(handle, 'uuidOfHGrid')
        actual = f"{ec.codes_get_long(handle, 'dataDate'):08d}{ec.codes_get_long(handle, 'dataTime'):04d}"
        expected = dt.datetime.fromisoformat(run).strftime('%Y%m%d%H%M')
        unit = ec.codes_get_long(handle, 'stepUnits')
        factor = {0: 1/60, 1: 1, 13: 1/3600}.get(unit)
        end = ec.codes_get_long(handle, 'endStep')
        start = ec.codes_get_long(handle, 'startStep')
        kind = ec.codes_get(handle, 'stepType')
        if (not identity or actual != expected or factor is None or abs(end*factor-hour)>1e-6
                or (maximum and (kind not in ('max','instant') or start != 0 or hour not in (0,1) or (hour==1 and kind!='max')))
                or (not maximum and kind != 'instant')):
            raise ValueError('RUC field run, valid time or interval mismatch')
        a = ec.codes_get_values(handle).astype(float)
        missing = ec.codes_get_double(handle, 'missingValue')
        a[(a == missing) | ~np.isfinite(a)] = np.nan
        if not 100000 <= len(a) <= 2000000:
            raise ValueError('Unexpected RUC cell count')
        return identity, a
    finally:
        ec.codes_release(handle)


def surface_fields(raw):
    u, v = raw['U_10M'], raw['V_10M']
    return {'temp2': raw['T_2M'] - 273.15, 'dew': raw['TD_2M'] - 273.15,
            'wind': np.hypot(u, v)*3.6, 'winddir': np.mod(np.degrees(np.arctan2(-u, -v)), 360),
            'rh2': raw['RELHUM_2M'], 'slp': raw['PMSL']/100, 'cloud': raw['CLCT']}


def pack(a, dtype):
    return base64.b64encode(np.asarray(a, dtype=dtype).tobytes()).decode('ascii')


def encode_field(name, a):
    low, high = {'temp2': (-80,60), 'dew': (-80,60), 'wind': (0,300),
                 'gust': (0,300), 'winddir': (0,360), 'rh2': (0,100),
                 'cloud': (0,100), 'slp': (850,1100)}[name]
    valid = np.isfinite(a) & (a >= low) & (a <= high)
    return np.where(valid, np.rint(np.where(valid,a,0)*10), MISSING).astype('<i2')


def build_analysis_map(out, lon, lat, fields, run, generated, grid=None):
    """Nearest native analysis cell, never extrapolate beyond source coverage."""
    from scipy.spatial import cKDTree
    g = grid or dict(west=2,south=45,step=.02,nx=801,ny=601)
    def xyz(x,y):
        x,y=np.radians(x),np.radians(y)
        return np.column_stack((np.cos(y)*np.cos(x),np.cos(y)*np.sin(x),np.sin(y)))
    x,y=np.meshgrid(g['west']+np.arange(g['nx'])*g['step'],g['south']+np.arange(g['ny'])*g['step'])
    distance,idx=cKDTree(xyz(lon,lat)).query(xyz(x.ravel(),y.ravel()),workers=2)
    covered=distance*6371<=3.5
    packed={}
    for k in ('temp2','dew','wind','winddir','rh2'):
        a=encode_field(k,fields[k][idx]);a[~covered]=MISSING
        packed[k]=pack(a,'<i2')
    if not all(np.any(np.frombuffer(base64.b64decode(v),dtype='<i2')!=MISSING) for v in packed.values()):
        raise ValueError('Empty surface map field')
    packet=dict(schema=1,product='ruc-surface-map',run=int(dt.datetime.fromisoformat(run).timestamp()),generated=int(dt.datetime.fromisoformat(generated).timestamp()),grid=dict(g,scale=.1,missing=MISSING),fields=packed)
    with gzip.open(Path(out)/'analysis-map.json.gz','wt',compresslevel=5) as stream:
        json.dump(packet,stream,separators=(',',':'))
    print('Analysis map grid coverage:',round(100*covered.mean(),1),'%',flush=True)
    return packet


def build_snapshot(out, lon, lat, fields, run, generated, gust=None, terrain=None):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    if not CORE <= fields.keys() or ('gust' in fields) != (gust is not None):
        raise ValueError('Incomplete product')
    if lon.shape != lat.shape or any(a.shape != lon.shape for a in fields.values()):
        raise ValueError('RUC coordinates and fields differ')
    if not np.all(np.isfinite(lon)) or not np.all(np.isfinite(lat)) or np.any(np.abs(lon)>180) or np.any(np.abs(lat)>90):
        raise ValueError('Invalid coordinates')
    encoded = {k: encode_field(k,a) for k,a in fields.items()}
    if terrain is not None:
        if terrain.shape != lon.shape:raise ValueError('RUC terrain grid differs')
        terrain=np.where(np.isfinite(terrain)&(terrain>=-500)&(terrain<=9000),np.rint(terrain),MISSING).astype('<i2')
    if any(not np.any(encoded[k] != MISSING) for k in CORE):
        raise ValueError('Empty required analysis field')
    # Bucket source centers by one-degree tile, then include nearby centers
    # from adjacent tiles. Stable source index order also resolves exact ties.
    bx, by = np.floor(lon).astype(int), np.floor(lat).astype(int)
    buckets = {}
    for i in np.argsort(bx*1000+by, kind='stable'):
        buckets.setdefault((int(bx[i]),int(by[i])), []).append(i)
    buckets = {k: np.asarray(v,dtype=int) for k,v in buckets.items()}
    keys = sorted({(x+dx,y+dy) for x,y in buckets for dx in (-1,0,1) for dy in (-1,0,1)})
    tiles = []
    for x,y in keys:
        ids = np.concatenate([buckets[k] for dx in (-1,0,1) for dy in (-1,0,1)
                              if (k:=(x+dx,y+dy)) in buckets])
        ids = np.sort(ids[(lon[ids]>=x-HALO)&(lon[ids]<=x+1+HALO)&(lat[ids]>=y-HALO)&(lat[ids]<=y+1+HALO)])
        if not len(ids): continue
        key = f'{x}_{y}'
        packet = dict(schema=1,run=run,generated=generated,key=key,count=len(ids),
                      lon=pack(np.rint(lon[ids]*100000),'<i4'),lat=pack(np.rint(lat[ids]*100000),'<i4'),
                      values={k:pack(a[ids],'<i2') for k,a in encoded.items()})
        if terrain is not None:packet['terrain']=pack(terrain[ids],'<i2')
        with gzip.open(out/f'tile-{key}.json.gz','wt',compresslevel=5) as stream:
            json.dump(packet,stream,separators=(',',':'))
        tiles.append(key)
    manifest = dict(schema=1,product='ruc-surface-analysis',model=MODEL,gridMapping='native-triangular-cells',
                    run=run,generated=generated,coordScale=.00001,scale=.1,missing=MISSING,tileStep=1,
                    tiles=tiles,fields=sorted(fields),source='DWD ICON-D2-RUC')
    if gust: manifest['gust'] = gust
    if terrain is not None:manifest['terrainScale']=1
    (out/'index.json').write_text(json.dumps(manifest,separators=(',',':')))
    return manifest


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--output',required=True); parser.add_argument('--previous-run')
    args=parser.parse_args()
    helper=runpy.run_path(str(HERE/'ingest-ruc-hail.py'))
    get,runs,folder,filename,coords,decode_static=(helper[k] for k in ('get','runs','folder','filename','coords','decode'))
    now=dt.datetime.now(UTC)
    for run in runs('T_2M'):
        at=dt.datetime.fromisoformat(stamp(run))
        if not dt.timedelta(0)<=now-at<=dt.timedelta(minutes=90): continue
        if args.previous_run and at<=dt.datetime.fromisoformat(args.previous_run):
            print('No newer analysis'); return
        try:
            def read(p): return p,decode(get(folder(p,run)+filename(0)),run)
            with ThreadPoolExecutor(max_workers=4) as pool: raw=dict(pool.map(read,INPUTS))
            identity,first=raw['T_2M']
            if any(i!=identity or len(a)!=len(first) for i,a in raw.values()): raise ValueError('Mixed native grids')
            lon=coords('CLON',run,identity,len(first));lat=coords('CLAT',run,identity,len(first))
            if not (35<lat.min()<52 and 52<lat.max()<65 and -15<lon.min()<5 and 10<lon.max()<35): raise ValueError('Unexpected RUC coverage')
            fields=surface_fields({k:a for k,(_,a) in raw.items()});gust=None
            # DWD documents VMAX_10M at t=0 as the instantaneous diagnosed
            # gust. Prefer that analysis-time estimate. Only if unavailable
            # accept the previous run's completed +1h model interval.
            previous=(at-dt.timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
            for gust_run,hour in ((run,0),(previous,1)):
                try:
                    gi,ga=decode(get(folder('VMAX_10M',gust_run)+filename(hour)),gust_run,hour,True)
                    if gi==identity and len(ga)==len(first) and np.any(np.isfinite(ga)):
                        fields['gust']=ga*3.6;gust=dict(run=stamp(gust_run),valid=at.isoformat(),intervalMinutes=hour*60);break
                except (OSError,ValueError,RuntimeError) as e: print('No gust field:',gust_run,hour,e,flush=True)
            terrain=None
            # Model orography may have masked lateral boundary cells, unlike
            # CLON/CLAT. Require the identical grid and valid interior heights,
            # but retain those masks rather than rejecting the whole field.
            candidates=[run]
            try:candidates+=runs('HSURF')[:3]
            except OSError as e:print('HSURF run list:',e,flush=True)
            for candidate in dict.fromkeys(candidates):
                try:
                    ti,ta=decode_static(get(folder('HSURF',candidate)+filename(0)))
                    usable=np.isfinite(ta)&(ta>=-500)&(ta<=9000)
                    if ti==identity and len(ta)==len(first) and np.mean(usable)>.7:
                        terrain=np.where(usable,ta,np.nan);break
                    print('HSURF mismatch:',candidate,ti==identity,len(ta),float(np.mean(usable)),flush=True)
                except (OSError,ValueError,RuntimeError) as e:print('HSURF unavailable:',candidate,e,flush=True)
            manifest=build_snapshot(args.output,lon,lat,fields,at.isoformat(),dt.datetime.now(UTC).isoformat(),gust,terrain)
            build_analysis_map(args.output,lon,lat,fields,manifest['run'],manifest['generated'])
            i=np.argmin(((lon-10.2761)*np.cos(np.radians(47.4084)))**2+(lat-47.4084)**2)
            print('Oberstdorf native analysis',at.isoformat(),'temperature',round(float(fields['temp2'][i]),2),'model elevation',round(float(terrain[i])) if terrain is not None else 'unavailable',flush=True)
            print(f'Published {len(manifest["tiles"])} native tiles for {at.isoformat()}',flush=True); return
        except (OSError,ValueError,RuntimeError) as e: print('Incomplete run',run,e,flush=True)
    raise RuntimeError('No complete fresh RUC surface analysis available')


if __name__=='__main__': main()
