"""Native point packet, halo, units and missing-data regression checks."""
import base64
import gzip
import json
import runpy
import tempfile
from pathlib import Path

import numpy as np

m=runpy.run_path(str(Path(__file__).with_name('ingest-ruc-live.py')))
raw={'T_2M':np.array([272.15,276.15,278.15,280.15]),'TD_2M':np.array([270.15,273.15,275.15,277.15]),
     'U_10M':np.array([0,3,4,0]),'V_10M':np.array([0,4,0,0]),'PMSL':np.array([101300]*4),
     'RELHUM_2M':np.array([90,80,70,60]),'CLCT':np.array([100,20,10,0])}
fields=m['surface_fields'](raw)
fields['gust']=np.array([0,22,35,np.nan])
assert np.isclose(fields['temp2'][0],-1)
assert fields['wind'][0]==0 and fields['wind'][1]==18
assert fields['slp'][0]==1013
assert m['encode_field']('gust',fields['gust']).tolist()==[0,220,350,-32768]
lon=np.array([7.995,8.005,8.5,9.07]); lat=np.array([50.5,50.5,50.8,51.02])
run='2026-11-22T10:00:00+00:00';gen='2026-11-22T10:40:00+00:00'
gust={'run':'2026-11-22T09:00:00+00:00','valid':run,'intervalMinutes':60}
with tempfile.TemporaryDirectory() as out:
    manifest=m['build_snapshot'](out,lon,lat,fields,run,gen,gust,np.array([800,1000,1400,2000]))
    assert manifest['gridMapping']=='native-triangular-cells' and manifest['gust']==gust
    def unpack(key):
        with gzip.open(Path(out)/f'tile-{key}.json.gz','rt') as f: t=json.load(f)
        return t,np.frombuffer(base64.b64decode(t['lon']),dtype='<i4').tolist(),np.frombuffer(base64.b64decode(t['values']['temp2']),dtype='<i2').tolist()
    t1,l1,v1=unpack('7_50');t2,l2,v2=unpack('8_50')
    assert 799500 in l1 and 800500 in l1 and 799500 in l2 and 800500 in l2
    assert v1[l1.index(799500)]==-10 and v2[l2.index(800500)]==30
    assert t1['run']==run and t2['generated']==gen
    assert manifest['terrainScale']==1 and np.frombuffer(base64.b64decode(t1['terrain']),dtype='<i2')[l1.index(799500)]==800
    g=dict(west=8,south=50.5,step=.02,nx=8,ny=2)
    packet=m['build_analysis_map'](out,lon,lat,fields,run,gen,g)
    v=np.frombuffer(base64.b64decode(packet['fields']['temp2']),dtype='<i2')
    assert v[0] in [-10,30] and v[1]==30 and v[-1]==-32768
    assert packet['run']<packet['generated']
print('PASS: native source cells, border halo, genuine zero, missing values, units and completed gust interval')
