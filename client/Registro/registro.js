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

const API_URL = 'http://localhost:3000';

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

// Medidas: cada item es 50px de ancho + 6px de gap
const ITEM_WIDTH  = 50;
const ITEM_GAP    = 6;
const ITEM_STEP   = ITEM_WIDTH + ITEM_GAP; // 56px por posición
const VISIBLES    = 2;                     // items visibles a la vez
const TOTAL       = avatarOptions.length;  // 6 avatares

let selectedAvatar = '🐭';
let carouselIndex  = 0;      // índice del primer item visible (0-based)

// Aplica el desplazamiento del track sin sobrepasar los límites
function actualizarCarrusel() {
  const maxIndex = Math.max(0, TOTAL - VISIBLES); // 4
  carouselIndex  = Math.max(0, Math.min(carouselIndex, maxIndex));
  carouselTrack.style.transform = `translateX(-${carouselIndex * ITEM_STEP}px)`;

  // Deshabilitar flechas en los extremos para dar feedback visual
  document.getElementById('carouselPrev').style.opacity = carouselIndex === 0        ? '0.3' : '1';
  document.getElementById('carouselNext').style.opacity = carouselIndex >= maxIndex  ? '0.3' : '1';
}

// Inicializar estado de flechas
actualizarCarrusel();

// Abrir/cerrar carrusel al hacer clic en el avatar
selectedAvatarDisplay.addEventListener('click', () => {
  avatarCarousel.classList.toggle('open');
});

// Cerrar carrusel si se hace clic fuera de él
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

// Seleccionar un avatar del carrusel
avatarOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedAvatar = option.dataset.avatar;
    selectedAvatarDisplay.textContent = selectedAvatar;

    // Efecto de rebote al seleccionar
    selectedAvatarDisplay.style.transition = 'transform 0.1s ease';
    selectedAvatarDisplay.style.transform  = 'scale(1.2)';
    setTimeout(() => { selectedAvatarDisplay.style.transform = 'scale(1)'; }, 200);

    avatarCarousel.classList.remove('open');
  });
});

/* ---------------------------------------------------------
   VALIDACIÓN EN TIEMPO REAL
--------------------------------------------------------- */
const coloresFuerza   = ['#8c3030', '#8c6020', '#908020', '#3a8c30'];
const etiquetasFuerza = ['MUY DÉBIL', 'ACEPTABLE', 'BUENA', 'FUERTE'];

// Actualiza el icono y color de un indicador de requisito
function actualizarHint(id, ok, typed) {
  const el = document.getElementById(id);
  el.classList.toggle('ok', ok);
  el.classList.toggle('er', typed && !ok);
  el.querySelector('.hico').textContent = ok ? '■' : (typed && !ok ? '✕' : '□');
}

// Actualiza la barra de fuerza de contraseña
function actualizarFuerza(valor) {
  let puntos = 0;
  if (valor.length >= 8)            puntos++;
  if (/[A-Z]/.test(valor))          puntos++;
  if (/[0-9]/.test(valor))          puntos++;
  if (/[!@#$%^&*_\-]/.test(valor)) puntos++;

  [1, 2, 3, 4].forEach(i => {
    document.getElementById('s' + i).style.background =
      i <= puntos ? coloresFuerza[puntos - 1] : '#1a1403';
  });

  const etiqueta = document.getElementById('sl');
  etiqueta.textContent = valor
    ? (etiquetasFuerza[puntos - 1] || 'MUY DÉBIL')
    : 'INTRODUCE CONTRASEÑA';
  etiqueta.style.color = valor
    ? (coloresFuerza[puntos - 1] || coloresFuerza[0])
    : '#2a1e08';
}

// Valida todos los campos y activa/desactiva el botón
function validar() {
  const u = inputUsuario.value;
  const e = inputEmail.value;
  const p = inputContrasena.value;
  const c = inputConfirmar.value;

  const ut = u.length > 0;
  const et = e.length > 0;
  const pt = p.length > 0;
  const ct = c.length > 0;

  // Nombre de usuario
  const uLongitud   = u.length >= 3 && u.length <= 20;
  const uCaracteres = /^[a-zA-Z0-9_]*$/.test(u) && !/\s/.test(u);
  actualizarHint('u1', uLongitud,   ut);
  actualizarHint('u2', uCaracteres, ut);

  // Email
  const eValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  actualizarHint('e1', eValido, et);

  // Contraseña
  const pLongitud  = p.length >= 8;
  const pMayuscula = /[A-Z]/.test(p);
  const pNumero    = /[0-9]/.test(p);
  const pEspecial  = /[!@#$%^&*_\-]/.test(p);
  actualizarHint('p1', pLongitud,  pt);
  actualizarHint('p2', pMayuscula, pt);
  actualizarHint('p3', pNumero,    pt);
  actualizarHint('p4', pEspecial,  pt);
  actualizarFuerza(p);

  // Confirmación
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
   BOTÓN: mostrar/ocultar contraseña
--------------------------------------------------------- */
togglePass.addEventListener('click', () => {
  const mostrar = inputContrasena.type === 'password';
  inputContrasena.type = mostrar ? 'text' : 'password';
  inputConfirmar.type  = mostrar ? 'text' : 'password';
  togglePass.textContent = mostrar ? 'OOO' : 'VER';
});

/* ---------------------------------------------------------
   BOTÓN: enviar formulario al backend
--------------------------------------------------------- */
btnRegistro.addEventListener('click', async () => {
  msgError.style.display   = 'none';
  msgSuccess.style.display = 'none';

  btnRegistro.disabled  = true;
  btnRegistro.innerHTML = 'CONECTANDO<span class="dots"></span>';

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_usuario: inputUsuario.value,
        email: inputEmail.value,
        contrasena: inputContrasena.value,
        avatar: selectedAvatar
      })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      localStorage.setItem('nombre_usuario', inputUsuario.value);
      localStorage.setItem('avatar', selectedAvatar);
      msgSuccess.style.display = 'block';
      inputUsuario.value    = '';
      inputEmail.value      = '';
      inputContrasena.value = '';
      inputConfirmar.value  = '';
      validar();
    } else {
      msgError.textContent   = '> ' + (datos.error || 'ERROR EN EL REGISTRO').toUpperCase();
      msgError.style.display = 'block';
    }

  } catch (error) {
    msgError.textContent   = '> ERROR: SERVIDOR NO DISPONIBLE';
    msgError.style.display = 'block';
  }

  btnRegistro.innerHTML = '▶ UNIRSE A LA RESISTENCIA';
  if (!validar()) btnRegistro.disabled = true;
});