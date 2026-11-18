'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let errors=[],failures=[];
 for(const width of [360,390,768]){
  const context=await browser.newContext({viewport:{width,height:844},timezoneId:'Europe/Berlin',reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(width+': '+e.message));
  await page.route(/^https?:\/\//,route=>route.abort());
  await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
  await page.waitForTimeout(450);
  assert.equal(await page.locator('#navigation button[data-page]').count(),5,'Expected five sections');
  assert.ok(await page.locator('#page-weather .hero').count(), 'Weather hero not rendered');
  assert.ok(await page.locator('#welcome-date').textContent(),'Localized day should be shown');
  assert.ok(await page.locator('#page-weather .home-shortcuts button').count()===3,'Home shortcuts missing');
  const dimensions=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,nav:document.querySelector('#navigation').getBoundingClientRect().width}));
  if(dimensions.document>dimensions.viewport+3)failures.push(width+'px horizontal overflow '+JSON.stringify(dimensions));
  await page.locator('#navigation button[data-page="hazards"]').click();
  assert.ok(await page.locator('#page-hazards.active').count(),'Hazards menu not activated');
  await page.locator('[data-hazard-tab="water"]').click();
  assert.equal(await page.locator('#hazard-water').isVisible(),true,'Flood area missing');
  await page.locator('#navigation button[data-page="expert"]').click();
  assert.ok(await page.locator('#expert-data details').count()>2,'Expert groups lost');
  await page.locator('#navigation button[data-page="weather"]').click();
  assert.ok(await page.locator('#page-weather.active .forecast').count(),'7-day forecast missing');
  await page.screenshot({path:'ui-'+width+'.png',fullPage:true});
  await context.close();
 }
 await browser.close();
 assert.deepEqual(failures,[],'Responsive overflow regression');
 assert.deepEqual(errors,[],'JS runtime error');
 console.log('PASS: 360 / 390 / 768 px, navigation, weather, 7-day, road/flood and expert pages, no errors');
})().catch(e=>{console.error(e);process.exitCode=1});
