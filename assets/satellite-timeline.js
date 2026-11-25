'use strict';
// GeoColour and RADOLAN have independent availability. Files are addressed by
// verified UTC capture time; never substitute a neighbouring archive frame.
const satelliteArchive = 'https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/mobile-satellite-archive/';
const archiveCache = new Map();
let archiveIndex, archiveIndexChecked = -Infinity, archiveIndexPending = false;
let forecastCloudCache, lastSatelliteSelection, selectionStarted = 0;
function satelliteTime(){
 const run = Date.parse(radarNowcastData?.time);
 const recentRun = Number.isFinite(run) && run <= Date.now() && Date.now()-run <= 25*60000;
 const base = liveMinute>0 && recentRun ? run : Math.floor(radarBaseTime()/600000)*600000;
 return base+liveMinute*60000;
}
function loadSatelliteIndex(){
 if(archiveIndexPending || Date.now()-archiveIndexChecked<60000)return;
 archiveIndexPending=true;
 archiveIndexChecked=Date.now();
 fetch(satelliteArchive+'index.json?v='+Math.floor(Date.now()/60000),{signal:AbortSignal.timeout(12000)})
  .then(async res=>{
   if(!res.ok)return;
   const d=await res.json();
   if(d.schema===1 && [d.frames,d.radar].every(a=>Array.isArray(a)&&a.length<=160&&a.every(t=>Number.isInteger(t)&&t%600===0)) && String(d.bounds)==='1,44,19,58')archiveIndex=d;
  }).catch(()=>{}).finally(()=>{archiveIndexPending=false;scheduleMap()});
}
async function readArchiveFile(kind,stamp){
 if(kind==='frames'){
  const img=new Image();img.crossOrigin='anonymous';img.src=satelliteArchive+stamp+'.jpg';await img.decode();
  if(img.naturalWidth!==900||img.naturalHeight!==700)throw Error('Unexpected satellite geometry');
  return img;
 }
 const r=await fetch(satelliteArchive+stamp+'.json.gz',{signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('Missing radar scan');
 const bytes=await r.arrayBuffer(),header=new Uint8Array(bytes);
 const body=new Blob([bytes]).stream();
 const data=decodeRadarPoints(await new Response(header[0]===31&&header[1]===139?body.pipeThrough(new DecompressionStream('gzip')):body).json());
 if(Date.parse(data.time)!==stamp*1000)throw Error('Mismatched radar observation');
 return {time:stamp*1000,grid:data.grid,amount:data.amount,key:'archive/'+stamp,source:'DWD RADOLAN RY',forecast:false};
}
function archiveFile(kind,time){
 loadSatelliteIndex();
 const stamp=time/1000;
 if(!archiveIndex?.[kind]?.includes(stamp))return null;
 const key=kind+'/'+stamp, existing=archiveCache.get(key);
 if(existing && (existing.value || existing.pending || Date.now()-existing.started<60000))return existing.value;
 if([...archiveCache.values()].filter(e=>e.pending).length>=4)return null;
 const entry={started:Date.now(),pending:true,value:null};
 archiveCache.set(key,entry);
 readArchiveFile(kind,stamp).then(v=>entry.value=v).catch(()=>{}).finally(()=>{
  entry.pending=false;
  for(const [k,e] of archiveCache){if(archiveCache.size<=8)break;if(!e.pending)archiveCache.delete(k)}
  scheduleMap();
 });
 return null;
}
function timelineForecastCloud(time){
 prepareLiveArea(true);
 const f=nativeAreaFrame(time,'cloud',[10,51],true);
 if(!f || time-f.time>=3600000)return null;
 const hour=f.hour, delta=(time-f.time)/3600000, next=delta?hour+1:hour;
 if(!f.d.frames[next]?.cloud)return null;
 const p=fields.cloud;
 for(const h of new Set([hour,next]))fetchNativeMapFields(f.d,p,h);
 const first=f.d.decoded.get(hour+'/cloud'), last=f.d.decoded.get(next+'/cloud');
 if(!first||!last)return null;
 const key=[f.d.file,f.d.generated,time].join('/');
 if(forecastCloudCache?.key===key)return forecastCloudCache;
 const g=f.d.grid,scale=f.d.scales?.cloud??g.scale;
 const values=new Float32Array(first.length);
 for(let i=0;i<values.length;i++){
  const a=first[i]*scale,b=last[i]*scale;
  values[i]=first[i]!==g.missing&&last[i]!==g.missing&&a>=0&&a<=100&&b>=0&&b<=100?a+(b-a)*delta:NaN;
 }
 forecastCloudCache={key,grid:g,values,time,kind:'forecast/'+f.d.generated,source:f.d.model+' · Gesamtbewölkung'+(delta?' · zeitlich interpoliert':'')};
 return forecastCloudCache;
}
const forecastAttempts=new Map();
function timelineRadar(time){
 if(liveMinute<0)return archiveFile('radar',time);
 const f=ownRadarFrame(new Date(time));
 if(f?.forecast && f.time===time)return f;
 if(Date.now()-(forecastAttempts.get(time)||0)>60000){
  forecastAttempts.set(time,Date.now());
  if(forecastAttempts.size>25)forecastAttempts.delete(forecastAttempts.keys().next().value);
  fetchNowcastMapFrame(new Date(time));
 }
 return null;
}
function selectedSatelliteInfo(){
 const time=satelliteTime(), past=liveMinute<0;
 const img=past?archiveFile('frames',time):null;
 const mask=past?null:timelineForecastCloud(time);
 const frame=timelineRadar(time);
 return {satellite:true,timeline:true,date:new Date(time),img,mask,frame,available:!!(img||mask),source:past?'© EUMETSAT / NASA · GeoColour':mask?.source||'Wolkenprognose'};
}
function drawTimelineRaster(ctx,b,canvas,bounds){
 const [west,south,east,north]=bounds;
 const [x,y]=xy(west,north,b),[right,bottom]=xy(east,south,b);
 ctx.drawImage(canvas,x,y,right-x,bottom-y);
}
function drawSatelliteTimeline(ctx,b,info){
 if(info.img)drawTimelineRaster(ctx,b,info.img,archiveIndex.bounds);
 if(info.mask)drawObservedField(ctx,b,'cloud',info.mask);
 const f=info.frame;
 if(!f)return;
 const canvas=ownRadarRaster(f);
 if(canvas){
  const g=f.grid;
  drawTimelineRaster(ctx,b,canvas,[g.west-g.step/2,g.south-g.step/2,g.west+(g.nx-.5)*g.step,g.south+(g.ny-.5)*g.step]);
 }
}
function timelineLabels(info){
 const kind=liveMinute<0?'Rückblick':'Vorhersage',time=timeText(info.date);
 el('map-layer-title').textContent='Satellitenwolken + Niederschlagsradar';
 el('map-model-badge').textContent=kind;
 el('map-overlay-model').textContent=info.available?info.source:'Wolkendaten fehlen';
 el('map-overlay-data').textContent=info.frame?info.frame.source:'Radardaten fehlen';
 el('map-valid').textContent=kind+' · '+time;
 el('map-data-notice').textContent=kind;
 el('map-time-label').textContent=time+' · '+(liveMinute>0?'+':'')+liveMinute+' min';
 el('map-view-description').textContent=info.source;
 el('map-interval').textContent=liveMinute<0?'GeoColour-Aufnahme und gemessene Niederschlagsintensität zum gewählten Zeitpunkt.':'Prognostizierter Bedeckungsgrad und Niederschlags-Nowcast zum gewählten Zeitpunkt.';
}
function timelineWaiting(){
 const info=selectedSatelliteInfo(),key=info.date.getTime();
 if(key!==lastSatelliteSelection){selectionStarted=Date.now();lastSatelliteSelection=key}
 return Date.now()-selectionStarted<6000 && (!info.available || !info.frame || !readyRadarFrame(info.frame,'radar',false));
}
