// Operación Quesito PWA - pantallas iguales a la app móvil (renderizado en el cliente, CSR)
const app = document.getElementById('app');

const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const personajes = [
  { nombre: 'Chetes', img: 'chetes', descripcion: 'Nuestro pequeño y valiente ratón protagonista. Su misión es recolectar todos los quesitos que pueda, superar obstáculos y llegar al puesto de quesadillas de la señora Lulú.' },
  { nombre: 'Polvorón', img: 'polvoron', descripcion: 'Un gato travieso que intentará impedir que Chetes complete su aventura. ¡Ten cuidado cuando aparezca en el camino!' },
  { nombre: 'Señora Lulú', img: 'lulu', descripcion: 'La encargada del famoso puesto de quesadillas. Es el destino final de Chetes y lo espera al terminar su aventura.' }
];

const volver = ''; // la barra superior ya navega entre pantallas

const pantallas = {
  home: () => `
    <section class="hero">
    <img class="logo" src="images/logo.webp" alt="Operación Quesito">
    <div class="hero-txt">
    <h1>OPERACIÓN QUESITO</h1>
    <p class="sub">¡Una aventura llena de queso!</p>
    <p class="texto">Acompaña a Chetes en una divertida aventura. Recolecta quesitos, esquiva a Polvorón y llega al puesto de quesadillas de la señora Lulú.</p>
    <a class="btn" href="#personajes">🐭 Conoce a los personajes</a>
    <a class="btn verde" href="#historia">📖 Historia del videojuego</a>
    <a class="btn cafe" href="#ranking">🏆 Ranking de jugadores</a>
    </div></section>`,

  personajes: () => `
    <h2>🐭 Nuestros personajes</h2>
    <p class="texto">¡Conoce a los protagonistas de esta aventura!</p>
    <div class="grid">${personajes.map(p => `
      <article class="card personaje">
        <img src="images/${p.img}.webp" alt="${esc(p.nombre)}">
        <h3>${esc(p.nombre)}</h3>
        <p>${esc(p.descripcion)}</p>
      </article>`).join('')}</div>${volver}`,

  historia: () => `
    <div class="angosto"><h2>📖 Nuestra historia</h2>
    <article class="card">
      <h3>🐭 Operación Quesito</h3>
      <p>Chetes es un pequeño ratón que emprende una aventura para recolectar deliciosos quesitos y llegar al puesto de quesadillas de la señora Lulú.

Pero su camino no será sencillo: Polvorón, un travieso gato, intentará detenerlo.

Para cumplir su misión, Chetes deberá saltar obstáculos, evitar enemigos y reunir tantos quesitos como pueda.</p>
    </article>
    <h2>🎮 ¿Cómo se juega?</h2>
    <article class="card">
      <p>🧀 Recolecta quesitos para sumar puntos.

🐱 Evita a Polvorón y los obstáculos.

🐭 Supera los desafíos del escenario.

🏁 Llega a tu destino y consigue la mejor puntuación.</p>
    </article>
    <img class="escenario" src="images/escenario.webp" alt="Escenario de la aventura"></div>${volver}`,

  ranking: () => `
    <h2>🏆 Ranking de jugadores</h2>
    <p class="texto">¡Los mejores recolectores de quesitos!</p>
    <form id="form-partida" class="card form" autocomplete="off">
      <h3>➕ Registrar partida</h3>
      <label>Jugador<input id="f-jugador" required maxlength="20"></label>
      <label>Puntuación<input id="f-puntos" type="number" min="0" max="999999" required></label>
      <label>Progreso (%)<input id="f-progreso" type="number" min="0" max="100" required></label>
      <label>Tiempo (segundos)<input id="f-tiempo" type="number" min="0" max="86400" required></label>
      <button class="btn" type="submit">Guardar partida</button>
      <p id="estado-red" class="meta"></p>
    </form>
    <div id="lista-ranking" class="grid grid-r"></div>`
};

// ---- Ranking conectado a IndexedDB (CRUD offline) ----
async function cargarRanking() {
  const cont = document.getElementById('lista-ranking');
  if (!cont) return;
  const lista = (await obtenerPartidas()).sort((a, b) => b.puntuacion - a.puntuacion); // Read
  if (!lista.length) { cont.innerHTML = '<p class="texto">Aún no hay partidas guardadas.</p>'; return; }
  const medallas = ['🥇', '🥈', '🥉'];
  cont.innerHTML = lista.map((j, i) => `
    <article class="card">
      <div class="fila">
        <span class="medalla">${medallas[i] || (i + 1) + '.'}</span>
        <span class="jugador">${esc(j.jugador)}</span>
        <span class="pts">${Number(j.puntuacion)} pts</span>
        <button class="borrar" data-id="${esc(j.id)}" aria-label="Borrar partida de ${esc(j.jugador)}">🗑️</button>
      </div>
      <div class="meta">Progreso: ${Number(j.progreso)}% · Tiempo: ${mmss(Number(j.tiempo))}</div>
      <div class="barra"><span style="width:${Number(j.progreso)}%"></span></div>
    </article>`).join('');
}

function actualizarRed() {
  const el = document.getElementById('estado-red');
  if (el) el.textContent = navigator.onLine ? '🟢 Con conexión' : '🔴 Sin conexión: las partidas se guardan en este dispositivo';
}
window.addEventListener('online', actualizarRed);
window.addEventListener('offline', actualizarRed);

function iniciarRanking() {
  cargarRanking();
  actualizarRed();
  document.getElementById('form-partida').addEventListener('submit', async e => {
    e.preventDefault(); // evita recargar la página
    const partida = {
      id: Date.now().toString(), // clave primaria única
      jugador: document.getElementById('f-jugador').value.trim(),
      puntuacion: Number(document.getElementById('f-puntos').value),
      progreso: Number(document.getElementById('f-progreso').value),
      tiempo: Number(document.getElementById('f-tiempo').value),
      fecha: new Date().toISOString()
    };
    if (!partida.jugador) return;
    await guardarPartida(partida);   // Create: se guarda en IndexedDB
    e.target.reset();
    await cargarRanking();           // la pantalla se actualiza leyendo la base
  });
  document.getElementById('lista-ranking').addEventListener('click', async e => {
    const boton = e.target.closest('.borrar');
    if (!boton) return;
    await eliminarPartida(boton.dataset.id); // Delete
    await cargarRanking();
  });
}

function mostrar() {
  const ruta = location.hash.slice(1);
  app.innerHTML = (pantallas[ruta] || pantallas.home)();
  document.querySelectorAll('nav a').forEach(a => a.toggleAttribute('aria-current', a.hash === '#' + (pantallas[ruta] ? ruta : 'home')));
  window.scrollTo(0, 0);
  if (ruta === 'ranking') iniciarRanking();
}
window.addEventListener('hashchange', mostrar);
mostrar();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.error('SW falló:', err));
  });
}
