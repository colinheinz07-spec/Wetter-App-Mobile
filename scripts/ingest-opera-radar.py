"""EUMETNET OPERA RATE composite (CC BY 4.0), not DWD WMS imagery.

Read the public rolling object store; publish only a compact numeric grid.
RATE is instantaneous mm/h, not a five-minute accumulation.
"""
import base64
import datetime as dt
import gzip
import io
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import h5py
import numpy as np
from pyproj import CRS, Transformer

BUCKETS = (
    'https://s3.waw3-1.cloudferro.com/openradar-24h',
    'https://object-store.os-api.cci1.ecmwf.int/openradar-24h-backup',
)
GRID = dict(west=2., south=45., step=.01, nx=1601, ny=1201, scale=.01, missing=-32768)

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent':'WetterApp/1.0 (OPERA CC BY 4.0)'})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()

def stamp(value):
    return dt.datetime.strptime(value, '%Y%m%dT%H%M').replace(tzinfo=dt.timezone.utc)

def candidates(bucket, now):
    records = []
    for day in {now.date(), (now-dt.timedelta(minutes=40)).date()}:
        prefix = day.strftime('%Y/%m/%d/OPERA/COMP/')
        root = ET.fromstring(get(bucket+'?'+urllib.parse.urlencode({'list-type':'2','prefix':prefix})))
        for el in root.findall('.//{*}Key'):
            key = el.text or ''
            parts = key.rsplit('/',1)[-1].split('@')
            if len(parts)!=4 or parts[0]!='OPERA' or parts[2]!='0' or parts[3]!='RATE.h5':
                continue
            time = stamp(parts[1])
            if now-dt.timedelta(minutes=35)<=time<=now:
                records.append((time,key))
    return sorted(records, reverse=True)

def string(value):
    return value.decode('ascii').strip('\x00 ') if isinstance(value, bytes) else str(value).strip('\x00 ')

def decode(blob, time):
    with h5py.File(io.BytesIO(blob), 'r') as h:
        where = h['where'].attrs
        what = h['what'].attrs
        actual = dt.datetime.strptime(string(what['date'])+string(what['time']), '%Y%m%d%H%M%S').replace(tzinfo=dt.timezone.utc)
        if abs((actual-time).total_seconds())>60:
            raise ValueError('OPERA timestamp differs from object key')
        item = next((h[k][j] for k in h if k.startswith('dataset') for j in h[k]
                     if j.startswith('data') and 'what' in h[k][j] and string(h[k][j]['what'].attrs.get('quantity',''))=='RATE'), None)
        if item is None:
            raise ValueError('Missing RATE product')
        meta, raw = item['what'].attrs, item['data'][...]
        if raw.shape!=(int(where['ysize']), int(where['xsize'])):
            raise ValueError('OPERA grid shape mismatch')
        crs = CRS.from_user_input(string(where['projdef']))
        project = Transformer.from_crs('EPSG:4326', crs, always_xy=True)
        dx, dy = float(where['xscale'])/crs.axis_info[0].unit_conversion_factor, float(where['yscale'])/crs.axis_info[1].unit_conversion_factor
        west, south = project.transform(float(where['LL_lon']),float(where['LL_lat']))
        east,north = west+raw.shape[1]*dx,south+raw.shape[0]*dy
        ex,ey = project.transform(float(where['UR_lon']),float(where['UR_lat']))
        if abs(ex-east)>dx*2 or abs(ey-north)>dy*2:
            raise ValueError('OPERA corner mismatch')
        x,y = np.meshgrid(GRID['west']+np.arange(GRID['nx'])*GRID['step'], GRID['south']+np.arange(GRID['ny'])*GRID['step'])
        px,py=project.transform(x,y)
        ix,iy=np.floor((px-west)/dx).astype(int),np.floor((north-py)/dy).astype(int)
        valid=(ix>=0)&(ix<raw.shape[1])&(iy>=0)&(iy<raw.shape[0])
        values=np.full(ix.shape,GRID['missing'],dtype='<i2')
        samples=raw[iy[valid],ix[valid]]
        rates=samples.astype(float)*float(meta['gain'])+float(meta['offset'])
        rates[samples==meta['undetect']]=0.
        usable=(samples!=meta['nodata'])&np.isfinite(rates)&(rates>=0)
        output=np.full(samples.shape,GRID['missing'],dtype='<i2')
        output[usable]=np.clip(np.rint(rates[usable]/GRID['scale']),0,32767).astype('<i2')
        values[valid]=output
        if not np.any(values!=GRID['missing']):
            raise ValueError('No valid OPERA pixels')
        return dict(schema=1,product='OPERA-RATE',source='EUMETNET OPERA NIMBUS (CC BY 4.0)',time=time.isoformat(),grid=GRID,amount=base64.b64encode(values.tobytes()).decode('ascii'))

def main():
    now=dt.datetime.now(dt.timezone.utc)
    for bucket in BUCKETS:
        try:
            for time,key in candidates(bucket,now)[:2]:
                try:
                    data=decode(get(bucket+'/'+urllib.parse.quote(key,safe='/@')),time)
                    path=Path('data/opera-radar.json.gz');path.parent.mkdir(exist_ok=True)
                    tmp=path.with_suffix('.tmp')
                    with gzip.GzipFile(filename=str(tmp),mode='wb',mtime=0) as stream:
                        stream.write(json.dumps(data,separators=(',',':')).encode())
                    tmp.replace(path)
                    print(f'OPERA {time}: {path.stat().st_size} bytes')
                    return
                except Exception as exc:
                    print(f'{key}: {exc}',flush=True)
        except Exception as exc:
            print(f'{bucket}: {exc}',flush=True)
    raise RuntimeError('No fresh OPERA RATE product available')

if __name__=='__main__':
    main()
