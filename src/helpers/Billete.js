class Billete {
  constructor(canvas, ctx) {

    this.canvas = canvas;
    this.ctx = ctx;
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * -this.canvas.height;  // Comienzan fuera de la pantalla
    this.width = 60;
    this.height = 30;
    this.speed = Math.random() * 3 + 2;  // Velocidad de caída
    this.angle = Math.random() * 360;    // Ángulo de rotación aleatorio
    this.rotationSpeed = Math.random() * 2 - 1;  // Velocidad de rotación
    this.image = new Image();
    this.image.src = '../../imagenes/100.jpg';  // Imagen de billete
  }

  // Actualizar la posición y rotación del billete
  update() {
    this.y += this.speed;
    this.angle += this.rotationSpeed;

    // Si el billete sale de la pantalla, reubicarlo arriba
    if (this.y > this.canvas.height) {
      this.y = -this.height;
      this.x = Math.random() * this.canvas.width;
    }
  }

  // Dibujar el billete en el canvas
  draw() {
    this.ctx.save();
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    this.ctx.rotate((this.angle * Math.PI) / 180);
    this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    this.ctx.restore();
  }
}

export default Billete;