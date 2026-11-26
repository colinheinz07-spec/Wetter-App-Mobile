// Keep the nationwide, 24-frame RV JSON (roughly 83 MB uncompressed) off
// the UI thread. Return only a point series or an explicitly requested scan.
let dataset=null,loading=null,checked=0;
function valid(d){
 const g=d?.grid;if(d?.schema!==1||d.product!=='RV'||d.intervalMinutes!==5||!Number.isFinite(Date.parse(d.time))||!g||!Number.isInteger(g.nx)||!Number.isInteger(g.ny)||g.nx<2||g.ny<2||g.nx*g.ny>3000000||g.scale!==.01||g.missing!==-32768||!Number.isFinite(g.west)||!Number.isFinite(g.south)||!(g.step>0))return false;
 const len=4*Math.ceil(g.nx*g.ny*2/3);let count=0;for(let h=5;h<=120;h+=5)if(typeof d.frames?.[h]==='string'&&d.frames[h].length===len)count++;return count>0;
}
const fresh=(d,now)=>d&&Date.parse(d.time)<=now&&now-Date.parse(d.time)<=25*60000;
async function load(urls,now){
 if(loading)return loading;
 if(now-checked<60000)return fresh(dataset,now)?dataset:null;
 checked=now;
 loading=(async()=>{for(const url of urls)try{
  const r=await fetch(url,{signal:AbortSignal.timeout(30000),cache:'default',credentials:'omit'});if(!r.ok)continue;
  const raw=await r.arrayBuffer(),b=new Uint8Array(raw);
  const d=b[0]===31&&b[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(raw));
  if(valid(d)&&fresh(d,now)){dataset=d;return d}
 }catch{}return fresh(dataset,now)?dataset:null})().finally(()=>{loading=null});
 return loading;
}
function sample(s,n){
 const i=n*2,offset=Math.floor(i/3)*4,shift=i%3;
 const b=atob(s.slice(offset,offset+(shift===2?8:4)));
 return btoa(b.slice(shift,shift+2));
}
function pointPacket(d,p){
 const g=d.grid,x=Math.round((p[0]-g.west)/g.step),y=Math.round((p[1]-g.south)/g.step);
 if(x<0||x>=g.nx||y<0||y>=g.ny)return null;
 const frames={},len=4*Math.ceil(g.nx*g.ny*2/3);for(let h=5;h<=120;h+=5)if(typeof d.frames?.[h]==='string'&&d.frames[h].length===len)frames[h]=sample(d.frames[h],y*g.nx+x);
 return {schema:1,product:'RV',intervalMinutes:5,time:d.time,grid:{...g,west:g.west+x*g.step,south:g.south+y*g.step,nx:1,ny:1},frames,pointOnly:true};
}
self.onmessage=async({data:m})=>{
 try{
  const d=await load(m.urls,m.now);let result=null;
  if(d&&m.type==='point'&&Array.isArray(m.point))result=pointPacket(d,m.point);
  if(d&&m.type==='frame'){
   const base=Date.parse(d.time),lead=(m.time-base)/60000,amount=d.frames[lead];
   if(typeof amount==='string'&&amount.length===4*Math.ceil(d.grid.nx*d.grid.ny*2/3)&&lead>=5&&lead<=120&&lead%5===0)result={time:m.time,grid:d.grid,amount,source:'RV · Prognose',forecast:true,key:'fc/'+base+'/'+lead};
  }
  self.postMessage({id:m.id,result});
 }catch{self.postMessage({id:m.id,result:null})}
};
