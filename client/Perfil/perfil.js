
    const API_URL = 'http://localhost:3000';

    // --- Cargar datos actuales ---
    const nombre = localStorage.getItem('nombre_usuario') || '';
    const avatar = localStorage.getItem('avatar') || '🐭';
    const fecha  = localStorage.getItem('fecha_registro') || '--/--/----';

    document.getElementById('inputNombre').value = nombre;
    document.getElementById('avatarDisplay').textContent = avatar;
    document.getElementById('statFecha').textContent = fecha;

    // --- Carrusel de avatar ---
    const avatarOptions   = document.querySelectorAll('.avatar-option');
    const avatarCarousel  = document.getElementById('avatarCarousel');
    const carouselTrack   = document.getElementById('carouselTrack');
    const avatarDisplay   = document.getElementById('avatarDisplay');
    let selectedAvatar    = avatar;
    let carouselIndex     = 0;
    const visibles        = 2;

    avatarDisplay.addEventListener('click', () => avatarCarousel.classList.toggle('open'));

    document.addEventListener('click', (e) => {
      if (!avatarCarousel.contains(e.target) && e.target !== avatarDisplay)
        avatarCarousel.classList.remove('open');
    });

    function moverCarrusel(dir) {
      const total = avatarOptions.length;
      carouselIndex = Math.max(0, Math.min(carouselIndex + dir, total - visibles));
      carouselTrack.style.transition = 'transform 0.2s ease';
      carouselTrack.style.transform = `translateX(-${carouselIndex * 56}px)`;
    }

    document.getElementById('carouselPrev').addEventListener('click', (e) => { e.stopPropagation(); moverCarrusel(-1); });
    document.getElementById('carouselNext').addEventListener('click', (e) => { e.stopPropagation(); moverCarrusel(1); });

    avatarOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedAvatar = opt.dataset.avatar;
        avatarDisplay.textContent = selectedAvatar;
        avatarDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => avatarDisplay.style.transform = 'scale(1)', 200);
        avatarCarousel.classList.remove('open');
      });
    });

    // --- Sección contraseña colapsable ---
    document.getElementById('passToggle').addEventListener('click', () => {
      document.getElementById('passToggle').classList.toggle('open');
      document.getElementById('passBody').classList.toggle('open');
    });

    // --- Mostrar/ocultar contraseñas ---
    function togglePass(inputId, btnId) {
      const input = document.getElementById(inputId);
      const btn   = document.getElementById(btnId);
      btn.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'OOO' : 'VER';
      });
    }
    togglePass('inputPassActual', 'tpActual');
    togglePass('inputPassNueva',  'tpNueva');

    // --- Validación helpers ---
    const coloresFuerza  = ['#8c3030', '#8c6020', '#908020', '#3a8c30'];
    const etiquetasFuerza = ['MUY DÉBIL', 'ACEPTABLE', 'BUENA', 'FUERTE'];

    function actualizarHint(id, ok, typed) {
      const el = document.getElementById(id);
      el.classList.toggle('ok', ok);
      el.classList.toggle('er', typed && !ok);
      el.querySelector('.hico').textContent = ok ? '■' : (typed && !ok ? '✕' : '□');
    }

    function actualizarFuerza(valor) {
      let p = 0;
      if (valor.length >= 8)             p++;
      if (/[A-Z]/.test(valor))           p++;
      if (/[0-9]/.test(valor))           p++;
      if (/[!@#$%^&*_\-]/.test(valor))  p++;
      [1,2,3,4].forEach(i => {
        document.getElementById('s'+i).style.background = i <= p ? coloresFuerza[p-1] : '#1a1403';
      });
      const el = document.getElementById('sl');
      el.textContent = valor ? (etiquetasFuerza[p-1] || 'MUY DÉBIL') : 'INTRODUCE CONTRASEÑA';
      el.style.color = valor ? (coloresFuerza[p-1] || coloresFuerza[0]) : '#2a1e08';
    }

    // Validación en tiempo real
    document.getElementById('inputNombre').addEventListener('input', () => {
      const u = document.getElementById('inputNombre').value;
      const t = u.length > 0;
      actualizarHint('u1', u.length >= 3 && u.length <= 20, t);
      actualizarHint('u2', /^[a-zA-Z0-9_]*$/.test(u) && !/\s/.test(u), t);
    });

    document.getElementById('inputCorreo').addEventListener('input', () => {
      const e = document.getElementById('inputCorreo').value;
      actualizarHint('e1', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), e.length > 0);
    });

    document.getElementById('inputPassNueva').addEventListener('input', () => {
      const p = document.getElementById('inputPassNueva').value;
      const t = p.length > 0;
      actualizarHint('p1', p.length >= 8, t);
      actualizarHint('p2', /[A-Z]/.test(p), t);
      actualizarHint('p3', /[0-9]/.test(p), t);
      actualizarHint('p4', /[!@#$%^&*_\-]/.test(p), t);
      actualizarFuerza(p);
      const c = document.getElementById('inputPassConfirm').value;
      actualizarHint('c1', c === p && c.length > 0, c.length > 0);
    });

    document.getElementById('inputPassConfirm').addEventListener('input', () => {
      const p = document.getElementById('inputPassNueva').value;
      const c = document.getElementById('inputPassConfirm').value;
      actualizarHint('c1', c === p && c.length > 0, c.length > 0);
    });

    // --- Guardar cambios ---
    document.getElementById('btnGuardar').addEventListener('click', async () => {
      const msgErr = document.getElementById('msgErr');
      const msgOk  = document.getElementById('msgOk');
      msgErr.style.display = 'none';
      msgOk.style.display  = 'none';

      const u = document.getElementById('inputNombre').value;
      const correo = document.getElementById('inputCorreo').value;
      const passActual  = document.getElementById('inputPassActual').value;
      const passNueva   = document.getElementById('inputPassNueva').value;
      const passConfirm = document.getElementById('inputPassConfirm').value;

      // Validaciones básicas
      if (u.length < 3 || u.length > 20 || !/^[a-zA-Z0-9_]*$/.test(u)) {
        msgErr.textContent = '> NOMBRE DE AGENTE NO VÁLIDO';
        msgErr.style.display = 'block'; return;
      }
      if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        msgErr.textContent = '> CORREO ELECTRÓNICO NO VÁLIDO';
        msgErr.style.display = 'block'; return;
      }
      if (passNueva) {
        if (!passActual) {
          msgErr.textContent = '> INTRODUCE TU CONTRASEÑA ACTUAL';
          msgErr.style.display = 'block'; return;
        }
        if (passNueva !== passConfirm) {
          msgErr.textContent = '> LAS CONTRASEÑAS NO COINCIDEN';
          msgErr.style.display = 'block'; return;
        }
        if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\-]).{8,}/.test(passNueva)) {
          msgErr.textContent = '> LA NUEVA CONTRASEÑA NO CUMPLE LOS REQUISITOS';
          msgErr.style.display = 'block'; return;
        }
      }

      const btn = document.getElementById('btnGuardar');
      btn.disabled = true;
      btn.innerHTML = 'GUARDANDO<span class="dots"></span>';

      try {
        const body = {
          nombre_usuario: u,
          avatar: selectedAvatar
        };
        if (correo)    body.correo = correo;
        if (passNueva) { body.contrasena_actual = passActual; body.contrasena_nueva = passNueva; }

        const respuesta = await fetch(`${API_URL}/usuarios/perfil`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(body)
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
          localStorage.setItem('nombre_usuario', u);
          localStorage.setItem('avatar', selectedAvatar);
          msgOk.style.display = 'block';
          // Limpiar campos de contraseña
          document.getElementById('inputPassActual').value  = '';
          document.getElementById('inputPassNueva').value   = '';
          document.getElementById('inputPassConfirm').value = '';
        } else {
          msgErr.textContent = '> ' + (datos.error || 'ERROR AL GUARDAR').toUpperCase();
          msgErr.style.display = 'block';
        }

      } catch (err) {
        msgErr.textContent = '> ERROR: SERVIDOR NO DISPONIBLE';
        msgErr.style.display = 'block';
      }

      btn.disabled = false;
      btn.innerHTML = '▶ GUARDAR CAMBIOS';
    });