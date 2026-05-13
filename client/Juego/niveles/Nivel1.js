// ─────────────────────────────────────────────────────────────
// Nivel1.js — TUTORIAL
//
// ESTRUCTURA VISUAL:
//
//  filas  0- 1  → techo
//  filas  2-11  → ZONA SUPERIOR: habitaciones con bloques y objetos
//                 Hay huecos en la pared del pasillo para entrar
//  fila  12     → pared divisoria superior (con huecos de acceso)
//  filas 13-16  → PASILLO CENTRAL — el jugador avanza de izq a der
//  fila  17     → pared divisoria inferior (con huecos de acceso)
//  filas 18-27  → ZONA INFERIOR: habitaciones con los 4 enemigos
//  filas 28-29  → suelo
//
//  El jugador empieza en el extremo izquierdo del pasillo.
//  La puerta está en el extremo derecho del pasillo.
//
//  PUNTUACIÓN MÍNIMA: 100 pts
//  Quesos pequeños: 10 × 10 = 100 pts — suficiente con todos los pequeños
//  Queso dorado:     1 × 50 = 50 pts  — bonus si lo coges a tiempo
//  Total posible:   150 pts
//
//  ZONA SUPERIOR (cols 1-38, de izq a der):
//   cols  1- 9  → habitación HIELO + BARRO
//   cols 10-18  → habitación TRAMPA + ESCONDITE
//   cols 19-27  → habitación OBJETOS (quesos, escudo, llave)
//   cols 28-38  → vacía / libre con más quesos
//
//  ZONA INFERIOR (cols 1-38, de izq a der):
//   cols  1- 9  → habitación PATRULLA
//   cols 10-18  → habitación CAZADOR
//   cols 19-27  → habitación CENTINELA
//   cols 28-38  → habitación MORTERO
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';

// Jugador empieza en el pasillo central, extremo izquierdo
export const INICIO_JUGADOR = { x: 2 * 40, y: 14 * 40 };

// Puerta al final del pasillo — al cumplir requisitos se abre y redirige al mapa
export const PUERTA = { fila: 14, col: 37 };

// ── Objetos ───────────────────────────────────────────────────
// Llave — en la habitación de objetos, requiere explorar la zona superior
export const LLAVE = { x: 26 * 40, y: 5 * 40 };

// 10 quesos pequeños × 10 pts = 100 pts — distribuidos por todo el nivel
// El jugador necesita recogerlos TODOS para llegar a 100 pts
export const QUESOS_PEQUENOS = [
    // Habitación hielo (cols 2-7)
    { x:  3 * 40, y:  3 * 40 },
    { x:  6 * 40, y:  6 * 40 },
    // Habitación trampa/escondite (cols 10-17) — en zonas seguras
    { x:  9 * 40, y:  3 * 40 },
    { x: 17 * 40, y:  9 * 40 },
    // Habitación objetos (cols 20-26)
    { x: 21 * 40, y:  4 * 40 },
    { x: 24 * 40, y:  8 * 40 },
    // Zona libre superior derecha (cols 29-37)
    { x: 30 * 40, y:  3 * 40 },
    { x: 34 * 40, y:  7 * 40 },
    // Pasillo central — recompensa explorar
    { x: 10 * 40, y: 14 * 40 },
    { x: 28 * 40, y: 14 * 40 },
];

// 1 queso dorado × 50 pts — bonus, aparece en zona de objetos
export const QUESOS_DORADOS = [{ x: 23 * 40, y: 5 * 40, duracion: 8000 }];

// Escudo — en la habitación de objetos
export const ESCUDOS = [{ x: 20 * 40, y: 5 * 40 }];

// ── Leyenda ───────────────────────────────────────────────────
// 0 suelo   1 pared   2 puerta
// 4 trampa  5 hielo   6 escondite  7 barro

export const MAPA = [
//   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 0
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 1

    // ── ZONA SUPERIOR ──────────────────────────────────────────
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 2
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 3
    [  1, 1, 5, 5, 5, 5, 5, 5, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 4 hielo+trampa
    [  1, 1, 5, 5, 5, 5, 5, 5, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 5 objetos aqui
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 6
    [  1, 1, 7, 7, 7, 7, 7, 7, 0, 0, 0, 6, 6, 6, 6, 6, 6, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 7 barro+escondite
    [  1, 1, 7, 7, 7, 7, 7, 7, 0, 0, 0, 6, 6, 6, 6, 6, 6, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 8
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 9
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 10
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 11

    // ── PARED DIVISORIA SUPERIOR con huecos de acceso ─────────
    [  1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1 ], // 12

    // ── PASILLO CENTRAL ───────────────────────────────────────
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 13
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1 ], // 14 puerta col 37
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 15
    [  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 16

    // ── PARED DIVISORIA INFERIOR con huecos de acceso ─────────
    [  1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1 ], // 17

    // ── ZONA INFERIOR — habitaciones de enemigos ──────────────
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 18
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 19
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 20
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 21
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 22
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 23
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 24
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 25
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 26
    [  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ], // 27

    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 28
    [  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 29
];

// Un enemigo de cada tipo — cada uno en su habitación inferior
export const ENEMIGOS_CONFIG = [
    // PATRULLA — habitación 1 (cols 1-9)
    {
        x: 4 * 40, y: 22 * 40,
        tipo: TIPO_ENEMIGO.PATRULLA,
        patrol: [
            { x: 2 * 40, y: 20 * 40 },
            { x: 7 * 40, y: 20 * 40 },
            { x: 7 * 40, y: 26 * 40 },
            { x: 2 * 40, y: 26 * 40 },
        ],
    },
    // CAZADOR — habitación 2 (cols 10-18)
    {
        x: 14 * 40, y: 22 * 40,
        tipo: TIPO_ENEMIGO.CAZADOR,
        origenX: 14 * 40, origenY: 22 * 40,
    },
    // CENTINELA — habitación 3 (cols 19-27)
    {
        x: 23 * 40, y: 22 * 40,
        tipo: TIPO_ENEMIGO.CENTINELA,
    },
    // MORTERO — habitación 4 (cols 28-38)
    {
        x: 33 * 40, y: 22 * 40,
        tipo: TIPO_ENEMIGO.MORTERO,
    },
];