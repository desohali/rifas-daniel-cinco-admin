import { createSlice } from '@reduxjs/toolkit';
import { Form } from 'antd';

const initialState: any = {
  menuButtonKey: "Rifas",
  openFormRifa: false,
  openFormBoleto: false,
  listaDeRifas: [],
  rifaDetalles: null,
  isRifa: false,
  listaDeBoletos: [],
  listaDeBoletosConPremio: [],
  listaDeBoletosADevolver: [],
  listaDeBoletosConPremioRandom: [],
  listaDeBoletosConPremioEspeciales: [],
  // imagen de rifa
  imagenRifa: undefined,
  openFormCarpeta: false,
  listaDeCarpetas: [],
  random: null,
  idCarpeta: null,
  detalleDeCarpeta: null,
  widthBoleto: 341,
  heightBoleto: 341,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setWidthBoleto: (state, action) => {
      state.widthBoleto = action.payload;
    },
    setHeightBoleto: (state, action) => {
      state.heightBoleto = action.payload;
    },
    setListaDeBoletosConPremioEspeciales: (state, action) => {
      state.listaDeBoletosConPremioEspeciales = action.payload;
    },
    setDetalleDeCarpeta: (state, action) => {
      state.detalleDeCarpeta = action.payload;
    },
    setMenuButtonKey: (state, action) => {
      state.menuButtonKey = action.payload;
    },
    setOpenFormRifa: (state, action) => {
      state.openFormRifa = action.payload;
    },
    setListaDeRifas: (state, action) => {
      state.listaDeRifas = action.payload;
    },
    setIsRifa: (state, action) => {
      state.isRifa = action.payload;
    },
    setRifaDetalles: (state, action) => {
      state.rifaDetalles = action.payload;
    },
    setOpenFormBoleto: (state, action) => {
      state.openFormBoleto = action.payload;
    },
    setListaDeBoletos: (state, action) => {
      state.listaDeBoletos = action.payload;
    },
    setListaDeBoletosConPremio: (state, action) => {
      state.listaDeBoletosConPremio = action.payload;
    },
    setListaDeBoletosADevolver: (state, action) => {
      state.listaDeBoletosADevolver = action.payload;
    },
    // 
    setImagenRifa: (state, action) => {
      state.imagenRifa = action.payload;
    },
    setListaDeBoletosConPremioRandom: (state, action) => {
      state.listaDeBoletosConPremioRandom = action.payload;
    },
    setOpenFormCarpeta: (state, action) => {
      state.openFormCarpeta = action.payload;
    },
    setListaDeCarpetas: (state, action) => {
      state.listaDeCarpetas = action.payload;
    },
    setRandom: (state, action) => {
      state.random = action.payload;
    },
    setIdCarpeta: (state, action) => {
      state.idCarpeta = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setWidthBoleto,
  setHeightBoleto,
  setMenuButtonKey,
  setOpenFormRifa,
  setListaDeRifas,
  setIsRifa,
  setRifaDetalles,
  setOpenFormBoleto,
  setListaDeBoletos,
  setListaDeBoletosConPremio,
  setListaDeBoletosADevolver,
  setImagenRifa,
  setListaDeBoletosConPremioRandom,
  setOpenFormCarpeta,
  setListaDeCarpetas,
  setRandom,
  setIdCarpeta,
  setDetalleDeCarpeta,
  setListaDeBoletosConPremioEspeciales
} = adminSlice.actions;

export default adminSlice.reducer;