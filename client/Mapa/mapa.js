/* ─────────────────────────────────────────────────────────────
   niveles.js — lógica de la pantalla de selección de niveles
───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {

    // Mostrar nombre del agente igual que en principal.js
    const nombre = localStorage.getItem('nombre_usuario')
        || localStorage.getItem('login_usuario')
        || 'AGENTE_01';
    document.getElementById('agentName').textContent = nombre.toUpperCase();

});

// Navega al nivel seleccionado
// Solo se llama desde las tarjetas disponibles (available)
function irAlNivel(url) {
    window.location.href = url;
}