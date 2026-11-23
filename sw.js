// sw.js - Service Worker: precaché del App Shell + Cache First + Background Sync
importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/umd.js');

const CACHE_NAME = 'quesito-shell-v5'; // Subimos a v5 para actualizar los archivos cacheados

const IDB_CDN = 'https://cdn.jsdelivr.net/npm/idb@7/build/umd.js';

const ASSETS = [
  './', './index.html', './css/style.css', './js/app.js', './js/db.js', './manifest.json',
  './images/logo.webp', './images/escenario.webp', './images/chetes.webp',
  './images/polvoron.webp', './images/lulu.webp', './images/icon-192.png', './images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS).then(() => c.add(IDB_CDN).catch(e => console.warn('SW: no se guardó idb', e.message))))
      .then(() => self.skipWaiting())
  );
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
      if (res.ok) {
        const copia = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : new Response('', { status: 408 })))
  );
});

// ---- Escucha del evento sync para Background Sync API ----
self.addEventListener('sync', event => {
  console.log('[SW] Evento Sync disparado:', event.tag);

  if (event.tag === 'sync-nuevas-partidas') {
    event.waitUntil(enviarPartidasEncoladas());
  }
});

async function enviarPartidasEncoladas() {
  try {
    const db = await idb.openDB('quesito-db', 2);
    const partidasPendientes = await db.getAll('sync-partidas');

    console.log(`[SW] Procesando ${partidasPendientes.length} partidas pendientes...`);

    for (const partida of partidasPendientes) {
      try {
        // Simulación de llamada HTTP hacia el servidor / Firebase
        console.log('[SW] Sincronizando partida con el servidor ->', partida.jugador, `${partida.puntuacion} pts`);

        // Una vez confirmado el envío, la eliminamos de la cola
        const tx = db.transaction('sync-partidas', 'readwrite');
        await tx.objectStore('sync-partidas').delete(partida.id);
        await tx.done;
        console.log(`[SW] Partida ${partida.id} sincronizada y eliminada de la cola.`);
      } catch (errorEnvio) {
        console.error('[SW] Error al enviar partida individual:', errorEnvio);
        throw errorEnvio; // Permite que el navegador reintente después
      }
    }
  } catch (error) {
    console.error('[SW] Error general en el proceso de Background Sync:', error);
    throw error;
  }
}