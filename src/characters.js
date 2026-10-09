/** Original, self-contained SVG illustrations; no third-party character IP or asset requests. */
import { escapeXML } from './utils.js';

const people = {
  noah: {skin:'#F5C6A9',shadow:'#EFAE91',hair:'#27243C',hoodie:'#363449',hoodie2:'#534C76',fringe:'wavy',accessory:'laptop',eyes:'#2A2536'},
  ivy: {skin:'#EFC8A5',shadow:'#DDA37C',hair:'#624134',hoodie:'#F7B87E',hoodie2:'#E6906F',fringe:'swept',accessory:'cap',eyes:'#3A2A2C'},
  kai: {skin:'#EBC09D',shadow:'#D6A184',hair:'#272638',hoodie:'#8078DF',hoodie2:'#A7A0F4',fringe:'short',accessory:'glasses',eyes:'#302639'},
  mira: {skin:'#F2C7B1',shadow:'#DC9D89',hair:'#A65B85',hoodie:'#F7B2C6',hoodie2:'#F28BAC',fringe:'bob',accessory:'headphones',eyes:'#4A2D47'},
  leo: {skin:'#E6B59C',shadow:'#CF937F',hair:'#3F313B',hoodie:'#42628B',hoodie2:'#678DB4',fringe:'swept',accessory:'beanie',eyes:'#352934'}
};

function hairBack(person) {
  if(person.fringe==='bob') return `<path d="M107 173C90 82 132 52 200 55c82-4 114 54 103 141l-12 85-27-10-5-89H135l-9 87-26 9Z" fill="${person.hair}"/>`;
  return `<path d="M113 171C98 102 130 65 174 63c40-21 104 0 117 65l-10 83-28-8-115 7Z" fill="${person.hair}"/>`;
}
function hairFront(person) {
  if(person.fringe==='wavy') return `<path d="M120 166c-13-46-2-73 20-81 8-37 42-42 63-35 22-18 48-3 53 13 34-10 55 21 46 47-15-5-25-13-30-24-7 21-28 26-47 21-16 23-37 27-56 19-4 28-18 40-49 40Z" fill="${person.hair}"/><path d="M160 93c-4-24 9-43 33-46m30 14c10-22 33-24 47-9" fill="none" stroke="${person.hair}" stroke-width="17" stroke-linecap="round"/>`;
  if(person.fringe==='swept') return `<path d="M121 159c-13-50 3-83 34-92 22-24 77-25 113 5 24 15 28 36 27 63-32 2-40-21-51-40-20 29-55 43-123 64Z" fill="${person.hair}"/><path d="M152 85c32-24 68-25 94 1" stroke="#FFFFFF" stroke-opacity=".12" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  if(person.fringe==='short') return `<path d="M115 155c-7-48 5-81 49-94 46-15 103 6 127 58l-4 24-29-31-11 18-17-22-21 19-18-21-22 21-22-12Z" fill="${person.hair}"/>`;
  return `<path d="M116 173c-9-59 14-103 60-117 55-17 98 18 116 69l-6 62-27-59-34 13-34-14-37 26-13 36Z" fill="${person.hair}"/>`;
}
function accessories(person) {
  if (person.accessory==='laptop') return `<g transform="translate(10 0)"><path d="M109 308l172-11 15 81H123Z" fill="#BDB1CE" stroke="#877A9A" stroke-width="4"/><path d="M105 374h197v9H105Z" fill="#8A7F9D"/><circle cx="205" cy="337" r="11" fill="#F7EDFF"/><circle cx="205" cy="337" r="5" fill="#BDB1CE"/></g>`;
  if (person.accessory==='glasses') return `<g fill="none" stroke="#303048" stroke-width="7" stroke-linecap="round"><rect x="146" y="171" width="51" height="33" rx="13"/><rect x="211" y="171" width="51" height="33" rx="13"/><path d="M197 183h14m-66-2-20-7m139 7 20-8"/></g>`;
  if (person.accessory==='headphones') return `<g><path d="M119 194v-53c0-62 30-94 82-94s83 36 83 96v50" fill="none" stroke="#57436B" stroke-width="16"/><rect x="108" y="169" width="27" height="75" rx="13" fill="#A18EE1" stroke="#57436B" stroke-width="5"/><rect x="270" y="169" width="27" height="75" rx="13" fill="#A18EE1" stroke="#57436B" stroke-width="5"/></g>`;
  if (person.accessory==='cap') return `<g><path d="M131 126c1-66 46-84 100-76 37 3 61 32 62 73-57-9-103-9-162 3Z" fill="#F1AA67"/><path d="M110 127c59-30 139-22 190-6 6 12-1 21-12 20-58-9-118-11-168 4-14 2-20-10-10-18Z" fill="#D8895B"/><circle cx="216" cy="82" r="9" fill="#FFE2B3"/></g>`;
  if (person.accessory==='beanie') return `<g><path d="M131 131c-1-58 29-89 79-89 49 0 82 36 79 87Z" fill="#385B7B"/><rect x="126" y="116" width="167" height="37" rx="16" fill="#698BA8"/><path d="M164 65c12-7 24-11 38-11" fill="none" stroke="#9CB3C9" stroke-width="6" stroke-linecap="round"/></g>`;
  return '';
}

function human(id) {
 const p = people[id];
 return `<g>
  <ellipse cx="201" cy="360" rx="145" ry="20" fill="#302949" opacity=".13"/>
  <path d="M71 379c5-81 48-122 106-127l54-1c64 5 109 48 112 128Z" fill="${p.hoodie}"/>
  <path d="M118 297c18 28 51 45 85 45 41 0 77-20 96-46l19 84H95Z" fill="${p.hoodie2}" opacity=".65"/>
  <path d="M179 254v42c8 22 31 28 49 0v-42" fill="${p.shadow}"/>
  ${hairBack(p)}
  <ellipse cx="124" cy="191" rx="19" ry="27" fill="${p.skin}"/>
  <ellipse cx="279" cy="191" rx="19" ry="27" fill="${p.skin}"/>
  <path d="M124 165c0-55 24-89 78-92 53-3 80 38 80 96v43c0 54-35 95-81 95-46 0-77-36-77-95Z" fill="${p.skin}"/>
  <path d="M129 216c10 43 34 71 70 75" stroke="#FFFFFF" stroke-opacity=".17" stroke-width="12" stroke-linecap="round" fill="none"/>
  <ellipse cx="151" cy="225" rx="16" ry="9" fill="#E88E92" opacity=".35"/>
  <ellipse cx="253" cy="225" rx="16" ry="9" fill="#E88E92" opacity=".35"/>
  <path d="M158 176c7-6 18-7 28-3m38 0c9-5 20-4 28 3" stroke="${p.hair}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <ellipse cx="175" cy="190" rx="6.5" ry="8.5" fill="${p.eyes}"/><ellipse cx="231" cy="190" rx="6.5" ry="8.5" fill="${p.eyes}"/>
  <circle cx="177" cy="187" r="2" fill="white"/><circle cx="233" cy="187" r="2" fill="white"/>
  <path d="M201 203l-4 12 6 2" stroke="${p.shadow}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M190 242q12 11 26 0" stroke="#AB686D" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${hairFront(p)}
  <path d="M175 279l-17 28 37 24 10-22m30-30 17 28-34 24-12-22" fill="${p.hoodie}" stroke="${p.hoodie2}" stroke-width="4"/>
  <path d="M182 321l-3 32m46-32 3 32" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
  ${accessories(p)}
 </g>`;
}

function cat() {
 return `<g>
  <ellipse cx="201" cy="362" rx="131" ry="17" fill="#28233D" opacity=".14"/>
  <path d="M102 379c5-80 37-116 99-119 64-3 100 42 102 119Z" fill="#34304C"/>
  <path d="M109 182 97 76q-2-20 18-9l66 48 44-4 65-47q16-12 15 10l-9 118c16 88-29 131-95 132-66 0-115-51-92-142Z" fill="#27263B"/>
  <path d="M123 102l7 55 41-31Z" fill="#D18BBA"/><path d="M277 101l-8 55-40-30Z" fill="#D18BBA"/>
  <path d="M149 193c17-13 34-7 43 4m20 0c15-15 33-15 45-4" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".18" stroke-linecap="round"/>
  <ellipse cx="162" cy="210" rx="14" ry="17" fill="#E8E19E"/><ellipse cx="244" cy="210" rx="14" ry="17" fill="#E8E19E"/>
  <ellipse cx="165" cy="212" rx="6" ry="14" fill="#2A2D2C"/><ellipse cx="241" cy="212" rx="6" ry="14" fill="#2A2D2C"/>
  <path d="M194 239q9-7 18 0l-9 9Z" fill="#E5A1B7"/><path d="M203 249q-10 12-22 0m22 0q12 12 23 0" stroke="#DDC6D3" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="m147 247-39-8m38 15-43 6m159-13 39-8m-38 15 43 6" stroke="#D1C5D5" stroke-width="3" opacity=".65" stroke-linecap="round"/>
  <path d="M139 316c-12 9-17 32-11 46m146-46c13 10 19 34 11 47" stroke="#75718F" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M283 326c43-26 76-6 64 31" stroke="#27263B" stroke-width="19" fill="none" stroke-linecap="round"/>
 </g>`;
}

function robot() {
 return `<g>
  <ellipse cx="201" cy="363" rx="128" ry="16" fill="#343255" opacity=".12"/>
  <path d="M88 377c3-62 39-102 111-102 70 0 107 37 112 102Z" fill="#8585C9"/><path d="M140 282c28 37 91 40 122 1" fill="none" stroke="#B9B7ED" stroke-width="14" stroke-linecap="round"/>
  <path d="M199 91V66" stroke="#595783" stroke-width="12" stroke-linecap="round"/><circle cx="199" cy="54" r="16" fill="#FF9DAA"/>
  <rect x="94" y="100" width="213" height="182" rx="65" fill="#DDE5FF" stroke="#57547F" stroke-width="11"/>
  <rect x="117" y="135" width="166" height="112" rx="39" fill="#55557F"/>
  <rect x="83" y="172" width="23" height="59" rx="11" fill="#A9ACD8"/><rect x="294" y="172" width="23" height="59" rx="11" fill="#A9ACD8"/>
  <ellipse cx="165" cy="184" rx="15" ry="22" fill="#A3F2EF"/><ellipse cx="235" cy="184" rx="15" ry="22" fill="#A3F2EF"/>
  <path d="M174 217q26 22 53 0" stroke="#F9A8CA" stroke-width="7" fill="none" stroke-linecap="round"/>
  <circle cx="199" cy="321" r="11" fill="#FAE7A2"/><path d="M153 354h91" stroke="#C7C7F5" stroke-width="7" stroke-linecap="round"/>
 </g>`;
}

export function characterArtwork(id='noah') {
 if (id==='pixel') return cat();
 if (id==='byte') return robot();
 return human(id in people ? id : 'noah');
}

export function characterSVG(id, {x=0,y=0,width=400,height=380,ariaLabel=''}={}) {
 return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg" ${ariaLabel?`role="img" aria-label="${escapeXML(ariaLabel)}"`:'aria-hidden="true"'}>${characterArtwork(id)}</svg>`;
}
