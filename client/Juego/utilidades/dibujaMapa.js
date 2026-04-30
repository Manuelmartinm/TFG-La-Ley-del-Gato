
import { CELDA, FILAS, COLUMNAS, BLOQUE } from './constantes.js';

export function dibujaMapa(ctx, mapa) {
    for (let fila = 0; fila < FILAS; fila++) {
        for (let col = 0; col < COLUMNAS; col++) {
            const x = col * CELDA;
            const y = fila * CELDA;
            const tipo = mapa[fila][col];

            if (tipo === BLOQUE.PARED) {
                ctx.fillStyle = '#0e0b04';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.strokeStyle = '#2e2006';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELDA, CELDA);

            } else if (tipo === BLOQUE.PUERTA) {
                ctx.fillStyle = '#4a3510';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.strokeStyle = '#c8a030';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, CELDA - 4, CELDA - 4);
                ctx.fillStyle = '#c8a030';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('►', x + CELDA / 2, y + CELDA / 2 + 6);
                ctx.textAlign = 'left';

            } else if (tipo === BLOQUE.BOTON) {
                ctx.fillStyle = '#3d0f0f';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.strokeStyle = '#8c3030';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, CELDA - 4, CELDA - 4);
                ctx.fillStyle = '#8c3030';
                ctx.font = '18px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('!', x + CELDA / 2, y + CELDA / 2 + 6);
                ctx.textAlign = 'left';

            } else if (tipo === BLOQUE.TRAMPA) {
                ctx.fillStyle = '#2a0808';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.fillStyle = '#cc2222';
                const anchoPincho = 7;
                const altoPincho  = 14;
                const posXPinchos = [x + 6, x + 20, x + 6,  x + 20];
                const posYPinchos = [y + 8, y + 8,  y + 24, y + 24];
                posXPinchos.forEach(function(px, idx) {
                    const py = posYPinchos[idx];
                    ctx.beginPath();
                    ctx.moveTo(px,                    py + altoPincho / 2);
                    ctx.lineTo(px + anchoPincho,      py + altoPincho / 2);
                    ctx.lineTo(px + anchoPincho / 2,  py - altoPincho / 2);
                    ctx.closePath();
                    ctx.fill();
                });
                ctx.strokeStyle = '#550000';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELDA, CELDA);

            } else if (tipo === BLOQUE.HIELO) {
                ctx.fillStyle = '#061828';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.strokeStyle = '#1a4a6a';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, CELDA, CELDA);
                ctx.strokeStyle = '#4aa8d8';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.4;
                ctx.beginPath(); ctx.moveTo(x + 4,  y + 4);  ctx.lineTo(x + 16, y + 16); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + 22, y + 8);  ctx.lineTo(x + 30, y + 16); ctx.stroke();
                ctx.globalAlpha = 1.0;

            } else if (tipo === BLOQUE.ESCONDITE) {
                ctx.fillStyle = '#1a2018';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = '#507040';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x + 2, y + 2, CELDA - 4, CELDA - 4);
                ctx.setLineDash([]);
                ctx.fillStyle = '#507040';
                ctx.font = '18px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('◉', x + CELDA / 2, y + CELDA / 2 + 6);
                ctx.textAlign = 'left';

            } else if (tipo === BLOQUE.BARRO) {
                ctx.fillStyle = '#2e1a08';
                ctx.fillRect(x, y, CELDA, CELDA);
                ctx.fillStyle = '#1a0e04';
                ctx.beginPath(); ctx.arc(x + 10, y + 12, 5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 26, y + 22, 7, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 14, y + 30, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 32, y + 10, 5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#180c02';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELDA, CELDA);

            } else {
                // SUELO normal — cuadrícula sutil en dos tonos alternos
                ctx.fillStyle = (fila + col) % 2 === 0 ? '#0a0800' : '#080601';
                ctx.fillRect(x, y, CELDA, CELDA);
            }
        }
    }
}
