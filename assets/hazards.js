/* Straßenwetter / Hochwasser: mobile-first, live sources, on-demand requests. */
(() => {
'use strict';
const el = id => document.getElementById(id);
const BASE = 'https://pegelonline.wsv.de/webservices/rest-api/v2';
const DATA = 'https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/main/data/road-weather.json';
const MAX_ROAD_DISTANCE = 55;
const SAFE = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const moment = v => Number.isFinite(Date.parse(v))?new Date(v).toLocaleString('de-DE',{timeZone:'Europe/Berlin',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'unbekannt';
const point = () => {
  const l = window.WEATHER_APP_CONTEXT?.getLocation?.();
  return l && Number.isFinite(Number(l.lon)) && Number.isFinite(Number(l.lat))?l:null;
};
const locKey = () => {const p=point();return p?[Number(p.lon).toFixed(3),Number(p.lat).toFixed(3)].join(':'):'none';};
const distKm = (a,b,c,d) => {
  const r=Math.PI/180, x=(d-b)*r, y=(c-a)*r;
  const t=Math.sin(y/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(x/2)**2;
  return 12742*Math.asin(Math.min(1,Math.sqrt(t)));
};
let tab='road', roadSnapshot=null, roadAt=0, roadPromise=null, floodCache=null, floodAt=0, floodKey='', selectedId=null, opened=false;
const busy = (node,message) => {node.innerHTML='<p class="hazard-note" role="status">'+SAFE(message)+'</p>';};
const fetchJson=async (url,timeout=12000) => {
  const ctrl=new AbortController(), t=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const res=await fetch(url,{cache:'no-store',signal:ctrl.signal,credentials:'omit'});
    if(!res.ok)throw Error('HTTP '+res.status);
    return await res.json();
  } finally{clearTimeout(t)}
};
function selectedTab(name) {
  tab=name;
  document.querySelectorAll('[data-hazard-tab]').forEach(b=>{
    b.classList.toggle('active',b.dataset.hazardTab===name);
    b.setAttribute('aria-pressed',String(b.dataset.hazardTab===name));
  });
  el('hazard-road').hidden=name!=='road';
  el('hazard-water').hidden=name!=='water';
  refresh();
}
async function roadData(force=false){
  if(!force && roadSnapshot && Date.now()-roadAt<20*60000)return roadSnapshot;
  if(roadPromise)return roadPromise;
  roadPromise=(async()=>{
    let lastError;
    for(const url of [DATA,'data/road-weather.json']){
      try{
        const v=await fetchJson(url+(url===DATA?'?t='+Math.floor(Date.now()/1200000):''));
        if(v.schema!==1||!Array.isArray(v.times)||!Array.isArray(v.stations)||!Number.isFinite(Date.parse(v.generated))||Date.now()-Date.parse(v.generated)>8*3600000||v.stations.length<50)throw Error('Straßenwetterdaten fehlen oder sind veraltet');
        roadSnapshot=v;roadAt=Date.now();return v;
      }catch(err){lastError=err}
    }
    throw lastError||Error('Straßenwetter nicht verfügbar');
  })().finally(()=>{roadPromise=null});
  return roadPromise;
}
const roadStates={
  1:['Trocken','neutral'],2:['Feucht','neutral'],3:['Schneebedeckt','high'],
  4:['Reifglätte','high'],5:['Gefrierende Nässe','high'],6:['Glatteis','high']
};
const roadValue=v=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' °C';
const hourFmt=t=>new Date(t).toLocaleString('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit'});
function renderRoad(v){
  const host=el('hazard-road-content'),p=point();
  if(!p){busy(host,'Bitte einen Standort auswählen.');return}
  const candidates=v.stations.filter(row=>Array.isArray(row)&&Number.isFinite(Number(row[2]))&&Number.isFinite(Number(row[3])))
    .map(row=>({row,km:distKm(Number(p.lat),Number(p.lon),Number(row[2]),Number(row[3]))}))
    .sort((a,b)=>a.km-b.km);
  const nearest=candidates[0];
  if(!nearest||nearest.km>MAX_ROAD_DISTANCE){busy(host,'Keine DWD-Straßenwetterstation im Umkreis von 55 km. Für diesen Ort wird kein erfundener Fahrbahnzustand angezeigt.');return}
  const rows=(nearest.row[4]||[]).filter(a=>Array.isArray(a)&&Number.isInteger(a[0])&&a[0]>=0&&a[0]<v.times.length&&Date.parse(v.times[a[0]])>=Date.now()-45*60000).slice(0,18);
  if(!rows.length){busy(host,'Die Straßenwettervorhersage enthält derzeit keine gültigen künftigen Stunden.');return}
  const first=rows[0],state=roadStates[first[2]]||['Unbekannt','neutral'];
  const description=state[1]==='high'?'Amtliche Modellprognose für die nahe Straßenwetterstation; eine lokale Straßensperrung wird daraus nicht abgeleitet.':'Prognostizierter Zustand an einer DWD-Straßenwetterstation, nicht an jeder Straße des Ortes.';
  host.innerHTML=
   '<div class="hazard-summary"><span class="hazard-pill '+state[1]+'">'+SAFE(state[0])+'</span><h3>'+SAFE(nearest.row[1]||nearest.row[0])+'</h3>'+
   '<p>Nächstgelegene DWD-Straßenwetterstation · '+nearest.km.toFixed(1).replace('.',',')+' km Luftlinie</p>'+
   '<div class="hazard-numbers"><div><small>Fahrbahntemperatur</small><b>'+roadValue(first[1])+'</b></div><div><small>Lufttemperatur</small><b>'+roadValue(first[3])+'</b></div></div><p>'+SAFE(description)+'</p></div>'+
   '<h3 class="hazard-subtitle">Nächste Stunden</h3><div class="hazard-hours">'+rows.map(a=>{
      const s=roadStates[a[2]]||['Keine Angabe','neutral'];
      return '<div class="hazard-hour"><span>'+hourFmt(v.times[a[0]])+'</span><strong>'+roadValue(a[1])+'</strong><span class="'+(s[1]==='high'?'hazard-danger':'')+'">'+SAFE(s[0])+'</span></div>';
   }).join('')+'</div>'+
   '<p class="hazard-note">Quelle: <a href="https://opendata.dwd.de/weather/local_forecasts/swsmos/" target="_blank" rel="noopener">DWD SWSMOS</a> · Lauf '+moment(v.run)+
   ' · Datenstand '+moment(v.generated)+'. Prognosen sind keine direkten Messungen und nicht auf jede Fahrbahn übertragbar.</p>';
}
async function openRoad(force=false){
  const host=el('hazard-road-content');busy(host,'DWD-Straßenwetter wird geladen …');
  try{renderRoad(await roadData(force))}
  catch{busy(host,'Straßenwetter aktuell nicht verfügbar. Es werden keine alten Werte als aktuell ausgegeben. <a href="https://opendata.dwd.de/weather/local_forecasts/swsmos/" target="_blank" rel="noopener">DWD-Datenquelle</a>')}
}
const stateText=s=>({
  'low':'Unter mittlerem Niedrigwasser','normal':'Innerhalb mittlerer Wasserstände',
  'high':'Über mittlerem Hochwasser (keine amtliche Hochwasserwarnung)',
  'commented':'Messwert gestört','out-dated':'Messwert veraltet','unknown':'Keine Vergleichswerte'
}[s]||'Keine amtliche Einstufung');
function mapStation(s){
 const w=(s.timeseries||[]).find(t=>t.shortname==='W'||t.shortname?.toUpperCase()==='W');
 const value=w?.currentMeasurement;
 return {...s,waterName:s.water?.longname||s.water?.shortname||'Gewässer',current:value,
   unit:w?.unit||'cm',state:value?.stateMnwMhw||'unknown'};
}
function waterRows(stations,lat,lon){
 return stations.map(mapStation).filter(s=>Number.isFinite(s.latitude)&&Number.isFinite(s.longitude))
  .map(s=>({...s,km:distKm(lat,lon,s.latitude,s.longitude)}))
  .sort((a,b)=>a.km-b.km).slice(0,12);
}
async function waterData(force=false){
 const p=point();if(!p)throw Error('Standort fehlt');
 const key=locKey();if(!force&&floodCache&&floodKey===key&&Date.now()-floodAt<8*60000)return floodCache;
 const query=new URLSearchParams({latitude:String(p.lat),longitude:String(p.lon),radius:'100',timeseries:'W',includeTimeseries:'true',includeCurrentMeasurement:'true'});
 const payload=await fetchJson(BASE+'/stations.json?'+query);
 if(!Array.isArray(payload))throw Error('Ungültige Pegelantwort');
 floodCache=waterRows(payload,p.lat,p.lon);floodKey=key;floodAt=Date.now();
 return floodCache;
}
function waterStatus(s){
 const t=Date.parse(s.current?.timestamp);
 if(!Number.isFinite(t)||Date.now()-t>3*3600000)return ['Messwert nicht aktuell','unknown'];
 if(!Number.isFinite(Number(s.current.value)))return ['Messwert fehlt','unknown'];
 return [stateText(s.state),s.state==='high'?'high':'neutral'];
}
function renderWater(stations){
 const node=el('hazard-water-content');
 const intro='<p class="hazard-note">PEGELONLINE zeigt Bundeswasserstraßen. Kleine Bäche und Landespegel sind teilweise nicht enthalten. Ein Pegelstand allein belegt <b>keine Überflutung</b>.</p>';
 if(!stations.length){node.innerHTML=intro+'<p class="hazard-note">Im Umkreis von 100 km sind hier keine Bundespegel erfasst. Lokale Hochwasserinformationen: <a href="https://www.hochwasser.rlp.de/" target="_blank" rel="noopener">Hochwasser RLP</a> oder <a href="https://www.hochwasserzentralen.de/" target="_blank" rel="noopener">Bundesweite Hochwasserzentralen</a>.</p>';return}
 node.innerHTML=intro+'<div class="hazard-stations">'+stations.map(s=>{
   const [label,risk]=waterStatus(s),value=Number(s.current?.value),fresh=Number.isFinite(Date.parse(s.current?.timestamp))&&Date.now()-Date.parse(s.current.timestamp)<3*3600000;
   const display=fresh&&Number.isFinite(value)?Number(value).toLocaleString('de-DE',{maximumFractionDigits:0})+' '+SAFE(s.unit):'—';
   return '<button type="button" data-station="'+SAFE(s.uuid)+'" class="hazard-station"><span><b>'+SAFE(s.shortname||s.longname)+'</b><small>'+SAFE(s.waterName)+' · '+s.km.toFixed(0)+' km</small><small>'+SAFE(label)+'</small></span><span class="hazard-station-right"><b>'+display+'</b><small>'+moment(s.current?.timestamp)+'</small></span></button>';
 }).join('')+'</div>'+
 '<div id="hazard-station-detail" class="hazard-detail" aria-live="polite">Pegel auswählen, um Wasserstandsverlauf und verfügbare Vorhersagen zu sehen.</div>'+
 '<p class="hazard-note">Quelle: <a href="https://pegelonline.wsv.de/" target="_blank" rel="noopener">WSV PEGELONLINE</a>. Ungeprüfte Rohdaten; bei Hochwasser amtliche Warnungen beachten. <a href="https://www.hochwasserzentralen.de/" target="_blank" rel="noopener">Amtliche Hochwasserwarnungen</a>.</p>';
 node.querySelectorAll('[data-station]').forEach(btn=>btn.addEventListener('click',()=>showStation(stations.find(s=>s.uuid===btn.dataset.station))));
}
async function showStation(s){
 if(!s)return;
 const target=el('hazard-station-detail');if(!target)return;
 const uuid=encodeURIComponent(s.uuid),url=BASE+'/stations/'+uuid;
 busy(target,'Wasserstandsverlauf und Vorhersagen werden geladen …');
 const [measure,forecast]=await Promise.allSettled([
   fetchJson(url+'/W/measurements.json?start=PT24H'),
   fetchJson(url+'/WV/measurements.json')
 ]);
 // A missing forecast is normal: many stations publish measurements only.
 const history=measure.status==='fulfilled'&&Array.isArray(measure.value)?measure.value.filter(x=>Number.isFinite(Number(x.value))):[];
 const future=forecast.status==='fulfilled'&&Array.isArray(forecast.value)?forecast.value.filter(x=>Number.isFinite(Number(x.value))&&Date.parse(x.timestamp)>Date.now()).slice(0,18):[];
 const current=history.at(-1),old=history[0];
 const delta=history.length>1?(Number(current.value)-Number(old.value)):null;
 target.innerHTML='<h3>'+SAFE(s.shortname||s.longname)+' · '+SAFE(s.waterName)+'</h3>'+
 '<p class="hazard-note">Pegelstand: '+(Number.isFinite(Number(s.current?.value))?Number(s.current.value).toLocaleString('de-DE')+' '+SAFE(s.unit):'keine aktuellen Daten')+
  ' · '+moment(s.current?.timestamp)+'</p>'+
 '<p class="hazard-note">Änderung innerhalb der letzten 24 Stunden: '+(delta==null?'—':(delta>0?'+':'')+delta.toLocaleString('de-DE',{maximumFractionDigits:1})+' '+SAFE(s.unit))+'</p>'+
 (future.length?'<h4>Amtliche Wasserstandsvorhersage (sofern verfügbar)</h4><div class="hazard-hours">'+future.slice(0,8).map(x=>'<div class="hazard-hour"><span>'+moment(x.timestamp)+'</span><b>'+Number(x.value).toLocaleString('de-DE')+' cm</b></div>').join('')+'</div>':'<p class="hazard-note">Für diesen Pegel steht derzeit keine Vorhersage über diese Schnittstelle zur Verfügung.</p>')+
 '<p class="hazard-note">Wasserstände sind auf den jeweiligen Pegelnullpunkt bezogen. Verschiedene Pegelstände sind nicht unmittelbar vergleichbar.</p>';
}
async function openWater(force=false){
 const node=el('hazard-water-content');busy(node,'Aktuelle amtliche Pegelstände werden geladen …');
 try{renderWater(await waterData(force))}
 catch{busy(node,'PEGELONLINE momentan nicht erreichbar. <a href="https://www.hochwasserzentralen.de/" target="_blank" rel="noopener">Amtliche Hochwasserlage öffnen</a>')}
}
function refresh(force=false){
 if(!opened || !el('page-hazards')?.classList.contains('active'))return;
 const p=point();
 el('hazard-selected-place').textContent=p?'Standort: '+(p.name||'gewählter Ort'):'Bitte zuerst einen Ort im Wetterbereich auswählen.';
 if(tab==='road')return openRoad(force);
 return openWater(force);
}
function init(){
 if(opened)return;
 opened=true;
 document.querySelectorAll('[data-hazard-tab]').forEach(b=>b.addEventListener('click',()=>selectedTab(b.dataset.hazardTab)));
 el('hazard-refresh')?.addEventListener('click',()=>refresh(true));
}
window.WeatherHazards={
 open(){init();refresh()},
 refresh
};
})();
