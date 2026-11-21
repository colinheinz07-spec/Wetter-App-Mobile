const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/nowcast-worker.js','utf8');
(async()=>{
 const now=Date.parse('2026-11-21T08:00:00Z'),base=now-5*60000;
 const grid={west:7,south:50,step:1,nx:2,ny:2,scale:.01,missing:-32768};
 const pack=v=>{const b=Buffer.alloc(8);v.forEach((n,i)=>b.writeInt16LE(n,i*2));return b.toString('base64')};
 const frames=Object.fromEntries(Array.from({length:24},(_,i)=>[(i+1)*5,pack([i+1,100+i,-32768,0])]));
 const fixture={schema:1,product:'RV',time:new Date(base).toISOString(),grid,intervalMinutes:5,frames};
 const sent=[];let reads=0;
 const ctx=vm.createContext({Date,atob,btoa,TextDecoder,AbortSignal,Uint8Array,Math,Number,
  fetch:async()=>{reads++;return {ok:true,arrayBuffer:async()=>new TextEncoder().encode(JSON.stringify(fixture)).buffer}},
  self:{postMessage:m=>sent.push(m)}});
 vm.runInContext(source,ctx);
 const req=(id,type,detail)=>ctx.self.onmessage({data:{id,type,now,urls:['https://example.invalid/rv'],...detail}});
 await Promise.all([req(1,'point',{point:[8,50]}),req(2,'point',{point:[7,51]})]);
 const one=sent.find(m=>m.id===1).result,two=sent.find(m=>m.id===2).result;
 assert.equal(one.grid.nx,1);assert.equal(one.grid.ny,1);assert.equal(one.pointOnly,true);
 assert.equal(Buffer.from(one.frames[5],'base64').readInt16LE(),100);
 assert.equal(Buffer.from(one.frames[120],'base64').readInt16LE(),123);
 assert.equal(Buffer.from(two.frames[5],'base64').readInt16LE(),-32768);
 assert.equal(reads,1,'point requests share one dataset');
 await req(3,'frame',{time:base+15*60000});
 assert.equal(sent.at(-1).result.amount,frames[15]);assert.equal(sent.at(-1).result.forecast,true);
 await req(4,'frame',{time:base+16*60000});assert.equal(sent.at(-1).result,null);
 await req(5,'point',{point:[0,0]});assert.equal(sent.at(-1).result,null);
 assert.equal(reads,1,'map frames reuse worker dataset');
 console.log('Nowcast worker: 24 exact point samples, missing values, one fetch, on-demand exact map frame: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
