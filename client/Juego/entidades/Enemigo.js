// ─────────────────────────────────────────────────────────────
// Enemigo.js — clase que encapsula todos los tipos de enemigo
// Cada tipo tiene su propio comportamiento en actualizar().
// Para añadir un tipo nuevo: añadir un else if en actualizar()
// y crear el objeto con las propiedades necesarias en el nivel.
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';
import { hayColision } from '../utilidades/colisiones.js';
import { ProyectilRecto, ProyectilMortero } from './Proyectil.js';

// ─────────────────────────────────────────────────────────────
// SPRITES — imágenes cargadas una sola vez para todos los enemigos
// Cada tipo tiene idle y correr (o equivalente)
// ─────────────────────────────────────────────────────────────

// ── PATRULLA (gato) ───────────────────────────────────────────
// Idle: 224×32 → 7 frames de 32×32 en horizontal
// Correr: 416×32 → 13 frames de 32×32 en horizontal
const IMG_PATRULLA_IDLE   = new Image(); IMG_PATRULLA_IDLE.src   = 'assets/sprites/PatrullaIdleCatb.png';
const IMG_PATRULLA_CORRER = new Image(); IMG_PATRULLA_CORRER.src = 'assets/sprites/PatrullaJumpCabt.png';

// ── CAZADOR (gato variante) ───────────────────────────────────
// Idle: 224×32 → 7 frames de 32×32 en horizontal
// Correr: 416×32 → 13 frames de 32×32 en horizontal
const IMG_CAZADOR_IDLE   = new Image(); IMG_CAZADOR_IDLE.src   = 'assets/sprites/CazadorIdleCatd.png';
const IMG_CAZADOR_CORRER = new Image(); IMG_CAZADOR_CORRER.src = 'assets/sprites/CazadorJumpCatd.png';

// ── MORTERO (rana) ────────────────────────────────────────────
// Spritesheet: 64×16 → 4 frames de 16×16 en horizontal
const IMG_MORTERO = new Image(); IMG_MORTERO.src = 'assets/sprites/MorteroLeapingFrog.png';

// ── RAPIDO (murciélago) ───────────────────────────────────────
// Spritesheet: 64×16 → 4 frames de 16×16 en horizontal
const IMG_RAPIDO = new Image(); IMG_RAPIDO.src = 'assets/sprites/RapidoSwoopingBat.png';

// ── CENTINELA (araña) ─────────────────────────────────────────
// Idle: 3 archivos separados de 96×64, cada uno = 1 frame
// Walk: 5 archivos separados de 96×64, cada uno = 1 frame
const IMG_CENTINELA_IDLE = [
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_idle1.png'; return i; })(),
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_idle2.png'; return i; })(),
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_idle3.png'; return i; })(),
];
const IMG_CENTINELA_WALK = [
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_walk1.png'; return i; })(),
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_walk2.png'; return i; })(),
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_walk3.png'; return i; })(),
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_walk4.png'; return i; })(),
    (() => { const i = new Image(); i.src = 'assets/sprites/centinelaspider_walk5.png'; return i; })(),
];

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE ANIMACIÓN POR TIPO
// srcW/srcH → tamaño de cada frame en el spritesheet
// frames    → número de frames
// fps       → velocidad de animación
// drawW/drawH → tamaño en pantalla (puede ser distinto al srcW/srcH)
// ─────────────────────────────────────────────────────────────
const ANIM_ENEMIGO = {
    [TIPO_ENEMIGO.PATRULLA]: {
        idle:   { img: IMG_PATRULLA_IDLE,   srcW: 32, srcH: 32, frames: 7,  fps: 6,  drawW: 32, drawH: 32 },
        correr: { img: IMG_PATRULLA_CORRER, srcW: 32, srcH: 32, frames: 13, fps: 12, drawW: 32, drawH: 32 },
    },
    [TIPO_ENEMIGO.CAZADOR]: {
        idle:   { img: IMG_CAZADOR_IDLE,   srcW: 32, srcH: 32, frames: 7,  fps: 6,  drawW: 32, drawH: 32 },
        correr: { img: IMG_CAZADOR_CORRER, srcW: 32, srcH: 32, frames: 13, fps: 12, drawW: 32, drawH: 32 },
    },
    // Mortero: siempre animado (está fijo pero la rana salta en sitio)
    [TIPO_ENEMIGO.MORTERO]: {
        idle:   { img: IMG_MORTERO, srcW: 16, srcH: 16, frames: 4, fps: 5, drawW: 32, drawH: 32 },
        correr: { img: IMG_MORTERO, srcW: 16, srcH: 16, frames: 4, fps: 8, drawW: 32, drawH: 32 },
    },
    // Rápido: siempre animado (murciélago volando)
    [TIPO_ENEMIGO.RAPIDO]: {
        idle:   { img: IMG_RAPIDO, srcW: 16, srcH: 16, frames: 4, fps: 6,  drawW: 28, drawH: 28 },
        correr: { img: IMG_RAPIDO, srcW: 16, srcH: 16, frames: 4, fps: 10, drawW: 28, drawH: 28 },
    },
    // Centinela: usa arrays de imágenes individuales en vez de spritesheet
    [TIPO_ENEMIGO.CENTINELA]: {
        idle:   { imgs: IMG_CENTINELA_IDLE, frames: 3, fps: 4, drawW: 48, drawH: 32 },
        correr: { imgs: IMG_CENTINELA_WALK, frames: 5, fps: 8, drawW: 48, drawH: 32 },
    },
};

// ─────────────────────────────────────────────────────────────
// VALORES BASE POR TIPO
// Cada tipo tiene sus propiedades predefinidas.
// En los niveles solo hace falta indicar tipo y posición.
// ─────────────────────────────────────────────────────────────
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
        rango: 380,  // rango amplio — el mortero es un arma de largo alcance
    },
};

export class Enemigo {
    // config es un objeto con todas las propiedades del enemigo
    // (x, y, w, h, speed, color, tipo, patrol, rango, etc.)
    constructor(config) {
        // Primero aplicamos los valores base del tipo
        // Luego sobreescribimos con lo que venga del config del nivel
        const defaults = DEFAULTS[config.tipo] || {};
        Object.assign(this, defaults, config);
        this.pi = this.pi ?? 0;
        this.timerStun = 0;

        // ── Animación ─────────────────────────────────────────
        this.frameAnim  = 0;
        this.timerAnim  = 0;
        this.moviendose = false; // true cuando se está desplazando
        this.dirX       = 1;    // última dirección horizontal — para espejado
    }

    // Aplica stun al enemigo durante `frames` frames
    stunear(frames = 120) {
        this.timerStun = frames;
    }

    // Avanza el frame de animación según el fps configurado (~60fps de juego)
    _avanzarAnim(anim) {
        const intervalo = Math.max(1, Math.round(60 / anim.fps));
        this.timerAnim++;
        if (this.timerAnim >= intervalo) {
            this.timerAnim = 0;
            this.frameAnim = (this.frameAnim + 1) % anim.frames;
        }
    }

    // Devuelve la configuración de animación activa (idle o correr)
    _getAnim() {
        const animSet = ANIM_ENEMIGO[this.tipo];
        if (!animSet) return null;
        return this.moviendose ? animSet.correr : animSet.idle;
    }

    // Actualiza la posición del enemigo según su tipo
    actualizar(jugador, mapa, proyectiles, proyMortero) {
        // Si está stuneado contamos el timer y no hacemos nada más
        if (this.timerStun > 0) {
            this.timerStun--;
            this.moviendose = false;
            // Avanzamos animación igualmente para que no se congele visualmente
            const anim = this._getAnim();
            if (anim) this._avanzarAnim(anim);
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

        // Avanzamos la animación cada frame
        const anim = this._getAnim();
        if (anim) this._avanzarAnim(anim);
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
            this.moviendose = false;
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const nx_ = this.x + nx * this.speed;
            const ny_ = this.y + ny * this.speed;
            if (!hayColision(mapa, nx_, this.y, this.w, this.h)) this.x = nx_;
            if (!hayColision(mapa, this.x, ny_, this.w, this.h)) this.y = ny_;
            // Guardamos dirección horizontal para espejado del sprite
            if (dx !== 0) this.dirX = dx > 0 ? 1 : -1;
            this.moviendose = true;
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
            if (dx !== 0) this.dirX = dx > 0 ? 1 : -1;
            this.moviendose = true;
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
                if (dox !== 0) this.dirX = dox > 0 ? 1 : -1;
                this.moviendose = true;
            } else {
                this.moviendose = false;
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

        // Orientamos el sprite hacia donde dispara
        if (dirX !== 0) this.dirX = dirX;

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

    // ─────────────────────────────────────────────────────────
    // DIBUJO
    // ─────────────────────────────────────────────────────────
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

        // ── Transparencia si está stuneado ────────────────────────────────────
        ctx.globalAlpha = this.timerStun > 0 ? 0.5 : 1.0;

        // ── Dibujo del sprite ─────────────────────────────────────────────────
        const anim = this._getAnim();

        if (anim && this._intentarDibujarSprite(ctx, anim, px, py)) {
            // sprite dibujado correctamente
        } else {
            // Fallback: rectángulo de color si la imagen no está lista
            ctx.fillStyle = this.color;
            ctx.fillRect(px, py, this.w, this.h);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, this.w, this.h);
        }

        ctx.globalAlpha = 1.0;

        // Estrellas de stun encima del enemigo
        if (this.timerStun > 0) {
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('★', px + this.w / 2, py - 4);
            ctx.textAlign = 'left';
        }
    }

    // Intenta dibujar el sprite — devuelve true si lo consigue
    // Soporta dos formatos: spritesheet horizontal (img) y frames individuales (imgs)
    _intentarDibujarSprite(ctx, anim, px, py) {
        const dW = anim.drawW || this.w;
        const dH = anim.drawH || this.h;
        // Centramos el sprite sobre la hitbox
        const dX = px + (this.w - dW) / 2;
        const dY = py + (this.h - dH) / 2;

        // ── Centinela: frames en archivos individuales ────────────────────────
        if (anim.imgs) {
            const img = anim.imgs[this.frameAnim % anim.frames];
            if (!img || !img.complete || img.naturalWidth === 0) return false;
            this._dibujarConEspejado(ctx, img, 0, 0, img.naturalWidth, img.naturalHeight, dX, dY, dW, dH);
            return true;
        }

        // ── Resto: spritesheet horizontal ─────────────────────────────────────
        if (!anim.img || !anim.img.complete || anim.img.naturalWidth === 0) return false;
        const srcX = this.frameAnim * anim.srcW;
        this._dibujarConEspejado(ctx, anim.img, srcX, 0, anim.srcW, anim.srcH, dX, dY, dW, dH);
        return true;
    }

    // Dibuja la imagen espejada si el enemigo va hacia la izquierda
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
