class EspiralLuz {
  constructor(canvas, ctx, cx, cy) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.cx = cx;
    this.cy = cy;

    this.angle = Math.random() * Math.PI * 2;
    this.radius = Math.random() * 300;
    this.speed = 0.03 + Math.random() * 0.05;
    this.growth = Math.random() * 0.8 + 0.4;

    this.size = Math.random() * 3 + 1;
    this.alpha = Math.random() * 0.8 + 0.2;
  }

  update() {
    this.angle += this.speed;
    this.radius -= this.growth;

    if (this.radius < 10) {
      this.radius = 300 + Math.random() * 200;
    }
  }

  draw() {
    const x = this.cx + Math.cos(this.angle) * this.radius;
    const y = this.cy + Math.sin(this.angle) * this.radius;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.fillStyle = `rgba(255,215,0,${this.alpha})`;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}

export default EspiralLuz;