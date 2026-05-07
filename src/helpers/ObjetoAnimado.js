// Clase base para cualquier objeto animado
class ObjetoAnimado {
  constructor(canvas, ctx) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * -this.canvas.height;
      this.speedY = Math.random() * 3 + 2;
      this.speedX = Math.random() * 2 - 1;
  }

  update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y > this.canvas.height) {
          this.y = -this.height;
          this.x = Math.random() * this.canvas.width;
      }
  }

  draw() {}
}

export default ObjetoAnimado;
