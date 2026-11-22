/* Observation-only surface field and precipitation ledger. No forecast input. */
((root)=>{
'use strict';
const H=3600000,MIN=60000,URL='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/';
let surface=null,radar=null,revision=0,lastCheck=0,request=null,memo=new Map(),grids=new Map();
const fields=['temp2','dew','rh2','wind','winddir','slp','cloud','visibility','gust'];
const finite=Number.isFinite;
function surfacePacket(d,now){
 if(d?.schema!==1||d.product!=='DWD-SYNOP-observations'||!finite(d.generated)||d.generated*1000>now+MIN||now-d.generated*1000>3*H||!Array.isArray(d.rows)||d.rows.length>80000)throw Error('invalid observations');
 const valid=d.rows.filter(r=>typeof r.id==='string'&&finite(r.lon)&&finite(r.lat)&&finite(r.height)&&r.lon>=4&&r.lon<=17&&r.lat>=46&&r.lat<=56&&finite(r.time)&&r.time*1000<=now&&r.time*1000>=now-30*H&&r.values&&typeof r.values==='object').map(r=>({...r,name:String(r.name||r.id).replace(/[<>&"']/g,'')}));
 if(!valid.length)throw Error('empty observations');const g=d.grid,n=g?.nx*g?.ny;const grid=g?.nx===481&&g?.ny===411&&g.step===.02&&g.west===5.5&&g.south===47&&g.scale===.1&&g.missing===-32768&&['temp2','wind','cloud'].every(k=>typeof g.fields?.[k]==='string'&&g.fields[k].length===4*Math.ceil(n*2/3))?g:null;return {...d,rows:valid,grid};
}
function radarPacket(d,now){
 const g=d?.grid,n=g?.nx*g?.ny;
 if(d?.schema!==1||d.product!=='RADOLAN-observed-history'||!finite(d.generated)||d.generated*1000>now+MIN||now-d.generated*1000>3*H||!g||!Number.isInteger(n)||n<=0||n>2000000||!finite(g.west)||!finite(g.south)||!(g.step>0)||g.scale!==.01||g.missing!==-32768||!Array.isArray(d.intervals)||d.intervals.length>350)throw Error('invalid history');
 let end=-Infinity;for(const r of d.intervals){const packed=typeof r.amount==='string'&&r.amount.length===4*Math.ceil(n*2/3),rle=r.encoding==='row-rle-v1'&&Array.isArray(r.rows)&&r.rows.length===g.ny&&r.rows.every(s=>typeof s==='string'&&s.length>=8&&s.length<=4*Math.ceil(g.nx*4/3));if(!['RW','RY'].includes(r.product)||!finite(r.start)||!finite(r.end)||r.start<end||r.end-r.start!==(r.product==='RW'?3600:300)||r.end*1000>now||!packed&&!rle)throw Error('invalid radar interval');end=r.end;}
 return d;
}
const distance=(r,p)=>111.195*Math.hypot(r.lat-p[1],(r.lon-p[0])*Math.cos(p[1]*Math.PI/180));
function nearby(rows,point,height,max=45){
 if(!point||!point.every(finite))return [];
 return rows.map(r=>({r,d:distance(r,point),dh:finite(height)?Math.abs(r.height-height):0})).filter(x=>x.d<=max&&(!finite(height)||x.dh<=250)).sort((a,b)=>a.d-b.d);
}
function interpolate(rows,point,height,id){
 const a=nearby(rows,point,height,id==='cloud'?65:45).filter(x=>finite(x.r.values[id])&&x.r.values[id]!==null).slice(0,8);
 // At least two independent sites; no extrapolation from a single station.
 if(a.length<2||a[0].d>25||(!finite(height)&&a.some(x=>Math.abs(x.r.height-a[0].r.height)>250)))return NaN;
 const w=x=>1/(4+x.d*x.d+(finite(height)?(x.dh/35)**2:0));
 if(id==='winddir'){let x=0,y=0;for(const q of a){const t=q.r.values[id]*Math.PI/180;x+=Math.sin(t)*w(q);y+=Math.cos(t)*w(q)}return Math.hypot(x,y)<1e-8?NaN:(Math.atan2(x,y)*180/Math.PI+360)%360;}
 return a.reduce((s,x)=>s+x.r.values[id]*w(x),0)/a.reduce((s,x)=>s+w(x),0);
}
function latestRows(rows,at,maxAge=75*MIN,field=null){
 const seen=new Map();for(const r of rows){const t=r.time*1000;if(t>at||at-t>maxAge||field&&!finite(r.values[field]))continue;const old=seen.get(r.id);if(!old||r.time>old.time)seen.set(r.id,r);}
 return [...seen.values()];
}
function current(point,height,now=Date.now()){
 if(!surface||now-surface.generated*1000>3*H)return null;
 const key=['current',revision,point?.join(','),height,Math.floor(now/MIN)].join('/');if(memo.has(key))return memo.get(key);
 const result={},localRows=nearby(surface.rows,point,height,65).map(x=>x.r);for(const id of fields){const rows=latestRows(localRows,now,75*MIN,id),near=nearby(rows,point,height,65),direct=near.find(x=>x.d<=1.5&&(!finite(height)||x.dh<=120)&&finite(x.r.values[id]));
  if(direct){const r=direct.r;result[id]={value:r.values[id],kind:'observation',time:r.time*1000,cell:point,analysisId:'synop/'+r.id+'/'+r.time,source:'DWD SYNOP · Messstation '+r.name+' ('+Math.round(direct.d*1000)+' m Entfernung)'};continue;}
  const value=interpolate(near.map(x=>x.r),point,height,id);if(!finite(value))continue;
  // Observation timestamps are not model valid times. Use the oldest of the
  // contributing sites as conservative source age for this estimate.
  const used=nearby(rows,point,height,id==='cloud'?65:45).filter(x=>finite(x.r.values[id])).slice(0,8),time=Math.min(...used.map(x=>x.r.time*1000));
  result[id]={value,kind:'observation',time,cell:point,analysisId:'synop/'+surface.generated,source:'DWD SYNOP · räumliche Beobachtungsanalyse · '+used.length+' Messorte'+(id==='gust'?' · beobachtetes Böenintervall':'')};
 }
 memo.set(key,result);if(memo.size>24)memo.delete(memo.keys().next().value);return result;
}
function phaseAt(point,height,now=Date.now()){
 if(!surface)return null;
 const a=nearby(latestRows(surface.rows,now,60*MIN),point,height,2).filter(x=>Number.isInteger(x.r.values.phase)&&x.r.values.phase>=2&&x.r.values.phase<=10&&(!finite(height)?x.d<=1.5:x.dh<=150));
 const r=a[0]?.r;if(!r)return null;return {code:r.values.phase,time:r.time*1000,kind:'ground',intensity:r.values.strong?'strong':undefined,source:'DWD SYNOP · '+r.name+' · beobachtete Niederschlagsart',distance:a[0].d*1000};
}
function series(point,height,start,end){
 if(!surface||!point)return [];
 const key=['series',revision,point.join(','),height,start,Math.floor(end/MIN)].join('/');if(memo.has(key))return memo.get(key);
 const bins=new Map();for(const {r} of nearby(surface.rows,point,height)){const time=r.time*1000;if(time<start||time>end||!finite(r.values.temp2))continue;if(!bins.has(time))bins.set(time,[]);bins.get(time).push(r);}
 const out=[...bins].sort((a,b)=>a[0]-b[0]).map(([time,rows])=>{const direct=nearby(rows,point,height,1.5).find(x=>!finite(height)||x.dh<=120);return {time,temperature:direct?.r.values.temp2??interpolate(rows,point,height,'temp2'),gust:direct?.r.values.gust??interpolate(rows,point,height,'gust')};}).filter(r=>finite(r.temperature));
 memo.set(key,out);if(memo.size>24)memo.delete(memo.keys().next().value);return out;
}
function temperatureAt(point,height,time){
 const a=series(point,height,time-20*MIN,time);return a.at(-1)?.temperature??NaN;
}
function gridField(id,now=Date.now()){
 const g=surface?.grid,t=g?.times?.[id]*1000;if(!g||!finite(t)||t>now||now-t>75*MIN||!g.fields[id])return null;
 if(!grids.has(id)){const b=atob(g.fields[id]),a=new Float32Array(g.nx*g.ny);for(let i=0;i<a.length;i++){const v=(b.charCodeAt(2*i)|b.charCodeAt(2*i+1)<<8)<<16>>16;a[i]=v===g.missing?NaN:v*g.scale;}grids.set(id,{grid:g,values:a,time:t});}return grids.get(id);
}
function gridValue(id,point,now=Date.now()){const f=gridField(id,now);if(!f)return NaN;const g=f.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);return x>=0&&x<g.nx&&y>=0&&y<g.ny?f.values[y*g.nx+x]:NaN;}
function cellAmount(packet,r,point){
 const g=packet.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(x<0||x>=g.nx||y<0||y>=g.ny)return NaN;
 if(r.encoding==='row-rle-v1'){try{const b=atob(r.rows[y]);let pos=0,value=NaN;if(b.length%4)return NaN;for(let i=0;i<b.length;i+=4){const count=b.charCodeAt(i)|b.charCodeAt(i+1)<<8,v=(b.charCodeAt(i+2)|b.charCodeAt(i+3)<<8)<<16>>16;if(!count)return NaN;if(x>=pos&&x<pos+count)value=v<0?NaN:v*g.scale;pos+=count;}return pos===g.nx?value:NaN;}catch{return NaN}}
 const n=(y*g.nx+x)*2,start=Math.floor(n/3)*4,b=atob(r.amount.slice(start,start+8)),i=n%3,v=(b.charCodeAt(i)|b.charCodeAt(i+1)<<8)<<16>>16;return v<0?NaN:v*g.scale;
}
function observedIntervals(point,start,end){
 if(!radar||!point)return [];
 return radar.intervals.filter(r=>r.start*1000>=start&&r.end*1000<=end).map(r=>({start:r.start*1000,end:r.end*1000,amount:cellAmount(radar,r,point),source:'DWD RADOLAN '+r.product}));
}
function accumulation(point,start,end){
 const rows=observedIntervals(point,start,end);let cursor=start,sum=0,covered=0,gaps=0;
 for(const r of rows){if(r.start!==cursor)gaps++;cursor=r.end;if(finite(r.amount)){sum+=r.amount;covered+=r.end-r.start;}else gaps++;}
 return {sum:covered?sum:NaN,covered,through:cursor,complete:covered===end-start&&!gaps&&cursor===end,rows};
}
function combineDayTemperature(observed,future,now){
 const samples=[...observed.filter(x=>x.time<=now).map(x=>({start:x.time,end:x.time,temperature:x.temperature,observed:true})),...future.filter(x=>x.end>now&&finite(x.temperature)&&!x.observed)];
 const valid=samples.filter(x=>finite(x.temperature));return {hi:valid.length?Math.max(...valid.map(x=>x.temperature)):NaN,lo:valid.length?Math.min(...valid.map(x=>x.temperature)):NaN,maxHour:valid.reduce((a,b)=>!a||b.temperature>a.temperature?b:a,null),minHour:valid.reduce((a,b)=>!a||b.temperature<a.temperature?b:a,null),observedCount:observed.length};
}
async function fetchPacket(branch,file,decode){const r=await fetch(URL+branch+'/'+file+'?t='+Math.floor(Date.now()/MIN),{signal:AbortSignal.timeout(18000),cache:'default'});if(!r.ok)throw Error('HTTP '+r.status);const a=await r.arrayBuffer(),b=new Uint8Array(a),d=b[0]===31&&b[1]===139?await new Response(new Blob([a]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(a));return decode(d,Date.now());}
function refresh(onChange,force=false){
 if(request)return request;if(!force&&Date.now()-lastCheck<2*MIN)return;lastCheck=Date.now();
 const accept=(kind,d)=>{const old=kind==='surface'?surface:radar;if(old&&old.generated>=d.generated)return;if(kind==='surface'){surface=d;grids.clear();}else radar=d;revision++;memo.clear();onChange?.();};
 request=Promise.allSettled([fetchPacket('mobile-observed-surface','surface-observations.json.gz',surfacePacket).then(d=>accept('surface',d)),fetchPacket('mobile-radar-history','radar-history.json.gz',radarPacket).then(d=>accept('radar',d))]).finally(()=>{request=null});return request;
}
const api={refresh,current,phaseAt,series,temperatureAt,gridField,gridValue,observedIntervals,accumulation,combineDayTemperature,interpolate,latestRows,surfacePacket,radarPacket,cellAmount,get revision(){return revision},get surface(){return surface},get radar(){return radar}};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WeatherObservation=api;
})(globalThis);
