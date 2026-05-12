/* =========================================================
   LA LEY DEL GATO — registro.js 
   ========================================================= */

const inputUsuario    = document.getElementById('u');
const inputEmail      = document.getElementById('e');
const inputContrasena = document.getElementById('p');
const inputConfirmar  = document.getElementById('c');
const btnRegistro     = document.getElementById('btn');
const togglePass      = document.getElementById('tp');
const msgError        = document.getElementById('mErr');
const msgSuccess      = document.getElementById('mOk');

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

// Array de referencia para convertir emoji a número (Importante para el backend)
const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

/* ---------------------------------------------------------
   LLUVIA GENERATIVA
--------------------------------------------------------- */
(function crearLluvia() {
  const container = document.getElementById('rain');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
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

/* ---------------------------------------------------------
   CARRUSEL DE AVATARES
--------------------------------------------------------- */
const avatarOptions          = document.querySelectorAll('.avatar-option');
const selectedAvatarDisplay  = document.getElementById('selectedAvatar');
const avatarCarousel         = document.getElementById('avatarCarousel');
const carouselTrack          = document.getElementById('carouselTrack');

const ITEM_WIDTH  = 50;
const ITEM_GAP    = 6;
const ITEM_STEP   = ITEM_WIDTH + ITEM_GAP;
const VISIBLES    = 2;
const TOTAL       = avatarOptions.length;

let selectedAvatar = '🐭';
let carouselIndex  = 0;

function actualizarCarrusel() {
  const maxIndex = Math.max(0, TOTAL - VISIBLES);
  carouselIndex  = Math.max(0, Math.min(carouselIndex, maxIndex));
  carouselTrack.style.transform = `translateX(-${carouselIndex * ITEM_STEP}px)`;
  document.getElementById('carouselPrev').style.opacity = carouselIndex === 0 ? '0.3' : '1';
  document.getElementById('carouselNext').style.opacity = carouselIndex >= maxIndex ? '0.3' : '1';
}

actualizarCarrusel();

selectedAvatarDisplay.addEventListener('click', () => {
  avatarCarousel.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!avatarCarousel.contains(e.target) && e.target !== selectedAvatarDisplay) {
    avatarCarousel.classList.remove('open');
  }
});

document.getElementById('carouselPrev').addEventListener('click', (e) => {
  e.stopPropagation();
  carouselIndex--;
  actualizarCarrusel();
});

document.getElementById('carouselNext').addEventListener('click', (e) => {
  e.stopPropagation();
  carouselIndex++;
  actualizarCarrusel();
});

avatarOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedAvatar = option.dataset.avatar;
    selectedAvatarDisplay.textContent = selectedAvatar;
    selectedAvatarDisplay.style.transition = 'transform 0.1s ease';
    selectedAvatarDisplay.style.transform  = 'scale(1.2)';
    setTimeout(() => { selectedAvatarDisplay.style.transform = 'scale(1)'; }, 200);
    avatarCarousel.classList.remove('open');
  });
});

/* ---------------------------------------------------------
   VALIDACIÓN Y FUERZA DE CONTRASEÑA
--------------------------------------------------------- */
const coloresFuerza   = ['#8c3030', '#8c6020', '#908020', '#3a8c30'];
const etiquetasFuerza = ['MUY DÉBIL', 'ACEPTABLE', 'BUENA', 'FUERTE'];

function actualizarHint(id, ok, typed) {
  const el = document.getElementById(id);
  el.classList.toggle('ok', ok);
  el.classList.toggle('er', typed && !ok);
  el.querySelector('.hico').textContent = ok ? '■' : (typed && !ok ? '✕' : '□');
}

function actualizarFuerza(valor) {
  let puntos = 0;
  if (valor.length >= 8) puntos++;
  if (/[A-Z]/.test(valor)) puntos++;
  if (/[0-9]/.test(valor)) puntos++;
  if (/[!@#$%^&*_\-]/.test(valor)) puntos++;

  [1, 2, 3, 4].forEach(i => {
    document.getElementById('s' + i).style.background =
      i <= puntos ? coloresFuerza[puntos - 1] : '#1a1403';
  });

  const etiqueta = document.getElementById('sl');
  etiqueta.textContent = valor ? (etiquetasFuerza[puntos - 1] || 'MUY DÉBIL') : 'INTRODUCE CONTRASEÑA';
  etiqueta.style.color = valor ? (coloresFuerza[puntos - 1] || coloresFuerza[0]) : '#2a1e08';
}

function validar() {
  const u = inputUsuario.value.trim();
  const e = inputEmail.value.trim();
  const p = inputContrasena.value;
  const c = inputConfirmar.value;
  
  const ut = u.length > 0;
  const et = e.length > 0;
  const pt = p.length > 0;
  const ct = c.length > 0;

  const uLongitud   = u.length >= 3 && u.length <= 20;
  const uCaracteres = /^[a-zA-Z0-9_]*$/.test(u) && !/\s/.test(u);
  actualizarHint('u1', uLongitud, ut);
  actualizarHint('u2', uCaracteres, ut);

  const eValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  actualizarHint('e1', eValido, et);

  const pLongitud  = p.length >= 8;
  const pMayuscula = /[A-Z]/.test(p);
  const pNumero    = /[0-9]/.test(p);
  const pEspecial  = /[!@#$%^&*_\-]/.test(p);
  actualizarHint('p1', pLongitud, pt);
  actualizarHint('p2', pMayuscula, pt);
  actualizarHint('p3', pNumero, pt);
  actualizarHint('p4', pEspecial, pt);
  actualizarFuerza(p);

  const coinciden = c === p && c.length > 0;
  actualizarHint('c1', coinciden, ct);

  const valido = uLongitud && uCaracteres && eValido && pLongitud && pMayuscula && pNumero && pEspecial && coinciden;
  btnRegistro.disabled = !valido;
  return valido;
}

inputUsuario.addEventListener('input', validar);
inputEmail.addEventListener('input', validar);
inputContrasena.addEventListener('input', validar);
inputConfirmar.addEventListener('input', validar);

/* ---------------------------------------------------------
   VER/OCULTAR CONTRASEÑA
--------------------------------------------------------- */
togglePass.addEventListener('click', () => {
  const mostrar = inputContrasena.type === 'password';
  inputContrasena.type = mostrar ? 'text' : 'password';
  inputConfirmar.type  = mostrar ? 'text' : 'password';
  togglePass.textContent = mostrar ? 'OOO' : 'VER';
});

/* ---------------------------------------------------------
   ENVÍO DEL REGISTRO
--------------------------------------------------------- */
btnRegistro.addEventListener('click', async () => {
  msgError.style.display   = 'none';
  msgSuccess.style.display = 'none';
  btnRegistro.disabled  = true;
  btnRegistro.innerHTML = 'CONECTANDO<span class="dots"></span>';

  try {
    // Convertir emoji a índice numérico para el backend. Si no lo encuentra, usa 0 (el ratón base).
    let avatarIndex = emojisAvatares.indexOf(selectedAvatar);
    if (avatarIndex === -1) avatarIndex = 0; 

    const respuesta = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_usuario: inputUsuario.value.trim(),
        email: inputEmail.value.trim(),
        contrasena: inputContrasena.value,
        avatar: avatarIndex 
      })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      // Guardamos algunos datos para que el login sepa quién acaba de registrarse
      localStorage.setItem('login_usuario', inputUsuario.value.trim()); 
      localStorage.setItem('avatar', avatarIndex);
      
      msgSuccess.style.display = 'block';
      msgSuccess.innerHTML = '▶ REGISTRO EXITOSO.';
      
      // Limpiar formulario
      inputUsuario.value    = '';
      inputEmail.value      = '';
      inputContrasena.value = '';
      inputConfirmar.value  = '';
      validar();
      
      // Redirigir al login
      setTimeout(() => { window.location.href = '../login/login.html'; }, 3000);
    } else {
      msgError.textContent   = '> ' + (datos.error || 'ERROR EN EL REGISTRO').toUpperCase();
      msgError.style.display = 'block';
    }
  } catch (error) {
    msgError.textContent   = '> ERROR: SERVIDOR NO DISPONIBLE O TIEMPO DE ESPERA AGOTADO.';
    msgError.style.display = 'block';
  }

  btnRegistro.innerHTML = '▶ UNIRSE A LA RESISTENCIA';
  if (!validar()) btnRegistro.disabled = true;
});