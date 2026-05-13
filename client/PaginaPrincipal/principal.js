   /* =========================================================
   LA LEY DEL GATO — principal.js
   ========================================================= */

// NOTA: este script se carga con <script src="principal.js"> en el <head>
// por eso usamos DOMContentLoaded en vez de window.onload
document.addEventListener('DOMContentLoaded', function () {

  const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

  // Leer nombre — primero nombre_usuario, fallback a login_usuario
  const nombre = localStorage.getItem('nombre_usuario')
              || localStorage.getItem('login_usuario')
              || 'AGENTE_01';

  document.getElementById('agentName').textContent = nombre.toUpperCase();

  // Avatar
  let avatarIndex = parseInt(localStorage.getItem('avatar'));
  if (isNaN(avatarIndex) || avatarIndex < 0 || avatarIndex >= emojisAvatares.length) {
    avatarIndex = 0;
  }
  document.getElementById('agentAvatar').textContent = emojisAvatares[avatarIndex];

  // Música — AudioCore se carga DESPUÉS de este script en el HTML,
  // así que esperamos al primer evento de usuario para no romper nada
  document.body.addEventListener('click', function iniciarMusica() {
    if (typeof AudioCore !== 'undefined') {
      AudioCore.playMusic('principal');
    }
    document.body.removeEventListener('click', iniciarMusica);
  }, { once: true });

  // Intentar reproducir igualmente (puede fallar por política de autoplay, es normal)
  setTimeout(() => {
    if (typeof AudioCore !== 'undefined') {
      AudioCore.playMusic('principal');
    }
  }, 100);

});

    