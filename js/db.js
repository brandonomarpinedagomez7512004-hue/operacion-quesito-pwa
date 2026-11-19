// js/db.js - Base de datos local con IndexedDB y la librería idb (Operación Quesito)

const DB_NAME = 'quesito-db';
const DB_VERSION = 1;
const STORE_NAME = 'partidas';

// Abre (o crea) la base de datos.
// "upgrade" solo se ejecuta si la base no existe o si sube el número de versión.
const dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      // keyPath 'id' = campo que identifica de forma única cada partida
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      console.log('[IndexedDB] Almacén "partidas" creado con éxito.');
    }
  }
});

// Guardar una partida (put crea el registro, o lo actualiza si el id ya existe)
async function guardarPartida(partida) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite'); // transacción de escritura
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

// Eliminar una partida por su id (clave primaria)
async function eliminarPartida(id) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
  console.log('[IndexedDB] Partida eliminada:', id);
}
