/* =========================================================
   LA LEY DEL GATO — registro.js
   ========================================================= */

const inputUsuario    = document.getElementById('u');
const inputContrasena = document.getElementById('p');
const inputConfirmar  = document.getElementById('c');
const btnRegistro     = document.getElementById('btn');
const togglePass      = document.getElementById('tp');
const msgError        = document.getElementById('mErr');
const msgSuccess      = document.getElementById('mOk');

const API_URL = 'http://localhost:3000';

/* ---------------------------------------------------------
   AVATARES — emojis de personajes
   Cada avatar tiene un emoji y un nombre de agente
--------------------------------------------------------- */
const avatares = [
  { nombre: 'EL JEFE',    arte: '🐭' },
  { nombre: 'LA SOMBRA',  arte: '🐀' },
  { nombre: 'EL GORDO',   arte: '🐹' },
  { nombre: 'EL SICARIO', arte: '🦝' },
  { nombre: 'EL LOCO',    arte: '🐱' },
  { nombre: 'EL TOPO',    arte: '🦔' },
];

let avatarActual = 0;

/* ---------------------------------------------------------
   FUNCIÓN: renderiza el avatar actual en pantalla
--------------------------------------------------------- */
function renderizarAvatar() {
  const avatar = avatares[avatarActual];

  const display = document.getElementById('avatarDisplay');
  display.style.opacity = '0';
  setTimeout(() => {
    display.textContent = avatar.arte;
    display.style.opacity = '1';
  }, 100);

  document.getElementById('avatarName').textContent = avatar.nombre;

  const dotsContainer = document.getElementById('avatarDots');
  dotsContainer.innerHTML = '';
  avatares.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'avatar-dot' + (i === avatarActual ? ' active' : '');
    dotsContainer.appendChild(dot);
  });
}

/* ---------------------------------------------------------
   NAVEGACIÓN entre avatares con las flechas
--------------------------------------------------------- */
document.getElementById('avatarPrev').addEventListener('click', () => {
  avatarActual = (avatarActual - 1 + avatares.length) % avatares.length;
  renderizarAvatar();
});

document.getElementById('avatarNext').addEventListener('click', () => {
  avatarActual = (avatarActual + 1) % avatares.length;
  renderizarAvatar();
});

renderizarAvatar();

/* ---------------------------------------------------------
   VALIDACIÓN de campos
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

function validar() {
  const u = inputUsuario.value;
  const p = inputContrasena.value;
  const c = inputConfirmar.value;

  const ut = u.length > 0;
  const pt = p.length > 0;
  const ct = c.length > 0;

  const uLongitud   = u.length >= 3 && u.length <= 20;
  const uCaracteres = /^[a-zA-Z0-9_]*$/.test(u) && !/\s/.test(u);
  actualizarHint('u1', uLongitud,   ut);
  actualizarHint('u2', uCaracteres, ut);

  const pLongitud  = p.length >= 8;
  const pMayuscula = /[A-Z]/.test(p);
  const pNumero    = /[0-9]/.test(p);
  const pEspecial  = /[!@#$%^&*_\-]/.test(p);
  actualizarHint('p1', pLongitud,  pt);
  actualizarHint('p2', pMayuscula, pt);
  actualizarHint('p3', pNumero,    pt);
  actualizarHint('p4', pEspecial,  pt);
  actualizarFuerza(p);

  const coinciden = c === p && c.length > 0;
  actualizarHint('c1', coinciden, ct);

  const valido = uLongitud && uCaracteres && pLongitud && pMayuscula && pNumero && pEspecial && coinciden;
  btnRegistro.disabled = !valido;
  return valido;
}

inputUsuario.addEventListener('input', validar);
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
        contrasena: inputContrasena.value,
        avatar: avatarActual
      })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      msgSuccess.style.display = 'block';
      inputUsuario.value    = '';
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