// ─────────────────────────────────────────────────────────────
// Nivel2.js — datos del nivel 2
// Para rellenar: copiar la estructura de Nivel1.js y cambiar
// el mapa, posición inicial, enemigos y objetos.
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';

// TODO: definir posición inicial del jugador
export const INICIO_JUGADOR = { x: 80, y: 80 };

// TODO: definir posición de la puerta (fila, col)
export const PUERTA = { fila: 0, col: 0 };

// TODO: definir posición de la llave (x, y en píxeles)
export const LLAVE = { x: 0, y: 0 };

// TODO: definir posiciones de quesos pequeños
export const QUESOS_PEQUENOS = [];

// TODO: definir posiciones de quesos dorados
export const QUESOS_DORADOS = [];

// TODO: definir posiciones de escudos
export const ESCUDOS = [];

// TODO: diseñar el mapa — 40 columnas × 30 filas
// 0=suelo 1=pared 2=puerta 3=botón 4=trampa 5=hielo 6=escondite 7=barro
export const MAPA = [];

// TODO: definir los enemigos del nivel
export const ENEMIGOS_CONFIG = [];