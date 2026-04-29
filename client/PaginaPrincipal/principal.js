    window.onload = function () {
            // Carga el nombre y avatar del agente desde localStorage (guardado al registrarse)
        const nombre = localStorage.getItem('nombre_usuario') || 'AGENTE_01';
        const avatar = localStorage.getItem('avatar') || '🐭';
        document.getElementById('agentName').textContent = nombre.toUpperCase();
        document.getElementById('agentAvatar').textContent = avatar;
    }

    