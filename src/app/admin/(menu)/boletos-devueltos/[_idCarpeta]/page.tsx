"use client";
import swal from 'sweetalert';
import * as React from 'react';
import { BrowserQRCodeReader, MultiFormatReader } from '@zxing/library';
import { Button, Col, Flex, List, Row } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  QrcodeOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useActualizarBoletosDevueltosMutation, useBoletosDevueltosMutation } from '@/services/userApi';
import { setIdCarpeta, setListaDeBoletosADevolver } from '@/features/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { formatPremio } from '@/helpers/premios';

var selectedDeviceId: any;
var valueQR: string = "";

const BoletosDEvueltos = ({ params }: any) => {

  
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(setIdCarpeta(typeof params._idCarpeta === 'string' ? params._idCarpeta : params._idCarpeta?._id));
  }, []);
  const listaDeBoletosADevolver = useSelector((state: any) => state.admin.listaDeBoletosADevolver);

  const videoRef = React.useRef<any>(null);
  const audioRef = React.useRef<any>(null);
  const codeReader = React.useRef<any>(new BrowserQRCodeReader());

  const [arrayQR, setArrayQR] = React.useState<string[]>([]);
  const [boletosDevueltos] = useBoletosDevueltosMutation();
  const [actualizarBoletosDevueltos, { data, error, isLoading }] = useActualizarBoletosDevueltosMutation();

  function decodeContinuously(codeReader: any, selectedDeviceId: any) {
    codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, videoRef.current, async (result: any, err: any) => {
      if (result) {
        if (result.text.toString() != valueQR.toString()) {
          audioRef.current.play();
          valueQR = result.text.toString();

          const [_idBoleto] = result.text.toString().split("/").reverse();
          setArrayQR((qrs: any) => [...qrs, _idBoleto]);
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
              setArrayQR([]);
            }} type="primary" block danger>
              Detener cámara
            </Button>
          </Flex>
          <div style={{ position: "relative", width: "100%" }}>
            <div style={{
              textAlign: "center",
              padding: "0px",
              width: "40px",
              height: "40px",
              borderRadius: ".5rem",
              color: "white",
              position: "absolute",
              background: "#714b67",
              bottom: 15,
              right: 3
            }}><strong style={{ fontSize: "1.5rem" }}>{arrayQR.length}</strong></div>
            <video ref={videoRef} style={{
              width: "100%",
              borderStyle: "dashed",
              borderRadius: ".5rem",
              marginBottom: ".5rem"
            }} />
          </div>

          <Flex vertical gap="small" style={{ width: '100%' }}>
            <Button icon={<SafetyOutlined />} onClick={async () => {
              if (!Boolean(arrayQR.length)) return;
              const { data }: any = await boletosDevueltos({ boletos: JSON.stringify(arrayQR) });
              const filterJugados = data.filter((boleto: any) => !boleto.estadoMenor);
              const filterValidados = data.filter((boleto: any) => !boleto.estadoMenor);
              if (Boolean(filterJugados.length)) {
                let text = `${filterJugados.length} boletos ya han sido jugados`;
                if (Boolean(filterValidados.length)) {
                  text += `, ${filterValidados.length} boletos ya han sido validados!`
                }
                swal("Alerta", text, "warning");
              }

              dispatch(setListaDeBoletosADevolver(data));
              setArrayQR([]);
            }} type="primary" block>
              Validar
            </Button>
          </Flex>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={4}></Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={10}>
          <List
            style={{ maxHeight: "75vh", overflowY: "auto" }}
            size="small"
            header={<div>{`Lista de boletos a validar : ${listaDeBoletosADevolver.length}`}</div>}
            bordered
            dataSource={listaDeBoletosADevolver}
            renderItem={(item: any) => (
              <List.Item key={item._id}>
                {`Boleto: ${item.premioMayor} - ${item.premioMenor} Premio: ${formatPremio(item?.premio)} `}
                {(item.estadoMenor && item.estado) ? <CheckCircleOutlined style={{ color: "green" }} /> : <WarningOutlined style={{ color: "red" }} />}
              </List.Item>
            )}
          />
          {Boolean(listaDeBoletosADevolver.length) && (
            <Flex vertical gap="small" style={{ width: '100%' }}>
              <Button type="primary" block onClick={async () => {
                const filterMapBoletos = listaDeBoletosADevolver.filter((b: any) => {
                  return b.estadoMenor && b.estado;
                }).map(({ _id }: any) => _id);
                await actualizarBoletosDevueltos({
                  boletos: JSON.stringify(filterMapBoletos)
                });
                dispatch(setListaDeBoletosADevolver([]));
                swal("", `Boletos sobrantes actualizados!`, "success");
              }}>
                Actualizar
              </Button>
            </Flex>
          )}
          <audio style={{ display: "none" }} ref={audioRef}>
            <source src="../../../store-scanner-beep-90395.mp3" type="audio/mpeg" />
          </audio>
        </Col>
      </Row>
    </React.Suspense>
  )
};

export default BoletosDEvueltos;



