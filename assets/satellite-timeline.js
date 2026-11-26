'use strict';
// GeoColour and RADOLAN have independent availability. Files are addressed by
// verified UTC capture time; never substitute a neighbouring archive frame.
function createSatelliteArchive(scheduleMap,decodeRadarPoints){
const satelliteArchive = 'https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/mobile-satellite-archive/';
const archiveCache = new Map();
let archiveIndex, archiveIndexChecked = -Infinity, archiveIndexPending = false;

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
  const img=new Image();img.crossOrigin='anonymous';img.src=satelliteArchive+stamp+'.jpg?v='+Math.floor(Date.now()/300000);await img.decode();
  if(img.naturalWidth!==900||img.naturalHeight!==700)throw Error('Unexpected satellite geometry');
  return img;
 }
 const r=await fetch(satelliteArchive+stamp+'.json.gz?v='+Math.floor(Date.now()/300000),{signal:AbortSignal.timeout(20000)});
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
 if(!Number.isInteger(stamp)||stamp%600!==0||!['frames','radar'].includes(kind))return null;
 // The index is published separately from the objects. For a recent scan,
 // try the timestamped file even while the index is loading or lagging.
 if(!archiveIndex?.[kind]?.includes(stamp)&&Date.now()-time>45*60000)return null;
 const key=kind+'/'+stamp, existing=archiveCache.get(key);
 if(existing && (existing.value || existing.pending || Date.now()-existing.started<15000))return existing.value;
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
function latest(minimumTime){
 loadSatelliteIndex();
 const stamp=archiveIndex?.frames.at(-1);
 if(!stamp || stamp*1000<minimumTime || stamp*1000>Date.now())return null;
 const img=archiveFile('frames',stamp*1000);
 return img?{img,time:stamp*1000}:null;
}
function latestRadar(minimumTime){
 loadSatelliteIndex();
 const stamp=archiveIndex?.radar.filter(t=>t*1000<=Date.now()&&t*1000>=minimumTime).at(-1);
 return stamp?archiveFile('radar',stamp*1000):null;
}
return {file:archiveFile,latest,latestRadar,pending(kind,time){return archiveIndexPending||Boolean(archiveCache.get(kind+'/'+time/1000)?.pending)},get bounds(){return archiveIndex?.bounds||[1,44,19,58]}};
}
