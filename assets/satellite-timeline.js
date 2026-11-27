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
   if(d.schema===1 && Array.isArray(d.frames)&&d.frames.length<=160&&d.frames.every(t=>Number.isInteger(t)&&t%600===0)&&Array.isArray(d.radar)&&d.radar.length<=310&&d.radar.every(t=>Number.isInteger(t)&&t%300===0) && String(d.bounds)==='1,44,19,58')archiveIndex=d;
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
 if(!Number.isInteger(stamp)||stamp%(kind==='radar'?300:600)!==0||!['frames','radar'].includes(kind))return null;
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
function atOrBefore(kind,time,maxAge){
 loadSatelliteIndex();
 const step=kind==='radar'?300000:600000,exact=Math.floor(time/step)*step;
 const direct=archiveFile(kind,exact);if(direct)return {value:direct,time:exact};
 const stamps=(archiveIndex?.[kind]||[]).filter(t=>t*1000<=time&&time-t*1000<=maxAge).sort((a,b)=>b-a);
 for(const stamp of stamps.slice(0,3)){const value=archiveFile(kind,stamp*1000);if(value)return {value,time:stamp*1000};}
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
return {file:archiveFile,atOrBefore,latest,latestRadar,pending(kind,time){return archiveIndexPending||Boolean(archiveCache.get(kind+'/'+time/1000)?.pending)},get bounds(){return archiveIndex?.bounds||[1,44,19,58]}};
}
