import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  user: typeof window !== 'undefined' && window.localStorage.getItem("usuarioLuis")
    ? JSON.parse(window.localStorage.getItem("usuarioLuis") || "")
    : null,
  isUsuario: false,
  openFormUsuario: false,
  usuarioDetalles: null,
  listaDeUsuarios: []
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsUsuario: (state, action) => {
      state.isUsuario = action.payload;
    },
    setOpenFormUsuario: (state, action) => {
      state.openFormUsuario = action.payload;
    },
    setUsuarioDetalles: (state, action) => {
      state.usuarioDetalles = action.payload;
    },
    setListaDeUsuarios: (state, action) => {
      state.listaDeUsuarios = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, setIsUsuario, setOpenFormUsuario, setUsuarioDetalles, setListaDeUsuarios } = userSlice.actions;

export default userSlice.reducer;