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
    AudioCore.playSFX('click');
    el.classList.toggle('active');
    ajustes[key] = el.classList.contains('active');
  });
});

/* =========================================================
   LA LEY DEL GATO — ajustes.js
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

// Leer nombre — mismo orden que el resto de páginas
const usuarioLogueado = localStorage.getItem('nombre_usuario')
                     || localStorage.getItem('login_usuario')
                     || 'INVITADO';

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
['musica', 'efectos'].forEach(key => {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (!el) return;
  if (ajustes[key]) el.classList.add('active');
  else el.classList.remove('active');

  el.addEventListener('click', () => {
    if (typeof AudioCore !== 'undefined') AudioCore.playSFX('click');
    el.classList.toggle('active');
    ajustes[key] = el.classList.contains('active');
  });
});

// Aplica sliders
const volMusica  = document.getElementById('volMusica');
const volEfectos = document.getElementById('volEfectos');
volMusica.value  = ajustes.volMusica;
volEfectos.value = ajustes.volEfectos;
document.getElementById('volMusicaVal').textContent  = ajustes.volMusica;
document.getElementById('volEfectosVal').textContent = ajustes.volEfectos;

volMusica.addEventListener('input', () => {
  ajustes.volMusica = volMusica.value;
  document.getElementById('volMusicaVal').textContent = volMusica.value;
  if (typeof AudioCore !== 'undefined') AudioCore.actualizarVolumenes();
});
volEfectos.addEventListener('input', () => {
  ajustes.volEfectos = volEfectos.value;
  document.getElementById('volEfectosVal').textContent = volEfectos.value;
  if (typeof AudioCore !== 'undefined') AudioCore.actualizarVolumenes();
});

/* ---------------------------------------------------------
   GUARDAR AJUSTES
--------------------------------------------------------- */
document.getElementById('btnGuardar').addEventListener('click', () => {
  if (typeof AudioCore !== 'undefined') AudioCore.playSFX('click');
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
      localStorage.clear();
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
      const rol = localStorage.getItem('rol');
      if (rol === 'ANONIMO' || usuarioLogueado === 'INVITADO') {
        localStorage.removeItem('inventario_local');
        localStorage.setItem('monedas', '0');
        localStorage.setItem('puntuacion_total', '0');
        alert('Progreso local borrado.');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/usuarios/progreso`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_usuario: usuarioLogueado })
        });
        if (res.ok) {
          localStorage.setItem('monedas', '0');
          localStorage.setItem('puntuacion_total', '0');
          localStorage.removeItem('inventario_local');
          alert('Progreso borrado correctamente.');
        } else {
          alert('Error al borrar el progreso en el servidor.');
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor.');
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
      const rol = localStorage.getItem('rol');
      if (rol === 'ANONIMO' || usuarioLogueado === 'INVITADO') {
        alert('No estás registrado con una cuenta real.');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/usuarios/cuenta`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_usuario: usuarioLogueado })
        });
        if (res.ok) {
          localStorage.clear();
          window.location.href = '../login/login.html';
        } else {
          alert('Error al eliminar la cuenta.');
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor.');
      }
    }
  );
});