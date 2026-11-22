const assert=require('node:assert/strict');
const w=require('../assets/national-warnings.js');
const t=100000;
assert.equal(w.alertStage({start:t-100,end:t+48*3600},t),'active');
assert.equal(w.alertStage({start:t+6*3600,end:t+30*3600},t),'active');
assert.equal(w.alertStage({start:t+24*3600,end:t+30*3600},t),'upcoming');
assert.equal(w.alertStage({start:t+72*3600,end:t+80*3600},t),'upcoming');
assert.equal(w.alertStage({start:t+4*86400,end:t+5*86400},t),null);
assert.equal(w.alertStage({start:t-100,end:t},t),null);
assert.equal(w.alertStage({start:t-100,end:t+100,possible:true},t),'risk');
assert.equal(w.modelStage(11),'active');assert.equal(w.modelStage(14),'active');
assert.equal(w.modelStage(22),'risk');assert.equal(w.modelStage(1),'risk');
assert.equal(w.modelStage(255),null);assert.equal(w.modelStage(0),null);
const smallGrid={west:7,south:50,step:.02,nx:3,ny:2};
const smallPeriod=(start,code,temp)=>{const b=Buffer.alloc(12);for(let i=0;i<6;i++)b.writeInt16LE(temp*10,i*2);return {start,end:start+10800,decoded:{frost:Uint8Array.from([code,code,0,code,0,0])},metricValues:{frost:b.toString('latin1')}}};
const merged=w.groupWarnings([smallPeriod(t,11,-1),smallPeriod(t+10800,12,-6),smallPeriod(t+21600,0,2),smallPeriod(t+32400,11,-3)],smallGrid,'frost',0,'active');
assert.equal(merged.length,2);assert.equal(merged[0].end,t+21600);assert.equal(merged[0].code,12);assert.match(merged[0].summary,/-6 bis -1 °C/);
assert.doesNotMatch(merged[0].summary,/Umkreis/);
// Same connected warning extends into other regions; their extrema must
// never contaminate actual local numbers (Westerwald versus mountains).
const local=(start,temps)=>{const p=smallPeriod(start,11,0),b=Buffer.alloc(12);temps.forEach((v,i)=>b.writeInt16LE(v*10,i*2));p.metricValues.frost=b.toString('latin1');return p};
const localEvent=w.groupWarnings([local(t,[-1,-15,0,-12,0,0]),local(t+10800,[-3,-14,0,-11,0,0])],smallGrid,'frost',0,'active')[0];
assert.match(localEvent.summary,/-3 bis -1 °C/);assert.doesNotMatch(localEvent.summary,/-15|-12/);
const amountPeriod=(start,k,v,version=2)=>{const b=Buffer.alloc(12);for(let i=0;i<6;i++)b.writeInt16LE(v*10,i*2);return {start,end:start+10800,metricVersion:version,decoded:{[k]:Uint8Array.from([11,11,0,0,0,0])},metricValues:{[k]:b.toString('latin1')}}};
assert.match(w.groupWarnings([amountPeriod(t,'snow',2),amountPeriod(t+10800,'snow',3)],smallGrid,'snow',0,'active')[0].summary,/5 cm im angegebenen Zeitraum/);
assert.match(w.groupWarnings([amountPeriod(t,'rain',21),amountPeriod(t+10800,'rain',22)],smallGrid,'rain',0,'active')[0].summary,/43 l\/m²/);
assert.doesNotMatch(w.groupWarnings([amountPeriod(t,'snow',12,1)],smallGrid,'snow',0,'active')[0].summary,/12 cm/);
assert.match(w.groupWarnings([amountPeriod(t,'durationrain',30,1)],smallGrid,'durationrain',0,'active')[0].summary,/keine verfügbaren Modellwerte/);
const ice=amountPeriod(t,'ice',0);ice.metricValues.iceCause=amountPeriod(t,'iceCause',3).metricValues.iceCause;
assert.match(w.groupWarnings([ice],smallGrid,'ice',0,'active')[0].summary,/überfrierende Nässe, Schneeglätte/);
const storm=amountPeriod(t,'storm',0);for(const [k,v] of [['stormwind',85],['stormrain',32],['stormhour',19],['hail',1]]){const p=amountPeriod(t,k,v);storm.metricValues[k]=p.metricValues[k];storm.decoded[k]=p.decoded[k]}
const stormSummary=w.groupWarnings([storm],smallGrid,'storm',0,'active')[0].summary;
assert.match(stormSummary,/85 km\/h/);assert.match(stormSummary,/Hagel möglich/);assert.match(stormSummary,/19 l\/m² in einer Stunde/);
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
assert.deepEqual(w.pickPeriods({periods:ps},t,'now'),ps.slice(0,1));
assert.deepEqual(w.eventsInWindow(merged,[{start:t+10800,end:t+21600}]),merged.slice(0,1));
assert.equal(w.eventsInWindow(merged,[{start:t+10800,end:t+21600}])[0].start,t);
assert.deepEqual([2,3,4,5,6,7,9,10,0,1,8,255].map(w.radarKind),['rain','rain','freezing','freezing','mixed','snow','hail','hail','precip','precip','precip','precip']);
const radarPhase={time:1234567,grid:smallGrid,raw:String.fromCharCode(7,3,6,4,9,255)};
assert.equal(w.radarPhaseCode(radarPhase,[7,50],1234567),7);
assert.equal(w.radarPhaseCode(radarPhase,[7,50],1234567+300001),null);
require('../assets/basemap.js');require('../assets/geography.js');
const geo=w.mapGeometry(global.WEATHER_BASEMAP,global.WEATHER_EXTRA_GEO);
assert.ok(geo.outline.length>10000&&geo.states.length>10000,'Standalone Germany geometry is complete');
assert.equal(geo.districts.length,401);
assert.ok(geo.neighbors.length>1000);
assert.equal(w.districtAt(geo,[7.95,50.65]).name,'Westerwaldkreis');
assert.equal((w.gridContour(Uint8Array.from([1,1,1,1]),2,2,1).match(/M/g)||[]).length,1,'Adjacent cells share one seamless polygon');
assert.equal((w.gridContour(Uint8Array.from([1,1,1,1,0,1,1,1,1]),3,3,1).match(/M/g)||[]).length,2,'Polygon preserves interior hole');
assert.equal((w.gridContour(Uint8Array.from([1,0,0,1]),2,2,1).match(/M/g)||[]).length,2,'Diagonal cells do not invent a connecting area');
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
 const frost=Buffer.alloc(grid.nx*grid.ny),empty=Buffer.alloc(frost.length),metric=Buffer.alloc(frost.length*2);for(let i=0;i<frost.length;i++)metric.writeInt16LE(-32768,i*2);for(let y=130;y<=170;y++)for(let x=105;x<=145;x++){const i=y*grid.nx+x;frost[i]=12;metric.writeInt16LE(x<125?-40:-20,i*2)}
 const layers=Object.fromEntries(['frost','wind','heat','fog','snow','freezing','ice','rain','storm'].map(k=>[k,(k==='frost'?frost:empty).toString('base64')]));
 const metrics={frost:metric.toString('base64')},model={schema:1,generated:now,grid,models:[],periods:[{start:now-300,end:now+10500,layers,metrics},{start:now+10500,end:now+21300,layers,metrics}]};assert.equal(w.validRisk(model),true);
 let cells=[{id:'test',point:[8,50],polygons:[[[7.98,49.98],[8.02,49.98],[8.02,50.02],[7.98,50.02]]],path:[],lightning:5,speedKmh:42,rainFlag:2,rainMm:22,rainMinutes:30}];
 const wg={west:5.5,south:47,step:.04,nx:241,ny:206},wf=Buffer.alloc(wg.nx*wg.ny),we=Buffer.from(wf);for(let y=65;y<=85;y++)for(let x=52;x<=72;x++)wf[y*wg.nx+x]=11;
 const wl=Object.fromEntries(Object.keys(layers).map(k=>[k,(k==='frost'?wf:we).toString('base64')]));
 const watch={schema:1,generated:now,grid:wg,models:[],periods:[{start:now+90000,end:now+100800,layers:wl}]};
 const urls=[];mobile.fetch=async url=>{urls.push(url);const d=url.includes('storm-tracks.json')?{schema:1,generated:now,observed:now-300,cells}:url.includes('national-risks.json.gz')?model:url.includes('national-watches.json.gz')?watch:null;if(!d)throw Error('Unexpected request '+url);return {ok:true,arrayBuffer:async()=>Uint8Array.from(Buffer.from(JSON.stringify(d))).buffer}};
 await handlers.get('#nw-refresh:click')();
 assert.match(canvas.innerHTML,/data-storm-id="test"/);
 assert.match(canvas.innerHTML,/data-warning-kind="frost"/);
 // The earlier synthetic pinch suppresses subsequent clicks for 450 ms.
 await new Promise(resolve=>setTimeout(resolve,500));
 const tap=(kind,dataset)=>{const [x,y]=w.project(8,50),scale=Math.min(390/w.MAP_W,420/w.MAP_H);handlers.get('#nw-canvas:click')({clientX:x*scale+(390-w.MAP_W*scale)/2,clientY:y*scale+(420-w.MAP_H*scale)/2,target:{closest:s=>s===kind?{dataset}:null}})};
 tap('[data-storm-id]',{stormId:'test'});assert.equal(el('#nw-popup').hidden,false);assert.match(el('#nw-detail').innerHTML,/42 km\/h/);
 handlers.get('#nw-close:click')();assert.equal(el('#nw-popup').hidden,true);assert.equal(el('#nw-detail').innerHTML,'');
 assert.match(el('#nw-type-tiles').innerHTML,/data-nw-kind="frost"/);
 handlers.get('#nw-type-tiles:click')({target:{closest:()=>({dataset:{nwKind:'frost'}})}});
 tap('[data-warning-kind]',{warningLon:'8',warningLat:'50'});assert.match(el('#nw-detail').innerHTML,/Luftfrost · L2/);
 assert.match(el('#nw-detail').innerHTML,/Am ausgewählten Ort wird Luftfrost erwartet/);assert.match(el('#nw-detail').innerHTML,/-2 °C/);assert.doesNotMatch(el('#nw-detail').innerHTML,/-4 bis/);assert.match(canvas.innerHTML,/class="nw-districts"/);
 assert.equal((el('#nw-detail').innerHTML.match(/Luftfrost · L2/g)||[]).length,1);
 assert.doesNotMatch(canvas.innerHTML,/data-storm-id="test"/);
 await handlers.get('tab-upcoming:click')();
 assert.match(el('#nw-type-tiles').innerHTML,/data-nw-kind="frost"/);
 tap('[data-warning-kind]',{warningLon:'8',warningLat:'50'});assert.match(el('#nw-detail').innerHTML,/Luftfrost · L1/);
 assert.match(el('#nw-detail').innerHTML,/Möglichkeit/);
 handlers.get('tab-active:click')();assert.equal(el('#nw-popup').hidden,true);
 tap('[data-storm-id]',{stormId:'test'});cells=[];await handlers.get('#nw-refresh:click')();assert.doesNotMatch(canvas.innerHTML,/data-storm-id="test"/);assert.doesNotMatch(el('#nw-detail').innerHTML,/42 km\/h/);
 assert.equal(urls.length,5);assert.ok(urls.every(url=>!url.includes('official')&&!url.includes('Warnungen_Gemeinden')));
 console.log('PASS: warning map, zoom, tap-only detail, close, forecast markers, automatic storm removal and no official API');
})().catch(e=>{console.error(e);process.exitCode=1});

