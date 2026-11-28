'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('assets/app.js','utf8');
const begin=source.indexOf('function snowReferenceLevel('),end=source.indexOf('async function fetchHourlyModel(',begin);
assert.ok(begin>=0&&end>begin,'local hazard orchestration exists');
const hour=3600000,now=Date.parse('2026-11-23T20:00:00Z'),point=[7.85,50.55];
let fog={state:'risk',time:now-10*60000,visibility:NaN,source:'ICON-D2-RUC · Taupunkt nahe Temperatur und schwacher Wind'};
const ctx=vm.createContext({
 HOUR_MS:hour,Math,Number,Date,
 WeatherObservation:{fogAt:()=>fog,fogPotential:()=>false},
 liveLocalWeather:()=>({temp2:{kind:'missing',value:NaN}}),
 pointRadarAt:()=>null,resolveLivePhase:()=>null,
 modelAgeLimit:()=>24,
 frameVal:(f,id)=>f?.values?.[id]??NaN,frameHumidity:f=>f?.values?.rh2??NaN,
 frostModelSignals:()=>[],convectionModels:()=>[],
 forecastPriority:[],shortRainLimits:{},longRainLimits:{},
 warningLevel:(value,limits)=>Number.isFinite(value)?limits.reduce((l,x,i)=>value>=x?i+1:l,0):0,
 periodNewSnowBounds:p=>p.snowBounds??null,
 newSnowInterval:()=>NaN,
 hourlySnowBoundsWindow:(hours,start,end)=>hours?.length?hours[0]?.snowBounds??null:null,
 snowfallText:r=>r.join('–')+' cm',
 temperatureText:t=>String(t),
 frameWeather:()=>({icon:'11_regen_1'}),
 pointRadarAt:()=>null,resolveLivePhase:()=>null
});
vm.runInContext(source.slice(begin,end),ctx);
const run=()=>vm.runInContext('localWarnings(days,now,400,point)',ctx);
ctx.now=now;ctx.point=point;ctx.days=[{periods:[]}];
let warnings=run();
assert.ok(warnings.some(w=>w.type==='Nebelpotenzial'&&w.level===1&&w.state==='risk'));
assert.ok(warnings.find(w=>w.type==='Nebelpotenzial').note.includes('keine gesicherte Sichtweite'));
fog={state:'observed',time:now-5*60000,visibility:40,source:'DWD SYNOP · Sichtmessung'};
warnings=run();
assert.ok(warnings.some(w=>w.type==='Nebel'&&w.level===3&&w.value===40));
assert.ok(!warnings.some(w=>w.type==='Nebelpotenzial'));
fog=null;
const f={d:{model:'ICON-D2',run:new Date(now-2*hour).toISOString()},values:{temp2:2,tground:-2,rh2:97,ww:61,ptype:1,wind:3,dew:1.9}};
const interval={start:now,end:now+3*hour,hours:3,amount:.5,frame:f};
const snowPeriod={start:now+3*hour,end:now+9*hour,duration:6,nativeIntervals:[],snowBounds:[1,5],weather:{icon:'20_schnee_1'},model:'ICON-D2'};
const rainOnly={start:now+9*hour,end:now+15*hour,duration:6,nativeIntervals:[],snowBounds:[0,8],weather:{icon:'11_regen_1'},model:'ICON-D2'};
ctx.days=[{periods:[{start:now,end:now+3*hour,duration:3,nativeIntervals:[interval],weather:{icon:'11_regen_1'}},snowPeriod,rainOnly]}];
warnings=run();
const ice=warnings.find(w=>w.type==='Glättepotenzial');
assert.ok(ice&&ice.state==='risk'&&ice.note.includes('Überfrierende Nässe möglich'));
const snow=warnings.find(w=>w.type==='Schneefall');
assert.ok(snow&&snow.range[0]===1&&snow.range[1]===5&&snow.note.includes('1–5 cm'));
assert.equal(warnings.filter(w=>w.type==='Schneefall').length,1,'rain uncertainty must never produce a snow warning');
snowPeriod.snowBounds=[0,0];
warnings=run();
const trace=warnings.find(w=>w.type==='Schneefall');
assert.ok(trace&&!trace.range&&trace.note.includes('keinen belastbar quantifizierbaren Neuschnee'));
console.log('PASS: local fog potential/observed visibility, freezing wet road risk, snowfall range and zero-centimeter trace');

assert.deepEqual(Array.from(vm.runInContext('[0,-0.1,-9.9,-10,-20,-20.1,NaN].map(frostLevel)',ctx)),[0,1,1,2,2,3,0]);

assert.equal(vm.runInContext('snowReferenceLevel(20,5,300)',ctx),3);
