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
FIELDS=('temp2','dew','wind','gust','visibility','ww','ptype','rainTotal','convTotal','tground','rh2','mlcape','mucape','mlcin','s06','orog','ship','stp','snowWaterTotal','snowGspTotal','snowConTotal')
TYPES=('frost','wind','heat','fog','fogpotential','snow','freezing','ice','rain','durationrain','storm','stormwind','stormrain','hail','rotation')
POTENTIAL={'ice','fogpotential','stormwind','stormrain','hail','rotation'}
N=GRID['nx']*GRID['ny']

# September reference matrices + 3-hour snow reference.
SNOW_LOW={3:[1,3,8,15,25],6:[2,5,15,25,40],12:[3,8,20,35,55],24:[5,10,25,45,70],48:[8,15,35,60,90]}
SNOW_HIGH={3:[2,5,12,20,35],6:[3,8,20,35,55],12:[5,12,30,50,75],24:[8,18,40,65,95],48:[12,25,55,85,120]}
SHORT_RAIN={1:[15,25,40,60,90],3:[20,35,55,80,120],6:[25,40,65,95,140]}
LONG_RAIN={12:[20,30,45,65,90],24:[25,40,60,90,130],48:[35,50,80,120,180],72:[45,65,100,150,220]}
WIND_LOW=[50,70,100,120,150]
WIND_HIGH=[60,80,105,125,155]

def reference_level(amount,hours,matrix):
    keys=sorted(matrix)
    valid=np.isfinite(amount)&np.isfinite(hours)&(hours>0)
    result=np.zeros(np.shape(amount),dtype=np.uint8)
    for i in range(5):
        threshold=np.interp(hours,keys,[matrix[k][i] for k in keys])
        result[valid & ((amount>threshold) if i==4 else (amount>=threshold))]=i+1
    return np.where(valid,result,255).astype(np.uint8)

def snow_reference(amount,hours,orog):
    return np.where(orog>=800,reference_level(amount,hours,SNOW_HIGH),reference_level(amount,hours,SNOW_LOW)).astype(np.uint8)

def event_totals(blocks,ends):
    # Per cell, contiguous wet periods only; missing and dry data terminate events.
    ahead=[];elapsed=[];total=np.zeros(N,np.float32);hours=np.zeros(N,np.float32)
    for i,(a,d,s,z) in enumerate(blocks):
        wet=np.isfinite(a)&(a>=.1)&(d>0)
        join=(blocks[i-1][3]==3)&(s==0) if i and ends[i]-ends[i-1]==10800 else False
        total=np.where(wet,np.where(join,total,0)+a,0);hours=np.where(wet,np.where(join,hours,0)+d,0)
        ahead.append(total);elapsed.append(hours)
    out=[None]*len(blocks);total=np.zeros(N,np.float32);hours=np.zeros(N,np.float32)
    for i in range(len(blocks)-1,-1,-1):
        a,d,s,z=blocks[i];wet=np.isfinite(a)&(a>=.1)&(d>0)
        join=(z==3)&(blocks[i+1][2]==0) if i+1<len(blocks) and ends[i+1]-ends[i]==10800 else False
        total=np.where(wet,np.where(join,total,0)+a,0);hours=np.where(wet,np.where(join,hours,0)+d,0)
        out[i]=(np.where(wet,ahead[i]+total-a,np.nan),np.where(wet,elapsed[i]+hours-d,np.nan))
    return out

def hourly_snow(fields,end):
    water=delta(fields,end,'snowWaterTotal',3600)
    water=np.fmax(water,delta(fields,end,'snowGspTotal',3600)+delta(fields,end,'snowConTotal',3600))
    temp=field_value(fields,end,'temp2')
    return np.where(water==0,0,water*np.clip(7-temp*1.2,4,16)/10)

def block_snow(fields,end):
    hourly=np.stack([hourly_snow(fields,end-s) for s in (7200,3600,0)])
    complete=np.isfinite(hourly).all(axis=0);wet=hourly>=.1
    precise=complete&~(wet[0]&~wet[1]&wet[2])
    return (np.where(complete,hourly.sum(axis=0),fresh_snow_cm(fields,end)),
            np.where(precise,wet.sum(axis=0),3).astype(np.float32),
            np.where(precise&wet.any(axis=0),wet.argmax(axis=0),0).astype(np.uint8),
            np.where(precise&wet.any(axis=0),3-wet[::-1].argmax(axis=0),3).astype(np.uint8))

def prepare_events(model,ends):
    f=model['fields'];snow=[block_snow(f,e) for e in ends]
    rain=[liquid_amount(f,e) for e in ends]
    zero=np.zeros(N,np.uint8);three=np.full(N,3,np.uint8)
    snow_events=event_totals(snow,ends);rain_events=event_totals([(a,three,zero,three) for a in rain],ends)
    result=[]
    for i,e in enumerate(ends):
        a,d,start,finish=snow[i];sa,sh=snow_events[i];ra,rh=rain_events[i]
        orog=field_value(f,e,'orog')
        base=snow_reference(a,d,orog);total=snow_reference(sa,sh,orog)
        snow_level=np.maximum(np.where(base==255,0,base),np.where(total==255,0,total))
        short=reference_level(rain[i],3,SHORT_RAIN)
        for j in (i-1,i):
            if j>=0 and j+1<len(ends) and ends[j+1]-ends[j]==10800:
                b,c=snow[j],snow[j+1]
                peak=snow_reference(b[0]+c[0],b[1]+c[1],orog)
                snow_level=np.maximum(snow_level,np.where((b[0]>=.1)&(c[0]>=.1)&(b[3]==3)&(c[2]==0)&(peak<255),peak,0))
                six=reference_level(rain[j]+rain[j+1],6,SHORT_RAIN)
                short=np.where((rain[i]>=.1)&(rain[j]>=.1)&(rain[j+1]>=.1)&(six<255),np.maximum(np.where(short==255,0,short),six),short)
        long=reference_level(ra,rh,LONG_RAIN)
        long=np.where(np.isfinite(ra)&(rh>=12),long,np.where(np.isfinite(rain[i]),0,255)).astype(np.uint8)
        result.append(dict(snow=np.where(np.isfinite(a)&(a>=.1),np.maximum(1,snow_level),np.where(np.isfinite(a),0,255)).astype(np.uint8),snowAmount=a,snowStart=start,snowEnd=finish,durationrain=long,rain=short))
    return result

def load_hail(now,ends):
    root=ROOT+'icon-d2-ruc/'
    meta=read(root+'index.json');run=timestamp(meta['run']);g=meta['grid']
    if meta.get('product')!='hail' or meta.get('model')!='ICON-D2-RUC' or not 0<=now-run<=21600:raise ValueError('stale hail run')
    idx,valid=grid_indices(g)
    hours={int((e-s-run)/3600) for e in ends for s in (0,3600,7200) if (e-s-run)%3600==0 and int((e-s-run)/3600) in meta['hours']}
    def one(h):
        try:
            p=read(root+f'{h}-hail.json.gz?v='+meta['generated'])
            if (p['run'],p['generated'],p['hour'],p['field'])!=(meta['run'],meta['generated'],h,'hail'):raise ValueError('hail run changed')
            raw=np.frombuffer(base64.b64decode(p['values'],validate=True),dtype='<i2')
            if len(raw)!=g['nx']*g['ny']:raise ValueError('hail grid')
            a=raw[idx].astype(np.float32);a[(a==g['missing'])|~valid]=np.nan
            return run+h*3600,a*meta['scales']['hail']
        except Exception as e:print('hail',h,str(e)[:100]);return run+h*3600,np.full(N,np.nan,np.float32)
    with ThreadPoolExecutor(max_workers=5) as pool:fields=dict(pool.map(one,sorted(hours)))
    return {e:np.fmax.reduce([fields.get(e-s,np.full(N,np.nan,np.float32)) for s in (0,3600,7200)]) for e in ends}

def hail_level(size):
    return np.where(np.isfinite(size),np.where(size>8,5,np.where(size>=5,4,np.where(size>=3,3,np.where(size>=2,2,np.where(size>0,1,0))))),255).astype(np.uint8)

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
    jobs=[(h,k) for h in hours for k in FIELDS if k in m['frames'][str(h)] and (run+h*3600 in ends or run+h*3600 in targets and k in ('rainTotal','convTotal','temp2','ww','ptype','snowWaterTotal','snowGspTotal','snowConTotal') or run+h*3600 in hourly_rain and k in ('rainTotal','temp2','ww','ptype','snowWaterTotal','snowGspTotal','snowConTotal'))]
    with ThreadPoolExecutor(max_workers=10) as pool:fields={k:v for k,v in pool.map(load,jobs) if v is not None}
    if not fields:raise ValueError('no valid fields')
    return dict(model=name,run=run,fields=fields,step=g['step'])

def levels(v,limits):
    result=np.zeros(N,dtype=np.uint8)
    result[~np.isfinite(v)]=255
    for i,x in enumerate(limits,1):result[np.isfinite(v)&((v>x) if i==5 else (v>=x))]=i
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

def frost_level(temp):
    # Luftfrost: 0 °C itself is not frost; -10 enters L2, below -20 enters L3.
    return np.where(np.isfinite(temp),np.where(temp < -20,3,np.where(temp <= -10,2,np.where(temp < 0,1,0))),255).astype(np.uint8)

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
    wind=levels(gust,WIND_LOW);high=levels(gust,WIND_HIGH);wind[orog>=800]=high[orog>=800]
    heat=np.where(np.isfinite(t),np.where(t>=39,4,np.where(t>=37,3,0)),255).astype(np.uint8)
    # Separate ingredient-based severe-weather outlooks, never confirmation,
    # hail size or tornado probability. Lack of an ingredient stays missing.
    ship=val('ship');stp=val('stp')
    conv_gust=np.where(conv_known&np.isfinite(gust),np.where(conv,levels(gust,WIND_LOW),0),255).astype(np.uint8)
    hour_peak=np.where(liquid,peak_hour_rain(fields,end),np.nan)
    conv_rain_level=np.maximum(np.where(np.isfinite(rain),levels(rain,SHORT_RAIN[3]),0),np.where(np.isfinite(hour_peak),levels(hour_peak,SHORT_RAIN[1]),0))
    conv_rain=np.where(conv_known&(np.isfinite(rain)|np.isfinite(hour_peak)),np.where(conv,conv_rain_level,0),255).astype(np.uint8)
    causes=ice_causes(fields,end)
    frost=frost_level(minimum_temp(fields,end))
    snow_cm=fresh_snow_cm(fields,end)
    snow_signal=np.isin(ww,[70,71,72,73,74,75,77,85,86])|(np.isin(pt,[5,6])&wet)|(snow_cm>=.1)
    snow_levels=categorical(phase_known|np.isfinite(snow_cm),snow_signal)
    snow_ref=snow_reference(snow_cm,3,orog)
    snow_levels=np.where(snow_signal&(snow_ref<255),np.maximum(snow_levels,snow_ref),snow_levels).astype(np.uint8)
    storm=np.where(conv,np.maximum(1,np.maximum(np.where(conv_gust<255,conv_gust,0),np.where(conv_rain<255,conv_rain,0))),storm).astype(np.uint8)
    dew=val('dew');meanwind=val('wind');spread=t-dew
    fog_known=np.isfinite(t)&np.isfinite(dew)&np.isfinite(meanwind)
    fog_signal=(spread>=-.5)&(spread<=1)&(meanwind>=0)&(meanwind<=12)&(~np.isfinite(rh)|(rh>=94))&~(np.isfinite(v)&(v>=0)&(v<=.25))
    return dict(frost=frost,wind=wind,heat=heat,
                fog=levels(np.where(v>=0,-v,np.nan),[-.25,-.05]),
                fogpotential=categorical(fog_known,fog_signal),
                snow=snow_levels,freezing=categorical(phase_known,freeze),
                ice=categorical((causes>0)|(np.isfinite(ground)&(np.isfinite(precip)|np.isfinite(rh))),causes>0),
                rain=np.where(np.isfinite(rain),np.maximum(levels(rain,SHORT_RAIN[3]),np.where(np.isfinite(hour_peak),levels(hour_peak,SHORT_RAIN[1]),0)),255).astype(np.uint8),durationrain=levels(sustained,LONG_RAIN[12]),storm=storm,stormwind=conv_gust,stormrain=conv_rain,
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

def build(now,models,ends,watch=False,hail=None,prepared=None):
    periods=[]
    # Keep long-range outlooks smaller than the high-resolution 24h product.
    selection=(slice(None,None,2),slice(None,None,2)) if watch else (slice(None),slice(None))
    def pack(arr):
        return base64.b64encode(arr.reshape(GRID['ny'],GRID['nx'])[selection].tobytes()).decode()
    continuation={k:np.zeros(N,dtype=bool) for k in TYPES}
    cutoff=now+86400
    prepared=prepared if prepared is not None else [prepare_events(m,ends) for m in models]
    terrain=np.full(N,np.nan,np.float32)
    for m in sorted(models,key=lambda m:m['step']):
        for e in ends:
            terrain=np.where(np.isfinite(terrain),terrain,field_value(m['fields'],e,'orog'))
            if np.isfinite(terrain).all():break
    terrain_packed=pack(np.where(np.isfinite(terrain),np.clip(np.rint(terrain),-32767,32767),-32768).astype('<i2'))
    for ei,end in enumerate(ends):
        rows=[analyze(m['fields'],end) for m in models]
        for mi,row in enumerate(rows):
            ev=prepared[mi][ei]
            row['snow']=np.where((ev['snow']>0)&(ev['snow']<255),ev['snow'],row['snow'])
            row['durationrain']=ev['durationrain']
            row['rain']=np.where((ev['rain']<255)&(row['rain']<255),np.maximum(ev['rain'],row['rain']),row['rain'])
            conv=(row['storm']>0)&(row['storm']<255)
            row['stormrain']=np.where(conv&(row['rain']<255),np.maximum(np.where(row['stormrain']<255,row['stormrain'],0),row['rain']),row['stormrain'])
            row['storm']=np.where(conv,np.maximum(row['storm'],np.where(row['stormrain']<255,row['stormrain'],0)),row['storm'])
        codes={k:combine(family_arrays(models,[r[k] for r in rows]),k) for k in TYPES}
        # A localized frost indication in the high-resolution regional model
        # can justify a precautionary forecast even without global agreement.
        # Keep this distinct from multiple independent model families.
        if not watch:
            regional=next((r['frost'] for m,r in zip(models,rows) if m['model']=='ICON-D2'),None)
            if regional is not None:
                local=(regional>0)&(regional<255)&(codes['frost']>=1)&(codes['frost']<=5)
                codes['frost'][local]=30+regional[local]
        # CAPE/CIN plus precipitation are ingredients, not proof of a storm.
        # A forecast warning requires independent explicit thunder/convection
        # signals; otherwise keep the event visibly in the risk layer.
        explicit=[np.where(row['storm']==255,255,np.where(direct_storm(m['fields'],end),row['storm'],0)).astype(np.uint8) for m,row in zip(models,rows)]
        confirmed=combine(family_arrays(models,explicit),'storm');active=(confirmed>=11)&(confirmed<=15)
        uncertain=(codes['storm']>=11)&(codes['storm']<=15)&~active
        codes['storm'][uncertain]+=10
        codes['storm'][active]=confirmed[active]
        # Agreement on wet/snow/ice precipitation justifies a forecast warning;
        # humidity alone remains a risk (road surface state is not measured).
        direct_ice=sum(a==1 for a in family_arrays(models,[np.where(row['ice']==255,255,(ice_causes(m['fields'],end)&7)>0).astype(np.uint8) for m,row in zip(models,rows)]))
        codes['ice'][(codes['ice']>=21)&(codes['ice']<=25)&(direct_ice>=2)]-=10
        hail_size=(hail or {}).get(end)
        if hail_size is not None:
            hl=hail_level(hail_size);hit=(hl>0)&(hl<255)
            codes['hail'][hit]=20+hl[hit]
            storm=codes['storm'];base=storm%10
            supported=hit&(storm>0)&(storm<255)&(hl>base)
            active=supported&(storm>=11)&(storm<=15)
            storm[supported]=20+hl[supported];storm[active]=30+hl[active]
        # Do not create another Watch for a continuous, already warned event.
        if watch:
            if end-10800<cutoff:
                for k,c in codes.items():continuation[k]=(c>=11)&(c<=15)
                continue
            for k,c in codes.items():
                continuation[k]&=(c>=11)&(c<=15)
                c[continuation[k]]=0
        elif end-10800>=cutoff:break
        layers={k:pack(c) for k,c in codes.items()}
        # Numeric values from the same models/time that actually triggered
        # the hazard, not invented ranges derived from warning thresholds.
        metrics={}
        priority=sorted(zip(models,rows),key=lambda mr:mr[0]['step'])
        prepared_by_model={id(m):prepared[i][ei] for i,m in enumerate(models)}
        snow_start=np.full(N,0,np.uint8);snow_end=np.full(N,3,np.uint8);timing_known=np.zeros(N,bool)
        for model,row in priority:
            ev=prepared_by_model[id(model)];match=(row['snow']==codes['snow']%10)&(row['snow']>0)&(row['snow']<255)&~timing_known
            snow_start[match]=ev['snowStart'][match];snow_end[match]=ev['snowEnd'][match];timing_known|=match
        if hail_size is not None:metrics['hail']=pack(np.where(np.isfinite(hail_size)&(hail_size>=0)&(hail_size<3276),np.rint(hail_size*10),-32768).astype('<i2'))
        for kind,field in {'frost':'temp2','heat':'temp2','wind':'gust','fog':'visibility','snow':'snowCm','rain':'rainTotal','freezing':'rainTotal','durationrain':'rainTotal','stormrain':'rainTotal','stormwind':'gust','stormhour':'hourRain','iceCause':'iceCause'}.items():
            chosen=np.full(N,np.nan,dtype=np.float32)
            for model,row in priority:
                f=model['fields'];hazard={'stormhour':'stormrain','iceCause':'ice'}.get(kind,kind)
                if field=='snowCm':values=prepared_by_model[id(model)]['snowAmount']
                elif field=='rainTotal':values=delta(f,end,'rainTotal')
                elif field=='hourRain':values=peak_hour_rain(f,end)
                elif field=='iceCause':values=ice_causes(f,end).astype(np.float32)
                elif kind=='frost':values=minimum_temp(f,end)
                else:values=field_value(f,end,field)
                valid=(row[hazard]>0)&(row[hazard]<255)&np.isfinite(values)&~np.isfinite(chosen)
                if kind=='frost':
                    target=codes['frost']%10
                    valid&=row[hazard]==target
                chosen[valid]=values[valid]
            packed=np.where(np.isfinite(chosen)&(np.abs(chosen)<3276),np.rint(chosen*10),-32768).astype('<i2')
            metrics[kind]=pack(packed)
        # Model spread, not a calibrated probability interval. Retain all
        # independent models with a valid snow phase and quantified snowfall.
        # This avoids a single rounded "0 cm" despite a snow signal.
        snow_members=[]
        for model,row in priority:
            snow_cm=prepared_by_model[id(model)]['snowAmount']
            qualified=(row['snow']>0)&(row['snow']<255)&np.isfinite(snow_cm)&(snow_cm>=0)
            snow_members.append(np.where(qualified,snow_cm,np.nan))
        snow_stack=np.stack(snow_members) if snow_members else np.empty((0,N))
        snow_valid=np.isfinite(snow_stack)
        count=snow_valid.sum(axis=0) if len(snow_stack) else np.zeros(N,dtype=int)
        snow_lower=np.where(count>0,np.min(np.where(snow_valid,snow_stack,np.inf),axis=0),np.nan) if len(snow_stack) else np.full(N,np.nan)
        snow_upper=np.where(count>0,np.max(np.where(snow_valid,snow_stack,-np.inf),axis=0),np.nan) if len(snow_stack) else np.full(N,np.nan)
        for key,values in [('snowMin',snow_lower),('snowMax',snow_upper)]:
            packed=np.where(np.isfinite(values)&(values>=0)&(values<3276),np.rint(values*10),-32768).astype('<i2')
            metrics[key]=pack(packed)
        periods.append(dict(start=end-10800,end=end,layers=layers,metrics=metrics,metricVersion=2,frostThresholdVersion=2,warningVersion=3,timing={'snowStart':pack(snow_start),'snowEnd':pack(snow_end)}))
    grid=dict(GRID,step=.04,nx=241,ny=206) if watch else GRID
    return dict(schema=1,generated=now,grid=grid,terrain=terrain_packed,models=[{k:m[k] for k in ('model','run','step')} for m in models],periods=periods)

def main():
    now=int(dt.datetime.now(dt.timezone.utc).timestamp());first=(now//10800+1)*10800;ends=list(range(first,now+96*3600+10800,10800))
    def get_model(spec):
        try:return load_model(*spec,now,ends)
        except Exception as e:print(spec[0],str(e),flush=True);return None
    with ThreadPoolExecutor(max_workers=3) as pool:models=[m for m in pool.map(get_model,MODELS) if m]
    if not models:raise RuntimeError('No usable model runs')
    import sys
    try:hail=load_hail(now,ends)
    except Exception as e:print('Hail product unavailable',str(e),flush=True);hail={}
    prepared=[prepare_events(m,ends) for m in models]
    data=build(now,models,ends,hail=hail,prepared=prepared);path=Path(sys.argv[1] if len(sys.argv)>1 else 'data/national-risks.json.gz');path.parent.mkdir(parents=True,exist_ok=True)
    with gzip.open(path,'wt',encoding='utf8') as f:json.dump(data,f,separators=(',',':'))
    with gzip.open(path.with_name('national-watches.json.gz'),'wt',encoding='utf8') as f:json.dump(build(now,models,ends,watch=True,hail=hail,prepared=prepared),f,separators=(',',':'))
    print('Regional forecast',[(m['model'],len(m['fields'])) for m in models],len(ends),'windows',path.stat().st_size,flush=True)

if __name__=='__main__':main()

