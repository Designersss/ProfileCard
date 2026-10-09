/** Original modular vector avatar: every facial feature is controlled by the user's state. */
import { createDefaultCharacter, sanitizeCharacter } from './utils.js';

function shade(hex, amount) {
  const c=hex.slice(1);return '#'+[0,2,4].map(i=>Math.max(0,Math.min(255,parseInt(c.slice(i,i+2),16)+amount)).toString(16).padStart(2,'0')).join('');
}
function backHair(p){const c=p.hairColor;
  if(p.hair==='long'||p.hair==='bob')return `<path d="M110 205Q86 52 196 59Q315 51 295 218L308 330Q272 344 250 310L153 308Q120 338 96 320Z" fill="${c}"/>`;
  if(p.hair==='tied')return `<path d="M119 162Q93 89 166 66Q255 25 295 121L285 212L259 179L142 182Z" fill="${c}"/><path d="M282 111Q332 97 326 183Q330 217 295 228Q306 167 278 152Z" fill="${c}"/>`;
  return `<path d="M110 192Q89 65 190 58Q308 47 293 198L267 158H144Z" fill="${c}"/>`;
}
function frontHair(p){const c=p.hairColor,light=shade(c,20);
  switch(p.hair){
    case 'messy':return `<path d="M118 160L113 97 153 114 164 65 191 100 225 64 242 105 295 94 279 154Q246 126 225 156Q190 127 173 158Q140 129 118 160Z" fill="${c}"/><path d="M161 103L176 135M236 108L218 138" stroke="${light}" opacity=".5" stroke-width="8" stroke-linecap="round"/>`;
    case 'curtain':return `<path d="M112 176Q101 82 185 69L201 123Q175 158 133 183Z" fill="${c}"/><path d="M209 78Q304 70 286 183L248 177Q218 144 201 123Z" fill="${c}"/><path d="M199 99Q192 144 175 161" fill="none" stroke="${light}" stroke-width="5" opacity=".4"/>`;
    case 'crop':return `<path d="M119 155Q115 82 187 77Q271 70 283 148Q225 133 189 146Q153 134 119 155Z" fill="${c}"/><path d="M130 123L275 116" stroke="${light}" stroke-width="7" opacity=".3"/>`;
    case 'bob':return `<path d="M115 158Q100 79 190 70Q288 62 291 164L273 240L253 199L264 156Q225 177 186 135Q161 168 129 172L139 219L116 239Z" fill="${c}"/>`;
    case 'long':return `<path d="M115 172Q95 75 188 63Q283 60 294 180Q280 160 264 162Q212 164 196 124Q153 166 122 175Z" fill="${c}"/><path d="M125 175Q120 255 114 304M278 176Q287 261 297 304" stroke="${light}" stroke-width="6" opacity=".35"/>`;
    case 'tied':return `<path d="M114 169Q91 67 194 67Q269 58 288 151Q241 170 194 114Q155 154 115 169Z" fill="${c}"/>`;
    case 'undercut':return `<path d="M135 150Q116 92 178 70Q260 55 283 112Q269 145 237 123Q182 111 135 150Z" fill="${c}"/><path d="M123 146L161 123" stroke="${light}" opacity=".5" stroke-width="7"/>`;
    default:return `<path d="M129 145Q134 85 200 83Q265 82 272 150Q210 122 129 145Z" fill="${c}"/>`;
  }
}
function facePath(face){return {
  oval:'M200 89C144 89 122 136 124 214C125 272 156 313 201 313C247 312 276 271 278 211C280 132 253 89 200 89Z',
  round:'M199 95C137 95 115 143 120 214C123 272 150 303 200 305C251 305 280 273 282 214C287 143 264 95 199 95Z',
  angular:'M198 93C145 93 120 131 122 211L138 264L173 301Q200 324 229 302L264 266L278 210C280 129 254 93 198 93Z',
  long:'M198 83C151 83 125 122 126 215C126 287 162 325 199 327C237 326 273 287 273 214C276 121 252 83 198 83Z',
  'soft-square':'M160 94Q117 104 119 155L119 255Q122 299 165 309L236 310Q281 295 282 254L281 154Q282 103 241 94Z'
 }[face];}
function eyeSVG(p,blink){const c=p.eyeColor;
  const baseline=202;
  function one(x){switch(p.eyes){
    case 'closed':return `<path d="M${x-17} ${baseline}q17 12 34 0" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'sharp':return `<path d="M${x-20} ${baseline-8}q19-10 39 0" stroke="${c}" stroke-width="6" fill="none"/><ellipse cx="${x}" cy="${baseline+3}" rx="7" ry="${blink?1:10}" fill="${c}"/>`;
    case 'relaxed':return `<path d="M${x-17} ${baseline-2}q17 10 34 0" stroke="${c}" stroke-width="6" fill="none"/>${blink?'':`<ellipse cx="${x}" cy="${baseline+4}" rx="5" ry="5" fill="${c}"/>`}`;
    case 'sleepy':return `<path d="M${x-18} ${baseline-3}q16-3 36 0" stroke="${c}" stroke-width="7" fill="none"/><ellipse cx="${x}" cy="${baseline+6}" rx="7" ry="${blink?1:5}" fill="${c}"/>`;
    case 'wide':return `<ellipse cx="${x}" cy="${baseline}" rx="16" ry="${blink?1:19}" fill="#FFFFFF"/><ellipse cx="${x}" cy="${baseline+1}" rx="9" ry="${blink?1:12}" fill="${c}"/>`;
    default:return `<ellipse cx="${x}" cy="${baseline}" rx="10" ry="${blink?1:13}" fill="${c}"/><circle cx="${x+3}" cy="${baseline-4}" r="3.2" fill="#FFFFFF"/>`;
  }}return `<g class="avatar-eyes">${one(164)}${one(236)}</g>`;
}
function brows(p){const color=p.hairColor;
 const paths={natural:'m145 170q15-8 33-2m44-2q17-8 33 2',straight:'m145 169h34m43 0h34',sharp:'m145 176 33-12m44 0 33 12',arched:'m144 172q15-18 35-4m43 0q18-14 34 4'};
 return `<path d="${paths[p.brows]}" stroke="${color}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
}
function mouth(p){const c='#833F4C';return {
 neutral:`<path d="M187 265q13 3 26 0" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`,
 smirk:`<path d="M186 262q19 17 35-4" stroke="${c}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`,
 smile:`<path d="M178 256q22 32 45 0" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`,
 serious:`<path d="M184 262h32" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`,
 grin:`<path d="M178 251q22 28 46 0Z" fill="#FFFFFF" stroke="${c}" stroke-width="4"/>`,
 open:`<ellipse cx="200" cy="263" rx="13" ry="15" fill="${c}"/><path d="M192 271q8-5 16 0" stroke="#EE8696" stroke-width="5"/>`
 }[p.mouth];}
function outfit(p){const c=p.outfitColor,shine=shade(c,28),dark=shade(c,-32);
 const base=`<path d="M55 380Q54 310 118 295L166 274L200 317L231 274L283 295Q348 311 348 380Z" fill="${c}"/><path d="M158 281L197 334 238 283" stroke="${shine}" stroke-width="6" fill="none" opacity=".8"/>`;
 switch(p.outfit){
 case 'hoodie':return `${base}<path d="M164 276Q139 283 133 326L182 359M233 275Q260 286 267 326L219 359" fill="none" stroke="${dark}" stroke-width="15" stroke-linecap="round"/><path d="M183 326v42m34-42v42" stroke="#FFFFFF" opacity=".65" stroke-width="4" stroke-linecap="round"/>`;
 case 'jacket':return `${base}<path d="M164 280L194 332L174 382H94L142 289Zm73 0-33 53 20 49h77l-45-91Z" fill="${dark}"/><path d="M197 329v52" stroke="${shine}" stroke-width="6"/>`;
 case 'bomber':return `${base}<path d="M132 292Q107 336 112 377M265 290q31 46 20 87" stroke="${dark}" stroke-width="18" fill="none"/><path d="M145 369h108" stroke="${shine}" stroke-width="8"/>`;
 case 'turtleneck':return `${base}<rect x="167" y="276" width="66" height="59" rx="12" fill="${c}"/><path d="M175 295h49M175 309h49" stroke="${shine}" stroke-width="3" opacity=".6"/>`;
 case 'shirt':return `${base}<path d="M163 282L199 322L180 344L145 291m91-9-37 40 19 22 34-53" fill="#E6E8EE"/><path d="M200 322v60" stroke="${dark}" stroke-width="4"/>`;
 default:return `${base}<path d="M165 289L199 323L234 289" stroke="${shine}" stroke-width="5" fill="none"/>`;
 }
}
function accessory(p){const c=p.hairColor;
 switch(p.accessory){
 case 'glasses':return `<g stroke="#26293E" stroke-width="6" fill="none"><rect x="133" y="185" width="58" height="39" rx="12"/><rect x="209" y="185" width="58" height="39" rx="12"/><path d="M191 197q10-9 18 0m-77 0-12-6m147 6 15-6"/></g>`;
 case 'headphones':return `<path d="M115 198v-51q0-89 85-89t85 89v51" fill="none" stroke="#34354B" stroke-width="15"/><rect x="103" y="178" width="22" height="68" rx="10" fill="#8F82E3"/><rect x="275" y="178" width="22" height="68" rx="10" fill="#8F82E3"/>`;
 case 'earrings':return `<circle cx="119" cy="241" r="8" stroke="#EDCF8F" stroke-width="5" fill="none"/><circle cx="281" cy="241" r="8" stroke="#EDCF8F" stroke-width="5" fill="none"/>`;
 case 'beanie':return `<path d="M116 154Q118 55 198 55Q282 56 283 154Z" fill="#45425E"/><rect x="111" y="142" width="176" height="29" rx="10" fill="#7066A0"/>`;
 case 'visor':return `<rect x="122" y="189" width="156" height="42" rx="19" fill="#242B40" opacity=".94"/><path d="M139 203h122" stroke="#7CEBFF" stroke-opacity=".7" stroke-width="4"/>`;
 case 'chain':return `<path d="M157 307Q201 366 246 307" fill="none" stroke="#EDCF8F" stroke-width="5"/><circle cx="201" cy="353" r="8" fill="#EDCF8F"/>`;
 case 'mask':return `<path d="M145 242Q197 221 255 242L247 287Q200 309 151 287Z" fill="#373E55"/><path d="M145 244L119 234m136 10 28-10" stroke="#9AA9BB" stroke-width="4"/>`;
 default:return '';
 }
}
export function characterArtwork(avatar, {time=0, animated=true}={}){
 const p=sanitizeCharacter(avatar);
 const blink=animated?false:((time%3.2)>2.36&&(time%3.2)<2.49);
 const skinShadow=shade(p.skin,-22);
 const motion=animated?0:Math.sin(time*Math.PI*2/3.2)*3;
 return `<g transform="translate(0 ${motion.toFixed(2)})">
 <ellipse cx="201" cy="376" rx="131" ry="12" opacity=".1" fill="#090917"/>
 ${backHair(p)}
 ${outfit(p)}
 <path d="M181 281v34q20 15 38 0v-34" fill="${skinShadow}"/>
 <ellipse cx="122" cy="208" rx="15" ry="26" fill="${p.skin}"/><ellipse cx="279" cy="208" rx="15" ry="26" fill="${p.skin}"/>
 <path d="${facePath(p.face)}" fill="${p.skin}" stroke="${shade(p.skin,-12)}" stroke-width="2"/>
 <path d="M141 241q12 8 25 0m69 0q14 8 26-1" stroke="${shade(p.skin,-12)}" opacity=".25" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M201 216l-6 17q5 6 11 0" stroke="${skinShadow}" stroke-width="3" fill="none" stroke-linecap="round"/>
 ${brows(p)}${eyeSVG(p,blink)}${mouth(p)}${frontHair(p)}${accessory(p)}
 </g>`;
}
export function characterSVG(avatar, {x=0,y=0,width=400,height=380,time=0,animated=true}={}){
 return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 400 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${characterArtwork(avatar,{time,animated})}</svg>`;
}
export const previewCharacter = () => characterSVG(createDefaultCharacter());
