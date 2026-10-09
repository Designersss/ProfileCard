import { CHARACTER_OPTIONS, FORMATS, MAX, PALETTES, SCENES, createDefaultState, escapeXML, getSavedState, randomize, randomizeCharacter, sanitizeText } from './utils.js';
import { renderCardSVG } from './card.js';

const $ = (id) => document.getElementById(id);
const storageKey = 'profilecard.settings.v1'; // Preserve existing profiles across the visual redesign.
let initialSettings;
try { initialSettings=JSON.parse(localStorage.getItem(storageKey)||'null'); } catch { initialSettings=null; }
const state = getSavedState(initialSettings);
let deferredInstallPrompt = null;
let toastTimeout;
let animationTimeout;
let activeTab = 'identity';
let gifAbort = null;

function save() {
  const {photo, ...settings} = state;
  try { localStorage.setItem(storageKey,JSON.stringify(settings)); } catch { /* Private mode can disable persistence. */ }
}

function toast(message) {
  const el=$('toast');el.textContent=message;el.hidden=false;
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{el.hidden=true},3400);
}

function refreshCard({magical=false}={}) {
  const mount=$('cardMount');
  mount.innerHTML=renderCardSVG(state,{animated:true});
  mount.classList.toggle('is-wide',state.format==='wide');
  if(magical && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mount.classList.remove('card-changing');$('magicBurst').classList.remove('burst');
    void mount.offsetWidth;
    mount.classList.add('card-changing');$('magicBurst').classList.add('burst');
    $('randomBtn').classList.add('is-randomizing');
    clearTimeout(animationTimeout);
    animationTimeout=setTimeout(()=>{
      mount.classList.remove('card-changing');$('magicBurst').classList.remove('burst');$('randomBtn').classList.remove('is-randomizing');
    },1000);
  }
  save();
}

function selectTheme(id) {
  const theme=PALETTES.find(x=>x.id===id);
  if(!theme)return;
  Object.assign(state,{theme:id,sceneColor:theme.scene,cardColor:theme.card,accentColor:theme.accent});
  refreshControls();refreshCard({magical:true});
}

const avatarLabels={
 face:'Face shape',skin:'Skin tone',hair:'Hairstyle',hairColor:'Hair color',eyes:'Eyes',eyeColor:'Eye color',
 brows:'Eyebrows',mouth:'Mouth / lips',outfit:'Outfit',outfitColor:'Outfit color',accessory:'Accessories'
};
const avatarColorFields=new Set(['skin','hairColor','eyeColor','outfitColor']);
const humanize=(value)=>value.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
function drawBuilder(){
 const parent=$('characterBuilder');
 parent.innerHTML=`<div class="builder-grid">${Object.entries(CHARACTER_OPTIONS).filter(([key])=>!avatarColorFields.has(key)).map(([key,options])=>
  `<label class="builder-field"><span>${avatarLabels[key]}</span><select data-avatar-field="${key}">${options.map(value=>`<option value="${value}" ${state.avatar[key]===value?'selected':''}>${humanize(value)}</option>`).join('')}</select></label>`).join('')}</div>
 <div class="builder-colors">${[...avatarColorFields].map(key=>`<div class="builder-color"><span class="field-label">${avatarLabels[key]}</span><div class="builder-swatches" role="group" aria-label="${avatarLabels[key]}">${CHARACTER_OPTIONS[key].map(value=>`<button class="avatar-swatch ${state.avatar[key]===value?'active':''}" type="button" data-avatar-field="${key}" data-avatar-value="${value}" style="--swatch:${value}" aria-label="${avatarLabels[key]} ${value}" aria-pressed="${state.avatar[key]===value}" title="${value}"></button>`).join('')}</div></div>`).join('')}</div>`;
 parent.querySelectorAll('select[data-avatar-field]').forEach(select=>select.addEventListener('change',()=>{
   state.avatar[select.dataset.avatarField]=select.value;refreshCard({magical:true});
 }));
 parent.querySelectorAll('button[data-avatar-field]').forEach(button=>button.addEventListener('click',()=>{
   state.avatar[button.dataset.avatarField]=button.dataset.avatarValue;drawBuilder();refreshCard({magical:true});
 }));
}

function drawPalettes(){
  $('paletteLabel').textContent=PALETTES.find(p=>p.id===state.theme)?.name || 'Custom';
  $('paletteList').innerHTML=PALETTES.map(p=>`<button type="button" data-palette="${p.id}" class="palette-choice ${state.theme===p.id?'active':''}" title="${p.name}" aria-label="${p.name} theme" aria-pressed="${state.theme===p.id}" style="--swatch:${p.scene}"></button>`).join('');
  $('paletteList').querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>selectTheme(b.dataset.palette)));
}
function drawScenes(){
  $('sceneLabel').textContent=SCENES.find(s=>s.id===state.scene)?.name || 'Scene';
  $('sceneList').innerHTML=SCENES.map(s=>`<button type="button" class="scene-choice ${state.scene===s.id?'active':''}" data-scene="${s.id}" aria-label="${s.name} background" aria-pressed="${state.scene===s.id}" title="${s.name}"></button>`).join('');
  $('sceneList').querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{
    state.scene=b.dataset.scene;drawScenes();refreshCard({magical:true});
  }));
}
function drawTags(){
  $('tagList').innerHTML=state.tags.map((tag,i)=>`<span class="tag-chip">${escapeXML(tag)}<button type="button" data-remove-tag="${i}" aria-label="Remove ${escapeXML(tag)} tag">×</button></span>`).join('');
  $('tagList').querySelectorAll('[data-remove-tag]').forEach(b=>b.addEventListener('click',()=>{
    state.tags.splice(Number(b.dataset.removeTag),1);drawTags();refreshCard();
  }));
  $('tagInput').disabled=state.tags.length>=MAX.tags;
  $('addTagBtn').disabled=state.tags.length>=MAX.tags;
  $('tagInput').placeholder=state.tags.length>=MAX.tags?'3 tags maximum':'e.g. dreamer';
}
function addTag(){
  const input=$('tagInput');
  const tag=sanitizeText(input.value.trim().replace(/^#+/,''),MAX.tag);
  if(!tag)return;
  if(state.tags.length>=MAX.tags){toast('Only three little tags per card.');return;}
  if(state.tags.some(x=>x.toLowerCase()===tag.toLowerCase())){toast('That tag is already here.');return;}
  state.tags.push(tag);input.value='';drawTags();refreshCard();
}
function refreshControls(){
  $('nameInput').value=state.name;
  $('usernameInput').value='@'+state.username;
  $('bioInput').value=state.bio;
  $('bioCount').textContent=`${state.bio.length} / ${MAX.bio}`;
  const upload=state.avatarMode==='upload';
  $('characterMode').classList.toggle('active',!upload);
  $('characterMode').setAttribute('aria-pressed',String(!upload));
  $('photoMode').classList.toggle('active',upload);
  $('photoMode').setAttribute('aria-pressed',String(upload));
  $('characterBuilder').hidden=upload;
  $('uploadZone').hidden=!upload;
  for(const [id,hex] of [['sceneColor',state.sceneColor],['cardColor',state.cardColor],['accentColor',state.accentColor]]){
    $(id+'Input').value=hex;$(id+'Value').textContent=hex.toUpperCase();
  }
  $('squareBtn').classList.toggle('active',state.format==='square');
  $('wideBtn').classList.toggle('active',state.format==='wide');
  $('squareBtn').setAttribute('aria-pressed',String(state.format==='square'));
  $('wideBtn').setAttribute('aria-pressed',String(state.format==='wide'));
  drawBuilder();drawPalettes();drawScenes();drawTags();
}

function dbAvatar(mode='read',data=null){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)) { resolve(null); return; }
    const request=indexedDB.open('profilecard-local-v1',1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('assets'))request.result.createObjectStore('assets');};
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result;
      try{
        const transaction=db.transaction('assets',mode==='write'?'readwrite':'readonly');
        const store=transaction.objectStore('assets');
        const operation=mode==='write'?store.put(data,'avatar'):store.get('avatar');
        operation.onsuccess=()=>resolve(operation.result);
        operation.onerror=()=>reject(operation.error);
        transaction.oncomplete=()=>db.close();
        transaction.onerror=()=>db.close();
      }catch(error){db.close();reject(error);}
    };
  });
}

async function resizeImage(file) {
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Please use PNG, JPEG, or WebP.');
  if(file.size>4*1024*1024)throw Error('Your photo should be smaller than 4 MB.');
  const url=URL.createObjectURL(file);
  try {
    const image=new Image();image.src=url;await image.decode();
    if(image.width>10000||image.height>10000||image.width<1||image.height<1)throw Error('This image is too large.');
    const ratio=Math.min(1,800/Math.max(image.width,image.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/png');
  } finally{URL.revokeObjectURL(url);}
}

async function svgToBlob(){
  const svg=renderCardSVG(state,{animated:false});
  const raw=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(raw);
  try{
    const image=new Image();image.src=url;await image.decode();
    const dimensions=FORMATS[state.format];
    const scale=state.format==='square'?1.5:1;
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(dimensions.width*scale);
    canvas.height=Math.round(dimensions.height*scale);
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas is unavailable.');
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed.')),'image/png'));
  } finally {URL.revokeObjectURL(url);}
}

async function exportImage(copy=false){
  const button=$(copy?'copyBtn':'downloadBtn');
  button.disabled=true;
  try{
    const blob=await svgToBlob();
    if(copy){
      if(navigator.clipboard && typeof ClipboardItem!=='undefined' && window.isSecureContext){
        await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
        toast('Copied! Now paste your card anywhere.');
      } else {
        toast('Copy isn’t available here. Download the PNG instead.');
      }
    } else {
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.download=`profilecard-${(state.username||'me').replace(/[^a-zA-Z0-9_-]/g,'_')}-${state.format}.png`;link.href=url;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),4000);
      toast('Looking good! Your card is downloaded.');
    }
  } catch(err) {console.error('ProfileCard export',err);toast('Could not export this card. Try a smaller photo or another browser.');}
  finally {button.disabled=false;}
}

function workerResponse(worker,signal){
 return new Promise((resolve,reject)=>{
  const clear=()=>{worker.removeEventListener('message',message);worker.removeEventListener('error',error);signal.removeEventListener('abort',abort);};
  const message=e=>{clear();e.data?.type==='error'?reject(Error(e.data.message)):resolve(e.data);};
  const error=e=>{clear();reject(Error(e.message||'GIF worker failed'));};
  const abort=()=>{clear();reject(new DOMException('Cancelled','AbortError'));};
  worker.addEventListener('message',message,{once:true});worker.addEventListener('error',error,{once:true});
  if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
 });
}
async function framePixels(profile,time,width,height,signal){
 if(signal.aborted)throw new DOMException('Cancelled','AbortError');
 const svg=renderCardSVG(profile,{animated:false,time});
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 try{
  const image=new Image();image.src=url;await image.decode();
  if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)throw Error('Canvas is unavailable.');
  context.drawImage(image,0,0,width,height);
  return context.getImageData(0,0,width,height).data;
 }finally{URL.revokeObjectURL(url);}
}
async function exportGif(){
 if(gifAbort)return;
 const controller=new AbortController();gifAbort=controller;
 const button=$('downloadGifBtn'),progress=$('exportProgress'),bar=$('exportProgressBar'),label=$('exportProgressLabel');
 const profile={...state,avatar:{...state.avatar},tags:[...state.tags]};
 const width=profile.format==='wide'?600:420,height=profile.format==='wide'?315:420;
 const fps=10,frames=32;
 let worker;
 button.disabled=true;progress.hidden=false;bar.value=0;
 try{
  worker=new Worker(new URL('./gif-worker.js',import.meta.url),{type:'module'});
  let awaiting=workerResponse(worker,controller.signal);
  worker.postMessage({type:'start',width,height,delay:100/fps});await awaiting;
  for(let i=0;i<frames;i++){
   const rgba=await framePixels(profile,i/fps,width,height,controller.signal);
   awaiting=workerResponse(worker,controller.signal);
   worker.postMessage({type:'frame',buffer:rgba.buffer},[rgba.buffer]);
   await awaiting;
   bar.value=Math.round((i+1)*100/frames);label.textContent=`Rendering GIF… ${bar.value}%`;
   // Let the browser paint progress and remain responsive to cancellation.
   await new Promise(requestAnimationFrame);
  }
  awaiting=workerResponse(worker,controller.signal);worker.postMessage({type:'finish'});
  const result=await awaiting;
  if(result?.type!=='done'||result.blob?.type!=='image/gif')throw Error('GIF could not be completed.');
  const url=URL.createObjectURL(result.blob),a=document.createElement('a');
  a.href=url;a.download=`profilecard-${(profile.username||'me').replace(/[^a-zA-Z0-9_-]/g,'_')}-${profile.format}.gif`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  toast('Your animated aura is ready!');
 }catch(error){if(error.name==='AbortError')toast('GIF export cancelled.');else{console.error('GIF export failed',error);toast('Could not export GIF on this device. Try again.');}}
 finally{worker?.terminate();gifAbort=null;button.disabled=false;progress.hidden=true;}
}

function installFlow(){
  $('installBtn').addEventListener('click',async()=>{
    if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone){toast('ProfileCard is already installed.');return;}
    if(deferredInstallPrompt){
      const event=deferredInstallPrompt;deferredInstallPrompt=null;
      try{await event.prompt();await event.userChoice;}catch{toast('Installation isn’t available right now.');}
      return;
    }
    const isIOS=/iP(hone|od|ad)/.test(navigator.userAgent);
    $('installInstructions').textContent=isIOS?'In Safari, tap the Share icon, then choose “Add to Home Screen”.':'Open your browser menu and select “Install app” or “Add to Home Screen”. Availability depends on your browser.';
    $('installDialog').showModal();
  });
  $('dismissInstall').addEventListener('click',()=>$('installDialog').close());
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('ProfileCard lives on your device now!');});
}

function activateTab(tab, {focus=false}={}) {
  if(!['identity','character','aura'].includes(tab))return;
  activeTab=tab;
  for(const button of document.querySelectorAll('[data-tab]')){
    const isActive=button.dataset.tab===tab;
    button.classList.toggle('active',isActive);
    button.setAttribute('aria-selected',String(isActive));
    button.tabIndex=isActive?0:-1;
    if(isActive&&focus)button.focus();
  }
  for(const panel of document.querySelectorAll('[data-panel]')){
    panel.hidden=panel.dataset.panel!==tab;
  }
  $('editorForm').scrollTop=0;
}

function events(){
  const tabs=[...document.querySelectorAll('[data-tab]')];
  for(const tab of tabs){
    tab.addEventListener('click',()=>activateTab(tab.dataset.tab));
    tab.addEventListener('keydown',event=>{
      const index=tabs.indexOf(tab);
      const direction=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
      if(!direction && event.key!=='Home' && event.key!=='End')return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+direction+tabs.length)%tabs.length;
      activateTab(tabs[next].dataset.tab,{focus:true});
    });
  }
  $('editorForm').addEventListener('submit',e=>e.preventDefault());
  $('nameInput').addEventListener('input',e=>{state.name=sanitizeText(e.target.value,MAX.name);refreshCard();});
  $('usernameInput').addEventListener('input',e=>{state.username=sanitizeText(e.target.value.replace(/^@+/,''),MAX.username-1);refreshCard();});
  $('usernameInput').addEventListener('blur',()=>{$('usernameInput').value='@'+state.username;});
  $('bioInput').addEventListener('input',e=>{state.bio=sanitizeText(e.target.value,MAX.bio);$('bioCount').textContent=`${state.bio.length} / ${MAX.bio}`;refreshCard();});
  $('characterMode').addEventListener('click',()=>{state.avatarMode='character';refreshControls();refreshCard({magical:true});});
  $('randomCharacterBtn').addEventListener('click',()=>{state.avatar=randomizeCharacter(state.avatar);state.avatarMode='character';refreshControls();refreshCard({magical:true});});
  $('photoMode').addEventListener('click',()=>{state.avatarMode='upload';refreshControls();refreshCard({magical:true});});
  $('avatarUpload').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{state.photo=await resizeImage(file);await dbAvatar('write',state.photo).catch(()=>{});refreshCard({magical:true});toast('Photo added — only saved on this device.');}
    catch(error){toast(error.message||'Could not open that image.');}
    e.target.value='';
  });
  for(const id of ['sceneColor','cardColor','accentColor']){
    $(id+'Input').addEventListener('input',e=>{state[id]=e.target.value.toUpperCase();$(id+'Value').textContent=state[id];state.theme='custom';drawPalettes();refreshCard();});
  }
  $('addTagBtn').addEventListener('click',addTag);
  $('tagInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addTag();}});
  $('squareBtn').addEventListener('click',()=>{state.format='square';refreshControls();refreshCard({magical:true});});
  $('wideBtn').addEventListener('click',()=>{state.format='wide';refreshControls();refreshCard({magical:true});});
  $('randomBtn').addEventListener('click',()=>{
    Object.assign(state,randomize(state));
    // Character, custom-uploaded photos, identity and format remain unchanged.
    refreshControls();refreshCard({magical:true});
  });
  $('downloadBtn').addEventListener('click',()=>exportImage(false));
  $('downloadGifBtn').addEventListener('click',exportGif);
  $('cancelGifBtn').addEventListener('click',()=>gifAbort?.abort());
  $('copyBtn').addEventListener('click',()=>exportImage(true));
  installFlow();
}

async function init(){
  refreshControls();events();activateTab(activeTab);refreshCard();
  try { const photo=await dbAvatar(); if(typeof photo==='string'&&photo.startsWith('data:image/')){state.photo=photo;refreshCard();} } catch { /* Settings work without IndexedDB. */ }
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}),{once:true});
  }
}
init();
