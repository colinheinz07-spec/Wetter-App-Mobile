"""Publish genuine DWD ODIM VRADH scans as ready-to-display per-site images.

Never combine radial velocities from different radars or infer rotation.
Missing/undetect gates and missing scan geometry are not fabricated.
"""
import base64
import concurrent.futures
import datetime as dt
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

import h5py
import numpy as np
from PIL import Image
from pyproj import Geod

ROOT = 'https://opendata.dwd.de/weather/radar/sites/sweep_pcp_v/'
SITES = 'asb boo drs eis ess fbg fld hnr isn mem neu nhb oft pro ros tur umd'.split()
GEOD = Geod(ellps='WGS84')
UTC = dt.timezone.utc
COLORS = np.array([[0, 69, 37], [0, 139, 73], [39, 195, 116], [150, 230, 174], [185, 195, 200], [255, 193, 163], [247, 113, 87], [214, 48, 60], [126, 16, 47]], dtype=np.uint8)


def string(value):
    return value.decode() if isinstance(value, bytes) else str(value)


def read_scan(raw, site, now=None, size=768):
    now = now or dt.datetime.now(UTC)
    with h5py.File(io.BytesIO(raw), 'r') as f:
        w = f['where'].attrs
        lon, lat = float(w['lon']), float(w['lat'])
        d = f['dataset1']; dw = d['where'].attrs; what = d['what'].attrs
        time = dt.datetime.strptime(string(what['startdate']) + string(what['starttime']), '%Y%m%d%H%M%S').replace(tzinfo=UTC)
        if not 0 <= (now-time).total_seconds() <= 1800:
            raise ValueError('Scan not current')
        groups = [v for k, v in d.items() if re.fullmatch(r'data\d+', k)]
        data = next(v for v in groups if string(v['what'].attrs['quantity']) == 'VRADH')
        q = data['what'].attrs; raw_values = data['data'][:]
        rays, bins = int(dw['nrays']), int(dw['nbins'])
        if raw_values.shape != (rays, bins):
            raise ValueError('Gate geometry mismatch')
        start, stop = (np.asarray(d['how'].attrs[k], dtype=float) for k in ('startazA', 'stopazA'))
        if start.shape != (rays,) or stop.shape != (rays,) or not np.isfinite(start).all() or not np.isfinite(stop).all():
            raise ValueError('Missing ray azimuths')
        widths = (stop-start) % 360
        if np.any((widths <= 0) | (widths > 10)):
            raise ValueError('Invalid ray widths')
        az = (start+widths/2) % 360
        gain, offset = float(q['gain']), float(q['offset'])
        if not np.isfinite([gain, offset]).all() or gain <= 0:
            raise ValueError('Invalid velocity encoding')
        velocity = raw_values.astype(float)*gain+offset
        valid = (raw_values != q['nodata']) & (raw_values != q['undetect'])
        rscale, rstart, elevation = float(dw['rscale']), float(dw['rstart'])*1000, float(dw['elangle'])
        if not np.isfinite([rscale,rstart,elevation]).all() or rscale<=0 or rstart<0 or not 0<=elevation<15:
            raise ValueError('Invalid sweep geometry')
        cos = np.cos(np.deg2rad(elevation))
        radius = min(200000, (rstart+bins*rscale)*cos)
        # Use geographic pixel centres and inverse geodesics. Ground range
        # approximates the low-elevation beam; no velocity extrapolation.
        west = lon-radius/(110000*np.cos(np.deg2rad(lat))); east = 2*lon-west
        south = lat-radius/110000; north = 2*lat-south
        xs = west+(np.arange(size)+.5)*(east-west)/size
        ys = north-(np.arange(size)+.5)*(north-south)/size
        xx, yy = np.meshgrid(xs, ys)
        a, _, r = GEOD.inv(np.full_like(xx,lon), np.full_like(yy,lat), xx, yy)
        a %= 360
        order = np.argsort(az); sorted_az = az[order]
        i = np.searchsorted(sorted_az, a); lo, hi = order[(i-1)%rays], order[i%rays]
        delta = lambda k: np.abs((a-az[k]+180)%360-180)
        ray = np.where(delta(lo)<=delta(hi),lo,hi)
        gate = np.floor((r/cos-rstart)/rscale).astype(int)
        safe = np.clip(gate,0,bins-1)
        keep = (r<=radius)&(gate>=0)&(gate<bins)&(delta(ray)<=widths[ray]/2+.05)&valid[ray,safe]
        values = velocity[ray,safe]
        rgba = np.zeros((size,size,4),dtype=np.uint8)
        rgba[:,:,:3] = COLORS[np.digitize(values,[-30,-20,-10,-2,2,10,20,30])]
        rgba[:,:,3] = np.where(keep,235,0)
        png = io.BytesIO(); Image.fromarray(rgba).save(png,format='PNG',optimize=True)
        time_str = time.isoformat().replace('+00:00','Z')
        return dict(schema=1,site=site,time=time_str,lon=lon,lat=lat,elevation=elevation,bounds=[west,south,east,north],png=base64.b64encode(png.getvalue()).decode(),source='DWD VRADH · '+site.upper())


def fetch_site(site):
    url = ROOT+site+'/hdf5/filter_polarimetric/'
    with urllib.request.urlopen(url,timeout=20) as response:
        html=response.read().decode()
    files = sorted(set(re.findall(r'href="(ras[^"/]*_vradh_00-\d{12}[^"/]*(?:-hd5|\.h5))"',html)),reverse=True)
    if not files:
        raise ValueError('No VRADH file in directory')
    for name in files[:2]:
        try:
            with urllib.request.urlopen(url+name,timeout=25) as response:
                return read_scan(response.read(),site)
        except Exception as exc:
            print(site,name,exc,file=sys.stderr)
    raise ValueError('No validated sweep')


def main(out):
    out.mkdir(parents=True,exist_ok=True)
    sites=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs={pool.submit(fetch_site,s):s for s in SITES}
        for job in concurrent.futures.as_completed(jobs):
            try:
                packet=job.result()
                file=packet['site']+'-'+packet['time'].replace(':','').replace('-','')+'.json'
                (out/file).write_text(json.dumps(packet,separators=(',',':')))
                sites.append({k:packet[k] for k in ('site','time','lon','lat','elevation','bounds','source')}|{'file':file})
            except Exception as exc:
                print(jobs[job],exc,file=sys.stderr)
    if not sites:
        raise SystemExit('No current verified Doppler scans; refusing to publish')
    (out/'index.json').write_text(json.dumps({'schema':1,'sites':sorted(sites,key=lambda s:s['site'])},separators=(',',':')))


if __name__=='__main__':
    main(Path(sys.argv[1]))
