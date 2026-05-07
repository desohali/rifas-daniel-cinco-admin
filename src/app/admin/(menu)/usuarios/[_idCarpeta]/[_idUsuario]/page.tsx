"use client";
import { setIdCarpeta, setListaDeBoletos, setListaDeRifas } from '@/features/adminSlice';
import { useListarBoletosMutation, useListarBoletosVendidosMutation, useListarRifasMutation } from '@/services/userApi';
import { Avatar, Button, Col, Form, Input, List, Row, Select, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { AimOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

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

const App: React.FC<{ params: any }> = ({ params }: any) => {
  console.log('params', params)

  const [formBoletos] = Form.useForm();
  const dispatch = useDispatch();

  const [date, setDate] = React.useState<string>("");
  const { listaDeRifas } = useSelector((state: any) => state.admin);
  const [listarBoletosVendidos, { data: boletosVendidos, isLoading, error }] = useListarBoletosVendidosMutation();

  const [listarRifas, { data: dataRifas, error: errorRifas, isLoading: isLoadingRifas }] = useListarRifasMutation();
  React.useEffect(() => {
    if (params?._idCarpeta) {
      /* listarRifas({ porCarpeta: true, _idCarpeta: params?._idCarpeta }); */
      dispatch(setIdCarpeta(params?._idCarpeta));
    }
  }, [params?._idCarpeta]);

  React.useEffect(() => {
    if (params?._idUsuario) {
      listarRifas({ _idUsuario: params?._idUsuario });
    }
  }, [params?._idUsuario]);

  React.useEffect(() => {
    if (dataRifas) {
      dispatch(setListaDeRifas(dataRifas?.listaDeRifas));
    }
  }, [dataRifas]);

  React.useEffect(() => {
    setDate(fechaEstandar());
    formBoletos.setFieldsValue({ date: fechaEstandar() });
  }, []);


  React.useEffect(() => {
    if (boletosVendidos) {
      dispatch(setListaDeBoletos(boletosVendidos));
    }
  }, [boletosVendidos]);

  return (
    <>
      <Row justify="center" align="middle" style={{ width: "100vw" }}>
        <Col xs={20} sm={18} md={14} lg={12}>
          <div style={{ width: "100%", paddingBottom: "1rem" }}>
            <Form {...layout}
              form={formBoletos}
              name="login-form"

              initialValues={{ date: '' }}
              requiredMark={customizeRequiredMark}>

              <Select style={{ width: "100%" }} defaultValue="" onChange={(value: any) => {
                listarBoletosVendidos({ _idRifa: value, _idUsuario: params?._idUsuario });
              }}>
                <Select.Option value="">Seleccione Rifa</Select.Option>
                {listaDeRifas.map((r: any) => (
                  <Select.Option key={r?._id} value={r?._id}>{`${r?.nombre} : ${r?.fecha}`}</Select.Option>
                ))}
              </Select>
            </Form>
          </div>
        </Col>
      </Row>

      <Row justify="center" align="middle" style={{ width: "100vw" }}>
        <Col xs={20} sm={18} md={14} lg={12}>
          <List
            size='large'
            header={<Text>{`Boletos vendidos ${boletosVendidos?.dataSize ?? 0}`}</Text>}
            itemLayout="horizontal"
            dataSource={boletosVendidos?.data}
            renderItem={(item: any, index) => (
              <List.Item
                actions={[
                  <Tooltip title="Ubicación">
                    <Button type="primary" onClick={(e) => {
                      window.open(`https://www.google.com/maps/place/${item?.ubicacion[0]},${item?.ubicacion[1]}`, '_blank');
                    }} shape="circle" icon={<AimOutlined />} />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<QrcodeOutlined />} />}
                  title={`Boleto: ${item?.premioMayor} - ${item?.premioMenor}`}
                  description={`Fecha: ${item?.fechaJuego}`}
                />
              </List.Item>
            )}
          />
        </Col>
        {/* <Col xs={20} sm={18} md={14} lg={12}>
          <iframe
            title="Google Map"
            width="600"
            height="450"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://www.google.com/maps/place/24%C2%B028'58.6%22S+56%C2%B005'12.0%22W/@-24.482933,-56.086667,17z/data=!3m1!4b1!4m4!3m3!8m2!3d-24.482933!4d-56.086667?entry=ttu"
            allowFullScreen
          ></iframe>
        </Col> */}
      </Row>
    </>
  )
}

export default App;

// https://www.google.com/maps/place/-24.482933,-56.086667
