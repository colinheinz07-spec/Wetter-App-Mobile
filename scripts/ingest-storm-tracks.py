"""Publish independent, timestamped DWD KONRAD3D and official warning snapshots."""
import datetime as dt
import json
import math
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

RADAR = 'https://opendata.dwd.de/weather/radar/konrad3d/'
WFS = ('https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=2.0.0'
       '&request=GetFeature&typeNames=dwd:Warnungen_Gemeinden_vereinigt'
       '&outputFormat=application/json&srsName=EPSG:4326')

def epoch(value):
    try:
        return int(dt.datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp())
    except (AttributeError, TypeError, ValueError):
        return None

def num(node, path):
    try:
        x = float(node.findtext(path))
        return x if math.isfinite(x) and x > -1e8 else None
    except (TypeError, ValueError):
        return None

def position(node, prefix='geodetic_coordinate/'):
    lon, lat = num(node, prefix+'longitude'), num(node, prefix+'latitude')
    return [lon, lat] if lon is not None and lat is not None and -180 <= lon <= 180 and -90 <= lat <= 90 else None

def ellipse(node):
    return [num(node, 'uncertainty_ellipse/'+k) for k in ('major_axis','minor_axis','angle')]

def parse_storms(xml, now):
    root = ET.fromstring(xml)
    if root.tag != 'konrad3d':
        raise ValueError('unexpected radar product')
    t = epoch(root.findtext('head/metadata/reference_time'))
    cells = root.find('cells')
    if t is None or not -60 <= now-t <= 1200 or cells is None or epoch(cells.get('reference_time')) != t:
        raise ValueError('missing/stale radar analysis')
    out = []
    for f in cells.findall('feature'):
        center = position(f, 'geometry/centroid_3d/geodetic_coordinate/')
        code = f.findtext('metadata/code') or f.get('identifier')
        if not center or not code:
            raise ValueError('cell lacks geographic identity')
        rings = []
        for p in f.findall('geometry/polygons_projected/geodetic_coordinates/polygon'):
            try:
                lats = list(map(float, p.findtext('latitudes','').split()))
                lons = list(map(float, p.findtext('longitudes','').split()))
                if len(lats) == len(lons) and len(lats) >= 3 and all(-90 <= y <= 90 and -180 <= x <= 180 for x,y in zip(lons,lats)):
                    rings.append(list(zip(lons,lats)))
            except ValueError:
                pass
        path = []
        for fc in f.findall('forecast/centroid_forecasts/centroid_forecast'):
            p, ft = position(fc), epoch(fc.get('forecast_time'))
            if p and ft and t < ft <= t+3600:
                path.append(dict(time=ft, point=p, ellipse=ellipse(fc)))
        path.sort(key=lambda p:p['time'])
        fields = dict(areaKm2='geometry/covered_area', echoTopM='geometry/echo_top_msl', dbz='intensity/max_value',
                      rainMm='intensity/heavy_rain_potential', rainMinutes='intensity/heavy_rain_potential_accumulation_time',
                      gustKmh='intensity/maximum_estimated_wind_gust', hailFlag='intensity/hail_flag', rainFlag='intensity/heavy_rain_flag',
                      gustFlag='intensity/gust_flag', hailArea='hymec/area_hail_total', largeHailArea='hymec/area_large_hail',
                      lightning='lightning/lightning_rate', speedKmh='tracking/cell_speed', trend='intensity/trends/severity_trend_category')
        out.append(dict(id=code, point=center, polygons=rings, path=path, firstSeen=epoch(f.findtext('tracking/reference_time_first_detection')),
                        **{k:num(f,v) for k,v in fields.items()}))
    return dict(schema=1, generated=now, observed=t, source='DWD KONRAD3D', cells=out,
                radarSites=len(root.findall('head/data/radar/available_sweeps/elevations')),
                missingRadarSites=[n.get('site') for n in root.findall('head/data/radar/missing_sweeps/elevations')])

def parse_alerts(doc, now):
    if doc.get('type') != 'FeatureCollection' or not isinstance(doc.get('features'), list):
        raise ValueError('Invalid official warning data')
    if isinstance(doc.get('numberMatched'),int) and doc['numberMatched'] > len(doc['features']):
        raise ValueError('Incomplete DWD WFS response')
    out = []
    for f in doc['features']:
        p, g = f.get('properties') or {}, f.get('geometry') or {}
        if p.get('STATUS') != 'Actual' or p.get('MSGTYPE') not in ('Alert','Update') or p.get('SCOPE') != 'Public':
            continue
        start, end, sent = epoch(p.get('ONSET') or p.get('EFFECTIVE')), epoch(p.get('EXPIRES')), epoch(p.get('SENT'))
        if None in (start,end,sent) or end <= max(now,start) or sent > now+300:
            continue
        polygons = g.get('coordinates') if g.get('type')=='MultiPolygon' else [g.get('coordinates')] if g.get('type')=='Polygon' else []
        if not polygons or not all(poly and all(len(r)>=4 and all(len(c)>=2 and 4<=c[0]<=17 and 46<=c[1]<=56 for c in r) for r in poly) for poly in polygons):
            continue
        out.append(dict(id=p.get('IDENTIFIER') or f.get('id'), start=start, end=end, sent=sent,
                        level={'Minor':1,'Moderate':2,'Severe':3,'Extreme':4}.get(p.get('SEVERITY'),0),
                        possible=p.get('CERTAINTY') in ('Possible','Unknown','Unlikely') or 'VORAB' in (p.get('HEADLINE') or '').upper(),
                        certainty=p.get('CERTAINTY'),event=p.get('EVENT'),headline=p.get('HEADLINE'),description=p.get('DESCRIPTION'),
                        instruction=p.get('INSTRUCTION'),altitude=p.get('ALTITUDE'),ceiling=p.get('CEILING'),polygons=polygons))
    return dict(schema=1,generated=now,source='DWD WFS',alerts=out)

def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':'WetterApp-Mobile/1.0','Cache-Control':'no-cache'})
    with urllib.request.urlopen(req,timeout=40) as response:
        return response.read()

def main():
    output=Path(sys.argv[1]); output.mkdir(parents=True,exist_ok=True)
    now=int(dt.datetime.now(dt.timezone.utc).timestamp())
    def storms():
        names=sorted(set(re.findall(r'KONRAD3D_\d{8}T\d{6}\.xml',get(RADAR).decode())))
        if not names: raise ValueError('No KONRAD3D files')
        return parse_storms(get(RADAR+names[-1]),now)
    successes=0
    for name, fn in [('storm-tracks.json',storms),('official-alerts.json',lambda:parse_alerts(json.loads(get(WFS)),now))]:
        try:
            data=fn(); target=output/name
            target.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False),encoding='utf8')
            successes+=1; print(name,len(data.get('cells',data.get('alerts',[]))))
        except Exception as e:
            print(f'::warning::{name}: {e}',file=sys.stderr)
    if not successes: raise SystemExit(1)

if __name__=='__main__': main()
