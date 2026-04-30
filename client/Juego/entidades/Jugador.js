
import { CELDA, BLOQUE } from '../utilidades/constantes.js';
import { hayColision, bloqueDebajo } from '../utilidades/colisiones.js';

// Lista de personajes disponibles
export const PERSONAJES = [
    { nombre: 'Raton A', w: 26, h: 26, speed: 3, color: '#e8c040' },
    { nombre: 'Raton B', w: 18, h: 18, speed: 4, color: '#c8a030' },
    { nombre: 'Raton C', w: 34, h: 34, speed: 2, color: '#e8f080' },
];

export class Jugador {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.indicePersonaje = 0;

        // Copiamos las propiedades del personaje activo
        this._aplicarPersonaje();

        // Velocidad acumulada para el efecto de inercia en el hielo
        this.vx = 0;
        this.vy = 0;

        // Estado de daño
        this.invencible      = false;
        this.timerInvencible = 0;
        this.flash           = 0;

        // Escodido
        this.escondido = false;
    }

    // Aplica las propiedades del personaje
    _aplicarPersonaje() {
        const p = PERSONAJES[this.indicePersonaje];
        this.w     = p.w;
        this.h     = p.h;
        this.speed = p.speed;
        this.color = p.color;
        this.nombre = p.nombre;
    }

    // Cambia al siguiente personaje de la lista (circular)
    cambiarPersonaje() {
        this.indicePersonaje = (this.indicePersonaje + 1) % PERSONAJES.length;
        this._aplicarPersonaje();
    }

    // Actualiza la posición del jugador según las teclas pulsadas y el bloque bajo sus pies
    actualizar(mapa, teclas) {
        // Dirección de input
        let movex = 0;
        let movey = 0;
        if (teclas['ArrowLeft'] || teclas['a']) movex = -1;
        if (teclas['ArrowRight'] || teclas['d']) movex = 1;
        if (teclas['ArrowUp'] || teclas['w']) movey = -1;
        if (teclas['ArrowDown'] || teclas['s']) movey = 1;

        // Diagonal
        if (movex !== 0 && movey !== 0) {
            movex *= 0.707;
            movey *= 0.707;
        }

        // Tipo de bloque bajo los pies
        const bloque = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
        const enHielo = bloque === BLOQUE.HIELO;
        const enBarro = bloque === BLOQUE.BARRO;

        // speedActual
        const speedActual = enBarro ? this.speed * 0.4 : this.speed;

        // Cálculo de velocidad
        if (enHielo) {
            this.vx += movex * speedActual * 0.15;
            this.vy += movey * speedActual * 0.15;
            const velMax = speedActual * 1.4;
            this.vx = Math.max(-velMax, Math.min(velMax, this.vx));
            this.vy = Math.max(-velMax, Math.min(velMax, this.vy));
            this.vx *= 0.97;
            this.vy *= 0.97;
        } else {
            // En suelo
            this.vx = movex * speedActual;
            this.vy = movey * speedActual;
        }

        //Movimiento con colisión
        const nuevaX = this.x + this.vx;
        const nuevaY = this.y + this.vy;

        if (!hayColision(mapa, nuevaX, this.y, this.w, this.h)) {
            this.x = nuevaX;
        } else {
            this.vx = 0; // cortamos la inercia al chocar con pared
        }
        if (!hayColision(mapa, this.x, nuevaY, this.w, this.h)) {
            this.y = nuevaY;
        } else {
            this.vy = 0;
        }

        const bloqueActual = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
        this.escondido = bloqueActual === BLOQUE.ESCONDITE;

        // Timer de invencibilidad
        if (this.invencible) {
            this.timerInvencible--;
            if (this.timerInvencible <= 0) this.invencible = false;
        }

        // Flash de daño
        if (this.flash > 0) this.flash--;

        return bloqueActual;
    }

    recibirDanio(vidas) {
        if (this.invencible) return { daño: false, muerto: false };
        this.invencible      = true;
        this.timerInvencible = 120;
        this.flash           = 10;
        return { daño: true };
    }

    // Dibuja el jugador
    dibujar(ctx) {
        // Parpadeo durante invencibilidad
        if (this.invencible && Math.floor(this.timerInvencible / 6) % 2 === 0) {
            ctx.globalAlpha = 0.35;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#4a3510';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.globalAlpha = 1.0;

        // Estilo de jugador escondido
        if (this.escondido) {
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(60, 180, 60, 0.20)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(80, 220, 80, 0.50)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}
