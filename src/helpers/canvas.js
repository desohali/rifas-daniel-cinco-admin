

export function imagenLoaded(imageBase64) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { resolve(img) }
    img.onerror = err => { throw err }
    img.src = imageBase64
  });
}
export function loadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.onload = async function () {
        resolve({ image, file });
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}



export function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function blobToFile(blob, fileName) {
  return new File([blob], fileName, { type: blob.type });
}

/* // Ejemplo de uso
const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...";
const mimeType = "image/jpeg";
const blob = base64ToBlob(base64Image, mimeType);

// Convertir Blob a File
const file = blobToFile(blob, 'imagen-redimensionada.jpg');

console.log(file); */
