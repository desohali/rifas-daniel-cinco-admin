"use client"

import { useBuscarRifaMutation, useListarBoletosQueryQuery, useListarUsuariosPostMutation } from '@/services/userApi'
import { Avatar, Badge, Button, Col, Divider, List, Result, Row, Select, Spin, Tag, Typography } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PlusOutlined, QrcodeOutlined, StopOutlined } from "@ant-design/icons";
import GoogleMaps from '@/components/GoogleMaps'
import { formatPremio } from '@/helpers/premios'
import MONEDAS from '../../../../public/monedas.json'; // Ruta relativa al archivo JSON

function formatearFecha(fechaStr: string) {

  // Descomponer la fecha en componentes
  const [year, month, day] = fechaStr.split('-').map(Number);

  // Crear una fecha con los componentes especificados
  const fecha = new Date(year, month - 1, day);

  // Opciones de formato
  const opciones: any = {
    weekday: 'long',  // nombre completo del día de la semana
    day: 'numeric',   // día del mes
    month: 'long',    // nombre completo del mes
    year: 'numeric'   // año
  };

  // Formateador de fechas
  const formateador = new Intl.DateTimeFormat('es-ES', opciones);

  // Formatear y devolver la fecha
  return formateador.format(fecha);
}

const page = ({ params, searchParams }: any) => {


  const dispatch = useDispatch();
  const { _idRifa } = params;
  const { _idCarpeta } = searchParams;

  const [boletos, setBoletos] = React.useState<any[]>([]);
  const [usuarios, setUsuarios] = React.useState<any[]>([]);
  const [rifa, setRifa] = React.useState<any>({});
  const [loading, setloading] = React.useState(true);

  const [boletosFiltrados, setBoletosFiltrados] = React.useState<any[]>([]);

  const MONEDA_CARPETA = MONEDAS.find((moneda: any) => (moneda?.pais == rifa?._idCarpeta?.moneda));
  const OPTIONS_PREMIOS = (rifa?._idCarpeta?.premios || []);
  console.log('boletosFiltrados :>> ', boletosFiltrados);
  const [listarUsuarios, responseUsuarios] = useListarUsuariosPostMutation();

  const { data, error, isLoading } = useListarBoletosQueryQuery({ _idRifa, boletosVendidos: true });
  React.useEffect(() => {
    if (data) {
      setBoletos(data);

      setBoletosFiltrados(data.map((b: any) => ({
        ...b,
        premios: (b?.premios || []).map((p: string) => {
          return OPTIONS_PREMIOS.find(({ _id }: any) => (_id == p));
        }),
        premioInstantaneo: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b?.premioInstantaneo)),
        premioParGuarani: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b?.premioParGuarani)),
      })));
    }
  }, [data, usuarios]);


  const [buscarRifa, responseRifa] = useBuscarRifaMutation();
  React.useEffect(() => {
    buscarRifa({ _id: _idRifa })
      .then(async (rifa: any) => {
        setRifa(rifa?.data);
        const listaDeVendedores: any = await listarUsuarios({ _idCarpeta, idsUsuarios: rifa?.data?.vendedores || [] });

        const vendedoresMap: any[] = [];
        (rifa?.data?.vendedores || []).forEach((idVendedor: any) => {

          let findVendedor = (listaDeVendedores?.data || []).find((vendedor: any) => vendedor?._id == idVendedor);
          findVendedor ??= { _id: idVendedor, usuario: "Desconocido", isDesconocido: true };
          vendedoresMap.push({
            ...findVendedor,
            boletosVendidos: boletos.filter((boleto: any) => {
              return findVendedor?.isDesconocido ? !boleto?._idUsuarioVendedor : boleto?._idUsuarioVendedor?._id == findVendedor?._id
            })
          })
        });

        setUsuarios(vendedoresMap);

        setloading(false);
      });
  }, [boletos]);



  const TOTAL_PREMIOS_QR = boletos.map((b: any) => {
    return {
      ...b,
      premios: (b?.premios || []).filter((v: any) => v).map((p: string) => {
        return OPTIONS_PREMIOS.find(({ _id }: any) => (_id == p));
      })
    }
  }).reduce((a: any, cv: any) => {
    return a + (cv?.premios || []).reduce((a: any, cv: any) => {
      return a + (cv?.sumarPremio ? cv?.premio : 0);
    }, 0);
  }, 0);

  const TOTAL_PREMIOS_PAR_GUARANI = boletos.map((b: any) => {
    return {
      ...b,
      premioParGuarani: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b?.premioParGuarani)),
    }
  }).reduce((a: any, cv: any) => {
    return a + (cv?.premioParGuarani?.premio || 0);
  }, 0);

  const TOTAL_PREMIOS_INSTANTANEOS = boletos.map((b: any) => {
    return {
      ...b,
      premioInstantaneo: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b?.premioInstantaneo)),
    }
  }).reduce((a: any, cv: any) => {
    return a + (cv?.premioInstantaneo?.premio || 0);
  }, 0)


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }



  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={18} lg={18}>
        {/* <GoogleMaps data={boletosFiltrados} /> */}
      </Col>
      <Col xs={24} sm={24} md={6} lg={6}>

        <Result
          style={{ padding: "24px" }}
          icon={<QrcodeOutlined style={{ fontSize: 64 }} />}
          title={rifa?.nombre}
          subTitle={(
            <div>

              <p>{rifa?.fecha}</p>
              <p>{rifa?.fecha ? formatearFecha(rifa?.fecha || "") : rifa?.fecha}</p>
              <p>Cantidas de boletos vendidos {boletos.length}</p>
              <p>Cantidad de vendedores {(rifa?.vendedores || []).length}</p>
              <Divider />
              <p>Total ventas {(boletos.length * (rifa?.precio * 1))?.toLocaleString('en-US')?.replace(/,/g, '.')}</p>
              {/* <p>Cantidad de premios {(data || []).filter((boleto: any) => (boleto?.premio))?.length}</p> */}
              <p>Total de premios QR {TOTAL_PREMIOS_QR?.toLocaleString('en-US')?.replace(/,/g, '.')}</p>
              <p>Total de premios par guaraní {TOTAL_PREMIOS_PAR_GUARANI?.toLocaleString('en-US')?.replace(/,/g, '.')}</p>
              <p>Total de premios instantáneos {TOTAL_PREMIOS_INSTANTANEOS?.toLocaleString('en-US')?.replace(/,/g, '.')}</p>
              <p>Total premios {(TOTAL_PREMIOS_QR + TOTAL_PREMIOS_PAR_GUARANI + TOTAL_PREMIOS_INSTANTANEOS)?.toLocaleString('en-US')?.replace(/,/g, '.')}</p>
            </div>
          )}
          extra={[
            <Select
              defaultValue={""}
              style={{ width: "100%" }}
              placeholder="Selecciona un vendedor"
              onChange={(value) => {
                if (value) {
                  // setBoletosFiltrados(boletos.filter((boleto) => (boleto?._idUsuarioVendedor?._id == value)));
                  const findVendedor = usuarios.find((usuario: any) => (usuario?._id == value));
                  setBoletosFiltrados((findVendedor?.boletosVendidos || []).map((b: any) => ({
                    ...b,
                    premios: (b?.premios || []).map((p: string) => {
                      return OPTIONS_PREMIOS.find(({ _id }: any) => (_id == p));
                    }),
                    premioParGuarani: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b?.premioParGuarani)),
                    premioInstantaneo: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b?.premioInstantaneo)),
                  })));
                } else {
                  setBoletosFiltrados(boletos);
                }
              }}
            >
              {usuarios.map(({ _id, usuario, boletosVendidos }) => (
                <Select.Option key={_id} value={_id}>
                  {`${usuario} - ${(boletosVendidos || [])?.length} boletos`}
                </Select.Option>
              ))}

              <Select.Option value="">
                Todos
              </Select.Option>

            </Select>
          ]}
        />
        <Divider>Boletos vendidos {boletosFiltrados?.length}</Divider>
        <List
          style={{ height: "50vh", overflowY: "auto" }}
          itemLayout="horizontal"
          dataSource={boletosFiltrados}
          renderItem={(item: any, index) => {

            const algunPremio = item?.premios.some((p: any) => p) || item?.premioParGuarani || item?.premioInstantaneo

            return (
              <List.Item
                key={item?._id}
                style={{
                  background: algunPremio ? "teal" : "white",
                  padding: "1rem"
                }}>
                <List.Item.Meta
                  avatar={<Avatar shape="square" size={46} icon={<QrcodeOutlined style={{ fontSize: "36px", padding: "4px" }} />} />}
                  style={{
                    color: algunPremio ? "white" : "black"
                  }}
                  title={<Typography.Text strong style={{ color: algunPremio ? "white" : "black" }}>Boleto: {item?.premioMayor} - {item?.premioMenor || ""}</Typography.Text>}
                  description={(
                    <div>

                      {(item?.premios || []).map((p: any, index: number) => {

                        if (item?.isEspecial) {
                          return (
                            <>
                              {index === 0 && <Divider style={{ color: "white", borderColor: "white" }}>Premios QR</Divider>}
                              <p style={{ paddingBottom: "0px", marginBottom: "0px", color: "white", fontWeight: "bold" }}>
                                🎁 {MONEDA_CARPETA?.simbolo} {p?.premio} | {p?.descripcion || "❌"} {
                                  p?.sumarPremio
                                    ? <Tag color="success" icon={<PlusOutlined />} style={{ float: "right" }} >Sumar</Tag>
                                    : <Tag color="warning" icon={<StopOutlined />} style={{ float: "right" }} >No sumar</Tag>
                                }
                              </p>
                            </>
                          );
                        }

                        return (
                          <>
                            <Divider style={{ color: "white", borderColor: "white" }}>Premios QR</Divider>
                            <p style={{ paddingBottom: "0px", marginBottom: "0px", color: "white", fontWeight: "bold" }}>
                              {`${MONEDA_CARPETA?.simbolo} ${p?.premio}`} | {p?.descripcion} {p?.sumarPremio ? <Tag color="success" icon={<PlusOutlined />} style={{ float: "right" }} >Sumar</Tag> : <Tag color="warning" icon={<StopOutlined />} style={{ float: "right" }} >No sumar</Tag>}
                            </p>
                          </>
                        )
                      })}

                      {item?.premioParGuarani && (
                        <>
                          <Divider style={{ color: "white", borderColor: "white" }}>Premio par guaraní</Divider>
                          <p style={{ paddingBottom: "0px", marginBottom: "0px", color: "white", fontWeight: "bold" }}>
                            {`${MONEDA_CARPETA?.simbolo} ${item?.premioParGuarani?.premio}`} | {item?.premioParGuarani?.descripcion} {item?.premioParGuarani?.sumarPremio ? <Tag color="success" icon={<PlusOutlined />} style={{ float: "right" }} >Sumar</Tag> : <Tag color="warning" icon={<StopOutlined />} style={{ float: "right" }} >No sumar</Tag>}
                          </p>
                        </>
                      )}

                      {item?.premioInstantaneo && (
                        <>
                          <Divider style={{ color: "white", borderColor: "white" }}>Premio instantáneo</Divider>
                          <p style={{ paddingBottom: "0px", marginBottom: "0px", color: "white", fontWeight: "bold" }}>
                            {`${MONEDA_CARPETA?.simbolo} ${item?.premioInstantaneo?.premio}`} | {item?.premioInstantaneo?.descripcion} {item?.premioInstantaneo?.sumarPremio ? <Tag color="success" icon={<PlusOutlined />} style={{ float: "right" }} >Sumar</Tag> : <Tag color="warning" icon={<StopOutlined />} style={{ float: "right" }} >No sumar</Tag>}
                          </p>
                        </>
                      )}
                      <p style={{ color: algunPremio ? "white" : "black" }}>Vendedor: {item?._idUsuarioVendedor?.usuario || "Desconocido"}</p>
                    </div>
                  )}
                />
              </List.Item>
            )
          }}
        />
      </Col>
    </Row>

  )
}

export default page