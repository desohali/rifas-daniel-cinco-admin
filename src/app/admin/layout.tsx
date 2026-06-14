"use client";
import * as  React from 'react';
import { Layout, theme, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setListaDeCarpetas } from '@/features/adminSlice';
import { useRouter } from 'next/navigation';
import { setUser } from '@/features/userSlice';
import { useListarCarpetasQuery } from '@/services/userApi';


const App: React.FC = ({ children }: any) => {

  const router = useRouter();
  const { user } = useSelector((state: any) => state.user);
  // console.log('userssssssssssssssssssssssssssss', user)

  const dispatch = useDispatch();
  const { random, idCarpeta, listaDeCarpetas } = useSelector((state: any) => state.admin);
  const { data, isLoading, error, refetch } = useListarCarpetasQuery({});

  React.useEffect(() => {
    if (data && user) {
      dispatch(setListaDeCarpetas(data));
      router.replace(`/admin/rifas/${user?._idCarpeta}`);
    }
  }, [data, user]);

  React.useEffect(() => {
    const localStorageUser = window.localStorage.getItem("usuarioLuis");
    if (localStorageUser) {
      const userObject = JSON.parse(localStorageUser);
      if ((!userObject?._idCarpeta || userObject.tipoUsuario == "v") && userObject?.tipoUsuario != "s") {
        dispatch(setUser(null));
        router.push('/login');
      } else {
        dispatch(setUser(userObject));
      }
    } else {
      router.push('/login');
    }
  }, []);

  React.useEffect(() => {
    refetch();
  }, [random]);

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(false);
  }, []);




  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }

  return children;
};

export default App;