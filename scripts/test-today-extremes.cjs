'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const observations=require('../assets/observations.js');
const source=fs.readFileSync('assets/app.js','utf8');
const start=source.indexOf('function todayDaytimeExtremes('),end=source.indexOf('function forecastCalendarDays(',start);
assert.ok(start>=0&&end>start,'daytime extrema routine is present');
const observed=[
 {time:Date.parse('2026-11-23T09:15:00Z'),temperature:-3},
 {time:Date.parse('2026-11-23T13:45:00Z'),temperature:-1},
 {time:Date.parse('2026-11-23T18:15:00Z'),temperature:5}
];
const ctx=vm.createContext({WeatherObservation:{
 series:(p,height,a,b)=>observed.filter(r=>r.time>=a&&r.time<=b),
 combineDayTemperature:observations.combineDayTemperature
},HOUR_MS:3600000,Math,Number});
vm.runInContext(source.slice(start,end),ctx);
const startDay=Date.parse('2026-11-23T08:00:00Z'),endDay=Date.parse('2026-11-23T17:00:00Z');
const hours=[
 {start:Date.parse('2026-11-23T12:00:00Z'),end:Date.parse('2026-11-23T13:00:00Z'),temperature:2},
 {start:Date.parse('2026-11-23T16:00:00Z'),end:endDay,temperature:1},
 {start:endDay,end:Date.parse('2026-11-23T18:00:00Z'),temperature:3},
 {start:Date.parse('2026-11-23T19:00:00Z'),end:Date.parse('2026-11-23T20:00:00Z'),temperature:5}
];
const day={periods:[{}, {start:startDay}, {end:endDay}, {}],temperatureHours:hours};
const ext=(now,current=null)=>vm.runInContext('todayDaytimeExtremes(day,[7.83,50.55],400,now,current)',Object.assign(ctx,{day,now,current}));
const evening=Date.parse('2026-11-23T19:14:00Z');
const finished=ext(evening,{temperature:{kind:'analysis',value:12,time:Date.parse('2026-11-23T19:00:00Z')}});
assert.equal(finished.hi,-1,'evening forecast and evening live analysis cannot increase daytime maximum');
assert.equal(finished.futureCount,0,'no daytime forecast remains after 18:00 local');
assert.ok(finished.maxHour?.time,'observed maximum retains its observed timestamp');
const afternoon=ext(Date.parse('2026-11-23T14:30:00Z'));
assert.equal(afternoon.hi,1,"only remaining 09-18 forecast can influence today\'s provisional maximum");
assert.equal(afternoon.futureCount,1);
const withLive=ext(Date.parse('2026-11-23T14:30:00Z'),{temperature:{kind:'analysis',value:1.5,time:Date.parse('2026-11-23T14:15:00Z')}});
assert.equal(withLive.hi,1.5,'a verified ongoing daytime +0h analysis can update maximum');
observed.splice(0);
const unavailable=ext(evening);
assert.ok(Number.isNaN(unavailable.hi),'no fabricated observed maximum after daytime ends');
assert.equal(unavailable.futureCount,0);
console.log('PASS: past daytime, future daytime, evening exclusions, and missing-data honesty');
