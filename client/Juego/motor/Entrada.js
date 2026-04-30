// ─────────────────────────────────────────────────────────────
// Entrada.js — gestiona el estado del teclado
// Exporta un objeto `teclas` que cualquier módulo puede leer.
// En lugar de escuchar eventos en cada sitio, todo el juego
// consulta este único objeto para saber qué teclas están pulsadas.
// ─────────────────────────────────────────────────────────────

// Objeto compartido — { 'ArrowLeft': true, 'a': true, ... }
// true = tecla pulsada ahora mismo, false/undefined = no pulsada
export const teclas = {};

// Callbacks opcionales para acciones puntuales (no movimiento continuo)
// Se registran desde main.js con onTeclaPulsada()
const _callbacks = [];

export function onTeclaPulsada(fn) {
    _callbacks.push(fn);
}

// Activamos los listeners una sola vez al importar el módulo
document.addEventListener('keydown', function(e) {
    teclas[e.key] = true;
    // Notificamos a todos los callbacks registrados
    _callbacks.forEach(fn => fn(e));
});

document.addEventListener('keyup', function(e) {
    teclas[e.key] = false;
});
