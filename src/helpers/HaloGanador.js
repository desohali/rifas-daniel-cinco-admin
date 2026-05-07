class HaloGanador {
  constructor(canvas, ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = 80;
    this.phase = 0;
  }

  update() {
    this.phase += 0.05;
  }

  draw() {
    const r = this.radius + Math.sin(this.phase) * 15;

    const g = this.ctx.createRadialGradient(
      this.x, this.y, r * 0.2,
      this.x, this.y, r
    );

    g.addColorStop(0, "rgba(255,215,0,0.9)");
    g.addColorStop(1, "rgba(255,215,0,0)");

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}

export default HaloGanador;
