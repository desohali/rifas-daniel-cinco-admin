// Función para establecer una cookie
export function setCookie(name, value, hours) {
  const now = new Date();
  now.setTime(now.getTime() + hours * 60 * 60 * 1000); // Convertir horas a milisegundos
  const expires = "expires=" + now.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

// Función para obtener una cookie
export function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null; // Si no se encuentra la cookie o ya expiró
}