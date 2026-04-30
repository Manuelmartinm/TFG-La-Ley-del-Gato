
import { TIPO_ENEMIGO } from '../utilidades/constantes.js';
import { hayColision } from '../utilidades/colisiones.js';
import { ProyectilRecto, ProyectilMortero } from './Proyectil.js';

export class Enemigo {
    // config es un objeto con todas las propiedades del enemigo
    constructor(config) {
        Object.assign(this, config);
        this.pi = this.pi ?? 0; // índice del waypoint actual (para patrulla)
    }

    actualizar(jugador, mapa, proyectiles, proyMortero) {
        switch (this.tipo) {

            case TIPO_ENEMIGO.PATRULLA:
                this._moverPatrulla(mapa);
                break;

            case TIPO_ENEMIGO.CAZADOR:
            case TIPO_ENEMIGO.RAPIDO:
                // Ambos usan la misma lógica menos en speed y rango del objeto
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

    // Comportamiento PATRULLA
    _moverPatrulla(mapa) {
        const destino = this.patrol[this.pi];
        const dx = destino.x - this.x;
        const dy = destino.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
            // Llegó al waypoint avanza al siguiente
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

    // Comportamiento CAZADOR / RAPIDO
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

    // Comportamiento CENTINELA
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

        let dirX = 0, dirY = 0;
        if (Math.abs(dx) >= Math.abs(dy)) {
            dirX = dx > 0 ? 1 : -1;
        } else {
            dirY = dy > 0 ? 1 : -1;
        }

        proyectiles.push(new ProyectilRecto(cx, cy, dirX, dirY, 5));
    }

    _dispararMortero(jugador, proyMortero) {
        this.timerDisparo--;
        if (this.timerDisparo > 0) return;
        this.timerDisparo = this.cadencia;

        if (jugador.escondido) return;

        proyMortero.push(new ProyectilMortero(
            this.x + this.w / 2,
            this.y + this.h / 2,
            jugador.x + jugador.w / 2,
            jugador.y + jugador.h / 2,
            90
        ));
    }

    // Dibuja el enemigo y su círculo de rango
    dibujar(ctx, jugador) {
        // ── Rango de detección ────────────────────────────────────────────────
        if (this.rango) {
            const dx = (jugador.x + jugador.w / 2) - (this.x + this.w / 2);
            const dy = (jugador.y + jugador.h / 2) - (this.y + this.h / 2);
            const dentro = Math.sqrt(dx * dx + dy * dy) < this.rango && !jugador.escondido;

            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.rango, 0, Math.PI * 2);
            ctx.fillStyle   = dentro ? 'rgba(200,40,40,0.10)' : 'rgba(200,40,40,0.04)';
            ctx.fill();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = dentro ? 'rgba(220,60,60,0.50)' : 'rgba(180,40,40,0.20)';
            ctx.lineWidth   = 1;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        //Cuerpo del enemigo
        ctx.fillStyle   = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth   = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}