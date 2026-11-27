import importlib.util
import base64
from pathlib import Path
import numpy as np

def load(name):
    spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

r=load('ingest-mobile-warnings')
def fill(v):return np.full(r.N,v,dtype=np.float32)
def field(end,**values):return {(end,k):fill(v) for k,v in values.items()}
end=10800
f=field(end,temp2=-6,gust=103,orog=100,ww=61,tground=0,rh2=96,rainTotal=21,mlcape=1500,mlcin=-25,s06=20);f[(0,'rainTotal')]=fill(0)
x=r.analyze(f,end)
assert x['frost'][0]==1 and x['wind'][0]==3 and x['rain'][0]==1 and x['ice'][0]==1
assert x['storm'][0]==2
assert r.analyze({},end)['frost'][0]==255
assert r.combine([x['frost'],fill(0).astype('uint8')],'frost')[0]==1
assert r.combine([x['frost'],fill(1).astype('uint8')],'frost')[0]==11
assert r.combine([x['storm'],x['storm']],'storm')[0]==12
assert x['stormwind'][0]==3 and x['stormrain'][0]==1 and x['hail'][0]==255
assert r.combine([x['stormwind'],x['stormwind']],'stormwind')[0]==23
assert r.combine([fill(255).astype('uint8')],'wind')[0]==255
assert r.analyze(field(end,temp2=39),end)['heat'][0]==4
assert r.analyze(field(end,temp2=37),end)['heat'][0]==3
assert r.analyze(field(end,ww=71,rainTotal=31,temp2=-1),end)['rain'][0]==255
assert r.analyze(field(end,ww=71,rainTotal=31,temp2=-1),end)['snow'][0]==1
models=[dict(model='ICON-D2',run=0,step=.02,fields=field(end,temp2=-4)),dict(model='GFS',run=0,step=.25,fields=field(end,temp2=-2))]
period=r.build(0,models,[end])['periods'][0]
assert np.frombuffer(base64.b64decode(period['metrics']['frost']),dtype='<i2')[0]==-40 # local highest-resolution model
assert np.frombuffer(base64.b64decode(period['metrics']['wind']),dtype='<i2')[0]==-32768
ends=list(range(10800,72*3600+1,10800))
fields={**{(e,'temp2'):fill(-2) for e in ends[:12]},**{(e,'temp2'):fill(2) for e in ends[12:14]},**{(e,'temp2'):fill(-3) for e in ends[14:]}}
models=[dict(model=m,run=0,step=.02,fields=fields) for m in ('ICON-D2','GFS')]
near=r.build(0,models,ends);watch=r.build(0,models,ends,watch=True)
assert len(near['periods'])==8 and len(watch['periods'])==16
assert watch['periods'][0]['start']==86400
assert watch['grid']['step']==.04
assert base64.b64decode(watch['periods'][0]['layers']['frost'])[0]==0 # continuing active event
assert base64.b64decode(watch['periods'][6]['layers']['frost'])[0]==11 # distinct later event
rain_fields={}
for i in range(5):
    rain_fields[(i*10800,'rainTotal')]=fill(i*8)
    rain_fields[(i*10800,'ww')]=fill(61)
assert r.analyze(rain_fields,43200)['durationrain'][0]==1
assert r.analyze(rain_fields,10800)['durationrain'][0]==1 # warn before the total has accumulated
mixed_rain=dict(rain_fields);mixed_rain[(21600,'ww')]=fill(68)
assert r.analyze(mixed_rain,10800)['durationrain'][0]==255
def storm_code(a,b):
    models=[dict(model=m,run=0,step=.02,fields=fields) for m,fields in [('ICON-D2',a),('GFS',b)]]
    return base64.b64decode(r.build(0,models,[end])['periods'][0]['layers']['storm'])[0]
assert storm_code(f,f)==22 # ingredients alone are not active warnings
explicit=dict(f);explicit[(end,'ww')]=fill(95)
convective=dict(f);convective.update(field(0,convTotal=0));convective[(end,'convTotal')]=fill(3)
assert storm_code(explicit,convective)==12
hourly={**field(end,ww=61,temp2=8),**{(i*3600,'rainTotal'):fill(v) for i,v in enumerate([0,0,17,18])}}
assert r.analyze(hourly,end)['rain'][0]==1 # not missed by 3h threshold
assert r.analyze(field(end,temp2=0),end)['frost'][0]==0
fog=field(end,temp2=2,dew=1.5,wind=5,rh2=97)
assert r.analyze(fog,end)['fogpotential'][0]==1
assert r.analyze(field(end,temp2=2,dew=-1,wind=5,rh2=97),end)['fogpotential'][0]==0
assert r.analyze(field(end,temp2=2,dew=1.5,wind=30,rh2=97),end)['fogpotential'][0]==0
assert r.analyze(field(end,temp2=2,wind=5,rh2=97),end)['fogpotential'][0]==255
assert base64.b64decode(r.build(0,[dict(model='ICON-D2',run=0,step=.02,fields=fog),dict(model='GFS',run=0,step=.25,fields=fog)],[end])['periods'][0]['layers']['fogpotential'])[0]==21
assert r.analyze({**field(end,temp2=2),**field(end-3600,temp2=-1)},end)['frost'][0]==1
regional=[dict(model='ICON-D2',run=0,step=.02,fields=field(end,temp2=-2)),dict(model='ICON-EU',run=0,step=.06,fields=field(end,temp2=-3)),dict(model='GFS',run=0,step=.25,fields=field(end,temp2=2))]
assert base64.b64decode(r.build(0,regional,[end])['periods'][0]['layers']['frost'])[0]==31 # not two independent families
snowfields=field(end,temp2=-2,ww=71,rainTotal=10,snowGspTotal=5,snowConTotal=1)
snowfields.update(field(0,temp2=-2,rainTotal=0,snowGspTotal=0,snowConTotal=0))
assert abs(r.fresh_snow_cm(snowfields,end)[0]-5.64)<.01
assert r.ice_causes(f,end)[0]&1
assert r.ice_causes(field(end,tground=-2,ww=71),end)[0]&2
assert r.ice_causes(field(end,tground=-1,ww=66),end)[0]&4
hourfields={(i*3600,'rainTotal'):fill(v) for i,v in enumerate([0,2,21,24])}
assert r.peak_hour_rain(hourfields,end)[0]==19
assert np.isnan(r.peak_hour_rain(field(end,rainTotal=24),end)[0])
period=r.build(0,[dict(model='ICON-D2',run=0,step=.02,fields=snowfields)],[end])['periods'][0]
assert period['metricVersion']==2
assert np.frombuffer(base64.b64decode(period['metrics']['snow']),dtype='<i2')[0]==56
assert np.frombuffer(base64.b64decode(period['metrics']['snowMin']),dtype='<i2')[0]==56
assert np.frombuffer(base64.b64decode(period['metrics']['snowMax']),dtype='<i2')[0]==56
# A second, independent model with less snowfall widens the point-specific
# possible accumulation interval; no hard-coded category endpoints.
less_snow=dict(snowfields)
less_snow[(end,'snowGspTotal')]=fill(2)
less_snow[(end,'snowConTotal')]=fill(0)
snow_models=[dict(model='ICON-D2',run=0,step=.02,fields=snowfields),dict(model='GFS',run=0,step=.25,fields=less_snow)]
ensemble=r.build(0,snow_models,[end])['periods'][0]
lo=np.frombuffer(base64.b64decode(ensemble['metrics']['snowMin']),dtype='<i2')[0]
hi=np.frombuffer(base64.b64decode(ensemble['metrics']['snowMax']),dtype='<i2')[0]
assert lo==19 and hi==56,(lo,hi)
unknown_fields=field(end,temp2=-2,ww=71)
unknown=r.build(0,[dict(model='ICON-D2',run=0,step=.02,fields=unknown_fields)],[end])['periods'][0]
assert np.frombuffer(base64.b64decode(unknown['metrics']['snowMin']),dtype='<i2')[0]==-32768
print('PASS: independent model agreement, uncertain convective signal, missing inputs, phase and own thresholds')


# Exact boundaries, missing cells and geographically independent severity.
assert r.frost_level(np.array([1,0,-.1,-9.9,-10,-19.9,-20,-20.1,np.nan])).tolist()==[0,0,1,1,2,2,2,3,255]
spatial=fill(-2);spatial[1:4]=[-10,-20,-20.1]
models=[dict(model=m,run=0,step=.02,fields={(end,'temp2'):spatial}) for m in ('ICON-D2','GFS')]
p=r.build(0,models,[end])['periods'][0]
assert p['frostThresholdVersion']==2
assert list(base64.b64decode(p['layers']['frost'])[:5])==[11,12,12,13,11]
# A warmer member cannot supply the metric for a stronger single-model risk.
models=[dict(model='ICON-D2',run=0,step=.02,fields=field(end,temp2=-13)),dict(model='GFS',run=0,step=.25,fields=field(end,temp2=-2))]
p=r.build(0,models,[end])['periods'][0]
assert base64.b64decode(p['layers']['frost'])[0]==11
assert np.frombuffer(base64.b64decode(p['metrics']['frost']),dtype='<i2')[0]==-20
