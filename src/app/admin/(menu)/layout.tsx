"use client";
import React, { useState } from 'react';
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  GiftOutlined,
  TagsOutlined,
  BarChartOutlined,
  QrcodeOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, List, Menu, theme, Grid, Badge, Drawer, Dropdown } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useBuscarCarpetaMutation } from '@/services/userApi';
import { setUser } from '@/features/userSlice';
import LinearProgress from '@/components/LinearProgress';

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const layout = ({ children }: { children: React.ReactNode }) => {

  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);
  const [showLoading, setShowLoading] = React.useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const screens = useBreakpoint();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state: any) => state.user);
  const { idCarpeta } = useSelector((state: any) => state.admin);

  const [buscarCarpeta, { data: dataCarpeta, isLoading: isLoadingCarpeta }] = useBuscarCarpetaMutation();

  const [detalleDeCarpeta, setDetalleDeCarpeta] = React.useState<any>(null);
  React.useEffect(() => {
    if (idCarpeta) {
      buscarCarpeta({ _id: idCarpeta })
        .then((carpeta: any) => {
          setDetalleDeCarpeta(carpeta.data);
        });
    }
  }, [idCarpeta]);

  const MENU_LOGIN = (
    <Menu
      onClick={(value) => {
        window.localStorage.removeItem("usuarioLuis");
        dispatch(setUser(null));
        router.push('/login');
      }}
    >
      <Menu.Item key="username" disabled style={{ cursor: 'default' }}>
        {user?.usuario?.toUpperCase()}
      </Menu.Item>
      <Menu.Item key="logout" danger>CERRAR SESIÓN</Menu.Item>
    </Menu>
  );

  const MENU_LATERAL: any[] = [
    /* {
      key: '1',
      icon: <GiftOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
      label: <span style={{ fontWeight: 'bold' }}>RIFAS</span>,
    },
    {
      key: '2',
      icon: <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
      label: <span style={{ fontWeight: 'bold' }}>USUARIOS</span>,
    },
    {
      key: '3',
      icon: <GiftOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
      label: <span style={{ fontWeight: 'bold' }}>PREMIOS QR</span>,
    },
    {
      key: '4',
      icon: <QrcodeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
      label: <span style={{ fontWeight: 'bold' }}>VALIDADOR QR</span>,
    },
    {
      key: '5',
      icon: <BarChartOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
      label: <span style={{ fontWeight: 'bold' }}>REPORTES</span>,
    }, */
  ];

  if (user && user?.tipoUsuario == "a") {
    MENU_LATERAL.shift();
  }

  const SIDER_MENU = (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed && screens.md}
      width={280}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0px",
          background: "#714b67",
          color: "white",
          // borderBottom: "1px solid #e5e5e5",
          overflow: "hidden",
        }}
      >
        <Image
          style={{ objectFit: 'cover', cursor: 'pointer' }}
          width={280}
          height={80}
          layout="fixed"
          alt="Logo"
          src="/Leonardo_1.jpg"
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={100}
          onClick={() => router.replace('/admin')}
        />

      </Header>
      <div
        style={{
          padding: collapsed ? "16px 8px 8px" : "1.5rem 1rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "10px",
          transition: "all 0.3s ease"
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={[{ nombre: detalleDeCarpeta?.nombreCarpeta, cargo: user?.tipoUsuario == "s" ? "Super Administrador" : "Administrador" }]}
          renderItem={(user) => (
            <List.Item style={{ border: "none" }}>
              <List.Item.Meta
                avatar={
                  <div
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      const target = e.currentTarget.querySelector('.ant-avatar') as HTMLElement;
                      if (target) target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      const target = e.currentTarget.querySelector('.ant-avatar') as HTMLElement;
                      if (target) target.style.transform = "scale(1)";
                    }}
                  >
                    <Avatar
                      shape='square'
                      size={50}
                      style={{
                        backgroundColor: "#1890ff",
                        boxShadow: "0 2px 8px rgba(24,144,255,0.5)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <FolderOpenOutlined style={{ fontSize: "24px" }} />
                    </Avatar>
                  </div>
                }
                title={
                  (!collapsed || !screens.md) && (
                    <span style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "16px",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      {user.nombre}
                    </span>
                  )
                }
                description={
                  (!collapsed || !screens.md) && (

                    <Badge status="success" text={(
                      <span style={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "14px",
                      }}>
                        {user.cargo}
                      </span>
                    )} />

                  )
                }
              />
            </List.Item>
          )}
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname.includes('/rifas') ? '1' :
          pathname.includes('/usuarios') ? '2' :
            pathname.includes('/premios') ? '3' :
              pathname.includes('/boletos-devueltos') ? '4' :
                pathname.includes('/reportes') ? '5' : '1']}
        style={{ marginTop: '20px' }}
        onClick={({ key }) => {
          setShowLoading(true);
          switch (key) {
            case '1':
              router.push(`/admin/rifas/${idCarpeta}`);
              break;
            case '2':
              router.push(`/admin/usuarios/${idCarpeta}`);
              break;
            case '3':
              router.push(`/admin/premios/${idCarpeta}`);
              break;
            case '4':
              router.push(`/admin/boletos-devueltos/${idCarpeta}`);
              break;
            case '5':
              router.push(`/admin/reportes/${idCarpeta}`);
              break;
            default:
              break;
          }

          setTimeout(() => {
            setShowLoading(false);
          }, 1000);

          // Ocultamos el Drawer siempre para moviles
          setCollapsed(false);
        }}
        items={MENU_LATERAL}
      />
    </Sider>
  );


  return (
    <Layout style={{ minHeight: "100vh" }}>
      {showLoading && (
        <div
          style={{
            width: "100%",
            position: "absolute",
            left: "0px",
            height: "4px",
            zIndex: 9999,
          }}
        >
          <LinearProgress />
        </div>
      )}

      {screens.md ? (
        SIDER_MENU
      ) : (
        <Drawer
          closable={false}
          placement="left"
          width={280}
          onClose={() => setCollapsed(!collapsed)}
          open={collapsed}
          styles={{
            body: {
              backgroundColor: "#714b67",
              padding: 0,
              margin: 0,
            },
          }}
        >
          {SIDER_MENU}
        </Drawer>
      )}
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ float: "right", alignItems: "center" }}>
            <Dropdown overlay={MENU_LOGIN} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ marginRight: "1rem" }} />

            </Dropdown>
          </div>
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
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>Copyright ©2024 | Juego De Rifas. Todos los derechos reservados.</Footer>
      </Layout>

    </Layout>
  );
};

export default layout;