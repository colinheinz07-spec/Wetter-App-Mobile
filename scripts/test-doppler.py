import base64
import datetime as dt
import importlib.util
import io
from pathlib import Path
import h5py
import numpy as np
from PIL import Image

spec=importlib.util.spec_from_file_location('doppler',Path(__file__).with_name('ingest-doppler.py'))
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
now=dt.datetime(2026,11,22,18,5,tzinfo=dt.timezone.utc)
buf=io.BytesIO()
with h5py.File(buf,'w') as f:
    f.create_group('where').attrs.update(lon=8.,lat=50.)
    d=f.create_group('dataset1')
    d.create_group('where').attrs.update(nrays=360,nbins=100,rscale=1000.,rstart=0.,elangle=.5)
    d.create_group('what').attrs.update(startdate='20261122',starttime='180000')
    d.create_group('how').attrs.update(startazA=np.arange(360.),stopazA=(np.arange(360.)+1)%360)
    a=d.create_group('data1'); a.create_group('what').attrs.update(quantity='VRADH',gain=.5,offset=-64.,nodata=255,undetect=0)
    v=np.full((360,100),88,dtype=np.uint8);v[90:270]=168;v[:,0:5]=255
    a.create_dataset('data',data=v)
packet=m.read_scan(buf.getvalue(),'ess',now,size=128)
assert packet['time']=='2026-11-22T18:00:00Z'
im=np.asarray(Image.open(io.BytesIO(base64.b64decode(packet['png']))))
assert im[20,64,1]>im[20,64,0] # north: negative velocity, green
assert im[108,64,0]>im[108,64,1] # south: positive velocity, red
assert im[64,64,3]==0 and im[0,0,3]==0
try:
    m.read_scan(buf.getvalue(),'ess',now+dt.timedelta(hours=1))
    raise AssertionError('Stale scan accepted')
except ValueError:
    pass
print('Doppler: measured velocity sign, geographic orientation, no-data and scan freshness: OK')
