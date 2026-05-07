"use client";
import React from 'react';
import Marquee from 'react-fast-marquee';
import { setRifaDetalles } from '@/features/adminSlice';
import { useBuscarRifaMutation } from '@/services/userApi';
import { Alert, Button, Col, Flex, Row, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
const { Title } = Typography;
function esNumero(cadena: any) {
  return !isNaN(cadena) && cadena?.trim() !== "";
};

var canvas: any, ctx: any;
var numerosInicio = [0, 0, 0, 0];

var cordenadas = { x: 385, y: 400 };// y 100

var nTimeout1: any, nTimeout2: any, nTimeout3: any, nTimeout4: any;
var width = 1000, height = 667;// 130
var imagen: any;


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

const imagenesDelSorteo: string[] = [
  '../../static/billetes.png',
  '../../static/cofre.png',
  '../../static/corona.png',
  '../../static/maquina.png',
  '../../static/monedas.png',
];

function drawDottedBackgroundWithGradient(ctx: any, width: number, height: number, color: string, emoji: string = "") {
  // Fondo rosa
  ctx.fillStyle = color; // Color de fondo
  ctx.fillRect(0, 0, width, height);

  const squareSize = emoji ? 8 : 4;  // Tamaño de los cuadrados
  const spacing = emoji ? 20 : 10;    // Espaciado entre los cuadrados
  const transparency = 0.5; // Transparencia de los cuadrados

  /* // Crear gradiente radial desde el centro del canvas
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = (Math.max(width, height) / 2) * 4;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);

  // Definir los colores del gradiente (de opaco a transparente)
  gradient.addColorStop(0, `rgba(255, 255, 255, ${transparency})`); // Color en el centro
  gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // Transparente en los bordes

  // Aplicar el gradiente como relleno
  ctx.fillStyle = gradient; */
  ctx.fillRect(0, 0, width, height);

  // Dibujar cuadrados
  ctx.fillStyle = `rgba(255, 255, 255, ${transparency})`; // Color blanco con transparencia para los cuadrados
  ctx.font = "bold 16px serif";
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      if (emoji) {
        ctx.fillText(emoji, x, y);
      } else {
        ctx.fillRect(x, y, squareSize, squareSize);  // Dibujar los cuadrados
      }
    }
  }
}

var intervals: any[] = [];
var currentStopIndex = 0;
var numbers: any[] = [0, 0, 0, 0];


const page = ({ params }: any) => {

  const dispatch = useDispatch();
  const { rifaDetalles } = useSelector((state: any) => state.admin);
  const [imagenesDelSorteoCargadas, setimagenesDelSorteoCargadas] = React.useState<any>({});
  const [logo, setLogo] = React.useState<any>();
  const [loadingImages, setloadingImages] = React.useState(true);

  const [buscarRifa, { data, error, isLoading }] = useBuscarRifaMutation();
  React.useEffect(() => {
    buscarRifa({ _id: params._idRifa })
      .then((rifa: any) => {
        dispatch(setRifaDetalles(rifa.data))
      });
  }, []);

  React.useEffect(() => {
    setloadingImages(true);
    const cargadas: any[] = [];
    imagenesDelSorteo.forEach((src) => {
      cargadas.push(preLoadImg(src));
    });

    Promise.all(cargadas).then(async (response) => {

      const [billetes, cofre, corona, maquina, monedas] = response;
      setimagenesDelSorteoCargadas({
        billetes,
        cofre,
        corona,
        maquina,
        monedas
      });


      setloadingImages(false);
    });
  }, []);

  React.useEffect(() => {
    if (rifaDetalles) {
      // al final cargamos la imagen de la empresa
      const src = `https://desohali.com/assets/images/juegoDeRifas/${rifaDetalles?._id}-daniel-dos/${rifaDetalles?.imagen}`;
      preLoadImg(src).then((imgLogo: any) => {
        setLogo(imgLogo);
      });
    }

  }, [rifaDetalles])



  React.useEffect(() => {
    if (rifaDetalles && !loadingImages) {
      canvas = document.querySelector("canvas");
      ctx = canvas.getContext("2d");

      const canvasWidthCenter = canvas?.width / 2;

      drawDottedBackgroundWithGradient(ctx, canvas.width, canvas.height, rifaDetalles.color, rifaDetalles.emojis);
      // DIBUJAMOS EL NOMBRE DE LA RIFA
      ctx.fillStyle = "black";
      ctx.font = "bold 64px cursive";
      ctx.lineWidth = 2;
      ctx.fillStyle = "black";
      ctx.strokeStyle = "black";
      const textWidth = ctx.measureText(`RIFA: ${rifaDetalles?.nombre.toUpperCase()}`).width;
      // Calculamos la posición X para centrar el texto
      const x = (canvasWidthCenter - (textWidth / 2));
      ctx.fillText(`RIFA: ${rifaDetalles?.nombre.toUpperCase()}`, x, 64);

      // DIBUJAMOS LAS IMAGENES
      const {
        billetes,
        cofre,
        corona,
        maquina,
        monedas
      } = imagenesDelSorteoCargadas;


      ctx.drawImage(corona, canvasWidthCenter - (corona?.width / 2), 120, corona?.width * 1.1, corona?.height * 1.1);
      ctx.drawImage(maquina, (canvasWidthCenter - (maquina?.width / 2)) + 20, 200, maquina?.width * 1.1, maquina?.height * 1.1);

      ctx.drawImage(cofre, 25, (canvas?.height - (cofre?.height / 1.2)), cofre?.width / 1.2, cofre?.height / 1.2);
      ctx.drawImage(billetes, canvasWidthCenter - (billetes?.width / 2), (canvas?.height - billetes?.height), billetes?.width, billetes?.height);
      ctx.drawImage(monedas, canvas?.width - (monedas?.width + 25), (canvas?.height - monedas?.height), monedas?.width, monedas?.height);
      if (logo) {
        ctx.drawImage(logo, 0, 0, 84, 84);
        ctx.drawImage(logo, canvas?.width - 84, 0, 84, 84);
      }

      ctx.font = "bold 100px cursive";
      numbers.forEach((num, i) => {
        ctx.fillText(num, cordenadas.x + (65 * i), cordenadas.y);
        ctx.strokeText(num, cordenadas.x + (65 * i), cordenadas.y);
      });
    }

    return () => {
      for (const inter of intervals) {
        clearInterval(inter);
      }
    }

  }, [rifaDetalles, loadingImages, logo]);



  /* if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  } */


  function drawNumbers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    const canvasWidthCenter = canvas?.width / 2;

    drawDottedBackgroundWithGradient(ctx, canvas.width, canvas.height, rifaDetalles.color, rifaDetalles.emojis);
    // DIBUJAMOS EL NOMBRE DE LA RIFA
    ctx.fillStyle = "black";
    ctx.font = "bold 64px cursive";
    ctx.lineWidth = 2;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    const textWidth = ctx.measureText(`RIFA: ${rifaDetalles?.nombre.toUpperCase()}`).width;
    // Calculamos la posición X para centrar el texto
    const x = (canvasWidthCenter - (textWidth / 2));
    ctx.fillText(`RIFA: ${rifaDetalles?.nombre.toUpperCase()}`, x, 64);

    // DIBUJAMOS LAS IMAGENES
    const {
      billetes,
      cofre,
      corona,
      maquina,
      monedas
    } = imagenesDelSorteoCargadas;


    ctx.drawImage(corona, canvasWidthCenter - (corona?.width / 2), 120, corona?.width * 1.1, corona?.height * 1.1);
    ctx.drawImage(maquina, (canvasWidthCenter - (maquina?.width / 2)) + 20, 200, maquina?.width * 1.1, maquina?.height * 1.1);

    ctx.drawImage(cofre, 25, (canvas?.height - (cofre?.height / 1.2)), cofre?.width / 1.2, cofre?.height / 1.2);
    ctx.drawImage(billetes, canvasWidthCenter - (billetes?.width / 2), (canvas?.height - billetes?.height), billetes?.width, billetes?.height);
    ctx.drawImage(monedas, canvas?.width - (monedas?.width + 25), (canvas?.height - monedas?.height), monedas?.width, monedas?.height);
    if (logo) {
      ctx.drawImage(logo, 0, 0, 84, 84);
      ctx.drawImage(logo, canvas?.width - 84, 0, 84, 84);
    }

    ctx.font = "bold 100px cursive";
    numbers.forEach((num, i) => {
      ctx.fillText(num, cordenadas.x + (65 * i), cordenadas.y);
      ctx.strokeText(num, cordenadas.x + (65 * i), cordenadas.y);
    });

  }

  function startRandomNumbers() {
    numbers = [0, 0, 0, 0];
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
      if (currentStopIndex < intervals.length) {
        setTimeout(() => stopNumber(currentStopIndex), 3000); // Detiene el siguiente número después de 1 segundo
      }
    }
  }

  return (
    <React.Suspense>
      <Row gutter={16}>
        {/* <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
          <Alert style={{ marginBottom: "12px" }} message={
            <Marquee pauseOnHover gradient={false}>
              <Title style={{ marginBottom: "6px" }} level={3}>Juego De Rifas - premio {esNumero(rifaDetalles?.premio) ? rifaDetalles?.premio?.toFixed(3) : rifaDetalles?.premio}</Title>
            </Marquee>
          } type="info" showIcon />
        </Col> */}
        <Col className="gutter-row" xs={24} sm={24} md={2} lg={4}>

        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={20} lg={16}>
          <canvas width={width} height={height} style={{ width: "100%", borderRadius: ".5rem" }}></canvas>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={2} lg={4}>
          <Flex vertical gap="small" style={{ width: '100%' }}>
            <Button danger onClick={async () => {
              currentStopIndex = 0;
              intervals.forEach(clearInterval); // Asegura detener cualquier intervalo previo
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
