/* =========================================================
   LA LEY DEL GATO — clasificacion.js
   ========================================================= */

const API_URL = 'http://localhost:3000';
const miNombre = localStorage.getItem('nombre_usuario') || '';
const miAvatar = localStorage.getItem('avatar') || '🐭';

// Mostrar mi posición
document.getElementById('myName').textContent   = miNombre.toUpperCase() || '—';
document.getElementById('myAvatar').textContent = miAvatar;

/* ---------------------------------------------------------
   FILTROS
--------------------------------------------------------- */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cargarRanking(btn.dataset.filter);
  });
});

/* ---------------------------------------------------------
   CARGAR RANKING DESDE EL BACKEND
--------------------------------------------------------- */
async function cargarRanking(filtro = 'global') {
  const loading = document.getElementById('rankLoading');
  loading.style.display = 'inline';

  try {
    const res = await fetch(`${API_URL}/ranking?filtro=${filtro}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!res.ok) throw new Error();
    const data = await res.json();
    renderizarRanking(data.ranking || []);

  } catch {
    // Si falla el backend mostramos datos de demo
    renderizarRanking(datosDemo());
  } finally {
    loading.style.display = 'none';
  }
}

/* ---------------------------------------------------------
   DATOS DE DEMO mientras no hay backend
--------------------------------------------------------- */
function datosDemo() {
  return [
    { nombre_usuario: 'EL_PADRINO',    avatar: '🐭', puntuacion_total: 98500 },
    { nombre_usuario: 'SOMBRA_GRIS',   avatar: '🐀', puntuacion_total: 87200 },
    { nombre_usuario: 'RATA_VELOZ',    avatar: '🐹', puntuacion_total: 74600 },
    { nombre_usuario: 'TOPO_MAESTRO',  avatar: '🦔', puntuacion_total: 61300 },
    { nombre_usuario: 'BIGOTES_PROS',  avatar: '🐁', puntuacion_total: 55800 },
    { nombre_usuario: 'EL_ESCURRIDIZO',avatar: '🐿️', puntuacion_total: 48200 },
    { nombre_usuario: 'QUESO_HUNTER',  avatar: '🐭', puntuacion_total: 41700 },
    { nombre_usuario: 'NOCHE_FURTIVA', avatar: '🐀', puntuacion_total: 38900 },
    { nombre_usuario: 'RATA_CALLEJERA',avatar: '🐹', puntuacion_total: 32100 },
    { nombre_usuario: 'EL_NOVATO',     avatar: '🐁', puntuacion_total: 21500 },
  ];
}

/* ---------------------------------------------------------
   RENDERIZAR RANKING
--------------------------------------------------------- */
function renderizarRanking(ranking) {
  const tabla = document.getElementById('rankTable');
  tabla.innerHTML = '';

  if (!ranking.length) {
    tabla.innerHTML = '<div class="rank-empty">SIN DATOS DISPONIBLES</div>';
    return;
  }

  // Actualiza podio top 3
  [1,2,3].forEach(i => {
    const jugador = ranking[i-1];
    const el = document.getElementById('pos'+i);
    if (!el || !jugador) return;
    el.querySelector('.podio-avatar').textContent = jugador.avatar || '🐭';
    el.querySelector('.podio-name').textContent   = jugador.nombre_usuario?.toUpperCase() || '—';
    el.querySelector('.podio-score').textContent  = formatearPuntos(jugador.puntuacion_total) + ' PTS';
  });

  // Mi posición
  const miPos = ranking.findIndex(r => r.nombre_usuario === miNombre);
  if (miPos >= 0) {
    document.getElementById('myPos').textContent   = '#' + (miPos + 1);
    document.getElementById('myScore').textContent = formatearPuntos(ranking[miPos].puntuacion_total) + ' PTS';
  }

  // Tabla completa
  ranking.forEach((jugador, idx) => {
    const pos    = idx + 1;
    const esYo   = jugador.nombre_usuario === miNombre;
    const row    = document.createElement('div');
    row.className = 'rank-row' +
      (esYo ? ' me' : '') +
      (pos === 1 ? ' top1' : pos === 2 ? ' top2' : pos === 3 ? ' top3' : '');
    row.style.animationDelay = (idx * 0.03) + 's';

    const posClass = pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : '';
    const badge    = esYo ? '<span class="rank-badge">TÚ</span>' : '';
    const medal    = pos === 1 ? '👑' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos;

    row.innerHTML = `
      <div class="rank-pos ${posClass}">${medal}</div>
      <div class="rank-avatar">${jugador.avatar || '🐭'}</div>
      <div class="rank-name ${esYo ? 'me-name' : ''}">${jugador.nombre_usuario?.toUpperCase() || '—'} ${badge}</div>
      <div class="rank-score">${formatearPuntos(jugador.puntuacion_total)} PTS</div>
    `;
    tabla.appendChild(row);
  });
}

function formatearPuntos(n) {
  return Number(n || 0).toLocaleString('es-ES');
}

// Carga inicial
cargarRanking('global');