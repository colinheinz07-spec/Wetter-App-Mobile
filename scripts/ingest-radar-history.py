"""Observed precipitation intervals for the previous 26 hours (DWD RADOLAN).

RW supplies completed hourly, gauge-adjusted fields. RY fills only the newer
5-minute intervals. Never add overlapping rolling RW windows or forecast data.
All intervals retain exact start/end and the missing mask; values are mm water
equivalent, not snow depth. Resampled nearest neighbour to a geographic grid.
"""
import base64
import concurrent.futures as cf
import datetime as dt
import gzip
import io
import json
from pathlib import Path
import re
import urllib.request
import h5py
import numpy as np
from pyproj import CRS, Transformer

ROOT='https://opendata.dwd.de/weather/radar/radolan/'
UTC=dt.timezone.utc
GRID=dict(west=5.,south=47.,step=.01,nx=1051,ny=851,scale=.01,missing=-32768)

def read(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'WetterApp/1.0'}),timeout=20) as r:return r.read()

def stamp(a,prefix):
    return int(dt.datetime.strptime(a[prefix+'date'].decode()+a[prefix+'time'].decode(),'%Y%m%d%H%M%S').replace(tzinfo=UTC).timestamp())

def decode(blob,product,end):
    with h5py.File(io.BytesIO(blob),'r') as h:
        d=h['dataset1']; a=d['what'].attrs; item=d['data1']; m=item['what'].attrs; w=h['where'].attrs
        start=stamp(a,'start'); valid=stamp(a,'end'); period=3600 if product=='rw' else 300
        if valid!=end or valid-start!=period or a['prodname'].decode().lower()!=product:raise ValueError('wrong interval/product')
        raw=item['data'][...]; q=m['quantity'].decode()
        if q not in ('ACRR','RATE') or raw.shape!=(int(w['ysize']),int(w['xsize'])):raise ValueError('wrong data layout')
        values=raw.astype(np.float32)*float(m['gain'])+float(m['offset'])
        if q=='RATE':values*=period/3600
        values[raw==m['undetect']]=0;values[raw==m['nodata']]=np.nan
        crs=CRS.from_user_input(w['projdef'].decode()); project=Transformer.from_crs('EPSG:4326',crs,always_xy=True)
        unit=crs.axis_info[0].unit_conversion_factor; dx=float(w['xscale'])/unit;dy=float(w['yscale'])/unit
        west,south=project.transform(float(w['LL_lon']),float(w['LL_lat']));north=south+raw.shape[0]*dy
        x,y=np.meshgrid(GRID['west']+np.arange(GRID['nx'])*GRID['step'],GRID['south']+np.arange(GRID['ny'])*GRID['step'])
        sx,sy=project.transform(x,y);ix=np.floor((sx-west)/dx).astype(int);iy=np.floor((north-sy)/dy).astype(int)
        ok=(ix>=0)&(ix<raw.shape[1])&(iy>=0)&(iy<raw.shape[0]);data=np.full(ix.shape,np.nan,dtype=np.float32);data[ok]=values[iy[ok],ix[ok]]
        packed=np.where(np.isfinite(data)&(data>=0)&(data<=327.67),np.rint(data*100),GRID['missing']).astype('<i2')
        if not np.any(packed!=GRID['missing']):raise ValueError('empty grid')
        # Encode equal runs per row so a mobile client can query a point without
        # expanding the entire 26-hour 1-km raster history into memory.
        rows=[]
        for row in packed:
            edges=np.r_[0,np.flatnonzero(row[1:]!=row[:-1])+1,len(row)]
            runs=np.empty((len(edges)-1,2),dtype='<i2');runs[:,0]=np.diff(edges);runs[:,1]=row[edges[:-1]]
            rows.append(base64.b64encode(runs.tobytes()).decode('ascii'))
        return dict(start=start,end=end,product=product.upper(),encoding='row-rle-v1',rows=rows)

def choose_intervals(rw,ry,start,end):
    # Prefer full UTC hours; use RY only for missing hourly windows and for
    # the unfinished latest hour. No interpolation over missing observations.
    chosen=[];cursor=start
    while cursor<end:
        if cursor%3600==0 and cursor+3600 in rw and cursor+3600<=end:
            chosen.append(('rw',cursor+3600,rw[cursor+3600]));cursor+=3600
        else:
            if cursor+300 in ry:chosen.append(('ry',cursor+300,ry[cursor+300]))
            cursor+=300
    return chosen

def listing(product,now):
    root=ROOT+product+'/';out={}
    for p in re.findall(r'href="([^"]+\.hdf5)"',read(root).decode()):
        m=re.search(r'-(\d{10})-dwd',p)
        if not m:continue
        t=int(dt.datetime.strptime(m[1],'%y%m%d%H%M').replace(tzinfo=UTC).timestamp())
        if now-27*3600<=t<=now:out[t]=root+p
    return out

def main():
    now=int(dt.datetime.now(UTC).timestamp());start=(now//3600-26)*3600;end=now//300*300
    rw=listing('rw',now);ry=listing('ry',now);jobs=choose_intervals(rw,ry,start,end)
    def get(job):
        product,t,url=job
        try:return decode(read(url),product,t)
        except Exception as e:print(product,t,str(e)[:100],flush=True);return None
    with cf.ThreadPoolExecutor(max_workers=5) as pool:rows=[r for r in pool.map(get,jobs) if r]
    if not rows or rows[-1]['end']<now-3600:raise RuntimeError('No recent radar history')
    data=dict(schema=1,product='RADOLAN-observed-history',generated=now,grid=GRID,intervals=rows)
    path=Path('data/radar-history.json.gz');path.parent.mkdir(exist_ok=True)
    with gzip.open(path,'wt',encoding='utf-8',compresslevel=3) as f:json.dump(data,f,separators=(',',':'))
    print(len(rows),'nonoverlapping radar intervals',path.stat().st_size,'bytes',flush=True)

if __name__=='__main__':main()
