"""Publish the latest DWD RY 5-minute quantitative precipitation raster.

Read the ODIM HDF5 georeferencing and missing-value flags. Resample nearest
neighbour to a 0.01-degree geographic grid for point lookup in the browser.
No dry value is assigned to areas without radar coverage.
"""
import base64
import datetime as dt
import gzip
import io
import json
import urllib.request
from pathlib import Path

import h5py
import numpy as np
from pyproj import CRS, Transformer

URL='https://opendata.dwd.de/weather/radar/radolan/ry/raa01-ry_10000-latest-dwd---bin.hdf5'
GRID=dict(west=2.,south=45.,step=.01,nx=1601,ny=1201,scale=.01,missing=-32768)

def string(v):return v.decode('ascii').strip('\x00 ') if isinstance(v,bytes) else str(v).strip('\x00 ')

def timestamp(attrs,prefix=''):
    return dt.datetime.strptime(string(attrs[prefix+'date'])+string(attrs[prefix+'time']), '%Y%m%d%H%M%S').replace(tzinfo=dt.timezone.utc)

def decode(blob,now):
    with h5py.File(io.BytesIO(blob),'r') as h:
        where=h['where'].attrs; d=h['dataset1']; what=d['what'].attrs
        end=timestamp(what,'end') if 'enddate' in what else timestamp(h['what'].attrs)
        if not now-dt.timedelta(minutes=30)<=end<=now:raise ValueError(f'Invalid scan time: {end}')
        if 'startdate' in what:
            duration=(end-timestamp(what,'start')).total_seconds()
            if duration not in (0,300):raise ValueError(f'Unexpected accumulation interval: {duration}')
        product=d['data1'];meta=product['what'].attrs;raw=product['data'][...]
        quantity=string(meta['quantity'])
        if quantity not in ('ACRR','RATE'):raise ValueError(f'Unexpected precipitation quantity {quantity}')
        gain,offset=float(meta['gain']),float(meta['offset'])
        values=raw.astype(float)*gain+offset
        if quantity=='RATE':values/=12
        values[raw==meta['undetect']]=0
        values[raw==meta['nodata']]=np.nan
        values[(values<0)|(~np.isfinite(values))]=np.nan
        nx,ny=int(where['xsize']),int(where['ysize'])
        if raw.shape!=(ny,nx):raise ValueError('Unexpected radar grid dimensions')
        crs=CRS.from_user_input(string(where['projdef']));project=Transformer.from_crs('EPSG:4326',crs,always_xy=True)
        unit=crs.axis_info[0].unit_conversion_factor
        dx,dy=float(where['xscale'])/unit,float(where['yscale'])/unit
        west,south=project.transform(float(where['LL_lon']),float(where['LL_lat']))
        # ODIM corners are outer pixel edges; first array row is north.
        east,north=west+nx*dx,south+ny*dy
        if 'UR_lon' in where:
            ex,ey=project.transform(float(where['UR_lon']),float(where['UR_lat']))
            if abs(ex-east)>dx or abs(ey-north)>dy:raise ValueError('Radar corner mismatch')
        x,y=np.meshgrid(GRID['west']+np.arange(GRID['nx'])*GRID['step'],GRID['south']+np.arange(GRID['ny'])*GRID['step'])
        sx,sy=project.transform(x,y)
        ix=np.floor((sx-west)/dx).astype(int);iy=np.floor((north-sy)/dy).astype(int)
        valid=(ix>=0)&(ix<nx)&(iy>=0)&(iy<ny)
        data=np.full(ix.shape,np.nan);data[valid]=values[iy[valid],ix[valid]]
        if not np.isfinite(data).any():raise ValueError('Empty precipitation grid')
        packed=np.where(np.isfinite(data)&(data<=327.67),np.rint(data*100),GRID['missing']).astype('<i2')
        return dict(schema=1,product='RY',source='DWD RADOLAN',time=end.isoformat(),grid=GRID,intervalMinutes=5,amount=base64.b64encode(packed.tobytes()).decode('ascii'))

def main():
    req=urllib.request.Request(URL,headers={'User-Agent':'WetterApp/1.0'})
    with urllib.request.urlopen(req,timeout=30) as r:payload=decode(r.read(),dt.datetime.now(dt.timezone.utc))
    path=Path('data/radar-points.json.gz');temp=path.with_suffix('.tmp')
    with temp.open('wb') as f:
        with gzip.GzipFile(filename='',fileobj=f,mode='wb',mtime=0) as z:z.write(json.dumps(payload,separators=(',',':')).encode())
    temp.replace(path);print(f'RY scan {payload["time"]}: {path.stat().st_size} bytes',flush=True)

if __name__=='__main__':main()
