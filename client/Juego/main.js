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
    LLAVE as LLAVE_N1,
    QUESOS_PEQUENOS as QUESOS_P_N1,
    QUESOS_DORADOS as QUESOS_D_N1,
    ESCUDOS as ESCUDOS_N1,
} from './niveles/Nivel1.js';
import { QuesoPequeno, QuesoDorado, Escudo, Llave } from './entidades/Objeto.js';
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
let objetos;
let puertaDesbloqueada;
let puerta;
let llaveCogida;     // true cuando el jugador ha recogido la llave

function cargarNivel(mapaData, enemigosConfig, inicioJugador, puertaData, llaveData, quesosPData, quesosDData, escudosData) {
    mapa     = mapaData.map(fila => [...fila]);
    jugador  = new Jugador(inicioJugador.x, inicioJugador.y);
    enemigos = enemigosConfig.map(cfg => new Enemigo({ ...cfg, pi: 0 }));

    proyectiles = [];
    proyMortero = [];
    puertaDesbloqueada = false;
    puerta     = puertaData;
    llaveCogida = false;
    monedaUsada = false;

    objetos = [
        new Llave(llaveData.x, llaveData.y),
        ...quesosPData.map(q => new QuesoPequeno(q.x, q.y)),
        ...quesosDData.map(q => new QuesoDorado(q.x, q.y, q.duracion)),
        ...escudosData.map(e => new Escudo(e.x, e.y)),
    ];
}

// Arrancamos con el nivel 1
cargarNivel(MAPA_N1, ENEMIGOS_N1, INICIO_N1, PUERTA_N1, LLAVE_N1, QUESOS_P_N1, QUESOS_D_N1, ESCUDOS_N1);

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
        cargarNivel(MAPA_N1, ENEMIGOS_N1, INICIO_N1, PUERTA_N1, LLAVE_N1, QUESOS_P_N1, QUESOS_D_N1, ESCUDOS_N1);
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
        cargarNivel(MAPA_N1, ENEMIGOS_N1, INICIO_N1, PUERTA_N1, LLAVE_N1, QUESOS_P_N1, QUESOS_D_N1, ESCUDOS_N1);
        estadoJuego = 'jugando';
        actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    }

    // Cambiar personaje con Tab
    if (e.key === 'Tab') {
        e.preventDefault();
        jugador.cambiarPersonaje();
        actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
    }

    // Usar habilidad con Espacio
    if (e.key === ' ' && estadoJuego === 'jugando') {
        // Ratón A — melee
        const rectMelee = jugador.usarMelee();
        if (rectMelee) {
            // La colisión del golpe se comprueba en el frame, no aquí
            // usarMelee() ya activó meleeActivo — main.js lo detectará
        }

        // Ratón B — disparo
        const datosDisparo = jugador.usarDisparo();
        if (datosDisparo) {
            proyectiles.push(new ProyectilRecto(
                datosDisparo.x, datosDisparo.y,
                datosDisparo.dx, datosDisparo.dy,
                datosDisparo.speed, true // esDelJugador = true
            ));
        }
        // Ratón C — el escudo bloqueador se gestiona en actualizar() con teclas[' ']
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

    // ── Colisiones con daño ───────────────────────────────────────────────────
    if (!jugador.invencible) {
        for (const en of enemigos) {
            if (seToca(jugador.x, jugador.y, jugador.w, jugador.h, en.x, en.y, en.w, en.h)) {
                aplicarDanio(); break;
            }
        }
        for (const p of proyectiles) {
            if (!p.esDelJugador) {
                // El escudo bloqueador del Ratón C destruye proyectiles enemigos
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

    // ── Habilidades del jugador contra enemigos ───────────────────────────────
    // Melee (Ratón A) — comprobamos si el rectángulo del golpe toca algún enemigo
    if (jugador.meleeActivo) {
        const r = jugador.getRectMelee();
        if (r) {
            for (const en of enemigos) {
                if (seToca(r.x, r.y, r.w, r.h, en.x, en.y, en.w, en.h)) {
                    en.stunear(120); // 2 segundos de stun
                }
            }
        }
    }

    // Disparo del jugador — comprobamos si algún proyectil del jugador toca enemigos
    for (const p of proyectiles) {
        if (p.esDelJugador) {
            for (const en of enemigos) {
                if (p.tocaEnemigo(en)) {
                    en.stunear(120);
                    break;
                }
            }
        }
    }

    // ── Puerta — se abre solo con llave Y 100 puntos ─────────────────────────
    const puertaX = puerta.col  * CELDA;
    const puertaY = puerta.fila * CELDA;
    const condicionPuerta = llaveCogida && puntos >= 100;

    // La puerta solo se puede cruzar si se cumplen ambas condiciones
    if (condicionPuerta && seToca(jugador.x, jugador.y, jugador.w, jugador.h, puertaX, puertaY, CELDA, CELDA)) {
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
    // ── Indicador de condiciones en pantalla ──────────────────────────────────
    // Muestra en la esquina inferior izquierda el progreso hacia abrir la puerta
    const iconoLlave  = llaveCogida ? '🗝️ ✓' : '🗝️ ✗';
    const iconoPuntos = puntos >= 100 ? '★ ✓' : `★ ${puntos}/100`;
    ctx.font = '14px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillStyle = llaveCogida ? '#40c040' : '#c04040';
    ctx.fillText(iconoLlave, 12, ALTO - 30);
    ctx.fillStyle = puntos >= 100 ? '#40c040' : '#e8c040';
    ctx.fillText(iconoPuntos, 12, ALTO - 10);

    jugador.flash = dibujarFlash(ctx, ANCHO, ALTO, jugador.flash);

    if (estadoJuego === 'nivelCompletado') dibujarNivelCompletado(ctx, ANCHO, ALTO);
}

// ─────────────────────────────────────────────────────────────
// ARRANQUE
// ─────────────────────────────────────────────────────────────
actualizarHUD(jugador.nombre, vidas, puntos, nivelActual);
const bucle = new BucleJuego(frame);
bucle.iniciar();