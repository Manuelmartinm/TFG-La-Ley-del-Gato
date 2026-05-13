
import { TIPO_ENEMIGO } from '../utilidades/constantes.js';
import { hayColision } from '../utilidades/colisiones.js';
import { ProyectilRecto, ProyectilMortero } from './Proyectil.js';

//Valores por defecto de los enemigos
const DEFAULTS = {
    [TIPO_ENEMIGO.PATRULLA]: {
        w: 26, h: 26,
        speed: 1.2,
        color: '#8c3030',
    },
    [TIPO_ENEMIGO.CAZADOR]: {
        w: 26, h: 26,
        speed: 1.1,
        color: '#4a3510',
        rango: 200,
    },
    [TIPO_ENEMIGO.RAPIDO]: {
        w: 18, h: 18,
        speed: 3.0,
        color: '#e05010',
        rango: 150,
    },
    [TIPO_ENEMIGO.CENTINELA]: {
        w: 30, h: 30,
        speed: 0,
        color: '#206040',
        timerDisparo: 120,
        cadencia: 180,
    },
    [TIPO_ENEMIGO.MORTERO]: {
        w: 30, h: 30,
        speed: 0,
        color: '#602080',
        timerDisparo: 200,
        cadencia: 280,
        rango: 380,
    },
};

export class Enemigo {
    // config es un objeto con todas las propiedades del enemigo
    // (x, y, w, h, speed, color, tipo, patrol, rango, etc.)
    constructor(config) {
        // Luego sobreescribimos con lo que venga del config del nivel
        const defaults = DEFAULTS[config.tipo] || {};
        Object.assign(this, defaults, config);
        this.pi = this.pi ?? 0;
        this.timerStun = 0;
    }

    // Aplica stun al enemigo
    stunear(frames = 120) {
        this.timerStun = frames;
    }

    // Actualiza la posición del enemigo
    actualizar(jugador, mapa, proyectiles, proyMortero) {

        if (this.timerStun > 0) {
            this.timerStun--;
            return;
        }

        switch (this.tipo) {

            case TIPO_ENEMIGO.PATRULLA:
                this._moverPatrulla(mapa);
                break;

            case TIPO_ENEMIGO.CAZADOR:
            case TIPO_ENEMIGO.RAPIDO:
                // Ambos usan la misma lógica — solo difieren en speed y rango del objeto
                this._moverCazador(jugador, mapa);
                break;

            case TIPO_ENEMIGO.CENTINELA:
                this._dispararCentinela(jugador, proyectiles);
                break;

            case TIPO_ENEMIGO.MORTERO:
                this._dispararMortero(jugador, proyMortero);
                break;
        }
    }

    // ── Comportamiento PATRULLA ───────────────────────────────────────────────
    // Sigue una lista de waypoints en orden circular.
    _moverPatrulla(mapa) {
        const destino = this.patrol[this.pi];
        const dx = destino.x - this.x;
        const dy = destino.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
            // Llegó al waypoint — avanza al siguiente
            this.pi = (this.pi + 1) % this.patrol.length;
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const nx_ = this.x + nx * this.speed;
            const ny_ = this.y + ny * this.speed;
            if (!hayColision(mapa, nx_, this.y, this.w, this.h)) this.x = nx_;
            if (!hayColision(mapa, this.x, ny_, this.w, this.h)) this.y = ny_;
        }
    }

    // ── Comportamiento CAZADOR / RAPIDO ───────────────────────────────────────
    // Persigue al jugador si está en rango y no está escondido.
    // Si el jugador sale del rango o se esconde, vuelve al origen.
    _moverCazador(jugador, mapa) {
        const dx = (jugador.x + jugador.w / 2) - (this.x + this.w / 2);
        const dy = (jugador.y + jugador.h / 2) - (this.y + this.h / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.rango && !jugador.escondido) {
            const nx = dx / dist;
            const ny = dy / dist;
            const nx_ = this.x + nx * this.speed;
            const ny_ = this.y + ny * this.speed;
            if (!hayColision(mapa, nx_, this.y, this.w, this.h)) this.x = nx_;
            if (!hayColision(mapa, this.x, ny_, this.w, this.h)) this.y = ny_;
        } else {
            // Volver al origen
            const dox = this.origenX - this.x;
            const doy = this.origenY - this.y;
            const distOrigen = Math.sqrt(dox * dox + doy * doy);
            if (distOrigen > 3) {
                const nx = dox / distOrigen;
                const ny = doy / distOrigen;
                const nx_ = this.x + nx * this.speed;
                const ny_ = this.y + ny * this.speed;
                if (!hayColision(mapa, nx_, this.y, this.w, this.h)) this.x = nx_;
                if (!hayColision(mapa, this.x, ny_, this.w, this.h)) this.y = ny_;
            }
        }
    }

    // ── Comportamiento CENTINELA ──────────────────────────────────────────────
    // Fijo. Cada cadencia frames dispara UN proyectil recto hacia el jugador.
    // Usa snapping cardinal: solo dispara horizontal o vertical, nunca diagonal.
    _dispararCentinela(jugador, proyectiles) {
        this.timerDisparo--;
        if (this.timerDisparo > 0) return;
        this.timerDisparo = this.cadencia;

        if (jugador.escondido) return;

        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const dx = (jugador.x + jugador.w / 2) - cx;
        const dy = (jugador.y + jugador.h / 2) - cy;
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return;

        // Snapping: disparamos en la dirección cardinal más dominante
        let dirX = 0, dirY = 0;
        if (Math.abs(dx) >= Math.abs(dy)) {
            dirX = dx > 0 ? 1 : -1;
        } else {
            dirY = dy > 0 ? 1 : -1;
        }

        proyectiles.push(new ProyectilRecto(cx, cy, dirX, dirY, 5));
    }

    // ── Comportamiento MORTERO ────────────────────────────────────────────────
    // Fijo. Cada cadencia frames lanza un proyectil parabólico donde está el jugador.
    _dispararMortero(jugador, proyMortero) {
        this.timerDisparo--;
        if (this.timerDisparo > 0) return;
        this.timerDisparo = this.cadencia;

        if (jugador.escondido) return;

        // Solo dispara si el jugador está dentro del rango
        const dx = (jugador.x + jugador.w / 2) - (this.x + this.w / 2);
        const dy = (jugador.y + jugador.h / 2) - (this.y + this.h / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.rango) return;

        proyMortero.push(new ProyectilMortero(
            this.x + this.w / 2,
            this.y + this.h / 2,
            jugador.x + jugador.w / 2,
            jugador.y + jugador.h / 2,
            90
        ));
    }

    dibujar(ctx, jugador, camX, camY) {
        const px = this.x - camX;
        const py = this.y - camY;

        // ── Rango de detección ────────────────────────────────────────────────
        if (this.rango) {
            const dx = (jugador.x + jugador.w / 2) - (this.x + this.w / 2);
            const dy = (jugador.y + jugador.h / 2) - (this.y + this.h / 2);
            const dentro = Math.sqrt(dx * dx + dy * dy) < this.rango && !jugador.escondido;

            ctx.beginPath();
            ctx.arc(px + this.w / 2, py + this.h / 2, this.rango, 0, Math.PI * 2);
            ctx.fillStyle = dentro ? 'rgba(200,40,40,0.10)' : 'rgba(200,40,40,0.04)';
            ctx.fill();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = dentro ? 'rgba(220,60,60,0.50)' : 'rgba(180,40,40,0.20)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // ── Cuerpo del enemigo ────────────────────────────────────────────────
        // Si está stuneado lo dibujamos más apagado con un halo amarillo
        ctx.globalAlpha = this.timerStun > 0 ? 0.5 : 1.0;
        ctx.fillStyle = this.color;
        ctx.fillRect(px, py, this.w, this.h);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, this.w, this.h);
        ctx.globalAlpha = 1.0;

        // Estrellas de stun encima del enemigo
        if (this.timerStun > 0) {
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('★', px + this.w / 2, py - 4);
            ctx.textAlign = 'left';
        }
    }
}