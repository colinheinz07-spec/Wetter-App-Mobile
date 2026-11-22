'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/app.js','utf8'),chunk=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b));
const now=Date.parse('2026-11-22T10:45:00Z'),point=[7.84,50.55],station=[7.85,50.65];
const ctx=vm.createContext({now,point,station,Map,Math,Number,Date,URLSearchParams,AbortSignal,atob,console,
  pointKey:p=>p?.join(',')||'',warningElevation:()=>450,localFormat:v=>String(v),localTime:v=>new Date(v).toISOString().slice(11,16),
  frameVal:(f,id)=>f?.point===station?f?.atStation?.[id]??NaN:f?.values?.[id]??NaN,frameHumidity:f=>f?.values?.rh2??NaN,
  stationData:null,location:{},homeLocationPoint:()=>point,refreshLiveHero:()=>{},pointRead:()=>Promise.resolve(null)});
const ev=s=>vm.runInContext(s,ctx);
ev(chunk('const liveObservations=','let radarPhaseData='));
ev(`const raw={sources:[{id:1,observation_type:'synop',lon:station[0],lat:station[1],height:475,station_name:'Station A'},{id:2,observation_type:'forecast',lon:point[0],lat:point[1],height:450}],weather:[
 {source_id:1,timestamp:new Date(now-10*60000).toISOString(),temperature:-1.2,wind_speed_10:0,wind_gust_speed_10:15.1,dew_point:-2},
 {source_id:1,timestamp:new Date(now-5*60000).toISOString(),temperature:null,wind_speed_10:null,wind_gust_speed_10:null},
 {source_id:1,timestamp:new Date(now+60000).toISOString(),temperature:12,wind_gust_speed_10:90},
 {source_id:1,timestamp:new Date(now-60*60000).toISOString(),temperature:40},
 {source_id:2,timestamp:new Date(now-60000).toISOString(),temperature:20},
 {source_id:1,timestamp:new Date(now-60000).toISOString(),temperature:20,fallback_source_ids:{temperature:2}}]};
 const rows=decodeLiveObservations(raw,point,now);liveObservations.set(pointKey(point),rows);
 const frame={time:now-45*60000,d:{model:'ICON-D2',hours:[0,1]},hour:0,point,values:{temp2:3,wind:12,gust:48,dew:1},atStation:{temp2:4,wind:14,dew:2}};
 // A complete raster supplies both cells at the same validity time.
 stationModelValue=(f,s,id)=>f.atStation[id];`);
assert.equal(ev('rows.length'),4);
assert.equal(ev('liveObservationAt("wind",point,now).value'),0,'zero is a real measurement');
assert.equal(ev('liveSample("temp2",frame,point,now).kind'),'analysis');
assert.ok(Math.abs(ev('liveSample("temp2",frame,point,now).value')+2.2)<1e-8,'actual observation plus same-frame spatial difference');
assert.equal(ev('liveSample("gust",frame,point,now).value'),15.1,'observed gust, not model interval gust');
assert.equal(ev('liveSample("gust",frame,point,now).kind'),'station');
assert.match(ev('liveSample("gust",frame,point,now).source'),/Station A.*10:35.*Max. 10 min/);
assert.equal(ev('liveSample("temp2",{...frame,time:now+10*60000},point,now).kind'),'station','future model frame rejected');
assert.equal(ev('liveSample("temp2",frame,point,now+36*60000).kind'),'model','expired observations cannot remain live');
assert.equal(ev('liveSample("temp2",frame,point,now+100*60000).kind'),'missing','stale model also rejected');
assert.equal(ev('liveSample("gust",frame,[8.1,50.6],now).value'),48,'location-specific measurement never leaks to another town');
assert.equal(ev('liveSample("gust",frame,[8.1,50.6],now).kind'),'model');
ev('stationModelValue=()=>NaN');assert.equal(ev('liveSample("temp2",frame,point,now).kind'),'model');
assert.equal(ev('liveSample("temp2",frame,point,now).obs.value'),-1.2,'reference measurement is retained when spatial correction impossible');
// Exercise actual packed-tile lookup (not a mocked station-model difference).
const tileCtx=vm.createContext({Map,Math,Number,Date,atob,pointRead:()=>Promise.resolve(null),refreshLiveHero:()=>{}});
const tileEval=s=>vm.runInContext(s,tileCtx);
tileEval(source.match(/function packedCell\(packed,n\)\{[^\n]+/)[0]);
tileEval(source.match(/function pointCell\(m,p\)\{[^\n]+/)[0]);
tileEval(chunk('const liveObservations=','let radarPhaseData='));
const pack=arr=>{const b=Buffer.alloc(arr.length*2);arr.forEach((n,i)=>b.writeInt16LE(n,2*i));return b.toString('base64')};
tileCtx.packed=pack([10,40,50,60]);
tileEval(`const grid={west:7,south:50,step:.1,nx:2,ny:2,missing:-32768,scale:.1},m={schema:3,model:'ICON-D2',run:'r',generated:'g',hours:[0,1],grid,tileSize:8,scales:{temp2:.1,wind:.1,dew:.1}};
 const c=pointCell(m,[7,50]),f={temp2:packed,wind:packed,dew:packed},t={schema:3,run:'r',generated:'g',key:c.key,frames:{0:f,1:f}};
 rememberLiveTile(m,t,c,'test/');const actual={d:{...m,pointLocation:[7,50]},hour:0};`);
assert.equal(tileEval('stationModelValue(actual,{point:[7.1,50]},"temp2")'),4);
assert.equal(tileEval('stationModelValue({...actual,d:{...actual.d,generated:"wrong"}},{point:[7.1,50]},"temp2")'),NaN,'no cross-run tile reuse');
console.log('PASS: raw observed temperature, calm wind, gust time/interval, spatial analysis, source separation, future/stale rejection and location switch.');
