    window.onload = function () {
    // 1. Carga el nombre del agente
    const nombre = localStorage.getItem('login_usuario') || 'AGENTE_01';
    document.getElementById('agentName').textContent = nombre.toUpperCase();

    // 2. Nuestra "piedra Rosetta" para traducir el número a emoji
    const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];
    
    // 3. Recuperamos el índice del avatar (el "0")
    let avatarIndex = localStorage.getItem('avatar');

    // 4. Si hay algún error o está vacío, le ponemos el 0 por defecto
    if (avatarIndex === null || isNaN(avatarIndex)) {
        avatarIndex = 0;
    }

    // 5. ¡Magia! Buscamos el emoji en la lista usando el número y lo mostramos
    document.getElementById('agentAvatar').textContent = emojisAvatares[parseInt(avatarIndex)];
}

    