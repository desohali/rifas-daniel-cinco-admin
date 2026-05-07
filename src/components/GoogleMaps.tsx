"use client";
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    initMap: () => void;
    google: any; // Añade esta línea
  }
}




const GoogleMaps = ({ data: boletosVendidos = [] }: any) => {
  const mapContainerRef = useRef<any>(null);
  const [map, setMap] = useState(null);
  /* const [locations, setLocations] = useState([
    { lat: -25.1276784, lng: -57.3547781, descripcion: "Centro de Perú" }
  ]); */
  const [infoWindows, setInfoWindows] = useState<any[]>([]); // Para almacenar las instancias de InfoWindow
  const [markers, setMarkers] = useState<any[]>([]); // Para almacenar las instancias de los marcadores

  useEffect(() => {
    // Cargar el script de Google Maps cuando el componente se monta
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk&callback=initMap`;
      script.async = true;
      document.body.appendChild(script);
    };

    // Inicializar el mapa
    const initMap = () => {
      const mapInstance: any = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: -23.442503, lng: -58.443832 },
        zoom: 8,
      });
      setMap(mapInstance);

      // Crear los marcadores e InfoWindows
      const newMarkers: any[] = [];
      const newInfoWindows: any[] = [];

      boletosVendidos.forEach((boletoVendido: any) => {
        const [lat, lng] = boletoVendido?.ubicacion;
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
        });

        const infoWindow: any = new window.google.maps.InfoWindow({
          content: `<div style="padding-top: 0rem;background: ${boletoVendido?.premio ? 'teal' : 'white'}">
          
          <p>Vendedor: ${boletoVendido?._idUsuarioVendedor?.usuario || "Desconocido"}</p>
          <p>Premio: ${boletoVendido?.premio}</p>
          </div>`,
          headerContent: `Boleto: ${boletoVendido?.premioMayor || ""}-${boletoVendido?.premioMenor || ""}`,
        });

        // Abrir todos los InfoWindows al inicio
        infoWindow.open(mapInstance, marker);

        // Guardar las instancias de los marcadores y los InfoWindows
        newMarkers.push(marker);
        newInfoWindows.push(infoWindow);

        // Cuando el marcador sea clickeado, abre su InfoWindow sin cerrar los demás
        marker.addListener('click', () => {
          if (!infoWindow.getMap()) {
            // Si el InfoWindow está cerrado, lo abrimos
            infoWindow.open(mapInstance, marker);
          }
        });
      });

      setMarkers(newMarkers);
      setInfoWindows(newInfoWindows);
    };

    window["initMap"] = initMap; // Asignar la función de inicialización al objeto global window

    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initMap(); // Si ya está cargado, inicializa el mapa
    }
  }, [boletosVendidos]); // Este useEffect se ejecutará cuando locations cambien

  // Función para agregar un nuevo marcador
  /* const addMarker = () => {
    const newMarker = {
      lat: -25.300, // Coordenadas del nuevo marcador
      lng: -57.600, // Cambia estos valores según lo necesites
      descripcion: "Nueva ubicación",
    };
    setLocations([...locations, newMarker]);
  }; */

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100vh' }}
      />
    </div>
  );
};

export default GoogleMaps;

