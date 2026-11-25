"""Publish DWD RV quantitative 5-minute forecasts, never image colours."""
import base64
import datetime as dt
import gzip
import io
import json
import re
import sys
import tarfile
import urllib.request
from pathlib import Path

import h5py
import numpy as np
from pyproj import CRS, Transformer

URL = 'https://opendata.dwd.de/weather/radar/composite/rv/'
GRID = dict(west=4., south=46., step=.01, nx=1301, ny=1001, scale=.01, missing=-32768)

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'WetterApp/1.0'}), timeout=40) as response:
        return response.read()

def timestamp(attrs, prefix=''):
    return dt.datetime.strptime((attrs[prefix+'date']+attrs[prefix+'time']).decode('ascii'), '%Y%m%d%H%M%S').replace(tzinfo=dt.timezone.utc)

def decode(blob, now):
    frames = {}; base = None; cells = None; geometry = None
    with tarfile.open(fileobj=io.BytesIO(blob)) as archive:
        for member in archive.getmembers():
            match = re.fullmatch(r'composite_rv_\d{8}_\d{4}_(\d{3})-hd5', member.name)
            if not match or not member.isfile(): continue
            lead = int(match[1])
            if lead not in range(5,121,5): continue
            with h5py.File(io.BytesIO(archive.extractfile(member).read()), 'r') as h:
                run = timestamp(h['what'].attrs); d = h['dataset1']; what = d['what'].attrs
                end = timestamp(what,'end'); start = timestamp(what,'start')
                if (base is not None and run != base) or not now-dt.timedelta(minutes=25) <= run <= now or end != run+dt.timedelta(minutes=lead) or end-start != dt.timedelta(minutes=5):
                    raise ValueError('Invalid RV interval or cycle')
                base = run
                where=h['where'].attrs; product=d['data1']; meta=product['what'].attrs; raw=product['data'][...]
                if meta['quantity'] != b'ACRR': raise ValueError('RV is not accumulated precipitation')
                nx,ny=int(where['xsize']),int(where['ysize'])
                if raw.shape != (ny,nx): raise ValueError('RV shape mismatch')
                signature=tuple(where[k] for k in ('projdef','LL_lon','LL_lat','xscale','yscale','xsize','ysize'))
                if cells is None:
                    geometry=signature
                    crs=CRS.from_user_input(where['projdef'].decode('ascii')); project=Transformer.from_crs('EPSG:4326',crs,always_xy=True)
                    west,south=project.transform(where['LL_lon'],where['LL_lat']); dx,dy=where['xscale'],where['yscale']
                    east,north=west+nx*dx,south+ny*dy
                    ex,ey=project.transform(where['UR_lon'],where['UR_lat'])
                    if abs(ex-east)>dx or abs(ey-north)>dy: raise ValueError('RV corner mismatch')
                    x,y=np.meshgrid(GRID['west']+np.arange(GRID['nx'])*GRID['step'],GRID['south']+np.arange(GRID['ny'])*GRID['step'])
                    sx,sy=project.transform(x,y); ix=np.floor((sx-west)/dx).astype(int); iy=np.floor((north-sy)/dy).astype(int)
                    valid=(ix>=0)&(ix<nx)&(iy>=0)&(iy<ny); cells=(ix,iy,valid)
                if signature != geometry: raise ValueError('RV geometry changed within cycle')
                ix,iy,valid=cells; selected=raw[iy[valid],ix[valid]]; mm=selected.astype(float)*float(meta['gain'])+float(meta['offset'])
                mm[selected==meta['undetect']]=0; mm[selected==meta['nodata']]=np.nan
                out=np.full(valid.shape,GRID['missing'],dtype='<i2'); out[valid]=np.where(np.isfinite(mm)&(mm>=0)&(mm<=327.67),np.rint(mm*100),GRID['missing']).astype('<i2')
                if not np.any(out!=GRID['missing']): raise ValueError('Empty RV raster')
                frames[str(lead)]=base64.b64encode(out.tobytes()).decode('ascii')
    if set(frames)!=set(map(str,range(5,121,5))): raise ValueError('Incomplete RV cycle')
    return dict(schema=1,product='RV',time=base.isoformat(),grid=GRID,intervalMinutes=5,frames=frames)

def main():
    now=dt.datetime.now(dt.timezone.utc)
    if len(sys.argv)==2:
        # Local fixture verification: derive reference time from archive name.
        blob=Path(sys.argv[1]).read_bytes()
        with tarfile.open(fileobj=io.BytesIO(blob)) as t:
            stamp=re.search(r'composite_rv_(\d{8}_\d{4})_',t.getmembers()[0].name)[1]
        now=dt.datetime.strptime(stamp,'%Y%m%d_%H%M').replace(tzinfo=dt.timezone.utc)
    else:
        names=sorted(set(re.findall(r'composite_rv_\d{8}_\d{4}\.tar',get(URL).decode())),reverse=True)
        if not names: raise ValueError('No RV cycles listed')
        blob=get(URL+names[0])
    payload=decode(blob,now); path=Path('data/radar-nowcast.json.gz'); temp=path.with_suffix('.tmp')
    with temp.open('wb') as f:
        with gzip.GzipFile(filename='',fileobj=f,mode='wb',mtime=0,compresslevel=5) as z:
            z.write(json.dumps(payload,separators=(',',':')).encode())
    temp.replace(path); print(f'RV {payload["time"]}: {path.stat().st_size} bytes')

if __name__=='__main__': main()
