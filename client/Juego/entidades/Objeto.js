// ─────────────────────────────────────────────────────────────
// Objeto.js — clase base para todos los objetos recogibles
// Cada objeto tiene posición, tamaño y un estado activo.
// Cuando el jugador lo recoge, activo = false y se elimina.
// Para añadir un objeto nuevo: crear una clase que extienda Objeto
// y sobreescribir alRecoger() con su efecto específico.
// ─────────────────────────────────────────────────────────────

import { seToca } from '../utilidades/colisiones.js';

// ─────────────────────────────────────────────────────────────
// SPRITES — cargados una sola vez para todos los objetos
// ─────────────────────────────────────────────────────────────
const IMG_QUESO = new Image(); IMG_QUESO.src = 'assets/sprites/Cheese_t.png';
const IMG_LLAVE = new Image(); IMG_LLAVE.src = 'assets/sprites/Llave_t.png';

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

    // Helper: dibuja sprite centrado en la celda del objeto con flotación
    _drawSprite(ctx, img, camX, camY, drawW, drawH) {
        if (!img || !img.complete || img.naturalWidth === 0) return false;
        const px = this.x - camX + (this.w - drawW) / 2;
        const py = this.y - camY + (this.h - drawH) / 2 + (this._offsetY || 0);
        ctx.drawImage(img, px, py, drawW, drawH);
        return true;
    }

    dibujar(ctx, camX, camY) {}
}

// ── QUESO PEQUEÑO ─────────────────────────────────────────────
// Da 10 puntos al recogerlo.
export class QuesoPequeno extends Objeto {
    constructor(x, y) {
        super(x, y, 28, 22);
        this._fase = Math.random() * Math.PI * 2;
        this.puntosAlRecoger = 10;
    }

    dibujar(ctx, camX, camY) {
        if (!this.activo) return;
        // Intentamos sprite; si no está listo, fallback geométrico
        if (!this._drawSprite(ctx, IMG_QUESO, camX, camY, 28, 22)) {
            const px = this.x - camX;
            const py = this.y - camY + (this._offsetY || 0);
            ctx.fillStyle = '#e8c040';
            ctx.beginPath();
            ctx.moveTo(px, py + this.h); ctx.lineTo(px + this.w, py + this.h);
            ctx.lineTo(px + this.w/2, py); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#a07010'; ctx.lineWidth = 1; ctx.stroke();
        }
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
        // Halo dorado brillante — destaca sobre cualquier bloque
        const px = this.x - camX + this.w/2;
        const py = this.y - camY + this.h/2 + (this._offsetY || 0);
        ctx.beginPath();
        ctx.arc(px, py, this.w, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,215,0,0.20)'; ctx.fill();
        // Sprite de llave
        if (!this._drawSprite(ctx, IMG_LLAVE, camX, camY, 20, 20)) {
            // Fallback geométrico si no carga
            ctx.beginPath(); ctx.arc(px - 4, py - 4, 6, 0, Math.PI*2);
            ctx.strokeStyle = '#e8c040'; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px+8, py+8);
            ctx.strokeStyle = '#e8c040'; ctx.lineWidth = 2.5; ctx.stroke();
        }
    }
}

// ── ESCUDO ────────────────────────────────────────────────────
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
        ctx.arc(px + this.w/2, py + this.h/2, this.w, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(40,140,255,0.15)'; ctx.fill();
        // Círculo azul principal
        ctx.beginPath();
        ctx.arc(px + this.w/2, py + this.h/2, this.w/2, 0, Math.PI*2);
        ctx.fillStyle = '#1060c0'; ctx.fill();
        ctx.strokeStyle = '#40a0ff'; ctx.lineWidth = 2; ctx.stroke();
        // Símbolo
        ctx.fillStyle = '#80c8ff'; ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🛡', px + this.w/2, py + this.h/2 + 5);
        ctx.textAlign = 'left';
    }
}

// ── QUESO DORADO ──────────────────────────────────────────────
// Da 50 puntos. Aparece unos segundos y desaparece si no lo coges.
// Parpadea cuando le queda poco tiempo.
export class QuesoDorado extends Objeto {
    constructor(x, y, duracion = 300) {
        super(x, y, 32, 26);
        this._fase       = Math.random() * Math.PI * 2;
        this.duracion    = duracion;
        this.frameActual = 0;
        this.puntosAlRecoger = 50;
    }

    actualizar() {
        this._flotacion(5, 0.06);
        this.frameActual++;
        // Desaparece cuando se acaba el tiempo
        if (this.frameActual >= this.duracion) this.activo = false;
    }

    dibujar(ctx, camX, camY) {
        if (!this.activo) return;
        // Parpadea en el último 30% del tiempo
        const tiempoRestante = this.duracion - this.frameActual;
        if (tiempoRestante < this.duracion * 0.3 && Math.floor(this.frameActual / 6) % 2 === 0) return;

        const px = this.x - camX;
        const py = this.y - camY + (this._offsetY || 0);

        // Halo dorado brillante
        ctx.beginPath();
        ctx.arc(px + this.w/2, py + this.h/2, this.w, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,200,0,0.15)'; ctx.fill();

        // Sprite del queso escalado y con tinte dorado
        if (IMG_QUESO.complete && IMG_QUESO.naturalWidth > 0) {
            ctx.save();
            ctx.filter = 'sepia(1) saturate(4) hue-rotate(10deg) brightness(1.3)';
            ctx.drawImage(IMG_QUESO, px, py, this.w, this.h);
            ctx.filter = 'none';
            ctx.restore();
        } else {
            // Fallback geométrico dorado
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(px, py + this.h); ctx.lineTo(px + this.w, py + this.h);
            ctx.lineTo(px + this.w/2, py); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#c8a000'; ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Destello en la punta
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(px + this.w/2, py + 3, 2, 0, Math.PI*2); ctx.fill();
    }
}