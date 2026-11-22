"""Meteosat product identity, scan timestamps, explicit cloud-free and missing pixels."""
import base64
import bz2
import datetime as dt
import runpy
import tempfile
from pathlib import Path

import netCDF4

decode=runpy.run_path(str(Path(__file__).with_name('ingest-satellite-cloud.py')))['decode']
now=dt.datetime(2026,11,22,22,20,tzinfo=dt.timezone.utc)
with tempfile.TemporaryDirectory() as d:
    path=Path(d)/'fixture.nc'
    with netCDF4.Dataset(path,'w',format='NETCDF3_CLASSIC') as ds:
        ds.source='Meteosat';ds.nominal_product_time='2026-11-22 22:00:00'
        for name,n in [('time',1),('lat',2),('lon',2)]:ds.createDimension(name,n)
        ds.createVariable('lat','f4',('lat',))[:]=[50,50.03]
        ds.createVariable('lon','f4',('lon',))[:]=[8,8.03]
        ds.createVariable('opa','i2',('time','lat','lon'),fill_value=-1)[:]=[[[0,100],[45,-1]]]
    blob=bz2.compress(path.read_bytes())
    packet=decode(blob,'CTHin202611222200nEU.nc.bz2',now)
    assert list(base64.b64decode(packet['cloud']))==[0,100,45,255]
    assert packet['grid']==dict(west=8,south=50,step=.03,nx=2,ny=2)
    for name,at in [('CTHin202611222150nEU.nc.bz2',now),('CTHin202611222200nEU.nc.bz2',now+dt.timedelta(hours=1))]:
        try:decode(blob,name,at)
        except ValueError:pass
        else:raise AssertionError('Accepted a mismatched or stale scan')
print('PASS: actual cloud opacity, clear sky, missing pixels, timestamps and metadata integrity')
