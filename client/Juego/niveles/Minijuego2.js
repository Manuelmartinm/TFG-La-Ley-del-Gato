// ─────────────────────────────────────────────────────────────
// Minijuego2.js — segundo minijuego
//
// CONCEPTO:
// TODO: definir el concepto del minijuego con el equipo.
//
// ESTRUCTURA SUGERIDA:
// - Exportar INICIO_JUGADOR, MAPA, ENEMIGOS_CONFIG igual que los niveles
// - Exportar las reglas especiales del minijuego (tiempo, condición de victoria...)
// - La lógica especial del minijuego va en main.js en un bloque
//   if (estadoJuego === 'minijuego2') { ... }
//
// CÓMO INTEGRARLO EN main.js:
// import { cargarMinijuego2 } from './minijuegos/Minijuego2.js';
// Cuando nivelActual === 'minijuego2' → cargarMinijuego2()
// ─────────────────────────────────────────────────────────────

import { TIPO_ENEMIGO } from '../utilidades/constantes.js';

// TODO: definir posición inicial del jugador
export const INICIO_JUGADOR = { x: 0, y: 0 };

// TODO: definir condición de victoria del minijuego
// export const CONDICION_VICTORIA = ...

// TODO: diseñar el mapa
export const MAPA = [];

// TODO: definir enemigos
export const ENEMIGOS_CONFIG = [];