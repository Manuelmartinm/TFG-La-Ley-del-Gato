
import { CELDA, COLUMNAS, FILAS, BLOQUE } from './constantes.js';

// Comprueba si dos rectángulos se solapan (AABB — Axis Aligned Bounding Box)
// ax,ay = posición del rect A   aw,ah = tamaño del rect A
// bx,by = posición del rect B   bw,bh = tamaño del rect B
export function seToca(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
        ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by
    );
}

// Comprueba si una celda del mapa es sólida (bloquea el paso)
export function esSolido(mapa, tx, ty) {
    if (tx < 0 || ty < 0 || tx >= COLUMNAS || ty >= FILAS) return true;
    return mapa[ty][tx] === BLOQUE.PARED;
}

// Comprueba si un rectángulo (x,y,w,h) choca con alguna pared del mapa.
// Mira las 4 esquinas del rectángulo — si alguna está en una celda sólida, hay colisión.
export function hayColision(mapa, x, y, w, h) {
    const esquinas = [
        [x,     y    ],
        [x+w-1, y    ],
        [x,     y+h-1],
        [x+w-1, y+h-1],
    ];
    for (const [cx, cy] of esquinas) {
        const tx = Math.floor(cx / CELDA);
        const ty = Math.floor(cy / CELDA);
        if (esSolido(mapa, tx, ty)) return true;
    }
    return false;
}

// Devuelve el tipo de bloque que hay debajo
export function bloqueDebajo(mapa, x, y, w, h) {
    const tx = Math.floor((x + w / 2) / CELDA);
    const ty = Math.floor((y + h / 2) / CELDA);
    if (ty < 0 || ty >= FILAS || tx < 0 || tx >= COLUMNAS) return BLOQUE.SUELO;
    return mapa[ty][tx];
}
