/* =========================================================
   LA LEY DEL GATO — login.js
   ========================================================= */

const inputUsuario    = document.getElementById('u');
const inputPass       = document.getElementById('p');
const btnLogin        = document.getElementById('btn');
const togglePass      = document.getElementById('tp');
const msgError        = document.getElementById('mErr');
const msgSuccess      = document.getElementById('mOk');
const irowU           = document.getElementById('irowU');
const irowP           = document.getElementById('irowP');
const istatU          = document.getElementById('istatU');
const checkBox        = document.getElementById('checkBox');
const rememberCb      = document.getElementById('remember');
const forgotBtn       = document.getElementById('forgotBtn');
const modalOverlay    = document.getElementById('modalOverlay');
const modalClose      = document.getElementById('modalClose');
const recEmail        = document.getElementById('recEmail');
const btnRec          = document.getElementById('btnRec');
const mRec            = document.getElementById('mRec');
// NUEVO: Referencia al botón de anónimo
const btnAnonimo      = document.getElementById('btnAnonimo'); 

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

/* ---------------------------------------------------------
   LLUVIA GENERATIVA
--------------------------------------------------------- */
(function crearLluvia() {
  const container = document.getElementById('rain');
  const N = 60;
  for (let i = 0; i < N; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    const left   = Math.random() * 100;
    const height = 10 + Math.random() * 30;
    const dur    = 0.8 + Math.random() * 1.4;
    const delay  = Math.random() * 2;
    const op     = 0.1 + Math.random() * 0.3;
    drop.style.cssText = `
      left: ${left}%;
      height: ${height}px;
      opacity: ${op};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(drop);
  }
})();

/* ---------------------------------------------------------
   RELOJ EN PIE DE PÁGINA
--------------------------------------------------------- */
function actualizarReloj() {
  const ahora = new Date();
  const h = String(ahora.getHours()).padStart(2, '0');
  const m = String(ahora.getMinutes()).padStart(2, '0');
  const s = String(ahora.getSeconds()).padStart(2, '0');
  document.getElementById('footClock').textContent = `${h}:${m}:${s}`;
}
actualizarReloj();
setInterval(actualizarReloj, 1000);

/* ---------------------------------------------------------
   TYPEWRITER EN EL PROMPT DE BIENVENIDA
--------------------------------------------------------- */
(function typewriter() {
  // Recupera nombre guardado si existe
  const nombre = localStorage.getItem('nombre_usuario');
  const texto  = nombre
    ? `BIENVENIDO DE NUEVO, ${nombre.toUpperCase()}_`
    : 'INTRODUCE TUS CREDENCIALES_';

  const el    = document.getElementById('promptText');
  const caret = document.getElementById('promptCaret');
  let idx     = 0;

  // Espera a que la card sea visible antes de empezar
  setTimeout(() => {
    caret.style.display = 'none';
    const iv = setInterval(() => {
      el.textContent += texto[idx];
      idx++;
      if (idx >= texto.length) {
        clearInterval(iv);
        caret.style.display = 'inline';
      }
    }, 45);
  }, 1500);
})();

/* ---------------------------------------------------------
   RELLENA USUARIO RECORDADO
--------------------------------------------------------- */
(function cargarRecordado() {
  const guardado = localStorage.getItem('login_usuario');
  if (guardado) {
    inputUsuario.value = guardado;
    rememberCb.checked = true;
    checkBox.textContent = '■';
    checkBox.classList.add('checked');
    validarCampos();
  }
})();

/* ---------------------------------------------------------
   CHECKBOX PERSONALIZADO
--------------------------------------------------------- */
document.getElementById('rememberLabel').addEventListener('click', () => {
  rememberCb.checked = !rememberCb.checked;
  checkBox.textContent  = rememberCb.checked ? '■' : '□';
  checkBox.classList.toggle('checked', rememberCb.checked);
});

/* ---------------------------------------------------------
   VALIDACIÓN EN TIEMPO REAL
--------------------------------------------------------- */
function validarCampos() {
  const u = inputUsuario.value.trim();
  const p = inputPass.value;

  // Validar identificador: no vacío
  if (u.length > 0) {
    const esEmail   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u);
    const esAlias   = u.length >= 3;
    const valido    = esEmail || esAlias;
    istatU.textContent = valido ? '■' : '✕';
    istatU.className   = 'istat ' + (valido ? 'ok' : 'err');
    irowU.className    = 'irow ' + (valido ? 'valid' : 'invalid');
  } else {
    istatU.textContent = '';
    istatU.className   = 'istat';
    irowU.className    = 'irow';
  }

  const listoParaEnviar = u.length >= 3 && p.length >= 1;
  btnLogin.disabled = !listoParaEnviar;
  return listoParaEnviar;
}

inputUsuario.addEventListener('input', validarCampos);
inputPass.addEventListener('input', validarCampos);

/* ---------------------------------------------------------
   MOSTRAR / OCULTAR CONTRASEÑA
--------------------------------------------------------- */
togglePass.addEventListener('click', () => {
  const mostrar = inputPass.type === 'password';
  inputPass.type = mostrar ? 'text' : 'password';
  togglePass.textContent = mostrar ? 'OOO' : 'VER';
});

/* ---------------------------------------------------------
   ENVÍO DEL FORMULARIO (LOGIN NORMAL)
--------------------------------------------------------- */
btnLogin.addEventListener('click', async () => {
  if (!validarCampos()) return;

  msgError.style.display   = 'none';
  msgSuccess.style.display = 'none';

  btnLogin.disabled  = true;
  btnLogin.innerHTML = 'VERIFICANDO<span class="dots"></span>';

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identificador: inputUsuario.value.trim(),
        contrasena:    inputPass.value
      })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      // Guardar datos de sesión
      if (datos.nombre_usuario) localStorage.setItem('nombre_usuario', datos.nombre_usuario);
      if (datos.avatar) localStorage.setItem('avatar', datos.avatar);
      if (datos.token) localStorage.setItem('token', datos.token);
      if (datos.email) localStorage.setItem('email', datos.email);
      
      localStorage.setItem('email_verificado', datos.email_verificado ? 'true' : 'false');
      
      if (datos.fecha_creacion) {
        const fecha = new Date(datos.fecha_creacion);
        localStorage.setItem('fecha_registro', `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`);
      }

      // Recordar usuario si está marcado
      if (rememberCb.checked) {
        localStorage.setItem('login_usuario', inputUsuario.value.trim());
      } else {
        localStorage.removeItem('login_usuario');
      }

      msgSuccess.style.display = 'block';
      btnLogin.innerHTML = '▶ ACCESO CONCEDIDO';

      // Redirigir después de un momento
      setTimeout(() => {
        window.location.href = '../PaginaPrincipal/principal.html';
      }, 1200);

    } else {
      // Mostrar error con animación de shake
      const errTexto = (datos.error || 'CREDENCIALES INCORRECTAS').toUpperCase();
      msgError.textContent   = '> ' + errTexto;
      msgError.style.display = 'block';

      // Shake en la card
      const card = document.getElementById('mainCard');
      card.classList.remove('shake');
      void card.offsetWidth; // fuerza reflow para reiniciar animación
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);

      // Limpiar contraseña
      inputPass.value = '';
      validarCampos();
      inputPass.focus();

      btnLogin.innerHTML = '▶ IDENTIFICARSE';
      if (!validarCampos()) btnLogin.disabled = true;
    }

  } catch (err) {
    msgError.textContent   = '> ERROR: SERVIDOR NO DISPONIBLE';
    msgError.style.display = 'block';
    btnLogin.innerHTML = '▶ IDENTIFICARSE';
    if (!validarCampos()) btnLogin.disabled = true;
  }
});

// Enviar con Enter
[inputUsuario, inputPass].forEach(inp => {
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btnLogin.disabled) btnLogin.click();
  });
});

/* ---------------------------------------------------------
   MODO ANÓNIMO (NUEVO)
--------------------------------------------------------- */
if (btnAnonimo) {
  btnAnonimo.addEventListener('click', () => {
    // Generar un sufijo aleatorio para el nombre
    const idTemp = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Rellenamos el localStorage con datos falsos pero con la misma estructura que pide tu web
    localStorage.setItem('nombre_usuario', `AGENTE_${idTemp}`);
    localStorage.setItem('avatar', '0'); // Le ponemos el primer avatar (el ratón)
    localStorage.setItem('token', 'token_temporal_anonimo');
    localStorage.setItem('email', 'anonimo@ley-del-gato.com');
    localStorage.setItem('email_verificado', 'true'); // Para que le deje entrar sin pedir validación
    
    // Generamos la fecha de hoy
    const fecha = new Date();
    localStorage.setItem('fecha_registro', `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`);

    // Feedback visual opcional antes de redirigir
    btnLogin.innerHTML = '▶ ACCESO ANÓNIMO...';
    
    setTimeout(() => {
        window.location.href = '../PaginaPrincipal/principal.html';
    }, 500);
  });
}

/* ---------------------------------------------------------
   MODAL: OLVIDÉ CONTRASEÑA
--------------------------------------------------------- */
forgotBtn.addEventListener('click', () => {
  modalOverlay.classList.add('open');
  recEmail.focus();
});

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModal();
});

function cerrarModal() {
  modalOverlay.classList.remove('open');
  mRec.style.display = 'none';
  recEmail.value = '';
  btnRec.disabled = true;
}

// Validar campo de recuperación
recEmail.addEventListener('input', () => {
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recEmail.value.trim());
  btnRec.disabled = !valido;
});

recEmail.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !btnRec.disabled) btnRec.click();
});

// Enviar recuperación
btnRec.addEventListener('click', async () => {
  btnRec.disabled  = true;
  btnRec.innerHTML = 'ENVIANDO<span class="dots"></span>';
  mRec.style.display = 'none';

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/recuperar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recEmail.value.trim() })
    });

    const datos = await respuesta.json();

    mRec.className   = 'msg ' + (respuesta.ok ? 'msg-ok' : 'msg-err');
    mRec.textContent = respuesta.ok
      ? '▶ CÓDIGO ENVIADO. REVISA TU EMAIL.'
      : '> ' + (datos.error || 'ERROR AL ENVIAR').toUpperCase();
    mRec.style.display = 'block';

  } catch {
    mRec.className   = 'msg msg-err';
    mRec.textContent = '> ERROR: SERVIDOR NO DISPONIBLE';
    mRec.style.display = 'block';
  }

  btnRec.innerHTML = '▶ ENVIAR CÓDIGO';
  // Volver a habilitar si el email sigue siendo válido
  btnRec.disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recEmail.value.trim());
});