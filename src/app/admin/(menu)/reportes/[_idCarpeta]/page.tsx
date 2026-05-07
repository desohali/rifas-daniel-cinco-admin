"use client";
import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Select, DatePicker, Button, Tabs, Space, Statistic, Divider, Spin } from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  DownloadOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';

// Importar componentes de Recharts
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { setIdCarpeta } from '@/features/adminSlice';
import { useDispatch } from 'react-redux';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Datos de ejemplo para los gráficos en formato compatible con Recharts
const ventasPorMesData = [
  { name: "Enero", ventas: 1000, meta: 1200 },
  { name: "Febrero", ventas: 1170, meta: 1200 },
  { name: "Marzo", ventas: 1250, meta: 1200 },
  { name: "Abril", ventas: 1530, meta: 1400 },
  { name: "Mayo", ventas: 1800, meta: 1600 },
  { name: "Junio", ventas: 1400, meta: 1600 },
];

const ventasPorRifaData = [
  { name: "iPhone 15 Pro", ventas: 350 },
  { name: "PlayStation 5", ventas: 280 },
  { name: "MacBook Air", ventas: 200 },
  { name: "Viaje a Cancún", ventas: 320 },
  { name: "Smart TV 65\"", ventas: 150 },
  { name: "Nintendo Switch", ventas: 180 },
];

const ventasPorDiaData = [
  { name: "Lunes", ventas: 120 },
  { name: "Martes", ventas: 80 },
  { name: "Miércoles", ventas: 140 },
  { name: "Jueves", ventas: 160 },
  { name: "Viernes", ventas: 220 },
  { name: "Sábado", ventas: 280 },
  { name: "Domingo", ventas: 180 },
];

const ventasPorRegionData = [
  { name: "Norte", ventas: 420 },
  { name: "Sur", ventas: 380 },
  { name: "Este", ventas: 250 },
  { name: "Oeste", ventas: 310 },
  { name: "Centro", ventas: 540 },
];

const tendenciaVentasData = [
  { name: "01/04", ventas: 45, tendencia: 45 },
  { name: "02/04", ventas: 52, tendencia: 48 },
  { name: "03/04", ventas: 48, tendencia: 51 },
  { name: "04/04", ventas: 55, tendencia: 54 },
  { name: "05/04", ventas: 60, tendencia: 57 },
  { name: "06/04", ventas: 58, tendencia: 60 },
  { name: "07/04", ventas: 65, tendencia: 63 },
  { name: "08/04", ventas: 68, tendencia: 66 },
  { name: "09/04", ventas: 70, tendencia: 69 },
  { name: "10/04", ventas: 72, tendencia: 72 },
  { name: "11/04", ventas: 75, tendencia: 75 },
  { name: "12/04", ventas: 80, tendencia: 78 },
  { name: "13/04", ventas: 82, tendencia: 81 },
  { name: "14/04", ventas: 85, tendencia: 84 },
  { name: "15/04", ventas: 88, tendencia: 87 },
];

// Colores para los gráficos
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
const RADIAN = Math.PI / 180;

const ReportesPage = ({ params }: any) => {
  
  const dispatch = useDispatch();
  const [chartType, setChartType] = useState('bar');
  const [dataSet, setDataSet] = useState('ventasPorMes');

  React.useEffect(() => {
    dispatch(setIdCarpeta(typeof params._idCarpeta === 'string' ? params._idCarpeta : params._idCarpeta?._id));
  }, []);

  // Función para obtener los datos según la selección
  const getChartData = () => {
    switch (dataSet) {
      case 'ventasPorMes':
        return ventasPorMesData;
      case 'ventasPorRifa':
        return ventasPorRifaData;
      case 'ventasPorDia':
        return ventasPorDiaData;
      case 'ventasPorRegion':
        return ventasPorRegionData;
      case 'tendenciaVentas':
        return tendenciaVentasData;
      default:
        return ventasPorMesData;
    }
  };

  // Función para obtener las columnas de datos para la tabla
  const getTableColumns = () => {
    switch (dataSet) {
      case 'ventasPorMes':
        return ['Mes', 'Boletos Vendidos', 'Meta'];
      case 'ventasPorRifa':
      case 'ventasPorDia':
      case 'ventasPorRegion':
        return ['Nombre', 'Boletos Vendidos'];
      case 'tendenciaVentas':
        return ['Fecha', 'Boletos Vendidos', 'Tendencia'];
      default:
        return ['Nombre', 'Valor'];
    }
  };

  // Función para obtener los datos para la tabla
  const getTableData = () => {
    const data = getChartData();
    const columns = getTableColumns();

    return data.map(item => {
      const row: Record<string, any> = {};
      row[columns[0]] = item.name;
      row[columns[1]] = item.ventas;
      if (columns.length > 2 && 'meta' in item) {
        row[columns[2]] = item.meta;
      } else if (columns.length > 2 && 'tendencia' in item) {
        row[columns[2]] = item.tendencia;
      }
      return row;
    });
  };

  // Función personalizada para renderizar etiquetas en el gráfico de pastel
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontWeight: 'bold', fontSize: '12px' }}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Función para obtener el título según el conjunto de datos
  const getTitleForDataSet = () => {
    switch (dataSet) {
      case 'ventasPorMes':
        return 'Ventas de Boletos por Mes';
      case 'ventasPorRifa':
        return 'Ventas de Boletos por Rifa';
      case 'ventasPorDia':
        return 'Ventas de Boletos por Día de la Semana';
      case 'ventasPorRegion':
        return 'Ventas de Boletos por Región';
      case 'tendenciaVentas':
        return 'Tendencia de Ventas de Boletos';
      default:
        return 'Reporte de Ventas';
    }
  };

  // Función para obtener el título del eje horizontal
  const getHAxisTitle = () => {
    switch (dataSet) {
      case 'ventasPorMes':
        return 'Mes';
      case 'ventasPorRifa':
        return 'Rifa';
      case 'ventasPorDia':
        return 'Día';
      case 'ventasPorRegion':
        return 'Región';
      case 'tendenciaVentas':
        return 'Fecha';
      default:
        return '';
    }
  };

  // Calcular estadísticas
  const calcularTotalVentas = () => {
    const data = getChartData();
    let total = 0;

    for (let i = 0; i < data.length; i++) {
      total += Number(data[i].ventas);
    }

    return total;
  };

  const calcularPromedio = () => {
    const data = getChartData();
    const total = calcularTotalVentas();
    return Math.round(total / data.length);
  };

  const calcularCrecimiento = () => {
    const data = getChartData();
    if (data.length < 2) return 0;

    const ultimoValor = Number(data[data.length - 1].ventas);
    const penultimoValor = Number(data[data.length - 2].ventas);

    return Math.round(((ultimoValor - penultimoValor) / penultimoValor) * 100);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Cabecera con título */}
      {/* <Row gutter={[16, 24]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Title level={2} style={{ margin: 0 }}>Reportes y Estadísticas</Title>
          <Text type="secondary">Visualiza el rendimiento de tus rifas y ventas de boletos</Text>
        </Col>
      </Row> */}

      {/* Tarjetas de estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Total de Boletos Vendidos"
              value={calcularTotalVentas()}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Promedio por Categoría"
              value={calcularPromedio()}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Crecimiento"
              value={calcularCrecimiento()}
              prefix={calcularCrecimiento() >= 0 ? <RiseOutlined /> : <FallOutlined />}
              suffix="%"
              valueStyle={{ color: calcularCrecimiento() >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Rifas Activas"
              value={6}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controles de gráfico */}
      <Card
        style={{ marginBottom: '24px', borderRadius: '8px' }}
        title="Configuración del Reporte"
        extra={<Button icon={<ReloadOutlined />}>Actualizar</Button>}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>Tipo de Gráfico:</Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              value={chartType}
              onChange={setChartType}
              size="large"
            >
              <Option value="bar">
                <BarChartOutlined /> Barras Horizontales
              </Option>
              <Option value="column">
                <BarChartOutlined style={{ transform: 'rotate(90deg)' }} /> Barras Verticales
              </Option>
              <Option value="pie">
                <PieChartOutlined /> Circular
              </Option>
              <Option value="line">
                <LineChartOutlined /> Líneas
              </Option>
              <Option value="area">
                <AreaChartOutlined /> Área
              </Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>Datos a Mostrar:</Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              value={dataSet}
              onChange={setDataSet}
              size="large"
            >
              <Option value="ventasPorMes">Ventas por Mes</Option>
              <Option value="ventasPorRifa">Ventas por Rifa</Option>
              <Option value="ventasPorDia">Ventas por Día</Option>
              <Option value="ventasPorRegion">Ventas por Región</Option>
              <Option value="tendenciaVentas">Tendencia de Ventas</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>Periodo:</Text>
            <RangePicker
              style={{ width: '100%', marginTop: '8px' }}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              style={{ marginTop: '8px', width: '100%' }}
            >
              Exportar Reporte
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Gráfico principal */}
      <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ height: '500px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={getChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={180}
                  fill="#8884d8"
                  dataKey="ventas"
                  nameKey="name"
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {getChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} boletos`, 'Ventas']} />
                <Legend />
              </PieChart>
            ) : chartType === 'line' ? (
              <LineChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  name="Boletos Vendidos"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                  animationDuration={1000}
                />
                {dataSet === 'tendenciaVentas' && (
                  <Line
                    type="monotone"
                    dataKey="tendencia"
                    name="Tendencia"
                    stroke="#52c41a"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1000}
                  />
                )}
                {dataSet === 'ventasPorMes' && (
                  <Line
                    type="monotone"
                    dataKey="meta"
                    name="Meta"
                    stroke="#faad14"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    animationDuration={1000}
                  />
                )}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  name="Boletos Vendidos"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.6}
                  animationDuration={1000}
                />
                {dataSet === 'tendenciaVentas' && (
                  <Area
                    type="monotone"
                    dataKey="tendencia"
                    name="Tendencia"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.6}
                    animationDuration={1000}
                  />
                )}
              </AreaChart>
            ) : chartType === 'column' ? (
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="ventas"
                  name="Boletos Vendidos"
                  fill="#1890ff"
                  animationDuration={1000}
                  barSize={30}
                />
                {dataSet === 'ventasPorMes' && (
                  <Bar
                    dataKey="meta"
                    name="Meta"
                    fill="#faad14"
                    animationDuration={1000}
                    barSize={30}
                  />
                )}
              </BarChart>
            ) : (
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="ventas"
                  name="Boletos Vendidos"
                  fill="#1890ff"
                  animationDuration={1000}
                  barSize={30}
                />
                {dataSet === 'ventasPorMes' && (
                  <Bar
                    dataKey="meta"
                    name="Meta"
                    fill="#faad14"
                    animationDuration={1000}
                    barSize={30}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tabla de datos (simplificada) */}
      <Card
        title={
          <Space>
            <TableOutlined />
            <span>Datos del Reporte</span>
          </Space>
        }
        style={{ borderRadius: '8px' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                {getTableColumns().map((header, index) => (
                  <th key={index} style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getTableData().map((row, rowIndex) => (
                <tr key={rowIndex} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {getTableColumns().map((column, colIndex) => (
                    <td key={colIndex} style={{ padding: '12px 8px' }}>
                      {typeof row[column] === 'number' ? row[column].toLocaleString() : row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportesPage;