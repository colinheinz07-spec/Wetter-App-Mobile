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
}
assert.match(require('node:fs').readFileSync('assets/national-map.svg','utf8'),/viewBox="0 0 600 780"/);
// Simulate a WebView without an initialized main app, canvas context,
// ResizeObserver or a working fetch. The ground map must already exist.
const vm=require('node:vm'),fs=require('node:fs'),elements=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',classList:{contains:()=>false},querySelector:el,querySelectorAll:()=>[],addEventListener(){},setAttribute(){}});return elements.get(id)};
const mobile=vm.createContext({document:{getElementById:el,documentElement:{dataset:{theme:'light'}}},setInterval(){},console,Date,AbortController,WEATHER_BASEMAP:global.WEATHER_BASEMAP,WEATHER_EXTRA_GEO:global.WEATHER_EXTRA_GEO});
vm.runInContext(fs.readFileSync('assets/national-warnings.js','utf8'),mobile);
assert.match(el('national-warning').innerHTML,/src="assets\/national-map.svg"/);
assert.match(el('#nw-canvas').innerHTML,/<path d="M/,'Immediate independent SVG overlay before fetch');
console.log('PASS: active / future / conditional, expiry, 24h horizon, polygon holes, time filtering and stale data');
