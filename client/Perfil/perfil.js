/* =========================================================
   LA LEY DEL GATO — perfil.js (Actualizado y Limpio)
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';
const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

/* ---------------------------------------------------------
   CARGAR DATOS DEL USUARIO DESDE localStorage
--------------------------------------------------------- */
const nombreGuardado = localStorage.getItem('login_usuario') || 'AGENTE';
let avatarIndexGuardado = localStorage.getItem('avatar');

if (avatarIndexGuardado === null || isNaN(avatarIndexGuardado)) {
    avatarIndexGuardado = 0;
}

// Rellena los campos con los datos actuales
document.getElementById('inputNombre').value = nombreGuardado;
document.getElementById('avatarDisplay').textContent = emojisAvatares[parseInt(avatarIndexGuardado)];
document.getElementById('agentNameDisplay').textContent = nombreGuardado.toUpperCase();

/* ---------------------------------------------------------
   CARRUSEL DE AVATARES
--------------------------------------------------------- */
const avatarDisplay  = document.getElementById('avatarDisplay');
const avatarCarousel = document.getElementById('avatarCarousel');
const carouselTrack  = document.getElementById('carouselTrack');
const avatarOptions  = document.querySelectorAll('.avatar-option');

let selectedAvatarIndex = parseInt(avatarIndexGuardado);
let carouselIndex  = 0;
const visibles     = 3; 

// Marcar como seleccionado el avatar guardado
avatarOptions.forEach(opt => {
  if (parseInt(opt.dataset.index) === selectedAvatarIndex) {
      opt.classList.add('selected');
  } else {
      opt.classList.remove('selected');
  }
});

avatarDisplay.addEventListener('click', () => {
  avatarCarousel.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!avatarCarousel.contains(e.target) && e.target !== avatarDisplay) {
    avatarCarousel.classList.remove('open');
  }
});

function moverCarrusel(dir) {
  const total = avatarOptions.length;
  carouselIndex = Math.max(0, Math.min(carouselIndex + dir, total - visibles));
  carouselTrack.style.transition = 'transform 0.2s ease';
  carouselTrack.style.transform  = `translateX(-${carouselIndex * 56}px)`;
}

document.getElementById('carouselPrev').addEventListener('click', (e) => {
  e.stopPropagation(); moverCarrusel(-1);
});

document.getElementById('carouselNext').addEventListener('click', (e) => {
  e.stopPropagation(); moverCarrusel(1);
});

// Seleccionar un avatar
avatarOptions.forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarOptions.forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    
    selectedAvatarIndex = parseInt(opt.dataset.index); // Guardamos el número
    avatarDisplay.textContent = opt.dataset.avatar; // Mostramos el emoji
    
    avatarDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => { avatarDisplay.style.transform = 'scale(1)'; }, 200);
    avatarCarousel.classList.remove('open');
  });
});

/* ---------------------------------------------------------
   SECCIÓN CONTRASEÑA COLAPSABLE
--------------------------------------------------------- */
document.getElementById('passToggle').addEventListener('click', () => {
  document.getElementById('passToggle').classList.toggle('open');
  document.getElementById('passBody').classList.toggle('open');
});

function configurarTogglePass(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  btn.addEventListener('click', () => {
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    btn.textContent = mostrar ? 'OOO' : 'VER';
  });
}
configurarTogglePass('inputPassNueva',  'tpNueva');

/* ---------------------------------------------------------
   VALIDACIÓN EN TIEMPO REAL
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
  let p = 0;
  if (valor.length >= 8)            p++;
  if (/[A-Z]/.test(valor))          p++;
  if (/[0-9]/.test(valor))          p++;
  if (/[!@#$%^&*_\-]/.test(valor)) p++;
  [1,2,3,4].forEach(i => {
    document.getElementById('s'+i).style.background = i <= p ? coloresFuerza[p-1] : '#1a1403';
  });
  const el = document.getElementById('sl');
  el.textContent = valor ? (etiquetasFuerza[p-1] || 'MUY DÉBIL') : 'INTRODUCE CONTRASEÑA';
  el.style.color = valor ? (coloresFuerza[p-1] || coloresFuerza[0]) : '#2a1e08';
}

document.getElementById('inputPassNueva').addEventListener('input', () => {
  const p = document.getElementById('inputPassNueva').value;
  const c = document.getElementById('inputPassConfirm').value;
  actualizarHint('p1', p.length >= 8,          p.length > 0);
  actualizarHint('p2', /[A-Z]/.test(p),         p.length > 0);
  actualizarHint('p3', /[0-9]/.test(p),         p.length > 0);
  actualizarHint('p4', /[!@#$%^&*_\-]/.test(p), p.length > 0);
  actualizarFuerza(p);
  if (c.length > 0) actualizarHint('c1', c === p, true);
});

document.getElementById('inputPassConfirm').addEventListener('input', () => {
  const p = document.getElementById('inputPassNueva').value;
  const c = document.getElementById('inputPassConfirm').value;
  actualizarHint('c1', c === p && c.length > 0, c.length > 0);
});

/* ---------------------------------------------------------
   GUARDAR CAMBIOS — envía al backend
--------------------------------------------------------- */
document.getElementById('btnGuardar').addEventListener('click', async () => {
  const msgErr = document.getElementById('msgErr');
  const msgOk  = document.getElementById('msgOk');
  msgErr.style.display = 'none';
  msgOk.style.display  = 'none';

  const passNueva   = document.getElementById('inputPassNueva').value;
  const passConfirm = document.getElementById('inputPassConfirm').value;

  // Validaciones
  if (passNueva) {
    if (passNueva !== passConfirm) {
      msgErr.textContent   = '> LAS CONTRASEÑAS NO COINCIDEN';
      msgErr.style.display = 'block'; return;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\-]).{8,}/.test(passNueva)) {
      msgErr.textContent   = '> LA NUEVA CONTRASEÑA NO CUMPLE LOS REQUISITOS';
      msgErr.style.display = 'block'; return;
    }
  }

  const btn = document.getElementById('btnGuardar');
  btn.disabled  = true;
  btn.innerHTML = 'GUARDANDO<span class="dots"></span>';

  try {
    // Solo enviamos el nombre para que el backend lo encuentre, el nuevo avatar y la nueva pass
    const body = { 
        nombre_usuario: nombreGuardado, 
        avatar: selectedAvatarIndex 
    };
    
    if (passNueva) {
      body.nueva_contrasena = passNueva;
    }

    const respuesta = await fetch(`${API_URL}/usuarios/actualizar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      // Actualiza localStorage con el nuevo avatar
      localStorage.setItem('avatar', selectedAvatarIndex);
      msgOk.style.display = 'block';
      
      // Limpia los campos de contraseña
      document.getElementById('inputPassNueva').value   = '';
      document.getElementById('inputPassConfirm').value = '';
    } else {
      msgErr.textContent   = '> ' + (datos.error || 'ERROR AL GUARDAR').toUpperCase();
      msgErr.style.display = 'block';
    }

  } catch (err) {
    msgErr.textContent   = '> ERROR: SERVIDOR NO DISPONIBLE';
    msgErr.style.display = 'block';
  }

  btn.disabled  = false;
  btn.innerHTML = '▶ GUARDAR CAMBIOS';
});