
export const ANCHO   = 960;
export const ALTO    = 640;
export const CELDA   = 40;
export const COLUMNAS = ANCHO / CELDA;   // 24
export const FILAS    = ALTO  / CELDA;   // 16

// Tipos de bloque del mapa
// En lugar de escribir mapa[y][x] === 4, escribimos mapa[y][x] === BLOQUE.TRAMPA
export const BLOQUE = {
    SUELO:     0,
    PARED:     1,
    PUERTA:    2,
    BOTON:     3,
    TRAMPA:    4,
    HIELO:     5,
    ESCONDITE: 6,
    BARRO:     7,
};

// Tipos de enemigo
export const TIPO_ENEMIGO = {
    PATRULLA:  'patrulla',
    CAZADOR:   'cazador',
    RAPIDO:    'rapido',
    CENTINELA: 'centinela',
    MORTERO:   'mortero',
};
