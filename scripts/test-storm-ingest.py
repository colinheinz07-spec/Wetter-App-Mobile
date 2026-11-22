import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('storm',Path(__file__).with_name('ingest-storm-tracks.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
TIME='2026-11-22T17:20:00Z'; T=m.epoch(TIME)
XML=f'''<konrad3d><head><metadata><reference_time>{TIME}</reference_time></metadata><data><radar><available_sweeps><elevations site="ess"/></available_sweeps></radar></data></head><cells reference_time="{TIME}"><feature identifier="7"><metadata><code>test-7</code></metadata><geometry><covered_area>9</covered_area><centroid_3d><geodetic_coordinate><latitude>50</latitude><longitude>8</longitude></geodetic_coordinate></centroid_3d><polygons_projected><geodetic_coordinates><polygon><latitudes>49.98 49.98 50.02</latitudes><longitudes>7.98 8.02 8.02</longitudes></polygon></geodetic_coordinates></polygons_projected></geometry><intensity><max_value>55</max_value><heavy_rain_potential>20</heavy_rain_potential><heavy_rain_potential_accumulation_time>30</heavy_rain_potential_accumulation_time><gust_flag>-1000000000</gust_flag><hail_flag>2</hail_flag></intensity><lightning><lightning_rate>5</lightning_rate></lightning><tracking><cell_speed>35</cell_speed></tracking><forecast><centroid_forecasts><centroid_forecast forecast_time="2026-11-22T17:35:00Z"><geodetic_coordinate><latitude>50.1</latitude><longitude>8.15</longitude></geodetic_coordinate><uncertainty_ellipse><major_axis>3</major_axis><minor_axis>1</minor_axis><angle>45</angle></uncertainty_ellipse></centroid_forecast></centroid_forecasts></forecast></feature></cells></konrad3d>'''

class TestStorms(unittest.TestCase):
    def test_fields(self):
        d=m.parse_storms(XML,T+300); c=d['cells'][0]
        self.assertEqual(c['id'],'test-7');self.assertEqual(c['point'],[8,50]);self.assertEqual(c['gustFlag'],None)
        self.assertEqual(c['rainMm'],20);self.assertEqual(c['rainMinutes'],30);self.assertEqual(c['lightning'],5)
        self.assertEqual(c['path'][0]['ellipse'],[3,1,45]);self.assertEqual(c['path'][0]['time'],T+900)
        self.assertEqual(d['radarSites'],1)
    def test_stale_and_empty(self):
        with self.assertRaises(ValueError):m.parse_storms(XML,T+1201)
        empty=f'<konrad3d><head><metadata><reference_time>{TIME}</reference_time></metadata></head><cells reference_time="{TIME}"/></konrad3d>'
        self.assertEqual(m.parse_storms(empty,T+300)['cells'],[])
    def test_warning_integrity(self):
        with self.assertRaises(ValueError):m.parse_alerts({'type':'FeatureCollection','numberMatched':2,'features':[]},T)

if __name__=='__main__': unittest.main()
