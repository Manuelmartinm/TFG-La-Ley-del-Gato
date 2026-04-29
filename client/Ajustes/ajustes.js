/* =========================================================
   LA LEY DEL GATO — ajustes.js
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

// --- Cargar nombre de sesión ---
const nombre = localStorage.getItem('nombre_usuario') || '—';
document.getElementById('sessionName').textContent = nombre.toUpperCase();

/* ---------------------------------------------------------
   CARGAR AJUSTES GUARDADOS EN localStorage
--------------------------------------------------------- */
const ajustesDefault = {
  musica: true, efectos: true, scanlines: true,
  particulas: true, notificaciones: true,
  daltonico: false, fps: false,
  volMusica: 70, volEfectos: 85,
  calidad: 'media', idioma: 'es'
};

function cargarAjustes() {
  const guardados = JSON.parse(localStorage.getItem('ajustes') || '{}');
  return { ...ajustesDefault, ...guardados };
}

const ajustes = cargarAjustes();

// Aplica toggles
['musica','efectos','scanlines','particulas','notificaciones','daltonico','fps'].forEach(key => {
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

// Aplica selects
document.getElementById('calidad').value = ajustes.calidad;
document.getElementById('idioma').value  = ajustes.idioma;
document.getElementById('calidad').addEventListener('change', e => { ajustes.calidad = e.target.value; });
document.getElementById('idioma').addEventListener('change',  e => { ajustes.idioma  = e.target.value; });

/* ---------------------------------------------------------
   GUARDAR AJUSTES
--------------------------------------------------------- */
document.getElementById('btnGuardar').addEventListener('click', () => {
  localStorage.setItem('ajustes', JSON.stringify(ajustes));
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
      localStorage.removeItem('nombre_usuario');
      localStorage.removeItem('avatar');
      localStorage.removeItem('email');
      localStorage.removeItem('email_verificado');
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
    'Se borrará todo tu progreso, misiones y estadísticas. Esta acción es irreversible.',
    async () => {
      try {
        await fetch(`${API_URL}/usuarios/progreso`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } catch {}
    }
  );
});

/* ---------------------------------------------------------
   ELIMINAR CUENTA
--------------------------------------------------------- */
document.getElementById('btnDeleteAccount').addEventListener('click', () => {
  abrirModal(
    '⚠ ELIMINAR CUENTA',
    '¡ATENCIÓN! Todos tus datos, progreso e inventario serán eliminados permanentemente.',
    async () => {
      try {
        await fetch(`${API_URL}/usuarios/cuenta`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        localStorage.clear();
        window.location.href = '../login/login.html';
      } catch {}
    }
  );
});