"use client";
import { setRifaDetalles } from '@/features/adminSlice';
import useUserLocation from '@/hooks/useUserLocation';
import { useActualizarBoletoMutation, useBuscarBoletoMutation, useBuscarRifaMutation, useLoginValidadorQRMutation } from '@/services/userApi';
import { Alert, Button, Col, Drawer, Flex, FloatButton, Form, Input, message, Row, Spin, Tag } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import { setCookie, getCookie } from '@/helpers/cookies';
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import MONEDAS from '../../../../public/monedas.json'; // Ruta relativa al archivo JSON
import BilleteExplocion from '@/helpers/BilleteExplocion';


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
var canvas: any, ctx: any, imagen: any;

const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);
const style: React.CSSProperties = { width: '100%' };

const preLoadImg = (src: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    // img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      resolve(img)
    };
  })
};


// Array para almacenar los grupos de billetes de cada explosión
let explosiones: any = [];



const App: React.FC<{ params: any }> = ({ params }: any) => {

  const dispatch = useDispatch();
  const [formUsuario] = Form.useForm();
  const { rifaDetalles: boletoDetalles } = useSelector((state: any) => state.admin);
  const [detalleDeCarpeta, setDetalleDeCarpeta] = React.useState<any>(null);

  const MONEDA_CARPETA = MONEDAS.find(({ pais }: any) => pais == detalleDeCarpeta?.moneda);

  const ubicacion = useUserLocation();
  React.useEffect(() => {
    if (ubicacion?.error) {
      ubicacion.requestLocation();
    }
  }, [ubicacion]);

  const [openDrawer, setopenDrawer] = React.useState(false);
  const [autenticarUsuario, { data, error, isLoading }] = useLoginValidadorQRMutation();
  const [backgroundIMG, setBackgroundIMG] = React.useState<any>(null);
  const [jockerIMG, setJockerIMG] = React.useState<any>(null);
  const [cajaIMG, setCajaIMG] = React.useState<any>(null);

  console.log('boletoDetalles', boletoDetalles)
  React.useEffect(() => {
    preLoadImg("/caja.png").then((img) => {
      setCajaIMG(img);
    });
    preLoadImg("/joker2.png").then((img) => {
      setJockerIMG(img);
    });
  }, []);

  const [rifa, setRifa] = React.useState<any>(null);

  const [buscarRifa, responseRifa] = useBuscarBoletoMutation();
  const [buscarRifa2, responseRifa2] = useBuscarRifaMutation();
  const [actualizarBoleto, { data: dataBoleto, isLoading: isLoadingBoleto }] = useActualizarBoletoMutation();


  React.useEffect(() => {
    buscarRifa({ _id: params._idBoleto })
      .then((rifa: any) => {
        dispatch(setRifaDetalles(rifa.data));
      });
  }, []);

  React.useEffect(() => {
    if (boletoDetalles) {
      buscarRifa2({ _id: boletoDetalles._idRifa })
        .then((rifa: any) => {
          setRifa(rifa.data);
          setDetalleDeCarpeta(rifa.data?._idCarpeta);
        });
    }
  }, [boletoDetalles]);

  function animate(billetes: any[], imagen: any) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);

    billetes.forEach((billete: any) => {
      billete.update();
      billete.draw();
    });

    requestAnimationFrame(animate.bind(null, billetes, imagen));
  }


  function animate2(canvas: any, ctx: any, imagen: any) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);

    explosiones.forEach((billetes: any, index: any) => {
      billetes.forEach((billete: any) => {
        billete.update();
        billete.draw();
      });

      // Filtrar billetes visibles en el canvas para finalizar la explosión
      explosiones[index] = billetes.filter((b: any) => b.y < canvas.height);
    });

    // Eliminar explosiones vacías
    explosiones = explosiones.filter((billetes: any) => billetes.length > 0);

    requestAnimationFrame(animate2.bind(null, canvas, ctx, imagen));
  }

  function animateEspecial(canvas: any, ctx: any, bgIMG: any, imagenes: any[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const boxes: any = [];
    const confetti: any = [];

    const numBoxes = imagenes.length;
    const boxWidth = 225;
    const boxHeight = 225;

    // Crear cajas con sus premios ya definidos
    let x = 0;
    let y = 75;
    for (let i = 0; i < numBoxes; i++) {
      boxes.push({
        x,
        y,
        width: boxWidth,
        height: boxHeight,
        offset: Math.random() * 1000,
        opened: false,
        prizeImg: imagenes[i], // 👈 Premio ya asignado
        current: { x: 0, y: 0, w: 0, h: 0 }
      });

      if (x === 225) {
        x = 0;
        y += 225;
      } else {
        x += 225;
      }
    }

    // Detectar clics
    canvas.addEventListener("click", (e: any) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      boxes.forEach((box: any) => {
        const b = box.current;
        if (
          mouseX >= b.x &&
          mouseX <= b.x + b.w &&
          mouseY >= b.y &&
          mouseY <= b.y + b.h
        ) {
          if (!box.opened) {
            box.opened = true;
            spawnConfetti(box);
          }
        }
      });
    });

    // Crear confeti
    function spawnConfetti(box: any) {
      const b = box.current;
      for (let i = 0; i < 50; i++) {
        confetti.push({
          x: b.x + b.w / 2,
          y: b.y + b.h / 2,
          dx: (Math.random() - 0.5) * 4,
          dy: -Math.random() * 5 - 2,
          size: Math.random() * 6 + 3,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`,
          life: 100 + Math.random() * 50
        });
      }
    }

    // Dibujar confeti
    function drawConfetti() {
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.dx;
        c.y += c.dy;
        c.dy += 0.15;
        c.life--;
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, c.size, c.size);
        if (c.life <= 0) confetti.splice(i, 1);
      }
    }

    // Animar
    function animate(time: any) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo
      ctx.drawImage(bgIMG, 0, 0, canvas.width, canvas.height);

      boxes.forEach((box: any) => {
        const floatY = Math.sin((time + box.offset) * 0.003) * 10;
        const scale = 1 + Math.sin((time + box.offset) * 0.005) * 0.03;

        const scaledWidth = box.width * scale;
        const scaledHeight = box.height * scale;
        const drawX = box.x - (scaledWidth - box.width) / 2;
        const drawY = box.y + floatY;

        box.current.x = drawX;
        box.current.y = drawY;
        box.current.w = scaledWidth;
        box.current.h = scaledHeight;

        if (box.opened) {
          // Escalar el premio para encajar sin recortar
          const scalePrize = Math.min(225 / box.prizeImg.width, 225 / box.prizeImg.height);
          const newWidth = box.prizeImg.width * scalePrize;
          const newHeight = box.prizeImg.height * scalePrize;
          const offsetX = (225 - newWidth) / 2;
          ctx.drawImage(box.prizeImg, drawX + offsetX, drawY, newWidth, newHeight);

          // Brillo al abrir
          const grad = ctx.createRadialGradient(
            drawX + scaledWidth / 2,
            drawY + scaledHeight / 2,
            10,
            drawX + scaledWidth / 2,
            drawY + scaledHeight / 2,
            80
          );
          grad.addColorStop(0, "rgba(255,255,150,0.8)");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(drawX + scaledWidth / 2, drawY + scaledHeight / 2, 80, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.drawImage(cajaIMG, drawX, drawY, scaledWidth, scaledHeight);
        }
      });

      drawConfetti();
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  };

  const canvasRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const videoGanasteRef = React.useRef<any>(null);

  // Función para actualizar el canvas solo cuando el video está reproduciéndose
  const updateCanvas = () => {
    const canvas: any = canvasRef.current;
    const context = canvas.getContext('2d');
    const video: any = videoRef.current;

    // Dibuja el video en el canvas si está listo
    if (video && video.readyState === 4) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    // Si el video sigue reproduciéndose, continúa la actualización
    if (!video.paused && !video.ended) {
      requestAnimationFrame(updateCanvas);
    }
  };
  // Cambia el video al hacer clic y controla el canvas
  const handleClick = (src: any) => {
    const video: any = videoRef.current;
    video.src = src;
    // Al iniciar la reproducción, llama a updateCanvas
    video.onplaying = () => {
      // SI NO HAY IMAGEN DE SIGUE PARTICIPANDO MOSTRAR EL VIDEO
      if (!detalleDeCarpeta?.sigueParticipando?._id) {
        requestAnimationFrame(updateCanvas);
      }
    };
    // SIEMPRE REPRODUCIMOS EL VIDEO
    video.play(); // Reproduce el video
  };
  // IMAGENES LOADED
  /* const [imagenesDelSorteoCargadas, setimagenesDelSorteoCargadas] = React.useState<any>({}); */

  const [loadingImages, setloadingImages] = React.useState(false);
  const [loadingImage, setloadingImage] = React.useState(false);


  React.useEffect(() => {
    if (!loadingImages) {
      canvas = canvas ?? document.querySelector("canvas");
      ctx = ctx ?? canvas.getContext("2d");
    }

  }, [loadingImages]);


  React.useEffect(() => {

    const listenerJugar = async (event: any) => {

      const rect = canvas.getBoundingClientRect(); // Posición y tamaño del canvas en la ventana
      const scaleX = canvas.width / rect.width; // Factor de escala en X
      const scaleY = canvas.height / rect.height; // Factor de escala en Y

      // Obtener las coordenadas escaladas dentro del canvas
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      const textoQR = detalleDeCarpeta?.textosQR.at(-1);
      if (!textoQR) return;
      const textX = textoQR.x * 1.5;
      const textY = textoQR.y;
      const texto = textoQR.texto;
      const fontSize = textoQR.fontSize;
      const fontFamily = textoQR.fontFamily;

      // Configurar la fuente
      ctx.font = `${fontSize * 1.5}px ${fontFamily}`;

      // Medir dimensiones del texto
      const metrics = ctx.measureText(texto);
      const textWidth = metrics.width;
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      console.log('textWidth', textWidth)
      console.log('textHeight', textHeight)
      // Verificar si el clic está dentro del área del texto
      const clicDentroDelTexto =
        x >= textX &&
        x <= (textX + textWidth) &&
        y >= textY - metrics.actualBoundingBoxAscent &&
        y <= textY + metrics.actualBoundingBoxDescent;
      if (clicDentroDelTexto) {

        // PROBAMOS A REMOVER EL CLICK APENAS PASE PERO PODRIA SER QUE TIENE ASOCIADO 2 EVENTLISTENER
        if (!rifa?._idCarpeta?.authQR) {
          canvas.removeEventListener('click', listenerJugar);
        }

        // Obtener el valor de un parámetro específico
        const params = new URLSearchParams(document.location.search);
        let [_idUsuario, latitude = "", longitude = ""]: any = [
          (params.get('user') || ''),
          (params.get('latitude') || ''),
          (params.get('longitude') || '')
        ];

        const ubicacionVenta: any = ubicacion?.location;

        if (rifa?._idCarpeta?.authQR) {
          if (!_idUsuario && /* !localStorage.getItem("vendedor") */ !getCookie("vendedor")) {
            setopenDrawer(true);
            return;
          } else if (!_idUsuario && /* localStorage.getItem("vendedor") */ getCookie("vendedor")) {
            _idUsuario = /* localStorage.getItem("vendedor") */getCookie("vendedor");
            latitude = latitude || ubicacionVenta?.latitude;
            longitude = longitude || ubicacionVenta?.longitude;
          }

        }

        _idUsuario = _idUsuario || "66dfafcc044585e136978741";
        latitude = latitude || ubicacionVenta?.latitude;
        longitude = longitude || ubicacionVenta?.longitude;

        if (!latitude || !longitude) {
          swal("Alerta", "Datos de ubicación incompletos!", "info");
          return;
        }

        const { data }: any = await actualizarBoleto({
          _id: boletoDetalles?._id,
          _idUsuario,
          latitude,
          longitude,
        });

        if (data && !data?.status) {
          await swal("Alerta Error : ", data?.error, "error");
          setopenDrawer(true);
          return;
        }

        // DIBUJAMOS EL RESULTADO EN EL CANVAS
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if ((data?.data?.premios || []).length) {
          if ((data?.data?.premios || []).length == 1) {
            handleClick('../../imagenes/hasGanado.mp3');
            const findPremio = (detalleDeCarpeta?.premios || []).find((premio: any) => premio._id == data?.data?.premios[0]);
            preLoadImg(findPremio?.urlFB)
              .then((imagen: any) => {
                animate2(canvas, ctx, imagen);
              }).catch((error: any) => {
                window.alert(error.toString());
              });
          } else if ((data?.data?.premios || []).length > 1) {
            // CAJITAS
            handleClick('../../imagenes/hasGanado.mp3');
            const multiplesPremios = (data?.data?.premios || []).map((premio: string) => {
              return detalleDeCarpeta?.premios.find((p: any) => p._id == premio);
            });

            const premiosValidos = multiplesPremios.map((premio: any) => {
              return premio?.urlFB ? preLoadImg(premio.urlFB) : Promise.resolve(null);
            });

            const imagenesPremios = await Promise.all(premiosValidos);
            const imgUrlBackgroundImage = await preLoadImg(detalleDeCarpeta?.urlBackgroundImageQR);
            animateEspecial(canvas, ctx, imgUrlBackgroundImage, imagenesPremios.map((i) => i || jockerIMG));
          }

        } else {
          handleClick('../../imagenes/premioMenor.mp3');
          if (detalleDeCarpeta?.sigueParticipando?._id) {
            preLoadImg(detalleDeCarpeta?.sigueParticipando.urlFB)
              .then((imagen: any) => {
                // Crear varias serpentinas
                const serpentinas: any = [];
                animate(serpentinas, imagen);
              }).catch((error: any) => {
                window.alert(error.toString());
              });
          }
        }
      }

    };


    async function disenioMaster() {
      setloadingImage(true);
      // Destructuramos detalleDeCarpeta 
      const { urlBackgroundImageQR, imagenesQR: [primeraImagenQR], textosQR }: {
        urlBackgroundImageQR: string;
        imagenesQR: any[];
        textosQR: any[];
      } = detalleDeCarpeta;

      // Imagen de fondo del boleto
      const imgUrlBackgroundImage = await preLoadImg(urlBackgroundImageQR);
      setBackgroundIMG(imgUrlBackgroundImage);
      setloadingImage(false);
      if (boletoDetalles?.estadoMenor) {
        ctx.drawImage(imgUrlBackgroundImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(imgUrlBackgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none"; // Restablecer para futuros dibujos
      }

      const [
        fecha,
        numero1,
        numero2,
        numero3,
        numero4,
        numero5,
        jugar,
      ] = textosQR;
      // Fecha
      ctx.fillStyle = fecha?.color;
      ctx.font = `${(fecha?.fontSize * 1.5)}px "${fecha?.fontFamily}"`;
      ctx.fillText(formatearFecha(boletoDetalles?._idRifa.fecha || boletoDetalles?.fechaJuego.slice(0, 10)), fecha?.x * 1.5, fecha?.y);

      // Numero 1
      ctx.fillStyle = numero1?.color;
      ctx.font = `${(numero1?.fontSize * 1.5)}px "${numero1?.fontFamily}"`;
      ctx.fillText(boletoDetalles?.premioMayor ? `N°1:${boletoDetalles?.premioMayor}` : "", numero1?.x * 1, numero1?.y);

      // Numero 2
      ctx.fillStyle = numero2?.color;
      ctx.font = `${(numero2?.fontSize * 1.5)}px "${numero2?.fontFamily}"`;
      ctx.fillText(boletoDetalles?.premioMenor ? `N°2:${boletoDetalles?.premioMenor}` : "", numero2?.x * 1, numero2?.y);

      // Numero 3
      ctx.fillStyle = numero3?.color;
      ctx.font = `${(numero3?.fontSize * 1.5)}px "${numero3?.fontFamily}"`;
      ctx.fillText(boletoDetalles?.premioTres ? `N°3:${boletoDetalles?.premioTres}` : "", numero3?.x * 1, numero3?.y);

      // Numero 4
      ctx.fillStyle = numero4?.color;
      ctx.font = `${(numero4?.fontSize * 1.5)}px "${numero4?.fontFamily}"`;
      ctx.fillText(boletoDetalles?.premioCuatro ? `N°4:${boletoDetalles?.premioCuatro}` : "", numero4?.x * 1, numero4?.y);

      // Numero 5
      ctx.fillStyle = numero5?.color;
      ctx.font = `${(numero5?.fontSize * 1.5)}px "${numero5?.fontFamily}"`;
      ctx.fillText(boletoDetalles?.premioCinco ? `N°5:${boletoDetalles?.premioCinco}` : "", numero5?.x * 1, numero5?.y);


      if (boletoDetalles?.estadoMenor) {
        // Jugar
        ctx.fillStyle = jugar?.color;
        ctx.font = `${(jugar?.fontSize * 1.5)}px "${jugar?.fontFamily}"`;
        ctx.fillText(jugar?.texto, jugar?.x * 1.5, jugar?.y);
        canvas.addEventListener("click", listenerJugar);

      } else {

        ctx.save();

        // dibujar fondo rojo transparente
        const ganoAlgunPremio = (boletoDetalles?.premios || []).length;
        ctx.fillStyle = ganoAlgunPremio ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, ganoAlgunPremio > 1 ? 170 : 90);

        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";  // <-- centrado
        ctx.textBaseline = "middle"; // <-- opcional, para centrar verticalmente

        ctx.fillStyle = "white";
        ctx.fillText("📲 BOLETO JUGADO", canvas.width / 2, 20);

        ctx.font = `${ganoAlgunPremio ? 'bold 24px Arial' : 'bold 18px Arial'}`;
        ctx.fillText(ganoAlgunPremio ? "FELICIDADES GANASTE!!!" : "SIN PREMIO 🙁", canvas.width / 2, 50);

        if (ganoAlgunPremio == 1) {
          const findPremio = (detalleDeCarpeta?.premios || []).find(({ _id }: any) => (_id == boletoDetalles?.premios[0]));

          if (findPremio?.sumarPremio) {
            ctx.fillText(`${MONEDA_CARPETA?.simbolo} ${findPremio?.premio}`, canvas.width / 2, 75);
          } else {
            ctx.fillText(`${findPremio?.descripcion || ""}`, canvas.width / 2, 75);
          }
          
        } else if (ganoAlgunPremio > 1) {
          // CAJITAS
          let y = 75;
          (boletoDetalles?.premios || []).map((idPremio: any) => {
            const findPremio = (detalleDeCarpeta?.premios || []).find(({ _id }: any) => (_id == idPremio));

            if (findPremio?.sumarPremio) {
              ctx.fillText(findPremio ? `🎁 ${MONEDA_CARPETA?.simbolo} ${findPremio?.premio}` : "❌", canvas.width / 2, y);
            } else {
              ctx.fillText(findPremio ? `🎁 ${findPremio?.descripcion || ""}` : "❌", canvas.width / 2, y);
            }
            y += 25;
          })
        } else {
          // window.alert("No hay premios");
        }


        ctx.font = "bold 18px Arial";
        // ctx.fillStyle = "black";
        const ciudad = `CIUDAD: ${detalleDeCarpeta?.nombreCarpeta || ""}`; // dinámico
        ctx.fillText(ciudad, canvas.width / 2, canvas.height - 10);

        const vendedor = `VENDEDOR: ${boletoDetalles?._idUsuarioVendedor?.usuario || ""}`; // dinámico
        ctx.fillText(vendedor, canvas.width / 2, canvas.height - 30);

        ctx.restore();
      }


    }

    if (detalleDeCarpeta && boletoDetalles && detalleDeCarpeta?.urlBackgroundImageQR) {
      disenioMaster();
    }


    return () => {
      if (canvas) {
        canvas.removeEventListener('click', listenerJugar);
      }
    };

  }, [boletoDetalles, detalleDeCarpeta, canvas]);



  return (
    <React.Suspense>
      <Row gutter={0}>
        <Col className="gutter-row" xs={24} sm={4} md={6} lg={8}>

        </Col>
        <Col className="gutter-row" xs={24} sm={16} md={12} lg={8} style={{
          height: "100vh",
          position: "relative",
        }}>
          <FloatButton tooltip={"Recargar navegador"} style={{ top: 20, right: 20 }} onClick={() => {
            window.location.reload();
          }} icon={<ReloadOutlined />} />

          {ubicacion?.permissionStatus === "prompt" || ubicacion?.permissionStatus === "denied" ? (
            <FloatButton tooltip={"Permitir ubicación"} style={{ top: 20, left: 20 }} onClick={ubicacion?.requestLocation} icon={<EnvironmentOutlined />} />
          ) : null}

          {Boolean(ubicacion?.error) && <Alert message={ubicacion?.error} type="warning" showIcon closable />}
          <Spin size="large" spinning={loadingImage}>
            <canvas ref={canvasRef} width={450} height={600} style={{ width: "100%", height: "100vh" }}></canvas>
          </Spin>
          {/* <canvas ref={canvasRef} width={450} height={650} style={{ width: "100%", height: "100%" }}></canvas> */}
          <video ref={videoRef} style={{ display: 'none' }} />

          <video
            ref={videoGanasteRef}
            src="../static/ganaste.mp4" // Cambia por la ruta real de tu video
            // autoPlay
            // loop
            // muted
            style={{ display: 'none' }}
          />

        </Col>
        <Col className="gutter-row" xs={24} sm={4} md={6} lg={8}>
          <Drawer
            title="Autenticar usuario"
            width={500}
            onClose={() => setopenDrawer(false)}
            open={openDrawer}
            styles={{
              body: {
                paddingBottom: 80,
              },
            }}>
            <Form
              form={formUsuario}
              name="login-form"
              layout="vertical"
              style={{ width: "100%" }}
              requiredMark={customizeRequiredMark}
              initialValues={{
                usuario: "",
                password: "",
              }}
              onFinish={async (values) => {
                const { usuario, password } = values;
                const { data }: any = await autenticarUsuario({
                  usuario: (usuario || "")?.trim(),
                  password: (password || "")?.trim()
                });

                if (!data || !data?.estado) {
                  swal("Alerta", "Usuario no autorizado ó inactivo!", "warning");
                  return;
                } else {
                  // localStorage.setItem("vendedor", data._id);
                  setCookie("vendedor", data._id, 12);
                }
                location.reload();

              }} >
              <Row gutter={16}>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    name="usuario"
                    label="Usuario"
                    rules={[{ required: true, message: 'Por favor, ingrese usuario' }]}
                  >
                    <Input placeholder="Usuario" style={style} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    name="password"
                    label="Contraseña"
                    rules={[{ required: true, message: 'Por favor, ingrese contraseña' }]}
                  >
                    <Input type='password' placeholder="Usuario" style={style} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Flex vertical gap="small" style={{ width: '50%', margin: "auto" }}>
                    <Button loading={isLoading} type="primary" block htmlType="submit">
                      Autenticar
                    </Button>
                  </Flex>
                </Col>
              </Row>

            </Form>
          </Drawer>
        </Col>
      </Row>
    </React.Suspense>
  )
}

export default App;