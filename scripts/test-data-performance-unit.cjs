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

// A radar intensity pixel is not a precipitation classification. Verify that
// separately published, fresh HymecNG classes override even a rainy model.
{
 const sampleTime=now-5*60000,frame={d:{model:'ICON-D2'},time:sampleTime,values:{temp2:.1,rh2:99,cloud:99,ww:61}},radar={amount:.05,rate:.6,time:sampleTime};
 const read=(f,id)=>f?.values?.[id]??NaN;
 const live=vm.createContext({atob,frameVal:read,frameHumidity:f=>read(f,'rh2'),isNightAt:()=>false,fogCondition:()=>null,frameWeather:f=>f?{icon:'11_regen_1',condition:'Regen',source:'Modell'}:{icon:null,condition:'Wetterzustand nicht verfügbar',source:'Modell'},localTime:()=> '18:25',Date:TestDate,Math,Number,frame,radar,sampleTime,now});
 vm.runInContext(chunk('let radarPhaseData=','async function fetchRadarPhase')+chunk('function currentCloudWeather(','function liveHeroWeatherHTML'),live);
 const check=(code,name)=>assert.equal(vm.runInContext("livePhaseWeather(frame,radar,{code:"+code+",time:sampleTime},[8,50],now).condition",live),name);
 check(7,'Schneefall');check(6,'Schneeregen');check(5,'Gefrierender Regen');check(3,'Regen');
 assert.equal(vm.runInContext("livePhaseWeather(frame,radar,null,[8,50],now).condition",live),'Schneefall möglich');
 assert.equal(vm.runInContext("livePhaseWeather(null,radar,null,[8,50],now).condition",live),'Niederschlag · Art nicht bestimmt');
 assert.equal(vm.runInContext("livePhaseWeather(frame,{amount:0,rate:0,time:sampleTime},{code:0,time:sampleTime},[8,50],now).condition",live),'Bedeckt');
 live.phasePacket={schema:1,product:'HymecNG',time:new Date(sampleTime).toISOString(),grid:{nx:2,ny:2,west:7,south:50,step:1,missing:255},classes:Buffer.from([0,7,6,255]).toString('base64')};
 assert.equal(vm.runInContext("const phaseGrid=decodeRadarPhase(phasePacket);radarPhaseAt(phaseGrid,[8,50],now).code",live),7);
 assert.equal(vm.runInContext("radarPhaseAt(phaseGrid,[8,51],now)",live),null);
 assert.equal(vm.runInContext("radarPhaseAt(phaseGrid,[8,50],now+21*60000)",live),null);
 console.log('Live weather: analysed snow/mix/rain/freezing phase, conservative fallback, cloud cover, no-data and staleness: OK');
}

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

// Own raw-data radar: strict time matching, north/south orientation,
// unknown phase never becomes rain, and canvas reuse across redraws.
{
 const grid={west:8,south:50,step:.01,nx:3,ny:2,scale:.01,missing:-32768};
 const pack=(v)=>{const b=Buffer.alloc(v.length*2);v.forEach((x,i)=>b.writeInt16LE(x,i*2));return b.toString('base64')};
 const t=now-5*60000,iso=new Date(t).toISOString(),amount=pack([10,10,10,0,-32768,100]),classes=Buffer.from([7,3,255,0,255,9]).toString('base64');
 let builds=0,rendered=null,draws=0;
 const canvas=()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:im=>{rendered=im.data;builds++}})});
 const c=vm.createContext({Date:TestDate,Map,Math,Number,atob,console,radarBaseTime:()=>t,radarPointData:{time:iso,grid,amount},radarPhaseData:{time:iso,grid:{...grid,missing:255},classes},radarNowcastData:null,document:{createElement:canvas},scheduleMap:()=>{},xy:(x,y)=>[x,y],drawContext:{drawImage:()=>draws++}});
 vm.runInContext(chunk('const radarCoverage=','function drawRealLiveField'),c);
 const r=s=>vm.runInContext(s,c);
 assert.equal(r('ownRadarObservation().source'),'RY + HymecNG');
 r('const f=ownRadarObservation();ownRadarRaster(f);ownRadarRaster(f);');
 assert.equal(builds,1);
 const rgba=i=>Array.from(rendered.slice(i*4,i*4+4));
 assert.equal(rgba(0)[3],0);assert.equal(rgba(1)[3],0); // north: dry/missing
 assert.deepEqual(rgba(2),[209,0,169,224]); // north: hail 12 mm/h
 assert.deepEqual(rgba(3),[247,139,197,224]); // south: snow 1.2 mm/h
 assert.deepEqual(rgba(4),[39,151,242,224]); // south: rain
 assert.deepEqual(rgba(5),[130,150,156,224]); // unknown, not rain
 r('drawRealRadar(drawContext,{},new Date(f.time),()=>{},true)');
 assert.equal(draws,1);assert.equal(builds,1);
 r('radarPhaseData.time=new Date(f.time-300000).toISOString()');
 assert.equal(r('ownRadarObservation().source'),'HymecNG');
 assert.equal(r('ownRadarObservation().amount'),undefined);
 r('radarPhaseData=null;radarNowcastData={time:radarPointData.time,grid:radarPointData.grid,frames:{5:radarPointData.amount}}');
 assert.equal(r('ownRadarObservation().source'),'RY');
 assert.equal(r('ownRadarFrame(new Date(f.time+300000)).forecast'),true);
 assert.equal(r('ownRadarFrame(new Date(f.time+300000)).classes'),undefined);
 assert.equal(r('ownRadarFrame(new Date(f.time+600000))'),null);
 console.log('Own radar: snow/rain/hail/unknown colours, missing cells, exact scan matching, forecast isolation, raster reuse: OK');
}

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

