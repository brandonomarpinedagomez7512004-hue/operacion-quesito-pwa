// Operación Quesito PWA - pantallas iguales a la app móvil (renderizado en el cliente, CSR)
const app = document.getElementById('app');

const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const personajes = [
  { nombre: 'Chetes', img: 'chetes', descripcion: 'Nuestro pequeño y valiente ratón protagonista. Su misión es recolectar todos los quesitos que pueda, superar obstáculos y llegar al puesto de quesadillas de la señora Lulú.' },
  { nombre: 'Polvorón', img: 'polvoron', descripcion: 'Un gato travieso que intentará impedir que Chetes complete su aventura. ¡Ten cuidado cuando aparezca en el camino!' },
  { nombre: 'Señora Lulú', img: 'lulu', descripcion: 'La encargada del famoso puesto de quesadillas. Es el destino final de Chetes y lo espera al terminar su aventura.' }
];

// Datos de prueba (después vendrán de IndexedDB). progreso = % del nivel, tiempo = segundos
const partidas = [
  { jugador: 'ChetesFan', puntuacion: 1500, progreso: 100, tiempo: 312 },
  { jugador: 'QuesitoMaster', puntuacion: 1200, progreso: 85, tiempo: 275 },
  { jugador: 'Polvoron123', puntuacion: 950, progreso: 70, tiempo: 240 },
  { jugador: 'LuluGamer', puntuacion: 800, progreso: 55, tiempo: 198 },
  { jugador: 'Ratoncito', puntuacion: 650, progreso: 40, tiempo: 160 },
  { jugador: 'SuperQueso', puntuacion: 500, progreso: 25, tiempo: 95 }
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

  ranking: () => {
    const medallas = ['🥇', '🥈', '🥉'];
    const lista = [...partidas].sort((a, b) => b.puntuacion - a.puntuacion);
    return `
      <h2>🏆 Ranking de jugadores</h2>
      <p class="texto">¡Los mejores recolectores de quesitos!</p>
      <div class="grid grid-r">${lista.map((j, i) => `
        <article class="card">
          <div class="fila">
            <span class="medalla">${medallas[i] || (i + 1) + '.'}</span>
            <span class="jugador">${esc(j.jugador)}</span>
            <span class="pts">${j.puntuacion} pts</span>
          </div>
          <div class="meta">Progreso: ${j.progreso}% · Tiempo: ${mmss(j.tiempo)}</div>
          <div class="barra"><span style="width:${Number(j.progreso)}%"></span></div>
        </article>`).join('')}</div>${volver}`;
  }
};

function mostrar() {
  const ruta = location.hash.slice(1);
  app.innerHTML = (pantallas[ruta] || pantallas.home)();
  document.querySelectorAll('nav a').forEach(a => a.toggleAttribute('aria-current', a.hash === '#' + (pantallas[ruta] ? ruta : 'home')));
  window.scrollTo(0, 0);
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
