/* V51: cache only the app shell, never live audio streams. */
const CACHE='traviexo-shell-v51';
const SHELL=['/','/index.html','/assets/traviexo-radio-premium.PNG'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('traviexo-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const req=event.request;const url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.match('/index.html')));return;}if(url.pathname==='/assets/traviexo-radio-premium.PNG'){event.respondWith(caches.match(req).then(hit=>hit||fetch(req)));}});
