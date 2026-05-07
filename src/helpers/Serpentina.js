// Clase Serpentina para crear cada serpentina
class Serpentina {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.x = Math.random() * this.canvas.width; // Posición horizontal aleatoria
        this.y = Math.random() * -this.canvas.height; // Comienza fuera del canvas
        this.width = Math.random() * 8 + 8; // Ancho de la serpentina
        this.height = Math.random() * 20 + 10; // Largo de la serpentina
        this.speedY = Math.random() * 3 + 2; // Velocidad vertical
        this.speedX = Math.random() * 2 - 1; // Velocidad horizontal
        this.rotation = Math.random() * 360; // Rotación inicial
        this.rotationSpeed = Math.random() * 4 - 2; // Velocidad de rotación
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Color aleatorio
    }

    // Actualizar la posición de la serpentina
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Si la serpentina sale de la pantalla, volver a posicionarla en la parte superior
        if (this.y > this.canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * this.canvas.width;
        }
    }

    // Dibujar la serpentina en el canvas
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();
    }
}

export default Serpentina;