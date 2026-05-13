// ─────────────────────────────────────────────────────────────
// main3.js — bucle principal del Nivel 3
// Igual que main.js pero carga Nivel3 y al completar
// desbloquea Minijuego 2 y redirige al mapa
// ─────────────────────────────────────────────────────────────

import { ANCHO, ALTO, CELDA, BLOQUE, COLUMNAS_MUNDO, FILAS_MUNDO } from './utilidades/constantes.js';
import { seToca, bloqueDebajo }               from './utilidades/colisiones.js';
import { dibujaMapa }                         from './utilidades/dibujaMapa.js';
import { Jugador }                            from './entidades/Jugador.js';
import { Enemigo }                            from './entidades/Enemigo.js';
import { ProyectilRecto, ProyectilMortero }   from './entidades/Proyectil.js';
import {
    dibujarGameOver,
    dibujarMoneda,
    dibujarFlash,
    actualizarHUD,
} from './pantallas/pantallas.js';
import {
    MAPA as MAPA_N3,
    ENEMIGOS_CONFIG as ENEMIGOS_N3,
    INICIO_JUGADOR as INICIO_N3,
    PUERTA as PUERTA_N3,
    LLAVE as LLAVE_N3,
    QUESOS_PEQUENOS as QUESOS_P_N3,
    QUESOS_DORADOS as QUESOS_D_N3,
    ESCUDOS as ESCUDOS_N3,
} from './niveles/Nivel3.js';
import { QuesoPequeno, QuesoDorado, Escudo, Llave } from './entidades/Objeto.js';
import { BucleJuego }             from './motor/BucleJuego.js';
import { teclas, onTeclaPulsada } from './motor/Entrada.js';

// ─────────────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvasJuego');
const ctx    = canvas.getContext('2d');
canvas.width  = ANCHO;
canvas.height = ALTO;

// ─────────────────────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────
let estadoJuego = 'jugando';
let vidas       = 3;
let puntos      = 0;
const nivelActual = 3;

// Estado de la moneda (segunda oportunidad)
let estadoMoneda    = 'esperando';
let eleccionJugador = null;
let resultadoMoneda = null;
let frameMoneda     = 0;
let caraMostrada    = 'cara';
let monedaUsada     = false;

// ─────────────────────────────────────────────────────────────
// CARGA DEL NIVEL
// ─────────────────────────────────────────────────────────────
let mapa, jugador, enemigos, proyectiles, proyMortero, objetos, puerta, llaveCogida;

function cargarNivel() {
    mapa        = MAPA_N3.map(fila => [...fila]);
    jugador     = new Jugador(INICIO_N3.x, INICIO_N3.y);
    enemigos    = ENEMIGOS_N3.map(cfg => new Enemigo({ ...cfg, pi: 0 }));
    proyectiles = [];
    proyMortero = [];
    puerta      = PUERTA_N3;
    llaveCogida = false;
    monedaUsada = false;

    objetos = [
        new Llave(LLAVE_N3.x, LLAVE_N3.y),
        ...QUESOS_P_N3.map(q => new QuesoPequeno(q.x, q.y)),
        ...QUESOS_D_N3.map(q => new QuesoDorado(q.x, q.y, q.duracion)),
        ...ESCUDOS_N3.map(e => new Escudo(e.x, e.y)),
    ];
}

cargarNivel();

// ─────────────────────────────────────────────────────────────
// ENTRADA DE TECLADO
// ─────────────────────────────────────────────────────────────
onTeclaPulsada(function(e) {

    // Reiniciar desde gameOver
    if ((e.key === 'r' || e.key === 'R') && estadoJuego === 'gameOver') {
        vidas  = 3;
        puntos = 0;
        cargarNivel();
        estadoJuego = 'jugando';
        actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    }

    // Elección de cara o cruz
    if (estadoJuego === 'moneda' && estadoMoneda === 'esperando') {
        if (e.key === 'c' || e.key === 'C') {
            eleccionJugador = 'cara';
            resultadoMoneda = Math.random() < 0.5 ? 'cara' : 'cruz';
            estadoMoneda    = 'girando';
            frameMoneda     = 0;
        }
        if (e.key === 'x' || e.key === 'X') {
            eleccionJugador = 'cruz';
            resultadoMoneda = Math.random() < 0.5 ? 'cara' : 'cruz';
            estadoMoneda    = 'girando';
            frameMoneda     = 0;
        }
    }

    // Confirmar resultado de la moneda
    if (e.key === 'Enter' && estadoJuego === 'moneda' && estadoMoneda === 'resultado') {
        if (eleccionJugador === resultadoMoneda) {
            vidas = 1;
            jugador.x  = INICIO_N3.x;
            jugador.y  = INICIO_N3.y;
            jugador.vx = 0;
            jugador.vy = 0;
            monedaUsada  = true;
            estadoJuego  = 'jugando';
            estadoMoneda = 'esperando';
            actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
        } else {
            estadoJuego  = 'gameOver';
            estadoMoneda = 'esperando';
        }
    }

    // Cambiar personaje con Tab
    if (e.key === 'Tab') {
        e.preventDefault();
        jugador.cambiarPersonaje();
        actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    }

    // Usar habilidad con Espacio
    if (e.key === ' ' && estadoJuego === 'jugando') {
        jugador.usarMelee();
        const datosDisparo = jugador.usarDisparo();
        if (datosDisparo) {
            proyectiles.push(new ProyectilRecto(
                datosDisparo.x, datosDisparo.y,
                datosDisparo.dx, datosDisparo.dy,
                datosDisparo.speed, true
            ));
        }
    }
});

// ─────────────────────────────────────────────────────────────
// LÓGICA DE DAÑO
// ─────────────────────────────────────────────────────────────
function aplicarDanio() {
    const resultado = jugador.recibirDanio(vidas);
    if (!resultado.daño) return;
    vidas--;
    actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    if (vidas <= 0) {
        estadoJuego  = monedaUsada ? 'gameOver' : 'moneda';
        estadoMoneda = 'esperando';
    }
}

// ─────────────────────────────────────────────────────────────
// BUCLE PRINCIPAL
// ─────────────────────────────────────────────────────────────
function frame(deltaTime) {

    if (estadoJuego === 'gameOver') {
        dibujarGameOver(ctx, ANCHO, ALTO);
        return;
    }
    if (estadoJuego === 'moneda') {
        if (estadoMoneda === 'girando') {
            frameMoneda++;
            let intervalo;
            if      (frameMoneda < 20) intervalo = 3;
            else if (frameMoneda < 40) intervalo = 6;
            else if (frameMoneda < 60) intervalo = 10;
            else                       intervalo = 16;
            if (frameMoneda % intervalo === 0) {
                caraMostrada = caraMostrada === 'cara' ? 'cruz' : 'cara';
            }
            if (frameMoneda >= 80) {
                caraMostrada = resultadoMoneda;
                estadoMoneda = 'resultado';
            }
        }
        dibujarMoneda(ctx, ANCHO, ALTO, estadoMoneda, eleccionJugador, resultadoMoneda, caraMostrada);
        return;
    }

    // ── Actualización ─────────────────────────────────────────
    const bloqueActual = jugador.actualizar(mapa, teclas);
    if (bloqueActual === BLOQUE.TRAMPA) aplicarDanio();

    enemigos.forEach(en => en.actualizar(jugador, mapa, proyectiles, proyMortero));

    objetos.forEach(obj => {
        obj.actualizar();
        if (obj.comprobarRecogida(jugador)) {
            puntos += obj.puntosAlRecoger || 0;
            if (obj instanceof Escudo) jugador.activarEscudo(300);
            if (obj instanceof Llave)  llaveCogida = true;
            actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
        }
    });
    objetos = objetos.filter(obj => obj.activo);

    proyectiles.forEach(p => p.actualizar(mapa));
    proyectiles = proyectiles.filter(p => p.activo);
    proyMortero.forEach(p => p.actualizar());
    proyMortero = proyMortero.filter(p => p.activo);

    // ── Colisiones con daño ───────────────────────────────────
    if (!jugador.invencible) {
        for (const en of enemigos) {
            if (seToca(jugador.x, jugador.y, jugador.w, jugador.h, en.x, en.y, en.w, en.h)) {
                aplicarDanio(); break;
            }
        }
        for (const p of proyectiles) {
            if (!p.esDelJugador) {
                if (jugador.escudoBloqueadorActivo) {
                    const escudoX = jugador.x + jugador.w / 2 + jugador.dirX * jugador.w * 0.8;
                    const escudoY = jugador.y + jugador.h / 2 + jugador.dirY * jugador.h * 0.8;
                    const dist = Math.sqrt((p.x - escudoX) ** 2 + (p.y - escudoY) ** 2);
                    if (dist < jugador.w * 0.7 + p.w) { p.activo = false; continue; }
                }
                if (p.tocaJugador(jugador)) { aplicarDanio(); break; }
            }
        }
        for (const p of proyMortero) {
            if (p.tocaJugador(jugador)) { aplicarDanio(); break; }
        }
    }

    // ── Habilidades del jugador contra enemigos ───────────────
    if (jugador.meleeActivo) {
        const r = jugador.getRectMelee();
        if (r) {
            for (const en of enemigos) {
                if (seToca(r.x, r.y, r.w, r.h, en.x, en.y, en.w, en.h)) en.stunear(120);
            }
        }
    }
    for (const p of proyectiles) {
        if (p.esDelJugador) {
            for (const en of enemigos) {
                if (p.tocaEnemigo(en)) { en.stunear(120); break; }
            }
        }
    }

    // ── Puerta — llave + 100 puntos → desbloquea minijuego2 y redirige ──
    const puertaX = puerta.col  * CELDA;
    const puertaY = puerta.fila * CELDA;
    const condicionPuerta = llaveCogida && puntos >= 100;

    if (condicionPuerta && seToca(jugador.x, jugador.y, jugador.w, jugador.h, puertaX, puertaY, CELDA, CELDA)) {
        // Desbloquear minijuego 2 al completar el nivel 3
        localStorage.setItem('minijuego2_desbloqueado', 'true');
        window.location.href = '../Mapa/mapa.html';
        return;
    }

    // ── Cámara ────────────────────────────────────────────────
    const mundoAncho = COLUMNAS_MUNDO * CELDA;
    const mundoAlto  = FILAS_MUNDO    * CELDA;
    const camX = Math.max(0, Math.min(jugador.x + jugador.w / 2 - ANCHO / 2, mundoAncho - ANCHO));
    const camY = Math.max(0, Math.min(jugador.y + jugador.h / 2 - ALTO  / 2, mundoAlto  - ALTO));

    // ── Dibujo ────────────────────────────────────────────────
    ctx.clearRect(0, 0, ANCHO, ALTO);
    dibujaMapa(ctx, mapa, camX, camY, condicionPuerta);
    objetos.forEach(obj => obj.dibujar(ctx, camX, camY));
    enemigos.forEach(en => en.dibujar(ctx, jugador, camX, camY));
    jugador.dibujar(ctx, camX, camY);
    proyectiles.forEach(p => p.dibujar(ctx, camX, camY));
    proyMortero.forEach(p => p.dibujar(ctx, camX, camY));

    // ── Indicador de condiciones ──────────────────────────────
    const iconoLlave  = llaveCogida ? '🗝️ ✓' : '🗝️ ✗';
    const iconoPuntos = puntos >= 100 ? '★ ✓' : `★ ${puntos}/100`;
    ctx.font = '14px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillStyle = llaveCogida ? '#40c040' : '#c04040';
    ctx.fillText(iconoLlave, 12, ALTO - 30);
    ctx.fillStyle = puntos >= 100 ? '#40c040' : '#e8c040';
    ctx.fillText(iconoPuntos, 12, ALTO - 10);

    jugador.flash = dibujarFlash(ctx, ANCHO, ALTO, jugador.flash);
}

// ─────────────────────────────────────────────────────────────
// ARRANQUE
// ─────────────────────────────────────────────────────────────
actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
const bucle = new BucleJuego(frame);
bucle.iniciar();
