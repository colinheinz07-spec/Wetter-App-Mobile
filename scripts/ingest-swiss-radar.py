"""MeteoSwiss PRECIP (RZC) live radar rate; source: MeteoSwiss Open Data.

Use the public STAC catalogue, numeric ODIM HDF5 rates, and the native
projection. Missing pixels stay missing; zero means measured undetect.
"""
import base64
import datetime as dt
import gzip
import io
import json
import re
import urllib.request
from pathlib import Path

import h5py
import numpy as np
from pyproj import CRS, Transformer

ITEMS = 'https://data.geo.admin.ch/api/stac/v1/collections/ch.meteoschweiz.ogd-radar-precip/items/'
GRID = dict(west=2., south=45., step=.01, nx=1601, ny=1201, scale=.01, missing=-32768)
AGE = dt.timedelta(minutes=20)


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent':'WetterApp/1.0 (Source: MeteoSwiss)'})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()


def candidates(now):
    result = []
    for day in sorted({now.date(), (now-AGE).date()}, reverse=True):
        item = day.strftime('%Y%m%d')+'-ch'
        doc = json.loads(get(ITEMS+item))
        for name, asset in doc.get('assets', {}).items():
            match = re.fullmatch(r'rzc(\d{2})(\d{3})(\d{4})[a-z0-9]{2}\.\d{3}\.h5',name,re.I)
            if not match:
                continue
            stamp = dt.datetime.strptime('20'+''.join(match.groups()),'%Y%j%H%M').replace(tzinfo=dt.timezone.utc)
            href = asset.get('href','')
            if now-AGE <= stamp <= now and href.startswith('https://data.geo.admin.ch/ch.meteoschweiz.ogd-radar-precip/'+item+'/'):
                result.append((stamp,href))
    return sorted(result,reverse=True)


def string(value):
    return value.decode('ascii').strip('\x00 ') if isinstance(value,bytes) else str(value).strip('\x00 ')


def decode(blob, stamp, now):
    with h5py.File(io.BytesIO(blob),'r') as h:
        what, where = h['what'].attrs, h['where'].attrs
        actual = dt.datetime.strptime(string(what['date'])+string(what['time']),'%Y%m%d%H%M%S').replace(tzinfo=dt.timezone.utc)
        if actual != stamp or not now-AGE <= actual <= now:
            raise ValueError('Stale or mismatched MeteoSwiss radar time')
        item = h['dataset1/data1']; meta = item['what'].attrs
        if string(meta['quantity'])!='RATE' or string(meta['unit'])!='mm/h':
            raise ValueError('Expected instantaneous mm/h')
        raw=item['data'][...]
        if raw.shape!=(int(where['ysize']),int(where['xsize'])):
            raise ValueError('Radar shape mismatch')
        crs=CRS.from_user_input(string(where['projdef']))
        project=Transformer.from_crs(4326,crs,always_xy=True)
        dx,dy=float(where['xscale'])/crs.axis_info[0].unit_conversion_factor,float(where['yscale'])/crs.axis_info[1].unit_conversion_factor
        west,south=project.transform(float(where['LL_lon']),float(where['LL_lat']))
        east,north=west+raw.shape[1]*dx,south+raw.shape[0]*dy
        ex,ey=project.transform(float(where['UR_lon']),float(where['UR_lat']))
        if abs(ex-east)>dx or abs(ey-north)>dy:
            raise ValueError('Radar georeferencing mismatch')
        x,y=np.meshgrid(GRID['west']+np.arange(GRID['nx'])*GRID['step'],GRID['south']+np.arange(GRID['ny'])*GRID['step'])
        px,py=project.transform(x,y)
        ix,iy=np.floor((px-west)/dx).astype(int),np.floor((north-py)/dy).astype(int)
        valid=(ix>=0)&(ix<raw.shape[1])&(iy>=0)&(iy<raw.shape[0])
        native=raw[iy[valid],ix[valid]]
        rates=native.astype(float)*float(meta['gain'])+float(meta['offset'])
        rates[native==meta['undetect']]=0
        # Swiss RZC uses NaN nodata; never let it become zero.
        usable=np.isfinite(native)&np.isfinite(rates)&(native!=meta['nodata'])&(rates>=0)
        encoded=np.full(native.shape,GRID['missing'],dtype='<i2')
        encoded[usable]=np.clip(np.rint(rates[usable]/GRID['scale']),0,32767).astype('<i2')
        values=np.full(ix.shape,GRID['missing'],dtype='<i2');values[valid]=encoded
        if not np.any(values!=GRID['missing']):
            raise ValueError('Empty MeteoSwiss radar coverage')
        return dict(schema=1,product='SWISS-RATE',source='MeteoSwiss PRECIP (RZC)',time=actual.isoformat(),grid=GRID,amount=base64.b64encode(values.tobytes()).decode('ascii'))


def main():
    now=dt.datetime.now(dt.timezone.utc)
    for stamp,href in candidates(now)[:3]:
        try:
            data=decode(get(href),stamp,now)
            path=Path('data/swiss-radar.json.gz');path.parent.mkdir(exist_ok=True)
            tmp=path.with_suffix('.tmp')
            with tmp.open('wb') as f:
                with gzip.GzipFile(filename='',fileobj=f,mode='wb',mtime=0) as z:z.write(json.dumps(data,separators=(',',':')).encode())
            tmp.replace(path)
            print(f'MeteoSwiss RZC {stamp}: {path.stat().st_size} bytes',flush=True)
            return
        except Exception as exc:
            print(f'{href}: {exc}',flush=True)
    raise RuntimeError('No fresh MeteoSwiss PRECIP scan available')


if __name__=='__main__':main()
