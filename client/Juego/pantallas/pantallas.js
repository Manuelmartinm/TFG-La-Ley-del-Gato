
//dibuja la caja centrada con borde y esquinas
function _dibujaCaja(ctx, w, h, cajaW, cajaH, colorBorde) {
    const cajaX = w / 2 - cajaW / 2;
    const cajaY = h / 2 - cajaH / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0e0b04';
    ctx.fillRect(cajaX, cajaY, cajaW, cajaH);

    ctx.strokeStyle = colorBorde;
    ctx.lineWidth = 2;
    ctx.strokeRect(cajaX, cajaY, cajaW, cajaH);

    ctx.fillStyle = colorBorde;
    ctx.font = '10px monospace';
    ctx.fillText('◆', cajaX - 2,         cajaY - 2);
    ctx.fillText('◆', cajaX + cajaW - 8,  cajaY - 2);
    ctx.fillText('◆', cajaX - 2,         cajaY + cajaH + 8);
    ctx.fillText('◆', cajaX + cajaW - 8,  cajaY + cajaH + 8);

    return { cajaX, cajaY };
}

// Pantalla GAME OVER
export function dibujarGameOver(ctx, w, h) {
    const { cajaX, cajaY } = _dibujaCaja(ctx, w, h, 320, 160, '#8c3030');

    ctx.fillStyle = '#8c3030';
    ctx.font = 'bold 13px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('AGENTE ELIMINADO', w / 2, cajaY + 60);

    ctx.strokeStyle = '#4a3510';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cajaX + 20, cajaY + 80);
    ctx.lineTo(cajaX + 300, cajaY + 80);
    ctx.stroke();

    ctx.fillStyle = '#8a6820';
    ctx.font = '18px VT323';
    ctx.fillText('PULSA R PARA REINICIAR', w / 2, cajaY + 115);

    ctx.textAlign = 'left';
}

// NIVEL COMPLETADO
export function dibujarNivelCompletado(ctx, w, h) {
    const { cajaX, cajaY } = _dibujaCaja(ctx, w, h, 320, 160, '#c8a030');

    ctx.fillStyle = '#e8c040';
    ctx.font = 'bold 13px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('MISION COMPLETADA', w / 2, cajaY + 60);

    ctx.strokeStyle = '#4a3510';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cajaX + 20, cajaY + 80);
    ctx.lineTo(cajaX + 300, cajaY + 80);
    ctx.stroke();

    ctx.fillStyle = '#8a6820';
    ctx.font = '18px VT323';
    ctx.fillText('PULSA ENTER PARA CONTINUAR', w / 2, cajaY + 115);

    ctx.textAlign = 'left';
}

// Pantalla MONEDA
export function dibujarMoneda(ctx, w, h, estadoMoneda, eleccion, resultado, caraMostrada) {
    const cajaW = 400;
    const cajaH = 280;
    const cajaX = w / 2 - cajaW / 2;
    const cajaY = h / 2 - cajaH / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0e0b04';
    ctx.fillRect(cajaX, cajaY, cajaW, cajaH);
    ctx.strokeStyle = '#c8a030';
    ctx.lineWidth = 2;
    ctx.strokeRect(cajaX, cajaY, cajaW, cajaH);

    ctx.fillStyle = '#c8a030';
    ctx.font = '10px monospace';
    ctx.fillText('◆', cajaX - 2,          cajaY - 2);
    ctx.fillText('◆', cajaX + cajaW - 8,   cajaY - 2);
    ctx.fillText('◆', cajaX - 2,          cajaY + cajaH + 8);
    ctx.fillText('◆', cajaX + cajaW - 8,   cajaY + cajaH + 8);

    ctx.textAlign = 'center';

    if (estadoMoneda === 'esperando') {
        ctx.fillStyle = '#e8c040';
        ctx.font = 'bold 11px "Press Start 2P"';
        ctx.fillText('ULTIMA OPORTUNIDAD', w / 2, cajaY + 40);

        ctx.fillStyle = '#8a6820';
        ctx.font = '20px VT323';
        ctx.fillText('Elige cara o cruz', w / 2, cajaY + 80);
        ctx.fillText('Si aciertas, revives', w / 2, cajaY + 105);

        // Botón CARA
        ctx.fillStyle = '#1a1200';
        ctx.fillRect(cajaX + 30, cajaY + 130, 140, 60);
        ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 2;
        ctx.strokeRect(cajaX + 30, cajaY + 130, 140, 60);
        ctx.fillStyle = '#e8c040'; ctx.font = '28px VT323';
        ctx.fillText('⊙  CARA', cajaX + 100, cajaY + 166);
        ctx.fillStyle = '#4a3510'; ctx.font = '14px VT323';
        ctx.fillText('[C]', cajaX + 100, cajaY + 184);

        // Botón CRUZ
        ctx.fillStyle = '#1a1200';
        ctx.fillRect(cajaX + 230, cajaY + 130, 140, 60);
        ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 2;
        ctx.strokeRect(cajaX + 230, cajaY + 130, 140, 60);
        ctx.fillStyle = '#e8c040'; ctx.font = '28px VT323';
        ctx.fillText('✕  CRUZ', cajaX + 300, cajaY + 166);
        ctx.fillStyle = '#4a3510'; ctx.font = '14px VT323';
        ctx.fillText('[X]', cajaX + 300, cajaY + 184);

    } else if (estadoMoneda === 'girando') {
        ctx.fillStyle = '#8a6820'; ctx.font = '18px VT323';
        ctx.fillText('Elegiste: ' + eleccion.toUpperCase(), w / 2, cajaY + 45);
        ctx.font = '80px monospace'; ctx.fillStyle = '#e8c040';
        ctx.fillText(caraMostrada === 'cara' ? '⊙' : '✕', w / 2, cajaY + 168);
        ctx.fillStyle = '#4a3510'; ctx.font = '18px VT323';
        ctx.fillText('lanzando...', w / 2, cajaY + 225);

    } else if (estadoMoneda === 'resultado') {
        const gano = eleccion === resultado;
        ctx.fillStyle = gano ? '#40c040' : '#c04040';
        ctx.font = 'bold 11px "Press Start 2P"';
        ctx.fillText(gano ? '!ACERTASTE!' : 'FALLASTE...', w / 2, cajaY + 45);
        ctx.font = '80px monospace'; ctx.fillStyle = '#e8c040';
        ctx.fillText(resultado === 'cara' ? '⊙' : '✕', w / 2, cajaY + 165);
        ctx.fillStyle = '#8a6820'; ctx.font = '22px VT323';
        ctx.fillText('Salio: ' + resultado.toUpperCase(), w / 2, cajaY + 215);
        ctx.fillStyle = '#4a3510'; ctx.font = '18px VT323';
        ctx.fillText(gano ? 'ENTER para continuar' : 'ENTER para game over', w / 2, cajaY + 248);
    }

    ctx.textAlign = 'left';
}

// Flash de daño
export function dibujarFlash(ctx, w, h, flash) {
    if (flash > 0) {
        ctx.fillStyle = `rgba(180,0,0,${flash / 10 * 0.4})`;
        ctx.fillRect(0, 0, w, h);
        return flash - 1;
    }
    return 0;
}

//HUD
export function actualizarHUD(nombrePersonaje, vidas, puntos, nivel) {
    document.getElementById('hud-char-name').textContent  = nombrePersonaje;
    document.getElementById('hud-lives-val').textContent  = vidas;
    document.getElementById('hud-score-val').textContent  = puntos;
    document.getElementById('hud-level-val').textContent  = nivel;
}
