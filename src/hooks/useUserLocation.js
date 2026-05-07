import { useState, useEffect } from "react";

function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Función para solicitar la ubicación
  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setError(null);
        },
        (err) => {
          setError("El usuario aun no acepta la geolocalizacion"/* err.message */);
        }
      );
    } else {
      setError("La geolocalización no está soportada en este navegador.");
    }
  };

  // Verifica el estado del permiso y solicita la ubicación si está permitido
  const checkPermissionAndRequestLocation = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      setPermissionStatus(permission.state);

      if (permission.state === "granted") {
        requestLocation();
      } else if (permission.state === "prompt") {
        requestLocation();
      } else if (permission.state === "denied") {
        setError("Permiso de geolocalización denegado. Actívalo en la configuración del navegador.");
      }

      // Escuchar cambios en el permiso
      permission.onchange = () => {
        setPermissionStatus(permission.state);
        if (permission.state === "granted") {
          requestLocation();
        }
      };
    } catch (err) {
      setError("Error al verificar los permisos de geolocalización.");
    }
  };

  useEffect(() => {
    checkPermissionAndRequestLocation();
  }, []);

  return { location, error, requestLocation, permissionStatus };
}

export default useUserLocation;
