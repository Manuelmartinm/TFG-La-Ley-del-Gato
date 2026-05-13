// ─────────────────────────────────────────────────────────────
// SpeedRun.js — minijuego de speed run con veneno
//
// CONCEPTO:
// Mapa pequeño con zonas de veneno (bloque nuevo tipo 8).
// El jugador tiene un tiempo límite para llegar a la salida.
// Las zonas de veneno dañan continuamente al jugador.
// El antídoto (objeto recogible) anula el veneno temporalmente.
// Si se acaba el tiempo o las vidas → game over del minijuego.
//
// CÓMO INTEGRARLO EN main.js:
// import { cargarSpeedRun } from './minijuegos/SpeedRun.js';
// Cuando nivelActual === 'speedrun' → cargarSpeedRun()
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';

// Tiempo límite en frames (60 frames = 1 segundo)
// TODO: ajustar según dificultad deseada
export const TIEMPO_LIMITE = 60 * 60; // 60 segundos

// TODO: definir posición inicial del jugador
export const INICIO_JUGADOR = { x: 0, y: 0 };

// TODO: definir posición de la salida (fila, col)
export const SALIDA = { fila: 0, col: 0 };

// TODO: definir posiciones de los antídotos
// El antídoto anula el veneno durante X frames al recogerlo
export const ANTIDOTOS = [
    // { x: 0, y: 0, duracion: 300 }
];

// TODO: diseñar el mapa del speed run
// Debe ser más pequeño que los niveles normales — tensión por el tiempo
// Bloque 8 = VENENO (a implementar en constantes.js y dibujaMapa.js)
// 0=suelo 1=pared 2=salida 4=trampa 8=veneno
export const MAPA = [];

// TODO: definir enemigos si los hay
// En un speed run puro pueden no haber enemigos — solo el tiempo y el veneno
export const ENEMIGOS_CONFIG = [];