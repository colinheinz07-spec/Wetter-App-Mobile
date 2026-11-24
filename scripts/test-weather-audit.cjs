'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/app.js','utf8');
const chunk=(a,b)=>{const start=source.indexOf(a),end=source.indexOf(b,start);assert.ok(start>=0&&end>start,a);return source.slice(start,end);};
const hour=3600000,now=Date.parse('2026-11-24T20:40:00Z');
class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}

// The home wind preview and the full-size current map must read the available
// mean-wind analysis. A gust forecast is a separate parameter and data source.
{
 const field={time:now-30*60000,kind:'analysis',source:'RUC +0 h',stale:false};
 const requested=[],labels={};
 const context=vm.createContext({Date:Clock,Math,Number,Map,Set,HOUR_MS:hour,
  WeatherObservation:{mapField:id=>['wind','temp2'].includes(id)?field:null,mapValue:()=>12},
  currentLiveImage:()=>null,realLiveTime:()=>new Clock(),radarBaseTime:()=>now-5*60000,
  nowcastLayers:new Set(['radar','types','snowfall']),imageLayers:new Set(),solarLayers:new Set(),
  liveHourlyMode:()=>true,realStationOverlay:()=>false,validStationRows:()=>[],
  currentGridFrame:()=>null,chooseLocationModel:()=>null,
  frameVal:(_f,id)=>({temp2:4,wind:12,gust:58,winddir:240})[id]??NaN,
  modelRuns:()=>[],mapModelRuns:()=>[],fetchNativeMapModel:()=>{},
  homeMapLayers:[['radar'],['temperature'],['wind']],previewBounds:()=>({}),
  renderOwnHomeRadar:()=>{},drawLiveBase:()=>{},drawHomeMapOutline:()=>{},
  drawObservedField:(_ctx,_bounds,id)=>{requested.push(id);return true;},
  displayValue:String,localTime:()=> '20:00',
  el:id=>labels[id]||(labels[id]={getContext:()=>({}),textContent:''})
 });
 vm.runInContext(`let liveLayer='wind',liveTempDay=0,liveTempHour=20,liveMinute=0,mapRegion='Deutschland',mapCenter=null;const forecastPriority=['ICON-D2'],coreForecastModels=forecastPriority;`+
  chunk('const liveAreaIds=','// One geographically fixed radar frame')+
  chunk('function renderRealHomeMaps(','// Geographic borders:'),context);
 const get=s=>vm.runInContext(s,context);
 assert.equal(get('liveAreaIds.wind'),'wind');assert.equal(get('liveAreaIds.gust'),'gust');
 assert.equal(get('realLiveInfo().observedGrid.kind'),'analysis');
 assert.equal(get('realLiveInfo().available'),true);
 assert.equal(get("realLiveSample(8,50,Date.now(),{d:{}}).wind"),12);
 assert.equal(get("realLiveSample(8,50,Date.now(),{d:{}}).gust"),58);
 get("liveLayer='gust';nativeAreaFrame=()=>({d:{model:'ICON-D2',frames:{0:{gust:true}}},hour:0,time:Date.now()});");
 assert.equal(get('realLiveInfo().kind'),'Modellprognose');
 assert.equal(get('realLiveInfo().observedGrid'),undefined);
 get('renderRealHomeMaps([8,50])');
 assert.deepEqual(requested,['temp2','wind']);
 assert.match(labels['home-value-wind'].textContent,/12 km\/h/);
 console.log('PASS: wind preview and current map use mean wind; gusts retain their separate forecast.');
}

// A failed radar request must not erase a valid cloud analysis. Its symbol
// describes the observed/analysed sky while precipitation remains unconfirmed.
{
 const context=vm.createContext({Number,Math,Date:Clock,liveAge:90*60000,
  WeatherObservation:{fogAt:()=>null},observationHeight:()=>400,
  isNightAt:()=>true,localTime:()=> '20:30',now
 });
 vm.runInContext(chunk('function cloudWeather(','function modelSnowFraction(')+chunk('function currentFogWeather(','function liveEscape('),context);
 context.live={cloud:{value:99,kind:'observation',time:now-20*60000,source:'SYNOP'}};
 const get=s=>vm.runInContext(s,context);
 assert.equal(get('livePhaseWeather(null,null,null,[8,50],now,live).icon'),'10_nachts_bedeckt');
 assert.match(get('livePhaseWeather(null,null,null,[8,50],now,live).condition'),/Niederschlag nicht bestätigt/);
 assert.equal(get('livePhaseWeather(null,null,null,[8,50],now,{cloud:{...live.cloud,kind:"model"}}).icon'),null);
 assert.equal(get('livePhaseWeather(null,null,null,[8,50],now,{cloud:{...live.cloud,time:now-2*3600000}}).icon'),null);
 assert.equal(get('livePhaseWeather(null,null,null,[8,50],now,{cloud:{...live.cloud,time:now+60000}}).icon'),null);
 console.log('PASS: valid cloud symbols survive a radar outage; future, stale and forecast clouds are excluded.');
}

// Current wind/dewpoint/cloud updates must refresh the same hour as the hero,
// even when the temperature itself has not changed.
{
 const line=source.match(/^const currentHourSignature=.*$/m)?.[0];assert.ok(line);
 const signature=vm.runInNewContext(line+'\ncurrentHourSignature');
 const sample={start:now,temperature:{value:2,kind:'analysis',time:now,source:'RUC'},weather:{icon:'06_bedeckt',condition:'Bedeckt',source:'RUC'},rate:0,live:{wind:{value:5,kind:'analysis',time:now,source:'RUC'}}};
 assert.notEqual(signature(sample),signature({...sample,live:{wind:{...sample.live.wind,value:18}}}));
 assert.equal(signature(sample),signature({...sample,live:{wind:{...sample.live.wind}}}));
 console.log('PASS: current-hour refresh tracks wind and other live fields as well as temperature.');
}

// Real hourly ICON point tiles may omit WW while publishing snowfall water
// equivalents. The icon must agree with those amounts without using snow cover
// or a cold 2-m temperature as a substitute for precipitation phase.
{
 const read=(f,id)=>{
  if(!f?.d)return NaN;
  const values=f.d.rows[f.hour]||{};
  if(id==='rainrate'){const previous=f.d.hours.filter(h=>h<f.hour).at(-1);return previous==null?NaN:(values.rainTotal-f.d.rows[previous].rainTotal)/(f.hour-previous);}
  return values[id]??NaN;
 };
 const context=vm.createContext({Number,Math,Date:Clock,frameVal:read,fogCondition:()=>null,isNightAt:()=>false,localTime:()=> '12'});
 vm.runInContext(chunk('function cloudWeather(','const HOUR_MS='),context);
 const get=s=>vm.runInContext(s,context);
 context.model={model:'ICON-D2',run:'2026-11-24T18:00:00Z',hours:[0,1,2],rows:{
  0:{rainTotal:10,snowGspTotal:4,snowConTotal:0},
  1:{rainTotal:11,snowGspTotal:5,snowConTotal:0,temp2:-1,cloud:100},
  2:{rainTotal:12,snowGspTotal:5.2,snowConTotal:0,temp2:1,cloud:100}
 }};
 get('const f={d:model,hour:1,time:Date.now(),point:[10,48]}');
 assert.equal(get('modelSnowFraction(f)'),1);
 assert.equal(get('frameWeather(f).condition'),'Schneefall');
 assert.match(get('forecastIcon([{frame:f,amount:1,hours:1}],1,1,100).icon'),/schnee/);
 assert.match(get('frameWeather({...f,hour:2}).icon'),/schneeregen/);
 get('model.rows[1].ww=61');
 assert.equal(get('frameWeather(f).condition'),'Leichter Regen','explicit model WW retains priority');
 get('delete model.rows[1].ww;model.rows[1].snowGspTotal=NaN;model.rows[1].snowdepth=80;model.rows[1].temp2=-8');
 assert.ok(Number.isNaN(get('modelSnowFraction(f)')));
 assert.match(get('frameWeather(f).condition'),/Art nicht bestimmt/);
 get('model.rows[1].rainTotal=9;model.rows[1].snowGspTotal=5');
 assert.ok(Number.isNaN(get('modelSnowFraction(f)')),'a reset/crossed accumulation is not fresh snow');
 get('model.rows[1].rainTotal=10.05;model.rows[1].snowGspTotal=4.05');
 assert.match(get('forecastIcon(Array.from({length:6},()=>({frame:f,amount:.05,hours:1})),.3,6,100).icon'),/schnee/,'weak hourly snow still contributes to the six-hour icon');
 assert.ok(Number.isNaN(get('modelSnowFraction({...f,interpolated:true})')));
 console.log('PASS: snowfall amounts drive missing-WW icons; explicit phases, missing data and accumulation resets remain distinct.');
}
