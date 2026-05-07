class BilleteExplocion {
  constructor(canvas, ctx, x, y) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.angle = Math.random() * 360;    // Ángulo de rotación aleatorio
    this.rotationSpeed = Math.random() * 2 - 1;  // Velocidad de rotación
    this.speedX = (Math.random() * 4 - 2) * 3 * 0.5;  // Velocidad en X en diferentes direcciones el 0.5 es por la mitad de velocidad
    this.speedY = (Math.random() * 4 - 2) * 3 * 0.5;  // Velocidad en Y en diferentes direcciones el 0.5 es por la mitad de velocidad
    this.gravity = 0.05; // Gravedad para que los billetes caigan después de la explosión
    this.image = new Image();
    this.image.src = 'https://static.vecteezy.com/system/resources/previews/019/857/850/original/coin-money-coin-and-gold-coin-free-png.png';  // Imagen de billete
    // this.image.src = 'https://en.numista.com/catalogue/photos/paraguay/5fd9720d498073.37976152-original.jpg';  // Imagen de billete
  }

  // Actualizar la posición y rotación del billete
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity; // Aplicar gravedad para que caigan hacia abajo
    this.angle += this.rotationSpeed;

    // Si el billete sale de la pantalla, reubicarlo fuera de la vista para eliminarlo
    if (this.y > this.canvas.height || this.x < -this.width || this.x > this.canvas.width + this.width) {
      this.x = -100; // Coloca el billete fuera de la pantalla para simular "desaparición"
      this.y = -100;
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

export default BilleteExplocion;