import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeXML,normalizeHex,contrastColor,wrapText,randomize,randomizeCharacter,sanitizeCharacter,CHARACTER_OPTIONS,createDefaultState,getSavedState,FORMATS,PALETTES,SCENES } from '../src/utils.js';
import { renderCardSVG } from '../src/card.js';
import { characterSVG,characterArtwork } from '../src/characters.js';
import { GifEncoder } from '../src/gif.js';

test('user-entered SVG text is always escaped',()=>{
 assert.equal(escapeXML('<script>&"'), '&lt;script&gt;&amp;&quot;');
 const svg=renderCardSVG({...createDefaultState(),name:'<script>alert(1)</script>'});
 assert.ok(svg.includes('&lt;script&gt;'));assert.equal(svg.includes('<script>'),false);
});
test('color normalization and contrast handle light and dark cards',()=>{
 assert.equal(normalizeHex('#abc'),'#AABBCC');assert.equal(normalizeHex('bad hex','#101010'),'#101010');
 assert.equal(contrastColor('#101010'),'#FFFFFF');assert.equal(contrastColor('#FFFFFF'),'#20243E');
});
test('long bios are wrapped and clipped',()=>{
 assert.ok(wrapText('building little creative internet things for people everywhere',22,2).length<=2);
 assert.ok(wrapText('supercalifragilisticexpialidocious',10,2)[0].endsWith('…'));
});
test('aura reroll preserves identity, character, custom photo and format',()=>{
 const state={...createDefaultState(),name:'Me',avatarMode:'upload',photo:'data:image/png;base64,AAAA'};
 const next=randomize(state,()=>.9);
 assert.deepEqual(next.avatar,state.avatar);assert.equal(next.photo,state.photo);assert.equal(next.name,'Me');
 assert.equal(next.avatarMode,'upload');assert.equal(next.format,'square');
 assert.ok(PALETTES.some(x=>x.id===next.theme));assert.ok(SCENES.some(x=>x.id===next.scene));
});
test('every independently customizable avatar option is valid',()=>{
 for(const [key,options] of Object.entries(CHARACTER_OPTIONS)){
  assert.ok(options.length>=4,`not enough variants for ${key}`);
  for(const option of options){const avatar=sanitizeCharacter({[key]:option});assert.equal(avatar[key],option);}
 }
});
test('avatar sanitizer rejects injected or unsupported features',()=>{
 const avatar=sanitizeCharacter({face:'<script>',hairColor:'url(javascript:bad)',accessory:'unknown'});
 for(const [key,value] of Object.entries(avatar))assert.ok(CHARACTER_OPTIONS[key].includes(value));
});
test('random avatar always changes at least one option and remains valid',()=>{
 const current=createDefaultState().avatar;
 for(const random of [()=>0,()=>.3,()=>.999]){
  const next=randomizeCharacter(current,random);
  assert.notDeepEqual(next,current);
  for(const [key,value] of Object.entries(next))assert.ok(CHARACTER_OPTIONS[key].includes(value));
 }
});
test('legacy character migration keeps profile and respects intentionally customized outfits',()=>{
 const old=getSavedState({name:'Legacy',character:'mira',avatarMode:'character'});
 assert.equal(old.name,'Legacy');assert.equal(old.avatar.accessory,'headphones');
 const persisted=getSavedState({...createDefaultState(),avatar:{...createDefaultState().avatar,mouth:'grin',skin:'#6C4337'}});
 assert.equal(persisted.avatar.mouth,'grin');assert.equal(persisted.avatar.skin,'#6C4337');
 const malformed=getSavedState({name:'x'.repeat(100),sceneColor:'nothex',tags:['a','b','c','d']});
 assert.equal(malformed.name.length,32);assert.equal(malformed.sceneColor,'#141428');assert.equal(malformed.tags.length,3);
});
test('all hairstyles, face types, eye and mouth combinations render safely',()=>{
 const avatar=createDefaultState().avatar;
 for(const hair of CHARACTER_OPTIONS.hair)for(const face of CHARACTER_OPTIONS.face){
  const svg=characterArtwork({...avatar,hair,face});assert.ok(svg.includes('<g'));assert.ok(svg.includes('</g>'));
 }
 assert.ok(characterSVG(avatar).includes('viewBox="0 0 400 390"'));
});
test('square and wide aura cards support animated preview and deterministic animation frames',()=>{
 for(const format of Object.keys(FORMATS))for(const palette of PALETTES){
  const base={...createDefaultState(),format,sceneColor:palette.scene,cardColor:palette.card,accentColor:palette.accent};
  const a=renderCardSVG(base,{animated:false,time:0});const b=renderCardSVG(base,{animated:false,time:1});
  assert.ok(a.includes(`viewBox="0 0 ${FORMATS[format].width} ${FORMATS[format].height}"`));
  assert.ok(a.includes('AURA / ONLINE')||a.includes('IDENTITY / 001'));
  assert.ok(!a.includes('class="aura-character"'));assert.notEqual(a,b);
  assert.equal(a,renderCardSVG(base,{animated:false,time:0}));
 }
});
test('GIF encoder writes GIF89a with frames and loop extension',async()=>{
 const width=24,height=24,encoder=new GifEncoder(width,height,{delay:10});
 for(let n=0;n<3;n++){
  const rgba=new Uint8ClampedArray(width*height*4);
  for(let i=0;i<width*height;i++){rgba[i*4]=n*80;rgba[i*4+1]=i%255;rgba[i*4+2]=120;rgba[i*4+3]=255;}
  encoder.addFrame(rgba);
 }
 const blob=encoder.finish();const bytes=new Uint8Array(await blob.arrayBuffer());
 assert.equal(new TextDecoder().decode(bytes.subarray(0,6)),'GIF89a');
 assert.equal(bytes.at(-1),0x3B);assert.equal(encoder.frames,3);
 assert.ok(blob.size>1000);assert.ok(new TextDecoder().decode(bytes).includes('NETSCAPE2.0'));
});
test('GIF rejects invalid sizes and pixel arrays',()=>{
 assert.throws(()=>new GifEncoder(0,100));
 const e=new GifEncoder(100,50);assert.throws(()=>e.addFrame(new Uint8Array(3)));
 assert.throws(()=>e.finish());
});
