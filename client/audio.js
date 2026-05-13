/* =========================================================
   LA LEY DEL GATO — Sistema Central de Audio
   ========================================================= */

const AudioCore = {
    // Aquí pondremos las rutas a los audios que generemos
    tracks: {
        login: new Audio('../assets/audio/bg_login.mp3'),
        principal: new Audio('../assets/audio/bg_principal.mp3'),
        juego: new Audio('../assets/audio/bg_juego.mp3')
    },
    sfx: {
        click: new Audio('../assets/audio/sfx_click.mp3'),
        error: new Audio('../assets/audio/sfx_error.mp3'),
        equip: new Audio('../assets/audio/sfx_equip.mp3'),
        meow: new Audio('../assets/audio/sfx_meow.mp3') // El toque mafioso felino
    },
    
    // Música que está sonando actualmente
    currentTrack: null,

    // Cargar volúmenes desde localStorage
    obtenerAjustes: function() {
        return JSON.parse(localStorage.getItem('ajustes_gato') || '{"musica":true,"efectos":true,"volMusica":70,"volEfectos":85}');
    },

    // Iniciar una música de fondo (se repite en bucle)
    playMusic: function(trackName) {
        const ajustes = this.obtenerAjustes();
        
        // Si hay una pista sonando diferente a la nueva, la paramos
        if (this.currentTrack && this.currentTrack !== this.tracks[trackName]) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }

        if (!ajustes.musica) return; // Si la música está apagada en ajustes, no hace nada

        this.currentTrack = this.tracks[trackName];
        if (this.currentTrack) {
            this.currentTrack.loop = true;
            this.currentTrack.volume = ajustes.volMusica / 100; // Convertir 0-100 a 0.0-1.0
            
            // Los navegadores bloquean el autoplay hasta que el usuario hace clic en algún sitio
            this.currentTrack.play().catch(e => console.log("Esperando interacción del usuario para reproducir audio..."));
        }
    },

    // Reproducir un efecto de sonido
    playSFX: function(sfxName) {
        const ajustes = this.obtenerAjustes();
        if (!ajustes.efectos) return;

        const sonido = this.sfx[sfxName];
        if (sonido) {
            // Clonamos el sonido para que se puedan superponer si haces clics rápidos
            const sonidoClonado = sonido.cloneNode();
            sonidoClonado.volume = ajustes.volEfectos / 100;
            sonidoClonado.play().catch(()=> {});
        }
    },

    // Actualizar volúmenes en tiempo real (se usa desde ajustes.js)
    actualizarVolumenes: function() {
        const ajustes = this.obtenerAjustes();
        if (this.currentTrack) {
            this.currentTrack.volume = ajustes.volMusica / 100;
            if (!ajustes.musica) this.currentTrack.pause();
            else this.currentTrack.play().catch(()=>{});
        }
    }
};

// Intentar reproducir música al primer clic en cualquier parte de la pantalla (truco anti-bloqueo del navegador)
document.body.addEventListener('click', () => {
    if (AudioCore.currentTrack && AudioCore.currentTrack.paused) {
        const ajustes = AudioCore.obtenerAjustes();
        if(ajustes.musica) AudioCore.currentTrack.play().catch(()=>{});
    }
}, { once: true });