import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Aquí cargarás todos los sprites del juego
        // this.load.image('raton', 'assets/sprites/ratones/raton.png');
        // this.load.image('gato', 'assets/sprites/gatos/gato.png');
        // this.load.image('queso', 'assets/sprites/items/queso.png');
        // this.load.image('muro', 'assets/sprites/escenario/muro.png');
    }

    create() {
        // Fondo del nivel
        this.add.rectangle(512, 384, 1024, 768, 0x87CEEB);

        // Título del nivel
        this.levelText = this.add.text(512, 30, 'Nivel 1 - Tutorial', {
            fontSize: '28px',
            fill: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // UI - Vidas
        this.vidasText = this.add.text(20, 20, '❤️ Vidas: 3', {
            fontSize: '24px',
            fill: '#000'
        });

        // UI - Objetivo
        this.add.text(20, 60, '🧀 Objetivo: ¡Consigue el queso!', {
            fontSize: '20px',
            fill: '#000'
        });

        // Crear muros temporales (más adelante usarás Tiled)
        this.createWalls();

        // Crear al RATÓN (jugador) - Por ahora un cuadrado blanco
        this.player = this.add.rectangle(100, 100, 32, 32, 0xFFFFFF);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Crear GATO enemigo - Por ahora un cuadrado rojo
        this.gato = this.add.rectangle(500, 400, 32, 32, 0xFF0000);
        this.physics.add.existing(this.gato);

        // Crear QUESO (objetivo) - Por ahora un cuadrado amarillo
        this.queso = this.add.rectangle(900, 650, 24, 24, 0xFFFF00);
        this.physics.add.existing(this.queso);

        // Colisiones
        this.physics.add.overlap(this.player, this.queso, this.recogerQueso, null, this);
        this.physics.add.overlap(this.player, this.gato, this.colisionGato, null, this);
        this.physics.add.collider(this.player, this.walls);

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Tecla ESC para volver al menú
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });

        // Variables del juego
        this.vidas = 3;
        this.gatoSpeed = 100;
        this.playerSpeed = 200;
        this.invulnerable = false;
    }

    createWalls() {
        // Crear grupo de muros
        this.walls = this.physics.add.staticGroup();

        // Muros del perímetro
        // Arriba
        for (let i = 0; i < 32; i++) {
            this.walls.create(i * 32 + 16, 16, null).setDisplaySize(32, 32).refreshBody();
            const wall = this.add.rectangle(i * 32 + 16, 16, 32, 32, 0x8B4513);
        }
        // Abajo
        for (let i = 0; i < 32; i++) {
            this.walls.create(i * 32 + 16, 752, null).setDisplaySize(32, 32).refreshBody();
            this.add.rectangle(i * 32 + 16, 752, 32, 32, 0x8B4513);
        }
        // Izquierda
        for (let i = 1; i < 23; i++) {
            this.walls.create(16, i * 32 + 16, null).setDisplaySize(32, 32).refreshBody();
            this.add.rectangle(16, i * 32 + 16, 32, 32, 0x8B4513);
        }
        // Derecha
        for (let i = 1; i < 23; i++) {
            this.walls.create(1008, i * 32 + 16, null).setDisplaySize(32, 32).refreshBody();
            this.add.rectangle(1008, i * 32 + 16, 32, 32, 0x8B4513);
        }

        // Algunos obstáculos internos
        for (let i = 0; i < 5; i++) {
            this.walls.create(300, 200 + i * 32, null).setDisplaySize(32, 32).refreshBody();
            this.add.rectangle(300, 200 + i * 32, 32, 32, 0x8B4513);
        }

        for (let i = 0; i < 8; i++) {
            this.walls.create(600 + i * 32, 400, null).setDisplaySize(32, 32).refreshBody();
            this.add.rectangle(600 + i * 32, 400, 32, 32, 0x8B4513);
        }
    }

    update() {
        // Movimiento del jugador
        this.handlePlayerMovement();

        // IA básica del gato (persigue al ratón)
        this.handleGatoAI();
    }

    handlePlayerMovement() {
        const speed = this.playerSpeed;

        // Resetear velocidad
        this.player.body.setVelocity(0);

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        // Movimiento vertical
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        // Normalizar velocidad diagonal
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.body.velocity.normalize().scale(speed);
        }
    }

    handleGatoAI() {
        // IA muy básica: el gato persigue al ratón en línea recta
        const angle = Phaser.Math.Angle.Between(
            this.gato.x, this.gato.y,
            this.player.x, this.player.y
        );

        this.physics.velocityFromRotation(angle, this.gatoSpeed, this.gato.body.velocity);
    }

    recogerQueso() {
        // Victoria!
        this.queso.destroy();
        
        const winText = this.add.text(512, 384, '¡GANASTE!\n🧀', {
            fontSize: '64px',
            fill: '#00ff00',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Detener el juego
        this.physics.pause();

        // Volver al menú después de 3 segundos
        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }

    colisionGato() {
        if (this.invulnerable) return;

        // Perder una vida
        this.vidas--;
        this.vidasText.setText(`❤️ Vidas: ${this.vidas}`);

        if (this.vidas <= 0) {
            this.gameOver();
        } else {
            // Invulnerabilidad temporal
            this.invulnerable = true;
            this.player.setAlpha(0.5);

            // Flash effect
            this.tweens.add({
                targets: this.player,
                alpha: { from: 0.5, to: 1 },
                duration: 200,
                repeat: 5,
                onComplete: () => {
                    this.invulnerable = false;
                    this.player.setAlpha(1);
                }
            });

            // Reposicionar al ratón
            this.player.setPosition(100, 100);
        }
    }

    gameOver() {
        const gameOverText = this.add.text(512, 384, 'GAME OVER\n💀', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        this.physics.pause();

        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }
}