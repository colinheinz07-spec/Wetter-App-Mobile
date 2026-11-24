"""SYNOP code-table text, units and observation-time regression checks."""
import datetime as dt
import runpy
from pathlib import Path

api=runpy.run_path(str(Path(__file__).with_name('ingest-observed-surface.py')))
phase=api['phase']
for text,expected in [
    ('RAIN_NOT_FREEZING',3),('DRIZZLE_NOT_FREEZING',2),
    ('FREEZING_RAIN',5),('FREEZING_DRIZZLE',4),
    ('HEAVY_SNOW',7),('RAIN_AND_SNOW',6),('SNOW_PELLETS',8),('ICE_PELLETS',11),
    ('RAIN_IN_THE_PRECEDING_HOUR',None),('SNOW_NOT_AT_TIME_OF_OBSERVATION',None),
    ('RAIN_IN_THE_PAST_HOUR',None),('SNOW_IN_THE_VICINITY',None),
    ('NO_SIGNIFICANT_WEATHER',None),('UNKNOWN',None),
]:
    assert phase(text)==expected,(text,phase(text),expected)

now=int(dt.datetime(2026,11,24,20,40,tzinfo=dt.timezone.utc).timestamp())
values={'year':2026,'month':11,'day':24,'hour':20,'minute':30,
        'stationOrSiteName':'Teststation','wigosLocalIdentifierCharacter':'test-id',
        'presentWeather':'HEAVY_SNOW','airTemperature':272.15,
        'dewpointTemperature':270.15,'windSpeed':5,'horizontalVisibility':80}
units={'airTemperature':'K','dewpointTemperature':'K','windSpeed':'m/s','horizontalVisibility':'m'}
feature={'geometry':{'coordinates':[10.27,47.4,806]},'properties':{
    key:{'shortname':key,'value':value,'unit':units.get(key,'')} for key,value in values.items()
}}
doc={'features':[feature]}
row=api['decode'](doc,now)[0]
assert row['values']['temp2']==-1 and row['values']['wind']==18
assert row['values']['phase']==7 and row['values']['strong']==1
assert row['values']['visibility']==80
feature['properties']['presentWeather']['value']='RAIN_NOT_FREEZING'
assert api['decode'](doc,now)[0]['values']['phase']==3
feature['properties']['presentWeather']['value']='SNOW_NOT_AT_TIME_OF_OBSERVATION'
assert 'phase' not in api['decode'](doc,now)[0]['values']
feature['properties']['airTemperature']['value']=True
assert 'temp2' not in api['decode'](doc,now)[0]['values']
feature['properties']['hour']['value']=23
assert api['decode'](doc,now)==[]
print('PASS: SYNOP present/past/negated precipitation, snow pellets, ice pellets, physical units and future rejection')
