// ─────────────────────────────────────────────────────────────
// Jugador.js — clase que encapsula el estado y la lógica del jugador
// El jugador no sabe nada de enemigos ni de pantallas.
// Solo sabe moverse, recibir daño y dibujarse.
// ─────────────────────────────────────────────────────────────

import { CELDA, BLOQUE } from '../utilidades/constantes.js';
import { hayColision, bloqueDebajo } from '../utilidades/colisiones.js';

// ─────────────────────────────────────────────────────────────
// SPRITES — cada ratón tiene su propia imagen/animación
// Los objetos Image se crean una sola vez aquí (fuera de la clase)
// para no recargar la textura cada frame.
// ─────────────────────────────────────────────────────────────

// Ratón Grande (Raton A) — spritesheet 255×268, cuadrícula 3×4, celdas 85×67
// Fila 0 (y=0)  → idle frontal, 3 frames horizontales
// Fila 1 (y=67) → correr lateral, 3 frames horizontales
// Ratón Grande (Raton A) — dos spritesheets de 96×16 (6 frames de 16×16 en horizontal)
// RatonGrande_t      → idle (usamos solo el primer frame)
// RatonGrandeCorriendo_t → correr (6 frames en horizontal)
const IMG_GRANDE_IDLE   = new Image(); IMG_GRANDE_IDLE.src   = 'assets/sprites/RatonGrande_t.png';
const IMG_GRANDE_CORRER = new Image(); IMG_GRANDE_CORRER.src = 'assets/sprites/RatonGrandeCorriendo_t.png';

// Ratón Mediano (Raton B) — 3 archivos PNG con transparencia (~61×22 px)
// RatStand_t → idle (1 frame, fondo transparente)
// Ratw1_t, Ratw2_t → correr (2 frames alternados, fondo transparente)
// NOTA: usar las versiones _t (con transparencia) generadas desde los originales
const IMG_MEDIANO_IDLE = new Image(); IMG_MEDIANO_IDLE.src = 'assets/sprites/RatStand_t.png';
const IMG_MEDIANO_W1   = new Image(); IMG_MEDIANO_W1.src   = 'assets/sprites/Ratw1_t.png';
const IMG_MEDIANO_W2   = new Image(); IMG_MEDIANO_W2.src   = 'assets/sprites/Ratw2_t.png';

// Ratón Pequeño (Raton C) — spritesheets de 32×192 (6 frames de 32×32 en vertical)
// ratonpequeño      → idle (primer frame)
// RatonPequeñoCorriendo → correr (6 frames verticales)
const IMG_PEQUENO_IDLE   = new Image(); IMG_PEQUENO_IDLE.src   = 'assets/sprites/ratonpequeño.png';
const IMG_PEQUENO_CORRER = new Image(); IMG_PEQUENO_CORRER.src = 'assets/sprites/RatonPequeñoCorriendo.png';

// ─────────────────────────────────────────────────────────────
// HITBOXES
// CELDA = 40px — un hueco de 1 celda mide exactamente 40px libres
// Pequeño: 20×20 → pasa por hueco de 1 celda (margen 10px c/lado)
// Mediano: 32×32 → NO pasa por 1 celda, SÍ por 2 celdas (80px)
// Grande:  36×36 → NO pasa por 1 celda, SÍ por 2 celdas, mayor que mediano
// ─────────────────────────────────────────────────────────────

// Lista de personajes disponibles — cada uno tiene distintas propiedades
// w y h son el tamaño de colisión (hitbox), no el del sprite dibujado
export const PERSONAJES = [
    { nombre: 'Raton A', w: 38, h: 38, speed: 3, color: '#e8c040', habilidad: 'melee'   },
    { nombre: 'Raton B', w: 28, h: 28, speed: 4, color: '#c8a030', habilidad: 'disparo' },
    { nombre: 'Raton C', w: 18, h: 18, speed: 5, color: '#e8f080', habilidad: 'escudo'  },
];

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE ANIMACIÓN POR PERSONAJE
// Para Grande y Pequeño: spritesheet con { img, sx, sy, srcW, srcH, frames, fps, drawW, drawH }
// Para Mediano: imágenes individuales con { imgs[], frames, fps, drawW, drawH }
// drawW/drawH → tamaño en pantalla (puede diferir de la hitbox)
// vertical    → true si los frames van de arriba a abajo (pequeño corriendo)
// ─────────────────────────────────────────────────────────────
const ANIM = {
    // Ratón Grande: spritesheet 255×268, celdas 85×67
    // Idle  → fila 0 (sy=0),  3 frames horizontales
    // Correr → fila 1 (sy=67), 3 frames horizontales
    grande: {
        idle:   { img: IMG_GRANDE_IDLE,   sx: 0, sy: 0, srcW: 16, srcH: 16, frames: 1, fps: 1,  drawW: 36, drawH: 36 },
        correr: { img: IMG_GRANDE_CORRER, sx: 0, sy: 0, srcW: 16, srcH: 16, frames: 6, fps: 10, drawW: 36, drawH: 36 },
    },
    // Ratón Mediano: imágenes individuales ~61×22 px con transparencia
    // idle   → [IMG_MEDIANO_IDLE] (1 frame)
    // correr → [IMG_MEDIANO_W1, IMG_MEDIANO_W2] (2 frames alternados)
    mediano: {
        idle:   { imgs: [IMG_MEDIANO_IDLE],       frames: 1, fps: 1, drawW: 50, drawH: 18 },
        correr: { imgs: [IMG_MEDIANO_W1, IMG_MEDIANO_W2], frames: 2, fps: 8, drawW: 50, drawH: 18 },
    },
    // Ratón Pequeño: 6 frames de 32×32 en vertical
    // idle   → primer frame de ratonpequeño
    // correr → 6 frames de RatonPequeñoCorriendo en vertical
    pequeno: {
        idle:   { img: IMG_PEQUENO_IDLE,   sx: 0, sy: 0, srcW: 32, srcH: 32, frames: 1, fps: 1,  drawW: 26, drawH: 26 },
        correr: { img: IMG_PEQUENO_CORRER, sx: 0, sy: 0, srcW: 32, srcH: 32, frames: 6, fps: 10, drawW: 26, drawH: 26, vertical: true },
    },
};

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

        // ── Animación de sprite ───────────────────────────────────────────────
        this.frameAnim    = 0;
        this.timerAnim    = 0;
        this.moviendose   = false;
        this._animAnterior = null; // guarda referencia al anim activo para detectar cambios
    }

    // Aplica las propiedades del personaje activo (w, h, speed, color, anim)
    _aplicarPersonaje() {
        const p = PERSONAJES[this.indicePersonaje];
        this.w         = p.w;
        this.h         = p.h;
        this.speed     = p.speed;
        this.color     = p.color;
        this.nombre    = p.nombre;
        this.habilidad = p.habilidad;
        // Reseteamos animación al cambiar de personaje
        this.frameAnim     = 0;
        this.timerAnim     = 0;
        this._animAnterior = null;
    }

    // Devuelve el objeto de animación correspondiente al estado actual
    _getAnim() {
        const claves = ['grande', 'mediano', 'pequeno'];
        return this.moviendose
            ? ANIM[claves[this.indicePersonaje]].correr
            : ANIM[claves[this.indicePersonaje]].idle;
    }

    // Avanza el frame de animación según el fps configurado (~60fps de juego)
    // FIX: resetea timerAnim cuando cambia de animación (idle↔correr)
    // Esto evita que el primer frame de la nueva animación se salte inmediatamente
    _avanzarAnim(anim) {
        // Si cambió la animación (p.ej. idle→correr), reseteamos el contador
        if (anim !== this._animAnterior) {
            this.timerAnim     = 0;
            this.frameAnim     = 0;
            this._animAnterior = anim;
        }
        const intervalo = Math.max(1, Math.round(60 / anim.fps));
        this.timerAnim++;
        if (this.timerAnim >= intervalo) {
            this.timerAnim = 0;
            this.frameAnim = (this.frameAnim + 1) % anim.frames;
        }
    }

    cambiarPersonaje() {
        this.indicePersonaje = (this.indicePersonaje + 1) % PERSONAJES.length;
        this._aplicarPersonaje();
        // Reseteamos habilidades al cambiar
        this.meleeActivo            = false;
        this.timerMelee             = 0;
        this.cooldownMelee          = 0;
        this.cooldownDisparo        = 0;
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

        // Indica si el jugador se está moviendo — controla qué animación usar
        this.moviendose = movex !== 0 || movey !== 0;

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
        const bloque  = bloqueDebajo(mapa, this.x, this.y, this.w, this.h);
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

        // ── Avance de animación ───────────────────────────────────────────────
        const animActual = this._getAnim();
        this._avanzarAnim(animActual);

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

    // Activa el escudo — hace al jugador invencible durante `duracion` frames
    activarEscudo(duracion = 300) {
        this.escudoActivo    = true;
        this.timerEscudo     = duracion;
        this.invencible      = true;
        this.timerInvencible = duracion;
    }

    // Dibuja el jugador en el canvas
    // Si está parpadeando por invencibilidad se hace semitransparente
    dibujar(ctx, camX, camY) {
        const px = this.x - camX;
        const py = this.y - camY;

        if (this.invencible && Math.floor(this.timerInvencible / 6) % 2 === 0 && !this.escudoActivo) {
            ctx.globalAlpha = 0.35;
        }

        // ── Dibujo del sprite del ratón activo ───────────────────────────────
        const anim = this._getAnim();
        const dW = anim.drawW || this.w;
        const dH = anim.drawH || this.h;
        // Centramos el sprite sobre la hitbox
        const dX = px + (this.w - dW) / 2;
        const dY = py + (this.h - dH) / 2;

        let dibujado = false;

        if (anim.imgs) {
            // ── Mediano: imágenes individuales con transparencia ──────────────
            const img = anim.imgs[this.frameAnim % anim.frames];
            if (img && img.complete && img.naturalWidth > 0) {
                this._dibujarConEspejado(ctx, img, 0, 0, img.naturalWidth, img.naturalHeight, dX, dY, dW, dH);
                dibujado = true;
            }
        } else if (anim.img && anim.img.complete && anim.img.naturalWidth > 0) {
            // ── Grande y Pequeño: spritesheet ─────────────────────────────────
            // Los frames del pequeño corriendo van en vertical (top→bottom)
            // Los frames van en horizontal dentro de su fila
            const srcX = anim.vertical ? anim.sx : anim.sx + this.frameAnim * anim.srcW;
            const srcY = anim.vertical ? anim.sy + this.frameAnim * anim.srcH : anim.sy;
            this._dibujarConEspejado(ctx, anim.img, srcX, srcY, anim.srcW, anim.srcH, dX, dY, dW, dH);
            dibujado = true;
        }

        // Fallback: rectángulo de color mientras la imagen carga
        if (!dibujado) {
            ctx.fillStyle = this.color;
            ctx.fillRect(px, py, this.w, this.h);
            ctx.strokeStyle = '#4a3510';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, this.w, this.h);
        }

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

    // Espeja el sprite horizontalmente si el jugador va hacia la izquierda
    _dibujarConEspejado(ctx, img, srcX, srcY, srcW, srcH, dX, dY, dW, dH) {
        if (this.dirX < 0) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(img, srcX, srcY, srcW, srcH, -(dX + dW), dY, dW, dH);
            ctx.restore();
        } else {
            ctx.drawImage(img, srcX, srcY, srcW, srcH, dX, dY, dW, dH);
        }
    }
}