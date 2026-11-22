"""Mobile-owned 24h warning areas on the native ICON-D2 0.02-degree spacing.

Compare independent model families in identical 3-hour windows. No event is
declared observed, and convective/road-ice signals remain potential only.
"""
import base64
from concurrent.futures import ThreadPoolExecutor
import datetime as dt
import gzip
import json
from pathlib import Path
import urllib.request
import numpy as np

ROOT='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/generated-native-'
GRID=dict(west=5.5,south=47.,step=.02,nx=481,ny=411)
MODELS=(('ICON-D2','icon-d2-de',18),('IFS','ifs-de',24),('GFS','gfs-de',24))
FIELDS=('temp2','gust','visibility','ww','ptype','rainTotal','tground','rh2','mlcape','mucape','mlcin','s06','orog','ship','stp')
TYPES=('frost','wind','heat','fog','snow','freezing','ice','rain','storm','stormwind','stormrain','hail','rotation')
POTENTIAL={'storm','ice','freezing','stormwind','stormrain','hail','rotation'}
N=GRID['nx']*GRID['ny']

def timestamp(s):return int(dt.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp())
def read(url):
    req=urllib.request.Request(url,headers={'User-Agent':'WetterApp/1.0'})
    with urllib.request.urlopen(req,timeout=30) as r:b=r.read()
    return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)

def grid_indices(g):
    x,y=np.meshgrid(GRID['west']+GRID['step']*np.arange(GRID['nx']),GRID['south']+GRID['step']*np.arange(GRID['ny']))
    ix=np.rint((x-g['west'])/g['step']).astype(int).ravel();iy=np.rint((y-g['south'])/g['step']).astype(int).ravel()
    valid=(ix>=0)&(ix<g['nx'])&(iy>=0)&(iy<g['ny'])
    return np.clip(iy,0,g['ny']-1)*g['nx']+np.clip(ix,0,g['nx']-1),valid

def load_model(name,branch,max_age,now,ends):
    root=ROOT+branch+'/'
    m=read(root+'index.json');run=timestamp(m['run']);g=m['grid']
    if m['schema']!=2 or m['model']!=name or not 0<=now-run<=max_age*3600:raise ValueError('stale or invalid run')
    idx,valid=grid_indices(g); hours={h for h in m['hours'] if run+h*3600 in set(ends)|{ends[0]-10800}}
    def load(pair):
        h,k=pair
        try:
            p=read(root+f'{h}-{k}.json.gz?v='+m['generated'])
            if (p['schema'],p['run'],p['generated'],p['hour'],p['field'])!=(2,m['run'],m['generated'],h,k):raise ValueError('changed run')
            a=np.frombuffer(base64.b64decode(p['values'],validate=True),dtype='<i2')
            if len(a)!=g['nx']*g['ny']:raise ValueError('wrong grid')
            arr=a[idx].astype(np.float32);arr[(arr==g['missing'])|~valid]=np.nan;arr*=m['scales'][k]
            return (run+h*3600,k),arr
        except Exception as e:
            print(name,h,k,str(e)[:100],flush=True);return (run+h*3600,k),None
    jobs=[(h,k) for h in hours for k in FIELDS if k in m['frames'][str(h)]]
    with ThreadPoolExecutor(max_workers=10) as pool:fields={k:v for k,v in pool.map(load,jobs) if v is not None}
    if not fields:raise ValueError('no valid fields')
    return dict(model=name,run=run,fields=fields,step=g['step'])

def levels(v,limits):
    result=np.zeros(N,dtype=np.uint8)
    result[~np.isfinite(v)]=255
    for i,x in enumerate(limits,1):result[np.isfinite(v)&(v>=x)]=i
    return result

def categorical(valid,signal,level=1):
    return np.where(valid,np.where(signal,level,0),255).astype(np.uint8)

def analyze(fields,end):
    def val(k,t=end):return fields.get((t,k),np.full(N,np.nan,dtype=np.float32))
    t=val('temp2');gust=val('gust');v=val('visibility');ww=val('ww');pt=val('ptype');ground=val('tground');rh=val('rh2');orog=val('orog')
    precip=val('rainTotal')-val('rainTotal',end-10800);precip[precip<-.01]=np.nan
    snow=np.isin(ww,[70,71,72,73,74,75,77,85,86])|np.isin(pt,[5,6,7,8]);freeze=np.isin(ww,[56,57,66,67])|np.isin(pt,[3,12]);wet=np.isfinite(precip)&(precip>=.1)
    phase_known=np.isfinite(ww)|np.isfinite(pt)
    # Only classify rain totals with liquid-phase evidence; snow water is not rain.
    liquid=(np.isin(ww,[51,53,55,61,63,65,80,81,82,95,96,99])|np.isin(pt,[1])|(t>2))&~snow&~freeze
    rain=np.where(liquid| (precip==0),precip,np.nan)
    capes=np.fmax(val('mlcape'),val('mucape'));cin=val('mlcin');shear=val('s06')
    conv=np.isin(ww,[95,96,99])|((capes>=500)&(np.abs(cin)<=125)&wet)
    conv_known=np.isfinite(ww)|(np.isfinite(capes)&np.isfinite(cin)&np.isfinite(precip))
    storm=categorical(conv_known,conv);storm[conv&((capes>=1000)&(shear>=15)|(rain>=20))]=2
    # Height threshold is used only when model orography is known.
    wind=levels(gust,[50,70,100,120]);high=levels(gust,[60,80,105,125]);wind[orog>=800]=high[orog>=800]
    heat=np.where(np.isfinite(t),np.where(t>=39,4,np.where(t>=37,3,0)),255).astype(np.uint8)
    # Separate ingredient-based severe-weather outlooks, never confirmation,
    # hail size or tornado probability. Lack of an ingredient stays missing.
    ship=val('ship');stp=val('stp')
    conv_gust=np.where(conv_known&np.isfinite(gust),np.where(conv&(gust>=70),wind,0),255).astype(np.uint8)
    conv_rain=np.where(conv_known&np.isfinite(rain),np.where(conv,levels(rain,[20,35,55,80]),0),255).astype(np.uint8)
    return dict(frost=levels(-t,[0,5,10,20]),wind=wind,heat=heat,
                fog=levels(np.where(v>=0,-v,np.nan),[-.25,-.05]),
                snow=categorical(phase_known,np.isin(ww,[70,71,72,73,74,75,77,85,86])|(snow&wet)),freezing=categorical(phase_known,freeze),
                ice=categorical(np.isfinite(ground)&(np.isfinite(precip)|np.isfinite(rh)),(ground<=0)&(wet|(rh>=95))),
                rain=levels(rain,[20,35,55,80]),storm=storm,stormwind=conv_gust,stormrain=conv_rain,
                hail=categorical(conv_known&np.isfinite(ship),conv&(ship>=1)),
                rotation=categorical(conv_known&np.isfinite(stp),conv&(stp>=1)))

def combine(arrays,kind):
    if not arrays:return np.full(N,255,dtype=np.uint8)
    stack=np.stack(arrays);valid=stack!=255;positive=valid&(stack>0)
    count=positive.sum(axis=0);peak=np.where(positive,stack,0).max(axis=0)
    # 0: no threshold, 255: no input, 1..4 single-model risk, 11..14
    # agreement at conservative common severity, 21..24 multi-model potential.
    common=np.sort(np.where(positive,stack,0),axis=0)[-min(2,len(arrays))]
    out=np.where(valid.any(axis=0),peak,255).astype(np.uint8)
    both=count>=2
    out[both]=(20+common[both]) if kind in POTENTIAL else (10+common[both])
    return out

def build(now,models,ends):
    periods=[]
    for end in ends:
        rows=[analyze(m['fields'],end) for m in models]
        layers={k:base64.b64encode(combine([r[k] for r in rows],k).tobytes()).decode() for k in TYPES}
        # Numeric values from the same models/time that actually triggered
        # the hazard, not invented ranges derived from warning thresholds.
        metrics={}
        for kind,field in {'frost':'temp2','heat':'temp2','wind':'gust','fog':'visibility','rain':'rainTotal','stormrain':'rainTotal','stormwind':'gust'}.items():
            summed=np.zeros(N,dtype=np.float32);count=np.zeros(N,dtype=np.uint8)
            for model,row in zip(models,rows):
                values=model['fields'].get((end,field))
                if values is None:continue
                if field=='rainTotal':
                    before=model['fields'].get((end-10800,field))
                    if before is None:continue
                    values=values-before
                valid=(row[kind]>0)&(row[kind]<255)&np.isfinite(values)
                summed[valid]+=values[valid];count[valid]+=1
            mean=np.divide(summed,count,out=np.zeros_like(summed),where=count>0)
            packed=np.where((count>0)&(np.abs(mean)<3276),np.rint(mean*10),-32768).astype('<i2')
            metrics[kind]=base64.b64encode(packed.tobytes()).decode()
        periods.append(dict(start=end-10800,end=end,layers=layers,metrics=metrics))
    return dict(schema=1,generated=now,grid=GRID,models=[{k:m[k] for k in ('model','run','step')} for m in models],periods=periods)

def main():
    now=int(dt.datetime.now(dt.timezone.utc).timestamp());first=(now//10800+1)*10800;ends=list(range(first,now+24*3600+1,10800))
    def get_model(spec):
        try:return load_model(*spec,now,ends)
        except Exception as e:print(spec[0],str(e),flush=True);return None
    with ThreadPoolExecutor(max_workers=3) as pool:models=[m for m in pool.map(get_model,MODELS) if m]
    if not any(m['model']=='ICON-D2' for m in models):
        fallback=get_model(('ICON-EU','icon-eu-de',24))
        if fallback:models.insert(0,fallback)
    if not models:raise RuntimeError('No usable model runs')
    import sys
    data=build(now,models,ends);path=Path(sys.argv[1] if len(sys.argv)>1 else 'data/national-risks.json.gz');path.parent.mkdir(parents=True,exist_ok=True)
    with gzip.open(path,'wt',encoding='utf8') as f:json.dump(data,f,separators=(',',':'))
    print('Regional forecast',[(m['model'],len(m['fields'])) for m in models],len(ends),'windows',path.stat().st_size,flush=True)

if __name__=='__main__':main()
