"""DWD HymecNG surface precipitation type, analysis only (lead 0).

Read the class legend from the ODIM HDF5 product instead of guessing codes.
Publish a compact categorical grid; no interpolation or amount estimation.
"""
import base64
import datetime as dt
import gzip
import io
import json
import urllib.request
from pathlib import Path

import h5py
import numpy as np
from pyproj import CRS, Transformer

URL = 'https://opendata.dwd.de/weather/radar/composite/hymecng/composite_HymecNG_LATEST_000-hd5'
GRID = dict(west=2., south=45., step=.01, nx=1601, ny=1201, missing=255)
CLASSES = ('NO_PRECIPITATION', 'NOT_CLASSIFIED', 'DRIZZLE', 'RAIN',
           'FREEZING_DRIZZLE', 'FREEZING_RAIN', 'SNOW_RAIN', 'SNOW',
           'GRAUPEL', 'HAIL', 'LARGE_HAIL')

def string(value):
    return value.decode('ascii').strip('\x00 ') if isinstance(value, bytes) else str(value).strip('\x00 ')

def stamp(attrs, prefix=''):
    return dt.datetime.strptime(string(attrs[prefix+'date'])+string(attrs[prefix+'time']), '%Y%m%d%H%M%S').replace(tzinfo=dt.timezone.utc)

def decode(blob, now):
    with h5py.File(io.BytesIO(blob), 'r') as h:
        where = h['where'].attrs
        d = h['dataset1']; what = d['what'].attrs
        time = stamp(what, 'end')
        if string(what['prodname']) != 'HymecNG_top_view' or time != stamp(what, 'start') or time != stamp(h['what'].attrs):
            raise ValueError('Not a HymecNG surface analysis')
        if not now-dt.timedelta(minutes=25) <= time <= now:
            raise ValueError(f'Invalid scan time {time}')
        item = d['data1']; meta = item['what'].attrs; raw = item['data'][...]
        if string(meta['quantity']) != 'CLASS' or float(meta['gain']) != 1 or float(meta['offset']) != 0:
            raise ValueError('Unexpected class encoding')
        legend = {string(row['key']): int(string(row['value'])) for row in item['legend'][...]}
        if not set(CLASSES) <= legend.keys() or len(set(legend.values())) != len(legend):
            raise ValueError('Unexpected HymecNG class legend')
        if raw.dtype != np.uint8 or raw.shape != (int(where['ysize']), int(where['xsize'])):
            raise ValueError('Unexpected class grid')
        native = np.full(raw.shape, 255, dtype=np.uint8)
        for code, name in enumerate(CLASSES):
            native[raw == legend[name]] = code
        # Undetect and nodata are not equivalent to an explicit dry class.
        native[(raw == meta['nodata']) | (raw == meta['undetect'])] = 255
        crs = CRS.from_user_input(string(where['projdef']))
        project = Transformer.from_crs('EPSG:4326', crs, always_xy=True)
        dx, dy = float(where['xscale'])/crs.axis_info[0].unit_conversion_factor, float(where['yscale'])/crs.axis_info[1].unit_conversion_factor
        west, south = project.transform(float(where['LL_lon']), float(where['LL_lat']))
        east, north = west+raw.shape[1]*dx, south+raw.shape[0]*dy
        ex, ey = project.transform(float(where['UR_lon']), float(where['UR_lat']))
        if abs(ex-east)>dx or abs(ey-north)>dy:
            raise ValueError('HymecNG corner mismatch')
        x, y = np.meshgrid(GRID['west']+np.arange(GRID['nx'])*GRID['step'], GRID['south']+np.arange(GRID['ny'])*GRID['step'])
        sx, sy = project.transform(x, y)
        ix, iy = np.floor((sx-west)/dx).astype(int), np.floor((north-sy)/dy).astype(int)
        valid = (ix>=0)&(ix<raw.shape[1])&(iy>=0)&(iy<raw.shape[0])
        values = np.full(ix.shape, 255, dtype=np.uint8)
        values[valid] = native[iy[valid], ix[valid]]
        if not np.any(values != 255):
            raise ValueError('Empty class grid')
        return dict(schema=1, product='HymecNG', source='DWD Open Data · HymecNG (2 m AGL)', time=time.isoformat(), grid=GRID, classes=base64.b64encode(values.tobytes()).decode('ascii'))

def main():
    request = urllib.request.Request(URL, headers={'User-Agent':'WetterApp/1.0'})
    with urllib.request.urlopen(request, timeout=25) as response:
        payload = decode(response.read(), dt.datetime.now(dt.timezone.utc))
    path = Path('data/radar-phase.json.gz'); path.parent.mkdir(exist_ok=True); tmp = path.with_suffix('.tmp')
    with tmp.open('wb') as file:
        with gzip.GzipFile(filename='', fileobj=file, mode='wb', mtime=0) as z:
            z.write(json.dumps(payload, separators=(',', ':')).encode())
    tmp.replace(path)
    print(f'HymecNG scan {payload["time"]}: {path.stat().st_size} bytes', flush=True)

if __name__ == '__main__':
    main()
