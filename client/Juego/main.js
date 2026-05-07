// ─────────────────────────────────────────────────────────────
// main.js — punto de entrada y bucle principal del juego
// Este archivo es el "director de orquesta":
//   - Arranca el juego
//   - Gestiona el estado global (jugando/gameOver/moneda/nivelCompletado)
//   - Llama a las entidades para que se actualicen y se dibujen
//   - NO contiene lógica de física, colisión ni dibujo directo
// ─────────────────────────────────────────────────────────────

import { ANCHO, ALTO, CELDA, BLOQUE, COLUMNAS_MUNDO, FILAS_MUNDO } from './utilidades/constantes.js';
import { seToca, bloqueDebajo }               from './utilidades/colisiones.js';
import { dibujaMapa }                         from './utilidades/dibujaMapa.js';
import { Jugador }                            from './entidades/Jugador.js';
import { Enemigo }                            from './entidades/Enemigo.js';
import { ProyectilRecto, ProyectilMortero }   from './entidades/Proyectil.js';
import {
    dibujarGameOver,
    dibujarNivelCompletado,
    dibujarMoneda,
    dibujarFlash,
    actualizarHUD,
} from './pantallas/pantallas.js';
import {
    MAPA as MAPA_N1,
    ENEMIGOS_CONFIG as ENEMIGOS_N1,
    INICIO_JUGADOR as INICIO_N1,
    PUERTA as PUERTA_N1,
    BOTON as BOTON_N1,
    QUESOS_PEQUENOS as QUESOS_P_N1,
    QUESOS_DORADOS as QUESOS_D_N1,
    ESCUDOS as ESCUDOS_N1,
} from './niveles/Nivel1.js';
import { QuesoPequeno, QuesoDorado, Escudo } from './entidades/Objeto.js';
// ── Motor ─────────────────────────────────────────────────────
// BucleJuego gestiona el requestAnimationFrame.
// Entrada gestiona el teclado — exporta `teclas` y `onTeclaPulsada`.
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
let estadoJuego = 'jugando'; // jugando | nivelCompletado | moneda | gameOver
let nivelActual = 1;
let vidas       = 3;
let puntos      = 0;

// Estado de la moneda (segunda oportunidad)
let estadoMoneda    = 'esperando'; // esperando | girando | resultado
let eleccionJugador = null;
let resultadoMoneda = null;
let frameMoneda     = 0;
let caraMostrada    = 'cara';
let monedaUsada     = false;

// ─────────────────────────────────────────────────────────────
// CARGA DEL NIVEL
// Función reutilizable — al crear el Nivel 2 solo hay que
// importar sus datos y pasarlos aquí.
// ─────────────────────────────────────────────────────────────
let mapa;
let jugador;
let enemigos;
let proyectiles;
let proyMortero;
let objetos;       // QuesoPequeno[], QuesoDorado[], etc.
let puertaDesbloqueada;
let puerta;
let boton;

function cargarNivel(mapaData, enemigosConfig, inicioJugador, puertaData, botonData, quesosPData, quesosDData, escudosData) {
    mapa     = mapaData.map(fila => [...fila]);
    jugador  = new Jugador(inicioJugador.x, inicioJugador.y);
    enemigos = enemigosConfig.map(cfg => new Enemigo({ ...cfg, pi: 0 }));

    proyectiles = [];
    proyMortero = [];
    puertaDesbloqueada = false;
    puerta = puertaData;
    boton  = botonData;
    monedaUsada = false;

    objetos = [
        ...quesosPData.map(q => new QuesoPequeno(q.x, q.y)),
        ...quesosDData.map(q => new QuesoDorado(q.x, q.y, q.duracion)),
        ...escudosData.map(e => new Escudo(e.x, e.y)),
    ];
}

// Arrancamos con el nivel 1
cargarNivel(MAPA_N1, ENEMIGOS_N1, INICIO_N1, PUERTA_N1, BOTON_N1, QUESOS_P_N1, QUESOS_D_N1, ESCUDOS_N1);

// ─────────────────────────────────────────────────────────────
// ENTRADA DE TECLADO
// `teclas` viene de Entrada.js — solo registramos las acciones
// puntuales (las que ocurren una sola vez al pulsar, no movimiento continuo)
// ─────────────────────────────────────────────────────────────
onTeclaPulsada(function(e) {

    // Reiniciar desde gameOver
    if ((e.key === 'r' || e.key === 'R') && estadoJuego === 'gameOver') {
        vidas  = 3;
        puntos = 0;
        nivelActual = 1;
        cargarNivel(MAPA_N1, ENEMIGOS_N1, INICIO_N1, PUERTA_N1, BOTON_N1, QUESOS_P_N1, QUESOS_D_N1, ESCUDOS_N1);
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
            jugador.x  = INICIO_N1.x;
            jugador.y  = INICIO_N1.y;
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

    // Pasar al siguiente nivel
    if (e.key === 'Enter' && estadoJuego === 'nivelCompletado') {
        nivelActual++;
        // Para añadir Nivel 2: if (nivelActual === 2) cargarNivel(MAPA_N2, ...)
        cargarNivel(MAPA_N1, ENEMIGOS_N1, INICIO_N1, PUERTA_N1, BOTON_N1, QUESOS_P_N1, QUESOS_D_N1, ESCUDOS_N1);
        estadoJuego = 'jugando';
        actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    }

    // Cambiar personaje con Tab
    if (e.key === 'Tab') {
        e.preventDefault();
        jugador.cambiarPersonaje();
        actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    }
});

// ─────────────────────────────────────────────────────────────
// LÓGICA DE DAÑO
// Centralizada aquí para no repetirla en cada colisión
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
// BUCLE PRINCIPAL — usa BucleJuego del motor/
// ─────────────────────────────────────────────────────────────
// BucleJuego llama a esta función cada frame pasando deltaTime.
// deltaTime está disponible para usarlo cuando queramos movimientos
// independientes del framerate (velocidad * deltaTime * 60).
function frame(deltaTime) {

    // ── Pantallas de pausa ────────────────────────────────────────────────────
    if (estadoJuego === 'nivelCompletado') {
        dibujarNivelCompletado(ctx, ANCHO, ALTO);
        return;
    }
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

    // ── Actualización ─────────────────────────────────────────────────────────
    const bloqueActual = jugador.actualizar(mapa, teclas);
    if (bloqueActual === BLOQUE.TRAMPA) aplicarDanio();

    enemigos.forEach(en => en.actualizar(jugador, mapa, proyectiles, proyMortero));

    // Objetos recogibles — actualizar y comprobar recogida
    objetos.forEach(obj => {
        obj.actualizar();
        if (obj.comprobarRecogida(jugador)) {
            puntos += obj.puntosAlRecoger || 0;
            // Si es un escudo activamos la protección del jugador
            if (obj instanceof Escudo) jugador.activarEscudo(300);
            actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
        }
    });
    objetos = objetos.filter(obj => obj.activo);

    proyectiles.forEach(p => p.actualizar(mapa));
    proyectiles = proyectiles.filter(p => p.activo);

    proyMortero.forEach(p => p.actualizar());
    proyMortero = proyMortero.filter(p => p.activo);

    // ── Colisiones con daño ───────────────────────────────────────────────────
    if (!jugador.invencible) {
        for (const en of enemigos) {
            if (seToca(jugador.x, jugador.y, jugador.w, jugador.h, en.x, en.y, en.w, en.h)) {
                aplicarDanio(); break;
            }
        }
        for (const p of proyectiles) {
            if (p.tocaJugador(jugador)) { aplicarDanio(); break; }
        }
        for (const p of proyMortero) {
            if (p.tocaJugador(jugador)) { aplicarDanio(); break; }
        }
    }

    // ── Botón y puerta ────────────────────────────────────────────────────────
    const botonX = boton.col  * CELDA;
    const botonY = boton.fila * CELDA;
    if (!puertaDesbloqueada && seToca(jugador.x, jugador.y, jugador.w, jugador.h, botonX, botonY, CELDA, CELDA)) {
        puertaDesbloqueada = true;
        mapa[boton.fila][boton.col] = BLOQUE.SUELO;
    }
    const puertaX = puerta.col  * CELDA;
    const puertaY = puerta.fila * CELDA;
    if (puertaDesbloqueada && seToca(jugador.x, jugador.y, jugador.w, jugador.h, puertaX, puertaY, CELDA, CELDA)) {
        estadoJuego = 'nivelCompletado';
    }

    // ── Cámara — centrada en el jugador, limitada a los bordes del mundo ─────
    // Queremos que el jugador esté siempre en el centro de la pantalla.
    // camX = jugador.x - mitad del canvas → así el jugador queda centrado.
    // Math.max/min evitan que la cámara muestre zonas fuera del mundo.
    const mundoAncho = COLUMNAS_MUNDO * CELDA;
    const mundoAlto  = FILAS_MUNDO    * CELDA;
    const camX = Math.max(0, Math.min(jugador.x + jugador.w / 2 - ANCHO / 2, mundoAncho - ANCHO));
    const camY = Math.max(0, Math.min(jugador.y + jugador.h / 2 - ALTO  / 2, mundoAlto  - ALTO));

    // ── Dibujo ────────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, ANCHO, ALTO);
    dibujaMapa(ctx, mapa, camX, camY);
    objetos.forEach(obj => obj.dibujar(ctx, camX, camY));
    enemigos.forEach(en => en.dibujar(ctx, jugador, camX, camY));
    jugador.dibujar(ctx, camX, camY);
    proyectiles.forEach(p => p.dibujar(ctx, camX, camY));
    proyMortero.forEach(p => p.dibujar(ctx, camX, camY));
    jugador.flash = dibujarFlash(ctx, ANCHO, ALTO, jugador.flash);

    if (estadoJuego === 'nivelCompletado') dibujarNivelCompletado(ctx, ANCHO, ALTO);
}

// ─────────────────────────────────────────────────────────────
// ARRANQUE
// ─────────────────────────────────────────────────────────────
actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
const bucle = new BucleJuego(frame);
bucle.iniciar();