"""DWD near-real-time Meteosat cloud opacity. No forecast or precipitation inference."""
import base64
import bz2
import datetime as dt
import gzip
import json
import re
import urllib.request
from pathlib import Path

import netCDF4
import numpy as np

ROOT='https://opendata.dwd.de/weather/satellite/clouds/CTH/'
UTC=dt.timezone.utc

def decode(blob, filename, now):
    match=re.fullmatch(r'CTHin(\d{12})n?EU\.nc\.bz2',filename)
    if not match:raise ValueError('Unexpected CTH filename')
    scan=dt.datetime.strptime(match[1],'%Y%m%d%H%M').replace(tzinfo=UTC)
    if not 0<=(now-scan).total_seconds()<=45*60:raise ValueError('CTH scan is not current')
    with netCDF4.Dataset('CTH',memory=bz2.decompress(blob)) as ds:
        # The producer's CF time units are truncated in some files. Validate
        # the scan against the independent nominal timestamp, not that offset.
        nominal=str(ds.nominal_product_time).replace(':',' ').split()
        if ds.source!='Meteosat' or len(nominal)<3 or nominal[0]!=scan.strftime('%Y-%m-%d') or int(nominal[1])!=scan.hour or int(nominal[2])!=scan.minute:
            raise ValueError('CTH metadata mismatch')
        lon=np.asarray(ds['lon'][:]);lat=np.asarray(ds['lat'][:]);opa=ds['opa'][:]
        if opa.shape!=(1,len(lat),len(lon)) or len(lat)*len(lon)>2000000 or not np.allclose(np.diff(lon),.03,atol=1e-5) or not np.allclose(np.diff(lat),.03,atol=1e-5):raise ValueError('Unexpected CTH grid')
        a=np.ma.filled(opa,-1)[0];valid=(a>=0)&(a<=100)
        if not np.any(valid):raise ValueError('Empty CTH cloud mask')
        return dict(schema=1,product='DWD-METEOSAT-CTH',generated=int(now.timestamp()),time=int(scan.timestamp()),grid=dict(west=round(float(lon[0]),2),south=round(float(lat[0]),2),step=.03,nx=len(lon),ny=len(lat)),cloud=base64.b64encode(np.where(valid,a,255).astype('u1').tobytes()).decode())

def get(url):
    with urllib.request.urlopen(url,timeout=40) as r:return r.read()

def main():
    now=dt.datetime.now(UTC)
    names=sorted(set(re.findall(r'CTHin\d{12}n?EU\.nc\.bz2',get(ROOT).decode())),reverse=True)
    for name in names[:8]:
        try:packet=decode(get(ROOT+name),name,now)
        except (OSError,ValueError,RuntimeError) as e:print(name,e,flush=True);continue
        out=Path('data');out.mkdir(exist_ok=True)
        with gzip.open(out/'satellite-cloud.json.gz','wt',compresslevel=5) as f:json.dump(packet,f,separators=(',',':'))
        print('Published',name,packet['grid'],flush=True);return
    raise RuntimeError('No fresh validated Meteosat cloud scan')

if __name__=='__main__':main()
