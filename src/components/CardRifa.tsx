"use client";
import React from 'react';
import { EyeOutlined, EditOutlined, CloudDownloadOutlined, DeleteOutlined, QrcodeOutlined, AimOutlined, SyncOutlined, GiftOutlined, CarryOutOutlined, DownloadOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Divider, Flex, message, Modal, Popconfirm, Radio, Row, Space, Spin, Switch, Tag, Tooltip, Typography } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { setImagenRifa, setIsRifa, setListaDeBoletos, setOpenFormBoleto, setOpenFormRifa, setRifaDetalles } from '@/features/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEliminarRifaMutation, useListarBoletosMutation } from '@/services/userApi';
import Swal from 'sweetalert2';
const { PDFDocument, rgb, pushGraphicsState, popGraphicsState } = require('pdf-lib');
const QRCode = require('qrcode');
const style: any = { width: "100%", textAlign: "center" };
import MONEDAS from '../../public/monedas.json'; // Ruta relativa al archivo JSON

const styleRadio: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const ordenarPorDos = (campo1: string, campo2: string) => (a: any, b: any) => {
  const a1 = a[campo1] ? 1 : 0;
  const b1 = b[campo1] ? 1 : 0;

  if (b1 !== a1) return b1 - a1;

  const a2 = a[campo2] ? 1 : 0;
  const b2 = b[campo2] ? 1 : 0;

  return b2 - a2;
};

function formatearNumero(valor: number | string): string {
  const num = Number(valor);

  if (isNaN(num)) return "0";

  if (num >= 1_000_000_000) {
    const v = num / 1_000_000_000;
    return `${parseFloat(v.toFixed(1))} BILLONES`;
  }

  if (num >= 1_000_000) {
    const v = num / 1_000_000;
    return `${parseFloat(v.toFixed(1))} MILLONES`;
  }

  if (num >= 1_000) {
    const v = num / 1_000;
    return `${parseFloat(v.toFixed(1))} MIL`;
  }

  return num.toString();
}

function obtenerDosDiferentes(array: string[]) {
  if (!array || array.length < 2) {
    throw new Error("El array debe tener al menos 2 elementos");
  }

  const index1 = Math.floor(Math.random() * array.length);

  let index2;
  do {
    index2 = Math.floor(Math.random() * array.length);
  } while (index1 === index2);

  return [array[index1], array[index2]];
}

function generarTablero(arrayPremios: any[], premioGanador: any = null) {

  const tablero = new Array(9).fill(null);

  const lineas = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  function randomPremio() {
    return arrayPremios[Math.floor(Math.random() * arrayPremios.length)]._id;
    // return arrayPremios[Math.floor(Math.random() * arrayPremios.length)].premio;
  }

  function formaLinea(tablero: any[], index: number) {

    for (const [a, b, c] of lineas) {

      if (![a, b, c].includes(index)) continue;

      const v1 = tablero[a];
      const v2 = tablero[b];
      const v3 = tablero[c];

      if (v1 && v1 === v2 && v2 === v3) return true;
    }

    return false;
  }

  let lineaGanadora = null;

  if (premioGanador) {

    lineaGanadora = lineas[Math.floor(Math.random() * lineas.length)];

    for (const pos of lineaGanadora) {
      tablero[pos] = premioGanador;
    }
  }

  for (let i = 0; i < 9; i++) {

    if (tablero[i]) continue;

    let intento;
    let valido = false;
    let intentos = 0;

    while (!valido && intentos < 20) {

      intento = randomPremio();
      tablero[i] = intento;

      if (!formaLinea(tablero, i)) {
        valido = true;
      }

      intentos++;
    }

    if (!valido) {
      tablero[i] = randomPremio();
    }
  }

  return tablero;
}


function generarTablero2(figuras: any[], premio: string) {
  const unicos = new Map();

  // eliminar duplicados por _id
  figuras.forEach(f => {
    if (!unicos.has(f._id)) {
      unicos.set(f._id, f);
    }
  });

  const figurasUnicas = Array.from(unicos.values());

  if (figurasUnicas.length < 5) {
    throw new Error("Se necesitan al menos 5 figuras únicas");
  }

  const grid = new Array(9).fill(null);
  const contador = new Map();

  let figuraPremio: any = null;

  if (premio) {
    figuraPremio = figurasUnicas.find(f => f._id === premio);
  }

  const lineas = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // 🎯 1. Línea ganadora
  if (figuraPremio) {
    const randomLinea = lineas[Math.floor(Math.random() * lineas.length)];

    randomLinea.forEach(pos => {
      grid[pos] = figuraPremio;
    });

    contador.set(figuraPremio._id, 3);
  }

  // 🎯 2. Rellenar
  for (let i = 0; i < 9; i++) {
    if (grid[i]) continue;

    let intentos = 0;

    while (intentos < 50) {
      const randomIndex = Math.floor(Math.random() * figurasUnicas.length);
      const fig = figurasUnicas[randomIndex];

      const usado = contador.get(fig._id) || 0;

      // 🚫 no más del premio
      if (figuraPremio && fig._id === figuraPremio._id) {
        intentos++;
        continue;
      }

      // 🚫 máximo 2
      if (usado >= 2) {
        intentos++;
        continue;
      }

      grid[i] = fig;
      contador.set(fig._id, usado + 1);
      break;
    }
  }

  return grid;
}
/**
 * Ordena los objetos del array colocando primero los que coinciden
 * con las terminaciones del número dado en alguno de los campos premio.
 * 
 * @param {Array<Object>} data - Array de objetos con campos de premios
 * @param {string} numero - Número de 2 a 4 cifras (ej: "22", "333", "901")
 * @returns {Array<Object>} Nuevo array ordenado
 */
function ordenarPorTerminacion(data: any[], numero: string | number) {
  const camposPremio = [
    "premioMayor",
    "premioMenor",
    "premioTres",
    "premioCuatro",
    "premioCinco"
  ];

  return [...data].sort((a, b) => {
    const aCoincide = camposPremio.some(
      campo => a[campo] && a[campo].endsWith(numero?.toString())
    );
    const bCoincide = camposPremio.some(
      campo => b[campo] && b[campo].endsWith(numero?.toString())
    );

    // Los que coinciden deben ir primero
    if (aCoincide && !bCoincide) return -1;
    if (!aCoincide && bCoincide) return 1;
    return 0;
  });
}


const boletosConCoincidencia = (listaDeBoletos = [], value: string | number) => {

  const filterBoletos = listaDeBoletos.filter((boleto: any) => {
    return [
      boleto?.premioMayor?.endsWith(value),
      boleto?.premioMenor?.endsWith(value),
      boleto?.premioTres?.endsWith(value),
      boleto?.premioCuatro?.endsWith(value),
      boleto?.premioCinco?.endsWith(value),
    ].some((value: boolean) => value);
  });
  return filterBoletos;
}

const boletosSinCoincidencia = (listaDeBoletos = [], value: string | number) => {

  const filterBoletos = listaDeBoletos.filter((boleto: any) => {
    return [
      !boleto?.premioMayor?.endsWith(value),
      !boleto?.premioMenor?.endsWith(value),
      !boleto?.premioTres?.endsWith(value),
      !boleto?.premioCuatro?.endsWith(value),
      !boleto?.premioCinco?.endsWith(value),
    ].every((value: boolean) => value);
  });
  return filterBoletos;
}

const preLoadImg2 = (src: string,) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      resolve(img)
    };
  })
};

const preLoadImgFromURL = async (url: string) => {
  // Descargamos el archivo como blob
  const response = await fetch(url);
  const blob = await response.blob();

  // Creamos URL local temporal
  const objectURL = URL.createObjectURL(blob);

  // Cargamos la imagen desde esa URL local
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = objectURL;
    img.onload = () => {
      URL.revokeObjectURL(objectURL); // liberar memoria
      resolve(img);
    };
    img.onerror = reject;
  });
};




function formatearFecha(fechaStr: string) {
  // Descomponer la fecha en componentes
  const [year, month, day] = fechaStr.split('-').map(Number);

  // Crear una fecha con los componentes especificados
  const fecha = new Date(year, month - 1, day);

  // Opciones de formato
  const opciones: any = {
    weekday: 'long',  // nombre completo del día de la semana
    day: 'numeric',   // día del mes
    month: 'long',    // nombre completo del mes
    year: 'numeric'   // año
  };

  // Formateador de fechas
  const formateador = new Intl.DateTimeFormat('es-ES', opciones);

  // Formatear y devolver la fecha
  return formateador.format(fecha);
}

const imageUrl = "https://desohali.com/";

var pdfDoc: any;
var imagen: any;
var imgFW: any;
////////////////////////////////////////////////////////////////////
const imagenLoaded = (imageBase64: string) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous';
    img.onload = () => { resolve(img) }
    img.onerror = err => { throw err }
    img.src = imageBase64
  });
};


function generarTres(items: any[]) {
  if (items.length < 2) throw new Error("Se necesitan al menos 2 items");

  // 1️⃣ item que se repetirá
  const repetido = items[Math.floor(Math.random() * items.length)];

  // 2️⃣ item diferente
  let diferente;
  do {
    diferente = items[Math.floor(Math.random() * items.length)];
  } while (diferente._id === repetido._id);

  // 3️⃣ crear array con 2 iguales y 1 diferente
  const resultado = [repetido, repetido, diferente];

  // 4️⃣ mezclar posiciones (Fisher-Yates shuffle)
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }

  return resultado;
}

const crearBoletoMaster = async (
  element: any,
  canvas: any,
  ctx: any,
  findRifa: any,
  rayos: any,
  detalleDeCarpeta: any,
  imgUrlBackgroundImage: any,
  parGuaraniEInstantaneo: boolean,
  premiosYCantidadInstantaneo: any[],
  premiosYCantidadParGuarani: any[]
) => {

  const imageBase64 = await QRCode.toDataURL(`${window?.location?.origin}/juego/${element._id}`, {
    width: 180,
    errorCorrectionLevel: 'H',
    type: 'png',
    rendererOpts: {
      quality: 1,
    },
    margin: 2
  });

  const img = await imagenLoaded(imageBase64);

  // Destructuramos detalleDeCarpeta 
  const { urlBackgroundImage, imagenes: [primeraImagenQR], textos }: {
    urlBackgroundImage: string;
    imagenes: any[];
    textos: any[];
  } = findRifa?._idDisenioBoleto;
  // Imagen de fondo del boleto
  // const imgUrlBackgroundImage = await preLoadImg(urlBackgroundImage);
  ctx.drawImage(imgUrlBackgroundImage, 0, 0, canvas.width, canvas.height);

  const [
    precio,
    whatsapp,
    facebook,
    fecha,
    numero1,
    numero2,
    numero3,
    numero4,
    numero5,
    Par_guarani,
    Instantaneo,
    Figura_instantaneo,
  ] = textos;

  // const raspaYGanaText = textos.find((item: any) => item.texto === "Raspa y gana");

  // Imagen de fondo del boleto
  /* ctx.drawImage(urlBackgroundImage, 0, 0, 767.25, 1278.75); */
  // Imagen QR
  ctx.drawImage(img, primeraImagenQR?.x, primeraImagenQR?.y, primeraImagenQR?.width, primeraImagenQR?.height);
  // Precio del boleto
  // Precio del boleto
  ctx.fillStyle = precio?.color;
  ctx.font = `${precio?.fontSize}px "${precio?.fontFamily}"`;
  ctx.fillText(`${MONEDAS.find((item: any) => item.pais === detalleDeCarpeta.moneda)?.simbolo || "$"} ${findRifa?.precio}`, precio?.x, precio?.y);
  ctx.font = `${precio?.fontSize / 2}px "${precio?.fontFamily}"`;
  ctx.fillText(`${MONEDAS.find((item: any) => item.pais === detalleDeCarpeta.moneda)?.moneda || ""}`, precio?.x, precio?.y + (precio?.fontSize / 2));

  // Whatsapp
  ctx.fillStyle = whatsapp?.color;
  ctx.font = `${whatsapp?.fontSize}px "${whatsapp?.fontFamily}"`;
  ctx.fillText(findRifa?.whatsapp, whatsapp?.x, whatsapp?.y);

  // Facebook
  ctx.fillStyle = facebook?.color;
  ctx.font = `${facebook?.fontSize}px "${facebook?.fontFamily}"`;
  ctx.fillText(findRifa?.facebook, facebook?.x, facebook?.y);

  // Fecha
  ctx.fillStyle = fecha?.color;
  ctx.font = `${fecha?.fontSize}px "${fecha?.fontFamily}"`;
  ctx.fillText(formatearFecha(findRifa?.fecha), fecha?.x, fecha?.y);

  // Numero 1
  ctx.fillStyle = numero1?.color;
  ctx.font = `${numero1?.fontSize}px "${numero1?.fontFamily}"`;
  ctx.fillText(element?.premioMayor, numero1?.x, numero1?.y);

  // Numero 2
  ctx.fillStyle = numero2?.color;
  ctx.font = `${numero2?.fontSize}px "${numero2?.fontFamily}"`;
  ctx.fillText(element?.premioMenor, numero2?.x, numero2?.y);

  // Numero 3
  ctx.fillStyle = numero3?.color;
  ctx.font = `${numero3?.fontSize}px "${numero3?.fontFamily}"`;
  ctx.fillText(element?.premioTres, numero3?.x, numero3?.y);

  // Numero 4
  ctx.fillStyle = numero4?.color;
  ctx.font = `${numero4?.fontSize}px "${numero4?.fontFamily}"`;
  ctx.fillText(element?.premioCuatro, numero4?.x, numero4?.y);

  // Numero 5
  ctx.fillStyle = numero5?.color;
  ctx.font = `${numero5?.fontSize}px "${numero5?.fontFamily}"`;
  ctx.fillText(element?.premioCinco, numero5?.x, numero5?.y);

  // parGuaraniEInstantaneo
  // premiosYCantidadInstantaneo
  // premiosYCantidadParGuarani
  if (parGuaraniEInstantaneo) {
    let imagenes9SinPremio = [];
    const findPremioPopulate = premiosYCantidadInstantaneo.find((item: any) => item._id === element?.premioInstantaneo);
    const widthImagen = Instantaneo?.fontSize * 2;
    const labelHeight = Instantaneo?.fontSize; // altura del texto debajo de cada imagen

    if (element?.premioInstantaneo) {
      const imagenes9 = generarTablero2(premiosYCantidadInstantaneo, element?.premioInstantaneo);

      let x = Instantaneo?.x;
      let y = Instantaneo?.y - (widthImagen / 1.5);

      for (let index = 0; index < imagenes9.length; index++) {

        if (index > 0 && index % 3 === 0) {
          y += widthImagen + (labelHeight / 2); // ✅ espacio para imagen + texto
          x = Instantaneo?.x;
        }

        const idPremio = imagenes9[index];

        // Imagen
        ctx.drawImage(idPremio?.imagen, x, y, widthImagen, widthImagen);

        // Rectángulo blanco semitransparente al pie de la imagen
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y + widthImagen, widthImagen, labelHeight / 2);
        ctx.globalAlpha = 1;

        // Texto del premio centrado en el rectángulo
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = Instantaneo?.color;
        ctx.font = `bold ${Instantaneo?.fontSize * 0.6}px "${Instantaneo?.fontFamily}"`;
        ctx.fillText(
          `${MONEDAS.find((item) => item.pais === detalleDeCarpeta.moneda)?.simbolo} ${formatearNumero(idPremio?.premio)}`,
          x + widthImagen / 2,
          y + widthImagen + labelHeight / 4
        );
        ctx.restore();

        x += widthImagen;
      }

    } else {
      imagenes9SinPremio = generarTablero2(premiosYCantidadInstantaneo, "");

      let x = Instantaneo?.x;
      let y = Instantaneo?.y - (widthImagen / 1.5);

      for (let index = 0; index < imagenes9SinPremio.length; index++) {

        if (index > 0 && index % 3 === 0) {
          y += widthImagen + (labelHeight / 2); // ✅ espacio para imagen + texto
          x = Instantaneo?.x;
        }

        const idPremio = imagenes9SinPremio[index];

        // Imagen
        ctx.drawImage(idPremio?.imagen, x, y, widthImagen, widthImagen);

        // Rectángulo blanco semitransparente al pie de la imagen
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y + widthImagen, widthImagen, labelHeight / 2);
        ctx.globalAlpha = 1;

        // Texto del premio centrado en el rectángulo
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = Instantaneo?.color;
        ctx.font = `bold ${Instantaneo?.fontSize * 0.6}px "${Instantaneo?.fontFamily}"`;
        ctx.fillText(
          `${MONEDAS.find((item) => item.pais === detalleDeCarpeta.moneda)?.simbolo} ${formatearNumero(idPremio?.premio)}`,
          x + widthImagen / 2,
          y + widthImagen + labelHeight / 4
        );
        ctx.restore();

        x += widthImagen;
      }
    }

    // PONEMOS CUALQUIER FIGURA QUE NO TENGA PREMIO
    const randomIndex = Math.floor(Math.random() * imagenes9SinPremio.length);
    const figuraSeleccionada = findPremioPopulate ? findPremioPopulate : imagenes9SinPremio[randomIndex];

    // DIBUJAMOS LA FIGURA DEL INSTANTANEO
    ctx.drawImage(figuraSeleccionada?.imagen, Figura_instantaneo?.x, Figura_instantaneo?.y - (widthImagen / 1.5), widthImagen, widthImagen);
    ctx.drawImage(figuraSeleccionada?.imagen, Figura_instantaneo?.x + widthImagen, Figura_instantaneo?.y - (widthImagen / 1.5), widthImagen, widthImagen);
    ctx.drawImage(figuraSeleccionada?.imagen, Figura_instantaneo?.x + widthImagen * 2, Figura_instantaneo?.y - (widthImagen / 1.5), widthImagen, widthImagen);

    /* // DIBUJAMOS EL RECTANGULO DE FONDO
    const totalWidth = widthImagen * 3;
    const rectHeight = Figura_instantaneo?.fontSize / 1.5;

    const rectX = Figura_instantaneo?.x;
    const rectY = (Figura_instantaneo?.y + rectHeight);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "white";
    ctx.fillRect(rectX, rectY, totalWidth, rectHeight);
    ctx.globalAlpha = 1; // MUY IMPORTANTE restaurar

    // DIBUJAMOS EL PREMIO
    const centerX = Figura_instantaneo?.x + (totalWidth / 2);
    const centerY = rectY + (rectHeight / 1.75);
    ctx.save(); // guardamos el estado actual
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = Figura_instantaneo?.color;
    ctx.font = `${Figura_instantaneo?.fontSize / 2}px "${Figura_instantaneo?.fontFamily}"`;

    ctx.fillText(
      `${MONEDAS.find((item) => item.pais === detalleDeCarpeta.moneda)?.simbolo} ${formatearNumero(figuraSeleccionada?.premio)}`,
      centerX,
      centerY
    );
    ctx.restore(); // restauramos TODO */

    // DIBUJAMOS TODO LO DE PAR GUARANI
    const findPremioPopulate2 = premiosYCantidadParGuarani.find((item: any) => item._id === element?.premioParGuarani);
    if (element?.premioParGuarani) {
      // DIBUJAMOS EL PREMIO
      const centerX = Par_guarani?.x;
      const centerY = Par_guarani?.y;

      const texto1 = `${MONEDAS.find((item) => item.pais === detalleDeCarpeta.moneda)?.simbolo} ${formatearNumero(findPremioPopulate2?.premio)}`;
      ctx.fillStyle = Par_guarani?.color;
      ctx.font = `${Par_guarani?.fontSize / 1.75}px "${Par_guarani?.fontFamily}"`;

      const metrics = ctx.measureText(texto1);
      const anchoTexto = metrics.width;

      ctx.fillText(
        texto1,
        centerX,
        centerY
      );

      // segundo texto con espacio
      ctx.fillText(texto1, centerX + anchoTexto + 25, centerY);
    } else {

      const [idPremio1, idPremio2] = obtenerDosDiferentes(premiosYCantidadInstantaneo.map(({ _id }: any) => _id));

      const [premio1, premio2] = [
        premiosYCantidadInstantaneo.find((item: any) => item._id === idPremio1),
        premiosYCantidadInstantaneo.find((item: any) => item._id === idPremio2)
      ];

      // DIBUJAMOS EL PREMIO
      const centerX = Par_guarani?.x;
      const centerY = Par_guarani?.y;

      const texto1 = `${MONEDAS.find((item) => item.pais === detalleDeCarpeta.moneda)?.simbolo} ${formatearNumero(premio1?.premio)}`;
      const texto2 = `${MONEDAS.find((item) => item.pais === detalleDeCarpeta.moneda)?.simbolo} ${formatearNumero(premio2?.premio)}`;
      ctx.fillStyle = Par_guarani?.color;
      ctx.font = `${Par_guarani?.fontSize / 1.75}px "${Par_guarani?.fontFamily}"`;

      const metrics = ctx.measureText(texto1);
      const anchoTexto = metrics.width;

      ctx.fillText(
        texto1,
        centerX,
        centerY
      );

      // segundo texto con espacio
      ctx.fillText(texto2, centerX + anchoTexto + 25, centerY);
    }

  }

  return pdfDoc.embedPng(canvas.toDataURL("image/png"));
};


const { Meta } = Card;


const CardRifa: React.FC<{ rifa: any, formRifa: any }> = ({ rifa, formRifa }: any) => {

  var canvas: any, ctx: any;
  const [rayos, setrayos] = React.useState<any>();
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [ordenarBoletos, setOrdenarBoletos] = React.useState(false);
  // const [raspaYGana, setRaspaYGana] = React.useState(false);
  const [parGuaraniEInstantaneo, setParGuaraniEInstantaneo] = React.useState(false);
  const { user } = useSelector((state: any) => state.user);

  const descargarBoletos3 = async (boletos: any[], bloque: number) => {
    // boletos = boletos.slice(0, 10);
    let premiosYCantidadInstantaneo = [];
    let premiosYCantidadParGuarani = [];
    if (parGuaraniEInstantaneo) {
      if (!Array.isArray(rifa?.premiosYCantidadInstantaneo) || rifa?.premiosYCantidadInstantaneo.length < 5) {
        message.error('No hay premios suficientes configurados para instantáneo');
        return;
      }
      if (!Array.isArray(rifa?.premiosYCantidadParGuarani) || rifa?.premiosYCantidadParGuarani.length < 2) {
        message.error('No hay premios suficientes configurados para par guaraní');
        return;
      }
      //PREMIOS INSTANTANEO
      premiosYCantidadInstantaneo = rifa?.premiosYCantidadInstantaneo.map((premio: any) => {
        const findPremio = (detalleDeCarpeta?.premios || []).find((p: any) => p._id === premio.premio);
        return findPremio || {}
      });
      const imagenesCargadas = await Promise.all(premiosYCantidadInstantaneo.map((premio: any) => preLoadImg2(premio?.urlFB)));
      premiosYCantidadInstantaneo = premiosYCantidadInstantaneo.map((premio: any, index: number) => {
        return {
          ...premio,
          imagen: imagenesCargadas[index]
        }
      });

      // PREMIOS PAR GUARANI
      premiosYCantidadParGuarani = rifa?.premiosYCantidadParGuarani.map((premio: any) => {
        const findPremio = (detalleDeCarpeta?.premios || []).find((p: any) => p._id === premio.premio);
        return findPremio || {}
      });
      // const imagenesCargadasParGuarani = await Promise.all(premiosYCantidadParGuarani.map((premio: any) => preLoadImg2(premio?.urlFB)));
      // premiosYCantidadParGuarani = premiosYCantidadParGuarani.map((premio: any, index: number) => {
      //   return {
      //     ...premio,
      //     imagen: imagenesCargadasParGuarani[index]
      //   }
      // });

    }

    pdfDoc = await PDFDocument.create();

    let widthPDF = 767.25;
    let heightPDF = 1278.75;
    let { columns, rows } = rifa?._idDisenioBoleto?.configuracionDelBoleto;
    let heightBoleto = (heightPDF / rows);
    let page = pdfDoc.addPage([widthPDF, heightPDF]);
    let x = 0;
    let y = (heightPDF - heightBoleto);
    let fila = 1;
    let numeroBoletos = 1;

    canvas = canvas ?? document.getElementById(rifa._id);
    ctx = ctx ?? canvas.getContext('2d');

    const imgUrlBackgroundImage = await preLoadImg2(rifa?.imagen || rifa?._idDisenioBoleto?.urlBackgroundImage);


    const boletosImages: any = [];
    for (const boleto of boletos) {

      const imagePng = await crearBoletoMaster(
        boleto,
        canvas,
        ctx,
        rifa,
        rayos,
        detalleDeCarpeta,
        imgUrlBackgroundImage,
        parGuaraniEInstantaneo,
        premiosYCantidadInstantaneo,
        premiosYCantidadParGuarani,
      );
      boletosImages.push(imagePng);
    }

    // const [primeraImagenQR] = detalleDeCarpeta.imagenes || [];
    for (const [i, boletoImage] of boletosImages.entries()) {
      const { premioMayor, premioMenor, premioTres, premioCuatro, premioCinco, ...rest } = boletos[i];

      // Agregar el texto a la página
      page.drawText(premioCinco, {
        x: x,
        y: (y + 0),
        size: 24,
        color: rgb(0, 0, 0),
        opacity: 0.001,
      });
      page.drawText(premioCuatro, {
        x: x,
        y: (y + 48),
        size: 24,
        color: rgb(0, 0, 0),
        opacity: 0.001,
      });
      page.drawText(premioTres, {
        x: x,
        y: (y + 72),
        size: 24,
        color: rgb(0, 0, 0),
        opacity: 0.001,
      });
      page.drawText(premioMenor, {
        x: x,
        y: (y + 96),
        size: 24,
        color: rgb(0, 0, 0),
        opacity: 0.001,
      });
      page.drawText(premioMayor, {
        x: x,
        y: (y + 120),
        size: 24,
        color: rgb(0, 0, 0),
        opacity: 0.001,
      });

      const jpgDims = boletoImage.scale(0.75); // Ajusta el tamaño según necesites

      // Dibuja la imagen en la posición actual
      page.drawImage(boletoImage, {
        x: x,
        y: y,
        width: jpgDims.width - ((fila < columns) ? 2 : 0),
        // height: jpgDims.height - (numeroBoletos > 3 && numeroBoletos <= 15 ? 2 : 0),
        height: jpgDims.height - (numeroBoletos > columns && numeroBoletos <= (columns * rows) ? 2 : 0),
      });

      // Mover a la siguiente columna
      if ((i + 1) % columns === 0) {  // Cuando llegamos a la 4ta columna
        x = 0;
        y -= jpgDims.height;
        fila = 1;
      } else {
        x += jpgDims.width;
        fila++;
      }
      if (numeroBoletos === (columns * rows)) {
        x = 0;
        y = (heightPDF - heightBoleto);

        if (i < boletosImages.length - 1) {
          page = pdfDoc.addPage([widthPDF, heightPDF]);
        }

        numeroBoletos = 1;
      } else {
        numeroBoletos++;
      }
    }




    const pdfBytes: any = await pdfDoc.save();

    // Crear un Blob con los datos del PDF
    const pdfBlob: any = new Blob([pdfBytes], { type: 'application/pdf' });

    // Crear una URL a partir del Blob
    const pdfUrl: any = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Rifa-${rifa.fecha}-boque-${bloque * 1000 - 999}-${bloque * 1000}.pdf`; // Nombre del archivo que se descargará
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(pdfUrl);
    // Abrir una nueva pestaña con el PDF
    // window.open(pdfUrl);
  };

  const { listaDeCarpetas } = useSelector((state: any) => state.admin);

  const router = useRouter();
  const params = useParams();

  const dispatch = useDispatch();
  const [detalleDeCarpeta, setdetalleDeCarpeta] = React.useState<any>(null);
  console.log('detalleDeCarpeta :>> ', detalleDeCarpeta);

  React.useEffect(() => {
    if (listaDeCarpetas.length && params?._idCarpeta) {
      setdetalleDeCarpeta(listaDeCarpetas.find((c: any) => (c?._id == params?._idCarpeta)));
    }
  }, [params?._idCarpeta, listaDeCarpetas])


  const [listarBoletos, {
    data,
    error,
    isLoading
  }] = useListarBoletosMutation();

  const [eliminarRifa, responseEliminar] = useEliminarRifaMutation();


  React.useEffect(() => {

    async function disenioMaster() {

      canvas = document.getElementById(rifa._id);
      ctx = canvas.getContext('2d');
      const imageBase64 = await QRCode.toDataURL(`${window?.location?.origin}/juego/${Math.random()}`, {
        width: 180,
        errorCorrectionLevel: 'H',
        type: 'png',
        rendererOpts: {
          quality: 1,
        },
        margin: 2
      });

      const img = await imagenLoaded(imageBase64);

      // Destructuramos detalleDeCarpeta 
      const { urlBackgroundImage, imagenes: [primeraImagenQR], textos }: {
        urlBackgroundImage: string;
        imagenes: any[];
        textos: any[];
      } = rifa?._idDisenioBoleto;

      const [
        precio,
        whatsapp,
        facebook,
        fecha,
        numero1,
        numero2,
        numero3,
        numero4,
        numero5
      ] = textos;

      // Imagen de fondo del boleto
      const imgUrlBackgroundImage = await preLoadImg2(rifa?.imagen || urlBackgroundImage);
      ctx.drawImage(imgUrlBackgroundImage, 0, 0, canvas.width, canvas.height);
      // Imagen QR
      ctx.drawImage(img, primeraImagenQR?.x, primeraImagenQR?.y, primeraImagenQR?.width, primeraImagenQR?.height);
      // Precio del boleto
      ctx.fillStyle = precio?.color;
      ctx.font = `${precio?.fontSize}px "${precio?.fontFamily}"`;
      ctx.fillText(`${MONEDAS.find((item: any) => item.pais === detalleDeCarpeta.moneda)?.simbolo || "$"} ${rifa?.precio}`, precio?.x, precio?.y);
      ctx.font = `${precio?.fontSize / 2}px "${precio?.fontFamily}"`;
      ctx.fillText(`${MONEDAS.find((item: any) => item.pais === detalleDeCarpeta.moneda)?.moneda || ""}`, precio?.x, precio?.y + (precio?.fontSize / 2));

      // Whatsapp
      ctx.fillStyle = whatsapp?.color;
      ctx.font = `${whatsapp?.fontSize}px "${whatsapp?.fontFamily}"`;
      ctx.fillText(rifa?.whatsapp, whatsapp?.x, whatsapp?.y);

      // Facebook
      ctx.fillStyle = facebook?.color;
      ctx.font = `${facebook?.fontSize}px "${facebook?.fontFamily}"`;
      ctx.fillText(rifa?.facebook, facebook?.x, facebook?.y);

      // Fecha
      ctx.fillStyle = fecha?.color;
      ctx.font = `${fecha?.fontSize}px "${fecha?.fontFamily}"`;
      ctx.fillText(formatearFecha(rifa?.fecha)?.toUpperCase(), fecha?.x, fecha?.y);

      // Numero 1
      ctx.fillStyle = numero1?.color;
      ctx.font = `${numero1?.fontSize}px "${numero1?.fontFamily}"`;
      ctx.fillText("".padStart(Number(rifa?.digitos || 4), "0"), numero1?.x, numero1?.y);

      // Numero 2
      ctx.fillStyle = numero2?.color;
      ctx.font = `${numero2?.fontSize}px "${numero2?.fontFamily}"`;
      ctx.fillText("".padStart(Number(rifa?.digitos || 4), "0"), numero2?.x, numero2?.y);

      // Numero 3
      ctx.fillStyle = numero3?.color;
      ctx.font = `${numero3?.fontSize}px "${numero3?.fontFamily}"`;
      ctx.fillText("".padStart(Number(rifa?.digitos || 4), "0"), numero3?.x, numero3?.y);

      // Numero 4
      ctx.fillStyle = numero4?.color;
      ctx.font = `${numero4?.fontSize}px "${numero4?.fontFamily}"`;
      ctx.fillText("".padStart(Number(rifa?.digitos || 4), "0"), numero4?.x, numero4?.y);

      // Numero 5
      ctx.fillStyle = numero5?.color;
      ctx.font = `${numero5?.fontSize}px "${numero5?.fontFamily}"`;
      ctx.fillText("".padStart(Number(rifa?.digitos || 4), "0"), numero5?.x, numero5?.y);

    };


    if (rifa?._idDisenioBoleto && detalleDeCarpeta) {
      disenioMaster();
    }


  }, [rifa._id, rifa.color, detalleDeCarpeta]);


  const [loading, setloading] = React.useState(false);
  const [loadingRoute, setloadingRoute] = React.useState(false);

  const CANTIDAD_BOLETOS_POR_BLOQUE_DE_1000: any = React.useMemo(() => {
    if (!rifa?.cantidadBoletos) return 0;
    const MOD = rifa?.cantidadBoletos % 1000;
    let TOTAL_BLOQUES = (rifa?.cantidadBoletos - MOD) / 1000;
    if (MOD > 0) {
      TOTAL_BLOQUES++;
    }
    return {
      TOTAL_BLOQUES,
      MOD,
    };
  }, [rifa]);

  const [bloqueSeleccionado, setBloqueSeleccionado] = React.useState(1);


  return (
    <Card
      onClick={(event: any) => {
        // Verifica si el elemento clicado es un <canvas>
        if (event.target.tagName.toLowerCase() === 'canvas') {
          if (user?.rifas?.sorteo) {
            setloadingRoute(true);
            router.push(`/admin/sorteos/${rifa._id}`);
          } else {
            message.info("Usuario no autorizado para el sorteo!")

          }


        }
      }}
      hoverable
      style={{ width: "100%" }}
      cover={(
        <Spin spinning={loadingRoute}>
          <Badge.Ribbon text={`Dígitos ${rifa?.digitos}`} color={rifa?.digitos == 3 ? "orange" : "blue"}>
            <canvas
              id={rifa._id}
              width={rifa?._idDisenioBoleto ? (1023 / rifa?._idDisenioBoleto?.configuracionDelBoleto?.columns) : 341}
              height={rifa?._idDisenioBoleto ? (1705 / rifa?._idDisenioBoleto?.configuracionDelBoleto?.rows) : 341}
              style={{ borderRadius: ".5rem" }}></canvas>
          </Badge.Ribbon>
        </Spin>
      )}
      actions={[
        <Flex vertical gap="small" style={{ width: '100%', padding: "0px 1rem" }}>
          <Button type="primary" block size={window?.innerWidth > 768 ? 'middle' : 'small'} onClick={async (e) => {
            e.stopPropagation();
            dispatch(setOpenFormBoleto(true));
            dispatch(setRifaDetalles(rifa));
          }} icon={<QrcodeOutlined />} >
            Ganadores QR
          </Button>
        </Flex>

      ]}
    >
      <Row gutter={12} style={{ paddingBottom: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12}>
          <Tooltip title="Premios automáticos">
            {rifa?.checked
              ? <Tag style={style} icon={<SyncOutlined spin />} color="#1677ff">Activo</Tag>
              : <Tag style={style} icon={<SyncOutlined />} color="default">Inactivo</Tag>}
          </Tooltip>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12}>
          <Tooltip title="Premios especiales">
            {rifa?.checked2
              ? <Tag style={style} icon={<GiftOutlined />} color="#1677ff">Activo</Tag>
              : <Tag style={style} icon={<GiftOutlined />} color="default">Inactivo</Tag>}
          </Tooltip>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} style={{ marginTop: "0.5rem" }}>
          <Tooltip title={`${rifa.count} boletos vendidos`}>
            <Tag style={style} icon={<QrcodeOutlined />} color={rifa?.color}>
              {`${rifa.count} boletos vendidos`}
            </Tag>
          </Tooltip>
        </Col>
      </Row>
      <Meta
        title={`Boletos: ${rifa?._idDisenioBoleto?.configuracionDelBoleto?.columns} x ${rifa?._idDisenioBoleto?.configuracionDelBoleto?.rows}  = ${rifa?._idDisenioBoleto?.configuracionDelBoleto?.columns * rifa?._idDisenioBoleto?.configuracionDelBoleto?.rows} por hoja`}
      />
      <Meta description={`Fecha : ${rifa?.fecha}`} />
      <Meta description={`Nombre : ${rifa?.nombre}`} />
      <Meta description={`Boletos : ${rifa?.cantidadBoletos ?? 5000}`} />
      <Meta description={`descripción: ${rifa?.descripcion}`} />
      <Meta description={(
        <strong>
          {`Total en ventas: ${((Number(rifa.precio) * 1000) * Number(rifa.count))?.toLocaleString('en-US').replace(/,/g, '.')}`}
        </strong>
      )} />


      {/* <Divider style={{ marginTop: "1rem", marginBottom: "0.5rem" }} />
      <Typography.Link href={`${location?.origin}/google/${rifa?._id}?_idCarpeta=${params?._idCarpeta}`} strong target="_blank">
        <CarryOutOutlined /> Detalles de la rifa
      </Typography.Link> */}



      <Modal
        title="Descarga de boletos"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setOrdenarBoletos(false);
          setParGuaraniEInstantaneo(false);
        }}
        className="preview-modal"
        footer={[
          <Button disabled={loading} danger key="back" onClick={() => setPreviewVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="download"
            type="primary"
            disabled={loading}
            loading={loading}
            icon={<CloudDownloadOutlined />}
            onClick={async () => {
              setloading(true);
              if (ordenarBoletos) {
                // TODO: Implementar lógica para descargar boletos ordenados o con raspa y gana
                const options: any = {
                  title: "Ingresa un número de 2 a 4 dígitos",
                  input: "text",
                  inputLabel: "Los boletos se ordenan por este número",
                  inputPlaceholder: "Ingresa un número de 2 a 4 dígitos",
                  inputAttributes: {
                    maxlength: "4",
                    minlength: "2",
                    pattern: "\\d{2,4}",
                    inputmode: "numeric",
                  },
                  showCancelButton: true,
                  confirmButtonText: "Descargar",
                  cancelButtonText: "Cancelar",
                  inputValidator: (value: any) => {
                    if (!value) {
                      return "Debes escribir un número de 2 a 4 dígitos.";
                    }
                    if (!/^\d{2,4}$/.test(value)) {
                      return "Solo se permiten números de 2 a 4 dígitos.";
                    }
                    return null;
                  },
                };

                const { value } = await Swal.fire(options);
                if (!value) return;


                const { data = [] }: any = await listarBoletos({ _idRifa: rifa._id });
                // convertir bloque (1,2,3...) a índice (0,1,2...)
                const index = bloqueSeleccionado - 1;

                const inicio = index * 1000;
                const fin = inicio + 1000;

                const dataFiltrada = data.slice(inicio, fin);
                const boletosOrdenados = ordenarPorTerminacion(dataFiltrada, value);

                dispatch(setListaDeBoletos(boletosOrdenados));
                await descargarBoletos3(boletosOrdenados, bloqueSeleccionado);
              } else {

                const { data = [] }: any = await listarBoletos({ _idRifa: rifa._id });

                const BOLETOS_ORDENADOS_POR_PREMIO = [...data].sort((a, b) => {
                  const aTiene = a.premioInstantaneo ? 1 : 0;
                  const bTiene = b.premioInstantaneo ? 1 : 0;
                  return bTiene - aTiene;
                });
                // convertir bloque (1,2,3...) a índice (0,1,2...)
                const index = bloqueSeleccionado - 1;

                const inicio = index * 1000;
                const fin = inicio + 1000;

                const dataFiltrada = BOLETOS_ORDENADOS_POR_PREMIO.slice(inicio, fin);

                await descargarBoletos3(dataFiltrada, bloqueSeleccionado);
                dispatch(setListaDeBoletos(dataFiltrada));
              }
              setloading(false);
              setPreviewVisible(false);
            }}
          >
            Descargar
          </Button>
        ]}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <span>Ordenar boletos</span>
          <Switch
            checkedChildren="SI"
            unCheckedChildren="NO"
            checked={ordenarBoletos}
            onChange={(checked) => setOrdenarBoletos(checked)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <span>Par guaraní e instantáneo</span>
          <Switch
            checkedChildren="SI"
            unCheckedChildren="NO"
            checked={parGuaraniEInstantaneo}
            onChange={(checked) => setParGuaraniEInstantaneo(checked)}
          />
        </div>

        <div>
          <Radio.Group
            style={styleRadio}
            onChange={(e) => setBloqueSeleccionado(e.target.value)}
            value={bloqueSeleccionado}
          >
            {Array.from(
              { length: CANTIDAD_BOLETOS_POR_BLOQUE_DE_1000.TOTAL_BLOQUES },
              (_, i) => i + 1
            ).map((item) => (
              <Radio key={item} value={item}>
                Boletos {item * 1000 - 999} - {item * 1000}
              </Radio>
            ))}
          </Radio.Group>
        </div>

      </Modal>

    </Card >
  )
};

export default CardRifa;