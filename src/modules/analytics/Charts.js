 import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Paper
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Charts = ({ data, showComparison = false }) => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];
  const pieColors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#795548'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Ventas') || entry.name.includes('Sales') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: data.color }}>
            Valor: {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const renderSalesChart = () => {
    const salesData = data.sales || [];
    
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#1976d2"
                fillOpacity={1}
                fill="url(#colorSales)"
                name="Ventas"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#1976d2" name="Ventas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#1976d2"
                strokeWidth={3}
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                name="Ventas"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#2e7d32"
                strokeWidth={2}
                dot={{ fill: '#2e7d32', strokeWidth: 2, r: 3 }}
                name="Órdenes"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderCategoriesChart = () => {
    const categoriesData = data.categories || [];
    const total = categoriesData.reduce((sum, item) => sum + item.value, 0);
    const dataWithTotal = categoriesData.map(item => ({ ...item, total }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };


  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Análisis Visual
      </Typography>

      {/* Sales Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  Tendencia de Ventas
                </Typography>
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={handleChartTypeChange}
                  size="small"
                >
                  <ToggleButton value="line">Línea</ToggleButton>
                  <ToggleButton value="area">Área</ToggleButton>
                  <ToggleButton value="bar">Barras</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {renderSalesChart()}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                Ventas por Categoría
              </Typography>
              {renderCategoriesChart()}
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {showComparison && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            Comparación de Períodos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Análisis Comparativo
                    </Typography>
                    <ToggleButtonGroup
                      value={timeRange}
                      exclusive
                      onChange={handleTimeRangeChange}
                      size="small"
                    >
                      <ToggleButton value="week">Semana</ToggleButton>
                      <ToggleButton value="month">Mes</ToggleButton>
                      <ToggleButton value="quarter">Trimestre</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.sales || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" tickFormatter={formatCurrency} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#1976d2"
                        strokeWidth={3}
                        name="Período Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="previousSales"
                        stroke="#666"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Período Anterior"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Charts;
