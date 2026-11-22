'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  const context=await browser.newContext({viewport:{width:768,height:1024},timezoneId:'Europe/Berlin',colorScheme:'dark',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const now=Math.floor(Date.now()/60000)*60;
  const station={id:'fixture-berlin',name:'Berlin Testmessstelle',lon:13.405,lat:52.52,height:40,time:now,values:{temp2:-2,dew:-2.3,phase:7,cloud:100,wind:10,gust:20,rh2:95}};
  const g={west:5.5,south:47,step:.02,nx:481,ny:411,scale:.1,missing:-32768},pack=v=>{const b=Buffer.alloc(g.nx*g.ny*2);for(let i=0;i<b.length;i+=2)b.writeInt16LE(-32768,i);for(let y=270;y<280;y++)for(let x=390;x<400;x++)b.writeInt16LE(v,(y*g.nx+x)*2);return b.toString('base64')};
  const packet={schema:1,product:'DWD-SYNOP-observations',generated:now,rows:[station,{...station,time:now-3600,values:{...station.values,temp2:3}}],grid:{...g,fields:{temp2:pack(-20),wind:pack(100),cloud:pack(1000)},times:{temp2:now,wind:now,cloud:now}}};
  const full=v=>{const b=Buffer.alloc(g.nx*g.ny*2);for(let i=0;i<b.length;i+=2)b.writeInt16LE(v,i);return b.toString('base64')};
  const analysis={schema:1,product:'ruc-surface-map',run:now-1800,generated:now,grid:g,fields:{temp2:full(20),dew:full(15),rh2:full(980),wind:full(50),winddir:full(900)}};
  const cloud={schema:1,product:'DWD-METEOSAT-CTH',time:now-600,generated:now,grid:g,cloud:Buffer.alloc(g.nx*g.ny,100).toString('base64')};
  await page.route(/^https?:\/\//,async route=>{const url=route.request().url(),d=url.includes('mobile-observed-surface/surface-observations.json.gz')?packet:url.includes('analysis-map.json.gz')?analysis:url.includes('satellite-cloud.json.gz')?cloud:null;if(d)return route.fulfill({json:d,headers:{'access-control-allow-origin':'*'}});return route.abort()});
  await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('.hero .condition')?.textContent.includes('Schneefall'),{},{timeout:20000});
  assert.match(await page.locator('.hero .temp').innerText(),/-2/);
  assert.match(await page.locator('#weather-left').innerText(),/Heutige Wetterbilanz/);
  assert.match(await page.locator('.hero .live-temp-source').innerText(),/DWD SYNOP/);
  await page.locator('#navigation button[data-page="warnings"]').click();
  assert.match(await page.locator('#local-warning-list').innerText(),/Luftfrost/);
  assert.match(await page.locator('#local-warning-list').innerText(),/Aktuell beobachtet/);
  await page.waitForFunction(()=>WeatherObservation.mapField('temp2')?.kind==='analysis');
  assert.equal(await page.evaluate(()=>WeatherObservation.mapValue('temp2',[7.95,50.65])),2,'Westerwald has an analysis value even without a station');
  assert.equal(await page.evaluate(()=>WeatherObservation.mapValue('wind',[7.95,50.65])),5);
  assert.equal(await page.evaluate(()=>WeatherObservation.fogAt([7.95,50.65],400)?.state),'risk');
  assert.match(await page.locator('#local-warning-list').innerText(),/Nebelpotenzial/);
  await page.locator('[data-page="map"]').click();await page.locator('[data-map-source="live"]').click();
  await page.locator('#map-live-layer').selectOption('temperature');await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='DWD · +0 h Analyse');
  assert.match(await page.locator('#map-interval').innerText(),/Flächendeckende aktuelle/);
  await page.locator('#map-live-layer').selectOption('wind');await page.waitForFunction(()=>document.querySelector('#map-data-notice').textContent==='DWD · +0 h Analyse');
  await page.locator('#map-live-layer').selectOption('satellite');await page.waitForFunction(()=>document.querySelector('#map-layer-title').textContent==='Satellitenwolken + Niederschlagsradar');
  assert.match(await page.locator('#map-valid').innerText(),/Satellit:.*Radar:/);
  assert.equal(await page.evaluate(()=>WeatherObservation.sampleField(WeatherObservation.cloudField(),[7.95,50.65])),100);
  await page.screenshot({path:'ui-ipad-live-satellite.png'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'iPad overflow');
  assert.deepEqual(errors,[]);await context.close();console.log('PASS: iPad-sized real app, independent SYNOP phase, actual balance and observed frost warning');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
