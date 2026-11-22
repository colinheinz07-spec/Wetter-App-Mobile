'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  const context=await browser.newContext({viewport:{width:768,height:1024},timezoneId:'Europe/Berlin',colorScheme:'dark',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const now=Math.floor(Date.now()/60000)*60;
  const station={id:'fixture-berlin',name:'Berlin Testmessstelle',lon:13.405,lat:52.52,height:40,time:now,values:{temp2:-2,phase:7,cloud:100,wind:10,gust:20,rh2:95}};
  const g={west:5.5,south:47,step:.02,nx:481,ny:411,scale:.1,missing:-32768},pack=v=>{const b=Buffer.alloc(g.nx*g.ny*2);for(let i=0;i<b.length;i+=2)b.writeInt16LE(-32768,i);for(let y=270;y<280;y++)for(let x=390;x<400;x++)b.writeInt16LE(v,(y*g.nx+x)*2);return b.toString('base64')};
  const packet={schema:1,product:'DWD-SYNOP-observations',generated:now,rows:[station,{...station,time:now-3600,values:{...station.values,temp2:3}}],grid:{...g,fields:{temp2:pack(-20),wind:pack(100),cloud:pack(1000)},times:{temp2:now,wind:now,cloud:now}}};
  await page.route(/^https?:\/\//,async route=>{if(route.request().url().includes('mobile-observed-surface/surface-observations.json.gz'))return route.fulfill({json:packet,headers:{'access-control-allow-origin':'*'}});return route.abort()});
  await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('.hero .condition')?.textContent.includes('Schneefall'),{},{timeout:20000});
  assert.match(await page.locator('.hero .temp').innerText(),/-2/);
  assert.match(await page.locator('#weather-left').innerText(),/Heutige Wetterbilanz/);
  assert.match(await page.locator('.hero .live-temp-source').innerText(),/DWD SYNOP/);
  await page.locator('#navigation button[data-page="warnings"]').click();
  assert.match(await page.locator('#local-warning-list').innerText(),/Luftfrost/);
  assert.match(await page.locator('#local-warning-list').innerText(),/Aktuell beobachtet/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'iPad overflow');
  assert.deepEqual(errors,[]);await context.close();console.log('PASS: iPad-sized real app, independent SYNOP phase, actual balance and observed frost warning');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
