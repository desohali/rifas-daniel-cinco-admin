"use client";
import React from 'react';
import { Avatar, Badge, Button, Card, Col, Flex, Form, Row, Select, Table, Tag, Tooltip, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined, UserOutlined, EditOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons';
import { setOpenFormUsuario, setListaDeUsuarios } from '@/features/userSlice';
import { useActualizarRifaUsuariosMutation, useListarUsuariosQuery } from '@/services/userApi';
import FormUsuario from '@/components/FormUsuario';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const { Meta } = Card;
const { Text } = Typography;
const enumTipoUsuario: any = {
  s: "Super Usuario",
  ss: "Semi Super Usuario",
  a: "Administrador",
  v: "Vendedor"
};



const Usuarios: React.FC = () => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { listaDeUsuarios, isUsuario } = useSelector((state: any) => state.user);
  const [formUsuario] = Form.useForm();

  const { listaDeRifas } = useSelector((state: any) => state.admin);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([]);

  const { data, error, isLoading, refetch } = useListarUsuariosQuery({});
  const [actualizarRifaUsuarios, response] = useActualizarRifaUsuariosMutation();

  React.useEffect(() => {
    if (data) {
      dispatch(setListaDeUsuarios(data.map((u: any) => ({ ...u, _idRifa: u?._idRifa?._id, rifa: u?._idRifa, }))));
    }
  }, [data]);

  React.useEffect(() => {
    if (isUsuario) refetch();
  }, [isUsuario]);
  const style: React.CSSProperties = { border: "1px solid rgba(0,0,0,.1)", borderRadius: ".5rem", padding: ".5rem" };

  const columns: any[] = [
    {
      title: 'N°',
      dataIndex: 'numero',
      key: 'numero',
      render: (text: any, record: any, index: any) => (index + 1),
    },
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
      title: 'Descripcion',
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
            <Tooltip title="Editar">
              <Button icon={<EditOutlined />} onClick={(e) => {
                e.stopPropagation();
                dispatch(setOpenFormUsuario(true));
                formUsuario.resetFields();
                formUsuario.setFieldsValue({ ...record, rifaAsignada: record?.rifaAsignada?._id || "" });
              }} />
            </Tooltip>
            <Tooltip title="Boletos Vendidos">
              <Button icon={<QrcodeOutlined />} onClick={(e) => {
                e.stopPropagation();
                router.push(`./usuarios/${record?._id}`);
              }} />
            </Tooltip>
          </Flex>
        </div>
      },

    },
  ];


  return (
    <React.Suspense>
      <Row gutter={8} style={{ padding: "1rem 0rem" }}>
        <Col className="gutter-row" xs={24} sm={4} md={4} lg={8}>
          <Select
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

                  refetch();// listar usuarios actualizados
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
            <Button type="primary" onClick={() => {
              dispatch(setOpenFormUsuario(true));
              formUsuario.resetFields();
            }} icon={<PlusOutlined />}>
              Registrar usuario
            </Button>
          </Flex>
          <FormUsuario formUsuario={formUsuario} />
        </Col>
        <Col className="gutter-row" xs={24} sm={4} md={4} lg={8}>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={25}>
          <Table
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