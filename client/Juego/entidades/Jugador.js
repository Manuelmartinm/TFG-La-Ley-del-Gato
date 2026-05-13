// ─────────────────────────────────────────────────────────────
// Jugador.js — clase que encapsula el estado y la lógica del jugador
// El jugador no sabe nada de enemigos ni de pantallas.
// Solo sabe moverse, recibir daño y dibujarse.
// ─────────────────────────────────────────────────────────────

import { CELDA, BLOQUE } from '../utilidades/constantes.js';
import { hayColision, bloqueDebajo } from '../utilidades/colisiones.js';

// Lista de personajes disponibles — cada uno tiene distintas propiedades
export const PERSONAJES = [
    { nombre: 'Raton A', w: 26, h: 26, speed: 3, color: '#e8c040', habilidad: 'melee'    },
    { nombre: 'Raton B', w: 18, h: 18, speed: 4, color: '#c8a030', habilidad: 'disparo'  },
    { nombre: 'Raton C', w: 34, h: 34, speed: 2, color: '#e8f080', habilidad: 'escudo'   },
];

export class Jugador {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.indicePersonaje = 0;

        // Copiamos las propiedades del personaje activo
        this._aplicarPersonaje();

        // Velocidad acumulada — necesaria para el efecto de inercia en el hielo
        this.vx = 0;
        this.vy = 0;

        // Estado de daño
        this.invencible      = false;
        this.timerInvencible = 0;
        this.flash           = 0;

        // Escudo temporal — cuando está activo el jugador es invencible
        this.escudoActivo = false;
        this.timerEscudo  = 0;

        // Estado de entorno
        this.escondido = false;

        // ── Habilidad del personaje ───────────────────────────────────────────
        // dirX, dirY guardan la última dirección de movimiento
        // Se usan para orientar la habilidad (golpe, disparo, escudo)
        this.dirX = 1;
        this.dirY = 0;

        // Melee (Ratón A) — área de golpe activa unos frames
        this.meleeActivo   = false;
        this.timerMelee    = 0;
        this.cooldownMelee = 0; // frames hasta poder volver a usar

        // Disparo (Ratón B) — cadencia de disparo
        this.cooldownDisparo = 0;

        // Escudo bloqueador (Ratón C) — bloquea proyectiles mientras se mantiene pulsado
        this.escudoBloqueadorActivo = false;
    }

    // Aplica las propiedades del personaje activo (w, h, speed, color)
    _aplicarPersonaje() {
        const p = PERSONAJES[this.indicePersonaje];
        this.w         = p.w;
        this.h         = p.h;
        this.speed     = p.speed;
        this.color     = p.color;
        this.nombre    = p.nombre;
        this.habilidad = p.habilidad;
    }

    cambiarPersonaje() {
        this.indicePersonaje = (this.indicePersonaje + 1) % PERSONAJES.length;
        this._aplicarPersonaje();
        // Reseteamos habilidades al cambiar
        this.meleeActivo           = false;
        this.timerMelee            = 0;
        this.cooldownMelee         = 0;
        this.cooldownDisparo       = 0;
        this.escudoBloqueadorActivo = false;
    }

    // ── Ratón A: ataque cuerpo a cuerpo ──────────────────────────────────────
    // Activa el área de golpe 12px delante del jugador durante 12 frames.
    // Devuelve el rectángulo del golpe para que main.js compruebe colisiones.
    usarMelee() {
        if (this.habilidad !== 'melee' || this.cooldownMelee > 0) return null;
        this.meleeActivo   = true;
        this.timerMelee    = 12;  // frames que dura el golpe
        this.cooldownMelee = 40;  // frames hasta poder volver a golpear
        return this.getRectMelee();
    }

    // Rectángulo del golpe — delante del jugador según dirección
    getRectMelee() {
        if (!this.meleeActivo) return null;
        const alcance = 28;
        const tam     = 24;
        return {
            x: this.x + this.w / 2 + this.dirX * alcance - tam / 2,
            y: this.y + this.h / 2 + this.dirY * alcance - tam / 2,
            w: tam, h: tam,
        };
    }

    // ── Ratón B: disparo a distancia ─────────────────────────────────────────
    // Devuelve un objeto con los datos del proyectil o null si está en cooldown.
    // main.js crea el ProyectilRecto con estos datos.
    usarDisparo() {
        if (this.habilidad !== 'disparo' || this.cooldownDisparo > 0) return null;
        this.cooldownDisparo = 30; // frames entre disparos

        // Normalizamos la dirección para disparos diagonales
        const len = Math.sqrt(this.dirX ** 2 + this.dirY ** 2) || 1;
        return {
            x:  this.x + this.w / 2,
            y:  this.y + this.h / 2,
            dx: this.dirX / len,
            dy: this.dirY / len,
            speed: 7,
            esDelJugador: true, // distingue proyectiles del jugador de los enemigos
        };
    }

    // Actualiza la posición del jugador según las teclas pulsadas y el bloque bajo sus pies
    // mapa    → matriz del nivel actual (para detectar colisiones y tipo de suelo)
    // teclas  → objeto { ArrowLeft: true, ... } gestionado por Entrada.js
    actualizar(mapa, teclas) {
        let movex = 0;
        let movey = 0;
        if (teclas['ArrowLeft']  || teclas['a']) movex = -1;
        if (teclas['ArrowRight'] || teclas['d']) movex =  1;
        if (teclas['ArrowUp']    || teclas['w']) movey = -1;
        if (teclas['ArrowDown']  || teclas['s']) movey =  1;

        // Guardamos la última dirección para orientar la habilidad
        if (movex !== 0 || movey !== 0) {
            this.dirX = movex;
            this.dirY = movey;
        }

        if (movex !== 0 && movey !== 0) {
            movex *= 0.707;
            movey *= 0.707;
        }

        // Ratón C — escudo bloqueador activo mientras se mantiene Espacio pulsado
        this.escudoBloqueadorActivo = this.habilidad === 'escudo' && !!teclas[' '];

        // Cooldowns de habilidades
        if (this.cooldownMelee   > 0) this.cooldownMelee--;
        if (this.cooldownDisparo > 0) this.cooldownDisparo--;
        if (this.timerMelee      > 0) { this.timerMelee--; } else { this.meleeActivo = false; }

        // ── Tipo de bloque bajo los pies ──────────────────────────────────────
        const bloque = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
        const enHielo = bloque === BLOQUE.HIELO;
        const enBarro = bloque === BLOQUE.BARRO;

        // speedActual se reduce en barro — nunca tocamos this.speed (es el valor base)
        const speedActual = enBarro ? this.speed * 0.4 : this.speed;

        // ── Cálculo de velocidad ──────────────────────────────────────────────
        if (enHielo) {
            // En hielo: aceleración gradual y fricción baja (inercia)
            this.vx += movex * speedActual * 0.15;
            this.vy += movey * speedActual * 0.15;
            const velMax = speedActual * 1.4;
            this.vx = Math.max(-velMax, Math.min(velMax, this.vx));
            this.vy = Math.max(-velMax, Math.min(velMax, this.vy));
            this.vx *= 0.97;
            this.vy *= 0.97;
        } else {
            // En suelo normal o barro: respuesta inmediata al input
            this.vx = movex * speedActual;
            this.vy = movey * speedActual;
        }

        // ── Movimiento con colisión ───────────────────────────────────────────
        // Separamos X e Y para permitir deslizamiento suave por esquinas
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

        // ── Estado de entorno ─────────────────────────────────────────────────
        // Se recalcula cada frame según el bloque actual (ya actualizado arriba)
        const bloqueActual = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
        this.escondido = bloqueActual === BLOQUE.ESCONDITE;

        // ── Timer de invencibilidad ───────────────────────────────────────────
        if (this.invencible) {
            this.timerInvencible--;
            if (this.timerInvencible <= 0) this.invencible = false;
        }

        // ── Timer del escudo ──────────────────────────────────────────────────
        if (this.escudoActivo) {
            this.timerEscudo--;
            if (this.timerEscudo <= 0) {
                this.escudoActivo = false;
                this.invencible   = false;
            }
        }

        // ── Flash de daño ─────────────────────────────────────────────────────
        if (this.flash > 0) this.flash--;

        // Devolvemos el bloque para que el nivel lo use (trampa, etc.)
        return bloqueActual;
    }

    // Aplica daño al jugador si no es invencible
    // Devuelve true si el jugador ha muerto (vidas <= 0)
    recibirDanio(vidas) {
        if (this.invencible) return { daño: false, muerto: false };
        this.invencible      = true;
        this.timerInvencible = 120;
        this.flash           = 10;
        return { daño: true };
    }

    // Dibuja el jugador en el canvas
    // Si está parpadeando por invencibilidad se hace semitransparente
    // Activa el escudo — hace al jugador invencible durante `duracion` frames
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

        // Aura azul del escudo — pulsa suavemente
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

        // ── Golpe melee (Ratón A) ─────────────────────────────────────────────
        if (this.meleeActivo) {
            const r = this.getRectMelee();
            if (r) {
                ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
                ctx.fillRect(r.x - camX, r.y - camY, r.w, r.h);
                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 2;
                ctx.strokeRect(r.x - camX, r.y - camY, r.w, r.h);
            }
        }

        // ── Escudo bloqueador (Ratón C) ───────────────────────────────────────
        if (this.escudoBloqueadorActivo) {
            const sx = px + this.w / 2 + this.dirX * (this.w * 0.8);
            const sy = py + this.h / 2 + this.dirY * (this.h * 0.8);
            ctx.beginPath();
            ctx.arc(sx, sy, this.w * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 180, 255, 0.35)';
            ctx.fill();
            ctx.strokeStyle = '#40a0ff';
            ctx.lineWidth = 3;
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