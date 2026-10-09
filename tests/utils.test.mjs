import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeXML,normalizeHex,contrastColor,wrapText,randomize,createDefaultState,getSavedState,FORMATS,PALETTES,SCENES,CHARACTERS } from '../src/utils.js';
import { renderCardSVG } from '../src/card.js';
import { characterSVG } from '../src/characters.js';

test('escapes untrusted text in SVG and UI',()=>{
 assert.equal(escapeXML('<script>&"'), '&lt;script&gt;&amp;&quot;');
 const svg=renderCardSVG({...createDefaultState(),name:'<script>alert(1)</script>'});
 assert.ok(svg.includes('&lt;script&gt;'));
 assert.equal(svg.includes('<script>'),false);
});
test('color normalization and contrast handle dark backgrounds',()=>{
 assert.equal(normalizeHex('#abc'),'#AABBCC');
 assert.equal(normalizeHex('bad hex','#101010'),'#101010');
 assert.equal(contrastColor('#101010'),'#FFFFFF');
 assert.equal(contrastColor('#FFFFFF'),'#20243E');
});
test('long bio fits within the allowed lines',()=>{
 assert.ok(wrapText('building little creative internet things for people everywhere',22,2).length<=2);
 assert.ok(wrapText('supercalifragilisticexpialidocious',10,2)[0].endsWith('…'));
});
test('randomize preserves identity and chooses valid combinations',()=>{
 const source={...createDefaultState(),name:'Test',username:'@test',bio:'keep this',tags:['cool','nice'],avatarMode:'upload'};
 const next=randomize(source,()=>.91);
 assert.equal(next.name,'Test');assert.equal(next.bio,'keep this');
 assert.deepEqual(next.tags,['cool','nice']);
 assert.equal(next.character,source.character);
 assert.ok(PALETTES.some(x=>x.id===next.theme));
 assert.ok(SCENES.some(x=>x.id===next.scene));
});
test('settings sanitizer rejects malformed persisted data',()=>{
 const s=getSavedState({name:'x'.repeat(100),character:'external',format:'destroyed',sceneColor:'red',tags:['one','two','three','four']});
 assert.equal(s.name.length,32);assert.equal(s.character,'noah');assert.equal(s.format,'square');
 assert.equal(s.sceneColor,'#141428');assert.equal(s.tags.length,3);
});
test('SVG cards support square and wide formats with embedded art',()=>{
 for(const format of Object.keys(FORMATS)){
  for(const character of CHARACTERS){
   const svg=renderCardSVG({...createDefaultState(),format,character:character.id});
   assert.match(svg,/<svg xmlns=/);assert.ok(svg.includes(`viewBox="0 0 ${FORMATS[format].width} ${FORMATS[format].height}"`));
   assert.ok(svg.includes('Denis'));assert.ok(svg.includes('BUILDER'));
  }
 }
 assert.ok(characterSVG('pixel').includes('<svg'));
});

test('aura palettes and scenes render in both export layouts',()=>{
 for(const palette of PALETTES){
  for(const scene of SCENES){
   const state={...createDefaultState(),scene:scene.id,sceneColor:palette.scene,cardColor:palette.card,accentColor:palette.accent};
   const square=renderCardSVG({...state,format:'square'},{animated:false});
   const wide=renderCardSVG({...state,format:'wide'},{animated:false});
   assert.match(square,/DIGITAL|IDENTITY/);
   assert.ok(wide.includes('AURA / ONLINE'));
   assert.ok(!square.includes('aura-character'));
   assert.ok(!wide.includes('aura-glow'));
  }
 }
});
test('reroll always changes palette and preserves the exported profile',()=>{
 const state={...createDefaultState(),photo:'data:image/png;base64,AAAA',avatarMode:'upload'};
 const next=randomize(state,()=>0);
 assert.notEqual(next.theme,state.theme);
 for(const key of ['name','username','bio','photo','avatarMode','format'])assert.equal(next[key],state[key]);
});
test('saved v1 pastel presets migrate without losing user identity or custom colors',()=>{
 const old=getSavedState({name:'Persisted name',username:'user',theme:'lilac',scene:'dream',sceneColor:'#D7CBFF',cardColor:'#FFFFFF',accentColor:'#8064F4'});
 assert.equal(old.name,'Persisted name');assert.equal(old.theme,'eclipse');assert.equal(old.scene,'halo');assert.equal(old.sceneColor,'#141428');
 const custom=getSavedState({theme:'custom',scene:'grid',sceneColor:'#010203',cardColor:'#FFFEFD',accentColor:'#445566'});
 assert.equal(custom.theme,'custom');assert.equal(custom.sceneColor,'#010203');
});
