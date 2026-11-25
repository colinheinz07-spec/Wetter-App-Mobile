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
    latest = latest_capture()
    now = int(datetime.now(timezone.utc).timestamp())
    if not now - 3600 <= latest <= now or latest % STEP:
        raise ValueError('No fresh aligned GeoColour capture')
    dest.mkdir(exist_ok=True, parents=True)
    stamps = list(range(latest, latest - 25 * 3600 - 1, -STEP))
    with ThreadPoolExecutor(max_workers=4) as pool:
        frames = sorted(t for t in pool.map(lambda t: download(dest, t), stamps) if t is not None)
    if not frames or frames[-1] < latest - 1800:
        raise ValueError('No recent verified image')
    with ThreadPoolExecutor(max_workers=2) as pool:
        radar = sorted(t for t in pool.map(lambda t: radar_download(dest, t), stamps) if t is not None)
    for path in dest.glob('*.json.gz'):
        if path.name.split('.')[0].isdigit() and int(path.name.split('.')[0]) not in radar:
            path.unlink()
    for path in dest.glob('*.jpg'):
        if path.stem.isdigit() and int(path.stem) not in frames:
            path.unlink()
    (dest / 'index.json').write_text(json.dumps(dict(schema=1, bounds=BOUNDS, frames=frames, radar=radar)))
    print(len(frames), 'verified images', flush=True)


if __name__ == '__main__':
    main(Path(sys.argv[1]))
