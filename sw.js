// sw.js - Service Worker: precaché del App Shell + Cache First
const CACHE_NAME = 'quesito-shell-v2'; // sube la versión (v2, v3...) cada vez que cambies archivos

const ASSETS = [
  './', './index.html', './css/style.css', './js/app.js', './manifest.json',
  './images/logo.webp', './images/escenario.webp', './images/chetes.webp',
  './images/polvoron.webp', './images/lulu.webp', './images/icon-192.png', './images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(n => Promise.all(n.filter(x => x !== CACHE_NAME).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : new Response('', { status: 408 })))
  );
});
