import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { es } from 'date-fns/locale';

const Filters = ({ onFilterChange, filters }) => {
  const [expanded, setExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    { value: 'comidas-rapidas', label: 'Comidas Rápidas' },
    { value: 'platos-fuertes', label: 'Platos Fuertes' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'postres', label: 'Postres' },
    { value: 'entradas', label: 'Entradas' }
  ];

  const paymentMethods = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'PayPal'
  ];

  const orderTypes = [
    { value: 'dine-in', label: 'Comer Restaurante' },
    { value: 'takeout', label: 'Para Llevar' }
  ];

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
      label: 'Ayer',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: new Date(yesterday.setHours(0, 0, 0, 0)),
          end: new Date(yesterday.setHours(23, 59, 59, 999))
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
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...localFilters.dateRange, [field]: value };
    const newFilters = { ...localFilters, dateRange: newDateRange };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleQuickDateRange = (range) => {
    const dateRange = range.getValue();
    const newFilters = { ...localFilters, dateRange };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: { start: null, end: null },
      category: '',
      paymentMethod: '',
      orderType: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++;
    if (localFilters.category) count++;
    if (localFilters.paymentMethod) count++;
    if (localFilters.orderType) count++;
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

            {/* Order Type Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Tipo de Orden</InputLabel>
                <Select
                  value={localFilters.orderType || ''}
                  onChange={(e) => handleFilterChange('orderType', e.target.value)}
                  label="Tipo de Orden"
                >
                  <MenuItem value="">Todos los tipos</MenuItem>
                  {orderTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={2}>
                <TextField
                  label="Monto Mínimo"
                  type="number"
                  size="small"
                  value={localFilters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  InputProps={{
                    startAdornment: '₡'
                  }}
                />
                <TextField
                  label="Monto Máximo"
                  type="number"
                  size="small"
                  value={localFilters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  InputProps={{
                    startAdornment: '₡'
                  }}
                />
              </Box>
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
                    onDelete={() => handleDateRangeChange('start', null) && handleDateRangeChange('end', null)}
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
                {localFilters.orderType && (
                  <Chip
                    label={`Tipo: ${orderTypes.find(t => t.value === localFilters.orderType)?.label}`}
                    onDelete={() => handleFilterChange('orderType', '')}
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
  );
};

export default Filters;
