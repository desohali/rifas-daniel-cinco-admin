import ObjetoAnimado from './ObjetoAnimado.js';

class Globo extends ObjetoAnimado {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.radius = Math.random() * 15 + 15;
        this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        this.speedY = Math.random() * 1.5 + 0.5;
    }

    update() {
        super.update();
        this.y -= this.speedY;
        if (this.y + this.radius < 0) {
            this.y = this.canvas.height + this.radius;
            this.x = Math.random() * this.canvas.width;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }
}

export default Globo;
