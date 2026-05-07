"use client";
import React from 'react';
import swal from 'sweetalert';
import { useDispatch, useSelector } from 'react-redux';
import { useEliminarDisenioBoletoMutation, useListarDisenioBoletoQuery, useRegistrarRifaMutation } from '@/services/userApi';
import { setIsRifa, setOpenFormRifa } from '@/features/adminSlice';
import { Button, Col, Collapse, Drawer, Flex, Form, Input, InputNumber, List, Row, Select, Slider, Tag, Upload, Avatar, Image as ImageAnt, Radio, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { base64ToBlob, blobToFile, loadImage } from '@/helpers/canvas'
import { useParams } from 'next/navigation';
import { isNaN } from 'formik';
import { subirImagen } from '@/utils/storage';

var canvas: any;// = document.getElementById("canvasPerfil");
var ctx: any;// = canvas.getContext("2d");

function resizeImage(img: any, { width = 300, height = 300 }: any) {

  const sizeCanvas = width;

  let positionX = 0;
  let positionY = 0;

  const newImg = new Image();
  newImg.src = window.URL.createObjectURL(img);
  newImg.addEventListener("load", function () {
    width = canvas.width;
    height = ((this.height * width) / this.width);

    positionX = 0;
    positionY = (height < sizeCanvas) ? ((sizeCanvas - height) / 2) : 0;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this, positionX, positionY, width, height);
    window.URL.revokeObjectURL(this.src);

  }, false);
};

const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);

const uploadImageRifa = async (imagenFile: string, idRifa: string) => {
  const formData = new FormData();
  formData.append("imagen", imagenFile);
  formData.append("idRifa", idRifa);

  const response = await fetch(`https://apis.desohali.com/juegoDeRifas/uploadImageRifa`, {
    method: "post",
    body: formData
  });

  return await response.json();
}

const FormRifa: React.FC<{ formRifa: any }> = ({ formRifa }) => {

  const dispatch = useDispatch();
  const params = useParams();
  const { openFormRifa, listaDeRifas = [], rifaDetalles = null } = useSelector((state: any) => state.admin);
  const [imagenRifa, setImagenRifa] = React.useState("");
  const [oportunidades, setOportunidades] = React.useState<Number>();
  const [digitos, setDigitos] = React.useState<Number>();
  const [idDisenioBoleto, setIdDisenioBoleto] = React.useState<string>("");
  const [lastRifa] = listaDeRifas;

  const existeIdRifa = Boolean(formRifa.getFieldValue("_id"));

  const style: React.CSSProperties = { width: '100%' };
  const [registrarRifa, { data, error, isLoading }] = useRegistrarRifaMutation();
  const { data: disenioBoleto = [], refetch } = useListarDisenioBoletoQuery({ _idCarpeta: params?._idCarpeta });
  const [eliminarDisenioBoleto] = useEliminarDisenioBoletoMutation();


  const [fechaMinima, setFechaMinima] = React.useState('');
  React.useEffect(() => {
    setFechaMinima(new Date().toISOString().split('T')[0]);
  }, []);

  React.useEffect(() => {
    if (rifaDetalles) {
      setIdDisenioBoleto(rifaDetalles._idDisenioBoleto._id);
    }

    return () => {
      setIdDisenioBoleto("");
    }
  }, [rifaDetalles]);

  React.useEffect(() => {
    canvas = document.getElementById("canvasBoleto");
    ctx = canvas.getContext("2d");
  }, []);

  //////////////////////////////////////////////////
  function drawRays(color: any) {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const numRays = 50;
    const angleIncrement = (2 * Math.PI) / numRays;
    const extendedLength = Math.sqrt(width * width + height * height); // Longitud extendida para salir del canvas

    // Limpiar el canvas antes de dibujar
    ctx.clearRect(0, 0, width, height);

    // Dibujar un fondo radial
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, extendedLength / 2);
    radialGradient.addColorStop(0, 'white');
    radialGradient.addColorStop(1, color);
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, width, height);

    // Dibujar los rayos
    for (let i = 0; i < numRays; i++) {
      const angle = i * angleIncrement;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * extendedLength, centerY + Math.sin(angle) * extendedLength);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  };

  const [fileList, setFileList] = React.useState<any[]>([]);

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    /* setPreviewImage(file.url || file.preview);
    setPreviewVisible(true); */
  };

  const handleUpload = async (_idCarpeta: string = "", scale = 0.25) => {

    if (!fileList.length) return;

    canvas = document.getElementById('uploadResizer');
    ctx = canvas.getContext('2d');

    let arrayImages: any[] = [];

    const loadImages: any[] = [];
    fileList.forEach(async (file: any) => {
      loadImages.push(loadImage(file?.originFileObj));
    });

    const responsePromises = await Promise.all(loadImages);
    responsePromises.forEach(({ image, file }: any) => {
      canvas.width = (image.width * scale);
      canvas.height = (image.height * scale);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imagenBase64 = canvas.toDataURL(file.type, 1);
      const imagenBlob = base64ToBlob(imagenBase64, file.type);
      const imagenFile = blobToFile(imagenBlob, file.name)
      arrayImages.push(imagenFile);
    });

    // find fondo del sorteo
    const formData = new FormData();
    formData.append('_idCarpeta', _idCarpeta || '');
    const findFondo: any = fileList.find(({ originFileObj }: any) => originFileObj.name == "fondo.jpeg");
    if (findFondo) {
      arrayImages.filter((file: any) => file.name != "fondo.jpeg");
      arrayImages.push(findFondo?.originFileObj);
    }

    arrayImages.forEach((file: any, index) => {
      formData.append(`imagen${index}`, file); // Agrega cada archivo al FormData
    });

    try {
      const response = await fetch(`https://desohali.com/juegoDeRifasMichael/uploadImages`, {
        method: "post",
        body: formData,
      });

      await response.json();
      setFileList([]);
    } catch (error) {
      console.log('error', error)
    } finally {
      /* setUploading(false); */
    }

  };

  const handleChange = ({ fileList: newFileList }: any) => {
    // Limita la cantidad de archivos a 8
    setFileList(newFileList.slice(-1));
  };

  // Handle change for sigue participando
  const handlePreviewSigueParticipando = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
  };

  const handleChangeSigueParticipando = ({ fileList: newFileList }: any) => {
    // Limita la cantidad de archivos a 8
    setFileList(newFileList);
  };

  const [uploading, setUploading] = React.useState<boolean>(false);

  const handleUploadImagenBGBoleto = async (_idCarpeta: string = "", scale = 0.5) => {

    if (!fileList.length) return [];
    setUploading(true);

    canvas = document.getElementById('uploadResizer');
    ctx = canvas.getContext('2d');

    let arrayImages: any[] = [];

    const loadImages: any[] = [];
    fileList.forEach(async (file: any) => {
      loadImages.push(loadImage(file?.originFileObj));
    });

    const responsePromises = await Promise.all(loadImages);
    responsePromises.forEach(({ image, file }: any) => {
      canvas.width = (image.width * scale);
      canvas.height = (image.height * scale);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imagenBase64 = canvas.toDataURL(file.type, 1);
      const imagenBlob = base64ToBlob(imagenBase64, file.type);
      const imagenFile = blobToFile(imagenBlob, file.name)
      arrayImages.push(imagenFile);
    });

    try {

      const response = await Promise.all(arrayImages.map((file: any) => subirImagen(_idCarpeta, file)));
      setFileList([]);
      setUploading(false);
      const sigueParticipando = response.map((url: string, index: number) => ({
        nombre: fileList[index].name || fileList[index].originFileObj?.name,
        valor: (fileList[index].name || fileList[index].originFileObj?.name).trim().replace(/\s+/g, '_'),
        urlFB: url,
        premio: fileList[index].premio || 0
      }));

      return sigueParticipando;

    } catch (error) {
      console.log('error', error);
      setUploading(false);
      return [];
    }

  };



  return (
    <>
      <Drawer
        title={`${existeIdRifa ? 'Actualizar' : 'Registrar'} rifa`}
        width={500}
        onClose={() => dispatch(setOpenFormRifa(false))}
        open={openFormRifa}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <Form
          form={formRifa}
          name="login-form"
          layout="vertical"
          style={{ width: "100%" }}
          requiredMark={customizeRequiredMark}
          initialValues={{
            _id: "",
            nombre: "",
            imagen: "",
            fecha: new Date().toLocaleDateString().split("/").reverse().map((value: string) => value.padStart(2, "0")).join("-"),
            ganador: undefined,
            premio: undefined,
            descripcion: "",
            color: "",
            whatsapp: !existeIdRifa ? lastRifa?.whatsapp : "",
            facebook: !existeIdRifa ? lastRifa?.facebook : "",
            cantidadBoletos: 500,
            emojis: "",
            digitos: "4"
          }}
          onFinish={async (values) => {

            if (!idDisenioBoleto) return await swal("", "Seleccione diseño de boleto", "warning");

            const [imagenBGBoleto]: any[] = await handleUploadImagenBGBoleto(`temp/${uuidv4()}`, 0.5);
            // registramos la rifa
            const { data }: any = await registrarRifa({
              ...values,
              _idCarpeta: params?._idCarpeta,
              _idDisenioBoleto: idDisenioBoleto,
              imagen: imagenBGBoleto?.urlFB || rifaDetalles?.imagen || "",
            });

            if (!data) {
              swal("", "Error al registrar rifa!", "error");
              return;
            }

            if (data?.error) {
              swal("", `El número ${values.ganador} no es válido!`, "error");
              return;
            }

            setIdDisenioBoleto("");
            dispatch(setIsRifa(true));
            dispatch(setOpenFormRifa(false));
            setTimeout(() => { dispatch(setIsRifa(false)) }, 50);
            formRifa.resetFields();
            swal("", `Rifa ${existeIdRifa ? 'actualizada' : 'registrada'}!`, "success");
          }} >
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={24}>
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
                            <Tooltip title="Eliminar diseño">
                              <Popconfirm
                                title="Eliminar diseño"
                                description="Desea eliminar el diseño ?"
                                okText="Sí, eliminar"
                                cancelText="No, eliminar"
                                onConfirm={async () => {
                                  await eliminarDisenioBoleto({ _idBoleto: item._id }).unwrap();
                                  refetch();
                                }}
                                onCancel={async () => {

                                }}
                                onOpenChange={() => console.log('open change')}
                              >
                                <Button shape="circle" icon={<DeleteOutlined />} danger />
                              </Popconfirm>
                            </Tooltip>
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
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} sm={12} md={12} lg={12}>
              <canvas id='uploadResizer' style={{ display: "none" }}></canvas>

              <Form.Item
                name="_id"
                label="_id"
                style={{ display: "none" }}
              >
                <Input placeholder="_id" />
              </Form.Item>
              <Form.Item
                name="imagen"
                label="imagen"
                style={{ display: "none" }}
              >
                <Input placeholder="imagen" />
              </Form.Item>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[{ required: true, message: 'Por favor, ingrese nombre' }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>

            </Col>
            <Col xs={12} sm={12} md={12} lg={12}>
              <Form.Item
                name="fecha"
                label="Fecha"
                rules={[{ required: true, message: 'Por favor, ingrese fecha' }]}
              >
                <Input type='date' placeholder="Fecha" min={fechaMinima} style={style} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ganador"
                label="1N° ganador"
                rules={[
                  { required: true, message: 'Por favor, ingrese 1N° ganador' },
                  {
                    validator: (_, value) => {
                      if (value && value.toString().length == 4 && new RegExp("[0-9]{4}").test(value)) return Promise.resolve(true);
                      return Promise.reject("1N° ganador, debe tener 4 dígitos");
                    }
                  }
                ]}
              >
                <Input placeholder="1N° ganador" style={style} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="digitos"
                label="Dígitos"
                rules={[
                  { required: true, message: 'Por favor, Seleccione número de dígitos' },
                ]}
              >
                <Select disabled={existeIdRifa} onChange={(value) => setDigitos(value)}>
                  <Select.Option value="4">4 dígitos</Select.Option>
                  <Select.Option value="3">3 dígitos</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="premio"
                label="Premio"
                style={{ display: "none" }}
              >
                <InputNumber placeholder="Premio" style={style} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>

            <Col span={12}>
              <Form.Item
                name="oportunidades"
                label="Oportunidades"
                rules={[
                  { required: true, message: 'Por favor, Seleccione número de oportunidades' },
                ]}
              >
                <Select disabled={existeIdRifa} onChange={(value) => setOportunidades(value)}>
                  <Select.Option value="1">1 oportunidad</Select.Option>
                  <Select.Option value="2">2 oportunidades</Select.Option>
                  <Select.Option value="3">3 oportunidades</Select.Option>
                  <Select.Option value="4">4 oportunidades</Select.Option>
                  <Select.Option value="5">5 oportunidades</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="precio"
                label="Precio Boleto"
                rules={[{ required: true, message: 'Por favor, ingrese precio' }]}
              >
                <InputNumber placeholder="Precio " style={style} />
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={16}>

            <Col span={24}>
              <Form.Item
                name="cantidadBoletos"
                label="Cantidad Boletos"
                rules={[{ required: true, message: 'Por favor, marque cantidad boletos' }]}
              >
                <Slider
                  disabled={existeIdRifa}
                  min={100}
                  max={(() => {
                    if (digitos == 3) {
                      return ((oportunidades == 3 ? 999 : 1000) / Number(oportunidades))
                    } else {
                      return ((oportunidades == 3 ? 9999 : 10000) / Number(oportunidades))
                    }
                  })()}
                  step={digitos == 3 ? 10 : 100} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>

            <Col span={24}>
              <Tooltip title="Cargar imagen de fondo">
                <Upload

                  accept=".jpg, .jpeg, .png"
                  listType="picture"
                  fileList={fileList}
                  /* maxCount={8} */
                  /* multiple */
                  onChange={handleChangeSigueParticipando}
                  onPreview={handlePreviewSigueParticipando}
                  beforeUpload={() => false}
                  itemRender={(originNode, file: any) => {
                    return (

                      <div className="upload-list-custom" style={{
                        width: "100%",
                        float: "left",
                        padding: "0.5rem"
                      }}>
                        {originNode}
                      </div>

                    )
                  }}
                >
                  <Button style={{ marginBottom: "1rem" }} size="large" block icon={<UploadOutlined />}>
                    Cargar imagen de fondo
                  </Button>
                </Upload>
              </Tooltip>
            </Col>
          </Row>

          <Row gutter={16}>

            <Col span={12}>
              <Form.Item name="whatsapp" label="Whatsapp">
                <Input placeholder="Whatsapp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="facebook"
                label="Facebook"
              >
                <Input placeholder="Facebook" />
              </Form.Item>
            </Col>
          </Row>


          <Row gutter={16}>

            <Col span={24}>
              <Form.Item
                name="descripcion"
                label="Descripción"
              >
                <Input.TextArea rows={1} placeholder="Descripción" />
              </Form.Item>
            </Col>

          </Row>


          <Row gutter={16} style={{ marginTop: "1rem" }}>
            <Col span={24}>
              <Flex vertical gap="small" style={{ width: '50%', margin: "auto" }}>
                <Button loading={isLoading || uploading} type="primary" block htmlType="submit">
                  {existeIdRifa ? 'Actualizar' : 'Registrar'}
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default FormRifa;