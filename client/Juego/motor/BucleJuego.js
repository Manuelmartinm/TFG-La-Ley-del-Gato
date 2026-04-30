// ─────────────────────────────────────────────────────────────
// BucleJuego.js — gestiona el bucle principal con requestAnimationFrame
// Separa la maquinaria del bucle de la lógica del juego.
// main.js solo define QUÉ hacer cada frame — este módulo se encarga
// de CUÁNDO llamarlo y de poder pausar/reanudar limpiamente.
// ─────────────────────────────────────────────────────────────

export class BucleJuego {
    // funcionFrame → función que se ejecuta cada frame, recibe deltaTime en segundos
    constructor(funcionFrame) {
        this._funcionFrame  = funcionFrame;
        this._activo        = false;
        this._idAnimacion   = null;
        this._tiempoAnterior = null;
    }

    // Arranca el bucle
    iniciar() {
        if (this._activo) return; // evitar doble arranque
        this._activo = true;
        this._tiempoAnterior = performance.now();
        this._tick(performance.now());
    }

    // Para el bucle limpiamente (útil para pausar o cambiar de pantalla)
    detener() {
        this._activo = false;
        if (this._idAnimacion !== null) {
            cancelAnimationFrame(this._idAnimacion);
            this._idAnimacion = null;
        }
    }

    // Tick interno — no se llama desde fuera
    _tick(tiempoActual) {
        if (!this._activo) return;

        // deltaTime = tiempo transcurrido desde el frame anterior en segundos
        // Lo pasamos a la función de frame para movimientos independientes del framerate
        const deltaTime = (tiempoActual - this._tiempoAnterior) / 1000;
        this._tiempoAnterior = tiempoActual;

        // Limitamos deltaTime para evitar saltos grandes si la pestaña estuvo inactiva
        const deltaClamped = Math.min(deltaTime, 0.05); // máximo 50ms (~20fps mínimo)

        this._funcionFrame(deltaClamped);

        this._idAnimacion = requestAnimationFrame(t => this._tick(t));
    }
}
