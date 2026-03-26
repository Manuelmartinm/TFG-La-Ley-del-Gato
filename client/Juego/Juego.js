const canvas = document.getElementById('canvasJuego');

//ctx es con lo que dibujamos el juego y con getContext le decimos al navegador que el juego es 2d
const ctx = canvas.getContext('2d');

//Dimensiones
const w = 640;
const h = 480;

//Celda del mapa de px
const celda = 40;

//Filas y columnas
const columnas = w/celda;
const filas = h/celda;

//Creamos mapa, dependiendo del numero entederemos si es suelo pared o puerta de salida
const mapa = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],    
  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

//Dibujamos mapa
for (let i = 0; i < filas; i++) {
    for (let z = 0; z < columnas; z++) {
        const x = z * celda;
        const y = i * celda;
        if (mapa[i][z] == 1) {
            // Pared
            ctx.fillStyle = '#0e0b04';
            ctx.fillRect(x, y, celda, celda);
            ctx.strokeStyle = '#2e2006';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, celda, celda);
        } else if (mapa[i][z] == 2) {
            // Puerta
            ctx.fillStyle = '#4a3510';
            ctx.fillRect(x, y, celda, celda);
            ctx.strokeStyle = '#c8a030';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, celda - 4, celda - 4);
            ctx.fillStyle = '#c8a030';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('►', x + celda/2, y + celda/2 + 6);
            ctx.textAlign = 'left';
        } else {
            // Suelo — cuadrícula sutil
            ctx.fillStyle = (i + z) % 2 === 0 ? '#0a0800' : '#080601';
            ctx.fillRect(x, y, celda, celda);
        }
    }
}

//Creamos jugador
const jugador = {
    x: 80,      // posición horizontal en píxeles
    y: 80,      // posición vertical en píxeles
    w: 26,      // ancho del personaje
    h: 26,      // alto del personaje
    speed: 3    // píxeles que se mueve por frame
};
let vidas = 3;
let nivel = 1;
let estadoJuego = "jugando";// jugando o nivelCompletado o gameOver
let invencible = false; //Esto lo hacemos para que pierda 1 vida por cada toque
let timerInvencible = 0;

//Comprobamos si el enemigo toca al jugador (AABB como hacemos con la colision)
function seToca(ax, ay, aw, ah, bx, by, bw, bh) {
    //Comprobamos si los dos rectangulos se solapan en X e Y
    if (ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by) {
        return true;
    }
    return false;
}
//Comprobamos si ha llegado a la puerta
function comprobarPuerta() {
    const puertaX = 14 * celda;
    const puertaY = 10 * celda;
    if (seToca(jugador.x, jugador.y, jugador.w, jugador.h,puertaX, puertaY, celda, celda)) {
        return true;
    }
    return false;   
}

//Dibujamos pantalla de nivel completado
function dibujarNivelCompletado() {
    // Fondo oscuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // Caja dorada central
    ctx.fillStyle = '#0e0b04';
    ctx.fillRect(160, 160, 320, 160);

    // Borde dorado
    ctx.strokeStyle = '#c8a030';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 160, 320, 160);

    // Esquinas decorativas como en la web
    ctx.fillStyle = '#c8a030';
    ctx.font = '10px monospace';
    ctx.fillText('◆', 158, 158);
    ctx.fillText('◆', 470, 158);
    ctx.fillText('◆', 158, 326);
    ctx.fillText('◆', 470, 326);

    // Texto principal
    ctx.fillStyle = '#e8c040';
    ctx.font = 'bold 13px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('MISION COMPLETADA', w/2, 220);

    // Línea separadora
    ctx.strokeStyle = '#4a3510';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 240);
    ctx.lineTo(460, 240);
    ctx.stroke();

    // Texto secundario
    ctx.fillStyle = '#8a6820';
    ctx.font = '18px VT323';
    ctx.fillText('PULSA ENTER PARA CONTINUAR', w/2, 275);

    ctx.textAlign = 'left';
}
//Dibujamos pantalla de game over
function dibujarGameOver() {
    // Fondo oscuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // Caja central
    ctx.fillStyle = '#0e0b04';
    ctx.fillRect(160, 160, 320, 160);

    // Borde rojo oscuro
    ctx.strokeStyle = '#8c3030';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 160, 320, 160);

    // Esquinas decorativas
    ctx.fillStyle = '#8c3030';
    ctx.font = '10px monospace';
    ctx.fillText('◆', 158, 158);
    ctx.fillText('◆', 470, 158);
    ctx.fillText('◆', 158, 326);
    ctx.fillText('◆', 470, 326);

    // Texto principal
    ctx.fillStyle = '#8c3030';
    ctx.font = 'bold 13px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('AGENTE ELIMINADO', w/2, 220);

    // Línea separadora
    ctx.strokeStyle = '#4a3510';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 240);
    ctx.lineTo(460, 240);
    ctx.stroke();

    // Texto secundario
    ctx.fillStyle = '#8a6820';
    ctx.font = '18px VT323';
    ctx.fillText('PULSA R PARA REINICIAR', w/2, 275);

    ctx.textAlign = 'left';
}
//Creamos enemigo
const enemigos = [
    {
        x: 240,       // posición horizontal en píxeles
        y: 120,       // posición vertical en píxeles
        w: 26,        // ancho
        h: 26,        // alto
        speed: 1.2,   // más lento que el jugador
        color: '#8c3030',  // rojo oscuro
        // patrol = creamos puntos donde queremos que patrulle
        // Waypoints que recorren toda la sala en círculo
        patrol: [
            //DAmos muchos puntos diferentas para evitar que se choque mucho
            {x: 80,  y: 80},   
            {x: 320, y: 80},   
            {x: 480, y: 80},   
            {x: 480, y: 360},  
            {x: 320, y: 360},  
            {x: 80,  y: 360},  
            {x: 80,  y: 80},
        ],
        pi: 0,        // índice del punto actual de patrulla (0 o 1)
        tipo: 'patrulla',  // ← este patrulla
    },
    {
        x: 480,
        y: 280,
        w: 26,
        h: 26,
        speed: 1.8,
        color: '#4a3510',  // marrón dorado oscuro
        patrol: [],        // ← no patrulla
        pi: 0,
        tipo: 'cazador',   // ← este persigue al jugador
        rango: 120,        // ← distancia en píxeles a la que detecta al jugador
        origenX: 400,      // ← posición original para volver si pierde al jugador
        origenY: 280,
    }
]

//Actualizamos posicion del enemigo
function actualizarEnemigo(en) {
    //Para combrobar donde se choca el malito
    console.log('pos:', Math.floor(en.x/celda), Math.floor(en.y/celda));
    if (en.tipo === "patrulla") {
        //Sacamos punto destino actual de la patrulla
        const destino = en.patrol[en.pi];

        //Calculamos la distancia al destino
        const dx = destino.x - en.x;
        const dy = destino.y - en.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);//Teorema de pitagoras

        // Si esta muy cerca del destino cambiamos al siguiente punto
        if (distancia < 3) {
            en.pi = (en.pi + 1) % en.patrol.length;
        } else {
            // Normalizamos la dirección
            const nx = dx / distancia;
            const ny = dy / distancia;

            // Calculamos nueva posición
            const nuevaX = en.x + nx * en.speed;
            const nuevaY = en.y + ny * en.speed;

            // Solo movemos si no hay colisión
            if (!hayColision(nuevaX, en.y, en.w, en.h)) en.x = nuevaX;
            if (!hayColision(en.x, nuevaY, en.w, en.h)) en.y = nuevaY;
        }
    }else if (en.tipo === 'cazador') {
        // — Comportamiento cazador —
        // Calculamos distancia al jugador
        const dx = (jugador.x + 13) - (en.x + 13);
        const dy = (jugador.y + 13) - (en.y + 13);
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < en.rango) {
            // Jugador dentro del rango — perseguir
            const nx = dx / distancia;
            const ny = dy / distancia;
            const nuevaX = en.x + nx * en.speed;
            const nuevaY = en.y + ny * en.speed;
            if (!hayColision(nuevaX, en.y, en.w, en.h)) en.x = nuevaX;
            if (!hayColision(en.x, nuevaY, en.w, en.h)) en.y = nuevaY;
        } else {
            // Jugador fuera del rango — volver al origen
            const dox = en.origenX - en.x;
            const doy = en.origenY - en.y;
            const distOrigen = Math.sqrt(dox * dox + doy * doy);

            if (distOrigen > 3) {
                const nx = dox / distOrigen;
                const ny = doy / distOrigen;
                const nuevaX = en.x + nx * en.speed;
                const nuevaY = en.y + ny * en.speed;
                if (!hayColision(nuevaX, en.y, en.w, en.h)) en.x = nuevaX;
                if (!hayColision(en.x, nuevaY, en.w, en.h)) en.y = nuevaY;
            }
        }
    }

}
//Teclas aqui guardamos el vindeo de que hace cada tecla
const teclas = {}

document.addEventListener('keydown', function (e) {
    teclas[e.key] = true;//Cuando pulsas una tecla se pone true
    // Si estamos en game over y pulsan R reiniciamos
    if (e.key === 'r' || e.key === 'R') {
        if (estadoJuego === 'gameOver') {
            vidas = 1;
            nivel = 1;
            jugador.x = 80;
            jugador.y = 80;
            document.getElementById('hud-lives-val').textContent = vidas;
            document.getElementById('hud-level-val').textContent = nivel;
            estadoJuego = 'jugando';
        }
    }
})
document.addEventListener('keyup', function(e) {
    teclas[e.key] = false; // cuando la sueltas se pone false
    // Si estamos en nivel completado y pulsan ENTER pasamos al siguiente nivel
    if (e.key === 'Enter' && estadoJuego === 'nivelCompletado') {
        nivel++;
        document.getElementById('hud-level-val').textContent = nivel;
        jugador.x = 80;
        jugador.y = 80;
        estadoJuego = 'jugando';
    }
});

//creamos colision
function esSolido(tx,ty) {
    //Si sale fuera del mapa lo tratamos como si fuera pared
    if (tx < 0 || ty < 0 || tx >=columnas || ty >=filas) {
        return true;
    }
    return mapa[ty][tx] === 1;
}

//Comprovamos si un rectangulo choca con alguna pared
function hayColision(x,y,w,h) {
    const esquinas = [
        [x, y],
        [x+w-1, y],
        [x, y+h-1],
        [x+w-1, y+h-1]
    ]
    
    //Cada vuelta roma valores de una esquina
    for (const esquina of esquinas) {
        const cx = esquina[0];
        const cy = esquina[1];

        //Comprobamos si existe colision mirando las esquinas del personaje
        const tx = Math.floor(cx / celda);
        const ty = Math.floor(cy / celda);
        if (esSolido(tx, ty)) {
            return true;
        }
    }
    return false
}

//Vamos a crear loop para que el mapa se vaya actualizando 60 veces por segundo
function loop() {
    //Comprobamos que no hemos ganado ya
    if (estadoJuego === 'nivelCompletado') {
        dibujarNivelCompletado();
        requestAnimationFrame(loop);
        return;
    }
    //Comprobamos que no hemos peridido
    if (estadoJuego === 'gameOver') {
        dibujarGameOver();
        requestAnimationFrame(loop);
        return;
    }
    //calculamos a donde se mueve el jugador
    let movex = 0;
    let movey = 0;
    if (teclas['ArrowLeft']  || teclas['a']) movex = -1;
    if (teclas['ArrowRight'] || teclas['d']) movex =  1;
    if (teclas['ArrowUp']    || teclas['w']) movey = -1;
    if (teclas['ArrowDown']  || teclas['s']) movey =  1;

    //Creamos diagonales
    if (movex !== 0 && movey !== 0) {
        movex *= 0.707;
        movey *= 0.707;
    }

    //Calculamos nueva posicion
    const nuevaX = jugador.x + movex * jugador.speed;
    const nuevaY = jugador.y + movey * jugador.speed;

    //Solo movemos si no hay colision y separamos pa que pueda deslizarse por las esquinas
    if (!hayColision(nuevaX, jugador.y, jugador.w, jugador.h)) jugador.x = nuevaX;
    if (!hayColision(jugador.x, nuevaY, jugador.w, jugador.h)) jugador.y = nuevaY;

    //Actualizamos a los enemigos
    enemigos.forEach(function(enemigo) {
    actualizarEnemigo(enemigo);
    });

    //borra todo antes de dibujar
    ctx.clearRect(0,0,w,h);

    //ahora redibujamos el mapa
    for (let i = 0; i < filas; i++) {
        for (let z = 0; z < columnas; z++) {
            const x = z * celda;
            const y = i * celda;

            if (mapa[i][z] === 1) {
                // Pared
                ctx.fillStyle = '#0e0b04';
                ctx.fillRect(x, y, celda, celda);
                ctx.strokeStyle = '#2e2006';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, celda, celda);
            } else if (mapa[i][z] === 2) {
                // Puerta
                ctx.fillStyle = '#4a3510';
                ctx.fillRect(x, y, celda, celda);
                ctx.strokeStyle = '#c8a030';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, celda - 4, celda - 4);
                ctx.fillStyle = '#c8a030';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('►', x + celda/2, y + celda/2 + 6);
                ctx.textAlign = 'left';
            } else {
                // Suelo
                ctx.fillStyle = (i + z) % 2 === 0 ? '#0a0800' : '#080601';
                ctx.fillRect(x, y, celda, celda);
            }
        }
    }
    //Dibujamos jugador 
    ctx.fillStyle = '#e8c040';
    ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);
    //Dibujamos enemigo
    enemigos.forEach(function(en) {
        ctx.fillStyle = en.color;
        ctx.fillRect(en.x, en.y, en.w, en.h);
        // Borde oscuro para que destaquen
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(en.x, en.y, en.w, en.h);
    });

    //Comprobamos si algun enemigo toca al jugador
    if (!invencible) {
        enemigos.forEach(function (en) {
            if (seToca(jugador.x, jugador.y, jugador.w, jugador.h,en.x,en.y,en.w,en.h)) {
                vidas--;
                //Actualizamos las vidas en el hud
                document.getElementById('hud-lives-val').textContent = vidas;

                invencible = true;
                timerInvencible = 120 // lo mide por segundos ahora mismo 2 segundos

                // Si no quedan vidas pasamos a game over
                if (vidas <= 0) {
                    estadoJuego = 'gameOver';
                }
            }
        })
    }
    //Hacemos funcionar timer bajandolo cada frame
    if (invencible) {
        timerInvencible--;
        if (timerInvencible <= 0) {
            invencible = false;
        }
    }

    //Comprobamos si el jugador ha ganado
    if (comprobarPuerta()) {
        estadoJuego = 'nivelCompletado';
    }
    //Pantalla de nivel completado
    if (estadoJuego === 'nivelCompletado') {
        dibujarNivelCompletado();
    }




    //ahora llamamos siguiente loop
    requestAnimationFrame(loop);
}
//arrancamos juego
loop();