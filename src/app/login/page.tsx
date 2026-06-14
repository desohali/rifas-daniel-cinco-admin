"use client";
import React from 'react';
import swal from 'sweetalert';
import { useRouter } from 'next/navigation';
import { setUser } from '@/features/userSlice';
import { ArrowRightOutlined, LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useLoginValidadorQRMutation } from '@/services/userApi';
import { Form, Input, Button, Row, Col, Card, Tag, Typography, Spin } from 'antd';
const { Text } = Typography;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
    {label}
  </>
);

const App: React.FC = () => {

  const [autenticarUsuario, { data, error, isLoading }] = useLoginValidadorQRMutation();
  React.useEffect(() => {

    if (data) {
      if ((!data?._idCarpeta || data.tipoUsuario == "v" || !data?.estado) && data?.tipoUsuario != "s") {
        dispatch(setUser(null));
        swal("", "Usuario no autorizado!", "error");
        window.localStorage.removeItem("usuarioLuis");
      } else {
        window.localStorage.setItem("usuarioLuis", JSON.stringify(data));
        dispatch(setUser(data));
      }
    }

  }, [data]);

  const router = useRouter();
  const { user } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  React.useEffect(() => {
    const localStorageUser = window.localStorage.getItem("usuarioLuis");
    if (localStorageUser) {
      const userObject = JSON.parse(localStorageUser);
      if ((!userObject?._idCarpeta || userObject.tipoUsuario == "v") && data?.tipoUsuario != "s") {
        dispatch(setUser(null));
        // swal("", "Usuario no autorizado!", "error");
        window.localStorage.removeItem("usuarioLuis");
      } else {
        dispatch(setUser(userObject));
      }
    }
  }, []);

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (user) {
      if (user?.tipoUsuario == "s") {
        router.push('/admin');
      } else if (user?.tipoUsuario == "a") {
        router.push(`/admin/rifas/${user?._idCarpeta}}`);
      }

    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }

  return (
    <Row gutter={0}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24}>
        <div style={{
          maxWidth: '100%',
          padding: '2rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
          background: '#714b67',
          /* backgroundImage: 'url("/Leonardo_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat', */
        }}>
          <Typography.Title level={2} style={{ marginBottom: '30px', textAlign: 'center', color: "white" }}>
            Iniciar Sesión
          </Typography.Title>
          <Form
            {...layout}
            name="login_form"
            layout="vertical"
            initialValues={{
              usuario: '',
              password: ''
            }}
            onFinish={async (values) => {
              const { data }: any = await autenticarUsuario(values);
              if (!data || data?.tipoUsuario == "v" || !data?.estado) {
                swal("Alerta", "Usuario no autorizado!", "warning");
              }
            }}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="usuario"
              label={<span style={{ color: 'white', fontWeight: 'bold' }}>Usuario</span>}
              rules={[
                { required: true, message: 'Por favor ingresa tu nombre de usuario' },
                { min: 4, message: 'El usuario debe tener al menos 4 caracteres' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="Nombre de usuario"
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.2)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: 'white', fontWeight: 'bold' }}>Contraseña</span>}
              rules={[
                { required: true, message: 'Por favor ingresa tu contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Contraseña"
                style={{
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.2)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '30px' }}>
              <Button
                loading={isLoading}
                type="primary"
                htmlType="submit"
                block
                style={{
                  height: '45px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Ingresar
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {/* <Typography.Text style={{ color: 'white' }}>
                ¿No tienes una cuenta?
              </Typography.Text> */}
            </div>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default App;
