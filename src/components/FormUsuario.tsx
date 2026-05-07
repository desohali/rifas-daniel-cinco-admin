"use client";
import React from 'react';
import swal from 'sweetalert';
import { useDispatch, useSelector } from 'react-redux';
import { useListarRifasMutation, useRegistrarUsuarioMutation } from '@/services/userApi';
import { setIsRifa, setListaDeRifas, setOpenFormRifa } from '@/features/adminSlice';
import { Button, Col, Divider, Drawer, Flex, Form, Input, InputNumber, Row, Select, Switch, Tag } from 'antd';
import { setIsUsuario, setOpenFormUsuario } from '@/features/userSlice';
import { dbPermisos } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);

const style: React.CSSProperties = { width: '100%' };

const FormUsuario: React.FC<{ formUsuario: any }> = ({ formUsuario }) => {

  const dispatch = useDispatch();
  const { openFormUsuario } = useSelector((state: any) => state.user);
  const { listaDeRifas, idCarpeta } = useSelector((state: any) => state.admin);

  const existeIdUsuario = Boolean(formUsuario.getFieldValue("_id"));

  const [tipoUsuario, setTipoUsuario] = React.useState(formUsuario.getFieldValue("tipoUsuario"));

  const [
    registrarUsuario,
    { data: dataUsuario, error: errorUsuario, isLoading: isLoadingUsuario }
  ] = useRegistrarUsuarioMutation();

  const [listarRifas, { data, error, isLoading }] = useListarRifasMutation();

  React.useEffect(() => {
    if (idCarpeta) {
      listarRifas({ porCarpeta: true, _idCarpeta: idCarpeta });
    }
  }, [idCarpeta]);

  React.useEffect(() => {
    if (data) {
      dispatch(setListaDeRifas(data?.listaDeRifas));
    }
  }, [data]);


  return (
    <>
      <Drawer
        title={`${existeIdUsuario ? 'Actualizar' : 'Registrar'} usuario`}
        width={500}
        onClose={() => dispatch(setOpenFormUsuario(false))}
        open={openFormUsuario}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <Form
          form={formUsuario}
          name="login-form"
          layout="vertical"
          style={{ width: "100%" }}
          requiredMark={customizeRequiredMark}
          onValuesChange={(changedValues, allValues) => {
            console.log('changedValues :>> ', changedValues);
            console.log('allValues :>> ', allValues);
          }}
          initialValues={{
            _id: "",
            usuario: "",
            password: "",
            tipoUsuario: "v",
            estado: true,
            descripcion: "",
            // permisos
            controlDeBoletos: false,
            reporteSemanal: false,
            rifas: {
              sorteo: false,
              detalleDeRifa: false,
              editar: false,
              ganadoresQR: false
            }
          }}
          onFinish={async (values) => {

            if (values?._id && values?.tipoUsuario === "a") {
              await set(ref(dbPermisos, `rifas/${values?._id}_${idCarpeta}`), {
                rifas: {
                  editar: values?.rifas?.editar || false,
                  ganadoresQR: values?.rifas?.ganadoresQR || false,
                  sorteo: values?.rifas?.sorteo || false,
                  detalleDeRifa: values?.rifas?.detalleDeRifa || false,
                },
                controlDeBoletos: values?.controlDeBoletos || false,
                reporteSemanal: values?.reporteSemanal || false,
                estado: values?.estado || false,
              });
            }
            await registrarUsuario({ ...values, _idCarpeta: idCarpeta });
            dispatch(setIsUsuario(true));
            dispatch(setOpenFormUsuario(false));
            setTimeout(() => { dispatch(setIsUsuario(false)) }, 10);
            formUsuario.resetFields();
            swal("", `Usuario ${existeIdUsuario ? 'actualizado' : 'registrado'}!`, "success");
          }} >
          <Row gutter={16}>
            <Col xs={12} sm={12} md={12} lg={12}>
              <Form.Item
                name="_id"
                label="_id"
                style={{ display: "none" }}
              >
                <Input placeholder="_id" />
              </Form.Item>
              <Form.Item
                name="usuario"
                label="Usuario"
                rules={[{ required: true, message: 'Por favor, ingrese usuario' }]}
              >
                <Input placeholder="Usuario" style={style} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12}>
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[{ required: true, message: 'Por favor, ingrese contraseña' }]}
              >
                <Input placeholder="Contraseña" style={style} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tipoUsuario"
                label="Tipo usuario"
                rules={[{ required: true, message: 'Por favor, seleccione tipo usuario' }]}
              >
                <Select defaultValue="v" onChange={(value) => {
                  setTipoUsuario(value);
                }}>
                  <Select.Option value="v">Vendedor</Select.Option>
                  <Select.Option value="a">Administrador</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estado"
                label="Estado"
                rules={[{ required: true, message: 'Por favor, seleccione estado' }]}
              >
                <Select defaultValue={true}>
                  <Select.Option value={true}>Activo</Select.Option>
                  <Select.Option value={false}>Inactivo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                name="_idRifa"
                label="Rifa"
              >
                <Select defaultValue="">
                  <Select.Option value="">Seleccione Rifa</Select.Option>
                  {listaDeRifas.map((r: any) => (
                    <Select.Option key={r?._id} value={r?._id}>{`${r?.nombre} : ${r?.fecha}`}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                name="descripcion"
                label="Descripción"
              >
                <Input.TextArea rows={1} placeholder="Descripción" />
              </Form.Item>
            </Col>
          </Row>

          {tipoUsuario === "a" && <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Divider>Permisos de administrador</Divider>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="Control de boletos"
                name="controlDeBoletos"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Reporte semanal"
                name="reporteSemanal"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>

              <Form.Item
                label="Sorteo"
                name={["rifas", "sorteo"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Detalle de rifa"
                name={["rifas", "detalleDeRifa"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Editar rifa"
                name={["rifas", "editar"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Ganadores QR"
                name={["rifas", "ganadoresQR"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

            </Col>
          </Row>}


          <Row gutter={16}>
            <Col span={24}>
              <Flex vertical gap="small" style={{ width: '50%', margin: "auto" }}>
                <Button loading={isLoadingUsuario} type="primary" block htmlType="submit">
                  {existeIdUsuario ? 'Actualizar' : 'Registrar'}
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>
      </Drawer >
    </>
  );
};

export default FormUsuario;