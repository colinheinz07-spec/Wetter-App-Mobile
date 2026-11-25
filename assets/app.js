(function(){
const uiPaths={pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',chevron:'<path d="m6 9 6 6 6-6"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',weather:'<path d="M12 2v2m-8 8H2m3-7 1.5 1.5M20 20H8a4 4 0 0 1-.7-7.9 6 6 0 0 1 11.2 1.1A3.5 3.5 0 0 1 20 20Z"/><path d="M8 9a4 4 0 0 1 6-3"/>',road:'<path d="M8 3 5 21M16 3l3 18M12 3v3m0 4v4m0 4v3"/>',map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',chart:'<path d="M4 4v16h16M7 14l4-4 4 3 5-7"/>',wind:'<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a2.5 2.5 0 1 1-2.5 2.5M3 16h8a3 3 0 1 1-3 3"/>',drop:'<path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',pressure:'<circle cx="12" cy="12" r="9"/><path d="m12 12 4-4M6 12h1m10 0h1M12 6v1"/>',eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>'};
const ui=(name,size=20,cls='')=>'<svg class="'+cls+'" aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+uiPaths[name]+'</svg>';
const weather=(key,label='',tooltip='')=>WeatherIcons.render(key,label,tooltip);
const el=id=>document.getElementById(id);
const locations=[{"name":"Berlin","region":"Berlin","offset":0},{"name":"Hamburg","region":"Hamburg","offset":1},{"name":"München","region":"Bayern","offset":-1},{"name":"Köln","region":"Nordrhein-Westfalen","offset":3},{"name":"Frankfurt am Main","region":"Hessen","offset":2},{"name":"Stuttgart","region":"Baden-Württemberg","offset":2},{"name":"Dresden","region":"Sachsen","offset":-1},{"name":"Leipzig","region":"Sachsen","offset":0}];
const hours=[
 ['Jetzt',7,'05_stark_bewoelkt',10,0,18,35],['13 Uhr',8,'03_leicht_bewoelkt',5,0,17,32],['14 Uhr',8,'02_heiter',5,0,16,29],['15 Uhr',7,'04_wolkig',10,0,18,34],['16 Uhr',6,'16_schauer_1',45,.4,20,41],['17 Uhr',5,'12_regen_2',75,1.2,20,42],['18 Uhr',4,'65_regen_nacht',65,.7,19,38],['19 Uhr',4,'09_nachts_wolkig',20,0,17,32],['20 Uhr',3,'08_nachts_leicht_bewoelkt',10,0,13,24],['21 Uhr',2,'07_klare_nacht',5,0,10,18],['22 Uhr',1,'08_nachts_leicht_bewoelkt',5,0,8,15],['23 Uhr',1,'43_nebel',10,0,7,14]
];
const days=[
 ['Heute','15.11.',1,8,'05_stark_bewoelkt','Wolkig, später einzelne Regenschauer.',[['Vormittag',5,'05_stark_bewoelkt',10],['Nachmittag',8,'16_schauer_1',60],['Abend',4,'65_regen_nacht',65],['Nacht',1,'08_nachts_leicht_bewoelkt',10]]],
 ['Montag','16.11.',-1,5,'28_schneeregen_1','Kühl, zeitweise Schneeregen; morgens und in den frühen Abendstunden örtliche Glätte, besonders auf Nebenstrecken.',[['Vormittag',1,'28_schneeregen_1',70],['Nachmittag',5,'04_wolkig',25],['Abend',1,'27_schneeschauer_nacht',45],['Nacht',-1,'07_klare_nacht',10]]],
 ['Dienstag','17.11.',-2,4,'02_heiter','Nach frostiger Nacht zeitweise Sonnenschein.',[['Vormittag',0,'02_heiter',5],['Nachmittag',4,'01_sonnig',0],['Abend',0,'07_klare_nacht',0],['Nacht',-2,'07_klare_nacht',0]]],
 ['Mittwoch','18.11.',-1,3,'22_schnee_3','Vorübergehend Schneefall, örtlich kräftiger.',[['Vormittag',0,'21_schnee_2',80],['Nachmittag',3,'22_schnee_3',85],['Abend',1,'64_schneefall_nacht',70],['Nacht',-1,'09_nachts_wolkig',30]]],
 ['Donnerstag','19.11.',-2,5,'04_wolkig','Wechselnd bewölkt und überwiegend trocken.',[['Vormittag',0,'03_leicht_bewoelkt',10],['Nachmittag',5,'04_wolkig',20],['Abend',1,'09_nachts_wolkig',10],['Nacht',-2,'08_nachts_leicht_bewoelkt',5]]],
 ['Freitag','20.11.',1,8,'13_regen_3','Meist bedeckt mit zeitweiligem Regen.',[['Vormittag',3,'12_regen_2',80],['Nachmittag',8,'13_regen_3',90],['Abend',5,'65_regen_nacht',75],['Nacht',1,'10_nachts_bedeckt',40]]],
 ['Samstag','21.11.',4,10,'03_leicht_bewoelkt','Milder, zeitweise freundlich.',[['Vormittag',5,'04_wolkig',20],['Nachmittag',10,'02_heiter',10],['Abend',7,'09_nachts_wolkig',10],['Nacht',4,'08_nachts_leicht_bewoelkt',5]]]
];
let location=locations[0], selectedHour=0, openDay=-1, openPeriod=-1, activePage='weather', mapRegion='Deutschland', mapLayer='temp2';
const degrees=n=>n+location.offset+'°';
const metric=(icon,label,value,unit)=>'<div class="metric"><div class="metric-label">'+ui(icon,13)+label+'</div><strong>'+value+' <span>'+unit+'</span></strong></div>';
const simpleMetric=(icon,label,value,unit,desc)=>'<article class="mini"><div class="label">'+ui(icon,15)+label+'</div><b>'+value+' <span>'+unit+'</span></b><p>'+desc+'</p></article>';
const warningContent=()=>ui('alert',25)+'<div><b>Glättegefahr · Montag</b><div class="warning-window">05–09 Uhr &amp; 17–20 Uhr</div><p>Örtlich glatte Fahrbahnen, besonders auf Nebenstrecken und Brücken. Stufe 2 · Demo</p></div>';
const parameterValue=([label,value,unit='',desc=''])=>'<div class="parameter-value"><div class="p-label">'+label+'</div><strong>'+value+(unit?' <span>'+unit+'</span>':'')+'</strong>'+(desc?'<div class="p-desc">'+desc+'</div>':'')+'</div>';
const parameterGroup=([title,icon,items],i)=>'<details class="parameter-group" '+(i===0?'open':'')+'><summary><span class="group-icon">'+ui(icon,17)+'</span><span class="group-title">'+title+'</span><span class="group-count">'+items.length+' Werte</span>'+ui('chevron',16,'chev')+'</summary><div class="parameter-grid">'+items.map(parameterValue).join('')+'</div></details>';
const currentGroups=()=>{const now=homeCurrentSample();return [
 ['Temperatur & Feuchtigkeit','sun',[
  ['Lufttemperatur (2 m)',now.temp,'°C','Aktuell'],['Gefühlte Temperatur',now.feels,'°C','Windkühle'],['Taupunkt',now.temp-3,'°C','2 m'],['Relative Feuchtigkeit',81,'%'],['Lufttemperatur (5 cm)',now.temp-2,'°C','Knapp über Grund'],['Bodentemperatur (5 cm Tiefe)',now.temp-1,'°C'],['Temperatur (850 hPa)',-2,'°C','Freie Atmosphäre']
 ]],
 ['Niederschlag','drop',[
  ['Niederschlag aktuell',fmt(now.rate),'mm/h'],['Letzte 6 Stunden','0,0','mm'],['Letzte 24 Stunden','1,4','mm'],['Heute · 24 h','2,3','mm','Prognosesumme'],['Niederschlagswahrsch.','10','%','Aktuelle Stunde'],['Niederschlagsart',now.type==='none'?'Trocken':now.condition,'','Aktuell']
 ]],
 ['Wind & Luftdruck','wind',[
  ['Mittlerer Wind (10 m)',now.wind,'km/h'],['Windböen (10 m)',now.gust,'km/h'],['Windrichtung',Math.round(now.direction),'°'],['Luftdruck (NN)',1017,'hPa'],['Drucktendenz','+2','hPa/3 h'],['Wind (850 hPa)',42,'km/h']
 ]],
 ['Wolken, Nebel & Sicht','eye',[
  ['Gesamtbewölkung',85,'%'],['Tiefe Bewölkung',75,'%'],['Mittelhohe Wolken',40,'%'],['Hohe Wolken',15,'%'],['Wolkenuntergrenze',800,'m','Über Grund'],['Sichtweite',12,'km'],['Nebelwahrscheinlichkeit',10,'%']
 ]],
 ['Schnee, Frost & Glätte','weather',[
  ['Neuschnee heute',0,'cm/24 h'],['Neuschnee 6 h',0,'cm'],['Schneefallgrenze',750,'m'],['Nullgradgrenze',1000,'m'],['Frostwahrscheinlichkeit',5,'%','Aktuelle Stunde'],['Fahrbahntemperatur',now.temp-1,'°C','Beispiel; keine Messung'],['Fahrbahnzustand','Feucht','','Beispiel; keine Messung']
 ]],
 ['Sonne & Strahlung','sun',[
  ['Sonnenaufgang','07:35','Uhr'],['Sonnenuntergang','16:13','Uhr'],['Tageslänge','8 h 38','min'],['Sonnenschein heute','2,1','h','Prognose'],['UV-Index',1,'','Gering'],['Globalstrahlung',110,'W/m²']
 ]]
]};
function currentParameters(){const groups=currentGroups();return '<section class="panel parameter-panel"><div class="section-head"><div><h2>Wetter im Detail</h2><p>Aktuelle Mess- und Prognosewerte · Beispiel</p></div><span class="badge">'+groups.reduce((n,g)=>n+g[2].length,0)+' Werte</span></div><div class="parameter-groups">'+groups.map(parameterGroup).join('')+'</div></section>'}
const hourExtras=[
 [81,4,85,12,1017,'SW'],[76,4,30,15,1018,'SW'],[73,3,20,18,1018,'SW'],[78,3,60,14,1018,'SW'],[84,3,80,9,1018,'WSW'],[91,4,95,7,1019,'W'],[94,3,100,6,1019,'W'],[88,2,65,10,1020,'W'],[85,1,35,13,1020,'WNW'],[86,0,5,12,1021,'NW'],[90,-1,25,8,1021,'NW'],[99,1,80,.7,1021,'NW']
];
const dailyExtras=[
 {prec:[0,1.6,.7,0],snow:0,depth:0,wind:18,gust:42,dir:'SW–W',sun:'2,1',uv:1,pressure:1017,frost:'Gering'},
 {prec:[1.1,.2,.6,0],snow:1,depth:1,wind:15,gust:32,dir:'NW',sun:'1,0',uv:1,pressure:1020,frost:'Hoch'},
 {prec:[0,0,0,0],snow:0,depth:1,wind:9,gust:19,dir:'O',sun:'5,4',uv:1,pressure:1025,frost:'Hoch'},
 {prec:[1.5,2.4,1.1,0],snow:4,depth:5,wind:20,gust:48,dir:'O–SO',sun:'0,3',uv:0,pressure:1015,frost:'Hoch'},
 {prec:[0,0,0,0],snow:0,depth:3,wind:11,gust:26,dir:'S',sun:'2,0',uv:1,pressure:1019,frost:'Hoch'},
 {prec:[2,3.2,1.8,.2],snow:0,depth:0,wind:26,gust:55,dir:'SW',sun:'0,2',uv:0,pressure:1008,frost:'Gering'},
 {prec:[0,0,0,0],snow:0,depth:0,wind:17,gust:34,dir:'W',sun:'3,2',uv:1,pressure:1018,frost:'Gering'}
];
const fmt=n=>n.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
function renderWeather(){
 const welcome=el('welcome-date');if(welcome)welcome.textContent=new Date().toLocaleDateString('de-DE',{timeZone:'Europe/Berlin',weekday:'long',day:'numeric',month:'long'});
 el('location-name').textContent=location.name;el('location-region').textContent=[location.region,location.country||'Deutschland'].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' · ');
 document.querySelectorAll('[data-home-jump]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-home-jump]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});document.querySelector(b.dataset.homeJump)?.scrollIntoView({block:'start',behavior:'instant'})});
 if(weatherRealEnabled)return renderRealWeather();
  const h=hours[selectedHour],now=homeCurrentSample();const hero='<section class="panel hero"><div class="hero-head"><span class="tag">AKTUELL</span><span class="small" style="color:#c1d2e4">12:00 UTC · Demo</span></div><div class="hero-weather"><div><div class="temp">'+now.temp+'<span>°C</span></div><div class="condition">'+now.condition+'</div><div class="feels">Gefühlt '+now.feels+' °C</div></div>'+weather(now.icon,now.condition)+'</div><p class="hi-lo">Tiefstwert '+degrees(days[0][2])+' &nbsp;·&nbsp; Höchstwert '+degrees(days[0][3])+'</p><div class="metrics">'+metric('wind','Wind',now.wind,'km/h')+metric('wind','Böen',now.gust,'km/h')+metric('drop','Feuchte',81,'%')+'</div></section>';
  const hourly='<section class="panel hourly"><div class="section-head"><div><h2>Stundenverlauf</h2><p>Vorhersage für die nächsten Stunden</p></div><span class="badge">Stündlich</span></div><div class="hour-scroll">'+hours.map((a,i)=>'<button class="hour '+(selectedHour===i?'active':'')+'" data-hour="'+i+'" aria-pressed="'+(selectedHour===i)+'"><span class="hour-time">'+a[0]+'</span>'+weather(a[2],'')+'<strong>'+degrees(a[1])+'</strong><span class="rain">'+a[3]+' %</span></button>').join('')+'</div><div class="hour-detail" id="hour-detail">'+hourDetails(h)+'</div></section>';
  const warn='<button class="warning" id="go-warning">'+warningContent()+ui('chevron',18)+'</button>';
  el('weather-left').innerHTML=hero+hourly+warn;
  const forecast='<section class="panel forecast"><div class="section-head"><div><h2>7-Tage-Prognose</h2><p>Tippe auf einen Tag für mehr Details</p></div><span class="badge">7 Tage</span></div>'+days.map((d,i)=>dayRow(d,i)).join('')+'</section>';
  el('weather-right').innerHTML=forecast+currentParameters()+homeMapCards()+'<p class="demo-note">Designprototyp · Alle Werte und Warnungen sind frei erfunden.<br>Keine Wettervorhersage.</p>';
  renderHomeMaps();
  document.querySelectorAll('[data-hour]').forEach(b=>b.addEventListener('click',()=>{selectedHour=+b.dataset.hour;document.querySelectorAll('[data-hour]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});el('hour-detail').innerHTML=hourDetails(hours[selectedHour])}));
  document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{openDay=openDay===+b.dataset.day?-1:+b.dataset.day;renderWeather();if(openDay>=0)document.querySelector('[data-day="'+openDay+'"]').scrollIntoView({block:'nearest',behavior:'smooth'})}));
  el('go-warning').addEventListener('click',()=>setPage('warnings'));
}
function hourDetails(h){const e=hourExtras[hours.indexOf(h)];return [['Niederschlag',fmt(h[4])+' mm'],['Wind',h[5]+' km/h'],['Böen',h[6]+' km/h'],['Windrichtung',e[5]],['Taupunkt',degrees(e[1])+'C'],['Luftfeuchte',e[0]+' %'],['Bewölkung',e[2]+' %'],['Sichtweite',e[3].toLocaleString('de-DE')+' km'],['Luftdruck (NN)',e[4]+' hPa']].map(([label,value])=>'<div class="detail-item">'+label+'<b>'+value+'</b></div>').join('')}
// Forecast temperatures use the same rounded integer as the visible value.
// A distinct freezing band avoids assigning 0 °C to the green mild-weather band.
const forecastTempBands=[
 [-Infinity,'#8a217e','#ffffff'],
 [-19,'#c044a6','#ffffff'],
 [-14,'#254aae','#ffffff'],
 [-9,'#3875c7','#ffffff'],
 [-4,'#8fd5fa','#102e4a'],
 [1,'#167045','#ffffff'],
 [5,'#71c96a','#163a20'],
 [10,'#b9e884','#24390e'],
 [15,'#f8e68a','#493a10'],
 [20,'#f3ad54','#482d09'],
 [25,'#c45515','#ffffff'],
 [30,'#ff9a96','#491d1c'],
 [35,'#a92131','#ffffff'],
 [40,'#b51f69','#ffffff'],
 [45,'#811043','#ffffff']
];
function roundedForecastTemp(v){return Number.isFinite(v)?Math.sign(v)*Math.round(Math.abs(v))||0:NaN}
function forecastTempBand(v){
 const t=roundedForecastTemp(v);if(!Number.isFinite(t))return null;
 // The severe frost boundary is inclusive at -15, -10 and -5.
 if(t<=-20)return forecastTempBands[0];
 if(t<=-15)return forecastTempBands[1];
 if(t<=-10)return forecastTempBands[2];
 if(t<=-5)return forecastTempBands[3];
 if(t<=0)return forecastTempBands[4];
 for(let i=forecastTempBands.length-1;i>=5;i--)if(t>=forecastTempBands[i][0])return forecastTempBands[i];
 return forecastTempBands[5];
}
function forecastTemperature(v,role=''){
 const t=roundedForecastTemp(v),band=forecastTempBand(v),label=role==='low'?'Tiefstwert':role==='high'?'Höchstwert':'Temperatur';
 return '<span class="forecast-temperature '+role+(band?'':' forecast-temperature-missing')+'" aria-label="'+label+': '+(band?t+' Grad Celsius':'nicht verfügbar')+'"'+(band?' style="--forecast-temp-bg:'+band[1]+';--forecast-temp-fg:'+band[2]+'"':'')+'>'+(band?t+'°':'—')+'</span>';
}
function forecastTempGradient(lo,hi){
 const a=forecastTempBand(lo),b=forecastTempBand(hi);if(!a||!b)return '';
 return 'background:linear-gradient(90deg,'+a[1]+','+b[1]+')';
}

function dayRow(d,i){
 const left=(d[2]+3)/14*100,width=(d[3]-d[2])/14*100,extra=dailyExtras[i];
 const daysValues=[['Niederschlag (24 h)',fmt(extra.prec.reduce((a,b)=>a+b,0)),'mm'],['Max. Böen',extra.gust,'km/h'],['Mittlerer Wind',extra.wind,'km/h'],['Windrichtung',extra.dir],['Neuschnee',extra.snow,'cm/24 h'],['Schneehöhe',extra.depth,'cm'],['Sonnenschein',extra.sun,'h'],['UV-Index',extra.uv],['Mittl. Luftdruck',extra.pressure,'hPa'],['Frostgefahr',extra.frost]];
 const warning=i===1?'<span class="day-alert" title="Glättegefahr">'+ui('alert',14)+'</span>':'';
 const warningNote=i===1?'<div class="day-warning">'+ui('alert',17)+'<span>Glätte · 05–09 Uhr und 17–20 Uhr<br>Besonders auf Nebenstrecken und Brücken.</span></div>':'';
 return '<button class="day" data-day="'+i+'" aria-expanded="'+(openDay===i)+'"><div><div class="dayname">'+d[0]+warning+'</div><div class="daydate">'+d[1]+'</div></div>'+weather(d[4],d[5])+'<div class="tempgroup">'+forecastTemperature(d[2]+location.offset,'low')+'<div class="range"><div class="range-fill" style="left:'+left+'%;width:'+width+'%;'+forecastTempGradient(d[2]+location.offset,d[3]+location.offset)+'"></div></div>'+forecastTemperature(d[3]+location.offset,'high')+'</div>'+ui('chevron',18,'chev')+'</button>'+(openDay===i?'<div class="day-open"><p class="day-summary">'+d[5]+'</p>'+warningNote+'<div class="period-grid">'+d[6].map((p,j)=>'<div class="period"><span>'+p[0]+'</span>'+weather(p[2])+'<b>'+forecastTemperature(p[1]+location.offset)+'</b><span class="rain">'+p[3]+' %</span><span class="rain">'+fmt(extra.prec[j])+' mm</span>'+((i===1&&(j===0||j===2))?'<span class="period-risk">Glätte</span>':'')+'</div>').join('')+'</div><p class="section-label">Tageswerte</p><div class="day-values">'+daysValues.map(parameterValue).join('')+'</div></div>':'')
}
function setPage(page){if(page!=='map')stopPlay();activePage=page;document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));document.querySelectorAll('[data-page]').forEach(b=>{b.classList.toggle('active',b.dataset.page===page);if(b.dataset.page===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});window.scrollTo(0,0);if(weatherRealEnabled&&page==='weather')renderWeather();if(weatherRealEnabled&&page==='warnings')renderLocalWarnings();if(weatherRealEnabled&&page==='expert')renderRealExpert();if(page==='map'){renderMap();if(mapSource==='model'&&modelDataMode==='real')fetchMapAvailability(mapModel)}if(page==='hazards')window.WeatherHazards?.open()}
window.WEATHER_APP_CONTEXT={getLocation:()=>{
 const point=homeLocationPoint(location);
 return point?{...location,lon:point[0],lat:point[1]}:null;
}};
const nav=[['weather','Wetter','weather'],['map','Karte','map'],['warnings','Warnungen','alert'],['hazards','Gefahren','road'],['expert','Experten','chart']];
el('navigation').innerHTML=nav.map(([id,label,icon])=>'<button data-page="'+id+'" class="'+(id==='weather'?'active':'')+'" '+(id==='weather'?'aria-current="page"':'')+'>'+ui(icon,24)+label+'</button>').join('');
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
document.querySelectorAll('[data-quick-nav]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.quickNav)));
// Weather-independent map layer. Geometry: © GeoBasis-DE / BKG 2019 (VG250
// 31.12.2018, simplified and encoded); municipality points: Destatis GV3Q.
const BASEMAP = globalThis.WEATHER_BASEMAP;
const EXTRA_GEO = globalThis.WEATHER_EXTRA_GEO;
const germanPlaceNames={'Vienna':'Wien','Brussels':'Brüssel','Warsaw':'Warschau','Prague':'Prag','København':'Kopenhagen','Luxembourg':'Luxemburg','Strasbourg':'Straßburg','Zurich':'Zürich','Genève':'Genf','Geneva':'Genf','Liège':'Lüttich','Antwerp':'Antwerpen','Gent':'Gent','Wrocław':'Breslau','Szczecin':'Stettin','Gdańsk':'Danzig','Poznań':'Posen','Kraków':'Krakau','Plzeň':'Pilsen','Brno':'Brünn','Liberec':'Reichenberg'};
const mapPlaceRecords=[...BASEMAP.places,...EXTRA_GEO.places.map(p=>germanPlaceNames[p[0]]?[germanPlaceNames[p[0]],...p.slice(1),p[0]]:p)].sort((a,b)=>b[3]-a[3]);
let basemapDecoded=null,showDistricts=true,showPlaces=true,showRoads=true,showTerrain=true,showWater=true;
function decodeRing(encoded){
 let i=0,x=0,y=0,ring=[];
 function read(){let v=0,shift=0,c;do{c=encoded.charCodeAt(i++)-63;v+=(c&31)*2**shift;shift+=5}while(c>=32&&i<encoded.length);return v%2?-(v+1)/2:v/2}
 while(i<encoded.length){x+=read();y+=read();ring.push([x/1e4,y/1e4])}
 return ring;
}
function ringAreaCenter(ring){
 let area=0,cx=0,cy=0;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [x1,y1]=ring[j],[x2,y2]=ring[i],cross=x1*y2-x2*y1;area+=cross;cx+=(x1+x2)*cross;cy+=(y1+y2)*cross}
 return Math.abs(area)>1e-10?{area:Math.abs(area),center:[cx/(3*area),cy/(3*area)]}:{area:0,center:ring[0]};
}
function decodeArea(record){
 let [id,name,type,encoded]=record;
 let bounds=[Infinity,Infinity,-Infinity,-Infinity],center=null,largest=0;
 const rings=encoded.map(s=>{const coords=decodeRing(s),box=[Infinity,Infinity,-Infinity,-Infinity];for(const [lon,lat] of coords){box[0]=Math.min(box[0],lon);box[1]=Math.min(box[1],lat);box[2]=Math.max(box[2],lon);box[3]=Math.max(box[3],lat)}bounds[0]=Math.min(bounds[0],box[0]);bounds[1]=Math.min(bounds[1],box[1]);bounds[2]=Math.max(bounds[2],box[2]);bounds[3]=Math.max(bounds[3],box[3]);const a=ringAreaCenter(coords);if(a.area>largest){largest=a.area;center=a.center}return {coords,box}});
 return {id,name,type,rings,bounds,center:center||[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2]};
}
function basemapData(){return basemapDecoded||(basemapDecoded={states:BASEMAP.states.map(decodeArea),districts:BASEMAP.districts.map(decodeArea),germany:decodeArea(EXTRA_GEO.germany),europeBorders:EXTRA_GEO.europeBorders.map(s=>{const coords=decodeRing(s);return {coords,box:lineBounds(coords)}})})}
function visibleBox(box,b){return box[2]>=b.west&&box[0]<=b.east&&box[3]>=b.south&&box[1]<=b.north}
function pathRing(ctx,coords,b){if(!coords.length)return;const sx=b.w/(b.east-b.west),sy=b.h/(b.north-b.south);ctx.moveTo((coords[0][0]-b.west)*sx,(b.north-coords[0][1])*sy);for(let i=1;i<coords.length;i++)ctx.lineTo((coords[i][0]-b.west)*sx,(b.north-coords[i][1])*sy);ctx.closePath()}
function drawAdmin(ctx,features,b,color,width){
 ctx.beginPath();
 for(const f of features){if(!visibleBox(f.bounds,b))continue;for(const r of f.rings)if(visibleBox(r.box,b))pathRing(ctx,r.coords,b)}
 ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function drawBasemap(ctx,b){
 const data=basemapData(),detailed=mapRegion==='Deutschland'||mapZoom>=2.5;
 const coverage=detailedBoundaryTiles(b);
 ctx.save();if(coverage.length)clipBoundaryCoverage(ctx,b,coverage,true);
 ctx.beginPath();
 for(const f of data.europeBorders)if(visibleBox(f.box,b))pathLine(ctx,f.coords,b);
 ctx.lineJoin='round';ctx.lineWidth=2.4;ctx.strokeStyle='#fffaf1a0';ctx.stroke();ctx.lineWidth=1.45;ctx.strokeStyle='#141414e8';ctx.stroke();
 if(detailed){
  if(showDistricts&&mapZoom>=1.65)drawAdmin(ctx,data.districts,b,'#141414b8',mapZoom>=5?1.05:.8);
  drawAdmin(ctx,data.states,b,'#fffaf1bb',2.7);drawAdmin(ctx,data.states,b,'#171717',1.55);
 }
 drawAdmin(ctx,[data.germany],b,'#fffaf1e6',detailed?4.3:3.1);drawAdmin(ctx,[data.germany],b,'#080808',detailed?2.65:1.9);
 ctx.restore();drawOnlineBorders(ctx,b,coverage);
}
function labelCollision(box,occupied){return occupied.some(a=>box[0]<a[2]+3&&box[2]+3>a[0]&&box[1]<a[3]+3&&box[3]+3>a[1])}
function drawTextLabel(ctx,text,x,y,occupied,size=13,district=false){
 ctx.font=(district?'normal ':'bold ')+size+'px Arial,sans-serif';const width=ctx.measureText(text).width;
 const box=[x-1,y-size*.75,x+width+1,y+size*.75];
 if(box[0]<3||box[2]>mapView.w-3||box[1]<2||box[3]>mapView.h-2||labelCollision(box,occupied))return false;
 occupied.push(box);ctx.textBaseline='middle';ctx.textAlign='left';ctx.lineJoin='round';ctx.lineWidth=district?2.4:3.0;
 ctx.strokeStyle=terrainMode==='topo'?'#fffdf3eb':'#122436ee';ctx.strokeText(text,x,y);ctx.fillStyle=terrainMode==='topo'?(district?'#324034':'#151a19'):(district?'#d9e8f4':'#fff');ctx.fillText(text,x,y);return true;
}
function drawMapPlaces(ctx,b){
 const occupied=[],detailed=mapRegion==='Deutschland'||mapZoom>=2.5;
 const threshold=mapRegion==='Europa'&&mapZoom<2.5?500000:mapZoom<1.6?160000:mapZoom<2.6?65000:mapZoom<4.5?20000:mapZoom<7?6000:mapZoom<12?1800:mapZoom<17?500:0;
 if(showPlaces){
  for(const [name,lon,lat,pop] of mapPlaceRecords){if(pop<threshold)break;if(lon<b.west||lon>b.east||lat<b.south||lat>b.north)continue;const [x,y]=xy(lon,lat,b);if(!drawTextLabel(ctx,name,x+5,y-6,occupied,pop>=100000?14:12))continue;ctx.beginPath();ctx.arc(x,y,pop>=100000?2.7:1.8,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=.8;ctx.strokeStyle='#132a3a';ctx.stroke()}
  drawTilePlaces(ctx,b,occupied);
 }
 if(showDistricts&&detailed&&mapZoom>=3.3){
  for(const f of basemapData().districts){if(!visibleBox(f.bounds,b))continue;const [x,y]=xy(...f.center,b),label=(f.type==='Landkreis'?'LK ':f.type==='Kreis'?'Kreis ':'')+f.name;drawTextLabel(ctx,label,x-18,y+10,occupied,11,true)}
 }
 drawGeographicLabels(ctx,b,occupied);
 drawRoadLabels(ctx,b,occupied);
}
function mapSearch(query){
 const q=query.trim().toLocaleLowerCase('de-DE');if(q.length<2)return [];
 const places=mapPlaceRecords.filter(p=>p[0].toLocaleLowerCase('de-DE').includes(q)||(p[6]||'').toLocaleLowerCase('de-DE').includes(q)).slice(0,50).map(p=>({name:p[0],lon:p[1],lat:p[2],type:p[4]?'Ort · '+p[4]:'Gemeinde',zoom:15,exact:p[0].toLocaleLowerCase('de-DE')===q||(p[6]||'').toLocaleLowerCase('de-DE')===q}));
 const districts=basemapData().districts.filter(f=>f.name.toLocaleLowerCase('de-DE').includes(q)).map(f=>({name:f.name,lon:f.center[0],lat:f.center[1],type:f.type,zoom:6,exact:f.name.toLocaleLowerCase('de-DE')===q}));
 return [...places,...districts].sort((a,b)=>Number(b.exact)-Number(a.exact)).slice(0,8);
}
function districtAt(lon,lat){
 for(const f of basemapData().districts){
  const b=f.bounds;if(lon<b[0]||lon>b[2]||lat<b[1]||lat>b[3])continue;let inside=false;
  for(const {coords,box} of f.rings){if(lon<box[0]||lon>box[2]||lat<box[1]||lat>box[3])continue;for(let i=0,j=coords.length-1;i<coords.length;j=i++){const [x,y]=coords[i],[px,py]=coords[j];if((y>lat)!==(py>lat)&&lon<(px-x)*(lat-y)/(py-y)+x)inside=!inside}}
  if(inside)return f;
 }
 return null;
}

// Natural Earth public-domain context layers (generalized at 1:10m).
// These polygons describe named ranges, not a digital elevation model.
let geoCache=null;
function lineBounds(coords){
 let a=Infinity,b=Infinity,c=-Infinity,d=-Infinity;
 for(const [x,y] of coords){a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y)}
 return [a,b,c,d];
}
function contextGeo(){
 if(geoCache)return geoCache;
 const decodeLine=([name,rank,s])=>{const coords=decodeRing(s);return {name,rank,coords,box:lineBounds(coords)}};
 const decodePolygon=([name,rank,rings])=>{
  const paths=rings.map(decodeRing),largest=paths.reduce((a,b)=>ringAreaCenter(a).area>ringAreaCenter(b).area?a:b);
  return {name,rank,paths,box:lineBounds(paths.flat()),center:ringAreaCenter(largest).center};
 };
 return geoCache={rivers:EXTRA_GEO.rivers.map(decodeLine),lakes:EXTRA_GEO.lakes.map(decodePolygon),ranges:EXTRA_GEO.region.map(decodePolygon)};
}
function pathLine(ctx,coords,b){
 if(!coords.length)return;
 const a=xy(...coords[0],b);ctx.moveTo(...a);
 for(let i=1;i<coords.length;i++)ctx.lineTo(...xy(...coords[i],b));
}
function drawGeography(ctx,b){
 const {ranges,rivers,lakes}=contextGeo(),z=mapRegion==='Europa'?mapZoom/3:mapZoom;
 ctx.save();
 // The named range extents remain label anchors only. The visible relief
 // now comes from actual elevations, not generalized mountain polygons.
 if(showWater){
  const minRank=z<.8?5:z<1.8?7:z<4?9:12;
  ctx.beginPath();for(const f of rivers)if(f.rank<=minRank&&visibleBox(f.box,b))pathLine(ctx,f.coords,b);
  ctx.lineWidth=z>=3?1.2:.8;ctx.strokeStyle='#104e7788';ctx.stroke();
  for(const f of lakes){if(f.rank>minRank||!visibleBox(f.box,b))continue;ctx.beginPath();for(const p of f.paths)pathRing(ctx,p,b);ctx.fillStyle='#2a80b326';ctx.fill('evenodd');ctx.strokeStyle='#245e8d99';ctx.lineWidth=.8;ctx.stroke()}
 }
 ctx.restore();
}
const localRanges=[
 ['Eifel',6.62,50.28],['Westerwald',7.93,50.64],['Hunsrück',7.28,49.90],
 ['Taunus',8.32,50.24],['Sauerland',8.35,51.22],['Rothaargebirge',8.24,51.03],
 ['Schwarzwald',8.13,48.17],['Schwäbische Alb',9.38,48.38],['Rhön',9.91,50.48],
 ['Spessart',9.40,50.01],['Odenwald',8.85,49.64],['Thüringer Wald',10.71,50.67],
 ['Fichtelgebirge',11.91,50.03],['Bayerischer Wald',13.06,49.05],
 ['Teutoburger Wald',8.51,51.96],['Fränkische Alb',11.25,49.06],['Pfälzerwald',7.91,49.28]
];
function geoLabel(ctx,text,lon,lat,b,occupied,size=11){
 if(lon<b.west||lon>b.east||lat<b.south||lat>b.north)return false;
 const [x,y]=xy(lon,lat,b);return drawTextLabel(ctx,text,x+4,y,occupied,size,true);
}
function drawGeographicLabels(ctx,b,occupied){
 const z=mapRegion==='Europa'?mapZoom/3:mapZoom;if(!showTerrain&&!showWater)return;
 ctx.save();
 if(showTerrain){
  const {ranges}=contextGeo();
  for(const f of ranges)if((z>=1||f.rank<=3)&&visibleBox(f.box,b))geoLabel(ctx,f.name,...f.center,b,occupied,z>=2?12:11);
  if(z>=2)for(const [name,lon,lat] of localRanges)geoLabel(ctx,name,lon,lat,b,occupied,11);
  if(z>=3.5)for(const [name,lon,lat,elev,rank] of EXTRA_GEO.peaks){
   if(z<7&&rank>8)continue;if(geoLabel(ctx,name+' · '+elev+' m',lon,lat,b,occupied,11)){
    const [x,y]=xy(lon,lat,b);ctx.beginPath();ctx.moveTo(x-3,y+3);ctx.lineTo(x,y-3);ctx.lineTo(x+3,y+3);ctx.closePath();ctx.fillStyle='#f6eadb';ctx.fill();ctx.strokeStyle='#4c382c';ctx.stroke();
   }
  }
 }
 if(showWater&&z>=2){
  const {lakes,rivers}=contextGeo(),seen=new Set();
  for(const f of lakes){if(!f.name||f.rank>9||!visibleBox(f.box,b))continue;geoLabel(ctx,f.name,...f.center,b,occupied,10)}
  for(const f of rivers){
   if(!f.name||f.rank>8||seen.has(f.name)||!visibleBox(f.box,b))continue;
   const p=f.coords[Math.floor(f.coords.length/2)];if(geoLabel(ctx,f.name,...p,b,occupied,10))seen.add(f.name);
  }
 }
 ctx.restore();
}

// OpenFreeMap / OpenMapTiles / OpenStreetMap live vector tile overlay.
// Decode only the needed MVT layers; no external JavaScript, keys or routing.
const tileCache=new Map(),tilePending=new Set(),tileRetry=new Map();
let tileActive=[],tileQueue=[],tileLoading=0,tileViewKey='';
const MAX_TILE_CACHE=100;
const mvtText=new TextDecoder();
class MvtReader{
 constructor(bytes){this.a=bytes;this.i=0}
 varint(){let n=0,k=1;for(let j=0;j<10;j++){if(this.i>=this.a.length)throw Error('Truncated MVT');const c=this.a[this.i++];n+=(c&127)*k;if(c<128)return n;k*=128}throw Error('Invalid MVT')}
 bytes(){const n=this.varint(),e=this.i+n;if(e>this.a.length)throw Error('Truncated MVT');const v=this.a.subarray(this.i,e);this.i=e;return v}
 skip(w){if(w===0)this.varint();else if(w===1)this.i+=8;else if(w===2)this.bytes();else if(w===5)this.i+=4;else throw Error('Unsupported MVT field');if(this.i>this.a.length)throw Error('Truncated MVT')}
 fields(fn){while(this.i<this.a.length){const tag=this.varint();if(!fn(tag>>>3,tag&7,this))this.skip(tag&7)}}
}
function mvtPacked(bytes){const r=new MvtReader(bytes),a=[];while(r.i<bytes.length)a.push(r.varint());return a}
function mvtValue(bytes){
 let value=null;new MvtReader(bytes).fields((f,w,r)=>{
  if(f===1&&w===2){value=mvtText.decode(r.bytes());return true}
  if((f===4||f===5||f===6||f===7)&&w===0){const v=r.varint();value=f===6?mvtDelta(v):f===7?!!v:v;return true}
  if((f===2&&w===5)||(f===3&&w===1)){const n=w===5?4:8;if(r.i+n>r.a.length)throw Error('Truncated MVT');const d=new DataView(r.a.buffer,r.a.byteOffset+r.i,n);value=n===4?d.getFloat32(0,true):d.getFloat64(0,true);r.i+=n;return true}
  return false;
 });return value;
}
const mvtDelta=n=>n%2?-(n+1)/2:n/2;
function mvtFeature(bytes){
 const f={tags:[],type:0,geom:[]};new MvtReader(bytes).fields((n,w,r)=>{
  if(n===2&&w===2){f.tags=mvtPacked(r.bytes());return true}if(n===3&&w===0){f.type=r.varint();return true}if(n===4&&w===2){f.geom=mvtPacked(r.bytes());return true}return false
 });return f;
}
function tileLonLat(x,y,z){const n=2**z;return [x/n*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI]}
function tileX(lon,z){return (lon+180)/360*2**z}
function tileY(lat,z){const r=clamp(lat,-85.051,85.051)*Math.PI/180;return (1-Math.asinh(Math.tan(r))/Math.PI)/2*2**z}
function mvtPaths(geom,tile,extent){
 let x=0,y=0,i=0,path=null,paths=[];
 while(i<geom.length){
  const c=geom[i++],cmd=c&7,n=Math.floor(c/8);if(!n||n>geom.length)throw Error('Invalid MVT command');
  if(cmd===1||cmd===2){
   if(i+n*2>geom.length)throw Error('Truncated MVT geometry');
   for(let j=0;j<n;j++){x+=mvtDelta(geom[i++]);y+=mvtDelta(geom[i++]);if(cmd===1){path=[];paths.push(path)}if(!path)throw Error('Missing MVT move');path.push(tileLonLat(tile.x+x/extent,tile.y+y/extent,tile.z))}
  }else if(cmd===7){if(path?.length)path.push(path[0])}else throw Error('Invalid MVT command');
 }return paths;
}
function decodeMvtTile(bytes,tile){
 const out={roads:[],labels:[],boundaries:[],places:[]};
 new MvtReader(bytes).fields((field,w,top)=>{
  if(field!==3||w!==2)return false;
  const layer=top.bytes();let name='',extent=4096,features=[],keys=[],values=[];
  new MvtReader(layer).fields((f,w,r)=>{
   if(f===1&&w===2){name=mvtText.decode(r.bytes());return true}
   if(f===2&&w===2){features.push(r.bytes());return true}
   if(f===3&&w===2){keys.push(mvtText.decode(r.bytes()));return true}
   if(f===4&&w===2){values.push(mvtValue(r.bytes()));return true}
   if(f===5&&w===0){extent=r.varint();return true}
   return false;
  });
  if(!['transportation','transportation_name','boundary','place'].includes(name)||!extent)return true;
  for(const raw of features){
   const f=mvtFeature(raw),p={};for(let j=0;j+1<f.tags.length;j+=2)p[keys[f.tags[j]]]=values[f.tags[j+1]];
   const roadClass=p.class,major=roadClass==='motorway'||roadClass==='trunk',primary=roadClass==='primary',secondary=roadClass==='secondary';
   if(name==='transportation'||name==='transportation_name'){
    if(f.type!==2||!(major||(tile.z>=8&&primary)||(tile.z>=10&&secondary)))continue;
    if(p.ramp===1||p.ramp===true)continue;
    const ref=String(p.ref||'').split(';')[0].trim();
    if(name==='transportation_name'&&(!ref||(!major&&tile.z<10)))continue;
    for(const coords of mvtPaths(f.geom,tile,extent)){if(coords.length<2)continue;
     if(name==='transportation')out.roads.push({coords,cls:roadClass,box:lineBounds(coords)});
     else out.labels.push({coords,ref,cls:roadClass,box:lineBounds(coords)});
    }
   }else if(name==='boundary'){
    const level=Number(p.admin_level);if(f.type!==2||!Number.isFinite(level)||level<2||level>8||(level>4&&tile.z<8)||(level>6&&tile.z<10)||p.maritime===1||p.maritime===true)continue;
    for(const coords of mvtPaths(f.geom,tile,extent)){if(coords.length<2)continue;
     // Detailed online boundaries replace generalized offline boundaries.
     out.boundaries.push({coords,level,box:lineBounds(coords)});
    }
   }else if(name==='place'&&f.type===1&&tile.z>=8){
    const label=p['name:de']||p.name_de||p.name||p['name:latin'];const rank=Number(p.rank||0);
    if(!label||!['city','town','village','hamlet','suburb'].includes(p.class)||p.class==='hamlet'&&tile.z<10)continue;
    for(const coords of mvtPaths(f.geom,tile,extent)){if(coords.length&&coords[0]&&!districtAt(...coords[0]))out.places.push({label,point:coords[0],rank,cls:p.class})}
   }
  }
  return true;
 });return out;
}
function tilesForView(b){
 let z=clamp(Math.floor(Math.log2(360*b.w/(256*(b.east-b.west)))),4,11),list=[];
 do{
  list=[];const n=2**z,x0=clamp(Math.floor(tileX(b.west,z)),0,n-1),x1=clamp(Math.floor(tileX(b.east,z)),0,n-1),y0=clamp(Math.floor(tileY(b.north,z)),0,n-1),y1=clamp(Math.floor(tileY(b.south,z)),0,n-1);
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)list.push({z,x,y,key:z+'/'+x+'/'+y});
  if(list.length<=20||z<=4)break;z--;
 }while(true);
 return list.sort((a,c)=>Math.hypot(a.x+.5-tileX((b.west+b.east)/2,z),a.y+.5-tileY((b.north+b.south)/2,z))-Math.hypot(c.x+.5-tileX((b.west+b.east)/2,z),c.y+.5-tileY((b.north+b.south)/2,z)));
}
function updateTileStatus(){
 const status=el('map-tile-status');if(!showRoads&&!showDistricts&&!showPlaces){status.textContent='';return}
 if(!tileActive.length){status.textContent='Straßen und zusätzliche Ortsdetails werden online geladen.';return}
 const loaded=tileActive.filter(t=>tileCache.has(t.key)).length,failed=tileActive.filter(t=>tileRetry.has(t.key)&&tileRetry.get(t.key)>Date.now()).length;
 status.textContent=loaded===tileActive.length?'Online-Grundkarte verfügbar · OpenStreetMap':failed&&loaded===0&&failed===tileActive.length?'Online-Karte nicht erreichbar · Offline-Grundkarte bleibt verfügbar':failed?'Online-Grundkarte teilweise verfügbar · fehlende Kacheln werden bei Bewegung erneut geladen':'Online-Grundkarte wird geladen …';
}
function requestMapTiles(b){
 if(activePage!=='map')return;
 const next=tilesForView(b),key=next.map(t=>t.key).join(',');
 if(key!==tileViewKey){tileViewKey=key;tileActive=next}
 tileQueue=next.filter(t=>!tileCache.has(t.key)&&!tilePending.has(t.key)&&!(tileRetry.get(t.key)>Date.now()));
 updateTileStatus();pumpTiles();
}
function pumpTiles(){
 while(tileLoading<4&&tileQueue.length){
  const t=tileQueue.shift();if(tileCache.has(t.key)||tilePending.has(t.key))continue;
  tilePending.add(t.key);tileLoading++;
  fetch('https://tiles.openfreemap.org/planet/latest/'+t.key+'.pbf',{mode:'cors',credentials:'omit',signal:typeof AbortSignal!=='undefined'&&AbortSignal.timeout?AbortSignal.timeout(12000):undefined})
   .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.arrayBuffer()})
   .then(async buffer=>{
    let bytes=new Uint8Array(buffer);if(bytes[0]===31&&bytes[1]===139&&typeof DecompressionStream!=='undefined'){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));bytes=new Uint8Array(await new Response(stream).arrayBuffer())}
    tileCache.set(t.key,decodeMvtTile(bytes,t));tileRetry.delete(t.key);
    while(tileCache.size>MAX_TILE_CACHE){const old=[...tileCache.keys()].find(k=>!tileActive.some(t=>t.key===k));if(old===undefined)break;tileCache.delete(old)}
   }).catch(()=>{tileRetry.set(t.key,Date.now()+30000);if(tileRetry.size>200)tileRetry.delete(tileRetry.keys().next().value)})
   .finally(()=>{tileLoading--;tilePending.delete(t.key);if(activePage==='map'){updateTileStatus();if(tileActive.some(a=>a.key===t.key))scheduleMap();pumpTiles()}});
 }
}
function tileFeatures(b,field){
 const list=[];for(const t of tileActive){const data=tileCache.get(t.key);if(data)for(const f of data[field])if(!f.box||visibleBox(f.box,b))list.push(f)}return list;
}
// A loaded detailed vector tile is authoritative for its geographic extent.
// Clip BOTH sources to disjoint areas, including at partially loaded views.
function detailedBoundaryTiles(b){
 return tileActive.filter(t=>t.z>=8&&tileCache.has(t.key)).map(t=>{
  const nw=tileLonLat(t.x,t.y,t.z),se=tileLonLat(t.x+1,t.y+1,t.z),a=xy(...nw,b),c=xy(...se,b);
  return [Math.max(0,a[0]),Math.max(0,a[1]),Math.min(b.w,c[0]),Math.min(b.h,c[1])];
 }).filter(r=>r[2]>r[0]&&r[3]>r[1]);
}
function clipBoundaryCoverage(ctx,b,rects,offline){
 ctx.beginPath();if(offline)ctx.rect(0,0,b.w,b.h);
 for(const [x,y,r,d] of rects)ctx.rect(x,y,r-x,d-y);
 ctx.clip(offline?'evenodd':'nonzero');
}
function drawOnlineBorders(ctx,b,rects){
 if(!rects.length)return;
 ctx.save();clipBoundaryCoverage(ctx,b,rects,false);
 const borders=tileFeatures(b,'boundaries');
 for(const level of [8,6,4,2]){
  if(level>4&&!showDistricts)continue;
  ctx.beginPath();for(const f of borders)if((f.level<=2?2:f.level<=4?4:f.level<=6?6:8)===level)pathLine(ctx,f.coords,b);
  ctx.lineJoin='round';ctx.lineCap='round';
  if(level<=4){ctx.strokeStyle='#fffaf1bb';ctx.lineWidth=level===2?4.3:2.7;ctx.stroke()}
  ctx.strokeStyle=level===2?'#080808':level===4?'#171717':level===6?'#141414b8':'#16161675';ctx.lineWidth=level===2?2.65:level===4?1.55:level===6?1.05:.7;ctx.stroke();
 }
 ctx.restore();
}
function drawOnlineMap(ctx,b,fast=false){
 if(!fast)requestMapTiles(b);ctx.save();
 if(showRoads){
  const roads=tileFeatures(b,'roads');ctx.lineJoin='round';ctx.lineCap='round';
  for(const [cls,outer,inner,width] of [['secondary','#20394b75','#dfdfdbaa',.8],['primary','#18334488','#f4e7baad',1.2],['trunk','#243349a0','#f5dc9bbd',1.6],['motorway','#344458b0','#fff0bfe0',2.1]]){
   ctx.beginPath();for(const f of roads)if(f.cls===cls)pathLine(ctx,f.coords,b);ctx.lineWidth=width+1.2;ctx.strokeStyle=outer;ctx.stroke();ctx.lineWidth=width;ctx.strokeStyle=inner;ctx.stroke();
  }
 }
 ctx.restore();
}
function drawTilePlaces(ctx,b,occupied){
 if(!showPlaces)return;const features=tileFeatures(b,'places').sort((a,b)=>a.rank-b.rank),seen=new Set();
 for(const f of features){if(seen.has(f.label))continue;const [x,y]=xy(...f.point,b);if(drawTextLabel(ctx,f.label,x+4,y-5,occupied,11)){seen.add(f.label);ctx.beginPath();ctx.arc(x,y,1.6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill()}}
}
function drawRoadLabels(ctx,b,occupied){
 if(!showRoads||mapZoom<1.5)return;
 const seen=new Map();ctx.save();ctx.font='600 10px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 for(const f of tileFeatures(b,'labels')){
  const a=f.coords[Math.floor(f.coords.length/2)],p=xy(...a,b),[x,y]=p,w=ctx.measureText(f.ref).width+9;
  if(x<w/2+2||x>b.w-w/2-2||y<9||y>b.h-9)continue;
  if((seen.get(f.ref)||[]).some(q=>Math.hypot(x-q[0],y-q[1])<95))continue;
  const box=[x-w/2,y-7,x+w/2,y+7];if(labelCollision(box,occupied))continue;occupied.push(box);
  const prev=seen.get(f.ref)||[];prev.push(p);seen.set(f.ref,prev);
  ctx.fillStyle=f.cls==='motorway'?'#255688':'#594e37';ctx.strokeStyle='#f4f7fb';ctx.lineWidth=.8;ctx.fillRect(box[0],box[1],w,14);ctx.strokeRect(box[0],box[1],w,14);ctx.fillStyle='#fff';ctx.fillText(f.ref,x,y+.3);
 }
 ctx.restore();
}

// Topographic relief: actual NOAA ETOPO1 offline grid + Mapzen/Tilezen
// Terrarium elevation tiles online. Weather values/raster are independent.
const topoStops=[0,100,300,600,1000,1500,2500,3500,5000];
const topoPalette=['#d6e7b8','#b7d49d','#98bd80','#b7c38b','#d4c39e','#cfaa80','#b88f72','#d1beb3','#f6f3ee'];
const topoRGB=topoPalette.map(c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]);
let terrainMode='weather-relief',terrainBase=null,terrainCanvas=null,terrainRenderKey='';
let demCache=new Map(),demPending=new Set(),demFailed=new Map(),demQueue=[],demVisible=[],demLoading=0,demVersion=0;
function offlineTerrain(){
 if(terrainBase)return terrainBase;
 const grid=EXTRA_GEO.terrain,s=atob(grid.values),v=new Int16Array(grid.width*grid.height);
 for(let i=0;i<v.length;i++){const n=s.charCodeAt(2*i)+256*s.charCodeAt(2*i+1);v[i]=n>32767?n-65536:n}
 return terrainBase={...grid,v};
}
function bilinearHeight(v,w,h,x,y){
 x=clamp(x,0,w-1);y=clamp(y,0,h-1);
 const i=Math.floor(x),j=Math.floor(y),ix=Math.min(w-1,i+1),jy=Math.min(h-1,j+1),dx=x-i,dy=y-j;
 return (v[j*w+i]*(1-dx)+v[j*w+ix]*dx)*(1-dy)+(v[jy*w+i]*(1-dx)+v[jy*w+ix]*dx)*dy;
}
function offlineHeight(lon,lat){
 const g=offlineTerrain();return bilinearHeight(g.v,g.width,g.height,(lon-g.west)/g.step,(g.north-lat)/g.step);
}
function demComplete(){return demVisible.length>0&&demVisible.every(t=>demCache.has(t.key))}
function onlineHeight(lon,lat){
 if(!demVisible.length)return null;
 const z=demVisible[0].z,tx=tileX(lon,z),ty=tileY(lat,z),x=Math.floor(tx),y=Math.floor(ty);
 const tile=demCache.get(z+'/'+x+'/'+y);if(!tile)return null;
 // Pixel centres are half a pixel beyond the tile edges. Interpolate across
 // tile boundaries from the adjacent tile when available (no invented seams).
 const w=tile.w,h=tile.h,u=tx*w-.5,v=ty*h-.5,ix=Math.floor(u),iy=Math.floor(v),dx=u-ix,dy=v-iy;
 function sample(px,py){
  const xx=Math.floor(px/w),yy=Math.floor(py/h),t=demCache.get(z+'/'+xx+'/'+yy);
  if(t)return t.v[(py-yy*h)*w+(px-xx*w)];
  return tile.v[clamp(py-y*h,0,h-1)*w+clamp(px-x*w,0,w-1)];
 }
 return (sample(ix,iy)*(1-dx)+sample(ix+1,iy)*dx)*(1-dy)+(sample(ix,iy+1)*(1-dx)+sample(ix+1,iy+1)*dx)*dy;
}
function terrainHeight(lon,lat,online=demComplete()){return online?(onlineHeight(lon,lat)??offlineHeight(lon,lat)):offlineHeight(lon,lat)}
function decodeTerrarium(data,w,h){
 const v=new Float32Array(w*h);
 for(let i=0;i<v.length;i++)v[i]=data[4*i]*256+data[4*i+1]+data[4*i+2]/256-32768;
 return {v,w,h};
}
async function loadDem(tile){
 const res=await fetch('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/'+tile.key+'.png',{mode:'cors',credentials:'omit',signal:typeof AbortSignal!=='undefined'&&AbortSignal.timeout?AbortSignal.timeout(14000):undefined});
 if(!res.ok)throw Error('DEM HTTP '+res.status);const blob=await res.blob();
 let bitmap;
 if(typeof createImageBitmap==='function')bitmap=await createImageBitmap(blob,{colorSpaceConversion:'none',premultiplyAlpha:'none'});
 else bitmap=await new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),im=new Image();im.onload=()=>{URL.revokeObjectURL(url);resolve(im)};im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('DEM image'))};im.src=url});
 const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close?.();
 const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 return decodeTerrarium(data,canvas.width,canvas.height);
}
function terrainStatus(){
 const node=el('map-terrain-status');
 if(terrainMode==='weather'){node.textContent='';return}
 const count=demVisible.filter(t=>demCache.has(t.key)).length,failed=demVisible.filter(t=>demFailed.get(t.key)>Date.now()).length;
 node.textContent=demComplete()?'Detailrelief · echte Terrarium-Höhendaten':failed?'Grobes Offline-Relief (NOAA, 20′) · Detaildaten derzeit nicht vollständig erreichbar':'Grobes Offline-Relief (NOAA, 20′) · Detailrelief wird geladen '+(demVisible.length?'('+count+'/'+demVisible.length+')':'');
}
function requestTerrain(b){
 if(activePage!=='map'||terrainMode==='weather')return;
 demVisible=tilesForView(b);
 demQueue=demVisible.filter(t=>!demCache.has(t.key)&&!demPending.has(t.key)&&!(demFailed.get(t.key)>Date.now()));
 terrainStatus();pumpTerrain();
}
function pumpTerrain(){
 while(demLoading<3&&demQueue.length){
  const tile=demQueue.shift();if(demPending.has(tile.key)||demCache.has(tile.key))continue;
  demLoading++;demPending.add(tile.key);
  loadDem(tile).then(d=>{
   demCache.set(tile.key,d);demFailed.delete(tile.key);demVersion++;
   while(demCache.size>72){const old=[...demCache.keys()].find(k=>!demVisible.some(t=>t.key===k));if(old===undefined)break;demCache.delete(old)}
  }).catch(()=>{demFailed.set(tile.key,Date.now()+45000);if(demFailed.size>200)demFailed.delete(demFailed.keys().next().value)})
   .finally(()=>{demLoading--;demPending.delete(tile.key);if(activePage==='map'){terrainStatus();if(demVisible.some(t=>t.key===tile.key))scheduleMap();pumpTerrain()}});
 }
}
function topoColor(h){
 h=Math.max(0,h);let i=0;while(i<topoStops.length-2&&h>topoStops[i+1])i++;
 const f=clamp((h-topoStops[i])/(topoStops[i+1]-topoStops[i]),0,1),a=topoRGB[i],b=topoRGB[i+1];
 return a.map((v,j)=>Math.round(v+(b[j]-v)*f));
}
function hillshade(east,west,north,south,lat,dx,dy,online){
 // Physical horizontal distances, then vertically exaggerated for cartography.
 const sx=(east-west)/(2*dx*111320*Math.cos(lat*Math.PI/180)),sy=(north-south)/(2*dy*111320),ex=online?3.2:12;
 const nx=-sx*ex,ny=-sy*ex,nz=1,norm=Math.hypot(nx,ny,nz);
 // NW illumination at 45° elevation; neutral illumination on flat ground.
 const illumination=(-.5*nx+.5*ny+Math.SQRT1_2*nz)/norm;
 return clamp((illumination-Math.SQRT1_2)*1.9,-.86,.48);
}
function drawTerrain(ctx,b,fast=false){
 if(terrainMode==='weather'){terrainStatus();return}
 if(!fast)requestTerrain(b);
 const online=demComplete(),key=[b.west,b.east,b.south,b.north,b.w,b.h,online,online?demVersion:0,terrainMode,fast].join('/');
 if(!terrainCanvas)terrainCanvas=document.createElement('canvas');
 if(key!==terrainRenderKey){
  terrainRenderKey=key;
  const w=Math.min(fast?104:440,b.w),h=Math.round(w*b.h/b.w),topo=terrainMode==='topo';
  terrainCanvas.width=w;terrainCanvas.height=h;
  const out=terrainCanvas.getContext('2d'),img=out.createImageData(w,h),dx=(b.east-b.west)/w,dy=(b.north-b.south)/h;
  // Sample a padded height grid once; reuse neighboring samples for slope.
  const heights=new Float32Array((w+2)*(h+2)),stride=w+2;
  // Project each column and row once, rather than calling Mercator math and
  // constructing tile keys for every pixel during every map frame.
  const z=online?demVisible[0].z:0,g=offlineTerrain();
  const cols=Array.from({length:stride},(_,i)=>{const lon=b.west+(i-.5)*dx;return {offline:(lon-g.west)/g.step,online:online?tileX(lon,z):0}});
  const rows=Array.from({length:h+2},(_,j)=>{const lat=b.north-(j-.5)*dy;return {offline:(g.north-lat)/g.step,online:online?tileY(lat,z):0,lat}});
  const tileRows=new Map();
  function pixel(tx,ty){
   const x=Math.floor(tx/256),y=Math.floor(ty/256),t=tileRows.get(y)?.get(x);
   return t?t.v[(ty-y*256)*256+tx-x*256]:NaN;
  }
  if(online)for(const t of demVisible){
   const d=demCache.get(t.key);if(!d||d.w!==256||d.h!==256)continue;
   if(!tileRows.has(t.y))tileRows.set(t.y,new Map());tileRows.get(t.y).set(t.x,d);
  }
  for(let j=0;j<h+2;j++)for(let i=0;i<stride;i++){
   const c=cols[i],r=rows[j];let e=NaN;
   if(online){
    const u=c.online*256-.5,v=r.online*256-.5,x=Math.floor(u),y=Math.floor(v),fx=u-x,fy=v-y;
    const a=pixel(x,y),b=pixel(x+1,y),d=pixel(x,y+1),f=pixel(x+1,y+1);
    e=(a*(1-fx)+b*fx)*(1-fy)+(d*(1-fx)+f*fx)*fy;
    if(!Number.isFinite(e)){
     const t=tileRows.get(Math.floor(r.online))?.get(Math.floor(c.online));
     if(t)e=bilinearHeight(t.v,t.w,t.h,(c.online%1)*256-.5,(r.online%1)*256-.5);
    }
   }
   heights[j*stride+i]=Number.isFinite(e)?e:bilinearHeight(g.v,g.width,g.height,c.offline,r.offline);
  }
  let land=null;
  if(topo){
   const mask=document.createElement('canvas');mask.width=w;mask.height=h;const m=mask.getContext('2d',{willReadFrequently:true}),mb={...b,w,h};
   m.fillStyle='#fff';
   for(const f of mapBoundaries){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const poly of polys){m.beginPath();for(const ring of poly)pathRing(m,ring,mb);m.fill('evenodd')}}
   land=m.getImageData(0,0,w,h).data;
  }
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
   const k=(j+1)*stride+i+1,n=(j*w+i)*4,e=heights[k],lat=b.north-(j+.5)*dy;
   let shade=hillshade(heights[k+1],heights[k-1],heights[k-stride],heights[k+stride],lat,dx,dy,online);
   const ocean=topo?land[n+3]<128:e<-5;
   if(ocean)shade=0;
   if(topo){
    const c=ocean?[185,211,225]:topoColor(e);const factor=shade<0?1+shade*.45:1+shade*.18;
    img.data[n]=Math.round(c[0]*factor);img.data[n+1]=Math.round(c[1]*factor);img.data[n+2]=Math.round(c[2]*factor);img.data[n+3]=255;
   }else{
    const c=shade>0?255:0;img.data[n]=img.data[n+1]=img.data[n+2]=c;
    img.data[n+3]=Math.round(Math.min(.34,Math.abs(shade)*.43)*255);
   }
  }
  out.putImageData(img,0,0);
 }
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(terrainCanvas,0,0,b.w,b.h);ctx.restore();if(!fast)terrainStatus();
}

// Observation-map prototype. Replace demoObservationAdapter with a licensed
// observation feed; a model forecast is never presented as an observation.
const liveLayers={
 radar:{label:'Niederschlagsradar',unit:'mm/h',stops:[0.1,0.5,2,5,10,15,25,50],colors:['#a3dcff','#62b5ff','#2984e8','#2058c6','#15368d','#542382','#401468','#260839']},
 reflectivity:{label:'Maximale Radarreflektivität · DMAX',unit:'dBZ',stops:[5,15,25,35,45,50,55,60],colors:['#9acbff','#377ce5','#3bbc68','#d2e838','#f9a52b','#ed412e','#b70082','#6400aa']},
 doppler:{label:'Doppler · Radialwind VRADH',unit:'m/s',stops:[-30,-20,-10,-2,0,2,10,20,30],colors:['#004525','#008b49','#27c374','#96e6ae','#b9c3c8','#ffc1a3','#f77157','#d6303c','#7e102f']},
 sunshine:{label:'Sonnenscheindauer · letzte Stunde',unit:'min',stops:[0,1,10,20,30,45,55],colors:['#3a495e','#718da5','#c0caa8','#f1e07c','#ffc94a','#f8971f','#de5717']},
 solar:{label:'Globalstrahlung · Stundenmittel',unit:'W/m²',stops:[0,10,50,100,200,400,700],colors:['#3a495e','#718da5','#c0caa8','#f1e07c','#ffc94a','#f8971f','#de5717']},
 satellite:{label:'Meteosat · GeoColour',unit:'',stops:[],colors:[]},
 types:{label:'Niederschlagsart',unit:'',stops:['Regen','Schneeregen','Schnee','Gefr. Regen','Hagel'],colors:['#2984e8','#ad9be1','#e261a0','#e6a249','#ff00e6']},
 snowfall:{label:'Schneefall (Wasseräquivalent)',unit:'mm/h',stops:[0.1,0.5,1,2,5,10],colors:['#ffd0e7','#f99fc9','#ed6eab','#d64288','#b52069','#790c47']},
 snowcover:{label:'Schneehöhe',unit:'cm',stops:[1,3,5,10,20,40,80],colors:['#ffe1ef','#ffc1df','#f99fc9','#ed6eab','#d64288','#b52069','#790c47']},
 temperature:{label:'Aktuelle Temperatur · 2 m',unit:'°C',stops:[-20,-10,-5,0,5,10,15,20,30],colors:['#5b2495','#424fbc','#409add','#67d5d4','#c2eb81','#f8d56d','#f59248','#d9444e','#9e2268']},
 wind:{label:'Mittlerer Wind · 10 m',unit:'km/h',stops:[0,5,10,20,30,40,60,80,100],colors:['#e6f1df','#92d7b9','#53bfaa','#3e99b6','#6654b4','#b74d9d','#f18b60','#f4d76b','#9e3e43']},
 gust:{label:'Windböen · 10 m',unit:'km/h',stops:[0,5,10,20,30,40,60,80,100],colors:['#e6f1df','#92d7b9','#53bfaa','#3e99b6','#6654b4','#b74d9d','#f18b60','#f4d76b','#9e3e43']},
 lightning:{label:'Blitzaktivität · letzte 30 Min.',unit:'Alter',stops:['0–5 min','5–15 min','15–30 min'],colors:['#ffec55','#ffaa3b','#e97143']}
};
let mapSource='model',liveLayer='satellite',liveScenario='winter',liveMinute=0,liveLightning=false,liveSymbols=true,liveTempDay=0,liveTempHour=12,liveRadarDaily=false;
const liveTimeBases={winter:Date.UTC(2026,10,15,12,0),summer:Date.UTC(2026,6,15,14,0)};
const nowcastLayers=new Set(['radar','types','snowfall']);
const imageLayers=new Set(['reflectivity','satellite','doppler','sunshine','solar']);
const solarLayers=new Set(['sunshine','solar']);
function liveHasDayTabs(){return ['temperature','wind','gust'].includes(liveLayer)||nowcastLayers.has(liveLayer)}
function liveHourlyMode(){return liveHasDayTabs()&&(!nowcastLayers.has(liveLayer)||liveRadarDaily)}
function liveMaxMinute(){if(liveLayer==='satellite'&&realLiveEnabled)return 120;return nowcastLayers.has(liveLayer)?90:0}
function liveBaseHour(){return typeof realLiveEnabled!=='undefined'&&realLiveEnabled?new Date().getUTCHours():liveScenario==='summer'?14:12}
function liveDisplayMinute(){return liveHourlyMode()?liveTempDay*1440+(liveTempHour-liveBaseHour())*60:clamp(liveMinute,-120,liveMaxMinute())}
function liveIsFuture(){return liveDisplayMinute()>0}
function liveTimeKind(){return liveIsFuture()?(liveLayer==='temperature'?'Temperaturprognose':liveLayer==='wind'?'Windprognose':liveLayer==='gust'?'Böenprognose':liveHourlyMode()?'Niederschlagsprognose':'Radarprognose'):'Beobachtung'}
function resetLiveTime(){liveMinute=0;liveTempDay=0;liveTempHour=liveBaseHour();liveRadarDaily=false}
function selectLiveDay(day){stopPlay();liveTempDay=clamp(day,0,2);if(nowcastLayers.has(liveLayer))liveRadarDaily=true;scheduleMap()}
function selectLiveNowcast(minute=0){stopPlay();liveRadarDaily=false;liveMinute=clamp(minute,-120,90);scheduleMap()}
const liveGrid=.025;
const liveGauss=(x,y,cx,cy,sx,sy)=>Math.exp(-.5*((x-cx)/sx)**2-.5*((y-cy)/sy)**2);
let thermalShiftMinute=null,thermalShiftScenario='',thermalShiftValue=0;
function demoThermalShift(minute,scenario){
 if(thermalShiftMinute===minute&&thermalShiftScenario===scenario)return thermalShiftValue;
 const t=minute/60,baseHour=scenario==='summer'?14:12,amplitude=scenario==='summer'?5.5:3.2;
 const dailyCycle=h=>Math.cos((h-14.5)*Math.PI/12);
 thermalShiftMinute=minute;thermalShiftScenario=scenario;return thermalShiftValue=amplitude*(dailyCycle(baseHour+t)-dailyCycle(baseHour))+(scenario==='winter'?-1.7:.8)*t/24;
}
function liveObservation(lon,lat,minute=liveMinute,scenario=liveScenario){
 const t=minute/60,dx=lon-10,dy=lat-51;
 const texture=.68+.32*Math.sin(lon*19+lat*13)*Math.cos(lat*25-lon*7);
 let rate=0,temp=18,cover=0,hail=false,freezing=false;
 if(scenario==='summer'){
  const cells=[[7.4,50.2,48,.32,.23],[9.1,51.0,65,.28,.22],[10.3,49.4,32,.35,.25],[12.3,52.6,49,.3,.23],[13.2,48.5,40,.26,.2],[5.4,47.6,28,.4,.25]];
  for(const [x,y,a,sx,sy] of cells){rate+=a*liveGauss(lon,lat,x+t*.55,y+t*.2,sx,sy)+3.2*liveGauss(lon,lat,x+t*.55,y+t*.2,sx*2.5,sy*2.1)}
  rate*=texture;temp=23-dy*.65-dx*.14-Math.max(0,offlineHeight(lon,lat))*.005;
  // Explicit simulated hail cores in selected example storms; intensity
  // alone is NOT a hail classifier for a future live observation feed.
  hail=liveGauss(lon,lat,9.1+t*.55,51+t*.2,.12,.10)>.46||liveGauss(lon,lat,7.4+t*.55,50.2+t*.2,.10,.08)>.55;
 }else{
  const frontX=8.5+t*.7+(lat-51)*.38+Math.sin(lat*1.8)*.37;
  const band=liveGauss(lon,lat,frontX,51,.63,4.5);
  rate=(band*(3.4+4.8*liveGauss(lon,lat,9+t*.7,49.6,1.5,1.4))+2.5*liveGauss(lon,lat,13+t*.5,52.5,1.4,.85))*texture;
  const h=Math.max(0,offlineHeight(lon,lat));temp=4.4-dy*.62-dx*.34-h*.006;
  // A small simulated cold-air pool beneath warmer air aloft allows the
  // freezing-rain symbol and separate orange field to be tested.
  freezing=liveGauss(lon,lat,8.9,51.65,.34,.20)>.48;
  cover=offlineHeight(lon,lat)<-5?0:Math.max(0,Math.min(110,(-temp+.2)*2.4+Math.max(0,h-650)*.025));
 }
 // Additional synthetic systems arrive during the multi-day forecast.
 // The original short-range radar motion is unchanged through +90 min.
 if(t>1.5){
  const incoming=(hour,x,y,sx,sy,a)=>{const dt=t-hour;return a*liveGauss(lon,lat,x+dt*.52,y+dt*.08,sx,sy)*Math.exp(-.5*(dt/9)**2)};
  if(scenario==='winter')rate+=texture*(incoming(24,8.2,51.5,.85,3.8,6.7)+incoming(48,10.0,49.2,1.1,2.1,5.4));
  else rate+=texture*(incoming(25,8.2,50.3,.38,.30,29)+incoming(28,10.2,51.3,.42,.33,41)+incoming(49,7.1,49.2,.45,.37,32)+incoming(53,11.1,52.2,.4,.33,38));
 }
 // Hourly temperature evolution, anchored to the original observation.
 temp+=demoThermalShift(minute,scenario);
 if(rate<.1)rate=0;
 const type=rate===0?'none':hail?'hail':freezing?'freezing':temp<=-.7?'snow':temp<=1.1?'mixed':'rain';
 const wind=Math.max(0,12+19*liveGauss(lon,lat,7.8+t*.2,53.9,3,1.8)+9*liveGauss(lon,lat,12,48,2.1,1.1)+5*Math.sin(lon*.8+lat*.6+t*.3));
 const direction=(240+22*Math.sin(lon*.6+lat*.2)+t*4+360)%360;
 return {rate,type,snowfall:type==='snow'?rate:type==='mixed'?rate*.4:0,cover,temp,wind,direction};
}
// Fixed, deterministic demo strikes: positions and times are stable between
// zooms and playback frames. Their age is relative to the displayed frame.
function makeDemoStrikes(){
 const strikes=[];let seed=117;
 const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296};
 const cells=[[7.4,50.2],[9.1,51],[10.3,49.4],[12.3,52.6],[13.2,48.5],[5.4,47.6]];
 for(let m=-150;m<=0;m+=2)for(const [x,y] of cells){
  if(rand()<.32)continue;
  strikes.push({lon:x+m/60*.55+(rand()-.5)*.6,lat:y+m/60*.2+(rand()-.5)*.45,minute:m});
 }
 return strikes;
}
const demoStrikes=makeDemoStrikes();
const demoObservationAdapter={
 kind:'demo',sample:(lon,lat,minute,scenario)=>liveObservation(Math.round(lon/liveGrid)*liveGrid,Math.round(lat/liveGrid)*liveGrid,minute,scenario),
 strikes:(minute,scenario)=>scenario==='summer'?demoStrikes.filter(s=>s.minute<=minute&&s.minute>minute-30):[]
};
function liveTime(){return typeof realLiveEnabled!=='undefined'&&realLiveEnabled?realLiveTime():new Date(liveTimeBases[liveScenario]+liveDisplayMinute()*60000)}
function liveColor(layer,s){
 const p=liveLayers[layer];let i;
 if(['temperature','wind','gust'].includes(layer)){
  const v=layer==='temperature'?s.temp:s.wind;let k=0;
  while(k<p.stops.length-2&&v>p.stops[k+1])k++;
  const a=rgbForLive(p.colors[k]),b=rgbForLive(p.colors[k+1]),f=clamp((v-p.stops[k])/(p.stops[k+1]-p.stops[k]),0,1);
  return '#'+a.map((c,j)=>Math.round(c+(b[j]-c)*f).toString(16).padStart(2,'0')).join('');
 }
 if(layer==='types'){i=['rain','mixed','snow','freezing','hail'].indexOf(s.type);return i<0?null:p.colors[i]}
 if(layer==='radar'){
  if(s.rate<.1||s.type==='none')return null;
  if(s.type==='hail')return liveLayers.types.colors[4];
  if(s.type==='mixed')return liveLayers.types.colors[1];
  if(s.type==='freezing')return liveLayers.types.colors[3];
  if(s.type==='snow')return liveColor('snowfall',s);
 }
 const v=layer==='radar'?s.rate:layer==='snowfall'?s.snowfall:s.cover;
 if(v<p.stops[0])return null;
 i=0;while(i<p.stops.length-1&&v>=p.stops[i+1])i++;return p.colors[i];
}
const liveRGB=new Map();
function rgbForLive(hex){if(!liveRGB.has(hex))liveRGB.set(hex,[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));return liveRGB.get(hex)}
let liveBuffer=null,liveRasterKey='';
function drawLiveBase(ctx,b){
 ctx.fillStyle='#7e9faf';ctx.fillRect(0,0,b.w,b.h);
 ctx.fillStyle='#739369';
 for(const f of mapBoundaries){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const poly of polys){ctx.beginPath();for(const ring of poly)pathRing(ctx,ring,b);ctx.fill('evenodd')}}
}
function drawLiveField(ctx,b,fast){
 if(imageLayers.has(liveLayer)&&!realLiveEnabled)return;
 if(typeof realLiveEnabled!=='undefined'&&realLiveEnabled)return drawRealLiveField(ctx,b,fast);
 if(liveLayer==='lightning')return;
 const minute=liveDisplayMinute(),w=Math.round(b.w/(fast?7:2.5)),h=Math.round(b.h/(fast?7:2.5)),key=[liveLayer,liveScenario,minute,b.west,b.east,b.south,b.north,w,h].join('/');
 if(!liveBuffer)liveBuffer=document.createElement('canvas');
 if(key!==liveRasterKey){
  liveRasterKey=key;liveBuffer.width=w;liveBuffer.height=h;
  const c=liveBuffer.getContext('2d'),im=c.createImageData(w,h),samples=new Map();
  for(let j=0;j<h;j++){
   const lat=b.north-(j+.5)/h*(b.north-b.south),iy=Math.round(lat/liveGrid);
   for(let i=0;i<w;i++){
    const lon=b.west+(i+.5)/w*(b.east-b.west),ix=Math.round(lon/liveGrid),k=ix+':'+iy;
    if(!samples.has(k))samples.set(k,liveColor(liveLayer,demoObservationAdapter.sample(lon,lat,minute,liveScenario)));
    const color=samples.get(k);if(!color)continue;
    const rgb=rgbForLive(color),n=(j*w+i)*4;
    im.data[n]=rgb[0];im.data[n+1]=rgb[1];im.data[n+2]=rgb[2];im.data[n+3]=layerAlpha(liveLayer);
   }
  }
  c.putImageData(im,0,0);
 }
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(liveBuffer,0,0,b.w,b.h);ctx.restore();
}
function drawLiveWindArrows(ctx,b,minute=liveDisplayMinute(),scenario=liveScenario,spacing=80,scale=1){
 const real=typeof realLiveEnabled!=='undefined'&&realLiveEnabled,info=real?realLiveInfo():null;if(real&&!info.observedGrid&&!info.model)return;
 ctx.save();ctx.lineWidth=1.6*scale;ctx.strokeStyle='#1c2b3dcc';ctx.lineCap='round';ctx.lineJoin='round';
 for(let y=spacing/2;y<b.h;y+=spacing)for(let x=spacing/2;x<b.w;x+=spacing){
  const [lon,lat]=lonlat(x,y,b),point=[lon,lat],s=real?(info.observedGrid?{direction:WeatherObservation.mapValue('winddir',point),wind:WeatherObservation.mapValue('wind',point)}:realLiveSample(lon,lat,info.date.getTime(),info.model)):demoObservationAdapter.sample(lon,lat,minute,scenario);if(!Number.isFinite(s.direction)||real&&!(s.wind>=2))continue;
  const a=(s.direction+180)*Math.PI/180,dx=Math.sin(a)*9*scale,dy=-Math.cos(a)*9*scale;
  ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+dx*.46-dy*.45,y+dy*.46+dx*.45);
  ctx.moveTo(x+dx,y+dy);ctx.lineTo(x+dx*.46+dy*.45,y+dy*.46-dx*.45);ctx.stroke();
 }ctx.restore();
}
function layerAlpha(layer){return layer==='snowcover'?185:255}
// Lightweight, geographically anchored marks. They describe the sampled
// precipitation type and supplement, rather than replace, the color scale.
function liveSymbolPath(ctx,type,x,y,r){
 ctx.beginPath();
 const drop=type==='rain'||type==='freezing';
 if(drop){
  ctx.moveTo(x,y-r);ctx.bezierCurveTo(x-r*.45,y-r*.35,x-r*.75,y+.02*r,x-r*.75,y+r*.30);
  ctx.bezierCurveTo(x-r*.75,y+r*1.2,x+r*.75,y+r*1.2,x+r*.75,y+r*.30);
  ctx.bezierCurveTo(x+r*.75,y+.02*r,x+r*.45,y-r*.35,x,y-r);ctx.closePath();
 }else{
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3,vx=Math.cos(a),vy=Math.sin(a),px=-vy,py=vx;
   ctx.moveTo(x,y);ctx.lineTo(x+vx*r,y+vy*r);
   for(const sign of [-1,1]){
    ctx.moveTo(x+vx*r*.64,y+vy*r*.64);
    ctx.lineTo(x+vx*r*.38+sign*px*r*.26,y+vy*r*.38+sign*py*r*.26);
   }
  }
 }
 ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=3.8;ctx.strokeStyle='#14283be6';ctx.stroke();
 if(drop){ctx.fillStyle=type==='freezing'?'#e6a249':'#e4f6ff';ctx.fill()}
 ctx.lineWidth=1.8;ctx.strokeStyle='#fff';ctx.stroke();
}
function drawLiveSymbols(ctx,b){
 if(typeof realLiveEnabled!=='undefined'&&realLiveEnabled){
  if(liveLayer==='satellite'&&liveMinute!==0)return;
  if(liveLayer==='satellite')return drawOwnRadarSymbols(ctx,b,readyRadarFrame(ownRadarFrame(new Date(radarBaseTime()),true),'radar',true),'radar');
  if(!['radar','types','snowfall'].includes(liveLayer)||liveHourlyMode())return 0;
  return drawOwnRadarSymbols(ctx,b,readyRadarFrame(ownRadarFrame(realLiveTime(),liveMinute===0),liveLayer,liveMinute===0),liveLayer);
 }
 if(!liveSymbols||!['radar','types','snowfall'].includes(liveLayer))return 0;
 const dx=(b.east-b.west)*76/b.w,dy=(b.north-b.south)*76/b.h;
 let count=0;ctx.save();
 for(let j=Math.ceil(b.south/dy);j<=Math.floor(b.north/dy);j++)for(let i=Math.ceil(b.west/dx);i<=Math.floor(b.east/dx);i++){
  // Check the center and nearby samples to show a mark even in a narrow band.
  let best=null;
  for(const [ox,oy] of [[0,0],[-.23,0],[.23,0],[0,-.23],[0,.23]]){
   const lon=(i+ox)*dx,lat=(j+oy)*dy,[x,y]=xy(lon,lat,b);
   if(x<12||x>b.w-12||y<12||y>b.h-12)continue;
   const s=demoObservationAdapter.sample(lon,lat,liveDisplayMinute(),liveScenario);
   if(!['snow','mixed','freezing'].includes(s.type)||s.rate<.5||liveLayer==='snowfall'&&s.snowfall<.5)continue;
   best={x,y,s};break;
  }
  if(!best)continue;
  const {x,y,s}=best,r=8.5;
  // Rain stays unmarked. Mixed precipitation always gets a pair; freezing
  // rain has its own orange drop, never a snowflake.
  if(s.type==='mixed'){liveSymbolPath(ctx,'rain',x-7,y,6);liveSymbolPath(ctx,'snow',x+7,y,6)}
  else liveSymbolPath(ctx,s.type==='freezing'?'freezing':'snow',x,y,r);
  count++;
 }
 ctx.restore();return count;
}
function drawLiveStrikes(ctx,b){
 if(typeof realLiveEnabled!=='undefined'&&realLiveEnabled)return;
 if(liveIsFuture()||liveLayer!=='lightning'&&!liveLightning)return;
 const minute=liveDisplayMinute();ctx.save();const strikes=demoObservationAdapter.strikes(minute,liveScenario);
 for(const s of strikes){
  if(s.lon<b.west||s.lon>b.east||s.lat<b.south||s.lat>b.north)continue;
  const [x,y]=xy(s.lon,s.lat,b),age=minute-s.minute,r=mapZoom>=5?4:3;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=liveLayers.lightning.colors[age<=5?0:age<=15?1:2];ctx.fill();ctx.strokeStyle='#4f3322';ctx.lineWidth=1;ctx.stroke();
 }
 ctx.restore();
}
function liveSampleText(lon,lat){
 if(liveLayer==='satellite'&&realLiveEnabled&&liveMinute!==0){
  const info=selectedSatelliteInfo(),point=[lon,lat],cloud=WeatherObservation.sampleField(info.mask,point);
  const r=info.frame&&ownRadarPixel(info.frame,point);
  const inside=info.img&&lon>=1&&lon<=19&&lat>=44&&lat<=58;
  return (Number.isFinite(cloud)?Math.round(cloud)+' % Bedeckung (Prognose)':inside?'GeoColour-Aufnahme':'Keine Wolkendaten am Punkt')+' · '+(r?localFormat(r.rate)+' mm/h':'Keine Radardaten am Punkt');
 }
 if(liveLayer==='satellite'&&realLiveEnabled){const info=satelliteLayerInfo(),v=WeatherObservation.sampleField(info.mask,[lon,lat]),frame=readyRadarFrame(ownRadarFrame(new Date(radarBaseTime()),true),'radar',true),r=frame&&ownRadarPixel(frame,[lon,lat]);return (Number.isFinite(v)?(v===0?'Wolkenfrei':Math.round(v)+' % Wolkenopazität') :info.useImage?'Satellitenbild':'Keine Wolkenmaskendaten')+' · '+(r?radarTypeNames[r.code]+' · '+localFormat(r.rate)+' mm/h':'Keine Radarmessung am Punkt');}
 if(solarLayers.has(liveLayer)){const p=currentLiveImage(),v=solarValue(p,[lon,lat]);return Number.isFinite(v)?localFormat(v)+' '+p.unit+' · '+timeText(new Date(p.time))+' · DUETT':'Keine aktuelle Rasteranalyse am Punkt'}
 if(imageLayers.has(liveLayer))return realLiveEnabled?'Bildprodukt · keine numerische Punktabfrage':'Nur als echtes Bildprodukt verfügbar';
 if(typeof realLiveEnabled!=='undefined'&&realLiveEnabled){const info=realLiveInfo();if(!info.available)return 'Keine Daten';if(info.observedGrid){const v=WeatherObservation.mapValue(liveAreaIds[liveLayer],[lon,lat]);return Number.isFinite(v)?displayValue(v,liveLayers[liveLayer].unit)+' '+liveLayers[liveLayer].unit+' · '+info.observedGrid.source:'Außerhalb verfügbarer Analyseabdeckung';}if(info.radar){const frame=readyRadarFrame(ownRadarFrame(info.date,liveMinute===0),liveLayer,liveMinute===0);if(!frame)return 'Radardaten werden geladen / nicht verfügbar';const raw=ownRadarPixel(frame,[lon,lat]),ground=liveMinute===0&&!frame.forecast&&raw?resolveLivePhase([lon,lat],raw,Date.now()):null,sample=ground?.kind==='ground'?{...raw,code:ground.code,source:ground.source+' '+localTime(ground.time,{hour:'2-digit',minute:'2-digit'})+' · Rate: '+raw.source,time:raw.time,estimated:false}:raw;return sample?radarTypeNames[sample.code]+(sample.estimated?' · geschätzt':'')+(Number.isFinite(sample.rate)?' · '+localFormat(sample.rate)+' mm/h':'')+(sample.source?' · '+sample.source:'')+(Number.isFinite(sample.time)?' · '+localTime(sample.time,{hour:'2-digit',minute:'2-digit'}):''):'Keine Rasterdaten am Punkt';}
  if(['types','snowfall'].includes(liveLayer)&&info.model){const f={...info.model,point:[lon,lat]},v=frameVal(f,'rainrate');return Number.isFinite(v)?radarTypeNames[modelPhaseAtPoint(f,v>0)]+' · '+localFormat(v)+' mm/h · Modell':'Keine Daten'}const s=realLiveSample(lon,lat,info.date.getTime(),info.model);return displayValue(liveLayer==='temperature'?s.temp:liveLayer==='wind'?s.wind:liveLayer==='gust'?s.gust:liveLayer==='radar'?s.rate:s.cover,liveLayers[liveLayer].unit)+' '+liveLayers[liveLayer].unit+' · Modell';}
 const s=demoObservationAdapter.sample(lon,lat,liveDisplayMinute(),liveScenario),f=v=>v.toLocaleString('de-DE',{maximumFractionDigits:1});
 const typeName=({none:'Trocken',rain:'Regen',mixed:'Schneeregen',snow:'Schnee',freezing:'Gefrierender Regen',hail:'Hagel'})[s.type];
 if(liveLayer==='types')return typeName;
 if(liveLayer==='radar')return typeName+' · '+f(s.rate)+' mm/h';
 if(liveLayer==='temperature')return f(s.temp)+' °C';
 if(['wind','gust'].includes(liveLayer))return f(s.wind)+' km/h · '+Math.round(s.direction)+'°';
 if(liveLayer==='lightning'){
  const count=demoObservationAdapter.strikes(liveDisplayMinute(),liveScenario).filter(p=>Math.hypot((p.lon-lon)*111*Math.cos(lat*Math.PI/180),(p.lat-lat)*111)<=20).length;
  return count+' Blitze / 20 km';
 }
 return f(liveLayer==='radar'?s.rate:liveLayer==='snowfall'?s.snowfall:s.cover)+' '+liveLayers[liveLayer].unit;
}
function liveLegend(){
 if(liveLayer==='satellite'){el('legend-name').textContent='Satellitenwolken + Niederschlagsradar';el('legend-unit').textContent='mm/h';return realRadarLegend()}
 if(typeof realLiveEnabled!=='undefined'&&realLiveEnabled&&(['types','snowfall'].includes(liveLayer)||liveLayer==='radar'&&!liveHourlyMode())){el('legend-name').textContent=liveLayer==='types'?'Niederschlagsart':liveLayer==='snowfall'?'Schneefall · Wasseräquivalent':'Niederschlagsradar';el('legend-unit').textContent=liveLayer==='types'?'':'mm/h';return realRadarLegend()}
 if(typeof realLiveEnabled!=='undefined'&&realLiveEnabled&&liveLayer==='radar'){const p=liveLayers.radar;el('legend-name').textContent='Mittlere Niederschlagsrate · Modell';el('legend-unit').textContent='mm/h';el('radar-type-legend').hidden=true;el('legend-strip').style.background='linear-gradient(90deg,'+p.colors.join(',')+')';el('legend-ticks').innerHTML=p.stops.map(v=>'<span>'+v.toLocaleString('de-DE')+'</span>').join('');el('live-lightning-note').hidden=true;return}
 const p=liveLayers[liveLayer];el('legend-name').textContent=liveLayer==='temperature'?'Temperatur · 2 m':liveLayer==='wind'?'Mittlerer Wind · 10 m':liveLayer==='radar'&&liveHourlyMode()?'Niederschlagsintensität':p.label;el('legend-unit').textContent=p.unit;
 if(liveLayer==='radar'){
  el('legend-strip').hidden=true;el('legend-ticks').hidden=true;
  const row=(name,scale)=>'<div class="radar-key-row"><b>'+name+'</b><div class="radar-key-swatches">'+scale.colors.map((c,i)=>'<span><i style="background:'+c+'"></i>'+scale.stops[i].toLocaleString('de-DE')+'</span>').join('')+'</div></div>';
  const box=el('radar-type-legend');box.hidden=false;
  box.innerHTML=row('Regen / Starkregen',p)+row('Schnee',liveLayers.snowfall)+
   '<div class="radar-key-categories">'+[1,3,4].map(i=>'<span><i style="background:'+liveLayers.types.colors[i]+'"></i>'+liveLayers.types.stops[i]+'</span>').join('')+'</div><small>Werte sind die Untergrenzen in mm/h. Hagel ist als Niederschlagsart separat markiert.</small>';
  el('live-lightning-note').hidden=!liveLightning||liveIsFuture();return;
 }
 const n=p.colors.length;el('legend-strip').style.background='linear-gradient(90deg,'+(['temperature','wind','gust'].includes(liveLayer)?p.colors.join(','):p.colors.map((c,i)=>c+' '+(i/n*100)+'%, '+c+' '+((i+1)/n*100)+'%').join(','))+')';
 el('legend-ticks').innerHTML=p.stops.map(v=>'<span>'+v.toLocaleString('de-DE')+'</span>').join('');
 el('live-lightning-note').hidden=liveLayer==='lightning'||!liveLightning||liveIsFuture();
}
function selectLiveLayer(id){
 stopPlay();liveLayer=id;if(!liveHasDayTabs())liveMinute=clamp(liveMinute,-120,liveMaxMinute());
 if(['temperature','wind','gust'].includes(id)){liveTempDay=0;liveTempHour=liveBaseHour();}
 if(imageLayers.has(id)){liveMinute=0;if(realLiveEnabled){if(id==='doppler')fetchDoppler();else if(solarLayers.has(id))fetchSolar();else fetchLiveImagery()}}
 el('map-live-layer').value=id;scheduleMap();
}
function syncLiveTimeControls(){
 const enabled=mapSource==='live'&&terrainMode!=='topo',days=enabled&&liveHasDayTabs(),hourly=enabled&&liveHourlyMode(),radar=enabled&&nowcastLayers.has(liveLayer),nowcast=radar&&!hourly;
 el('map-temperature-days').hidden=!days;el('map-nowcast-key').hidden=!nowcast;
 const radarButton=el('map-radar-nowcast');radarButton.hidden=!radar;radarButton.classList.toggle('active',nowcast);radarButton.setAttribute('aria-pressed',String(nowcast));
  el('map-time-controls').hidden=terrainMode==='topo'||enabled&&imageLayers.has(liveLayer)&&!(liveLayer==='satellite'&&realLiveEnabled);el('doppler-site-control').hidden=!(enabled&&liveLayer==='doppler'&&realLiveEnabled);
 el('satellite-now').hidden=!(enabled&&liveLayer==='satellite'&&realLiveEnabled);
 if(!enabled)return;
 const slider=el('map-time');
 slider.removeAttribute('aria-valuetext');
 for(const id of ['map-time','map-back','map-next','map-play'])el(id).disabled=false;
 if(liveLayer==='satellite'&&realLiveEnabled){
  slider.min=-1440;slider.max=120;slider.step=10;slider.value=liveMinute;
  slider.setAttribute('aria-label','Satellit und Radar, 24 Stunden zurück bis zwei Stunden voraus');
  slider.setAttribute('aria-valuetext',el('map-time-label').textContent);
  return;
 }
 if(days){
  const base=typeof realLiveEnabled!=='undefined'&&realLiveEnabled?new Date():new Date(liveTimeBases[liveScenario]);
  document.querySelectorAll('[data-temperature-day]').forEach(b=>{
   const d=+b.dataset.temperatureDay,date=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth(),base.getUTCDate()+d));
   b.textContent=['Heute','Morgen','Übermorgen'][d]+' · '+date.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:'UTC'});
   b.classList.toggle('active',hourly&&liveTempDay===d);b.setAttribute('aria-pressed',String(hourly&&liveTempDay===d));
  });
 }
 if(hourly){
  slider.min=0;slider.max=23;slider.step=1;slider.value=liveTempHour;slider.setAttribute('aria-label','Stunde der Wetterkarte (UTC)');
 }else{
  slider.min=-120;slider.max=liveMaxMinute();slider.step=5;slider.value=clamp(liveMinute,-120,liveMaxMinute());
  slider.setAttribute('aria-label',nowcast?'Radarzeit: zwei Stunden zurück bis 90 Minuten voraus (Demo)':'Beobachtungszeit (Demo)');
 }
}
function advanceLiveTime(){
 if(liveHourlyMode()){if(liveTempHour===23){liveTempHour=0;liveTempDay=(liveTempDay+1)%3}else liveTempHour++}
 else liveMinute=liveMinute>=liveMaxMinute()?-120:liveMinute+5;
}
function setMapSource(source){
 stopPlay();endMapGesture();mapSource=source;
 if(terrainMode==='topo'){terrainMode='weather-relief';el('map-terrain-mode').value=terrainMode}
 renderMap();if(source==='model'&&modelDataMode==='real')fetchMapAvailability(mapModel);
}

// Local preview cards and a full-screen presentation of the SAME interactive
// map. No duplicate map instance, network requests, or forecast state.
let mapFullScreen=false,mapFullReturn='map',mapFullScroll=0,mapInfoOpen=false;
const homeMapLayers=[['radar','Satellit + Niederschlagsradar','Wolken und Niederschlag in deiner Region'],['temperature','Temperaturkarte','Lufttemperatur · 2 m'],['wind','Windkarte','Windgeschwindigkeit · 10 m']];
const homePreviewCache=new Map();
function homeLocationPoint(place){
 if(Number.isFinite(place.lon)&&Number.isFinite(place.lat))return [place.lon,place.lat];
 const p=mapPlaceRecords.find(p=>p[0]===place.name)||mapPlaceRecords.find(p=>p[0].startsWith(place.name+' ('));
 return p?[p[1],p[2]]:null;
}
function homeCurrentSample(){
 const p=homeLocationPoint(location),s=p?demoObservationAdapter.sample(...p,0,'winter'):{temp:7+location.offset,wind:18,direction:225,rate:0,type:'none',cover:0};
 const weather={none:['Stark bewölkt','05_stark_bewoelkt'],rain:['Regen','12_regen_2'],snow:['Schneefall','21_schnee_2'],mixed:['Schneeregen','29_schneeregen_2'],freezing:['Gefrierender Regen','33_gefrierender_regen'],hail:['Hagel','36_starkes_gewitter']}[s.type];
 return {...s,temp:Math.round(s.temp),wind:Math.round(s.wind),gust:Math.round(s.wind*1.7),feels:Math.round(s.temp-3),condition:weather[0],icon:weather[1]};
}
function homeMapCards(){
 return '<section class="panel home-maps"><div class="section-head"><div><h2>Radar &amp; Live-Karten</h2><p>'+placeText(location.name)+' und Umgebung · '+(typeof weatherRealEnabled!=='undefined'&&weatherRealEnabled?'DWD / ECMWF':'Demo')+'</p></div><span class="badge">Karten</span></div><div class="home-map-grid">'+homeMapLayers.map(([id,title,desc])=>'<button class="home-map-card" data-home-map="'+id+'" aria-label="'+title+' im Vollbild öffnen"><div class="home-map-head"><div><strong>'+title+'</strong><small>'+(id==='radar'?desc:desc+' · Beobachtungsanalyse')+'</small></div><span aria-hidden="true">⛶</span></div><canvas id="home-map-'+id+'" width="360" height="160" aria-hidden="true"></canvas><div class="home-map-foot"><span id="home-value-'+id+'">'+(typeof weatherRealEnabled!=='undefined'&&weatherRealEnabled?'Daten werden geladen':'Demo')+'</span><b>Öffnen ›</b></div></button>').join('')+'</div></section>';
}
function previewBounds(point){
 const [lon,lat]=point;return {west:lon-2.6,east:lon+2.6,south:lat-1.55,north:lat+1.55,w:360,h:160};
}
function previewField(canvas,layer,point,name){
 const b=previewBounds(point),ctx=canvas.getContext('2d');drawLiveBase(ctx,b);
 const small=document.createElement('canvas'),w=120,h=64;small.width=w;small.height=h;const c=small.getContext('2d'),img=c.createImageData(w,h);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const [lon,lat]=lonlat((i+.5)/w*b.w,(j+.5)/h*b.h,b),s=demoObservationAdapter.sample(lon,lat,0,'winter'),color=liveColor(layer,s);
  if(!color)continue;const rgb=rgbForLive(color),n=(j*w+i)*4;img.data[n]=rgb[0];img.data[n+1]=rgb[1];img.data[n+2]=rgb[2];img.data[n+3]=255;
 }
 c.putImageData(img,0,0);ctx.imageSmoothingEnabled=layer!=='radar';ctx.drawImage(small,0,0,b.w,b.h);
 const geo=basemapData();drawAdmin(ctx,geo.states,b,'#222a3990',.65);drawAdmin(ctx,[geo.germany],b,'#202838',1.25);
 ctx.beginPath();for(const f of geo.europeBorders)if(visibleBox(f.box,b))pathLine(ctx,f.coords,b);ctx.strokeStyle='#2a3443b5';ctx.lineWidth=.8;ctx.stroke();
 if(layer==='wind')drawLiveWindArrows(ctx,b,0,'winter',50,.65);
 const [x,y]=xy(...point,b);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#142b42';ctx.stroke();
 ctx.font='bold 12px Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.strokeStyle='#172a40';ctx.lineWidth=3;ctx.strokeText(name,x,y-9);ctx.fillStyle='#fff';ctx.fillText(name,x,y-9);
}
function renderHomeMaps(){
 document.querySelectorAll('[data-home-map]').forEach(b=>b.onclick=()=>openHomeMap(b.dataset.homeMap));
 const point=homeLocationPoint(location);if(!point)return;
 if(typeof weatherRealEnabled!=='undefined'&&weatherRealEnabled){if(homeMapsVisible())renderRealHomeMaps(point);return}
 for(const [id] of homeMapLayers){
  const canvas=el('home-map-'+id),key=location.name+'/'+point.join(',')+'/'+id;
  if(!homePreviewCache.has(key)){
   const preview=document.createElement('canvas');preview.width=360;preview.height=160;previewField(preview,id,point,location.name);homePreviewCache.set(key,preview);
   if(homePreviewCache.size>24)homePreviewCache.delete(homePreviewCache.keys().next().value);
  }
  canvas.getContext('2d').drawImage(homePreviewCache.get(key),0,0);
  const s=demoObservationAdapter.sample(...point,0,'winter'),f=v=>v.toLocaleString('de-DE',{maximumFractionDigits:1});
  el('home-value-'+id).textContent=id==='radar'?(s.rate>0?f(s.rate)+' mm/h':'Trocken'):id==='temperature'?f(s.temp)+' °C':f(s.wind)+' km/h';
 }
}
let homePreviewObserver=null,homeMapRefreshTimer=null;
function homeMapsVisible(){
 if(activePage!=='weather'||document.hidden)return false;
 const panel=document.querySelector('.home-maps');if(!panel)return false;
 const b=panel.getBoundingClientRect();return b.bottom>=-160&&b.top<innerHeight+160;
}
// Model/radar packets arrive independently; combine their notifications and
// never decode or paint offscreen previews in the background.
function scheduleHomeMaps(){
 if(!homeMapsVisible()||homeMapRefreshTimer!==null)return;
 homeMapRefreshTimer=setTimeout(()=>{homeMapRefreshTimer=null;if(homeMapsVisible())renderHomeMaps()},120);
}
function deferHomeMaps(){
 homePreviewObserver?.disconnect();const panel=document.querySelector('.home-maps');if(!panel)return;
 document.querySelectorAll('[data-home-map]').forEach(b=>b.onclick=()=>openHomeMap(b.dataset.homeMap));
 if(typeof IntersectionObserver==='function'){homePreviewObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&panel.isConnected)scheduleHomeMaps()},{rootMargin:'160px'});homePreviewObserver.observe(panel)}else scheduleHomeMaps();
}
function setMapInfo(open){
 mapInfoOpen=!!open;el('page-map').classList.toggle('map-info-open',mapInfoOpen);
 el('map-info-toggle').setAttribute('aria-expanded',String(mapInfoOpen));
}
function enterMapFull(returnPage='map',point=null){
 mapFullReturn=returnPage;mapFullScroll=typeof window!=='undefined'?window.scrollY:0;
 mapFullScreen=true;el('page-map').classList.toggle('map-fullscreen',true);document.body?.classList.toggle('map-fullscreen-active',true);setMapInfo(false);
 if(activePage!=='map')setPage('map');
 if(point)centerView(...point);
 renderMap();scheduleMap();
}
function exitMapFull(){
 if(!mapFullScreen)return;
 stopPlay();endMapGesture();setMapInfo(false);mapFullScreen=false;el('page-map').classList.toggle('map-fullscreen',false);document.body?.classList.toggle('map-fullscreen-active',false);
 if(mapFullReturn!=='map'){setPage(mapFullReturn);if(typeof window!=='undefined')window.scrollTo({top:mapFullScroll,behavior:'instant'})}
 else{refreshMap();if(typeof window!=='undefined')window.scrollTo({top:mapFullScroll,behavior:'instant'})}
}
function openHomeMap(id){
 if(!homeMapLayers.some(p=>p[0]===id))return;
 stopPlay();endMapGesture();mapSource='live';liveLayer=id==='radar'?'satellite':id;liveScenario='winter';resetLiveTime();terrainMode='weather-relief';
 if(typeof weatherRealEnabled!=='undefined'&&weatherRealEnabled){realLiveEnabled=true;el('map-live-data-mode').value='real';resetLiveTime()}
 if(liveLayer==='satellite'&&realLiveEnabled)fetchLiveImagery();
 el('map-live-layer').value=liveLayer;el('map-live-scenario').value=liveScenario;el('map-terrain-mode').value=terrainMode;
 mapRegion='Deutschland';mapZoom=3.2;const point=homeLocationPoint(location);mapCenter=null;mapPoint=point;mapPointName=point?location.name:'';
 if(point){const b=baseBounds();if(point[0]<b.west||point[0]>b.east||point[1]<b.south||point[1]>b.north){mapRegion='Europa';mapZoom=13}}
 // Use the selected town as the camera anchor; adjust against full-size bounds.
 if(point)centerView(...point);
 enterMapFull('weather',point);
}
function updateFullMapLabels(){
 el('map-full-title').textContent=el('map-layer-title').textContent;
 const valid=modelValidDate();el('map-full-subtitle').textContent=terrainMode==='topo'?'Topografie':mapSource==='live'?timeText(liveTime())+(liveIsFuture()?' · Prognose (Demo)':' · DEMO'):mapModel+' · '+(valid?(modelDataMode==='real'?forecastTimeText(valid):timeText(valid)):'Keine zukünftigen Daten')+' · '+(modelDataMode==='demo'?'DEMO':realData()?modelProvider(mapModel):'AUSSTEHEND');
 el('map-full-layer-tabs').hidden=mapSource!=='live'||terrainMode==='topo';
 document.querySelectorAll('[data-full-layer]').forEach(b=>{const on=b.dataset.fullLayer===liveLayer;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 el('map-info-summary').textContent=terrainMode==='topo'?'Geländehöhen in Metern.':mapSource==='live'?el('map-layer-title').textContent+(liveIsFuture()?' · Simulierte Prognose, keine Messdaten. ':' · Simulierte Beobachtungen, keine Messdaten. ')+el('map-interval').textContent+(['wind','gust'].includes(liveLayer)?' Pfeile zeigen die Strömungsrichtung.':''):el('map-layer-title').textContent+' · '+mapModel+' · '+el('map-valid').textContent+' · '+el('map-interval').textContent;
 if(mapSource==='live'&&terrainMode!=='topo'&&typeof realLiveEnabled!=='undefined'&&realLiveEnabled){el('map-full-subtitle').textContent=el('map-valid').textContent+' · '+el('map-data-notice').textContent;el('map-info-summary').textContent=el('map-view-description').textContent+' · '+el('map-interval').textContent;}
 const explanation=mapSource==='model'&&terrainMode!=='topo'?parameterExplanation(mapLayer):null;
 el('map-parameter-help').hidden=!explanation;
 if(explanation)el('map-info-summary').textContent+=' · '+explanation;
}
function bindFullMap(){
 el('map-full-open').addEventListener('click',()=>enterMapFull('map'));
 el('map-full-close').addEventListener('click',exitMapFull);
 el('map-info-toggle').addEventListener('click',()=>setMapInfo(!mapInfoOpen));el('map-info-close').addEventListener('click',()=>setMapInfo(false));
 document.querySelectorAll('[data-full-layer]').forEach(b=>b.addEventListener('click',()=>selectLiveLayer(b.dataset.fullLayer)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mapFullScreen&&!el('parameter-help-dialog').open){if(mapInfoOpen)setMapInfo(false);else exitMapFull()}});
 if(typeof window!=='undefined')window.addEventListener('resize',()=>{if(mapFullScreen)scheduleMap()});
}

// Fast offline municipality lookup plus explicit Photon/OpenStreetMap
// fallback for villages, hamlets, districts and postcodes. The public Photon
// endpoint is for low-volume demo use; deploy a dedicated instance later.
const locationOnlineEndpoint='https://photon.komoot.io/api';
let locationIndex=null,placeSearchResults=[],placeOnlineResults=[],placeQuery='',placeRequest=null,placeRequestId=0,placeStatus='';
const placeDetailsCache=new Map(),placeOnlineCache=new Map();
function placeText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c])}
function placeNorm(s){
 return String(s??'').toLocaleLowerCase('de-DE').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
function placePlain(s){return String(s??'').toLocaleLowerCase('de-DE').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
const countryNames={DE:'Deutschland',AT:'Österreich',CH:'Schweiz',FR:'Frankreich',BE:'Belgien',NL:'Niederlande',LU:'Luxemburg',DK:'Dänemark',PL:'Polen',CZ:'Tschechien',GB:'Vereinigtes Königreich',IT:'Italien',ES:'Spanien',NO:'Norwegen',SE:'Schweden',FI:'Finnland',IE:'Irland'};
function countryName(code,fallback=''){
 if(countryNames[code])return countryNames[code];try{return new Intl.DisplayNames(['de'],{type:'region'}).of(code)||fallback||code}catch{return fallback||code||''}
}
function supportedPlace(lon,lat){return Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=-25&&lon<=42&&lat>=34&&lat<=71}
function placeId(name,lon,lat){return placeNorm(name)+'@'+lon.toFixed(5)+','+lat.toFixed(5)}
function getLocationIndex(){
 if(locationIndex)return locationIndex;
 const germanNames=new Set(BASEMAP.places.map(p=>placeNorm(p[0])));
 return locationIndex=mapPlaceRecords.filter(p=>supportedPlace(p[1],p[2])&&(!p[4]||p[4]!=='DE'||!germanNames.has(placeNorm(p[0])))).map(p=>{
  const [name,lon,lat,pop,cc]=p,countryCode=cc||'DE',alias=p[6]||'';
  return {id:placeId(name,lon,lat),name,lon,lat,pop:pop||0,countryCode,norm:placeNorm(name),plain:placePlain(name),alias:placeNorm(alias),source:'offline'};
 });
}
function placeRank(p,q,plain){
 if(p.norm===q||p.plain===plain||p.alias===q)return 0;
 // Parenthetical names are common in the German municipality register.
 if(p.norm.startsWith(q+' ')||p.plain.startsWith(plain+' '))return 1;
 if(p.norm.startsWith(q)||p.plain.startsWith(plain)||p.alias.startsWith(q))return 2;
 if(p.norm.includes(' '+q)||p.plain.includes(' '+plain))return 3;
 if(p.norm.includes(q)||p.plain.includes(plain)||p.alias.includes(q))return 4;
 return Infinity;
}
function offlinePlaceDetails(p){
 if(p.region)return p;
 if(placeDetailsCache.has(p.id))return placeDetailsCache.get(p.id);
 const district=p.countryCode==='DE'?districtAt(p.lon,p.lat):null;
 const state=district?basemapData().states.find(s=>s.id===district.id.slice(0,2)):null;
 const result={...p,region:state?.name||countryName(p.countryCode),district:district?.name===p.name?'':district?.name||'',country:countryName(p.countryCode),kind:p.countryCode==='DE'?'Gemeinde':'Ort'};
 if(placeDetailsCache.size>1500)placeDetailsCache.delete(placeDetailsCache.keys().next().value);
 placeDetailsCache.set(p.id,result);return result;
}
function searchOfflinePlaces(query,limit=35){
 const q=placeNorm(query),plain=placePlain(query);if(q.length<2)return [];
 const hits=[];
 for(const p of getLocationIndex()){const rank=placeRank(p,q,plain);if(Number.isFinite(rank))hits.push({p,rank})}
 hits.sort((a,b)=>a.rank-b.rank||Number(b.p.countryCode==='DE')-Number(a.p.countryCode==='DE')||b.p.pop-a.p.pop||a.p.name.localeCompare(b.p.name,'de'));
 return hits.slice(0,limit).map(h=>offlinePlaceDetails(h.p));
}
function defaultLocationResults(){
 const choices=[location,...savedPlaces(),...locations],seen=new Set(),out=[];
 for(const l of choices){
  const point=homeLocationPoint(l);if(!point)continue;
  const id=placeId(l.name,...point);if(seen.has(id))continue;seen.add(id);
  out.push({...l,id,lon:point[0],lat:point[1],countryCode:l.countryCode||'DE',country:l.country||'Deutschland',region:l.region||'Deutschland',kind:l.kind||'Ort'});
 }
 return out;
}
function normalizePhoton(data){
 const out=[];
 for(const feature of data?.features||[]){
  const p=feature.properties||{},coords=feature.geometry?.coordinates;
  if(feature.geometry?.type!=='Point'||!Array.isArray(coords)||!supportedPlace(coords[0],coords[1])||typeof p.name!=='string'||!p.name.trim())continue;
  const [lon,lat]=coords,cc=String(p.countrycode||'').toUpperCase();
  const tags={city:'Stadt',town:'Stadt',village:'Dorf',hamlet:'Weiler',suburb:'Stadtteil',neighbourhood:'Ortsteil',quarter:'Ortsteil',locality:'Ort',municipality:'Gemeinde'};
  const name=/^\d+$/.test(p.name.trim())?(p.city||p.district||''):p.name.trim();
  if(!name)continue;
  const country=countryName(cc,p.country),region=p.state||p.county||country;
  out.push({id:placeId(name,lon,lat),name,lon,lat,countryCode:cc,country,region,district:[p.district,p.city,p.county].filter(x=>x&&x!==name&&x!==region).filter((x,i,a)=>a.indexOf(x)===i).join(' · '),postcode:String(p.postcode||''),kind:tags[p.osm_value]||(p.type==='district'?'Ortsteil':'Ort'),source:'online'});
 }
 return out;
}
function combinePlaces(local,online){
 const out=[...local];
 for(const p of online)if(!out.some(q=>placeNorm(q.name)===placeNorm(p.name)&&Math.hypot(q.lon-p.lon,q.lat-p.lat)<.012))out.push(p);
 return out;
}
function placeSubtitle(p){
 return [p.kind,p.district,p.region,p.country,p.postcode].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).join(' · ');
}
function selectWeatherPlace(p,{fromGps=false}={}){
 const temp=demoObservationAdapter.sample(p.lon,p.lat,0,'winter').temp;
 location={name:p.name,region:p.region||p.country||'Europa',country:p.country||countryName(p.countryCode),countryCode:p.countryCode,lon:p.lon,lat:p.lat,district:p.district||'',kind:p.kind,offset:clamp(Math.round(temp-7),-15,15)};
 rememberWeatherPlace(location,fromGps);selectedHour=0;openDay=-1;openPeriod=-1;closeDialog();renderWeather();renderQuickPlaces();renderPreferenceControls();setPage('weather');
}
function cancelPlaceLookup(){
 placeRequestId++;if(placeRequest){placeRequest.abort();placeRequest=null}
}
function drawPlaceResults(){
 const list=combinePlaces(placeSearchResults,placeOnlineResults);
 const container=el('location-results');container.replaceChildren();
 if(!list.length){const note=document.createElement('p');note.className='empty';note.textContent=placeQuery.length<2?'Mindestens zwei Zeichen eingeben.':'Keine lokalen Treffer. Versuche die Online-Suche.';container.appendChild(note)}
 for(const p of list){
  const row=document.createElement('div');row.className='location-result-row';const button=document.createElement('button');button.className='location-result';button.type='button';
  const labels=document.createElement('div'),name=document.createElement('strong'),sub=document.createElement('small');name.textContent=p.name;sub.textContent=placeSubtitle(p);labels.append(name,sub);button.append(labels);button.addEventListener('click',()=>selectWeatherPlace(p));row.appendChild(button);
  const star=document.createElement('button');star.className='result-star';star.type='button';const on=isFavorite(p);star.textContent=on?'★':'☆';star.setAttribute('aria-label',p.name+(on?' aus Favoriten entfernen':' als Favorit speichern'));star.setAttribute('aria-pressed',String(on));star.addEventListener('click',()=>toggleFavorite(p));row.appendChild(star);container.appendChild(row);
 }
 el('place-search-status').textContent=placeStatus||(!placeQuery?'Aktuelle und vorgeschlagene Orte':placeSearchResults.length+' lokale Treffer'+(placeSearchResults.length===35?' (Auswahl)':''));
 el('place-online-search').disabled=placeQuery.length<2||!!placeRequest;
}
function renderLocations(){
 cancelPlaceLookup();placeQuery=el('search-input').value.trim();placeOnlineResults=[];placeStatus='';
 placeSearchResults=!placeQuery?defaultLocationResults():searchOfflinePlaces(placeQuery);
 if(placeOnlineCache.has(placeNorm(placeQuery)))placeOnlineResults=placeOnlineCache.get(placeNorm(placeQuery));
 drawPlaceResults();
}
async function searchOnlinePlaces(){
 const query=el('search-input').value.trim();if(query.length<2||placeRequest)return;
 if(query!==placeQuery)renderLocations();
 const key=placeNorm(query);if(placeOnlineCache.has(key)){placeOnlineResults=placeOnlineCache.get(key);placeStatus='Online-Treffer aus dem Suchcache';drawPlaceResults();return}
 const id=++placeRequestId,controller=new AbortController();placeRequest=controller;placeStatus='Weitere Orte werden online gesucht …';drawPlaceResults();
 const timeout=setTimeout(()=>controller.abort(),9000);
 try{
  const url=new URL(locationOnlineEndpoint);url.searchParams.set('q',query);url.searchParams.set('lang','de');url.searchParams.set('limit','30');url.searchParams.set('bbox','-25,34,42,71');
  for(const layer of ['city','district','locality','county'])url.searchParams.append('layer',layer);
  const response=await fetch(url.toString(),{mode:'cors',credentials:'omit',signal:controller.signal});
  if(!response.ok)throw Error('HTTP '+response.status);
  const found=normalizePhoton(await response.json());if(id!==placeRequestId)return;
  placeOnlineResults=found;placeOnlineCache.set(key,found);if(placeOnlineCache.size>40)placeOnlineCache.delete(placeOnlineCache.keys().next().value);
  placeStatus=found.length?found.length+' Online-Treffer · OpenStreetMap':'Keine zusätzlichen Orte online gefunden.';
 }catch(e){if(id===placeRequestId)placeStatus='Online-Suche nicht erreichbar. Lokale Ortsdaten bleiben verfügbar.'}
 finally{clearTimeout(timeout);if(id===placeRequestId){placeRequest=null;drawPlaceResults()}}
}

// Device-local preferences. No backend/account, no push registration, and
// location access only after explicit user selection of GPS or GPS startup.
const preferenceKey='wetter.preferences.v1';
const defaultPreferences=()=>({theme:'system',startup:'last',push:false,minLevel:2,warnScope:'favorites-current',favorites:[],last:null});
function storedPlace(p){
 if(!p||typeof p.name!=='string'||!p.name.trim())return null;
 const point=homeLocationPoint(p);if(!point||!supportedPlace(...point))return null;
 const [lon,lat]=point;
 return {id:placeId(p.name,lon,lat),name:p.name,lon,lat,region:p.region||p.country||'Europa',country:p.country||countryName(p.countryCode||'DE'),countryCode:p.countryCode||'DE',district:p.district||'',kind:p.kind||'Ort',offset:Number.isFinite(p.offset)?p.offset:0};
}
function loadPreferences(){
 const defaults=defaultPreferences();
 try{
  const raw=JSON.parse(localStorage.getItem(preferenceKey)||'null');if(!raw||typeof raw!=='object')return defaults;
  const favorites=Array.isArray(raw.favorites)?raw.favorites.map(storedPlace).filter(Boolean):[];
  return {theme:['system','dark','light'].includes(raw.theme)?raw.theme:defaults.theme,startup:['last','gps','favorite'].includes(raw.startup)?raw.startup:'last',push:raw.push===true,minLevel:Number.isInteger(raw.minLevel)&&raw.minLevel>=1&&raw.minLevel<=5?raw.minLevel:2,warnScope:['current','favorites-current','favorites'].includes(raw.warnScope)?raw.warnScope:defaults.warnScope,favorites:favorites.filter((p,i,a)=>a.findIndex(q=>q.id===p.id)===i).slice(0,100),last:storedPlace(raw.last)};
 }catch{return defaults}
}
let preferences=defaultPreferences(),geoRequestId=0,locationIsGps=false,geoStatus='';
function savePreferences(){try{localStorage.setItem(preferenceKey,JSON.stringify(preferences));return true}catch{return false}}
function savedPlaces(){return preferences.favorites}
function isFavorite(p){const stored=storedPlace(p);return !!stored&&savedPlaces().some(q=>q.id===stored.id)}
function toggleFavorite(p){
 const stored=storedPlace(p);if(!stored)return;
 const i=preferences.favorites.findIndex(q=>q.id===stored.id);
 if(i>=0)preferences.favorites.splice(i,1);else if(preferences.favorites.length<100)preferences.favorites.push(stored);
 savePreferences();renderQuickPlaces();renderPreferenceControls();if(el('location-dialog').classList.contains('open'))drawPlaceResults();
}
function rememberWeatherPlace(p,fromGps=false){
 geoRequestId++;locationIsGps=fromGps;geoStatus='';
 // Automatic GPS results do not overwrite the manually selected fallback.
 if(!fromGps){preferences.last=storedPlace(p);savePreferences()}
}
function applyTheme(){
 const dark=preferences.theme==='dark'||(preferences.theme==='system'&&!(typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: light)').matches));
 document.documentElement.dataset.theme=dark?'dark':'light';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#101d30':'#f4f7fb');
}
function renderQuickPlaces(){
 const current=storedPlace(location);const favorite=isFavorite(location);
 el('favorite-current').textContent=favorite?'★ Gemerkt':'☆ Merken';el('favorite-current').setAttribute('aria-pressed',String(favorite));
 el('current-gps').classList.toggle('active',locationIsGps);
 el('quick-places').innerHTML=savedPlaces().map((p,i)=>'<button class="'+(current?.id===p.id?'active':'')+'" data-favorite-index="'+i+'">'+placeText(p.name)+'</button>').join('');
 el('favorite-empty').hidden=savedPlaces().length>0;
 document.querySelectorAll('[data-favorite-index]').forEach(b=>b.addEventListener('click',()=>{const p=savedPlaces()[+b.dataset.favoriteIndex];if(p)selectWeatherPlace(p)}));
 el('geo-status').textContent=geoStatus;el('geo-status').hidden=!geoStatus;
 el('dialog-gps-status').textContent=geoStatus;el('dialog-gps-status').hidden=!geoStatus;
}
function renderPreferenceControls(){
 el('pref-theme').value=preferences.theme;el('pref-startup').value=preferences.startup;el('pref-push').checked=preferences.push;
 el('pref-level').value=String(preferences.minLevel);el('pref-scope').value=preferences.warnScope;el('pref-push-detail').hidden=!preferences.push;
 el('pref-favorites').innerHTML=savedPlaces().length?savedPlaces().map((p,i)=>'<div class="saved-place"><button data-favorite-open="'+i+'" class="saved-name"><strong>'+placeText(p.name)+'</strong><small>'+placeText(placeSubtitle(p))+'</small></button><button data-favorite-remove="'+i+'" class="saved-remove" aria-label="'+placeText(p.name)+' entfernen">×</button></div>').join(''):'<p class="muted small">Noch keine Favoriten. Suche einen Ort und tippe auf den Stern.</p>';
 document.querySelectorAll('[data-favorite-open]').forEach(b=>b.addEventListener('click',()=>{const p=savedPlaces()[+b.dataset.favoriteOpen];if(p)selectWeatherPlace(p)}));
 document.querySelectorAll('[data-favorite-remove]').forEach(b=>b.addEventListener('click',()=>{const p=savedPlaces()[+b.dataset.favoriteRemove];if(p)toggleFavorite(p)}));
 el('pref-status').textContent=geoStatus;
}
function nearestWeatherPlace(lon,lat){
 if(!supportedPlace(lon,lat))return null;
 let nearest=null,best=Infinity;const lonScale=Math.cos(lat*Math.PI/180);
 for(const p of getLocationIndex()){
  const d=((p.lon-lon)*lonScale)**2+(p.lat-lat)**2;if(d<best){nearest=p;best=d}
 }
 return nearest&&Math.sqrt(best)*111<60?offlinePlaceDetails(nearest):null;
}
function requestCurrentPlace(){
 const id=++geoRequestId;geoStatus='Standort wird ermittelt …';renderQuickPlaces();renderPreferenceControls();
 const finish=message=>{if(id!==geoRequestId)return;geoStatus=message;renderQuickPlaces();renderPreferenceControls()};
 if(typeof navigator==='undefined'||!navigator.geolocation){finish('Standortzugriff ist in diesem Browser nicht verfügbar. Bitte einen Ort auswählen.');return}
 try{navigator.geolocation.getCurrentPosition(position=>{
  if(id!==geoRequestId)return;
  const p=nearestWeatherPlace(position.coords.longitude,position.coords.latitude);
  if(!p){finish('Kein Ort im unterstützten Kartengebiet gefunden.');return}
  selectWeatherPlace(p,{fromGps:true});geoStatus='Standort · nächster Ort: '+p.name;renderQuickPlaces();renderPreferenceControls();
 },err=>finish(err.code===1?'Standortfreigabe fehlt. Du kannst jederzeit einen Ort manuell auswählen.':'Standort momentan nicht verfügbar. Bitte erneut versuchen.'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000})}catch{finish('Der Browser erlaubt momentan keinen Standortzugriff. Bitte einen Ort auswählen.')}
}
function initPreferences(){
 preferences=loadPreferences();applyTheme();
 if(typeof matchMedia==='function'){
  const media=matchMedia('(prefers-color-scheme: light)');const changed=()=>{if(preferences.theme==='system')applyTheme()};
  if(media.addEventListener)media.addEventListener('change',changed);else media.addListener?.(changed);
 }
 const initial=preferences.startup==='favorite'&&savedPlaces().length?savedPlaces()[0]:preferences.last;
 if(initial)location={...initial,offset:clamp(Math.round(demoObservationAdapter.sample(initial.lon,initial.lat,0,'winter').temp-7),-15,15)};
 el('settings-open').addEventListener('click',()=>{renderPreferenceControls();setPage('settings')});
 el('settings-footer').addEventListener('click',()=>{renderPreferenceControls();setPage('settings')});
 el('settings-back').addEventListener('click',()=>setPage('weather'));
 el('info-back').addEventListener('click',()=>setPage('weather'));
 el('favorite-current').addEventListener('click',()=>toggleFavorite(location));
 el('current-gps').addEventListener('click',requestCurrentPlace);
 el('dialog-gps').addEventListener('click',requestCurrentPlace);
 el('pref-gps-now').addEventListener('click',requestCurrentPlace);
 el('pref-add-place').addEventListener('click',openDialog);
 for(const [id,key] of [['pref-theme','theme'],['pref-startup','startup'],['pref-level','minLevel'],['pref-scope','warnScope']]){
  el(id).addEventListener('change',e=>{preferences[key]=key==='minLevel'?Number(e.target.value):e.target.value;savePreferences();if(key==='theme')applyTheme();if(key==='startup'){geoRequestId++;geoStatus='';if(preferences.startup==='gps')requestCurrentPlace();}renderPreferenceControls();renderQuickPlaces()});
 }
 el('pref-push').addEventListener('change',e=>{preferences.push=e.target.checked;savePreferences();renderPreferenceControls()});
 el('pref-reset').addEventListener('click',()=>{if(!window.confirm('Alle lokal gespeicherten Favoriten und Einstellungen zurücksetzen?'))return;geoRequestId++;preferences=defaultPreferences();locationIsGps=false;geoStatus='';savePreferences();applyTheme();renderPreferenceControls();renderQuickPlaces()});
 document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>openInfo(b.dataset.info)));
 renderPreferenceControls();renderQuickPlaces();
 if(preferences.startup==='gps')requestCurrentPlace();
}
const infoPages={
 imprint:['Impressum','<p class="legal-notice">Entwicklungsstand · Noch kein vollständiges Impressum.</p><h3>Anbieter</h3><p>Verantwortlicher Anbieter, ladungsfähige Anschrift und Kontaktdaten werden vor Veröffentlichung ergänzt.</p><p>Weitere erforderliche Anbieterangaben werden nach Festlegung der Betriebsform geprüft. <a href="https://www.gesetze-im-internet.de/ddg/__5.html" target="_blank" rel="noopener noreferrer">Informationen zu § 5 DDG</a></p>'],
 contact:['Kontakt & Support','<p>Hier werden später die Kontaktmöglichkeiten für Fragen, Fehlerberichte, Rückmeldungen und Datenschutzanfragen hinterlegt.</p><p class="legal-notice">Eine Support-E-Mail-Adresse und ein Kontaktformular sind in dieser Demo noch nicht eingerichtet.</p>'],
 privacy:['Datenschutz','<p class="legal-notice">Vorläufige technische Hinweise zur Demo · keine abschließende Datenschutzerklärung.</p><h3>Lokale Einstellungen</h3><p>Design, Favoriten, manuell gewählter Ort und Warnpräferenzen werden lokal im Browser gespeichert. Es gibt derzeit kein Nutzerkonto.</p><h3>Standort</h3><p>Standortzugriff erfolgt nur nach deiner Auswahl und Browserfreigabe. Die Koordinaten werden lokal einem Ort zugeordnet; der genaue GPS-Wert wird nicht als Einstellung gespeichert. Beim Öffnen von Karten können externe Kartenkacheln für die gewählte Region geladen werden.</p><h3>Externe Dienste</h3><p>Die Online-Ortssuche sendet den Suchbegriff an Photon. Karten- und Höhendaten können von externen Kartenservern geladen werden. Die vollständigen Angaben zu Anbietern, Datenverarbeitung und Betroffenenrechten folgen vor Veröffentlichung.</p>'],
 terms:['AGB & Nutzungsbedingungen','<p class="legal-notice">Platzhalter · Die verbindlichen Nutzungsbedingungen werden vor Veröffentlichung erstellt und geprüft.</p><h3>Designprototyp</h3><p>Ausdrücklich als Demo markierte Warnungen und Wetterfelder sind simuliert. Standortdaten werden aus ICON-Modellen und verfügbaren DWD-Stationsmeldungen gewonnen. ICON-Realdaten sind separat als DWD gekennzeichnet. Die Anwendung ist kein amtlicher Warnservice. Für sicherheitsrelevante Entscheidungen bitte amtliche Informationen nutzen.</p><h3>Geplante Anwendung</h3><p>Funktionen, Verfügbarkeit der Daten, Bedingungen der Nutzung und gegebenenfalls weitere Vertragsinformationen werden für die veröffentlichte Version festgelegt.</p>'],
 sources:['Datenquellen & Wettermodelle','<p>Offizielle Anbieter und geplante Quellen. Echte ICON-Felder werden aus DWD Open Data erzeugt; IFS-Felder werden aus ECMWF Open Data (CC BY 4.0) abgeleitet; Standortwerte nutzen ICON und IFS und verfügbare SYNOP-Messungen; RV-Radar wird direkt vom DWD angezeigt. Nicht angebundene Werte bleiben leer. Warnungen sind Demo.</p><div class="source-links"><a href="https://opendata.dwd.de/weather/nwp/icon-d2/" target="_blank" rel="noopener noreferrer"><strong>ICON-D2</strong><small>Deutscher Wetterdienst · Open Data</small></a><a href="https://opendata.dwd.de/weather/nwp/icon-eu/" target="_blank" rel="noopener noreferrer"><strong>ICON-EU</strong><small>Deutscher Wetterdienst · Open Data</small></a><a href="https://www.ecmwf.int/en/forecasts/datasets/open-data" target="_blank" rel="noopener noreferrer"><strong>IFS</strong><small>ECMWF · IFS Open Data · CC BY 4.0 · aufbereitet</small></a><a href="https://www.nco.ncep.noaa.gov/pmb/products/gfs/" target="_blank" rel="noopener noreferrer"><strong>GFS</strong><small>NOAA / NCEP</small></a><a href="https://kachelmannwetter.com/de/modellkarten/" target="_blank" rel="noopener noreferrer"><strong>Super HD / Swiss HD</strong><small>Kachelmannwetter · mögliche spätere Integration, Rechte noch zu klären</small></a><a href="https://opendata.dwd.de/weather/radar/" target="_blank" rel="noopener noreferrer"><strong>Radar</strong><small>DWD Open Data · RV-Komposit</small></a></div><h3>Geografie</h3><p><a href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Regionales/Gemeindeverzeichnis/_inhalt.html" target="_blank" rel="noopener noreferrer">Destatis</a> · <a href="https://www.bkg.bund.de" target="_blank" rel="noopener noreferrer">BKG / GeoBasis-DE</a> · <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> · <a href="https://photon.komoot.io/" target="_blank" rel="noopener noreferrer">Photon</a> · <a href="https://www.ncei.noaa.gov/products/etopo-global-relief-model" target="_blank" rel="noopener noreferrer">NOAA ETOPO</a> · <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener noreferrer">Terrain Tiles</a></p><p>Konkrete Quellen- und Lizenzhinweise sind zusätzlich in den Karteninformationen verfügbar. Vor Anbindung jedes Modells werden die Nutzungsrechte geprüft.</p>'],
 about:['Über die App','<p>Wetter-App · Designprototyp</p><p>Lokales Wetter, 7-Tage-Prognose, Karten, Warnungen und meteorologische Spezialparameter in einer Oberfläche. DWD-Modellwerte und Messdaten werden soweit verfügbar übernommen; Warnungen sind aktuell simuliert.</p>']
};
infoPages.sources[1]=infoPages.sources[1]
 .replace('IFS-Felder werden aus ECMWF Open Data (CC BY 4.0) abgeleitet; Standortwerte nutzen ICON und IFS und verfügbare SYNOP-Messungen','IFS, AIFS und AIFS-ENS Control werden aus ECMWF Open Data (CC BY 4.0) abgeleitet; Ortsprognosen verwenden ausschließlich Modellwerte des jeweiligen Ortsrasters; SYNOP-Messwerte sind getrennt')
 .replace('Warnungen sind Demo.','Modellwarnhinweise sind keine amtlichen Warnungen.')
 .replace('<h3>Geografie</h3>','<h3>ECMWF KI-Modelle</h3><div class="source-links"><a href="https://www.ecmwf.int/en/forecasts/datasets/open-data" target="_blank" rel="noopener noreferrer"><strong>AIFS / AIFS-ENS Control</strong><small>ECMWF · global · 15 Tage · Kontrolllauf, kein Ensemblemittel · Daten räumlich reduziert</small></a><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer"><strong>CC BY 4.0</strong><small>ECMWF-Daten, mit Quellenangabe und Kennzeichnung der Aufbereitung kommerziell nutzbar.</small></a></div><p>Die neuen Modelle werden erst nach erfolgreichem Datenimport angezeigt. Kein kostenpflichtiger API-Schlüssel erforderlich. Fehlende Parameter bleiben leer.</p><h3>Geografie</h3>');
infoPages.sources[1]+='<h3>Radar-Verbund</h3><p>Deutscher Wetterdienst (RY, HymecNG), EUMETNET OPERA (CC BY 4.0) und MeteoSchweiz PRECIP (RZC). Die Messraster werden auf ein gemeinsames Raster gebracht. Fehlende Messwerte sind nicht gleich trocken.</p><div class="source-links"><a href="https://data.geo.admin.ch/api/stac/v1/collections/ch.meteoschweiz.ogd-radar-precip" target="_blank" rel="noopener noreferrer"><strong>MeteoSchweiz</strong><small>Quelle: MeteoSchweiz · offene Radardaten · räumlich aufbereitet</small></a><a href="https://www.eumetnet.eu/activities/observations-programme/current-activities/opera/" target="_blank" rel="noopener noreferrer"><strong>EUMETNET OPERA</strong><small>CC BY 4.0 · räumlich aufbereitet</small></a></div>';
infoPages.sources[1]+='<h3>Sonne & Strahlung</h3><p>DUETT (Deutscher Wetterdienst, Satelliten- und Bodenmessungen), CC BY 4.0. Stündliche Beobachtungsanalyse im 2-km-Raster, für die Karten auf geografische Zellen umprojiziert. Keine Momentanmessung oder Modellvorhersage.</p><div class="source-links"><a href="https://opendata.dwd.de/climate_environment/CDC/grids_germany/hourly/duett/" target="_blank" rel="noopener noreferrer"><strong>DUETT</strong><small>DWD CDC · CC BY 4.0</small></a></div>';
function openInfo(key){const page=infoPages[key];if(!page)return;el('info-title').textContent=page[0];el('info-content').innerHTML=page[1];setPage('info')}

// Only verified, explicitly identified data can enter the real model mode.
const realModelFiles={'ICON-D2':'icon-d2','ICON-D2-RUC':'icon-d2-ruc','ICON-EU':'icon-eu','IFS':'ifs','GFS':'gfs','AIFS':'aifs','AIFS-ENS Control':'aifs-ens-control'};
const coreForecastModels=['ICON-D2','ICON-EU','IFS','GFS'];
const forecastPriority=[...coreForecastModels,'AIFS','AIFS-ENS Control'];
const modelProvider=model=>model==='IFS'||model.startsWith('AIFS')?'ECMWF':model==='GFS'?'NOAA':'DWD';
const modelMax=model=>model==='ICON-D2'?48:model==='ICON-D2-RUC'?27:model==='ICON-EU'?120:model.startsWith('AIFS')?360:240;
const modelAgeLimit=model=>model==='ICON-D2-RUC'?6:modelProvider(model)==='DWD'?18:36;
let modelDataMode='demo',realModelRevision=0;
const realModelCache=new Map(),realModelRequests=new Map(),realDecoded=new Map(),realModelErrors=new Map();
const hourlyModelCache=new Map(),hourlyModelRequests=new Map();
const pointModelCache=new Map(),pointWeatherRequests=new Map(),pointWeatherChecks=new Map();
const pointKey=p=>p?`${p[0].toFixed(5)},${p[1].toFixed(5)}`:'';
const pointRuns=(model,p)=>(pointModelCache.get(pointKey(p))||[]).filter(d=>d.model===model);
// A point packet stores exactly the selected native grid cell, never a station.
const locationRuns=(model,p)=>[...pointRuns(model,p),...(hourlyModelCache.get(model)||[]),...modelRuns(model)].sort((a,b)=>Date.parse(b.run)-Date.parse(a.run)||Number(!!b.pointNative)-Number(!!a.pointNative)||a.hours[1]-b.hours[1]);
let nativeTemperatureMeta=null,nativeTemperatureCheck=0,nativeTemperatureRequest=null;
const nativeTemperatureTiles=new Map(),nativeTemperatureRequests=new Map();
function nativeTemperatureCell(point,meta=nativeTemperatureMeta){
 if(!point||!meta)return null;const g=meta.grid,s=meta.tileSize,x=Math.round((point[0]-g.west)/g.dx),y=Math.round((point[1]-g.south)/g.dy);
 if(x<0||y<0||x>=g.nx||y>=g.ny)return null;
 const tx=Math.floor(x/s),ty=Math.floor(y/s),nx=Math.min(s,g.nx-tx*s),ny=Math.min(s,g.ny-ty*s);
 return {key:tx+'-'+ty,n:(y% s)*nx+x%s,nx,ny};
}
const nativeExtraMeta=new Map(),nativeExtraTiles=new Map(),nativeExtraRequests=new Map(),nativeExtraChecks=new Map();
const nativeTemperatureRoots=['icon-d2-temperature','icon-d2-anchor-temperature','icon-d2-map-temperature','icon-eu-temperature','icon-eu-anchor-temperature','icon-eu-map-temperature','ifs-temperature','ifs-short-temperature','gfs-temperature','aifs-temperature','aifs-ens-control-temperature'];
function nativeTemperatureTile(d,point,h=null){
 if(!d||!point)return null;
 const match=m=>m&&m.model===d.model&&Date.parse(m.run)===Date.parse(d.run)&&(h==null||m.hours?.includes(h));
 if(d.model==='ICON-D2'&&Date.parse(d.run)===Date.parse(nativeTemperatureMeta?.run)){
  const cell=nativeTemperatureCell(point,nativeTemperatureMeta),tile=cell&&nativeTemperatureTiles.get(cell.key);
  if(tile&&tile.generated===nativeTemperatureMeta.generated&&(h==null||tile.frames[h]?.temp2))return {cell,tile,meta:nativeTemperatureMeta};
 }
 for(const [root,meta] of nativeExtraMeta){
  if(!match(meta))continue;
  const cell=nativeTemperatureCell(point,meta),tile=cell&&nativeExtraTiles.get(root+'/'+cell.key);
  if(tile&&tile.generated===meta.generated&&(h==null||tile.frames[h]?.temp2))return {cell,tile,meta};
 }
 return null;
}
function nativeTemperatureValue(d,point,h,id){
 if(d?.pointNative)return pointKey(d.pointLocation)===pointKey(point)?realModelValue(d,{id},point[0],point[1],h):null;
 const hit=nativeTemperatureTile(d,point,h);if(!hit)return null;
 const {cell,tile}=hit,packed=tile.frames[h]?.[id];if(!packed)return NaN;
 const byte=cell.n*2,offset=Math.floor(byte/3)*4,shift=byte%3;
 const b=atob(packed.slice(offset,offset+(shift===2?8:4))),v=(b.charCodeAt(shift)|(b.charCodeAt(shift+1)<<8))<<16>>16;
 return v===-32768?NaN:v*.1;
}
const frameTemperatureNative=f=>!!f&&(f.interpolated?frameTemperatureNative(f.before)&&frameTemperatureNative(f.after):Number.isFinite(nativeTemperatureValue(f.d,f.point,f.hour,'temp2'))&&nativeTemperatureValue(f.d,f.point,f.hour,'temp2')!==null);
const temperatureRaster=(d,point)=>{if(d?.pointNative)return 'Originalraster '+d.grid.step.toLocaleString('de-DE',{maximumFractionDigits:5})+'°';const r=nativeTemperatureTile(d,point);return r?'Originalraster '+r.meta.grid.dx.toLocaleString('de-DE',{maximumFractionDigits:5})+'°':d?'Reduziertes '+d.grid.step.toLocaleString('de-DE')+'°-Raster':null};
const shortModelCache=new Map(),modelCheckTimes=new Map();
const modelRuns=model=>[shortModelCache.get(model),realModelCache.get(model)].filter(Boolean).sort((a,b)=>Date.parse(b.run)-Date.parse(a.run));
const weatherCodesCache=new Map();
function supplementalWeatherField(d,h){
 const extra=weatherCodesCache.get(d.model);
 if(!extra||Date.parse(extra.run)!==Date.parse(d.run)||['west','south','step','nx','ny'].some(k=>extra.grid?.[k]!==d.grid[k]))return null;
 return extra.frames?.[h];
}
const nativeMapModels=new Map(),nativeMapChecks=new Map(),nativeMapLoading=new Map(),nativeFieldLoading=new Map();
const nativeReads=new Map(),nativeMapFailures=new Map(),nativeFieldFailures=new Map();
const germanyMapFiles=new Set(['icon-d2','icon-eu','gfs','ifs','ifs-short']);
const mapFiles=model=>[realModelFiles[model],...(model==='IFS'?['ifs-short']:[])].filter(Boolean);
const germanyMapRegion=()=>typeof mapRegion!=='undefined'&&mapRegion==='Deutschland';
function mapModelRuns(model,germany=germanyMapRegion()){
 const files=mapFiles(model),order=(a,b)=>Date.parse(b.run)-Date.parse(a.run);
 const detailed=germany?files.map(f=>nativeMapModels.get(f+'-de')).filter(d=>d&&mapLeadTime(d,d.hours.at(-1))>Date.now()).sort(order):[];
 if(detailed.length)return detailed;
 const native=files.map(f=>nativeMapModels.get(f)).filter(Boolean).sort(order);
 return native.length?native:modelRuns(model);
}
// A model's initialization time is not the validity time of a forecast.
const mapLeadTime=(d,h)=>Date.parse(d.run)+h*3600000;
function futureMapRuns(model,now=Date.now()){
 const valid=d=>Date.parse(d.run)<=now&&mapLeadTime(d,d.hours.at(-1))>now;
 const native=mapModelRuns(model).filter(valid);
 const alternatives=germanyMapRegion()?mapFiles(model).map(f=>nativeMapModels.get(f)).filter(d=>d&&valid(d)&&!native.includes(d)):[];
 return native.length?[...native,...alternatives]:modelRuns(model).filter(valid);
}
function realData(now=Date.now()){
 if(modelDataMode!=='real')return null;const runs=futureMapRuns(mapModel,now),explicit=runs.filter(d=>Date.parse(d.run)===selectedMapRun);
 const candidates=explicit.length?explicit:runs,p=fields[mapLayer];
 // Prefer the regional original grid, but do not hide a parameter merely
 // because one of the same model's available snapshots lacks that field.
 return candidates.find(d=>futureMapHours(d,p,now).length)||candidates[0]||null;
}
function nativeMapRoot(file){return 'https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/generated-native-'+file+'/'}
async function cachedNativePacket(url){try{if(typeof caches==='undefined')return null;return (await (await caches.open('wetter-native-fields-v1')).match(url))||null}catch{return null}}
async function rememberNativePacket(url,bytes){try{if(typeof caches==='undefined'||bytes.byteLength>2_000_000)return;const c=await caches.open('wetter-native-fields-v1');await c.put(url,new Response(bytes));const keys=await c.keys();for(const k of keys.slice(0,Math.max(0,keys.length-24)))await c.delete(k)}catch{}}
async function nativeMapRead(file,path,zip=false,version='',timeout=zip?25000:10000){
 const url=nativeMapRoot(file)+path+'?v='+encodeURIComponent(version||Math.floor(Date.now()/60000));
 if(nativeReads.has(url))return nativeReads.get(url);
 const task=(async()=>{try{
  // The generated version is immutable from the client's perspective. The
  // packet header is still validated against the manifest on every read.
  const cached=zip&&version?await cachedNativePacket(url):null,r=cached||await fetch(url,{cache:version?'default':'no-cache',credentials:'omit',signal:AbortSignal.timeout(timeout)});
  if(!r.ok)return null;if(!zip)return await r.json();
  const a=await r.arrayBuffer(),b=new Uint8Array(a);
  const packet=b[0]===31&&b[1]===139?await new Response(new Blob([a]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(a));if(!cached&&version&&packet.generated===version&&packet.schema===2)rememberNativePacket(url,a);return packet;
 }catch{return null}})().finally(()=>nativeReads.delete(url));
 nativeReads.set(url,task);return task;
}
function validateNativeMapManifest(m,model,file){
 const g=m?.grid;
 if(m?.schema!==2||m.model!==model||!Number.isFinite(Date.parse(m.run))||!Number.isFinite(Date.parse(m.generated))||!g||![g.west,g.south,g.step].every(Number.isFinite)||g.step<=0||g.scale!==.1||g.missing!==-32768||![g.nx,g.ny].every(n=>Number.isInteger(n)&&n>1)||g.nx*g.ny>2000000)throw Error('Ungültiges Originalraster');
 const fields=m.frames,hs=m.hours;
 if(!Array.isArray(hs)||hs.length<2||hs[0]!==0||!hs.every((h,i)=>Number.isInteger(h)&&(!i||h>hs[i-1])))throw Error('Ungültige Modellzeiten');
 const hailProduct=model==='ICON-D2-RUC'&&m.product==='hail'&&m.gridMapping==='nearest-source-cell',coreHours=m.coreHours??hs;if(model==='ICON-D2-RUC'&&!hailProduct||!Array.isArray(coreHours)||(!hailProduct&&!coreHours.includes(0))||(hailProduct&&coreHours.length!==0)||coreHours.some(h=>!hs.includes(h)))throw Error('Ungültige Grundfeldzeiten');
 const fs={};
 for(const h of hs){
  if(!Array.isArray(fields?.[h])||!fields[h].length||(hailProduct&&(fields[h].length!==1||fields[h][0]!=='hail'))||(coreHours.includes(h)&&!['temp2','dew','wind','slp','cloud','rainTotal'].every(k=>fields[h].includes(k))))throw Error('Unvollständiger Originalmodelllauf');
  fs[h]={};for(const k of fields[h]){
   if(typeof k!=='string'||!/^\w+$/.test(k)||!Number.isFinite(m.scales?.[k])||m.scales[k]<=0)throw Error('Ungültiges Modellfeld');
   fs[h][k]=true;
  }
 }
 return {...m,frames:fs,nativeMap:true,file,decoded:new Map()};
}
async function fetchNativeMapModel(model,force=false,germany=germanyMapRegion()){
 if(!realModelFiles[model])return;
 const base=mapFiles(model),files=germany?[...base,...base.filter(f=>germanyMapFiles.has(f)).map(f=>f+'-de')]:base;
 for(const [key,t] of nativeMapChecks)if(Date.now()-t>5*60000)nativeMapChecks.delete(key);
 await Promise.all(files.map(async file=>{
  if(nativeMapLoading.has(file))return nativeMapLoading.get(file);
  if(!force&&Date.now()-(nativeMapChecks.get(file)||0)<(nativeMapFailures.has(file)?15000:120000))return;
  nativeMapChecks.set(file,Date.now());
  const task=(async()=>{try{
   const raw=await nativeMapRead(file,'index.json'),m=validateNativeMapManifest(raw,model,file);
   nativeMapFailures.delete(file);
   if(newerSnapshot(m,nativeMapModels.get(file))){nativeMapModels.set(file,m);realModelRevision++;if(activePage==='map'){if(mapSource==='model'&&mapModel===model)renderMap();else if(mapSource==='live')scheduleMap()}else if(activePage==='weather')scheduleHomeMaps()}
  }catch{nativeMapFailures.set(file,Date.now());if(activePage==='map')setTimeout(()=>{if(activePage==='map'&&(mapModel===model||mapSource==='live'))scheduleMap()},15500)}})().finally(()=>{nativeMapLoading.delete(file);if(activePage==='map'&&mapModel===model)scheduleMap();if(activePage==='expert')updateExpertModelAvailability()});
  nativeMapLoading.set(file,task);return task;
 }));
}
function diagnosticKeys(id){
 if(/^wind(?:p|dirp)\d+$/.test(id)){const lev=id.match(/\d+$/)[0];return ['u'+lev,'v'+lev]}
 if(/^q\d+$/.test(id)){const lev=id.slice(1);return ['t'+lev,'rh'+lev]}
 return ({tt:['t850','rh850','t500'],ki:['t850','rh850','t700','rh700','t500'],s850500:['u850','v850','u500','v500'],lclApprox:['temp2','dew'],ehi03:['mlcape','srh03'],dcapeSpeed:['dcape']})[id]||null;
}
function mapInterval(d,id,h){
 const key=id==='radiation'?'solarTotal':'rainTotal',before=d.hours.filter(t=>t<h&&d.frames?.[t]?.[key]).at(-1);
 return Number.isFinite(before)?h-before:NaN;
}
function mapFieldRequirements(d,p,h){
 if(p.id==='synoptic')return [[h,'z500'],[h,'slp']];
 if(p.id==='syn850')return [[h,'t850'],[h,'slp']];
 if(p.id==='syn500')return [[h,'t500'],[h,'z500']];
 if(p.id==='jet'&&d.frames?.[h]?.u300&&d.frames?.[h]?.v300)return [[h,'u300'],[h,'v300']];
 const id=p.id==='rh'?'rh2':p.id,dynamic=id==='rainrate'||id==='radiation',interval=dynamic?mapInterval(d,id,h):/^rain\d+$/.test(id)||id==='conv'||id==='strat'?p.interval:0;
 if(dynamic&&!Number.isFinite(interval))return [[-1,id==='radiation'?'solarTotal':'rainTotal']];
 const keys=diagnosticKeys(id)|| (id==='radiation'?['solarTotal']:id==='conv'?['convTotal']:id==='strat'?['convTotal','rainTotal']:interval?['rainTotal']:[id]);
 return keys.flatMap(k=>interval?[[h,k],[h-interval,k]]:[[h,k]]);
}
const nativeFieldQueue=[];let nativeFieldActive=0;
function pumpNativeFields(){
 while(nativeFieldActive<6&&nativeFieldQueue.length){
  const job=nativeFieldQueue.shift();nativeFieldActive++;
  job.run().then(job.resolve,()=>job.resolve(false)).finally(()=>{nativeFieldActive--;pumpNativeFields()});
 }
}
function fetchNativeMapFields(d,p,h,priority=true){
 if(!d?.nativeMap)return;
 const requirements=mapFieldRequirements(d,p,h);
 if(!requirements.every(([t,k])=>d.frames[t]?.[k]))return;
 const pending=requirements.filter(([t,k])=>!d.decoded.has(t+'/'+k));
 if(!pending.length){for(const [t,k] of requirements){const id=t+'/'+k,a=d.decoded.get(id);d.decoded.delete(id);d.decoded.set(id,a)}return;}
 const tasks=pending.map(([t,k])=>{
  const id=t+'/'+k,key=d.file+'/'+d.generated+'/'+id;
  if(nativeFieldLoading.has(key)){
   if(priority){const i=nativeFieldQueue.findIndex(j=>j.key===key);if(i>0)nativeFieldQueue.unshift(nativeFieldQueue.splice(i,1)[0]);}
   return nativeFieldLoading.get(key);
  }
  if(Date.now()-(nativeFieldFailures.get(key)||0)<10000)return Promise.resolve(false);
  const run=async()=>{
   const v=await nativeMapRead(d.file,t+'-'+k+'.json.gz',true,d.generated);
   if(!v||v.schema!==2||v.run!==d.run||v.generated!==d.generated||v.hour!==t||v.field!==k||typeof v.values!=='string'){
    // The rolling generated branch may have changed during the download.
    if(v&&v.generated!==d.generated)nativeMapChecks.delete(d.file);
    return false;
   }
   try{const raw=atob(v.values);if(raw.length!==d.grid.nx*d.grid.ny*2)return false;
    const a=new Int16Array(raw.length/2);for(let n=0;n<a.length;n++)a[n]=(raw.charCodeAt(n*2)|(raw.charCodeAt(n*2+1)<<8))<<16>>16;
    // Preserve recently read fields and bound decoded memory per model run.
    d.decoded.set(id,a);while(d.decoded.size>24)d.decoded.delete(d.decoded.keys().next().value);return true;
   }catch{return false}
  };
  let resolve;const task=new Promise(r=>resolve=r).then(ok=>{if(ok)nativeFieldFailures.delete(key);else if(ok===false){nativeFieldFailures.set(key,Date.now());if(priority)setTimeout(()=>{if(activePage==='map'&&(mapSource==='live'||realData()===d&&mapHour===h))scheduleMap();else if(activePage==='weather')scheduleHomeMaps()},10500)}return ok}).finally(()=>nativeFieldLoading.delete(key));
  nativeFieldLoading.set(key,task);const job={key,run,resolve};if(priority)nativeFieldQueue.unshift(job);else nativeFieldQueue.push(job);
  // Rapid scrubbing may supersede pending frames. Do not accumulate an
  // unbounded queue; any cancelled selection can be requested again.
  while(nativeFieldQueue.length>24){const discarded=nativeFieldQueue.pop();discarded.resolve(null)}
  pumpNativeFields();return task;
 });
 return Promise.all(tasks).then(a=>{if(a.some(Boolean)){realModelRevision++;if(activePage==='map')scheduleMap();else if(activePage==='weather')scheduleHomeMaps()}return a.every(Boolean)});
}
function prefetchNextMapField(d,p,h){
 if(!d?.nativeMap||!nativeFieldsReady(d,p,h)||nativeFieldLoading.size||document.hidden||navigator.connection?.saveData)return;
 const hours=futureMapHours(d,p),i=hours.indexOf(h),next=hours[i+1];
 if(next!==undefined&&!nativeFieldsReady(d,p,next))fetchNativeMapFields(d,p,next,false);
}
function nativeFieldsReady(d,p,h){return !!d?.nativeMap&&mapFieldRequirements(d,p,h).every(([t,k])=>d.decoded.has(t+'/'+k));}
let selectedMapRun=null;
// Filter by the actual forecast timestamp AND the required fields. For a sum,
// earlier inputs may still be needed internally, not as selectable past maps.
function futureMapHours(d,p,now=Date.now()){
 if(!d||!p)return [];
 return d.hours.filter(h=>mapLeadTime(d,h)>now&&mapFieldRequirements(d,p,h).every(([t,k])=>!!d.frames?.[t]?.[k]));
}
function mapCadence(d,p){
 if(!d)return '';
 const hours=d.hours.filter(h=>mapFieldRequirements(d,p,h).every(([t,k])=>!!d.frames?.[t]?.[k]));
 if(hours.length<2)return '';
 const runs=[];
 for(let i=1;i<hours.length;i++){const step=hours[i]-hours[i-1],last=runs.at(-1);if(last?.step===step)last.end=hours[i];else runs.push({step,end:hours[i]})}
 return 'Original-Zeitschritte: '+runs.map((r,i)=>r.step+' h'+(i<runs.length-1?' bis +'+r.end+' h':'')).join(', danach ');
}
function nextMapSelection(d,hours,target=null,now=Date.now()){
 if(!d||!hours.length)return {hour:NaN,target};
 const future=target!==null&&target>now;
 const hour=future?(hours.find(h=>mapLeadTime(d,h)>=target)??hours.at(-1)):hours[0];
 return {hour,target:future?target:null};
}
function realModelSupported(p,step,max,anyHour=false){
 const d=realData(),id=p.id==='rh'?'rh2':p.id;if(!d)return false;
 if(anyHour){const runs=futureMapRuns(mapModel).filter(r=>selectedMapRun===null||Date.parse(r.run)===selectedMapRun);return runs.some(r=>futureMapHours(r,p).length>0)}
 if(p.interval>max)return false;
 const available=h=>mapFieldRequirements(d,p,h).every(([t,k])=>!!d.frames?.[t]?.[k]);
 return mapLeadTime(d,mapHour)>Date.now()&&available(mapHour);
}
function effectiveModel(){
 const base=mapModels[mapModel],d=realData();
 if(d)return {...base,step:d.hours[1]-d.hours[0],max:d.hours.at(-1),grid:d.nativeMap?d.grid.step:mapLayer==='temp2'&&matchingNativeMap()?matchingNativeMap().meta.grid.dx:d.grid.step};
 if(modelDataMode==='real'&&realModelFiles[mapModel])return {...base,step:mapModel==='ICON-D2'?3:6,max:modelMax(mapModel)};
 return base;
}
function modelRunDate(){const d=realData();return modelDataMode==='real'?(d?new Date(d.run):null):new Date(Date.UTC(2026,10,15,mapRun))}
function modelValidDate(){const d=modelRunDate();if(!d||!Number.isFinite(mapHour))return null;const t=d.getTime()+mapHour*3600000;return modelDataMode==='real'&&t<=Date.now()?null:new Date(t)}
function validateRealData(d,model){
 if(!d||d.schema!==1||d.model!==model||!Number.isFinite(Date.parse(d.run))||!Number.isFinite(Date.parse(d.generated)))throw Error('Ungültiger Modelllauf');
 const g=d.grid;if(!g||!Number.isFinite(g.west)||!Number.isFinite(g.south)||!(g.step>0)||g.scale!==.1||g.missing!==-32768||!Number.isInteger(g.nx)||!Number.isInteger(g.ny)||g.nx<2||g.ny<2||g.nx*g.ny>500000)throw Error('Ungültiges Modellraster');
 if(!Array.isArray(d.hours)||d.hours.length<2||d.hours[0]!==0||!d.hours.every((h,i)=>Number.isInteger(h)&&h===i*d.hours[1])||d.hours[1]<=0)throw Error('Ungültige Prognoseschritte');
 const encodedLength=4*Math.ceil(g.nx*g.ny*2/3);
 for(const h of d.hours){const frame=d.frames?.[h];for(const p of ['temp2','dew','wind','slp','cloud','rainTotal'])if(typeof frame?.[p]!=='string')throw Error('Unvollständiges Modellfeld: '+p);for(const [p,packed] of Object.entries(frame))if(typeof packed!=='string'||packed.length!==encodedLength)throw Error('Ungültiges Modellfeld: '+p);}
 return d;
}
function decodeRealField(d,h,id){
 if(d.nativeMap)return d.decoded.get(h+'/'+id)||null;
 const k=d.model+'/'+d.run+'/'+d.hours[1]+'/'+d.generated+'/'+h+'/'+id;if(realDecoded.has(k))return realDecoded.get(k);
 const packed=d.frames?.[h]?.[id]||(id==='ww'?supplementalWeatherField(d,h):null);if(!packed)return null;
 try{
  const binary=atob(packed),g=d.grid;if(binary.length!==g.nx*g.ny*2)return null;
  const values=new Int16Array(binary.length/2);
  for(let i=0;i<values.length;i++)values[i]=(binary.charCodeAt(i*2)|(binary.charCodeAt(i*2+1)<<8))<<16>>16;
  realDecoded.set(k,values);if(realDecoded.size>48)realDecoded.delete(realDecoded.keys().next().value);return values;
 }catch{return null}
}
function realModelValue(d,p,lon,lat,h){
 if(!d)return NaN;const g=d.grid,x=Math.round((lon-g.west)/g.step),y=Math.round((lat-g.south)/g.step);
 if(x<0||x>=g.nx||y<0||y>=g.ny)return NaN;
 const n=y*g.nx+x;
 // Point queries decode only the requested 16-bit cell, not an entire raster.
 const read=(hour,id)=>{const scale=id==='ww'?1:d.scales?.[id]??g.scale;let v;
  if(d.nativeMap)v=d.decoded.get(hour+'/'+id)?.[n];
  else{const packed=d.frames?.[hour]?.[id]||(id==='ww'?supplementalWeatherField(d,hour):null);v=packedCell(packed,n)}
  return v===undefined||v===g.missing||!Number.isFinite(scale)||scale<=0?NaN:v*scale};
 // Pressure-level indices derived from the same run, cell and valid time.
 if(p.id==='tt'||p.id==='ki'){
  const td=lev=>{const t=read(h,'t'+lev),rh=read(h,'rh'+lev);if(!Number.isFinite(t)||!(rh>0&&rh<=100))return NaN;const a=Math.log(rh/100)+17.625*t/(243.04+t);return 243.04*a/(17.625-a)};
  const t850=read(h,'t850'),t500=read(h,'t500'),td850=td(850);
  return p.id==='tt'?t850+td850-2*t500:t850-t500+td850-(read(h,'t700')-td(700));
 }
 const diagnostic=derivedPointValue(p.id,id=>read(h,id));if(diagnostic!==null)return diagnostic;
 if(p.id==='rainrate'||(/^rain\d+$/.test(p.id))){
  const interval=p.id==='rainrate'?(p.mapIntervalHours??mapInterval(d,p.id,h)):p.interval;
  if(!Number.isFinite(interval)||h<interval)return NaN;const amount=read(h,'rainTotal')-read(h-interval,'rainTotal');
  if(amount<-.5)return NaN;return Math.max(0,amount)/(p.id==='rainrate'?interval:1);
 }
 if(p.id==='radiation'||p.id==='conv'||p.id==='strat'){
  const interval=p.id==='radiation'?(p.mapIntervalHours??mapInterval(d,p.id,h)):p.interval||24;
  const delta=id=>read(h,id)-read(h-interval,id);
  if(!Number.isFinite(interval)||h<interval)return NaN;
  if(p.id==='radiation'){const amount=delta('solarTotal');return amount>=0?amount*1000/(interval*3600):NaN}
  const conv=delta('convTotal'),total=delta('rainTotal');
  if(!Number.isFinite(conv)||conv<-.15)return NaN;
  return p.id==='conv'?Math.max(0,conv):total-conv>=-.15?Math.max(0,total-conv):NaN;
 }
 return read(h,p.id==='rh'?'rh2':p.id);
}
function packedCell(packed,n){if(typeof packed!=='string'||!Number.isInteger(n)||n<0)return undefined;const byte=n*2,offset=Math.floor(byte/3)*4,shift=byte%3;try{const b=atob(packed.slice(offset,offset+(shift===2?8:4)));if(b.length<shift+2)return undefined;return (b.charCodeAt(shift)|(b.charCodeAt(shift+1)<<8))<<16>>16}catch{return undefined}}
function derivedPointValue(id,read){
 if(/^wind(?:p|dirp)\d+$/.test(id)){const lev=id.match(/\d+$/)[0],u=read('u'+lev),v=read('v'+lev);if(!Number.isFinite(u)||!Number.isFinite(v))return NaN;return id.startsWith('winddir')?(Math.hypot(u,v)<.05?NaN:(Math.atan2(-u,-v)*180/Math.PI+360)%360):Math.hypot(u,v)}
 if(/^q\d+$/.test(id)){const lev=+id.slice(1),t=read('t'+lev),rh=read('rh'+lev);if(!Number.isFinite(t)||t<=-243||!(rh>=0&&rh<=100))return NaN;const e=rh/100*6.112*Math.exp(17.67*t/(t+243.5));return e<lev?1000*.622*e/(lev-.378*e):NaN}
 if(id==='synoptic')return read('z500');
 if(id==='syn850')return read('t850');
 if(id==='syn500')return read('t500');
 if(id==='jet'){const u=read('u300'),v=read('v300');return Number.isFinite(u)&&Number.isFinite(v)?Math.hypot(u,v):read('jet');}
 if(id==='s850500')return Math.hypot(read('u500')-read('u850'),read('v500')-read('v850'));
 if(id==='lclApprox'){const t=read('temp2'),td=read('dew');return Number.isFinite(t)&&Number.isFinite(td)&&td<=t+.3?125*Math.max(0,t-td):NaN}
 if(id==='ehi03'){const cape=read('mlcape'),srh=read('srh03');return cape>=0&&Number.isFinite(srh)?cape*srh/160000:NaN}
 if(id==='dcapeSpeed'){const d=read('dcape');return d>=0?3.6*Math.sqrt(2*d):NaN}
 return null;
}
async function snapshotMetadata(file){
 try{const r=await fetch(dataRoot+file+'.meta.json?t='+Math.floor(Date.now()/60000),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});return r.ok?await r.json():null}catch{return null}
}
const newerSnapshot=(a,b)=>!b||Date.parse(a.run)>Date.parse(b.run)||Date.parse(a.run)===Date.parse(b.run)&&Date.parse(a.generated)>Date.parse(b.generated);
async function fetchRealModel(model,force=false,short=false){
 const file=short?'ifs-short':realModelFiles[model],key=short?'IFS-short':model,cache=short?shortModelCache:realModelCache;if(!file)return;
 if(realModelRequests.has(key))return realModelRequests.get(key);
 if(cache.has(model)&&!force)return;
 if(!force&&realModelErrors.has(model)&&Date.now()-(modelCheckTimes.get(key)||0)<60000)return;
 realModelErrors.delete(model);
 let changed=false;
 const task=(async()=>{
  let failure;
  const local='data/'+file+'.json',remote=dataRoot+file+'.json',previous=cache.get(model),meta=await snapshotMetadata(file);
  if(meta&&previous&&!newerSnapshot(meta,previous))return;
  if(!meta&&previous&&Date.now()-(modelCheckTimes.get(key)||0)<15*60000)return;
  modelCheckTimes.set(key,Date.now());
  const compressed=typeof DecompressionStream==='function';
  const candidates=[remote,local];
  for(const url of candidates.flatMap(url=>compressed?[url+'.gz',url]:[url])){
   try{
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),modelProvider(model)!=='DWD'?90000:45000);let response;
    try{response=await fetch(url+(meta&&url.startsWith(remote)?'?v='+encodeURIComponent(meta.generated):''),{cache:meta?'default':'no-cache',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);
    let payload;if(url.endsWith('.gz')){const raw=await response.arrayBuffer(),bytes=new Uint8Array(raw);payload=bytes[0]===31&&bytes[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(raw))}else payload=await response.json();
    const d=validateRealData(payload,model);
    const previous=cache.get(model);
    if(meta&&url.startsWith(remote)&&newerSnapshot(meta,d))continue;
    if(newerSnapshot(d,previous)){cache.set(model,d);for(const k of realDecoded.keys())if(k.startsWith(model+'/'))realDecoded.delete(k);realModelRevision++;changed=true}
    if(previous&&Date.parse(d.run)<Date.parse(previous.run))continue;
    return;}finally{clearTimeout(timeout)}
   }catch(e){failure=e}
  }
  realModelErrors.set(model,String(failure?.message||'Nicht erreichbar'));
 })();
 realModelRequests.set(key,task);
 try{await task}finally{realModelRequests.delete(key);if(activePage==='map'&&mapSource==='model'&&mapModel===model&&modelDataMode==='real')renderMap();if(changed&&typeof weatherRealEnabled!=='undefined'&&weatherRealEnabled){if(activePage==='weather')renderWeather();else if(activePage==='warnings')renderLocalWarnings();else if(activePage==='expert')renderRealExpert();else if(activePage==='map'&&mapSource==='live')scheduleMap()}}
}
function profileFieldNote(d,h,id){return Array.isArray(d?.derivedFields?.[h])&&d.derivedFields[h].some(k=>(diagnosticKeys(id)||[id]).includes(k))}
function modelStatus(){
 if(modelDataMode!=='real')return {label:'Testdaten · keine Vorhersage',detail:'Modellkarte · synthetische Testfelder'};
 const d=realData();
 if(d){
  if(mapSource==='model'&&!Number.isFinite(mapHour))return {label:'Keine zukünftigen Daten',detail:'Für diesen Parameter gibt es im Modelllauf keine verfügbaren zukünftigen Zeitpunkte.'};
  const provider=modelProvider(d.model),old=Date.now()-Date.parse(d.run)>modelAgeLimit(d.model)*3600000;
  const count=new Set(Object.values(d.frames).flatMap(Object.keys)).size;
  if(d.nativeMap){const ready=nativeFieldsReady(d,fields[mapLayer],mapHour),available=realModelSupported(fields[mapLayer],d.hours[1],d.hours.at(-1)),failed=available&&mapFieldRequirements(d,fields[mapLayer],mapHour).some(([h,k])=>nativeFieldFailures.has(d.file+'/'+d.generated+'/'+h+'/'+k));return {label:ready?(d.gridMapping==='nearest-source-cell'?'RUC · Rasterabbildung':'Originalraster'):failed?'Datenabruf wird erneut versucht':available?'Originaldaten werden geladen':'Keine Originaldaten',detail:provider+' · '+(d.gridMapping==='nearest-source-cell'?'ICON-D2-RUC · nächste Originalzelle · ':'')+d.grid.step.toLocaleString('de-DE',{maximumFractionDigits:5})+(d.gridMapping==='nearest-source-cell'?'° Darstellungsraster · keine räumliche Glättung':'° Originalraster · keine räumliche Glättung')+(profileFieldNote(d,mapHour,mapLayer)?' · Druckflächenprofil · Näherung':'')+(old?' · nicht aktuell':'')}}
  if(mapLayer==='temp2'){const n=matchingNativeMap();return {label:n?'Originalraster':'Originaltemperatur ausstehend',detail:provider+' · '+(n?n.meta.grid.dx.toLocaleString('de-DE',{maximumFractionDigits:5})+'° Originalraster · ungeglättete Modellzellen':'Passender Originalraster-Modelllauf wird geladen · keine Ersatzwerte')+(old?' · nicht aktuell':'')}}
  return {label:'Originaldaten ausstehend',detail:'Quelle: '+(provider==='ECMWF'?'ECMWF '+d.model+' · CC BY 4.0 · aufbereitet':provider==='NOAA'?'NOAA / NCEP GFS':'Deutscher Wetterdienst')+' · Originalraster wird importiert · keine gröberen Ersatzkarten'+(old?' · nicht aktuell':'')};
 }
 if(!realModelFiles[mapModel])return {label:'Noch nicht angebunden',detail:'Für dieses Modell stehen noch keine echten Daten bereit.'};
 return {label:(realModelRequests.has(mapModel)||mapFiles(mapModel).some(f=>nativeMapLoading.has(f)||nativeMapLoading.has(f+'-de')))?'Modell wird geladen …':'Keine Realdaten verfügbar',detail:modelProvider(mapModel)+'-Modelllauf noch nicht verfügbar. Aktualisieren oder ausdrücklich Demo wählen.'};
}
function selectModelDataMode(mode){
 stopPlay();modelDataMode=mode;realModelRevision++;renderMap();if(mode==='real')fetchMapAvailability(mapModel);
}
// Maps normally need only a manifest and the selected original field, not
// the legacy 30–90 MB all-fields JSON packages intended for point fallback.
async function fetchMapAvailability(model,force=false){
 const region=germanyMapRegion();await fetchNativeMapModel(model,force,region);
 if(activePage!=='map'||mapSource!=='model'||modelDataMode!=='real'||mapModel!==model||region!==germanyMapRegion())return;
 scheduleMap();
}
function initModelData(){
 el('map-data-mode').addEventListener('change',e=>selectModelDataMode(e.target.value));
 el('map-data-refresh').addEventListener('click',()=>{if(modelDataMode==='real'){nativeFieldFailures.clear();fetchMapAvailability(mapModel,true)}});
 modelDataMode='real';el('map-data-mode').value='real';renderMap();
}

// Weather home uses real grids and real station observations only. Missing
// measurements stay missing; a model value is never labelled a measurement.
let weatherRealEnabled=false,stationData=null,stationRequest=null;
const dataRoot='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/main/data/';
const localFormat=(v,digits=0)=>Number.isFinite(v)?(Math.abs(v)<.5*10**(-digits)?0:v).toLocaleString('de-DE',{maximumFractionDigits:digits}):'—';
const temperatureText=v=>Number.isFinite(v)?String(Math.sign(v)*Math.round(Math.abs(v))||0):'—';
// Applies meteorological windchill / heat-index equations only in their valid ranges.
// In calm cold weather the air temperature itself is a useful approximation.
function modelComfort(t,windKmh,rh){
 if(!Number.isFinite(t))return {value:NaN,label:'Kein belastbarer Index'};
 if(Number.isFinite(windKmh)&&t<=10&&windKmh>=4.8){
  const v=Math.pow(windKmh,.16);
  return {value:13.12+.6215*t-11.37*v+.3965*t*v,label:'Windchill · aus Modellwind'};
 }
 if(Number.isFinite(windKmh)&&windKmh>=0&&windKmh<4.8&&t<=10)return {value:t,label:'Lufttemperatur · kaum Windchill'};
 if(t>=27&&Number.isFinite(rh)&&rh>=40&&rh<=100){
  const F=t*9/5+32,H=rh;
  let HI=-42.379+2.04901523*F+10.14333127*H-.22475541*F*H-.00683783*F*F-.05481717*H*H+.00122874*F*F*H+.00085282*F*H*H-.00000199*F*F*H*H;
  if(H<13&&F>=80&&F<=112)HI-=((13-H)/4)*Math.sqrt((17-Math.abs(F-95))/17);
  if(H>85&&F>=80&&F<=87)HI+=((H-85)/10)*((87-F)/5);
  return {value:(HI-32)*5/9,label:'Hitzeindex · aus Temperatur & Feuchte'};
 }
 // Steadman outdoor apparent temperature (shade, vapour pressure in hPa,
 // wind in m/s) covers conditions outside the windchill/heat-index domain.
 if(Number.isFinite(windKmh)&&windKmh>=0&&Number.isFinite(rh)&&rh>=0&&rh<=100){
  const e=rh/100*6.105*Math.exp(17.27*t/(237.7+t));
  return {value:t+.33*e-.70*windKmh/3.6-4,label:'Gefühlte Temperatur · Steadman, ohne Sonne'};
 }
 return {value:NaN,label:'Kein belastbarer Index für diese Bedingungen'};
}
function windBeaufort(kmh){
 if(!Number.isFinite(kmh)||kmh<0)return NaN;
 return [1,6,12,20,29,39,50,62,75,89,103,118].findIndex(x=>kmh<x)===-1?12:[1,6,12,20,29,39,50,62,75,89,103,118].findIndex(x=>kmh<x);
}
const displayValue=(v,unit)=>unit==='°C'?temperatureText(v):localFormat(v);
const localTime=(t,opts={})=>new Date(t).toLocaleString('de-DE',{timeZone:'Europe/Berlin',...opts});
const localDay=t=>new Date(t).toLocaleDateString('sv-SE',{timeZone:'Europe/Berlin'});

// Sunrise and sunset are computed astronomically for the selected coordinates;
// never presented as a model or station observation.
function localSolarTimes(point,at=Date.now()){
 if(!Array.isArray(point)||!Number.isFinite(point[0])||!Number.isFinite(point[1])||Math.abs(point[1])>=89)return null;
 const d=new Date(localDay(at)+'T12:00:00Z'),toRad=Math.PI/180,pi=Math.PI,J1970=2440588,J2000=2451545,ms=86400000;
 const days=(d.getTime()/ms-.5+J1970)-J2000,lw=-point[0]*toRad,phi=point[1]*toRad;
 const n=Math.round(days-.0009-lw/(2*pi)),ds=.0009+lw/(2*pi)+n;
 const M=toRad*(357.5291+.98560028*ds);
 const C=toRad*(1.9148*Math.sin(M)+.02*Math.sin(2*M)+.0003*Math.sin(3*M));
 const L=M+C+toRad*102.9372+pi,decl=Math.asin(Math.sin(L)*Math.sin(23.4397*toRad));
 const cosW=(Math.sin(-.833*toRad)-Math.sin(phi)*Math.sin(decl))/(Math.cos(phi)*Math.cos(decl));
 if(Math.abs(cosW)>1)return null;
 const solarJ=t=>J2000+t+.0053*Math.sin(M)-.0069*Math.sin(2*L);
 const noon=solarJ(ds),set=solarJ(.0009+(Math.acos(cosW)+lw)/(2*pi)+n),rise=noon-(set-noon);
 return {rise:new Date((rise+.5-J1970)*ms),set:new Date((set+.5-J1970)*ms),hours:(set-rise)*24};
}

const realPoint=(d,p,id,h,interval=0)=>p?realModelValue(d,{id,interval},p[0],p[1],h):NaN;
const pointCore=['temp2','dew','wind','slp','cloud','rainTotal'];
const pointStoreKey='wetterapp-point-v3';
function validatePointManifest(m,model){
 const g=m?.grid,hs=m?.hours,s=m?.tileSize;if(m?.schema!==3||m.model!==model||!Number.isFinite(Date.parse(m.run))||!Number.isFinite(Date.parse(m.generated))||!g||![g.west,g.south,g.step].every(Number.isFinite)||g.step<=0||g.missing!==-32768||g.scale!==.1||![g.nx,g.ny,s].every(Number.isInteger)||g.nx<2||g.ny<2||g.nx*g.ny>2000000||s<8||s>100||!Array.isArray(hs)||hs.length<2||!hs.every((h,i)=>Number.isInteger(h)&&h===i*hs[1])||hs[1]<=0)throw Error('Ungültiges Ortsraster');
 for(const h of hs){const keys=m.frames?.[h];if(!Array.isArray(keys)||!(model==='ICON-D2-RUC'?m.product==='hail'&&m.gridMapping==='nearest-source-cell'&&keys.length===1&&keys[0]==='hail':pointCore.every(k=>keys.includes(k)))||keys.some(k=>typeof k!=='string'||!/^\w+$/.test(k)||!(m.scales?.[k]>0)))throw Error('Unvollständige Ortsprognose')}
 return m;
}
function pointCell(m,p){const g=m.grid,x=Math.round((p[0]-g.west)/g.step),y=Math.round((p[1]-g.south)/g.step),s=m.tileSize;if(x<0||y<0||x>=g.nx||y>=g.ny)return null;const tx=Math.floor(x/s),ty=Math.floor(y/s),nx=Math.min(s,g.nx-tx*s),ny=Math.min(s,g.ny-ty*s);return {key:tx+'-'+ty,n:(y%s)*nx+x%s,nx,ny,x,y}}
const packPointCell=v=>btoa(String.fromCharCode(v&255,(v>>8)&255));
function pointDataset(m,t,p,cell){
 if(t?.schema!==3||t.run!==m.run||t.generated!==m.generated||t.key!==cell.key)throw Error('Modelllauf des Ortsrasters stimmt nicht');
 const frames={},len=4*Math.ceil(cell.nx*cell.ny*2/3);
 for(const h of m.hours){const f=t.frames?.[h];if(!f||!m.frames[h].every(k=>typeof f[k]==='string'&&f[k].length===len))throw Error('Unvollständiges Ortsraster');frames[h]={};for(const k of m.frames[h]){const v=packedCell(f[k],cell.n);if(v===undefined)throw Error('Ungültige Gitterzelle');frames[h][k]=packPointCell(v)}}
 return {...m,schema:1,pointNative:true,pointLocation:[...p],grid:{...m.grid,west:m.grid.west+cell.x*m.grid.step,south:m.grid.south+cell.y*m.grid.step,nx:1,ny:1},frames};
}
function compactLocationRun(d,p){
 if(d.pointNative||d.pointLocation)return d;const g=d.grid,x=Math.round((p[0]-g.west)/g.step),y=Math.round((p[1]-g.south)/g.step);if(x<0||y<0||x>=g.nx||y>=g.ny)return null;const n=y*g.nx+x,frames={};
 for(const h of d.hours){frames[h]={};for(const [k,packed] of Object.entries(d.frames[h])){const v=packedCell(packed,n);if(v!==undefined)frames[h][k]=packPointCell(v)}}
 return {...d,pointNative:false,pointLocation:[...p],grid:{...g,west:g.west+x*g.step,south:g.south+y*g.step,nx:1,ny:1},frames};
}
function putPointRun(p,d){
 const key=pointKey(p),runs=pointModelCache.get(key)||[],same=x=>x.model===d.model&&x.run===d.run&&x.hours[1]===d.hours[1]&&!!x.pointNative===!!d.pointNative;
 if(runs.some(x=>same(x)&&!newerSnapshot(d,x)))return false;
 const next=[d,...runs.filter(x=>!same(x)&&Date.parse(x.run)+x.hours.at(-1)*3600000>=Date.now()-DAY_MS)].slice(0,28);pointModelCache.set(key,next);while(pointModelCache.size>5)pointModelCache.delete(pointModelCache.keys().next().value);return true;
}
function restorePointWeather(p){
 if(!p||pointModelCache.has(pointKey(p)))return;
 try{const c=JSON.parse(localStorage.getItem(pointStoreKey)||'null');if(c?.key!==pointKey(p)||!Array.isArray(c.runs))return;
  for(const d of c.runs){if(!forecastPriority.includes(d.model)||pointKey(d.pointLocation)!==pointKey(p)||d.grid?.nx!==1||d.grid?.ny!==1||!Number.isFinite(Date.parse(d.run))||!Number.isFinite(Date.parse(d.generated))||Date.parse(d.run)>Date.now()||!Array.isArray(d.hours)||d.hours.length<2||!d.hours.every((h,i)=>h===i*d.hours[1])||d.hours[1]<=0||!d.hours.every(h=>pointCore.every(k=>typeof d.frames?.[h]?.[k]==='string'&&d.frames[h][k].length===4)))continue;putPointRun(p,d)}
 }catch{}
}
let savePointTimer=null,pointRefreshTimer=null;
function refreshPointUI(){if(pointRefreshTimer!==null)return;pointRefreshTimer=setTimeout(()=>{pointRefreshTimer=null;if(document.hidden)return;if(activePage==='weather')renderWeather();else if(activePage==='warnings')renderLocalWarnings();else if(activePage==='expert')renderRealExpert()},450)}
function cachePointWeather(p){if(savePointTimer!==null||!p)return;savePointTimer=setTimeout(()=>{savePointTimer=null;if(pointKey(homeLocationPoint(location))!==pointKey(p))return;try{const runs=forecastPriority.flatMap(model=>locationRuns(model,p).filter(d=>Date.parse(d.run)+d.hours.at(-1)*3600000>=Date.now()-DAY_MS).slice(0,4).map(d=>compactLocationRun(d,p)).filter(Boolean));if(runs.length)localStorage.setItem(pointStoreKey,JSON.stringify({key:pointKey(p),runs}));}catch{}},500)}
// Fast current-only point packets are isolated from full forecast runs.
const quickCurrentCache=new Map(),quickCurrentRequests=new Map(),quickCurrentChecks=new Map();
const quickStoreKey='wetterapp-live-point-v1';let quickRestoredPoint=null;
function quickRuns(model,p){const d=quickCurrentCache.get(model+'/'+pointKey(p));return d?[d]:[]}
function restoreQuickWeather(p){
 const key=pointKey(p);if(quickRestoredPoint===key)return;quickRestoredPoint=key;
 try{const saved=JSON.parse(localStorage.getItem(quickStoreKey)||'null');if(saved?.key!==pointKey(p)||!Array.isArray(saved.runs))return;
 for(const d of saved.runs){if(!['ICON-D2','ICON-EU'].includes(d.model)||!d.quick||!d.pointNative||pointKey(d.pointLocation)!==pointKey(p)||d.grid?.nx!==1||d.grid?.ny!==1||!Number.isFinite(Date.parse(d.run))||Date.parse(d.run)>Date.now()||!Array.isArray(d.hours)||d.hours.length<2||d.hours.length>13||!d.hours.every((h,i)=>h===i*d.hours[1]&&pointCore.every(k=>typeof d.frames?.[h]?.[k]==='string'&&d.frames[h][k].length===4)))continue;
 const key=d.model+'/'+pointKey(p);if(newerSnapshot(d,quickCurrentCache.get(key)))quickCurrentCache.set(key,d)}
 }catch{}
}
async function fetchQuickWeather(p,model,root){
 const key=model+'/'+pointKey(p);if(quickCurrentRequests.has(key))return quickCurrentRequests.get(key);
 if(Date.now()-(quickCurrentChecks.get(key)||0)<60000)return false;
 quickCurrentChecks.set(key,Date.now());
 const task=(async()=>{try{
  const m=validatePointManifest(await pointRead(root,'point-index.json'),model),cell=pointCell(m,p);
  if(!m.quick||m.hours.length>13||!cell||Date.parse(m.run)>Date.now()||Date.parse(m.run)+m.hours.at(-1)*3600000<Date.now()-3600000)return false;
  if(!newerSnapshot(m,quickCurrentCache.get(key)))return true;
  const packet=await pointRead(root,'point-'+cell.key+'.json.gz',true,m.generated),d=pointDataset(m,packet,p,cell);
  quickCurrentCache.set(key,d);while(quickCurrentCache.size>10)quickCurrentCache.delete(quickCurrentCache.keys().next().value);
  if(pointKey(homeLocationPoint(location))===pointKey(p)){try{localStorage.setItem(quickStoreKey,JSON.stringify({key:pointKey(p),runs:['ICON-D2','ICON-EU'].flatMap(m=>quickRuns(m,p))}))}catch{}refreshPointUI();refreshLiveHero()}
  return true;
 }catch{return false}})().finally(()=>quickCurrentRequests.delete(key));quickCurrentRequests.set(key,task);return task;
}
const pointReads=new Map();
async function pointRead(root,path,zip=false,version=''){
 const liveRoot=root.includes('/generated-live-ruc/')||root.includes('/mobile-live-data/'),url=root+path+'?v='+encodeURIComponent(version||Math.floor(Date.now()/(liveRoot?60000:120000)));if(pointReads.has(url))return pointReads.get(url);
 const task=(async()=>{try{const r=await fetch(url,{credentials:'omit',cache:version?'default':'no-cache',priority:root.includes('/quick/')||liveRoot?'high':'low',signal:AbortSignal.timeout(zip?20000:7000)});if(!r.ok)return null;if(!zip)return await r.json();const a=await r.arrayBuffer(),b=new Uint8Array(a);return b[0]===31&&b[1]===139?await new Response(new Blob([a]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(a));}catch{return null}})().finally(()=>pointReads.delete(url));pointReads.set(url,task);return task;
}
async function fetchLocationTile(p,model,root){
 const key=pointKey(p)+'/'+root;if(pointWeatherRequests.has(key))return pointWeatherRequests.get(key);if(Date.now()-(pointWeatherChecks.get(key)||0)<120000)return false;
 pointWeatherChecks.set(key,Date.now());const task=(async()=>{
  try{const m=validatePointManifest(await pointRead(root,'point-index.json'),model),cell=pointCell(m,p);if(!cell||Date.parse(m.run)>Date.now())return false;
   if(pointRuns(model,p).some(d=>d.pointNative&&d.run===m.run&&d.generated===m.generated&&d.hours[1]===m.hours[1]))return true;
   const t=await pointRead(root,'point-'+cell.key+'.json.gz',true,m.generated),d=pointDataset(m,t,p,cell);
   if(putPointRun(p,d)&&pointKey(homeLocationPoint(location))===pointKey(p)){refreshPointUI();cachePointWeather(p)}return true;
  }catch{return false}
 })().then(ok=>{if(!ok)pointWeatherChecks.set(key,Date.now()-105000);return ok}).finally(()=>pointWeatherRequests.delete(key));pointWeatherRequests.set(key,task);return task;
}
let locationRefreshKey='',locationRefreshTime=0;
function fetchLocationForecast(p,force=false){
 if(!p)return;const key=pointKey(p);restorePointWeather(p);restoreQuickWeather(p);
 if(!force&&key===locationRefreshKey&&Date.now()-locationRefreshTime<60000)return;locationRefreshKey=key;locationRefreshTime=Date.now();
 if(nowcastPointKey&&nowcastPointKey!==key)setTimeout(()=>{if(pointKey(homeLocationPoint(location))===key)fetchRadarNowcast()},0);
 const base='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/',hourly=model=>base+'generated-points-'+realModelFiles[model]+'/',regional=['ICON-D2','ICON-EU'];
 const same=()=>pointKey(homeLocationPoint(location))===key;
 const quick=Promise.allSettled(regional.map(model=>fetchQuickWeather(p,model,hourly(model)+'quick/')));
 // The full packets also start promptly if the new quick product is not
 // published yet. All subsequent downloads are background work.
 // Successful, changed packets already notify refreshPointUI. Failed or
 // unchanged requests must not rebuild the entire forecast and its DOM.
 Promise.race([quick,new Promise(resolve=>setTimeout(resolve,600))]).then(()=>{if(same())return Promise.allSettled(regional.map(model=>fetchLocationTile(p,model,hourly(model))))});
 setTimeout(()=>{if(same())Promise.allSettled(['IFS','GFS'].map(model=>fetchLocationTile(p,model,base+'generated-native-'+realModelFiles[model]+'/')).concat([fetchLocationTile(p,'IFS',base+'generated-native-ifs-short/'),fetchLocationTile(p,'GFS',base+'generated-native-gfs-de/')]))},1800);
 setTimeout(()=>{if(same())Promise.allSettled(regional.flatMap(model=>[fetchLocationTile(p,model,hourly(model)+'anchor/'),fetchLocationTile(p,model,base+'generated-native-'+realModelFiles[model]+'/')]))},4000);
 setTimeout(()=>{if(same())Promise.allSettled(['AIFS','AIFS-ENS Control'].map(model=>fetchLocationTile(p,model,base+'generated-native-'+realModelFiles[model]+'/')))},6500);
}
function chooseLocationModel(t,p,preferFuture=false,models=forecastPriority){
 if(!p)return null;
 for(const model of models)for(const d of locationRuns(model,p)){
  const run=Date.parse(d.run),target=(t-run)/3600000,step=d.hours[1]-d.hours[0];
  if(target<0||target>d.hours.at(-1))continue;
  const hour=preferFuture?Math.ceil(target/step)*step:Math.round(target/step)*step;
  if(Number.isFinite(realPoint(d,p,'temp2',hour)))return {d,hour,time:run+hour*3600000,point:p};
 }
 return null;
}
function modelLocationFrames(p,now=Date.now(),includeToday=false){
 const frames=[],covered=[];
 const today=includeToday?localDay(now):null;
 for(const model of forecastPriority){
  const d=realModelCache.get(model);if(!d)continue;
  const rows=d.hours.map(hour=>({d,hour,time:Date.parse(d.run)+hour*3600000,point:p})).filter(x=>(x.time>=now||today&&localDay(x.time)===today)&&(model!=='ICON-D2'||x.time<=now+48*3600000)&&Number.isFinite(realPoint(d,p,'temp2',x.hour)));
  if(!rows.length)continue;
  frames.push(...rows.filter(x=>!covered.some(([start,end])=>x.time>=start&&x.time<=end)));
  covered.push([rows[0].time,rows.at(-1).time]);
 }
 return frames.sort((a,b)=>a.time-b.time);
}
function frameVal(f,id,interval=0){
 if(!f)return NaN;
 if(f.interpolated){
  // Only instantaneous continuous parameters may be interpolated in time.
  if(!['temp2','dew','wind','slp','cloud','snowdepth','visibility','rh2'].includes(id))return NaN;
  const a=frameVal(f.before,id,interval),b=frameVal(f.after,id,interval);return Number.isFinite(a)&&Number.isFinite(b)?a+(b-a)*f.fraction:NaN;
 }
 if(['temp2','tmin','tmax'].includes(id)){const v=nativeTemperatureValue(f.d,f.point,f.hour,id);if(v!==null)return v;}
 return realPoint(f.d,f.point,id,f.hour,interval);
}
// The model-based forecast frame is separate from the current live analysis.
function currentGridFrame(point,now=Date.now(),models=forecastPriority){
 if(!point)return null;const fallback=[];
 for(const model of models){const runs=[...locationRuns(model,point),...quickRuns(model,point)],candidates=runs.flatMap(d=>{const run=Date.parse(d.run),hour=d.hours.filter(h=>run+h*3600000<=now).at(-1);return hour==null?[]:[{d,hour,time:run+hour*3600000,point}]});
  candidates.sort((a,b)=>b.time-a.time||Number(!!b.d.pointNative)-Number(!!a.d.pointNative)||Date.parse(b.d.run)-Date.parse(a.d.run)||Number(!!a.d.quick)-Number(!!b.d.quick)||a.d.hours[1]-b.d.hours[1]);
  const f=candidates.find(f=>now-f.time<=6*3600000&&now-Date.parse(f.d.run)<=modelAgeLimit(f.d.model)*3600000&&Number.isFinite(frameVal(f,'temp2')));
  if(f){if(now-f.time<=90*60000)return f;fallback.push(f)}
 }return fallback.sort((a,b)=>b.time-a.time)[0]||null;
}
// Independent, native triangular-cell surface analysis. Forecasts and
// weather-station packets never supply an "analysis" value for the location.
const liveAnalysisRoot='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/generated-live-ruc/';
const mobileLiveAnalysisRoot='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/mobile-live-data/';
const liveAnalysisCache=new Map(),liveAnalysisRequests=new Map(),liveAnalysisChecks=new Map();
const liveAge=90*60000;
const lastAnalysisAge=6*3600000;
const liveAnalysisStore='wetter-mobile-local-analysis-v1';
const localHeights=new Map(),localHeightRequests=new Map(),localHeightChecks=new Map();
const liveFields=['temp2','wind','gust','dew','rh2','winddir','slp','cloud'];
const liveCore=liveFields.filter(id=>id!=='gust');
function liveDistanceM(a,b){const rad=Math.PI/180,d=(b[1]-a[1])*rad,l=(b[0]-a[0])*rad,h=Math.sin(d/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(l/2)**2;return 12742000*Math.asin(Math.sqrt(Math.min(1,h)))}
function validLiveValue(id,v){return Number.isFinite(v)&&(id==='temp2'||id==='dew'?v>=-80&&v<=60:id==='rh2'||id==='cloud'?v>=0&&v<=100:id==='winddir'?v>=0&&v<=360:id==='slp'?v>=850&&v<=1100:v>=0&&v<=300)}
function validLocalHeight(h){return Number.isFinite(h)&&h>=-500&&h<=9000}
// Estimate the LOCAL horizontal temperature/elevation relationship using
// same-run native grid cells. Reject weak fits and extrapolation rather
// than hardcoding a standard lapse rate (inversions can reverse it).
function localTerrainFit(rows){
 if(rows.length<10)return null;const low=Math.min(...rows.map(r=>r.h)),high=Math.max(...rows.map(r=>r.h));if(high-low<300)return null;
 let w=0,h=0,t=0;for(const r of rows){const weight=1/(1+(r.d/2200)**2);w+=weight;h+=weight*r.h;t+=weight*r.t}h/=w;t/=w;
 let hh=0,ht=0,tt=0;for(const r of rows){const weight=1/(1+(r.d/2200)**2);hh+=weight*(r.h-h)**2;ht+=weight*(r.h-h)*(r.t-t);tt+=weight*(r.t-t)**2}
 const slope=ht/hh,r2=ht*ht/(hh*tt),error=Math.sqrt(Math.max(0,tt-ht*ht/hh)/w);
 return Number.isFinite(slope)&&Math.abs(slope)<=.012&&r2>=.45&&error<=1.5?{slope,low,high,error}:null;
}
function adjustedLocalTemperature(sample,height){
 const fit=sample?.terrainFit,h=sample?.modelElevation;if(!fit||!validLocalHeight(height)||!validLocalHeight(h)||!validLiveValue('temp2',sample.values?.temp2)||Math.abs(height-h)<120||Math.abs(height-h)>600||!validLocalHeight(fit.low)||!validLocalHeight(fit.high)||fit.high-fit.low<300||height<fit.low||height>fit.high||!Number.isFinite(fit.slope)||Math.abs(fit.slope)>.012||!Number.isFinite(fit.error)||fit.error<0||fit.error>1.5)return NaN;
 const corrected=sample.values.temp2+fit.slope*(height-h);return validLiveValue('temp2',corrected)?corrected:NaN;
}
async function fetchLocalHeight(point){
 if(!point||typeof loadDem!=='function')return;const key=pointKey(point),now=Date.now();if(localHeights.has(key)||localHeightRequests.has(key)||now-(localHeightChecks.get(key)||0)<300000)return;
 localHeightChecks.set(key,now);while(localHeightChecks.size>24)localHeightChecks.delete(localHeightChecks.keys().next().value);
 const task=(async()=>{try{const z=12,tx=tileX(point[0],z),ty=tileY(point[1],z),x=Math.floor(tx),y=Math.floor(ty),tileKey=z+'/'+x+'/'+y;
  const d=typeof demCache!=='undefined'&&demCache.get(tileKey)||await loadDem({key:tileKey});
  const ix=Math.min(d.w-1,Math.max(0,Math.floor((tx-x)*d.w))),iy=Math.min(d.h-1,Math.max(0,Math.floor((ty-y)*d.h))),h=d.v[iy*d.w+ix];if(!validLocalHeight(h))return;
  localHeights.set(key,h);while(localHeights.size>12)localHeights.delete(localHeights.keys().next().value);if(pointKey(homeLocationPoint(location))===key)refreshLiveHero();
 }catch{}})().finally(()=>localHeightRequests.delete(key));localHeightRequests.set(key,task);return task;
}
const liveTileKey=p=>Math.floor(p[0])+'_'+Math.floor(p[1]);
function validateLiveAnalysis(m,now,maxAge=liveAge){
 const run=Date.parse(m?.run),generated=Date.parse(m?.generated);
 if(m?.schema!==1||m.product!=='ruc-surface-analysis'||m.model!=='ICON-D2-RUC'||m.gridMapping!=='native-triangular-cells'||m.coordScale!==.00001||m.scale!==.1||m.tileStep!==1||m.missing!==-32768||!Number.isFinite(run)||!Number.isFinite(generated)||run>now||now-run>maxAge||generated<run||generated>now+60000||!Array.isArray(m.fields)||!liveCore.every(k=>m.fields.includes(k))||m.fields.some(k=>!liveFields.includes(k))||!Array.isArray(m.tiles)||m.tiles.length>3000||m.tiles.some(k=>!/^-?\d{1,3}_-?\d{1,3}$/.test(k)))return null;
 if(m.fields.includes('gust')&&(Date.parse(m.gust?.valid)!==run||![0,60].includes(m.gust?.intervalMinutes)||Date.parse(m.gust?.run)!==run-m.gust.intervalMinutes*60000))return null;
 return m;
}
function decodeLiveTile(m,t,point){
 const key=liveTileKey(point),n=t?.count;
 if(t?.schema!==1||t.run!==m.run||t.generated!==m.generated||t.key!==key||!Number.isInteger(n)||n<=0||n>20000||typeof t.lon!=='string'||typeof t.lat!=='string'||t.lon.length!==4*Math.ceil(n*4/3)||t.lat.length!==4*Math.ceil(n*4/3)||!m.fields.every(k=>typeof t.values?.[k]==='string'&&t.values[k].length===4*Math.ceil(n*2/3)))return null;
 let lon,lat;try{lon=atob(t.lon);lat=atob(t.lat)}catch{return null}
 if(lon.length!==n*4||lat.length!==n*4)return null;
 const read=(b,i)=>(b.charCodeAt(i*4)|b.charCodeAt(i*4+1)<<8|b.charCodeAt(i*4+2)<<16|b.charCodeAt(i*4+3)<<24)*m.coordScale;
 let nearest=-1,distance=Infinity,center=null;
 for(let i=0;i<n;i++){const p=[read(lon,i),read(lat,i)];if(Math.abs(p[0])>180||Math.abs(p[1])>90)continue;const d=liveDistanceM(point,p);if(d<distance){distance=d;nearest=i;center=p}}
 // Do not extrapolate across model boundaries or use a distant grid cell.
 if(nearest<0||distance>3500)return null;
 const values={};for(const id of m.fields){const v=packedCell(t.values[id],nearest);if(v!==undefined&&v!==m.missing&&validLiveValue(id,v*m.scale))values[id]=v*m.scale;}
 if(!liveCore.some(id=>Number.isFinite(values[id])))return null;
 let modelElevation=null,terrainFit=null;
 if(m.terrainScale===1&&typeof t.terrain==='string'&&t.terrain.length===4*Math.ceil(n*2/3)){
  const height=packedCell(t.terrain,nearest);if(validLocalHeight(height)){modelElevation=height;const rows=[];
   for(let i=0;i<n;i++){const p=[read(lon,i),read(lat,i)],d=liveDistanceM(point,p);if(d>7000)continue;const h=packedCell(t.terrain,i),v=packedCell(t.values.temp2,i);if(validLocalHeight(h)&&v!==m.missing&&validLiveValue('temp2',v*m.scale))rows.push({h,t:v*m.scale,d})}
   terrainFit=localTerrainFit(rows);
  }
 }
 return {run:Date.parse(m.run),generated:Date.parse(m.generated),center,distance,values,gust:m.gust||null,modelElevation,terrainFit};
}
function restoreLocalAnalysis(point,now){
 const key=pointKey(point);if(!point||liveAnalysisCache.has(key))return;
 try{const saved=JSON.parse(localStorage.getItem(liveAnalysisStore)),a=saved?.sample;if(saved?.key!==key||!a||!Number.isFinite(a.run)||a.run>now||now-a.run>lastAnalysisAge||!Number.isFinite(a.generated)||a.generated<a.run||a.generated>now+60000||!Array.isArray(a.center)||a.center.length!==2||!a.center.every(Number.isFinite)||liveDistanceM(point,a.center)>3500||!validLiveValue('temp2',a.values?.temp2)||Object.entries(a.values).some(([k,v])=>!liveFields.includes(k)||!validLiveValue(k,v)))return;
  if('gust' in a.values&&(Date.parse(a.gust?.valid)!==a.run||![0,60].includes(a.gust?.intervalMinutes)||Date.parse(a.gust?.run)!==a.run-a.gust.intervalMinutes*60000))return;
  liveAnalysisCache.set(key,a);while(liveAnalysisCache.size>6)liveAnalysisCache.delete(liveAnalysisCache.keys().next().value);
 }catch{}
}
async function fetchLiveAnalysis(point,force=false){
 if(!point)return;fetchLocalHeight(point);const key=pointKey(point),now=Date.now();if(liveAnalysisRequests.has(key))return liveAnalysisRequests.get(key);
 const cached=liveAnalysisCache.get(key),checkInterval=cached&&now-cached.run<=60*60000?120000:60000;
 if(!force&&now-(liveAnalysisChecks.get(key)||0)<checkInterval)return;liveAnalysisChecks.set(key,now);while(liveAnalysisChecks.size>16)liveAnalysisChecks.delete(liveAnalysisChecks.keys().next().value);
 const load=async root=>{try{
  const m=validateLiveAnalysis(await pointRead(root,'index.json'),Date.now(),lastAnalysisAge);if(!m)return;
  const tile=liveTileKey(point);if(!m.tiles.includes(tile))return;
  const previous=liveAnalysisCache.get(key),run=Date.parse(m.run);if(previous&&(previous.run>run||previous.run===run&&previous.generated>=Date.parse(m.generated)))return;
  const t=await pointRead(root,'tile-'+tile+'.json.gz',true,m.generated),sample=decodeLiveTile(m,t,point);
  if(!sample)return;
  const latest=liveAnalysisCache.get(key);if(latest&&(latest.run>sample.run||latest.run===sample.run&&latest.generated>=sample.generated))return;
  liveAnalysisCache.set(key,sample);while(liveAnalysisCache.size>6)liveAnalysisCache.delete(liveAnalysisCache.keys().next().value);
  if(pointKey(homeLocationPoint(location))===key){try{localStorage.setItem(liveAnalysisStore,JSON.stringify({key,sample}))}catch{}refreshLiveHero()}
 }catch{}};
 const task=Promise.allSettled([load(mobileLiveAnalysisRoot),load(liveAnalysisRoot)]).finally(()=>liveAnalysisRequests.delete(key));liveAnalysisRequests.set(key,task);return task;
}
function lastLocalAnalysis(point,now,id='temp2'){
 const a=point&&liveAnalysisCache.get(pointKey(point));
 return a&&a.run<=now&&now-a.run>liveAge&&now-a.run<=lastAnalysisAge&&validLiveValue(id,a.values[id])?{value:a.values[id],time:a.run}:null;
}
// A regional model's explicitly published hour-zero initial state is an
// analysis fallback, but any positive forecast lead is forbidden here.
function liveInitialState(f,point,now){
 if(!point)return null;
 const candidates=[];
 const add=d=>{const time=Date.parse(d?.run),generated=Date.parse(d?.generated);if(!['ICON-D2','ICON-EU'].includes(d?.model)||!d.pointNative||pointKey(d.pointLocation)!==pointKey(point)||!d.hours?.includes(0)||!Number.isFinite(time)||time>now||now-time>liveAge||!Number.isFinite(generated)||generated<time||generated>now+60000)return;const row={d,hour:0,time,point};if(validLiveValue('temp2',frameVal(row,'temp2')))candidates.push(row)};
 if(f?.hour===0&&!f.interpolated)add(f.d);
 for(const model of ['ICON-D2','ICON-EU'])for(const d of [...locationRuns(model,point),...quickRuns(model,point)])add(d);
 return candidates.sort((a,b)=>b.time-a.time||Number(b.d.model==='ICON-D2')-Number(a.d.model==='ICON-D2')||Date.parse(b.d.generated)-Date.parse(a.d.generated))[0]||null;
}
// Use the published +0-hour RUC area analysis if a native location tile is
// missing. The area grid masks cells over 3.5 km from the original model grid.
// These are model analyses, never station measurements or future forecasts.
function liveAreaAnalysisFallback(id,point,now){
 if(!point||!['temp2','dew','rh2','wind','winddir'].includes(id)||typeof WeatherObservation==='undefined'||typeof WeatherObservation.mapField!=='function'||typeof WeatherObservation.sampleField!=='function')return null;
 const field=WeatherObservation.mapField(id,now);
 if(!field||field.kind!=='analysis'||field.stale||!Number.isFinite(field.time)||field.time>now||now-field.time>liveAge)return null;
 const value=WeatherObservation.sampleField(field,point);
 if(!validLiveValue(id,value))return null;
 return {value,kind:'analysis',time:field.time,cell:point,analysisId:'ICON-D2-RUC/area/'+field.time,source:'DWD ICON-D2-RUC · +0 h · 0,02° Flächenanalyse aus nativen Modellzellen (keine Messung)'};
}
function liveSample(id,f,point,now,initial=liveInitialState(f,point,now)){
 const a=point&&liveAnalysisCache.get(pointKey(point)),fresh=a&&a.run<=now&&now-a.run<=liveAge;
 const iv=initial&&id!=='gust'?(id==='rh2'?frameHumidity(initial):frameVal(initial,id)):NaN;
 const nativeValid=fresh&&validLiveValue(id,a.values[id]);
 if(validLiveValue(id,iv)&&(!nativeValid||initial.time>a.run))return {value:iv,kind:'analysis',time:initial.time,cell:point,analysisId:initial.d.model+'/'+initial.d.run,source:initial.d.model+' · '+localTime(initial.time,{hour:'2-digit',minute:'2-digit'})+' Uhr · Originalraster · Anfangszustand (+0 h)'};
 if(nativeValid){
  const time=localTime(a.run,{hour:'2-digit',minute:'2-digit'}),source='ICON-D2-RUC · '+time+' Uhr · 2,2-km-Originalzelle';
  if(id==='temp2'){
   const height=localHeights.get(pointKey(point)),adjusted=adjustedLocalTemperature(a,height),terrain=validLocalHeight(height)&&validLocalHeight(a.modelElevation)?' · Ort '+Math.round(height)+' m / Modell '+Math.round(a.modelElevation)+' m':'';
   if(Number.isFinite(adjusted))return {value:adjusted,kind:'estimate',time:a.run,source:source+' · lokale Höhenkorrektur (Schätzung)'+terrain,cell:a.center,analysisId:'terrain/'+a.run};
   if(terrain)return {value:a.values[id],kind:'analysis',time:a.run,source:source+' · Analyse'+terrain+(Math.abs(height-a.modelElevation)>=120?' · Höhenabweichung, unkorrigiert':''),cell:a.center,analysisId:'ICON-D2-RUC/'+a.run};
  }
  // Initial diagnosed gust is a model estimate; the optional previous-run
  // maximum is explicitly a completed interval, not a live measurement.
  if(id==='gust')return {value:a.values[id],kind:a.gust?.intervalMinutes===0?'analysis':'interval',time:a.run,source:source+(a.gust?.intervalMinutes===0?' · diagnostizierte Böe zur Analysezeit':' · letzte Stunde (Modell)'),cell:a.center,analysisId:'ICON-D2-RUC/'+a.run};
  return {value:a.values[id],kind:'analysis',time:a.run,source:source+' · Analyse',cell:a.center,analysisId:'ICON-D2-RUC/'+a.run};
 }
 return liveAreaAnalysisFallback(id,point,now)||{value:NaN,kind:'missing',source:'Keine frische Ortsanalyse · Vorhersage separat'};
}
// A missing dewpoint may be diagnosed from a co-located temperature/RH
// analysis. Never combine different times or different source cells.
function derivedDewpoint(t,rh){
 if(!Number.isFinite(t)||!Number.isFinite(rh)||t< -60||t>60||rh<1||rh>100)return NaN;
 const gamma=Math.log(rh/100)+17.62*t/(243.12+t);
 const dew=243.12*gamma/(17.62-gamma);
 return Number.isFinite(dew)&&dew<=t+.2?dew:NaN;
}
function matchingLiveSamples(a,b){
 return !!a&&!!b&&['observation','analysis'].includes(a.kind)&&a.kind===b.kind&&Number.isFinite(a.time)&&a.time===b.time&&a.analysisId===b.analysisId&&a.cell?.[0]===b.cell?.[0]&&a.cell?.[1]===b.cell?.[1];
}
function liveLocalWeather(f,point,now){
 restoreLocalAnalysis(point,now);
 const initial=liveInitialState(f,point,now);
 const observed=typeof WeatherObservation!=='undefined'?WeatherObservation.current(point,observationHeight(point),now):null;
 const values=Object.fromEntries(liveFields.map(id=>[id,observed?.[id]||liveSample(id,f,point,now,initial)]));
 if(!Number.isFinite(values.dew?.value)&&matchingLiveSamples(values.temp2,values.rh2)){
  const dew=derivedDewpoint(values.temp2.value,values.rh2.value);
  if(Number.isFinite(dew))values.dew={value:dew,kind:'estimate',time:values.temp2.time,cell:values.temp2.cell,analysisId:values.temp2.analysisId,source:'Taupunkt aus zeitgleicher Orts-Temperatur und relativer Feuchte berechnet (Magnus-Näherung, keine direkte Messung)'};
 }
 return values;
}
function observationHeight(point){return point?(localHeights.get(pointKey(point))??(typeof warningElevation==='function'?warningElevation(point):NaN)):NaN;}
function refreshObservations(force=false){if(typeof WeatherObservation==='undefined')return;return WeatherObservation.refresh(()=>{if(activePage==='weather')refreshPointUI();if(activePage==='warnings')renderLocalWarnings();radarRevision++;scheduleMap()},force);}
let radarPhaseData=null,radarPhaseRequest=null;
function decodeRadarPhase(d){
 const g=d?.grid;if(d?.schema!==1||d.product!=='HymecNG'||!Number.isFinite(Date.parse(d.time))||!g||!Number.isInteger(g.nx)||!Number.isInteger(g.ny)||g.nx<2||g.ny<2||g.nx*g.ny>3000000||g.missing!==255||!Number.isFinite(g.west)||!Number.isFinite(g.south)||!(g.step>0)||typeof d.classes!=='string'||d.classes.length!==4*Math.ceil(g.nx*g.ny/3))throw Error('Invalid HymecNG grid');
 return d;
}
function radarPhaseAt(d,point,now=Date.now()){
 const time=Date.parse(d?.time);if(!point||!Number.isFinite(time)||time>now||now-time>20*60000)return null;
 const g=d.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);
 if(x<0||x>=g.nx||y<0||y>=g.ny)return null;
 const n=y*g.nx+x,offset=Math.floor(n/3)*4;
 try{const v=atob(d.classes.slice(offset,offset+4)).charCodeAt(n%3);return Number.isInteger(v)&&v>=0&&v<=10?{code:v,time}:null}catch{return null}
}
// Ground reports are independent evidence of precipitation phase only.
// Never use their temperature, wind or other observations as the local grid.
const observedPhaseCache=new Map(),observedPhaseRequests=new Map(),observedPhaseChecks=new Map();
function decodeObservedPhase(packet,point,height,now){
 const rows=Array.isArray(packet?.weather)?packet.weather:[],sources=packet?.sources||[];
 const codes={snow:7,sleet:6,rain:3,hail:9,dry:0};
 const candidates=[];
 for(const w of rows){
  const time=Date.parse(w.timestamp),code=codes[w.condition],id=w.fallback_source_ids?.condition??w.source_id,s=sources.find(x=>x.id===id);
  if(!Number.isInteger(code)||!Number.isFinite(time)||time>now||now-time>60*60000||!s||!['current','historical'].includes(s.observation_type)||!Number.isFinite(s.lon)||!Number.isFinite(s.lat)||!Number.isFinite(s.height))continue;
  const distance=111200*Math.hypot(s.lat-point[1],(s.lon-point[0])*Math.cos(point[1]*Math.PI/180));
  if(distance>2000||!Number.isFinite(height)||Math.abs(height-s.height)>120)continue;
  candidates.push({code,time,distance,height:s.height,kind:'ground',source:'Bodenbeobachtung '+String(s.station_name||'Wetterstation').replace(/[<>&"']/g,'')+' · '+localTime(time,{hour:'2-digit',minute:'2-digit'})});
 }
 return candidates.sort((a,b)=>b.time-a.time||a.distance-b.distance)[0]||null;
}
function observedPhaseAt(point,radar,now){
 if(!point||!(radar?.rate>0))return null;
 const phase=observedPhaseCache.get(pointKey(point));
 return phase&&phase.code>=2&&phase.time<=now&&now-phase.time<=60*60000&&Math.abs(radar.time-phase.time)<=45*60000?phase:null;
}
function resolveLivePhase(point,radar,now){
 const p=radarPhaseAt(radarPhaseData,point,now),valid=p&&(!radar||Math.abs(radar.time-p.time)<=5*60000)&&!(radar?.rate>0&&p.code===0)&&!(radar?.rate===0&&p.code>=2)?p:null;
 const ground=typeof WeatherObservation!=='undefined'?WeatherObservation.phaseAt(point,point?localHeights.get(pointKey(point)):NaN,now):null;
 if(ground&&(!radar?now-ground.time<=30*60000:Math.abs(radar.time-ground.time)<=30*60000&&(radar.rate>0||ground.time>=radar.time-10*60000)))return ground;
 if(valid&&valid.code>=2&&valid.code!==6)return valid;
 return observedPhaseAt(point,radar,now)||valid;
}
async function fetchObservedPhase(point,radar,now=Date.now()){
 if(!point||!(radar?.rate>0))return;
 const phase=radarPhaseAt(radarPhaseData,point,now);
 if(phase&&phase.code>=2&&phase.code!==6&&Math.abs(radar.time-phase.time)<=5*60000)return;
 const key=pointKey(point),analysis=liveAnalysisCache.get(key),height=localHeights.get(key)??(analysis&&now-analysis.run<=liveAge?analysis.modelElevation:NaN);
 if(!Number.isFinite(height)||observedPhaseRequests.has(key)||now-(observedPhaseChecks.get(key)||0)<5*60000)return;
 observedPhaseChecks.set(key,now);while(observedPhaseChecks.size>24)observedPhaseChecks.delete(observedPhaseChecks.keys().next().value);
 const task=(async()=>{try{
  const params=new URLSearchParams({lat:String(point[1]),lon:String(point[0]),max_dist:'2000',date:new Date(now-65*60000).toISOString(),last_date:new Date(now).toISOString()});
  const r=await fetch('https://api.brightsky.dev/weather?'+params,{signal:AbortSignal.timeout(8500),credentials:'omit'});if(!r.ok)return;
  // Only the CORS-enabled observation endpoint is available to browser clients.
  // Forecast condition entries are explicitly rejected by the decoder.
  const p=decodeObservedPhase(await r.json(),point,height,Date.now());
  if(!p)return;
  observedPhaseCache.set(key,p);while(observedPhaseCache.size>12)observedPhaseCache.delete(observedPhaseCache.keys().next().value);
  if(activePage==='weather'&&pointKey(homeLocationPoint(location))===key){refreshPointUI();refreshLiveHero()}
 }catch{}})().finally(()=>observedPhaseRequests.delete(key));observedPhaseRequests.set(key,task);return task;
}
// Restore only timestamp-validated recent scans across reloads. The network
// refresh runs independently so a cached scan never blocks a newer one.
async function readRadarCache(name,decode,accept){
 if(typeof caches==='undefined')return;
 try{const c=await caches.open('wetter-live-radar-v1'),r=await c.match('/__radar-cache/'+name);if(r){const a=await r.arrayBuffer(),b=new Uint8Array(a),d=decode(b[0]===31&&b[1]===139?await new Response(new Blob([a]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(a)));accept(d)}}catch{}
}
async function writeRadarCache(name,a){
 if(typeof caches==='undefined')return;
 try{const c=await caches.open('wetter-live-radar-v1');await c.put('/__radar-cache/'+name,new Response(a))}catch{}
}
function acceptRadarPhase(d){const t=Date.parse(d.time),now=Date.now();if(t>now||now-t>20*60000)return false;if(!radarPhaseData||t>Date.parse(radarPhaseData.time)){radarPhaseData=d;if(activePage==='weather'){refreshLiveHero();refreshPointUI()}refreshOwnRadarViews();return true}return false}
const mobileRadarRoot='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/mobile-radar-';
async function fetchRadarSnapshots(kind,legacyBranch,file,decode,accept,cacheKey){
 const suffix=file+'?t='+Math.floor(Date.now()/60000),urls=[mobileRadarRoot+kind+'/'+suffix,dataRoot.replace('/main/data/','/'+legacyBranch+'/')+suffix];
 for(const [i,url] of urls.entries())try{const r=await fetch(url,{signal:AbortSignal.timeout(i?9000:3500),cache:'default',credentials:'omit',priority:'high'});if(!r.ok)continue;
  const a=await r.arrayBuffer(),b=new Uint8Array(a),d=decode(b[0]===31&&b[1]===139?await new Response(new Blob([a]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(a)));
  if(!ownRadarFresh(d,20))continue;if(accept(d))writeRadarCache(cacheKey,a);return;
 }catch{}
}
let radarPhaseCheck=0;
async function fetchRadarPhase(){
 if(radarPhaseRequest)return radarPhaseRequest;
 if(Date.now()-radarPhaseCheck<60000)return;radarPhaseCheck=Date.now();
 if(!radarPhaseData)readRadarCache('phase',decodeRadarPhase,acceptRadarPhase);
 radarPhaseRequest=fetchRadarSnapshots('phase','radar-phase-data','radar-phase.json.gz',decodeRadarPhase,acceptRadarPhase,'phase').finally(()=>radarPhaseRequest=null);return radarPhaseRequest;
}
let radarPointData=null,radarPointRequest=null;
function decodeRadarPoints(d){
 const g=d?.grid;if(d?.schema!==1||d.product!=='RY'||d.intervalMinutes!==5||!Number.isFinite(Date.parse(d.time))||!g||!Number.isInteger(g.nx)||!Number.isInteger(g.ny)||g.nx<2||g.ny<2||g.nx*g.ny>3000000||g.scale!==.01||g.missing!==-32768||!Number.isFinite(g.west)||!Number.isFinite(g.south)||!(g.step>0))throw Error('Invalid radar point grid');
 if(typeof d.amount!=='string'||d.amount.length!==4*Math.ceil(g.nx*g.ny*2/3))throw Error('Invalid radar data length');return d;
}
function radarGridAt(d,point,now=Date.now()){
 if(!point||!d||Date.parse(d.time)>now||now-Date.parse(d.time)>20*60000)return null;
 const g=d.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(x<0||x>=g.nx||y<0||y>=g.ny)return null;
 const v=packedCell(d.amount,y*g.nx+x);if(!Number.isFinite(v)||v===g.missing||v<0)return null;
 const amount=v*g.scale;return {amount,rate:amount*60/d.intervalMinutes,time:Date.parse(d.time),source:d.source||'DWD RY'};
}
function acceptRadarPoints(d){const t=Date.parse(d.time),now=Date.now();if(t>now||now-t>20*60000)return false;if(!radarPointData||t>Date.parse(radarPointData.time)||t===Date.parse(radarPointData.time)&&d.product==='RY'&&radarPointData.product!=='RY'){radarPointData=d;if(activePage==='weather'){refreshLiveHero();refreshPointUI()}refreshOwnRadarViews();return true}return false}
let radarPointCheck=0;
async function fetchRadarPoints(){
 if(radarPointRequest)return radarPointRequest;
 if(Date.now()-radarPointCheck<60000)return;radarPointCheck=Date.now();
 if(!radarPointData)readRadarCache('rate',decodeRadarPoints,acceptRadarPoints);
 if(!ownRadarFresh(radarPointData,12)&&!ownRadarFresh(operaRadarData,20))setTimeout(()=>{if(!ownRadarFresh(radarPointData,12)&&!ownRadarFresh(operaRadarData,20))fetchBrightRadar()},750);
 radarPointRequest=fetchRadarSnapshots('ry','radar-observation-data','radar-points.json.gz',decodeRadarPoints,acceptRadarPoints,'rate');try{await radarPointRequest}finally{radarPointRequest=null}
}
// Quantitative RV forecasts: each value is a separate five-minute amount,
// not a cumulative total or a radar image colour. Missing is not zero.
let radarNowcastData=null,radarNowcastRequest=null,nowcastWorker=null,nowcastMessageId=0,nowcastPointKey='';
const nowcastMessages=new Map(),nowcastMapFrames=new Map(),nowcastFramePending=new Map();
function workerNowcast(type,details){
 if(typeof Worker!=='function')return Promise.resolve(null);
 try{
  if(!nowcastWorker){
   nowcastWorker=new Worker('assets/nowcast-worker.js?v=20261121');
   nowcastWorker.onmessage=({data})=>{const entry=nowcastMessages.get(data.id);if(entry){nowcastMessages.delete(data.id);clearTimeout(entry.timer);entry.resolve(data.result)}};
   nowcastWorker.onerror=()=>{nowcastWorker?.terminate();nowcastWorker=null;for(const e of nowcastMessages.values()){clearTimeout(e.timer);e.resolve(null)}nowcastMessages.clear()};
  }
  const id=++nowcastMessageId,now=Date.now(),urls=[mobileRadarRoot+'rv/radar-nowcast.json.gz?t='+Math.floor(now/300000),dataRoot.replace('/main/data/','/radar-nowcast-data/')+'radar-nowcast.json.gz?t='+Math.floor(now/300000),new URL('data/radar-nowcast.json.gz',document.baseURI).href];
  return new Promise(resolve=>{const timer=setTimeout(()=>{nowcastMessages.delete(id);resolve(null)},65000);nowcastMessages.set(id,{resolve,timer});try{nowcastWorker.postMessage({id,type,now,urls,...details})}catch{clearTimeout(timer);nowcastMessages.delete(id);resolve(null)}});
 }catch{return Promise.resolve(null)}
}
function decodeRadarNowcast(d){
 const g=d?.grid;if(d?.schema!==1||d.product!=='RV'||d.intervalMinutes!==5||!Number.isFinite(Date.parse(d.time))||!g||!Number.isInteger(g.nx)||!Number.isInteger(g.ny)||g.nx<2||g.ny<2||g.nx*g.ny>3000000||g.scale!==.01||g.missing!==-32768||!Number.isFinite(g.west)||!Number.isFinite(g.south)||!(g.step>0))throw Error('Invalid RV grid');
 const len=4*Math.ceil(g.nx*g.ny*2/3);for(let h=5;h<=120;h+=5)if(typeof d.frames?.[h]!=='string'||d.frames[h].length!==len)throw Error('Incomplete RV forecast');return d;
}
function radarForecastRows(d,point,now){
 const base=Date.parse(d?.time);if(!point||!Number.isFinite(base)||base>now||now-base>25*60000)return [];
 const g=d.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(x<0||x>=g.nx||y<0||y>=g.ny)return [];
 const rows=[];for(let lead=5;lead<=120;lead+=5){const end=base+lead*60000,start=end-300000,v=packedCell(d.frames[lead],y*g.nx+x);if(end>now&&Number.isFinite(v)&&v>=0)rows.push({start,end,amount:v*g.scale,source:'DWD RV'});}return rows;
}
async function fetchRadarNowcast(){
 if(radarNowcastRequest)return radarNowcastRequest;
 const point=homeLocationPoint(location);if(!point)return;
 const key=pointKey(point);nowcastPointKey=key;
 radarNowcastRequest=workerNowcast('point',{point}).then(d=>{
  if(pointKey(homeLocationPoint(location))!==key)return;
  if(d&&(!radarNowcastData||Date.parse(d.time)>Date.parse(radarNowcastData.time)||d.grid.west!==radarNowcastData.grid.west||d.grid.south!==radarNowcastData.grid.south)){
   radarNowcastData=d;refreshPointUI();refreshOwnRadarViews()
  }
 }).finally(()=>{radarNowcastRequest=null;if(pointKey(homeLocationPoint(location))!==key)fetchRadarNowcast()});
 return radarNowcastRequest;
}
function fetchNowcastMapFrame(date){
 const time=date.getTime();if(!Number.isFinite(time)||time<=radarBaseTime()||time>Date.now()+120*60000){fetchBrightRadarFrame(date);return;}
 if(nowcastFramePending.has(time))return nowcastFramePending.get(time);
 if(nowcastFramePending.size>=3)return;
 const task=workerNowcast('frame',{time}).then(d=>{
  if(d){nowcastMapFrames.set(time,d);while(nowcastMapFrames.size>6)nowcastMapFrames.delete(nowcastMapFrames.keys().next().value);refreshOwnRadarViews()}
  else fetchBrightRadarFrame(date);
 }).finally(()=>nowcastFramePending.delete(time));nowcastFramePending.set(time,task);return task;
}
function parameterAt(id,point,time,preferred,interval=0){
 const frames=[preferred,...forecastPriority.map(model=>chooseLocationModel(time,point,false,[model]))].filter(Boolean);
 for(const frame of frames){const value=frameVal(frame,id,interval);if(Number.isFinite(value))return {frame,value}}
 return {frame:null,value:NaN};
}
// Native point profiles are sampled from the original map payload at the
// selected coordinate. Keep just one Int16 per field, never dozens of full grids.
let pointProfile=null,pointProfileTask=null,pointProfileCheck=0,pointProfileKey='';
const profileLevels=[1000,975,950,925,900,850,800,700,600,500,400,300,250,200,150,100];
const profileFields=new Set(['s01','s03','s06','srh01','srh03','stormrel','lcl','lfc','el','cape','cin','li','thetae','lapse','lapse7','freezing','ehi03']);
// Derive point diagnostics from ONE model, initialization, cell and time.
// Height interpolation is vertical only; never interpolate model times.
function calculateExpertProfile(read,terrain=NaN){
 const out={},t=read('temp2'),td=read('dew'),speed=read('wind')/3.6,dir=read('winddir')*Math.PI/180;
 const ground=Number.isFinite(read('orog'))?read('orog'):terrain;
 const levels=profileLevels.map(p=>({p,z:read('z'+p)*10,t:read('t'+p),rh:read('rh'+p),u:read('u'+p),v:read('v'+p)}));
 const e=(t,rh=100)=>rh/100*6.112*Math.exp(17.67*t/(t+243.5));
 const mixing=(p,t,rh)=>{const v=e(t,rh);return v>=0&&v<p ? .622*v/(p-v) : NaN};
 const theta=(p,t,rh)=>{const v=e(t,rh),r=mixing(p,t,rh),a=Math.log(v/6.112),d=243.5*a/(17.67-a)+273.15,k=t+273.15,tl=1/(1/(d-56)+Math.log(k/d)/800)+56;return rh>0&&rh<=100?(k*(1000/(p-v))**(2/7)*(k/tl)**(.28*r))*Math.exp((3036/tl-1.78)*r*(1+.448*r)):NaN};
 out.thetae=theta(850,read('t850'),read('rh850'));
 for(const [p,id] of [[850,'lapse'],[700,'lapse7']]){const dz=(read('z500')-read('z'+p))/100;out[id]=dz>0?(read('t'+p)-read('t500'))/dz:NaN}
 if(Number.isFinite(t)&&Number.isFinite(td)&&td<=t+.3)out.lcl=125*Math.max(0,t-td);
 if(!Number.isFinite(ground))return out;
 const above=levels.filter(l=>Number.isFinite(l.z)&&l.z>ground+10).map(l=>({...l,z:l.z-ground})).sort((a,b)=>a.z-b.z);
 let ps=read('ps');const first=above.find(l=>Number.isFinite(l.t));
 if(!Number.isFinite(ps)&&first&&Number.isFinite(t))ps=first.p*Math.exp(9.80665*first.z/(287.05*(273.15+(first.t+t)/2)));
 const u0=Number.isFinite(read('u10'))?read('u10'):-speed*Math.sin(dir),v0=Number.isFinite(read('v10'))?read('v10'):-speed*Math.cos(dir);
 const winds=[{z:0,u:u0,v:v0},...above.filter(l=>Number.isFinite(l.u)&&Number.isFinite(l.v))];
 const at=(rows,z,key)=>{const hi=rows.findIndex(r=>r.z>=z);if(hi<0)return NaN;if(rows[hi].z===z)return rows[hi][key];if(!hi)return NaN;const a=rows[hi-1],b=rows[hi];return a[key]+(b[key]-a[key])*(z-a.z)/(b.z-a.z)};
 const vector=z=>[at(winds,z,'u'),at(winds,z,'v')];
 for(const [id,z] of [['s01',1000],['s03',3000],['s06',6000]]){const [u,v]=vector(z);out[id]=Math.hypot(u-u0,v-v0)}
 const meanWind=(a,b)=>{const zs=[a,...winds.filter(r=>r.z>a&&r.z<b).map(r=>r.z),b];return ['u','v'].map(k=>zs.slice(1).reduce((s,z,i)=>s+(at(winds,z,k)+at(winds,zs[i],k))*.5*(z-zs[i]),0)/(b-a))};
 const low=meanWind(0,500),high=meanWind(5500,6000),mean=meanWind(0,6000),du=high[0]-low[0],dv=high[1]-low[1],mag=Math.hypot(du,dv);
 if(mag>.1&&[...mean,du,dv].every(Number.isFinite)){
  const cu=mean[0]+7.5*dv/mag,cv=mean[1]-7.5*du/mag;
  const srh=depth=>{const zs=[0,...winds.filter(r=>r.z>0&&r.z<depth).map(r=>r.z),depth];return zs.slice(1).reduce((sum,z,i)=>{const [a,b]=vector(zs[i]),[c,d]=vector(z);return sum+(c-cu)*(b-cv)-(a-cu)*(d-cv)},0)};
  out.srh01=srh(1000);out.srh03=srh(3000);const m=meanWind(0,1000);out.stormrel=Math.hypot(m[0]-cu,m[1]-cv);
  const ml=read('mlcape');if(Number.isFinite(ml)&&ml>=0)out.ehi03=ml*out.srh03/160000;
 }
 // Surface-parcel ascent on the model pressure levels (Bolton LCL and
 // pseudoadiabatic ascent). Results are profile approximations, not native indices.
 if(!(ps>400&&ps<1100)||!Number.isFinite(t)||!Number.isFinite(td)||td>t+.3)return out;
 const env=[{z:0,p:ps,t,rh:Math.max(0,Math.min(100,100*e(td)/e(t)))},...above.filter(l=>l.p<ps&&Number.isFinite(l.t)&&l.rh>=0&&l.rh<=100)];
 if(env.length<4||env.some((l,i)=>i&&l.p>=env[i-1].p))return out;
 const tk=t+273.15,tdk=Math.min(td,t)+273.15,tl=1/(1/(tdk-56)+Math.log(tk/tdk)/800)+56,pl=ps*(tl/tk)**(1004/287.05);
 const altitude=p=>{const i=env.findIndex(l=>l.p<=p);if(i===0)return 0;if(i<0)return NaN;const a=env[i-1],b=env[i];return a.z+(b.z-a.z)*Math.log(p/a.p)/Math.log(b.p/a.p)};
 const zl=altitude(pl);if(Number.isFinite(zl))out.lcl=zl;
 for(let i=1;i<env.length;i++){const a=env[i-1],b=env[i];if(a.t>=0&&b.t<0){out.freezing=ground+a.z+(b.z-a.z)*a.t/(a.t-b.t);break}}
 if(!Number.isFinite(zl))return out;
 const parcel=p=>{if(p>=pl)return tk*(p/ps)**(287.05/1004);let T=tl,lp=Math.log(pl),target=Math.log(p);while(lp-target>1e-8){const dl=-Math.min(.015,lp-target),r=mixing(Math.exp(lp+dl/2),T-273.15,100);if(!Number.isFinite(r))return NaN;T+=dl*(287.05*T+2.5e6*r)/(1004+(2.5e6)**2*r*.622/(287.05*T*T));lp+=dl}return T};
 const r0=mixing(ps,td,100),buoy=({p,t,rh})=>{const pt=parcel(p),rp=p>=pl?r0:mixing(p,pt-273.15,100),re=mixing(p,t,rh),tv=(t+273.15)*(1+re/.622)/(1+re),pv=pt*(1+rp/.622)/(1+rp);return 9.80665*(pv-tv)/tv};
 const l500=env.find(l=>l.p===500);if(l500)out.li=l500.t+273.15-parcel(500);
 const nodes=env.map(l=>({...l,b:buoy(l)}));if(nodes.some(l=>!Number.isFinite(l.b)))return out;
 // Insert the LCL explicitly to avoid starting free convection below it.
 if(zl>0&&!nodes.some(l=>Math.abs(l.z-zl)<1e-6)){const eAt={z:zl,p:pl,t:at(env,zl,'t'),rh:at(env,zl,'rh')};nodes.push({...eAt,b:buoy(eAt)});nodes.sort((a,b)=>a.z-b.z)}
 let lfc=NaN,el=NaN,cape=0,cin=0;
 for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i];if(b.z<=zl){cin+=Math.min(0,(a.b+b.b)*.5)*(b.z-a.z);continue}const cross=a.b*b.b<0?a.z+(b.z-a.z)*(-a.b)/(b.b-a.b):NaN;
  if(!Number.isFinite(lfc)&&(a.b>0||b.b>0))lfc=Math.max(zl,a.b>0?a.z:Number.isFinite(cross)?cross:b.z);
  if(Number.isFinite(lfc)){if(a.b>0&&b.b<0)el=Number.isFinite(cross)?cross:b.z;if(b.b>0)el=NaN;cape+=a.b>=0&&b.b>=0?(a.b+b.b)*.5*(b.z-a.z):Number.isFinite(cross)?(a.b>0?a.b*(cross-a.z):b.b*(b.z-cross))*.5:0;}else cin+=Math.min(0,(a.b+b.b)*.5)*(b.z-a.z);
 }
 if(Number.isFinite(lfc))out.lfc=lfc;if(Number.isFinite(el))out.el=el;
 if(env.at(-1).p<=200){if(Number.isFinite(el)){out.cape=Math.max(0,cape);out.cin=Math.min(0,cin)}else if(!Number.isFinite(lfc)){out.lfcAbsent=true;out.elAbsent=true;out.cape=0;}}
 return out;
}
const profileCache=new WeakMap();
function derivedExpertSample(frame,id){
 if(!frame||!profileFields.has(id)||frame.interpolated)return null;
 let cache=profileCache.get(frame.d);if(!cache){cache=new Map();profileCache.set(frame.d,cache)}const key=frame.hour+'/'+pointKey(frame.point);if(!cache.has(key)){let terrain=NaN;try{terrain=warningElevation(frame.point)}catch{}cache.set(key,calculateExpertProfile(k=>frameVal(frame,k),terrain));if(cache.size>40)cache.delete(cache.keys().next().value)}const result=cache.get(key);return {value:result[id]??NaN,absent:!!result[id+'Absent']};
}
function derivedSurfaceSample(f,id){
 if(!['snowdepth','snowWater','snowDensity','rh2','wind100','snowline'].includes(id))return NaN;
 const get=k=>frameVal(f,k),depth=get('snowdepth'),water=get('snowWater'),density=get('snowDensity');
 if(id==='snowdepth')return water===0?0:water>=0&&density>0?100*water/density:NaN;
 if(id==='snowWater')return depth===0?0:depth>0&&density>0?depth*density/100:NaN;
 if(id==='snowDensity')return depth>0&&water>0?100*water/depth:NaN;
 if(id==='rh2')return frameHumidity(f);
 if(id==='wind100')return Math.hypot(get('u100'),get('v100'))*3.6;
 if(id==='snowline'){
  const ground=get('orog');if(!Number.isFinite(ground))return NaN;
  const rows=[{t:get('temp2'),rh:frameHumidity(f),z:ground},...profileLevels.map(p=>({t:get('t'+p),rh:get('rh'+p),z:get('z'+p)*10}))].filter(r=>Number.isFinite(r.z)&&r.z>=ground&&r.t>=-20&&r.t<=50&&r.rh>=5&&r.rh<=100).sort((a,b)=>a.z-b.z);
  const tw=(t,rh)=>t*Math.atan(.151977*Math.sqrt(Math.min(rh,99)+8.313659))+Math.atan(t+rh)-Math.atan(rh-1.676331)+.00391838*rh**1.5*Math.atan(.023101*rh)-4.686035;
  for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i],u=tw(a.t,a.rh),v=tw(b.t,b.rh);if(u>=0&&v<0&&b.z>a.z)return a.z+(b.z-a.z)*u/(u-v)}
 }return NaN;
}
function currentParameterAt(id,point,now,preferred,interval=0){
 if(id==='hail'){for(const d of pointRuns('ICON-D2-RUC',point)){if(now-Date.parse(d.run)>6*HOUR_MS)continue;const h=d.hours.filter(h=>mapLeadTime(d,h)<=now).at(-1),time=mapLeadTime(d,h);if(!Number.isFinite(time)||now-time>2*HOUR_MS)continue;const frame={d,hour:h,time,point},value=frameVal(frame,id);if(Number.isFinite(value))return {frame,value};}return {frame:null,value:NaN};}
 const native=pointProfile&&pointProfile.point.every((x,i)=>x===point?.[i])&&pointProfile.time<=now&&now-pointProfile.time<=6*HOUR_MS&&now-Date.parse(pointProfile.d.run)<=modelAgeLimit(pointProfile.d.model)*HOUR_MS?pointProfile:null;
 // Preserve the original time and source of every individual value.
 const frames=[native,preferred,...forecastPriority.map(model=>currentGridFrame(point,now,[model]))].filter(Boolean);
 for(const frame of frames){if(frame.time>now)continue;const value=frameVal(frame,id,interval);if(Number.isFinite(value))return {frame,value};}
 // Optional diagnostics may be provided every 3/6 h even when the base
 // products are hourly. Search valid past samples instead of inventing them.
 for(const model of forecastPriority)for(const d of [...quickRuns(model,point),...locationRuns(model,point)]){const run=Date.parse(d.run);if(now-run>modelAgeLimit(model)*HOUR_MS)continue;for(const h of d.hours.filter(h=>run+h*HOUR_MS<=now&&run+h*HOUR_MS>=now-6*HOUR_MS).reverse()){const frame={d,hour:h,time:run+h*HOUR_MS,point},value=frameVal(frame,id,interval);if(Number.isFinite(value))return {frame,value};if(profileFields.has(id)||['snowdepth','snowWater','snowDensity','snowline','rh2','wind100'].includes(id))frames.push(frame);}}
 for(const frame of frames){if(frame.time>now)continue;const surface=derivedSurfaceSample(frame,id);if(Number.isFinite(surface))return {frame,value:surface,derived:true};const derived=derivedExpertSample(frame,id);if(derived&&(Number.isFinite(derived.value)||derived.absent))return {frame,...derived,derived:true};}
 return {frame:null,value:NaN};
}
function currentSource(frame){return frame?frame.d.model+' · '+localTime(frame.time,{hour:'2-digit',minute:'2-digit'})+' · '+(frame.d.gridMapping==='nearest-source-cell'?'2,2-km-Modellzelle · Rasterabbildung':frame.d.pointNative||frame.d.nativeMap?'Originalraster':frame.d.grid.step.toLocaleString('de-DE')+'°-Raster'):'Nicht verfügbar'}
async function fetchPointProfile(point,preferred){
 if(!point)return;const model=preferred?.d.model||'ICON-D2',key=model+'/'+point.join('/');
 if(pointProfileTask||key===pointProfileKey&&Date.now()-pointProfileCheck<120000)return;
 pointProfileKey=key;pointProfileCheck=Date.now();
 pointProfileTask=(async()=>{
  // Prefer the compact point tiles that are already being downloaded for
  // local weather. A full native map field is only a last-resort input.
  const pending=[...pointWeatherRequests].filter(([k])=>k.startsWith(pointKey(point)+'/')).map(([,task])=>task);
  if(pending.length)await Promise.race([Promise.allSettled(pending),new Promise(resolve=>setTimeout(resolve,1800))]);
  await fetchNativeMapModel(model,false,true);const now=Date.now();
  const d=[...mapModelRuns(model,true),...mapModelRuns(model,false)].find(d=>d.nativeMap&&now-Date.parse(d.run)<=modelAgeLimit(d.model)*HOUR_MS&&Date.parse(d.run)<=now&&point[0]>=d.grid.west-d.grid.step/2&&point[0]<=d.grid.west+(d.grid.nx-.5)*d.grid.step&&point[1]>=d.grid.south-d.grid.step/2&&point[1]<=d.grid.south+(d.grid.ny-.5)*d.grid.step);if(!d)return;
  const hour=d.hours.filter(h=>Date.parse(d.run)+h*HOUR_MS<=now&&d.frames[h]?.temp2).at(-1),time=Date.parse(d.run)+hour*HOUR_MS,g=d.grid;
  const x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(!Number.isFinite(time)||now-time>6*HOUR_MS||x<0||y<0||x>=g.nx||y>=g.ny)return;
  const n=y*g.nx+x,previous=pointProfile,profileKey=d.file+'/'+d.generated+'/'+hour+'/'+point.join('/');if(previous?.profileKey===profileKey&&previous.complete)return;
  const local={...d,grid:{...g,west:point[0],south:point[1],nx:1,ny:1},decoded:new Map(previous?.profileKey===profileKey?previous.d.decoded:[])};
  const requested=new Map();const ids=[...new Set([...Object.values(expertMapLinks),'temp2','dew','rh2','wind','winddir','gust','slp','cloud','lowcloud','midcloud','highcloud','tground','visibility','snowdepth','snowWater','snowDensity','snowWaterTotal','snowGspTotal','snowConTotal','snownew','tsnow','ground','sunhours','uv','pop','ww','ptype','rainrate','rain24','pwat','freezing','snowline','wind100','radiation'])];
  for(const id of ids)for(const [h,k] of mapFieldRequirements(d,fields[id]||{id,interval:0},hour))if(d.frames[h]?.[k])requested.set(h+'/'+k,[h,k]);
  for(const k of ['orog','ps','u10','v10',...profileLevels.flatMap(p=>['t','rh','z','u','v'].map(f=>f+p))])if(d.frames[hour]?.[k])requested.set(hour+'/'+k,[hour,k]);
  const pointPackets=pointRuns(model,point).filter(r=>r.pointNative&&Date.parse(r.run)===Date.parse(d.run)&&Math.abs(r.grid.step-g.step)<1e-8&&Math.abs(r.grid.west-(g.west+x*g.step))<1e-7&&Math.abs(r.grid.south-(g.south+y*g.step))<1e-7);
  for(const [id,[h,k]] of requested){if(local.decoded.has(id))continue;const packet=pointPackets.find(r=>r.scales?.[k]===d.scales?.[k]&&typeof r.frames[h]?.[k]==='string');if(packet){const v=packedCell(packet.frames[h][k],0);if(v!==undefined)local.decoded.set(id,new Int16Array([v]))}}
  function publishProfile(complete=false){if(!local.decoded.size||pointKey(homeLocationPoint(location))!==pointKey(point))return;profileCache.delete(local);pointProfile={d:local,point:[...point],hour,time,profileKey,complete};refreshPointUI()}
  publishProfile();
  let completed=0;
  const queue=[...requested.values()].filter(([h,k])=>!local.decoded.has(h+'/'+k));await Promise.all(Array.from({length:4},async()=>{while(queue.length){
   if(homeLocationPoint(location)?.join('/')!==point.join('/'))return;
   const [h,k]=queue.shift(),id=h+'/'+k;let v=d.decoded.get(id)?.[n];
   if(v===undefined){const raw=await nativeMapRead(d.file,h+'-'+k+'.json.gz',true,d.generated,12000);if(raw?.schema!==2||raw.run!==d.run||raw.generated!==d.generated||raw.hour!==h||raw.field!==k||typeof raw.values!=='string'||raw.values.length!==4*Math.ceil(g.nx*g.ny*2/3))continue;v=packedCell(raw.values,n)}
   if(v!==undefined){local.decoded.set(id,new Int16Array([v]));if(++completed%12===0)publishProfile()}
  }}));
  publishProfile(local.decoded.size===requested.size);
 })().catch(()=>{}).finally(()=>{pointProfileTask=null;if(homeLocationPoint(location)?.join('/')!==point.join('/'))fetchPointProfile(homeLocationPoint(location),currentGridFrame(homeLocationPoint(location)))});
 return pointProfileTask;
}
function modelComparison(point,now){
 const target=Math.ceil((now+24*3600000)/(6*3600000))*6*3600000;
 return '<section class="panel model-comparison"><h2>Modellvergleich</h2><p class="small muted">'+localTime(target,{weekday:'short',hour:'2-digit',minute:'2-digit'})+' · gleiche Gültigkeitszeit, + ca. 24–30 h</p><div class="compare-row compare-heading"><div>Modell</div><span>°C</span><span>km/h</span><span>mm/h</span></div>'+forecastPriority.map(model=>{
  const f=chooseLocationModel(target,point,false,[model]),exact=f?.time===target?f:null;
  const cached=locationRuns(model,point)[0],stale=cached&&now-Date.parse(cached.run)>modelAgeLimit(model)*3600000;
  const label='<div><b>'+model+'</b><small>'+modelProvider(model)+(cached?' · '+localTime(Date.parse(cached.run),{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+(stale?' · Archiv':''):'')+'</small></div>';
  return '<div class="compare-row">'+label+(exact?'<span>'+temperatureText(frameVal(exact,'temp2'))+'</span><span>'+localFormat(frameVal(exact,'wind'))+'</span><span>'+localFormat(frameVal(exact,'rainrate'))+'</span>':'<span class="compare-action">'+(realModelRequests.has(model)?'Lädt …':!cached?'<button class="btn" data-load-model="'+model+'">Modell laden</button>':'Kein passender Zeitpunkt')+'</span>')+'</div>';
 }).join('')+'<p class="small muted">Niederschlagsrate: Mittel über das jeweilige Modellintervall. ENS Control ist der Kontrolllauf, kein Ensemblemittel.</p></section>';
}
function isNightAt(time,point){
 if(!point||!Number.isFinite(time))return false;
 const d=new Date(time),day=(time-Date.UTC(d.getUTCFullYear(),0,1))/86400000,dec=23.44*Math.cos((day-172)*Math.PI/182.625)*Math.PI/180,lat=point[1]*Math.PI/180,angle=(d.getUTCHours()+d.getUTCMinutes()/60+point[0]/15-12)*Math.PI/12;
 return Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(angle)<0;
}
function frameHumidity(f){const rh=frameVal(f,'rh2');if(Number.isFinite(rh)&&rh>=0&&rh<=100)return rh;const t=frameVal(f,'temp2'),td=frameVal(f,'dew');return Number.isFinite(t)&&Number.isFinite(td)?Math.min(100,Math.max(0,100*Math.exp(17.625*td/(243.04+td)-17.625*t/(243.04+t)))):NaN}
function fogCondition(f){const v=frameVal(f,'visibility'),t=frameVal(f,'temp2'),td=frameVal(f,'dew'),rh=frameHumidity(f),low=frameVal(f,'lowcloud'),cloud=frameVal(f,'cloud'),wind=frameVal(f,'wind');
 if(Number.isFinite(v)&&v>=0&&v<1)return {icon:v<.2?'44_dichter_nebel':t<=0?'66_gefrierender_nebel':'43_nebel',condition:v<.2?'Dichter Nebel':'Nebel',rank:2,source:'Ortsraster · Modellsichtweite'};
 if(Number.isFinite(v)&&v>=1&&v<5&&rh>=88)return {icon:'41_dunst',condition:'Dunstig',rank:1,source:'Ortsraster · Feuchte und Sichtweite'};
 if(rh>=94&&Number.isFinite(t)&&Number.isFinite(td)&&t-td<=1.2&&t-td>=-.3){
  if(low>=70||(Number.isNaN(low)&&cloud>=90&&(!Number.isFinite(wind)||wind<=18)))return {icon:'47_hochnebel',condition:'Hochnebel / Dunst wahrscheinlich',rank:1,source:'Abgeleitet: bodennahe Feuchte und tiefe Wolken'};
  if((!Number.isFinite(v)||v<=8)&&(!Number.isFinite(wind)||wind<=15))return {icon:'41_dunst',condition:'Dunst möglich',rank:1,source:'Abgeleitet: geringe Taupunktdifferenz'};
 }return null;
}
function cloudWeather(cloud,night=false){
 if(!Number.isFinite(cloud))return {icon:null,condition:'Bewölkung nicht verfügbar',rank:0};
 const i=cloud<10?0:cloud<30?1:cloud<60?2:cloud<85?3:cloud<98?4:5;
 return {icon:(night?['07_klare_nacht','08_nachts_leicht_bewoelkt','09_nachts_wolkig','09_nachts_wolkig','10_nachts_bedeckt','10_nachts_bedeckt']:['01_sonnig','02_heiter','03_leicht_bewoelkt','04_wolkig','05_stark_bewoelkt','06_bedeckt'])[i],condition:[night?'Klar':'Sonnig','Heiter','Leicht bewölkt','Wolkig','Stark bewölkt','Bedeckt'][i],rank:0};
}
// Some hourly ICON packets have snowfall accumulations but no WW field.
// Compare water equivalents from one model run and the same native interval;
// snow-cover depth is never evidence of new snowfall.
function modelSnowFraction(f){
 if(!f?.d||f.interpolated)return NaN;
 const previous=f.d.hours?.filter(h=>h<f.hour).at(-1);
 if(!Number.isFinite(previous))return NaN;
 const before={...f,hour:previous,time:Date.parse(f.d.run)+previous*3600000};
 const delta=id=>{const a=frameVal(before,id),b=frameVal(f,id);return a>=0&&b>=0&&b-a>=-.05?Math.max(0,b-a):NaN;};
 const total=delta('rainTotal'),snow=delta('snowWaterTotal'),components=delta('snowGspTotal')+delta('snowConTotal'),water=Number.isFinite(snow)?snow:components;
 return total>0&&Number.isFinite(water)&&water<=total+Math.max(.05,total*.02)?Math.min(1,water/total):NaN;
}
function frameWeather(f,daytime=false){
 const rain=frameVal(f,'rainrate'),cloud=frameVal(f,'cloud'),ww=frameVal(f,'ww'),type=frameVal(f,'ptype'),vis=frameVal(f,'visibility');
 const night=!daytime&&f&&isNightAt(f.time,f.point);
 const make=(icon,condition,rank=0,source='Modellparameter')=>({icon,condition,rank,source});
 // DWD WW is the model's own weather interpretation (preceding hour).
 // Codes can be mapped directly; no inferred precipitation phase overrides it.
 const codes={
  0:[night?'07_klare_nacht':'01_sonnig',night?'Klar':'Sonnig',0],1:[night?'08_nachts_leicht_bewoelkt':'02_heiter','Heiter',0],2:[night?'09_nachts_wolkig':'04_wolkig','Wolkig',0],3:[night?'10_nachts_bedeckt':'06_bedeckt','Bedeckt',0],
  45:['43_nebel','Nebel',2],48:['66_gefrierender_nebel','Nebel mit Reifbildung',3],
  51:['11_regen_1','Leichter Sprühregen',2],53:['12_regen_2','Mäßiger Sprühregen',3],55:['13_regen_3','Starker Sprühregen',4],56:['33_gefrierender_regen','Leichter gefrierender Sprühregen',5],57:['33_gefrierender_regen','Gefrierender Sprühregen',6],
  61:[night?'65_regen_nacht':'11_regen_1','Leichter Regen',2],63:[night?'65_regen_nacht':'12_regen_2','Mäßiger Regen',3],65:['14_regen_4','Starker Regen',4],66:['33_gefrierender_regen','Leichter gefrierender Regen',5],67:['33_gefrierender_regen','Gefrierender Regen',6],
  71:[night?'64_schneefall_nacht':'20_schnee_1','Leichter Schneefall',3],73:[night?'64_schneefall_nacht':'21_schnee_2','Mäßiger Schneefall',4],75:['23_schnee_4','Starker Schneefall',5],77:['20_schnee_1','Schneegriesel',3],
  80:[night?'19_schauer_nacht':'16_schauer_1','Leichte Regenschauer',2],81:[night?'19_schauer_nacht':'17_schauer_2','Regenschauer',3],82:['18_schauer_3','Sehr starke Regenschauer',5],85:[night?'27_schneeschauer_nacht':'25_schneeschauer_1','Leichte Schneeschauer',3],86:[night?'27_schneeschauer_nacht':'26_schneeschauer_2','Schneeschauer',4],
  95:[night?'56_gewitter_nacht':'35_gewitterregen','Gewitter',6],96:['36_starkes_gewitter','Starkes Gewitter oder Gewitter mit Graupel/Hagel',7],99:['36_starkes_gewitter','Starkes Gewitter mit Graupel/Hagel',8]
 };
 Object.assign(codes,{50:codes[51],52:codes[53],54:codes[55],58:codes[51],59:codes[53],60:codes[61],62:codes[63],64:codes[65],68:['29_schneeregen_2','Leichter Schneeregen',3],69:['29_schneeregen_2','Schneeregen',4],70:codes[71],72:codes[73],74:codes[75],83:['29_schneeregen_2','Schneeregenschauer',3],84:['30_schneeregen_3','Kräftige Schneeregenschauer',4]});
 if(Number.isInteger(ww)&&ww>=45&&codes[ww])return make(...codes[ww],'DWD-Wettercode WW');
 // IFS provides precipitation type, not the ICON weather code. The phase
 // refers to the model time; the rate is the preceding model interval.
 const phaseSource=(f?.d?.model||'Modell')+'-Niederschlagsart';
 if(type===1)return make(rain>=4?'14_regen_4':night?'65_regen_nacht':rain>=1?'12_regen_2':'11_regen_1','Regen',rain>=4?4:2,phaseSource);
 if(type===3||type===12)return make('33_gefrierender_regen',type===12?'Gefrierender Sprühregen':'Gefrierender Regen',6,phaseSource);
 if(type===5||type===6)return make(rain>=2?'22_schnee_3':night?'64_schneefall_nacht':'21_schnee_2',type===6?'Nassschnee':'Schneefall',4,phaseSource);
 if(type===7)return make('29_schneeregen_2','Schneeregen',4,phaseSource);
 if(type===8)return make('21_schnee_2','Eiskörner',5,phaseSource);
 const snowFraction=modelSnowFraction(f);
 if(snowFraction>0&&rain>0){
  const source=(f.d.model||'Modell')+' · Schnee-Wasseräquivalent im Modellintervall';
  if(snowFraction>=.95)return make(rain>=2?'22_schnee_3':night?'64_schneefall_nacht':rain>=.5?'21_schnee_2':'20_schnee_1','Schneefall',4,source);
  return make('29_schneeregen_2','Niederschlag, teils Schnee',3,source);
 }
 if(Number.isFinite(rain)&&rain>=.1)return make(rain>=4?'14_regen_4':night?'65_regen_nacht':'12_regen_2','Niederschlag im Modellintervall (Art nicht bestimmt)',rain>=4?4:2,'Modell-Niederschlagssumme');
 const fog=fogCondition(f);if(fog)return fog;
 // For dry conditions use the actual numerical cloud fraction, not the
 // coarser weather-code category (which refers to the preceding hour).
 if(Number.isFinite(cloud))return {...cloudWeather(cloud,night),source:'Modell-Bewölkung'};
 if(Number.isInteger(ww)&&codes[ww])return make(...codes[ww],'DWD-Wettercode WW');
 return make(null,'Wetterzustand nicht verfügbar');
}
function dailyWeatherFrame(rows){
 const noonDistance=f=>Math.abs(+localTime(f.time,{hour:'2-digit',hourCycle:'h23'}).slice(0,2)-12);
 return rows.map(f=>({f,rank:frameWeather(f,true).rank,distance:noonDistance(f)})).sort((a,b)=>b.rank-a.rank||a.distance-b.distance)[0]?.f;
}
// Summary icons represent the same accumulation interval as the displayed mm.
// Severity tiers are display conventions, not warning thresholds.
const iconRainThresholds={1:[.1,1,3,8],6:[.1,1,4,10],24:[.1,2,8,20]};
function forecastIcon(rows,total,hours,cloud=NaN,night=false){
 const entries=rows.map(r=>({...r,w:frameWeather(r.frame,true)})),valid=entries.filter(r=>r.w.icon),wet=valid.filter(r=>r.amount>0),special=valid.filter(r=>/gewitter|gefrierender_regen/.test(r.w.icon));
 const make=(icon,condition)=>({icon,condition,source:'Ortsprognose · '+hours+' h'});
 if(special.length){const w=special.sort((a,b)=>b.w.rank-a.w.rank)[0].w;return make(w.icon,w.condition)}
 const amount=Number.isFinite(total)?total:NaN,thresholds=iconRainThresholds[hours]||iconRainThresholds[6];
 if(Number.isFinite(amount)&&amount>=thresholds[0]){
  const peak=Math.max(0,...wet.map(r=>r.hours>0?r.amount/r.hours:0)),tier=Math.max(thresholds.reduce((n,t)=>n+(amount>=t),0),peak>=15?5:iconRainThresholds[1].reduce((n,t)=>n+(peak>=t),0)),phase={rain:0,snow:0,mixed:0};let showers=0,wetHours=0;
  for(const r of wet){const icon=r.w.icon,kind=/schneeregen/.test(icon)?'mixed':/schnee/.test(icon)?'snow':'rain';phase[kind]+=r.amount;wetHours+=r.hours;if(/schauer/.test(icon))showers+=r.amount}
  const kind=phase.snow>0&&phase.snow>=phase.rain&&phase.snow>=phase.mixed?'snow':phase.mixed>0&&phase.mixed>=phase.rain?'mixed':'rain';
  if(kind==='snow')return make(['20_schnee_1','21_schnee_2','22_schnee_3','23_schnee_4','24_schnee_5'][tier-1],'Schneefall');
  if(kind==='mixed')return make('29_schneeregen_2','Schneeregen');
  if(showers>amount*.5&&wetHours<hours*.75)return make(['16_schauer_1','17_schauer_2','18_schauer_3','18_schauer_3','18_schauer_3'][tier-1],['Leichte Regenschauer','Regenschauer','Starke Regenschauer','Sehr starke Regenschauer','Heftige Regenschauer'][tier-1]);
  return make(['11_regen_1','12_regen_2','13_regen_3','14_regen_4','15_regen_5'][tier-1],['Leichter Niederschlag','Niederschlag','Kräftiger Niederschlag','Starker Niederschlag','Sehr starker Niederschlag'][tier-1]);
 }
 if(!Number.isFinite(amount))return valid.length?make(valid.sort((a,b)=>b.hours-a.hours||b.w.rank-a.w.rank)[0].w.icon,'Modellzustand · Niederschlagsmenge nicht verfügbar'):make(null,'Wetterzustand nicht verfügbar');
 const fog=valid.filter(r=>/nebel|dunst/.test(r.w.icon));if(fog.reduce((s,r)=>s+r.hours,0)>=hours/2)return make(fog.sort((a,b)=>b.w.rank-a.w.rank)[0].w.icon,fog[0].w.condition);
 if(!Number.isFinite(cloud))return make(null,'Wetterzustand nicht verfügbar');
 const sky=cloudWeather(cloud,night);return make(sky.icon,sky.condition);
}
const HOUR_MS=3600000,DAY_MS=24*HOUR_MS;
const utcDayStart=t=>Math.floor(t/DAY_MS)*DAY_MS;
const utcTime=(t,opts={})=>new Date(t).toLocaleString('de-DE',{...opts,timeZone:'UTC'});
const utcHour=t=>String(new Date(t).getUTCHours()).padStart(2,'0');
const intervalLabel=(a,b)=>utcHour(a)+'–'+utcHour(b);
const localIntervalLabel=(a,b)=>localTime(a,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})+'–'+localTime(b,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
// Civil days follow Europe/Berlin, including 23/25-hour DST days.
const zoneOffset=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',timeZoneName:'longOffset'});
function localBoundary(t,offset=0,hour=0){
 const [y,m,d]=localDay(t).split('-').map(Number),nominal=Date.UTC(y,m-1,d+offset,hour);let actual=nominal;
 for(let i=0;i<3;i++){const parts=zoneOffset.formatToParts(actual),value=parts.find(p=>p.type==='timeZoneName').value,match=/GMT([+-])(\d\d):(\d\d)/.exec(value);actual=nominal-(match?(match[1]==='-'?-1:1)*(+match[2]*60 + +match[3])*60000:0);}
 return actual;
}
function dailyBoundaries(now,offset){return [0,6,12,18,24].map(h=>localBoundary(now,offset,h));}
const frameAt=(d,point,time)=>{
 const run=Date.parse(d.run),step=d.hours[1],h=(time-run)/HOUR_MS,lo=Math.floor(h/step)*step,hi=Math.ceil(h/step)*step;
 if(!d.hours.includes(lo)||!d.hours.includes(hi))return null;
 const native=hour=>({d,point,hour,time:run+hour*HOUR_MS});
 if(lo===hi)return native(lo);
 return {d,point,time,interpolated:true,before:native(lo),after:native(hi),fraction:(h-lo)/(hi-lo)};
};
function forecastCandidates(start,end,now,point=null){
 return forecastPriority.flatMap(model=>{
  if(model==='ICON-D2'&&end>now+48*HOUR_MS)return [];
  const available=locationRuns(model,point).filter(d=>Date.parse(d.run)<=start&&Date.parse(d.run)+d.hours.at(-1)*HOUR_MS>=end);
  // Prefer the most recent eligible run; hourly resolution breaks same-run ties.
  return available.sort((a,b)=>Date.parse(b.run)-Date.parse(a.run)||a.hours[1]-b.hours[1]);
 });
}
// Fresh snowfall is an interval accumulation, never a change in snow cover.
// Snow water (mm) is converted to fresh snow (cm) with a deliberately rough
// temperature-dependent ratio; settling, melting and crystal type are uncertain.
function newSnowInterval(r){
 const f=r.frame,b=r.before||{...f,hour:f?.hour-r.hours,time:r.start};
 if(!f?.d||b.d!==f.d||!(r.hours>0))return NaN;
 const delta=id=>{const a=frameVal(b,id),z=frameVal(f,id);return a>=0&&z>=0&&z-a>=-.05?Math.max(0,z-a):NaN};
 const total=delta('snowWaterTotal'),components=delta('snowGspTotal')+delta('snowConTotal');
 let water=Number.isFinite(total)?total:components;
 if(!Number.isFinite(water)){
  if(r.amount===0)return 0;
  if(!Number.isFinite(r.amount)||r.amount<0)return NaN;
  const ww=frameVal(f,'ww'),type=frameVal(f,'ptype');
  if([68,69,83,84].includes(ww)||type===7)return NaN;
  if([70,71,72,73,74,75,77,85,86].includes(ww))water=r.amount;
  else if(ww>=50&&ww<=67||[80,81,82].includes(ww))return 0;
  else if(type===5||type===6)water=r.amount;
  else if([1,3,8,12].includes(type))return 0;
  else return NaN; // mixed/unknown phase: no invented snow fraction
 }
 if(water===0)return 0;
 const temps=[frameVal(b,'temp2'),frameVal(f,'temp2')].filter(Number.isFinite);
 if(!temps.length)return NaN;
 const t=temps.reduce((s,v)=>s+v,0)/temps.length;
 const ratio=Math.max(4,Math.min(16,7-t*1.2)); // e.g. wet 7:1 at 0°C
 return water*ratio/10;
}
function sumFreshSnow(values){return values.length&&values.every(Number.isFinite)?values.reduce((s,v)=>s+v,0):NaN}
function hourlyNewSnowWindow(hours,start,end){
 let cursor=start,sum=0;
 for(const h of hours){const a=Math.max(start,h.start),b=Math.min(end,h.end);if(b<=a)continue;
  if(a!==cursor||!Number.isFinite(h.newSnow))return NaN;
  sum+=h.newSnow*(b-a)/(h.end-h.start);cursor=b;
 }
 return cursor===end&&end>start?sum:NaN;
}
function periodNewSnow(p){
 if(!p)return NaN;
 if(p.periods?.length)return sumFreshSnow(p.periods.map(periodNewSnow));
 if(p.members?.length){const vals=p.members.map(periodNewSnow).filter(Number.isFinite);return sumFreshSnow(vals)/vals.length;}
 if(p.localHours?.length===(p.end-p.start)/HOUR_MS){const total=sumFreshSnow(p.localHours.map(h=>h.newSnow));if(Number.isFinite(total))return total;}
 const intervals=p.nativeIntervals||[],start=p.start,end=p.end;
 let cursor=start,sum=0;
 for(const r of intervals){const a=Math.max(start,r.start),b=Math.min(end,r.end);if(b<=a)continue;
  if(a!==cursor)return NaN;const v=newSnowInterval(r);if(!Number.isFinite(v))return NaN;
  sum+=v*(b-a)/(r.end-r.start);cursor=b;
 }
 return cursor===end&&end>start?sum:NaN;
}
// Display buckets are rounded amount classes, not statistical confidence intervals.
const precipBands=[0,1,2,5,10,20,50,100,150,200,300,500,1000];
function quantityRange(lo,hi=lo,unit='mm'){
 if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo<0||hi<lo)return 'Menge unklar';
 if(hi===0)return '0 '+unit;
 const lower=v=>v>=1000?Math.floor(v/100)*100:precipBands.filter(x=>x<=v).at(-1);
 const upper=(v,point)=>v>=1000?(point?Math.floor(v/100)+1:Math.ceil(v/100))*100:precipBands.find(x=>point?x>v:x>=v);
 return localFormat(lower(lo))+'–'+localFormat(upper(hi,lo===hi))+' '+unit;
}
function addSnowBounds(values){return values.length&&values.every(v=>v&&v.every(Number.isFinite))?[values.reduce((s,v)=>s+v[0],0),values.reduce((s,v)=>s+v[1],0)]:null;}
function hourlySnowBoundsWindow(hours,start,end){
 let cursor=start,lo=0,hi=0;
 for(const h of hours){const a=Math.max(start,h.start),b=Math.min(end,h.end);if(b<=a)continue;const v=periodNewSnowBounds(h);
  if(a!==cursor||!v)return null;const fraction=(b-a)/(h.end-h.start);lo+=v[0]*fraction;hi+=v[1]*fraction;cursor=b;
 }
 return cursor===end&&end>start?[lo,hi]:null;
}
function periodNewSnowBounds(p){
 if(!p)return null;
 if(p.newSnowBounds)return p.newSnowBounds;
 if(Number.isFinite(p.newSnow))return [p.newSnow,p.newSnow];
 if(p.periods?.length){const total=addSnowBounds(p.periods.map(periodNewSnowBounds));if(total)return total;}
 if(p.members?.length){const members=p.members.map(periodNewSnowBounds).filter(Boolean);if(members.length){const total=addSnowBounds(members);return total.map(v=>v/members.length);}}
 if(p.localHours?.length===(p.end-p.start)/HOUR_MS){const total=addSnowBounds(p.localHours.map(periodNewSnowBounds));if(total)return total;}
 let cursor=p.start,lo=0,hi=0;
 for(const r of p.nativeIntervals||[]){const a=Math.max(p.start,r.start),b=Math.min(p.end,r.end);if(b<=a)continue;
  if(a!==cursor)break;
  const v=newSnowInterval(r),fraction=(b-a)/(r.end-r.start);
  if(Number.isFinite(v)){lo+=v*fraction;hi+=v*fraction;}
  else if(Number.isFinite(r.amount)&&r.amount>=0){hi+=r.amount*1.6*fraction;}
  else break;
  cursor=b;
 }
 if(cursor===p.end&&p.end>p.start)return [lo,hi];
 // If only the total precipitation is known, show a conservative possible
 // amount class rather than treating unknown snow phase as zero snowfall.
 return Number.isFinite(p.rain)&&p.rain>=0?[0,p.rain*1.6]:null;
}
function snowfallText(cm){const bounds=Array.isArray(cm)?cm:[cm,cm];return quantityRange(bounds[0],bounds[1],'cm');}
function snowfallRangeText(p){const bounds=periodNewSnowBounds(p);return bounds?snowfallText(bounds):'Menge unklar';}
function forecastPrecipText(p,hours='',compact=false){
 const bounds=periodNewSnowBounds(p),snowIcon=/schnee/.test(p.weather?.icon||'')&&!/nebel/.test(p.weather?.icon||'');
 return bounds?.[0]>0||snowIcon?snowfallRangeText(p)+(compact?'<small class="snow-label">Neuschnee</small>':' Neuschnee')+hours:quantityRange(p.rain)+hours;
}
function forecastPeriod(point,start,now,end=start+6*HOUR_MS,preferred=null,exactHourly=false){
 const candidates=(preferred?[preferred]:forecastCandidates(start,end,now,point)).filter(d=>!exactHourly||d.hours[1]===1),duration=(end-start)/HOUR_MS;
 const nativeCoverage=d=>{const run=Date.parse(d.run),step=d.hours[1],lo=Math.floor((start-run)/HOUR_MS/step)*step,hi=Math.ceil((end-run)/HOUR_MS/step)*step;return (end<=now||now-run<=modelAgeLimit(d.model)*HOUR_MS)&&d.hours.filter(h=>h>=lo&&h<=hi).every(h=>Number.isFinite(nativeTemperatureValue(d,point,h,'temp2'))&&nativeTemperatureValue(d,point,h,'temp2')!==null);};
 // Keep the local model hierarchy ahead of global resolution. Only fresh
 // forecast cycles may outrank an archive; D2/EU are preferred for 0–48 h.
 candidates.sort((a,b)=>{const fresh=d=>end<=now||now-Date.parse(d.run)<=modelAgeLimit(d.model)*HOUR_MS;return Number(fresh(b))-Number(fresh(a))||forecastPriority.indexOf(a.model)-forecastPriority.indexOf(b.model)||Number(nativeCoverage(b))-Number(nativeCoverage(a))||Date.parse(b.run)-Date.parse(a.run)||a.hours[1]-b.hours[1]});
 let fallback=null;
 for(const d of candidates){
  const run=Date.parse(d.run),a=(start-run)/HOUR_MS,b=(end-run)/HOUR_MS,step=d.hours[1];
  const first=frameAt(d,point,start),last=frameAt(d,point,end);
  if(!first||!last)continue;
  const native=d.hours.filter(h=>h>=Math.floor(a/step)*step&&h<=Math.ceil(b/step)*step).map(hour=>({d,hour,time:run+hour*HOUR_MS,point}));
  const rows=[first,...native.filter(f=>f.time>start&&f.time<end),last];
  if(!rows.every(f=>Number.isFinite(frameVal(f,'temp2'))))continue;
  const nativeIntervals=native.slice(1).map((frame,i)=>{const delta=frameVal(frame,'rainTotal')-frameVal(native[i],'rainTotal');return {frame,before:native[i],start:native[i].time,end:frame.time,hours:step,amount:delta>=-.5?Math.max(0,delta):NaN}});
  const intervals=nativeIntervals.map(r=>{const s=Math.max(start,r.start),e=Math.min(end,r.end),hours=(e-s)/HOUR_MS;return {...r,start:s,end:e,hours,amount:r.amount*hours/r.hours,estimated:hours!==r.hours}}).filter(r=>r.hours>0);
  const rain=intervals.map(r=>r.amount);
  const mean=id=>{const vals=rows.map(f=>frameVal(f,id));return vals.every(Number.isFinite)?vals.slice(1).reduce((sum,v,i)=>sum+(v+vals[i])/2*(rows[i+1].time-rows[i].time),0)/(end-start):NaN};
  const extreme=(id,op)=>{const vals=(id==='gust'?nativeIntervals.map(r=>r.frame):rows).map(f=>frameVal(f,id));return vals.length&&vals.every(Number.isFinite)?op(...vals):NaN};
  // DWD extrema accumulate within six-hour forecast windows, then reset.
  // Only use a whole covered interval or a new record within the window;
  // an older low from outside the local period must not leak into this one.
  const records=(id,cmp,strict=false)=>d.extremaWindowHours===6?nativeIntervals.map((r,i)=>{
   if(r.start<start||r.end>end)return NaN;
   const f=r.frame,prev=native[i],windowStart=Math.floor((f.hour-1)/6)*6;
   if(prev.hour<windowStart)return NaN;
   const read=(f,key)=>strict?nativeTemperatureValue(f.d,point,f.hour,key):frameVal(f,key);
   const before=read(prev,prev.hour===windowStart?'temp2':id),after=read(f,id);
   return Number.isFinite(before)&&Number.isFinite(after)&&(prev.hour===windowStart||cmp(after,before))?after:NaN;
  }):[];
  const recordLows=records('tmin',(a,b)=>a<b-.05),recordHighs=records('tmax',(a,b)=>a>b+.05);
  const minimum=[extreme('temp2',Math.min),...recordLows].filter(Number.isFinite),maximum=[extreme('temp2',Math.max),...recordHighs].filter(Number.isFinite);
  const actual=native.filter(f=>f.time>=start&&f.time<end),actualValues=actual.map(f=>nativeTemperatureValue(f.d,point,f.hour,'temp2')),nativeComplete=(end<=now||now-run<=modelAgeLimit(d.model)*HOUR_MS)&&actual.length>0&&actualValues.every(v=>v!==null&&Number.isFinite(v));
  const originalLo=nativeComplete?Math.min(...actualValues,...records('tmin',(a,b)=>a<b-.05,true).filter(Number.isFinite)):NaN,originalHi=nativeComplete?Math.max(...actualValues,...records('tmax',(a,b)=>a>b+.05,true).filter(Number.isFinite)):NaN,originalMean=nativeComplete?actualValues.reduce((s,v)=>s+v,0)/actualValues.length:NaN;
  const extremaComplete=recordLows.length>0&&recordLows.every(Number.isFinite)&&recordHighs.every(Number.isFinite);
  const result={start,end,duration,rows,intervals,nativeIntervals,step,model:d.model,data:d,raster:temperatureRaster(d,point),temperatureNative:nativeComplete,originalLo,originalHi,originalMean,rainEstimated:intervals.some(r=>r.estimated),temperatureEstimated:step>1,extremaComplete,rain:intervals.length&&Math.abs(intervals.reduce((s,r)=>s+r.hours,0)-duration)<1e-6&&rain.every(Number.isFinite)?rain.reduce((a,b)=>a+b,0):NaN,mean:mean('temp2'),lo:Math.min(...minimum),hi:Math.max(...maximum),wind:mean('wind'),gust:extreme('gust',Math.max),slp:mean('slp'),cloud:mean('cloud'),snow:extreme('snowdepth',Math.max),representative:dailyWeatherFrame(native.slice(1))};
  result.weather=forecastIcon(intervals,result.rain,duration,result.cloud,isNightAt((start+end)/2,point));
  if(Number.isFinite(result.rain))return result;
  fallback??=result;
 }
 // When a period crosses a model initialization, sum nonoverlapping amounts
 // from complete hourly intervals, never subtract totals from different runs.
 if(!preferred&&!exactHourly&&duration>1&&Number.isInteger(duration)){
  const parts=Array.from({length:duration},(_,i)=>forecastPeriod(point,start+i*HOUR_MS,now,start+(i+1)*HOUR_MS,null,true));
  if(parts.every(p=>Number.isFinite(p.rain))){const all=(id,fn)=>{const a=parts.map(p=>p[id]);return a.every(Number.isFinite)?fn(a):NaN},sum=a=>a.reduce((s,v)=>s+v,0),mean=a=>sum(a)/a.length,intervals=parts.flatMap(p=>p.intervals),rows=[parts[0].rows[0],...parts.map(p=>p.rows.at(-1))],rain=sum(parts.map(p=>p.rain)),cloud=all('cloud',mean);return {...fallback,start,end,duration,rows,intervals,nativeIntervals:parts.flatMap(p=>p.nativeIntervals),step:1,data:null,model:[...new Set(parts.map(p=>p.model))].join(' / '),raster:'Stundenintervalle · Modellläufe',temperatureNative:parts.every(p=>p.temperatureNative),originalLo:all('originalLo',a=>Math.min(...a)),originalHi:all('originalHi',a=>Math.max(...a)),originalMean:all('originalMean',mean),rainEstimated:false,rain,mean:all('mean',mean),lo:all('lo',a=>Math.min(...a)),hi:all('hi',a=>Math.max(...a)),wind:all('wind',mean),gust:all('gust',a=>Math.max(...a)),slp:all('slp',mean),cloud,snow:all('snow',a=>Math.max(...a)),weather:forecastIcon(intervals,rain,duration,cloud),representative:dailyWeatherFrame(rows)};}
 }
 return fallback||{start,end,duration,rows:[],rain:NaN,mean:NaN};
}
const periodDisplay=(p,id)=>{if(p?.temperatureHours&&['lo','hi','mean'].includes(id))return p[id]??NaN;const orig=p?.['original'+id[0].toUpperCase()+id.slice(1)];return Number.isFinite(orig)?orig:p?.[id]??NaN};
function consensusPeriod(point,start,now,end){
 const primary=forecastPeriod(point,start,now,end);if(start<now+48*HOUR_MS)return primary;
 const candidates=forecastCandidates(start,end,now,point).filter(d=>now-Date.parse(d.run)<=modelAgeLimit(d.model)*HOUR_MS),members=[],families=new Set();
 for(const d of candidates){const family=modelProvider(d.model);if(families.has(family))continue;const p=forecastPeriod(point,start,now,end,d);if(!Number.isFinite(p.rain)||!Number.isFinite(periodDisplay(p,'mean')))continue;families.add(family);members.push(p)}
 if(members.length<2)return primary;
 const mean=id=>{const vals=members.map(p=>['lo','hi','mean'].includes(id)?periodDisplay(p,id):p[id]).filter(Number.isFinite);return vals.length?vals.reduce((s,v)=>s+v,0)/vals.length:NaN};
 const rain=mean('rain'),cloud=mean('cloud'),wettest=[...members].sort((a,b)=>b.rain-a.rain)[0];
 return {...primary,blended:true,model:members.map(p=>p.model).join(' + '),raster:'Ortsbezogenes Modellmittel',temperatureNative:false,originalLo:NaN,originalHi:NaN,originalMean:NaN,lo:mean('lo'),hi:mean('hi'),mean:mean('mean'),rain,cloud,wind:mean('wind'),gust:mean('gust'),slp:mean('slp'),snow:mean('snow'),rainEstimated:members.some(p=>p.rainEstimated),temperatureEstimated:true,weather:forecastIcon(wettest.intervals,rain,primary.duration,cloud,isNightAt((start+end)/2,point)),intervals:wettest.intervals,members};
}
// One hourly precipitation timeline for all home-page summaries. RV replaces
// only its valid future minutes; the remainder retains its model amount.
function localPrecipitationHour(point,start,now,block=null,current=null){
 const end=start+HOUR_MS,exact=point?forecastPeriod(point,start,now,end,null,true):null,p=Number.isFinite(exact?.rain)?exact:point?forecastPeriod(point,start,now,end):block;
 const f=p?.data?frameAt(p.data,point,end):p?.rows?.at(-1)||null,modelRain=p?.step===1&&Number.isFinite(p.rain)?p.rain:NaN;
 const coarse=p?.nativeIntervals?.find(r=>start>=r.start&&end<=r.end),model=Number.isFinite(modelRain)?modelRain:NaN;
 const rv=radarForecastRows(radarNowcastData,point,now),segments=[];let cursor=start;
 const ledger=typeof WeatherObservation!=='undefined'&&point;
 const addModel=(s,e)=>{if(e>s)segments.push({start:s,end:e,amount:model*(e-s)/HOUR_MS,source:'Modell'});};
 // Elapsed minutes are never filled by a forecast. Preserve observation
 // gaps explicitly, and combine only disjoint measured/future intervals.
 if(ledger&&start<now){const pastEnd=Math.min(end,now),obs=WeatherObservation.observedIntervals(point,start,pastEnd);
  for(const r of obs){if(r.start>cursor)segments.push({start:cursor,end:r.start,amount:NaN,source:'Beobachtung fehlt'});segments.push(r);cursor=r.end;}
  if(cursor<pastEnd)segments.push({start:cursor,end:pastEnd,amount:NaN,source:'Beobachtung fehlt'});cursor=pastEnd;
 }
 for(const r of rv){const s=Math.max(start,now,r.start),e=Math.min(end,r.end);if(e<=s)continue;addModel(cursor,s);segments.push({start:s,end:e,amount:r.amount*(e-s)/(r.end-r.start),source:r.source});cursor=e;}
 addModel(cursor,end);const rain=segments.every(r=>Number.isFinite(r.amount))?segments.reduce((sum,r)=>sum+r.amount,0):NaN,radarUsed=segments.some(r=>r.source==='DWD RV');
 let weather=Number.isFinite(rain)?forecastIcon(f&&(!radarUsed||rain>=.1)?[{frame:f,amount:rain,hours:1}]:[],rain,1,frameVal(f,'cloud'),isNightAt((start+end)/2,point)):frameWeather(f);
 if(!Number.isFinite(rain)&&p?.step>1&&coarse){weather=forecastIcon([coarse],coarse.amount,coarse.hours,frameVal(f,'cloud'),isNightAt((start+end)/2,point));weather={...weather,source:'Modellintervall '+coarse.hours+' h · keine stündlich aufgelöste Niederschlagszeit'};}
 const rainSource=ledger&&start<now?'RADOLAN · Beobachtung + Restprognose':radarUsed?(segments.every(r=>r.source==='DWD RV')?'DWD RV · Radarprognose':'DWD RV + Modell'):'Modell';
 if(radarUsed&&Number.isFinite(rain))weather={...weather,source:rainSource};
 const temperature=ledger&&end<=now?WeatherObservation.temperatureAt(point,observationHeight(point),end):frameVal(f,'temp2');
 return applyCurrentHour({start,end,frame:f,temperature,observed:!!ledger&&end<=now,rain,newSnow:periodNewSnow(p),newSnowBounds:periodNewSnowBounds(p),weather,model:p?.model,step:p?.step,raster:p?.raster,rainSource,radarUsed,segments},current);
}
// Only the running hour represents the current state. Future hourly endpoints
// remain forecasts; instantaneous radar rates are never treated as hour totals.
function applyCurrentHour(h,current){
 if(!current||h.start!==current.start)return h;
 const sample=current.temperature,valid=['observation','analysis','estimate'].includes(sample?.kind)&&Number.isFinite(sample.value);
 return {...h,temperature:valid?sample.value:h.temperature,temperatureSample:valid?sample:null,currentHour:true,currentSamples:current.live||null,weather:current.weather,observedRate:current.rate};
}
function periodHourTemperature(p,point,start){
 const end=start+HOUR_MS;
 if(p.members?.length){
  const values=p.members.map(m=>periodHourTemperature(m,point,start));
  return values.every(Number.isFinite)?values.reduce((a,b)=>a+b,0)/values.length:NaN;
 }
 const frame=p.data?frameAt(p.data,point,end):p.rows?.find(f=>f.time===end);
 return frameVal(frame,'temp2');
}
function summarizeTemperatureHours(hours){
 const values=hours.map(h=>h.temperature);
 if(!values.length||!values.every(Number.isFinite))return {lo:NaN,hi:NaN,mean:NaN,minHour:null,maxHour:null};
 const lo=Math.min(...values),hi=Math.max(...values);
 return {lo,hi,mean:values.reduce((a,b)=>a+b,0)/values.length,minHour:hours.find(h=>h.temperature===lo),maxHour:hours.find(h=>h.temperature===hi)};
}
function harmonizeLocalPeriod(p,point,now,current=null){
 const first=Math.floor(now/HOUR_MS)*HOUR_MS,ledger=typeof WeatherObservation!=='undefined'&&point&&p.start>=dailyBoundaries(now,0)[0];if((p.end<=first&&!ledger)||p.start>=first+24*HOUR_MS||!Number.isInteger(p.duration))return p;
 const localHours=Array.from({length:p.duration},(_,i)=>localPrecipitationHour(point,p.start+i*HOUR_MS,now,p,current));
 if(!localHours.every(h=>Number.isFinite(h.rain))){const radarUsed=localHours.some(h=>h.radarUsed);return {...p,localHours,radarUsed,...(radarUsed||ledger&&p.start<now?{rain:NaN}: {})};}
 const rain=localHours.reduce((sum,h)=>sum+h.rain,0),intervals=localHours.map(h=>({frame:h.frame,start:h.start,end:h.end,hours:1,amount:h.rain})),radarUsed=localHours.some(h=>h.radarUsed);
 return {...p,localHours,rain,intervals,radarUsed,rainEstimated:false,weather:forecastIcon(intervals,rain,p.duration,p.cloud,isNightAt((p.start+p.end)/2,point))};
}
function harmonizePeriodTemperature(p,point){
 const temperatureHours=p.localHours||Array.from({length:p.duration},(_,i)=>{const start=p.start+i*HOUR_MS;return {start,end:start+HOUR_MS,temperature:periodHourTemperature(p,point,start)};});
 return {...p,temperatureHours,...summarizeTemperatureHours(temperatureHours)};
}
function hourlyRainWindow(hours,start,end){
 let cursor=start,sum=0;for(const h of hours)for(const r of h.segments||[]){const a=Math.max(start,r.start),b=Math.min(end,r.end);if(b<=a)continue;if(a!==cursor||!Number.isFinite(r.amount))return NaN;sum+=r.amount*(b-a)/(r.end-r.start);cursor=b;}return cursor===end?sum:NaN;
}
function forecastDay(point,start,now,boundaries=[0,9,12,18,24].map(h=>start+h*HOUR_MS),current=null){
 const periods=Array.from({length:4},(_,i)=>harmonizePeriodTemperature(harmonizeLocalPeriod(consensusPeriod(point,boundaries[i],now,boundaries[i+1]),point,now,current),point)),end=boundaries[4],duration=(end-start)/HOUR_MS;
 const all=(id,fn)=>{const a=periods.map(p=>p[id]);return a.every(Number.isFinite)?fn(a):NaN};
 const sum=a=>a.reduce((x,y)=>x+y,0),mean=a=>sum(a.map((v,i)=>v*periods[i].duration))/duration;
 const rows=periods.flatMap(p=>p.rows.slice(1));
 const intervals=periods.flatMap(p=>p.intervals||[]),rain=all('rain',sum),cloud=all('cloud',mean);
 const temperatureHours=periods.flatMap(p=>p.temperatureHours);
 return {start,end,duration,periods,rows,intervals,rain,temperatureHours,...summarizeTemperatureHours(temperatureHours),blended:periods.some(p=>p.blended),rainEstimated:periods.some(p=>p.rainEstimated),temperatureEstimated:periods.some(p=>p.temperatureEstimated),temperatureNative:periods.every(p=>p.temperatureNative),originalLo:all('originalLo',a=>Math.min(...a)),originalHi:all('originalHi',a=>Math.max(...a)),wind:all('wind',mean),gust:all('gust',a=>Math.max(...a)),slp:all('slp',mean),cloud,snow:all('snow',a=>Math.max(...a)),weather:forecastIcon(intervals,rain,duration,cloud),representative:dailyWeatherFrame(rows)};
}
// The public low/high pair is the preceding night's minimum and the daytime
// maximum, not the extrema of the calendar day. The evening leads into the
// next night's minimum; precipitation and warnings retain calendar intervals.
// Today's high uses observations/analyses from the full local calendar day
// so far (00:00 onward). Only pending 09–18 daytime hours use forecasts.
// No already-elapsed hour, or evening forecast, can raise an observed high.
function todayDaytimeExtremes(day,point,height,now,current=null){
 const start=day.periods[1]?.start,end=day.periods[2]?.end;
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return {lo:NaN,hi:NaN,minHour:null,maxHour:null,observedCount:0,futureCount:0,history:[]};
 const history=now>day.start?[...(WeatherObservation.localTemperatureSeries?.(point,height,day.start,Math.min(now,day.end))||[])]:[];
 const sample=current?.temperature,time=sample?.time;
 if(['observation','analysis','estimate'].includes(sample?.kind)&&Number.isFinite(sample.value)&&Number.isFinite(time)&&time>=day.start&&time<=Math.min(now,day.end)&&(/Originalzelle|Flächenanalyse|Messstation/.test(sample.source||''))&&!history.some(r=>r.time===time&&Math.abs(r.temperature-sample.value)<.01)){
  history.push({time,temperature:sample.value,source:sample.source,kind:sample.kind});
 }
 const currentHourStart=Math.floor(now/HOUR_MS)*HOUR_MS;
 const remaining=day.temperatureHours.filter(h=>h.start>=start&&h.end<=end&&h.end>now&&h.start>=currentHourStart&&!h.currentHour);
 const extrema=WeatherObservation.combineDayTemperature(history,remaining,now);
 // A snapshot at 20:00 cannot prove a 24-hour maximum. Never report a
 // spurious exact value from one station/interpolation or late RUC snapshot.
 const observedSpan=history.length?Math.max(...history.map(x=>x.time))-Math.min(...history.map(x=>x.time)):0;
 const reliable=history.length>=3&&observedSpan>=6*HOUR_MS&&history.some(x=>x.time>=start&&x.time<end);
 if(now>=end&&!reliable)return {...extrema,hi:NaN,maxHour:null,futureCount:0,history,incomplete:true};
 return {...extrema,futureCount:remaining.length,history,incomplete:false};
}
function forecastCalendarDays(point,now,current=null){
 const days=Array.from({length:7},(_,i)=>{const b=dailyBoundaries(now,i);return forecastDay(point,b[0],now,b,current)});
 for(let i=0;i<days.length;i++){
  const d=days[i],nightHours=d.periods[0].temperatureHours;
  const available=nightHours.filter(h=>Number.isFinite(h.temperature)),night={start:d.periods[0].start,end:d.periods[0].end,complete:available.length===nightHours.length,...summarizeTemperatureHours(available),source:'forecast'};
  const daytime=summarizeTemperatureHours(d.periods.slice(1,3).flatMap(p=>p.temperatureHours));
  d.night=night;d.lo=night.lo;d.minHour=night.minHour;d.hi=daytime.hi;d.maxHour=daytime.maxHour;
 }
 if(typeof WeatherObservation!=='undefined'&&point){
 const d=days[0],height=observationHeight(point),history=WeatherObservation.localTemperatureSeries?.(point,height,d.start,now)||[];
  const extrema=todayDaytimeExtremes(d,point,height,now,current);
  d.hi=extrema.hi;d.maxHour=extrema.maxHour;
  const afternoon=d.periods[2];
  const afternoonHistory=extrema.history.filter(r=>r.time>=afternoon.start&&r.time<afternoon.end);
  const afternoonFuture=afternoon.temperatureHours.filter(h=>h.start>=Math.floor(now/HOUR_MS)*HOUR_MS&&h.end>now&&!h.currentHour);
  const afternoonExtrema=WeatherObservation.combineDayTemperature(afternoonHistory,afternoonFuture,now);
  if(now>=afternoon.start){
   const covered=afternoonHistory.length>=2||afternoonFuture.length>0;
   afternoon.hi=covered&&Number.isFinite(d.hi)&&Number.isFinite(afternoonExtrema.hi)?Math.min(d.hi,afternoonExtrema.hi):NaN;
   afternoon.maxHour=Number.isFinite(afternoon.hi)?afternoonExtrema.maxHour:null;
  }
d.observationCount=extrema.observedCount;d.futureDaytimeCount=extrema.futureCount;d.highIncomplete=extrema.incomplete;
  const nightHistory=WeatherObservation.localTemperatureSeries?.(point,height,d.night.start,Math.min(now,d.night.end))||[],nightFuture=d.periods[0].temperatureHours.filter(h=>h.end>now&&!h.currentHour),night=WeatherObservation.combineDayTemperature(nightHistory,nightFuture,now);
  if(nightHistory.length>=2||nightFuture.length){d.lo=night.lo;d.minHour=night.minHour;d.night={...d.night,lo:night.lo,minHour:night.minHour,complete:nightHistory.length>=2&&nightFuture.every(h=>Number.isFinite(h.temperature)),source:nightHistory.length>=2?'local-observations':'forecast'};}
  const end=Math.floor(now/(5*60000))*5*60000,observed=WeatherObservation.accumulation(point,d.start,end);
  const future=hourlyRainWindow(d.periods.flatMap(p=>p.localHours||[]),now,d.end);
  d.balance={observed:observed.sum,covered:observed.covered,through:observed.through,complete:observed.complete,remaining:future,temperature:extrema,actualHi:history.length?Math.max(...history.map(r=>r.temperature)):NaN,actualLo:history.length?Math.min(...history.map(r=>r.temperature)):NaN};
  // The user sees an actual partial amount and remaining forecast separately
  // if a scan is missing. Never silently substitute old model precipitation.
  d.rain=observed.complete&&Number.isFinite(observed.sum)&&Number.isFinite(future)?observed.sum+future:NaN;
 }
 return days;
}
function upcomingNight(days,now){
 return (now<days[0].night.end?days[0]:days[1]).night;
}
function temperatureExtremeTime(h){
 if(h?.observed&&Number.isFinite(h.start))return ' · '+localTime(h.start,{hour:'2-digit',minute:'2-digit'})+' Uhr · beobachteter Stichprobenwert';
 if(Number.isFinite(h?.time))return ' · '+localTime(h.time,{hour:'2-digit',minute:'2-digit'})+' Uhr · Beobachtungs-/Analysezeit';
 if(Number.isFinite(h?.start)&&Number.isFinite(h?.end))return ' · '+localIntervalLabel(h.start,h.end)+' Uhr';
 return '';
}
function periodTemperature(p,index,day){
 if(index===0)return day.night.lo;
 if(index===2)return p.hi;
 const hour=index===1?9:21,at=localBoundary(p.start,0,hour);
 return p.temperatureHours?.find(h=>h.end===at)?.temperature??NaN;
}
function periodTemperatureLabel(index){return ['Nachtminimum','09:00 Uhr · Modell','Nachmittagsmaximum','21:00 Uhr · Modell'][index];}
function hourlyForecast(days,now,locationPoint=null){
 const periods=days.flatMap(d=>d.periods);
 return Array.from({length:24},(_,i)=>{const start=Math.floor(now/HOUR_MS)*HOUR_MS+i*HOUR_MS,end=start+HOUR_MS,block=periods.find(p=>start>=p.start&&end<=p.end),point=locationPoint||block?.rows?.[0]?.point||periods.find(p=>p.rows?.length)?.rows[0]?.point;
  return block?.localHours?.find(h=>h.start===start)||localPrecipitationHour(point,start,now,block);
 });
}
// Colin's warning system, September 2026: meteorological BASE levels only.
// Do not infer ice accretion, new snow, hail size, floods or impact modifiers
// from unrelated model fields. Exact rolling sums require contiguous intervals.
const warningNames=['','Leicht','Markant','Unwetter','Extrem','Außergewöhnlich'];
const shortRainLimits={1:[15,25,40,60,90],3:[20,35,55,80,120],6:[25,40,65,95,140]};
const longRainLimits={12:[20,30,45,65,90],24:[25,40,60,90,130],48:[35,50,80,120,180],72:[45,65,100,150,220]};
function warningLevel(value,limits){if(!Number.isFinite(value))return 0;return limits.reduce((level,t,i)=>value>t||i<4&&value===t?i+1:level,0)}
function convectionModels(point,start,end,now){
 if(!point)return [];const signals=new Map();
 for(const model of forecastPriority){const family=modelProvider(model);if(signals.has(family))continue;
  const d=locationRuns(model,point).find(d=>Date.parse(d.run)<=start&&now-Date.parse(d.run)<=modelAgeLimit(model)*HOUR_MS&&Date.parse(d.run)+d.hours.at(-1)*HOUR_MS>=end);if(!d)continue;
  const run=Date.parse(d.run),step=d.hours[1];
  if(d.hours.some(h=>{const time=run+h*HOUR_MS;if(time<=start||time>end)return false;const f={d,hour:h,time,point},ww=frameVal(f,'ww'),cape=Math.max(frameVal(f,'mlcape')||0,frameVal(f,'mucape')||0,frameVal(f,'cape')||0),cin=frameVal(f,'mlcin'),prec=frameVal(f,'rainTotal')-frameVal({...f,hour:h-step,time:time-step*HOUR_MS},'rainTotal');return [95,96,99].includes(ww)||(cape>=500&&Number.isFinite(cin)&&Math.abs(cin)<=125&&prec>=.1)}))signals.set(family,model);
 }return [...signals.values()];
}
function frostModelSignals(point,start,end,now){
 const families=new Map();
 for(const model of forecastPriority){const family=modelProvider(model);if(families.has(family))continue;
  const d=locationRuns(model,point).find(d=>Date.parse(d.run)<=start&&now-Date.parse(d.run)<=modelAgeLimit(model)*HOUR_MS&&Date.parse(d.run)+d.hours.at(-1)*HOUR_MS>=end);if(!d)continue;
  const run=Date.parse(d.run),values=d.hours.filter(h=>run+h*HOUR_MS>start&&run+h*HOUR_MS<=end).map(h=>frameVal({d,hour:h,time:run+h*HOUR_MS,point},'temp2')).filter(Number.isFinite);
  if(values.length)families.set(family,{model,value:Math.min(...values)});
 }return [...families.values()];
}
function localWarnings(days,now,elevation=NaN,point=null){
 const raw=days.flatMap(d=>d.periods?d.periods.flatMap(p=>p.nativeIntervals||[]):d.intervals||[]).filter(r=>r.end>now&&!r.estimated&&r.frame?.d&&now-Date.parse(r.frame.d.run)<=modelAgeLimit(r.frame.d.model)*HOUR_MS).sort((a,b)=>a.start-b.start||a.hours-b.hours||Date.parse(b.frame.d.run)-Date.parse(a.frame.d.run));
 const intervals=[],events=[];for(const r of raw)if(!intervals.length||r.start>=intervals.at(-1).end)intervals.push(r);
 const add=(type,level,start,end,value,unit,period,models,note='',state='forecast',range=null)=>{if(level)events.push({type,level:Math.min(level,4),exceptionalCandidate:level===5,start,end,value,unit,period,models,note,state,range})};
 if(point&&typeof liveLocalWeather==='function'){
  const live=liveLocalWeather(null,point,now),s=live.temp2;
  if(['observation','analysis','estimate'].includes(s.kind)&&Number.isFinite(s.value)&&s.value<0)
   add('Luftfrost',warningLevel(-s.value,[0,5,10,20,30]),s.time,now+30*60000,s.value,'°C',0,[s.kind==='observation'?'DWD SYNOP':'Ortsanalyse'],s.source,s.kind==='observation'?'observed':'analysis');
  const fog=typeof WeatherObservation!=='undefined'?WeatherObservation.fogAt(point,elevation,now):null;
  if(fog){
    const observed=fog.state==='observed',v=fog.visibility;
    const level=observed&&Number.isFinite(v)?v<50?3:v<150?2:1:1;
    add(observed?'Nebel':'Nebelpotenzial',level,fog.time,now+30*60000,v,'m',0,[fog.source.startsWith('DWD SYNOP')?'DWD SYNOP':'ICON-D2-RUC'],fog.source+(observed&&Number.isFinite(v)?' · gemessene Sichtweite':' · lokal keine gesicherte Sichtweite; besonders Muldenlagen'),fog.state);
   }
  if(typeof pointRadarAt==='function'&&typeof resolveLivePhase==='function'){
   const radar=pointRadarAt(point,now),phase=resolveLivePhase(point,radar,now);
   if(phase&&[4,5,7].includes(phase.code))add(phase.code===7?'Schneefall':'Gefrierender Niederschlag',1,phase.time,now+15*60000,NaN,'',0,[phase.kind==='ground'?'DWD SYNOP':'HymecNG'],'Aktuelle Niederschlagsanalyse; Menge separat.', 'observed');
  }
 }
 const single=(r,type,level,value,unit)=>add(type,level,r.start,r.end,value,unit,r.hours,[r.frame.d.model]);
 for(const r of intervals){const f=r.frame,g=frameVal(f,'gust'),t=frameVal(f,'temp2'),v=frameVal(f,'visibility'),ww=frameVal(f,'ww');
  // With uncertain height, use the stricter (lower) base threshold and label as provisional.
  single(r,'Sturm / Orkan',warningLevel(g,elevation>=800?[60,80,105,125,155]:[50,70,100,120,150]),g,'km/h');
  if(t<0)single(r,'Luftfrost',warningLevel(-t,[0,5,10,20,30]),t,'°C');
  single(r,'Hitze',Number.isFinite(t)?t>41?5:t>=39?4:t>=37?3:0:0,t,'°C');
  if(Number.isFinite(v)&&v>=0&&v<=.5)add('Nebel',v<.05?3:v<.15?2:1,r.start,r.end,v*1000,'m',r.hours,[f.d.model],'Modellierte Sichtweite, keine bestätigte Messung. Besonders in Muldenlagen lokale Abweichungen möglich.');
  if(!(v>=0&&v<=.25)&&typeof WeatherObservation!=='undefined'&&WeatherObservation.fogPotential(t,frameVal(f,'dew'),frameHumidity(f),frameVal(f,'wind')))add('Nebelpotenzial',1,r.start,r.end,NaN,'',r.hours,[f.d.model],'Taupunkt nahe der 2-m-Temperatur und schwacher Wind; besonders in Muldenlagen. Keine bestätigte Sichtweite.','risk');
  if([95,96,99].includes(ww))single(r,'Gewitterhinweis',1,NaN,'');
  if([56,57,66,67].includes(ww)||[3,12].includes(frameVal(f,'ptype')))single(r,'Hinweis auf gefrierenden Niederschlag',1,NaN,'');
  const ground=frameVal(f,'tground'),recent=intervals.filter(q=>q.end<=r.end&&q.end>=r.start-3*HOUR_MS&&q.amount>=.1);
  const liquid=recent.some(q=>[51,53,55,61,63,65,80,81,82].includes(frameVal(q.frame,'ww'))||frameVal(q.frame,'ptype')===1);
  const snowWet=recent.some(q=>[70,71,72,73,74,75,77,85,86].includes(frameVal(q.frame,'ww'))||[5,6].includes(frameVal(q.frame,'ptype')));
  const rh=frameHumidity(f);
  if(Number.isFinite(ground)&&ground<=0&&(recent.length||rh>=95)){
   const cause=liquid?'Überfrierende Nässe möglich':snowWet?'Schneeglätte möglich':rh>=95?'Reifglätte möglich':'Glätte möglich';
   add('Glättepotenzial',1,r.start,r.end,ground,'°C',r.hours,[f.d.model],cause+' · modellierte Bodentemperatur '+temperatureText(ground)+' °C; Straßentemperatur und tatsächliche Nässe nicht gemessen.','risk');
  }
 }
 // Only a phase-resolved snowfall signal or a positive, quantifiable
 // new-snow amount can create a snowfall forecast. Never publish a bare 0 cm.
 for(const d of days.slice(0,2))for(const p of d.periods||[]){
  if(p.end<=now)continue;
  const iconSnow=/schnee/.test(p.weather?.icon||'')&&!/nebel/.test(p.weather?.icon||'');
  const verifiedSnow=p.localHours?.some(h=>Number.isFinite(h.newSnow)&&h.newSnow>.1)||p.nativeIntervals?.some(r=>newSnowInterval(r)>.1);
  const signal=iconSnow||verifiedSnow;
  const full=periodNewSnowBounds(p);
  const remainder=p.start>=now?full:p.localHours?.length?hourlySnowBoundsWindow(p.localHours,now,p.end):null;
  const span=remainder&&remainder.every(Number.isFinite)&&remainder[0]>=0&&remainder[1]>=remainder[0]?remainder:null;
  if(!signal)continue; // An uncertain rain-only upper bound is not evidence of snow.
  if(span?.[1]>.1){
   const level=span[0]>=20?4:span[0]>=10?3:span[0]>=5?2:1;
   const amount=snowfallText(span);
   add('Schneefall',level,Math.max(now,p.start),p.end,NaN,'cm',p.duration,[p.model||'Modell'],
    'Möglicher Neuschnee '+amount+' für das angegebene Restzeitfenster (modellbasierte Spanne, keine statistische Wahrscheinlichkeit).','forecast',span);
  }else if(signal){
   add('Schneefall',1,Math.max(now,p.start),p.end,NaN,'cm',p.duration,[p.model||'Modell'],
    'Schneefall möglich; Modell liefert keinen belastbar quantifizierbaren Neuschnee. Ein mit 0 cm gerundetes Signal bedeutet nicht zwangsläufig schneefrei.','forecast');
  }
 }
 if(point)for(let start=Math.floor(now/(3*HOUR_MS))*3*HOUR_MS;start<now+48*HOUR_MS;start+=3*HOUR_MS){const end=start+3*HOUR_MS,all=frostModelSignals(point,Math.max(start,now),end,now),wet=all.filter(m=>m.value<0);if(wet.length>=2&&wet.length>all.length/2){const v=wet.find(m=>m.model==='ICON-D2')?.value??wet.map(m=>m.value).sort((a,b)=>a-b)[Math.floor(wet.length/2)];add('Luftfrost',warningLevel(-v,[0,5,10,20,30]),Math.max(start,now),end,v,'°C',3,wet.map(m=>m.model),wet.length+' von '+all.length+' verfügbaren unabhängigen Modellfamilien zeigen Luftfrost.');}}
 if(point)for(const day of days)for(const p of day.periods||[]){if(p.end<=now)continue;const models=convectionModels(point,p.start,p.end,now);if(models.length)add('Gewitterpotenzial',1,Math.max(now,p.start),p.end,NaN,'',p.duration,models,models.length>1?'Mehrere unabhängige Modellfamilien zeigen konvektive Signale.':'Leicht erhöhtes Potenzial: Signal einer Modellfamilie.');}
 const rainAmount=r=>{if(!Number.isFinite(r.amount))return NaN;if(r.amount===0)return 0;const f=r.frame,w=frameWeather(f,true),t=frameVal(f,'temp2'),ww=frameVal(f,'ww'),ptype=frameVal(f,'ptype');if(/schnee|gefrierender_regen/.test(w.icon||'')||[5,6,7,8,3,12].includes(ptype))return NaN;return [51,53,55,61,63,65,80,81,82,95,96,99].includes(ww)||ptype===1||t>2?r.amount:NaN};
 const rainfall=intervals.map(rainAmount);
 for(const [type,matrix] of [['Starkregen',shortRainLimits],['Dauerregen',longRainLimits]])for(const [h,limits] of Object.entries(matrix))for(let i=0;i<intervals.length;i++){
  const start=intervals[i].start,target=start+Number(h)*HOUR_MS;let end=start,sum=0;const models=new Set();
  for(let j=i;j<intervals.length&&end<target;j++){const r=intervals[j],a=rainfall[j];if(r.start!==end||r.end>target||!Number.isFinite(a))break;sum+=a;end=r.end;models.add(r.frame.d.model)}
  if(end===target)add(type,warningLevel(sum,limits),start,end,sum,'mm',Number(h),[...models]);
 }
 // Merge overlapping windows of the same hazard, keeping the peak basis level
 // and the exact triggering metric/interval. Never propagate a point warning regionally.
 const merged=[];for(const e of events.sort((a,b)=>a.type.localeCompare(b.type)||a.state.localeCompare(b.state)||a.start-b.start||b.level-a.level)){
  const p=merged.at(-1);if(p&&p.type===e.type&&p.state===e.state&&e.start<=p.end){const contiguous=p.end===e.start;p.end=Math.max(p.end,e.end);if(e.type==='Schneefall'){if(contiguous&&p.range&&e.range)p.range=[p.range[0]+e.range[0],p.range[1]+e.range[1]];else p.range=null;}if(e.level>p.level||(e.level===p.level&&Number.isFinite(e.value)&&(!Number.isFinite(p.value)||(['Luftfrost','Nebel','Glättepotenzial'].includes(e.type)?e.value<p.value:e.value>p.value)))||(e.type==='Gewitterpotenzial'&&e.models.length>p.models.length)){Object.assign(p,{level:e.level,value:e.value,unit:e.unit,period:e.period,models:e.models,note:e.note,exceptionalCandidate:e.exceptionalCandidate,peakStart:e.start,peakEnd:e.end})}}
  else merged.push({...e,peakStart:e.start,peakEnd:e.end});
 }return merged.filter(e=>e.start<=now+48*HOUR_MS).sort((a,b)=>b.level-a.level||Number(b.state!=='forecast')-Number(a.state!=='forecast')||a.start-b.start);
}
async function fetchHourlyModel(model){
 if(hourlyModelRequests.has(model))return hourlyModelRequests.get(model);
 const file=realModelFiles[model]+'-hourly.json.gz',task=(async()=>{
  const meta=await snapshotMetadata(realModelFiles[model]+'-hourly'),old=hourlyModelCache.get(model)?.[0];if(meta&&old&&!newerSnapshot(meta,old))return;
  for(const url of [dataRoot+file,'data/'+file])try{
   const c=new AbortController(),timer=setTimeout(()=>c.abort(),60000);let payload;
   try{const res=await fetch(url+(meta&&url.startsWith(dataRoot)?'?v='+encodeURIComponent(meta.generated):''),{signal:c.signal,cache:'no-store',credentials:'omit'});if(!res.ok)continue;const raw=await res.arrayBuffer(),b=new Uint8Array(raw);payload=b[0]===31&&b[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(raw))}finally{clearTimeout(timer)}
   if(payload.schema!==1||!Array.isArray(payload.runs)||!payload.runs.length)continue;
   const runs=payload.runs.map(d=>validateRealData(d,model)).filter(d=>d.hours[1]===1).sort((a,b)=>Date.parse(b.run)-Date.parse(a.run));if(!runs.length)continue;
   if(meta&&url.startsWith(dataRoot)&&newerSnapshot(meta,runs[0]))continue;
   if(newerSnapshot(runs[0],old)){hourlyModelCache.set(model,runs);if(weatherRealEnabled&&activePage==='weather')renderWeather();else if(weatherRealEnabled&&activePage==='warnings')renderLocalWarnings()}return;
  }catch{}
 })();hourlyModelRequests.set(model,task);try{await task}finally{hourlyModelRequests.delete(model)}
}
async function fetchD2LegacyTemperature(point){
 if(!point)return;
 const root='icon-d2-temperature/';
 if(Date.now()-nativeTemperatureCheck>5*60000){
  if(!nativeTemperatureRequest){nativeTemperatureCheck=Date.now();nativeTemperatureRequests.clear();nativeTemperatureRequest=(async()=>{for(const prefix of [dataRoot,'data/'])try{
   const r=await fetch(prefix+root+'index.json?t='+Math.floor(Date.now()/60000),{signal:AbortSignal.timeout(8000),cache:'no-store'});if(!r.ok)continue;
   const m=await r.json(),g=m.grid;if(m.schema!==1||m.model!=='ICON-D2'||!Number.isFinite(Date.parse(m.run))||!Number.isFinite(Date.parse(m.generated))||!g||![g.west,g.south,g.dx,g.dy].every(Number.isFinite)||g.dx<=0||g.dy<=0||![g.nx,g.ny,m.tileSize].every(n=>Number.isInteger(n)&&n>0)||g.nx*g.ny>1000000||m.tileSize>200||!Array.isArray(m.hours)||!m.hours.every((h,i)=>h===i))continue;
   if(newerSnapshot(m,nativeTemperatureMeta)){nativeTemperatureMeta=m;nativeTemperatureTiles.clear();nativeTemperatureRequests.clear()}return;
  }catch{}})().finally(()=>{nativeTemperatureRequest=null});}
 }
 if(nativeTemperatureRequest)await nativeTemperatureRequest;
 const meta=nativeTemperatureMeta,cell=nativeTemperatureCell(point,meta);if(!cell||nativeTemperatureTiles.has(cell.key)||nativeTemperatureRequests.has(cell.key))return;
 const task=(async()=>{for(const prefix of [dataRoot,'data/'])try{
  const r=await fetch(prefix+root+cell.key+'.json.gz?v='+encodeURIComponent(meta.generated),{signal:AbortSignal.timeout(30000),cache:'no-store'});if(!r.ok)continue;
  const raw=await r.arrayBuffer(),b=new Uint8Array(raw),tile=b[0]===31&&b[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(raw));
  const len=4*Math.ceil(cell.nx*cell.ny*2/3);if(tile.schema!==1||tile.run!==meta.run||tile.generated!==meta.generated||tile.key!==cell.key||!meta.hours.every(h=>typeof tile.frames?.[h]?.temp2==='string'&&Object.values(tile.frames[h]).every(v=>typeof v==='string'&&v.length===len)))continue;
  if(nativeTemperatureMeta!==meta)return;
  nativeTemperatureTiles.set(cell.key,tile);nativeTemperatureRequests.delete(cell.key);if(nativeTemperatureTiles.size>6)nativeTemperatureTiles.delete(nativeTemperatureTiles.keys().next().value);
  if(weatherRealEnabled&&activePage==='weather')renderWeather();else if(weatherRealEnabled&&activePage==='warnings')renderLocalWarnings();return;
 }catch{}})();nativeTemperatureRequests.set(cell.key,task);
 // Throttle failures until the next metadata refresh, avoiding render loops.
 await task;
}
function validNativeTemperatureMeta(m){
 const g=m?.grid;return m?.schema===1&&forecastPriority.includes(m.model)&&Number.isFinite(Date.parse(m.run))&&Number.isFinite(Date.parse(m.generated))&&g&&[g.west,g.south,g.dx,g.dy].every(Number.isFinite)&&g.dx>0&&g.dy>0&&[g.nx,g.ny,m.tileSize].every(n=>Number.isInteger(n)&&n>0)&&g.nx*g.ny<=2000000&&m.tileSize<=200&&Array.isArray(m.hours)&&m.hours.length>0&&m.hours.every((h,i)=>Number.isInteger(h)&&h>=0&&(!i||h>m.hours[i-1]));
}
async function nativeJSON(path,zip=false,version=''){
 for(const prefix of [dataRoot,'data/'])try{
  const r=await fetch(prefix+path+'?v='+encodeURIComponent(version||Math.floor(Date.now()/60000)),{cache:'no-store',signal:AbortSignal.timeout(zip?35000:8000)});
  if(!r.ok)continue;if(!zip)return await r.json();
  const raw=await r.arrayBuffer(),b=new Uint8Array(raw);return b[0]===31&&b[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(raw));
 }catch{}return null;
}
async function nativeMeta(root){
 const key=root+'/index';if(nativeExtraRequests.has(key))return nativeExtraRequests.get(key);
 if(Date.now()-(nativeExtraChecks.get(key)||0)<5*60000)return nativeExtraMeta.get(root);
 nativeExtraChecks.set(key,Date.now());
 const task=(async()=>{const m=await nativeJSON(root+'/index.json');if(validNativeTemperatureMeta(m)&&newerSnapshot(m,nativeExtraMeta.get(root))){
  nativeExtraMeta.set(root,m);for(const k of nativeExtraTiles.keys())if(k.startsWith(root+'/'))nativeExtraTiles.delete(k);
 }return nativeExtraMeta.get(root)})().finally(()=>nativeExtraRequests.delete(key));nativeExtraRequests.set(key,task);return task;
}
async function fetchNativeTemperature(point){
 if(!point)return;
 await Promise.all(nativeTemperatureRoots.map(async root=>{
  const meta=await nativeMeta(root),cell=nativeTemperatureCell(point,meta);if(!cell)return;
  const key=root+'/'+cell.key;if(nativeExtraTiles.has(key)||nativeExtraRequests.has(key))return;
  if(Date.now()-(nativeExtraChecks.get(key)||0)<60000)return;nativeExtraChecks.set(key,Date.now());
  const task=(async()=>{const tile=await nativeJSON(root+'/'+cell.key+'.json.gz',true,meta.generated),len=4*Math.ceil(cell.nx*cell.ny*2/3);
   if(!tile||tile.schema!==1||tile.run!==meta.run||tile.generated!==meta.generated||tile.key!==cell.key||!meta.hours.every(h=>typeof tile.frames?.[h]?.temp2==='string'&&Object.values(tile.frames[h]).every(v=>typeof v==='string'&&v.length===len)))return;
   if(nativeExtraMeta.get(root)!==meta)return;
   nativeExtraTiles.set(key,tile);while(nativeExtraTiles.size>24)nativeExtraTiles.delete(nativeExtraTiles.keys().next().value);
   if(weatherRealEnabled&&activePage==='weather')renderWeather();else if(weatherRealEnabled&&activePage==='warnings')renderLocalWarnings();
  })().finally(()=>nativeExtraRequests.delete(key));nativeExtraRequests.set(key,task);return task;
 }));
}
let nativeMapTemperature=null,nativeMapRequest=null,nativeMapRequestedKey='',nativeMapRetry=0;
function matchingNativeMap(){
 const d=realData(),f=nativeMapTemperature;
 return d&&f&&d.model===f.meta.model&&Date.parse(d.run)===Date.parse(f.meta.run)&&mapHour===f.hour?f:null;
}
async function fetchNativeMapTemperature(){
 const d=realData();if(!d||d.nativeMap||mapSource!=='model'||mapLayer!=='temp2'||modelDataMode!=='real')return;
 if(matchingNativeMap())return;
 const key=d.model+'/'+d.run+'/'+mapHour;if(nativeMapRequestedKey===key&&(nativeMapRequest||Date.now()-nativeMapRetry<60000))return;
 nativeMapRequestedKey=key;nativeMapRetry=Date.now();const h=mapHour;
 const roots=nativeTemperatureRoots.filter(r=>r.startsWith(realModelFiles[d.model]+'-')||(d.model==='IFS'&&r==='ifs-short-temperature'));
 const task=(async()=>{const metas=await Promise.all(roots.map(nativeMeta));
  for(let i=0;i<metas.length;i++){const meta=metas[i];if(!meta||meta.model!==d.model||Date.parse(meta.run)!==Date.parse(d.run)||!meta.mapHours?.includes(h))continue;
   const p=await nativeJSON(roots[i]+'/map-'+h+'.json.gz',true,meta.generated),g=meta.grid;
   if(!p||p.run!==meta.run||p.generated!==meta.generated||p.hour!==h||typeof p.temp2!=='string')continue;
   const raw=atob(p.temp2);if(raw.length!==g.nx*g.ny*2)continue;
   const values=new Int16Array(raw.length/2);for(let n=0;n<values.length;n++)values[n]=(raw.charCodeAt(n*2)|(raw.charCodeAt(n*2+1)<<8))<<16>>16;
   if(nativeMapRequestedKey!==key)return;nativeMapTemperature={meta,hour:h,values};realModelRevision++;
   if(activePage==='map')renderMap();return;
  }
 })().finally(()=>{if(nativeMapRequestedKey===key)nativeMapRequest=null});nativeMapRequest=task;
}
function nativeMapTemperatureValue(f,lon,lat){
 if(!f)return NaN;const g=f.meta.grid,x=Math.round((lon-g.west)/g.dx),y=Math.round((lat-g.south)/g.dy);
 if(x<0||x>=g.nx||y<0||y>=g.ny)return NaN;const v=f.values[y*g.nx+x];return v===g.missing?NaN:v*g.scale;
}
const realWeatherIcon=(f,daytime=false)=>{const w=frameWeather(f,daytime);return w.icon?weather(w.icon,w.condition,w.condition+' · '+w.source):''};
const summaryWeatherIcon=w=>w?.icon?weather(w.icon,w.condition,w.condition+' · '+w.source):'';
async function fetchStationData(){
 if(stationRequest)return stationRequest;
 stationRequest=(async()=>{for(const url of [dataRoot+'stations.json','data/stations.json'])try{
  const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);let d;
  try{const res=await fetch(url,{signal:c.signal,cache:'no-cache',credentials:'omit'});if(!res.ok)continue;d=await res.json()}finally{clearTimeout(timer)}
  if(d.schema!==1||!Array.isArray(d.stations)||!d.stations.every(s=>Number.isFinite(s.lon)&&Number.isFinite(s.lat)&&typeof s.time==='string'))continue;
  if(d.radarImage?.time!==stationData?.radarImage?.time)for(const [key,entry] of radarImages)if(entry.state==='error'||entry.snapshot)radarImages.delete(key);
  stationData=d;return;
 }catch{}})();
 try{await stationRequest}finally{stationRequest=null;if(weatherRealEnabled&&activePage==='weather'){refreshLiveHero();if(document.querySelector('.home-maps')?.getBoundingClientRect().top<innerHeight+180)renderHomeMaps()}if(weatherRealEnabled&&activePage==='map')scheduleMap()}
}
async function fetchRealWeatherCodes(){
 for(const url of [dataRoot+'icon-weather.json','data/icon-weather.json'])try{
  const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);let payload;
  try{const res=await fetch(url,{signal:c.signal,cache:'no-cache',credentials:'omit'});if(!res.ok)continue;payload=await res.json()}finally{clearTimeout(timer)}
  if(payload.schema!==1||!payload.models)continue;
  let changed=false;
  for(const model of ['ICON-D2','ICON-EU']){
   const extra=payload.models[model],g=extra?.grid;if(!g||!Number.isFinite(Date.parse(extra.run))||!Number.isInteger(g.nx)||!Number.isInteger(g.ny)||g.nx<2||g.ny<2||g.nx*g.ny>500000||!extra.frames)continue;
   if(!Object.values(extra.frames).every(s=>typeof s==='string'&&s.length===4*Math.ceil(g.nx*g.ny*2/3)))continue;
   const previous=weatherCodesCache.get(model);if(previous&&Date.parse(previous.run)>Date.parse(extra.run))continue;
   weatherCodesCache.set(model,extra);changed=true;
  }
  if(changed){for(const key of realDecoded.keys())if(key.endsWith('/ww'))realDecoded.delete(key);if(weatherRealEnabled&&activePage==='weather')renderWeather();else if(weatherRealEnabled&&activePage==='warnings')renderLocalWarnings()}
  if(changed)return;
 }catch{}
}
function realMetric(icon,label,value,unit){return metric(icon,label,displayValue(value,unit),unit)}
function warningElevation(point){if(!point)return NaN;const g=offlineTerrain();if(point[0]<g.west||point[0]>g.west+(g.width-1)*g.step||point[1]>g.north||point[1]<g.north-(g.height-1)*g.step)return NaN;return offlineHeight(...point)}
const warningColor=level=>['','#d9b443','#f4a13f','#ed654e','#cf3b48','#af70ea'][level];
function periodWarningBadge(ws,compact=false){const w=ws[0];if(!w)return '';return '<span class="'+(compact?'day-alert':'period-risk')+'" style="color:'+warningColor(w.level)+'" title="'+w.type+' · L'+w.level+'">'+(w.level>=2?ui('alert',compact?14:13):'')+(compact?'':' L'+w.level)+'</span>'}
const warningTime=(a,b)=>localTime(a,{weekday:'short',hour:'2-digit',minute:'2-digit'})+' – '+localTime(b,{weekday:'short',hour:'2-digit',minute:'2-digit'});
function warningLine(w){
 const observed=w.state==='observed';
 const state=observed?'Aktuell beobachtet':w.state==='analysis'?'Modellgestützte Analyse':w.state==='risk'?(w.type==='Nebelpotenzial'?'Nebelpotenzial · nicht bestätigt':'Gefahrenpotenzial · nicht beobachtet'):'Warnprognose';
 const value=w.type==='Schneefall'&&w.range?'Möglicher Neuschnee: '+snowfallText(w.range):
  w.type==='Schneefall'?'Schneefallsignal · Neuschneemenge unklar':
  Number.isFinite(w.value)?localFormat(w.value)+' '+w.unit+(['Starkregen','Dauerregen'].includes(w.type)?' / '+w.period+' h · '+warningTime(w.peakStart,w.peakEnd):''):
  observed?'Beobachtung':w.note?'Modellsignal':'Modell-Wettercode; Begleiterscheinungen nicht vollständig bewertbar';
 return '<div class="warning-window-row"><b style="color:'+warningColor(w.level)+'">'+(w.level>=2?ui('alert',16):'')+' '+w.type+' · L'+w.level+' '+warningNames[w.level]+'</b><p>'+warningTime(w.start,w.end)+' · Ortszeit · '+state+'</p><p>'+value+' · '+w.models.join(' / ')+'</p>'+(w.note?'<p>'+w.note+'</p>':'')+(w.exceptionalCandidate?'<p>Außergewöhnlicher Modellwert · Level 5 erst nach zusätzlicher Bestätigung.</p>':'')+'</div>';
}
function homeWarnings(ws){
 if(!ws.length)return '';
 const w=ws[0],active=ws.filter(x=>x.state==='observed').map(x=>x.type);
 const risks=[...new Set(ws.filter(x=>x.start<=Date.now()+6*HOUR_MS&&x.end>=Date.now()).map(x=>x.type))].slice(0,4);
 const overview=risks.length?' · '+risks.join(' · '):'';
 return '<button class="warning" id="go-local-warning" type="button">'+(w.level>=2?ui('alert',25):'')+'<div><b>'+w.type+' · L'+w.level+' '+warningNames[w.level]+'</b><div class="warning-window">'+warningTime(w.start,w.end)+'</div><p>'+(active.length?'Aktuell beobachtet: '+[...new Set(active)].join(' · ')+' · ':'')+'Ortsbezogene Warnhinweise · '+ws.length+' Zeitfenster'+overview+'</p></div>'+ui('chevron',18)+'</button>';
}
function renderLocalWarnings(days=null,ws=null){refreshObservations();const point=homeLocationPoint(location),now=Date.now(),elevation=warningElevation(point);days??=forecastCalendarDays(point,now);ws??=localWarnings(days,now,elevation,point);const node=el('local-warning-list');node.innerHTML='<h2>Ortsbezogene Warnhinweise</h2><p></p><p class="small muted">'+(Number.isFinite(elevation)?'Grobe Geländehöhe: '+Math.round(elevation)+' m · Höhenstufe vorläufig.':'Geländehöhe unbekannt · niedrigere Windschwellen vorläufig.')+'</p><div class="window-list">'+(ws.length?ws.map(warningLine).join(''):'<p>Keine Schwellenüberschreitung in den verfügbaren Beobachtungs- und Modellwerten. Keine Entwarnung.</p>')+'</div><p class="small muted">Basisstufen: Frost, Hitze, Wind, Nebel, Stark-/Dauerregen, Gewitter- und Glättepotenzial sowie gefrierende Niederschläge. Veraltete Modellläufe werden nicht als aktive Warnung gewertet. Neuschnee, Eisansatz, Hagelgröße, Tornado, Verwehungen, Tauwetter, Hochwasser und Impact-Modifikatoren werden ohne validierte Eingangsdaten nicht automatisch eingestuft. Fehlende Werte bedeuten nicht Gefahrfreiheit.</p>';node.querySelector('p').textContent=location.name+' · aktuell und kommende 48 Stunden · keine amtlichen Warnungen';}
// Present precipitation detection and phase separately. Reflectivity/rate
// alone cannot identify precipitation type at the ground.
// Fog is a near-ground visibility phenomenon: a clear cloud field does not
// disprove it. Direct visibility observations and model risk are distinct.
function currentFogWeather(point,now){
 const fog=point&&typeof WeatherObservation!=='undefined'?WeatherObservation.fogAt(point,observationHeight(point),now):null;
 if(!fog||!Number.isFinite(fog.time)||fog.time>now||now-fog.time>60*60000)return null;
 if(fog.state==='observed'){
  const dense=Number.isFinite(fog.visibility)&&fog.visibility<200;
  return {icon:dense?'44_dichter_nebel':'43_nebel',condition:dense?'Dichter Nebel':'Nebel',source:fog.source+(Number.isFinite(fog.visibility)?' · Sicht '+Math.round(fog.visibility)+' m':'')+' · bodennah beobachtet'};
 }
 if(fog.state==='risk')return {icon:'43_nebel',condition:'Nebel möglich · nicht bestätigt',source:fog.source+' · Sichtweite nicht gemessen'};
 return null;
}
function currentCloudWeather(f,point,now,live=null){
 const fog=currentFogWeather(point,now);
 if(fog)return fog;
 const sample=live?.cloud,cloud=sample?.value,night=isNightAt(now,point);
 if(!Number.isFinite(cloud))return {icon:null,condition:'Bewölkung nicht verfügbar',source:'Keine aktuelle Beobachtungsanalyse'};
 return {...cloudWeather(cloud,night),source:sample.source||'Bewölkungsanalyse'};
}
function livePhaseWeather(f,radar,phase,point,now,live=null){
 const wet=radar&&radar.rate>0,night=isNightAt(now,point),rate=radar?.rate;
 const make=(icon,condition,source)=>({icon,condition,source});
 const snow=rate>=2?'22_schnee_3':night?'64_schneefall_nacht':rate>=.5?'21_schnee_2':'20_schnee_1';
 const rain=rate>=4?'14_regen_4':night?'65_regen_nacht':rate>=1?'12_regen_2':'11_regen_1';
 // A phase product may classify an existing echo, never overrule a measured dry cell.
 if(phase&&radar&&(Math.abs(radar.time-phase.time)>(phase.kind==='ground'?45:5)*60000||(phase.code===0&&wet)||(phase.code>=2&&!wet&&phase.kind!=='ground')))phase=null;
 if(phase){
  const source=phase.source||'DWD HymecNG · '+localTime(phase.time,{hour:'2-digit',minute:'2-digit'});
  if(phase.code===0&&!wet){const sky=currentCloudWeather(f,point,now,live);return {...sky,source:sky.source+' · '+source+' · kein Niederschlag'};}
  const phases={2:[rain,'Sprühregen'],3:[rain,'Regen'],4:['33_gefrierender_regen','Gefrierender Sprühregen'],5:['33_gefrierender_regen','Gefrierender Regen'],6:['29_schneeregen_2','Schneeregen'],7:[phase.intensity==='strong'?'23_schnee_4':snow,phase.intensity==='strong'?'Kräftiger Schneefall':'Schneefall'],8:[null,'Graupel'],9:[null,'Hagel'],10:[null,'Großer Hagel'],11:[null,'Eiskörner']};
  if(phases[phase.code])return make(...phases[phase.code],source);
 }
 if(radar&&!wet){const sky=currentCloudWeather(f,point,now,live);return {...sky,source:sky.source+' · '+(radar.source||'DWD RY')+' · kein Niederschlag im Radar'};}
 if(!wet){
  const fog=currentFogWeather(point,now);if(fog)return fog;
  const cloud=live?.cloud;
  if(cloud&&['observation','analysis','estimate'].includes(cloud.kind)&&Number.isFinite(cloud.value)&&cloud.value>=0&&cloud.value<=100&&Number.isFinite(cloud.time)&&cloud.time<=now&&now-cloud.time<=liveAge){
   const sky=currentCloudWeather(f,point,now,live);
   return {...sky,condition:sky.condition+' · Niederschlag nicht bestätigt',source:sky.source+' · keine aktuelle Radar- oder Bodenbestätigung für Niederschlag'};
  }
  return make(null,'Wetterzustand nicht aktuell bestätigt','Keine aktuelle Radar- oder Bodenbestätigung');
 }
 // An observed echo with unknown phase remains unknown. Never paint a
 // forecast-derived rain/sleet/snow phase as a current observation.
 return make(null,'Niederschlag · Art nicht bestimmt',(radar.source||'Radar')+' · keine sichere Niederschlagsart');
}
function liveEscape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function liveKind(s){return s.kind==='observation'?'Beobachtungsanalyse':s.kind==='analysis'?'Modellgestützte Analyse':s.kind==='estimate'?'Modellschätzung':s.kind==='interval'?'Intervallmodell':s.kind==='model'?'Letzter Modellwert':'Keine Daten'}
function liveHeroTag(s,last){return s.kind==='observation'?'BEOBACHTUNGSANALYSE':s.kind==='analysis'?'MODELLGESTÜTZTE ANALYSE':s.kind==='estimate'?'ORTSSCHÄTZUNG':last?'LETZTE ANALYSE':'ANALYSE FEHLT'}
const liveCompatible=(a,b)=>a.kind===b.kind&&['analysis','observation'].includes(a.kind)&&a.time===b.time&&a.analysisId===b.analysisId&&a.cell?.[0]===b.cell?.[0]&&a.cell?.[1]===b.cell?.[1];
function liveMetricHTML(icon,label,s,unit,point,now,id){
 // Retain actual older analysis values when the live importer is delayed;
 // never relabel them as current observations or use them for hazard decisions.
 const old=s.kind==='missing'?lastLocalAnalysis(point,now,id):null,value=old?old.value:s.value;
 const kind=old?'Letzter Wert · nicht aktuell':liveKind(s);
 const source=old?'Stand '+localTime(old.time,{hour:'2-digit',minute:'2-digit'})+' Uhr · vor '+Math.floor((now-old.time)/60000)+' min · neue Analyse ausstehend':s.source;
 return '<div class="metric"><div class="metric-label">'+ui(icon,13)+label+' · '+kind+'</div><strong>'+displayValue(value,unit)+' <span>'+unit+'</span></strong><div class="live-metric-source">'+liveEscape(source)+'</div></div>';
}
function liveMetricsHTML(live,point,now){return liveMetricHTML('wind','Wind',live.wind,'km/h',point,now,'wind')+liveMetricHTML('wind','Böen',live.gust,'km/h',point,now,'gust')+liveMetricHTML('drop','Feuchte',live.rh2,'%',point,now,'rh2')}
function currentHourState(f,radar,point,now,live){
 const recent=f&&f.time<=now&&now-f.time<=liveAge?f:null,phase=resolveLivePhase(point,radar,now);
 fetchObservedPhase(point,radar,now);
 return {start:Math.floor(now/HOUR_MS)*HOUR_MS,temperature:live.temp2,weather:livePhaseWeather(recent,radar,phase,point,now,live),rate:radar?.rate,live};
}
const currentHourSignature=s=>JSON.stringify([s.start,s.temperature.value,s.temperature.kind,s.temperature.time,s.temperature.source,s.weather.icon,s.weather.condition,s.weather.source,s.rate,...Object.entries(s.live||{}).map(([id,v])=>[id,v.value,v.kind,v.time,v.source])]);
let renderedHourSignature=null;
function liveHeroWeatherHTML(f,radar,point,now,live=liveLocalWeather(f,point,now)){
 const phase=radarPhaseAt(radarPhaseData,point,now),observed=currentHourState(f,radar,point,now,live).weather,temp=live.temp2.value;
 const comfort=modelComfort(temp,liveCompatible(live.wind,live.temp2)?live.wind.value:NaN,liveCompatible(live.rh2,live.temp2)?live.rh2.value:NaN);
 const condition=observed.condition==='Wetterzustand nicht verfügbar'&&!f&&!radar&&!phase?(typeof navigator!=='undefined'&&navigator.onLine===false?'Offline · keine aktuellen Ortsdaten':locationRefreshTime&&now-locationRefreshTime>20000?'Ortsprognose nicht verfügbar':'Ortsprognose wird geladen …'):observed.condition;
 const rate=radar&&radar.rate>0?' · '+localFormat(radar.rate)+' mm/h (Radar '+localTime(radar.time,{hour:'2-digit',minute:'2-digit'})+')': '';
 const clouds=live.cloud.value,oldCloud=!Number.isFinite(clouds)?lastLocalAnalysis(point,now,'cloud'):null;
 const cloudText=Number.isFinite(clouds)?' · Bewölkung '+localFormat(clouds,0)+' % ('+liveKind(live.cloud)+')':oldCloud?' · Letzte Bewölkungsanalyse '+localFormat(oldCloud.value,0)+' % ('+localTime(oldCloud.time,{hour:'2-digit',minute:'2-digit'})+' Uhr · veraltet)':'';
 const age=['observation','analysis','estimate'].includes(live.temp2.kind)?' · vor '+Math.max(0,Math.floor((now-live.temp2.time)/60000))+' min':'',last=live.temp2.kind==='missing'?lastLocalAnalysis(point,now):null;
 return '<div>'+(last?'<div class="feels"><b>Letzte Ortsanalyse · nicht aktuell</b></div>':'')+'<div class="temp">'+temperatureText(last?last.value:temp)+'<span>°C</span></div><div class="feels live-temp-source">'+(last?'Stand '+localTime(last.time,{hour:'2-digit',minute:'2-digit'})+' Uhr · vor '+Math.floor((now-last.time)/60000)+' min · neue Analyse wird gesucht':liveEscape(live.temp2.source+age))+'</div><div class="condition">'+condition+'</div><div class="feels">'+(Number.isFinite(comfort.value)?'Gefühlt '+temperatureText(comfort.value)+' °C · Näherung<br>':'')+observed.source+rate+cloudText+'</div></div>'+summaryWeatherIcon(observed);
}
const liveDetailFields={'Temperatur':['temp2','°C'],'Taupunkt':['dew','°C'],'Relative Feuchtigkeit':['rh2','%'],'Windgeschwindigkeit':['wind','km/h'],'Windböen':['gust','km/h'],'Windrichtung':['winddir','°'],'Luftdruck (NN)':['slp','hPa'],'Gesamtbewölkung':['cloud','%']};
function liveDetailValue(label,live){const [id,unit]=liveDetailFields[label],s=live[id];return [label,displayValue(s.value,unit),unit,liveEscape(s.source)]}
function liveDerivedDetail(label,live){
 if(label==='Windstärke')return [label,localFormat(windBeaufort(live.wind.value),0),'Bft',liveEscape(live.wind.source)+' · umgerechnet'];
 if(label==='Taupunktdifferenz')return [label,localFormat(liveCompatible(live.temp2,live.dew)&&Number.isFinite(live.temp2.value)&&Number.isFinite(live.dew.value)?Math.max(0,live.temp2.value-live.dew.value):NaN),'K','Berechnet · nur zusammenpassende Daten'];
 if(label==='Gefühlte Temperatur (Näherung)'){const c=modelComfort(live.temp2.value,liveCompatible(live.temp2,live.wind)?live.wind.value:NaN,liveCompatible(live.temp2,live.rh2)?live.rh2.value:NaN);return [label,temperatureText(c.value),'°C','Näherung aus Live-Werten'];}
 return null;
}
function liveDetailGroups(groups,live){return groups.map(([title,icon,items])=>[title,icon,items.map(item=>liveDetailFields[item[0]]?liveDetailValue(item[0],live):liveDerivedDetail(item[0],live)||item)])}
function refreshLiveHero(){
 if(activePage!=='weather')return;
 const node=document.querySelector('#weather-left .hero-weather');if(!node)return;
 const p=homeLocationPoint(location),now=Date.now(),f=currentGridFrame(p,now),radar=pointRadarAt(p,now);
 const live=liveLocalWeather(f,p,now);
 // Refresh the whole forecast atomically when the shared current value changes.
 if(currentHourSignature(currentHourState(f,radar,p,now,live))!==renderedHourSignature){refreshPointUI();return;}
 node.innerHTML=liveHeroWeatherHTML(f,radar,p,now,live);
 const metrics=document.querySelector('#weather-left .hero .metrics');if(metrics)metrics.innerHTML=liveMetricsHTML(live,p,now);
 const last=live.temp2.kind==='missing'?lastLocalAnalysis(p,now):null,badge=document.querySelector('#weather-left .hero-head .small');if(badge)badge.textContent=last?'Letzter bekannter Wert · nicht aktuell':liveKind(live.temp2)+' · Werte mit eigener Datenzeit';
 const tag=document.querySelector('#weather-left .hero-head .tag');if(tag)tag.textContent=liveHeroTag(live.temp2,last);
 for(const n of document.querySelectorAll('#weather-right .parameter-value')){const label=n.querySelector('.p-label')?.textContent,row=liveDetailFields[label]?liveDetailValue(label,live):liveDerivedDetail(label,live);if(row)n.outerHTML=parameterValue(row);}
}
// Day-part details use the same forecast runs and intervals as the tile.
const forecastPeriodNames=['Nacht','Vormittag','Nachmittag','Abend'];
function periodDetailMean(p,read){
 if(p.members?.length){
  const values=p.members.map(m=>periodDetailMean(m,read));
  const valid=values.filter(Number.isFinite);return valid.length?valid.reduce((s,v)=>s+v,0)/valid.length:NaN;
 }
 const rows=p.rows||[],values=rows.map(read);
 if(rows.length<2||rows[0].time!==p.start||rows.at(-1).time!==p.end||!values.every(Number.isFinite)||!(p.end>p.start))return NaN;
 return values.slice(1).reduce((s,v,i)=>s+(v+values[i])/2*(rows[i+1].time-rows[i].time),0)/(p.end-p.start);
}
function periodWindComponent(f,axis){
 if(f?.interpolated){const a=periodWindComponent(f.before,axis),b=periodWindComponent(f.after,axis);return a+(b-a)*f.fraction}
 const angle=frameVal(f,'winddir')*Math.PI/180,speed=frameVal(f,'wind');
 return speed===0?0:speed*(axis==='x'?Math.sin(angle):Math.cos(angle));
}
function periodWindDirection(p){
 const x=periodDetailMean(p,f=>periodWindComponent(f,'x')),y=periodDetailMean(p,f=>periodWindComponent(f,'y'));
 if(!Number.isFinite(x)||!Number.isFinite(y))return Number.isFinite(p.wind)&&p.wind<2?'Sehr schwacher Wind':'Nicht verfügbar';
 if(Math.hypot(x,y)<.5)return Number.isFinite(p.wind)&&p.wind<2?'Sehr schwacher Wind':'Wechselnd';
 const deg=(Math.atan2(x,y)*180/Math.PI+360)%360;
 return ['N','NO','O','SO','S','SW','W','NW'][Math.round(deg/45)%8]+' · '+Math.round(deg)%360+'°';
}
function periodWetHours(p){
 if(p.members?.length){
  const vals=p.members.map(periodWetHours);
  if(!vals.every(Number.isFinite))return NaN;
  return vals.reduce((s,v)=>s+v,0)/vals.length;
 }
 if(!Number.isFinite(p.rain))return NaN;
 if(p.rain===0)return 0;
 const intervals=p.intervals||[];
 if(Math.abs(intervals.reduce((s,r)=>s+r.hours,0)-p.duration)>1e-6||
    !intervals.every(r=>Number.isFinite(r.amount)&&r.hours===1&&!r.estimated))return NaN;
 return intervals.filter(r=>r.amount>=.1).length;
}
function periodPrecipChance(p,point,now){
 // Max of explicit interval probabilities is NOT a probability for the whole period.
 const intervals=p.intervals||[],pops=intervals.map(r=>frameVal(r.frame,'pop'));
 if(!p.blended&&pops.length&&Math.abs(intervals.reduce((s,r)=>s+r.hours,0)-p.duration)<1e-6&&pops.every(v=>Number.isFinite(v)&&v>=0&&v<=100))
  return {short:localFormat(Math.max(...pops),0)+' %',label:'Niederschlagswahrsch. (max. Modellintervall)',value:localFormat(Math.max(...pops),0)+' %'};
 // Deterministic model families provide a transparent agreement indicator,
 // not a statistically calibrated precipitation probability.
 const families=new Map();
 for(const d of forecastCandidates(p.start,p.end,now,point)){
  const family=modelProvider(d.model);
  if(families.has(family)||now-Date.parse(d.run)>modelAgeLimit(d.model)*HOUR_MS)continue;
  const member=forecastPeriod(point,p.start,now,p.end,d);
  if(Number.isFinite(member.rain))families.set(family,member.rain>=.1);
 }
 const n=families.size,wet=[...families.values()].filter(Boolean).length;
 return n>=2?{short:wet+'/'+n+' Modelle',label:'Niederschlagssignal (Modellfamilien)',value:wet+' von '+n+' · '+Math.round(wet/n*100)+' %',note:'Modellanteil, keine kalibrierte Niederschlagswahrscheinlichkeit.'}:{short:'Wahrsch. —',label:'Niederschlagswahrscheinlichkeit',value:'—',note:'Keine belastbare Wahrscheinlichkeitsinformation verfügbar.'};
}
function periodSnowfallWater(p){
 if(p.members?.length){const vals=p.members.map(periodSnowfallWater);return vals.every(Number.isFinite)?vals.reduce((s,v)=>s+v,0)/vals.length:NaN}
 const rows=p.rows||[],first=rows[0],last=rows.at(-1);
 if(!first||!last||first.interpolated||last.interpolated||first.d!==last.d||!rows.every(f=>f.d===first.d))return NaN;
 const diff=id=>frameVal(last,id)-frameVal(first,id);
 const total=diff('snowWaterTotal'),components=diff('snowGspTotal')+diff('snowConTotal'),value=Number.isFinite(total)?total:components;
 return Number.isFinite(value)&&value>=-.05?Math.max(0,value):NaN;
}
function periodDetailHTML(p,j,chance,details){
 const humidity=periodDetailMean(p,frameHumidity),dew=periodDetailMean(p,f=>frameVal(f,'dew'));
 const comfort=modelComfort(periodDisplay(p,'mean'),p.wind,humidity),wet=periodWetHours(p),snowWater=periodSnowfallWater(p);
 const wetText=Number.isFinite(wet)?(p.blended?'≈ ':'')+localFormat(wet,1)+' h von '+p.duration+' h':Number.isFinite(p.rain)?'Nicht stündlich aufgelöst':'—';
 const items=[['Niederschlagsart',p.rain===0?'Kein Niederschlag':p.weather?.condition||'—'],[chance.label,chance.value],['Niederschlagsdauer (≥ 0,1 mm/h)',wetText],['Neuschnee ('+p.duration+' h)',snowfallRangeText(p)],['Niederschlagsmenge (Wasseräquivalent)',quantityRange(p.rain)],['Gefühlt (Näherung)',Number.isFinite(comfort.value)?temperatureText(comfort.value)+' °C':'Kein gültiger Index'],['Wind (Mittel)',localFormat(p.wind,0)+' km/h'],['Windrichtung (Mittel)',periodWindDirection(p)],['Böen (max.)',localFormat(p.gust,0)+' km/h'],['Relative Feuchte (Mittel)',localFormat(humidity,0)+' %'],['Taupunkt (Mittel)',temperatureText(dew)+' °C'],['Luftdruck NN (Mittel)',localFormat(p.slp,0)+' hPa'],['Bewölkung (Mittel)',localFormat(p.cloud,0)+' %']];
 if(snowWater>0)items.splice(5,0,['Schneefall (Wasseräquivalent)',quantityRange(snowWater)]);
 return '<section class="period-detail-panel" id="period-details"><div class="period-detail-heading"><h3>'+forecastPeriodNames[j]+' – '+(p.weather?.condition||'Wetterdetails')+'</h3><button type="button" data-close-period aria-label="Zeitabschnitt schließen">×</button></div><p class="small muted period-detail-time">'+localIntervalLabel(p.start,p.end)+' Uhr · Ortszeit</p><div class="hour-detail period-detail-grid">'+details(items)+'</div><p class="small muted">'+(chance.note||'Maximale Intervallwahrscheinlichkeit, nicht die Wahrscheinlichkeit für den gesamten Zeitabschnitt.')+' Mengenbereiche sind gerundete Modellschätzungen, keine statistischen Wahrscheinlichkeitsintervalle. Bei unbekannter Schneephase wird ein möglicher Bereich aus der Niederschlagsmenge abgeleitet. — = keine passenden Daten.</p><p class="small muted">'+(p.model||'Kein Modell verfügbar')+(p.radarUsed?' · RV-Niederschlag':'')+'</p></section>';
}
function actualAmount(v){return !Number.isFinite(v)?'—':v>0&&v<.5?'Unter 1 l/m²':localFormat(v)+' l/m²'}
function balancePanel(b){if(!b)return '';return '<section class="panel"><div class="section-head"><div><h2>Heutige Wetterbilanz</h2><p>Beobachteter Verlauf und verbleibende Prognose getrennt</p></div></div><div class="hour-detail"><div class="detail-item">Bisher gefallen<b>'+actualAmount(b.observed)+'</b></div><div class="detail-item">Noch erwartet<b>'+quantityRange(b.remaining,b.remaining,'l/m²')+'</b></div><div class="detail-item">Bisher höchstens<b>'+temperatureText(b.actualHi)+' °C</b></div><div class="detail-item">Bisher mindestens<b>'+temperatureText(b.actualLo)+' °C</b></div></div><p class="small muted">DWD RADOLAN RW / RY · '+(b.covered?'Datenstand '+localTime(b.through,{hour:'2-digit',minute:'2-digit'})+' Uhr · '+(b.complete?'vollständig bis zum letzten Intervall':'Teilmenge · Datenlücken'):'Noch keine Messsumme verfügbar')+' · Laufendes 5-Minuten-Intervall noch nicht enthalten. Temperatur aus SYNOP-Messung bzw. Beobachtungsanalyse.</p></section>'}
function renderRealWeather(){
 refreshObservations();
 const oldScroll=document.querySelector('#weather-left .hour-scroll')?.scrollLeft||0;
 const openGroups=[...document.querySelectorAll('#weather-right details.parameter-group')].map(d=>d.open);
 const point=homeLocationPoint(location);restorePointWeather(point);restoreQuickWeather(point);
 const now=Date.now(),f=currentGridFrame(point,now),radar=pointRadarAt(point,now),phaseDetail=localRadarPhaseDetail(f,radar,point,now);
 const live=liveLocalWeather(f,point,now),current=currentHourState(f,radar,point,now,live);
 renderedHourSignature=currentHourSignature(current);
 const days=forecastCalendarDays(point,now,current);
 const warnings=localWarnings(days,now,warningElevation(point),point);
 const last=live.temp2.kind==='missing'?lastLocalAnalysis(point,now):null,source=last?'Letzter bekannter Wert · nicht aktuell':liveKind(live.temp2)+' · Werte mit eigener Datenzeit';fetchLiveAnalysis(point);
 const temp=frameVal(f,'temp2'),wind=frameVal(f,'wind'),dew=frameVal(f,'dew');
 const humidity=frameHumidity(f);
 const comfort=modelComfort(temp,wind,humidity);
 const solar=localSolarTimes(point,now);
 const next=hourlyForecast(days,now,point);selectedHour=Math.min(selectedHour,next.length-1);
 const upcoming1=hourlyRainWindow(next,now,now+HOUR_MS),upcoming2=hourlyRainWindow(next,now,now+2*HOUR_MS),upcoming6=hourlyRainWindow(next,now,now+6*HOUR_MS),upcoming24=hourlyRainWindow(next.at(-1)?.end<now+24*HOUR_MS?[...next,localPrecipitationHour(point,next.at(-1).end,now)]:next,now,now+24*HOUR_MS),hasRV=next.slice(0,3).some(h=>h.radarUsed);
 const upcomingSnow1=hourlySnowBoundsWindow(next,now,now+HOUR_MS),upcomingSnow2=hourlySnowBoundsWindow(next,now,now+2*HOUR_MS);
 const freshSnowHint=(cm,end)=>cm?.[1]>0&&(cm[0]>0||next.some(h=>h.start<end&&h.end>now&&/schnee/.test(h.weather?.icon||'')))?'<span class="small">'+snowfallText(cm)+' Neuschnee · Modell</span>':'';
 const hero='<section class="panel hero"><div class="hero-head"><span class="tag">'+liveHeroTag(live.temp2,last)+'</span><span class="small">'+source+'</span></div><div class="hero-weather">'+liveHeroWeatherHTML(f,radar,point,now,live)+'</div><div class="metrics">'+liveMetricsHTML(live,point,now)+'</div><div class="hour-detail"><div class="detail-item">Nächste 60 Min.<b>'+quantityRange(upcoming1)+'</b>'+freshSnowHint(upcomingSnow1,now+HOUR_MS)+'</div><div class="detail-item">Nächste 120 Min.<b>'+quantityRange(upcoming2)+'</b>'+freshSnowHint(upcomingSnow2,now+2*HOUR_MS)+'</div><div class="detail-item">Niederschlagsprognose<b>'+(hasRV?'DWD RV + Modell · '+localTime(Date.parse(radarNowcastData.time),{hour:'2-digit',minute:'2-digit'}):'Modell · kein aktueller RV-Nowcast')+'</b></div></div></section>';
 const night=upcomingNight(days,now),nightHint=Number.isFinite(night.lo)?'<p class="small muted night-summary"><b>Nachtminimum: '+temperatureText(night.lo)+' °C</b> · '+localIntervalLabel(night.start,night.end)+' Uhr · Tiefstwert '+(Number.isFinite(night.minHour?.start)&&Number.isFinite(night.minHour?.end)?localIntervalLabel(night.minHour.start,night.minHour.end)+' Uhr':Number.isFinite(night.minHour?.time)?localTime(night.minHour.time,{hour:'2-digit',minute:'2-digit'})+' Uhr':'Zeit unbekannt')+' · '+(night.complete?'aus Stundenwerten':'nur verfügbare Stunden')+'</p>':'';
 const details=items=>items.map(([label,value])=>'<div class="detail-item">'+label+'<b>'+value+'</b></div>').join('');
 const detail=a=>{const h=a.frame,read=id=>a.currentSamples?(a.currentSamples[id]?.value??NaN):frameVal(h,id),label=name=>a.currentSamples?name+' aktuell':name;return details([['Zeitraum (Ortszeit)',localIntervalLabel(a.start,a.end)+' Uhr'],['Modell',a.model&&h?(a.model+' · Lauf '+localTime(Date.parse(h.d.run),{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+(a.raster?' · '+a.raster:'')+(a.step!==1?' · gröbere Zeitschritte':'')):'—'],[a.temperatureSample?'Temperatur aktuell':'Temperatur am Intervallende (Prognose)',temperatureText(a.temperature)+' °C'],...(a.temperatureSample?[['Temperaturquelle',liveEscape(a.temperatureSample.source)]]:[]),...(a.currentHour?[['Wetter aktuell',liveEscape(a.weather.condition)],['Wetterquelle aktuell',liveEscape(a.weather.source)],['Radarintensität aktuell',Number.isFinite(a.observedRate)?localFormat(a.observedRate)+' mm/h':'—']]:[]),['Neuschnee (1 h · Modell)',snowfallRangeText(a)],[a.currentHour?'Niederschlag (laufende Stunde · Ist + Restprognose)':'Niederschlag (1 h · Prognose)',quantityRange(a.rain)],['Niederschlagsquelle',a.rainSource],[label('Taupunkt'),temperatureText(read('dew'))+' °C'],[label('Wind'),localFormat(read('wind'))+' km/h'],[label('Böen'),localFormat(read('gust'))+' km/h'],[label('Bewölkung'),localFormat(read('cloud'))+' %'],[label('Luftdruck NN'),localFormat(read('slp'))+' hPa']])};
 const hourly='<section class="panel hourly"><div class="section-head"><div><h2>Stundenverlauf</h2><p>Nächste 24 Stunden · Regen in mm / Neuschnee in cm · Ortszeit</p></div><span class="badge">1 h</span></div>'+nightHint+'<div class="hour-scroll">'+next.map((a,i)=>'<button class="hour '+(selectedHour===i?'active':'')+'" data-hour="'+i+'" aria-pressed="'+(selectedHour===i)+'"><span class="hour-time">'+localIntervalLabel(a.start,a.end).replace(/:00/g,'')+' Uhr</span>'+ (summaryWeatherIcon(a.weather)||'<span class="hour-empty">—</span>')+'<strong>'+temperatureText(a.temperature)+'°</strong><span class="rain">'+(a.currentHour?'<small class="snow-label">'+(a.temperatureSample?'Jetzt':'Prognose · keine Analyse')+'</small>'+liveEscape(a.weather.condition)+(Number.isFinite(a.observedRate)&&a.observedRate>0?'<small class="snow-label">'+localFormat(a.observedRate)+' mm/h Radar</small>':''):forecastPrecipText(a,'',true))+'</span></button>').join('')+'</div><details class="hourly-info"><summary>Wie wird die Stundenprognose berechnet?</summary><p>Die laufende Stunde übernimmt Temperatur und Wetterzustand aus der aktuellen Ortsanalyse bzw. dem Radar. Zukünftige Stunden zeigen die Modelltemperatur am Intervallende. Niederschlags-Stundensummen bleiben Prognosen (Radar-Nowcast + Modell), keine Messsummen.</p>'+(!next.every(a=>Number.isFinite(a.rain))?'<p>Stundenmengen aus DWD-Radarprognose und stündlichen Modellwerten, soweit vollständig verfügbar. Temperatur zwischen gröberen Modellzeitpunkten zeitlich interpoliert; keine erfundenen Stundenmengen.</p>':'')+'</details><div class="hour-detail" id="hour-detail">'+detail(next[selectedHour])+'</div></section>';
 el('weather-left').innerHTML=hero+balancePanel(days[0].balance)+hourly+homeWarnings(warnings);
 const dayExtremes=days.flatMap(d=>[periodDisplay(d,'lo'),periodDisplay(d,'hi')]).filter(Number.isFinite),rangeMin=dayExtremes.length?Math.min(...dayExtremes):NaN,rangeSpan=dayExtremes.length?Math.max(...dayExtremes)-rangeMin:NaN;
 const selectedDayChances=days[openDay]?.periods.map(p=>periodPrecipChance(p,point,now))||[];
 const dayItems=days.map((d,i)=>{const icon=summaryWeatherIcon(d.weather),dayWarnings=warnings.filter(w=>w.start<d.end&&w.end>d.start),models=[...new Set(d.periods.map(p=>p.model).filter(Boolean))];
  const chances=openDay===i?selectedDayChances:[];
  const blocks=openDay===i?d.periods.map((p,j)=>'<button type="button" class="period period-toggle '+(openPeriod===j?'period-active':'')+'" data-period="'+j+'" aria-expanded="'+(openPeriod===j)+'"'+(openPeriod===j?' aria-controls="period-details"':'')+'><b>'+forecastPeriodNames[j]+'</b><span class="small muted">'+localIntervalLabel(p.start,p.end)+' Uhr</span>'+ (summaryWeatherIcon(p.weather)||'<span class="hour-empty">—</span>')+'<strong>'+forecastTemperature(periodTemperature(p,j,d))+'</strong><span class="small muted">'+(j===0?'Nachtminimum · 00–06 Uhr'+(d.night.source==='forecast'?' · Modell':'')+(d.night.complete?'':' (Teilwerte)'):periodTemperatureLabel(j))+'</span><span class="rain">'+forecastPrecipText(p,' / '+p.duration+' h')+'</span><span class="small muted period-chance">'+chances[j].short+'</span>'+periodWarningBadge(dayWarnings.filter(w=>w.start<p.end&&w.end>p.start))+ui('chevron',16,'period-chevron')+'</button>').join(''):'';
  const periodPanel=openDay===i&&openPeriod>=0?periodDetailHTML(d.periods[openPeriod],openPeriod,chances[openPeriod],details):'';
  const dailyDetails=details([['Neuschnee ('+d.duration+' h)',snowfallRangeText(d)],['Niederschlag ('+d.duration+' h · Wasseräquivalent)',quantityRange(d.rain)],['Niederschlagsquelle',d.balance?'DWD RW / RY + RV / Modell':d.periods.some(p=>p.radarUsed)?'DWD RV + Modell':'Modell'],['Nachtminimum (00–06 Uhr)',temperatureText(periodDisplay(d,'lo'))+' °C'+temperatureExtremeTime(d.minHour)+(d.night.complete?'':' · Teilwerte')],[d.balance?'Tageshöchstwert (Ist seit 00 Uhr + Rest bis 18 Uhr)':'Tageshöchsttemperatur (09–18 Uhr)',temperatureText(periodDisplay(d,'hi'))+' °C'+temperatureExtremeTime(d.maxHour)+(d.balance?' · '+(d.highIncomplete?'örtliche Tagesreihe unvollständig':d.observationCount?'örtliche Istwerte':'keine Tages-Istwerte')+(d.futureDaytimeCount?' + Restprognose':''):'')],['Wind (Mittel)',localFormat(d.wind)+' km/h'],['Böen (Maximum)',localFormat(d.gust)+' km/h'],['Luftdruck (Mittel)',localFormat(d.slp)+' hPa'],['Bewölkung (Mittel)',localFormat(d.cloud)+' %']]);
  const lo=periodDisplay(d,'lo'),hi=periodDisplay(d,'hi'),range=Number.isFinite(lo)&&Number.isFinite(hi)&&hi>=lo&&rangeSpan>0?'<span class="range" aria-hidden="true"><span class="range-fill" style="left:'+Math.max(0,Math.min(100,100*(lo-rangeMin)/rangeSpan)).toFixed(1)+'%;width:'+Math.max(2,Math.min(100,100*(hi-lo)/rangeSpan)).toFixed(1)+'%;'+forecastTempGradient(lo,hi)+'"></span></span>':'';
  return '<button class="day real-day" data-day="'+i+'" aria-expanded="'+(openDay===i)+'"><div><div class="dayname">'+(i===0?'Heute':localTime(d.start,{weekday:'long'}))+periodWarningBadge(dayWarnings,true)+'</div><div class="daydate">'+localTime(d.start,{day:'2-digit',month:'2-digit'})+' · '+forecastPrecipText(d)+'</div><span class="day-model">'+(models.join(' / ')||'Keine Daten')+(d.blended?' · Modellmittel':d.temperatureNative?' · Originalraster':' · Modellraster')+'</span></div><span class="day-icon">'+(icon||'—')+'</span><div class="tempgroup">'+forecastTemperature(lo,'low')+range+forecastTemperature(hi,'high')+'</div>'+ui('chevron',18,'chev')+'</button>'+(openDay===i?'<div class="day-open">'+dayWarnings.map(warningLine).join('')+'<div class="period-grid">'+blocks+'</div>'+periodPanel+'<p class="day-summary">Zeitabschnitt antippen für Details. Nacht: Tiefstwert 00–06 Uhr; Vormittag: 09-Uhr-Modellwert; Nachmittag: Höchstwert 12–18 Uhr; Abend: 21-Uhr-Modellwert. Vergangene Modellwerte sind keine Messungen. Heute: örtlich belastbarer Höchstwert seit 00 Uhr und nur noch zukünftige Tagesstunden von 06–18 Uhr als Restprognose. Abendprognosen dürfen den bereits beobachteten Höchstwert nicht erhöhen. Ohne Tages-Istwerte kann der Höchstwert fehlen. Sonstige Tage: Tagesmaximum 09–18 Uhr. Die Abkühlung am Abend gehört zum Nachtminimum des nächsten Tages. Die Zeitblöcke und Niederschlagsmengen bleiben auf den jeweiligen Kalendertag bezogen. Die laufende Stunde übernimmt die frische Ortsanalyse. — = Eingangsdaten fehlen. Tatsächliche Extremwerte zwischen den Stundenwerten können abweichen. Niederschlag und Neuschnee sind als gerundete Mengenbereiche dargestellt; bei gröberen Modellintervallen bzw. unklarer Schneephase sind sie angenähert.</p><div class="hour-detail">'+dailyDetails+'</div>'+(!Number.isFinite(d.rain)?'<p class="small muted">Tagesmenge erst bei vollständiger Datenabdeckung.</p>':'')+'</div>':'');});
 const m=(label,id,unit,desc='Modell')=>{const sample=currentParameterAt(id,point,now,f,fields[id]?.interval||0);return [label,displayValue(sample.value,unit),unit,sample.frame?currentSource(sample.frame)+' · '+(sample.derived?'Berechnet / Näherung':desc):'Nicht verfügbar']}, groups=[['Temperatur & Feuchtigkeit','sun',[['Temperatur',temperatureText(temp),'°C','Ortsraster'],['Gefühlte Temperatur (Näherung)',temperatureText(comfort.value),'°C',comfort.label],['Taupunkt',temperatureText(dew),'°C','Ortsraster'],['Taupunktdifferenz',localFormat(Number.isFinite(temp)&&Number.isFinite(dew)?Math.max(0,temp-dew):NaN),'K','T minus Taupunkt · berechnet'],['Relative Feuchtigkeit',localFormat(humidity),'%','Berechnet'],m('Oberflächentemperatur','tground','°C'),m('Temperatur (850 hPa)','t850','°C'),m('Lufttemperatur (5 cm)','ground','°C')]],['Niederschlag & Schnee','drop',[['Nächste 6 Stunden',quantityRange(upcoming6),'','Radar-Nowcast + Modell · rollierender Zeitraum'],['Nächste 24 Stunden',quantityRange(upcoming24),'','Stundensummen · nur bei vollständiger Abdeckung'],['Niederschlagsart',phaseDetail.name,'',phaseDetail.source],['Niederschlag (Radar · 5 min)',localFormat(radar?.amount,2),'mm',radar?(radar.instantaneous?'Keine gemessene 5-min-Summe · ':'')+(radar.source||'DWD RY')+' · '+localTime(radar.time,{hour:'2-digit',minute:'2-digit'}):'Nicht verfügbar'],['Niederschlagsintensität (Radar)',localFormat(radar?.rate),'mm/h',radar?(radar.source||'DWD RY')+' · '+(radar.instantaneous?'Momentanrate':'5-min-Mittel'):'Nicht verfügbar'],m('Niederschlagsrate (Modell)','rainrate','mm/h','Mittel über Modellintervall'),m('Schneefallgrenze','snowline','m'),m('Nullgradgrenze','freezing','m'),['Neuschnee heute',snowfallRangeText(days[0]),'','Modell · Tagesmenge'],m('Schneetemperatur','tsnow','°C'),m('Schneewasseräquivalent (SWE)','snowWater','mm','Wasseräquivalent der Schneedecke'),m('Schneedichte','snowDensity','kg/m³','Modellfeld, soweit vorhanden'),m('Niederschlagswahrscheinlichkeit','pop','%'),m('Konvektiver Niederschlag · 24 h','conv','mm'),m('Stratiformer Niederschlag · 24 h','strat','mm')]],['Wind & Luftdruck','wind',[['Windgeschwindigkeit',localFormat(wind),'km/h'],['Windstärke',localFormat(windBeaufort(wind),0),'Bft','Aus 10-m-Modellwind umgerechnet'],m('Windböen','gust','km/h'),m('Wind · 100 m','wind100','km/h'),['Windrichtung',localFormat(frameVal(f,'winddir')),'°','Ortsraster'],['Luftdruck (NN)',localFormat(frameVal(f,'slp')),'hPa','Ortsraster']]],['Wolken, Nebel & Sicht','eye',[m('Gesamtbewölkung','cloud','%'),m('Tiefe Bewölkung','lowcloud','%'),m('Mittelhohe Bewölkung','midcloud','%'),m('Hohe Bewölkung','highcloud','%'),m('Sichtweite','visibility','km'),m('Konvektive Wolkenbasis','cloudbase','m'),m('Konvektive Wolkenobergrenze','cloudtop','m'),m('Niederschlagbares Wasser','pwat','mm')]],['Sonne & Strahlung','sun',[['Sonnenaufgang',solar?localTime(solar.rise,{hour:'2-digit',minute:'2-digit'}):'—','Uhr','Für den ausgewählten Ort astronomisch berechnet'],['Sonnenuntergang',solar?localTime(solar.set,{hour:'2-digit',minute:'2-digit'}):'—','Uhr','Für den ausgewählten Ort astronomisch berechnet'],['Tageslänge',solar?Math.floor(solar.hours)+' h '+Math.round((solar.hours%1)*60)+' min':'—','','Astronomisch berechnet'],solarDetail('sunshine',point),solarDetail('solar',point),m('Sonnenstunden (Prognose)','sunhours','h'),m('UV-Index','uv',''),m('Globalstrahlung (Prognose)','radiation','W/m²','Intervallmittel')]]]; /* Full expert catalogue remains available in the Experten tab. */
 el('weather-right').innerHTML='<section class="panel forecast"><div class="section-head"><div><h2>7-Tage-Trend</h2><p>ICON-D2 → ICON-EU → Globalmodelle · Nachtminimum / Tagesmaximum · Ortszeit</p></div></div>'+dayItems.join('')+'</section><section class="panel parameter-panel"><h2>Wetter im Detail</h2><p class="muted small">Beobachtungsanalyse aus mehreren DWD-Messorten; modellgestützte Analyse ist separat markiert. Böen und Datenzeit je Quelle. — = kein zeitnaher Wert.</p>'+liveDetailGroups(groups,live).map(parameterGroup).join('')+'<button type="button" class="expert-shortcut" id="go-home-expert">Expertenanalyse öffnen <span>Alle vertikalen Profile, Scherungswerte und Gewitterparameter ›</span></button></section>'+modelComparison(point,now)+homeMapCards()+'<p class="demo-note">Quellen: DWD Open Data (SYNOP, RADOLAN RW / RY, HYMEC-NG; ICON-D2-RUC als modellgestützte Analyse; Radar-Rückfallquelle: Bright Sky / DWD RV), ECMWF IFS / AIFS Open Data (CC BY 4.0, © ECMWF), NOAA GFS; Daten gerastert und aufbereitet. Warnhinweise: automatische Basisstufen aus den Ortsprognosen, keine amtlichen Warnungen.</p>';
 deferHomeMaps();fetchLocationForecast(point);cachePointWeather(point);
 const goWarn=el('go-local-warning');if(goWarn)goWarn.onclick=()=>setPage('warnings');
 const expertShortcut=el('go-home-expert');if(expertShortcut)expertShortcut.onclick=()=>setPage('expert');
 document.querySelectorAll('[data-load-model]').forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent='Lädt …';await fetchLocationTile(point,b.dataset.loadModel,'https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/generated-native-'+realModelFiles[b.dataset.loadModel]+'/');if(b.isConnected){b.disabled=false;b.textContent=locationRuns(b.dataset.loadModel,point).length?'Geladen':'Noch nicht verfügbar'}});
 const hourScroll=document.querySelector('#weather-left .hour-scroll');if(hourScroll)hourScroll.scrollLeft=oldScroll;
 document.querySelectorAll('#weather-right details.parameter-group').forEach((d,i)=>{if(i<openGroups.length)d.open=openGroups[i]});
 document.querySelectorAll('#weather-right details.parameter-group summary').forEach(s=>s.addEventListener('click',()=>{if(!s.parentElement.open)fetchPointProfile(point,f)}));if(openGroups.some(Boolean))setTimeout(()=>{if(activePage==='weather'&&pointKey(homeLocationPoint(location))===pointKey(point))fetchPointProfile(point,f)},800);
 document.querySelectorAll('[data-hour]').forEach(b=>b.onclick=()=>{selectedHour=+b.dataset.hour;renderWeather()});
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{openDay=openDay===+b.dataset.day?-1:+b.dataset.day;openPeriod=-1;renderWeather()});
 // Tapping a time block only updates its panel; no forecast recomputation,
 // background downloads, map rebuild, or loss of scroll position.
 function selectPeriod(j){
  const grid=document.querySelector('.day-open .period-grid'),p=days[openDay]?.periods[j];
  if(!grid||!p)return;
  openPeriod=openPeriod===j?-1:j;
  document.querySelector('#period-details')?.remove();
  grid.querySelectorAll('[data-period]').forEach(b=>{
   const active=+b.dataset.period===openPeriod;
   b.classList.toggle('period-active',active);b.setAttribute('aria-expanded',String(active));
   if(active)b.setAttribute('aria-controls','period-details');else b.removeAttribute('aria-controls');
  });
  if(openPeriod>=0)grid.insertAdjacentHTML('afterend',periodDetailHTML(p,j,selectedDayChances[j],details));
  bindPeriodClose();grid.querySelector('[data-period="'+j+'"]')?.focus({preventScroll:true});
 }
 function bindPeriodClose(){const close=document.querySelector('[data-close-period]');if(close)close.onclick=()=>selectPeriod(openPeriod)}
 document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>selectPeriod(+b.dataset.period));bindPeriodClose();
}
function initWeatherData(){
 weatherRealEnabled=true;renderWeather();
 const update=()=>{const p=homeLocationPoint(location);fetchOperaRadar();fetchSwissRadar();fetchRadarPhase();fetchRadarPoints();fetchLocationForecast(p);setTimeout(fetchStationData,3500);setTimeout(fetchRadarNowcast,4500);if(activePage==='warnings')renderLocalWarnings()};update();
 setInterval(()=>{if(!document.hidden){update();if(activePage==='weather')renderWeather()}},5*60000);
 setInterval(()=>{if(!document.hidden&&['weather','map','warnings'].includes(activePage)){refreshRadarClock();if(activePage==='weather'){const p=homeLocationPoint(location);fetchLiveAnalysis(p);if(!currentGridFrame(p))fetchLocationForecast(p,true);if(!ownRadarFresh(radarPointData,12)&&!ownRadarFresh(operaRadarData,20))fetchBrightRadar();refreshLiveHero()}}},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){update();if(activePage==='weather'){fetchLiveAnalysis(homeLocationPoint(location),true);renderWeather()}else if(activePage==='warnings')renderLocalWarnings();else if(activePage==='expert')renderRealExpert()}});window.addEventListener('online',()=>{update();if(activePage==='weather')fetchLiveAnalysis(homeLocationPoint(location),true)});
}
let mapCatalogTask=null;
function warmModelCatalog(){if(mapCatalogTask||document.hidden||navigator.connection?.saveData)return;mapCatalogTask=(async()=>{for(const model of ['ICON-D2','ICON-EU','IFS','GFS','AIFS','AIFS-ENS Control','ICON-D2-RUC']){if(document.hidden)break;await fetchNativeMapModel(model,false,true);if(model==='ICON-D2'||model==='ICON-EU'){const d=mapModelRuns(model,true).find(d=>d.nativeMap&&Date.now()-Date.parse(d.run)<=modelAgeLimit(model)*HOUR_MS);if(d){const h=futureMapHours(d,fields.temp2)[0];if(h!==undefined)for(const id of ['temp2','wind','rainrate'])if(!nativeFieldsReady(d,fields[id],h))fetchNativeMapFields(d,fields[id],h,false)}}}})().finally(()=>{mapCatalogTask=null})}
function renderRealExpert(){
 const point=homeLocationPoint(location),now=Date.now(),f=currentGridFrame(point,now),opened=[...el('expert-data').querySelectorAll('details')].map(d=>d.open);fetchPointProfile(point,f);fetchLocationTile(point,'ICON-D2-RUC',nativeMapRoot('icon-d2-ruc'));
 el('expert-data').innerHTML='<p class="map-profile-note">Ortsbezogene Modellprofile · Originalraster, soweit vorhanden. Zeitpunkt und Modell stehen an jedem Wert. — = Eingangsdaten fehlen.</p>'+realExpertGroups(point,now,f).map(expertParameterGroup).join('');
 el('expert-data').querySelectorAll('details').forEach((d,i)=>{if(i<opened.length)d.open=opened[i]});
 document.querySelectorAll('[data-map-layer]').forEach(b=>b.onclick=()=>{const id=b.dataset.mapLayer,sample=currentParameterAt(id,point,now,f,fields[id]?.interval||0);openMapLayer(id,sample.frame?.d.model||f?.d.model,sample.frame)});
 updateExpertModelAvailability();checkExpertModels();
}
let expertAvailabilityCheck=0;
function updateExpertModelAvailability(){
 for(const node of document.querySelectorAll('[data-expert-availability]')){
  const model=node.dataset.expertAvailability,now=Date.now(),d=mapModelRuns(model,true).find(x=>x.nativeMap&&Date.parse(x.run)<=now&&mapLeadTime(x,x.hours.at(-1))>now);
  const loading=mapFiles(model).some(f=>nativeMapLoading.has(f)||nativeMapLoading.has(f+'-de'));
  node.textContent=d?'Lauf '+timeText(new Date(d.run))+' · '+(now-Date.parse(d.run)>modelAgeLimit(model)*HOUR_MS?'älterer Lauf':(model==='ICON-D2-RUC'?'Hagelprodukt verfügbar':'Originalraster verfügbar')):loading?'Verfügbarkeit wird geprüft …':expertAvailabilityCheck?'Kein Kartenlauf verfügbar':'Noch nicht geprüft';
 }
}
function checkExpertModels(){
 if(Date.now()-expertAvailabilityCheck<120000)return;expertAvailabilityCheck=Date.now();
 for(const model of [...forecastPriority,'ICON-D2-RUC'])fetchNativeMapModel(model,false,true);
 updateExpertModelAvailability();
}
function realExpertGroups(point,now,f){return expertGroups.map(([title,icon,items])=>[title,icon,items.map(([name,_value,unit,desc])=>{const id=expertMapLinks[name],sample=id?currentParameterAt(id,point,now,f,fields[id]?.interval||0):{value:NaN};const method=sample.derived?(id==='lcl'?'LCL aus T/Td und Profil · Näherung':['thetae','lapse','lapse7'].includes(id)?'Berechnet aus Druckflächen':['srh01','srh03','stormrel','ehi03'].includes(id)?'Bunkers-Rechtsläufer · 0–6-km-Profil · Näherung': ['lfc','el','cape','cin','li'].includes(id)?'Bodenluftpaket · Druckflächenprofil · Näherung':'Druckflächenprofil · vertikale Näherung'+(Number.isFinite(frameVal(sample.frame,'orog'))?' · Modellgelände':' · Geländehöhe')):(profileFieldNote(sample.frame?.d,sample.frame?.hour,id)?(expertDerivedDescriptions[id]||'Druckflächenprofil')+' · Näherung':expertDerivedDescriptions[id]);return [name,sample.absent?'Keiner':(['scp','stp','ship','ehi03'].includes(id)?localFormat(sample.value,2):displayValue(sample.value,unit)),sample.absent?'':unit,sample.frame?currentSource(sample.frame)+(method?' · '+method:''):expertDerivedDescriptions[id]||desc||'Eingangsdaten fehlen',!sample.derived&&!!fields[id]];})]);}

// Real observation products and model forecasts, with independent clocks.
let realLiveEnabled=false,radarRevision=0,directRadarTime=NaN,radarClockRequest=null;
const radarImages=new Map();
// The radar uses numeric fields only; no WMS image fallback.
let liveImagery=null,liveImageryRequest=null,liveImageryCheck=0;
const liveImageCache=new Map();
let solarData=null,solarRequest=null,solarCheck=0;
function validSolarPacket(p,id,now=Date.now()){const g=p?.grid,t=Date.parse(p?.time),start=Date.parse(p?.start);return g?.nx===481&&g?.ny===411&&g.step===.02&&g.west===5.5&&g.south===47&&g.missing===-32768&&g.scale===(id==='sunshine'?.1:1)&&p.unit===(id==='sunshine'?'min':'W/m²')&&Number.isFinite(t)&&t<=now&&now-t<=3*3600000&&t-start===3600000&&Array.isArray(p.bounds)&&p.bounds.length===4&&p.bounds.every(Number.isFinite)&&typeof p.png==='string'&&p.png.length<4000000&&typeof p.values==='string'&&p.values.length===4*Math.ceil(g.nx*g.ny*2/3)}
function solarValue(p,point){if(!p||!point)return NaN;const g=p.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(x<0||y<0||x>=g.nx||y>=g.ny)return NaN;const v=packedCell(p.values,y*g.nx+x);return v===g.missing?NaN:v*g.scale}
function solarDetail(id,point){const p=currentLiveImage(id),v=solarValue(p,point);return Number.isFinite(v)?[id==='sunshine'?'Sonnenschein letzte Stunde':'Globalstrahlung letzte Stunde',localFormat(v),p.unit,'DUETT · Rasteranalyse · '+localTime(Date.parse(p.start),{hour:'2-digit',minute:'2-digit'})+'–'+localTime(Date.parse(p.time),{hour:'2-digit',minute:'2-digit'})]:[id==='sunshine'?'Sonnenschein letzte Stunde':'Globalstrahlung letzte Stunde','—',id==='sunshine'?'min':'W/m²','Keine aktuelle Rasteranalyse']}
function fetchSolar(){if(solarRequest)return solarRequest;if(Date.now()-solarCheck<(currentLiveImage('sunshine')&&currentLiveImage('solar')?600000:120000))return;solarCheck=Date.now();solarRequest=(async()=>{try{const url='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/mobile-solar-data/solar.json.gz?t='+Math.floor(Date.now()/600000),r=await fetch(url,{cache:'default',signal:AbortSignal.timeout(10000)});if(!r.ok)return;const a=await r.arrayBuffer(),b=new Uint8Array(a),d=b[0]===31&&b[1]===139?await new Response(new Blob([a]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(a));if(d.schema!==1)return;const products={...solarData};for(const id of solarLayers){const p=d.products?.[id];if(validSolarPacket(p,id)&&(!products[id]||Date.parse(p.time)>=Date.parse(products[id].time))){products[id]=p;prepareLiveImage(id,p)}}solarData=products;radarRevision++;refreshPointUI();scheduleMap()}catch{}})().finally(()=>{solarRequest=null;if(activePage==='map'&&solarLayers.has(liveLayer))scheduleMap()});return solarRequest}
const dopplerRoot='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/doppler-data/';
let dopplerSites=[],dopplerChoice='auto',dopplerRequest=null,dopplerCheck=0;const dopplerPackets=new Map(),dopplerAttempts=new Map();
function validDopplerTime(time){const t=Date.parse(time);return Number.isFinite(t)&&t<=Date.now()&&Date.now()-t<=30*60000}
function selectedDopplerSite(){const [lon,lat]=mapCenter||homeLocationPoint(location)||[10,51];return dopplerSites.filter(s=>validDopplerTime(s.time)&&(dopplerChoice==='auto'||dopplerChoice===s.site)).sort((a,b)=>Math.hypot((a.lon-lon)*Math.cos(lat*Math.PI/180),a.lat-lat)-Math.hypot((b.lon-lon)*Math.cos(lat*Math.PI/180),b.lat-lat))[0]}
function currentLiveImage(id=liveLayer){if(solarLayers.has(id)){const p=solarData?.[id];return validSolarPacket(p,id)?p:null}if(id==='doppler'){const s=selectedDopplerSite(),p=s&&dopplerPackets.get(s.site);return p&&validDopplerTime(p.time)?p:null}const p=liveImagery?.products?.[id],t=Date.parse(p?.time);return p&&Number.isFinite(t)&&t<=Date.now()&&Date.now()-t<(id==='satellite'?45:60)*60000?p:null}
async function fetchDoppler(){
 if(dopplerRequest)return dopplerRequest;
 const before=selectedDopplerSite();if(Date.now()-dopplerCheck<=60000&&(!before||dopplerPackets.get(before.site)?.time===before.time||Date.now()-(dopplerAttempts.get(before.file)||0)<15000))return;
 dopplerRequest=(async()=>{try{
  if(Date.now()-dopplerCheck>60000){dopplerCheck=Date.now();const r=await fetch(dopplerRoot+'index.json?t='+Math.floor(Date.now()/60000),{signal:AbortSignal.timeout(8000)});if(r.ok){const d=await r.json();if(d.schema===1&&Array.isArray(d.sites)){dopplerSites=d.sites.filter(s=>/^[a-z]{3}$/.test(s.site)&&validDopplerTime(s.time)&&Number.isFinite(s.lon)&&Number.isFinite(s.lat)&&new RegExp('^'+s.site+'-[0-9TZ]+\\.json$').test(s.file));const select=el('doppler-site'),previous=dopplerChoice;select.replaceChildren(new Option('Automatisch · nahe Kartenmitte','auto'),...dopplerSites.map(s=>new Option(s.site.toUpperCase(),s.site)));select.value=dopplerSites.some(s=>s.site===previous)?previous:'auto';dopplerChoice=select.value}}}
  const s=selectedDopplerSite();if(!s||dopplerPackets.get(s.site)?.time===s.time)return;dopplerAttempts.set(s.file,Date.now());while(dopplerAttempts.size>32)dopplerAttempts.delete(dopplerAttempts.keys().next().value);
  const r=await fetch(dopplerRoot+s.file,{signal:AbortSignal.timeout(8000)});if(!r.ok)return;const p=await r.json();
  if(p.schema!==1||p.site!==s.site||p.time!==s.time||!validDopplerTime(p.time)||!Array.isArray(p.bounds)||p.bounds.length!==4||!p.bounds.every(Number.isFinite)||typeof p.png!=='string'||p.png.length>6_000_000)return;
  dopplerPackets.set(s.site,p);while(dopplerPackets.size>4)dopplerPackets.delete(dopplerPackets.keys().next().value);prepareLiveImage('doppler',p);radarRevision++;scheduleMap();
 }catch{}})().finally(()=>{dopplerRequest=null;if(activePage==='map'&&liveLayer==='doppler')scheduleMap()});return dopplerRequest;
}
async function fetchLiveImagery(){
 if(liveImageryRequest)return liveImageryRequest;
 if(Date.now()-liveImageryCheck<(currentLiveImage()?120000:15000))return;
 liveImageryCheck=Date.now();
 liveImageryRequest=(async()=>{for(const url of [dataRoot+'live-imagery.json','data/live-imagery.json'])try{
  const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);let d;try{const r=await fetch(url,{cache:'no-cache',credentials:'omit',signal:c.signal});if(!r.ok)continue;d=await r.json()}finally{clearTimeout(timer)}
  if(d.schema!==1||!d.products)continue;
  const products={...liveImagery?.products};for(const id of ['reflectivity','satellite']){const p=d.products[id];if(!p||!Number.isFinite(Date.parse(p.time))||!Array.isArray(p.bounds)||p.bounds.length!==4||!p.bounds.every(Number.isFinite)||typeof p.png!=='string'||p.png.length>6_000_000)continue;if(!products[id]||Date.parse(p.time)>=Date.parse(products[id].time))products[id]=p}
  liveImagery={products};for(const id of ['reflectivity','satellite']){const p=currentLiveImage(id);if(p)prepareLiveImage(id,p)}radarRevision++;if(activePage==='map')scheduleMap();return;
 }catch{}})();try{await liveImageryRequest}finally{liveImageryRequest=null;if(activePage==='map')scheduleMap()}
}
function prepareLiveImage(id,p){
 const key=p.time+'/'+(p.site||'');let entry=liveImageCache.get(id);if(!entry||entry.key!==key){const img=new Image();entry={key,time:p.time,img,state:'loading'};liveImageCache.set(id,entry);img.onload=()=>{entry.state='ready';radarRevision++;scheduleMap()};img.onerror=()=>{entry.state='error';scheduleMap()};img.src='data:image/png;base64,'+p.png}return entry;
}
function drawLiveImage(ctx,b,id){
 if(id==='doppler')fetchDoppler();else if(solarLayers.has(id))fetchSolar();const p=currentLiveImage(id);if(!p)return;
 const entry=prepareLiveImage(id,p);
 if(entry.state==='ready'){const [west,south,east,north]=p.bounds,[x,y]=xy(west,north,b),[r,bot]=xy(east,south,b);ctx.drawImage(entry.img,x,y,r-x,bot-y)}
}
function realStationOverlay(){return false} // The current raster is shown without neighbouring station substitutions.
function validStationRows(layer=liveLayer){const now=Date.now();return (stationData?.stations||[]).filter(s=>Number.isFinite(layer==='wind'?s.wind:s.temp)&&Number.isFinite(Date.parse(s.time))&&Date.parse(s.time)<=now+60000&&now-Date.parse(s.time)<=90*60000)}
function drawRealStations(ctx,b){if(!realStationOverlay())return;const used=new Set(),rows=validStationRows().sort((a,z)=>Date.parse(z.time)-Date.parse(a.time));
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 11px Arial,sans-serif';
 for(const s of rows){if(s.lon<b.west||s.lon>b.east||s.lat<b.south||s.lat>b.north)continue;const [x,y]=xy(s.lon,s.lat,b),key=Math.floor(x/42)+':'+Math.floor(y/32);if(used.has(key))continue;used.add(key);
  const v=liveLayer==='wind'?s.wind:s.temp,color=liveColor(liveLayer,liveLayer==='wind'?{wind:v}:{temp:v});ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=1.8;ctx.strokeStyle='#fff';ctx.stroke();ctx.lineWidth=2.5;ctx.strokeStyle='#15233c';const text=String(Math.round(v));ctx.strokeText(text,x,y);ctx.fillStyle='#fff';ctx.fillText(text,x,y);
 }ctx.restore();
}
function radarBaseTime(){
 const obs=ownRadarObservation();if(obs)return obs.time;
 const now=Date.now(),times=[Date.parse(radarNowcastData?.time)].filter(t=>Number.isFinite(t)&&t<=now&&now-t<20*60000);
 // The requested scan clock can progress even when a directory fetch is blocked.
 // A requested time is not displayed as an actual scan until its image loads.
 return times.length?Math.max(...times):Math.floor((now-10*60000)/300000)*300000;
}
function refreshRadarClock(){return Promise.allSettled([fetchOperaRadar(),fetchSwissRadar(),fetchRadarPoints(),fetchRadarPhase(),refreshObservations()])}
let operaRadarData=null,operaRadarRequest=null,operaRadarCheck=0;
let swissRadarData=null,swissRadarRequest=null,swissRadarCheck=0;
function decodeOperaRadar(d){
 const g=d?.grid;if(d?.schema!==1||d.product!=='OPERA-RATE'||!Number.isFinite(Date.parse(d.time))||!g||g.nx!==1601||g.ny!==1201||g.west!==2||g.south!==45||g.step!==.01||g.scale!==.01||g.missing!==-32768||typeof d.amount!=='string'||d.amount.length!==4*Math.ceil(g.nx*g.ny*2/3))throw Error('Invalid OPERA rate');
 return d;
}
function acceptOperaRadar(d){if(!ownRadarFresh(d,35)||operaRadarData&&Date.parse(d.time)<=Date.parse(operaRadarData.time))return false;operaRadarData=d;if(activePage==='weather'){refreshLiveHero();refreshPointUI()}refreshOwnRadarViews();return true}
function fetchOperaRadar(){
 if(operaRadarRequest)return operaRadarRequest;
 if(Date.now()-operaRadarCheck<60000)return;
 operaRadarCheck=Date.now();if(!operaRadarData)readRadarCache('opera',decodeOperaRadar,acceptOperaRadar);
 operaRadarRequest=fetchRadarSnapshots('opera','opera-radar-data','opera-radar.json.gz',decodeOperaRadar,acceptOperaRadar,'opera').finally(()=>operaRadarRequest=null);return operaRadarRequest;
}
function decodeSwissRadar(d){
 if(d?.product!=='SWISS-RATE')throw Error('Invalid MeteoSwiss PRECIP');
 decodeOperaRadar({...d,product:'OPERA-RATE'});return d;
}
function acceptSwissRadar(d){
 if(!ownRadarFresh(d)||swissRadarData&&Date.parse(d.time)<=Date.parse(swissRadarData.time))return false;
 swissRadarData=d;if(activePage==='weather'){refreshLiveHero();refreshPointUI()}refreshOwnRadarViews();return true;
}
function fetchSwissRadar(){
 if(swissRadarRequest)return swissRadarRequest;
 if(Date.now()-swissRadarCheck<60000)return;
 swissRadarCheck=Date.now();if(!swissRadarData)readRadarCache('swiss',decodeSwissRadar,acceptSwissRadar);
 swissRadarRequest=fetchRadarSnapshots('swiss','swiss-radar-data','swiss-radar.json.gz',decodeSwissRadar,acceptSwissRadar,'swiss').finally(()=>swissRadarRequest=null);return swissRadarRequest;
}
function realLiveBaseDate(){const t=radarBaseTime();return new Date(Number.isFinite(t)?t:Date.now())}
function realLiveTime(){
 if(liveLayer==='satellite'&&liveMinute!==0)return new Date(satelliteTime());
 if(imageLayers.has(liveLayer))return new Date(currentLiveImage()?.time||NaN);
 if(liveHourlyMode()){const d=new Date();d.setUTCHours(liveTempHour,0,0,0);d.setUTCDate(d.getUTCDate()+liveTempDay);return d}
 return new Date(liveLayer==='snowcover'?Date.now():radarBaseTime()+liveMinute*60000);
}
const satelliteFrames=createSatelliteArchive(scheduleMap,decodeRadarPoints);
let forecastCloudCache, lastSatelliteSelection, selectionStarted = 0;
function satelliteTime(){
 const run = Date.parse(radarNowcastData?.time);
 const recentRun = Number.isFinite(run) && run <= Date.now() && Date.now()-run <= 25*60000;
 const base = liveMinute>0 && recentRun ? run : Math.floor(radarBaseTime()/600000)*600000;
 return base+liveMinute*60000;
}
function timelineForecastCloud(time){
 prepareLiveArea(true);
 const f=nativeAreaFrame(time,'cloud',[10,51],true);
 if(!f || time-f.time>=3600000)return null;
 const hour=f.hour, delta=(time-f.time)/3600000, next=delta?hour+1:hour;
 if(!f.d.frames[next]?.cloud)return null;
 const p=fields.cloud;
 for(const h of new Set([hour,next]))fetchNativeMapFields(f.d,p,h);
 const first=f.d.decoded.get(hour+'/cloud'), last=f.d.decoded.get(next+'/cloud');
 if(!first||!last)return null;
 const key=[f.d.file,f.d.generated,time].join('/');
 if(forecastCloudCache?.key===key)return forecastCloudCache;
 const g=f.d.grid,scale=f.d.scales?.cloud??g.scale;
 const values=new Float32Array(first.length);
 for(let i=0;i<values.length;i++){
  const a=first[i]*scale,b=last[i]*scale;
  values[i]=first[i]!==g.missing&&last[i]!==g.missing&&a>=0&&a<=100&&b>=0&&b<=100?a+(b-a)*delta:NaN;
 }
 forecastCloudCache={key,grid:g,values,time,kind:'forecast/'+f.d.generated,source:f.d.model+' · Gesamtbewölkung'+(delta?' · zeitlich interpoliert':'')};
 return forecastCloudCache;
}
const forecastAttempts=new Map();
function timelineRadar(time){
 if(liveMinute<0)return satelliteFrames.file('radar',time);
 const f=ownRadarFrame(new Date(time));
 if(f?.forecast && f.time===time)return f;
 if(Date.now()-(forecastAttempts.get(time)||0)>60000){
  forecastAttempts.set(time,Date.now());
  if(forecastAttempts.size>25)forecastAttempts.delete(forecastAttempts.keys().next().value);
  fetchNowcastMapFrame(new Date(time));
 }
 return null;
}
function selectedSatelliteInfo(){
 const time=satelliteTime(), past=liveMinute<0;
 const img=past?satelliteFrames.file('frames',time):null;
 const mask=past?null:timelineForecastCloud(time);
 const frame=timelineRadar(time);
 return {satellite:true,timeline:true,date:new Date(time),img,mask,frame,available:!!(img||mask),source:past?'© EUMETSAT / NASA · GeoColour':mask?.source||'Wolkenprognose'};
}
function drawTimelineRaster(ctx,b,canvas,bounds){
 const [west,south,east,north]=bounds;
 const [x,y]=xy(west,north,b),[right,bottom]=xy(east,south,b);
 ctx.drawImage(canvas,x,y,right-x,bottom-y);
}
function drawSatelliteTimeline(ctx,b,info){
 if(info.img)drawTimelineRaster(ctx,b,info.img,satelliteFrames.bounds);
 if(info.mask)drawObservedField(ctx,b,'cloud',info.mask);
 const f=info.frame;
 if(!f)return;
 const canvas=ownRadarRaster(f);
 if(canvas){
  const g=f.grid;
  drawTimelineRaster(ctx,b,canvas,[g.west-g.step/2,g.south-g.step/2,g.west+(g.nx-.5)*g.step,g.south+(g.ny-.5)*g.step]);
 }
}
function timelineLabels(info){
 const kind=liveMinute<0?'Rückblick':'Vorhersage',time=timeText(info.date);
 el('map-layer-title').textContent='Satellitenwolken + Niederschlagsradar';
 el('map-model-badge').textContent=kind;
 el('map-overlay-model').textContent=info.available?info.source:'Wolkendaten fehlen';
 el('map-overlay-data').textContent=info.frame?info.frame.source:'Radardaten fehlen';
 el('map-valid').textContent=kind+' · '+time;
 el('map-data-notice').textContent=kind;
 el('map-time-label').textContent=time+' · '+(liveMinute>0?'+':'')+liveMinute+' min';
 el('map-view-description').textContent=info.source;
 el('map-interval').textContent=liveMinute<0?'GeoColour-Aufnahme und gemessene Niederschlagsintensität zum gewählten Zeitpunkt.':'Prognostizierter Bedeckungsgrad und Niederschlags-Nowcast zum gewählten Zeitpunkt.';
}
function timelineWaiting(){
 const info=selectedSatelliteInfo(),key=info.date.getTime();
 if(key!==lastSatelliteSelection){selectionStarted=Date.now();lastSatelliteSelection=key}
 return Date.now()-selectionStarted<6000 && (!info.available || !info.frame || !readyRadarFrame(info.frame,'radar',false));
}

const liveAreaIds={temperature:'temp2',wind:'wind',gust:'gust',radar:'rainrate',types:'rainrate',snowfall:'rainrate',snowcover:'snowdepth'};
function nativeAreaFrame(at,id,point,germany=true){
 const p=fields[id],now=Date.now();if(!p||!Number.isFinite(at))return null;
 const models=germany?coreForecastModels:coreForecastModels.filter(m=>m!=='ICON-D2');
 for(const model of models){
  const runs=[...mapModelRuns(model,germany),...mapModelRuns(model,false)];
  for(const d of runs){if(!d.nativeMap||Date.parse(d.run)>now||now-Date.parse(d.run)>modelAgeLimit(model)*HOUR_MS)continue;
   const g=d.grid;if(point&&(point[0]<g.west-g.step/2||point[0]>g.west+(g.nx-.5)*g.step||point[1]<g.south-g.step/2||point[1]>g.south+(g.ny-.5)*g.step))continue;
   const hour=d.hours.filter(h=>mapLeadTime(d,h)<=at&&mapFieldRequirements(d,p,h).every(([t,k])=>d.frames[t]?.[k])).at(-1),time=mapLeadTime(d,hour);
   if(Number.isFinite(time)&&at-time<=6*HOUR_MS)return {d,hour,time,point};
  }
 }
 return null;
}
function prepareLiveArea(germany=true){
 for(const model of germany?['ICON-D2','ICON-EU']:['ICON-EU','IFS'])fetchNativeMapModel(model,false,germany);
}
function satelliteLayerInfo(){
 const mask=WeatherObservation.cloudField();
 const image=currentLiveImage('satellite');
 const imageTime=Date.parse(image?.time);
 const ready=image&&prepareLiveImage('satellite',image).state==='ready';
 const archive=satelliteFrames.latest(Math.max(Date.now()-45*60000,ready?imageTime:0));
 if(archive)return {satellite:true,useImage:true,img:archive.img,mask:null,date:new Date(archive.time),
  source:'© EUMETSAT / NASA · GeoColour',available:true,kind:'Beobachtung'};
 const useImage=Boolean(ready);
 return {
  satellite:true, useImage, mask:useImage?null:mask,
  date:new Date(useImage?imageTime:mask?.time??NaN),
  source:useImage?image.source:mask?.source||'DWD / EUMETSAT',
  available:useImage||!!mask, kind:'Beobachtung'
 };
}
function drawSatelliteClouds(ctx,b,info){
 if(info.useImage){
  ctx.save();
  ctx.globalAlpha=0.85;
  if(info.img)drawTimelineRaster(ctx,b,info.img,satelliteFrames.bounds);
  else drawLiveImage(ctx,b,'satellite');
  ctx.restore();
 }else if(info.mask){
  drawObservedField(ctx,b,'cloud');
 }
}
function realLiveInfo(){
 if(liveLayer==='satellite')return liveMinute===0?satelliteLayerInfo():selectedSatelliteInfo();
 if(imageLayers.has(liveLayer)){if(liveLayer==='doppler')fetchDoppler();else if(solarLayers.has(liveLayer))fetchSolar();const p=currentLiveImage();return {date:new Date(p?.time||NaN),image:true,available:!!p,source:p?.source||(solarLayers.has(liveLayer)?'DUETT · Rasteranalyse':liveLayer==='satellite'?'EUMETSAT / NASA':liveLayer==='doppler'?'DWD VRADH · Radialwind':'DWD DMAX'),kind:'Beobachtung'}}
 const date=realLiveTime(),radar=['radar','types','snowfall'].includes(liveLayer)&&!liveHourlyMode();
 if(radar){const t=radarBaseTime();return {date,radar:true,available:Number.isFinite(t)&&Date.now()-t<60*60000,source:'EUMETNET OPERA / MeteoSwiss / DWD',kind:liveMinute>0?'Radarprognose':'Radar-Messung'}}
 const models=mapRegion==='Europa'?forecastPriority.filter(m=>m!=='ICON-D2'):forecastPriority,atCurrent=liveTempDay===0&&liveTempHour===new Date().getUTCHours();
 const id=liveAreaIds[liveLayer],center=mapCenter||[10,51];
 if(atCurrent&&['temp2','wind','gust'].includes(id)&&typeof WeatherObservation!=='undefined'){
  const observedGrid=WeatherObservation.mapField(id);if(observedGrid||id!=='gust')return {date:new Date(observedGrid?.time??NaN),observedGrid,available:!!observedGrid,source:observedGrid?.source||'Keine aktuelle Analyse',kind:observedGrid?.stale?'Letzte verfügbare Analyse (älter als 90 Min.)':observedGrid?.kind==='analysis'?'Messdatengestützte Analyse (+0 h)':'Beobachtungsanalyse'};
 }
 let model=id?(nativeAreaFrame(date.getTime(),id,center,mapRegion==='Deutschland')||(atCurrent?currentGridFrame([10,51],Date.now(),models):chooseLocationModel(date.getTime(),[10,51],false,models))):null;
 if(model?.d.pointLocation)model=null;
 const stations=realStationOverlay()&&validStationRows().length>0;
 return {date:model?new Date(model.time):date,model,stations,available:stations||!!model&&(liveLayer!=='snowcover'||model.d.frames[model.hour]?.snowdepth!=null),source:model?.d.model|| (stations?'DWD-Stationen':'Keine Daten'),kind:model?'Modellprognose':'Stationsmessungen'};
}
function realLiveSample(lon,lat,at=realLiveTime().getTime(),model=null){
 const f=model?{...model,point:[lon,lat]}:currentGridFrame([lon,lat],at);
 return {temp:frameVal(f,'temp2'),wind:frameVal(f,'wind'),gust:frameVal(f,'gust'),direction:frameVal(f,'winddir'),rate:frameVal(f,'rainrate'),cover:frameVal(f,'snowdepth'),type:'rain',snowfall:NaN};
}
// One geographically fixed radar frame serves the home preview, map,
// fullscreen and pans/zooms; WMS imagery is never requested per viewport.
const radarCoverage=[2,45,18,57];

// Direct, CORS-enabled RV fallback avoids waiting for delayed GitHub jobs.
// Bright Sky uses an ellipsoidal stereographic grid, not lat/lon pixels.
const brightRadarGrid={west:2,south:45,step:.01,nx:1601,ny:1201,scale:.01,missing:-32768};
let brightRadarMapping=null,brightRadarCheck=0,brightRadarRequest=null;
const brightRadarFrames=new Map(),brightRadarPending=new Map(),brightRadarChecks=new Map();
function brightRadarIndex(lon,lat){
 const e=Math.sqrt(1-(6356752.3142451802/6378137)**2),r=Math.PI/180;
 const t=p=>Math.tan(Math.PI/4-p/2)/((1-e*Math.sin(p))/(1+e*Math.sin(p)))**(e/2);
 const ref=60*r,m=Math.cos(ref)/Math.sqrt(1-e*e*Math.sin(ref)**2),rho=6378137*m*t(lat*r)/t(ref),a=(lon-10)*r;
 const x=Math.round((543196.83521776402+rho*Math.sin(a))/1000),y=Math.round((rho*Math.cos(a)-3622588.8619310018)/1000);
 return x>=0&&x<1100&&y>=0&&y<1200?y*1100+x:-1;
}
function brightRadarRegrid(raw){
 if(raw.byteLength!==1200*1100*2)throw Error('Unexpected RV size');
 const g=brightRadarGrid,n=g.nx*g.ny,src=new DataView(raw);
 if(!brightRadarMapping){
  const indices=new Int32Array(n),e=Math.sqrt(1-(6356752.3142451802/6378137)**2),r=Math.PI/180,t=p=>Math.tan(Math.PI/4-p/2)/((1-e*Math.sin(p))/(1+e*Math.sin(p)))**(e/2),ref=60*r,k=6378137*Math.cos(ref)/Math.sqrt(1-e*e*Math.sin(ref)**2)/t(ref);
  const sin=Array.from({length:g.nx},(_,i)=>Math.sin((g.west+i*g.step-10)*r)),cos=Array.from({length:g.nx},(_,i)=>Math.cos((g.west+i*g.step-10)*r));
  for(let y=0;y<g.ny;y++){const rho=k*t((g.south+y*g.step)*r);for(let x=0;x<g.nx;x++){const ix=Math.round((543196.83521776402+rho*sin[x])/1000),iy=Math.round((rho*cos[x]-3622588.8619310018)/1000);indices[y*g.nx+x]=ix>=0&&ix<1100&&iy>=0&&iy<1200?iy*1100+ix:-1}}
  brightRadarMapping=indices;
 }
 const out=new Uint8Array(n*2),v=new DataView(out.buffer);
 for(let i=0;i<n;i++){const j=brightRadarMapping[i],a=j<0?-32768:src.getInt16(j*2,true);v.setInt16(i*2,a>=0?a:-32768,true)}
 let str='';for(let i=0;i<out.length;i+=16384)str+=String.fromCharCode(...out.subarray(i,i+16384));return btoa(str);
}
function brightRadarRecord(record,now=Date.now()){
 const time=Date.parse(record?.timestamp),base=Date.parse(record?.source?.split('::').at(-1));
 if(!/^RADAR(?:COMP|OLAN)::RV::/.test(record?.source||'')||!Number.isFinite(time)||!Number.isFinite(base)||base>now||time<base||time-base>120*60000||typeof record.precipitation_5!=='string')return null;
 return {record,time,base,forecast:time>base};
}
async function brightRadarFetch(start,end){
 const url='https://api.brightsky.dev/radar?'+new URLSearchParams({date:new Date(start).toISOString(),last_date:new Date(end).toISOString(),format:'compressed'});
 const r=await fetch(url,{signal:AbortSignal.timeout(15000),credentials:'omit',cache:'default',priority:'high'});if(!r.ok)throw Error('RV API '+r.status);
 const j=await r.json();if(!Array.isArray(j.radar))throw Error('Invalid radar response');return j.radar.map(r=>brightRadarRecord(r)).filter(Boolean);
}
async function brightRadarUnpack(row){
 const b=Uint8Array.from(atob(row.record.precipitation_5),c=>c.charCodeAt(0)),raw=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
 return brightRadarRegrid(raw);
}
function fetchBrightRadar(){
 if(brightRadarRequest)return brightRadarRequest;
 if(Date.now()-brightRadarCheck<60000)return;
 brightRadarCheck=Date.now();brightRadarRequest=(async()=>{try{
  const end=Math.floor(Date.now()/300000)*300000-5*60000;let row;for(const t of [end,end-5*60000,end-10*60000]){row=(await brightRadarFetch(t,t)).find(r=>!r.forecast&&Date.now()-r.time<=20*60000);if(row)break}if(!row)return;
  if(radarPointData&&Date.parse(radarPointData.time)>=row.time)return;
  const amount=await brightRadarUnpack(row);acceptRadarPoints({schema:1,product:'RV-observation',source:'DWD RV / Bright Sky',time:new Date(row.time).toISOString(),grid:brightRadarGrid,intervalMinutes:5,amount});
 }catch{} })().finally(()=>brightRadarRequest=null);return brightRadarRequest;
}
function fetchBrightRadarFrame(date){
 const t=date.getTime();if(!Number.isFinite(t)||t<Date.now()-120*60000||t>Date.now()+120*60000||brightRadarPending.has(t)||Date.now()-(brightRadarChecks.get(t)||0)<60000)return;
 brightRadarChecks.set(t,Date.now());while(brightRadarChecks.size>45)brightRadarChecks.delete(brightRadarChecks.keys().next().value);
 const task=(async()=>{try{const row=(await brightRadarFetch(t,t)).find(r=>r.time===t&&(t>Date.now()?r.forecast&&Date.now()-r.base<=25*60000:!r.forecast));if(!row)return;const amount=await brightRadarUnpack(row);brightRadarFrames.set(t,{time:t,grid:brightRadarGrid,amount,source:'RV / Bright Sky'+(row.forecast?' · Prognose':''),forecast:row.forecast,key:'bright/'+t+'/'+row.base});while(brightRadarFrames.size>10)brightRadarFrames.delete(brightRadarFrames.keys().next().value);refreshOwnRadarViews()}catch{}})().finally(()=>brightRadarPending.delete(t));brightRadarPending.set(t,task);
}


// Model-derived phase is explicitly an estimate; never infer hail/ice from echo strength.
function phaseCodeFromModel(ww,type,t,td,rh,wet=true){
 if(!wet)return 0;
 if([56,57].includes(ww)||type===12)return 4;
 if([66,67].includes(ww)||type===3)return 5;
 if([68,69,83,84].includes(ww)||type===7)return 6;
 if([70,71,72,73,74,75,77,85,86].includes(ww)||[5,6].includes(type))return 7;
 if([87,88].includes(ww))return 8;
 if(type===8)return 11;
 if([89,90,96,99].includes(ww))return 9;
 const drizzle=[50,51,52,53,54,55,58,59].includes(ww);
 if(!(rh>=5&&rh<=100)&&Number.isFinite(t)&&Number.isFinite(td))rh=Math.min(100,Math.max(5,100*Math.exp(17.625*td/(243.04+td)-17.625*t/(243.04+t))));
 // Wet-bulb estimation only within the approximation's range. It does not
 // distinguish freezing rain or hail without an explicit model phase.
 const tw=Number.isFinite(t)&&t>=-20&&t<=50&&rh>=5&&rh<=100?t*Math.atan(.151977*Math.sqrt(Math.min(rh,99)+8.313659))+Math.atan(t+rh)-Math.atan(rh-1.676331)+.00391838*rh**1.5*Math.atan(.023101*rh)-4.686035:NaN;
 if(Number.isFinite(tw)&&tw<=.5)return 7;
 if(Number.isFinite(tw)&&tw<=1.5)return 6;
 if(tw>1.5)return drizzle?2:3;
 // A sufficiently cold/warm 2 m value can constrain phase even without RH.
 if(Number.isFinite(t)&&t<=-2)return 7;
 if(Number.isFinite(t)&&t>=4)return drizzle?2:3;
 // A warm-rain code alone cannot reliably resolve the near-freezing
 // transition layer. Without temperature corroboration show unknown.
 return 1;
}
const radarTypeNames={0:'Trocken',1:'Niederschlagsart unbestimmt',2:'Sprühregen',3:'Regen',4:'Gefrierender Sprühregen',5:'Gefrierender Regen',6:'Schneeregen',7:'Schnee',8:'Graupel',9:'Hagel',10:'Großer Hagel',11:'Eiskörner'};
function modelPhaseAtPoint(f,wet=true){
 if(!f)return 1;
 return phaseCodeFromModel(frameVal(f,'ww'),frameVal(f,'ptype'),frameVal(f,'temp2'),frameVal(f,'dew'),frameVal(f,'rh2'),wet);
}
function localRadarPhaseDetail(f,radar,point,now){
 const ph=resolveLivePhase(point,radar,now);
 if(ph&&ph.code!==1)return {name:radarTypeNames[ph.code],source:ph.source||'DWD HymecNG · '+localTime(ph.time,{hour:'2-digit',minute:'2-digit'})};
 if(radar&&radar.rate===0)return {name:'Trocken im Radar',source:radar.source||'DWD RY'};
 return {name:radar?.rate>0?'Niederschlag · Art unbestimmt':'—',source:'Keine passende aktuelle Phase'};
}
// Obtain spatial model inputs only when a typed radar is drawn. Cache the
// classification per model cell, so the native radar grid remains responsive.
const radarModelCellCache=new Map();
function radarPhaseModels(at,forecast=false){
 if(!forecast)return [];
 if(typeof mapModelRuns!=='function'||typeof prepareLiveArea!=='function')return [];
 prepareLiveArea(true);
 const models=['ICON-D2','ICON-EU','IFS','GFS'],out=[],ids=['temp2','dew','rh2','ww','ptype'];
 for(const model of models){
  const candidates=[...new Set([...mapModelRuns(model,true),...mapModelRuns(model,false),...modelRuns(model)])];
  const maxAge=(forecast?4*60:90)*60000;
  for(const d of candidates.filter(d=>!d.pointLocation&&Date.parse(d.run)<=Date.now()&&Date.now()-Date.parse(d.run)<=modelAgeLimit(model)*3600000&&d.hours.some(h=>mapLeadTime(d,h)<=at&&at-mapLeadTime(d,h)<=maxAge&&d.frames[h]?.temp2))){
  const hour=d.hours.filter(h=>mapLeadTime(d,h)<=at&&d.frames[h]?.temp2).at(-1),time=mapLeadTime(d,hour);
  if(!Number.isFinite(time)||at-time>maxAge)continue;
  if(d.nativeMap&&out.length<2)for(const id of ids)if(d.frames[hour]?.[id]&&!d.decoded.has(hour+'/'+id))fetchNativeMapFields(d,{id,interval:0},hour);
  const ready=ids.filter(id=>d.nativeMap?d.decoded.has(hour+'/'+id):typeof d.frames[hour]?.[id]==='string');
  if(!ready.includes('temp2')&&!ready.includes('ww')&&!ready.includes('ptype'))continue;
  const key=[d.model,d.file||'',d.run,d.generated,hour,ready.join(',')].join('/');let cells=radarModelCellCache.get(key);if(!cells){cells=new Uint8Array(d.grid.nx*d.grid.ny);radarModelCellCache.set(key,cells);while(radarModelCellCache.size>8)radarModelCellCache.delete(radarModelCellCache.keys().next().value)}
  out.push({d,hour,time,key,cells,fieldValues:d.nativeMap?Object.fromEntries(ready.map(id=>[id,d.decoded.get(hour+'/'+id)])):null});break;
  }
 }
 if(!out.length){fetchNativeMapModel('IFS',false,true);fetchNativeMapModel('GFS',false,false);}
 return out;
}
function radarModelPhase(models,lon,lat){
 for(const m of models||[]){const g=m.d.grid,x=Math.round((lon-g.west)/g.step),y=Math.round((lat-g.south)/g.step);
  if(x<0||y<0||x>=g.nx||y>=g.ny)continue;
  const n=y*g.nx+x;
  if(!m.cells[n]){
   // These are five scalar fields at the same cell. Avoid recalculating
   // coordinates and running general derived-parameter logic five times.
   const get=id=>{const d=m.d;if(!d.nativeMap)return realModelValue(d,{id},lon,lat,m.hour);const v=m.fieldValues?.[id]?.[n],scale=id==='ww'?1:d.scales?.[id]??g.scale;return v===undefined||v===g.missing||!(scale>0)?NaN:v*scale};
   m.cells[n]=phaseCodeFromModel(get('ww'),get('ptype'),get('temp2'),get('dew'),get('rh2'),true)||1
  }
  if(m.cells[n]>1)return m.cells[n];
 }return 1;
}
function ownRadarWithModels(frame){
 if(!frame?.forecast||(!frame.amount&&!frame.rateSources))return frame;
 const models=radarPhaseModels(frame.time,!!frame.forecast);if(!models.length)return frame;
 return {...frame,models,key:frame.key+'/model/'+models.map(m=>m.key).join('|')};
}


// Own radar renderer. Raw grid data are observations/nowcasts, not RGB images.
// Only combine intensity and phase when their observation times and grids match.
const ownRadarCache=new Map();
const ownRadarColors={
 1:['#a0dbff','#68baff','#3694ee','#215ad4','#4b1594'],
 2:['#a0dbff','#68baff','#3694ee','#215ad4','#4b1594'],
 3:['#319dff','#0879df','#1260dc','#2736b7','#56178e'],
 4:['#ffd790','#ffb34c','#f68727','#e74b1b','#ae2c12'],
 5:['#ffd790','#ffb34c','#f68727','#e74b1b','#ae2c12'],
 6:['#d6c6ff','#ac94f5','#8c63e8','#7441c5','#4f2390'],
 7:['#f9a1d7','#f36aba','#e239a1','#ba247f','#861557'],
 8:['#dfddff','#b1bcff','#8894ed','#656ace','#5149a2'],
 9:['#ff49e9','#ff20e2','#ff00d4','#f000c7','#d800ad'],
 10:['#ff49e9','#ff20e2','#ff00d4','#f000c7','#d800ad'],
 11:['#bfedff','#82ccf3','#49a5d8','#267cb1','#15537e']
};
function ownRadarTier(rate){return rate<.5?0:rate<2?1:rate<5?2:rate<15?3:4}
function ownRadarMatch(a,b){return !!a&&!!b&&['nx','ny','west','south','step'].every(k=>Math.abs(a[k]-b[k])<1e-8)}
function ownRadarFresh(d,minutes=20,now=Date.now()){const t=Date.parse(d?.time);return Number.isFinite(t)&&t<=now&&now-t<=minutes*60000}
// Independent delivery paths: European OPERA and Switzerland provide
// complementary composites. Pick a valid per-cell measurement based on
// priority and recency, retaining an observed zero and marking missing data.
function radarObservationSources(now=Date.now()){
 const rows=[
  [typeof operaRadarData==='undefined'?null:operaRadarData,1,'EUMETNET OPERA · CC BY 4.0',0],
  [typeof swissRadarData==='undefined'?null:swissRadarData,1,'MeteoSwiss PRECIP',1],
  [typeof radarPointData==='undefined'?null:radarPointData,12,typeof radarPointData!=='undefined'?(radarPointData?.source||'DWD RY'):'DWD RY',2]
 ];
 return rows.filter(([d])=>ownRadarFresh(d,20,now)).map(([d,factor,source,priority])=>({time:Date.parse(d.time),grid:d.grid,amount:d.amount,rateFactor:factor,source,priority})).sort((a,b)=>b.time-a.time||a.priority-b.priority);
}
// European composite first, Swiss national composite second; DWD is a
// supplementary source. A substantially newer valid measurement can take
// precedence; missing pixels fall back geographically, never to invented rain.
const RADAR_SOURCE_TOLERANCE_MS=10*60000;
function useMatchedPhase(primaryTime,pairTime,phaseTime){return Number.isFinite(pairTime)&&Math.abs(primaryTime-phaseTime)>300000&&Math.abs(pairTime-phaseTime)<=300000&&Math.abs(primaryTime-pairTime)<=10*60000;}
function selectRadarSample(rows,phase=null){
 const samples=(rows||[]).filter(Boolean);if(!samples.length)return null;
 const latest=Math.max(...samples.map(s=>s.time));
 const ranked=samples.filter(s=>latest-s.time<=RADAR_SOURCE_TOLERANCE_MS),prefer=(best,s)=>!best||(s.priority??2)<(best.priority??2)||(s.priority??2)===(best.priority??2)&&s.time>best.time?s:best;
 const primary=ranked.reduce(prefer,null),pair=phase?.code>=2&&phase.code<=10?ranked.filter(s=>s.rate>0&&Math.abs(s.time-phase.time)<=300000).reduce(prefer,null):null;
 return pair&&(primary.rate>0||pair.time>primary.time)&&useMatchedPhase(primary.time,pair.time,phase.time)?pair:primary;
}
function radarPacketPhase(d,point,now=Date.now()){
 if(!ownRadarFresh(d,20,now))return null;const g=d.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(x<0||x>=g.nx||y<0||y>=g.ny)return null;const i=y*g.nx+x,o=Math.floor(i/3)*4,code=atob(d.classes.slice(o,o+4)).charCodeAt(i%3);return code<=10?{code,time:Date.parse(d.time)}:null
}
function radarSourceCell(source,point){
 const g=source.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);
 if(x<0||y<0||x>=g.nx||y>=g.ny)return null;
 const v=packedCell(source.amount,y*g.nx+x);if(!Number.isFinite(v)||v<0)return null;
 return {rate:v*g.scale*source.rateFactor,amount:source.rateFactor===12?v*g.scale:NaN,time:source.time,source:source.source,priority:source.priority,instantaneous:source.rateFactor===1};
}
function pointRadarAt(point,now=Date.now()){
 if(!point)return null;
 return selectRadarSample(radarObservationSources(now).map(s=>radarSourceCell(s,point)),radarPacketPhase(typeof radarPhaseData==='undefined'?null:radarPhaseData,point,now));
}
function ownRadarObservation(){
 const sources=radarObservationSources(),latest=Math.max(...sources.map(s=>s.time));
 const ph=typeof radarPhaseData!=='undefined'&&ownRadarFresh(radarPhaseData)?radarPhaseData:null;
 const base=sources.find(s=>s.time===latest),pt=Date.parse(ph?.time);
 if(!base)return null; // A phase classification alone is not a measured intensity raster.
 const rateSources=sources.filter(s=>ownRadarMatch(base.grid,s.grid));
 const phase=ph&&rateSources.some(s=>Math.abs(s.time-pt)<=5*60000)&&ownRadarMatch(base.grid,ph.grid)?ph:null;
 return {time:latest,grid:base.grid,amount:base.amount,rateFactor:base.rateFactor,rateSources,classes:phase?.classes,phaseTime:phase?pt:null,source:[...rateSources].sort((a,b)=>a.priority-b.priority).map(s=>s.source).join(' + ')+(phase?' · Phase: DWD HymecNG':''),key:'multi-priority/'+rateSources.map(s=>s.source+'/'+s.time).join('|')+'/'+(phase?pt:'model')};
}
function ownRadarFrame(date,latest=false){
 const obs=ownRadarObservation();if(obs&&(latest||obs.time===date.getTime()))return ownRadarWithModels(obs);
 const t=date.getTime(),rv=typeof radarNowcastData!=='undefined'?radarNowcastData:null;
 if(typeof nowcastMapFrames!=='undefined'&&nowcastMapFrames.has(t)){const f=nowcastMapFrames.get(t),base=Number(f.key.split('/')[1]);if(Date.now()-base<=25*60000)return ownRadarWithModels(f)}
 if(!rv?.pointOnly&&ownRadarFresh(rv,25)&&t>radarBaseTime()){
  const base=Date.parse(rv.time),lead=(t-base)/60000,amount=rv.frames?.[lead];
  if(lead>=5&&lead<=120&&typeof amount==='string')return ownRadarWithModels({time:t,grid:rv.grid,amount,source:'RV · Prognose',forecast:true,key:'fc/'+base+'/'+lead});
 }
 // Recent observed frames are kept in memory; never reuse a prediction as observation.
 if(brightRadarFrames.has(t))return ownRadarWithModels(brightRadarFrames.get(t));
 for(const entry of ownRadarCache.values())if(!entry.frame.forecast&&entry.frame.time===t)return entry.frame;
 return null;
}
function ownRadarPixel(frame,point){
 const g=frame.grid,x=Math.round((point[0]-g.west)/g.step),y=Math.round((point[1]-g.south)/g.step);if(x<0||x>=g.nx||y<0||y>=g.ny)return null;
 const n=y*g.nx+x,phaseCode=frame.classes?atob(frame.classes.slice(Math.floor(n/3)*4,Math.floor(n/3)*4+4)).charCodeAt(n%3):255,sample=selectRadarSample(frame.rateSources?.map(s=>radarSourceCell(s,point)),{code:phaseCode,time:frame.phaseTime}),v=!frame.rateSources&&frame.amount?packedCell(frame.amount,n):NaN,rate=sample?sample.rate:v>=0?v*g.scale*(frame.rateFactor??12):NaN;
 const time=sample?.time??frame.time,source=sample?.source??frame.source,code=Math.abs(time-frame.phaseTime)<=5*60000?phaseCode:255;
 if(!Number.isFinite(rate))return null;
 if(rate===0)return {code:0,rate,estimated:false,source,time};
 if(rate>0&&code>=2&&code<=11)return {code,rate,estimated:false,source,time};
 if(rate>0){const modelCode=frame.forecast?radarModelPhase(frame.models,...point):1;return {code:modelCode,rate,estimated:modelCode>1,source,time};}
 if(code===1)return {code:1,rate,estimated:false,source,time};return null;
}
function drawOwnRadarSymbols(ctx,b,frame,mode='radar'){
 if(!frame)return 0;let count=0;ctx.save();
 for(let y=24;y<b.h-12;y+=55)for(let x=24;x<b.w-12;x+=55){
  let p=null,sx=x,sy=y;for(const [dx,dy] of [[0,0],[-12,0],[12,0],[0,-12],[0,12]]){const a=ownRadarPixel(frame,lonlat(x+dx,y+dy,b));if(a&&[4,5,6,7,8,9,10,11].includes(a.code)&&(mode!=='snowfall'||[6,7].includes(a.code))){p=a;sx=x+dx;sy=y+dy;break}}
  if(!p)continue;
  if(p.code===6){liveSymbolPath(ctx,'rain',sx-6,sy,5);liveSymbolPath(ctx,'snow',sx+6,sy,5)}
  else if(p.code===7)liveSymbolPath(ctx,'snow',sx,sy,7);
  else if([4,5].includes(p.code))liveSymbolPath(ctx,'freezing',sx,sy,7);
  else{ctx.beginPath();ctx.arc(sx,sy,4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#172638';ctx.lineWidth=2;ctx.stroke()}
  count++;
 }ctx.restore();return count;
}
let radarRasterJob=null,radarRasterWorker=null,radarWorkerFailed=false,radarWarmTimer=null;
// Same synchronized-phase selection in point lookup and both raster paths.
function radarPackedSelection(sources,i,phaseCode,phaseTime,tolerance,defaultTime){
 let latest=-Infinity,priority=Infinity,pairPriority=Infinity,rate=NaN,time=defaultTime,pairRate=NaN,pairTime=NaN;
 for(const s of sources){const v=(s.data.charCodeAt(i*2)|(s.data.charCodeAt(i*2+1)<<8))<<16>>16;if(v<0)continue;if(latest===-Infinity)latest=s.time;if(latest-s.time>tolerance)break;
  if(s.priority<priority){rate=v*s.factor;time=s.time;priority=s.priority}
  if(phaseCode>=2&&phaseCode<=10&&v>0&&Math.abs(s.time-phaseTime)<=300000&&s.priority<pairPriority){pairRate=v*s.factor;pairTime=s.time;pairPriority=s.priority}
 }
 return (rate>0||pairTime>time)&&useMatchedPhase(time,pairTime,phaseTime)?[pairRate,pairTime]:[rate,time];
}
// The worker receives only the fields needed for this image, not whole model runs.
function radarWorkerPaint(frame,mode,colors,tolerance){
 const g=frame.grid,n=g.nx*g.ny,pixels=new Uint32Array(n),palette={};
 for(const [code,cs] of Object.entries(colors))palette[code]=cs.map(hex=>{const v=parseInt(hex.slice(1),16);return new Uint32Array(new Uint8Array([v>>16,v>>8&255,v&255,224]).buffer)[0]});
 const missing=new Uint32Array(new Uint8Array([100,110,125,65]).buffer)[0];
 const sources=frame.rateSources?.map(s=>({data:atob(s.amount),factor:s.rateFactor*s.grid.scale,time:s.time,priority:s.priority??2})),amount=!sources&&frame.amount?atob(frame.amount):null,classes=frame.classes?atob(frame.classes):null;
 if((amount&&amount.length!==n*2)||(classes&&classes.length!==n)||sources?.some(s=>s.data.length!==n*2))throw Error('Invalid raster');
 for(const m of frame.models||[])m.cells=new Uint8Array(m.d.grid.nx*m.d.grid.ny);
 for(let y=0;y<g.ny;y++)for(let x=0;x<g.nx;x++){
  const i=y*g.nx+x,out=(g.ny-1-y)*g.nx+x;let rate=NaN,time=frame.time;
  if(sources)[rate,time]=radarPackedSelection(sources,i,classes?.charCodeAt(i),frame.phaseTime,tolerance,frame.time);
  else if(amount){const v=(amount.charCodeAt(i*2)|amount.charCodeAt(i*2+1)<<8)<<16>>16;if(v>=0)rate=v*g.scale*(frame.rateFactor??12)}
  if(!Number.isFinite(rate))continue;if(!(rate>0))continue;
  let code=classes&&Math.abs(time-frame.phaseTime)<=300000?classes.charCodeAt(i):255;
  if(code===0||code===1||code===255)code=frame.forecast?radarModelPhase(frame.models,g.west+x*g.step,g.south+y*g.step):1;
  if(mode==='snowfall'&&code!==6&&code!==7)continue;
  pixels[out]=(palette[code]||palette[1])[mode==='types'?2:ownRadarTier(rate)];
 }return pixels.buffer;
}
function rememberRadarRaster(key,frame,mode,canvas){ownRadarCache.set(key,{canvas,frame,mode});while(ownRadarCache.size>6)ownRadarCache.delete(ownRadarCache.keys().next().value)}
function startRadarWorker(frame,mode,key){
 if(radarWorkerFailed||typeof Worker==='undefined'||frame.models?.some(m=>!m.d.nativeMap))return false;
 try{
  if(!radarRasterWorker){const src=[phaseCodeFromModel,radarModelPhase,ownRadarTier,useMatchedPhase,radarPackedSelection,radarWorkerPaint].map(f=>f.toString()).join('\n')+'\nonmessage=e=>{try{const p=e.data,b=radarWorkerPaint(p.frame,p.mode,p.colors,p.tolerance);postMessage({key:p.key,b},[b])}catch{postMessage({key:e.data.key,error:true})}}';const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));try{radarRasterWorker=new Worker(url)}finally{URL.revokeObjectURL(url)}}
  const job={key,worker:true};radarRasterJob=job;
  const fail=()=>{if(radarRasterJob!==job)return;clearTimeout(job.timeout);radarRasterWorker?.terminate();radarRasterWorker=null;radarWorkerFailed=true;radarRasterJob=null;refreshOwnRadarViews()};
  job.timeout=setTimeout(fail,15000);radarRasterWorker.onerror=fail;
  radarRasterWorker.onmessage=e=>{if(radarRasterJob!==job||e.data.key!==key)return;if(e.data.error)return fail();try{const c=document.createElement('canvas');c.width=frame.grid.nx;c.height=frame.grid.ny;const ctx=c.getContext('2d'),im=ctx.createImageData(c.width,c.height);im.data.set(new Uint8ClampedArray(e.data.b));ctx.putImageData(im,0,0);rememberRadarRaster(key,frame,mode,c);clearTimeout(job.timeout);radarRasterJob=null;refreshOwnRadarViews()}catch{fail()}};
  radarRasterWorker.postMessage({key,mode,colors:ownRadarColors,tolerance:RADAR_SOURCE_TOLERANCE_MS,frame:{...frame,models:frame.models?.map(m=>({d:{nativeMap:true,grid:m.d.grid,scales:m.d.scales},fieldValues:m.fieldValues}))}});return true;
 }catch{radarWorkerFailed=true;radarRasterWorker?.terminate();radarRasterWorker=null;radarRasterJob=null;return false}
}
function ownRadarRaster(frame,mode='radar'){
 const cacheKey=mode==='radar'?frame.key:frame.key+'/'+mode;let cached=ownRadarCache.get(cacheKey);if(cached){ownRadarCache.delete(cacheKey);ownRadarCache.set(cacheKey,cached);return cached.canvas}
 if(radarRasterJob?.key===cacheKey)return null;
 // Allow a running worker to finish; never enqueue unbounded full-size frames.
 if(radarRasterJob?.worker)return null;
 radarRasterJob=null;
 const g=frame.grid,n=g.nx*g.ny,c=document.createElement('canvas');c.width=g.nx;c.height=g.ny;
 if(n>65536&&startRadarWorker(frame,mode,cacheKey))return null;
 const ctx=c.getContext('2d');if(!ctx)return null;
 const im=ctx.createImageData(g.nx,g.ny),pixels=new Uint32Array(im.data.buffer);
 // Build the RGBA lookup using typed arrays (native byte order).
 const palette={};for(const [code,colors] of Object.entries(ownRadarColors))palette[code]=colors.map(hex=>{const v=parseInt(hex.slice(1),16),b=new Uint8Array([v>>16,(v>>8)&255,v&255,224]);return new Uint32Array(b.buffer)[0]});
 const missingColor=new Uint32Array(new Uint8Array([100,110,125,65]).buffer)[0];
 const sources=frame.rateSources?.map(s=>({data:atob(s.amount),factor:s.rateFactor*s.grid.scale,time:s.time,priority:s.priority??2})),amount=!sources&&frame.amount?atob(frame.amount):null,classes=frame.classes?atob(frame.classes):null;
 if((amount&&amount.length!==n*2)||(classes&&classes.length!==n)||sources?.some(s=>s.data.length!==n*2))return null;
 // Packets are south-to-north; canvas rows are north-to-south.
 const paintRows=(start,end)=>{for(let y=start;y<end;y++){let i=y*g.nx,out=(g.ny-1-y)*g.nx;for(let x=0;x<g.nx;x++,i++,out++){
  let rate=NaN,sampleTime=frame.time;
  if(sources)[rate,sampleTime]=radarPackedSelection(sources,i,classes?.charCodeAt(i),frame.phaseTime,RADAR_SOURCE_TOLERANCE_MS,frame.time);
  else if(amount){const v=(amount.charCodeAt(i*2)|(amount.charCodeAt(i*2+1)<<8))<<16>>16;if(v>=0)rate=v*g.scale*(frame.rateFactor??12)}
  let code=classes&&Math.abs(sampleTime-frame.phaseTime)<=5*60000?classes.charCodeAt(i):255;
  // A measured dry cell or a gap is never turned into precipitation by a
  // different network's phase classification, even at the same timestamp.
  if(!Number.isFinite(rate))continue;
  if(!(rate>0))continue;
  if(rate>0&&(code===0||code===1||code===255))code=frame.forecast?radarModelPhase(frame.models,g.west+x*g.step,g.south+y*g.step):1;
  if(mode==='snowfall'&&![6,7].includes(code))continue;
  const color=palette[code]||palette[1],tier=mode==='types'?2:rate>0?ownRadarTier(rate):0;
  pixels[out]=color[tier];
 }}};
 const finish=()=>{ctx.putImageData(im,0,0);
 rememberRadarRaster(cacheKey,frame,mode,c);};
 // Preserve every native grid cell, but yield to scroll, taps and map gestures.
 // Tiny grids remain synchronous for inexpensive previews and unit tests.
 if(n>65536&&typeof setTimeout==='function'&&typeof performance!=='undefined'){
  const job={key:cacheKey,row:0};radarRasterJob=job;
  const step=()=>{if(radarRasterJob!==job)return;
   if(document.hidden||(typeof activePage!=='undefined'&&activePage!=='map'&&(activePage!=='weather'||!homeMapsVisible()))){radarRasterJob=null;return;}
   const start=performance.now();do{paintRows(job.row,++job.row)}while(job.row<g.ny&&performance.now()-start<7);
   if(job.row<g.ny){setTimeout(step,0);return;}
   finish();radarRasterJob=null;refreshOwnRadarViews();
  };setTimeout(step,0);return null;
 }
 paintRows(0,g.ny);finish();
 return c;
}
function refreshOwnRadarViews(){
 radarRevision++;if(activePage==='map')scheduleMap();
 if(activePage==='weather')scheduleHomeMaps();
 if(typeof navigator!=='undefined'&&!navigator.connection?.saveData&&!document.hidden&&!radarWarmTimer){radarWarmTimer=setTimeout(()=>{radarWarmTimer=null;if(radarRasterJob||document.hidden)return;const latest=ownRadarFrame(new Date(radarBaseTime()),true);if(latest&&!latest.forecast)ownRadarRaster(latest)},400)}
}
function readyRadarFrame(frame,mode='radar',allowOlder=false){
 if(frame&&ownRadarCache.has(mode==='radar'?frame.key:frame.key+'/'+mode))return frame;
 if(!allowOlder||frame?.forecast)return null;
 const now=Date.now();return [...ownRadarCache.values()].filter(e=>e.mode===mode&&!e.frame.forecast&&e.frame.time<=now&&now-e.frame.time<=20*60000&&(!frame||e.frame.time<=frame.time)).sort((a,b)=>b.frame.time-a.frame.time)[0]?.frame||null;
}
function ownRadarSource(frame){return frame?'Eigenes Radar · '+frame.source:'Radarquelle wird geladen'}
function ownRadarDescription(frame){const scans=frame?.rateSources?.map(s=>s.source+' '+localTime(s.time,{hour:'2-digit',minute:'2-digit'})).join(' / ');return (scans?'Radar-Verbund · '+scans+' · Europa/Schweiz bevorzugt, DWD ergänzend (max. 10 Min. Versatz) · ':frame?.rateFactor===1?'Momentanrate · ':frame?.forecast?'Radar-Nowcast · ':'')+(frame?.classes?'Beobachtete Niederschlagsart: HymecNG · max. 5 Min. Versatz':'Radarintensität')+(frame?.models?.length?' · fehlende Phase aus '+[...new Set(frame.models.map(m=>m.d.model))].join(' / ')+' geschätzt':frame?.classes?'':' · Art unbekannt')+(scans?' · Transparente Lücken: keine Radarmessung':'')}

function drawRealRadar(ctx,b,date,onChange=scheduleMap,allowOlder=false,mode='radar',cloud=true){
 const requested=ownRadarFrame(date,allowOlder);
 if(cloud&&mode==='radar')drawSatelliteClouds(ctx,b,satelliteLayerInfo());
 try{if(requested)ownRadarRaster(requested,mode);const frame=readyRadarFrame(requested,mode,allowOlder),img=frame&&ownRadarRaster(frame,mode);if(img){const g=frame.grid,[x,y]=xy(g.west-g.step/2,g.south+(g.ny-.5)*g.step,b),[right,bottom]=xy(g.west+(g.nx-.5)*g.step,g.south-g.step/2,b),smooth=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x,y,right-x,bottom-y);ctx.imageSmoothingEnabled=smooth;return frame.key===requested?.key?'ready':'cached'}}catch{}
 if(!requested&&typeof fetch==='function'){if(allowOlder){fetchOperaRadar();fetchSwissRadar();if(!ownRadarFresh(radarPointData,12))fetchBrightRadar()}else fetchNowcastMapFrame(date)}
 return 'loading';
}
function prefetchNextRadar(date){
 if(document.hidden||navigator.connection?.saveData||liveMinute>=90)return;
 const next=new Date(date.getTime()+300000),frame=ownRadarFrame(next);if(frame&&!radarRasterJob)ownRadarRaster(frame,liveLayer);else if(!frame&&!brightRadarPending.size)fetchNowcastMapFrame(next);
}
function smoothGust(d,p,pos,h){const g=d.grid,x=(pos[0]-g.west)/g.step,y=(pos[1]-g.south)/g.step,i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;const a=[[i,j,(1-u)*(1-v)],[i+1,j,u*(1-v)],[i,j+1,(1-u)*v],[i+1,j+1,u*v]];let sum=0;for(const [k,l,w] of a){if(w<1e-8)continue;const z=realModelValue(d,p,g.west+k*g.step,g.south+l*g.step,h);if(!Number.isFinite(z))return realModelValue(d,p,...pos,h);sum+=z*w;}return sum;}
function drawRealLiveField(ctx,b,fast){
 const info=realLiveInfo();if(info.timeline){drawSatelliteTimeline(ctx,b,info);return}
 if(info.satellite){drawSatelliteClouds(ctx,b,info);drawRealRadar(ctx,b,new Date(radarBaseTime()),scheduleMap,true,'radar',false);return}if(liveAreaIds[liveLayer]&&!info.observedGrid&&!info.radar)prepareLiveArea(mapRegion==='Deutschland');if(!info.available)return;
 if(info.image){drawLiveImage(ctx,b,liveLayer);return}
 if(info.radar){const status=drawRealRadar(ctx,b,info.date,scheduleMap,liveMinute===0,liveLayer);if(!fast)prefetchNextRadar(info.date);return}
 if(info.observedGrid){drawObservedField(ctx,b,liveAreaIds[liveLayer]);return}
 if(!info.model)return;
 const id=liveAreaIds[liveLayer],d=info.model.d,p=fields[id],hour=info.model.hour;
 if(d.nativeMap&&!nativeFieldsReady(d,p,hour)){fetchNativeMapFields(d,p,hour);return}
 const w=Math.max(2,Math.round(b.w/(fast?5:2))),h=Math.max(2,Math.round(b.h/(fast?5:2))),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),im=x.createImageData(w,h);
 if(['types','snowfall'].includes(liveLayer)&&d.nativeMap)for(const key of ['temp2','dew','rh2','ww','ptype'])if(d.frames[hour]?.[key]&&!d.decoded.has(hour+'/'+key))fetchNativeMapFields(d,{id:key,interval:0},hour);
 const param=id==='rainrate'?{...p,mapIntervalHours:mapInterval(d,id,hour)}:p;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const pos=lonlat((i+.5)/w*b.w,(j+.5)/h*b.h,b),v=id==='gust'?smoothGust(d,param,pos,hour):realModelValue(d,param,...pos,hour),s=liveLayer==='temperature'?{temp:v}:['wind','gust'].includes(liveLayer)?{wind:v}:liveLayer==='radar'?{rate:v}:{cover:v};if(!Number.isFinite(v))continue;
  let color;if(['types','snowfall'].includes(liveLayer)){if(v<=0)continue;const f={d,hour,time:info.model.time,point:pos},code=modelPhaseAtPoint(f,true);if(liveLayer==='snowfall'&&![6,7].includes(code))continue;color=(ownRadarColors[code]||ownRadarColors[1])[liveLayer==='types'?2:ownRadarTier(v)]}else color=liveColor(liveLayer,s);if(!color)continue;const rgb=rgbForLive(color),n=(j*w+i)*4;im.data[n]=rgb[0];im.data[n+1]=rgb[1];im.data[n+2]=rgb[2];im.data[n+3]=255;
 }x.putImageData(im,0,0);ctx.drawImage(c,0,0,b.w,b.h);
}
const observationImages=new Map();
function drawObservedField(ctx,b,id,selected=null){
 const field=selected??(typeof WeatherObservation!=='undefined'?(id==='cloud'?WeatherObservation.cloudField():WeatherObservation.mapField(id)):null);
 if(!field)return false;
 const g=field.grid,key=id+'/'+field.kind+'/'+field.time;let c=observationImages.get(key);
 if(!c){c=document.createElement('canvas');c.width=g.nx;c.height=g.ny;const cx=c.getContext('2d'),im=cx.createImageData(g.nx,g.ny);
  for(let j=0;j<g.ny;j++)for(let i=0;i<g.nx;i++){const v=field.values[(g.ny-1-j)*g.nx+i],n=(j*g.nx+i)*4;if(!Number.isFinite(v)){if(id!=='cloud')im.data.set([155,164,166,255],n);continue;}
   if(id==='cloud'){if(v===0)continue;im.data[n]=242;im.data[n+1]=246;im.data[n+2]=250;im.data[n+3]=Math.round(Math.pow(Math.min(100,v)/100,1.7)*145);}
   else{const rgb=rgbForLive(liveColor(id==='temp2'?'temperature':'wind',id==='temp2'?{temp:v}:{wind:v}));im.data.set([...rgb,255],n);}}
  cx.putImageData(im,0,0);observationImages.set(key,c);while(observationImages.size>6)observationImages.delete(observationImages.keys().next().value);
 }
 const [x,y]=xy(g.west-g.step/2,g.south+(g.ny-.5)*g.step,b),[right,bottom]=xy(g.west+(g.nx-.5)*g.step,g.south-g.step/2,b);ctx.save();if(field.kind==='observation'){ctx.beginPath();for(const r of basemapData().germany.rings)pathRing(ctx,r.coords,b);ctx.clip('evenodd');}ctx.imageSmoothingEnabled=true;ctx.drawImage(c,x,y,right-x,bottom-y);ctx.restore();return true;
}
function realLiveLabels(){
 const info=realLiveInfo(),valid=Number.isFinite(info.date.getTime());
 document.querySelector('.live-map-note').textContent='Echte Beobachtungen und messdatengestützte Analysen; Modellprognosen getrennt gekennzeichnet. Zeitstempel und Datenverfügbarkeit je Produkt.';
 if(info.timeline){timelineLabels(info);return}
 if(info.satellite){const frame=readyRadarFrame(ownRadarFrame(new Date(radarBaseTime()),true),'radar',true),status=info.available?'Beobachtung':'Wolkenbild nicht verfügbar';el('map-layer-title').textContent='Satellitenwolken + Niederschlagsradar';el('map-model-badge').textContent=status;el('map-overlay-model').textContent=info.source;el('map-overlay-data').textContent=frame?'Radar-Messung': 'Radar lädt / nicht verfügbar';el('map-data-notice').textContent=status;el('map-valid').textContent=(valid?'Satellit: '+timeText(info.date):'Satellit: keine Daten')+' · '+(frame?'Radar: '+timeText(new Date(frame.time)):'Radar: keine Daten');el('map-view-description').textContent='Unabhängige Satelliten- und Radarbeobachtungen';el('map-interval').textContent='Farbige Niederschlagsflächen zeigen die Radarmessung über dem Satellitenbild. Beide Messzeiten stehen oben.';el('map-time-label').textContent='Jetzt · letzte Beobachtungen';return}
 if(info.observedGrid){const analysis=info.observedGrid.kind==='analysis',stale=info.observedGrid.stale,status=stale?'Letzte Analyse · veraltet':analysis?'DWD · +0 h Analyse':'DWD · Beobachtungsanalyse';el('map-layer-title').textContent=liveLayers[liveLayer].label+' · '+(analysis?'Analyse':'Beobachtungsanalyse');el('map-model-badge').textContent=status;el('map-overlay-model').textContent=info.source;el('map-overlay-data').textContent=status;el('map-data-notice').textContent=status;el('map-valid').textContent=info.kind+': '+timeText(info.date);el('map-view-description').textContent=info.source;el('map-interval').textContent=stale?'Letzte verfügbare 2,2-km-Analyse, nicht der aktuelle Ist-Zustand. Aktualisierung ausstehend; keine Warnableitung aus veralteten Feldern.':analysis?'Flächendeckende aktuelle 2,2-km-Analyse mit Messdaten und Modellhintergrund; keine Vorhersage. Grau: außerhalb der Datenabdeckung.':'Stationsbasierte Ersatzdarstellung; grau: keine ausreichenden Beobachtungen.';el('map-time-label').textContent=stale?'Letzte verfügbare Analyse':'Aktuelle Analyse';return}
 if(solarLayers.has(liveLayer)){const p=currentLiveImage(),state=liveImageCache.get(liveLayer)?.state,status=p&&state==='ready'?'Rasteranalyse':solarRequest?'Rasteranalyse lädt …':'Keine aktuelle Rasteranalyse';el('map-layer-title').textContent=liveLayers[liveLayer].label;el('map-model-badge').textContent=status;el('map-overlay-model').textContent=info.source;el('map-overlay-data').textContent=status;el('map-data-notice').textContent=status;el('map-valid').textContent=p?'Messintervall: '+timeText(new Date(p.start))+' – '+timeText(new Date(p.time)):'Keine gültige Datenzeit';el('map-view-description').textContent='DUETT · Satelliten- und Bodenmessungen · 2 km · CC BY 4.0';el('map-interval').textContent=liveLayer==='sunshine'?'Beobachtungsbasierte Sonnenscheindauer in Minuten während der letzten verfügbaren Stunde; keine Vorhersage.':'Beobachtungsbasierte mittlere Globalstrahlung während der letzten verfügbaren Stunde; keine Momentanmessung.';el('map-time-label').textContent='Letzte verfügbare Stunde';return}
 if(info.image){const p=currentLiveImage(),state=liveImageCache.get(liveLayer)?.state,status=!info.available?((liveLayer==='doppler'?dopplerRequest:liveImageryRequest)?'Bild wird geladen …':'Kein aktuelles Bild verfügbar'):state==='ready'?'Beobachtung':state==='error'?'Bild konnte nicht geladen werden':'Bild wird geladen …';el('map-layer-title').textContent=liveLayers[liveLayer].label;el('map-model-badge').textContent=status;el('map-overlay-model').textContent=info.source;el('map-overlay-data').textContent=status;el('map-data-notice').textContent=status;el('map-valid').textContent=valid?'Messzeit: '+timeText(info.date):'Keine gültige Datenzeit';el('map-view-description').textContent=info.source;el('map-interval').textContent=liveLayer==='doppler'?'Radialwind in m/s · Grün: zum Radar · Rot: vom Radar weg. '+(p?'Elevation '+p.elevation+'° · ':'')+'Nebeneinanderliegende Gegengeschwindigkeiten können Rotation andeuten; kein Tornadonachweis. Faltungs-/Störeffekte möglich.':liveLayer==='satellite'?'GeoColour: Wolkenbild (Tag / Nacht), keine Radarreflektivität.':'DWD DMAX: maximales Radarecho in dBZ in der vertikalen Luftsäule, keine Niederschlagsrate.';el('map-time-label').textContent='Letzte Beobachtung';return}
 const requested=info.radar&&valid?ownRadarFrame(info.date,liveMinute===0):null,own=info.radar?readyRadarFrame(requested,liveLayer,liveMinute===0):null,imageState=own?'ready':undefined;
 const status=!info.available&&!own?(nativeMapLoading.size&&liveAreaIds[liveLayer]?'Modellkarte lädt …':'Keine Daten'):info.radar?(own?(own.key===requested?.key?'Eigenes Radar':'Letzter Scan · Aktualisierung läuft'):'Radar wird geladen …'):info.observedGrid?'DWD · Beobachtungsanalyse':info.stations?'DWD · Messpunkte':(info.model?.d.nativeMap&&!nativeFieldsReady(info.model.d,fields[liveAreaIds[liveLayer]],info.model.hour)?'Originaldaten werden geladen':info.model?modelProvider(info.model.d.model)+' · Modell':'Keine Daten');
 el('map-layer-title').textContent=liveLayer==='temperature'?'Temperatur · '+(info.observedGrid?'Beobachtungsanalyse':info.stations?'Messpunkte':'Prognose'):['wind','gust'].includes(liveLayer)?liveLayers[liveLayer].label+' · '+(info.stations?'Messpunkte':'Modell'):info.radar?(liveLayer==='types'?'Niederschlagsart':liveLayer==='snowfall'?'Schneefallradar':'Niederschlagsradar')+' · '+(own?'eigene Darstellung':'RV'):liveLayer==='radar'?'Niederschlagsrate · Modell':liveLayers[liveLayer].label;
 el('map-model-badge').textContent=status;el('map-overlay-model').textContent=info.radar?ownRadarSource(own):info.source;el('map-overlay-data').textContent=status;
 el('map-data-notice').textContent=status;el('map-valid').textContent=info.radar?(imageState==='ready'?info.kind+': '+timeText(new Date(own.time)):'Radarzeit: '+(valid?timeText(info.date)+' angefragt':'nicht verfügbar')):valid&&info.available?info.kind+': '+timeText(info.date):'Keine gültige Datenzeit';
 el('map-view-description').textContent=info.radar?(own?'Quelle: '+own.source+' · eigene Rasterdarstellung':'Radarquelle noch nicht verfügbar'):info.observedGrid?'SYNOP · räumliche Interpolation, keine Modellvorhersage':info.stations?'Quelle: Deutscher Wetterdienst · Fläche: Modell · Zahlen: aktuelle Stationsmessungen':'Quelle: '+(info.model?modelProvider(info.model.d.model)+' · '+info.model.d.model:'Keine Quelle')+' · Modellwerte, keine Messung';
 el('map-interval').textContent=!info.available?'Keine passende offene Datenquelle oder Zeit verfügbar.':info.radar?(own?ownRadarDescription(own)+(liveMinute===0&&liveLayer==='radar'?' · Grün: Land; '+(WeatherObservation.cloudField()?'helle Flächen: Meteosat-Wolken.':'Wolkenmaske nicht verfügbar.')+' Grün allein ist kein Sonnenscheinnachweis.':''):'Warte auf numerische Radardaten mit eigener Phasendarstellung.'):info.stations?'Stationspunkte: Messungen der letzten 90 Min. · Fläche: Modellzeitpunkt':'Modellzeitpunkt · tatsächlich verfügbarer Zeitschritt';
 el('map-time-label').textContent=liveHourlyMode()?String(liveTempHour).padStart(2,'0')+':00 UTC':liveMinute===0?'Letzte Radarzeit':(liveMinute>0?'+':'')+liveMinute+' Min.';
 el('map-live-scenario').disabled=true;el('map-live-lightning').disabled=true;el('map-live-symbols').disabled=true;
}
function realRadarLegend(){
 el('legend-strip').hidden=true;el('legend-ticks').hidden=true;el('radar-type-legend').hidden=false;el('live-lightning-note').hidden=true;
 const frame=liveLayer==='satellite'&&liveMinute!==0?timelineRadar(satelliteTime()):liveLayer==='satellite'?readyRadarFrame(ownRadarFrame(new Date(radarBaseTime()),true),'radar',true):!liveHourlyMode()?readyRadarFrame(ownRadarFrame(realLiveTime(),liveMinute===0),liveLayer,liveMinute===0):null,root=el('radar-type-legend'),typed=liveLayer==='types',snow=liveLayer==='snowfall';
 
 const key=[liveLayer,!!frame?.amount,!!frame?.classes,!!frame?.models?.length,liveHourlyMode()].join('/');if(root.dataset.ownRadar===key&&root.querySelector('[data-own-radar-legend]'))return;root.dataset.ownRadar=key;
 const rows=snow?[[7,'Schnee'],[6,'Schneeregen']]:[[3,'Regen / Niesel'],[7,'Schnee'],[6,'Schneeregen'],[5,'Gefrierender Niederschlag'],[8,'Graupel'],[11,'Eiskörner'],[9,'Hagel'],[1,'Niederschlag · Art unbekannt']];
 root.innerHTML='<div data-own-radar-legend style="display:grid;gap:5px">'+rows.map(([id,label])=>'<div style="display:flex;align-items:center;gap:8px"><span style="display:flex;width:90px;flex-shrink:0;height:9px;border-radius:3px;overflow:hidden">'+(typed?[ownRadarColors[id][2]]:ownRadarColors[id]).map(c=>'<i style="flex:1;background:'+c+'"></i>').join('')+'</span><span class="small">'+label+'</span></div>').join('')+'<div class="small">'+(typed?'Niederschlagsart':(snow?'Wasseräquivalent · ':'')+'Stufen: &lt;0,5 · 0,5–2 · 2–5 · 5–15 · ≥15 mm/h')+' · '+(frame?ownRadarDescription(frame):liveHourlyMode()?'Modellprognose · geschätzt':'Daten werden geladen / nicht verfügbar')+'</div></div>';
}
function initRealLive(){realLiveEnabled=true;el('map-live-data-mode').value='real';el('doppler-site').addEventListener('change',e=>{dopplerChoice=e.target.value;fetchDoppler();scheduleMap()});el('map-live-data-mode').addEventListener('change',e=>{realLiveEnabled=e.target.value==='real';for(const id of ['map-live-scenario','map-live-lightning','map-live-symbols'])el(id).disabled=realLiveEnabled;stopPlay();resetLiveTime();if(realLiveEnabled&&imageLayers.has(liveLayer)){if(liveLayer==='doppler')fetchDoppler();else if(solarLayers.has(liveLayer))fetchSolar();else fetchLiveImagery()}scheduleMap()});resetLiveTime();scheduleMap();setTimeout(refreshRadarClock,0);setTimeout(warmModelCatalog,7000);setInterval(warmModelCatalog,5*60000);setTimeout(()=>{if(!document.hidden&&!navigator.connection?.saveData){fetchLiveImagery();fetchDoppler();fetchSolar();prepareLiveArea(true);for(const id of ['temp2','wind','rainrate']){const a=nativeAreaFrame(Date.now(),id,homeLocationPoint(location),true);if(a)fetchNativeMapFields(a.d,fields[id],a.hour,false)}}},1800);setInterval(()=>{if(!document.hidden){refreshRadarClock();fetchSolar();if(activePage==='map'&&imageLayers.has(liveLayer)){if(liveLayer==='doppler')fetchDoppler();else if(solarLayers.has(liveLayer))fetchSolar();else fetchLiveImagery()}}},60000)}
function drawHomeMapOutline(ctx,b,point){const geo=basemapData();drawAdmin(ctx,geo.states,b,'#222a3990',.65);drawAdmin(ctx,[geo.germany],b,'#202838',1.25);const [x,y]=xy(...point,b);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#142b42';ctx.stroke();}
function renderOwnHomeRadar(point){const id='radar',canvas=el('home-map-'+id);if(!canvas)return;const b=previewBounds(point),ctx=canvas.getContext('2d');drawLiveBase(ctx,b);
   const date=new Date(radarBaseTime()),status=Date.now()-date.getTime()<3600000?drawRealRadar(ctx,b,date,()=>{if(activePage==='weather'){const p=homeLocationPoint(location);if(p)renderOwnHomeRadar(p)}},true):'unavailable';
   const own=readyRadarFrame(ownRadarFrame(date,true),'radar',true),raw=own?ownRadarPixel(own,point):null,ground=raw?resolveLivePhase(point,raw,Date.now()):null,r=ground?.kind==='ground'?{...raw,code:ground.code,source:ground.source+' '+localTime(ground.time,{hour:'2-digit',minute:'2-digit'})+' · Rate: '+raw.source,time:raw.time,estimated:false}:raw;el('home-value-'+id).textContent=own?(r?(Number.isFinite(r.rate)?localFormat(r.rate)+' mm/h · ':'')+(r.code>1?radarTypeNames[r.code]+(r.estimated?' (geschätzt)':'')+' · ':'')+(r.source||own.source)+' · '+localTime(r.time??own.time,{hour:'2-digit',minute:'2-digit'})+(status==='cached'?' · letzter Scan':''):'Keine Radarmessung am Ort'):status==='loading'?'Radar lädt …':'Radar nicht verfügbar';

 drawOwnRadarSymbols(ctx,b,own,'radar');drawHomeMapOutline(ctx,b,point);
}
function renderRealHomeMaps(point){
 const b=previewBounds(point);
 for(const [id] of homeMapLayers){if(id==='radar'){renderOwnHomeRadar(point);continue}const canvas=el('home-map-'+id);if(!canvas)return;const ctx=canvas.getContext('2d');drawLiveBase(ctx,b);
  const field=liveAreaIds[id],ready=drawObservedField(ctx,b,field),sample=WeatherObservation.mapField(field),value=WeatherObservation.mapValue(field,point),unit=id==='temperature'?'°C':'km/h';
  el('home-value-'+id).textContent=ready&&Number.isFinite(value)?displayValue(value,unit)+' '+unit+' · '+(sample.stale?'Letzte Analyse (veraltet)':sample.kind==='analysis'?'DWD +0 h Analyse':'SYNOP')+' '+localTime(sample.time,{hour:'2-digit',minute:'2-digit'}):'Keine aktuelle Analyse am Ort';
  drawHomeMapOutline(ctx,b,point);
 }
}


// Geographic borders: Natural Earth, 1:110m Admin 0 (public domain).
const mapBoundaries = EXTRA_GEO.countries;
const mapModels = {
 'ICON-D2': {max:48,step:1,bias:0,phase:0,grid:.035},
 'ICON-D2-RUC': {max:27,step:1,bias:0,phase:0,grid:.02},
 'ICON-EU': {max:120,step:3,bias:.35,phase:.8,grid:.09},
 'IFS': {max:168,step:3,bias:-.3,phase:1.5,grid:.12},
 'GFS': {max:240,step:6,bias:.55,phase:2.1,grid:.25},
 'AIFS': {max:360,step:6,bias:.1,phase:2.8,grid:.5},
 'AIFS-ENS Control': {max:360,step:6,bias:.15,phase:3.2,grid:.5}
};
const palettes={
 temp:['#5b2495','#424fbc','#409add','#67d5d4','#c2eb81','#f8d56d','#f59248','#d9444e','#9e2268'],
 rain:['#e6edf4','#b9e4ec','#69cddb','#32abbe','#369b71','#d7d94b','#f5b446','#e36341','#9a295e'],
 wind:['#e6f1df','#92d7b9','#53bfaa','#3e99b6','#6654b4','#b74d9d','#f18b60','#f4d76b','#9e3e43'],
 moisture:['#ad704a','#d7b368','#f3e6ab','#cadd94','#89cd9b','#4dab93','#2680aa','#355fa7','#563b9b'],
 index:['#e6edf4','#b2dce5','#75c9db','#50be8c','#a8d560','#e9d35b','#f7a44a','#e76052','#a62d70'],
 negative:['#ab3174','#d46a6b','#efa56a','#efd491','#c4e49e','#7fcdaf','#66b5d0','#9ad2df','#e4eef6'],
 snow:['#e4edf1','#c6e7f5','#9ed8f2','#61c0e0','#499cdd','#4967c0','#6652aa','#a75cba','#de8bd0']
};
const P=(id,group,label,unit,stops,palette,mode,interval=0)=>({id,group,label,unit,stops,palette,mode,interval});
const mapParameters=[
 P('synoptic','Großwetterlage','Großwetterlage · 500 hPa + Bodendruck','dam',[480,500,520,535,550,565,580,595,610],'temp','z500'),
 P('syn850','Großwetterlage','Temperatur · 850 hPa + Bodendruck','°C',[-30,-20,-15,-10,-5,0,10,20,30],'temp','t850'),
 P('syn500','Großwetterlage','Temperatur · 500 hPa + Geopotential','°C',[-55,-45,-40,-35,-30,-25,-20,-15,-5],'temp','t500'),
 P('temp2','Temperatur & Feuchte','Temperatur · 2 m','°C',[-20,-10,-5,0,5,10,15,20,30],'temp','temp'),
 P('feels','Temperatur & Feuchte','Gefühlte Temperatur','°C',[-25,-15,-10,-5,0,5,10,15,25],'temp','feels'),
 P('dew','Temperatur & Feuchte','Taupunkt · 2 m','°C',[-15,-10,-5,0,5,10,15,20,25],'temp','dew'),
 P('ground','Temperatur & Feuchte','Lufttemperatur · 5 cm','°C',[-20,-10,-5,0,5,10,15,20,30],'temp','ground'),
 P('tground','Temperatur & Feuchte','Oberflächentemperatur','°C',[-20,-10,-5,0,5,10,15,20,30],'temp','ground'),
 P('t850','Temperatur & Feuchte','Temperatur · 850 hPa','°C',[-20,-15,-10,-5,0,5,10,15,20],'temp','t850'),
 P('t700','Temperatur & Feuchte','Temperatur · 700 hPa','°C',[-30,-25,-20,-15,-10,-5,0,5,10],'temp','t700'),
 P('t500','Temperatur & Feuchte','Temperatur · 500 hPa','°C',[-45,-40,-35,-30,-25,-20,-15,-10,-5],'temp','t500'),
 P('rh','Temperatur & Feuchte','Relative Feuchte · 2 m','%',[0,15,30,45,60,70,80,90,100],'moisture','rh'),
 P('rainrate','Niederschlag & Schnee','Niederschlagsrate','mm/h',[0,.1,.5,1,2,4,8,15,25],'rain','rainrate'),
 P('rain1','Niederschlag & Schnee','Niederschlag · 1 h','mm',[0,.1,.5,1,2,4,8,15,25],'rain','rain1',1),
 P('rain2','Niederschlag & Schnee','Niederschlag · 2 h','mm',[0,.2,.5,1,3,6,12,25,50],'rain','rain2',2),
 P('rain3','Niederschlag & Schnee','Niederschlag · 3 h','mm',[0,.5,1,2,5,10,20,35,60],'rain','rain3',3),
 P('rain6','Niederschlag & Schnee','Niederschlag · 6 h','mm',[0,.5,1,2,5,10,20,35,60],'rain','rain6',6),
 P('rain12','Niederschlag & Schnee','Niederschlag · 12 h','mm',[0,1,2,5,10,20,35,60,100],'rain','rain12',12),
 P('rain24','Niederschlag & Schnee','Niederschlag · 24 h','mm',[0,1,3,5,10,20,35,60,100],'rain','rain24',24),
 P('rain48','Niederschlag & Schnee','Niederschlag · 48 h','mm',[0,2,5,10,20,40,60,100,150],'rain','rain48',48),
 P('rain72','Niederschlag & Schnee','Niederschlag · 72 h','mm',[0,5,10,20,40,60,100,150,250],'rain','rain72',72),
 P('rainTotal','Niederschlag & Schnee','Niederschlag · Summe seit Modellstart','mm',[0,5,10,20,40,60,100,150,250],'rain','rainTotal'),
 P('conv','Niederschlag & Schnee','Konvektive QPF · 24 h','mm',[0,.5,1,2,5,10,20,40,80],'rain','conv',24),
 P('strat','Niederschlag & Schnee','Stratiforme QPF · 24 h','mm',[0,.5,1,2,5,10,20,40,80],'rain','strat',24),
 P('snownew','Niederschlag & Schnee','Neuschnee · 24 h','cm',[0,1,2,5,10,15,25,40,60],'snow','snownew',24),
 P('snowdepth','Niederschlag & Schnee','Schneehöhe','cm',[0,1,5,10,20,30,50,75,100],'snow','snowdepth'),
 P('snowline','Niederschlag & Schnee','Schneefallgrenze','m',[0,200,400,600,1000,1500,2000,2500,3500],'index','snowline'),
 P('freezing','Niederschlag & Schnee','Nullgradgrenze','m',[0,200,400,600,1000,1500,2000,2500,3500],'index','freezing'),
 P('wind','Wind & Druck','Wind · 10 m','km/h',[0,5,10,20,30,40,60,80,100],'wind','wind'),
 P('gust','Wind & Druck','Windböen · 10 m','km/h',[0,20,40,60,70,80,100,120,150],'wind','gust'),
 P('jet','Großwetterlage','Jetstream · 300 hPa','m/s',[0,10,20,30,40,50,60,75,90],'wind','jet'),
 P('slp','Großwetterlage','Bodendruck · Hochs & Tiefs','hPa',[970,980,990,1000,1010,1020,1030,1040,1050],'temp','slp'),
 P('z500','Großwetterlage','Geopotential · 500 hPa · Höhenhochs & -tiefs','dam',[480,500,520,535,550,565,580,595,610],'temp','z500'),
 P('cloud','Wolken & Sicht','Gesamtbewölkung','%',[0,10,25,40,50,60,75,90,100],'moisture','cloud'),
 P('lowcloud','Wolken & Sicht','Tiefe Bewölkung','%',[0,10,25,40,50,60,75,90,100],'moisture','cloud'),
 P('midcloud','Wolken & Sicht','Mittelhohe Bewölkung','%',[0,10,25,40,50,60,75,90,100],'moisture','cloud'),
 P('highcloud','Wolken & Sicht','Hohe Bewölkung','%',[0,10,25,40,50,60,75,90,100],'moisture','cloud'),
 P('visibility','Wolken & Sicht','Sichtweite','km',[0,.05,.1,.2,.5,1,3,10,20],'negative','visibility'),
 P('radiation','Sonne & Strahlung','Globalstrahlung · Modellintervall','W/m²',[0,10,50,100,200,400,600,800,1000],'index','unavailable'),
 P('cape','Konvektion & Gewitter','SBCAPE','J/kg',[0,50,100,250,500,1000,1500,2500,4000],'index','cape'),
 P('mlcape','Konvektion & Gewitter','MLCAPE','J/kg',[0,50,100,250,500,1000,1500,2500,4000],'index','mlcape'),
 P('mucape','Konvektion & Gewitter','MUCAPE','J/kg',[0,50,100,250,500,1000,1500,2500,4000],'index','mucape'),
 P('cin','Konvektion & Gewitter','SBCIN','J/kg',[-250,-150,-100,-75,-50,-25,-10,-5,0],'negative','cin'),
 P('mlcin','Konvektion & Gewitter','MLCIN','J/kg',[-250,-150,-100,-75,-50,-25,-10,-5,0],'negative','mlcin'),
 P('ki','Konvektion & Gewitter','K-Index','°C',[0,5,10,15,20,25,30,35,40],'index','ki'),
 P('li','Konvektion & Gewitter','Lifted Index','K',[-12,-8,-5,-3,0,2,4,6,10],'negative','li'),
 P('tt','Konvektion & Gewitter','Total Totals (TT)','K',[20,25,30,35,40,45,50,55,60],'index','tt'),
 P('dcape','Konvektion & Gewitter','DCAPE','J/kg',[0,100,250,500,750,1000,1250,1500,2000],'index','dcape'),
 P('s01','Scherung & Helizität','Scherung · 0–1 km','m/s',[0,2,4,6,8,10,15,20,25],'index','s01'),
 P('s03','Scherung & Helizität','Scherung · 0–3 km','m/s',[0,4,8,12,16,20,25,30,40],'index','s03'),
 P('s06','Scherung & Helizität','Scherung · 0–6 km','m/s',[0,5,10,15,20,25,30,40,50],'index','s06'),
 P('srh01','Scherung & Helizität','Helizität · 0–1 km','m²/s²',[0,25,50,75,100,150,200,300,400],'index','srh01'),
 P('srh03','Scherung & Helizität','Helizität · 0–3 km','m²/s²',[0,50,100,150,200,250,350,500,700],'index','srh03'),
 P('thetae','Vertikalprofil','Theta-e · 850 hPa (abgeleitet)','K',[270,280,290,300,310,320,330,340,350],'temp','thetae'),
 P('lcl','Vertikalprofil','LCL · über Grund','m',[0,250,500,750,1000,1500,2000,2500,3500],'index','lcl'),
 P('lfc','Vertikalprofil','LFC · über Grund','m',[0,250,500,750,1000,1500,2000,3000,4000],'index','lfc'),
 P('el','Vertikalprofil','EL · über Grund','m',[0,1000,2000,4000,6000,8000,10000,12000,15000],'index','el'),
 P('lapse','Vertikalprofil','Lapse Rate · 850–500 hPa','K/km',[2,3,4,5,6,7,8,9,10],'index','lapse'),
 P('lapse7','Vertikalprofil','Lapse Rate · 700–500 hPa','K/km',[2,3,4,5,6,7,8,9,10],'index','lapse7'),
 P('pwat','Vertikalprofil','Niederschlagbares Wasser','mm',[0,5,10,15,20,25,35,45,60],'moisture','pwat'),
 P('rh850','Vertikalprofil','Relative Feuchte · 850 hPa','%',[0,15,30,45,60,70,80,90,100],'moisture','rh850'),
 P('rh700','Vertikalprofil','Relative Feuchte · 700 hPa','%',[0,15,30,45,60,70,80,90,100],'moisture','rh700'),
 P('rh500','Vertikalprofil','Relative Feuchte · 500 hPa','%',[0,15,30,45,60,70,80,90,100],'moisture','rh500')
];
// The same level catalogue applies to all actual model providers. A field
// remains explicitly unavailable until that model supplied it.
for(const lev of [1000,975,950,925,900,850,800,700,600,500,400,300,250,200,150,100]){
 const label=lev+' hPa';
 if(!mapParameters.some(p=>p.id==='t'+lev))mapParameters.push(P('t'+lev,'Höhenwetter · Temperatur','Temperatur · '+label,'°C',[-70,-55,-40,-25,-15,-5,5,15,25],'temp','t850'));
 if(!mapParameters.some(p=>p.id==='rh'+lev))mapParameters.push(P('rh'+lev,'Höhenwetter · Feuchte','Relative Feuchte · '+label,'%',[0,15,30,45,60,70,80,90,100],'moisture','rh850'));
 if(!mapParameters.some(p=>p.id==='z'+lev))mapParameters.push(P('z'+lev,'Höhenwetter · Geopotential','Geopotential · '+label,'dam',[50,150,250,400,550,750,950,1100,1250],'temp','z500'));
 mapParameters.push(P('windp'+lev,lev===250?'Großwetterlage':'Höhenwetter · Wind',lev===250?'Jetstream · 250 hPa':'Wind · '+label,'m/s',[0,5,10,15,20,30,40,60,80],'wind','jet'),P('u'+lev,'Höhenwetter · Wind','Westwindkomponente U · '+label,'m/s',[-50,-30,-20,-10,0,10,20,30,50],'negative','jet'),P('v'+lev,'Höhenwetter · Wind','Südwindkomponente V · '+label,'m/s',[-50,-30,-20,-10,0,10,20,30,50],'negative','jet'),P('winddirp'+lev,'Höhenwetter · Wind','Windrichtung · '+label,'°',[0,45,90,135,180,225,270,315,360],'index','unavailable'),P('q'+lev,'Höhenwetter · Feuchte','Spezifische Feuchte · '+label,'g/kg',[0,.5,1,2,3,5,8,12,18],'moisture','unavailable'));
}
mapParameters.push(P('s850500','Scherung & Helizität','Vektorscherung · 850–500 hPa','m/s',[0,5,10,15,20,25,30,40,50],'index','unavailable'),P('lclApprox','Vertikalprofil','LCL · Näherung aus T/Td','m AGL',[0,250,500,750,1000,1500,2000,2500,3500],'index','unavailable'),P('ehi03','Gefahrenindizes','EHI · ML-CAPE / SRH 0–3 km','',[0,.25,.5,1,2,3,4,5,8],'index','unavailable'),P('dcapeSpeed','Gefahrenindizes','Ideale Abwindgeschwindigkeit aus DCAPE','km/h',[0,20,40,60,80,100,120,150,200],'wind','unavailable'));
mapParameters.push(P('scp','Gefahrenindizes','Supercell Composite (SCP · effektiv)','',[0,.25,.5,1,2,4,8,12,20],'index','unavailable'),P('stp','Gefahrenindizes','Significant Tornado (STP · effektiv)','',[0,.25,.5,1,2,3,5,8,12],'index','unavailable'),P('ship','Gefahrenindizes','Significant Hail (SHIP)','',[0,.25,.5,1,1.5,2,3,4,6],'index','unavailable'),P('hail','Gefahrenindizes','Potenzielle maximale Hagelgröße · ICON-D2-RUC','cm',[0,.5,1,2,3,4,5,7.5,10],'index','unavailable'),P('downburst','Gefahrenindizes','Wet Microburst Severity Index (WMSI)','',[0,10,25,50,75,100,150,200,300],'index','unavailable'));
mapParameters.push(
 P('snowWater','Niederschlag & Schnee','Schneewasseräquivalent · SWE','mm',[0,1,2,5,10,20,40,80,150],'snow','snowWater'),
 P('snowDensity','Niederschlag & Schnee','Schneedichte','kg/m³',[50,100,150,200,250,350,450,600,900],'index','snowDensity'),
 P('snowWaterTotal','Niederschlag & Schnee','Schneefallwasser · akkumuliert','mm',[0,1,2,5,10,20,40,80,150],'snow','snowWaterTotal')
);
mapParameters.push(P('reflectivity','Niederschlag & Schnee','Simulierte Radarreflektivität (Modell)','dBZ',[0,10,20,30,40,45,50,55,65],'rain','rainrate'),P('wind100','Wind & Druck','Wind · 100 m','km/h',[0,10,20,30,40,60,80,100,120],'wind','wind'),P('cloudbase','Wolken & Sicht','Konvektive Wolkenbasis','m',[0,250,500,1000,2000,3000,5000,8000,12000],'index','lcl'),P('cloudtop','Wolken & Sicht','Konvektive Wolkenobergrenze','m',[0,1000,2000,4000,6000,8000,10000,12000,15000],'index','el'),P('deepcloudtop','Wolken & Sicht','Obergrenze tiefer Konvektion','m',[0,1000,2000,4000,6000,8000,10000,12000,15000],'index','el'),P('mucin','Konvektion & Gewitter','MUCIN','J/kg',[-250,-150,-100,-75,-50,-25,-10,-5,0],'negative','mlcin'),P('tsnow','Niederschlag & Schnee','Schneetemperatur','°C',[-25,-20,-15,-10,-5,0,5,10,15],'temp','ground'),P('tmin','Temperatur & Feuchte','Modellminimum im Ausgabeintervall','°C',[-20,-10,-5,0,5,10,15,20,30],'temp','temp'),P('tmax','Temperatur & Feuchte','Modellmaximum im Ausgabeintervall','°C',[-20,-10,-5,0,5,10,15,20,30],'temp','temp'));
let mapModel='ICON-D2',mapRun=12,mapHour=0,mapZoom=1,mapPoint=null,mapPointName='',mapTimer=null,mapFrame=null,mapView=null,mapCenter=null;
const mapCanvas=el('model-canvas');
const mapBuffer=document.createElement('canvas');
const modelRasterCache=new Map();
const mapSnapshot=document.createElement('canvas');
let snapshotBounds=null,snapshotKey='',mapGesture=false,gestureTimer=null;
const modelSelect=el('map-model'),parameterSelect=el('map-parameter');
const fields=Object.fromEntries(mapParameters.map(p=>[p.id,p]));
const mapOptions=()=>mapLayer==='hail'&&mapSource==='model'?['ICON-D2-RUC']:Object.keys(mapModels).filter(m=>m!=='ICON-D2-RUC'&&(mapRegion==='Deutschland'||m!=='ICON-D2'));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function baseBounds(){
 const b=mapRegion==='Deutschland'?{west:3.8,east:16.7,south:46.3,north:55.8,w:640,h:760}:{west:-25,east:42,south:34,north:71,w:740,h:680};
 if(!mapFullScreen||!mapCanvas.parentElement?.clientWidth||!mapCanvas.parentElement?.clientHeight)return b;
 const box=mapCanvas.parentElement,w=box.clientWidth,h=box.clientHeight,scale=Math.min(2,900/Math.max(w,h)),ratio=(w/h)/(b.w/b.h);
 if(ratio>1){const pad=(b.east-b.west)*(ratio-1)/2;b.west-=pad;b.east+=pad}
 else{const pad=(b.north-b.south)*(1/ratio-1)/2;b.south-=pad;b.north+=pad}
 b.south=clamp(b.south,-80,80);b.north=clamp(b.north,-80,80);
 b.w=Math.max(120,Math.round(w*scale));b.h=Math.max(120,Math.round(h*scale));return b;
}
function bounds(){
 const b=baseBounds(),cx=mapCenter?mapCenter[0]:(b.west+b.east)/2,cy=mapCenter?mapCenter[1]:(b.south+b.north)/2,dx=(b.east-b.west)/2/mapZoom,dy=(b.north-b.south)/2/mapZoom;
 return {...b,west:cx-dx,east:cx+dx,south:cy-dy,north:cy+dy};
}
// A synthetic, additive hourly series. All accumulations end at the selected
// valid time; unlike the rate they represent an amount, not mm/h.
function rainSeries(lon,lat,h,n){
 if(n<=0)return 0;if(h<n)return NaN;
 const m=mapModels[mapModel],x=lon-10,y=lat-51,phase=m.phase+mapRun*.055;
 const band=Math.exp(-Math.pow((x-y*.62+2*Math.sin(phase))*.30,2)),low=Math.exp(-((x+2)**2/32+(y-1)**2/12));
 const base=Math.max(0,(band*.8+low*.4-.32)*3.6),omega=.19,phi=phase+x*.19+y*.08;
 // Sum of sin(phi + omega*k) for k=h-n+1 through h.
 const sineSum=Math.sin(n*omega/2)/Math.sin(omega/2)*Math.sin(phi+omega*(h-(n-1)/2));
 return Math.max(0,base*(.7*n+.3*sineSum));
}
// Synthetic fields, deliberately separate from the real model-data adapter.
// Every location/time/model uses one deterministic spatial function.
function demoValue(mode,lon,lat){
 const m=mapModels[mapModel],t=(mapHour+mapRun)*.035,ph=m.phase+t,x=lon-10,y=lat-51;
 const wave=Math.sin(x*.36+ph)*Math.cos(y*.45-ph*.6);
 const band=Math.exp(-Math.pow((x-y*.72+2.4*Math.sin(ph))*.27,2));
 const low=Math.exp(-((x+2-Math.sin(ph)*3)**2/35+(y-1.2)**2/13));
 const ridge=Math.exp(-((x-3)**2/26+(y+2.5)**2/15));
 const warmth=9-.78*y+4.2*wave+2.3*ridge+m.bias*1.8+Math.sin(t)*2;
 const wet=clamp(band*.68+low*.43+.13*wave-.08,0,1);
 const instability=clamp(.12+.54*ridge+.22*wave+.13*Math.sin(ph),0,1);
 const flow=clamp(.33+.48*low+.18*wave,0,1);
 if(mode==='rainrate'){const h=Math.max(1,mapHour);return rainSeries(lon,lat,h,1)}
 if(mode==='rainTotal')return rainSeries(lon,lat,mapHour,mapHour);
 if(/^rain\d+$/.test(mode))return rainSeries(lon,lat,mapHour,Number(mode.slice(4)));
 if(mode==='conv'||mode==='strat'){const total=rainSeries(lon,lat,mapHour,24),ratio=instability*.45;return total*(mode==='conv'?ratio:1-ratio)}
 const v={
  temp:warmth,feels:warmth-2.5-flow*3,dew:warmth-2.8-(1-wet)*6,ground:warmth-1.8,t850:warmth-10.5,t700:warmth-17,t500:warmth-33,
  rh:clamp(48+wet*48,0,100),
  snownew:Math.max(0,(3-warmth)*wet*5),snowdepth:Math.max(0,(5-warmth)*wet*7),
  wind:8+flow*45,gust:16+flow*78,jet:12+flow*54,slp:1028-low*30+wave*5,z500:550-y*2.2-low*19+wave*8,
  cloud:clamp(15+wet*93,0,100),visibility:clamp(20-(wet**2)*20,0,20),
  cape:instability*instability*1800,mlcape:instability*instability*1450,mucape:instability*instability*2200,cin:-5-(1-instability)*105,mlcin:-10-(1-instability)*130,
  ki:10+instability*24+wet*5,li:6-instability*11,tt:30+instability*22+wave*3,dcape:100+instability*900,
  s01:2+flow*15,s03:4+flow*24,s06:7+flow*33,srh01:15+flow*flow*230,srh03:30+flow*flow*400,
  thetae:282+instability*32+wet*9,lcl:400+(1-wet)*1600,lfc:750+(1-wet)*2200,el:2500+instability*8500,
  lapse:4+instability*3.8,lapse7:4.2+instability*3.8,pwat:6+wet*25,rh850:clamp(36+wet*62,0,100),rh700:clamp(25+wet*70,0,100),rh500:clamp(15+wet*70,0,100)
 };
 return v[mode];
}
const rgb=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
const colors=Object.fromEntries(Object.entries(palettes).map(([name,arr])=>[name,arr.map(rgb)]));
function colorAt(p,v){
 const stops=p.stops,c=colors[p.palette],n=stops.length-1; if(v<=stops[0])return c[0];if(v>=stops[n])return c[n];
 let i=0;while(v>stops[i+1])i++;const f=(v-stops[i])/(stops[i+1]-stops[i]);
 return c[i].map((a,j)=>Math.round(a+(c[i+1][j]-a)*f));
}
function xy(lon,lat,b){return [(lon-b.west)/(b.east-b.west)*b.w,(b.north-lat)/(b.north-b.south)*b.h]}
function lonlat(x,y,b){return [b.west+x/b.w*(b.east-b.west),b.north-y/b.h*(b.north-b.south)]}
const citiesEU=[['London',-.127,51.507],['Paris',2.35,48.86],['Berlin',13.405,52.52],['Madrid',-3.70,40.42],['Rom',12.49,41.89],['Warschau',21.01,52.23],['Oslo',10.75,59.91],['Stockholm',18.07,59.33],['Helsinki',24.94,60.17],['Wien',16.37,48.21],['Lissabon',-9.14,38.72],['Athen',23.73,37.98]];
// Model cells have fixed geographic coordinates, independent of panning
// and zoom. This mock adapter will be replaced by actual native model grids.
let gridKey='',gridCache=new Map();
function gridSample(p,lon,lat){
 if(modelDataMode==='real'){const d=realData(),value=!modelValidDate()?NaN:d?.nativeMap?nativeFieldsReady(d,p,mapHour)?realModelValue(d,p,lon,lat,mapHour):NaN:p.id==='temp2'?nativeMapTemperatureValue(matchingNativeMap(),lon,lat):NaN;return {value,color:Number.isFinite(value)?colorAt(p,value):[95,110,125]}}
 const key=[mapModel,mapRun,mapHour,p.id].join('/');if(gridKey!==key){gridKey=key;gridCache.clear()}
 const step=mapModels[mapModel].grid,ix=Math.round(lon/step),iy=Math.round(lat/step),cell=ix+':'+iy;
 if(!gridCache.has(cell)){const value=demoValue(p.mode,ix*step,iy*step);gridCache.set(cell,{value,color:Number.isFinite(value)?colorAt(p,value):[95,110,125]})}
 return gridCache.get(cell);
}
function mapContentKey(){return [mapRegion,mapSource,mapModel,mapRun,mapHour,mapLayer,modelDataMode,realModelRevision,typeof realLiveEnabled!=='undefined'&&realLiveEnabled,typeof radarRevision!=='undefined'&&radarRevision,liveLayer,liveScenario,liveDisplayMinute(),liveLightning,liveSymbols,terrainMode,showDistricts,showPlaces,showRoads,showTerrain,showWater,mapPoint?.join(',')].join('/')}
function pressureExtrema(values,g,radius){
 const found=[];for(let y=radius;y<g.ny-radius;y++)for(let x=radius;x<g.nx-radius;x++){
  const center=values[y*g.nx+x];if(!Number.isFinite(center))continue;
  let low=true,high=true,min=center,max=center,valid=true;
  for(let dy=-radius;dy<=radius&&valid&&(low||high);dy++)for(let dx=-radius;dx<=radius;dx++){
   if(!dx&&!dy)continue;const v=values[(y+dy)*g.nx+x+dx];if(!Number.isFinite(v)){valid=false;break}
   min=Math.min(min,v);max=Math.max(max,v);if(v<center)low=false;if(v>center)high=false;
  }
  if(valid&&low&&max-center>=2)found.push({x,y,value:center,label:'T',strength:max-center});
  if(valid&&high&&center-min>=2)found.push({x,y,value:center,label:'H',strength:center-min});
 }
 return found.sort((a,b)=>b.strength-a.strength).filter((p,i,all)=>!all.slice(0,i).some(q=>q.label===p.label&&Math.hypot(q.x-p.x,q.y-p.y)<radius*2));
}
// Synoptic overlays use the same model, grid, run and valid time as the colour field.
function synopticGrid(d,id,b,coarse=false){
 const g=d?.grid,dx=g?.dx??g?.step,dy=g?.dy??g?.step;
 if(!d?.nativeMap||!Number.isFinite(dx)||!Number.isFinite(dy))return null;
 const raw=d.decoded.get(mapHour+'/'+id);if(!raw)return null;
 const scale=d.scales?.[id]??g.scale;
 const stride=Math.max(1,Math.ceil(coarse ? .55/Math.min(dx,dy):Math.max((b.east-b.west)/b.w/dx,(b.north-b.south)/b.h/dy)*3));
 const axis=(start,end,origin,step,n)=>{
  const a=Math.max(0,Math.floor((start-origin)/step)-stride),z=Math.min(n-1,Math.ceil((end-origin)/step)+stride);
  if(z<a)return [];
  const out=[];for(let i=a;i<=z;i+=stride)out.push(i);if(out.at(-1)!==z)out.push(z);return out;
 };
 const xs=axis(b.west,b.east,g.west,dx,g.nx),ys=axis(b.south,b.north,g.south,dy,g.ny);
 if(xs.length<2||ys.length<2)return null;
 const x=xs.map(i=>g.west+i*dx),y=ys.map(i=>g.south+i*dy);
 const values=ys.flatMap(j=>xs.map(i=>{const v=raw[j*g.nx+i];return v===g.missing?NaN:v*scale}));
 return {x,y,values,nx:x.length,ny:y.length};
}
// Marching squares. Interpolation is only used to draw isolines between
// neighbouring original values; the colour raster and readouts stay native.
function synopticContours(g,interval){
 const lines=new Map();if(!g)return lines;
 for(let j=0;j<g.ny-1;j++)for(let i=0;i<g.nx-1;i++){
  const n=j*g.nx+i,v=[g.values[n],g.values[n+1],g.values[n+g.nx+1],g.values[n+g.nx]];
  if(!v.every(Number.isFinite))continue;
  const x0=g.x[i],x1=g.x[i+1],y0=g.y[j],y1=g.y[j+1],p=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],lo=Math.min(...v),hi=Math.max(...v);
  for(let t=Math.ceil(lo/interval)*interval;t<hi;t+=interval){
   const crossings=[];for(let k=0;k<4;k++){const l=(k+1)%4;if((v[k]>t)===(v[l]>t))continue;const f=(t-v[k])/(v[l]-v[k]);crossings.push([p[k][0]+f*(p[l][0]-p[k][0]),p[k][1]+f*(p[l][1]-p[k][1])])}
   if(crossings.length<2)continue;let seg=lines.get(t);if(!seg)lines.set(t,seg=[]);
   if(crossings.length===2)seg.push([crossings[0],crossings[1]]);
   else if(crossings.length===4){const center=v.reduce((a,b)=>a+b,0)/4;if((center>t)===(v[0]>t))seg.push([crossings[0],crossings[1]],[crossings[2],crossings[3]]);else seg.push([crossings[0],crossings[3]],[crossings[1],crossings[2]])}
  }
 }
 return lines;
}
function synopticCenters(g,threshold){
 if(!g)return [];const out=[],r=2;
 for(let j=r;j<g.ny-r;j++)for(let i=r;i<g.nx-r;i++){
  const value=g.values[j*g.nx+i];if(!Number.isFinite(value))continue;
  let min=value,max=value,valid=true,strictLow=false,strictHigh=false;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const v=g.values[(j+dy)*g.nx+i+dx];if(!Number.isFinite(v))valid=false;else{min=Math.min(min,v);max=Math.max(max,v);if(v>value)strictLow=true;if(v<value)strictHigh=true}}
  if(!valid)continue;
  if(min===value&&strictLow&&max-value>=threshold)out.push({lon:g.x[i],lat:g.y[j],value,label:'T',strength:max-value});
  if(max===value&&strictHigh&&value-min>=threshold)out.push({lon:g.x[i],lat:g.y[j],value,label:'H',strength:value-min});
 }
 return out.sort((a,b)=>b.strength-a.strength);
}
function drawSynopticOverlay(ctx,b,p){
 if(!['synoptic','syn850','syn500','slp','z500','jet','windp250'].includes(p.id)||modelDataMode!=='real'||!modelValidDate())return;
 const d=realData();if(!d?.nativeMap||!nativeFieldsReady(d,p,mapHour))return;
 const occupied=[],free=(x,y,r)=>x>r&&y>r&&x<b.w-r&&y<b.h-r&&!occupied.some(a=>Math.hypot(x-a[0],y-a[1])<r+a[2]);
 const label=(s,x,y,color,size=12)=>{ctx.font='bold '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.94)';ctx.strokeText(s,x,y);ctx.fillStyle=color;ctx.fillText(s,x,y)};
 ctx.save();
 if(['synoptic','syn850','syn500','slp','z500'].includes(p.id)){
  const id=['z500','syn500'].includes(p.id)?'z500':'slp',step=id==='slp'?5:6,grid=synopticGrid(d,id,b),centers=synopticCenters(synopticGrid(d,id,b,true),id==='slp'?1.5:2);
  // Reserve room for pressure centres before placing contour labels.
  const marks=[];for(const c of centers){const [x,y]=xy(c.lon,c.lat,b);if(!free(x,y,42))continue;occupied.push([x,y,42]);marks.push({...c,x,y});if(marks.length>=12)break}
  for(const [v,segments] of synopticContours(grid,step)){
   ctx.beginPath();let candidate=null;
   for(const [a,z] of segments){const [x,y]=xy(...a,b),[X,Y]=xy(...z,b);ctx.moveTo(x,y);ctx.lineTo(X,Y);const xx=(x+X)/2,yy=(y+Y)/2;if(!candidate&&free(xx,yy,30))candidate=[xx,yy]}
   ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2.5;ctx.stroke();ctx.strokeStyle='#203047';ctx.lineWidth=1.05;ctx.stroke();
   if(candidate){label(String(v),...candidate,'#1b293d');occupied.push([...candidate,30])}
  }
  for(const c of marks){const color=c.label==='H'?'#b42318':'#124caf';label((id==='z500'?'Höhen-':'')+c.label,c.x,c.y-9,color,id==='z500'?15:22);label(Math.round(c.value)+' '+(id==='slp'?'hPa':'dam'),c.x,c.y+12,color,12)}
 }else if(p.id==='jet'||p.id==='windp250'){
  const lev=p.id==='jet'?300:250;
  for(let y=34;y<b.h-20;y+=72)for(let x=32;x<b.w-20;x+=72){
   const [lon,lat]=lonlat(x,y,b),u=realModelValue(d,{id:'u'+lev},lon,lat,mapHour),v=realModelValue(d,{id:'v'+lev},lon,lat,mapHour),speed=Math.hypot(u,v);
   if(!Number.isFinite(speed)||speed<15)continue;
   const vx=u/Math.max(.15,Math.cos(lat*Math.PI/180))*b.w/(b.east-b.west),vy=-v*b.h/(b.north-b.south),a=Math.atan2(vy,vx),len=12+Math.min(22,speed*.23);
   ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-len/2,0);ctx.lineTo(len/2,0);ctx.lineTo(len/2-6,-5);ctx.moveTo(len/2,0);ctx.lineTo(len/2-6,5);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=3.5;ctx.stroke();ctx.strokeStyle='#17263b';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
  }
 }
 ctx.restore();
}
// Plot exactly one pixel per published grid cell, scaled with nearest-neighbour.
// Geographic cell edges remain fixed when the map is panned or zoomed.
function drawModelCells(ctx,b,p){
 const d=realData(),native=!d?.nativeMap&&p.id==='temp2'?matchingNativeMap():null;
 if(!modelValidDate()||(d?.nativeMap?!nativeFieldsReady(d,p,mapHour):!native)){ctx.fillStyle='#5f6e7d';ctx.fillRect(0,0,b.w,b.h);return;}
 if(!d)return;const g=native?native.meta.grid:d.grid,dx=g.dx??g.step,dy=g.dy??g.step;
 const x0=Math.max(0,Math.floor((b.west-g.west)/dx+.5)),x1=Math.min(g.nx-1,Math.ceil((b.east-g.west)/dx+.5));
 const y0=Math.max(0,Math.floor((b.south-g.south)/dy+.5)),y1=Math.min(g.ny-1,Math.ceil((b.north-g.south)/dy+.5));
 if(x1<x0||y1<y0)return;const w=x1-x0+1,h=y1-y0+1;
 const baseKey=[d.model,d.file,d.generated,d.run,p.id,mapHour,native?.meta.generated||''].join('/'),tile=64,start=performance.now();let pending=false;
 ctx.fillStyle='#5f6e7d';ctx.fillRect(0,0,b.w,b.h);
 // Fixed geographical tiles survive pan and zoom. Yield between tiles instead
 // of blocking the main thread with a full-resolution viewport raster.
 for(let ty=Math.floor(y0/tile)*tile;ty<=y1;ty+=tile)for(let tx=Math.floor(x0/tile)*tile;tx<=x1;tx+=tile){
 const x0=tx,y0=ty,x1=Math.min(g.nx-1,tx+tile-1),y1=Math.min(g.ny-1,ty+tile-1),w=x1-x0+1,h=y1-y0+1,key=baseKey+'/'+tx+'/'+ty;
 let modelRaster=modelRasterCache.get(key);
 if(!modelRaster){if(performance.now()-start>7){pending=true;continue}modelRaster=document.createElement('canvas');modelRaster.width=w;modelRaster.height=h;const buf=modelRaster.getContext('2d'),img=buf.createImageData(w,h);
 const directId=({synoptic:'z500',syn850:'t850',syn500:'t500',rh:'rh2'})[p.id]||p.id,direct=!native&&p.id!=='jet'&&!diagnosticKeys(p.id)&&!/^rain\d+$/.test(p.id)&&!['rainrate','radiation','conv','strat'].includes(p.id)?d.decoded.get(mapHour+'/'+directId):null;
 const scale=d.scales?.[directId]??g.scale,parameter=['rainrate','radiation'].includes(p.id)?{...p,mapIntervalHours:mapInterval(d,p.id,mapHour)}:p;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const x=x0+i,y=y1-j,lon=g.west+x*dx,lat=g.south+y*dy,raw=direct?.[y*g.nx+x],v=native?nativeMapTemperatureValue(native,lon,lat):direct?(raw===g.missing?NaN:raw*scale):realModelValue(d,parameter,lon,lat,mapHour);
  const c=Number.isFinite(v)?colorAt(p,v):[95,110,125],n=(j*w+i)*4;
  img.data[n]=c[0];img.data[n+1]=c[1];img.data[n+2]=c[2];img.data[n+3]=255;
 }
 buf.putImageData(img,0,0);modelRasterCache.set(key,modelRaster);}
 else{modelRasterCache.delete(key);modelRasterCache.set(key,modelRaster)}
 const [left,top]=xy(g.west+(x0-.5)*dx,g.south+(y1+.5)*dy,b),[right,bottom]=xy(g.west+(x1+.5)*dx,g.south+(y0-.5)*dy,b);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(modelRaster,left,top,right-left,bottom-top);ctx.restore();
 }if(pending)scheduleMap();else while(modelRasterCache.size>Math.max(384,Math.ceil((x1-x0+1)/tile+1)*Math.ceil((y1-y0+1)/tile+1)))modelRasterCache.delete(modelRasterCache.keys().next().value);
}
function drawMap(fast=false){
 const p=fields[mapLayer],b=bounds();mapView=b;
 if(mapCanvas.width!==b.w)mapCanvas.width=b.w;if(mapCanvas.height!==b.h)mapCanvas.height=b.h;const ctx=mapCanvas.getContext('2d');
 if(!ctx)return;
 ctx.clearRect(0,0,b.w,b.h);
 if(mapSource==='live'&&terrainMode!=='topo'){
  drawLiveBase(ctx,b);
 }else if(terrainMode!=='topo'&&modelDataMode==='real'){
  fetchNativeMapModel(mapModel);const d=realData();if(modelValidDate()){if(d?.nativeMap){fetchNativeMapFields(d,p,mapHour);prefetchNextMapField(d,p,mapHour)}else if(mapLayer==='temp2')fetchNativeMapTemperature()}drawModelCells(ctx,b,p);
 }else if(terrainMode!=='topo'){
  const bw=Math.round(b.w/(fast?7:3.5)),bh=Math.round(b.h/(fast?7:3.5));
  mapBuffer.width=bw;mapBuffer.height=bh;const buf=mapBuffer.getContext('2d');const img=buf.createImageData(bw,bh);
  for(let j=0;j<bh;j++){const lat=b.north-j/(bh-1)*(b.north-b.south);for(let i=0;i<bw;i++){const lon=b.west+i/(bw-1)*(b.east-b.west),c=gridSample(p,lon,lat).color,n=(j*bw+i)*4;img.data[n]=c[0];img.data[n+1]=c[1];img.data[n+2]=c[2];img.data[n+3]=255}}
  buf.putImageData(img,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(mapBuffer,0,0,b.w,b.h);
 }
 const liveContinuous=mapSource==='live'&&terrainMode!=='topo'&&['temperature','wind','gust'].includes(liveLayer);
 if(liveContinuous)drawLiveField(ctx,b,fast);
 if(!(mapSource==='live'&&terrainMode!=='topo'&&['radar','types','snowfall','satellite','temperature','wind','gust'].includes(liveLayer)))drawTerrain(ctx,b,fast);
 if(mapSource==='live'&&terrainMode!=='topo'){if(!liveContinuous)drawLiveField(ctx,b,fast);drawLiveSymbols(ctx,b);if(['wind','gust'].includes(liveLayer))drawLiveWindArrows(ctx,b)}
 drawGeography(ctx,b);drawOnlineMap(ctx,b,fast);drawBasemap(ctx,b);if(mapSource==='model'&&terrainMode!=='topo'&&!fast)drawSynopticOverlay(ctx,b,p);drawMapPlaces(ctx,b);
 if(mapSource==='live'&&terrainMode!=='topo'&&typeof realLiveEnabled!=='undefined'&&realLiveEnabled)drawRealStations(ctx,b);
 if(mapSource==='live'&&terrainMode!=='topo')drawLiveStrikes(ctx,b);
 if(mapPoint){const [x,y]=xy(...mapPoint,b);if(x>=0&&x<=b.w&&y>=0&&y<=b.h){ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#192735';ctx.stroke()}}
 if(mapSnapshot.width!==b.w)mapSnapshot.width=b.w;if(mapSnapshot.height!==b.h)mapSnapshot.height=b.h;
 const snap=mapSnapshot.getContext('2d');snap.clearRect(0,0,b.w,b.h);snap.drawImage(mapCanvas,0,0);snapshotBounds=b;snapshotKey=mapContentKey();
}
// During a gesture only reproject the previous image. Newly exposed regions
// are filled after the gesture, instead of rebuilding native grids per touch.
function drawMapGesture(){
 const b=bounds(),s=snapshotBounds,ctx=mapCanvas.getContext('2d');
 if(s&&snapshotKey===mapContentKey()&&b.w===s.w&&b.h===s.h){
  const [x,y]=xy(s.west,s.north,b),[right,bottom]=xy(s.east,s.south,b),w=right-x,h=bottom-y;
  if(w>0&&h>0){
   ctx.fillStyle='#8393a2';ctx.fillRect(0,0,b.w,b.h);ctx.imageSmoothingEnabled=false;ctx.drawImage(mapSnapshot,x,y,w,h);mapView=b;return;
  }
 }
 drawMap(true);
}
function legend(){
 el('live-lightning-note').hidden=true;
 el('radar-type-legend').hidden=true;el('legend-strip').hidden=false;el('legend-ticks').hidden=false;
 if(terrainMode==='topo'){el('legend-name').textContent='Geländehöhe';el('legend-unit').textContent='m';el('legend-strip').style.background='linear-gradient(90deg,'+topoPalette.join(',')+')';el('legend-ticks').innerHTML=topoStops.map(v=>'<span>'+v.toLocaleString('de-DE')+'</span>').join('');return}
 if(mapSource==='live'){liveLegend();return}
 const p=fields[mapLayer];el('legend-name').textContent=p.id==='synoptic'?'500 hPa · Farbflächen / Isobaren · hPa':p.label;el('legend-unit').textContent=p.unit;
 el('legend-strip').style.background='linear-gradient(90deg,'+palettes[p.palette].join(',')+')';
 el('legend-ticks').innerHTML=p.stops.map(v=>'<span>'+v.toLocaleString('de-DE')+'</span>').join('');
}
function renderSample(){
 const p=fields[mapLayer];if(!mapPoint){el('map-sample').innerHTML='<span>Tippe auf die Karte, um einen Beispielwert abzulesen.</span>';return}
 if(mapSource==='live'&&terrainMode!=='topo'){
  const [lon,lat]=mapPoint;el('map-sample').innerHTML='<div>'+el('map-layer-title').textContent+(typeof realLiveEnabled!=='undefined'&&realLiveEnabled?' · '+realLiveInfo().source:liveIsFuture()?' · Prognose (Demo)':' · Demo')+'<br><span>'+lat.toFixed(3)+'° N · '+Math.abs(lon).toFixed(3)+'° '+(lon<0?'W':'O')+'</span></div><b>'+liveSampleText(lon,lat)+'</b>';
  const district=districtAt(lon,lat),name=mapPointName||(district?district.type+' '+district.name:'');
  if(name){const label=document.createElement('span');label.textContent=name+' · ';el('map-sample').firstElementChild.prepend(label)}return;
 }
 const [lon,lat]=mapPoint,value=terrainMode==='topo'?terrainHeight(lon,lat):gridSample(p,lon,lat).value;
 const v=p.unit==='°C'?temperatureText(value):value.toLocaleString('de-DE',{maximumFractionDigits:p.id==='visibility'?2:1});
 el('map-sample').innerHTML='<div>'+(terrainMode==='topo'?'Geländehöhe (ca.)':p.label)+'<br><span>'+lat.toFixed(3)+'° N · '+Math.abs(lon).toFixed(3)+'° '+(lon<0?'W':'O')+'</span></div><b>'+(!Number.isFinite(value)?'Keine Daten':terrainMode==='topo'?Math.round(value).toLocaleString('de-DE')+' m':v+' '+p.unit)+'</b>';
 if(['synoptic','syn850','syn500'].includes(p.id)&&terrainMode!=='topo'&&modelDataMode==='real'){const height=p.id==='syn500',secondary=realModelValue(realData(),{id:height?'z500':'slp'},lon,lat,mapHour);if(Number.isFinite(secondary)&&Number.isFinite(value))el('map-sample').lastElementChild.textContent=v+' '+p.unit+' · '+secondary.toLocaleString('de-DE',{maximumFractionDigits:1})+' '+(height?'dam':'hPa');}
 const district=districtAt(lon,lat),name=mapPointName||(district?district.type+' '+district.name:'');
 if(name){const label=document.createElement('span');label.textContent=name+' · ';el('map-sample').firstElementChild.prepend(label)}
}
const timeText=d=>d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',timeZone:'UTC'})+' · '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';
const forecastTimeText=d=>localTime(d.getTime(),{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})+' Uhr';
function minHour(){const step=effectiveModel().step;return modelDataMode==='real'&&mapLayer==='rainrate'?step:Math.ceil(fields[mapLayer].interval/step)*step}
let mapTargetTime=null,mapFutureHours=[];
function realForecastMap(){return mapSource==='model'&&modelDataMode==='real'&&terrainMode!=='topo'}
function syncModelTimeline(now=Date.now()){
 if(!realForecastMap())return false;
 const d=realData(now),hours=futureMapHours(d,fields[mapLayer],now),old=mapHour;
 const next=nextMapSelection(d,hours,mapTargetTime,now);mapHour=next.hour;mapTargetTime=next.target;mapFutureHours=hours;
 const slider=el('map-time'),i=hours.indexOf(mapHour);slider.min=0;slider.max=Math.max(0,hours.length-1);slider.step=1;slider.value=Math.max(0,i);slider.disabled=hours.length<2;slider.setAttribute('aria-label','Zukünftige Modellzeit (Ortszeit)');slider.setAttribute('aria-valuetext',i<0?'Keine zukünftigen Daten':forecastTimeText(new Date(mapLeadTime(d,mapHour))));
 el('map-back').disabled=i<=0;el('map-next').disabled=i<0||i===hours.length-1;el('map-play').disabled=hours.length<2;
 if(hours.length<2&&mapTimer!==null)stopPlay();
 return !Object.is(old,mapHour);
}
function selectFutureMapIndex(index){
 syncModelTimeline();const d=realData(),h=mapFutureHours[index];if(!d||h===undefined)return;
 mapTargetTime=index===0?null:mapLeadTime(d,h);syncModelTimeline();
}
function mapLabels(){
 const p=fields[mapLayer],status=modelStatus();el('map-layer-title').textContent=terrainMode==='topo'?'Topografie · Geländehöhe':p.label;el('map-model-badge').textContent=terrainMode==='topo'?'Relief':mapModel;el('map-overlay-model').textContent=terrainMode==='topo'?'TOPO':mapModel;
 el('map-overlay-data').textContent=terrainMode==='topo'?'GELÄNDE':mapSource==='live'||modelDataMode==='demo'?'DEMO':(realData()?.nativeMap?nativeFieldsReady(realData(),p,mapHour):mapLayer==='temp2'&&matchingNativeMap())?'ORIGINALRASTER':'ORIGINALDATEN AUSSTEHEND';
 el('map-weather-controls').hidden=terrainMode==='topo';el('map-time-controls').hidden=terrainMode==='topo';el('map-run-info').hidden=terrainMode==='topo';
 el('map-live-controls').hidden=mapSource!=='live'||terrainMode==='topo';
 el('map-data-notice').textContent=mapSource==='live'?'Demo · keine Messdaten':status.label;
 document.querySelectorAll('[data-map-source]').forEach(b=>{const on=b.dataset.mapSource===mapSource;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 const cadence=realForecastMap()?mapCadence(realData(),p):'';
 el('map-view-description').textContent=terrainMode==='topo'?'Echtes Geländemodell · Höhen in Metern':status.detail+(cadence?' · '+cadence:'');
 el('map-gesture-hint').textContent='Ziehen zum Verschieben · Zwei Finger zum Zoomen · Antippen zum Ablesen '+(terrainMode==='topo'?'der Geländehöhe':'eines Modellrasterwerts');
 const date=modelValidDate();
 el('map-time-label').textContent=modelDataMode==='real'?(date?forecastTimeText(date):'Keine Prognose'):'+'+mapHour+' Std.';
 el('map-valid').textContent=date?'Gültig: '+(modelDataMode==='real'?forecastTimeText(date):timeText(date)):'Keine zukünftige Prognose verfügbar';
 const n=p.id==='rainTotal'?mapHour:p.interval,available=realData()&&realModelSupported(p,effectiveModel().step,effectiveModel().max);
 el('map-interval').textContent=modelDataMode==='real'&&!available?'Für diesen Parameter sind keine zukünftigen Realdaten verfügbar.':date&&n>0?'Summenzeitraum: '+(modelDataMode==='real'?forecastTimeText(new Date(date.getTime()-n*3600000))+' – '+forecastTimeText(date):timeText(new Date(date.getTime()-n*3600000))+' – '+timeText(date)):(p.id==='rainTotal'?'Summe seit Modellstart: 0 mm':p.id==='rainrate'?(modelDataMode==='real'?'Mittlere Niederschlagsrate · letzte '+mapInterval(realData(),p.id,mapHour)+' h':'Momentane Rate (mm/h)'):'');
 if(terrainMode==='topo')el('map-interval').textContent='';
 else if(mapSource==='model'&&modelDataMode==='real'&&available){const synopticHint={syn850:'Farbe: Temperatur auf 850 hPa (etwa 1,5 km) · Isobaren alle 5 hPa · Boden-H/T',syn500:'Farbe: Temperatur auf 500 hPa (etwa 5,5 km) · Isohypsen alle 6 dam · Höhen-H/T',synoptic:'Farbe: 500-hPa-Geopotential (dam) · Linien: Bodendruck (5 hPa) · H/T: Bodenhochs und -tiefs',slp:'Isobaren alle 5 hPa · H/T: lokale Druckzentren',z500:'Isohypsen alle 6 dam · Höhen-H/T: lokale Geopotentialzentren',jet:'Pfeile: Strömungsrichtung · Farben: Geschwindigkeit auf 300 hPa',windp250:'Pfeile: Strömungsrichtung · Farben: Geschwindigkeit auf 250 hPa'}[p.id];if(synopticHint)el('map-interval').textContent=synopticHint;}
 if(mapSource==='live'&&terrainMode!=='topo'){
  el('map-weather-controls').hidden=true;
  for(const id of ['map-live-scenario','map-live-lightning','map-live-symbols'])el(id).closest('label').hidden=typeof realLiveEnabled!=='undefined'&&realLiveEnabled;
  document.querySelector('.live-map-note').textContent='Demo · simulierte Beobachtungen und Prognosen, keine aktuellen Messdaten.';
  const future=liveIsFuture(),minute=liveDisplayMinute(),temp=liveLayer==='temperature',wind=['wind','gust'].includes(liveLayer),hourly=liveHourlyMode(),dailyRadar=hourly&&nowcastLayers.has(liveLayer);
  el('map-layer-title').textContent=temp?(future?'Temperaturprognose · 2 m':'Temperatur · 2 m'):wind?(future?'Windprognose · 10 m':'Wind · 10 m'):dailyRadar?(liveLayer==='radar'?(future?'Niederschlagsprognose':'Niederschlag · Tagesverlauf'):liveLayers[liveLayer].label+(future?' · Prognose':'')):liveLayers[liveLayer].label;
  el('map-model-badge').textContent=future?'PROGNOSE · DEMO':'LIVE · DEMO';el('map-overlay-model').textContent=future?(hourly?'PROGNOSE':'NOWCAST'):'OBS';
  el('map-view-description').textContent=future?'Simulierte Vorschau · keine echten Prognosedaten':'Beobachtungskarte · simulierte Messdaten';
  el('map-data-notice').textContent=future?'Demo-Prognose · keine Messdaten':'Demo · keine Messdaten';
  el('map-valid').textContent=(future?'Prognose: ':'Demo: ')+timeText(liveTime());
  el('map-interval').textContent=hourly?(temp?'Stündliche Temperaturentwicklung':wind?'Stündliche Windentwicklung':'Stündliche Niederschlagsentwicklung · keine Radarfortschreibung')+' · Demo':liveLayer==='lightning'?(liveScenario==='winter'?'Keine Beispielblitze · Sommergewitter auswählen, um Blitze zu testen':'Blitzereignisse der letzten 30 Minuten'):liveLayer==='snowcover'?'Beispiel-Schneedecke (keine Echtzeitmessung)':nowcastLayers.has(liveLayer)?(future?'Radar-Vorschau · simulierte Verlagerung bis +90 Minuten'+(liveLightning?' · Blitze nur bis Jetzt':''):'5-Minuten-Schritte · Vorschau bis +90 Minuten'):'5-Minuten-Zeitschritte · keine Vorhersage';
  el('map-time-label').textContent=hourly?String(liveTempHour).padStart(2,'0')+':00 UTC':minute===0?'Jetzt (Demo)':minute>0?'+'+minute+' Min.':Math.abs(minute)+' Min. zuvor';
  el('map-gesture-hint').textContent='Ziehen zum Verschieben · Zwei Finger zum Zoomen · Antippen zum Ablesen';
  el('map-play').setAttribute('aria-label',mapTimer===null?(hourly?'Stündlichen Wetterverlauf abspielen':'Radar-Zeitverlauf abspielen'):'Wiedergabe pausieren');
 }
 if(mapSource==='live'&&terrainMode!=='topo'&&typeof realLiveEnabled!=='undefined'&&realLiveEnabled)realLiveLabels();
 syncLiveTimeControls();
 el('map-zoom-minus').disabled=mapZoom<=1;el('map-zoom-plus').disabled=mapZoom>=24;el('map-zoom-level').textContent=mapZoom.toFixed(1)+'×';
 updateFullMapLabels();
}
function refreshMap(){syncModelTimeline();mapLabels();legend();if(activePage==='map'){drawMap();renderSample()}}
function scheduleMap(){if(activePage!=='map'||mapFrame!==null)return;mapFrame=requestAnimationFrame(()=>{mapFrame=null;if(activePage!=='map')return;if(mapGesture){drawMapGesture();el('map-zoom-minus').disabled=mapZoom<=1;el('map-zoom-plus').disabled=mapZoom>=24;el('map-zoom-level').textContent=mapZoom.toFixed(1)+'×'}else refreshMap()})}
function beginMapGesture(){
 mapGesture=true;if(gestureTimer!==null)clearTimeout(gestureTimer);
 gestureTimer=setTimeout(endMapGesture,140);
}
function endMapGesture(){
 if(gestureTimer!==null)clearTimeout(gestureTimer);gestureTimer=null;
 if(mapGesture){mapGesture=false;scheduleMap()}
}
function renderMap(){
 if(mapSource==='model'&&mapLayer==='hail'){if(mapModel!=='ICON-D2-RUC')selectedMapRun=null;mapModel='ICON-D2-RUC';if(mapRegion!=='Deutschland'){mapRegion='Deutschland';mapZoom=1;mapCenter=null;mapPoint=null;mapPointName=''}}
 const list=mapOptions();if(!list.includes(mapModel))mapModel=list[0];const model=effectiveModel();
 if(realForecastMap())syncModelTimeline();
 modelSelect.innerHTML=list.map(s=>'<option value="'+s+'" '+(s===mapModel?'selected':'')+'>'+s+'</option>').join('');
 const data=realData(),available=mapParameters,groups=[...new Set(available.map(p=>p.group))];
 parameterSelect.disabled=modelDataMode==='real'&&!data&&mapModel!=='ICON-D2-RUC';
 parameterSelect.innerHTML=groups.map(g=>'<optgroup label="'+g+'">'+available.filter(p=>p.group===g).map(p=>'<option value="'+p.id+'" '+(p.id===mapLayer?'selected':'')+'>'+p.label+(data&&p.id!=='hail'&&!realModelSupported(p,model.step,model.max,true)?' · nicht verfügbar':'')+'</option>').join('')+'</optgroup>').join('');
 const run=el('map-run'),runs=modelDataMode==='real'?futureMapRuns(mapModel).filter((d,i,a)=>a.findIndex(r=>r.run===d.run)===i):mapModelRuns(mapModel);if(selectedMapRun!==null&&!runs.some(d=>Date.parse(d.run)===selectedMapRun))selectedMapRun=null;run.disabled=modelDataMode==='real'&&runs.length<2;el('map-run-label').textContent=modelDataMode==='real'?'Modelllauf ('+modelProvider(mapModel)+', UTC)':'Modelllauf (Demo)';
 run.innerHTML=modelDataMode==='real'?'<option value="auto">'+(runs.length?'Aktuell · '+timeText(new Date((realData()||runs[0]).run)):'Modell wird geladen …')+'</option>'+runs.map(d=>'<option value="'+Date.parse(d.run)+'" '+(Date.parse(d.run)===selectedMapRun?'selected':'')+'>'+timeText(new Date(d.run))+' (+'+d.hours.at(-1)+' h)</option>').join(''):[0,6,12].map(h=>'<option value="'+h+'" '+(mapRun===h?'selected':'')+'>15.11. · '+String(h).padStart(2,'0')+' UTC</option>').join('');
 el('map-data-mode').value=modelDataMode;el('map-data-refresh').hidden=modelDataMode!=='real';
 const time=el('map-time');if(mapSource==='live'){syncLiveTimeControls()}
 else if(modelDataMode!=='real'){time.max=model.max;time.step=model.step;time.min=Math.min(minHour(),model.max);mapHour=clamp(Math.round((Number.isFinite(mapHour)?mapHour:0)/model.step)*model.step,+time.min,model.max);time.value=mapHour;time.setAttribute('aria-label','Vorhersagezeit');time.removeAttribute('aria-valuetext');for(const id of ['map-time','map-back','map-next','map-play'])el(id).disabled=false}
 document.querySelectorAll('[data-region]').forEach(b=>b.classList.toggle('active',b.dataset.region===mapRegion));
 refreshMap();
}
function stopPlay(){if(mapTimer!==null){clearInterval(mapTimer);mapTimer=null}el('map-play').textContent='▶';el('map-play').setAttribute('aria-label',mapSource==='live'?'Radar-Zeitverlauf abspielen':'Vorhersage abspielen')}
function openMapLayer(id,model,frame=null){stopPlay();mapSource='model';if(terrainMode==='topo'){terrainMode='weather-relief';el('map-terrain-mode').value=terrainMode}if(id&&fields[id])mapLayer=id;else if(model&&model!=='ICON-D2-RUC'&&mapLayer==='hail')mapLayer='temp2';if(model&&mapModels[model]){if(mapModel!==model)selectedMapRun=null;mapModel=model;if(model==='ICON-D2'&&mapRegion!=='Deutschland'){mapRegion='Deutschland';mapZoom=1;mapCenter=null;mapPoint=null;mapPointName=''}}if(frame){if(modelDataMode==='real'){selectedMapRun=null;mapTargetTime=frame.time>Date.now()?frame.time:null}else mapHour=frame.hour;mapPoint=frame.point;mapPointName=location.name;}renderMap();setPage('map')}
modelSelect.addEventListener('change',()=>{stopPlay();selectedMapRun=null;mapModel=modelSelect.value;renderMap();if(modelDataMode==='real')fetchMapAvailability(mapModel)});
parameterSelect.addEventListener('change',()=>{stopPlay();mapLayer=parameterSelect.value;if(['synoptic','syn850','syn500'].includes(mapLayer)&&mapRegion!=='Europa'){mapRegion='Europa';selectedMapRun=null;mapZoom=1;mapCenter=null;mapPoint=null;mapPointName=''}renderMap();if(modelDataMode==='real')fetchMapAvailability(mapModel)});
el('map-run').addEventListener('change',e=>{if(modelDataMode==='real'){selectedMapRun=e.target.value==='auto'?null:Number(e.target.value);realModelRevision++;renderMap()}else{mapRun=+e.target.value;scheduleMap()}});
document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{stopPlay();mapRegion=b.dataset.region;selectedMapRun=null;mapZoom=1;mapCenter=null;mapPoint=null;mapPointName='';renderMap();if(mapSource==='model'&&modelDataMode==='real')fetchMapAvailability(mapModel)}));
document.querySelectorAll('[data-map-source]').forEach(b=>b.addEventListener('click',()=>setMapSource(b.dataset.mapSource)));
el('map-live-layer').addEventListener('change',e=>selectLiveLayer(e.target.value));
el('map-live-scenario').addEventListener('change',e=>{stopPlay();liveScenario=e.target.value;resetLiveTime();scheduleMap()});
document.querySelectorAll('[data-temperature-day]').forEach(b=>b.addEventListener('click',()=>selectLiveDay(+b.dataset.temperatureDay)));
el('map-radar-nowcast').addEventListener('click',()=>selectLiveNowcast());
el('map-nowcast-now').addEventListener('click',()=>selectLiveNowcast());
el('map-nowcast-forward').addEventListener('click',()=>selectLiveNowcast(90));
el('map-live-lightning').addEventListener('change',e=>{liveLightning=e.target.checked;scheduleMap()});
el('map-live-symbols').addEventListener('change',e=>{liveSymbols=e.target.checked;scheduleMap()});
bindFullMap();
function stepMap(direction,wrap=false){if(realForecastMap()){syncModelTimeline();const i=mapFutureHours.indexOf(mapHour),max=mapFutureHours.length-1;if(i<0)return;const next=i+direction;selectFutureMapIndex(wrap&&next>max?0:clamp(next,0,max));scheduleMap();return}const slider=el('map-time'),step=+slider.step||1,min=+slider.min,max=+slider.max;if(mapSource==='live'&&liveHourlyMode()){let hour=liveTempHour+direction;if(hour<0&&liveTempDay>0){liveTempDay--;hour=23}else if(hour>23&&liveTempDay<2){liveTempDay++;hour=0}else if(wrap&&hour>23){liveTempDay=0;hour=0}liveTempHour=clamp(hour,0,23)}else{const value=(mapSource==='live'?liveMinute:mapHour)+direction*step,next=wrap&&value>max?min:clamp(value,min,max);if(mapSource==='live')liveMinute=next;else mapHour=next;slider.value=next}scheduleMap()}
el('satellite-now').addEventListener('click',()=>{stopPlay();liveMinute=0;scheduleMap()});
el('map-back').addEventListener('click',()=>{stopPlay();stepMap(-1)});el('map-next').addEventListener('click',()=>{stopPlay();stepMap(1)});
el('map-time').addEventListener('input',e=>{stopPlay();const value=+e.target.value;if(realForecastMap())selectFutureMapIndex(value);else if(mapSource==='live'){if(liveHourlyMode())liveTempHour=value;else liveMinute=value}else mapHour=value;scheduleMap()});
el('map-play').addEventListener('click',()=>{if(mapTimer!==null){stopPlay();return}el('map-play').textContent='Ⅱ';el('map-play').setAttribute('aria-label','Wiedergabe pausieren');mapTimer=setInterval(()=>{if(document.hidden){stopPlay();return}if(mapSource==='live'&&realLiveEnabled&&liveLayer==='satellite'&&liveMinute!==0&&timelineWaiting())return;if(mapSource==='live'&&realLiveEnabled&&['radar','types','snowfall'].includes(liveLayer)&&!liveHourlyMode()){const date=realLiveTime(),frame=ownRadarFrame(date,liveMinute===0);if(!frame){fetchNowcastMapFrame(date);prefetchNextRadar(date);stepMap(1,true);return;}if(!readyRadarFrame(frame,liveLayer,false)){ownRadarRaster(frame,liveLayer);return;}}const d=realData();if(mapSource==='model'&&d?.nativeMap&&!nativeFieldsReady(d,fields[mapLayer],mapHour)&&mapFieldRequirements(d,fields[mapLayer],mapHour).some(([h,k])=>nativeFieldLoading.has(d.file+'/'+d.generated+'/'+h+'/'+k)))return;stepMap(1,true)},750)});
// Re-evaluate at the civil hour boundary even if the user leaves the map open.
// Returning from a suspended mobile tab must also immediately discard old times.
let modelClockTimer=null;
function refreshForecastClock(){if(activePage==='map'&&realForecastMap()&&!document.hidden){endMapGesture();renderMap();fetchMapAvailability(mapModel)}}
function scheduleForecastClock(){if(modelClockTimer!==null)clearTimeout(modelClockTimer);const delay=3600000-Date.now()%3600000;modelClockTimer=setTimeout(()=>{refreshForecastClock();scheduleForecastClock()},delay+25)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshForecastClock();scheduleForecastClock()}});
window.addEventListener('focus',()=>{refreshForecastClock();scheduleForecastClock()});
scheduleForecastClock();
setInterval(()=>{if(activePage==='map'&&realForecastMap()&&!document.hidden){fetchMapAvailability(mapModel)}},5*60000);
const mapPointers=new Map();
let pointerMoved=false;
function centerView(lon,lat){
 const b=baseBounds(),dx=(b.east-b.west)/(2*mapZoom),dy=(b.north-b.south)/(2*mapZoom);
 mapCenter=[clamp(lon,b.west+dx,b.east-dx),clamp(lat,b.south+dy,b.north-dy)];
}
function zoomAt(next,u=.5,v=.5){
 const old=bounds(),[lon,lat]=lonlat(u*old.w,v*old.h,old);mapZoom=clamp(next,1,24);
 const b=baseBounds();centerView(lon+(.5-u)*(b.east-b.west)/mapZoom,lat+(v-.5)*(b.north-b.south)/mapZoom);
 beginMapGesture();scheduleMap();
}
function panBy(du,dv){
 const b=bounds();centerView((b.west+b.east)/2-du*(b.east-b.west),(b.south+b.north)/2+dv*(b.north-b.south));
}
function pointerPosition(e){const r=mapCanvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
function pointerPair(){const [a,b]=[...mapPointers.values()];return a&&b?{u:(a.pos[0]+b.pos[0])/2,v:(a.pos[1]+b.pos[1])/2,d:Math.hypot((a.pos[0]-b.pos[0])*mapCanvas.clientWidth,(a.pos[1]-b.pos[1])*mapCanvas.clientHeight)}:null}
el('map-zoom-plus').addEventListener('click',()=>zoomAt(mapZoom*1.5));
el('map-zoom-minus').addEventListener('click',()=>zoomAt(mapZoom/1.5));
el('map-zoom-reset').addEventListener('click',()=>{endMapGesture();mapZoom=1;mapCenter=null;mapPoint=null;mapPointName='';scheduleMap()});
mapCanvas.addEventListener('wheel',e=>{e.preventDefault();const [u,v]=pointerPosition(e);zoomAt(mapZoom*Math.exp(-e.deltaY*.0025),u,v)},{passive:false});
mapCanvas.addEventListener('pointerdown',e=>{
 if(e.button!==0&&e.pointerType==='mouse')return;
 if(mapPointers.size===0){pointerMoved=false;stopPlay()}
 const pos=pointerPosition(e);mapPointers.set(e.pointerId,{pos,start:pos});if(mapPointers.size>1)pointerMoved=true;
 if(mapCanvas.setPointerCapture)mapCanvas.setPointerCapture(e.pointerId);
});
mapCanvas.addEventListener('pointermove',e=>{
 const pointer=mapPointers.get(e.pointerId);if(!pointer)return;
 const oldPair=pointerPair(),pos=pointerPosition(e),old=pointer.pos;pointer.pos=pos;
 if(Math.hypot(pos[0]-pointer.start[0],pos[1]-pointer.start[1])>.008)pointerMoved=true;
 if(mapPointers.size>=2){const next=pointerPair();if(oldPair&&next&&oldPair.d>2){panBy(next.u-oldPair.u,next.v-oldPair.v);zoomAt(mapZoom*next.d/oldPair.d,next.u,next.v)}}
 else if(pointerMoved){panBy(pos[0]-old[0],pos[1]-old[1]);beginMapGesture();scheduleMap()}
});
function finishPointer(e,cancelled){
 const pointer=mapPointers.get(e.pointerId);if(!pointer)return;
 const single=mapPointers.size===1;mapPointers.delete(e.pointerId);
 if(!cancelled&&single&&!pointerMoved){const b=bounds(),[u,v]=pointerPosition(e);mapPoint=lonlat(u*b.w,v*b.h,b);mapPointName='';scheduleMap()}
 if(mapCanvas.hasPointerCapture&&mapCanvas.hasPointerCapture(e.pointerId))mapCanvas.releasePointerCapture(e.pointerId);
 if(mapPointers.size===0)endMapGesture();
}
mapCanvas.addEventListener('pointerup',e=>finishPointer(e,false));
mapCanvas.addEventListener('pointercancel',e=>finishPointer(e,true));
el('map-show-districts').addEventListener('change',e=>{showDistricts=e.target.checked;scheduleMap()});
el('map-show-places').addEventListener('change',e=>{showPlaces=e.target.checked;scheduleMap()});
el('map-show-roads').addEventListener('change',e=>{showRoads=e.target.checked;scheduleMap()});
el('map-show-terrain').addEventListener('change',e=>{showTerrain=e.target.checked;scheduleMap()});
el('map-show-water').addEventListener('change',e=>{showWater=e.target.checked;scheduleMap()});
el('map-terrain-mode').addEventListener('change',e=>{stopPlay();terrainMode=e.target.value;terrainRenderKey='';scheduleMap()});
function focusMapResult(result){
 stopPlay();mapRegion='Deutschland';const b=baseBounds();
 if(result.lon<b.west||result.lon>b.east||result.lat<b.south||result.lat>b.north)mapRegion='Europa';
 mapZoom=result.zoom;centerView(result.lon,result.lat);mapPoint=[result.lon,result.lat];mapPointName=result.name;el('map-search').value=result.name;el('map-search-results').replaceChildren();renderMap();
}
function renderMapSearch(){
 const results=el('map-search-results');results.replaceChildren();
 for(const result of mapSearch(el('map-search').value)){const button=document.createElement('button');button.type='button';button.textContent=result.name+' · '+result.type;button.addEventListener('click',()=>focusMapResult(result));results.appendChild(button)}
}
el('map-search').addEventListener('input',renderMapSearch);
el('map-search').addEventListener('keydown',e=>{if(e.key==='Enter'){const [result]=mapSearch(el('map-search').value);if(result)focusMapResult(result)}else if(e.key==='Escape')el('map-search-results').replaceChildren()});
document.addEventListener('pointerdown',e=>{if(!el('map-search').contains(e.target)&&!el('map-search-results').contains(e.target))el('map-search-results').replaceChildren()});

el('expert-open-map').addEventListener('click',()=>openMapLayer('ki'));
const expertMapLinks={'SBCAPE':'cape','MLCAPE':'mlcape','MUCAPE':'mucape','SBCIN':'cin','MLCIN':'mlcin','K-Index':'ki','Lifted Index':'li','Total Totals (TT)':'tt','DCAPE':'dcape','Scherung 0–1 km':'s01','Scherung 0–3 km':'s03','Scherung 0–6 km':'s06','SRH 0–1 km':'srh01','SRH 0–3 km':'srh03','Jet (300 hPa)':'jet','T 850 hPa':'t850','T 700 hPa':'t700','T 500 hPa':'t500','Theta-e 850 hPa':'thetae','LCL':'lcl','LFC':'lfc','EL':'el','Lapse Rate 850–500 hPa':'lapse','Lapse Rate 700–500 hPa':'lapse7','Geopotential 500 hPa':'z500','PWAT':'pwat','Rel. Feuchte 850 hPa':'rh850','Rel. Feuchte 700 hPa':'rh700','Rel. Feuchte 500 hPa':'rh500','QPF 24 h':'rain24','Konvektive QPF':'conv','Stratiforme QPF':'strat'};
Object.assign(expertMapLinks,{'Supercell Composite (SCP)':'scp','Significant Tornado (STP)':'stp','Significant Hail (SHIP)':'ship','Potenzielle Hagelgröße':'hail','Downburst / Microburst':'downburst','MUCIN':'mucin','Nullgradgrenze':'freezing','Scherung 850–500 hPa':'s850500','LCL (Näherung)':'lclApprox','Energy Helicity Index (EHI 0–3 km)':'ehi03','Ideale Abwindgeschwindigkeit':'dcapeSpeed','Storm-relative Wind':'stormrel'});
const expertDerivedDescriptions={scp:'MUCAPE × effektive SRH × effektive Scherung · Rechtsläufer',stp:'MLCAPE, MLCIN, MLLCL, effektive SRH/Scherung',ship:'MU-Luftpaket, Temperaturprofil und 0–6-km-Scherung · NOAA NSHARP',downburst:'WMSI · feuchte Downburst-Umgebung, keine Böengeschwindigkeit',dcape:'Gesättigtes Abwindpaket · Druckflächenprofil',hail:'DWD DEMAX_HAIL_S · modellierter maximaler Durchmesser',s850500:'Vektordifferenz der Druckflächen, nicht 0–6 km AGL',lclApprox:'Näherung 125 × (T − Td), keine exakte Paketberechnung',ehi03:'MLCAPE × SRH 0–3 km / 160000; kein Tornadonachweis',dcapeSpeed:'Ideale Energieumwandlung, keine Böenprognose',rain24:'24 h bis zur Modellgültigkeitszeit (rückblickend)',conv:'Letzte 24 Modellstunden',strat:'Letzte 24 Modellstunden'};
const parameterExplanations={
 cape:'SBCAPE (Surface-Based CAPE) beschreibt die Auftriebsenergie eines vom Boden aufsteigenden Luftpakets. Je höher der Wert, desto kräftiger können sich Schauer und Gewitter entwickeln. Auslösung, Feuchte und Windscherung müssen ebenfalls betrachtet werden.',
 mlcape:'MLCAPE ist die Auftriebsenergie eines über die untere Luftschicht gemittelten Luftpakets. Sie beschreibt das Potenzial für kräftige Aufwinde, auch wenn die bodennahen Bedingungen schwanken. Hohe Werte allein garantieren kein Gewitter.',
 mucape:'MUCAPE ist die größte Auftriebsenergie unter den untersuchten Luftpaketen. Sie kann auch bei Gewittern mit Ursprung oberhalb der bodennahen Luftschicht hoch sein.',
 cin:'SBCIN (Convective Inhibition) bezeichnet die Energiebarriere, die ein bodennahes Luftpaket beim Aufsteigen überwinden muss. Stark negative Werte können Gewitter trotz hoher CAPE unterdrücken; Hebung kann die Sperre überwinden.',
 mlcin:'MLCIN ist die Energiebarriere für ein über die untere Luftschicht gemitteltes Luftpaket. Je größer der negative Betrag, desto stärker ist die Hemmung der Konvektion.',
 mucin:'MUCIN ist die konvektive Hemmung des instabilsten betrachteten Luftpakets. Sie zeigt, wie schwer dieses Paket den freien Aufstieg erreichen kann.',
 li:'Der Lifted Index vergleicht die Temperatur eines gehobenen Luftpakets mit der Umgebung auf 500 hPa. Negative Werte sprechen für Instabilität; positive Werte für stabilere Bedingungen.',
 ki:'Der K-Index kombiniert Temperaturen und Feuchte in mehreren Druckschichten. Höhere Werte können ein feuchtes, gewitterfreundliches Umfeld anzeigen. Er ist kein Maß für die Gewitterstärke.',
 tt:'Total Totals kombiniert den Temperaturunterschied zwischen 850 und 500 hPa mit dem Taupunkt auf 850 hPa. Höhere Werte deuten auf günstigere Bedingungen für Konvektion hin.',
 dcape:'DCAPE beschreibt die verfügbare Energie für absinkende Luft. Hohe Werte können kräftige Abwinde begünstigen, sind aber keine direkte Prognose von Windböen.',
 dcapeSpeed:'Theoretische Geschwindigkeit bei idealer Umwandlung der DCAPE-Energie in einen Abwind. Reale Böen hängen zusätzlich von Verdunstung, Niederschlag und Windfeld ab.',
 s01:'Änderung des Windvektors (Geschwindigkeit und Richtung) vom Boden bis 1 km Höhe. Starke bodennahe Scherung kann die Rotation in Gewittern begünstigen.',
 s03:'Änderung des Windvektors zwischen Boden und 3 km Höhe. Sie hilft, die Organisation und Rotation von Gewittern einzuschätzen.',
 s06:'Änderung des Windvektors zwischen Boden und 6 km Höhe. Starke Scherung kann langlebige, organisierte Gewitter und Superzellen begünstigen.',
 s850500:'Vektordifferenz des Windes auf 850 und 500 hPa. Sie zeigt die Scherung zwischen zwei Druckflächen; diese liegen nicht überall auf derselben Höhe über Grund.',
 srh01:'Storm-relative Helicity von 0 bis 1 km gibt an, wie viel zur Zugrichtung eines angenommenen Gewitters passende Rotation die einströmende Luft mitbringt. Sie ist abhängig von der angenommenen Gewitterbewegung.',
 srh03:'Storm-relative Helicity von 0 bis 3 km beschreibt das Rotationspotenzial der gewitterrelativen Einströmung. Zusammen mit Instabilität und Scherung hilft sie bei der Einschätzung organisierter Gewitter.',
 stormrel:'Wind relativ zur angenommenen Bewegung einer Gewitterzelle. Er beschreibt, wie die Luft aus Sicht der Zelle ein- oder ausströmt.',
 jet:'Windgeschwindigkeit auf 300 hPa, meist in der oberen Troposphäre. Dort verlaufen häufig Jetstreams; sie beeinflussen die Entwicklung und Verlagerung von Wettersystemen.',
 thetae:'Äquivalentpotenzielle Temperatur: Sie verbindet Temperatur, Luftfeuchte und Druck zu einem Maß für den Energiegehalt einer Luftmasse. Hohe Werte kennzeichnen oft warme, feuchte Luft.',
 lcl:'Lifting Condensation Level: Höhe über Grund, in der ein gehobenes Luftpaket gesättigt wird. Sie ist eine Näherung für die Wolkenuntergrenze bei Konvektion.',
 lclApprox:'Grobe Schätzung der Kondensationshöhe aus dem Unterschied zwischen Lufttemperatur und Taupunkt. Ein kleiner Unterschied ergibt typischerweise eine niedrige Wolkenbasis.',
 lfc:'Level of Free Convection: Höhe, ab der das gehobene Luftpaket positiven Auftrieb erhält und selbstständig weiter aufsteigen kann.',
 el:'Equilibrium Level: Gleichgewichtsniveau, an dem das aufsteigende Luftpaket wieder so dicht wie seine Umgebung wird. Es gibt Orientierung zur möglichen Obergrenze des Aufwinds.',
 lapse:'Temperaturabnahme pro Kilometer zwischen 850 und 500 hPa. Eine starke Abnahme begünstigt bei geeigneter Feuchte eine labile Schichtung.',
 lapse7:'Temperaturabnahme pro Kilometer zwischen 700 und 500 hPa. Steile Werte können kräftige Aufwinde in der mittleren Troposphäre begünstigen.',
 freezing:'Höhe, auf der die Lufttemperatur etwa 0 °C erreicht. Sie ist nicht identisch mit der Schneefallgrenze, weil Schmelzen und Verdunstung eine Rolle spielen.',
 snowline:'Geschätzte Höhe, bis zu der Niederschlag als Schnee fallen kann. Sie hängt unter anderem von Temperatur, Feuchte und Niederschlagsintensität ab.',
 pwat:'Gesamter Wasserdampf in der Luftsäule, ausgedrückt als mögliche Wassermenge in Millimetern. Hohe Werte können Starkregen begünstigen, sind aber keine vorhergesagte Regenmenge.',
 conv:'Vom Modell als konvektiv berechneter Niederschlag über die letzten 24 Stunden bis zur Kartenzeit, beispielsweise aus Schauern oder Gewittern.',
 strat:'Vom Modell als nicht-konvektiv berechneter Niederschlag über die letzten 24 Stunden bis zur Kartenzeit, häufig großflächiger Regen. Die Aufteilung ist modellabhängig.',
 ehi03:'Energy Helicity Index kombiniert MLCAPE mit der storm-relativen Helizität von 0 bis 3 km. Höhere positive Werte können rotierende Gewitter begünstigen, sind jedoch kein Tornadonachweis.',
 scp:'Supercell Composite Parameter (SCP), effektive Variante: MUCAPE, effektive storm-relative Helizität und effektive Scherung. Aus der vertikalen Modellschichtung näherungsweise berechnet; kein Gewitternachweis.',
 stp:'Significant Tornado Parameter (STP), effektive Variante mit MLCAPE, MLCIN, MLLCL und effektiver Helizität/Scherung. Ein Index für ein tornadogünstiges Umfeld, keine Tornadowahrscheinlichkeit. Modellprofil-Näherung.',
 ship:'Significant Hail Parameter (SHIP) nach NOAA NSHARP: MUCAPE, Mischungsverhältnis des MU-Pakets, Temperatur auf 500 hPa, Lapse Rate 700–500 hPa und Scherung 0–6 km. Index für großhagelfreundliche Bedingungen, keine Hagelgröße in cm.',
 hail:'Maximaler modellierter Hagelkorndurchmesser am Boden aus DWD ICON-D2-RUC (DEMAX_HAIL_S), in cm. Nächste native Dreieckszelle auf 0,02° Darstellungsraster. Modellwert zur angegebenen Zeit, keine Messung und keine Garantie.',
 downburst:'Wet Microburst Severity Index (WMSI) nach Pryor/Ellrod: SBCAPE mal die positive Theta-e-Differenz zwischen Oberfläche und mittlerer Troposphäre (500–700 hPa) geteilt durch 1000. Zeigt Potenzial feuchter Abwinde; kein Windtempo, keine Wahrscheinlichkeit und kein Nachweis eines Microbursts. DCAPE ergänzt die Analyse.',
 TTAE:'Spezialindex zur thermodynamischen Analyse. Solange keine eindeutige, validierte Berechnung angebunden ist, wird kein Wert ausgegeben.',
 rainrate:'Mittlere Niederschlagsintensität im letzten tatsächlich vom Modell gelieferten Zeitintervall. Ein Millimeter Wasser entspricht einem Liter pro Quadratmeter.',
 rainTotal:'Gesamter Niederschlag seit Initialisierung des Modelllaufs; keine rollierende 24-Stunden-Summe.',
 temp2:'Modellierte Lufttemperatur in 2 m Höhe über dem Boden. Es handelt sich um eine Vorhersage im Modellraster, nicht um eine Stationsmessung.',
 dew:'Taupunkt: Temperatur, auf die Luft abkühlen müsste, um gesättigt zu sein. Je näher er an der Lufttemperatur liegt, desto höher ist die relative Feuchte.',
 rh:'Anteil der vorhandenen Feuchte an der bei dieser Temperatur maximal möglichen Feuchte. 100 % entspricht Sättigung.',
 snownew:'Modellierte Neuschneemenge im angegebenen Zeitraum; nicht die gesamte vorhandene Schneedecke.',
 snowdepth:'Modellierte Höhe der vorhandenen Schneedecke am Gültigkeitszeitpunkt.',
 snowWater:'Schneewasseräquivalent (SWE): Wassermenge, die beim vollständigen Schmelzen der aktuellen Schneedecke pro Quadratmeter entstehen würde.',
 snowDensity:'Masse der Schneedecke pro Volumeneinheit. Alter, Verdichtung und Feuchtigkeit des Schnees beeinflussen die Dichte.',
 snowWaterTotal:'Seit Beginn des Modelllaufs gefallener Schnee, ausgedrückt als Wasseräquivalent. Nicht mit der aktuellen Schneehöhe oder dem Wassergehalt der Schneedecke verwechseln.',
 slp:'Auf Meereshöhe reduzierter Luftdruck. Damit lassen sich Hoch- und Tiefdruckgebiete unabhängig von der Geländehöhe vergleichen.',
 reflectivity:'Vom Modell simulierte Radarreflektivität in dBZ. Hohe Werte kennzeichnen starke Rückstreuung durch Niederschlag; dies ist keine Radarmessung und keine direkte Hagelgrößenangabe.'
};
function parameterExplanation(id,label=''){
 if(parameterExplanations[id])return parameterExplanations[id];
 if(/^rain\d+$/.test(id))return 'Modellierte Niederschlagsmenge in den letzten '+id.slice(4)+' Stunden bis zur gewählten Gültigkeitszeit. 1 mm entspricht 1 Liter pro Quadratmeter.';
 const level=id.match(/^(t|rh|q|z|windp|winddirp|u|v)(\d+)$/);
 if(level){const [,kind,pressure]=level;return ({t:'Lufttemperatur',rh:'Relative Feuchte (Anteil der Sättigung)',q:'Spezifische Feuchte (Wasserdampfmasse pro Kilogramm feuchter Luft)',z:'Geopotenzielle Höhe der Druckfläche',windp:'Windgeschwindigkeit',winddirp:'Meteorologische Windrichtung, aus der der Wind kommt (0° = Nord, 90° = Ost)',u:'West-Ost-Komponente des Windes (positiv nach Osten)',v:'Süd-Nord-Komponente des Windes (positiv nach Norden)'})[kind]+' auf '+pressure+' hPa. Die Höhe dieser Druckfläche hängt von der Wetterlage ab.';}
 if(/cloud$/.test(id))return id==='cloud'?'Modellierter Gesamtbedeckungsgrad des Himmels in Prozent.':'Modellierter Bedeckungsgrad der '+({lowcloud:'tiefen',midcloud:'mittelhohen',highcloud:'hohen'})[id]+' Wolkenschicht in Prozent.';
 if(id==='wind'||id==='wind100')return 'Modellierte mittlere Windgeschwindigkeit in '+(id==='wind'?'10':'100')+' m Höhe über Grund.';
 if(id==='gust')return 'Modellierter Spitzenwert kurzzeitiger Windböen im angegebenen Modellintervall, nicht der Mittelwind.';
 if(id==='visibility')return 'Modellierte horizontale Sichtweite. Nebel, Niederschlag und andere Trübungen können sie reduzieren.';
 if(id==='radiation')return 'Modellierte mittlere einfallende Sonnenstrahlung im letzten verfügbaren Modellintervall.';
 if(id==='ground'||id==='tground')return 'Temperatur '+(id==='ground'?'in 5 cm Höhe über Grund':'an der Oberfläche')+'. Sie kann besonders nachts von der 2-m-Lufttemperatur abweichen.';
 if(id==='feels')return 'Empfundene Temperatur unter Berücksichtigung der meteorologischen Bedingungen wie Wind und Feuchte.';
 return null;
}
function showParameterHelp(id,label,unit=''){
 const description=parameterExplanation(id,label);if(!description)return;
 el('parameter-help-title').textContent=label;el('parameter-help-description').textContent=description;el('parameter-help-unit').textContent=unit?'Einheit: '+unit:'';
 const dialog=el('parameter-help-dialog');if(!dialog.open)dialog.showModal();
}
el('parameter-help-close').addEventListener('click',()=>el('parameter-help-dialog').close());
el('parameter-help-dialog').addEventListener('click',e=>{if(e.target===el('parameter-help-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close()}});
el('map-parameter-help').addEventListener('click',()=>{const p=fields[mapLayer];showParameterHelp(p.id,p.label,p.unit)});
el('expert-data').addEventListener('click',e=>{const button=e.target.closest('[data-expert-help]');if(!button)return;const name=button.dataset.expertHelp,item=expertGroups.flatMap(g=>g[2]).find(i=>i[0]===name);if(item)showParameterHelp(expertMapLinks[name]||name,name,item[2])});
function expertValue(item){
 const id=expertMapLinks[item[0]],html=parameterValue(item),value=id&&item[4]!==false?html.replace('<div class="parameter-value">','<button type="button" class="parameter-value" data-map-layer="'+id+'">').replace(/<\/div>$/,'<span class="param-map-label">'+ui('map',12)+' Karte öffnen</span></button>'):html;
 return parameterExplanation(id||item[0],item[0])?'<div class="parameter-card">'+value+'<button type="button" class="parameter-help" data-expert-help="'+item[0]+'" aria-label="'+item[0]+' erklären">ⓘ</button></div>':value;
}
function expertParameterGroup([title,icon,items],i){return '<details class="parameter-group" '+(i===0?'open':'')+'><summary><span class="group-icon">'+ui(icon,17)+'</span><span class="group-title">'+title+'</span><span class="group-count">'+items.length+' Werte</span>'+ui('chevron',16,'chev')+'</summary><div class="parameter-grid">'+items.map(expertValue).join('')+'</div></details>'}


el('model-list').innerHTML=[['ICON-D2','DWD · Kurzfrist · Deutschland'],['ICON-D2-RUC','DWD · Hageldurchmesser · Kurzfrist'],['ICON-EU','DWD · Mitteleuropa'],['IFS','ECMWF · Physikalisches Modell'],['GFS','NOAA · Global'],['AIFS','ECMWF · KI-Prognose · 15 Tage'],['AIFS-ENS Control','ECMWF · KI-Ensemble · Kontrolllauf']].map(m=>'<button class="model" data-expert-model="'+m[0]+'" style="width:100%;text-align:left"><div><h3>'+m[0]+'</h3><p>'+m[1]+'</p><p data-expert-availability="'+m[0]+'">Noch nicht geprüft</p></div><span class="badge">Karte ›</span></button>').join('');
const expertGroups=[
 ['Instabilität & Konvektion','weather',[
  ['SBCAPE',250,'J/kg','Oberflächenluftpaket'],['MLCAPE',180,'J/kg','Gemittelte Grenzschicht'],['MUCAPE',320,'J/kg','Most unstable'],['SBCIN','−15','J/kg'],['MLCIN','−30','J/kg'],['Lifted Index','−1,4','K'],['Total Totals (TT)',44,'K'],['K-Index',22,'°C'],['DCAPE',180,'J/kg','Abwindpotenzial']
 ]],
 ['Windprofil & Scherung','wind',[
  ['Scherung 0–1 km',6,'m/s'],['Scherung 0–3 km',12,'m/s'],['Scherung 0–6 km',18,'m/s'],['SRH 0–1 km',45,'m²/s²'],['SRH 0–3 km',110,'m²/s²'],['Storm-relative Wind',12,'m/s'],['Wind 850 hPa',12,'m/s'],['Wind 500 hPa',25,'m/s'],['Jet (300 hPa)',42,'m/s']
 ]],
 ['Vertikalprofil & Thermodynamik','sun',[
  ['T 850 hPa','−2','°C'],['T 700 hPa','−10','°C'],['T 500 hPa','−27','°C'],['Theta-e 850 hPa',302,'K'],['LCL',650,'m AGL'],['LFC',950,'m AGL'],['EL',6100,'m AGL'],['Nullgradgrenze',1000,'m'],['Lapse Rate 850–500 hPa','6,0','K/km'],['Lapse Rate 700–500 hPa','6,4','K/km'],['TTAE','—','','Berechnung noch nicht angebunden'],['Geopotential 500 hPa',543,'dam']
 ]],
 ['Feuchteprofil & Niederschlag','drop',[
  ['PWAT','15,2','mm','Niederschlagbares Wasser'],['Rel. Feuchte 850 hPa',78,'%'],['Rel. Feuchte 700 hPa',64,'%'],['Rel. Feuchte 500 hPa',46,'%'],['Spezifische Feuchte 850 hPa','3,8','g/kg'],['QPF 24 h','2,3','mm'],['Konvektive QPF','0,8','mm/24 h'],['Stratiforme QPF','1,5','mm/24 h']
 ]],
 ['Gefahrenindizes & eigene Ableitungen','alert',[
  ['Supercell Composite (SCP)','—','','Effektives Modellprofil erforderlich'],['Significant Tornado (STP)','—','','Effektives Modellprofil erforderlich'],['Energy Helicity Index (EHI 0–3 km)','—','','SRH und MLCAPE erforderlich'],['Significant Hail (SHIP)','—','','MU-Luftpaket und Scherung erforderlich'],['Potenzielle Hagelgröße','—','cm','DWD ICON-D2-RUC · Durchmesserprodukt erforderlich'],['Downburst / Microburst','—','','WMSI · feuchte Abwind-Umgebung'],['Ideale Abwindgeschwindigkeit','—','km/h','Nur bei vorhandenem DCAPE']
 ]]
];
expertGroups[0][2].push(['MUCIN','—','J/kg']);
expertGroups[1][2].push(['Scherung 850–500 hPa','—','m/s']);
expertGroups[2][2].push(['LCL (Näherung)','—','m AGL']);
for(const lev of [925,850,700,500,300,250,200]){
 for(const [name,id,unit,group] of [['Wind '+lev+' hPa','windp'+lev,'m/s',1],['Windrichtung '+lev+' hPa','winddirp'+lev,'°',1],['T '+lev+' hPa','t'+lev,'°C',2],['Geopotential '+lev+' hPa','z'+lev,'dam',2],['Rel. Feuchte '+lev+' hPa','rh'+lev,'%',3],['Spezifische Feuchte '+lev+' hPa','q'+lev,'g/kg',3]]){
  expertMapLinks[name]=id;if(!expertGroups[group][2].some(x=>x[0]===name))expertGroups[group][2].push([name,'—',unit]);
 }
}
const extraPressureLevels=[1000,975,950,900,800,600,400,150,100];
const extraPressureGroup=['Weitere Druckflächen (modellspezifisch)','chart',[]];
expertGroups.push(extraPressureGroup);
for(const lev of extraPressureLevels){
 for(const [label,id,unit] of [
  ['Wind '+lev+' hPa','windp'+lev,'m/s'],
  ['Windrichtung '+lev+' hPa','winddirp'+lev,'°'],
  ['T '+lev+' hPa','t'+lev,'°C'],
  ['Geopotential '+lev+' hPa','z'+lev,'dam'],
  ['Rel. Feuchte '+lev+' hPa','rh'+lev,'%'],
  ['Spezifische Feuchte '+lev+' hPa','q'+lev,'g/kg']
 ]){
  expertMapLinks[label]=id;
  extraPressureGroup[2].push([label,'—',unit,'Nur anzeigen, wenn das gewählte Modell diese Druckfläche liefert']);
 }
}
expertGroups[3][2].push(['Schneewasseräquivalent (SWE)','—','mm','Wasseräquivalent der Schneedecke'],['Schneedichte','—','kg/m³','Modellfeld']);
expertMapLinks['Schneewasseräquivalent (SWE)']='snowWater';
expertMapLinks['Schneedichte']='snowDensity';
el('expert-data').innerHTML=expertGroups.map(expertParameterGroup).join('');
document.querySelectorAll('[data-map-layer]').forEach(b=>b.addEventListener('click',()=>openMapLayer(b.dataset.mapLayer)));
document.querySelectorAll('[data-expert-model]').forEach(b=>b.addEventListener('click',()=>openMapLayer(b.dataset.expertModel==='ICON-D2-RUC'?'hail':null,b.dataset.expertModel)));
function openDialog(){el('search-input').value='';renderLocations();el('location-dialog').classList.add('open');el('search-input').focus()}
function closeDialog(){cancelPlaceLookup();el('location-dialog').classList.remove('open');el('search-open').focus()}
el('pin-icon').innerHTML=ui('pin',23);el('loc-chevron').innerHTML=ui('chevron',16);el('search-open').innerHTML=ui('search',22);el('close-dialog').innerHTML=ui('close',22);
el('location-open').addEventListener('click',openDialog);el('search-open').addEventListener('click',openDialog);el('close-dialog').addEventListener('click',closeDialog);el('search-input').addEventListener('input',renderLocations);el('place-online-search').addEventListener('click',searchOnlinePlaces);el('search-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchOnlinePlaces()}});el('location-dialog').addEventListener('click',e=>{if(e.target===el('location-dialog'))closeDialog()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&el('location-dialog').classList.contains('open'))closeDialog()});
weatherRealEnabled=true;initPreferences();initModelData();initWeatherData();initRealLive();
})();



