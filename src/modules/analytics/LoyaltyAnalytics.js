import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Stars,
  Redeem,
  AttachMoney,
  Assessment,
  LocalOffer
} from '@mui/icons-material';
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
import LoyaltyService from '../../services/loyaltyService';

const LoyaltyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [segmentation, setSegmentation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    try {
      const loyaltyAnalytics = LoyaltyService.getLoyaltyAnalytics();
      const customerSegmentation = LoyaltyService.getCustomerSegmentation();
      setAnalytics(loyaltyAnalytics);
      setSegmentation(customerSegmentation);
      setLoading(false);
    } catch (error) {
      console.error('Error loading loyalty analytics:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CR').format(num);
  };

  const getUtilizationColor = (rate) => {
    if (rate >= 70) return '#f44336'; // Red - high utilization
    if (rate >= 40) return '#ff9800'; // Orange - medium utilization
    return '#4caf50'; // Green - low utilization
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Cargando análisis de lealtad...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error al cargar los datos de análisis
        </Typography>
      </Box>
    );
  }

  // Prepare segmentation data for pie chart
  const segmentationData = segmentation ? [
    { name: 'Nuevos', value: segmentation.nuevos, color: '#8884d8' },
    { name: 'Activos', value: segmentation.activos, color: '#82ca9d' },
    { name: 'Frecuentes', value: segmentation.frecuentes, color: '#ffc658' }
  ] : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          🎯 Análisis del Programa de Lealtad
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Métricas detalladas del programa de puntos y fidelización
        </Typography>
        <Chip 
          label={analytics.programActive ? 'Programa Activo' : 'Programa Inactivo'}
          color={analytics.programActive ? 'success' : 'error'}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(analytics.activeCustomers)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Clientes Activos
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    de {formatNumber(analytics.totalCustomers)} registrados
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(analytics.totalPointsIssued)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Puntos Emitidos
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatCurrency(analytics.totalPointsValue)} en valor
                  </Typography>
                </Box>
                <Stars sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(analytics.totalPointsRedeemed)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Puntos Canjeados
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatCurrency(analytics.redeemedPointsValue)} en costo
                  </Typography>
                </Box>
                <Redeem sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {analytics.utilizationRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Utilización
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    puntos canjeados/emitidos
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Financial Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color="primary" />
                Métricas Financieras
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ingresos Estimados por Programa
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {formatCurrency(analytics.estimatedTotalSpending)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Costo Real de Puntos Canjeados
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                  {formatCurrency(analytics.redeemedPointsValue)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Beneficio Neto Estimado
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: analytics.netBenefit >= 0 ? '#4caf50' : '#f44336' 
                  }}
                >
                  {formatCurrency(analytics.netBenefit)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Promedio de Puntos por Cliente
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                  {formatNumber(analytics.averagePointsPerCustomer)} puntos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Equivale a {formatCurrency(analytics.averagePointsPerCustomer * analytics.config.pointValue)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOffer color="primary" />
                Indicadores de Rendimiento
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tasa de Utilización</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {analytics.utilizationRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.utilizationRate} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getUtilizationColor(analytics.utilizationRate)
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Participación de Clientes</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {analytics.participacionClientes}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.participacionClientes} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4caf50'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ROI del Programa
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {analytics.netBenefit >= 0 ? (
                    <TrendingUp sx={{ color: '#4caf50' }} />
                  ) : (
                    <TrendingDown sx={{ color: '#f44336' }} />
                  )}
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: analytics.netBenefit >= 0 ? '#4caf50' : '#f44336'
                  }}>
                    {analytics.estimatedTotalSpending > 0 ? 
                      Math.round((analytics.netBenefit / analytics.estimatedTotalSpending) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tendencias de Puntos (Últimos 6 Meses)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatNumber(value), 
                      name === 'pointsIssued' ? 'Puntos Emitidos' : 'Puntos Canjeados'
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pointsIssued" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Puntos Emitidos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pointsRedeemed" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                    name="Puntos Canjeados"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', width: '30em'}}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Segmentación de Clientes
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={segmentationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatNumber(value), 'Clientes']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Growth Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crecimiento de Clientes
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatNumber(value), 
                      name === 'newCustomers' ? 'Nuevos Clientes' : 'Clientes Activos'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="newCustomers" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name="Nuevos Clientes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeCustomers" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    name="Clientes Activos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comparación Puntos vs Valor Monetario
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'pointsIssued' || name === 'pointsRedeemed') {
                        return [formatNumber(value), name === 'pointsIssued' ? 'Puntos Emitidos' : 'Puntos Canjeados'];
                      }
                      return [formatCurrency(value * analytics.config.pointValue), 'Valor Monetario'];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="pointsIssued" 
                    fill="#8884d8" 
                    name="Puntos Emitidos"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="pointsRedeemed" 
                    fill="#82ca9d" 
                    name="Puntos Canjeados"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Metrics Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen Detallado del Programa
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Configuración Actual
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Puntos por ₡100:</strong> {analytics.config.pointsPerAmount}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Valor por punto:</strong> {formatCurrency(analytics.config.pointValue)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mínimo para canjear:</strong> {analytics.config.minPointsToRedeem} puntos
                  </Typography>
                  <Typography variant="body2">
                    <strong>Máximo por transacción:</strong> {formatNumber(analytics.config.maxPointsPerTransaction)} puntos
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Análisis de Impacto
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Participación clientes activos:</strong> {analytics.customerEngagement}% de clientes activos
                  </Typography>
                  <Typography variant="body2">    
                    <strong>Valor promedio canje:</strong> {formatCurrency(analytics.averageRedemptionValue)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Costo programa:</strong> {formatCurrency(analytics.redeemedPointsValue)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Retorno estimado:</strong> {analytics.estimatedTotalSpending > 0 ? 
                      Math.round((analytics.netBenefit / analytics.estimatedTotalSpending) * 100) : 0}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoyaltyAnalytics;
