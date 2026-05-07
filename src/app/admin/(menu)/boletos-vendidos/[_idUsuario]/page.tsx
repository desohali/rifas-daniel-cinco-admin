"use client";
import { setListaDeBoletos } from '@/features/adminSlice';
import { useListarBoletosVendidosMutation } from '@/services/userApi';
import { Avatar, Button, Col, Form, Input, List, Row, Tag, Tooltip, Typography } from 'antd';
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

const App: React.FC<{ params: any }> = ({ params }: any) => {

  const [formBoletos] = Form.useForm();
  const dispatch = useDispatch();

  const [date, setDate] = React.useState<string>("");
  const [listarBoletosVendidos, { data, isLoading, error }] = useListarBoletosVendidosMutation();
  const listaDeBoletos = useSelector((state: any) => state.admin.listaDeBoletos);

  React.useEffect(() => {
    const selectedDateNow = new Date();
    // Crea una nueva fecha utilizando los componentes de la fecha y hora actual
    const [selectedDate] = selectedDateNow.toISOString().split('T');
    setDate(selectedDate);

    formBoletos.setFieldsValue({ date: selectedDate });
  }, []);


  React.useEffect(() => {
    if (date) {
      listarBoletosVendidos({
        user: params._idUsuario,
        date: `${date}T05:00:00.000Z`
      }).then((boletos: any) => {
        dispatch(setListaDeBoletos(boletos?.data));
      });
    }
  }, [date]);

  return (
    <>
      <Row justify="center" align="middle" style={{ width: "100vw" }}>
        <Col xs={20} sm={18} md={14} lg={12}>
          <Form {...layout}
            form={formBoletos}
            name="login-form"
            initialValues={{ date: '' }}
            requiredMark={customizeRequiredMark}>
            <Form.Item label={<Text>Fecha</Text>} name="date" rules={[{ required: true, message: 'Por favor seleccione fecha!' }]}>
              <Input type='date' onChange={(e: any) => {
                setDate(e.target.value);
              }} />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row justify="center" align="middle" style={{ width: "100vw" }}>
        <Col xs={20} sm={18} md={14} lg={12}>
          <List
            header={<Text>{`Boletos vendidos ${listaDeBoletos?.dataSize}`}</Text>}
            itemLayout="horizontal"
            dataSource={listaDeBoletos?.data}
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
