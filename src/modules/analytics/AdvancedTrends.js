import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Schedule,
  CalendarToday,
  Person,
  Restaurant,
  Warning,
  Lightbulb,
  Assessment,
  CompareArrows,
  SwapHoriz
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
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  getBehavioralPatterns,
  getAdvancedComparison,
  getUnderperformingProducts
} from '../../data/mockMetricsData';
import Filters from './Filters';

const AdvancedTrends = ({ data, onFilterChange, filters }) => {
  const [activeTab, setActiveTab] = useState('behavioral');
  const [behavioralData, setBehavioralData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [underperformingData, setUnderperformingData] = useState(null);
  const [comparisonPeriod, setComparisonPeriod] = useState('previousYear');

  const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#795548'];
  const pieColors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#795548'];

  useEffect(() => {
    if (data && data.orders) {
      const filtersWithComparison = { ...filters, comparisonPeriod };
      setBehavioralData(getBehavioralPatterns(data.orders, filtersWithComparison));
      setComparisonData(getAdvancedComparison(data.orders, filtersWithComparison));
      setUnderperformingData(getUnderperformingProducts(data.orders, filtersWithComparison));
    }
  }, [data, filters, comparisonPeriod]);

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

  const handleTabChange = (event, newTab) => {
    if (newTab !== null) {
      setActiveTab(newTab);
    }
  };

  const handleComparisonPeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setComparisonPeriod(newPeriod);
    }
  };

  const getComparisonPeriodLabel = (period) => {
    const labels = {
      yesterday: 'Hoy vs Ayer',
      lastWeek: 'Esta Semana vs Anterior',
      lastMonth: 'Este Mes vs Anterior', 
      lastQuarter: 'Este Trimestre vs Anterior',
      previousYear: 'Período Actual vs Año Anterior'
    };
    return labels[period] || labels.previousYear;
  };

  const renderBehavioralPatterns = () => {
    if (!behavioralData) return <Typography>Cargando datos...</Typography>;

    return (
      <Grid container spacing={3}>
        {/* Horas Pico */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Horas Pico de Actividad
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={behavioralData.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hourLabel" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="#1976d2" name="Órdenes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Hora más activa:</strong> {behavioralData.peakHours[0]?.hourLabel} 
                  ({behavioralData.peakHours[0]?.orders} órdenes)
                </Typography>
                {filters.dateRange && filters.dateRange.start && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Período:</strong> {filters.dateRange.start.toLocaleDateString('es-ES')} - 
                    {filters.dateRange.end.toLocaleDateString('es-ES')}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Patrones Semanales */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CalendarToday sx={{ mr: 1, color: '#2e7d32' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Patrones por Día de la Semana
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={behavioralData.weeklyPatterns}>
                  <defs>
                    <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2e7d32"
                    fillOpacity={1}
                    fill="url(#colorWeekly)"
                    name="Ventas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Clientes Frecuentes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Person sx={{ mr: 1, color: '#ed6c02' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Patrones de Clientes Frecuentes
                </Typography>
                <Chip 
                  label={`${behavioralData.repeatCustomerRate.toFixed(1)}% clientes repetitivos`}
                  color="primary"
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              <Grid container spacing={2}>
                {behavioralData.frequentCustomers.slice(0, 6).map((customer, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {customer.customer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{customer.orderCount}</strong> órdenes • {formatCurrency(customer.totalSpent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Día favorito: <strong>{customer.favoriteDay}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Producto favorito: <strong>{customer.favoriteProduct}</strong>
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderComparativeAnalysis = () => {
    if (!comparisonData) return <Typography>Cargando datos...</Typography>;

    return (
      <Grid container spacing={3}>
        {/* Comparación Mensual */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CompareArrows sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Evolución {comparisonData.comparisonType === 'monthly' ? 'Mensual' : 
                           comparisonData.comparisonType === 'weekly' ? 'Semanal' : 'Diaria'}
                  ({comparisonData.totalPeriods} períodos)
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={comparisonData.monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    fill="#1976d2"
                    fillOpacity={0.3}
                    stroke="#1976d2"
                    name="Ventas"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#ed6c02"
                    strokeWidth={3}
                    name="Órdenes"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Análisis Estacional */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Comparación de Períodos
                </Typography>
              </Box>
              
              {/* Selector de Período de Comparación */}
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Seleccionar comparación:
                </Typography>
                <ToggleButtonGroup
                  value={comparisonPeriod}
                  exclusive
                  onChange={handleComparisonPeriodChange}
                  size="small"
                  sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    '& .MuiToggleButton-root': {
                      fontSize: '0.75rem',
                      px: 1,
                      py: 0.5,
                      minWidth: 'auto',
                      border: '1px solid #e0e0e0',
                      '&.Mui-selected': {
                        bgcolor: '#9c27b0',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#7b1fa2',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="yesterday">Hoy vs Ayer</ToggleButton>
                  <ToggleButton value="lastWeek">Semana</ToggleButton>
                  <ToggleButton value="lastMonth">Mes</ToggleButton>
                  <ToggleButton value="lastQuarter">Trimestre</ToggleButton>
                  <ToggleButton value="previousYear">Año</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {comparisonData.seasonalComparison.periodLabel?.current} vs {comparisonData.seasonalComparison.periodLabel?.previous}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Ventas Actuales</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(comparisonData.seasonalComparison.currentPeriod.sales)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>Período Anterior</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
                    {formatCurrency(comparisonData.seasonalComparison.previousPeriod.sales)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, Math.max(0, 50 + comparisonData.seasonalComparison.growthRate))} 
                  color={comparisonData.seasonalComparison.growthRate >= 0 ? 'primary' : 'error'}
                  sx={{ mb: 2, height: 8, borderRadius: 4 }}
                />
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Órdenes Actuales</Typography>
                  <Typography variant="h6" color="secondary">
                    {comparisonData.seasonalComparison.currentPeriod.orders}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>Período Anterior</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
                    {comparisonData.seasonalComparison.previousPeriod.orders}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, Math.max(0, 50 + comparisonData.seasonalComparison.ordersGrowthRate))} 
                  color={comparisonData.seasonalComparison.ordersGrowthRate >= 0 ? 'secondary' : 'error'}
                  sx={{ mb: 2, height: 8, borderRadius: 4 }}
                />

                <Alert 
                  severity={comparisonData.seasonalComparison.growthRate >= 0 ? 'success' : 'warning'} 
                  sx={{ mt: 2 }}
                >
                  <AlertTitle>
                    {comparisonData.seasonalComparison.growthRate >= 0 ? 'Crecimiento Positivo' : 'Decrecimiento'}
                  </AlertTitle>
                  <Box>
                    <Typography variant="body2">
                      <strong>Ventas:</strong> {comparisonData.seasonalComparison.growthRate.toFixed(1)}% 
                      {comparisonData.seasonalComparison.growthRate >= 0 ? 'más' : 'menos'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Órdenes:</strong> {comparisonData.seasonalComparison.ordersGrowthRate.toFixed(1)}% 
                      {comparisonData.seasonalComparison.ordersGrowthRate >= 0 ? 'más' : 'menos'}
                    </Typography>
                  </Box>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tendencia Diaria */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Tendencia Diaria 
                {filters.dateRange && filters.dateRange.start ? 
                  `(${Math.ceil(Math.abs(filters.dateRange.end - filters.dateRange.start) / (1000 * 60 * 60 * 24))} días)` :
                  '(Últimas 4 Semanas)'
                }
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={comparisonData.dailyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 3 }}
                    name="Ventas Diarias"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderUnderperformingProducts = () => {
    if (!underperformingData) return <Typography>Cargando datos...</Typography>;

    return (
      <Grid container spacing={3}>
        {/* Resumen de Productos */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning sx={{ mr: 1, color: '#ed6c02' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Resumen de Rendimiento
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {underperformingData.underperformingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  de {underperformingData.totalProducts} productos necesitan atención
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Período de análisis:</strong> {underperformingData.analysisPeriodDays} días
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(underperformingData.underperformingCount / underperformingData.totalProducts) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Productos con Bajo Rendimiento */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Restaurant sx={{ mr: 1, color: '#d32f2f' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Productos que Requieren Atención
                </Typography>
              </Box>
              <List>
                {underperformingData.needsAttention.slice(0, 6).map((product, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: product.daysSinceLastSale > 14 ? '#d32f2f' : 
                                    product.salesRate < 0.3 ? '#ed6c02' : '#9c27b0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {product.daysSinceLastSale}d
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {product.name}
                            </Typography>
                            <Chip 
                              label={product.category.replace('-', ' ')}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Vendido: {product.totalSold} unidades • 
                              Ingresos: {formatCurrency(product.revenue)} • 
                              Tasa: {product.salesRate.toFixed(1)}/día
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: product.daysSinceLastSale > 14 ? '#d32f2f' : '#ed6c02',
                              fontWeight: 'bold',
                              mt: 0.5
                            }}>
                              {product.daysSinceLastSale} días sin venta
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < underperformingData.needsAttention.slice(0, 6).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sugerencias de Mejora */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Lightbulb sx={{ mr: 1, color: '#2e7d32' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Sugerencias de Mejora
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {underperformingData.suggestions.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Alert 
                      severity={
                        product.daysSinceLastSale > 14 ? 'error' :
                        product.salesRate < 0.3 ? 'warning' : 'info'
                      }
                      sx={{ height: '100%' }}
                    >
                      <AlertTitle>{product.name}</AlertTitle>
                      {product.suggestion}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'behavioral':
        return renderBehavioralPatterns();
      case 'comparative':
        return renderComparativeAnalysis();
      case 'underperforming':
        return renderUnderperformingProducts();
      default:
        return renderBehavioralPatterns();
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Análisis Avanzado de Tendencias
      </Typography>

      {/* Filtros Avanzados */}
      <Box mb={3}>
        <Filters onFilterChange={onFilterChange} filters={filters} />
      </Box>

      <Box mb={3}>
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={handleTabChange}
          size="large"
          sx={{ 
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1.5,
              borderRadius: 2,
              mx: 0.5,
              border: '2px solid #e0e0e0',
              '&.Mui-selected': {
                bgcolor: '#1976d2',
                color: 'white',
                '&:hover': {
                  bgcolor: '#1565c0',
                }
              }
            }
          }}
        >
          <ToggleButton value="behavioral">
            <Schedule sx={{ mr: 1 }} />
            Patrones de Comportamiento
          </ToggleButton>
          <ToggleButton value="comparative">
            <CompareArrows sx={{ mr: 1 }} />
            Análisis Comparativo
          </ToggleButton>
          <ToggleButton value="underperforming">
            <TrendingDown sx={{ mr: 1 }} />
            Productos con Bajo Rendimiento
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {renderContent()}
    </Box>
  );
};

export default AdvancedTrends;
