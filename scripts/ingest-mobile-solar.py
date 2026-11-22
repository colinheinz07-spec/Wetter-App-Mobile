"""DUETT observation analysis, not a model: native 2 km raster, hourly values.

Reproject using nearest original source cell; never interpolate or extend the
data outside the source grid. The browser receives a pre-rendered map and the
numeric raster separately in one compressed snapshot.
"""
import base64
import concurrent.futures
import datetime as dt
import gzip
import io
import json
import re
import sys
import urllib.request
from pathlib import Path
import netCDF4
import numpy as np
from PIL import Image
from pyproj import Transformer

ROOT='https://opendata.dwd.de/climate_environment/CDC/grids_germany/hourly/duett/'
GRID=dict(west=5.5,south=47.,step=.02,nx=481,ny=411,missing=-32768)
UTC=dt.timezone.utc
PARAMETERS={'sunshine':('sunshine_duration','SDU','min'), 'solar':('radiation_global','SIS','W/m²')}
COLORS=np.array([[58,73,94],[113,141,165],[192,202,168],[241,224,124],[255,201,74],[248,151,31],[222,87,23]],dtype=np.uint8)

def read(url):
    with urllib.request.urlopen(url,timeout=25) as r:return r.read()

def choose_files(code,html,now):
    found=[]
    for f,stamp in re.findall(r'('+code+r'_duett_2km_DE_60min_(\d{12})_\w+\.nc)',html):
        end=dt.datetime.strptime(stamp,'%Y%m%d%H%M').replace(tzinfo=UTC)
        if 0<=(now-end).total_seconds()<=3*3600:found.append((end,f))
    return sorted(set(found),reverse=True)

def raster(raw,code):
    with netCDF4.Dataset('duett.nc',memory=raw) as ds:
        names=[k for k,v in ds.variables.items() if k.lower()==code.lower()]
        if not names:
            std='duration_of_sunshine' if code=='SDU' else 'surface_downwelling_shortwave_flux_in_air'
            names=[k for k,v in ds.variables.items() if getattr(v,'standard_name','')==std]
        if len(names)!=1:raise ValueError('Expected '+code+'; variables '+str(list(ds.variables)))
        var=ds.variables[names[0]];a=np.ma.asarray(var[:]).astype(float).filled(np.nan).squeeze()
        if a.ndim!=2:raise ValueError('Unexpected dimensions '+str(var.dimensions))
        yname,xname=var.dimensions[-2:];xvar,yvar=ds.variables[xname],ds.variables[yname]
        x,y=np.asarray(xvar[:],dtype=float),np.asarray(yvar[:],dtype=float)
        if getattr(xvar,'units','').lower() in ('km','kilometers','kilometres'):x*=1000
        if getattr(yvar,'units','').lower() in ('km','kilometers','kilometres'):y*=1000
        dx,dy=np.median(np.diff(x)),np.median(np.diff(y))
        if a.shape!=(len(y),len(x)) or not 1900<=abs(dx)<=2100 or not 1900<=abs(dy)<=2100:raise ValueError('Unexpected projected grid')
        units=str(getattr(var,'units','')).lower().strip()
        if code=='SDU':
            if units in ('s','sec','second','seconds'):a/=60
            elif units in ('h','hour','hours'):a*=60
            elif units not in ('min','minute','minutes'):raise ValueError('Unexpected SDU units '+units)
            a[(a<0)|(a>60.01)]=np.nan;scale=.1;stops=[1,10,20,30,45,55]
        else:
            if units.replace(' ','') not in ('w/m2','wm-2','wm**-2','w.m-2','w/m²','wm^-2'):raise ValueError('Unexpected SIS units '+units)
            a[(a<0)|(a>1500)]=np.nan;scale=1;stops=[10,50,100,200,400,700]
        lon,lat=np.meshgrid(GRID['west']+GRID['step']*np.arange(GRID['nx']),GRID['south']+GRID['step']*np.arange(GRID['ny']))
        xx,yy=Transformer.from_crs(4326,3034,always_xy=True).transform(lon,lat)
        ix=np.rint((xx-x[0])/dx).astype(int);iy=np.rint((yy-y[0])/dy).astype(int)
        inside=(ix>=0)&(ix<len(x))&(iy>=0)&(iy<len(y))
        v=np.where(inside,a[np.clip(iy,0,len(y)-1),np.clip(ix,0,len(x)-1)],np.nan)
        packed=np.where(np.isfinite(v),np.rint(np.nan_to_num(v)/scale),GRID['missing']).astype('<i2')
        image=np.zeros((*v.shape,4),dtype=np.uint8);image[:,:,:3]=COLORS[np.digitize(np.nan_to_num(v),stops)];image[:,:,3]=np.where(np.isfinite(v),230,0)
        png=io.BytesIO();Image.fromarray(image[::-1]).save(png,format='PNG',optimize=True)
        return dict(grid={**GRID,'scale':scale},values=base64.b64encode(packed.tobytes()).decode(),png=base64.b64encode(png.getvalue()).decode(),bounds=[GRID['west']-GRID['step']/2,GRID['south']-GRID['step']/2,GRID['west']+(GRID['nx']-.5)*GRID['step'],GRID['south']+(GRID['ny']-.5)*GRID['step']])

def ingest(item,now):
    key,(path,code,unit)=item;url=ROOT+path+'/recent/'
    files=choose_files(code,read(url).decode(),now)
    for end,name in files[:3]:
        try:
            p=raster(read(url+name),code);p.update(time=end.isoformat(),start=(end-dt.timedelta(hours=1)).isoformat(),source='DUETT · DWD / Meteosat · CC BY 4.0',unit=unit,resolutionKm=2);return key,p
        except Exception as e:print(name,e,flush=True)
    raise ValueError('No validated fresh '+code+' observation')

def main(path):
    now=dt.datetime.now(UTC)
    products=dict(ingest(item,now) for item in PARAMETERS.items())  # netCDF/HDF5 access is not thread safe
    path.parent.mkdir(parents=True,exist_ok=True)
    with gzip.open(path,'wt',encoding='utf8') as f:json.dump(dict(schema=1,products=products),f,separators=(',',':'))
    print('Published',[(k,v['time'],v['unit']) for k,v in products.items()],path.stat().st_size)

if __name__=='__main__':main(Path(sys.argv[1]))
