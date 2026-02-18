import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Aquí cargarás los assets del menú (logos, música, etc.)
        // this.load.image('logo', 'assets/sprites/logo.png');
    }

    create() {
        // Fondo degradado
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        graphics.fillRect(0, 0, 1024, 768);

        // Título del juego con sombra
        const titleShadow = this.add.text(512, 152, 'LA LEY DEL GATO', {
            fontSize: '72px',
            fill: '#000',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const title = this.add.text(512, 150, 'LA LEY DEL GATO', {
            fontSize: '72px',
            fill: '#fff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Subtítulo con emojis
        this.add.text(512, 240, '🐭 vs 🐱', {
            fontSize: '56px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Descripción
        this.add.text(512, 320, 'Ayuda a los ratones a escapar de la mafia de gatos', {
            fontSize: '20px',
            fill: '#ccc'
        }).setOrigin(0.5);

        // Botón de JUGAR
        const playButton = this.createButton(512, 420, 'JUGAR', () => {
            this.scene.start('GameScene');
        });

        // Botón de OPCIONES (placeholder)
        const optionsButton = this.createButton(512, 500, 'OPCIONES', () => {
            console.log('Opciones - Por implementar');
        });

        // Botón de CRÉDITOS (placeholder)
        const creditsButton = this.createButton(512, 580, 'CRÉDITOS', () => {
            this.showCredits();
        });

        // Instrucciones en la parte inferior
        this.add.text(512, 720, 'Usa WASD o Flechas para moverte | ESC para pausar', {
            fontSize: '16px',
            fill: '#888'
        }).setOrigin(0.5);

        // Versión del juego
        this.add.text(20, 740, 'v0.1.0 - Alpha', {
            fontSize: '14px',
            fill: '#666'
        });

        // Animación del título
        this.tweens.add({
            targets: title,
            y: 145,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive();

        // Hover effect
        button.on('pointerover', () => {
            button.setStyle({ 
                fill: '#ffcc00',
                backgroundColor: '#444'
            });
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setStyle({ 
                fill: '#fff',
                backgroundColor: '#333'
            });
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1.05);
            callback();
        });

        return button;
    }

    showCredits() {
        // Crear overlay de créditos
        const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);
        overlay.setInteractive();

        const creditsText = this.add.text(512, 300, 
            'LA LEY DEL GATO\n\n' +
            'Proyecto TFG - 2025\n\n' +
            'Desarrollado por:\n' +
            '[Nombre 1] - Programador Core\n' +
            '[Nombre 2] - IA y Enemies\n' +
            '[Nombre 3] - Level Design\n' +
            '[Nombre 4] - UI/UX\n\n' +
            'Click para cerrar',
            {
                fontSize: '24px',
                fill: '#fff',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            creditsText.destroy();
        });
    }
}