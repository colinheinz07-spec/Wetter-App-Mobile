"""Build a rolling 25-hour GeoColour archive. Keep actual capture times only."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
import gzip
import runpy
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from xml.etree import ElementTree

from PIL import Image

ROOT = 'https://view.eumetsat.int/geoserver/mtg_fd/wms'
BOUNDS = [1, 44, 19, 58]
STEP = 600


def epoch(value):
    return int(datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp())


def request(params):
    url = ROOT + '?' + urllib.parse.urlencode(params)
    return urllib.request.urlopen(url, timeout=40)


def latest_capture():
    with request(dict(service='WMS', version='1.3.0', request='GetCapabilities')) as res:
        tree = ElementTree.parse(res)
    for layer in tree.findall('.//{*}Layer'):
        if (layer.findtext('{*}Name') or '').split(':')[-1] == 'rgb_geocolour':
            for dim in layer.findall('{*}Dimension'):
                if dim.get('name') == 'time':
                    return epoch(dim.get('default'))
    raise ValueError('Missing GeoColour observation clock')


def download(dest, stamp):
    target = dest / f'{stamp}.jpg'
    if target.exists():
        return stamp
    time = datetime.fromtimestamp(stamp, timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    try:
        with request(dict(service='WMS', version='1.1.1', request='GetMap', layers='rgb_geocolour',
                          styles='', srs='EPSG:4326', bbox=','.join(map(str, BOUNDS)), width=900,
                          height=700, format='image/png', transparent='true', time=time)) as res:
            warning = ' '.join(res.headers.get_all('Warning', []))
            actual = re.search(r'nearest value used: time=([\dT:.Z-]+)', warning, re.I)
            if ('nearest' in warning.lower() and not actual) or (actual and epoch(actual[1]) != stamp):
                return None
            image = Image.open(BytesIO(res.read())).convert('RGBA')
        if image.size != (900, 700) or image.getchannel('A').getextrema() != (255, 255):
            return None
        image.convert('RGB').save(target.with_suffix('.tmp'), format='JPEG', quality=88)
        os.replace(target.with_suffix('.tmp'), target)
        return stamp
    except Exception as exc:
        print(time, str(exc)[:160], flush=True)
        return None


RADAR_ROOT = 'https://opendata.dwd.de/weather/radar/radolan/ry/'
decode_radar = runpy.run_path(str(Path(__file__).with_name('ingest-radar-points.py')))['decode']


def radar_download(dest, stamp):
    target = dest / f'{stamp}.json.gz'
    if target.exists():
        return stamp
    date = datetime.fromtimestamp(stamp, timezone.utc)
    url = RADAR_ROOT + date.strftime('raa01-ry_10000-%y%m%d%H%M-dwd---bin.hdf5')
    try:
        with urllib.request.urlopen(url, timeout=35) as res:
            packet = decode_radar(res.read(), date)
        if epoch(packet['time']) != stamp:
            return None
        temp = target.with_suffix('.tmp')
        with gzip.open(temp, 'wt', compresslevel=3) as out:
            json.dump(packet, out, separators=(',', ':'))
        os.replace(temp, target)
        return stamp
    except Exception as exc:
        print('RY', date, str(exc)[:160], flush=True)
        return None


def main(dest):
    now = int(datetime.now(timezone.utc).timestamp())
    dest.mkdir(exist_ok=True, parents=True)
    # Satellite and radar clocks are independent. A delayed satellite image
    # must never prevent a new radar observation from entering the archive.
    try:
        latest = latest_capture()
        if not now - 3600 <= latest <= now or latest % STEP:
            raise ValueError('No fresh aligned GeoColour capture')
        stamps = list(range(latest, latest - 25 * 3600 - 1, -STEP))
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda t: download(dest, t), stamps))
    except Exception as exc:
        print('Satellite update delayed:', str(exc)[:160], flush=True)
    radar_step = 300
    latest_radar = (now // radar_step) * radar_step - radar_step
    # Backfill recent missing five-minute frames gradually, keeping each job bounded.
    radar_stamps = list(range(latest_radar, latest_radar - 25 * 3600 - 1, -radar_step))
    missing = [t for t in radar_stamps if not (dest / f'{t}.json.gz').exists()]
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(lambda t: radar_download(dest, t), missing[:24]))
    cutoff = now - 25 * 3600
    def retained(pattern, suffix, step):
        stamps = []
        for path in dest.glob(pattern):
            name = path.name.removesuffix(suffix)
            if not name.isdigit():
                continue
            stamp = int(name)
            if stamp < cutoff or stamp > now or stamp % step:
                path.unlink()
            else:
                stamps.append(stamp)
        return sorted(stamps)
    frames = retained('*.jpg', '.jpg', STEP)
    radar = retained('*.json.gz', '.json.gz', radar_step)
    if not frames and not radar:
        raise ValueError('Neither radar nor satellite archive has valid data')
    (dest / 'index.json').write_text(json.dumps(dict(schema=1, bounds=BOUNDS, frames=frames, radar=radar)))
    print(len(frames), 'verified images;', len(radar), 'verified radar scans', flush=True)


if __name__ == '__main__':
    main(Path(sys.argv[1]))
