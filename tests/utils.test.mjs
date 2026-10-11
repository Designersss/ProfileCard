import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeXML,normalizeHex,contrastColor,wrapText,randomize,createDefaultState,getSavedState,FORMATS,PALETTES,SCENES } from '../src/utils.js';
import { renderCardSVG } from '../src/card.js';
import { GifEncoder } from '../src/gif.js';

test('user-entered SVG text is escaped, including photo-only cards',()=>{
 assert.equal(escapeXML('<script>&"'), '&lt;script&gt;&amp;&quot;');
 const svg=renderCardSVG({...createDefaultState(),name:'<script>alert(1)</script>'});
 assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('<script>'));
});
test('colors maintain contrast and are normalized',()=>{
 assert.equal(normalizeHex('#abc'),'#AABBCC');assert.equal(normalizeHex('bad hex','#101010'),'#101010');
 assert.equal(contrastColor('#101010'),'#FFFFFF');assert.equal(contrastColor('#FFFFFF'),'#20243E');
});
test('long bio wrapping stays limited',()=>{
 assert.ok(wrapText('building little creative internet things for people everywhere',22,2).length<=2);
 assert.ok(wrapText('supercalifragilisticexpialidocious',10,2)[0].endsWith('…'));
});
test('only a neutral photo placeholder is shown when no photo exists',()=>{
 for(const format of Object.keys(FORMATS)){
  const svg=renderCardSVG({...createDefaultState(),format},{animated:false});
  assert.ok(svg.includes('ADD YOUR PHOTO'));
  assert.ok(!svg.includes('<image '));
  assert.ok(!svg.includes('aura-character'));
  assert.ok(!svg.includes('avatar-eyes'));
 }
});
test('uploaded photo is shown and the placeholder is removed',()=>{
 const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6a8AAAAASUVORK5CYII=';
 for(const format of Object.keys(FORMATS)){
  const svg=renderCardSVG({...createDefaultState(),format,photo:png},{animated:false,time:0.4});
  assert.ok(svg.includes('<image href="'+png+'"'));
  assert.ok(!svg.includes('ADD YOUR PHOTO'));
  assert.ok(svg.includes('clip-path="url(#pcPhotoClip)"'));
 }
});
test('invalid and injected photo URIs never reach SVG markup',()=>{
 for(const photo of ['https://example.org/private.png','data:image/svg+xml;base64,PHN2Zz4=','data:image/png;base64,AABB"/><script>bad</script>']){
  const svg=renderCardSVG({...createDefaultState(),photo});
  assert.ok(!svg.includes('<image href='));
  assert.ok(svg.includes('ADD YOUR PHOTO'));
  assert.ok(!svg.includes('<script>'));
 }
});
test('reroll preserves personal identity, photo and output format',()=>{
 const state={...createDefaultState(),name:'Me',photo:'data:image/png;base64,AAAA',format:'wide'};
 const next=randomize(state,()=>.9);
 assert.equal(next.photo,state.photo);assert.equal(next.name,'Me');assert.equal(next.format,'wide');
 assert.ok(PALETTES.some(x=>x.id===next.theme));assert.ok(SCENES.some(x=>x.id===next.scene));
});
test('legacy character options are discarded without losing existing profile text',()=>{
 const migrated=getSavedState({name:'Legacy',character:'mira',avatarMode:'character',avatar:{hair:'bob',faceWidth:125},bio:'hello',tags:['maker']});
 assert.equal(migrated.name,'Legacy');assert.equal(migrated.bio,'hello');assert.deepEqual(migrated.tags,['maker']);
 assert.equal(migrated.photo,null);
 assert.equal(Object.hasOwn(migrated,'avatar'),false);
 assert.equal(Object.hasOwn(migrated,'avatarMode'),false);
 assert.equal(Object.hasOwn(migrated,'character'),false);
});
test('legacy custom colors, fields and formats remain valid',()=>{
 const custom=getSavedState({name:'x'.repeat(100),sceneColor:'#abcdef',theme:'custom',tags:['a','b','c','d'],format:'wide'});
 assert.equal(custom.name.length,32);assert.equal(custom.sceneColor,'#ABCDEF');assert.equal(custom.tags.length,3);assert.equal(custom.format,'wide');
 const legacyTheme=getSavedState({theme:'lilac',sceneColor:'#ffffff'});
 assert.equal(legacyTheme.theme,'eclipse');assert.equal(legacyTheme.sceneColor,'#141428');
});
test('square and wide aura animations support deterministic GIF frames',()=>{
 for(const format of Object.keys(FORMATS))for(const palette of PALETTES){
  const base={...createDefaultState(),format,sceneColor:palette.scene,cardColor:palette.card,accentColor:palette.accent};
  const a=renderCardSVG(base,{animated:false,time:0});const b=renderCardSVG(base,{animated:false,time:1});
  assert.ok(a.includes(`viewBox="0 0 ${FORMATS[format].width} ${FORMATS[format].height}"`));
  assert.ok(a.includes('AURA / ONLINE')||a.includes('IDENTITY / 001'));
  assert.notEqual(a,b);assert.equal(a,renderCardSVG(base,{animated:false,time:0}));
 }
});
test('photo also moves across deterministic export timeline',()=>{
 const state={...createDefaultState(),photo:'data:image/jpeg;base64,AAAA'};
 const a=renderCardSVG(state,{animated:false,time:0});const b=renderCardSVG(state,{animated:false,time:1});
 assert.notEqual(a,b);
 assert.ok(a.includes('aura-photo')===false);
});
test('GIF encoder writes looping GIF89a',async()=>{
 const width=24,height=24,encoder=new GifEncoder(width,height,{delay:10});
 for(let n=0;n<3;n++){
  const rgba=new Uint8ClampedArray(width*height*4);
  for(let i=0;i<width*height;i++){rgba[i*4]=n*80;rgba[i*4+1]=i%255;rgba[i*4+2]=120;rgba[i*4+3]=255;}
  encoder.addFrame(rgba);
 }
 const blob=encoder.finish(),bytes=new Uint8Array(await blob.arrayBuffer());
 assert.equal(new TextDecoder().decode(bytes.subarray(0,6)),'GIF89a');
 assert.equal(bytes.at(-1),0x3B);assert.equal(encoder.frames,3);
 assert.ok(blob.size>1000);assert.ok(new TextDecoder().decode(bytes).includes('NETSCAPE2.0'));
});
test('GIF rejects invalid sizes and pixel arrays',()=>{
 assert.throws(()=>new GifEncoder(0,100));
 const encoder=new GifEncoder(100,50);assert.throws(()=>encoder.addFrame(new Uint8Array(3)));
 assert.throws(()=>encoder.finish());
});
