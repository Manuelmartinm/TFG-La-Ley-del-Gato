/* ─────────────────────────────────────────────────────────────
   mapa.js — lógica de la pantalla de selección de niveles
   Desbloqueo progresivo guardado en localStorage:
     nivel2_desbloqueado    → se guarda al completar el tutorial
     nivel3_desbloqueado    → se guarda al completar nivel 2
     minijuego1_desbloqueado → se guarda al completar nivel 2
     minijuego2_desbloqueado → se guarda al completar nivel 3
───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {

    // Mostrar nombre del agente
    const nombre = localStorage.getItem('nombre_usuario')
        || localStorage.getItem('login_usuario')
        || 'AGENTE_01';
    document.getElementById('agentName').textContent = nombre.toUpperCase();

    // ── Leer estado de desbloqueos ────────────────────────────
    const desbloqueos = {
        nivel2:     localStorage.getItem('nivel2_desbloqueado')     === 'true',
        nivel3:     localStorage.getItem('nivel3_desbloqueado')     === 'true',
        minijuego1: localStorage.getItem('minijuego1_desbloqueado') === 'true',
        minijuego2: localStorage.getItem('minijuego2_desbloqueado') === 'true',
    };

    // ── Desbloquear tarjetas según el progreso ────────────────
    if (desbloqueos.nivel2) {
        desbloquearTarjeta('card-nivel2', '../Juego/nivel2.html');
    }
    if (desbloqueos.minijuego1) {
        desbloquearTarjeta('card-minijuego1', '../Juego/minijuego1.html');
    }
    if (desbloqueos.nivel3) {
        desbloquearTarjeta('card-nivel3', '../Juego/nivel3.html');
    }
    if (desbloqueos.minijuego2) {
        desbloquearTarjeta('card-minijuego2', '../Juego/minijuego2.html');
    }
});

// Convierte una tarjeta bloqueada en disponible y le asigna la URL
function desbloquearTarjeta(id, url) {
    const card = document.getElementById(id);
    if (!card) return;
    card.classList.remove('locked');
    card.classList.add('available');
    card.querySelector('.card-play').textContent = 'JUGAR ▶';
    card.querySelector('.card-play').classList.remove('locked-text');
    card.onclick = function () { irAlNivel(url); };
}

// Navega al nivel seleccionado
// Solo se llama desde las tarjetas disponibles (available)
function irAlNivel(url) {
    window.location.href = url;
}