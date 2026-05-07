// Clase EmojiConfetti para crear animaciones de emojis cayendo
class EmojiConfetti {
    // Array de emojis de tristeza/pérdida para usar por defecto
    static sadEmojis = [
        '😭', '😢', '😥', '😰', '😓', '🥺', '😔', '😞',
        '😟', '😕', '☹️', '😣', '😖', '😫', '😩', '💀',
        '💔', '💀', '👎', '😿', '🙁', '⛈️', '🌧️', '🤦‍♂️',
        '🤦‍♀️', '😪', '🤕', '🤒', '🤧', '💔', '💀', '💀'
    ];

    constructor(canvas, ctx, emojis = null) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Si no se proporcionan emojis, seleccionar 3 aleatorios del array de tristeza
        if (emojis === null) {
            this.emojis = this.getRandomSadEmojis(3);
        } else {
            this.emojis = Array.isArray(emojis) ? emojis : emojis.split('');
        }

        // Seleccionar un emoji aleatorio de la lista
        this.emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];

        this.x = Math.random() * this.canvas.width; // Posición horizontal aleatoria
        this.y = Math.random() * -this.canvas.height; // Comienza fuera del canvas
        this.size = Math.random() * 20 + 20; // Tamaño del emoji
        this.speedY = Math.random() * 3 + 2; // Velocidad vertical
        this.speedX = Math.random() * 2 - 1; // Velocidad horizontal
        this.rotation = Math.random() * 360; // Rotación inicial
        this.rotationSpeed = Math.random() * 4 - 2; // Velocidad de rotación
        this.opacity = Math.random() * 0.5 + 0.5; // Opacidad aleatoria
    }

    // Actualizar la posición del emoji
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Si el emoji sale de la pantalla, volver a posicionarlo en la parte superior
        if (this.y > this.canvas.height) {
            this.y = -this.size;
            this.x = Math.random() * this.canvas.width;
            // Cambiar a un emoji aleatorio diferente cuando vuelve a aparecer
            this.emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        }
    }

    // Obtener n emojis aleatorios del array de tristeza
    getRandomSadEmojis(count) {
        const shuffled = [...EmojiConfetti.sadEmojis].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Dibujar el emoji en el canvas
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = this.opacity;
        this.ctx.font = `${this.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.emoji, 0, 0);
        this.ctx.restore();
    }
}

export default EmojiConfetti;
