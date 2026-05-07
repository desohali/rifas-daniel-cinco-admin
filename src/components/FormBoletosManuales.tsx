"use client"
import swal from 'sweetalert';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MinusCircleOutlined, PlusOutlined, QrcodeOutlined, StopOutlined } from '@ant-design/icons';
import { AutoComplete, Avatar, Button, Flex, Form, Input, List, Select, Space, Tag, Tooltip } from 'antd';
import { useEliminarPremioBoletoMutation, useListarBoletosQueryQuery, useRegistrarPremioBoletosMutation } from '@/services/userApi';
import { setListaDeBoletos, setListaDeBoletosConPremio } from '@/features/adminSlice';
import { DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import MONEDAS from '../../public/monedas.json'; // Ruta relativa al archivo JSON
import {
  FileImageOutlined,
} from "@ant-design/icons";

const style: React.CSSProperties = { width: '100%' };

const FormBoletosManuales: React.FC = () => {

  const { _idCarpeta } = useParams();

  const dispatch = useDispatch();
  const [value, setValue] = React.useState('');
  const [eliminarPremioBoleto, {
    data: dataBoleto,
    error: errorBoleto,
    isLoading: isLoadingBoleto
  }] = useEliminarPremioBoletoMutation();

  const {
    rifaDetalles,
    listaDeBoletos = [],
    listaDeBoletosConPremio = [],
    listaDeCarpetas = [],
  } = useSelector((state: any) => state.admin);

  const CARPETA: any = (listaDeCarpetas.find(({ _id }: any) => _id == _idCarpeta));

  const MONEDA_CARPETA = MONEDAS.find(({ pais }: any) => pais == CARPETA?.moneda);
  const OPTIONS_PREMIOS = (CARPETA?.premios || []);

  const BOLETOS_CON_PREMIO = listaDeBoletosConPremio.map((b: any) => ({
    ...b,
    premios: (b?.premios || []).map((p: any) => {
      return OPTIONS_PREMIOS.find(({ _id }: any) => p.includes(_id));
    })
  }));

  const {
    data,
    error,
    isLoading
  } = useListarBoletosQueryQuery({ _idRifa: rifaDetalles?._id });
  React.useEffect(() => {
    if (data) {
      dispatch(setListaDeBoletos(data));
    }

    return () => {
      dispatch(setListaDeBoletos([]));
    }
  }, [data]);


  const {
    data: dataBoletosGanadores,
    error: errorBoletosGanadores,
    refetch
  } = useListarBoletosQueryQuery({ _idRifa: rifaDetalles?._id, boletosGanadores: true });
  React.useEffect(() => {
    if (dataBoletosGanadores) {
      dispatch(setListaDeBoletosConPremio(dataBoletosGanadores));
    }
  }, [dataBoletosGanadores]);

  const [registrarPremioBoletos, { isLoading: isLoadingRegistrar }] = useRegistrarPremioBoletosMutation();

  const boletosSinPremio = (listaDeBoletos || [])
    .map((b: any) => ({ value: b.premioMayor }));

  const [form] = Form.useForm();
  const refBoletos = React.useRef<any>();

  const onFinish = (values: any) => {

    if (!Boolean(Object.keys(values?.boletos).length)) return;

    const boletosMap = (values?.boletos || []).map((b: any) => {
      return {
        ...b,
        montoPremio: OPTIONS_PREMIOS.find(({ _id }: any) => (_id == b.premio))?.premio || 0
      }
    });

    registrarPremioBoletos({ boletos: JSON.stringify(boletosMap) })
      .then(async () => {
        swal("", "Los boletos se actualizaron correctamente!", "success");
        form.resetFields();
        refetch();
      });
  };


  return (
    <div style={{ width: "100%" }}>
      <AutoComplete
        allowClear
        bordered
        disabled={isLoading}
        value={value}
        style={{ width: "100%", marginBottom: "12px" }}
        options={boletosSinPremio}
        onSearch={(search) => {
          setValue(search);
        }}
        onSelect={(data) => {
          const findBoleto = listaDeBoletos.find((b: any) => (b.premioMayor == data));
          if (findBoleto) {
            refBoletos.current({ ...findBoleto, premio: "" });
            setValue("");
          }
        }}
        placeholder="Buscar ganadores QR manuales"
        filterOption={(inputValue, option: any) => {
          return option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        }}
      />

      <Form
        form={form}
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        style={{ maxWidth: 600, width: "100%", }}
        autoComplete="off"
      >
        <Form.List name="boletos" >
          {(fields, { add, remove }) => {
            refBoletos.current = add.bind(null);
            return (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const boleto = form.getFieldValue("boletos")[name];
                  return (
                    <Space key={key} style={{ display: 'flex', justifyContent: "space-between", width: "100%", marginBottom: 8 }} align="baseline">
                      <Form.Item
                        label={`Boleto: ${boleto?.premioMayor || ""} - ${boleto?.premioMenor || ""} - ${boleto?.premioTres || ""} - ${boleto?.premioCuatro || ""} - ${boleto?.premioCinco || ""}`}
                        {...restField}
                        name={[name, 'premioMayor']}
                      >
                      </Form.Item>
                      <Form.Item
                        style={{ display: "none" }}
                        {...restField}
                        name={[name, '_id']}
                        rules={[{ required: true, message: 'Ingrese _id' }]}
                      >
                        <Input placeholder="_id" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'premio']}
                        style={{ minWidth: "200px" }}
                        rules={[{ required: true, message: 'Seleccione premio' }]}
                      >
                        {/* <Select>
                          {PREMIOS_ARRAY.map(([key, value]: any) => (
                            <Select.Option value={key}>{value}fgfdg</Select.Option>
                          ))}
                        </Select> */}
                        <Select
                          optionFilterProp="label"
                          optionLabelProp="label"
                          // mode="multiple"
                          allowClear
                          style={style}
                          placeholder="Seleccione Premios"
                          onChange={() => { }}
                        // options={OPTIONS_PREMIOS}
                        >
                          {OPTIONS_PREMIOS.map((premio: any) => (
                            <Select.Option
                              key={premio._id}
                              value={premio._id}
                              label={premio.descripcion || premio.premio}
                            >
                              <div>
                                <span style={{ color: "#888" }}>
                                  {MONEDA_CARPETA?.simbolo} {premio.premio}
                                </span>
                                <p style={{ paddingBottom: "0px", marginBottom: "0px" }}>
                                  {premio.descripcion}
                                </p>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  )
                })}
              </>
            )
          }}
        </Form.List>
        <Form.Item>
          <Flex vertical gap="small" style={{ width: '50%', margin: "auto" }}>
            <Button loading={isLoadingRegistrar} type="primary" htmlType="submit" block>
              Registrar
            </Button>
          </Flex>
        </Form.Item>
      </Form>

      <List
        style={{ maxHeight: "300px", overflowY: "auto" }}
        size="small"
        header={(
          <div>
            <h4>{`Lista de ganadores QR manuales : ${listaDeBoletosConPremio.length}`}</h4>
            <h4>{`Total : ${BOLETOS_CON_PREMIO.reduce((a: any, cv: any) => {
              return (a + (cv?.premios || []).reduce((a2: any, cv2: any) => {
                return (a2 + (cv2?.sumarPremio ? cv2?.premio : 0))
              }, 0))
            }, 0)?.toLocaleString('en-US').replace(/,/g, '.')}`}
            </h4>
          </div>
        )}
        bordered
        dataSource={BOLETOS_CON_PREMIO}
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
                // <Tooltip title="Eliminar Premio">
                //   <Button disabled loading={isLoadingBoleto} danger type="primary" onClick={async () => {
                //     const res: any = await eliminarPremioBoleto({ _id: item?._id });
                //     if (res?.data?.status) {
                //       swal("", "Boleto eliminado correctamente!", "success");
                //       refetch();
                //     } else {
                //       swal("", res?.data?.error, "error");
                //     }
                //   }} shape="circle" icon={<DeleteOutlined />} />
                // </Tooltip>
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
    </div>
  )
};

export default FormBoletosManuales;