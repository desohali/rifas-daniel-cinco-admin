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
  Table
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
import * as ANTD from 'antd';

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


const BoletoDesignerQR: React.FC<BoletoDesignerPuroProps> = ({
  onSave,
  width = 300,
  height = 600,
  loading = false,
  previewDesign = ""
}) => {
  // Referencias y estados
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Estados para el diseño
  const [textInputs, setTextInputs] = useState([
    { id: 4, text: 'Fecha', fontFamily: 'Permanent Marker', fontSize: 12, color: '#000000', isActive: false },
    { id: 5, text: 'Numero1', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 6, text: 'Numero2', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 7, text: 'Numero3', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 8, text: 'Numero4', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 9, text: 'Numero5', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
    { id: 10, text: 'Jugar', fontFamily: 'Permanent Marker', fontSize: 24, color: '#000000', isActive: false },
  ]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Variables para el manejo de arrastre
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // Cargar imagen predeterminada
  const loadDefaultImage = () => {
    // Puedes usar una URL externa o una ruta a una imagen local en tu proyecto
    // Por ejemplo: '/images/logo.png' o 'https://ejemplo.com/imagen.jpg'
    const defaultImageUrl = '../../qr180.png'; // Imagen aleatoria de Lorem Picsum (tamaño 200x100)

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Calcular dimensiones proporcionales
      // Usar dimensiones originales
      const newWidth = img.width;
      const newHeight = img.height;
      /* let newWidth = img.width;
      let newHeight = img.height;

      if (newWidth > width / 3) {
        const ratio = width / 3 / newWidth;
        newWidth = width / 3;
        newHeight = img.height * ratio;
      } */

      // Crear elemento de imagen
      const imageElement: ImageElement = {
        type: 'image',
        img: img,
        x: width - newWidth - 20, // Posicionada a la derecha
        y: 20, // Parte superior
        width: newWidth,
        height: newHeight,
        isDragging: false,
        isSelected: false
      };

      // Agregar la imagen a los elementos
      setElements(prev => [...prev, imageElement]);
    };

    img.onerror = () => {
      console.error('Error al cargar la imagen predeterminada');
    };

    img.src = defaultImageUrl;
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
            text: 'Fecha',
            fontFamily: 'Permanent Marker',
            fontSize: 12,
            color: '#000000',
            x: 105,
            y: 50,
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
            x: 105,
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
            x: 105,
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
            x: 105,
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
            x: 105,
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
            x: 105,
            y: 320,
            isDragging: false,
            isSelected: false,
            textId: 9
          },
          {
            type: 'text',
            text: 'JUGAR',
            fontFamily: 'Permanent Marker',
            fontSize: 24,
            color: '#000000',
            x: 105,
            y: 450,
            isDragging: false,
            isSelected: false,
            textId: 10
          }
        ];

        setElements(initialElements);

        // Cargar la imagen predeterminada
        // loadDefaultImage();
      }, 100);
    }
  }, []);

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

  // Función para agregar o actualizar texto
  const handleAddText = (textId: number) => {
    const textInput = textInputs.find(t => t.id === textId);
    if (textInput && textInput.text && ctx) {
      // Verificar si ya existe un elemento con este textId
      const existingElementIndex = elements.findIndex(
        el => el.type === 'text' && el.textId === textId
      );

      const newElement: TextElement = {
        type: 'text',
        text: textInput.text,
        fontFamily: textInput.fontFamily,
        fontSize: textInput.fontSize,
        color: textInput.color,
        x: existingElementIndex >= 0 ? elements[existingElementIndex].x : 50,
        y: existingElementIndex >= 0 ? elements[existingElementIndex].y : 50 + textInput.fontSize,
        isDragging: false,
        isSelected: false,
        textId: textId // Guardar el ID del texto
      };

      if (existingElementIndex >= 0) {
        // Reemplazar el elemento existente
        setElements(prev => [
          ...prev.slice(0, existingElementIndex),
          newElement,
          ...prev.slice(existingElementIndex + 1)
        ]);
        message.success(`Texto ${textId} actualizado`);
      } else {
        // Agregar nuevo elemento
        setElements(prev => [...prev, newElement]);
        message.success(`Texto ${textId} agregado`);
      }

      // No limpiamos el texto para permitir modificaciones
    }
  };

  // Función para actualizar un texto existente en el canvas
  const updateExistingText = (textId: number) => {
    const textInput = textInputs.find(t => t.id === textId);
    if (!textInput) return;

    const existingElementIndex = elements.findIndex(
      el => el.type === 'text' && el.textId === textId
    );

    if (existingElementIndex >= 0 && textInput.text) {
      setElements(prev => prev.map((el, index) => {
        if (index === existingElementIndex) {
          return {
            ...el,
            text: textInput.text,
            fontFamily: textInput.fontFamily,
            fontSize: textInput.fontSize,
            color: textInput.color
          };
        }
        return el;
      }));
    }
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

  // Función para eliminar el elemento seleccionado
  const handleDeleteSelected = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el !== selectedElement));
      setSelectedElement(null);
    }
  };

  // Función para eliminar el último elemento
  const handleDeleteLast = () => {
    if (elements.length > 0) {
      setElements(prev => prev.slice(0, -1));
      if (selectedElement === elements[elements.length - 1]) {
        setSelectedElement(null);
      }
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
            backgroundImageUrl: backgroundImage?.src
          };

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
              <Card
                title="Textos del diseño"
                size="small"
                style={{ borderRadius: '8px' }}
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
                        loading={loading}
                        type="primary"
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

export default BoletoDesignerQR;
