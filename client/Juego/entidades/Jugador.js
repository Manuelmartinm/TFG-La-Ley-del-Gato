
import { CELDA, BLOQUE } from '../utilidades/constantes.js';
import { hayColision, bloqueDebajo } from '../utilidades/colisiones.js';

// Lista de personajes
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

        // personaje activo
        this._aplicarPersonaje();

        // Velocidad acumulada
        this.vx = 0;
        this.vy = 0;

        // Estado de daño
        this.invencible      = false;
        this.timerInvencible = 0;
        this.flash           = 0;

        // Escudo temporal
        this.escudoActivo = false;
        this.timerEscudo  = 0;

        // Estado de entorno
        this.escondido = false;
    }

    // Aplica las propiedades del personaje activo
    _aplicarPersonaje() {
        const p = PERSONAJES[this.indicePersonaje];
        this.w     = p.w;
        this.h     = p.h;
        this.speed = p.speed;
        this.color = p.color;
        this.nombre = p.nombre;
    }

    // Cambia al siguiente personaje de la lista
    cambiarPersonaje() {
        this.indicePersonaje = (this.indicePersonaje + 1) % PERSONAJES.length;
        this._aplicarPersonaje();
    }

    // Actualiza la posición del jugador
    actualizar(mapa, teclas) {
        // Dirección de input
        let movex = 0;
        let movey = 0;
        if (teclas['ArrowLeft']  || teclas['a']) movex = -1;
        if (teclas['ArrowRight'] || teclas['d']) movex =  1;
        if (teclas['ArrowUp']    || teclas['w']) movey = -1;
        if (teclas['ArrowDown']  || teclas['s']) movey =  1;

        // Diagonal
        if (movex !== 0 && movey !== 0) {
            movex *= 0.707;
            movey *= 0.707;
        }

        // Tipo de bloque bajo los pies
        const bloque = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
        const enHielo = bloque === BLOQUE.HIELO;
        const enBarro = bloque === BLOQUE.BARRO;


        const speedActual = enBarro ? this.speed * 0.4 : this.speed;

        // Cálculo de velocidad
        if (enHielo) {
            // En hielo
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

        // Movimiento con colisión
        // deslizamiento  por esquinas
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

        // Estado de entorno
        const bloqueActual = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
        this.escondido = bloqueActual === BLOQUE.ESCONDITE;

        // Timer de invencibilidad
        if (this.invencible) {
            this.timerInvencible--;
            if (this.timerInvencible <= 0) this.invencible = false;
        }

        // Timer del escudo
        if (this.escudoActivo) {
            this.timerEscudo--;
            if (this.timerEscudo <= 0) {
                this.escudoActivo = false;
                this.invencible   = false;
            }
        }

        // Flash de daño
        if (this.flash > 0) this.flash--;

        return bloqueActual;
    }

    // Aplica daño al jugador
    recibirDanio(vidas) {
        if (this.invencible) return { daño: false, muerto: false };
        this.invencible      = true;
        this.timerInvencible = 120;
        this.flash           = 10;
        return { daño: true };
    }

    // Dibuja el jugador
    activarEscudo(duracion = 300) {
        this.escudoActivo = true;
        this.timerEscudo  = duracion;
        this.invencible   = true;
        this.timerInvencible = duracion;
    }

    dibujar(ctx, camX, camY) {
        const px = this.x - camX;
        const py = this.y - camY;

        if (this.invencible && Math.floor(this.timerInvencible / 6) % 2 === 0 && !this.escudoActivo) {
            ctx.globalAlpha = 0.35;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(px, py, this.w, this.h);
        ctx.strokeStyle = '#4a3510';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, this.w, this.h);

        ctx.globalAlpha = 1.0;

        // Aura azul del escudo
        if (this.escudoActivo) {
            const pulso = Math.sin(Date.now() / 150) * 0.15 + 0.35;
            ctx.beginPath();
            ctx.arc(px + this.w / 2, py + this.h / 2, this.w * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(40, 140, 255, ${pulso})`;
            ctx.fill();
            ctx.strokeStyle = '#40a0ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Halo verde del escondite
        if (this.escondido) {
            ctx.beginPath();
            ctx.arc(px + this.w / 2, py + this.h / 2, this.w, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(60, 180, 60, 0.20)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(80, 220, 80, 0.50)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}