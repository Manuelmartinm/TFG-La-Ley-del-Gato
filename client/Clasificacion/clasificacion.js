const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';
const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

const miNombre = localStorage.getItem('login_usuario') || 'AGENTE';
const miAvatarIndex = localStorage.getItem('avatar') || 0;

// Carga inicial de mi tarjeta
document.getElementById('myName').textContent = miNombre.toUpperCase();
document.getElementById('myAvatar').textContent = emojisAvatares[parseInt(miAvatarIndex)];

async function cargarRanking() {
    const loading = document.getElementById('rankLoading');
    loading.style.display = 'inline';

    try {
        const res = await fetch(`${API_URL}/usuarios/ranking`);
        const data = await res.json();
        
        if (res.ok) {
            renderizarRanking(data.ranking);
        }
    } catch (err) {
        console.error("Error al cargar el ranking real");
        document.getElementById('rankTable').innerHTML = '<div class="rank-empty">ERROR DE CONEXIÓN</div>';
    } finally {
        loading.style.display = 'none';
    }
}

function renderizarRanking(ranking) {
    const tabla = document.getElementById('rankTable');
    tabla.innerHTML = '';

    // 1. Rellenar el Podio (Top 3)
    [1, 2, 3].forEach(i => {
        const jugador = ranking[i - 1];
        const el = document.getElementById('pos' + i);
        if (el) {
            if (jugador) {
                el.querySelector('.podio-avatar').textContent = emojisAvatares[jugador.avatar] || '🐭';
                el.querySelector('.podio-name').textContent = jugador.nombre_usuario.toUpperCase();
                el.querySelector('.podio-score').textContent = jugador.puntuacion_total.toLocaleString() + ' PTS';
            } else {
                el.style.opacity = "0.3"; // Si no hay suficientes jugadores
            }
        }
    });

    // 2. Mi posición real en la lista
    const miPosIdx = ranking.findIndex(r => r.nombre_usuario === miNombre);
    if (miPosIdx >= 0) {
        document.getElementById('myPos').textContent = '#' + (miPosIdx + 1);
        document.getElementById('myScore').textContent = ranking[miPosIdx].puntuacion_total.toLocaleString() + ' PTS';
    }

    // 3. Tabla completa
    ranking.forEach((jugador, idx) => {
        const row = document.createElement('div');
        const esYo = jugador.nombre_usuario === miNombre;
        const pos = idx + 1;

        row.className = `rank-row ${esYo ? 'me' : ''} ${pos <= 3 ? 'top' + pos : ''}`;
        
        row.innerHTML = `
            <div class="rank-pos">${pos <= 3 ? ['👑','🥈','🥉'][pos-1] : pos}</div>
            <div class="rank-avatar">${emojisAvatares[jugador.avatar] || '🐭'}</div>
            <div class="rank-name">${jugador.nombre_usuario.toUpperCase()} ${esYo ? '<span class="rank-badge">TÚ</span>' : ''}</div>
            <div class="rank-score">${jugador.puntuacion_total.toLocaleString()} PTS</div>
        `;
        tabla.appendChild(row);
    });
}

// Iniciar
cargarRanking();