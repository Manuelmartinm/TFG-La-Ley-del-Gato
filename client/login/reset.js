/* =========================================================
   LA LEY DEL GATO — reset.js
   ========================================================= */

const inputPass1 = document.getElementById('p1');
const inputPass2 = document.getElementById('p2');
const btnSubmit  = document.getElementById('btn');
const togglePass = document.getElementById('tp');
const msgError   = document.getElementById('mErr');
const msgSuccess = document.getElementById('mOk');

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

// 1. Extraer el token de la URL (ej: ?token=abc123xyz)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Si no hay token, bloqueamos la pantalla
if (!token) {
  msgError.textContent = '> ERROR CRÍTICO: NO SE HA DETECTADO TOKEN DE SEGURIDAD.';
  msgError.style.display = 'block';
  inputPass1.disabled = true;
  inputPass2.disabled = true;
}

// 2. Efecto de lluvia (reutilizado)
(function crearLluvia() {
  const container = document.getElementById('rain');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.cssText = `
      left: ${Math.random() * 100}%;
      height: ${10 + Math.random() * 30}px;
      opacity: ${0.1 + Math.random() * 0.3};
      animation-duration: ${0.8 + Math.random() * 1.4}s;
      animation-delay: ${Math.random() * 2}s;
    `;
    container.appendChild(drop);
  }
})();

// 3. Mostrar/Ocultar contraseñas
togglePass.addEventListener('click', () => {
  const mostrar = inputPass1.type === 'password';
  inputPass1.type = mostrar ? 'text' : 'password';
  inputPass2.type = mostrar ? 'text' : 'password';
  togglePass.textContent = mostrar ? 'OOO' : 'VER';
});

// 4. Validación en tiempo real
function validarPasswords() {
  const p1 = inputPass1.value;
  const p2 = inputPass2.value;

  // Requisitos mínimos (puedes ajustarlos a los de tu registro)
  const esValida = p1.length >= 8 && p1 === p2;
  
  if (token) {
    btnSubmit.disabled = !esValida;
  }
}

inputPass1.addEventListener('input', validarPasswords);
inputPass2.addEventListener('input', validarPasswords);

// 5. Enviar la nueva contraseña al backend
btnSubmit.addEventListener('click', async () => {
  msgError.style.display = 'none';
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = 'PROCESANDO<span class="dots"></span>';

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/restablecer-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token: token, 
        nueva_contrasena: inputPass1.value 
      })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      msgSuccess.style.display = 'block';
      inputPass1.disabled = true;
      inputPass2.disabled = true;
      
      // Redirigir al login tras 2 segundos
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      
    } else {
      msgError.textContent = '> ' + (datos.error || 'ERROR AL ACTUALIZAR').toUpperCase();
      msgError.style.display = 'block';
      btnSubmit.innerHTML = 'ACTUALIZAR CREDENCIALES';
      btnSubmit.disabled = false;
    }

  } catch (error) {
    msgError.textContent = '> ERROR: SERVIDOR NO DISPONIBLE';
    msgError.style.display = 'block';
    btnSubmit.innerHTML = 'ACTUALIZAR CREDENCIALES';
    btnSubmit.disabled = false;
  }
});