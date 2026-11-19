const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('assets/app.js','utf8'),chunk=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b));
const now=Date.parse('2026-11-19T18:30:00Z'),run='2026-11-19T12:00:00.000Z';
class TestDate extends Date{static now(){return now}}
const ctx=vm.createContext({console,Date:TestDate,Map,Set,Math,Number,Int16Array,atob,URLSearchParams,AbortSignal,setTimeout:()=>0,clearTimeout:()=>{},navigator:{connection:{saveData:false}},document:{hidden:false}});
const ev=s=>vm.runInContext(s,ctx);
vm.runInContext(chunk('const realModelFiles=','async function fetchRealModel')+`
 let mapRegion='Deutschland',mapModel='ICON-D2',mapLayer='mlcape',mapSource='model',mapHour=7,activePage='map';
 const fields={mlcape:{id:'mlcape',interval:0},temp2:{id:'temp2',interval:0}};
 const el=()=>null;let redraws=0;const scheduleMap=()=>redraws++;
 const grid={west:8,south:48,step:1,nx:2,ny:2,scale:.1,missing:-32768};
 const hours=Array.from({length:49},(_,i)=>i),run='${run}';
 const fixture=(file,cape)=>({nativeMap:true,file,model:'ICON-D2',run,generated:run,hours,grid,scales:{temp2:.1,mlcape:1},frames:Object.fromEntries(hours.map(h=>[h,{temp2:true,...(cape?{mlcape:true}:{})}])),decoded:new Map()});
 const detailed=fixture('icon-d2-de',false),global=fixture('icon-d2',true);
 nativeMapModels.set('icon-d2-de',detailed);nativeMapModels.set('icon-d2',global);
 modelDataMode='real';
 let active=0,peak=0,reads=0;const requests=new Map(),finish=[];
 nativeMapRead=async(file,path,zip,generated)=>{active++;peak=Math.max(active,peak);reads++;requests.set(path,(requests.get(path)||0)+1);
  await new Promise(r=>finish.push(r));active--;const m=path.match(/(\\d+)-(\\w+)\\.json\\.gz/);
  return {schema:2,run,generated,hour:+m[1],field:m[2],values:'ZABkAGQAZAA='};
 };
`,ctx);
(async()=>{
 assert.equal(ev('realData().file'),'icon-d2');
 ev("mapLayer='temp2'");assert.equal(ev('realData().file'),'icon-d2-de');
 ev("mapLayer='mlcape';const p=fields.mlcape;const a=fetchNativeMapFields(global,p,7);const b=fetchNativeMapFields(global,p,7);");
 assert.equal(ev('reads'),1);ev('finish.shift()()');await ev('Promise.all([a,b])');
 assert.equal(ev('global.decoded.get("7/mlcape")[0]'),100);
 ev('const jobs=Array.from({length:16},(_,i)=>fetchNativeMapFields(global,p,8+i));');
 assert.ok(ev('peak')<=6);
 for(let i=0;i<20;i++){ev('finish.splice(0).forEach(r=>r())');await new Promise(r=>setImmediate(r));if(!ev('nativeFieldLoading.size'))break}
 await ev('Promise.all(jobs)');
 assert.equal(ev('nativeFieldLoading.size'),0);assert.equal(ev('peak'),6);
 assert.equal(ev('global.decoded.size'),17);
 const previous=ev('reads');ev('fetchNativeMapFields(global,p,7)');assert.equal(ev('reads'),previous);
 ev('prefetchNextMapField(global,p,23)');assert.equal(ev('requests.get("24-mlcape.json.gz")'),1);ev('finish.shift()()');await new Promise(r=>setImmediate(r));
 assert.equal(ev('nativeFieldsReady(global,p,24)'),true);
 console.log('Native field selection, single download, bounded six-request queue, cache reuse and next-frame preload: OK');
 // The real radar adapter is exercised with an asynchronous image decoder.
 let base=now-10*60000,loaded=[],draws=[],fail=new Set();
 class TestImage{set src(url){if(!url)return;loaded.push(url);queueMicrotask(()=>{if(fail.has(url))this.onerror?.();else this.onload?.()})}}
 const radar=vm.createContext({console,Date:TestDate,URLSearchParams,Map,Set,Math,Number,Image:TestImage,setTimeout:()=>0,clearTimeout:()=>{},navigator:{connection:{saveData:false}},document:{hidden:false},radarWms:'https://maps.dwd.de/geoserver/dwd/wms',radarBaseTime:()=>base,radarImages:new Map(),radarRevision:0,activePage:'map',liveMinute:0,stationData:null,scheduleMap:()=>{},xy:(lon,lat,b)=>[(lon-b.west)*b.w/(b.east-b.west),(b.north-lat)*b.h/(b.north-b.south)],drawContext:{drawImage:(...a)=>draws.push(a)}});
 vm.runInContext(chunk('const radarCoverage=','function drawRealLiveField'),radar);
 const r=s=>vm.runInContext(s,radar);
 r("const time=new Date(radarBaseTime()),a={west:2,south:45,east:18,north:57,w:360,h:160},b={west:7,south:49,east:9,north:51,w:800,h:600};drawRealRadar(drawContext,a,time);drawRealRadar(drawContext,b,time)");
 await new Promise(r=>setImmediate(r));
 r('drawRealRadar(drawContext,a,time);drawRealRadar(drawContext,b,time)');
 assert.equal(loaded.length,1);assert.equal(draws.length,2);assert.notEqual(draws[0][3],draws[1][3]);
 const future=r('new Date(radarBaseTime()+90*60000)');radar.future=future;const futureUrl=r('radarImageUrl(null,future)');fail.add(futureUrl);
 r('ensureRadarImage(future)');await new Promise(r=>setImmediate(r));
 assert.equal(loaded.length,2);assert.equal(r('radarImages.get(radarCacheKey(future)).state'),'error');
 const oldKey=r('radarCacheKey(future)');base+=90*60000;assert.notEqual(r('radarCacheKey(future)'),oldKey);
 console.log('Radar frame reuse across viewports, correct geographic placement and isolated measurement/forecast caches: OK');
 const explanations=vm.createContext({});vm.runInContext(chunk('const parameterExplanations=','function showParameterHelp')+chunk('const expertMapLinks=','const expertDerivedDescriptions=')+chunk('const expertGroups=','el(\'expert-data\').innerHTML=expertGroups'),explanations);
 const missing=vm.runInContext('expertGroups.flatMap(g=>g[2]).filter(x=>!parameterExplanation(expertMapLinks[x[0]]||x[0])).map(x=>x[0])',explanations);
 assert.deepEqual(Array.from(missing),[]);
 console.log('Explanations for every expert parameter, including unavailable indices: OK');
})().catch(e=>{console.error(e);process.exitCode=1});

