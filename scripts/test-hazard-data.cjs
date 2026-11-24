'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const now=Date.parse('2026-11-24T20:40:00Z');
class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',isConnected:true,querySelectorAll:()=>[]});return nodes.get(id);};
let place={name:'Berlin',lon:13.4,lat:52.5};
// Use the app's real context bridge as well: initial built-in places have
// names but no coordinates, whereas searched/favourite places contain both.
const app=fs.readFileSync('assets/app.js','utf8');
const contextStart=app.indexOf('window.WEATHER_APP_CONTEXT=');
const pointStart=app.indexOf('function homeLocationPoint(');
assert.ok(contextStart>=0&&pointStart>=0);
const bridge=vm.createContext({window:{},location:{name:'Berlin'},Number,
 mapPlaceRecords:[['Berlin',13.405,52.52]]});
vm.runInContext(app.slice(pointStart,app.indexOf('function homeCurrentSample(',pointStart))+
 app.slice(contextStart,app.indexOf('const nav=',contextStart)),bridge);
assert.deepEqual(JSON.parse(JSON.stringify(bridge.window.WEATHER_APP_CONTEXT.getLocation())),{name:'Berlin',lon:13.405,lat:52.52});
bridge.location=place;
assert.equal(bridge.window.WEATHER_APP_CONTEXT.getLocation().lon,13.4,'explicit searched coordinates take priority');
bridge.location={name:'Köln',lon:6.96,lat:50.94};
assert.equal(bridge.window.WEATHER_APP_CONTEXT.getLocation().name,'Köln','location changes are read on each call');
bridge.location={name:'Unbekannter Ort'};
assert.equal(bridge.window.WEATHER_APP_CONTEXT.getLocation(),null,'missing coordinates stay missing');
const context=vm.createContext({console,Date:Clock,Number,Math,URLSearchParams,AbortController,setTimeout,clearTimeout,
 document:{getElementById:node,querySelectorAll:()=>[]},window:{WEATHER_APP_CONTEXT:{getLocation:()=>place}}
});
let source=fs.readFileSync('assets/hazards.js','utf8');
const end=source.lastIndexOf('})();');assert.ok(end>0);
source=source.slice(0,end)+'window.hazardTest={roadValue,roadData,waterStatus,renderWater,showStation,openWater,busy};\n'+source.slice(end);
vm.runInContext(source,context);
const api=context.window.hazardTest;
const station=(uuid,value,t=now)=>({uuid,shortname:uuid,waterName:'Spree',unit:'cm',km:2,state:'normal',current:{timestamp:new Clock(t).toISOString(),value}});
const fresh=station('Testpegel',42);
assert.equal(api.waterStatus(station('Testpegel',null))[0],'Messwert fehlt');
assert.equal(api.waterStatus(station('Testpegel','  '))[0],'Messwert fehlt');
assert.equal(api.waterStatus(station('Testpegel',false))[0],'Messwert fehlt');
assert.equal(api.waterStatus(station('Testpegel',0))[1],'neutral','a genuine zero remains valid');
assert.equal(api.waterStatus(station('Testpegel',300,now+2*3600000))[1],'unknown','future measurements are not current');
assert.equal(api.waterStatus(station('Testpegel',300,now-4*3600000))[1],'unknown');
assert.equal(api.roadValue(null),'—');assert.equal(api.roadValue(''),'—');assert.equal(api.roadValue(false),'—');
assert.match(api.roadValue(0),/0,0/);
api.renderWater([station('Missing',null)]);
assert.match(node('hazard-water-content').innerHTML,/<b>—<\/b>/);
assert.doesNotMatch(node('hazard-water-content').innerHTML,/<b>0 cm<\/b>/);
api.busy(node('error'),'Quelle <nicht verfügbar>', ['https://example.test/','Datenquelle']);
assert.match(node('error').innerHTML,/Quelle &lt;nicht verfügbar&gt;/);
assert.match(node('error').innerHTML,/<a href="https:\/\/example.test\/"/);

(async()=>{
 // A slow answer for a previously tapped gauge must not overwrite the
 // current selection. History is sorted and null values are excluded.
 const pending=[];
 context.fetch=url=>new Promise(resolve=>pending.push({url,resolve}));
 const first=api.showStation(station('A',5)),second=api.showStation(station('B',10));
 const finish=id=>{for(const item of pending.filter(p=>p.url.includes('/'+id+'/'))){const values=item.url.includes('/WV/')?[]:[{timestamp:new Clock(now-3600000).toISOString(),value:8},{timestamp:new Clock(now-2*3600000).toISOString(),value:5},{timestamp:new Clock(now).toISOString(),value:null}];item.resolve(new Response(JSON.stringify(values)));}};
 finish('B');await second;
 assert.match(node('hazard-station-detail').innerHTML,/<h3>B/);
 assert.match(node('hazard-station-detail').innerHTML,/\+3 cm/);
 finish('A');await first;
 assert.match(node('hazard-station-detail').innerHTML,/<h3>B/,'the latest selected gauge remains visible');

 // The same protection applies when the town changes during a download.
 const requests=[];
 context.fetch=url=>new Promise(resolve=>requests.push({url,resolve}));
 const before=api.openWater(true);place={name:'Köln',lon:6.96,lat:50.94};const after=api.openWater(true);
 const result=name=>[{uuid:name,shortname:name,latitude:50.9,longitude:7,water:{longname:'Rhein'},timeseries:[{shortname:'W',currentMeasurement:{timestamp:new Clock().toISOString(),value:50,stateMnwMhw:'normal'}}]}];
 requests[1].resolve(new Response(JSON.stringify(result('Köln'))));await after;
 requests[0].resolve(new Response(JSON.stringify(result('Berlin'))));await before;
 assert.match(node('hazard-water-content').innerHTML,/Köln/);
 assert.doesNotMatch(node('hazard-water-content').innerHTML,/Berlin/);

 const road={schema:1,generated:new Clock(now+2*3600000).toISOString(),run:new Clock(now).toISOString(),times:[new Clock(now+3600000).toISOString()],stations:Array.from({length:50},()=>[])};
 context.fetch=async()=>new Response(JSON.stringify(road));
 await assert.rejects(api.roadData(true),/veraltet/);
 road.generated=new Clock().toISOString();
 assert.equal((await api.roadData(true)).schema,1);
 console.log('PASS: missing/zero/stale/future gauge values, selection and location races, road timestamps and source links.');
})().catch(e=>{console.error(e);process.exitCode=1;});
