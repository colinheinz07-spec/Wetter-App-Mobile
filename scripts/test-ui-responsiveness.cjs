const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(fs.existsSync('assets/app.js')?'assets/app.js':'index.html','utf8');
const chunk=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b));
(async()=>{
 // Actual OPERA resolution; all cells wet, with a known snowy model phase.
 const nx=1601,ny=1201,amount=Buffer.alloc(nx*ny*2);
 for(let i=0;i<amount.length;i+=2)amount.writeInt16LE(100,i);
 const jobs=[],counters={paint:0,notify:0,home:0},panel={getBoundingClientRect:()=>({top:10000,bottom:11000})};
 const ctx=vm.createContext({Map,Math,Number,atob,performance,console,innerHeight:800,activePage:'weather',counters,panel,
  document:{hidden:false,querySelector:()=>panel,createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:im=>{counters.paint++;assert.deepEqual(Array.from(im.data.slice(0,4)),[243,106,186,224]);assert.deepEqual(Array.from(im.data.slice(-4)),[243,106,186,224])}})})},
  setTimeout:fn=>{jobs.push(fn);return jobs.length},renderHomeMaps:()=>counters.home++,scheduleMap:()=>counters.notify++,radarRevision:0,radarModelPhase:()=>7,
  grid:{nx,ny,west:2,south:45,step:.01,scale:.01},amount:amount.toString('base64')});
 vm.runInContext(chunk('let homePreviewObserver=','function deferHomeMaps')+chunk('const ownRadarCache=','function ownRadarSource'),ctx);
 const ev=s=>vm.runInContext(s,ctx);
 ev("scheduleHomeMaps();scheduleHomeMaps()");assert.equal(jobs.length,0,'offscreen previews never schedule a render');
 panel.getBoundingClientRect=()=>({top:100,bottom:300});
 ev("scheduleHomeMaps();scheduleHomeMaps();scheduleHomeMaps()");assert.equal(jobs.length,1);jobs.shift()();assert.equal(counters.home,1);
 ev("activePage='map';const frame={key:'full',grid,amount,rateFactor:1,models:[]};radarModelPhase=()=>7");
 assert.equal(ev("ownRadarRaster(frame)"),null);assert.equal(counters.paint,0,'large raster must yield before painting');
 ev("ownRadarRaster(frame)");assert.equal(jobs.length,1,'same raster cannot enqueue duplicate work');
 let slices=0;while(jobs.length){jobs.shift()();slices++;assert.ok(slices<2000)}
 assert.ok(slices>1,'full-size paint cooperatively yields');assert.equal(counters.paint,1);assert.equal(counters.notify,1);
 assert.ok(ev("ownRadarRaster(frame)"));assert.equal(jobs.length,0,'completed raster reused');
 ev("ownRadarRaster({...frame,key:'old'});ownRadarRaster({...frame,key:'new'})");
 while(jobs.length)jobs.shift()();assert.equal(counters.paint,2,'superseded work never publishes');
 console.log('Full-size OPERA: '+slices+' cooperative slices; correct edge pixels, single render, cancellation, and no offscreen redraw: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
