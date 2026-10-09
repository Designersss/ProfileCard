import { contrastColor, escapeXML, FORMATS, normalizeHex, wrapText } from './utils.js';

function mix(a, b, ratio) {
  const x = normalizeHex(a).slice(1), y = normalizeHex(b).slice(1);
  return '#' + [0, 2, 4].map(i => Math.round(parseInt(x.slice(i, i + 2), 16) * (1 - ratio) + parseInt(y.slice(i, i + 2), 16) * ratio).toString(16).padStart(2, '0')).join('');
}
function txt(value, x, y, size, color, {weight = 500, width = 0, spacing = 0} = {}) {
  const text = String(value);
  // Width protection is vital for variable Unicode names and export parity.
  const estimated = [...text].reduce((n, ch) => n + (/[^\u0000-\u00ff]/.test(ch) ? 1.05 : .61), 0) * size;
  const fit = width && estimated > width ? ` textLength="${width}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="${color}"${fit}>${escapeXML(text)}</text>`;
}
function graphics(scene, base, accent) {
  const glow = mix(base, accent, .47), mist = mix(base, '#FFFFFF', .17);
  const grid = `<g stroke="${mix(base, '#FFFFFF', .6)}" stroke-opacity=".16" stroke-width="1">${Array.from({length:13}, (_, i) => `<path d="M${i*60} 0V720M0 ${i*60}H720"/>`).join('')}</g>`;
  switch (scene) {
    case 'grid': return `${grid}<circle cx="388" cy="255" r="235" fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="3"/><circle cx="388" cy="255" r="177" fill="${glow}" opacity=".4"/>`;
    case 'halo': return `<circle cx="365" cy="260" r="240" fill="${glow}" opacity=".7"/><circle cx="365" cy="260" r="211" fill="none" stroke="${accent}" stroke-width="18" stroke-opacity=".56"/><circle cx="365" cy="260" r="275" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity=".4"/>`;
    case 'beam': return `<path d="M188-50H650L348 750H-115Z" fill="${accent}" opacity=".21"/><path d="M458-100H690L370 720H147Z" fill="${mist}" opacity=".23"/><path d="M520-80L232 740" stroke="${accent}" stroke-width="3" opacity=".6"/>`;
    case 'haze': return `<ellipse cx="400" cy="350" rx="300" ry="250" fill="${glow}" opacity=".45"/><path d="M-40 350Q120 210 290 390T760 340" stroke="${accent}" stroke-width="90" stroke-opacity=".12" fill="none"/><path d="M-40 465Q180 305 350 475T760 470" stroke="${mist}" stroke-width="55" stroke-opacity=".32" fill="none"/>`;
    case 'orbit': return `<g fill="none" stroke="${accent}" stroke-opacity=".56"><ellipse cx="364" cy="320" rx="302" ry="145" stroke-width="4" transform="rotate(-28 364 320)"/><ellipse cx="364" cy="320" rx="246" ry="222" stroke-width="2" transform="rotate(24 364 320)"/></g><circle cx="555" cy="113" r="24" fill="${accent}"/>`;
    default: return `<path d="M-10 60 330-60 730 115 455 366 738 545 500 750 0 555 165 345Z" fill="${glow}" opacity=".53"/><path d="m-30 30 360 210-165 260 470 200" fill="none" stroke="${accent}" stroke-width="2.4" opacity=".52"/><path d="M490 0 260 720" stroke="${mist}" stroke-width="75" opacity=".21"/>`;
  }
}
function tagsSVG(tags, accent, ink, x, y, wide = false) {
  const fontSize = wide ? 18 : 16, height = wide ? 36 : 32;
  let cursor = x;
  return tags.slice(0, 3).map(tag => {
    const text = String(tag).slice(0, 18).toUpperCase();
    const width = Math.min(wide ? 139 : 142, Math.max(78, text.length * (wide ? 10 : 9) + 26));
    const content = `<rect x="${cursor}" y="${y}" width="${width}" height="${height}" rx="9" fill="${accent}" opacity=".17" stroke="${accent}" stroke-opacity=".7"/><text x="${cursor + width / 2}" y="${y + (wide ? 24 : 22)}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" letter-spacing=".6" font-weight="700" fill="${ink}" text-anchor="middle" textLength="${Math.min(width-16, text.length * 10)}" lengthAdjust="spacingAndGlyphs">${escapeXML(text)}</text>`;
    cursor += width + 9;
    return content;
  }).join('');
}
function photoSVG(data, x, y, width, height) {
  if (!data || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(data)) return '';
  return `<defs><clipPath id="pcPhotoClip"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24"/></clipPath></defs><rect x="${x-5}" y="${y-5}" width="${width+10}" height="${height+10}" rx="28" fill="#FFFFFF" fill-opacity=".11" stroke="#FFFFFF" stroke-opacity=".3"/><image href="${escapeXML(data)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pcPhotoClip)"/>`;
}
export function renderCardSVG(state, {animated = true, time = 0} = {}) {
  const wide = state.format === 'wide';
  const {width:w, height:h} = FORMATS[state.format] || FORMATS.square;
  const base = normalizeHex(state.sceneColor, '#111629');
  const panel = normalizeHex(state.cardColor, '#19223C');
  const accent = normalizeHex(state.accentColor, '#A18BFF');
  const ink = contrastColor(panel);
  const muted = mix(ink, panel, .35);
  const name = (state.name || 'YOUR NAME').trim();
  const username = (state.username || 'username').replace(/^@+/, '').trim();
  const bio = (state.bio || 'BUILDING ON THE INTERNET').trim();
  const bioLines = wrapText(bio, wide ? 28 : 42, 2);
  const phase=(time % 3.2)/3.2*2*Math.PI;
  const scene = graphics(state.scene, base, accent);
  const frame = wide ? `M26 26H1174V604H26Z` : `M22 22H698V698H22Z`;
  const glyphs = `<g stroke="${accent}" stroke-width="3" fill="none" opacity=".85"><path d="M42 ${wide?145:144}h50m-25-25v50M${w-108} ${wide?495:415}h56m-28-28v56"/><circle cx="${w-60}" cy="60" r="12"/><path d="M${w-72} 60h24"/></g>`;
  const photoX=wide?108:154,photoY=wide?142:106,photoW=wide?384:412,photoH=wide?358:340;
  // No preset character: only an uploaded photograph or a neutral empty-photo affordance.
  const placeholder=`<g opacity=".9"><rect x="${photoX}" y="${photoY}" width="${photoW}" height="${photoH}" rx="24" fill="${mix(base,accent,.12)}" stroke="${accent}" stroke-opacity=".6" stroke-width="2.5" stroke-dasharray="12 12"/><g transform="translate(${photoX+photoW/2} ${photoY+photoH/2-17})" stroke="${mix(accent,'#FFFFFF',.3)}" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="-43" y="-33" width="86" height="67" rx="10"/><circle cx="-17" cy="-10" r="6"/><path d="m-36 26 23-23 19 19 13-13 18 18"/></g>${txt('ADD YOUR PHOTO',photoX+photoW/2,photoY+photoH/2+92,19,mix(accent,'#FFFFFF',.35),{weight:800,spacing:2,width:photoW-32}).replace('<text ', '<text text-anchor="middle" ')}</g>`;
  const photoArt=photoSVG(state.photo,photoX,photoY,photoW,photoH);
  const art=`<g class="${animated?'aura-photo':''}" transform="translate(0 ${(Math.sin(phase)*5).toFixed(2)})">${photoArt||placeholder}</g>`;
  const aurora = wide ? `<ellipse cx="306" cy="304" rx="218" ry="220" fill="url(#pcAura)" opacity=".83"/>` : `<ellipse cx="358" cy="259" rx="226" ry="222" fill="url(#pcAura)" opacity=".8"/>`;
  let info;
  if (wide) {
    const x=627,y=74,pw=526,ph=484;
    info = `<g><rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="24" fill="${panel}" stroke="${mix(panel,ink,.22)}" stroke-width="1.5"/>
      <rect x="${x+25}" y="${y+30}" width="37" height="5" rx="2.5" fill="${accent}"/>
      ${txt('DIGITAL IDENTITY  /  001',x+77,y+38,15,muted,{weight:700,spacing:1.3})}
      ${txt(name.toUpperCase(),x+32,y+163,Math.max(38,64-Math.max(0,name.length-12)*2),ink,{weight:900,width:pw-65,spacing:-1.5})}
      ${txt('@'+username,x+34,y+207,25,accent,{weight:700,width:pw-72})}
      <path d="M${x+32} ${y+248}h${pw-64}" stroke="${accent}" stroke-opacity=".42"/>
      ${bioLines.map((line,i)=>txt(line,x+34,y+290+i*35,25,muted,{width:pw-68})).join('')}
      ${tagsSVG(state.tags,accent,ink,x+33,y+385,true)}
      ${txt('AURA / ONLINE',x+34,y+456,14,accent,{weight:800,spacing:2})}
      <path d="M${x+pw-64} ${y+446}h30" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  } else {
    const x=30,y=456,pw=660,ph=232;
    info = `<g><rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="22" fill="${panel}" stroke="${mix(panel,ink,.25)}" stroke-width="1.4"/>
       <rect x="${x+23}" y="${y+27}" width="30" height="4" rx="2" fill="${accent}"/>
       ${txt('IDENTITY / 001',x+65,y+33,13,muted,{weight:800,spacing:1.5})}
       ${txt(name.toUpperCase(),x+32,y+102,Math.max(34,54-Math.max(0,name.length-13)*1.7),ink,{weight:900,width:pw-65,spacing:-1.3})}
       ${txt('@'+username,x+34,y+134,22,accent,{weight:700,width:pw-70})}
       ${bioLines.map((line,i)=>txt(line,x+34,y+164+i*24,20,muted,{width:pw-70})).join('')}
       ${tagsSVG(state.tags,accent,ink,x+33,y+194)}
    </g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="ProfileCard for ${escapeXML(name)}" data-format="${state.format}">
    <defs><linearGradient id="pcBackground" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${mix(base,accent,.13)}"/><stop offset="1" stop-color="${mix(base,'#000000',.24)}"/></linearGradient><radialGradient id="pcAura"><stop offset="0" stop-color="${accent}" stop-opacity=".7"/><stop offset=".48" stop-color="${accent}" stop-opacity=".26"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#pcBackground)"/>
    <g transform="scale(${w/720} ${h/720}) translate(${(Math.sin(phase)*7).toFixed(2)} ${(Math.cos(phase)*6).toFixed(2)})">${scene}</g>
    <path d="${frame}" fill="none" stroke="${mix(base,'#FFFFFF',.65)}" stroke-opacity=".25" stroke-width="1.5"/>
    <g opacity="${(.88+.12*Math.cos(phase)).toFixed(3)}" class="${animated?'aura-glow':''}">${aurora}</g>
    <g transform="translate(${(Math.cos(phase)*4).toFixed(2)} ${(Math.sin(phase)*4).toFixed(2)})" class="${animated?'aura-lines':''}">${glyphs}</g>
    ${art}
    ${info}
    ${wide ? txt('PROFILECARD  //  V1.4',46,593,14,contrastColor(base),{weight:700,spacing:1.7}) : txt('PROFILECARD  /  V1.4',45,42,13,contrastColor(base),{weight:800,spacing:1.5})}
  </svg>`;
}
