"use client";
import React from 'react';
import Marquee from 'react-fast-marquee';
import { setIdCarpeta, setRifaDetalles } from '@/features/adminSlice';
import { useBuscarRifaMutation } from '@/services/userApi';
import { Alert, Button, Col, Flex, message, Result, Row, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ReloadOutlined } from '@ant-design/icons';


import BilleteExplocion from '@/helpers/BilleteExplocion';
import LucesSorteo from '@/helpers/LucesSorteo';
import HaloGanador from '@/helpers/HaloGanador';
import RayoRadial from '@/helpers/RayoRadial';
import EspiralLuz from '@/helpers/EspiralLuz';

let lucesSorteo: any[] = [];
let espirales: any[] = [];
let rayos: any[] = [];
let haloGanador: any = null;
let modoShow = false;

function iniciarShow(canvas: any, ctx: any) {
  lucesSorteo = [];
  espirales = [];
  rayos = [];
  haloGanador = null;
  modoShow = true;

  for (let i = 0; i < 120; i++) {
    lucesSorteo.push(
      new LucesSorteo(canvas, ctx, canvas.width / 2, canvas.height / 2)
    );
  }

  for (let i = 0; i < 80; i++) {
    espirales.push(
      new EspiralLuz(canvas, ctx, canvas.width / 2, canvas.height / 2)
    );
  }
}



/* function iniciarLuces(canvas: any, ctx: any) {
  lucesSorteo = []; // reinicia

  for (let i = 0; i < 80; i++) {
    lucesSorteo.push(
      new LucesSorteo(
        canvas,
        ctx,
        canvas.width / 2 + (Math.random() - 0.5) * 400,
        canvas.height / 2 + (Math.random() - 0.5) * 250
      )
    );
  }
} */


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

var width = 1000, height = 667;// 130
const preLoadImg = (src: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      resolve(img)
    };
  })
};

let explosiones: any[] = [];
// Función para iniciar una explosión en una posición específica (x, y)
function iniciarExplosion(canvas: any, ctx: any, x: any, y: any) {
  const billetes = []; // Crear un nuevo grupo de billetes para esta explosión
  for (let i = 0; i < 75; i++) {
    billetes.push(new BilleteExplocion(canvas, ctx, x, y)); // Crear billetes en el punto de la explosión
  }
  explosiones.push(billetes); // Agregar el grupo de billetes al array de explosiones
}

function drawDottedBackgroundWithGradient(
  canvas: any,
  ctx: any,
  width: number,
  height: number,
  color: string,
  emoji: string = "",
  callback = () => { },
  final = false,
  backgroundImageSorteo: any
) {



  const squareSize = emoji ? 16 : 8;
  const spacing = emoji ? 40 : 20;
  const elements: any = [];

  const emojiList = ["🤑", "💰", "💎", "🎈", "🎁", "💸", "⭐", "🍾", "💵"];
  const randomEmoji = emoji || emojiList[Math.floor(Math.random() * emojiList.length)];

  // Agregar emojis animados flotantes
  const floatingEmojis = Array.from({ length: 75 + Math.floor(Math.random() * 50) }, () => ({
    emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
    x: Math.random() * width,
    y: Math.random() * height,
    size: 16 + Math.random() * 32,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    opacity: 0.5 + Math.random() * 0.5,
  }));

  // Inicializar los elementos (posición y opacidad)
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      elements.push({
        x,
        y,
        opacity: Math.random(),
        fadingIn: Math.random() > 0.5,
      });
    }
  }

  function animate(callback: any) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.font = "bold 32px serif";

    ctx.drawImage(backgroundImageSorteo, 0, 0, canvas.width, canvas.height);

    // Dibujar elementos (cuadrados o emojis base)
    elements.forEach((element: any) => {
      ctx.save();
      ctx.globalAlpha = element.opacity;

      if (emoji) {
        ctx.fillText(randomEmoji, element.x, element.y);
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${element.opacity})`;
        // ctx.fillRect(element.x, element.y, squareSize, squareSize);
      }

      ctx.restore();

      if (element.fadingIn) {
        element.opacity += 0.01;
        if (element.opacity >= 1) {
          element.opacity = 1;
          element.fadingIn = false;
        }
      } else {
        element.opacity -= 0.01;
        if (element.opacity <= 0) {
          element.opacity = 0;
          element.fadingIn = true;
        }
      }
    });

    // Dibujar emojis flotantes
    /* floatingEmojis.forEach((e) => {
      ctx.save();
      ctx.globalAlpha = e.opacity;
      ctx.font = `bold ${e.size}px serif`;
      ctx.fillText(e.emoji, e.x, e.y);
      ctx.restore();

      e.x += e.vx;
      e.y += e.vy;

      // Rebote suave
      if (e.x < 0 || e.x > width) e.vx *= -1;
      if (e.y < 0 || e.y > height) e.vy *= -1;
    }); */
    // 🔥 Luces del sorteo
    /* lucesSorteo.forEach((luz, i) => {
      luz.update();
      luz.draw();

      if (luz.isDead()) {
        lucesSorteo.splice(i, 1);
      }
    }); */

    // 🌈 CAPA SHOW (NO rompe nada)
    // 🎆 EFECTOS SHOW (NO TOCA TU MOTOR)
    if (modoShow) {
      lucesSorteo.forEach(l => {
        l.update();
        l.draw();
      });

      espirales.forEach(e => {
        e.update();
        e.draw();
      });

      rayos.forEach(r => {
        r.update();
        r.draw();
      });

      if (haloGanador) {
        haloGanador.update();
        haloGanador.draw();
      }
    }



    callback();
  }

  function animateFinal() {
    explosiones.forEach((billetes, index) => {
      billetes.forEach((billete: any) => {
        billete.update();
        billete.draw();
      });
      explosiones[index] = billetes.filter((b: any) => b.y < 600);
    });
    explosiones = explosiones.filter((b) => b.length > 0);
  }

  function animateAll() {
    animate(callback);
    if (final) animateFinal();
    requestAnimationFrame(animateAll);
  }
  /* 
    // Explosiones iniciales
    for (let i = 0; i < 3; i++) {
      iniciarExplosion(canvas, ctx, Math.random() * canvas.width, Math.random() * canvas.height);
    }
  
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        iniciarExplosion(canvas, ctx, Math.random() * canvas.width, Math.random() * canvas.height);
      }
    }, 3500);
  
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        iniciarExplosion(canvas, ctx, Math.random() * canvas.width, Math.random() * canvas.height);
      }
    }, 7000); */

  animateAll();
}



var intervals: any[] = [];
var currentStopIndex = 0;



const page = ({ params }: any) => {

  const dispatch = useDispatch();
  const { rifaDetalles } = useSelector((state: any) => state.admin);
  const { permisos } = useSelector((state: any) => state.user);

  const [backgroundImageSorteo, setBackgroundImageSorteo] = React.useState<any>();
  const [loadingImage, setLoadingImage] = React.useState(true);

  const [numbers, setNumbers] = React.useState<any[]>([0, 0, 0, 0]);

  console.log('rifaDetalles', rifaDetalles)

  const [buscarRifa, { data, error, isLoading }] = useBuscarRifaMutation();
  React.useEffect(() => {
    buscarRifa({ _id: params._idRifa })
      .then((rifa: any) => {
        dispatch(setRifaDetalles(rifa?.data));
        dispatch(setIdCarpeta(typeof rifa?.data?._idCarpeta === 'string' ? rifa?.data?._idCarpeta : rifa?.data?._idCarpeta?._id));
      });
  }, []);


  React.useEffect(() => {
    if (rifaDetalles) {
      // Imagen de fondo del boleto
      setLoadingImage(true);
      preLoadImg(rifaDetalles?._idCarpeta?.urlBackgroundImageSorteo)
        .then((imgLogo: any) => {
          // setLogo(imgLogo);
          setBackgroundImageSorteo(imgLogo);
          setLoadingImage(false);
        }).catch((error: any) => {
          message.error("Error al cargar la imagen de fondo del sorteo");
          console.log("error", error);
          setLoadingImage(false);
        });


      setNumbers(rifaDetalles?.digitos == "3" ? [0, 0, 0] : [0, 0, 0, 0]);
    }

  }, [rifaDetalles]);

  function dibujarImagenesYTextos(canvas: any, ctx: any) {

    // DIBUJAMOS LAS IMAGENES
    const canvasWidthCenter = canvas?.width / 2;
    // DIBUJAMOS EL NOMBRE DE LA RIFA
    ctx.fillStyle = "black";
    ctx.font = "bold 64px cursive";
    ctx.lineWidth = 4;

    // Sombra
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";  // Color de la sombra
    ctx.shadowBlur = 6;                      // Desenfoque de la sombra
    ctx.shadowOffsetX = 4;                   // Desplazamiento horizontal
    ctx.shadowOffsetY = 4;                   // Desplazamiento vertical

    ctx.strokeStyle = "white";  // Contorno blanco para mayor visibilidad
    const {
      textosSorteo: [
        fecha,
        rifa,
        numeros,
      ]
    } = rifaDetalles?._idCarpeta;

    // Fecha
    ctx.fillStyle = fecha?.color;
    ctx.font = `${(fecha?.fontSize * 2)}px "${fecha?.fontFamily}"`;
    ctx.fillText(formatearFecha(rifaDetalles?.fecha), fecha?.x * 2, fecha?.y * 2);

    // Rifa
    ctx.fillStyle = rifa?.color;
    ctx.font = `${(rifa?.fontSize * 2)}px "${rifa?.fontFamily}"`;
    ctx.fillText(rifaDetalles?.nombre || "Rifa no encontrada", rifa?.x * 2, rifa?.y * 2);


    // numbers = (rifaDetalles?.digitos == "3" ? [0, 0, 0] : [0, 0, 0, 0]);
    numbers.forEach((num, i) => {
      ctx.fillStyle = numeros?.color;
      ctx.font = `${(numeros?.fontSize * 2)}px "${numeros?.fontFamily}"`;
      ctx.fillText(num, (numeros?.x * 2) + ((numeros?.fontSize * 2) * i), numeros?.y * 2);
    });
  }

  React.useEffect(() => {
    const canvas: any = document.querySelector("canvas");
    const ctx: any = canvas?.getContext("2d");
    if (rifaDetalles && !loadingImage) {
      drawDottedBackgroundWithGradient(
        canvas,
        ctx,
        canvas.width,
        canvas.height,
        rifaDetalles.color,
        rifaDetalles.emojis,
        dibujarImagenesYTextos.bind(null, canvas, ctx),
        false,
        backgroundImageSorteo
      );
    }

    return () => {
      for (const inter of intervals) {
        clearInterval(inter);
      }
    }

  }, [rifaDetalles, loadingImage, backgroundImageSorteo]);



  function drawNumbers() {

    const canvas: any = document.querySelector("canvas");
    const ctx: any = canvas?.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dibujarImagenesYTextos.bind(null, canvas, ctx)();

  }

  function startRandomNumbers() {
    // numbers = (rifaDetalles?.digitos == "3" ? [0, 0, 0] : [0, 0, 0, 0]);
    drawNumbers();

    intervals = numbers.map((_, i) => {
      return setInterval(() => {
        numbers[i] = Math.floor(Math.random() * 10);
        drawNumbers();
      }, 100);
    });
  }

  function stopRandomNumbers() {
    currentStopIndex = 0;
    stopNumber(currentStopIndex);
  }

  function stopNumber(index: number) {
    if (index < intervals.length) {
      clearInterval(intervals[index]);
      numbers[index] = rifaDetalles?.ganador.split("")[index];
      drawNumbers();
      currentStopIndex++;

      // 🔥 MOMENTO ÉPICO (ADICIONAL)
      if (index === intervals.length - 1) {
        const canvas: any = document.querySelector("canvas");
        const ctx: any = canvas?.getContext("2d");

        for (let i = 0; i < 40; i++) {
          rayos.push(
            new RayoRadial(
              canvas,
              ctx,
              canvas.width / 2,
              canvas.height / 2
            )
          );
        }

        haloGanador = new HaloGanador(
          canvas,
          ctx,
          canvas.width / 2,
          canvas.height / 2
        );
      }

      if (currentStopIndex < intervals.length) {
        setTimeout(() => stopNumber(currentStopIndex), 3000); // Detiene el siguiente número después de 1 segundo
      }
    }
  }




  return (
    <React.Suspense>
      <Row gutter={16}>

        <Col className="gutter-row" xs={24} sm={24} md={2} lg={4}>
          <Button icon={<ReloadOutlined />} onClick={() => {
            location.reload();
          }} type="dashed" block>
            Actualizar
          </Button>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={20} lg={16}>
          <Spin size="large" spinning={loadingImage}>
            <canvas width={width} height={height} style={{
              width: "100%",
              borderRadius: ".5rem",
              border: `10px solid ${rifaDetalles?.color || "white"}`
            }}></canvas>
          </Spin>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={2} lg={4}>
          <Flex vertical gap="small" style={{ width: '100%' }}>
            <Button danger onClick={async () => {
              /* setfinal(false); */
              currentStopIndex = 0;
              intervals.forEach(clearInterval); // Asegura detener cualquier intervalo previo
              // ✨ INICIA LUCES
              const canvas: any = document.querySelector("canvas");
              const ctx: any = canvas?.getContext("2d");
              // iniciarLuces(canvas, ctx);
              iniciarShow(canvas, ctx);
              startRandomNumbers();
            }} type="primary" block>
              Iniciar juego
            </Button>
            <Button onClick={() => {
              stopRandomNumbers();

            }} type="primary" block>
              Terminar juego
            </Button>
          </Flex>
        </Col>
      </Row>
    </React.Suspense>
  )
}

export default page;
