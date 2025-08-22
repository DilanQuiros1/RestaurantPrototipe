import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Button,
  IconButton,
  Collapse
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  Receipt,
  Star,
  Payment,
  AccountBalance,
  PhoneAndroid,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const KPISection = ({ kpis, comparisonData, orders = [], onFilterChange, filters }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Efectivo');
  const [expanded, setExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters || {
    dateRange: { start: null, end: null },
    category: '',
    paymentMethod: ''
  });
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value) => {
    if (value > 0) return '#4caf50';
    if (value < 0) return '#f44336';
    return '#ff9800';
  };

  const getGrowthIcon = (value) => {
    return value >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  const getPaymentMethodData = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const paymentCounts = {
      'Efectivo': completedOrders.filter(order => order.paymentMethod === 'Efectivo').length,
      'Tarjeta': completedOrders.filter(order => order.paymentMethod === 'Tarjeta').length,
      'SINPE Móvil': completedOrders.filter(order => order.paymentMethod === 'SINPE Móvil').length
    };
    return paymentCounts;
  };

  const paymentData = getPaymentMethodData();
  const topPaymentMethod = Object.keys(paymentData).reduce((a, b) => paymentData[a] > paymentData[b] ? a : b, 'Efectivo');

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Efectivo': return <AttachMoney />;
      case 'Tarjeta': return <Payment />;
      case 'SINPE Móvil': return <PhoneAndroid />;
      default: return <AccountBalance />;
    }
  };

  const getPaymentColor = (method) => {
    switch (method) {
      case 'Efectivo': return '#4caf50';
      case 'Tarjeta': return '#2196f3';
      case 'SINPE Móvil': return '#ff9800';
      default: return '#9c27b0';
    }
  };

  const kpiCards = [
    {
      title: 'Ventas Hoy',
      value: kpis.today?.totalSales || 0,
      format: 'currency',
      icon: <AttachMoney />,
      color: '#1976d2',
      growth: comparisonData.salesGrowth || 0,
      subtitle: `${kpis.today?.totalOrders || 0} órdenes`
    },
    {
      title: 'Órdenes Totales',
      value: kpis.week?.totalOrders || 0,
      format: 'number',
      icon: <ShoppingCart />,
      color: '#2e7d32',
      growth: comparisonData.ordersGrowth || 0,
      subtitle: 'Esta semana'
    },
    {
      title: 'Ticket Promedio',
      value: kpis.week?.averageTicket || 0,
      format: 'currency',
      icon: <Receipt />,
      color: '#ed6c02',
      growth: comparisonData.ticketGrowth || 0,
      subtitle: 'Últimos 7 días'
    },
    {
      title: `Método de Pago (${topPaymentMethod})`,
      value: paymentData[topPaymentMethod] || 0,
      format: 'number',
      icon: getPaymentIcon(topPaymentMethod),
      color: getPaymentColor(topPaymentMethod),
      growth: 0, // Opcional: calcular crecimiento si es necesario
      subtitle: 'Transacciones'
    }
  ];

  const topProducts = kpis.week?.topProducts || [];

  const categories = [
    { value: 'comidas-rapidas', label: 'Comidas Rápidas' },
    { value: 'platos-fuertes', label: 'Platos Fuertes' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'postres', label: 'Postres' }
  ];

  const paymentMethods = ['Efectivo', 'Tarjeta', 'SINPE Móvil'];

  const quickDateRanges = [
    {
      label: 'Hoy',
      getValue: () => {
        const today = new Date();
        return {
          start: new Date(today.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    },
    {
      label: 'Esta Semana',
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return {
          start: new Date(firstDay.setHours(0, 0, 0, 0)),
          end: new Date(lastDay.setHours(23, 59, 59, 999))
        };
      }
    },
    {
      label: 'Este Mes',
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          start: new Date(firstDay.setHours(0, 0, 0, 0)),
          end: new Date(lastDay.setHours(23, 59, 59, 999))
        };
      }
    },
    {
      label: 'Últimos 7 días',
      getValue: () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          start: new Date(sevenDaysAgo.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    },
    {
      label: 'Últimos 30 días',
      getValue: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          start: new Date(thirtyDaysAgo.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      }
    }
  ];

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...localFilters.dateRange, [field]: value };
    const newFilters = { ...localFilters, dateRange: newDateRange };
    setLocalFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleQuickDateRange = (range) => {
    const dateRange = range.getValue();
    const newFilters = { ...localFilters, dateRange };
    setLocalFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: { start: null, end: null },
      category: '',
      paymentMethod: ''
    };
    setLocalFilters(clearedFilters);
    if (onFilterChange) onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++;
    if (localFilters.category) count++;
    if (localFilters.paymentMethod) count++;
    return count;
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Métricas en Tiempo Real
      </Typography>

      {/* Advanced Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                Filtros Avanzados
              </Typography>
              {getActiveFiltersCount() > 0 && (
                <Chip
                  label={`${getActiveFiltersCount()} activos`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                disabled={getActiveFiltersCount() === 0}
              >
                Limpiar
              </Button>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded}>
            <Grid container spacing={3}>
              {/* Quick Date Range Buttons */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Rangos Rápidos:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {quickDateRanges.map((range, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuickDateRange(range)}
                      sx={{ mb: 1 }}
                    >
                      {range.label}
                    </Button>
                  ))}
                </Box>
              </Grid>

              {/* Custom Date Range */}
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <Box display="flex" gap={2}>
                    <DatePicker
                      label="Fecha Inicio"
                      value={localFilters.dateRange.start}
                      onChange={(value) => handleDateRangeChange('start', value)}
                      renderInput={(params) => (
                        <TextField {...params} size="small" fullWidth />
                      )}
                      inputFormat="dd/MM/yyyy"
                    />
                    <DatePicker
                      label="Fecha Fin"
                      value={localFilters.dateRange.end}
                      onChange={(value) => handleDateRangeChange('end', value)}
                      renderInput={(params) => (
                        <TextField {...params} size="small" fullWidth />
                      )}
                      inputFormat="dd/MM/yyyy"
                      minDate={localFilters.dateRange.start}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>

              {/* Category Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={localFilters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Categoría"
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Payment Method Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={localFilters.paymentMethod || ''}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    label="Método de Pago"
                  >
                    <MenuItem value="">Todos los métodos</MenuItem>
                    {paymentMethods.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Filtros Activos:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                    <Chip
                      label={`Fecha: ${formatDateForDisplay(localFilters.dateRange.start)} - ${formatDateForDisplay(localFilters.dateRange.end)}`}
                      onDelete={() => {
                        handleDateRangeChange('start', null);
                        handleDateRangeChange('end', null);
                      }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {localFilters.category && (
                    <Chip
                      label={`Categoría: ${categories.find(c => c.value === localFilters.category)?.label}`}
                      onDelete={() => handleFilterChange('category', '')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {localFilters.paymentMethod && (
                    <Chip
                      label={`Pago: ${localFilters.paymentMethod}`}
                      onDelete={() => handleFilterChange('paymentMethod', '')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Collapse>
        </CardContent>
      </Card>

      {/* KPI Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${kpi.color}15 0%, ${kpi.color}05 100%)`,
                border: `1px solid ${kpi.color}20`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${kpi.color}20`
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box sx={{ color: kpi.color, opacity: 0.8 }}>
                    {kpi.icon}
                  </Box>
                  <Chip
                    icon={getGrowthIcon(kpi.growth)}
                    label={formatPercentage(kpi.growth)}
                    size="small"
                    sx={{
                      backgroundColor: `${getGrowthColor(kpi.growth)}15`,
                      color: getGrowthColor(kpi.growth),
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                  {kpi.format === 'currency' 
                    ? formatCurrency(kpi.value)
                    : kpi.value.toLocaleString()
                  }
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  {kpi.title}
                </Typography>
                
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      

      {/* Top Products Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
          Productos Más Vendidos
        </Typography>
        
        <Grid container spacing={2}>
          {topProducts.slice(0, 5).map((product, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #dee2e6'
              }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                      #{index + 1} {product.name}
                    </Typography>
                    <Chip
                      label={product.quantity}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    {product.category.replace('-', ' ').toUpperCase()}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(product.quantity / topProducts[0]?.quantity) * 100 || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index === 0 ? '#4caf50' : index === 1 ? '#2196f3' : '#ff9800'
                        }
                      }}
                    />
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Ingresos: {formatCurrency(product.revenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default KPISection;
