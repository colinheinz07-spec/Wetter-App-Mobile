'use strict';
// No external dependencies; changes to the forecast engine must still parse.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const source=fs.readFileSync('assets/app.js','utf8');
const baseCss=fs.readFileSync('assets/base.css','utf8');
const css=fs.readFileSync('assets/mobile-design.css','utf8');
const files=['index.html','assets/app.js','assets/base.css','assets/basemap.js','assets/geography.js','assets/hazards.js','assets/mobile-design.css'];
const size=files.reduce((n,f)=>n+fs.statSync(f).size,0);
assert.ok(size<4*1024*1024,'SPCK files grew beyond 4 MiB: '+size);
assert.ok(!fs.existsSync('data'),'Large data/ directory must not be included in mobile project');
for(const f of ['assets/basemap.js','assets/geography.js','assets/hazards.js']){
 new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});
}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(match=>match[1].trim().length>0);
assert.equal(scripts.length,0,'The weather runtime should be in assets/app.js, not repeated inline');
new vm.Script(source,{filename:'assets/app.js'});
const links=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(assets\/[^"]+)"/g)].map(x=>x[1].replace(/[?].*$/,''));
for(const asset of links)assert.ok(fs.existsSync(asset),'Missing referenced asset: '+asset);
for(const label of ['page-weather','page-map','page-warnings','page-hazards','page-expert','page-settings','page-info','weather-left','weather-right','expert-data']){
 assert.ok(html.includes('id="'+label+'"'),'Lost UI section '+label);
}
for(const label of ['ICON-D2','ICON-EU','IFS','GFS','AIFS','rainTotal','radarNowcastData','modelComparison','rain6','rain24','s06','srh03','t850','t700','t500','lcl','lfc','el','PWAT']){
 assert.ok(source.includes(label),'Lost model, radar or forecast feature: '+label);
}
for(const label of ['Gefühlte Temperatur (Näherung)','Taupunktdifferenz','Nächste 6 Stunden','Nächste 24 Stunden','Wolkenobergrenze','Windstärke']){
 assert.ok(source.includes(label),'Missing verified supplementary value: '+label);
}
assert.ok(source.includes('dataRoot=')&&source.includes('colinheinz07-spec/Wetter-App/main/data/'),'Weather grids must stay remote');
assert.ok(!source.includes('groups.push(...realExpertGroups(point,now,f))'),'Expensive expert tiles should not be constructed twice on home');
assert.ok(css.includes('prefers-reduced-motion')&&css.includes('data-theme=light'),'Accessibility theme lost');
assert.ok(baseCss.includes('.nav')&&baseCss.includes('.hero'),'Legacy UI baseline lost');
assert.ok(html.includes('assets/mobile-design.css')&&html.includes('assets/base.css')&&html.includes('assets/app.js'),'CSS/JS resources not loaded');
const begin=source.indexOf('function modelComfort('),end=source.indexOf('const displayValue=',begin);
assert.ok(begin>0 && end>begin,'Expected meteorological comfort index helpers');
const {modelComfort,windBeaufort}=vm.runInNewContext(source.slice(begin,end)+'\n({modelComfort,windBeaufort})');
const chill=modelComfort(0,30,80);
assert.ok(chill.value < -5 && chill.value > -8,chill);
assert.ok(Number.isNaN(modelComfort(20,10,75).value),'Invalid-range comfort estimate must be missing, not fabricated');
assert.ok(modelComfort(32,10,70).value>32,'Hot humid air heat index expected');
assert.equal(windBeaufort(0),0);
assert.equal(windBeaufort(35),5);
assert.equal(windBeaufort(120),12);
// No accidental entire-model downloads on mobile startup, forecasts or map navigation.
assert.equal(source.split('fetchRealModel(').length-1,1,'Only the optional definition of full-grid loader may remain; never call it automatically');
for(const name of ['snowWater','snowDensity','extraPressureLevels=[1000,975,950,900,800,600,400,150,100]','for(const lev of [1000,975,950,925,900,850,800,700,600,500,400,300,250,200,150,100]']){
 assert.ok(source.includes(name),'Missing optional model field or pressure catalogue: '+name);
}
const solarStart=source.indexOf('function localSolarTimes('),solarEnd=source.indexOf('const realPoint=',solarStart);
assert.ok(solarStart>0&&solarEnd>solarStart,'Solar calculations missing');
const solarTimes=vm.runInNewContext(source.slice(solarStart,solarEnd)+'\nlocalSolarTimes',{localDay:at=>new Date(at).toISOString().slice(0,10)});
const summer=solarTimes([13.405,52.52],Date.parse('2026-06-21T12:00:00Z'));
assert.ok(summer&&summer.hours>16&&summer.hours<18,'Berlin summer daylight is out of range');
const fmtBerlin=d=>new Date(d).toLocaleTimeString('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit'});
assert.ok(/^04:/.test(fmtBerlin(summer.rise)),'Wrong summer sunrise '+fmtBerlin(summer.rise));
assert.ok(/^21:/.test(fmtBerlin(summer.set)),'Wrong summer sunset '+fmtBerlin(summer.set));

console.log('PASS: full app JS, assets, light/dark CSS, core weather modules, metrics, size '+(size/1e6).toFixed(2)+' MB');
