"use client"
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Divider, Drawer, Flex, Input, List, Menu, Radio, Segmented, Select } from 'antd';
import { useListarBoletosQueryQuery } from '@/services/userApi';
import { setListaDeBoletos, setListaDeBoletosConPremio, setOpenFormBoleto, setRifaDetalles } from '@/features/adminSlice';
import FormBoletosManuales from './FormBoletosManuales';
import FormBoletosAutomaticos from './FormBoletosAutomaticos';
import { EyeOutlined, EditOutlined, CloudDownloadOutlined, FilePdfOutlined, SyncOutlined, FormOutlined, GiftOutlined, FireOutlined, TagsOutlined, StarOutlined } from '@ant-design/icons';
import FormBoletosEspeciales from './FormBoletosEspeciales';
import FormRaspaYGana from './FormRaspaYGana';
import ParGuarani from './ParGuarani';
import Instantaneo from './Instantaneo';

const FormBoleto: React.FC = () => {

  const dispatch = useDispatch();
  const [value, setValue] = React.useState('random');

  const {
    openFormBoleto,
    rifaDetalles
  } = useSelector((state: any) => state.admin);

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
    error: errorBoletosGanadores
  } = useListarBoletosQueryQuery({ _idRifa: rifaDetalles?._id, boletosGanadores: true });

  React.useEffect(() => {
    if (dataBoletosGanadores) {
      dispatch(setListaDeBoletosConPremio(dataBoletosGanadores));
    }
  }, [dataBoletosGanadores]);


  return (
    <Drawer
      title="Premios ganadores QR"
      width={500}
      onClose={() => {
        dispatch(setOpenFormBoleto(false));
        dispatch(setRifaDetalles(null));
      }}
      open={openFormBoleto}
      style={{ width: "100%", }}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}>

      <div style={{ width: '100%' }}>
        <Segmented
          size="large"
          block
          options={[
            { value: 'random', label: 'Automáticos', icon: <SyncOutlined spin /> },
            { value: 'manual', label: 'Manuales', icon: <FormOutlined /> },
            { value: 'especial', label: 'Especiales', icon: <GiftOutlined /> },
          ]}
          value={value}
          onChange={(value: any) => setValue(value)}
        />
        <Segmented
          size="large"
          block
          options={[
            { value: 'parGuarani', label: 'Par Guarani', icon: <StarOutlined /> },
            { value: 'instantaneo', label: 'Instantáneo', icon: <FireOutlined /> },
            // { value: 'raspa', label: 'Raspa y gana', icon: <TagsOutlined /> },
          ]}
          value={value}
          onChange={(value: any) => setValue(value)}
        />

      </div>

      <Divider />

      {value == "manual" && <FormBoletosManuales />}
      {value == "random" && <FormBoletosAutomaticos />}
      {value == "especial" && <FormBoletosEspeciales />}
      {value == "parGuarani" && <ParGuarani />}
      {value == "instantaneo" && <Instantaneo />}
      {/* {value == "raspa" && <FormRaspaYGana />} */}
    </Drawer>
  )
};

export default FormBoleto;