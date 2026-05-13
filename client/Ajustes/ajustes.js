/* =========================================================
   LA LEY DEL GATO — ajustes.js (Versión TFG Limpia)
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

// --- Cargar nombre de sesión usando la llave correcta ---
const usuarioLogueado = localStorage.getItem('login_usuario') || 'INVITADO';
document.getElementById('sessionName').textContent = usuarioLogueado.toUpperCase();

/* ---------------------------------------------------------
   CARGAR AJUSTES GUARDADOS EN localStorage
--------------------------------------------------------- */
const ajustesDefault = {
  musica: true, 
  efectos: true, 
  volMusica: 70, 
  volEfectos: 85
};

function cargarAjustes() {
  const guardados = JSON.parse(localStorage.getItem('ajustes_gato') || '{}');
  return { ...ajustesDefault, ...guardados };
}

const ajustes = cargarAjustes();

// Aplica toggles
['musica','efectos'].forEach(key => {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (!el) return;
  if (ajustes[key]) el.classList.add('active');
  else el.classList.remove('active');
  
  el.addEventListener('click', () => {
    el.classList.toggle('active');
    ajustes[key] = el.classList.contains('active');
  });
});

// Aplica sliders
const volMusica = document.getElementById('volMusica');
const volEfectos = document.getElementById('volEfectos');
volMusica.value = ajustes.volMusica;
volEfectos.value = ajustes.volEfectos;
document.getElementById('volMusicaVal').textContent = ajustes.volMusica;
document.getElementById('volEfectosVal').textContent = ajustes.volEfectos;

volMusica.addEventListener('input', () => {
  ajustes.volMusica = volMusica.value;
  document.getElementById('volMusicaVal').textContent = volMusica.value;
});
volEfectos.addEventListener('input', () => {
  ajustes.volEfectos = volEfectos.value;
  document.getElementById('volEfectosVal').textContent = volEfectos.value;
});

/* ---------------------------------------------------------
   GUARDAR AJUSTES
--------------------------------------------------------- */
document.getElementById('btnGuardar').addEventListener('click', () => {
  localStorage.setItem('ajustes_gato', JSON.stringify(ajustes));
  const msg = document.getElementById('msgOk');
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 3000);
});

/* ---------------------------------------------------------
   MODAL DE CONFIRMACIÓN
--------------------------------------------------------- */
let accionPendiente = null;

function abrirModal(titulo, desc, accion) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalDesc').textContent  = desc;
  accionPendiente = accion;
  document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  accionPendiente = null;
}

document.getElementById('modalCancel').addEventListener('click', cerrarModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) cerrarModal();
});
document.getElementById('modalConfirm').addEventListener('click', () => {
  if (accionPendiente) accionPendiente();
  cerrarModal();
});

/* ---------------------------------------------------------
   CERRAR SESIÓN
--------------------------------------------------------- */
document.getElementById('btnLogout').addEventListener('click', () => {
  abrirModal(
    '¿CERRAR SESIÓN?',
    'Tendrás que volver a identificarte la próxima vez.',
    () => {
      localStorage.removeItem('token');
      localStorage.removeItem('login_usuario');
      localStorage.removeItem('avatar');
      // Borramos también el inventario local para que no lo vea otro
      localStorage.removeItem('inventario_local'); 
      window.location.href = '../login/login.html';
    }
  );
});

/* ---------------------------------------------------------
   REINICIAR PROGRESO
--------------------------------------------------------- */
document.getElementById('btnResetProgress').addEventListener('click', () => {
  abrirModal(
    '¿REINICIAR PROGRESO?',
    'Se borrará todo tu progreso, inventario y estadísticas. Esta acción es irreversible.',
    async () => {
      if (usuarioLogueado === 'INVITADO') {
         localStorage.removeItem('inventario_local');
         alert('Progreso local borrado.');
         return;
      }
      try {
        await fetch(`${API_URL}/usuarios/progreso`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ nombre_usuario: usuarioLogueado })
        });
        alert('Progreso borrado en el servidor.');
      } catch (err) {
        console.error(err);
      }
    }
  );
});

/* ---------------------------------------------------------
   ELIMINAR CUENTA
--------------------------------------------------------- */
document.getElementById('btnDeleteAccount').addEventListener('click', () => {
  abrirModal(
    '⚠ ELIMINAR CUENTA',
    '¡ATENCIÓN! Todos tus datos serán eliminados permanentemente del servidor.',
    async () => {
      if (usuarioLogueado === 'INVITADO') {
         alert('No estás registrado.');
         return;
      }
      try {
        await fetch(`${API_URL}/usuarios/cuenta`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ nombre_usuario: usuarioLogueado })
        });
        localStorage.clear();
        window.location.href = '../login/login.html';
      } catch (err) {
        console.error(err);
      }
    }
  );
});