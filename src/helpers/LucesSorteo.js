class LucesSorteo {
  constructor(canvas, ctx, x, y) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.centerX = x;
    this.centerY = y;

    this.angle = Math.random() * Math.PI * 2;
    this.orbitRadius = 50 + Math.random() * 250;
    this.orbitSpeed = (Math.random() * 0.01) + 0.002;

    this.radius = 2 + Math.random() * 6;
    this.pulseSpeed = 0.02 + Math.random() * 0.03;

    this.alpha = 0.5 + Math.random() * 0.5;

    this.colorPhase = Math.random() * Math.PI * 2;

    this.shapeType = Math.floor(Math.random() * 3); 
    // 0 = círculo | 1 = destello | 2 = rombo
  }

  update() {
    this.angle += this.orbitSpeed;
    this.colorPhase += 0.02;

    // pulso
    this.radius += Math.sin(this.colorPhase) * this.pulseSpeed;
    if (this.radius < 1) this.radius = 1;

    // órbita viva
    this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
    this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;

    // cambio de forma aleatorio
    if (Math.random() < 0.002) {
      this.shapeType = Math.floor(Math.random() * 3);
    }
  }

  getColor() {
    const r = Math.floor(200 + 55 * Math.sin(this.colorPhase));
    const g = Math.floor(180 + 75 * Math.sin(this.colorPhase + 2));
    const b = Math.floor(100 + 55 * Math.sin(this.colorPhase + 4));
    return `rgba(${r},${g},${b},${this.alpha})`;
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = this.getColor();

    if (this.shapeType === 0) {
      // círculo glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.shapeType === 1) {
      // destello cruz
      ctx.beginPath();
      ctx.rect(this.x - this.radius * 3, this.y - 1, this.radius * 6, 2);
      ctx.rect(this.x - 1, this.y - this.radius * 3, 2, this.radius * 6);
      ctx.fill();
    }

    if (this.shapeType === 2) {
      // rombo
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.radius * 2);
      ctx.lineTo(this.x + this.radius * 2, this.y);
      ctx.lineTo(this.x, this.y + this.radius * 2);
      ctx.lineTo(this.x - this.radius * 2, this.y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  isDead() {
    return false; // 🔥 NUNCA MUERE
  }
}

export default LucesSorteo;
