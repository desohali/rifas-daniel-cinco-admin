"use client";
import React from 'react';
import { Result, Spin } from 'antd';
import { useRouter } from 'next/navigation';


const App: React.FC = () => {

  const router = useRouter();

  const [loading, setloading] = React.useState<Boolean>(true);
  React.useEffect(() => {
    setloading(false);
    router.push('/login');
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }

  return (
    <Result
      status="403"
      title="403"
      subTitle="Lo sentimos, no está autorizado a acceder a esta página."
    />
  );
};

export default App;