// Small deterministic network fixtures, no multi-gigabyte checkout required.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=process.cwd(),fixed=new Date('2026-11-19T18:30:00Z'),run='2026-11-19T12:00:00.000Z',scan='2026-11-19T18:20:00Z';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1sAAAAASUVORK5CYII=';
const modelNames={'icon-d2':'ICON-D2','icon-eu':'ICON-EU','ifs':'IFS','ifs-short':'IFS','gfs':'GFS','aifs':'AIFS','aifs-ens-control':'AIFS-ENS Control'};
const packed=n=>{const b=Buffer.alloc(8);for(let i=0;i<4;i++)b.writeInt16LE(n,i*2);return b.toString('base64')};
const keys=['temp2','dew','wind','slp','cloud','rainTotal','mlcape','gust','ww','winddir'];
const values={temp2:100,dew:60,wind:140,slp:10100,cloud:750,mlcape:750,gust:400,ww:3,winddir:1800};
const radarGrid={west:2,south:45,step:.01,nx:1601,ny:1201,scale:.01,missing:-32768};
const radarBytes=Buffer.alloc(radarGrid.nx*radarGrid.ny*2);for(let i=0;i<radarBytes.length;i+=2)radarBytes.writeInt16LE(70,i);
const operaPacket={schema:1,product:'OPERA-RATE',time:scan,grid:radarGrid,amount:radarBytes.toString('base64')};
const grid={west:8,south:48,step:6,nx:2,ny:2,scale:.1,missing:-32768};
const fieldValue=(k,h)=>packed(k==='rainTotal'?h*2:values[k]??100);
const manifest=(file,point=false)=>{
 const model=modelNames[file.replace(/-de$/,'')],step=model==='ICON-D2'||model==='ICON-EU'?1:6,max=step===1?120:240;
 const hours=Array.from({length:max/step+1},(_,i)=>i*step),fields=keys.filter(k=>!(file==='icon-d2-de'&&k==='mlcape'&&!point));
 return {schema:point?3:2,model,run,generated:run,hours,grid,...(point?{tileSize:8}:{}),frames:Object.fromEntries(hours.map(h=>[h,fields])),scales:Object.fromEntries(fields.map(k=>[k,k==='mlcape'||k==='ww'?1:.1]))};
};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile())return res.writeHead(404).end();
 res.setHeader('Content-Type',p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'application/octet-stream');fs.createReadStream(p).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH|| (fs.existsSync(chromium.executablePath())?chromium.executablePath():'/usr/bin/chromium'),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await page.clock.setFixedTime(fixed);const errors=[],requests=[];
  let releaseAnalysis,groundFallback=false;const analysisGate=new Promise(resolve=>releaseAnalysis=resolve);
  const analysisRun='2026-11-19T18:00:00Z',analysisFields=['temp2','dew','wind','winddir','gust','rh2','slp','cloud'];
  const analysisManifest={schema:1,product:'ruc-surface-analysis',model:'ICON-D2-RUC',gridMapping:'native-triangular-cells',coordScale:.00001,scale:.1,terrainScale:1,tileStep:1,missing:-32768,run:analysisRun,generated:scan,fields:analysisFields,tiles:['13_52'],gust:{run:analysisRun,valid:analysisRun,intervalMinutes:0}};
  const coord=n=>{const b=Buffer.alloc(4);b.writeInt32LE(n);return b.toString('base64')},n16=n=>{const b=Buffer.alloc(2);b.writeInt16LE(n);return b.toString('base64')};
  const analysisValues={temp2:-12,dew:-20,wind:80,winddir:900,gust:192,rh2:900,slp:10120,cloud:850};
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
   const u=new URL(route.request().url()),p=u.pathname;
   if(u.origin===url)return route.continue();
   requests.push(u.href);
   const json=data=>route.fulfill({headers:{'access-control-allow-origin':'*'},json:data});
   if(p.endsWith('/generated-live-ruc/index.json'))return json(analysisManifest);
   if(p.endsWith('/generated-live-ruc/tile-13_52.json.gz'))return analysisGate.then(()=>json({schema:1,key:'13_52',run:analysisRun,generated:scan,count:1,lon:coord(1340500),lat:coord(5252000),terrain:n16(35),values:Object.fromEntries(analysisFields.map(k=>[k,n16(analysisValues[k])]))}));
   const native=p.match(/generated-native-([^/]+)\/(index\.json|point-index\.json|point-0-0\.json\.gz|(\d+)-(\w+)\.json\.gz)$/);
   const point=p.match(/generated-points-([^/]+)\/(?:anchor\/)?(point-index\.json|point-0-0\.json\.gz)$/);
   if(native||point){
    const [,file,item,h,k]=native||point,m=manifest(file,item.startsWith('point-'));
    if(item==='index.json'||item==='point-index.json')return json(m);
    if(item==='point-0-0.json.gz')return json({schema:3,run,generated:run,key:'0-0',frames:Object.fromEntries(m.hours.map(h=>[h,Object.fromEntries(m.frames[h].map(k=>[k,fieldValue(k,h)]))]))});
    if(h)return json({schema:2,run,generated:run,hour:+h,field:k,values:fieldValue(k,+h)});
   }
   if(p.endsWith('/opera-radar.json.gz'))return json(operaPacket);
   if(p.endsWith('/radar-phase.json.gz'))return groundFallback?route.fulfill({status:404,headers:{'access-control-allow-origin':'*'}}):json({schema:1,product:'HymecNG',time:scan,grid:{west:8,south:48,step:6,nx:2,ny:2,missing:255},classes:Buffer.from([7,7,7,7]).toString('base64')});
   if(u.hostname==='api.brightsky.dev'&&p==='/weather')return json({weather:[{timestamp:analysisRun,source_id:1,condition:groundFallback?'snow':'rain'}],sources:[{id:1,observation_type:groundFallback?'current':'forecast',wmo_station_id:'10384',station_name:'Berlin',lat:52.52,lon:13.405,height:35}]});
   if(u.hostname==='opendata.dwd.de')return route.fulfill({headers:{'access-control-allow-origin':'*'},body:'<a href="composite_rv_20261119_1820.tar">Radar</a>'});
   if(u.hostname==='maps.dwd.de'){
    if(u.searchParams.get('request')==='GetMap'&&Date.parse(u.searchParams.get('time'))===Date.parse(scan)+90*60000)return route.fulfill({status:404});
    return route.fulfill({contentType:'image/png',body:Buffer.from(png,'base64')});
   }
   if(p.endsWith('/stations.json'))return json({schema:1,stations:[],radarBase:scan,radarImage:{time:scan,bounds:[2,45,18,57],png}});
   if(p.endsWith('/live-imagery.json'))return json({schema:1,products:{reflectivity:{time:scan,bounds:[2,45,18,57],png,source:'DWD'},satellite:{time:scan,bounds:[2,45,18,57],png,source:'EUMETSAT'}}});
   if(p.endsWith('/doppler-data/index.json'))return json({schema:1,sites:[{site:'ess',time:scan,lon:7,lat:51,elevation:.5,file:'ess-20261119T182000Z.json'}]});
   if(p.endsWith('/doppler-data/ess-20261119T182000Z.json'))return json({schema:1,site:'ess',time:scan,lon:7,lat:51,elevation:.5,bounds:[5,49,9,53],png,source:'DWD VRADH · ESS'});
   return route.fulfill({status:404,headers:{'access-control-allow-origin':'*'}});
  });
  await page.goto(url+'/index.html');
  await page.waitForFunction(()=>document.querySelector('.hero .live-temp-source'));
  assert.ok(!(await page.locator('.hero .temp').innerText()).includes('10'),'forecast temperature must not appear as current while the measured local analysis is pending');
  releaseAnalysis();
  await page.waitForFunction(()=>document.querySelector('.hero .temp')?.textContent.startsWith('-1'));
  assert.match(await page.locator('.hero .metrics').innerText(),/Böen · Ortsanalyse[\s\S]*19,2[\s\S]*diagnostizierte Böe/);
  assert.match(await page.locator('.hero .live-temp-source').innerText(),/ICON-D2-RUC.*Originalzelle/);
  assert.ok(!requests.some(s=>/api\.brightsky\.dev\/(sources|synop)/.test(s)),'must never query a nearby station');
  await page.waitForFunction(()=>[...document.querySelectorAll('.hour-scroll .hour strong')].some(e=>e.textContent.trim()==='10°'));
  await page.waitForFunction(()=>document.querySelector('.hero .condition')?.textContent==='Schneefall');
  assert.equal((await page.locator('.hour-scroll .hour strong').first().innerText()).trim(),'-1°');
  assert.match(await page.locator('.hour-scroll .hour').first().innerText(),/Schneefall/);
  assert.match(await page.locator('#hour-detail').innerText(),/Temperatur aktuell\s*-1 °C/);
  assert.match(await page.locator('#hour-detail').innerText(),/Wetter aktuell\s*Schneefall/);
  assert.equal((await page.locator('.hour-scroll .hour strong').nth(1).innerText()).trim(),'10°');
  await page.locator('[data-page="expert"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-expert-availability="ICON-D2"]')?.textContent.includes('Originalraster verfügbar'));
  assert.ok(await page.locator('[data-expert-help]').count()>=60);
  await page.locator('[data-expert-help="SBCAPE"]').click();
  assert.match(await page.locator('#parameter-help-description').innerText(),/Auftriebsenergie/);
  assert.equal(await page.locator('#parameter-help-dialog').evaluate(e=>e.open),true);
  await page.locator('#parameter-help-close').click();
  assert.equal(await page.locator('#parameter-help-dialog').evaluate(e=>e.open),false);
  await page.locator('[data-page="map"]').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Originalraster');
  await page.locator('.map-settings-fold summary').click();
  await page.locator('#map-parameter').selectOption('mlcape');
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Originalraster');
  // Germany's preferred manifest deliberately omitted CAPE; the original
  // same-model global grid must supply it without a legacy bulk download.
  const capeRequests=()=>requests.filter(s=>/generated-native-icon-d2\/\d+-mlcape\.json\.gz/.test(s));
  await page.waitForFunction(()=>document.querySelector('#map-layer-title').textContent==='MLCAPE');
  await page.waitForTimeout(500);
  assert.ok(capeRequests().some(s=>s.includes('/7-mlcape.json.gz')));
  assert.ok(capeRequests().some(s=>s.includes('/8-mlcape.json.gz')),'next frame should be prefetched');
  await page.locator('#map-parameter-help').click();
  assert.match(await page.locator('#parameter-help-description').innerText(),/gemittelten Luftpakets/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#parameter-help-dialog').evaluate(e=>e.open),false);
  await page.locator('#map-next').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Originalraster');
  assert.equal(capeRequests().filter(s=>s.includes('/8-mlcape.json.gz')).length,1);
  await page.locator('#map-back').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Originalraster');
  assert.equal(capeRequests().filter(s=>s.includes('/7-mlcape.json.gz')).length,1);
  await page.locator('#map-full-open').click();
  await page.locator('#map-info-toggle').click();
  assert.match(await page.locator('#map-info-summary').innerText(),/gemittelten Luftpakets/);
  await page.locator('#map-info-close').click();await page.locator('#map-full-close').click();
  // A viewport-independent radar request must be used for zoom and fullscreen.
  await page.locator('[data-map-source="live"]').click();
  await page.locator('#map-live-layer').selectOption('radar');
  await page.locator('#map-nowcast-now').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Eigenes Radar');
  const currentRadar=()=>requests.filter(s=>new URL(s).pathname.endsWith('/opera-radar.json.gz'));
  const count=currentRadar().length;assert.equal(count,1);
  await page.locator('#map-zoom-plus').click();await page.locator('#map-zoom-plus').click();
  await page.waitForTimeout(350);assert.equal(currentRadar().length,count);
  await page.locator('#map-full-open').click();await page.waitForTimeout(350);assert.equal(currentRadar().length,count);
  await page.locator('#map-nowcast-forward').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Radar wird geladen …');
  assert.ok(!requests.some(s=>new URL(s).hostname==='maps.dwd.de'),'numeric radar must never request DWD WMS images');
  await page.locator('[data-full-layer="reflectivity"]').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Beobachtung');
  await page.locator('[data-full-layer="satellite"]').click();
  await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='Beobachtung');
  await page.locator('[data-full-layer="doppler"]').click();
  await page.waitForFunction(()=>document.querySelector('#map-layer-title').textContent.includes('Doppler')&&document.querySelector('#map-data-notice').textContent==='Beobachtung');
  assert.match(await page.locator('#map-interval').innerText(),/kein Tornadonachweis/);
  assert.equal(requests.filter(s=>new URL(s).pathname.endsWith('/live-imagery.json')).length,1);
  assert.ok(!requests.some(s=>/\/main\/data\/(icon-d2|icon-eu|ifs|gfs|aifs)\.json(?:\.gz)?(?:\?|$)/.test(s)),'no all-fields country package when the native packets suffice');
  // Simulate the real failure: classification delivery expires but wet radar
  // and a fresh ground report still confirm snow; forecast rain cannot.
  groundFallback=true;
  await page.evaluate(async()=>{await caches.delete('wetter-live-radar-v1')});
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('.hero .condition')?.textContent==='Schneefall'&&document.querySelector('.hero').textContent.includes('Bodenbeobachtung Berlin'));
  await page.waitForFunction(()=>document.querySelector('.hour-scroll .hour strong')?.textContent.trim()==='-1°');
  assert.match(await page.locator('.hour-scroll .hour').first().innerText(),/Schneefall/);
  assert.match(await page.locator('.hero').innerText(),/Bodenbeobachtung Berlin/);
  assert.deepEqual(errors,[]);
  console.log('Mobile UI: expert explanation/X/Escape, original grid fallback, next-step prefetch, field reuse, radar zoom/fullscreen reuse, no forecast/measurement substitution, imagery reuse and no bulk package: OK');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
