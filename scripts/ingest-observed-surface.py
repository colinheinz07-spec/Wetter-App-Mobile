"""Independent DWD SYNOP observations, including previous hourly observations.

Never turn a forecast into a measurement. The client computes a local field
from several nearby, elevation-compatible observations; source times remain
available. DWD's GeoJSON contains decoded BUFR fields with explicit units.
"""
import concurrent.futures as cf
import base64
import datetime as dt
import gzip
import json
import math
import re
import urllib.request
from pathlib import Path

ROOT = 'https://opendata.dwd.de/weather/weather_reports/synoptic/germany/geojson/'
UTC = dt.timezone.utc

def read(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'WetterApp/1.0'}), timeout=25) as r:
        return r.read()

def number(fields, key, unit, transform=lambda v:v, limits=(-math.inf,math.inf)):
    field=fields.get(key,{})
    v=field.get('value')
    if field.get('unit')!=unit or not isinstance(v,(float,int)) or isinstance(v,bool):return None
    v=transform(v)
    return round(v,2) if math.isfinite(v) and limits[0]<=v<=limits[1] else None

def phase(value):
    s=re.sub(r'[_-]+',' ',str(value or '').upper())
    if any(w in s for w in ('PAST HOUR','PRECEDING HOUR','RECENT','NOT AT','NOT NOW','NO SIGNIFICANT','NO PRECIPITATION','NO WEATHER','NOT AVAILABLE','UNKNOWN','VICINITY')):return None
    freezing='FREEZING' in s and 'NOT FREEZING' not in s and 'NON FREEZING' not in s
    if freezing and 'DRIZZLE' in s:return 4
    if freezing and 'RAIN' in s:return 5
    if 'SNOW' in s and ('RAIN' in s or 'DRIZZLE' in s):return 6
    if 'HAIL' in s and 'SNOW' not in s:return 9
    if 'GRAUPEL' in s or 'SNOW PELLET' in s:return 8
    if 'ICE PELLET' in s:return 11
    if 'SNOW' in s:return 7
    if 'DRIZZLE' in s:return 2
    if 'RAIN' in s:return 3
    return None

def decode(doc, now):
    rows={}
    for f in doc.get('features',[]):
        try:
            lon,lat,h=f['geometry']['coordinates'][:3]
            if not (4<=lon<=17 and 46<=lat<=56 and -100<=h<=3200):continue
            fields={}
            # Repeated BUFR fields can contain later nulls; keep the first
            # non-null observation, and never read a historical weather code.
            for v in f['properties'].values():
                if isinstance(v,dict) and v.get('shortname') and v.get('value') is not None:fields.setdefault(v['shortname'],v)
            field=lambda k:fields.get(k,{}).get('value')
            time=int(dt.datetime(*(int(field(k)) for k in ('year','month','day','hour','minute')),tzinfo=UTC).timestamp())
            if not now-30*3600<=time<=now:continue
            identity=str(field('wigosLocalIdentifierCharacter') or field('stationOrSiteName') or '').strip()
            if not identity:continue
            values={
                'temp2':number(fields,'airTemperature','K',lambda v:v-273.15,(-65,55)),
                'dew':number(fields,'dewpointTemperature','K',lambda v:v-273.15,(-80,50)),
                'rh2':number(fields,'relativeHumidity','%',limits=(0,100)),
                'wind':number(fields,'windSpeed','m/s',lambda v:v*3.6,(0,220)),
                'winddir':number(fields,'windDirection','deg',limits=(0,360)),
                'slp':number(fields,'pressureReducedToMeanSeaLevel','Pa',lambda v:v/100,(850,1100)),
                'cloud':number(fields,'cloudCoverTotal','%',limits=(0,100)),
                'visibility':number(fields,'horizontalVisibility','m',limits=(0,150000)),
                'gust':number(fields,'maximumWindGustSpeed','m/s',lambda v:v*3.6,(0,300)),
            }
            ph=phase(field('presentWeather'))
            if ph is not None:values['phase']=ph;values['strong']=int('HEAVY' in str(field('presentWeather')).upper())
            # BUFR symbolic present weather, not past weather or nearby fog.
            weather=str(field('presentWeather') or '').upper()
            if 'FOG' in weather and not any(s in weather for s in ('PAST','HOUR','DISTANCE','VICINITY','NOT_AT','NOT AT','NO_FOG','NO FOG')):values['fog']=1
            v={k:v for k,v in values.items() if v is not None}
            if not v:continue
            key=(identity,time); row=rows.setdefault(key,dict(id=identity,name=str(field('stationOrSiteName') or identity).strip(),lon=round(lon,5),lat=round(lat,5),height=round(h,1),time=time,values={}))
            row['values'].update(v)
        except (KeyError,TypeError,ValueError,OverflowError):continue
    return list(rows.values())

def spatial_grid(rows, now):
    import numpy as np
    from scipy.spatial import cKDTree
    grid=dict(west=5.5,south=47.,step=.02,nx=481,ny=411,scale=.1,missing=-32768)
    x,y=np.meshgrid(grid['west']+np.arange(grid['nx'])*grid['step'],grid['south']+np.arange(grid['ny'])*grid['step'])
    # ETOPO is only a coarse terrain check, not a high-resolution elevation model.
    src=Path('assets/geography.js').read_text();geo=json.loads(src[src.index('{'):src.rindex('}')+1])['terrain']
    z=np.frombuffer(base64.b64decode(geo['values']),dtype='<i2').reshape(geo['height'],geo['width'])
    ix=np.rint((x-geo['west'])/geo['step']).astype(int);iy=np.rint((geo['north']-y)/geo['step']).astype(int)
    height=z[iy,ix].ravel();pts=np.column_stack((x.ravel()*70,y.ravel()*111))
    fields={};times={}
    for key,limit in [('temp2',45),('wind',45),('cloud',65)]:
        sites={}
        for r in rows:
            if now-75*60<=r['time']<=now and key in r['values'] and (r['id'] not in sites or sites[r['id']]['time']<r['time']):sites[r['id']]=r
        a=list(sites.values());out=np.full(len(pts),-32768,dtype='<i2')
        if len(a)>=2:
            d,i=cKDTree([(r['lon']*70,r['lat']*111) for r in a]).query(pts,k=min(12,len(a)))
            vals=np.array([r['values'][key] for r in a])[i];dh=np.abs(np.array([r['height'] for r in a])[i]-height[:,None]);valid=(d<=limit)
            if key!='cloud':valid&=dh<=250
            weights=np.where(valid,1/(4+d*d+(0 if key=='cloud' else (dh/35)**2)),0)
            good=(valid.sum(axis=1)>=2)&(np.where(valid,d,np.inf).min(axis=1)<=25)
            out[good]=np.rint((vals*weights).sum(axis=1)[good]/weights.sum(axis=1)[good]*10).astype('<i2')
            times[key]=min(r['time'] for r in a)
        fields[key]=base64.b64encode(out.tobytes()).decode()
    return dict(grid,fields=fields,times=times)

def main():
    now=int(dt.datetime.now(UTC).timestamp())
    listing=read(ROOT).decode();files=[]
    for p in re.findall(r'href="([^"]+\.geojson\.gz)"',listing):
        m=re.search(r'_(\d{14})_',p)
        if not m:continue
        t=dt.datetime.strptime(m[1],'%Y%m%d%H%M%S').replace(tzinfo=UTC).timestamp()
        if now-30*3600<=t<=now and (t>=now-95*60 or int(t)%3600==0):files.append((t,p))
    def get(item):
        try:return decode(json.loads(gzip.decompress(read(ROOT+item[1]))),now)
        except Exception as e:print('SYNOP',item[1],str(e)[:100],flush=True);return []
    rows={}
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        for batch in pool.map(get,files):
            for r in batch:
                key=(r['id'],r['time'])
                if key in rows:rows[key]['values'].update(r['values'])
                else:rows[key]=r
    if not any(now-75*60<=r['time']<=now and 'temp2' in r['values'] for r in rows.values()):raise RuntimeError('No fresh SYNOP temperatures')
    # Publish hourly history and recent subhourly measurements; the date is
    # observation time, not BUFR delivery time. No model data in this packet.
    data=dict(schema=1,product='DWD-SYNOP-observations',generated=now,rows=list(rows.values()),grid=spatial_grid(list(rows.values()),now))
    path=Path('data/surface-observations.json.gz');path.parent.mkdir(exist_ok=True)
    with gzip.open(path,'wt',encoding='utf-8') as f:json.dump(data,f,separators=(',',':'),allow_nan=False)
    print(len(rows),'observations',path.stat().st_size,'bytes',flush=True)

if __name__=='__main__':main()
