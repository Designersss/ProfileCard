/* Offline-first shell; update the version when releasing changes. */
const CACHE='profilecard-v1-3-20261009';
const SHELL=[
  './','./index.html','./styles.css',
  './src/app.js','./src/card.js','./src/characters.js','./src/utils.js',
  './src/gif.js','./src/gif-worker.js',
  './manifest.webmanifest','./assets/favicon.svg',
  './assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('profilecard-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request)));
});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
