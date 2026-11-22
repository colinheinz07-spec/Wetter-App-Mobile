"""DWD ICON-D2-RUC actual DEMAX_HAIL_S; not an extrapolation from CAPE.

Hourly original values, metres -> centimetres, nearest triangular source
cell on a 0.02-degree display grid (no averaging of extreme hail sizes).
The provider's coordinates and each GRIB's horizontal grid UUID must match.
"""
import argparse
import base64
import datetime as dt
import gzip
import json
import re
import runpy
from pathlib import Path
from urllib.parse import quote, unquote
from urllib.request import Request, urlopen
import numpy as np

ROOT='https://opendata.dwd.de/weather/nwp/v1/m/icon-d2-ruc/p/'
MODEL='ICON-D2-RUC'
FIELD='DEMAX_HAIL_S'
HERE=Path(__file__).parent
HOURS=list(range(28))

def get(url):
    with urlopen(Request(url,headers={'User-Agent':'WetterApp/1.0'}),timeout=40) as r:return r.read()

def runs(parameter):
    return sorted(set(unquote(x) for x in re.findall(r'href="([^"/]+T\d{2}(?::|%3[Aa])\d{2})/"',get(ROOT+parameter+'/r/').decode())),reverse=True)

def folder(parameter,run):return ROOT+parameter+'/r/'+quote(run,safe='')+'/s/'
def filename(hour):return f'PT{hour:03}H00M.grib2'

def choose_run(now,source=runs,download=get):
    for run in source(FIELD):
        at=dt.datetime.fromisoformat(run).replace(tzinfo=dt.timezone.utc)
        if not dt.timedelta(0)<=now-at<=dt.timedelta(hours=6):continue
        try:
            listing=download(folder(FIELD,run)).decode()
            if all(filename(h) in listing for h in HOURS):return run
        except OSError:continue
    raise RuntimeError('No complete recent ICON-D2-RUC hail run')

def decode(blob,run=None,hour=None):
    import eccodes as ec
    g=ec.codes_new_from_message(blob)
    try:
        if ec.codes_get(g,'gridType')!='unstructured_grid':raise ValueError('Unexpected RUC grid type')
        uuid=ec.codes_get_string(g,'uuidOfHGrid')
        if not uuid or len(uuid)<16:raise ValueError('Missing horizontal grid identity')
        if run is not None:
            actual=f"{ec.codes_get_long(g,'dataDate'):08d}{ec.codes_get_long(g,'dataTime'):04d}"
            expected=dt.datetime.fromisoformat(run).strftime('%Y%m%d%H%M')
            unit=ec.codes_get_long(g,'stepUnits');step=ec.codes_get_long(g,'endStep')
            if actual!=expected or (step if unit==1 else step/60 if unit==0 else None)!=hour or ec.codes_get(g,'stepType')!='instant':raise ValueError('RUC hail run/step mismatch')
        a=ec.codes_get_values(g).astype(float);missing=ec.codes_get_double(g,'missingValue')
        if len(a)<100000 or len(a)>2000000:raise ValueError('Unexpected RUC cell count')
        a[(a==missing)|~np.isfinite(a)]=np.nan
        return uuid,a
    finally:ec.codes_release(g)

def coords(parameter,run,uuid,n):
    # Time-invariant files may have a dedicated static run. Accept them only
    # when ecCodes proves their horizontal grid is identical to the product.
    candidates=[run]
    try:candidates+=runs(parameter)[:3]
    except OSError:pass
    for candidate in dict.fromkeys(candidates):
        try:
            identity,a=decode(get(folder(parameter,candidate)+filename(0)))
            if identity==uuid and len(a)==n and np.all(np.isfinite(a)):return a
        except (OSError,ValueError):continue
    raise ValueError('No matching RUC coordinate message '+parameter)

def nearest_indices(lon,lat,x,y):
    from scipy.spatial import cKDTree
    def xyz(lon,lat):
        lon=np.radians(lon);lat=np.radians(lat);return np.stack((np.cos(lat)*np.cos(lon),np.cos(lat)*np.sin(lon),np.sin(lat)),axis=-1)
    xx,yy=np.meshgrid(x,y);distance,index=cKDTree(xyz(lon,lat)).query(xyz(xx.ravel(),yy.ravel()),workers=2)
    return index,distance<=2*np.sin(3.5/(2*6371.0))

def hail_cm(a,index,covered):
    # DWD ICON documentation specifies metres for DEMAX_HAIL_S.
    value=a[index];return np.where(covered&(value>=0)&(value<=.5),value*100,np.nan)

def main():
    p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--previous-run');args=p.parse_args()
    now=dt.datetime.now(dt.timezone.utc);run=choose_run(now);stamp=dt.datetime.fromisoformat(run).replace(tzinfo=dt.timezone.utc).isoformat()
    if args.previous_run and dt.datetime.fromisoformat(stamp)<=dt.datetime.fromisoformat(args.previous_run):print('No newer complete RUC run');return
    uuid,first=decode(get(folder(FIELD,run)+filename(0)),run,0)
    lon=coords('CLON',run,uuid,len(first));lat=coords('CLAT',run,uuid,len(first))
    # DWD GRIB coordinate fields are deg E/N. Reject inconsistent inputs.
    if not (35<lat.min()<52 and 52<lat.max()<65 and -15<lon.min()<5 and 10<lon.max()<35):raise ValueError('Unexpected RUC geographic coordinates')
    step=.02;x=np.arange(190,836)*step;y=np.arange(2315,2791)*step
    index,covered=nearest_indices(lon,lat,x,y)
    grid=dict(west=float(x[0]),south=float(y[0]),step=step,nx=len(x),ny=len(y),scale=.1,missing=-32768)
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True);generated=now.isoformat()
    meta=dict(schema=2,product='hail',gridMapping='nearest-source-cell',model=MODEL,run=stamp,generated=generated,hours=HOURS,coreHours=[],grid=grid,scales={'hail':.1},frames={},source='DWD ICON-D2-RUC DEMAX_HAIL_S',sourceUrl=ROOT+FIELD+'/')
    points=runpy.run_path(str(HERE/'native-point.py'))['PointTiles'](out,MODEL,stamp,generated,HOURS,required={'hail'})
    points.meta.update(product='hail',gridMapping='nearest-source-cell')
    for h in HOURS:
        identity,a=(uuid,first) if h==0 else decode(get(folder(FIELD,run)+filename(h)),run,h)
        if identity!=uuid or len(a)!=len(first):raise ValueError('RUC grid changed during forecast')
        values=hail_cm(a,index,covered);encoded=np.where(np.isfinite(values),np.rint(values*10),-32768).astype('<i2')
        if not np.any(encoded!=-32768):raise ValueError('Empty hail field')
        packed=base64.b64encode(encoded.tobytes()).decode('ascii')
        packet=dict(schema=2,run=stamp,generated=generated,hour=h,field='hail',values=packed)
        with gzip.open(out/f'{h}-hail.json.gz','wt',compresslevel=5) as f:json.dump(packet,f,separators=(',',':'))
        meta['frames'][str(h)]=['hail'];points.add(grid,h,{'hail':packed},meta['scales'])
        print(f'{MODEL} +{h} h: {np.count_nonzero(encoded!=-32768)} cells',flush=True)
    points.finish();(out/'index.json').write_text(json.dumps(meta,separators=(',',':')))

if __name__=='__main__':main()
