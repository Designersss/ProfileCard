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
  {id:'eclipse',name:'Eclipse',scene:'#141428',card:'#202039',accent:'#997CFF',sceneId:'halo'},
  {id:'phantom',name:'Phantom',scene:'#0A1C25',card:'#132F39',accent:'#4AE9DD',sceneId:'grid'},
  {id:'drift',name:'Drift',scene:'#2E1A24',card:'#35242C',accent:'#FF9668',sceneId:'beam'},
  {id:'nova',name:'Nova',scene:'#25143B',card:'#301D4F',accent:'#F075FF',sceneId:'shards'},
  {id:'zenith',name:'Zenith',scene:'#113348',card:'#143D50',accent:'#FFE09B',sceneId:'orbit'},
  {id:'frost',name:'Frost',scene:'#CADAE7',card:'#F2F6FA',accent:'#3976CE',sceneId:'haze'},
  {id:'chrome',name:'Chrome',scene:'#D2D5DC',card:'#F5F6F8',accent:'#ED643E',sceneId:'grid'},
  {id:'ember',name:'Ember',scene:'#290F1A',card:'#401F29',accent:'#FF526D',sceneId:'beam'}
]);
export const SCENES = Object.freeze([
  {id:'halo',name:'Halo'}, {id:'grid',name:'Grid'}, {id:'beam',name:'Beam'},
  {id:'orbit',name:'Orbit'}, {id:'haze',name:'Haze'}, {id:'shards',name:'Shards'}
]);
// The only character model: independent layers with explicit, validated options.
export const CHARACTER_OPTIONS = Object.freeze({
  face:['oval','round','angular','long','soft-square'],
  skin:['#F4C7A5','#DEAB8B','#BC8062','#925E46','#6C4337','#E8D6C8'],
  hair:['messy','curtain','crop','bob','long','tied','undercut','buzz'],
  hairColor:['#151827','#322626','#705047','#A96A43','#C5A07B','#C7C5D4','#6B61A5','#E49CB2','#3F7385','#EEEEEF'],
  eyes:['focused','relaxed','sharp','wide','sleepy','closed'],
  eyeColor:['#26243B','#533E38','#4D6681','#558572','#84619A','#BFA06A'],
  brows:['natural','straight','sharp','arched'],
  mouth:['neutral','smirk','smile','serious','grin','open'],
  outfit:['hoodie','jacket','tee','turtleneck','bomber','shirt'],
  outfitColor:['#171B29','#353F57','#6D57A5','#3D7F80','#CA655D','#E4C6A1','#E7E9F0','#C69044'],
  accessory:['none','glasses','headphones','earrings','beanie','visor','chain','mask']
});
export const FACE_WIDTH = Object.freeze({min:75,max:125,step:1,default:100});
export function clampFaceWidth(value) {
  const number=Number(value);
  return Number.isFinite(number)?Math.min(FACE_WIDTH.max,Math.max(FACE_WIDTH.min,Math.round(number))):FACE_WIDTH.default;
}
const legacyCharacters = Object.freeze({
  noah:{hair:'messy',outfit:'hoodie'},ivy:{hair:'long',outfit:'jacket',hairColor:'#322626'},
  kai:{hair:'crop',accessory:'glasses'},mira:{hair:'bob',accessory:'headphones',hairColor:'#E49CB2'},
  leo:{hair:'undercut',accessory:'beanie'},pixel:{hair:'buzz'},byte:{hair:'crop'}
});
export function createDefaultCharacter(){return {
  face:'angular',faceWidth:100,skin:'#DEAB8B',hair:'messy',hairColor:'#151827',eyes:'focused',eyeColor:'#26243B',
  brows:'sharp',mouth:'smirk',outfit:'hoodie',outfitColor:'#171B29',accessory:'none'
};}
export function sanitizeCharacter(source, legacyId) {
  const legacy=legacyCharacters[legacyId]||{};
  const values=source&&typeof source==='object'&&!Array.isArray(source)?source:{};
  const defaults={...createDefaultCharacter(),...legacy};
  return { ...Object.fromEntries(Object.entries(CHARACTER_OPTIONS).map(([key,options])=>
    [key,options.includes(values[key])?values[key]:defaults[key]])),
    faceWidth:clampFaceWidth(values.faceWidth ?? defaults.faceWidth) };
}
export function randomizeCharacter(character,random=Math.random){
  const previous=sanitizeCharacter(character);
  const result=Object.fromEntries(Object.entries(CHARACTER_OPTIONS).map(([key,options])=>
    [key,options[Math.min(options.length-1,Math.max(0,Math.floor(random()*options.length)))] ]));
  result.faceWidth=clampFaceWidth(FACE_WIDTH.min + random()*(FACE_WIDTH.max-FACE_WIDTH.min+1));
  if(Object.keys(result).every(key=>result[key]===previous[key])){
    const alternatives=CHARACTER_OPTIONS.hair;
    result.hair=alternatives[(alternatives.indexOf(result.hair)+1)%alternatives.length];
  }
  return result;
}
export const FORMATS = Object.freeze({square:{width:720,height:720},wide:{width:1200,height:630}});

export function createDefaultState() {
  return {
    name:'Denis',username:'deni',bio:'building things on the internet',
    tags:['builder','designer'],avatar:createDefaultCharacter(),avatarMode:'character',
    theme:'eclipse',scene:'halo',sceneColor:'#141428',cardColor:'#202039',
    accentColor:'#997CFF',format:'square'
  };
}

export function getSavedState(source) {
  const defaults = createDefaultState();
  if (!source || typeof source !== 'object') return defaults;
  const isCurrentTheme = PALETTES.some(p=>p.id===source.theme);
  const isCustomTheme = source.theme === 'custom';
  // v1 stored pastel palettes. Migrate those styles to the new aura defaults,
  // while keeping names, tags, format, and intentionally selected custom colors.
  const legacyTheme = !isCurrentTheme && !isCustomTheme;
  const theme = isCurrentTheme || isCustomTheme ? source.theme : defaults.theme;
  const scene = SCENES.some(p=>p.id===source.scene) ? source.scene : defaults.scene;
  return {
    ...defaults,
    name:sanitizeText(source.name ?? defaults.name,MAX.name),
    username:sanitizeText(source.username ?? defaults.username,MAX.username).replace(/^@+/,''),
    bio:sanitizeText(source.bio ?? defaults.bio,MAX.bio),
    tags:Array.isArray(source.tags)?source.tags.filter(x=>typeof x==='string').slice(0,MAX.tags).map(x=>sanitizeText(x,MAX.tag)):defaults.tags,
    avatar:sanitizeCharacter(source.avatar,source.character),theme,scene,
    sceneColor:legacyTheme?defaults.sceneColor:normalizeHex(source.sceneColor,defaults.sceneColor),
    cardColor:legacyTheme?defaults.cardColor:normalizeHex(source.cardColor,defaults.cardColor),
    accentColor:legacyTheme?defaults.accentColor:normalizeHex(source.accentColor,defaults.accentColor),
    format:source.format==='wide'?'wide':'square',
    avatarMode:source.avatarMode==='upload'?'upload':'character'
  };
}

export function randomize(state, random = Math.random) {
  let nextPalette = PALETTES[Math.floor(random()*PALETTES.length)];
  // Avoid a no-op reroll even with a deterministic random source.
  if (nextPalette.id === state.theme) nextPalette = PALETTES[(PALETTES.indexOf(nextPalette)+1)%PALETTES.length];
  const nextScene = SCENES[Math.floor(random()*SCENES.length)];
  return {
    ...state,
    theme:nextPalette.id,scene:nextScene.id,
    sceneColor:nextPalette.scene,cardColor:nextPalette.card,accentColor:nextPalette.accent
  };
}
