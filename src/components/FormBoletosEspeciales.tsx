"use client";
import { Avatar, Button, Col, Divider, Flex, Form, InputNumber, List, message, Row, Select, Slider, Switch, Tag } from 'antd'
import React from 'react'
import { useListarBoletosQueryQuery, useRegistrarRifaMutation } from '@/services/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setIsRifa, setListaDeBoletosConPremioEspeciales, setOpenFormBoleto, setRifaDetalles } from '@/features/adminSlice';
import { useParams } from 'next/navigation';
import MONEDAS from '../../public/monedas.json'; // Ruta relativa al archivo JSON
import {
  PlusOutlined,
  QrcodeOutlined,
  StopOutlined,
} from "@ant-design/icons";
import FormPremiosDinamicos from './FormPremiosDinamicos';

const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);


const style: React.CSSProperties = { width: '100%' };

const FormBoletosEspeciales = () => {

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [formPremios] = Form.useForm();
  const { _idCarpeta } = useParams();

  const {
    rifaDetalles,
    listaDeBoletosConPremioEspeciales = [],
    listaDeCarpetas = []
  } = useSelector((state: any) => state.admin);

  console.log('rifaDetalles', rifaDetalles)

  const CARPETA: any = (listaDeCarpetas.find(({ _id }: any) => _id == _idCarpeta));

  const MONEDA_CARPETA = MONEDAS.find(({ pais }: any) => pais == CARPETA?.moneda);
  const OPTIONS_PREMIOS = (CARPETA?.premios || []);

  const BOLETOS_CON_PREMIO_RANDOM = listaDeBoletosConPremioEspeciales.map((b: any) => ({
    ...b,
    premios: (b?.premios || []).filter((p: any) => p).map((p: any) => {
      return OPTIONS_PREMIOS.find(({ _id }: any) => p.includes(_id));
    })
  }));


  console.log('OPTIONS_PREMIOS', OPTIONS_PREMIOS)
  const [registrarRifa, {
    data,
    error,
    isLoading
  }] = useRegistrarRifaMutation();

  const {
    data: dataBoletosGanadores,
    error: errorBoletosGanadores,
    refetch
  } = useListarBoletosQueryQuery({ _idRifa: rifaDetalles?._id, boletosGanadoresEspeciales: true });

  React.useEffect(() => {
    if (dataBoletosGanadores) {
      dispatch(setListaDeBoletosConPremioEspeciales(dataBoletosGanadores));
    }
  }, [dataBoletosGanadores]);


  return (
    <>
      <Form
        form={form}
        name="login-form"
        layout="vertical"
        style={style}
        requiredMark={customizeRequiredMark}
        initialValues={{
          checked2: rifaDetalles?.checked2 || false,
          cadaXBoletos2: rifaDetalles?.cadaXBoletos2 || "",
        }}
        onFinish={async (values) => {
          formPremios.validateFields().then((valuesPremios) => {
            const { premiosYCantidadInstantaneo, premiosYCantidadParGuarani, ...rest } = rifaDetalles;
            registrarRifa({
              ...rest,
              ...values,
              premiosYCantidad2: valuesPremios?.items || []
            }).then(() => {
              message.success(`Rifa ${rifaDetalles?._id ? "actualizada" : "registrada"} exitosamente!!`);
              form.resetFields();
              dispatch(setOpenFormBoleto(false));
              dispatch(setRifaDetalles(null));
              dispatch(setIsRifa(true));
              setTimeout(() => { dispatch(setIsRifa(false)) }, 50);
            });
          })

        }} >

        <Row gutter={16}>
          <Col xs={10} sm={10} md={10} lg={10}>
            <Form.Item
              name="checked2"
              label="Activar"
              valuePropName="checked"
              rules={[{ required: true, message: 'Activar y/o Inactivar' }]}
            >
              <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" onChange={(checked) => {
              }} />
            </Form.Item>
          </Col>
          <Col xs={14} sm={14} md={14} lg={14}>

            <Form.Item
              name="cadaXBoletos2"
              label="Cada x boletos"
              rules={[{ required: true, message: 'Seleccione Cada x boletos' }]}
            >
              <InputNumber style={style} min={1} max={100} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24}>
            <FormPremiosDinamicos
              titulo="Premios especiales"
              form={formPremios}
              optionsPremios={OPTIONS_PREMIOS}
              monedaCarpeta={MONEDA_CARPETA?.simbolo}
              initialValues={rifaDetalles?.premiosYCantidad2 || []} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Divider />
            <Flex vertical gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={isLoading} type="primary" block htmlType="submit">
                Registrar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Row gutter={16}>
        <Col span={24}>
          <List
            style={{ maxHeight: "300px", overflowY: "auto", marginTop: "1.5rem" }}
            size="small"
            header={(
              <div>
                <h4>{`Lista de ganadores QR especiales : ${listaDeBoletosConPremioEspeciales.length}`}</h4>
                <h4>{`Total : ${BOLETOS_CON_PREMIO_RANDOM.reduce((a: any, cv: any) => {
                  return (a + (cv?.premios || []).reduce((a2: any, cv2: any) => {
                    return (a2 + (cv2?.sumarPremio ? cv2?.premio : 0))
                  }, 0))
                }, 0)?.toLocaleString('en-US').replace(/,/g, '.')}`}</h4>
              </div>
            )}
            bordered
            dataSource={BOLETOS_CON_PREMIO_RANDOM}
            renderItem={(item: any) => {
              const numerosJugados = [item?.premioMayor, item?.premioMenor, item?.premioTres, item?.premioCuatro, item?.premioCinco];
              return (
                <List.Item
                  key={item?._id}>
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={46} icon={<QrcodeOutlined style={{ fontSize: "36px", padding: "4px" }} />} />}
                    title={`Boleto: ${numerosJugados.filter(Boolean).join(" - ")}`}
                    description={(
                      <div>
                        {(item?.premios || []).map((p: any) => {
                          return <p style={{ paddingBottom: "0px", marginBottom: "0px" }}>
                            🎁 ${p?.premio} | ${p?.descripcion || "❌"} {p?.sumarPremio ? <Tag color="success" icon={<PlusOutlined />} style={{ float: "right" }} >Sumar</Tag> : <Tag color="warning" icon={<StopOutlined />} style={{ float: "right" }} >No sumar</Tag>}
                          </p>;
                        })}
                      </div>
                    )}
                  />
                </List.Item>
              )
            }}
          />
        </Col>
      </Row>
    </>

  )
}

export default FormBoletosEspeciales