// ─────────────────────────────────────────────────────────────
// Nivel1.js — datos del nivel 1
// Solo contiene datos: mapa, posición inicial y lista de enemigos.
// No tiene lógica — la lógica está en main.js y en las entidades.
// Para crear el Nivel 2: copiar este archivo y cambiar estos datos.
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';

// Posición inicial del jugador en píxeles
export const INICIO_JUGADOR = { x: 80, y: 80 };

// Posición de la puerta (fila 14, columna 22)
export const PUERTA = { fila: 14, col: 22 };

// Posición del botón que desbloquea la puerta (fila 5, columna 2)
export const BOTON = { fila: 5, col: 2 };

// Mapa del nivel — 16 filas × 24 columnas
// Cada número es un tipo de bloque (ver constantes.js > BLOQUE)
export const MAPA = [
// col:0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
  [  1,   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // fila 0
  [  1,   0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // fila 1
  [  1,   0, 6, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1 ], // fila 2
  [  1,   0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1 ], // fila 3
  [  1,   0, 0, 0, 1, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1 ], // fila 4
  [  1,   0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // fila 5  botón
  [  1,   0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1 ], // fila 6
  [  1,   0, 0, 7, 7, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 7, 7, 0, 0, 0, 0, 1 ], // fila 7  barro
  [  1,   0, 0, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 1 ], // fila 8  hielo
  [  1,   0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // fila 9
  [  1,   0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // fila 10
  [  1,   0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1 ], // fila 11 trampas
  [  1,   0, 7, 7, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 7, 7, 0, 0, 1 ], // fila 12 barro
  [  1,   0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1 ], // fila 13
  [  1,   0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1 ], // fila 14 puerta
  [  1,   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // fila 15
];

// Lista de configuraciones de enemigos del nivel
// Cada objeto se pasa directamente al constructor de Enemigo
export const ENEMIGOS_CONFIG = [
    {
        x: 160, y: 80,
        w: 26, h: 26,
        speed: 1.2,
        color: '#8c3030',
        tipo: TIPO_ENEMIGO.PATRULLA,
        patrol: [
            { x:  80, y:  80 },
            { x: 440, y:  80 },
            { x: 840, y:  80 },
            { x: 840, y: 520 },
            { x: 440, y: 520 },
            { x:  80, y: 520 },
        ],
    },
    {
        x: 720, y: 400,
        w: 26, h: 26,
        speed: 1.8,
        color: '#4a3510',
        tipo: TIPO_ENEMIGO.CAZADOR,
        rango: 180,
        origenX: 720,
        origenY: 400,
    },
    {
        x: 460, y: 300,
        w: 30, h: 30,
        speed: 0,
        color: '#206040',
        tipo: TIPO_ENEMIGO.CENTINELA,
        timerDisparo: 80,
        cadencia: 100,
    },
    {
        x: 120, y: 480,
        w: 30, h: 30,
        speed: 0,
        color: '#602080',
        tipo: TIPO_ENEMIGO.MORTERO,
        timerDisparo: 160,
        cadencia: 180,
    },
];
