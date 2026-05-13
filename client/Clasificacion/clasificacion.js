/* =========================================================
   LA LEY DEL GATO — clasificacion.js
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';
const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

// Leer nombre de forma consistente con el resto de páginas
const miNombre = localStorage.getItem('nombre_usuario')
              || localStorage.getItem('login_usuario')
              || 'AGENTE';

const miAvatarIndex = parseInt(localStorage.getItem('avatar')) || 0;

document.getElementById('myName').textContent   = miNombre.toUpperCase();
document.getElementById('myAvatar').textContent = emojisAvatares[miAvatarIndex] || '🐭';

async function cargarRanking() {
  const loading = document.getElementById('rankLoading');
  loading.style.display = 'inline';

  try {
    const res  = await fetch(`${API_URL}/usuarios/ranking`);
    const data = await res.json();

    if (res.ok && data.ranking) {
      renderizarRanking(data.ranking);
    } else {
      document.getElementById('rankTable').innerHTML =
        '<div class="rank-empty">SIN DATOS DISPONIBLES</div>';
    }
  } catch (err) {
    console.error('Error al cargar el ranking:', err);
    document.getElementById('rankTable').innerHTML =
      '<div class="rank-empty">ERROR DE CONEXIÓN</div>';
  } finally {
    loading.style.display = 'none';
  }
}

function renderizarRanking(ranking) {
  const tabla = document.getElementById('rankTable');
  tabla.innerHTML = '';

  if (!ranking.length) {
    tabla.innerHTML = '<div class="rank-empty">AÚN NO HAY AGENTES REGISTRADOS</div>';
    return;
  }

  // Rellenar el Podio (Top 3)
  [1, 2, 3].forEach(i => {
    const jugador = ranking[i - 1];
    const el = document.getElementById('pos' + i);
    if (!el) return;

    if (jugador) {
      const avatarIdx = parseInt(jugador.avatar) || 0;
      el.querySelector('.podio-avatar').textContent = emojisAvatares[avatarIdx] || '🐭';
      el.querySelector('.podio-name').textContent   = jugador.nombre_usuario.toUpperCase();
      el.querySelector('.podio-score').textContent  = jugador.puntuacion_total.toLocaleString('es-ES') + ' PTS';
    } else {
      el.style.opacity = '0.3';
    }
  });

  // Mi posición real en la lista
  const miPosIdx = ranking.findIndex(r => r.nombre_usuario === miNombre);
  if (miPosIdx >= 0) {
    document.getElementById('myPos').textContent   = '#' + (miPosIdx + 1);
    document.getElementById('myScore').textContent = ranking[miPosIdx].puntuacion_total.toLocaleString('es-ES') + ' PTS';
  } else {
    document.getElementById('myPos').textContent   = '#—';
    document.getElementById('myScore').textContent = '0 PTS';
  }

  // Tabla completa
  ranking.forEach((jugador, idx) => {
    const row  = document.createElement('div');
    const esYo = jugador.nombre_usuario === miNombre;
    const pos  = idx + 1;
    const avatarIdx = parseInt(jugador.avatar) || 0;

    row.className = `rank-row${esYo ? ' me' : ''}${pos <= 3 ? ' top' + pos : ''}`;
    row.style.animationDelay = (idx * 0.04) + 's';

    row.innerHTML = `
      <div class="rank-pos ${pos <= 3 ? 'p' + pos : ''}">${pos <= 3 ? ['👑','🥈','🥉'][pos-1] : pos}</div>
      <div class="rank-avatar">${emojisAvatares[avatarIdx] || '🐭'}</div>
      <div class="rank-name ${esYo ? 'me-name' : ''}">${jugador.nombre_usuario.toUpperCase()}${esYo ? ' <span class="rank-badge">TÚ</span>' : ''}</div>
      <div class="rank-score">${jugador.puntuacion_total.toLocaleString('es-ES')} PTS</div>
    `;
    tabla.appendChild(row);
  });
}

cargarRanking();