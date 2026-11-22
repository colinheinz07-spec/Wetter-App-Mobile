// Shared, resolution-independent weather artwork. Forecast keys and symbol counts
// are intentionally unchanged; only the presentation is defined here.
(function(root){
 'use strict';
 // key, accessible name, cloud grade, celestial body, drops, flakes, rain grade,
 // lightning, windsock, fog paths, freezing rain
 const recipes=[
  ["01_sonnig","Sonnig",0,"sun",0,0,0,false,false,"",false],
  ["02_heiter","Heiter",1,"sun",0,0,0,false,false,"",false],
  ["03_leicht_bewoelkt","Leicht bewölkt",2,"sun",0,0,0,false,false,"",false],
  ["04_wolkig","Wolkig",2,"",0,0,0,false,false,"",false],
  ["05_stark_bewoelkt","Stark bewölkt",4,"",0,0,0,false,false,"",false],
  ["06_bedeckt","Bedeckt",5,"",0,0,0,false,false,"",false],
  ["07_klare_nacht","Klare Nacht",0,"moon",0,0,0,false,false,"",false],
  ["08_nachts_leicht_bewoelkt","Leicht bewölkt (Nacht)",1,"moon",0,0,0,false,false,"",false],
  ["09_nachts_wolkig","Wolkig (Nacht)",3,"moon",0,0,0,false,false,"",false],
  ["10_nachts_bedeckt","Bedeckt (Nacht)",5,"",0,0,0,false,false,"",false],
  ["11_regen_1","Einzelne Tropfen",1,"",1,0,1,false,false,"",false],
  ["12_regen_2","Leichter Regen",2,"",2,0,2,false,false,"",false],
  ["13_regen_3","Mäßiger Regen",3,"",3,0,3,false,false,"",false],
  ["14_regen_4","Starker Regen",4,"",4,0,4,false,false,"",false],
  ["15_regen_5","Ergiebiger Regen",5,"",5,0,5,false,false,"",false],
  ["16_schauer_1","Leichter Schauer",1,"sun",2,0,1,false,false,"",false],
  ["17_schauer_2","Mäßiger Schauer",3,"sun",3,0,3,false,false,"",false],
  ["18_schauer_3","Kräftiger Schauer",4,"sun",4,0,4,false,false,"",false],
  ["19_schauer_nacht","Regenschauer (Nacht)",3,"moon",2,0,3,false,false,"",false],
  ["20_schnee_1","Einzelne Flocken",1,"",0,1,0,false,false,"",false],
  ["21_schnee_2","Leichter Schneefall",2,"",0,2,0,false,false,"",false],
  ["22_schnee_3","Mäßiger Schneefall",3,"",0,3,0,false,false,"",false],
  ["23_schnee_4","Starker Schneefall",4,"",0,4,0,false,false,"",false],
  ["24_schnee_5","Ergiebiger Schneefall",5,"",0,5,0,false,false,"",false],
  ["25_schneeschauer_1","Leichter Schneeschauer",1,"sun",0,2,0,false,false,"",false],
  ["26_schneeschauer_2","Kräftiger Schneeschauer",4,"sun",0,3,0,false,false,"",false],
  ["27_schneeschauer_nacht","Schneeschauer (Nacht)",3,"moon",0,2,0,false,false,"",false],
  ["28_schneeregen_1","Leichter Schneeregen",2,"",1,1,2,false,false,"",false],
  ["29_schneeregen_2","Mäßiger Schneeregen",3,"",2,2,3,false,false,"",false],
  ["30_schneeregen_3","Starker Schneeregen",5,"",3,3,4,false,false,"",false],
  ["33_gefrierender_regen","Gefrierender Regen",4,"",2,0,4,false,false,"",true],
  ["34_nur_gewitter","Gewitter",3,"",0,0,0,true,false,"",false],
  ["35_gewitterregen","Gewitter mit Regen",4,"",2,0,4,true,false,"",false],
  ["36_starkes_gewitter","Starkes Gewitter",5,"",4,0,5,true,false,"",false],
  ["37_sturm_symbol","Sturm-Zusatzsymbol",0,"",0,0,0,false,true,"",false],
  ["38_regen_sturm","Regen + Sturm",4,"",3,0,4,false,true,"",false],
  ["39_schnee_sturm","Schnee + Sturm",5,"",0,3,0,false,true,"",false],
  ["40_gewitter_sturm","Gewitter + Sturm",5,"",2,0,5,true,true,"",false],
  ["41_dunst","Dunst",1,"",0,0,0,false,false,"M26 74 H74",false],
  ["42_leichter_nebel","Leichter Nebel",2,"",0,0,0,false,false,"M23 68 H67 M32 80 H80",false],
  ["43_nebel","Nebel",3,"",0,0,0,false,false,"M20 65 H80 M27 75 H76 M31 85 H85",false],
  ["44_dichter_nebel","Dichter Nebel",4,"",0,0,0,false,false,"M18 63 H82 M24 71 H76 M20 79 H80 M29 87 H87",false],
  ["45_sonne_nebel","Sonne + Nebel",1,"sun",0,0,0,false,false,"M23 68 H67 M32 80 H80",false],
  ["46_mond_nebel","Mond + Nebel",2,"moon",0,0,0,false,false,"M23 68 H67 M32 80 H80",false],
  ["47_hochnebel","Hochnebel",4,"",0,0,0,false,false,"M21 70 H80 M29 81 H72",false],
  ["48_nebel_regen","Nebel + Regen",3,"",2,0,3,false,false,"M17 62 H81 M27 71 H73",false],
  ["49_nebel_schnee","Nebel + Schnee",3,"",0,2,0,false,false,"M17 62 H81 M27 71 H73",false],
  ["50_schneegewitter","Schneegewitter",4,"",0,2,0,true,false,"",false],
  ["51_schneegewitter_kraeftig","Kräftiges Schneegewitter",5,"",0,4,0,true,false,"",false],
  ["52_schneegewitter_nacht","Schneegewitter (Nacht)",4,"moon",0,2,0,true,false,"",false],
  ["53_schneegewitter_schauer","Schneegewitter-Schauer",3,"sun",0,2,0,true,false,"",false],
  ["54_gewitterregenschauer_tag","Gewitterschauer (Tag)",3,"sun",2,0,3,true,false,"",false],
  ["55_gewitterregenschauer_nacht","Gewitterschauer (Nacht)",4,"moon",2,0,4,true,false,"",false],
  ["56_gewitter_nacht","Gewitter (Nacht)",4,"moon",0,0,0,true,false,"",false],
  ["57_gewitter_schneeregen","Gewitter mit Schneeregen",4,"",1,1,3,true,false,"",false],
  ["58_schneeregenschauer_tag","Schneeregenschauer (Tag)",2,"sun",1,1,2,false,false,"",false],
  ["59_schneeregenschauer_nacht","Schneeregenschauer (Nacht)",3,"moon",2,2,3,false,false,"",false],
  ["60_nebel_aufloesend","Auflösender Nebel",1,"sun",0,0,0,false,false,"M26 74 H74",false],
  ["61_sonne_dichter_nebel","Sonne mit dichtem Nebel",3,"sun",0,0,0,false,false,"M18 63 H82 M24 71 H76 M20 79 H80 M29 87 H87",false],
  ["62_nebel_niesel","Nebel mit Nieselregen",3,"",1,0,2,false,false,"M24 65 H78 M33 75 H70",false],
  ["63_nebel_schnee_nacht","Nebel und Schnee (Nacht)",3,"moon",0,2,0,false,false,"M17 62 H81 M27 71 H73",false],
  ["64_schneefall_nacht","Schneefall (Nacht)",3,"moon",0,2,0,false,false,"",false],
  ["65_regen_nacht","Regen (Nacht)",3,"moon",2,0,3,false,false,"",false],
  ["66_gefrierender_nebel","Gefrierender Nebel",3,"",0,1,0,false,false,"M20 65 H80 M27 75 H76 M31 85 H85",false],
  ["67_schneegewitter_sturm","Schneegewitter + Sturm",5,"",0,2,0,true,true,"",false],
  ["68_schneeregen_sturm","Schneeregen + Sturm",4,"",2,2,3,false,true,"",false]
 ];
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cloud=(grade,centered)=>`<path class="wx-cloud" fill="var(--wx-cloud-${grade})" stroke="var(--wx-cloud-edge)" stroke-width="2.8" stroke-linejoin="round" transform="translate(0 ${centered?14:0})" d="M22 53C11 53 6 46 6 38C6 28 14 22 24 22C29 11 39 7 49 9C62 10 69 19 71 26C83 23 94 31 94 40C94 48 87 53 78 53Z"/>`;
 function sun(small){
  const x=small?72:50,y=small?26:50,r=small?13:24,reach=small?23:40;
  return `<g fill="var(--wx-sun)" stroke="var(--wx-sun-edge)" stroke-width="2.2" stroke-linecap="round"><circle cx="${x}" cy="${y}" r="${r}"/><path fill="none" stroke="var(--wx-sun-ray)" stroke-width="${small?3.6:5}" d="${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return 'M'+(x+(r+5)*Math.cos(a)).toFixed(1)+' '+(y+(r+5)*Math.sin(a)).toFixed(1)+'L'+(x+reach*Math.cos(a)).toFixed(1)+' '+(y+reach*Math.sin(a)).toFixed(1)}).join(' ')}"/></g>`;
 }
 const moon=small=>`<path fill="var(--wx-moon)" stroke="var(--wx-sun-edge)" stroke-width="${small?1.6:2.7}" transform="translate(${small?'58 4':'23 20'}) scale(${small?1.35:2.5})" d="M24 17A13 13 0 1 1 12 3A11 11 0 0 0 24 17Z"/>`;
 // A closed, upright teardrop and a six-armed crystal use separate silhouettes
 // as well as distinct rain-blue and ice-blue tones. No whole-image filters.
 function drop(x,y,r,grade){
  const d=`M${x} ${y-r} C${x-r*.48} ${y-r*.24} ${x-r*.7} ${y+r*.1} ${x-r*.7} ${y+r*.38} A${r*.7} ${r*.7} 0 0 0 ${x+r*.7} ${y+r*.38} C${x+r*.7} ${y+r*.1} ${x+r*.48} ${y-r*.24} ${x} ${y-r} Z`;
  return `<path class="wx-drop" fill="var(--wx-rain-${grade})" d="${d}"/>`;
 }
 function snow(x,y,r,grade){
  // Six open arms with outward-facing forks, readable at small phone sizes.
  const n=v=>v.toFixed(2),axes=[],branches=[];
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3-Math.PI/2,u=Math.cos(a),v=Math.sin(a),p=-v,q=u;
   axes.push(`M${n(x)} ${n(y)}L${n(x+u*r)} ${n(y+v*r)}`);
   for(const sign of [-1,1])branches.push(`M${n(x+u*r*.48)} ${n(y+v*r*.48)}L${n(x+u*r*.75+sign*p*r*.30)} ${n(y+v*r*.75+sign*q*r*.30)}`);
  }
  const stroke=r>=14?2.8:r>=10?2.3:1.8;
  return `<g class="wx-flake" stroke="var(--wx-snow-${grade})" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${axes.join(' ')}" stroke-width="${stroke}"/><path d="${branches.join(' ')}" stroke-width="${stroke*.85}"/></g>`;
 }
 const bolt=x=>`<path class="wx-bolt" fill="var(--wx-bolt)" stroke="var(--wx-sun-edge)" stroke-width="2.1" stroke-linejoin="round" transform="translate(${x-50} 0)" d="M48 56H65L54 71H66L37 94L46 76H34Z"/>`;
 const windsock=standalone=>`<g class="wx-windsock" transform="${standalone?'translate(18 12) scale(2.2)':'translate(70 0) scale(1.1)'}"><path d="M4 8V34" stroke="var(--wx-fog)" stroke-width="2.6" stroke-linecap="round"/><path d="M5 9L25 14L20 23L5 18Z" fill="var(--wx-wind)" stroke="var(--wx-wind-edge)" stroke-width="1.2"/><path d="M11 11L16 12L12 20L8 19ZM20 13L24 14L20 22L16 21Z" fill="#fff"/></g>`;
 function layout(n,left,right,y,twoRows){
  const row=(count,cy)=>Array.from({length:count},(_,i)=>[left+(right-left)*(i+.5)/count,cy]);
  return twoRows?row(Math.ceil(n/2),65).concat(row(Math.floor(n/2),85)):row(n,y);
 }
 function artwork([key,label,grade,body,rain,flakes,rainGrade,thunder,wind,fog,ice]){
  const count=rain+flakes,centered=!body&&!count&&!thunder&&!wind&&!fog;
  let out=body==='sun'?sun(!!grade):body==='moon'?moon(!!grade):'';
  if(grade)out+=cloud(grade,centered);
  if(fog){
   const paths=key==='66_gefrierender_nebel'?'M17 63H71 M24 74H68 M28 85H80':count?'M17 60H83 M27 70H73':fog;
   out+=`<path class="wx-fog" d="${paths}" fill="none" stroke="var(--wx-fog)" stroke-width="4.3" stroke-linecap="round"/>`;
  }
  const kinds=[];
  for(let i=0;i<Math.max(rain,flakes);i++){if(i<rain)kinds.push('rain');if(i<flakes)kinds.push('snow')}
  const twoRows=count>4||thunder&&count>2;
  const left=thunder?42:8,right=94,y=fog?85:ice?65:76;
  const positions=layout(count,left,right,y,twoRows);
  // Blue raindrops flank the warning triangle; freezing rain is still rain.
  if(ice){positions[0]=[25,65];positions[1]=[75,65]}
  if(key==='66_gefrierender_nebel')positions[0]=[86,66];
  const r=fog?7.4:twoRows?8:thunder?8.8:count<=2?11.5:count===3?10:8.7;
  const flakeR=fog?r:twoRows?8.2:thunder?r:count===1?18:count===2?15:count===3?12:9.2;
  kinds.forEach((kind,i)=>{
   const [x,cy]=positions[i];
   out+=kind==='rain'?drop(x,cy,r,rainGrade):snow(x,cy,flakeR,Math.max(1,Math.min(5,grade)));
  });
  if(thunder)out+=bolt(count?25:50);
  if(ice)out+='<g class="wx-ice-warning"><path d="M50 66L68 96H32Z" fill="#ffca47" stroke="#8d4100" stroke-width="2.8" stroke-linejoin="round"/><path d="M50 78V86" stroke="#392100" stroke-width="4.5" stroke-linecap="round"/><circle cx="50" cy="91" r="2.5" fill="#392100"/></g>';
  if(wind)out+=windsock(!grade);
  return out;
 }
 const icons=Object.fromEntries(recipes.map(recipe=>[recipe[0],{label:recipe[1],svg:artwork(recipe)}]));
 function render(key,label='',tooltip=''){
  const icon=icons[key];
  if(!icon)return '';
  const name=escape(label||icon.label),title=escape(tooltip||label||icon.label);
  return `<svg class="weather-symbol" viewBox="0 0 100 100" role="img" aria-label="${name}" data-weather-icon="${key}" xmlns="http://www.w3.org/2000/svg"><title>${title}</title>${icon.svg}</svg>`;
 }
 root.WeatherIcons=Object.freeze({render,keys:Object.freeze(Object.keys(icons))});
})(globalThis);

