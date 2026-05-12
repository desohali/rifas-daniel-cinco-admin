"use client";
import React, { useRef, useState, useEffect } from 'react';
// import '@/styles/boletoDesigner.css';
import {
  Card,
  Button,
  Input,
  Upload,
  Space,
  Divider,
  Select,
  Row,
  Col,
  Typography,
  Modal,
  message,
  ColorPicker,
  Table,
  Slider,
  Collapse,
  List,
  Radio,
  Tooltip,
  Popconfirm,
  Avatar,
  Image as ImageAnt
} from 'antd';
import {
  FontSizeOutlined,
  BgColorsOutlined,
  SaveOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import *  as ANTD from 'antd';
import { setHeightBoleto, setWidthBoleto } from '@/features/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useListarDisenioBoletoQuery } from '@/services/userApi';
import { useParams } from 'next/navigation';

const { Option } = Select;
const { Text, Title } = Typography;

// Definición de tipos para el componente
// Interfaz para los datos del boleto guardado
interface BoletoGuardadoData {
  imageBase64: string;
  textos: Array<{
    id: number;
    texto: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    x: number;
    y: number;
  }>;
  imagenes: Array<{
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  backgroundColor: string;
  backgroundImageUrl?: string;
  configuracionDelBoleto: {
    columns: number;
    rows: number;
  }
}

interface BoletoDesignerPuroProps {
  onSave?: (imageBase64: string, data: BoletoGuardadoData) => void;
  width?: number;
  height?: number;
  loading?: boolean;
  previewDesign?: string;
}

// Tipos para los elementos del canvas
interface TextElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  isDragging: boolean;
  isSelected: boolean;
  textId?: number; // ID para identificar a qué campo de texto pertenece
}

interface ImageElement {
  type: 'image';
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
  isSelected: boolean;
}

type CanvasElement = TextElement | ImageElement;

// Fuentes disponibles para el texto
const fontOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Bangers', value: 'Bangers' },
  { label: 'Luckiest Guy', value: 'Luckiest Guy' },
  { label: 'Fredoka', value: 'Fredoka' },
  { label: 'Baloo 2', value: 'Baloo 2' },
  { label: 'Permanent Marker', value: 'Permanent Marker' },
  { label: 'Anton', value: 'Anton' },
  { label: 'Chewy', value: 'Chewy' },
  { label: 'Lobster', value: 'Lobster' },
  { label: 'Rubik Mono One', value: 'Rubik Mono One' }
];


// Tamaños de fuente disponibles
const fontSizeOptions = [
  { label: '12px', value: 12 },
  { label: '14px', value: 14 },
  { label: '16px', value: 16 },
  { label: '18px', value: 18 },
  { label: '24px', value: 24 },
  { label: '32px', value: 32 },
  { label: '40px', value: 40 },
  { label: '48px', value: 48 },
];


const BoletoDesignerPuro: React.FC<BoletoDesignerPuroProps> = ({
  onSave,
  loading = false,
  previewDesign = ""
}) => {

  const dispatch = useDispatch();
  // Referencias y estados
  const canvasRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const {
    widthBoleto: width,
    heightBoleto: height,
    detalleDeCarpeta
  } = useSelector((state: any) => state.admin);

  console.log('width', width)
  console.log('height', height)


  const { data: disenioBoleto = [], refetch } = useListarDisenioBoletoQuery({ _idCarpeta: detalleDeCarpeta?._id });


  // Estados para el diseño
  const [textInputs, setTextInputs] = useState([
    { id: 1, text: 'Precio', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 2, text: 'Whatsapp', fontFamily: 'Permanent Marker', fontSize: 14, color: '#000000', isActive: false },
    { id: 3, text: 'Facebook', fontFamily: 'Permanent Marker', fontSize: 14, color: '#000000', isActive: false },
    { id: 4, text: 'Fecha', fontFamily: 'Permanent Marker', fontSize: 12, color: '#000000', isActive: false },
    { id: 5, text: 'Numero1', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 6, text: 'Numero2', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 7, text: 'Numero3', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 8, text: 'Numero4', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 9, text: 'Numero5', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    // { id: 10, text: 'Raspa y gana', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 11, text: 'Par_guarani', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 12, text: 'Instantaneo', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 13, text: 'Figura_instantaneo', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
  ]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [idDisenioBoleto, setIdDisenioBoleto] = React.useState<string>("");
  // console.log('elements :>> ', elements);

  // Variables para el manejo de arrastre
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(5);
  const [widthQR, setWidthQR] = useState(180);
  // Cargar imagen predeterminada
  const loadDefaultImage = (configuracion: any = {}) => {
    // Puedes usar una URL externa o una ruta a una imagen local en tu proyecto
    // Por ejemplo: '/images/logo.png' o 'https://ejemplo.com/imagen.jpg'
    const url: string = '../../qr180.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Calcular dimensiones proporcionales
      // Usar dimensiones originales
      const newWidth = img.width;
      const newHeight = img.height;


      // Crear elemento de imagen
      const imageElement: ImageElement = {
        type: 'image',
        img: img,
        x: width - newWidth - 20, // Posicionada a la derecha
        y: 20, // Parte superior
        width: newWidth,
        height: newHeight,
        isDragging: false,
        isSelected: false,
        ...configuracion
      };

      // Agregar la imagen a los elementos
      setElements(prev => [...prev, imageElement]);
    };

    img.onerror = () => {
      console.error('Error al cargar la imagen predeterminada');
    };

    img.src = url;
  };

  // Inicializar el canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas: any = canvasRef.current;
      // Establecer crossOrigin para permitir imágenes de otros dominios
      canvas.crossOrigin = 'anonymous';
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (context) {
        // Intentar establecer propiedades de imagen segura
        (context as any).imageSmoothingEnabled = true;
      }

      setCtx(context);

      // Añadir los textos predefinidos al canvas
      setTimeout(() => {
        // Crear elementos de texto iniciales con posiciones distribuidas
        const initialElements: TextElement[] = [
          {
            type: 'text',
            text: 'Precio',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 25,
            y: 50,
            isDragging: false,
            isSelected: false,
            textId: 1
          },
          {
            type: 'text',
            text: 'Whatsapp',
            fontFamily: 'Permanent Marker',
            fontSize: 14,
            color: '#000000',
            x: 25,
            y: 100,
            isDragging: false,
            isSelected: false,
            textId: 2
          },
          {
            type: 'text',
            text: 'Facebook',
            fontFamily: 'Permanent Marker',
            fontSize: 14,
            color: '#000000',
            x: 25,
            y: 120,
            isDragging: false,
            isSelected: false,
            textId: 3
          },
          {
            type: 'text',
            text: 'Fecha',
            fontFamily: 'Permanent Marker',
            fontSize: 12,
            color: '#000000',
            x: 25,
            y: 150,
            isDragging: false,
            isSelected: false,
            textId: 4
          },
          {
            type: 'text',
            text: 'Numero1',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 25,
            y: 200,
            isDragging: false,
            isSelected: false,
            textId: 5
          },
          {
            type: 'text',
            text: 'Numero2',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 25,
            y: 230,
            isDragging: false,
            isSelected: false,
            textId: 6
          },
          {
            type: 'text',
            text: 'Numero3',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 25,
            y: 260,
            isDragging: false,
            isSelected: false,
            textId: 7
          },
          {
            type: 'text',
            text: 'Numero4',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 25,
            y: 290,
            isDragging: false,
            isSelected: false,
            textId: 8
          },
          {
            type: 'text',
            text: 'Numero5',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 25,
            y: 320,
            isDragging: false,
            isSelected: false,
            textId: 9
          },
          // {
          //   type: 'text',
          //   text: 'Raspa y gana',
          //   fontFamily: 'Permanent Marker',
          //   fontSize: 24,
          //   color: '#000000',
          //   x: width / 2,
          //   y: 320,
          //   isDragging: false,
          //   isSelected: false,
          //   textId: 10
          // }
          {
            type: 'text',
            text: 'Par_guarani',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: width / 2,
            y: height - 100,
            isDragging: false,
            isSelected: false,
            textId: 11
          },
          {
            type: 'text',
            text: 'Instantaneo',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: width / 2,
            y: height - 75,
            isDragging: false,
            isSelected: false,
            textId: 12
          },
          {
            type: 'text',
            text: 'Figura_instantaneo',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: width / 2,
            y: height - 50,
            isDragging: false,
            isSelected: false,
            textId: 13
          },
        ];
        if (idDisenioBoleto) {
          const findDisenio = disenioBoleto.find((item: any) => item._id === idDisenioBoleto);
          if (findDisenio) {
            const elementsMap = initialElements.map((element: any) => {
              const findText = (findDisenio?.textos || []).find((t: any) => t.texto === element.text);
              return {
                ...element,
                ...findText,
              };
            });
            // ESTABLECEMOS LAS POSICIONES X Y Y DE LOS ELEMENTOS SEGUN EL DISENIO GUARDADO:
            const imagenQR = (findDisenio.imagenes[0] || {});
            loadDefaultImage({
              ...imagenQR,
            });
            setWidthQR(imagenQR?.width || imagenQR?.height || 180);
            setElements(elementsMap);

            // ESTABLECECEMOS FILAS Y COLUMNAS Y TAMAÑO DEL CANVAS SEGUN EL DISENIO GUARDADO:
            setColumns(findDisenio?.configuracionDelBoleto?.columns);
            dispatch(setWidthBoleto(1023 / findDisenio?.configuracionDelBoleto?.columns));

            setRows(findDisenio?.configuracionDelBoleto?.rows);
            dispatch(setHeightBoleto(1705 / findDisenio?.configuracionDelBoleto?.rows));

            // ESTABLECEMOS EL TAMAÑO Y COLORES DE LOS TEXTOS:
            setTextInputs((prev: any) => {
              return prev.map((element: any) => {
                const findText = (findDisenio?.textos || []).find((t: any) => t.texto === element.text);
                return {
                  ...element,
                  ...findText,
                };
              });
            });

            // CARGAMOS LA IMAGEN DE FONDO SI EL DISENIO LA TIENE:
            // Puedes usar una URL externa o una ruta a una imagen local en tu proyecto
            // Por ejemplo: '/images/logo.png' o 'https://ejemplo.com/imagen.jpg'
            const url: string = findDisenio?.urlBackgroundImage;
            fetch(url)
              .then(res => res.blob())
              .then(blob => {
                const reader = new FileReader();

                reader.onload = (e) => {
                  const img = new Image();
                  img.crossOrigin = 'anonymous';

                  img.onload = () => {
                    setBackgroundImage(img);
                  };

                  img.src = e.target?.result as string;
                };

                reader.readAsDataURL(blob);
              });


          } else {
            message.error('No se encontró el diseño seleccionado');
          }
        } else {
          setElements(initialElements);
          // Cargar la imagen predeterminada
          loadDefaultImage();
        }

      }, 100);
    }
  }, [/* width, height */idDisenioBoleto]);

  // Redimensionar el canvas cuando cambien width/height SIN reubicar los elementos
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    // Ajustar tamaño del canvas (esto limpia el contenido)
    canvas.width = width;
    canvas.height = height;
    // Reobtener y configurar el contexto
    const context = canvas.getContext('2d');
    if (context) {
      (context as any).imageSmoothingEnabled = true;
    }
    setCtx(context);
    // Redibujar con los elementos en sus coordenadas originales
    // No importa si algo queda cortado, se mantiene la posición absoluta
    setTimeout(() => drawCanvas(), 0);
  }, [width, height]);

  // Actualizar el canvas cuando cambia el color de fondo o los elementos
  useEffect(() => {
    if (backgroundImage) {
      drawCanvas();
    }
  }, [backgroundImage]);

  // Efecto para redibujar cuando cambian los elementos
  useEffect(() => {
    drawCanvas();
  }, [elements]);

  // Función para dibujar el canvas
  const drawCanvas = () => {
    if (!ctx || !canvasRef.current) return;

    // Imprimir para depuración
    console.log('Dibujando canvas con', elements.length, 'elementos');

    // Limpiar el canvas
    ctx.clearRect(0, 0, width, height);
    console.log('backgroundImage :>> ', backgroundImage);
    // Dibujar el fondo
    if (backgroundImage/*  && backgroundImage.complete */) {
      // Dibujar la imagen de fondo ajustada al tamaño del canvas
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      // Si no hay imagen de fondo, usar el color de fondo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Dibujar un borde para el canvas
    ctx.strokeStyle = '#d9d9d9';
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Dibujar cada elemento
    elements.forEach(element => {
      if (element.type === 'text') {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.fillText(element.text, element.x, element.y);

        // Dibujar borde si está seleccionado
        if (element.isSelected) {
          const metrics = ctx.measureText(element.text);
          const textHeight = element.fontSize;

          ctx.strokeStyle = '#39FF14';
          ctx.setLineDash([5, 3]); // 5px línea, 3px espacio
          ctx.lineWidth = 3;
          ctx.strokeRect(
            element.x - 5,
            element.y - textHeight,
            metrics.width + 10,
            textHeight + 10
          );
        }
      } else if (element.type === 'image') {
        try {
          if (element.img && element.img.complete && element.img.naturalWidth !== 0) {
            // Guardar el estado actual del contexto
            ctx.save();

            try {
              // Intentar dibujar la imagen
              ctx.drawImage(element.img, element.x, element.y, element.width, element.height);
              console.log('Imagen dibujada correctamente:', element.x, element.y);
            } catch (drawError) {
              console.error('Error al dibujar imagen (CORS?):', drawError);
              // Si falla, dibujar un rectángulo rojo para indicar error
              ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
              ctx.fillRect(element.x, element.y, element.width, element.height);
              ctx.strokeStyle = 'red';
              ctx.strokeRect(element.x, element.y, element.width, element.height);
              ctx.fillStyle = 'red';
              ctx.font = '12px Arial';
              ctx.fillText('Error: Imagen no disponible', element.x + 5, element.y + element.height / 2);
            }

            // Restaurar el estado del contexto
            ctx.restore();
          } else {
            console.warn('La imagen no está completa o no existe');
            // Dibujar un placeholder para la imagen
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(element.x, element.y, element.width, element.height);
            ctx.strokeStyle = '#d9d9d9';
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            ctx.fillStyle = '#999';
            ctx.font = '14px Arial';
            ctx.fillText('Cargando imagen...', element.x + 10, element.y + element.height / 2);

            // Intentar recargar la imagen
            if (!element.img.complete) {
              console.log('Intentando recargar la imagen...');
              // Forzar redibujado en unos segundos
              setTimeout(() => drawCanvas(), 500);
            }
          }
        } catch (error) {
          console.error('Error general al dibujar imagen:', error);
        }

        // Dibujar borde si está seleccionado
        if (element.isSelected) {
          // Dibujar borde de selección
          ctx.strokeStyle = '#39FF14';
          ctx.setLineDash([5, 3]); // 5px línea, 3px espacio
          ctx.lineWidth = 3;
          ctx.strokeRect(
            element.x - 2,
            element.y - 2,
            element.width + 4,
            element.height + 4
          );

          // Mostrar indicación de arrastre
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(element.x + element.width - 75, element.y + element.height + 5, 70, 18);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 10px Arial';
          ctx.fillText('Arrastrar', element.x + element.width - 70, element.y + element.height + 18);
        }
      }
    });
  };

  // Función para actualizar un campo de texto
  const updateTextInput = (id: number, field: string, value: any) => {
    setTextInputs(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));

    // Si el campo actualizado es fontFamily, fontSize o color, actualizar también el texto en el canvas
    if (field === 'fontFamily' || field === 'fontSize' || field === 'color') {
      const existingElementIndex = elements.findIndex(
        el => el.type === 'text' && el.textId === id
      );

      if (existingElementIndex >= 0) {
        setElements(prev => prev.map((el, index) => {
          if (index === existingElementIndex) {
            return {
              ...el,
              [field]: value
            };
          }
          return el;
        }));
      }
    }
  };

  // Función para activar un campo de texto
  const setActiveText = (id: number) => {
    setActiveTextId(id);
    setTextInputs(prev => prev.map(item =>
      ({ ...item, isActive: item.id === id })
    ));
  };

  // Función para manejar la carga de imágenes como fondo
  const handleUpload: UploadProps['onChange'] = ({ fileList: newFileList, file }: any) => {
    setFileList(newFileList);
    // Verificar si hay un archivo y si es un archivo de imagen
    if (file) {
      // Mostrar mensaje de carga
      message.loading({ content: 'Cargando imagen de fondo...', key: 'imageUpload', duration: 0 });

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Crear una nueva imagen
          const img = new Image();
          // Establecer crossOrigin antes de asignar src
          img.crossOrigin = 'anonymous';
          console.log('Creando imagen con crossOrigin:', img.crossOrigin);

          img.onload = () => {
            // Establecer la imagen como fondo
            setBackgroundImage(img);
            // Forzar redibujado del canvas
            setTimeout(() => {
              message.success({ content: 'Imagen de fondo cargada correctamente', key: 'imageUpload' });
              console.log('Imagen de fondo cargada y dibujada en el canvas');
            }, 100);
          };

          img.onerror = (err) => {
            console.error('Error al cargar la imagen:', err);
            message.error({ content: 'Error al cargar la imagen', key: 'imageUpload' });
          };

          // Asignar la fuente de la imagen
          img.src = e.target.result as string;
        }
      };

      // Leer el archivo como URL de datos
      reader.readAsDataURL(file);

      // Manejar errores de lectura
      reader.onerror = () => {
        message.error({ content: 'Error al leer el archivo', key: 'imageUpload' });
      };
    } else {
      message.error({ content: 'Por favor, sube un archivo de imagen válido', key: 'imageUpload' });
    }
  };



  // Función para guardar el diseño
  const handleSaveDesign = () => {
    if (canvasRef.current) {
      try {
        // Desseleccionar todos los elementos antes de guardar
        setElements(prev => prev.map(el => ({ ...el, isSelected: false })));

        // Forzar un redibujado antes de guardar
        drawCanvas();

        // Pequeña pausa para asegurar que todo esté dibujado
        setTimeout(() => {
          const dataUrl = canvasRef.current!.toDataURL('image/png');
          console.log('Imagen generada correctamente');

          // Recopilar datos de los textos
          const textosData = elements
            .filter(el => el.type === 'text')
            .map(el => {
              const textEl = el as TextElement;
              return {
                id: textEl.textId || 0,
                texto: textEl.text,
                fontFamily: textEl.fontFamily,
                fontSize: textEl.fontSize,
                color: textEl.color,
                x: textEl.x,
                y: textEl.y
              };
            });

          // Recopilar datos de las imágenes
          const imagenesData = elements
            .filter(el => el.type === 'image')
            .map(el => {
              const imgEl = el as ImageElement;
              return {
                url: imgEl.img.src,
                x: imgEl.x,
                y: imgEl.y,
                width: imgEl.width,
                height: imgEl.height
              };
            });

          // Crear objeto con todos los datos del boleto
          const boletoData: BoletoGuardadoData = {
            imageBase64: dataUrl,
            textos: textosData,
            imagenes: imagenesData,
            backgroundColor: backgroundColor,
            backgroundImageUrl: backgroundImage?.src,
            configuracionDelBoleto: {
              columns,
              rows
            }
          };
          console.log('boletoData :>> ', boletoData);

          if (onSave) {
            onSave(dataUrl, boletoData);
          }

          // Mostrar información en consola para depuración
          // console.log('Datos del boleto guardado:', boletoData);

          setPreviewImage(dataUrl);
          // setPreviewVisible(true);
        }, 100);
      } catch (error) {
        console.error('Error al guardar el diseño:', error);
        message.error('Error al guardar el diseño');
      }
    }
  };

  // Función para descargar la imagen
  const handleDownload = () => {
    if (canvasRef.current) {
      // Desseleccionar todos los elementos antes de descargar
      setElements(prev => prev.map(el => ({ ...el, isSelected: false })));
      setTimeout(() => {
        if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `boleto-${new Date().getTime()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, 100);
    }
  };

  // Función para manejar el inicio del arrastre (sin redimensionamiento)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !ctx) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ya no verificamos el redimensionamiento para las imágenes

    // Procedemos con la selección y arrastre normal
    // Desseleccionar todos los elementos
    setElements(prev => prev.map(el => ({ ...el, isSelected: false })));
    setSelectedElement(null);

    // Verificar si se hizo clic en algún elemento (en orden inverso para seleccionar el elemento superior)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];

      if (el.type === 'text') {
        const metrics = ctx.measureText(el.text);
        const textHeight = el.fontSize;

        if (
          x >= el.x &&
          x <= el.x + metrics.width &&
          y >= el.y - textHeight &&
          y <= el.y
        ) {
          // Seleccionar y preparar para arrastrar
          const newElements = [...elements];
          newElements[i] = { ...el, isSelected: true, isDragging: true };
          setElements(newElements);
          setSelectedElement(newElements[i]);
          setIsDragging(true);
          setStartX(x - el.x);
          setStartY(el.y - y);
          break;
        }
      } else if (el.type === 'image') {
        if (
          x >= el.x &&
          x <= el.x + el.width &&
          y >= el.y &&
          y <= el.y + el.height
        ) {
          // Seleccionar y preparar para arrastrar
          const newElements = [...elements];
          newElements[i] = { ...el, isSelected: true, isDragging: true };
          setElements(newElements);
          setSelectedElement(newElements[i]);
          setIsDragging(true);
          setStartX(x - el.x);
          setStartY(y - el.y);
          break;
        }
      }
    }
  };

  // Función para manejar el movimiento durante el arrastre (sin redimensionamiento)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Si estamos arrastrando
    if (isDragging) {
      // Actualizar la posición del elemento que se está arrastrando
      setElements(prev => prev.map(el => {
        if (el.isDragging) {
          return {
            ...el,
            x: x - startX,
            y: el.type === 'text' ? y + startY : y - startY
          };
        }
        return el;
      }));
    }
  };

  // Función para manejar el fin del arrastre
  const handleMouseUp = () => {
    if (isDragging) {
      // Detener el arrastre
      setElements(prev => prev.map(el => ({ ...el, isDragging: false })));
      setIsDragging(false);
    }

    // Restaurar el cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  // Función para manejar la salida del mouse del canvas
  const handleMouseOut = () => {
    handleMouseUp();
  };

  // Función para manejar el cambio de color de fondo
  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value);
    // Forzar redibujado del canvas con el nuevo color de fondo
    setTimeout(() => drawCanvas(), 50);
  };

  return (
    <div className="boleto-designer-puro">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {/* Panel de herramientas */}
            <Col xs={24} md={12} lg={12} xl={12} xxl={12}>
              <Collapse
                size="small"
                style={{
                  marginBottom: "1rem",
                }}
                items={[{
                  key: '1',
                  label: 'Seleccione diseño de boleto',
                  children: (
                    <List
                      size="small"
                      style={{
                        maxHeight: 400,
                        overflow: 'auto',
                      }}
                      dataSource={disenioBoleto || []}
                      renderItem={(item: any) => (
                        <List.Item
                          style={{ padding: "0.5rem 0rem" }}
                          actions={[
                            <Radio
                              checked={idDisenioBoleto === item._id}
                              onChange={() => {
                                setIdDisenioBoleto(item._id);
                              }}
                            />,
                            // <Tooltip title="Eliminar diseño">
                            //   <Popconfirm
                            //     title="Eliminar diseño"
                            //     description="Desea eliminar el diseño ?"
                            //     okText="Sí, eliminar"
                            //     cancelText="No, eliminar"
                            //     onConfirm={async () => {
                            //       // await eliminarDisenioBoleto({ _idBoleto: item._id }).unwrap();
                            //       refetch();
                            //     }}
                            //     onCancel={async () => {

                            //     }}
                            //     onOpenChange={() => console.log('open change')}
                            //   >
                            //     <Button shape="circle" icon={<DeleteOutlined />} danger />
                            //   </Popconfirm>
                            // </Tooltip>
                          ]}>
                          <List.Item.Meta
                            avatar={<Avatar
                              shape="square"
                              size={54}
                              src={(
                                <ImageAnt
                                  width="100%"
                                  height="100%"
                                  src={item?.urlImagen}
                                />
                              )} />}
                            title={`${item?.configuracionDelBoleto?.columns} X ${item?.configuracionDelBoleto?.rows}`}
                            description={`${item?.configuracionDelBoleto?.columns} columnas por ${item?.configuracionDelBoleto?.rows} filas`}
                          />
                        </List.Item>
                      )}
                    />
                  )
                }]}
              />
              <Card
                title="Textos del diseño"
                size="small"
                style={{ borderRadius: '8px', marginTop: '0.5rem' }}
                extra={(
                  Boolean(previewDesign) ? <ANTD.Tooltip title="Ver diseño">
                    <ANTD.Image
                      width={32}
                      src={previewDesign}
                    />
                  </ANTD.Tooltip> : null
                )}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {/* Sección de textos configurables */}
                  <div>
                    <Table
                      dataSource={textInputs}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      rowClassName={(record: any) => record.isActive ? 'active-row' : ''}
                      onRow={(record: any) => ({
                        onClick: () => setActiveText(record.id),
                        style: {
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundColor: record.isActive ? '#e6f7ff' : 'transparent',
                          borderLeft: record.isActive ? '3px solid #1890ff' : '3px solid transparent'
                        }
                      })}
                      columns={[
                        {
                          title: 'Texto',
                          dataIndex: 'text',
                          key: 'text',
                          width: '20%',
                          render: (text: string) => <strong>{text}</strong>
                        },
                        {
                          title: 'Fuente',
                          dataIndex: 'fontFamily',
                          key: 'fontFamily',
                          width: '30%',
                          render: (font: string, record: any) => (
                            <Select
                              style={{
                                width: '100%',
                                borderColor: record.isActive ? '#1890ff' : '#d9d9d9',
                                transition: 'all 0.3s ease'
                              }}
                              value={font}
                              onChange={(value) => updateTextInput(record.id, 'fontFamily', value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {fontOptions.map(option => (
                                <Option key={option.value} value={option.value} style={{ fontFamily: option.value }}>
                                  {option.label}
                                </Option>
                              ))}
                            </Select>
                          )
                        },
                        {
                          title: 'Tamaño',
                          dataIndex: 'fontSize',
                          key: 'fontSize',
                          width: '20%',
                          render: (size: number, record: any) => (
                            <Select
                              style={{
                                width: '100%',
                                borderColor: record.isActive ? '#1890ff' : '#d9d9d9',
                                transition: 'all 0.3s ease'
                              }}
                              value={size}
                              onChange={(value) => updateTextInput(record.id, 'fontSize', value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {fontSizeOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                  {option.label}
                                </Option>
                              ))}
                            </Select>
                          )
                        },
                        {
                          title: 'Color',
                          dataIndex: 'color',
                          key: 'color',
                          width: '30%',
                          render: (color: string, record: any) => (
                            <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              <ColorPicker
                                value={color}
                                onChange={(value) => updateTextInput(record.id, 'color', value.toHexString())}
                              />
                            </div>
                          )
                        }
                      ]}
                      scroll={{
                        x: 425,
                      }}
                    />
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  {/* Sección de imágenes */}
                  <div style={{ width: '100%' }}>
                    <Upload
                      accept="image/*"
                      fileList={fileList}
                      onChange={handleUpload}
                      beforeUpload={() => false}
                      maxCount={1}
                      style={{ width: '100%' }}
                      showUploadList={false}
                    >
                      <Button
                        block
                        icon={<UploadOutlined />}
                        style={{
                          width: '100%',
                          marginBottom: '8px',
                          transition: 'all 0.3s ease',
                          color: '#1890ff'
                        }}
                        className="upload-button-hover"
                      >
                        <strong>Subir Imagen de Fondo</strong>
                      </Button>
                    </Upload>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  {/* Sección de acciones */}
                  <div>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {/* <Button
                        type="dashed"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          if (canvasRef.current) {
                            setPreviewImage(canvasRef.current.toDataURL('image/png'));
                            setPreviewVisible(true);
                          }
                        }}
                        style={{
                          width: '100%',
                          marginBottom: '8px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <strong>Vista Previa</strong>
                      </Button> */}
                      <Button
                        type="primary"
                        loading={loading}
                        icon={<SaveOutlined />}
                        onClick={handleSaveDesign}
                        style={{ width: '100%' }}
                      >
                        <strong>Guardar diseño</strong>
                      </Button>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Canvas */}
            <Col xs={24} md={12} lg={12} xl={12} xxl={12}>

              <fieldset style={{ border: "1px solid #d9d9d9", padding: "1rem", borderRadius: 8 }}>
                <legend style={{ padding: "0 10px" }}>Tamaño del QR {elements.find((element: any) => element.type === 'image')?.width}</legend>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* <span>test</span> */}
                  <Slider style={{ flex: 1 }} min={90} max={270} value={widthQR} /* defaultValue={180} */ step={10} onChange={(value) => {
                    const findElement: any = elements.find((element: any) => element.type === 'image');
                    if (findElement) {
                      findElement.width = value;
                      findElement.height = value;
                    }
                    setElements((prev: any) => {
                      const textos = prev.filter((element: any) => element.type !== 'image');
                      return [...textos, findElement];
                    });

                    setWidthQR(value);
                  }} />
                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid #d9d9d9", padding: "1rem", borderRadius: 8 }}>
                <legend style={{ padding: "0 10px" }}>Configuración del boleto</legend>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span>Columnas</span>
                  <Slider
                    style={{ flex: 1 }}
                    min={2}
                    max={6}
                    value={columns}
                    defaultValue={3}
                    onChange={(columns) => {
                      setColumns(columns);
                      dispatch(setWidthBoleto(1023 / columns));
                    }}
                    marks={{
                      2: "2",
                      3: "3",
                      4: "4",
                      5: "5",
                      6: "6",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span>Filas</span>
                  <Slider
                    style={{ flex: 1 }}
                    min={3}
                    max={9}
                    value={rows}
                    defaultValue={5}
                    onChange={(rows) => {
                      setRows(rows);
                      dispatch(setHeightBoleto(1705 / rows));
                    }}
                    marks={{
                      3: "3",
                      4: "4",
                      5: "5",
                      6: "6",
                      7: "7",
                      8: "8",
                      9: "9",
                    }}
                  />
                </div>
              </fieldset>


              <div
                ref={containerRef}
                className="canvas-container"
                style={{
                  minHeight: '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseOut={handleMouseOut}
                    style={{
                      cursor: isDragging ? 'grabbing' : 'default',
                      border: '1px solid #f0f0f0',
                      backgroundColor: backgroundColor
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Text type="secondary">
                  Haz clic en un elemento para seleccionarlo. Arrastra para mover elementos.
                </Text>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal para vista previa */}
      <Modal
        title="Vista Previa del Boleto"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        className="preview-modal"
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            Descargar
          </Button>
        ]}
      >
        {previewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={previewImage}
              alt="Vista previa del boleto"
              className="preview-image"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BoletoDesignerPuro;
