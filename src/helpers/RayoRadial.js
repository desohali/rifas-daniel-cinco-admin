class RayoRadial {
  constructor(canvas, ctx, cx, cy) {
    this.ctx = ctx;
    this.cx = cx;
    this.cy = cy;
    this.angle = Math.random() * Math.PI * 2;
    this.length = 100 + Math.random() * 300;
    this.alpha = Math.random() * 0.6 + 0.2;
    this.speed = Math.random() * 0.02 + 0.01;
  }

  update() {
    this.angle += this.speed;
    this.alpha -= 0.005;
    if (this.alpha <= 0) this.alpha = Math.random() * 0.6 + 0.2;
  }

  draw() {
    const x = this.cx + Math.cos(this.angle) * this.length;
    const y = this.cy + Math.sin(this.angle) * this.length;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.strokeStyle = `rgba(255,255,200,${this.alpha})`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.cx, this.cy);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.restore();
  }
}

export default RayoRadial;