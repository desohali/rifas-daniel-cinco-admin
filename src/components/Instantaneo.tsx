"use client";
import { Avatar, Button, Col, Flex, Form, InputNumber, List, message, Row, Select, Slider, Switch, Tag } from 'antd'
import React from 'react'
import { useListarBoletosQueryQuery, useRegistrarRifaMutation } from '@/services/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setIsRifa, setOpenFormBoleto, setRifaDetalles } from '@/features/adminSlice';
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

const Instantaneo = () => {

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [formPremios] = Form.useForm();
  const { _idCarpeta } = useParams();
  const [listaDeBoletosConPremioInstantaneo, setListaDeBoletosConPremioInstantaneo] = React.useState([]);

  const {
    rifaDetalles,
    listaDeCarpetas = []
  } = useSelector((state: any) => state.admin);

  const CARPETA: any = (listaDeCarpetas.find(({ _id }: any) => _id == _idCarpeta));

  const MONEDA_CARPETA = MONEDAS.find(({ pais }: any) => pais == CARPETA?.moneda);
  const OPTIONS_PREMIOS = (CARPETA?.premios || []);

  const BOLETOS_CON_PREMIO_RANDOM = listaDeBoletosConPremioInstantaneo.map((b: any) => ({
    ...b,
    premios: [OPTIONS_PREMIOS.find(({ _id }: any) => b.premioInstantaneo == _id)]
  }));

  const [registrarRifa, {
    data,
    error,
    isLoading
  }] = useRegistrarRifaMutation();

  const {
    data: dataBoletosGanadores,
    error: errorBoletosGanadores,
    refetch
  } = useListarBoletosQueryQuery({ _idRifa: rifaDetalles?._id, boletosGanadoresInstantaneo: true });

  React.useEffect(() => {
    if (dataBoletosGanadores) {
      setListaDeBoletosConPremioInstantaneo(dataBoletosGanadores);
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
          checked: rifaDetalles?.checked || false,
          cadaXBoletos: rifaDetalles?.cadaXBoletos || "",
          montoTotal: rifaDetalles?.montoTotal || "",
          premios: (rifaDetalles?.premios || []),
        }}
        onFinish={async (values) => {
          formPremios.validateFields().then((valuesPremios) => {
            if (!valuesPremios?.items || valuesPremios?.items?.length === 0 || valuesPremios?.items?.length < 3) {
              message.error("Debe agregar al menos 3 premios");
              return;
            }

            if (rifaDetalles?._id && rifaDetalles?.premiosYCantidadInstantaneo?.length > 0) {
              message.error("No se puede editar una rifa con premios [instantáneo] asignados");
              return;
            }

            // AL ACTUALIZAR SE BEDE DE ESTABLECER LOS PREMIOS RASPA Y GANA EN LOS BOLETOS
            const { premiosYCantidadInstantaneo, premiosYCantidadParGuarani, ...rest } = rifaDetalles;
            registrarRifa({
              ...rest,
              ...values,
              // premiosYCantidadRaspa: valuesPremios?.items || [],
              premiosYCantidadInstantaneo: valuesPremios?.items || [],
            }).then(() => {
              message.success(`Rifa ${rifaDetalles?._id ? "actualizada" : "registrada"} exitosamente!!`);
              form.resetFields();
              dispatch(setOpenFormBoleto(false));
              dispatch(setRifaDetalles(null));
              dispatch(setIsRifa(true));
              refetch();
              setTimeout(() => { dispatch(setIsRifa(false)) }, 50);
            });
          })
        }} >

        <Row gutter={16}>

          <Col xs={24} sm={24} md={24} lg={24}>
            <FormPremiosDinamicos
              titulo="Premios instantáneo"
              form={formPremios}
              optionsPremios={OPTIONS_PREMIOS}
              monedaCarpeta={MONEDA_CARPETA?.simbolo}
              initialValues={rifaDetalles?.premiosYCantidadInstantaneo || []} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
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
                <h4>{`Lista de ganadores instantáneo : ${listaDeBoletosConPremioInstantaneo.length}`}</h4>
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
              const [firstPremio] = (item?.premios || []);

              return (
                <List.Item
                  key={item?._id}
                  actions={[
                    firstPremio?.sumarPremio ?
                      <Tag color="success" icon={<PlusOutlined />} >Sumar</Tag> :
                      <Tag color="warning" icon={<StopOutlined />} >No sumar</Tag>
                  ]}>
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={46} icon={<QrcodeOutlined style={{ fontSize: "36px", padding: "4px" }} />} />}
                    title={`Boleto: ${numerosJugados.filter(Boolean).join(" - ")}`}
                    description={(
                      <div>
                        <p style={{ paddingBottom: "0px", marginBottom: "0px" }}>
                          {`${MONEDA_CARPETA?.simbolo} ${firstPremio?.premio}`} | {firstPremio?.descripcion}
                        </p>
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

export default Instantaneo