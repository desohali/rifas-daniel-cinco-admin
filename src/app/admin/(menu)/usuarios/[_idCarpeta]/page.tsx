"use client";
import React from 'react';
import { Avatar, Badge, Button, Card, Col, Flex, Form, Row, Select, Table, Tag, Tooltip, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined, UserOutlined, EditOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons';
import { setOpenFormUsuario, setListaDeUsuarios, setIsUsuario } from '@/features/userSlice';
import { useActualizarRifaUsuariosMutation, useEliminarUsuarioMutation, useListarUsuariosPostMutation, useListarUsuariosQuery } from '@/services/userApi';
import FormUsuario from '@/components/FormUsuario';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { setIdCarpeta } from '@/features/adminSlice';

const enumTipoUsuario: any = {
  s: "Super Usuario",
  ss: "Semi Super Usuario",
  a: "Administrador",
  v: "Vendedor"
};



const Usuarios: React.FC = ({ params }: any) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { listaDeUsuarios, isUsuario } = useSelector((state: any) => state.user);
  const [formUsuario] = Form.useForm();

  React.useEffect(() => {
    dispatch(setIdCarpeta(params?._idCarpeta));
  }, []);


  const { listaDeRifas } = useSelector((state: any) => state.admin);
  const { openFormUsuario } = useSelector((state: any) => state.user);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([]);

  const [listarUsuariosPost, { data, error, isLoading }] = useListarUsuariosPostMutation();
  const [actualizarRifaUsuarios, response] = useActualizarRifaUsuariosMutation();
  const [eliminarUsuario, responseUsuario] = useEliminarUsuarioMutation();

  React.useEffect(() => {
    if (data) {
      dispatch(setListaDeUsuarios(data.map((u: any) => ({ ...u, _idRifa: u?._idRifa?._id, rifa: u?._idRifa, }))));
    }
  }, [data]);

  React.useEffect(() => {
    listarUsuariosPost({ _idCarpeta: params?._idCarpeta });
  }, [isUsuario]);

  const columns: any[] = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de usuarios, ${listaDeUsuarios.length || 0} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: 'Usuario',
          dataIndex: 'usuario',
          key: 'usuario',
        },
        {
          title: 'Tipo usuario',
          dataIndex: 'tipoUsuario',
          key: 'tipoUsuario',
          render: (text: any, record: any, index: any) => (enumTipoUsuario[text]),
        },
        {
          title: 'Estado',
          dataIndex: 'estado',
          key: 'estado',
          render: (text: any, record: any, index: any) => (
            <Tag color={text ? "success" : "warning"}>
              {text ? "Activo" : "Inactivo"}
            </Tag>
          ),
        },
        {
          title: 'Rifa',
          dataIndex: 'rifa',
          key: 'rifa',
          render: (text: any, record: any, index: any) => (`${record?.rifa?.fecha ?? ""} - ${record?.rifa?.nombre ?? ""}`),
        },
        {
          title: 'Descripción',
          dataIndex: 'descripcion',
          key: 'descripcion',
        },
        {
          title: '',
          align: 'center',
          width: 120,
          render: (_: any, record: any) => {
            return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Flex gap="small" style={{ width: '100%', justifyContent: 'center' }}>
                <Tooltip title="Eliminar">
                  <Button danger icon={<DeleteOutlined />} onClick={async (e) => {
                    e.stopPropagation();
                    const { isConfirmed } = await Swal.fire({
                      icon: "question",
                      title: `Seguro que deseas eliminar el usuario (${record?.usuario}) ?`,
                      text: '¿Estás seguro de que deseas proceder con esta acción?',
                      showDenyButton: true,
                      showCancelButton: false,
                      confirmButtonText: "Si",
                      denyButtonText: "No",
                    });

                    if (isConfirmed) {
                      await eliminarUsuario({ _idUsuario: record?._id });
                      dispatch(setIsUsuario(true));
                      setTimeout(() => { dispatch(setIsUsuario(false)) }, 100);
                    }
                  }} />
                </Tooltip>
                <Tooltip title="Editar">
                  <Button color="primary" icon={<EditOutlined />} onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setOpenFormUsuario(true));
                    formUsuario.resetFields();
                    formUsuario.setFieldsValue({ ...record, rifaAsignada: record?.rifaAsignada?._id || "" });
                  }} />
                </Tooltip>
                <Tooltip title="Boletos Vendidos">
                  <Button color="primary" icon={<QrcodeOutlined />} onClick={(e) => {
                    e.stopPropagation();
                    router.push(`./usuarios/${record?._id}`);
                  }} />
                </Tooltip>
              </Flex>
            </div>
          },

        },
      ]
    }
  ];


  return (
    <React.Suspense>
      <Row gutter={[16, 16]} style={{ padding: "1rem 0rem" }}>
        <Col className="gutter-row" xs={24} sm={4} md={4} lg={8}>
          <Select
            size="large"
            defaultValue=""
            disabled={!selectedRowKeys.length}
            onChange={async (_idRifa, { children }: any) => {
              if (_idRifa) {
                const { isConfirmed } = await Swal.fire({
                  icon: "question",
                  title: `Se dará permiso a ${selectedRowKeys.length} usuarios para la "${children}"`,
                  text: '¿Estás seguro de que deseas proceder con esta acción?',
                  showDenyButton: true,
                  showCancelButton: false,
                  confirmButtonText: "Si",
                  denyButtonText: "No",
                });

                if (isConfirmed) {
                  await actualizarRifaUsuarios({
                    _idRifa,
                    _idsArrayUsuarios: selectedRowKeys
                  });

                  listarUsuariosPost({ _idCarpeta: params?._idCarpeta });// listar usuarios actualizados
                  setSelectedRowKeys([]);
                  Swal.fire({
                    title: "Se registro con exito!",
                    text: "",
                    icon: "success"
                  });
                }
              }
            }}
            style={{ width: "100%" }}>
            <Select.Option value="">Seleccione Rifa</Select.Option>
            {listaDeRifas.map((r: any) => (
              <Select.Option key={r?._id} value={r?._id}>{`${r?.nombre} : ${r?.fecha}`}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col className="gutter-row" xs={24} sm={16} md={16} lg={8}>
          <Flex vertical gap="small" style={{ width: '100%', marginBottom: '12px' }}>
            <Button size='large' type="primary" onClick={() => {
              dispatch(setOpenFormUsuario(true));
              formUsuario.resetFields();
            }} icon={<PlusOutlined />}>
              Registrar usuario
            </Button>
          </Flex>
          {openFormUsuario && <FormUsuario formUsuario={formUsuario} />}
        </Col>
        <Col className="gutter-row" xs={24} sm={4} md={4} lg={8}>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={25}>
          <Table
            loading={isLoading}
            bordered
            rowKey="_id"
            dataSource={listaDeUsuarios}
            columns={columns}
            size='small'
            rowSelection={{
              selectedRowKeys,
              type: 'checkbox', // Para permitir la selección de una sola fila
              onChange: (selectedKeys) => {
                setSelectedRowKeys(selectedKeys);
              },
            }}
            onRow={(record: any) => ({
              onClick: (e) => {
                e.stopPropagation();
                console.log('record', record);
                const isSelected = selectedRowKeys.includes(record?._id);
                if (isSelected) {
                  setSelectedRowKeys(selectedRowKeys.filter((key: any) => key !== record?._id));
                } else {
                  setSelectedRowKeys([...selectedRowKeys, record?._id]);
                }
              },
            })}
            pagination={{
              pageSizeOptions: ['10', '20', '50', '100'], // Opciones de filas por página
              showSizeChanger: true, // Muestra el dropdown para cambiar el número de filas
              defaultPageSize: 10, // Número de filas por página predeterminado
            }}
            scroll={{
              x: 768,
            }} />
        </Col>
      </Row>

    </React.Suspense >
  )
}

export default Usuarios;