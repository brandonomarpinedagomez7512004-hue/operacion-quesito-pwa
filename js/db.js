// js/db.js - Base de datos local con IndexedDB y cola de sincronización (Operación Quesito)

const DB_NAME = 'quesito-db';
const DB_VERSION = 2; // Subimos la versión a 2 para disparar el upgrade
const STORE_NAME = 'partidas';
const SYNC_STORE_NAME = 'sync-partidas'; // Almacén de cola offline

const dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Versión 1: Almacén principal de partidas
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      console.log('[IndexedDB] Almacén "partidas" creado con éxito.');
    }
    // Versión 2: Almacén de cola para sincronización en segundo plano
    if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
      db.createObjectStore(SYNC_STORE_NAME, { keyPath: 'id' });
      console.log('[IndexedDB] Almacén de sincronización "sync-partidas" creado.');
    }
  }
});

// Guardar una partida en el almacén principal
async function guardarPartida(partida) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).put(partida);
  await tx.done;
  console.log('[IndexedDB] Partida guardada:', partida.id);
  return partida;
}

// Consultar todas las partidas guardadas
async function obtenerPartidas() {
  const db = await dbPromise;
  return await db.getAll(STORE_NAME);
}

// Eliminar una partida por su id
async function eliminarPartida(id) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
  console.log('[IndexedDB] Partida eliminada:', id);
}

// ---- Funciones auxiliares para la cola de Background Sync ----
async function guardarPartidaSincronizacion(partida) {
  const db = await dbPromise;
  const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
  await tx.objectStore(SYNC_STORE_NAME).put(partida);
  await tx.done;
  console.log('[IndexedDB] Partida encolada para sincronización:', partida.id);
}

async function obtenerPartidasSincronizacion() {
  const db = await dbPromise;
  return await db.getAll(SYNC_STORE_NAME);
}

async function borrarPartidaSincronizacion(id) {
  const db = await dbPromise;
  const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
  await tx.objectStore(SYNC_STORE_NAME).delete(id);
  await tx.done;
}