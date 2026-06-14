"use client";
import React from 'react';
import { Button, Card, Col, Flex, FloatButton, Form, Pagination, Row, Skeleton, Tooltip } from 'antd';
import FormRifa from '@/components/FormRifa';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { setIdCarpeta, setListaDeRifas, setOpenFormRifa, setRifaDetalles } from '@/features/adminSlice';
import CardRifa from '@/components/CardRifa';
import { useListarRifasMutation } from '@/services/userApi';
import FormBoleto from '@/components/FormBoleto';
import { EyeOutlined, EditOutlined, CloudDownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { PDFDocument } from 'pdf-lib';

const actions: React.ReactNode[] = [
  <EditOutlined key="edit" />,
  <CloudDownloadOutlined key="setting" />,
  <EyeOutlined key="ellipsis" />,
];

const textos = [
  "Clausulas y condiciones del juego",
  "1.- El premio se pagará al portador del ticket.",
  "2.- Será anulado el boleto que presente alteraciones o enmendaduras.",
  "3.- El sorteo podrá ser aplazado por motivos de fuerza mayor.",
  "4.- Cada premio estará sujeto a la retención del 8% según lo estipula la ley.",
  "5.- Caducidad de 3 días después del sorteo.",
  "6.- No somos responsables de préstamos que realicen los funcionarios y/o administradores."
];

const preLoadImg = (src: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      resolve(img)
    };
  })
}

const Rifas: React.FC = ({ params }: any) => {

  const dispatch = useDispatch();
  const [formRifa] = Form.useForm();

  const [total, setTotal] = React.useState(1);
  const [current, setCurrent] = React.useState(1);

  const onChange = (page: number) => {
    setCurrent(page);
    listarRifas({ skip: page, _idCarpeta: params?._idCarpeta });
  };
  const { user } = useSelector((state: any) => state.user);
  const { listaDeRifas, isRifa, rifaDetalles, listaDeCarpetas } = useSelector((state: any) => state.admin);
  const [loadingImages, setloadingImages] = React.useState(true);

  const [listarRifas, { data, error, isLoading }] = useListarRifasMutation();
  console.log('listaDeRifas', listaDeRifas)

  React.useEffect(() => {
    if (params?._idCarpeta && user) {
      dispatch(setIdCarpeta(params._idCarpeta));
      if (user?._idRifa) {
        listarRifas({ skip: current, _idCarpeta: params?._idCarpeta, _idRifa: user?._idRifa });
      }
    }
  }, [params?._idCarpeta, user]);

  React.useEffect(() => {
    if (data) {
      dispatch(setListaDeRifas(data?.listaDeRifas));
      setTotal(data?.count);
    }
  }, [data]);

  /* React.useEffect(() => {
    if (isRifa && params?._idCarpeta) {
      listarRifas({ skip: current, _idCarpeta: params?._idCarpeta });
    }
  }, [isRifa, params?._idCarpeta]); */

  React.useEffect(() => {
    if (data) {
      setloadingImages(true);
      dispatch(setListaDeRifas(data?.listaDeRifas));
      setloadingImages(false);
      /* const cargadas: any[] = [];
      data?.listaDeRifas.forEach(({ _id, imagen }: any) => {
        const src = `https://desohali.com/assets/images/juegoDeRifas/${_id}-daniel-dos/${imagen}`;
        cargadas.push(preLoadImg(src));
      });

      Promise.all(cargadas).then((response) => {
        dispatch(setListaDeRifas(data?.listaDeRifas.map((rifa: any, i: number) => {
          return { ...rifa, img: response[i] };
        })));
        setloadingImages(false);
      }); */
      setTotal(data?.count);
    } else {
      setloadingImages(false);
    }
  }, [data]);


  const [detalleDeCarpeta, setdetalleDeCarpeta] = React.useState<any>(null);

  React.useEffect(() => {
    if (listaDeCarpetas.length && params?._idCarpeta) {
      setdetalleDeCarpeta(listaDeCarpetas.find((c: any) => (c?._id == params?._idCarpeta)));
    }
  }, [params?._idCarpeta, listaDeCarpetas])

  // CLAUSULAS Y CONDICIONES DEL JUEGO
  const descargarClausulas3 = async () => {
    const pdfDoc = await PDFDocument.create();

    let widthPDF = 767.25, heightPDF = 1278.75;
    let page = pdfDoc.addPage([widthPDF, heightPDF]);
    let x = 0;
    let y = (heightPDF - 255.75);
    let fila = 1;
    let numeroBoletos = 1;

    const canvas: any = document.getElementById("canvasClausulas");
    const ctx: any = canvas.getContext('2d');

    // Función para dividir el texto si es demasiado largo
    function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
      const words = text.split(' ');
      let line = '';

      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;

        // Si el texto supera el ancho máximo, lo dibujamos y hacemos un salto de línea
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, x, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y); // Dibujar el resto del texto
    };

    const canvasWidth = 341; // Ancho del canvas
    const lineHeight = 14;   // Altura de la línea de texto
    const margin = 25;       // Margen inicial
    ctx.font = "bold 14px cursive"; // Fuente del texto

    let boletosImages: any = [];
    for (let index = 0; index < 15; index++) {
      ctx.clearRect(0, 0, canvas?.width, canvas?.height);

      // Dibujar todos los textos en el canvas
      let y = margin;
      textos.forEach((texto) => {
        wrapText(ctx, texto, margin, y, canvasWidth - margin * 2, lineHeight);
        y += lineHeight * 2; // Ajustar espacio entre bloques de texto
      });

      /* ctx.fillStyle = generarColorRandom();
      ctx.fillRect(0, 0, canvas.width, canvas.height); */

      boletosImages.push(pdfDoc.embedPng(canvas.toDataURL("image/png")));

    }
    boletosImages = await Promise.all(boletosImages);
    /* console.log('boletosImages', boletosImages)
    return; */

    for (const [i, boletoImage] of boletosImages.entries()) {
      const jpgDims = boletoImage.scale(0.75);

      page.drawImage(boletoImage, {
        x: x,
        y: y,
        width: jpgDims.width,
        height: jpgDims.height,
      });

      // Mover a la siguiente columna
      if ((i + 1) % 3 === 0) {  // Cuando llegamos a la 4ta columna
        x = 0;
        y -= jpgDims.height;
        fila = 1;
      } else {
        x += jpgDims.width;
        fila++;
      }
      if (numeroBoletos === 15) {
        x = 0;
        y = (heightPDF - 255.75);

        if (i < boletosImages.length - 1) {
          page = pdfDoc.addPage([widthPDF, heightPDF]);
        }

        numeroBoletos = 1;
      } else {
        numeroBoletos++;
      }
    }

    // DESCARGAR
    const pdfBytes: any = await pdfDoc.save();

    // Crear un Blob con los datos del PDF
    const pdfBlob: any = new Blob([pdfBytes], { type: 'application/pdf' });

    // Crear una URL a partir del Blob
    const pdfUrl: any = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Clausulas-condiciones.pdf`; // Nombre del archivo que se descargará
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(pdfUrl);
  };

  return (
    <React.Suspense>
      <canvas id='canvasBoleto' width={300} height={300} style={{ display: "none", border: "2px solid black" }}></canvas>
      <canvas id='canvasClausulas' width={341} height={detalleDeCarpeta?.disenio == "sistema2" ? 255 : 341} style={{ display: "none", border: "2px solid black" }}></canvas>
      <Row gutter={[16, 16]} style={{ padding: "1rem 0rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={8}>
          <Tooltip title="Clausulas y condiciones del juego">
            <FloatButton icon={<FilePdfOutlined />} onClick={() => {
              descargarClausulas3();
            }} />
          </Tooltip>

        </Col>
        <Col className="gutter-row" xs={24} sm={12} md={12} lg={8}>
          {/* <Flex vertical gap="small" style={{ width: '100%', marginBottom: '12px' }}>
            <Button size='large' type="primary" onClick={() => {
              dispatch(setRifaDetalles(null));
              dispatch(setOpenFormRifa(true));
              formRifa.resetFields();
            }} icon={<PlusOutlined />}>
              Registrar rifa
            </Button>
          </Flex> */}
          <FormRifa formRifa={formRifa} />
          {rifaDetalles && <FormBoleto />}
        </Col>
        <Col className="gutter-row" xs={24} sm={12} md={12} lg={8}>
          <div style={{ width: "100%", textAlign: "center" }}>
            <Pagination
              disabled={isLoading}
              current={current}
              defaultPageSize={4}
              onChange={onChange}
              total={total}
              showSizeChanger={false} />
          </div>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {(isLoading || loadingImages) ? (
          [1, 2, 3, 4].map((v) => (
            <Col key={v} className="gutter-row" xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
              <Card loading={isLoading} actions={actions} style={{ width: "100%" }}>
                <Skeleton active />
              </Card>
            </Col>
          ))
        ) : listaDeRifas.map((rifa: any) => (
          <Col key={rifa._id} className="gutter-row" xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
            <CardRifa rifa={rifa} formRifa={formRifa} /* imagen={null} */ />
          </Col>
        ))}
      </Row>
    </React.Suspense >
  )
}

export default Rifas;