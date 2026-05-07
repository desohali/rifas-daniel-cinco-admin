import ObjetoAnimado from './ObjetoAnimado.js';

class Moneda extends ObjetoAnimado {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.size = Math.random() * 20 + 10;
        this.color = 'gold';
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 5 - 2.5;
    }

    update() {
        super.update();
        this.rotation += this.rotationSpeed;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
}

export default Moneda;
