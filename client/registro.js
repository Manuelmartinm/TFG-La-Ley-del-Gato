/* =========================================================
   LA LEY DEL GATO — registro.js
   Lógica de validación y envío del formulario de registro
   ========================================================= */

// --- Referencias a los elementos del DOM ---
const inputUsuario    = document.getElementById('u');
const inputContrasena = document.getElementById('p');
const inputConfirmar  = document.getElementById('c');
const btnRegistro     = document.getElementById('btn');
const togglePass      = document.getElementById('tp');
const msgError        = document.getElementById('mErr');
const msgSuccess      = document.getElementById('mOk');

// URL del backend — cambiar a la URL de producción cuando se despliegue
const API_URL = 'http://localhost:3000';

// Colores y etiquetas para la barra de fuerza de contraseña
const coloresFuerza = ['#8c3030', '#8c6020', '#908020', '#3a8c30'];
const etiquetasFuerza = ['MUY DÉBIL', 'ACEPTABLE', 'BUENA', 'FUERTE'];

/* ---------------------------------------------------------
   FUNCIÓN: actualiza el estado visual de un indicador de requisito
   - id: id del elemento hint
   - ok: true = cumplido, false = pendiente/fallido
   - typed: true = el usuario ya ha escrito algo
--------------------------------------------------------- */
function actualizarHint(id, ok, typed) {
  const el = document.getElementById(id);
  el.classList.toggle('ok', ok);
  el.classList.toggle('er', typed && !ok);
  el.querySelector('.hico').textContent = ok ? '■' : (typed && !ok ? '✕' : '□');
}

/* ---------------------------------------------------------
   FUNCIÓN: actualiza la barra de fuerza de la contraseña
   según los criterios cumplidos
--------------------------------------------------------- */
function actualizarFuerza(valor) {
  let puntos = 0;
  if (valor.length >= 8)              puntos++;
  if (/[A-Z]/.test(valor))            puntos++;
  if (/[0-9]/.test(valor))            puntos++;
  if (/[!@#$%^&*_\-]/.test(valor))   puntos++;

  // Actualiza el color de cada segmento de la barra
  [1, 2, 3, 4].forEach(i => {
    document.getElementById('s' + i).style.background =
      i <= puntos ? coloresFuerza[puntos - 1] : '#1a1403';
  });

  // Actualiza la etiqueta de fuerza
  const etiqueta = document.getElementById('sl');
  etiqueta.textContent = valor
    ? (etiquetasFuerza[puntos - 1] || 'MUY DÉBIL')
    : 'INTRODUCE CONTRASEÑA';
  etiqueta.style.color = valor
    ? (coloresFuerza[puntos - 1] || coloresFuerza[0])
    : '#2a1e08';
}

/* ---------------------------------------------------------
   FUNCIÓN: valida todos los campos y activa/desactiva el botón
--------------------------------------------------------- */
function validar() {
  const u  = inputUsuario.value;
  const p  = inputContrasena.value;
  const c  = inputConfirmar.value;

  const utipado = u.length > 0;
  const ptipado = p.length > 0;
  const ctipado = c.length > 0;

  // Validación del nombre de usuario
  const uLongitud = u.length >= 3 && u.length <= 20;
  const uCaracteres = /^[a-zA-Z0-9_]*$/.test(u) && !/\s/.test(u);
  actualizarHint('u1', uLongitud, utipado);
  actualizarHint('u2', uCaracteres, utipado);

  // Validación de la contraseña
  const pLongitud  = p.length >= 8;
  const pMayuscula = /[A-Z]/.test(p);
  const pNumero    = /[0-9]/.test(p);
  const pEspecial  = /[!@#$%^&*_\-]/.test(p);
  actualizarHint('p1', pLongitud,  ptipado);
  actualizarHint('p2', pMayuscula, ptipado);
  actualizarHint('p3', pNumero,    ptipado);
  actualizarHint('p4', pEspecial,  ptipado);
  actualizarFuerza(p);

  // Validación de la confirmación
  const coinciden = c === p && c.length > 0;
  actualizarHint('c1', coinciden, ctipado);

  // Activa el botón solo si todo es válido
  const formularioValido = uLongitud && uCaracteres && pLongitud && pMayuscula && pNumero && pEspecial && coinciden;
  btnRegistro.disabled = !formularioValido;
  return formularioValido;
}

// --- Escuchadores de eventos ---
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
   BOTÓN: enviar el formulario al backend
--------------------------------------------------------- */
btnRegistro.addEventListener('click', async () => {
  msgError.style.display   = 'none';
  msgSuccess.style.display = 'none';

  btnRegistro.disabled = true;
  btnRegistro.innerHTML = 'CONECTANDO<span class="dots"></span>';

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_usuario: inputUsuario.value,
        contrasena: inputContrasena.value
      })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      // Registro exitoso
      msgSuccess.style.display = 'block';
      inputUsuario.value    = '';
      inputContrasena.value = '';
      inputConfirmar.value  = '';
      validar();
    } else {
      // Error devuelto por el servidor
      msgError.textContent  = '> ' + (datos.error || 'ERROR EN EL REGISTRO').toUpperCase();
      msgError.style.display = 'block';
    }

  } catch (error) {
    // Error de conexión
    msgError.textContent  = '> ERROR: SERVIDOR NO DISPONIBLE';
    msgError.style.display = 'block';
  }

  btnRegistro.innerHTML = '▶ UNIRSE A LA RESISTENCIA';
  if (!validar()) btnRegistro.disabled = true;
});