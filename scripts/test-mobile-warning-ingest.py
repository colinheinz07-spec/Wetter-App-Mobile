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
assert x['frost'][0]==2 and x['wind'][0]==3 and x['rain'][0]==1 and x['ice'][0]==1
assert x['storm'][0]==2
assert r.analyze({},end)['frost'][0]==255
assert r.combine([x['frost'],fill(0).astype('uint8')],'frost')[0]==2
assert r.combine([x['frost'],fill(1).astype('uint8')],'frost')[0]==11
assert r.combine([x['storm'],x['storm']],'storm')[0]==22
assert x['stormwind'][0]==3 and x['stormrain'][0]==1 and x['hail'][0]==255
assert r.combine([x['stormwind'],x['stormwind']],'stormwind')[0]==23
assert r.combine([fill(255).astype('uint8')],'wind')[0]==255
assert r.analyze(field(end,temp2=39),end)['heat'][0]==4
assert r.analyze(field(end,temp2=37),end)['heat'][0]==3
assert r.analyze(field(end,ww=71,rainTotal=31,temp2=-1),end)['rain'][0]==255
assert r.analyze(field(end,ww=71,rainTotal=31,temp2=-1),end)['snow'][0]==1
models=[dict(model='ICON-D2',run=0,step=.02,fields=field(end,temp2=-4)),dict(model='GFS',run=0,step=.25,fields=field(end,temp2=-2))]
period=r.build(0,models,[end])['periods'][0]
assert np.frombuffer(base64.b64decode(period['metrics']['frost']),dtype='<i2')[0]==-30
assert np.frombuffer(base64.b64decode(period['metrics']['wind']),dtype='<i2')[0]==-32768
print('PASS: independent model agreement, uncertain convective signal, missing inputs, phase and own thresholds')
