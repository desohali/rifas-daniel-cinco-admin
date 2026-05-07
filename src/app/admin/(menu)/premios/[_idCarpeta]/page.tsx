"use client";
import * as React from 'react';
import { Alert, Button, Col, Divider, Flex, Form, Input, List, Row, Select, Tag, Typography, notification } from 'antd';
import { useBuscarBoletoMutation, useListarBoletosPagadosMutation, useListarRifasMutation, usePagarBoletoMutation } from '@/services/userApi';
import { BrowserCodeReader, MultiFormatReader, BrowserQRCodeReader } from '@zxing/library';
import {
  DollarOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setIdCarpeta, setListaDeBoletos, setListaDeRifas } from '@/features/adminSlice';
import { formatPremio } from '@/helpers/premios';

var selectedDeviceId: any;
var valueQR: string = "";

const { Text } = Typography;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);
const fechaEstandar = () => {
  const myFecha = new Date(),
    diferenciaMinutos = myFecha.getTimezoneOffset();

  if (/^-/.test(diferenciaMinutos.toString())) {
    myFecha.setMinutes(myFecha.getMinutes() + Math.abs(diferenciaMinutos));
  } else {
    myFecha.setMinutes(myFecha.getMinutes() - Math.abs(diferenciaMinutos));
  }

  return myFecha.toISOString().split('T')[0];
};

const Premios = ({ params }: any) => {

  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(setIdCarpeta(typeof params._idCarpeta === 'string' ? params._idCarpeta : params._idCarpeta?._id));
  }, []);
  const [formBoletos] = Form.useForm();
  const [idRifaTemp, setIdRifaTemp] = React.useState<string>("");

  const { listaDeRifas = [], listaDeBoletos = [], listaDeCarpetas = [] } = useSelector((state: any) => state.admin);

  const RIFAS_POR_CARPETA = listaDeCarpetas.map((carpeta: any) => {
    return {
      label: <span>{carpeta?.nombreCarpeta || "CARPETA DESCONOCIDA"}</span>,
      title: carpeta?.nombreCarpeta || "CARPETA DESCONOCIDA",
      options: listaDeRifas
        .filter((rifa: any) => (rifa?._idCarpeta == carpeta?._id))
        .map((rifa: any) => {
          return { label: <span>{`${rifa?.nombre} : ${rifa?.fecha}`}</span>, value: rifa?._id }
        })
    }
  });

  const videoRef = React.useRef<any>(null);
  const audioRef = React.useRef<any>(null);
  const codeReader = React.useRef<any>(new BrowserQRCodeReader());

  const [buscarBoleto, { data, error, isLoading }] = useBuscarBoletoMutation();
  const [listarBoletosPagados, { data: dataBoletos, error: errorList, isLoading: isLoadingList }] = useListarBoletosPagadosMutation();
  const [pagarBoleto, { data: dataPagar, error: errorPagar, isLoading: isLoadingPagar }] = usePagarBoletoMutation();
  const [listarRifas, { data: dataRifas, error: errorRifas, isLoading: isLoadingRifas }] = useListarRifasMutation();

  // notificaciones
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (data: any) => {
    api.info({
      message: `Boleto : ${data?.premioMenor} pagado!`,
      description: 'El boleto fue pagado, se listará en boletos pagados, gracias!',
      placement: 'bottomRight',
    });
  };
  // notificaciones end
  React.useEffect(() => {
    if (dataBoletos) {
      dispatch(setListaDeBoletos(dataBoletos));
    }
  }, [dataBoletos]);

  React.useEffect(() => {
    listarRifas({});
  }, []);

  React.useEffect(() => {
    if (dataRifas) {
      dispatch(setListaDeRifas(dataRifas?.listaDeRifas));
    }
  }, [dataRifas]);

  function decodeContinuously(codeReader: any, selectedDeviceId: any) {
    codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, videoRef.current, async (result: any, err: any) => {
      if (result) {
        if (result.text.toString() != valueQR.toString()) {
          audioRef.current.play();
          valueQR = result.text.toString();
          await buscarBoleto({ _id: result.text.split("/").reverse()[0] });
        }
      }
    });
  };

  React.useEffect(() => {
    codeReader.current.getVideoInputDevices()
      .then((videoInputDevices: any) => {
        const rearCamera = videoInputDevices.find((device: any) => device.label.includes('back'));
        selectedDeviceId = (rearCamera?.deviceId || videoInputDevices[0]?.deviceId);
      });
    return () => {
      codeReader.current.reset();
    }
  }, []);

  const [isLargeScreen, setIsLargeScreen] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    function handleScreenChange(e: any) {
      setIsLargeScreen(e.matches);
    }

    mediaQuery.addListener(handleScreenChange); // Escuchar cambios en la pantalla
    handleScreenChange(mediaQuery); // Ejecutar la función inicialmente

    // Limpiar el listener al desmontar el componente
    return () => {
      mediaQuery.removeListener(handleScreenChange);
    };
  }, []);

  return (
    <React.Suspense>
      <Row gutter={16}>

        <Col className="gutter-row" xs={24} sm={24} md={12} lg={10}>

          <Flex gap="small" style={{ width: '100%', marginBottom: ".5rem" }}>
            <Button icon={<QrcodeOutlined />} onClick={() => {
              decodeContinuously(codeReader.current, selectedDeviceId);
            }} type="primary" block>
              Iniciar cámara
            </Button>
            <Button icon={<QrcodeOutlined />} onClick={() => {
              codeReader.current.reset();
            }} type="primary" block danger>
              Detener cámara
            </Button>
          </Flex>


          <video ref={videoRef} style={{ width: "100%", borderStyle: "dashed", borderRadius: ".5rem", marginBottom: ".5rem" }} />
          {(data && data.estadoMenor) && (
            <>
              <Alert
                closable
                style={{ marginBottom: ".5rem" }}
                message={`Boleto : ${data?.premioMenor}`}
                description="Aun no ha sido jugado!"
                type="info"
                showIcon
              />
            </>
          )}

          {(data && !data.estadoMenor && data.estadoPago) && (
            <>
              <Alert
                closable
                style={{ marginBottom: ".5rem" }}
                message={`Boleto : ${data?.premioMenor}`}
                description={(
                  <>
                    <p><Text strong >Ya ha sido pagado!</Text></p>
                    <p><Text strong >Premio: {formatPremio(data?.premio || 0)}</Text></p>
                  </>
                )}
                type="error"
                showIcon
              />
            </>
          )}

          {(data && !data.estadoMenor && !data.estadoPago) && (
            <>
              <Alert
                closable
                style={{ marginBottom: ".5rem" }}
                message={`Boleto : ${data?.premioMenor}`}
                description={Boolean(data?.premio) ? `Premio: ${formatPremio(data?.premio)} pendiente de pago!` : "Este boleto no tuvo premio."}
                type={Boolean(data?.premio) ? "success" : "warning"}
                showIcon
              />
              {!data.estadoPago && (
                <Flex vertical gap="small" style={{ width: '100%' }}>
                  <Button icon={<DollarOutlined />} onClick={async () => {
                    await pagarBoleto({ _id: data._id });
                    if (idRifaTemp) {
                      listarBoletosPagados({ _idRifa: idRifaTemp });
                    }
                    //await buscarBoleto({ _id: data._id });
                    openNotification(data);
                  }} type="primary" block>
                    Pagar
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={4}>
          <audio style={{ display: "none" }} ref={audioRef}>
            <source src="../../../store-scanner-beep-90395.mp3" type="audio/mpeg" />
          </audio>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={10}>
          {contextHolder}
          {isLargeScreen && <Divider>2N° ganadores</Divider>}
          <div style={{ width: "100%", paddingBottom: "1rem" }}>
            <Form {...layout}
              form={formBoletos}
              name="login-form"

              initialValues={{ date: '' }}
              requiredMark={customizeRequiredMark}>

              <Select
                options={RIFAS_POR_CARPETA}
                style={{ width: "100%" }}
                defaultValue=""
                onChange={(value: any) => {
                  console.log('value', value)
                  setIdRifaTemp(value);
                  listarBoletosPagados({ _idRifa: value });
                }} />
              {/* <Select.Option value="">Seleccione Rifa</Select.Option>
                {listaDeRifas.map((r: any) => (
                  <Select.Option key={r?._id} value={r?._id}>{`${r?.nombre} : ${r?.fecha}`}</Select.Option>
                ))}
              </Select> */}
            </Form>
          </div>
          <List
            style={{ maxHeight: "75vh", overflowY: "auto" }}
            size="large"
            header={<div>{`Lista de boletos pagados : ${(listaDeBoletos || []).length}`}</div>}
            bordered
            dataSource={listaDeBoletos || []}
            renderItem={(item: any) => (
              <List.Item key={item._id}>
                {`Boleto: ${item.premioMayor} - ${item.premioMenor} Premio: ${formatPremio(item?.premio)}`}
              </List.Item>
            )}
          />
        </Col>

      </Row>
    </React.Suspense>
  )
};

export default Premios;



