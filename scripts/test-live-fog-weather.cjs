'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('assets/app.js','utf8');
const a=source.indexOf('function currentFogWeather('),b=source.indexOf('function liveEscape(',a);
assert.ok(a>=0&&b>a,'live fog logic must exist');
const now=Date.parse('2026-11-23T19:00:00Z'),point=[7.85,50.55],live={cloud:{value:5,source:'Cloud analysis'}};
const ctx=vm.createContext({
 WeatherObservation:{fogAt:()=>null},
 observationHeight:()=>420,isNightAt:()=>true,cloudWeather:()=>({icon:'63_heiter_nacht',condition:'Heiter'}),
 localTime:()=> '20:00',Number,Math
});
const api=vm.runInContext(source.slice(a,b)+'\n({currentCloudWeather,livePhaseWeather,currentFogWeather})',ctx);
ctx.WeatherObservation.fogAt=()=>({state:'observed',time:now-5*60000,visibility:40,source:'DWD SYNOP · direkte Sichtmessung'});
let weather=api.livePhaseWeather(null,{rate:0,time:now,source:'Radar'},null,point,now,live);
assert.equal(weather.condition,'Dichter Nebel');
assert.match(weather.source,/Sicht 40 m/);
ctx.WeatherObservation.fogAt=()=>({state:'risk',time:now-5*60000,source:'ICON-D2-RUC · Taupunkt nahe Temperatur'});
weather=api.livePhaseWeather(null,{rate:0,time:now,source:'Radar'},null,point,now,live);
assert.equal(weather.condition,'Nebel möglich · nicht bestätigt');
assert.match(weather.source,/Sichtweite nicht gemessen/);
assert.match(weather.source,/kein Niederschlag im Radar/);
weather=api.livePhaseWeather(null,{rate:2,time:now,source:'Radar'},null,point,now,live);
assert.equal(weather.condition,'Niederschlag · Art nicht bestimmt','precipitation echo is not hidden by fog suspicion');
ctx.WeatherObservation.fogAt=()=>null;
weather=api.currentCloudWeather(null,point,now,live);
assert.equal(weather.condition,'Heiter','sky information still available without fog evidence');
ctx.WeatherObservation.fogAt=()=>({state:'risk',time:now-90*60000,source:'stale'});
weather=api.currentCloudWeather(null,point,now,live);
assert.equal(weather.condition,'Heiter','stale fog risk is rejected');
console.log('PASS: direct fog overrides clear sky; potential remains explicitly unconfirmed; wet radar and freshness handled');
