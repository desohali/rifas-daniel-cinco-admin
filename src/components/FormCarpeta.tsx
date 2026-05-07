"use client";
import React from 'react';
import swal from 'sweetalert';
import { useDispatch, useSelector } from 'react-redux';
import { useRegistrarCarpetaMutation } from '@/services/userApi';
import { setListaDeRifas, setOpenFormCarpeta, setRandom } from '@/features/adminSlice';
import { Badge, Button, Checkbox, Col, Divider, Drawer, Flex, Form, Input, InputNumber, Modal, Radio, Row, Segmented, Select, Tabs, Tag, Tooltip, Upload } from 'antd';
import { FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { base64ToBlob, blobToFile, loadImage } from '@/helpers/canvas'
import MONEDAS from '../../public/monedas.json'; // Ruta relativa al archivo JSON
import Swal from 'sweetalert2';
import { subirImagen } from '@/utils/storage';


const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);

var canvas: any, ctx: any;

const style: React.CSSProperties = { width: '100%' };


const FormCarpeta: React.FC<{ formCarpeta: any }> = ({ formCarpeta }) => {

  const [boletoImage, setBoletoImage] = React.useState<string | null>(null);
  const [boletoData, setBoletoData] = React.useState<any | null>(null);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [form] = Form.useForm();


  const [fileList, setFileList] = React.useState<any[]>([]);
  const [fileListPremios, setFileListPremios] = React.useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');
  const [uploading, setUploading] = React.useState(false);


  const dispatch = useDispatch();
  const { openFormCarpeta, detalleDeCarpeta } = useSelector((state: any) => state.admin);
  const existeIdCarpeta = Boolean(formCarpeta.getFieldValue("_id"));
  const [loading, setloading] = React.useState(false);
  const [value, setValue] = React.useState('sistema2');
  const [moneda, setMoneda] = React.useState<any>(undefined);


  const [registrarCarpeta, { data, error, isLoading }] = useRegistrarCarpetaMutation();

  React.useEffect(() => {
    if (data) {
      dispatch(setListaDeRifas(data?.listaDeRifas));
    }
  }, [data]);

  React.useEffect(() => {
    setValue(detalleDeCarpeta?.disenio || 'sistema2');
  }, [detalleDeCarpeta]);

  const handlePreviewPremios = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
  };

  const handleChangePremios = ({ fileList }: any) => {
    // Limita la cantidad de archivos a 8
    const newFileList = fileList.map((file: any) => ({
      ...file,
      sumarPremio: true,
      descripcion: "",
      premio: 0,
    }));
    setFileListPremios(newFileList);
  };

  const handleUploadPremios = async (_idCarpeta: string = "", scale = 0.5) => {

    if (!fileListPremios.length) return [];
    setUploading(true);

    canvas = document.getElementById('uploadResizer');
    ctx = canvas.getContext('2d');

    let arrayImages: any[] = [];

    const loadImages: any[] = [];
    fileListPremios.forEach(async (file: any) => {
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
    /* const formData = new FormData();
    formData.append('_idCarpeta', _idCarpeta || '');


    arrayImages.forEach((file: any, index) => {
      formData.append(`imagen${index}`, file); // Agrega cada archivo al FormData
    }); */

    try {
      /* const response = await fetch(`https://desohali.com/juegoDeRifasMichael/uploadImages`, {
        method: "post",
        body: formData,
      });

      await response.json(); */

      const response = await Promise.all(arrayImages.map((file: any) => subirImagen(_idCarpeta, file)));
      setFileListPremios([]);
      setUploading(false);
      const premios = response.map((url: string, index: number) => ({
        nombre: fileListPremios[index].name || fileListPremios[index].originFileObj?.name,
        valor: (fileListPremios[index].name || fileListPremios[index].originFileObj?.name).trim().replace(/\s+/g, '_'),
        urlFB: url,
        premio: fileListPremios[index].premio || 0,
        descripcion: fileListPremios[index].descripcion || "",
        sumarPremio: fileListPremios[index].sumarPremio || false,
      }));
      return premios;
    } catch (error) {
      console.log('error', error)
      setUploading(false);
      return [];
    }

  };

  const handleNameChange = (value: any, file: any, key: string) => {

    const updatedList: any = fileListPremios.map((item: any) => {
      if (item.uid === file.uid) {
        return {
          ...item,
          [key]: value,
        };
      }
      return item;
    });
    setFileListPremios(updatedList);
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

  const handleUploadSigueParticipando = async (_idCarpeta: string = "", scale = 0.5) => {

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

    // find fondo del sorteo
    /* const formData = new FormData();
    formData.append('_idCarpeta', _idCarpeta || '');


    arrayImages.forEach((file: any, index) => {
      formData.append(`imagenSigueParticipando${index}`, file); // Agrega cada archivo al FormData
    }); */

    try {
      /* const response = await fetch(`https://desohali.com/juegoDeRifasMichael/uploadImages`, {
        method: "post",
        body: formData,
      });

      await response.json(); */

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
        title={`${existeIdCarpeta ? 'Actualizar' : 'Registrar'} carpeta`}
        width={500}
        onClose={() => dispatch(setOpenFormCarpeta(false))}
        open={openFormCarpeta}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <Form
          form={formCarpeta}
          name="login-form"
          layout="vertical"
          style={style}
          requiredMark={customizeRequiredMark}
          initialValues={{
            _id: "",
            nombreCarpeta: "",
            moneda: "",
            disenio: "sistema3",
            descripcion: "",

          }}
          onFinish={async (values) => {

            const [firstFileSigueParticipando]: any[] = fileList;
            if (!firstFileSigueParticipando && !Object.keys(detalleDeCarpeta?.sigueParticipando || {}).length) {
              return await Swal.fire({
                title: 'Alerta',
                text: 'Por favor, sube una imagen (sigue participando)',
                icon: 'warning',
                confirmButtonText: 'OK'
              });
            }

            setloading(true);
            const { data }: any = await registrarCarpeta({
              ...values,
              disenio: "sistema3",
              premios: [],
              sigueParticipando: detalleDeCarpeta?.sigueParticipando || {}
            });


            const premios: any[] = await handleUploadPremios(data?._id, 0.5);
            const [sigueParticipando]: any[] = await handleUploadSigueParticipando(data?._id, 0.5);

            if (premios.length || sigueParticipando) {
              await registrarCarpeta({
                _id: data?._id,
                premios,
                sigueParticipando: sigueParticipando || detalleDeCarpeta?.sigueParticipando,
              });
            }

            setloading(false);

            formCarpeta.resetFields();
            dispatch(setRandom(Math.random()));
            dispatch(setOpenFormCarpeta(false));

            //Limpianos el diseño del boleto 
            setBoletoImage(null);
            setBoletoData(null);

            swal("", `Carpeta ${existeIdCarpeta ? 'actualizada' : 'registrada'}!`, "success");
          }} >
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <canvas id='uploadResizer' style={{ display: "none" }}></canvas>
              <canvas id='imagenCarpeta' style={{ display: "none" }}></canvas>
              <Form.Item
                name="_id"
                label="_id"
                style={{ display: "none" }}
              >
                <Input placeholder="_id" />
              </Form.Item>
              <Form.Item
                name="nombreCarpeta"
                label="Nombre de carpeta"
                rules={[{ required: true, message: 'Ingrese nombre de carpeta' }]}
              >
                <Input prefix={<FolderOpenOutlined style={{ fontSize: "18px", color: "orange" }} />} placeholder="Nombre de carpeta" style={style} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item
                name="moneda"
                label="Moneda"
                rules={[
                  {
                    required: true,
                    message: "Seleccione una moneda",
                  },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  optionLabelProp="label"
                  // options={USUARIOS_RESPONSABLE}
                  placeholder="Seleccione moneda"
                  style={style}
                  onChange={(value) => {
                    const moneda = MONEDAS.find((moneda: any) => moneda.pais === value);
                    setMoneda(moneda);
                  }}
                >
                  {MONEDAS.map((moneda: any) => (
                    <Select.Option
                      key={moneda.pais}
                      value={moneda.pais}
                      label={`${moneda.pais} (${moneda.simbolo})`}
                    >
                      <div>
                        <p style={{ paddingBottom: "0px", marginBottom: "0px" }}>
                          {`${moneda.pais} (${moneda.simbolo})`}
                        </p>
                        <span style={{ color: "#888" }}>
                          {moneda.moneda}
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item
                name="descripcion"
                label="Descripción"
                rules={[{ required: false, message: 'Por favor, ingrese descripción' }]}
              >
                <Input placeholder="Descripción" style={style} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
              <fieldset style={{ border: "1px solid #d9d9d9", padding: "1rem", borderRadius: 8 }}>
                <legend style={{ padding: "0rem", borderBottom: "none", marginBottom: "0rem", width: "inherit" }}>Imágenes (premios)</legend>
                <Upload
                  accept=".jpg, .jpeg, .png"
                  listType="picture"
                  fileList={fileListPremios}
                  /* maxCount={8} */
                  multiple
                  onChange={handleChangePremios}
                  onPreview={handlePreviewPremios}
                  beforeUpload={() => false}
                  itemRender={(originNode, file: any) => {
                    return (

                      <div className="upload-list-custom" style={{
                        width: "100%",
                        float: "left",
                        padding: "0.25rem 0rem",
                        // position: "relative"
                      }}>
                        <div style={{ width: "100%", position: "relative" }}>
                          <Tooltip title="Suma premio">
                            <Form.Item
                              initialValue={true}
                              name={['sumarPremio', file.uid]}
                              valuePropName="checked"
                              style={{ position: "absolute", top: "50%", right: "40px", transform: "translateY(-50%)", zIndex: 99 }}
                            >
                              <Checkbox defaultChecked onChange={(e) => handleNameChange(e.target.checked, file, "sumarPremio")} />
                            </Form.Item>
                          </Tooltip>
                          {originNode} {/* Muestra la vista previa del archivo */}
                        </div>

                        <Input.Group compact style={{ width: "100%"/* , backgroundColor:"blue" */ }}>
                          <Form.Item
                            name={['montoDelPremio', file.uid]} // nombre único por imagen
                            rules={[{ required: file?.sumarPremio ? true : false, message: `Ingrese monto del premio` }]}
                            style={{ width: "40%", marginBottom: "0rem" }} // Cada item ocupa la mitad
                          >
                            <InputNumber
                              prefix={moneda?.simbolo || MONEDAS.find((moneda: any) => moneda.pais === detalleDeCarpeta?.moneda)?.simbolo || ""}
                              min={1}
                              placeholder="Monto del premio"
                              style={{ width: "100%", borderRadius: "0rem 0rem 0rem 0.5rem" }}
                              onChange={(premio) => handleNameChange(premio, file, "premio")} // Cambia el nombre
                            />
                          </Form.Item>
                          <Form.Item
                            name={['descripcionDelPremio', file.uid]} // nombre único por imagen
                            rules={[{ required: !file?.sumarPremio ? true : false, message: `Ingrese descripción del premio` }]}
                            style={{ width: "60%", marginBottom: "0rem" }} // Cada item ocupa la mitad
                          >
                            <Input
                              placeholder="Descripción del premio"
                              style={{ width: "100%", borderRadius: "0rem 0rem 0.5rem 0rem" }}
                              onChange={(e) => handleNameChange(e.target.value, file, "descripcion")} // Cambia el nombre
                            />
                          </Form.Item>
                        </Input.Group>

                      </div>

                    )
                  }}
                >
                  <Button size="large" block icon={<UploadOutlined />}>
                    Seleccione imágenes
                  </Button>
                </Upload>
              </fieldset>

            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
              <fieldset style={{ border: "1px solid #d9d9d9", padding: "1rem", borderRadius: 8 }}>
                <legend style={{ padding: "0rem", borderBottom: "none", marginBottom: "0rem", width: "inherit" }}>Imagen (sigue participando)</legend>

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
                        {originNode} {/* Muestra la vista previa del archivo */}
                        {/* <InputNumber
                            min={1}
                            placeholder="Monto del premio"
                            style={{ width: "100%", borderRadius: "0rem 0rem 0.5rem 0.5rem" }}
                            value={file.premio || undefined}
                            onChange={(e) => handleNameChange(e, file)} // Cambia el nombre
                          /> */}
                      </div>

                    )
                  }}
                >
                  <Button size="large" block icon={<UploadOutlined />}>
                    Seleccione imagen
                  </Button>
                </Upload>
              </fieldset>
            </Col>

          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Flex vertical gap="small" style={{ width: '50%', margin: "1rem auto" }}>
                <Button loading={loading} type="primary" block htmlType="submit">
                  {existeIdCarpeta ? 'Actualizar' : 'Registrar'}
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>
      </Drawer >
    </>
  );
};

export default FormCarpeta;