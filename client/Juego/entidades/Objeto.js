// ─────────────────────────────────────────────────────────────
// Objeto.js — clase base para todos los objetos recogibles
// Cada objeto tiene posición, tamaño y un estado activo.
// Cuando el jugador lo recoge, activo = false y se elimina.
// Para añadir un objeto nuevo: crear una clase que extienda Objeto
// y sobreescribir alRecoger() con su efecto específico.
// ─────────────────────────────────────────────────────────────

import { seToca } from '../utilidades/colisiones.js';

// ── Clase base ────────────────────────────────────────────────
class Objeto {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.activo = true; // false → se elimina del array
    }

    // Comprueba si el jugador lo toca y lo recoge
    // Devuelve true si fue recogido este frame
    comprobarRecogida(jugador) {
        if (!this.activo) return false;
        if (seToca(jugador.x, jugador.y, jugador.w, jugador.h,
            this.x, this.y, this.w, this.h)) {
            this.activo = false;
            return true;
        }
        return false;
    }

    // Animación suave de flotación — el objeto sube y baja
    // Se llama cada frame desde actualizar()
    _flotacion(amplitud = 4, velocidad = 0.05) {
        if (!this._fase) this._fase = 0;
        this._fase += velocidad;
        this._offsetY = Math.sin(this._fase) * amplitud;
    }

    // Subclases sobreescriben este método con su efecto
    alRecoger(estado) {}

    actualizar() {
        this._flotacion();
    }

    dibujar(ctx, camX, camY) {}
}

// ── QUESO PEQUEÑO ─────────────────────────────────────────────
// Da 10 puntos al recogerlo.
// Colocado en zonas del mapa que requieren cierto esfuerzo llegar.
export class QuesoPequeno extends Objeto {
    constructor(x, y) {
        super(x, y, 20, 16);
        this._fase = Math.random() * Math.PI * 2;
        this.puntosAlRecoger = 10;
    }

    dibujar(ctx, camX, camY) {
        if (!this.activo) return;

        const px = this.x - camX;
        const py = this.y - camY + (this._offsetY || 0); // aplicamos la flotación

        // Cuerpo del queso — triángulo amarillo
        ctx.fillStyle = '#e8c040';
        ctx.beginPath();
        ctx.moveTo(px,           py + this.h);      // esquina inferior izquierda
        ctx.lineTo(px + this.w,  py + this.h);      // esquina inferior derecha
        ctx.lineTo(px + this.w / 2, py);            // punta superior
        ctx.closePath();
        ctx.fill();

        // Borde más oscuro
        ctx.strokeStyle = '#a07010';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Agujeros del queso — dos círculos pequeños
        ctx.fillStyle = '#a07010';
        ctx.beginPath();
        ctx.arc(px + 7,  py + this.h - 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 13, py + this.h - 4, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ── LLAVE ─────────────────────────────────────────────────────
// Al recogerla habilita la condición de llave para abrir la puerta.
// No da puntos — su efecto lo gestiona main.js comprobando llaveCogida.
export class Llave extends Objeto {
    constructor(x, y) {
        super(x, y, 20, 20);
        this._fase = Math.random() * Math.PI * 2;
        this.puntosAlRecoger = 0;
    }

    dibujar(ctx, camX, camY) {
        if (!this.activo) return;

        const px = this.x - camX;
        const py = this.y - camY + (this._offsetY || 0);

        // Halo dorado brillante — destaca sobre cualquier bloque
        ctx.beginPath();
        ctx.arc(px + this.w / 2, py + this.h / 2, this.w, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.20)';
        ctx.fill();

        // Círculo de la llave
        ctx.beginPath();
        ctx.arc(px + 8, py + 7, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8c040';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Palo de la llave
        ctx.beginPath();
        ctx.moveTo(px + 13, py + 10);
        ctx.lineTo(px + 20, py + 17);
        ctx.strokeStyle = '#e8c040';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dientes de la llave
        ctx.beginPath();
        ctx.moveTo(px + 17, py + 14);
        ctx.lineTo(px + 19, py + 12);
        ctx.moveTo(px + 15, py + 16);
        ctx.lineTo(px + 17, py + 14);
        ctx.strokeStyle = '#c8a030';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
// Al recogerlo el jugador es invencible durante 300 frames (~5 segundos).
// Visualmente aparece un aura azul alrededor del jugador mientras dura.
export class Escudo extends Objeto {
    constructor(x, y) {
        super(x, y, 22, 22);
        this._fase = Math.random() * Math.PI * 2;
        this.puntosAlRecoger = 0; // no da puntos, da protección
    }

    dibujar(ctx, camX, camY) {
        if (!this.activo) return;

        const px = this.x - camX;
        const py = this.y - camY + (this._offsetY || 0);

        // Halo azul exterior
        ctx.beginPath();
        ctx.arc(px + this.w / 2, py + this.h / 2, this.w, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 140, 255, 0.15)';
        ctx.fill();

        // Círculo azul principal
        ctx.beginPath();
        ctx.arc(px + this.w / 2, py + this.h / 2, this.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#1060c0';
        ctx.fill();
        ctx.strokeStyle = '#40a0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Símbolo de escudo en el centro
        ctx.fillStyle = '#80c8ff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🛡', px + this.w / 2, py + this.h / 2 + 5);
        ctx.textAlign = 'left';
    }
}
// Da 50 puntos. Aparece unos segundos y desaparece si no lo coges.
// Parpadea cuando le queda poco tiempo.
export class QuesoDorado extends Objeto {
    constructor(x, y, duracion = 300) {
        super(x, y, 24, 20);
        this._fase       = Math.random() * Math.PI * 2;
        this.duracion    = duracion;
        this.frameActual = 0;
        this.puntosAlRecoger = 50;
    }

    actualizar() {
        this._flotacion(5, 0.06);
        this.frameActual++;
        // Desaparece cuando se acaba el tiempo
        if (this.frameActual >= this.duracion) {
            this.activo = false;
        }
    }

    dibujar(ctx, camX, camY) {
        if (!this.activo) return;

        // Parpadea en el último 30% del tiempo
        const tiempoRestante = this.duracion - this.frameActual;
        const parpadeando = tiempoRestante < this.duracion * 0.3;
        if (parpadeando && Math.floor(this.frameActual / 6) % 2 === 0) return;

        const px = this.x - camX;
        const py = this.y - camY + (this._offsetY || 0);

        // Halo dorado brillante
        ctx.beginPath();
        ctx.arc(px + this.w / 2, py + this.h / 2, this.w, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 200, 0, 0.15)';
        ctx.fill();

        // Cuerpo — triángulo más grande y más brillante que el pequeño
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(px,            py + this.h);
        ctx.lineTo(px + this.w,   py + this.h);
        ctx.lineTo(px + this.w / 2, py);
        ctx.closePath();
        ctx.fill();

        // Borde dorado intenso
        ctx.strokeStyle = '#c8a000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Agujeros
        ctx.fillStyle = '#c8a000';
        ctx.beginPath();
        ctx.arc(px + 8,  py + this.h - 7, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 16, py + this.h - 5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Destello en la punta — hace que se vea especial
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(px + this.w / 2, py + 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}