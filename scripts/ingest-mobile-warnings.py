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
MODELS=(('ICON-D2','icon-d2-de',18),('ICON-EU','icon-eu-de',24),('IFS','ifs-de',24),('GFS','gfs-de',24))
FIELDS=('temp2','gust','visibility','ww','ptype','rainTotal','convTotal','tground','rh2','mlcape','mucape','mlcin','s06','orog','ship','stp','snowWaterTotal','snowGspTotal','snowConTotal')
TYPES=('frost','wind','heat','fog','snow','freezing','ice','rain','durationrain','storm','stormwind','stormrain','hail','rotation')
POTENTIAL={'ice','stormwind','stormrain','hail','rotation'}
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
    idx,valid=grid_indices(g); targets=set(ends)|{e-shift for e in ends for shift in (10800,21600,32400,43200)}
    hourly_rain={e-shift for e in ends if e<=now+48*3600 for shift in (3600,7200)}
    hours={h for h in m['hours'] if run+h*3600 in targets|hourly_rain}
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
    jobs=[(h,k) for h in hours for k in FIELDS if k in m['frames'][str(h)] and (run+h*3600 in ends or run+h*3600 in targets and k in ('rainTotal','convTotal','temp2','ww','ptype','snowWaterTotal','snowGspTotal','snowConTotal') or run+h*3600 in hourly_rain and k in ('rainTotal','temp2'))]
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

def field_value(fields,t,k):
    return fields.get((t,k),np.full(N,np.nan,dtype=np.float32))

def delta(fields,end,k,seconds=10800):
    a=field_value(fields,end-seconds,k);b=field_value(fields,end,k)
    return np.where((a>=0)&(b>=0)&(b-a>=-.05),np.maximum(0,b-a),np.nan)

def fresh_snow_cm(fields,end):
    # Actual snow water accumulation, not change in existing snow cover.
    water=delta(fields,end,'snowWaterTotal')
    components=delta(fields,end,'snowGspTotal')+delta(fields,end,'snowConTotal')
    water=np.where(np.isfinite(water),water,components)
    precip=delta(fields,end,'rainTotal')
    ww=field_value(fields,end,'ww');pt=field_value(fields,end,'ptype')
    mixed=np.isin(ww,[68,69,83,84])|np.isin(pt,[7,8])
    pure=(np.isin(ww,[70,71,72,73,74,75,77,85,86])|np.isin(pt,[5,6]))&~mixed
    fallback=np.where(precip==0,0,np.where(pure,precip,np.nan))
    water=np.where(np.isfinite(water),water,fallback)
    t0=field_value(fields,end-10800,'temp2');t1=field_value(fields,end,'temp2')
    t=np.where(np.isfinite(t0)&np.isfinite(t1),(t0+t1)/2,np.where(np.isfinite(t1),t1,t0))
    # Temperature-dependent fresh-snow ratio; same approximation as mobile forecast.
    return np.where(water==0,0,water*np.clip(7-t*1.2,4,16)/10)

def ice_causes(fields,end):
    ground=field_value(fields,end,'tground');rh=field_value(fields,end,'rh2')
    ww=field_value(fields,end,'ww');pt=field_value(fields,end,'ptype')
    amount=delta(fields,end,'rainTotal');previous=delta(fields,end-10800,'rainTotal')
    before_ww=field_value(fields,end-10800,'ww');before_pt=field_value(fields,end-10800,'ptype')
    frozen=ground<=0
    freeze=np.isin(ww,[56,57,66,67])|np.isin(pt,[3,12])
    snow=np.isin(ww,[68,69,70,71,72,73,74,75,77,83,84,85,86])|np.isin(pt,[5,6,7,8])
    liquid=np.isin(ww,[51,53,55,61,63,65,80,81,82,95,96,99])|np.isin(pt,[1])
    previous_liquid=np.isin(before_ww,[51,53,55,61,63,65,80,81,82,95,96,99])|np.isin(before_pt,[1])
    wet=frozen&~freeze&~snow&((liquid&(amount>=.1))|(previous_liquid&(previous>=.1)))
    snow_ice=frozen&snow&((amount>=.1)|np.isin(ww,[70,71,72,73,74,75,77,85,86]))
    rime=frozen&(rh>=95)&~wet&~snow_ice&~freeze
    return wet.astype(np.uint8)|(snow_ice.astype(np.uint8)<<1)|(freeze.astype(np.uint8)<<2)|(rime.astype(np.uint8)<<3)

def peak_hour_rain(fields,end):
    # A true maximum of native hourly accumulation differences. Never divide
    # a 3-hour total by three or claim an hourly amount without hourly inputs.
    return np.maximum.reduce([delta(fields,end-shift,'rainTotal',3600) for shift in (0,3600,7200)])

def liquid_amount(fields,end):
    """Three-hour liquid amount with phase evidence; never count mixed snow as rain."""
    ww=field_value(fields,end,'ww');pt=field_value(fields,end,'ptype');temp=field_value(fields,end,'temp2')
    amount=delta(fields,end,'rainTotal')
    nonliquid=np.isin(ww,[56,57,66,67,68,69,70,71,72,73,74,75,77,83,84,85,86])|np.isin(pt,[3,5,6,7,8,12])
    liquid=(np.isin(ww,[51,53,55,61,63,65,80,81,82,95,96,99])|np.isin(pt,[1])|(temp>2))&~nonliquid
    return np.where(liquid|(amount==0),amount,np.nan)

def sustained_rain(fields,end):
    """Assess every complete 12h window containing this rain interval.
    A future accumulation can trigger a warning at its start, not after 12h."""
    windows={e:liquid_amount(fields,e) for e in range(end-32400,end+32401,10800)}
    current=windows[end];best=np.full(N,np.nan,dtype=np.float32)
    for finish in range(end,end+32401,10800):
        stack=np.stack([windows[finish-shift] for shift in (0,10800,21600,32400)])
        complete=np.isfinite(stack).all(axis=0)
        total=np.where(complete,np.where((stack>=.5).sum(axis=0)>=3,stack.sum(axis=0),0),np.nan)
        best=np.fmax(best,total)
    return np.where(np.isfinite(current)&(current<.5),0,best)

def direct_storm(fields,end):
    ww=field_value(fields,end,'ww');cape=np.fmax(field_value(fields,end,'mlcape'),field_value(fields,end,'mucape'))
    cin=field_value(fields,end,'mlcin');convective=delta(fields,end,'convTotal')
    return np.isin(ww,[95,96,99])|((convective>=.5)&(cape>=500)&(np.abs(cin)<=125))

def minimum_temp(fields,end):
    return np.fmin.reduce([field_value(fields,end-offset,'temp2') for offset in (0,3600,7200)])

def analyze(fields,end):
    def val(k,t=end):return fields.get((t,k),np.full(N,np.nan,dtype=np.float32))
    t=val('temp2');gust=val('gust');v=val('visibility');ww=val('ww');pt=val('ptype');ground=val('tground');rh=val('rh2');orog=val('orog')
    precip=delta(fields,end,'rainTotal')
    snow=np.isin(ww,[70,71,72,73,74,75,77,85,86])|np.isin(pt,[5,6,7,8]);freeze=np.isin(ww,[56,57,66,67])|np.isin(pt,[3,12]);wet=np.isfinite(precip)&(precip>=.1)
    phase_known=np.isfinite(ww)|np.isfinite(pt)
    # Only classify rain totals with liquid-phase evidence; snow water is not rain.
    rain=liquid_amount(fields,end)
    liquid=np.isfinite(rain)&(rain>0)
    sustained=sustained_rain(fields,end)
    capes=np.fmax(val('mlcape'),val('mucape'));cin=val('mlcin');shear=val('s06')
    conv=direct_storm(fields,end)|((capes>=500)&(np.abs(cin)<=125)&wet)
    conv_known=np.isfinite(ww)|(np.isfinite(capes)&np.isfinite(cin)&np.isfinite(precip))
    storm=categorical(conv_known,conv);storm[conv&((capes>=1000)&(shear>=15)|(rain>=20))]=2
    # Height threshold is used only when model orography is known.
    wind=levels(gust,[50,70,100,120]);high=levels(gust,[60,80,105,125]);wind[orog>=800]=high[orog>=800]
    heat=np.where(np.isfinite(t),np.where(t>=39,4,np.where(t>=37,3,0)),255).astype(np.uint8)
    # Separate ingredient-based severe-weather outlooks, never confirmation,
    # hail size or tornado probability. Lack of an ingredient stays missing.
    ship=val('ship');stp=val('stp')
    conv_gust=np.where(conv_known&np.isfinite(gust),np.where(conv&(gust>=70),wind,0),255).astype(np.uint8)
    hour_peak=np.where(liquid,peak_hour_rain(fields,end),np.nan)
    conv_rain_level=np.maximum(np.where(np.isfinite(rain),levels(rain,[20,35,55,80]),0),np.where(np.isfinite(hour_peak),levels(hour_peak,[15,25,40,60]),0))
    conv_rain=np.where(conv_known&(np.isfinite(rain)|np.isfinite(hour_peak)),np.where(conv,conv_rain_level,0),255).astype(np.uint8)
    causes=ice_causes(fields,end)
    frost=levels(-minimum_temp(fields,end),[.0001,5,10,20])
    snow_cm=fresh_snow_cm(fields,end)
    snow_signal=np.isin(ww,[70,71,72,73,74,75,77,85,86])|(np.isin(pt,[5,6])&wet)|(snow_cm>=.1)
    snow_levels=categorical(phase_known|np.isfinite(snow_cm),snow_signal)
    for level,threshold in enumerate((5,10,20),2):snow_levels[snow_signal&(snow_cm>=threshold)]=level
    return dict(frost=frost,wind=wind,heat=heat,
                fog=levels(np.where(v>=0,-v,np.nan),[-.25,-.05]),
                snow=snow_levels,freezing=categorical(phase_known,freeze),
                ice=categorical((causes>0)|(np.isfinite(ground)&(np.isfinite(precip)|np.isfinite(rh))),causes>0),
                rain=np.where(np.isfinite(rain),np.maximum(levels(rain,[20,35,55,80]),np.where(np.isfinite(hour_peak),levels(hour_peak,[15,25,40,60]),0)),255).astype(np.uint8),durationrain=levels(sustained,[25,40,60,90]),storm=storm,stormwind=conv_gust,stormrain=conv_rain,
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

def family_arrays(models,arrays):
    families={}
    for m,a in sorted(zip(models,arrays),key=lambda x:x[0]['step']):
        family='DWD' if m['model'].startswith('ICON') else m['model']
        families[family]=np.where(families[family]==255,a,families[family]) if family in families else a.copy()
    return list(families.values())

def build(now,models,ends,watch=False):
    periods=[]
    # Keep long-range outlooks smaller than the high-resolution 24h product.
    selection=(slice(None,None,2),slice(None,None,2)) if watch else (slice(None),slice(None))
    def pack(arr):
        return base64.b64encode(arr.reshape(GRID['ny'],GRID['nx'])[selection].tobytes()).decode()
    continuation={k:np.zeros(N,dtype=bool) for k in TYPES}
    cutoff=now+86400
    for end in ends:
        rows=[analyze(m['fields'],end) for m in models]
        codes={k:combine(family_arrays(models,[r[k] for r in rows]),k) for k in TYPES}
        # A localized frost indication in the high-resolution regional model
        # can justify a precautionary forecast even without global agreement.
        # Keep this distinct from multiple independent model families.
        if not watch:
            regional=next((r['frost'] for m,r in zip(models,rows) if m['model']=='ICON-D2'),None)
            if regional is not None:
                local=(regional>0)&(regional<255)&(codes['frost']>=1)&(codes['frost']<=4)
                codes['frost'][local]=30+regional[local]
        # CAPE/CIN plus precipitation are ingredients, not proof of a storm.
        # A forecast warning requires independent explicit thunder/convection
        # signals; otherwise keep the event visibly in the risk layer.
        explicit=[np.where(row['storm']==255,255,np.where(direct_storm(m['fields'],end),row['storm'],0)).astype(np.uint8) for m,row in zip(models,rows)]
        confirmed=combine(family_arrays(models,explicit),'storm');active=(confirmed>=11)&(confirmed<=14)
        uncertain=(codes['storm']>=11)&(codes['storm']<=14)&~active
        codes['storm'][uncertain]+=10
        codes['storm'][active]=confirmed[active]
        # Agreement on wet/snow/ice precipitation justifies a forecast warning;
        # humidity alone remains a risk (road surface state is not measured).
        direct_ice=sum(a==1 for a in family_arrays(models,[np.where(row['ice']==255,255,(ice_causes(m['fields'],end)&7)>0).astype(np.uint8) for m,row in zip(models,rows)]))
        codes['ice'][(codes['ice']>=21)&(codes['ice']<=24)&(direct_ice>=2)]-=10
        # Do not create another Watch for a continuous, already warned event.
        if watch:
            if end-10800<cutoff:
                for k,c in codes.items():continuation[k]=(c>=11)&(c<=14)
                continue
            for k,c in codes.items():
                continuation[k]&=(c>=11)&(c<=14)
                c[continuation[k]]=0
        elif end-10800>=cutoff:break
        layers={k:pack(c) for k,c in codes.items()}
        # Numeric values from the same models/time that actually triggered
        # the hazard, not invented ranges derived from warning thresholds.
        metrics={}
        priority=sorted(zip(models,rows),key=lambda mr:mr[0]['step'])
        for kind,field in {'frost':'temp2','heat':'temp2','wind':'gust','fog':'visibility','snow':'snowCm','rain':'rainTotal','freezing':'rainTotal','durationrain':'rainTotal','stormrain':'rainTotal','stormwind':'gust','stormhour':'hourRain','iceCause':'iceCause'}.items():
            chosen=np.full(N,np.nan,dtype=np.float32)
            for model,row in priority:
                f=model['fields'];hazard={'stormhour':'stormrain','iceCause':'ice'}.get(kind,kind)
                if field=='snowCm':values=fresh_snow_cm(f,end)
                elif field=='rainTotal':values=delta(f,end,'rainTotal')
                elif field=='hourRain':values=peak_hour_rain(f,end)
                elif field=='iceCause':values=ice_causes(f,end).astype(np.float32)
                elif kind=='frost':values=minimum_temp(f,end)
                else:values=field_value(f,end,field)
                valid=(row[hazard]>0)&(row[hazard]<255)&np.isfinite(values)&~np.isfinite(chosen)
                chosen[valid]=values[valid]
            packed=np.where(np.isfinite(chosen)&(np.abs(chosen)<3276),np.rint(chosen*10),-32768).astype('<i2')
            metrics[kind]=pack(packed)
        periods.append(dict(start=end-10800,end=end,layers=layers,metrics=metrics,metricVersion=2))
    grid=dict(GRID,step=.04,nx=241,ny=206) if watch else GRID
    return dict(schema=1,generated=now,grid=grid,models=[{k:m[k] for k in ('model','run','step')} for m in models],periods=periods)

def main():
    now=int(dt.datetime.now(dt.timezone.utc).timestamp());first=(now//10800+1)*10800;ends=list(range(first,now+96*3600+10800,10800))
    def get_model(spec):
        try:return load_model(*spec,now,ends)
        except Exception as e:print(spec[0],str(e),flush=True);return None
    with ThreadPoolExecutor(max_workers=3) as pool:models=[m for m in pool.map(get_model,MODELS) if m]
    if not models:raise RuntimeError('No usable model runs')
    import sys
    data=build(now,models,ends);path=Path(sys.argv[1] if len(sys.argv)>1 else 'data/national-risks.json.gz');path.parent.mkdir(parents=True,exist_ok=True)
    with gzip.open(path,'wt',encoding='utf8') as f:json.dump(data,f,separators=(',',':'))
    with gzip.open(path.with_name('national-watches.json.gz'),'wt',encoding='utf8') as f:json.dump(build(now,models,ends,watch=True),f,separators=(',',':'))
    print('Regional forecast',[(m['model'],len(m['fields'])) for m in models],len(ends),'windows',path.stat().st_size,flush=True)

if __name__=='__main__':main()

