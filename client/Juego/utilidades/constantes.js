
//Tamaño pantalla jugador
export const ANCHO   = 960;
export const ALTO    = 640;

// Tamaño de cada CELDA del mapa
export const CELDA   = 40;

// Tamaño del MUNDO
export const COLUMNAS_MUNDO = 40;   // 1600px
export const FILAS_MUNDO    = 30;   // 1200px

// Estos siguen siendo útiles para colisiones — usan las dimensiones del mundo
export const COLUMNAS = COLUMNAS_MUNDO;
export const FILAS    = FILAS_MUNDO;

// Tipos de bloque del mapa
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