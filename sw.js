/* Service worker: guarda la aplicación para que abra sin internet.
   Si publicas cambios, sube de versión este número para que todos reciban la actualización. */
var VERSION = 'mezclador-dj-v1';
var ARCHIVOS = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'fonts/orbitron-latin-500-normal.woff2', 'fonts/orbitron-latin-700-normal.woff2', 'fonts/orbitron-latin-800-normal.woff2',
  'fonts/rajdhani-latin-500-normal.woff2', 'fonts/rajdhani-latin-600-normal.woff2', 'fonts/rajdhani-latin-700-normal.woff2',
  'fonts/share-tech-mono-latin-400-normal.woff2'
];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(ARCHIVOS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
/* Abre primero lo guardado (rápido y sin internet) y en segundo plano busca la versión nueva. */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(function(cache){
    return cache.match(req, {ignoreSearch:true}).then(function(hit){
      var red = fetch(req).then(function(res){ if(res && res.ok) cache.put(req, res.clone()); return res; }).catch(function(){ return hit; });
      return hit || red;
    });
  }));
});
