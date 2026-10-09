/** Lightweight shared utilities: pure functions suitable for Node and the browser. */
export const MAX = Object.freeze({ name: 32, username: 24, bio: 100, tag: 18, tags: 3 });

export function escapeXML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[char]);
}

export function sanitizeText(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, max);
}

export function normalizeHex(hex, fallback = '#ffffff') {
  const str = String(hex ?? '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(str)) return str.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(str)) return `#${[...str.slice(1)].map(x => x + x).join('').toUpperCase()}`;
  return fallback;
}

export function contrastColor(background) {
  const hex = normalizeHex(background).slice(1);
  const channels = [0,2,4].map(i => parseInt(hex.slice(i,i+2),16)/255);
  const [r,g,b] = channels.map(c => c <= .04045 ? c/12.92 : ((c + .055)/1.055)**2.4);
  const luminosity = .2126*r + .7152*g + .0722*b;
  return luminosity > .32 ? '#20243E' : '#FFFFFF';
}

export function wrapText(input, maxChars = 36, maxLines = 2) {
  const words = String(input ?? '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line && word.length > maxChars) {
      if (lines.length >= maxLines) break;
      lines.push(word.slice(0, maxChars - 1) + '…');
      continue;
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) { line = next; continue; }
    if (line) lines.push(line);
    line = word;
    if (lines.length >= maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  const displayed = lines.join(' ');
  if (lines.length && displayed.length < String(input ?? '').trim().length) {
    const last = lines.length-1;
    lines[last] = lines[last].replace(/[.\s]+$/,'').slice(0,maxChars-1) + '…';
  }
  return lines.slice(0,maxLines);
}

export const PALETTES = Object.freeze([
  { id:'lilac', name:'Lilac', scene:'#D7CBFF', card:'#FFFFFF', accent:'#8064F4', secondary:'#EDE7FF' },
  { id:'rose', name:'Rose', scene:'#FFC9DD', card:'#FFF9FC', accent:'#F266A2', secondary:'#FFE6EF' },
  { id:'peach', name:'Peach', scene:'#FFC9BB', card:'#FFFAF7', accent:'#EA806C', secondary:'#FFE4D7' },
  { id:'lemon', name:'Lemon', scene:'#FFE49A', card:'#FFFDF5', accent:'#E7A12B', secondary:'#FFF0C5' },
  { id:'mint', name:'Mint', scene:'#ACE8D8', card:'#FFFFFF', accent:'#36A991', secondary:'#D7F7ED' },
  { id:'sky', name:'Sky', scene:'#B4D7FF', card:'#FFFFFF', accent:'#5C92EE', secondary:'#E3F0FF' },
  { id:'coral', name:'Coral', scene:'#FFADA5', card:'#FFF5F0', accent:'#EF665C', secondary:'#FFDDD3' },
  { id:'night', name:'Night', scene:'#2B315F', card:'#323A70', accent:'#B2A1FF', secondary:'#474E87' }
]);
export const SCENES = Object.freeze([
  {id:'dream', name:'Dream'}, {id:'clouds',name:'Clouds'}, {id:'sunset',name:'Sunset'},
  {id:'hills',name:'Hills'}, {id:'waves',name:'Waves'}, {id:'stars',name:'Stars'}
]);
export const CHARACTERS = Object.freeze([
  {id:'noah',name:'Noah',type:'human'}, {id:'ivy',name:'Ivy',type:'human'},
  {id:'kai',name:'Kai',type:'human'}, {id:'mira',name:'Mira',type:'human'},
  {id:'leo',name:'Leo',type:'human'}, {id:'pixel',name:'Pixel',type:'animal'},
  {id:'byte',name:'Byte',type:'robot'}
]);
export const FORMATS = Object.freeze({square:{width:720,height:720},wide:{width:1200,height:630}});

export function createDefaultState() {
  return {
    name:'Denis',username:'deni',bio:'building things on the internet',
    tags:['builder','designer'],character:'noah',avatarMode:'character',
    theme:'lilac',scene:'dream',sceneColor:'#D7CBFF',cardColor:'#FFFFFF',
    accentColor:'#8064F4',format:'square'
  };
}

export function getSavedState(source) {
  const defaults = createDefaultState();
  if (!source || typeof source !== 'object') return defaults;
  const theme = PALETTES.some(p=>p.id===source.theme) ? source.theme : defaults.theme;
  const scene = SCENES.some(p=>p.id===source.scene) ? source.scene : defaults.scene;
  const character = CHARACTERS.some(p=>p.id===source.character) ? source.character : defaults.character;
  return {
    ...defaults,
    name:sanitizeText(source.name ?? defaults.name,MAX.name),
    username:sanitizeText(source.username ?? defaults.username,MAX.username).replace(/^@+/,''),
    bio:sanitizeText(source.bio ?? defaults.bio,MAX.bio),
    tags:Array.isArray(source.tags)?source.tags.filter(x=>typeof x==='string').slice(0,MAX.tags).map(x=>sanitizeText(x,MAX.tag)):defaults.tags,
    character,theme,scene,
    sceneColor:normalizeHex(source.sceneColor,defaults.sceneColor),
    cardColor:normalizeHex(source.cardColor,defaults.cardColor),
    accentColor:normalizeHex(source.accentColor,defaults.accentColor),
    format:source.format==='wide'?'wide':'square',
    avatarMode:source.avatarMode==='upload'?'upload':'character'
  };
}

export function randomize(state, random = Math.random) {
  const nextPalette = PALETTES[Math.floor(random()*PALETTES.length)];
  const nextScene = SCENES[Math.floor(random()*SCENES.length)];
  const nextCharacter = CHARACTERS[Math.floor(random()*CHARACTERS.length)];
  return {
    ...state,
    theme:nextPalette.id,scene:nextScene.id,
    sceneColor:nextPalette.scene,cardColor:nextPalette.card,accentColor:nextPalette.accent,
    character:state.avatarMode==='upload'?state.character:nextCharacter.id
  };
}
