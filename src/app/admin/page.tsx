"use client";
import React from 'react';
import swal from 'sweetalert';
import { Avatar, Badge, Button, Card, Col, Collapse, Divider, Flex, Form, Layout, List, message, Modal, PopconfirmProps, Row, Space, Spin, Switch, Tabs, Tag, theme, Tooltip, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusOutlined, FolderOpenOutlined, EditOutlined, CloudDownloadOutlined,
  DeleteOutlined,
  TagOutlined,
  PlusCircleOutlined,
  StopOutlined,
  CheckOutlined
} from '@ant-design/icons';
import FormCarpeta from '@/components/FormCarpeta';
import { setDetalleDeCarpeta, setIdCarpeta, setListaDeCarpetas, setOpenFormCarpeta, setRandom } from '@/features/adminSlice';
import { useActualizarPremioMutation, useEliminarPremiosMutation, useRegistarDisenioBoletoMutation, useRegistrarCarpetaMutation } from '@/services/userApi';

import Swal from 'sweetalert2';
import { Image } from 'antd';
import MONEDAS from '../../../public/monedas.json'; // Ruta relativa al archivo JSON
import BoletoDesignerPuro from '@/components/BoletoDesignerPuro';
import BoletoDesignerQR from '@/components/BoletoDesignerQR';
import BoletoDesignerSorteo from '@/components/BoletoDesignerSorteo';
import { base64ToBlob, blobToFile } from '@/helpers/canvas';
const { Header, Content, Footer } = Layout;
import { v4 as uuidv4 } from 'uuid';
import { obtenerURL, subirImagen } from '@/utils/storage';
import ModalActualizarPremio from '@/components/ModalActualizarPremio';

const { Text } = Typography;


const existeBackgroundImage = (backgroundImage: any) => {
  if (!backgroundImage) {
    Swal.fire({
      title: 'Alerta',
      text: 'Debe subir una imagen para el fondo',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
    return false;

  } else {
    return true;
  }
};


const handleUploadDisenioBoleto = (imagenBase64: string, _idCarpeta: string = "", nombreImagen = "disenioBoleto") => {
  return new Promise(async (resolve, reject) => {
    const type: string = imagenBase64.split(';')[0].split(':')[1];
    const imagenBlob = base64ToBlob(imagenBase64, type);
    const imagenFile = blobToFile(imagenBlob, `disenios/${uuidv4()}.${type.split('/')[1]}`)
    // find fondo del sorteo
    /* const formData = new FormData();
    formData.append('_idCarpeta', _idCarpeta || '');
    formData.append(nombreImagen, imagenFile); // Agrega cada archivo al FormData */

    try {
      const fullPath = await subirImagen(_idCarpeta, imagenFile);
      resolve(fullPath);
      /* const response: any = await fetch(`https://desohali.com/juegoDeRifasMichael/uploadImages`, {
        method: "post",
        body: formData,
      });

      resolve(response.json()); */

    } catch (error) {
      console.log('error', error)
      reject(error);
    }
  });

};




const App: React.FC = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const [openModalActualizarPremio, setOpenModalActualizarPremio] = React.useState(false);
  const [initialValuesPremio, setInitialValuesPremio] = React.useState<any>({});

  const [formCarpeta] = Form.useForm();
  const [registrarCarpeta, objectResponse] = useRegistrarCarpetaMutation();
  const [registarDisenioBoleto, objectResponseDisenioBoleto] = useRegistarDisenioBoletoMutation();
  const [eliminarPremios, objectResponseEliminarPremios] = useEliminarPremiosMutation();

  const {
    /* widthBoleto,
    heightBoleto, */
    listaDeCarpetas,
    detalleDeCarpeta
  } = useSelector((state: any) => state.admin);
  const [loadingSwitch, setloadingSwitch] = React.useState(false);
  const [collapses, setcollapses] = React.useState<any>({});
  const [loadingDisenios, setloadingDisenios] = React.useState(false);

  /* React.useEffect(() => {
    if (listaDeCarpetas.length > 0) {
      console.log('4444444444444444444', 4444444444444444444)
      // registarDisenioBoleto
      const test: any = []
      listaDeCarpetas.forEach((carpeta: any) => {
        test.push(registarDisenioBoleto({
          _idCarpeta: carpeta._id,
          urlImagen: carpeta?.urlImagen,
          urlBackgroundImage: carpeta?.urlBackgroundImage,
          imagenes: carpeta?.imagenes,
          textos: carpeta?.textos,
          configuracionDelBoleto: carpeta?.configuracionDelBoleto,
        }))
      })

      Promise.all(test).then((response) => {
        console.log('response', response)
        message.success('Disenios guardados correctamente');
      })
    }
  }, [listaDeCarpetas])



  console.log('listaDeCarpetas', listaDeCarpetas) */

  const [actualizarPremio, {
    data,
    error,
    isLoading
  }] = useActualizarPremioMutation();

  const [loadingRoute, setloadingRoute] = React.useState(false);
  const [previewVisible, setPreviewVisible] = React.useState(false);

  const [loading, setloading] = React.useState(true);
  React.useEffect(() => {
    setloading(false);
    dispatch(setIdCarpeta(null));
  }, []);

  const [carpetasFilter, setcarpetasFilter] = React.useState([]);
  React.useEffect(() => {
    const localStorageUser = window.localStorage.getItem("usuarioLuis");
    if (localStorageUser) {
      const userObject = JSON.parse(localStorageUser);
      if (userObject?.tipoUsuario == "s") {
        setcarpetasFilter(listaDeCarpetas);
      } else if (userObject?._idCarpeta && userObject?.tipoUsuario == "a") {
        setcarpetasFilter(listaDeCarpetas.filter((carpeta: any) => {
          return (carpeta?._id == userObject?._idCarpeta);
        }));
      }
    }
  }, [listaDeCarpetas]);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  // Función para manejar el guardado del diseño
  const handleSaveDesignBoleto = async (imageBase64: string, data: any) => {

    if (!existeBackgroundImage(data?.backgroundImageUrl)) return;
    setloadingDisenios(true);
    const imagenGenerada: any = await handleUploadDisenioBoleto(imageBase64, detalleDeCarpeta?._id, "imagenGenerada");
    const backgroundImageUrl: any = await handleUploadDisenioBoleto(data?.backgroundImageUrl, detalleDeCarpeta?._id, "backgroundImageUrl");

    await registrarCarpeta({
      _id: detalleDeCarpeta?._id,
      premios: [],// esta $push en la base de datos por eso se estable en vacio para que no duplique premios
      urlImagen: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImage: backgroundImageUrl/* ?.response[0] || "" */,
      imagenes: data?.imagenes || [],
      textos: data?.textos || [],
      configuracionDelBoleto: data?.configuracionDelBoleto || {},
    });

    await registarDisenioBoleto({
      _idCarpeta: detalleDeCarpeta?._id,
      urlImagen: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImage: backgroundImageUrl/* ?.response[0] || "" */,
      imagenes: data?.imagenes || [],
      textos: data?.textos || [],
      configuracionDelBoleto: data?.configuracionDelBoleto || {},
    });

    setloadingDisenios(false);

    dispatch(setRandom(Math.random()));
    dispatch(setDetalleDeCarpeta({
      ...detalleDeCarpeta,
      urlImagen: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImage: backgroundImageUrl/* ?.response[0] || "" */,
    }));

    message.success('Diseño guardado correctamente');
  };

  const handleSaveDesignQR = async (imageBase64: string, data: any) => {

    if (!existeBackgroundImage(data?.backgroundImageUrl)) return;
    setloadingDisenios(true);
    const imagenGenerada: any = await handleUploadDisenioBoleto(imageBase64, detalleDeCarpeta?._id, "imagenGeneradaQR");
    const backgroundImageUrl: any = await handleUploadDisenioBoleto(data?.backgroundImageUrl, detalleDeCarpeta?._id, "backgroundImageUrlQR");

    await registrarCarpeta({
      _id: detalleDeCarpeta?._id,
      premios: [],// esta $push en la base de datos por eso se estable en vacio para que no duplique premios
      urlImagenQR: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImageQR: backgroundImageUrl/* ?.response[0] || "" */,
      imagenesQR: data?.imagenes || [],
      textosQR: data?.textos || [],
    });
    setloadingDisenios(false);
    dispatch(setRandom(Math.random()));
    dispatch(setDetalleDeCarpeta({
      ...detalleDeCarpeta,
      urlImagenQR: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImageQR: backgroundImageUrl/* ?.response[0] || "" */,
    }));
    message.success('Diseño guardado correctamente');
  };

  const handleSaveDesignSorteo = async (imageBase64: string, data: any) => {

    if (!existeBackgroundImage(data?.backgroundImageUrl)) return;
    setloadingDisenios(true);
    const imagenGenerada: any = await handleUploadDisenioBoleto(imageBase64, detalleDeCarpeta?._id, "imagenGeneradaSorteo");
    const backgroundImageUrl: any = await handleUploadDisenioBoleto(data?.backgroundImageUrl, detalleDeCarpeta?._id, "backgroundImageUrlSorteo");

    await registrarCarpeta({
      _id: detalleDeCarpeta?._id,
      premios: [],// esta $push en la base de datos por eso se estable en vacio para que no duplique premios
      urlImagenSorteo: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImageSorteo: backgroundImageUrl/* ?.response[0] || "" */,
      imagenesSorteo: data?.imagenes || [],
      textosSorteo: data?.textos || [],
    });
    setloadingDisenios(false);
    dispatch(setRandom(Math.random()));
    dispatch(setDetalleDeCarpeta({
      ...detalleDeCarpeta,
      urlImagenSorteo: imagenGenerada/* ?.response[0] || "" */,
      urlBackgroundImageSorteo: backgroundImageUrl/* ?.response[0] || "" */,
    }));
    message.success('Diseño guardado correctamente');
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0, background: "#714b67" }}>
      </Header>
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <React.Suspense>
          <Row gutter={[16, 16]} style={{ padding: "1rem 0rem" }}>
            <Col className="gutter-row" xs={24} sm={24} md={24} lg={8}>

            </Col>
            <Col className="gutter-row" xs={24} sm={12} md={12} lg={8}>
              <Flex vertical gap="small" style={{ width: '100%', marginBottom: '12px' }}>
                <Button size="large" type="primary" onClick={() => {
                  dispatch(setDetalleDeCarpeta(null));
                  dispatch(setOpenFormCarpeta(true));
                  formCarpeta.resetFields();
                }} icon={<PlusOutlined />}>
                  Registrar carpeta rifa
                </Button>
              </Flex>
              <FormCarpeta formCarpeta={formCarpeta} />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {carpetasFilter.map((carpeta: any, index: number) => {
              const moneda: any = MONEDAS.find((moneda: any) => moneda.pais === carpeta?.moneda);
              return (
                <Col key={carpeta._id} className="gutter-row" xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    loading={loading}
                    size="small"
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FolderOpenOutlined style={{ fontSize: "24px", color: "orange" }} />
                        <span style={{ marginLeft: 10 }}>{carpeta?.nombreCarpeta}</span>
                      </div>
                    }
                    hoverable
                    cover={(
                      <Spin spinning={loadingRoute}>

                        {Boolean(carpeta?.urlImagen) ? (
                          <img
                            src={carpeta?.urlImagen}
                            loading="lazy"
                            // crossOrigin="anonymous"
                            alt="Imagen"
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '0.5rem',
                              // padding: "1rem",
                            }}
                            onClick={() => {
                              setloadingRoute(true);
                              dispatch(setIdCarpeta(carpeta._id));
                              router.push(`/admin/rifas/${carpeta._id}`);
                            }}
                          />
                        ) : (
                          <img
                            src={".../../static/no_hay_disenio.png"}
                            loading="lazy"
                            crossOrigin="anonymous"
                            alt="Imagen"
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '0.5rem',
                              // padding: "1rem",
                            }}
                            onClick={() => {
                              message.info("No hay diseño del boleto, debe crear un diseño para poder acceder a rifas!");
                            }}
                          />
                        )}
                      </Spin>
                    )}
                    style={{ width: "100%" }}>
                    <Button
                      block
                      size="large"
                      icon={<TagOutlined />}
                      onClick={() => {
                        dispatch(setDetalleDeCarpeta(carpeta));
                        setPreviewVisible(true);
                      }}
                      type="dashed">
                      Crear diseños
                    </Button>

                    <Row gutter={[12, 12]}>
                      <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
                        <Text strong >{carpeta?.descripcion}</Text>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
                        <Text>Venta de rifas : </Text>
                        <Switch
                          loading={loadingSwitch}
                          checkedChildren="Activa"
                          unCheckedChildren="Inactiva"
                          checked={carpeta?.estatus || false}
                          onChange={async (isChecked: any) => {
                            setloadingSwitch(true);
                            await registrarCarpeta({ _id: carpeta?._id, estatus: isChecked, premios: [] });
                            // await handleUpload(data?._id, 0.25);
                            setloadingSwitch(false);
                            formCarpeta.resetFields();
                            dispatch(setRandom(Math.random()));
                            dispatch(setOpenFormCarpeta(false));
                            swal(carpeta?.nombreCarpeta, `Venta de rifas ${isChecked ? 'activa' : 'inactiva'} !`, "success");
                          }} />
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
                        <Row justify="space-between">
                          <Col>
                            <Space>
                              <Text>Autenticación :</Text>
                              <Switch
                                loading={loadingSwitch}
                                checkedChildren="Activa"
                                unCheckedChildren="Inactiva"
                                checked={carpeta?.authQR || false}
                                onChange={async (isChecked: any) => {
                                  setloadingSwitch(true);
                                  await registrarCarpeta({ _id: carpeta?._id, authQR: isChecked, premios: [] });
                                  // await handleUpload(data?._id, 0.25);
                                  setloadingSwitch(false);
                                  formCarpeta.resetFields();
                                  dispatch(setRandom(Math.random()));
                                  dispatch(setOpenFormCarpeta(false));
                                  swal(carpeta?.nombreCarpeta, `Autenticación ${isChecked ? 'activa' : 'inactiva'} !`, "success");
                                }} />
                            </Space>
                          </Col>
                          <Col>
                            <Space>
                              <Tooltip title="Editar carpeta">
                                <Button type="primary" onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(setOpenFormCarpeta(true));
                                  formCarpeta.resetFields();
                                  formCarpeta.setFieldsValue(carpeta);
                                  dispatch(setDetalleDeCarpeta(carpeta));
                                }} shape="circle" icon={<EditOutlined />} />
                              </Tooltip>
                            </Space>
                          </Col>
                        </Row>
                        <p><strong>{`${moneda.pais} (${moneda.simbolo})`}</strong></p>
                        <p><small>{moneda?.moneda}</small></p>
                      </Col>

                      <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>

                        <Collapse
                          size="small"
                          onChange={(e) => {
                            if ((e || []).length) {
                              setcollapses((oldData: any) => ({ ...oldData, [carpeta._id]: true }));
                            } else {
                              setcollapses((oldData: any) => ({ ...oldData, [carpeta._id]: false }));
                            }
                          }}
                          items={[
                            {
                              key: '1',
                              label: <Badge count={(carpeta?.premios || []).length} offset={[15, 10]}><Text strong>Imágenes (premios)</Text></Badge>,
                              children: (
                                <List
                                  size="small"
                                  style={{
                                    maxHeight: 300,
                                    overflow: 'auto',
                                  }}
                                  dataSource={carpeta?.premios || []}
                                  renderItem={(item: any) => (
                                    <List.Item
                                      style={{ padding: "0.5rem 0rem" }}
                                      actions={[
                                        <Tooltip title="Editar premio">
                                          <Button
                                            // loading={isLoading}
                                            // danger
                                            type="dashed"
                                            shape="circle"
                                            icon={<EditOutlined />}
                                            onClick={async () => {

                                              setOpenModalActualizarPremio(true);
                                              setInitialValuesPremio({
                                                _idCarpeta: carpeta._id,
                                                ...item
                                              });

                                            }} />
                                        </Tooltip>,
                                        <Tooltip title="Eliminar premio">
                                          <Button
                                            loading={isLoading}
                                            danger
                                            type="dashed"
                                            shape="circle"
                                            icon={<DeleteOutlined />}
                                            onClick={async () => {
                                              const { isConfirmed } = await Swal.fire({
                                                icon: "question",
                                                title: `Seguro que deseas eliminar el premio (${item?.nombre?.split(".").slice(0, -1).join(".")}) ?`,
                                                showDenyButton: true,
                                                showCancelButton: false,
                                                confirmButtonText: "Si",
                                                denyButtonText: "No",
                                              });

                                              if (isConfirmed) {
                                                await eliminarPremios({ _id: carpeta._id, _idsPremios: [item?._id] });
                                                const listaDeCarpetasClon = [...listaDeCarpetas];

                                                listaDeCarpetasClon[index] = {
                                                  ...listaDeCarpetasClon[index],
                                                  premios: listaDeCarpetasClon[index]["premios"].filter(({ _id }: any) => _id != item?._id)
                                                };

                                                dispatch(setListaDeCarpetas(listaDeCarpetasClon));

                                              }

                                            }} />
                                        </Tooltip>
                                      ]}>
                                      <List.Item.Meta
                                        avatar={collapses[carpeta._id] && <Avatar
                                          shape="square"
                                          size="large"
                                          src={(
                                            <Image
                                              width="100%"
                                              height="100%"
                                              src={item?.urlFB}
                                            />
                                          )} />}
                                        title={(
                                          <span>
                                            ({moneda.simbolo}) {item?.premio || "0"}{" "}
                                            {item?.sumarPremio ? <Tag color="success" icon={<PlusOutlined />} >Sumar</Tag> : <Tag color="warning" icon={<StopOutlined />} >No sumar</Tag>}
                                          </span>
                                        )}
                                        description={`${item?.descripcion || ""}`}
                                      />
                                    </List.Item>
                                  )}
                                />
                              )
                            },
                            {
                              key: '2',
                              label: <Badge count={Boolean(carpeta?.sigueParticipando?._id) ? 1 : 0} offset={[15, 10]}><Text strong>Imagen (sigue participando)</Text></Badge>,
                              children: (
                                Boolean(carpeta?.sigueParticipando?._id) ? (
                                  <List
                                    size="small"
                                    style={{
                                      maxHeight: 300,
                                      overflow: 'auto',
                                    }}
                                    dataSource={[carpeta?.sigueParticipando]}
                                    renderItem={(item: any) => (
                                      <List.Item>
                                        <List.Item.Meta
                                          avatar={collapses[carpeta._id] && <Avatar
                                            shape="square"
                                            size="large"
                                            src={<Image
                                              width="100%"
                                              height="100%"
                                              src={item?.urlFB}
                                            />} />}
                                          title={item?.nombre?.split(".").slice(0, -1).join(".")}
                                          description=""
                                        />
                                      </List.Item>
                                    )}
                                  />
                                ) : (
                                  <Text>No hay imagen de sigue participando</Text>
                                )
                              )
                            }
                          ]}
                        />

                      </Col>
                    </Row>

                  </Card>
                  {/*  */}
                </Col>
              )
            })}
          </Row>

          <Modal
            width={1024}
            title="Diseñador de Boletos"
            open={previewVisible}
            onCancel={() => setPreviewVisible(false)}
            className="preview-modal"
            footer={null}
            maskClosable={false}   // ⭐ Evita que se cierre al hacer clic fuera
          >

            <Tabs
              tabPosition="top"
              type="card"
              destroyInactiveTabPane={true}>
              <Tabs.TabPane tab="Diseño del boleto" key="1">
                <BoletoDesignerPuro
                  loading={loadingDisenios}
                  onSave={handleSaveDesignBoleto}
                  /* width={widthBoleto}
                  height={heightBoleto} */
                  previewDesign={detalleDeCarpeta?.urlImagen || ""}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Diseño del premio QR" key="2">
                <BoletoDesignerQR
                  loading={loadingDisenios}
                  onSave={handleSaveDesignQR}
                  width={300}
                  height={600}
                  previewDesign={detalleDeCarpeta?.urlImagenQR || ""}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Diseño del sorteo" key="3">
                <BoletoDesignerSorteo
                  loading={loadingDisenios}
                  onSave={handleSaveDesignSorteo}
                  width={500}
                  height={333.5}
                  previewDesign={detalleDeCarpeta?.urlImagenSorteo || ""}
                />
              </Tabs.TabPane>
            </Tabs>
          </Modal>
        </React.Suspense >
      </Content>
      <ModalActualizarPremio
        open={openModalActualizarPremio}
        onCancel={() => setOpenModalActualizarPremio(false)}
        initialValues={initialValuesPremio}
        onFinish={async (values: any) => {
          await actualizarPremio({ ...initialValuesPremio, ...values });
          message.success('Premio actualizado correctamente!!');
          dispatch(setRandom(Math.random()));
          setOpenModalActualizarPremio(false);
        }} />

      <Footer style={{ textAlign: 'center' }}>Copyright ©2024 | Juego De Rifas. Todos los derechos reservados.</Footer>
    </Layout>
  );
};

export default App;