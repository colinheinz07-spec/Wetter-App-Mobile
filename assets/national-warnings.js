/* Deutschlandweite Warnlage. Official warnings and model signals are never interchangeable. */
(()=>{
'use strict';
const ROOT='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App/';
const MOBILE_ROOT='https://raw.githubusercontent.com/colinheinz07-spec/Wetter-App-Mobile/';
const TYPES={frost:'Luftfrost',wind:'Wind / Sturm',heat:'Hitze',fog:'Nebel',fogpotential:'Nebelpotenzial',snow:'Schneefall',freezing:'Gefrierender Niederschlag',ice:'Glättegefahr',rain:'Starkregen',durationrain:'Dauerregen',storm:'Gewitter',stormwind:'Gewitterböen-Potenzial',stormrain:'Konvektiver Starkregen',hail:'Hagelpotenzial (SHIP)',rotation:'Rotationspotenzial (STP)'};
const RADAR_ONLY={mixed:'Intensiver Mischniederschlag',precip:'Intensiver Niederschlag (Art unklar)'};
const OPTIONAL=['stormwind','stormrain','hail','rotation','durationrain','fogpotential'];
const METRICS={frost:['°C',0,'Lufttemperatur'],heat:['°C',0,'Lufttemperatur'],wind:['km/h',0,'Böen'],stormwind:['km/h',0,'Böen'],fog:['m',0,'Sichtweite'],snow:['cm',0,'Neuschnee (geschätzt)'],rain:['l/m²',0,'Niederschlagssumme'],freezing:['l/m²',0,'Niederschlagssumme'],durationrain:['l/m²',0,'Niederschlagssumme'],stormrain:['l/m²',0,'Niederschlagssumme']};
const ACCUMULATED=new Set(['snow','rain','freezing','durationrain','stormrain']);
const HINT={fogpotential:'Taupunkt nahe der Lufttemperatur, schwacher Wind; Nebel besonders in Mulden möglich. Keine bestätigte Sichtweite.',storm:'Konvektionssignal bzw. CAPE, CIN, Scherung und Niederschlag.',stormwind:'Konvektionssignal zusammen mit modellierten Böen; kein gemessener Gewitterwind.',stormrain:'Konvektionssignal und modellierte 3-h-Niederschlagsmenge.',hail:'SHIP ≥ 1 bei Konvektionssignal; keine Vorhersage der Hagelgröße.',rotation:'STP ≥ 1 bei Konvektionssignal; keine Tornadovorhersage.'};
const OFFICIAL=['#f3cf35','#f58b25','#de343b','#8d247f'],OWN=['#edc844','#f18b26','#e13c49','#912b8f'];
const ICON_NAMES={...TYPES,thaw:'Tauwetter',other:'Sonstige Warnung'};
const GLYPHS={
 snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9 5l3 3 3-3M9 19l3-3 3 3M4.4 11.1l4.1-1.1-1.1-4.1M16.6 18.1l-1.1-4.1 4.1-1.1M7.4 18.1l1.1-4.1-4.1-1.1M19.6 11.1l-4.1-1.1 1.1-4.1"/>',
 wind:'<path d="M4 3v18M2 21h6M4 5l15 3-3 7L4 12M8 6v7M12 7l-1 7M16 8l-1 6"/>',
 rain:'<path d="M12 3C10 7 6.5 10.7 6.5 15a5.5 5.5 0 0 0 11 0C17.5 10.7 14 7 12 3Z" fill="currentColor" stroke="none"/><path d="M9 15c0 2 1.3 3.1 2.5 3.3" stroke="#fff"/>',
 frost:'<path d="M7 5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0ZM9 10v7M16 4v10M12 6l8 6M12 12l8-6"/><circle cx="9" cy="18" r="1.7" fill="currentColor" stroke="none"/>',
 freezing:'<path d="M7 2C5 5 3 7 3 9a4 4 0 0 0 8 0C11 7 9 5 7 2Z" fill="currentColor" stroke="none"/><path d="M15 8l7 13H8l7-13Z" fill="#f8d349" stroke="#24364a"/><path d="M15 12v4m0 2.4v.1" stroke="#24364a"/>',
 ice:'<path d="M3 18c2-3 4 3 6 0s4 3 6 0 4 3 6 0M5 14l5-8 7 4M9 4l4 2M15 15l5-5"/>',
 fog:'<path d="M3 7h18M5 12h14M3 17h18" stroke-width="2.8"/>',
 heat:'<path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0ZM12 8v10M17 5h3M17 9h3"/><circle cx="12" cy="18" r="2" fill="currentColor" stroke="none"/>',
 storm:'<path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z" fill="currentColor" stroke="none"/>',
 stormwind:'<path d="M8 2 2 11h4l-1 6 6-9H7l1-6Z" fill="currentColor" stroke="none"/><path d="M12 5v16M12 7l10 2-3 6-7-3M15 8v5M18 9l-1 5"/>',
 stormrain:'<path d="M8 2 2 11h4l-1 6 6-9H7l1-6Z" fill="currentColor" stroke="none"/><path d="M17 8c-2 4-5 6-5 9a5 5 0 0 0 10 0c0-3-3-5-5-9Z" fill="#0079cb" stroke="none"/>',
 hail:'<circle cx="7" cy="8" r="3.1" fill="currentColor" stroke="none"/><circle cx="17" cy="8" r="3.1" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="3.1" fill="currentColor" stroke="none"/>',
 rotation:'<path d="M3 8c2-6 16-7 18 0 2 5-7 9-12 5-3-3 1-6 5-4 3 2-1 6-5 9l-2 3"/>',
 thaw:'<path d="M8 2v10M3 5l10 5M3 10l10-5M16 9c-2 4-5 6-5 9a5 5 0 0 0 10 0c0-3-3-5-5-9Z"/>',
 other:'<path d="M12 3 22 21H2L12 3ZM12 9v5m0 3v.2"/>'
};
const ICON_COLOR={snow:'#0077c8',rain:'#006fbc',frost:'#056bba',freezing:'#006fbc',ice:'#14569a',heat:'#cf3f19',storm:'#865500',stormwind:'#865500',stormrain:'#865500',hail:'#8b3396',rotation:'#8b3396',thaw:'#006fbc'};
function warningGlyph(kind){if(kind==='durationrain')kind='rain';if(kind==='fogpotential')kind='fog';return `<g color="${ICON_COLOR[kind]||'#263e55'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[kind]||GLYPHS.other}</g>`}
function warningIcon(kind){return `<svg class="nw-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${warningGlyph(kind)}</svg>`}
function officialKind(a){const e=String(a.event||a.headline||'').toLowerCase();if(/tauwetter/.test(e))return 'thaw';if(/glatteis|gefrier|eisregen/.test(e))return 'freezing';if(/schnee/.test(e))return 'snow';if(/glätte/.test(e))return 'ice';if(/frost/.test(e))return 'frost';if(/gewitter/.test(e))return 'storm';if(/hagel/.test(e))return 'hail';if(/wind|sturm|orkan/.test(e))return 'wind';if(/regen/.test(e))return 'rain';if(/nebel/.test(e))return 'fog';if(/hitze/.test(e))return 'heat';return 'other'}
const fmt=t=>new Date(t*1000).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'});
const now=()=>Math.floor(Date.now()/1000),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=(d,age,t=now())=>d?.schema===1&&Number.isFinite(d.generated)&&d.generated<=t+300&&t-d.generated<=age;
function alertStage(a,t=now()){
 if(a.end<=t||a.start>=t+96*3600)return null;
 if(a.start>=t+86400)return 'upcoming';
 if(a.possible)return 'risk';
 return 'active';
}
function modelStage(code){return code>=11&&code<=14||code>=31&&code<=34?'active':code>=1&&code<=4||code>=21&&code<=24?'risk':null}
function stageMatches(code,stage){return stage==='upcoming'?modelStage(code)!==null:modelStage(code)===stage}
function modelLevel(code){return code%10}
function frostLevel(t){return !Number.isFinite(t)||t>=0?0:t< -20?3:t<=-10?2:1}
// Older snapshots used -5/-10/-20 boundaries. Convert their stored codes
// conservatively at the individual cell, never promoting by area or range.
function legacyFrostCode(code,temp){
 if(!modelStage(code))return code;
 const old=modelLevel(code),level=old<=2?1:old===3?2:3;
 const cap=Number.isFinite(temp)?frostLevel(temp):Math.min(level,2);
 const safe=Math.min(level,cap);return safe?code-old+safe:0;
}
function pointInRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
 const [ax,ay]=ring[i],[bx,by]=ring[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
 }return inside}
function inPolygons(p,polygons){return polygons.some(poly=>pointInRing(...p,poly[0])&&!poly.slice(1).some(r=>pointInRing(...p,r)))}
const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
function stormFresh(d,t=now()){return fresh(d,1200,t)&&Number.isFinite(d.observed)&&d.observed<=t+60&&t-d.observed<=1200&&Array.isArray(d.cells)&&d.cells.every(c=>typeof c.id==='string'&&validPoint(c.point)&&Array.isArray(c.polygons)&&c.polygons.every(r=>r.length>=3&&r.every(validPoint))&&Array.isArray(c.path)&&c.path.every(p=>validPoint(p.point)&&Number.isFinite(p.time)&&p.time>d.observed&&p.time<=d.observed+3600&&Array.isArray(p.ellipse)))}
function stormKinds(c){const k=[];if(c.lightning>0)k.push('storm');if(c.rainFlag>0)k.push('stormrain','rain');if(c.hailFlag>0||c.hailArea>0)k.push('hail');if(c.gustFlag>0)k.push('stormwind','wind');return k}
function stormTitle(c){return c.lightning>0?'Gewitterzelle':'Konvektive Radar-Zelle'}
function stormLevel(c){return Math.max(0,...[c.hailFlag,c.rainFlag,c.gustFlag].filter(v=>Number.isFinite(v)&&v>=0&&v<=3))}
function kmVector(a,b){return [(b[0]-a[0])*111.195*Math.cos((a[1]+b[1])/2*Math.PI/180),(b[1]-a[1])*111.195]}
function direction(c){const f=c.path.find(p=>Math.hypot(...kmVector(c.point,p.point))>.15);if(!f)return null;const [x,y]=kmVector(c.point,f.point);return (Math.atan2(x,y)*180/Math.PI+360)%360}
function offsetKm(p,x,y){return [p[0]+x/(111.195*Math.max(.15,Math.cos(p[1]*Math.PI/180))),p[1]+y/111.195]}
function stormRadius(c){return Math.max(.75,Math.sqrt(Math.max(0,c.areaKm2||0)/Math.PI),...c.polygons.flatMap(r=>r.map(p=>Math.hypot(...kmVector(c.point,p)))))}
function stormFootprint(c){return c.polygons.length?c.polygons:[Number.isFinite(c.areaKm2)&&c.areaKm2>0?stormEllipse(c.point,stormRadius(c),[0,0,0]):[]].filter(r=>r.length)}
function stormEllipse(p,r,e){const a=r+Math.max(0,e[0]||0),b=r+Math.max(0,e[1]||0),angle=(e[2]||0)*Math.PI/180;return Array.from({length:24},(_,i)=>{const k=i*Math.PI/12,x=a*Math.cos(k),y=b*Math.sin(k);return offsetKm(p,x*Math.sin(angle)+y*Math.cos(angle),x*Math.cos(angle)-y*Math.sin(angle))})}
function hull(points){const p=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const half=arr=>{const h=[];for(const q of arr){while(h.length>1&&cross(h.at(-2),h.at(-1),q)<=0)h.pop();h.push(q)}return h.slice(0,-1)};return half(p).concat(half([...p].reverse()))}
function stormCorridor(c,t){const r=stormRadius(c),steps=[{point:c.point,time:0,ellipse:[0,0,0]},...c.path],out=[];for(let i=1;i<steps.length;i++){const a=steps[i-1],b=steps[i];if(b.time<=t)continue;const poly=hull([...stormEllipse(a.point,r,a.ellipse),...stormEllipse(b.point,r,b.ellipse)]);if(poly.length>=3)out.push({ring:poly,time:b.time})}return out}
function stormHit(c,p,t){if(stormFootprint(c).some(r=>pointInRing(...p,r)))return {current:true};const f=stormCorridor(c,t).find(x=>pointInRing(...p,x.ring));return f?{current:false,time:f.time}:null}
function normalizeOfficial(doc,t){if(doc?.type!=='FeatureCollection'||!Array.isArray(doc.features)||Number.isFinite(doc.numberMatched)&&doc.numberMatched>doc.features.length)throw Error('Incomplete DWD WFS');const alerts=[];for(const f of doc.features){const p=f.properties||{},g=f.geometry||{};if(p.STATUS!=='Actual'||!['Alert','Update'].includes(p.MSGTYPE)||p.SCOPE!=='Public')continue;const start=Date.parse(p.ONSET||p.EFFECTIVE)/1000,end=Date.parse(p.EXPIRES)/1000,sent=Date.parse(p.SENT)/1000;if(![start,end,sent].every(Number.isFinite)||end<=Math.max(t,start)||sent>t+300)continue;const polygons=g.type==='MultiPolygon'?g.coordinates:g.type==='Polygon'?[g.coordinates]:[];if(!Array.isArray(polygons)||!polygons.length||!polygons.every(poly=>poly.length&&poly.every(r=>r.length>=4&&r.every(c=>validPoint(c)&&c[0]>=4&&c[0]<=17&&c[1]>=46&&c[1]<=56))))continue;alerts.push({id:p.IDENTIFIER||f.id,start,end,sent,level:({Minor:1,Moderate:2,Severe:3,Extreme:4})[p.SEVERITY]||0,possible:['Possible','Unknown','Unlikely'].includes(p.CERTAINTY)||/VORAB/i.test(p.HEADLINE||''),certainty:p.CERTAINTY,event:p.EVENT,headline:p.HEADLINE,description:p.DESCRIPTION,instruction:p.INSTRUCTION,altitude:p.ALTITUDE,ceiling:p.CEILING,polygons})}return {schema:1,generated:t,source:'DWD WFS live',alerts}}
function pickPeriods(d,t,window){if(!d)return [];if(window==='now')return d.periods.filter(p=>p.start<=t&&p.end>t);const start=window==='6-12'?t+21600:window==='12-24'?t+43200:t,end=window==='0-6'?t+21600:window==='6-12'?t+43200:t+86400;return d.periods.filter(p=>p.end>start&&p.start<end)}
function radarKind(code){return code===2||code===3?'rain':code===4||code===5?'freezing':code===7?'snow':code===6?'mixed':code===9||code===10?'hail':'precip'}
function radarPhaseCode(phase,p,time){if(!phase||!p||!Number.isFinite(time)||Math.abs(phase.time-time)>300000)return null;const n=cellsForPoint(phase.grid,p);return n<0?null:phase.raw.charCodeAt(n)}
function eventsInWindow(events,periods){return events.filter(e=>periods.some(p=>p.end>e.start&&p.start<e.end))}
function cellsForPoint(g,p){const x=Math.round((p[0]-g.west)/g.step),y=Math.round((p[1]-g.south)/g.step);return x>=0&&y>=0&&x<g.nx&&y<g.ny?y*g.nx+x:-1}
// Warning contours span connected areas; numeric details must NEVER aggregate
// unrelated cells in that contour. Sample the clicked cell only.
function metricAt(period,kind,n){
 if((['snow','snowMin','snowMax','durationrain','stormhour','iceCause'].includes(kind))&&period.metricVersion!==2)return NaN;
 const m=period.metricValues?.[kind];if(!m||n<0||n*2+1>=m.length)return NaN;
 const v=(m.charCodeAt(n*2)|(m.charCodeAt(n*2+1)<<8))<<16>>16;return v===-32768?NaN:v/10;
}
function areaStats(period,g,kind,n,stage){
 const v=metricAt(period,kind,n),known=Number.isFinite(v);
 const signal=k=>modelStage(period.decoded[k]?.[n])!==null;
 const gust=signal('stormwind')?metricAt(period,'stormwind',n):NaN;
 const hour=signal('stormrain')?metricAt(period,'stormhour',n):NaN;
 const rain3=signal('stormrain')?metricAt(period,'stormrain',n):NaN;
 const snowMin=kind==='snow'?metricAt(period,'snowMin',n):NaN,snowMax=kind==='snow'?metricAt(period,'snowMax',n):NaN;
 const snowKnown=Number.isFinite(snowMin)&&Number.isFinite(snowMax)&&snowMin>=0&&snowMax>=snowMin;
 return {lo:known?v:Infinity,hi:known?v:-Infinity,sum:known?v:0,known:+known,count:1,
  snowLo:snowKnown?snowMin:0,snowHi:snowKnown?snowMax:0,snowKnown:+snowKnown,
  iceCause:metricAt(period,'iceCause',n)||0,gust:Number.isFinite(gust)?gust:-Infinity,
  hour:Number.isFinite(hour)?hour:-Infinity,rain3:Number.isFinite(rain3)?rain3:-Infinity,
  hail:signal('hail'),windRisk:signal('stormwind'),rainRisk:signal('stormrain')};
}
function eventSummary(kind,stats,stage){
 const subject=kind==='frost'?'Luftfrost':TYPES[kind];let lead=stage==='active'?'Am ausgewählten Ort wird '+subject+' erwartet.':'Am ausgewählten Ort besteht die Möglichkeit für '+subject+'.';
 if(kind==='freezing')lead='Glättegefahr durch gefrierenden Regen oder Sprühregen am ausgewählten Ort.';
 if(kind==='ice'){
  const causes=[[1,'überfrierende Nässe'],[2,'Schneeglätte'],[4,'gefrierender Regen'],[8,'Reifglätte']].filter(([b])=>stats.iceCause&b).map(([,s])=>s);
  return 'Glättegefahr am ausgewählten Ort.'+(causes.length?' Mögliche Ursache: '+causes.join(', ')+'.':' Ursache nicht aus den verfügbaren Modelldaten ableitbar.');
 }
 if(kind==='storm'){
  const hints=[];if(stats.windRisk)hints.push('Gefahr von Sturmböen'+(Number.isFinite(stats.gust)?' bis '+Math.round(stats.gust)+' km/h':''));
  if(stats.hail)hints.push('Hagel möglich');
  if(stats.rainRisk)hints.push('Starkregen'+(Number.isFinite(stats.hour)?' bis '+stats.hour.toLocaleString('de-DE')+' l/m² in einer Stunde (Modellmaximum)':Number.isFinite(stats.rain3)?' bis '+stats.rain3.toLocaleString('de-DE')+' l/m² in 3 Stunden':''));
  return lead+(hints.length?' Begleitgefahren: '+hints.join(' · ')+'.':'');
 }
 if(kind==='snow'){
  if(stats.snowKnown===stats.count&&stats.snowHi>0){
   const lower=stats.snowLo>0&&stats.snowLo<1?'unter 1':Math.floor(stats.snowLo).toLocaleString('de-DE');
   const upper=Math.max(1,Math.ceil(stats.snowHi)).toLocaleString('de-DE');
   return lead+' Möglicher Neuschnee: '+(lower===upper?upper+' cm':lower+' bis '+upper+' cm')+' im angegebenen Zeitraum (Spanne verfügbarer Modellwerte, keine kalibrierte Unsicherheit).';
  }
  if(!stats.snowKnown||stats.snowKnown<stats.count)return lead+' Schneefallsignal vorhanden, aber die Neuschneemenge ist nicht ausreichend berechenbar.';
  return lead+' Schneefall signalisiert, aber kein messbarer Neuschneezuwachs berechnet; keine belastbare Zentimeterangabe.';
 }
 if(!METRICS[kind])return lead;
 if(!Number.isFinite(stats.lo))return lead+' '+METRICS[kind][2]+': keine verfügbaren Modellwerte.';
 const [unit,digits,label]=METRICS[kind],factor=kind==='fog'?1000:1,num=v=>(v*factor).toLocaleString('de-DE',{maximumFractionDigits:digits});
 if(ACCUMULATED.has(kind))return lead+' '+label+': '+(stats.known===stats.count?num(stats.sum)+' '+unit+' im angegebenen Zeitraum.':'keine vollständige Modellabdeckung für die Gesamtsumme.');
 if(kind==='wind'||kind==='stormwind')return lead+' Böen bis '+num(stats.hi)+' '+unit+'.';
 return lead+' '+label+': '+(num(stats.lo)===num(stats.hi)?num(stats.lo):num(stats.lo)+' bis '+num(stats.hi))+' '+unit+'.';
}
function groupWarnings(periods,g,kind,n,stage){
 const events=[];for(const p of periods){const c=p.decoded[kind]?.[n];if(!stageMatches(c,stage))continue;const stats=areaStats(p,g,kind,n,stage),last=events.at(-1);
 if(last&&last.end===p.start){last.end=p.end;last.code=modelLevel(c)>modelLevel(last.code)?c:last.code;const s=last.stats;last.stats={lo:Math.min(s.lo,stats.lo),hi:Math.max(s.hi,stats.hi),sum:s.sum+stats.sum,known:s.known+stats.known,count:s.count+stats.count,snowLo:s.snowLo+stats.snowLo,snowHi:s.snowHi+stats.snowHi,snowKnown:s.snowKnown+stats.snowKnown,iceCause:s.iceCause|stats.iceCause,gust:Math.max(s.gust,stats.gust),hour:Math.max(s.hour,stats.hour),rain3:Math.max(s.rain3,stats.rain3),hail:s.hail||stats.hail,windRisk:s.windRisk||stats.windRisk,rainRisk:s.rainRisk||stats.rainRisk}}
 else events.push({kind,code:c,start:p.start,end:p.end,stats})}
 return events.map(e=>({...e,summary:eventSummary(kind,e.stats,stage)}));
}
// Standalone geometry and projection: no reliance on app.js initialization,
// CSS canvas sizing, a canvas context, network tiles or ResizeObserver.
const MAP_W=600,MAP_H=780,MAP_WEST=5.25,MAP_NORTH=55.2;
const MAP_SCALE=Math.min((MAP_W-12)/10.2/Math.cos(51*Math.PI/180),(MAP_H-12)/8.3),MAP_DX=MAP_SCALE*Math.cos(51*Math.PI/180),MAP_DY=MAP_SCALE;
const MAP_X=(MAP_W-10.2*MAP_DX)/2,MAP_Y=(MAP_H-8.3*MAP_DY)/2;
const project=(lon,lat)=>[MAP_X+(lon-MAP_WEST)*MAP_DX,MAP_Y+(MAP_NORTH-lat)*MAP_DY];
function unproject(x,y,width,height){const scale=Math.min(width/MAP_W,height/MAP_H);return [(x-(width-MAP_W*scale)/2)/scale/MAP_DX-MAP_X/MAP_DX+MAP_WEST,MAP_NORTH-((y-(height-MAP_H*scale)/2)/scale-MAP_Y)/MAP_DY]}
const MAX_ZOOM=8;
const clampRange=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function mapView(zoom=1,cx=MAP_W/2,cy=MAP_H/2){zoom=clampRange(zoom,1,MAX_ZOOM);const w=MAP_W/zoom,h=MAP_H/zoom;cx=clampRange(cx,w/2,MAP_W-w/2);cy=clampRange(cy,h/2,MAP_H-h/2);return {zoom,cx,cy,x:cx-w/2,y:cy-h/2,w,h}}
function screenMap(view,x,y,width,height){const scale=Math.min(width/view.w,height/view.h);return [view.cx+(x-width/2)/scale,view.cy+(y-height/2)/scale]}
function mapPoint(view,x,y,width,height){const [mx,my]=screenMap(view,x,y,width,height);return [MAP_WEST+(mx-MAP_X)/MAP_DX,MAP_NORTH-(my-MAP_Y)/MAP_DY]}
function zoomMap(view,zoom,from,to,width,height){const held=screenMap(view,from[0],from[1],width,height);zoom=clampRange(zoom,1,MAX_ZOOM);const scale=Math.min(width/MAP_W,height/MAP_H)*zoom;return mapView(zoom,held[0]-(to[0]-width/2)/scale,held[1]-(to[1]-height/2)/scale)}
function panMap(view,dx,dy,width,height){const scale=Math.min(width/view.w,height/view.h);return mapView(view.zoom,view.cx-dx/scale,view.cy-dy/scale)}
function decodeMapRing(encoded){let i=0,x=0,y=0;const points=[];const read=()=>{let n=0,s=0,c;do{c=encoded.charCodeAt(i++)-63;n+=(c&31)*2**s;s+=5}while(c>=32&&i<encoded.length);return n%2?-(n+1)/2:n/2};while(i<encoded.length){x+=read();y+=read();points.push([x/1e4,y/1e4])}return points}
function mapRings(record){return (record?.[3]||[]).map(decodeMapRing).filter(r=>r.length>=3)}
const rounded=v=>Number(v.toFixed(1));
function ringPath(ring){return ring.length?'M'+ring.map(p=>project(...p).map(rounded).join(',')).join('L')+'Z':''}
function districtRingPath(ring){
 if(ring.length<5)return ringPath(ring);
 // Simplify the DISPLAY line only; geographic hit testing retains full
 // district coordinates. Subpixel error in the overview, even at zoom.
 const p=ring.map(q=>project(...q)),keep=new Uint8Array(p.length),stack=[[0,p.length-1]],tol=.18**2;keep[0]=keep[p.length-1]=1;
 while(stack.length){const [a,b]=stack.pop(),[x,y]=p[a],dx=p[b][0]-x,dy=p[b][1]-y,len=dx*dx+dy*dy;let best=tol,j=-1;for(let i=a+1;i<b;i++){const u=len?clampRange(((p[i][0]-x)*dx+(p[i][1]-y)*dy)/len,0,1):0,d=(p[i][0]-x-u*dx)**2+(p[i][1]-y-u*dy)**2;if(d>best){best=d;j=i}}if(j>=0){keep[j]=1;stack.push([a,j],[j,b])}}
 const q=p.filter((_,i)=>keep[i]);return q.length>=3?'M'+q.map(v=>v.map(rounded).join(',')).join('L')+'Z':ringPath(ring);
}
const CITIES=[['Hamburg',10,53.55],['Berlin',13.4,52.52],['Köln',6.96,50.94],['Frankfurt',8.68,50.11],['München',11.58,48.14],['Stuttgart',9.18,48.78],['Dresden',13.74,51.05]];
function mapGeometry(base,extra){const rings=mapRings(extra?.germany);if(!rings.length)return null;const districts=(base?.districts||[]).map(d=>({id:d[0],name:d[1],type:d[2],rings:mapRings(d)})).map(d=>({...d,boxes:d.rings.map(r=>polygonBounds([r])),path:d.rings.map(districtRingPath).join('')}));const neighbors=(extra?.countries||[]).filter(c=>['DNK','POL','CZE','AUT','CHE','FRA','LUX','BEL','NLD'].includes(c.id)).flatMap(c=>c.geometry.type==='MultiPolygon'?c.geometry.coordinates:c.geometry.type==='Polygon'?[c.geometry.coordinates]:[]).flatMap(p=>p).filter(r=>{const b=polygonBounds([r]);return b[0]<17&&b[2]>4&&b[1]<56&&b[3]>46}).map(ringPath).join('');return {rings,boxes:rings.map(r=>polygonBounds([r])),outline:rings.map(ringPath).join(''),states:(base?.states||[]).flatMap(mapRings).map(ringPath).join(''),districts,districtPaths:districts.map(d=>d.path).join(''),neighbors}}
function districtAt(geo,p){return geo?.districts.find(d=>d.rings.some((r,i)=>{const b=d.boxes[i];return p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3]&&pointInRing(...p,r)}))}
function cityMarkup(places=[],view=mapView()){const threshold=view.zoom>=6?3000:view.zoom>=3?18000:view.zoom>=1.6?70000:Infinity,chosen=[],names=new Set();const pool=[...CITIES,...places.filter(c=>c[3]>=threshold)];for(const [name,lon,lat] of pool){const [x,y]=project(lon,lat).map(rounded);if(names.has(name)||x<view.x||x>view.x+view.w||y<view.y||y>view.y+view.h||chosen.some(c=>Math.abs(c.x-x)*view.zoom<90&&Math.abs(c.y-y)*view.zoom<27))continue;chosen.push({name,x,y});names.add(name);if(chosen.length>=35)break}return chosen.map(({name,x,y})=>`<g transform="translate(${x} ${y})"><g class="nw-zoom-stable"><circle cx="0" cy="0" r="2.7" stroke="none"/><text x="6" y="-3">${esc(name)}</text><text x="6" y="-3" stroke="none">${esc(name)}</text></g></g>`).join('')}
function matchOfficial(a,key){return key==='all'||officialKind(a)===key}
function polygonBounds(poly){return poly[0].reduce((b,[x,y])=>[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x),Math.max(b[3],y)],[Infinity,Infinity,-Infinity,-Infinity])}
function polygonAnchor(poly,b=polygonBounds(poly)){let best=null,span=0;for(const f of [.5,.25,.75,.125,.875]){const lat=b[1]+(b[3]-b[1])*f,xx=[];for(let i=0,j=poly[0].length-1;i<poly[0].length;j=i++){const a=poly[0][i],z=poly[0][j];if((a[1]>lat)!==(z[1]>lat))xx.push(a[0]+(lat-a[1])*(z[0]-a[0])/(z[1]-a[1]))}xx.sort((a,b)=>a-b);for(let i=0;i+1<xx.length;i+=2){const p=[(xx[i]+xx[i+1])/2,lat],w=xx[i+1]-xx[i];if(w>span&&inPolygons(p,[poly])){best=p;span=w}}}return best}
function markerCandidates(){const byKind=new Map();return {add(kind,level,p){const [x,y]=project(...p);if(x<12||y<12||x>MAP_W-12||y>MAP_H-12)return;let slots=byKind.get(kind);if(!slots)byKind.set(kind,slots=new Map());const sx=Math.floor(x/84),sy=Math.floor(y/84),key=sx+','+sy,dist=Math.hypot(x-(sx+.5)*84,y-(sy+.5)*84),old=slots.get(key);if(!old||level>old.level||level===old.level&&dist<old.dist)slots.set(key,{kind,level,x,y,p,dist})},byKind}}
function collectOfficialMarkers(collector,a){const kind=officialKind(a);for(const poly of a.polygons){if(!poly[0]?.length)continue;const b=polygonBounds(poly),anchor=polygonAnchor(poly,b);if(anchor)collector.add(kind,a.level,anchor);const [x1,y1]=project(b[0],b[3]),[x2,y2]=project(b[2],b[1]);for(let y=Math.ceil(y1/29)*29;y<=y2;y+=29)for(let x=Math.ceil(x1/29)*29;x<=x2;x+=29){const p=unproject(x,y,MAP_W,MAP_H);if(inPolygons(p,[poly]))collector.add(kind,a.level,p)}}}
function selectMarkers(collector){const groups=[...collector.byKind.values()].map(m=>[...m.values()].sort((a,b)=>b.level-a.level||a.dist-b.dist)).sort((a,b)=>b[0].level-a[0].level||a.length-b.length),used=[];const fit=c=>used.every(p=>Math.hypot(p.x-c.x,p.y-c.y)>=54);for(const group of groups){const c=group.find(fit);if(c)used.push(c)}const all=groups.flat().sort((a,b)=>b.level-a.level||a.dist-b.dist);for(const c of all){if(used.length>=36)break;if(fit(c))used.push(c)}return used}
function markerMarkup(m){const x=rounded(m.x),y=rounded(m.y);return `<g data-warning-kind="${m.kind}" data-warning-lon="${m.p[0]}" data-warning-lat="${m.p[1]}" transform="translate(${x} ${y})" role="img" aria-label="${esc(ICON_NAMES[m.kind])}"><title>${esc(ICON_NAMES[m.kind])}</title><g class="nw-zoom-stable"><circle r="18.5" fill="#fff" stroke="#24364a" stroke-width="2"/><g transform="translate(-13.5 -13.5) scale(1.125)">${warningGlyph(m.kind)}</g></g></g>`}
function gridContour(values,nx,ny,threshold,exact=false){
 // Marching squares on cell centres. Ambiguous diagonal cells stay separate.
 const inside=(x,y)=>x>=0&&y>=0&&x<nx&&y<ny&&(exact?values[y*nx+x]===threshold:values[y*nx+x]>=threshold&&values[y*nx+x]<=4);
 const stride=2*nx+3,graph=new Map(),key=(x,y)=>(y+1)*stride+x+1;
 const pairs=[[],[[3,0]],[[0,1]],[[3,1]],[[1,2]],[[3,0],[1,2]],[[0,2]],[[3,2]],[[2,3]],[[0,2]],[[0,1],[2,3]],[[1,2]],[[1,3]],[[0,1]],[[3,0]],[]];
 const link=(a,b)=>{if(!graph.has(a))graph.set(a,[]);if(!graph.has(b))graph.set(b,[]);graph.get(a).push(b);graph.get(b).push(a)};
 for(let y=-1;y<ny;y++)for(let x=-1;x<nx;x++){
  const code=(inside(x,y)?1:0)|(inside(x+1,y)?2:0)|(inside(x+1,y+1)?4:0)|(inside(x,y+1)?8:0);
  if(!pairs[code].length)continue;
  const a=[key(2*x+2,2*y+1),key(2*x+3,2*y+2),key(2*x+2,2*y+3),key(2*x+1,2*y+2)];
  for(const [i,j] of pairs[code])link(a[i],a[j]);
 }
 const pt=k=>[(k%stride-1)/2,(Math.floor(k/stride)-1)/2],fmt=p=>p.map(v=>Number(v.toFixed(3))).join(' ');
 const toward=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),t=Math.min(.22,d/3)/d;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]};
 let path='';
 while(graph.size){
  const start=graph.keys().next().value,ring=[];let v=start,prev=null,closed=false;
  do{const links=graph.get(v);if(!links)break;const next=links.find(k=>k!==prev);ring.push(pt(v));graph.delete(v);if(next===start){closed=true;break}if(next===undefined)break;prev=v;v=next;}while(true);
  if(!closed||ring.length<3)continue;
  const corners=ring.filter((p,i)=>{const a=ring[(i+ring.length-1)%ring.length],b=ring[(i+1)%ring.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0])});
  if(corners.length<3)continue;
  path+='M'+fmt(toward(corners[0],corners.at(-1)));
  for(let i=0;i<corners.length;i++){const p=corners[i],a=toward(p,corners[(i+corners.length-1)%corners.length]),b=toward(p,corners[(i+1)%corners.length]);path+='L'+fmt(a)+'Q'+fmt(p)+' '+fmt(b)}path+='Z';
 }
 return path;
}
function contourMarkup(values,g,missing=false){
 const [x,y]=project(g.west-g.step/2,g.south-g.step/2),transform=`translate(${x} ${y}) scale(${g.step*MAP_DX} ${-g.step*MAP_DY})`;
 const make=(color,level,exact=false)=>{const d=gridContour(values,g.nx,g.ny,level,exact);return d?`<path transform="${transform}" fill-rule="evenodd" fill="${color}" d="${d}"/>`:''};
 // One opaque colour per severity, regardless of the data source.
 return [missing?make('#85929b',5,true):'',...OWN.map((color,i)=>make(color,i+1))];
}
function composeWarningAreas(areas){
 // Draw all source masks by ascending severity, not by source order.
 // Unknown cells stay below all warnings; high severity cannot be obscured.
 return '<g clip-path="url(#nw-de-clip)">'+[0,1,2,3,4].map(i=>areas.map(a=>a?.[i]||'').join('')).join('')+'</g>';
}
function validRisk(d){const g=d?.grid;return d?.schema===1&&g&&(g.nx===481&&g.ny===411&&g.step===.02||g.nx===193&&g.ny===165&&g.step===.05||g.nx===241&&g.ny===206&&g.step===.04)&&g.west===5.5&&g.south===47&&Array.isArray(d.models)&&Array.isArray(d.periods)&&d.periods.length<=(g.step===.04?25:9)&&d.periods.every(p=>Number.isFinite(p.start)&&p.end-p.start===10800&&Object.keys(TYPES).every(k=>OPTIONAL.includes(k)&&p.layers?.[k]===undefined||typeof p.layers?.[k]==='string'&&p.layers[k].length===4*Math.ceil(g.nx*g.ny/3)))}
// Export side-effect-free rules for unit tests.
if(typeof module!=='undefined'&&module.exports){module.exports={radarKind,radarPhaseCode,eventsInWindow,alertStage,modelStage,stageMatches,groupWarnings,areaStats,modelLevel,frostLevel,legacyFrostCode,pointInRing,inPolygons,pickPeriods,cellsForPoint,validRisk,fresh,project,unproject,mapGeometry,districtAt,gridContour,contourMarkup,composeWarningAreas,cityMarkup,officialKind,warningGlyph,markerCandidates,collectOfficialMarkers,selectMarkers,markerMarkup,mapView,screenMap,mapPoint,zoomMap,panMap,MAX_ZOOM,MAP_W,MAP_H,stormFresh,stormKinds,stormTitle,stormLevel,direction,stormCorridor,stormHit,normalizeOfficial};return}
const host=document.getElementById('national-warning');if(!host)return;
let stage='active',filter='all',windowId='all',point=null,risk=null,watchRisk=null,errorWatch=false,stormData=null,selectedStorm=null,request=null,last=0,lastRiskCheck=0,errorR=false,errorStorm=false,showRadar=true;
host.innerHTML=`<div class="nw-head"><div><h2>Eigene Warnlage Deutschland</h2><p>Aktive Warnungen bis 24 Stunden · Watches bis 96 Stunden</p></div><button type="button" id="nw-refresh" aria-label="Warnlage aktualisieren">↻</button></div>
<div class="nw-tabs" role="group" aria-label="Warnlage"><button data-nw-stage="active" aria-pressed="true">Aktiv</button><button data-nw-stage="upcoming" aria-pressed="false">Bevorstehend · Watch</button><button data-nw-stage="risk" aria-pressed="false">Risiken</button></div>
<div class="nw-controls"><label id="nw-time-label">Zeitraum<select id="nw-time"><option value="all">Nächste 24 h</option><option value="now">Aktuelles 3-h-Fenster</option><option value="0-6">0–6 h</option><option value="6-12">6–12 h</option><option value="12-24">12–24 h</option></select></label></div><p id="nw-explain" class="nw-note"></p><div class="nw-map-layout"><div class="nw-map"><img class="nw-map-base" src="assets/national-map.svg" alt="Deutschland mit Bundeslandgrenzen"><svg id="nw-canvas" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${MAP_H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Deutschlandkarte der Wettergefahren. Ort antippen für Details."></svg><div id="nw-map-status" class="nw-map-status" role="status" aria-live="polite" hidden></div><div class="nw-zoom-controls" aria-label="Kartenzoom"><button type="button" id="nw-zoom-plus" aria-label="Hineinzoomen">+</button><button type="button" id="nw-zoom-minus" aria-label="Herauszoomen">−</button><button type="button" id="nw-zoom-reset" aria-label="Deutschlandübersicht" title="Deutschlandübersicht">⌂</button></div><span class="nw-zoom-level" id="nw-zoom-level">1×</span><section id="nw-popup" class="nw-popup" aria-label="Details zum gewählten Kartenpunkt" hidden><div class="nw-popup-head"><strong>Information zum Kartenpunkt</strong><button type="button" id="nw-close" aria-label="Information schließen">×</button></div><div id="nw-detail" class="nw-detail" aria-live="polite"></div></section><aside id="nw-type-tiles" class="nw-type-tiles" aria-label="Gefahren auf der Karte"></aside></div></div><p class="nw-note nw-map-help">Zwei Finger: zoomen · Vergrößerte Karte: verschieben · Warngebiet antippen: Details</p>
<button type="button" id="nw-my-location" class="nw-location">◎ Warnlage an meinem Ort</button>
<label id="nw-radar-label" class="nw-radar"><input id="nw-radar" type="checkbox" checked> Eigene Radargefahren (Radar ≥ 15 mm/h)</label>
<div class="nw-legend" id="nw-level-legend"><span><i style="background:#edc844"></i>1 Leicht</span><span><i style="background:#f18b26"></i>2 Markant</span><span><i style="background:#e13c49"></i>3 Unwetter</span><span><i style="background:#912b8f"></i>4 Extrem</span><span><i style="background:#4c166e"></i>5 Außergewöhnlich*</span></div><p class="nw-note" id="nw-sources" role="status"></p><p class="nw-note">Eigene, nicht amtliche Warnlage. Rohdaten: DWD ICON-D2 und KONRAD3D, ECMWF IFS (CC BY 4.0), NOAA GFS. Geometrien © GeoBasis-DE / BKG 2021, modifiziert. Keine Entwarnung bei fehlenden Daten. *L5 erfordert zusätzliche Bestätigung.</p>`;
const $=s=>host.querySelector(s),canvas=$('#nw-canvas');
let viewport=mapView(),gesture=null,mouseDrag=null,suppressClickUntil=0;
function applyViewport(){
 canvas.setAttribute('viewBox',[viewport.x,viewport.y,viewport.w,viewport.h].join(' '));
 const cities=canvas.querySelector?.('.nw-cities');if(cities)cities.innerHTML=cityMarkup(globalThis.WEATHER_BASEMAP?.places,viewport);
 canvas.querySelectorAll('.nw-zoom-stable').forEach(g=>g.setAttribute('transform',`scale(${1/viewport.zoom})`));
 canvas.style?.setProperty('touch-action',viewport.zoom>1?'none':'pan-y');
 const r=canvas.getBoundingClientRect?.(),base=$('.nw-map-base');if(r?.width&&r?.height&&base?.style){const k=Math.min(r.width/MAP_W,r.height/MAP_H)*viewport.zoom;base.style.transform=`translate(${(MAP_W/2-viewport.cx)*k}px,${(MAP_H/2-viewport.cy)*k}px) scale(${viewport.zoom})`}
 $('#nw-zoom-plus').disabled=viewport.zoom>=MAX_ZOOM;$('#nw-zoom-minus').disabled=viewport.zoom<=1;$('#nw-zoom-reset').disabled=viewport.zoom<=1;$('#nw-zoom-level').textContent=Number(viewport.zoom.toFixed(1))+'×';
}
function setView(v){viewport=v;applyViewport()}
function localPoint(clientX,clientY,r){return [clientX-r.left,clientY-r.top]}
function centerZoom(factor){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const p=[r.width/2,r.height/2];setView(zoomMap(viewport,viewport.zoom*factor,p,p,r.width,r.height))}
function pinchPoint(touches,r){const a=localPoint(touches[0].clientX,touches[0].clientY,r),b=localPoint(touches[1].clientX,touches[1].clientY,r);return {mid:[(a[0]+b[0])/2,(a[1]+b[1])/2],distance:Math.max(1,Math.hypot(a[0]-b[0],a[1]-b[1]))}}
function startTouch(e){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;if(e.touches.length>=2){gesture={kind:'pinch',start:viewport,...pinchPoint(e.touches,r),moved:true};suppressClickUntil=Date.now()+450;if(e.cancelable)e.preventDefault()}else if(e.touches.length===1&&viewport.zoom>1){gesture={kind:'pan',start:viewport,p:localPoint(e.touches[0].clientX,e.touches[0].clientY,r),moved:false}}else gesture=null}
function moveTouch(e){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;if(e.touches.length>=2){if(gesture?.kind!=='pinch')startTouch(e);if(gesture?.kind!=='pinch')return;const q=pinchPoint(e.touches,r);if(e.cancelable)e.preventDefault();setView(zoomMap(gesture.start,gesture.start.zoom*q.distance/gesture.distance,gesture.mid,q.mid,r.width,r.height));suppressClickUntil=Date.now()+450;return}if(gesture?.kind==='pan'&&e.touches.length===1){const q=localPoint(e.touches[0].clientX,e.touches[0].clientY,r),dx=q[0]-gesture.p[0],dy=q[1]-gesture.p[1];if(!gesture.moved&&Math.hypot(dx,dy)<5)return;gesture.moved=true;if(e.cancelable)e.preventDefault();setView(panMap(gesture.start,dx,dy,r.width,r.height));suppressClickUntil=Date.now()+450}}
function endTouch(e){if(gesture?.moved)suppressClickUntil=Date.now()+450;gesture=null;if(e.touches.length)startTouch(e)}
$('#nw-zoom-plus').addEventListener('click',()=>centerZoom(1.6));$('#nw-zoom-minus').addEventListener('click',()=>centerZoom(1/1.6));$('#nw-zoom-reset').addEventListener('click',()=>setView(mapView()));
canvas.addEventListener('touchstart',startTouch,{passive:false});canvas.addEventListener('touchmove',moveTouch,{passive:false});canvas.addEventListener('touchend',endTouch);canvas.addEventListener('touchcancel',()=>{gesture=null;suppressClickUntil=Date.now()+450});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||viewport.zoom<=1||e.button!==0)return;mouseDrag={id:e.pointerId,start:viewport,x:e.clientX,y:e.clientY,moved:false}});
canvas.addEventListener('pointermove',e=>{if(!mouseDrag||e.pointerId!==mouseDrag.id)return;const dx=e.clientX-mouseDrag.x,dy=e.clientY-mouseDrag.y;if(!mouseDrag.moved&&Math.hypot(dx,dy)<4)return;if(!mouseDrag.moved)canvas.setPointerCapture?.(e.pointerId);mouseDrag.moved=true;const r=canvas.getBoundingClientRect();if(r.width&&r.height)setView(panMap(mouseDrag.start,dx,dy,r.width,r.height))});
function endMouse(e){if(mouseDrag?.id!==e.pointerId)return;if(mouseDrag.moved)suppressClickUntil=Date.now()+250;mouseDrag=null}
canvas.addEventListener('pointerup',endMouse);canvas.addEventListener('pointercancel',endMouse);
canvas.addEventListener('wheel',e=>{if(!e.ctrlKey)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;e.preventDefault();const p=localPoint(e.clientX,e.clientY,r);setView(zoomMap(viewport,viewport.zoom*Math.exp(-e.deltaY*.003),p,p,r.width,r.height))},{passive:false});
canvas.addEventListener('click',e=>{if(Date.now()<suppressClickUntil)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const cell=e.target?.closest?.('[data-storm-id]');selectedStorm=cell?.dataset.stormId||null;point=mapPoint(viewport,e.clientX-r.left,e.clientY-r.top,r.width,r.height);showDetails()});
if(typeof ResizeObserver==='function')new ResizeObserver(applyViewport).observe(canvas);
let geometry=null;function getGeometry(){return geometry||(geometry=mapGeometry(globalThis.WEATHER_BASEMAP,globalThis.WEATHER_EXTRA_GEO))}
function currentRadarWindow(){return stage==='active'&&['all','now','0-6'].includes(windowId)}
function storms(t){return currentRadarWindow()&&stormFresh(stormData,t)?stormData.cells.filter(c=>(filter==='all'||stormKinds(c).includes(filter))&&(c.point[0]>=4&&c.point[0]<=17&&c.point[1]>=46&&c.point[1]<=56||c.path.some(p=>p.point[0]>=5&&p.point[0]<=15.5&&p.point[1]>=47&&p.point[1]<=55.2))):[]}
function stormColor(c){return ['#437caa','#c48a16','#e14f36','#a40085'][stormLevel(c)]||'#437caa'}
function stormMarkup(c,t){const color=stormColor(c),id=esc(c.id),isSelected=selectedStorm===c.id,[x,y]=project(...c.point).map(rounded),future=c.path.filter(p=>p.time>t),line=[c.point,...future.map(p=>p.point)].map(p=>project(...p).map(rounded).join(',')).join(' ');const corridor=stormCorridor(c,t).map(p=>ringPath(p.ring)).join('');return `<g data-storm-id="${id}" role="button" aria-label="${stormTitle(c)} · Details"><title>${stormTitle(c)} · Zugbahn möglich</title>${corridor?`<path d="${corridor}" fill="${color}" fill-opacity=".24" stroke="${color}" stroke-dasharray="5 4" stroke-width="1.2"/>`:''}<path d="${stormFootprint(c).map(ringPath).join('')}" fill="${color}" fill-opacity=".62" stroke="${color}" stroke-width="2"/>${future.length?`<polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>${future.filter(p=>(p.time-stormData.observed)%900===0||p===future.at(-1)).map(p=>{const [px,py]=project(...p.point).map(rounded);return `<g transform="translate(${px} ${py})"><g class="nw-zoom-stable"><circle r="3.5" fill="${color}" stroke="white"/><text x="5" y="-5" font-size="11" fill="${color}" stroke="white" stroke-width="2" paint-order="stroke">${Math.round((p.time-stormData.observed)/60)}′</text></g></g>`}).join('')}`:''}<g transform="translate(${x} ${y})"><g class="nw-zoom-stable"><circle r="${isSelected?13:10}" fill="${color}" stroke="white" stroke-width="2"/>${c.lightning>0?'<path d="M2 -7 -5 1h5l-2 7 8-10H1Z" fill="white"/>':'<circle r="3" fill="white"/>'}</g></g></g>`}
function riskData(t){return fresh(risk,5400,t)&&validRisk(risk)?risk:null}
function displayRisk(t){return stage==='upcoming'?(fresh(watchRisk,5400,t)&&validRisk(watchRisk)?watchRisk:null):riskData(t)}
function modelPeriods(t){const d=displayRisk(t);if(!d)return [];return stage==='upcoming'?d.periods.filter(p=>p.end>t+86400&&p.start<t+96*3600):pickPeriods(d,t,windowId)}
function inGermany(p){const g=getGeometry();return !!g&&g.rings.some((r,i)=>{const b=g.boxes[i];return p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3]&&pointInRing(...p,r)})}
let mask=new Uint8Array(0);function germanCell(g,i){if(mask.length!==g.nx*g.ny)mask=new Uint8Array(g.nx*g.ny);if(!mask[i])mask[i]=inGermany([g.west+i%g.nx*g.step,g.south+Math.floor(i/g.nx)*g.step])?1:2;return mask[i]===1}
let radarCache={key:'',rows:[]};
function radarRows(){try{const rows=radarObservationSources(),key=rows.map(s=>s.source+' '+s.time).join('|');if(key===radarCache.key)return radarCache.rows;
 radarCache={key,rows:rows.map(s=>({...s,raw:atob(s.amount)}))};return radarCache.rows}catch{return []}}
function radarSampleAt(rows,p){let rate=NaN,time=NaN,latest=-Infinity,priority=Infinity;for(const s of rows){const g=s.grid,n=cellsForPoint(g,p);if(n<0)continue;const v=(s.raw.charCodeAt(n*2)|(s.raw.charCodeAt(n*2+1)<<8))<<16>>16;if(v<0)continue;if(latest===-Infinity)latest=s.time;if(latest-s.time>600000)break;const rank=s.priority??2;if(rank<priority){rate=v*g.scale*s.rateFactor;time=s.time;priority=rank}}return {rate,time}}
function rateAt(rows,p){return radarSampleAt(rows,p).rate}
let phaseCache=null;function radarPhaseContext(){try{const d=typeof radarPhaseData==='undefined'?null:radarPhaseData,time=Date.parse(d?.time);if(!Number.isFinite(time)||time>Date.now()||Date.now()-time>1200000)return null;if(phaseCache?.time!==time)phaseCache={time,grid:d.grid,raw:atob(d.classes)};return phaseCache}catch{return null}}
function rectPath(lon,lat,w,h){const [x,y]=project(lon,lat).map(rounded);return `M${x},${y}h${rounded(w*MAP_DX)}v${rounded(h*MAP_DY)}h-${rounded(w*MAP_DX)}Z`}
const areaCache=new Map();let activeRadarGeometry={key:'',path:'',markers:[]};
function modelArea(periods,g,ks,collector){
 const cacheKey=[displayRisk(now())?.generated,g.step,stage,filter,...periods.map(p=>p.start)].join('/'),cached=areaCache.get(cacheKey);if(cached){for(const m of cached.markers)collector.add(m.kind,m.level,m.p);return cached.markup}
 const n=g.nx*g.ny,level=new Uint8Array(n),known=new Uint8Array(n);for(const k of ks){const hazard=new Uint8Array(n);for(const p of periods){const a=p.decoded[k];for(let i=0;i<n;i++){if(a[i]!==255)known[i]=1;if(stageMatches(a[i],stage)){const l=modelLevel(a[i]);level[i]=Math.max(level[i],l);hazard[i]=Math.max(hazard[i],l)}}}const stride=Math.max(1,Math.round(.1/g.step));for(let y=0;y<g.ny;y++)for(let x=0;x<g.nx;x++){const i=y*g.nx+x;if(hazard[i]&&((x%stride===0&&y%stride===0)||(x===0||!hazard[i-1])&&(y===0||!hazard[i-g.nx]))&&germanCell(g,i))collector.add(k,hazard[i],[g.west+x*g.step,g.south+y*g.step])}}
 for(let i=0;i<n;i++)if(!known[i])level[i]=5;
 const markup=contourMarkup(level,g,true);areaCache.set(cacheKey,{markup,markers:[...collector.byKind.values()].flatMap(m=>[...m.values()])});while(areaCache.size>8)areaCache.delete(areaCache.keys().next().value);return markup;
}
function radarWarningArea(rows,collector,kindFilter='all'){
 const phase=radarPhaseContext(),key=radarCache.key+'|'+(phase?.time??'unknown');if(activeRadarGeometry.key!==key){const markers=[],step=.01,nx=961,ny=821,all=new Uint8Array(nx*ny),byKind=new Map();for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const p=[5.5+x*step,47+y*step],{rate,time}=radarSampleAt(rows,p),l=rate>=60?3:rate>=30?2:rate>=15?1:0,i=y*nx+x;if(!l)continue;const kind=radarKind(radarPhaseCode(phase,p,time));if(!byKind.has(kind))byKind.set(kind,new Uint8Array(nx*ny));const levels=byKind.get(kind);levels[i]=all[i]=l;if(((x%8===0&&y%8===0)||(!x||!levels[i-1])&&(!y||!levels[i-nx]))&&inGermany(p))markers.push({kind,level:l,p})}activeRadarGeometry={key,grid:{west:5.5,south:47,step,nx,ny},all,byKind,paths:new Map(),markers}}
 const a=activeRadarGeometry,levels=kindFilter==='all'?a.all:a.byKind.get(kindFilter);for(const m of a.markers)if(kindFilter==='all'||m.kind===kindFilter)collector.add(m.kind,m.level,m.p);if(!levels)return '';if(!a.paths.has(kindFilter))a.paths.set(kindFilter,contourMarkup(levels,a.grid));return a.paths.get(kindFilter);
}
let frostCache=null;
function observedFrost(collector){
 const f=globalThis.WeatherObservation?.gridField('temp2');if(!f)return '';
 const key=globalThis.WeatherObservation.revision;
 if(frostCache?.key!==key){const g=f.grid,levels=new Uint8Array(f.values.length),markers=[];
  for(let i=0;i<levels.length;i++){const v=f.values[i],l=frostLevel(v);if(!l)continue;levels[i]=l;const x=i%g.nx,y=Math.floor(i/g.nx);if(x%5===0&&y%5===0){const p=[g.west+x*g.step,g.south+y*g.step];if(inGermany(p))markers.push({level:l,p});}}
  frostCache={key,markers,markup:contourMarkup(levels,g)};
 }for(const m of frostCache.markers)collector.add('frost',m.level,m.p);return frostCache.markup;
}
function fogWindow(){return stage!=='upcoming'&&['all','now','0-6'].includes(windowId)}
let fogCache=null;
function currentFogRisk(){
 const o=globalThis.WeatherObservation;if(!o?.mapField)return null;const f=['temp2','dew','rh2','wind'].map(k=>o.mapField(k));if(!f.every(x=>x?.kind==='analysis'&&!x.stale&&x.time===f[0].time))return null;
 if(fogCache?.time===f[0].time)return fogCache;
 const g=f[0].grid,levels=new Uint8Array(g.nx*g.ny),markers=[];for(let i=0;i<levels.length;i++)if(o.fogPotential(f[0].values[i],f[1].values[i],f[2].values[i],f[3].values[i])){levels[i]=1;const x=i%g.nx,y=Math.floor(i/g.nx);if(x%8===0&&y%8===0){const p=[g.west+x*g.step,g.south+y*g.step];if(inGermany(p))markers.push(p)}}
 fogCache={time:f[0].time,markers,markup:contourMarkup(levels,g)};return fogCache;
}
function currentFogArea(collector){
 const o=globalThis.WeatherObservation;if(!o)return '';
 if(stage==='active'&&(filter==='all'||filter==='fog')){for(const r of o.fogStations?.()||[]){const p=[r.lon,r.lat];if(inGermany(p))collector.add('fog',r.values.visibility<150?2:1,p)}}
 // The standard Germany view includes a SEPARATE potential overlay. Its
 // symbol and label must never imply that fog has already been observed.
 if((stage==='active'||stage==='risk')&&(filter==='all'||filter==='fogpotential')){const f=currentFogRisk();if(!f)return '';for(const p of f.markers)collector.add('fogpotential',1,p);return f.markup;}
 return '';
 return '';
}
function draw(){
 const geo=getGeometry(),dark=document.documentElement.dataset.theme!=='light';
 const t=now(),periods=modelPeriods(t),g=displayRisk(t)?.grid,ks=filter==='all'?Object.keys(TYPES):TYPES[filter]?[filter]:[],collector=markerCandidates();
 // Always leave the independent local SVG basemap visible if a render fails.
 let out=geo?`<defs><clipPath id="nw-de-clip"><path d="${geo.outline}"/></clipPath></defs><path d="${geo.neighbors}" fill="${dark?'#263745':'#e3e9e6'}" stroke="${dark?'#627180':'#9aa6a5'}" stroke-width=".7" fill-rule="evenodd"/><path d="${geo.outline}" fill="${dark?'#2a4258':'#f8fafb'}"/>`:'';
 if(geo)out+='<g fill="'+(dark?'#9caebe':'#667773')+'" font-size="11" font-family="system-ui,sans-serif" text-anchor="middle" pointer-events="none">'+[['NL',5.3,52.4],['BE',4.8,50.8],['LU',6.03,49.66],['FR',5.2,48.4],['CH',8,47.12],['AT',12.6,47.2],['CZ',14.5,49.7],['PL',15.25,52.3],['DK',9.6,55.1]].map(([name,lon,lat])=>{const [x,y]=project(lon,lat).map(rounded);return '<g transform="translate('+x+' '+y+')"><text class="nw-zoom-stable">'+name+'</text></g>'}).join('')+'</g>';
 const areas=[];
 if(geo&&periods.length&&g&&ks.length)areas.push(modelArea(periods,g,ks,collector));
 if(geo&&currentRadarWindow()&&showRadar){const rows=radarRows();if(rows.length)areas.push(radarWarningArea(rows,collector,filter))}
 if(geo&&currentRadarWindow()&&(filter==='all'||filter==='frost'))areas.push(observedFrost(collector));
 if(geo&&fogWindow())areas.push(currentFogArea(collector));
 if(geo)out+=composeWarningAreas(areas.filter(Array.isArray));
 if(geo)out+=`<g fill="none" stroke-linejoin="round" pointer-events="none"><path class="nw-districts" d="${geo.districtPaths}" stroke="${dark?'#9eb2c7':'#475b70'}" stroke-opacity=".48" stroke-width=".45" vector-effect="non-scaling-stroke"/><path d="${geo.states}" stroke="${dark?'#a1b1c2':'#748392'}" stroke-opacity=".8" stroke-width=".9" vector-effect="non-scaling-stroke"/><path d="${geo.outline}" stroke="${dark?'#d3dce7':'#48586a'}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></g><g class="nw-cities" fill="${dark?'#f3f8ff':'#253444'}" font-size="15" font-family="system-ui,sans-serif" stroke="${dark?'#213347':'#fff'}" stroke-width="2.5" paint-order="stroke">${cityMarkup(globalThis.WEATHER_BASEMAP?.places,viewport)}</g>`;
 out+=selectMarkers(collector).map(markerMarkup).join('');
 out+=storms(t).map(c=>stormMarkup(c,t)).join('');
 if(point){const [x,y]=project(...point).map(rounded);out+=`<g transform="translate(${x} ${y})"><g class="nw-zoom-stable"><circle r="7" fill="#fff" stroke="#162951" stroke-width="3"/></g></g>`}
 canvas.innerHTML=out;
 applyViewport();
}
function selectedModels(t){const d=displayRisk(t);if(!point||!d||!inGermany(point))return [];const n=cellsForPoint(d.grid,point);if(n<0)return [];const periods=modelPeriods(t),full=stage==='upcoming'?periods:pickPeriods(d,t,'all');return (filter==='all'?Object.keys(TYPES):TYPES[filter]?[filter]:[]).flatMap(k=>eventsInWindow(groupWarnings(full,d.grid,k,n,stage),periods))}
const stormNumber=(v,unit='')=>Number.isFinite(v)?Math.round(v).toLocaleString('de-DE')+(unit?' '+unit:''):'Nicht verfügbar';
function stormDirection(c){const d=direction(c);return d===null?'Keine sichere Zugrichtung':`${['N','NO','O','SO','S','SW','W','NW'][Math.round(d/45)%8]} · ${Math.round(d)}°`}
function stormHazards(c){const out=[];if(c.lightning>0)out.push('Blitzaktivität');if(c.rainFlag>0)out.push('Starkregen');if(c.hailFlag>0||c.hailArea>0)out.push('Hagelsignal');if(c.gustFlag>0)out.push('Gewitterböen');return out.length?out.join(' · '):'Kein Gefahrensignal im Zellprodukt'}
function stormModel(c,t){const d=riskData(t);if(!d)return 'Modellkontext nicht verfügbar';const n=cellsForPoint(d.grid,c.point);if(n<0)return 'Außerhalb des Modellrasters';const list=[];for(const k of ['storm','stormwind','stormrain','hail','rotation']){const levels=pickPeriods(d,t,'0-6').map(p=>p.decoded[k]?.[n]).filter(v=>modelStage(v));if(levels.length)list.push(TYPES[k])}return list.length?'Modellhinweise für die nächsten 6 h: '+list.join(' · '):'Keine passenden Modellhinweise am Zellzentrum (keine Entwarnung)'}
function stormDetail(c,t,hit){const rain=c.rainMm!=null?`${stormNumber(c.rainMm,'mm')}${c.rainMinutes>0?' / '+stormNumber(c.rainMinutes,'min'):''}`:'Nicht verfügbar';const hail=c.largeHailArea>0?'Radar: großer Hagel klassifiziert':c.hailArea>0?'Radar: Hagel klassifiziert':c.hailFlag>0?'Hagelpotenzial':Number.isFinite(c.hailFlag)?'Kein Hagel-Warnsignal':'Nicht verfügbar';const rate=rateAt(radarRows(),c.point);const metric=(label,value)=>`<div><small>${label}</small><strong>${esc(value)}</strong></div>`;return `<article class="nw-storm-details" style="--storm-color:${stormColor(c)}"><h3>${stormTitle(c)} · Storm Tracking</h3><p><b>${esc(stormHazards(c))}</b>${hit?'<br>'+ (hit.current?'Gebiet im zuletzt erfassten Zellbereich':'Mögliche Zugbahn am gewählten Ort · bis etwa '+fmt(hit.time)):''}</p><div class="nw-storm-metrics">${metric('Zugrichtung',stormDirection(c))}${metric('Zuggeschwindigkeit',stormNumber(c.speedKmh,'km/h'))}${metric('Reflektivität max.',stormNumber(c.dbz,'dBZ'))}${metric('Blitze letzte 5 min',stormNumber(c.lightning))}${metric('Niederschlagspotenzial',rain)}${metric('Radar-Rate am Zentrum',stormNumber(rate,'mm/h'))}${metric('Böen (Radarschätzung)',stormNumber(c.gustKmh,'km/h'))}${metric('Hagel (Radar)',hail)}${metric('Zellfläche',stormNumber(c.areaKm2,'km²'))}${metric('Echo-Obergrenze über NN',stormNumber(c.echoTopM,'m'))}</div><p class="nw-note">${esc(stormModel(c,t))}.</p><p class="nw-note">Radar-Analyse ${fmt(stormData.observed)} · ${c.firstSeen?'Erste Erfassung '+fmt(c.firstSeen)+' · ':''}Schraffierte/gestrichelte Zugbahn: mögliche Ausbreitung bis 60 Minuten, keine amtliche Warnung. Hagelgröße am Boden und gemessene Böen sind aus diesem Produkt nicht belegbar.</p></article>`}
function clearSelection(){point=null;selectedStorm=null;$('#nw-popup').hidden=true;$('#nw-detail').innerHTML=''}
function showDetails(){render();$('#nw-detail').scrollTop=0}
function render(){
 const t=now(),r=displayRisk(t),sf=stormFresh(stormData,t);
 $('#nw-time-label').hidden=stage==='upcoming';$('#nw-radar-label').hidden=!currentRadarWindow();$('#nw-level-legend').hidden=false;host.querySelectorAll('[data-nw-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nwStage===stage)));
 $('#nw-explain').textContent=stage==='active'?'Laufende und sehr wahrscheinliche Gefahren mit Beginn innerhalb der nächsten 24 Stunden. Modellwarnungen sind Prognosen; beobachtete Radar-Gefahren und Gewitterzellen werden separat angezeigt. Nebelpotenzial aus aktueller Analyse ist ein möglicher Verlauf, keine Nebelbeobachtung.':stage==='upcoming'?'Watch: mögliche größere Wetterereignisse mit Beginn in 24–96 Stunden. Lage, Intensität und Zeitpunkt können sich noch verändern.':'Unsichere Gefahren innerhalb der nächsten 24 Stunden (z. B. einzelne Modellsignale oder konvektive Zutaten).';
 $('#nw-sources').textContent=stage==='active'?(sf?'Radar-Analyse: '+fmt(stormData.observed)+(stormData.missingRadarSites?.length?' · Abdeckung eingeschränkt':''):errorStorm?'Keine frische Zellanalyse verfügbar. Keine Entwarnung.':'Zellanalyse wird geladen …')+(r?' · Modellwarnungen '+fmt(r.generated):' · Modellwarnungen nicht verfügbar')+(globalThis.WeatherObservation?.gridField('temp2')?' · SYNOP-Frostflächen (Beobachtungsanalyse)':' · Keine frische SYNOP-Fläche')+(showRadar?' · '+(radarRows().length?'Eigene Radarintensitäts-Gebiete':'Keine frischen numerischen Radardaten'):''):(r?'Modellanalyse '+fmt(r.generated)+' · '+r.grid.step+'° Warnraster · Modellauflösung: '+r.models.map(m=>m.model+' '+m.step+'°').join(', ')+' · Grau: fehlende Modellwerte':(stage==='upcoming'?errorWatch:errorR)?'Modellanalyse momentan nicht verfügbar. Keine Entwarnung.':'Modellanalyse wird geladen …');
 const available=new Set();for(const p of modelPeriods(t))for(const k in TYPES)if(!available.has(k)&&p.decoded[k]?.some((c,i)=>stageMatches(c,stage)&&germanCell(r.grid,i)))available.add(k);if(currentRadarWindow()){if(globalThis.WeatherObservation?.gridField('temp2')?.values.some(v=>v<0))available.add('frost');for(const c of stormFresh(stormData,t)?stormData.cells:[])if(inGermany(c.point)||c.path.some(p=>inGermany(p.point)))for(const k of stormKinds(c))available.add(k);const rows=showRadar?radarRows():[];if(rows.length){radarWarningArea(rows,markerCandidates());for(const m of activeRadarGeometry.markers)available.add(m.kind)}}
 if(fogWindow()){if(stage==='active'&&globalThis.WeatherObservation?.fogStations?.().some(r=>inGermany([r.lon,r.lat])))available.add('fog');if((stage==='active'||stage==='risk')&&currentFogRisk()?.markers.length)available.add('fogpotential');}
 if(filter!=='all'&&!available.has(filter))filter='all';
 const status=$('#nw-map-status'),hasInputs=!!r||sf||currentRadarWindow()&&((showRadar&&radarRows().length>0)||!!globalThis.WeatherObservation?.gridField('temp2'))||fogWindow()&&((globalThis.WeatherObservation?.fogStations?.().length||0)>0||!!currentFogRisk()?.markers.length);
 const noFresh=!hasInputs;
 const statusText=noFresh?'Keine aktuellen Warnkartendaten: Datenimport verzögert'+(risk?.generated?' · letzter Modellstand '+fmt(risk.generated):'')+'. Keine Entwarnung.':available.size===0?'Für diese Ansicht liegen keine erkannten Gefahrensignale vor. Das ist keine amtliche Entwarnung.':'';
 status.hidden=!statusText;status.textContent=statusText;
 const tiles=$('#nw-type-tiles');tiles.innerHTML=[['all','Alle'],...Object.entries({...TYPES,...RADAR_ONLY}).filter(([k])=>available.has(k))].map(([k,v])=>`<button type="button" data-nw-kind="${k}" aria-pressed="${filter===k}">${k==='all'?'<span class="nw-all-icon">▦</span>':warningIcon(k)}<span>${esc(v)}</span></button>`).join('');
 const signals=selectedModels(t),cells=storms(t),selected=cells.find(c=>c.id===selectedStorm),hits=point?cells.map(c=>({c,hit:stormHit(c,point,t)})).filter(x=>x.hit):[];
 const detail=$('#nw-detail'),popup=$('#nw-popup');
 if(point||selected){
  popup.hidden=false;
  const district=point&&districtAt(getGeometry(),point),heading=point?`<h3>${district?esc(district.type+' '+district.name):'Gewähltes Gebiet'}</h3><p class="nw-note">${point[1].toFixed(2)}° N · ${point[0].toFixed(2)}° E · Kreisgrenzen: BKG VG250 (2019)</p>`:'';
  const modelText=signals.map(x=>`<p><b class="nw-inline-kind">${warningIcon(x.kind)} ${TYPES[x.kind]} · L${modelLevel(x.code)}</b><br>${esc(x.summary)}<br><small>${fmt(x.start)} – ${stage==='active'&&x.end>=t+86400?'mindestens ':''}${fmt(x.end)} · ${x.code>=31?'Hochaufgelöstes Regionalmodell · vorsorglich':x.code>=11?'Mehrere Modellfamilien':'Ein Modell signalisiert Überschreitung'}${stage==='active'?' · Warnprognose (3-h-Raster), kein Messnachweis':''}${stage!=='active'?' · möglich':''}${HINT[x.kind]?'<br>'+HINT[x.kind]:''}</small></p>`).join('');
  const cellText=(selected?stormDetail(selected,t,hits.find(h=>h.c.id===selected.id)?.hit):'')+hits.filter(h=>h.c!==selected).map(h=>stormDetail(h.c,t,h.hit)).join('');
  const sample=currentRadarWindow()&&point&&showRadar?radarSampleAt(radarRows(),point):{rate:NaN,time:NaN},rate=sample.rate,kind=radarKind(radarPhaseCode(radarPhaseContext(),point,sample.time));
  const radarText=Number.isFinite(rate)&&rate>=15&&(filter==='all'||filter===kind)?`<p><b>Radar-Gefahrenhinweis · ${esc(({...TYPES,...RADAR_ONLY})[kind])}</b><br>${stormNumber(rate,'mm/h')} Wasseräquivalent · momentane Radarrate, keine gemessene Niederschlagsmenge oder Schneehöhe.</p>`:'';
  const frostValue=currentRadarWindow()&&point&&(filter==='all'||filter==='frost')?globalThis.WeatherObservation?.gridValue('temp2',point):NaN;const frostText=frostValue<0?'<p><b>Aktueller Luftfrost · L'+frostLevel(frostValue)+' · DWD SYNOP</b><br>'+stormNumber(frostValue,'°C')+' · räumliche Beobachtungsanalyse, keine Prognose.</p>':'';const fog=fogWindow()&&point?globalThis.WeatherObservation?.fogAt?.(point,NaN):null, fogText=fog&&(stage==='active'&&fog.state==='observed'&&(filter==='all'||filter==='fog')||(stage==='active'||stage==='risk')&&fog.state==='risk'&&(filter==='all'||filter==='fogpotential'))?'<p><b>'+(fog.state==='observed'?'Aktuelle Nebelbeobachtung':'Aktuelles Nebelpotenzial')+'</b><br>'+esc(fog.source)+(Number.isFinite(fog.visibility)?' · '+stormNumber(fog.visibility,'m'):'')+'</p>':'';detail.innerHTML=heading+frostText+fogText+modelText+cellText+radarText+(!modelText&&!cellText&&!radarText&&!frostText&&!fogText?'<p>Keine angezeigte Gefahr an diesem Punkt. Das ist keine Entwarnung.</p>':'');
 }else{popup.hidden=true;detail.innerHTML=''}
 try{draw()}catch(e){canvas.innerHTML='';console.warn('Warnkarte: lokale Grundkarte bleibt sichtbar',e);$('#nw-sources').textContent+=' · Kartenebene konnte nicht dargestellt werden.'}
}
async function fetchData(branch,file,root=ROOT){const c=new AbortController(),timer=setTimeout(()=>c.abort(),20000);try{const res=await fetch(root+branch+'/'+file+'?v='+Math.floor(now()/60),{signal:c.signal,cache:'no-store',credentials:'omit'});if(!res.ok)throw Error('HTTP '+res.status);const bytes=await res.arrayBuffer(),b=new Uint8Array(bytes);return b[0]===31&&b[1]===139?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(bytes))}finally{clearTimeout(timer)}}
let watchRequest=null,lastWatchCheck=0;
function decodeRisk(d){
 const size=d.grid.nx*d.grid.ny;
 for(const p of d.periods){p.decoded={};p.metricValues={};
  for(const k in TYPES){const raw=p.layers[k]&&atob(p.layers[k]),a=new Uint8Array(size);if(raw){for(let i=0;i<a.length;i++)a[i]=raw.charCodeAt(i)}else a.fill(255);p.decoded[k]=a}
  for(const k of [...Object.keys(METRICS),'iceCause','stormhour','snowMin','snowMax']){const metric=p.metrics?.[k];if(typeof metric==='string'&&metric.length===4*Math.ceil(size*2/3))try{p.metricValues[k]=atob(metric)}catch{}}
  if(p.frostThresholdVersion!==2){const a=p.decoded.frost;for(let i=0;i<a.length;i++)a[i]=legacyFrostCode(a[i],metricAt(p,'frost',i));}
 }
}
async function refreshWatch(force=false){
 if(watchRequest)return watchRequest;if(!force&&now()-lastWatchCheck<300)return;
 lastWatchCheck=now();
 watchRequest=fetchData('mobile-warning-data','national-watches.json.gz',MOBILE_ROOT).then(d=>{
  if(!fresh(d,5400)||!validRisk(d)||d.grid.step!==.04)throw Error('invalid watch');
  if(watchRisk&&watchRisk.generated>=d.generated){errorWatch=false;return}
  decodeRisk(d);
  watchRisk=d;areaCache.clear();errorWatch=false;
 }).catch(()=>{errorWatch=true}).finally(()=>{watchRequest=null;if(stage==='upcoming')render()});return watchRequest;
}
async function refresh(force=false){render();if(request)return request;if(!force&&now()-last<60)return;last=now();const forecast=async()=>{if(!force&&riskData(now())&&now()-lastRiskCheck<300)return;lastRiskCheck=now();let d;try{d=await fetchData('mobile-warning-data','national-risks.json.gz',MOBILE_ROOT);if(!fresh(d,5400)||!validRisk(d))throw Error('invalid forecast')}catch{d=await fetchData('national-risks-data','national-risks.json.gz');if(!fresh(d,5400)||!validRisk(d))throw Error('invalid fallback')}
 if(risk&&d.generated===risk.generated&&d.grid.step===risk.grid.step)return;decodeRisk(d);if(!risk||d.generated>=risk.generated||d.grid.step<risk.grid.step){risk=d;areaCache.clear()}errorR=false};request=Promise.allSettled([fetchData('storm-tracks-data','storm-tracks.json',MOBILE_ROOT).then(d=>{if(!stormFresh(d))throw Error('stale storm tracking');if(!stormData||d.observed>=stormData.observed)stormData=d;errorStorm=false;render()}).catch(()=>{errorStorm=true}),forecast().catch(()=>{errorR=true})]).finally(()=>{request=null;render()});return request}
host.querySelectorAll('[data-nw-stage]').forEach(b=>b.addEventListener('click',()=>{clearSelection();stage=b.dataset.nwStage;filter='all';windowId='all';$('#nw-time').value='all';render();if(stage==='upcoming')return refreshWatch()}));$('#nw-type-tiles').addEventListener('click',e=>{const b=e.target.closest?.('[data-nw-kind]');if(b){clearSelection();filter=b.dataset.nwKind;render()}});$('#nw-time').addEventListener('change',e=>{clearSelection();windowId=e.target.value;render()});$('#nw-refresh').addEventListener('click',()=>stage==='upcoming'?Promise.all([refresh(true),refreshWatch(true)]):refresh(true));$('#nw-close').addEventListener('click',()=>{clearSelection();render()});
$('#nw-my-location').addEventListener('click',()=>{try{const p=homeLocationPoint(location);if(p){selectedStorm=null;point=p;showDetails()}}catch{}});
$('#nw-radar').addEventListener('change',e=>{showRadar=e.target.checked;if(showRadar&&typeof refreshRadarClock==='function')Promise.resolve(refreshRadarClock()).then(render);render()});
const page=document.getElementById('page-warnings');render();if(typeof MutationObserver==='function')new MutationObserver(()=>{if(page.classList.contains('active'))refresh()}).observe(page,{attributes:true,attributeFilter:['class']});setInterval(()=>{if(!document.hidden&&page.classList.contains('active')){refresh();if(stage==='upcoming')refreshWatch()}},60000);if(page.classList.contains('active'))refresh();else if(typeof navigator!=='undefined'&&!navigator.connection?.saveData)setTimeout(()=>{if(!document.hidden)refresh()},2600);
})();

