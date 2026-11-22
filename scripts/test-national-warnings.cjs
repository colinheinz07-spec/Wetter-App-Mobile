const assert=require('node:assert/strict');
const w=require('../assets/national-warnings.js');
const t=100000;
assert.equal(w.alertStage({start:t-100,end:t+48*3600},t),'active');
assert.equal(w.alertStage({start:t+6*3600,end:t+30*3600},t),'upcoming');
assert.equal(w.alertStage({start:t+4*86400,end:t+5*86400},t),null);
assert.equal(w.alertStage({start:t-100,end:t},t),null);
assert.equal(w.alertStage({start:t-100,end:t+100,possible:true},t),'risk');
assert.equal(w.modelStage(11),'upcoming');assert.equal(w.modelStage(14),'upcoming');
assert.equal(w.modelStage(22),'risk');assert.equal(w.modelStage(1),'risk');
assert.equal(w.modelStage(255),null);assert.equal(w.modelStage(0),null);
assert.equal(w.fresh({schema:1,generated:t-1300},1200,t),false);
const outer=[[5,50],[8,50],[8,52],[5,52],[5,50]],hole=[[6,50.5],[7,50.5],[7,51.5],[6,51.5],[6,50.5]];
assert.equal(w.inPolygons([5.5,50.5],[[outer,hole]]),true);
assert.equal(w.inPolygons([6.5,51],[[outer,hole]]),false);
assert.equal(w.officialKind({event:'LEICHTER SCHNEEFALL'}),'snow');
assert.equal(w.officialKind({event:'WINDBÖEN'}),'wind');
assert.equal(w.officialKind({event:'STARKREGEN'}),'rain');
assert.equal(w.officialKind({event:'GEFRIERENDER REGEN'}),'freezing');
assert.equal(w.officialKind({event:'GLÄTTE'}),'ice');
assert.equal(w.officialKind({event:'FROST'}),'frost');
assert.equal(w.officialKind({event:'SCHWERES GEWITTER'}),'storm');
assert.notEqual(w.warningGlyph('snow'),w.warningGlyph('rain'));
const candidates=w.markerCandidates(),polygon=[[outer,hole]];
for(const event of ['FROST','SCHNEEFALL','WINDBÖEN','STARKREGEN'])w.collectOfficialMarkers(candidates,{event,level:2,polygons:polygon});
const markers=w.selectMarkers(candidates);
assert.ok(markers.length&&markers.length<=36);
assert.equal(new Set(markers.map(x=>x.kind)).size,4,'Every hazard type appears when there is room');
for(let i=0;i<markers.length;i++){assert.ok(w.inPolygons(markers[i].p,polygon),'Marker is within true warning polygon and not inside a hole');for(let j=0;j<i;j++)assert.ok(Math.hypot(markers[i].x-markers[j].x,markers[i].y-markers[j].y)>=54,'Markers may not overlap');}
assert.match(w.markerMarkup(markers[0]),/data-warning-kind=/);
const ps=[{start:t-100,end:t+10700},{start:t+30000,end:t+40800},{start:t+90000,end:t+100800}];
assert.deepEqual(w.pickPeriods({periods:ps},t,'all'),ps.slice(0,2));
assert.deepEqual(w.pickPeriods({periods:ps},t,'0-6'),ps.slice(0,1));
assert.deepEqual(w.pickPeriods({periods:ps},t,'6-12'),ps.slice(1,2));
require('../assets/basemap.js');require('../assets/geography.js');
const geo=w.mapGeometry(global.WEATHER_BASEMAP,global.WEATHER_EXTRA_GEO);
assert.ok(geo.outline.length>10000&&geo.states.length>10000,'Standalone Germany geometry is complete');
for(const [width,height] of [[320,420],[390,420],[768,600]]){
 const scale=Math.min(width/w.MAP_W,height/w.MAP_H),[x,y]=w.project(13.4,52.52);
 const p=w.unproject(x*scale+(width-w.MAP_W*scale)/2,y*scale+(height-w.MAP_H*scale)/2,width,height);
 assert.ok(Math.abs(p[0]-13.4)<1e-8&&Math.abs(p[1]-52.52)<1e-8,'Correct tap coordinates on letterboxed map');
 const original=w.mapView(),from=[width*.58,height*.48],to=[width*.47,height*.57],anchor=w.mapPoint(original,...from,width,height),zoomed=w.zoomMap(original,3,from,to,width,height),held=w.mapPoint(zoomed,...to,width,height);
 assert.ok(Math.abs(anchor[0]-held[0])<1e-8&&Math.abs(anchor[1]-held[1])<1e-8,'Pinch keeps geographic anchor even when fingers move');
 const panned=w.panMap(zoomed,15,-12,width,height);assert.notEqual(panned.cx,zoomed.cx);assert.notEqual(panned.cy,zoomed.cy);
 const edge=w.panMap(zoomed,100000,100000,width,height);assert.equal(edge.x,0);assert.equal(edge.y,0);
 assert.equal(w.mapView(50).zoom,w.MAX_ZOOM);assert.equal(w.mapView(.5).zoom,1);
}
assert.match(require('node:fs').readFileSync('assets/national-map.svg','utf8'),/viewBox="0 0 600 780"/);
// Simulate a WebView without an initialized main app, canvas context,
// ResizeObserver or a working fetch. The ground map must already exist.
const vm=require('node:vm'),fs=require('node:fs'),elements=new Map(),handlers=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',classList:{contains:()=>false},querySelector:el,querySelectorAll:s=>id==='national-warning'&&s==='[data-nw-stage]'?['active','upcoming','risk'].map(k=>Object.assign(el('tab-'+k),{dataset:{nwStage:k}})):[],addEventListener(e,fn){handlers.set(id+':'+e,fn)},setAttribute(k,v){this[k]=v},getBoundingClientRect:()=>({width:390,height:420,left:0,top:0}),style:{setProperty(){}}});return elements.get(id)};
const mobile=vm.createContext({document:{getElementById:el,documentElement:{dataset:{theme:'light'}}},setInterval(){},setTimeout,clearTimeout,console,Date,AbortController,TextDecoder,atob,WEATHER_BASEMAP:global.WEATHER_BASEMAP,WEATHER_EXTRA_GEO:global.WEATHER_EXTRA_GEO});
vm.runInContext(fs.readFileSync('assets/national-warnings.js','utf8'),mobile);
assert.match(el('national-warning').innerHTML,/src="assets\/national-map.svg"/);
assert.match(el('#nw-canvas').innerHTML,/<path d="M/,'Immediate independent SVG overlay before fetch');
const canvas=el('#nw-canvas'),zoomLabel=el('#nw-zoom-level');
assert.equal(canvas.viewBox,'0 0 600 780');handlers.get('#nw-zoom-plus:click')();assert.equal(zoomLabel.textContent,'1.6×');assert.notEqual(canvas.viewBox,'0 0 600 780');
handlers.get('#nw-zoom-reset:click')();assert.equal(canvas.viewBox,'0 0 600 780');
const touch=(a,b)=>({touches:[{clientX:a,clientY:210},{clientX:b,clientY:210}],cancelable:true,preventDefault(){}});
handlers.get('#nw-canvas:touchstart')(touch(155,235));handlers.get('#nw-canvas:touchmove')(touch(115,275));assert.equal(zoomLabel.textContent,'2×');
handlers.get('#nw-canvas:touchend')({touches:[]});const box=canvas.viewBox;handlers.get('#nw-canvas:touchstart')({touches:[{clientX:190,clientY:210}]});handlers.get('#nw-canvas:touchmove')({touches:[{clientX:220,clientY:240}],cancelable:true,preventDefault(){}});assert.notEqual(canvas.viewBox,box,'One-finger drag on zoomed map');
handlers.get('#nw-canvas:touchend')({touches:[]});handlers.get('#nw-zoom-reset:click')();assert.equal(canvas.viewBox,'0 0 600 780');
assert.equal(el('#nw-popup').hidden,true);
assert.doesNotMatch(el('national-warning').innerHTML,/id="nw-list"/);
// Inject independent sources and exercise the real refresh and map click code.
(async()=>{
 const now=Math.floor(Date.now()/1000),grid={west:5.5,south:47,step:.02,nx:481,ny:411};
 const frost=Buffer.alloc(grid.nx*grid.ny),empty=Buffer.alloc(frost.length);frost[150*grid.nx+125]=12;
 const layers=Object.fromEntries(['frost','wind','heat','fog','snow','freezing','ice','rain','storm'].map(k=>[k,(k==='frost'?frost:empty).toString('base64')]));
 const model={schema:1,generated:now,grid,models:[],periods:[{start:now-300,end:now+10500,layers},{start:now+10500,end:now+21300,layers}]};assert.equal(w.validRisk(model),true);
 let cells=[{id:'test',point:[8,50],polygons:[[[7.98,49.98],[8.02,49.98],[8.02,50.02],[7.98,50.02]]],path:[],lightning:5,speedKmh:42,rainFlag:2,rainMm:22,rainMinutes:30}];
 const urls=[];mobile.fetch=async url=>{urls.push(url);const d=url.includes('storm-tracks.json')?{schema:1,generated:now,observed:now-300,cells}:url.includes('national-risks.json.gz')?model:null;if(!d)throw Error('Unexpected request '+url);return {ok:true,arrayBuffer:async()=>Uint8Array.from(Buffer.from(JSON.stringify(d))).buffer}};
 await handlers.get('#nw-refresh:click')();
 assert.match(canvas.innerHTML,/data-storm-id="test"/);
 assert.match(canvas.innerHTML,/data-warning-kind="frost"/);
 // The earlier synthetic pinch suppresses subsequent clicks for 450 ms.
 await new Promise(resolve=>setTimeout(resolve,500));
 const tap=(kind,dataset)=>{const [x,y]=w.project(8,50),scale=Math.min(390/w.MAP_W,420/w.MAP_H);handlers.get('#nw-canvas:click')({clientX:x*scale+(390-w.MAP_W*scale)/2,clientY:y*scale+(420-w.MAP_H*scale)/2,target:{closest:s=>s===kind?{dataset}:null}})};
 tap('[data-storm-id]',{stormId:'test'});assert.equal(el('#nw-popup').hidden,false);assert.match(el('#nw-detail').innerHTML,/42 km\/h/);
 handlers.get('#nw-close:click')();assert.equal(el('#nw-popup').hidden,true);assert.equal(el('#nw-detail').innerHTML,'');
 handlers.get('tab-upcoming:click')();assert.match(canvas.innerHTML,/data-warning-kind="frost"/);
 tap('[data-warning-kind]',{warningLon:'8',warningLat:'50'});assert.match(el('#nw-detail').innerHTML,/Frost · L2/);
 handlers.get('tab-active:click')();assert.equal(el('#nw-popup').hidden,true);
 tap('[data-storm-id]',{stormId:'test'});cells=[];await handlers.get('#nw-refresh:click')();assert.doesNotMatch(canvas.innerHTML,/data-storm-id="test"/);assert.doesNotMatch(el('#nw-detail').innerHTML,/42 km\/h/);
 assert.equal(urls.length,4);assert.ok(urls.every(url=>!url.includes('official')&&!url.includes('Warnungen_Gemeinden')));
 console.log('PASS: warning map, zoom, tap-only detail, close, forecast markers, automatic storm removal and no official API');
})().catch(e=>{console.error(e);process.exitCode=1});
