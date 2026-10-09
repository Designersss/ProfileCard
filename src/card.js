import { contrastColor, escapeXML, FORMATS, normalizeHex, wrapText } from './utils.js';
import { characterSVG } from './characters.js';

function mix(a,b,ratio){
 const one=normalizeHex(a).slice(1), two=normalizeHex(b).slice(1);
 return '#' + [0,2,4].map(i=>Math.round(parseInt(one.slice(i,i+2),16)*(1-ratio)+parseInt(two.slice(i,i+2),16)*ratio).toString(16).padStart(2,'0')).join('');
}

function scenery(scene,sceneColor,accent,wide){
 const soft=mix(sceneColor,'#FFFFFF',.46);
 const light=mix(sceneColor,'#FFFFFF',.74);
 const dark=mix(sceneColor,accent,.26);
 const highlights=`<g fill="white" opacity=".85"><path d="M91 110v31m-15-16h31" stroke="white" stroke-width="8" stroke-linecap="round"/><path d="m606 139 6 17 18 6-18 6-6 18-7-18-17-6 17-6Z"/><circle cx="552" cy="256" r="5"/><circle cx="145" cy="272" r="4"/></g>`;
 const blob=`<path d="M0 124Q112-24 235 55T507 83Q617 18 720 120V0H0Z" fill="${light}" opacity=".43"/><path d="M-31 555Q97 433 217 520T470 516Q601 392 751 489V750H-31Z" fill="${dark}" opacity=".27"/>`;
 switch(scene){
 case 'clouds': return `${blob}<g fill="${light}" opacity=".72"><ellipse cx="124" cy="394" rx="158" ry="70"/><ellipse cx="261" cy="406" rx="148" ry="61"/><ellipse cx="617" cy="372" rx="170" ry="74"/><ellipse cx="482" cy="397" rx="111" ry="55"/></g>${highlights}`;
 case 'sunset': return `<circle cx="577" cy="190" r="112" fill="#FFF2C4" opacity=".72"/><path d="M0 489q119-153 255-8t265-49q88-97 200 20V720H0Z" fill="${light}" opacity=".55"/><path d="M0 561q119-85 250-13t239-26q129-75 231 14V720H0Z" fill="${dark}" opacity=".42"/>${highlights}`;
 case 'hills': return `<circle cx="540" cy="147" r="84" fill="#FFF7D9" opacity=".82"/><path d="M0 420q143-194 295-30t425-17v347H0Z" fill="${light}"/><path d="M0 540q183-170 353-22t367-22v224H0Z" fill="${mix(sceneColor,'#47A78F',.25)}" opacity=".7"/><path d="M0 621q151-105 343-13t377 0v112H0Z" fill="${dark}" opacity=".46"/>${highlights}`;
 case 'waves': return `<path d="M-20 0h760v140Q555 45 371 121T-20 118Z" fill="${light}" opacity=".8"/><path d="M-20 343Q134 246 309 325t431-4v180q-165 119-389 18T-20 548Z" fill="${soft}" opacity=".62"/><path d="M-20 552q180-150 364-24t396 4v188H-20Z" fill="${dark}" opacity=".42"/>${highlights}`;
 case 'stars': return `<circle cx="555" cy="148" r="100" fill="${mix(sceneColor,'#FFFFFF',.22)}" opacity=".6"/><path d="M0 540q140-100 280-40t440-35V720H0Z" fill="${dark}" opacity=".45"/><g fill="${light}"><circle cx="96" cy="93" r="4"/><circle cx="615" cy="323" r="6"/><circle cx="414" cy="63" r="4"/><circle cx="330" cy="206" r="3"/><path d="m128 237 9 22 22 9-22 9-9 22-9-22-22-9 22-9Z"/></g>${highlights}`;
 default: return `<path d="M0 0h720v245q-168-135-335-28T0 189Z" fill="${light}" opacity=".48"/><path d="M0 460q150-91 276-12t239-12q96-71 205 0v284H0Z" fill="${soft}" opacity=".67"/><path d="M-35 669q99-144 237-90t271-9q141-104 280 26v124H-35Z" fill="${dark}" opacity=".36"/><circle cx="583" cy="282" r="72" fill="${light}" opacity=".65"/>${highlights}`;
 }
}

function textNode(value,x,y,size,color,{weight=400,anchor='start',maxAllowedWidth=0}={}){
 const estimated=Array.from(String(value)).reduce((sum,char)=>sum+(/[^\u0000-\u00ff]/.test(char)?1.05:.59),0)*size;
 const extra=maxAllowedWidth && estimated>maxAllowedWidth?` textLength="${maxAllowedWidth}" lengthAdjust="spacingAndGlyphs"`:'';
 return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" font-family="Arial, Helvetica, sans-serif" fill="${color}" text-anchor="${anchor}"${extra}>${escapeXML(value)}</text>`;
}
function svgTags(tags,accent,ink,x,y,{wide=false}={}) {
 let start=x;
 return tags.slice(0,3).map(tag=>{
   const value=String(tag).slice(0,18);
   const width=Math.min(wide?174:176,Math.max(83,value.length*(wide?12:11)+36));
   const tagFill=mix(accent,'#FFFFFF',.78);
   const tagInk=contrastColor(tagFill);
   const out=`<rect x="${start}" y="${y}" width="${width}" height="${wide?45:37}" rx="${wide?23:19}" fill="${tagFill}"/>${textNode(value,start+width/2,y+(wide?29:25),wide?19:18,tagInk,{weight:600,anchor:'middle',maxAllowedWidth:width-22})}`;
   start+=width+12;
   return out;
 }).join('');
}

function photoSVG(data,x,y,w,h){
 if (!data?.startsWith('data:image/')) return '';
 return `<g><clipPath id="photoClip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="55"/></clipPath><rect x="${x-4}" y="${y-4}" width="${w+8}" height="${h+8}" rx="59" fill="white" opacity=".65"/><image href="${escapeXML(data)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/></g>`;
}

export function renderCardSVG(state,{animated=true}={}) {
 const wide=state.format==='wide';
 const {width:w,height:h}=FORMATS[state.format] || FORMATS.square;
 const scene=normalizeHex(state.sceneColor,'#D7CBFF');
 const card=normalizeHex(state.cardColor,'#FFFFFF');
 const accent=normalizeHex(state.accentColor,'#8064F4');
 const ink=contrastColor(card);
 const muted=mix(ink,card,.42);
 const name=(state.name||'Your name').trim();
 const username=(state.username||'username').replace(/^@+/, '').trim();
 const bio=(state.bio||'Your little corner of the internet.').trim();
 const bioLines=wrapText(bio,wide?36:46,2);
 const nameSize=wide?Math.max(35,64-Math.max(0,name.length-12)*2):Math.max(32,56-Math.max(0,name.length-11)*1.75);
 const gradientId='pcSceneGradient';
 const art=state.avatarMode==='upload' && state.photo ? photoSVG(state.photo,wide?70:148,wide?130:85,wide?425:422,wide?400:380)
   : `<g class="${animated?'float-person':''}">${characterSVG(state.character,{x:wide?60:135,y:wide?95:55,width:wide?500:455,height:wide?475:430})}</g>`;
 let cardContent;
 if (wide) {
  const bx=635,by=80,bw=515,bh=478;
  cardContent=`<g><rect x="${bx}" y="${by+9}" width="${bw}" height="${bh}" rx="42" fill="#322C70" opacity=".10"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="42" fill="${card}"/>
   <circle cx="1068" cy="152" r="30" fill="${mix(accent,card,.75)}"/><path d="m1062 152 6 11 14-19" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
   ${textNode(name,bx+45,207,nameSize,ink,{weight:800,maxAllowedWidth:wide?418:520})}
   ${textNode('@'+username,bx+45,259,28,muted,{weight:600,maxAllowedWidth:417})}
   ${bioLines.map((line,i)=>textNode(line,bx+45,322+i*36,27,muted,{maxAllowedWidth:415})).join('')}
   ${svgTags(state.tags,accent,ink,bx+45,455,{wide:true})}
   <path d="M${bx+45} 525h${bw-90}" stroke="${accent}" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>
   ${textNode('YOUR INTERNET SELF',bx+45,543,15,muted,{weight:700})}
   </g>`;
 } else {
  const bx=30,by=457,bw=660,bh=234;
  cardContent=`<g><rect x="${bx}" y="${by+9}" width="${bw}" height="${bh}" rx="40" fill="#322C70" opacity=".12"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="40" fill="${card}"/>
   ${textNode(name,69,526,nameSize,ink,{weight:800,maxAllowedWidth:wide?418:520})}
   ${textNode('@'+username,71,564,24,muted,{weight:600,maxAllowedWidth:535})}
   ${bioLines.map((line,i)=>textNode(line,71,603+i*29,22,muted,{maxAllowedWidth:527})).join('')}
   ${svgTags(state.tags,accent,ink,70,637)}
   <circle cx="627" cy="526" r="20" fill="${mix(accent,card,.77)}"/>
   <path d="m627 512 5 11 12 2-9 9 2 13-11-6-11 6 2-13-9-9 12-2Z" transform="translate(0,-4) scale(.98)" fill="${accent}"/>
   </g>`;
 }
 const sceneArtwork=`<g transform="scale(${(w/720).toFixed(5)} ${(h/720).toFixed(5)})">${scenery(state.scene,scene,accent,wide)}</g>`;
 const pill=wide?`<g><rect x="69" y="57" width="225" height="48" rx="24" fill="#FFFFFF" opacity=".9"/><circle cx="93" cy="81" r="7" fill="#3EBF9D"/>${textNode('ON THE INTERNET',111,87,18,'#343858',{weight:700})}</g>`:`<g><rect x="451" y="40" width="228" height="49" rx="25" fill="#FFFFFF" opacity=".9"/><circle cx="478" cy="64" r="7" fill="#3EBF9D"/>${textNode('ON THE INTERNET',496,70,17,'#343858',{weight:700})}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="ProfileCard for ${escapeXML(name)}" data-format="${state.format}">
  <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(scene,'#FFFFFF',.25)}"/><stop offset=".55" stop-color="${scene}"/><stop offset="1" stop-color="${mix(scene,accent,.21)}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#${gradientId})"/>
  ${sceneArtwork}
  <g class="${animated?'float-decor':''}" fill="${mix(accent,'#FFFFFF',.34)}" opacity=".75"><path d="m${wide?490:578} ${wide?80:126} 10 23 23 10-23 10-10 23-10-23-23-10 23-10Z"/></g>
  ${art}
  ${cardContent}
  ${pill}
 </svg>`;
}
