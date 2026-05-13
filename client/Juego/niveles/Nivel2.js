// ─────────────────────────────────────────────────────────────
// Nivel2.js — NIVEL 2
//
// ESTRUCTURA VISUAL (forma de L):
//
//  El mundo es 40 cols × 30 filas (1600×1200px)
//
//  La "L" se forma así:
//    - RAMA HORIZONTAL: filas 1-13, cols 1-38 (parte superior)
//    - RAMA VERTICAL:   filas 1-28, cols 27-38 (parte derecha bajando)
//    - Todo lo demás es pared
//
//  Jugador → esquina superior izquierda (col 2, fila 2)
//  Puerta  → esquina inferior derecha   (col 37, fila 27) — máxima distancia
//
//  PUNTUACIÓN MÍNIMA: 100 pts
//  10 quesos pequeños × 10pts = 100pts exactos
//  1 queso dorado × 50pts = bonus
//
//  Contenido:
//    - 10 quesos pequeños distribuidos por toda la L
//    - 1 queso dorado en la rama vertical
//    - Hielo: zona central de la rama horizontal
//    - Barro: zona baja de la rama vertical
//    - Llave: mitad-baja de la rama vertical (lejos del jugador)
//    - 2 escudos
//    - 1 patrullero en la rama horizontal
//    - 1 cazador en la rama vertical
//    - 1 rápido en la rama horizontal (zona derecha)
//
//  Sprites: mismos que el tutorial — cada personaje con su sprite
//  Al pisar la puerta con llave + 100pts → redirige a mapa
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';

// Jugador — esquina superior izquierda de la L
export const INICIO_JUGADOR = { x: 2 * 40, y: 2 * 40 };

// Puerta — esquina inferior derecha, máxima distancia del jugador
export const PUERTA = { fila: 27, col: 37 };

// Llave — mitad de la rama vertical, requiere bajar bastante
export const LLAVE = { x: 33 * 40, y: 19 * 40 };

// ── 10 quesos pequeños × 10pts = 100pts ──────────────────────
// Distribuidos para obligar a explorar toda la L
export const QUESOS_PEQUENOS = [
    { x:  3 * 40, y:  3 * 40 },  // inicio rama horizontal
    { x:  7 * 40, y:  8 * 40 },
    { x: 11 * 40, y:  3 * 40 },
    { x: 15 * 40, y:  8 * 40 },  // zona hielo
    { x: 19 * 40, y:  3 * 40 },  // zona hielo
    { x: 23 * 40, y:  8 * 40 },
    { x: 28 * 40, y:  3 * 40 },  // inicio rama vertical
    { x: 35 * 40, y:  8 * 40 },  // rama vertical alta
    { x: 30 * 40, y: 16 * 40 },  // rama vertical media
    { x: 36 * 40, y: 24 * 40 },  // rama vertical baja (cerca de la puerta)
];

// Queso dorado — bonus, aparece en la rama vertical media
export const QUESOS_DORADOS = [{ x: 34 * 40, y: 22 * 40, duracion: 8000 }];

// Escudos — uno al inicio, otro en la rama vertical
export const ESCUDOS = [
    { x:  5 * 40, y:  5 * 40 },
    { x: 31 * 40, y: 23 * 40 },
];

// ── Leyenda ───────────────────────────────────────────────────
// 0 suelo   1 pared   2 puerta
// 4 trampa  5 hielo   6 escondite  7 barro

export const MAPA = [
//   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 0

    // ── RAMA HORIZONTAL (filas 1-13, cols 1-38) ───────────────
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 1
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 2
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 3
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 4 hielo
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 5 hielo
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 6 hielo
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 7
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 8
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 9
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 10
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 11
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 12
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 13

    // ── TRANSICIÓN: la L dobla aquí — cols 1-26 se cierran ───
    // filas 14-28: solo cols 27-38 son suelo (rama vertical)
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 14
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 15
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 16
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 17
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 18
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 19
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0, 1 ], // 20 barro
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0, 1 ], // 21 barro
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0, 1 ], // 22 barro
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 23
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 24
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 25
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 26
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1 ], // 27 puerta col 37
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 28
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 29
];

export const ENEMIGOS_CONFIG = [
    // PATRULLA — recorre la rama horizontal izquierda
    {
        x:  5 * 40, y:  6 * 40,
        tipo: TIPO_ENEMIGO.PATRULLA,
        patrol: [
            { x:  2 * 40, y:  2 * 40 },
            { x: 10 * 40, y:  2 * 40 },
            { x: 10 * 40, y: 11 * 40 },
            { x:  2 * 40, y: 11 * 40 },
        ],
    },
    // RAPIDO — zona derecha de la rama horizontal, más agresivo
    {
        x: 24 * 40, y:  5 * 40,
        tipo: TIPO_ENEMIGO.RAPIDO,
        origenX: 24 * 40, origenY: 5 * 40,
    },
    // CAZADOR — en la rama vertical, persigue si el jugador baja
    {
        x: 33 * 40, y: 25 * 40,
        tipo: TIPO_ENEMIGO.CAZADOR,
        origenX: 33 * 40, origenY: 25 * 40,
    },
];
