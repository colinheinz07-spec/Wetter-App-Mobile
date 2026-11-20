const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const path of (process.argv.length>2?process.argv.slice(2):['assets/app.js'])){
 const src=fs.readFileSync(path,'utf8');
 const cut=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
 const part=cut('function phaseCodeFromModel','function localRadarPhaseDetail')+cut('const radarModelCellCache=','function refreshOwnRadarViews');
 const now=Date.now(),time=now-300000,run=new Date(now-3600000).toISOString(),g={nx:2,ny:2,west:8,south:50,step:1,scale:.01,missing:-32768};
 const canvas=()=>({getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(im){this.im=im}}}});
 const ctx=vm.createContext({console,Date,Math,Number,Map,Set,Uint8Array,Uint32Array,Uint8ClampedArray,atob,document:{createElement:canvas},now,time,run,g,
  prepareLiveArea(){},mapModelRuns(model){return model==='ICON-D2'?[{model,run,generated:run,grid:g,hours:[0],frames:{0:{temp2:'x',ww:'x'}}}]:[]},modelRuns:()=>[],modelAgeLimit:()=>12,mapLeadTime:(d,h)=>Date.parse(d.run)+h*3600000,
  fetchNativeMapModel(){},realModelValue:(d,p,lon)=>p.id==='ww'?(lon===8?71:61):NaN,
  packedCell:(s,n)=>Buffer.from(s,'base64').readInt16LE(n*2),
  rate:Buffer.from([100,0,200,0,100,0,0,0]).toString('base64'),phase:Buffer.from([7,3,6,0]).toString('base64')});
 const ev=s=>vm.runInContext(s,ctx);
 ev(part);
 assert.equal(ev('radarPhaseModels(time).length'),1);
 ev('const models=radarPhaseModels(time)');
 assert.equal(ev('radarModelPhase(models,8,50)'),7);
 assert.equal(ev('radarModelPhase(models,9,50)'),3);
 assert.equal(ev('phaseCodeFromModel(61,NaN,-1,NaN,90)'),3);
 assert.equal(ev('phaseCodeFromModel(NaN,NaN,-3,NaN,90)'),7);
 assert.equal(ev('phaseCodeFromModel(NaN,NaN,NaN,NaN,NaN)'),1);
 ev('const frame={grid:g,time,phaseTime:time,rateFactor:1,amount:rate,classes:phase,key:"fixture",models}');
 assert.equal(ev('ownRadarPixel(frame,[8,50]).code'),7);
 assert.equal(ev('ownRadarPixel(frame,[8,50]).rate'),1);
 assert.equal(ev('ownRadarPixel(frame,[9,50]).code'),3);
 assert.equal(ev('ownRadarPixel(frame,[8,51]).code'),6);
 assert.equal(ev('ownRadarPixel(frame,[9,51]).code'),0);
 assert.equal(ev('ownRadarPixel({...frame,classes:null},[8,50]).estimated'),true);
 assert.ok(ev('ownRadarRaster(frame)'));
 assert.ok(!src.includes('function ensureRadarImage'));
 console.log(path+': phase, OPERA rate, model fallback, raster, no WMS: 12 checks PASS');
}
