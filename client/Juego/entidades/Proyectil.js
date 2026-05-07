// ─────────────────────────────────────────────────────────────
// Proyectil.js — gestiona los proyectiles del centinela y el mortero
// Dos clases separadas porque su comportamiento es muy distinto:
//   ProyectilRecto   → viaja en línea recta, muere al tocar pared
//   ProyectilMortero → vuela en arco sobre paredes, cae en el destino
// ─────────────────────────────────────────────────────────────

import { hayColision, seToca } from '../utilidades/colisiones.js';

// ── PROYECTIL RECTO (centinela) ───────────────────────────────────────────────
export class ProyectilRecto {
    constructor(x, y, dx, dy, speed = 5) {
        this.x = x; this.y = y;
        this.dx = dx; this.dy = dy;
        this.speed = speed;
        this.w = 6; this.h = 6;
        this.activo = true; // false → el gestor lo elimina del array
    }

    actualizar(mapa) {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        // Muere al chocar con una pared
        if (hayColision(mapa, this.x - this.w/2, this.y - this.h/2, this.w, this.h)) {
            this.activo = false;
        }
    }

    // Comprueba si toca al jugador. Devuelve true y se desactiva si hay impacto.
    tocaJugador(jugador) {
        if (seToca(jugador.x, jugador.y, jugador.w, jugador.h,
            this.x - this.w/2, this.y - this.h/2, this.w, this.h)) {
            this.activo = false;
            return true;
        }
        return false;
    }

    dibujar(ctx, camX, camY) {
        const px = this.x - camX;
        const py = this.y - camY;
        ctx.fillStyle   = '#40ff80';
        ctx.fillRect(px - this.w/2, py - this.h/2, this.w, this.h);
        ctx.strokeStyle = '#206040';
        ctx.lineWidth   = 1;
        ctx.strokeRect(px - this.w/2 - 1, py - this.h/2 - 1, this.w + 2, this.h + 2);
    }
}

// ── PROYECTIL MORTERO (parabólico) ────────────────────────────────────────────
export class ProyectilMortero {
    constructor(origenX, origenY, destinoX, destinoY, duracion = 90) {
        this.origenX  = origenX;  this.origenY  = origenY;
        this.destinoX = destinoX; this.destinoY = destinoY;
        this.duracion    = duracion;
        this.frameActual = 0;
        this.activo      = true;
    }

    get progreso() { return this.frameActual / this.duracion; }

    actualizar() {
        this.frameActual++;
        if (this.frameActual >= this.duracion) this.activo = false;
    }

    // El mortero daña cuando está en el último 10% del vuelo y el jugador está cerca
    tocaJugador(jugador) {
        if (this.progreso < 0.90) return false;
        const radio = 20;
        const cx = jugador.x + jugador.w / 2;
        const cy = jugador.y + jugador.h / 2;
        const dist = Math.sqrt((cx - this.destinoX) ** 2 + (cy - this.destinoY) ** 2);
        if (dist < radio) {
            this.activo = false;
            return true;
        }
        return false;
    }

    dibujar(ctx, camX, camY) {
        const p  = this.progreso;
        const px = this.origenX + (this.destinoX - this.origenX) * p;
        const py = this.origenY + (this.destinoY - this.origenY) * p;
        const arco = Math.sin(p * Math.PI) * -80;

        // Sombra en el suelo (en coordenadas de pantalla)
        const tamSombra = 4 + p * 10;
        ctx.fillStyle = 'rgba(100,0,150,0.35)';
        ctx.beginPath();
        ctx.arc(this.destinoX - camX, this.destinoY - camY, tamSombra, 0, Math.PI * 2);
        ctx.fill();

        // Bola en el aire
        ctx.fillStyle = '#c060ff';
        ctx.beginPath();
        ctx.arc(px - camX, py - camY + arco, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#602080';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}