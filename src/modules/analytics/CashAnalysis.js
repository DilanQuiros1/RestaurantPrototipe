import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
  LocalDining as DiningIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import Filters from './Filters';

const CashAnalysis = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    category: '',
    paymentMethod: '',
    status: '',
    orderType: ''
  });
  const [cashMetrics, setCashMetrics] = useState({});
  const [chartData, setChartData] = useState({});

  // Generar datos mock para análisis de caja
  const generateCashData = () => {
    const orders = [];
    const categories = ['comidas-rapidas', 'platos-fuertes', 'bebidas', 'postres'];
    const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia'];
    const statuses = ['completed', 'pending', 'cancelled'];
    const orderTypes = ['dine-in', 'takeout'];

    for (let i = 0; i < 200; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const items = Math.floor(Math.random() * 5) + 1;
      const baseAmount = Math.floor(Math.random() * 15000) + 2000;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      orders.push({
        id: `ORD-${1000 + i}`,
        date: date.toISOString(),
        amount: status === 'cancelled' ? 0 : baseAmount,
        originalAmount: baseAmount,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: status,
        orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        items: Array.from({ length: items }, (_, j) => ({
          name: `Producto ${j + 1}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          price: Math.floor(Math.random() * 5000) + 1000,
          quantity: Math.floor(Math.random() * 3) + 1
        })),
        table: Math.floor(Math.random() * 20) + 1,
        customerName: `Cliente ${i + 1}`,
        processingTime: Math.floor(Math.random() * 30) + 5
      });
    }

    return orders;
  };

  // Calcular métricas de caja
  const calculateCashMetrics = (orders) => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
    const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.amount, 0);
    const lostRevenue = cancelledOrders.reduce((sum, order) => sum + order.originalAmount, 0);

    // Análisis por método de pago
    const paymentAnalysis = {};
    completedOrders.forEach(order => {
      if (!paymentAnalysis[order.paymentMethod]) {
        paymentAnalysis[order.paymentMethod] = { count: 0, amount: 0 };
      }
      paymentAnalysis[order.paymentMethod].count++;
      paymentAnalysis[order.paymentMethod].amount += order.amount;
    });

    // Análisis por categoría
    const categoryAnalysis = {};
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!categoryAnalysis[item.category]) {
          categoryAnalysis[item.category] = { count: 0, amount: 0, items: 0 };
        }
        categoryAnalysis[item.category].count++;
        categoryAnalysis[item.category].amount += item.price * item.quantity;
        categoryAnalysis[item.category].items += item.quantity;
      });
    });

    // Análisis por tipo de orden
    const orderTypeAnalysis = {};
    completedOrders.forEach(order => {
      if (!orderTypeAnalysis[order.orderType]) {
        orderTypeAnalysis[order.orderType] = { count: 0, amount: 0 };
      }
      orderTypeAnalysis[order.orderType].count++;
      orderTypeAnalysis[order.orderType].amount += order.amount;
    });

    // Análisis temporal (últimos 7 días)
    const dailyAnalysis = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.toDateString() === date.toDateString();
      });
      
      dailyAnalysis.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.amount, 0),
        avgTicket: dayOrders.length > 0 ? dayOrders.reduce((sum, order) => sum + order.amount, 0) / dayOrders.length : 0
      });
    }

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      pendingRevenue,
      lostRevenue,
      avgTicket: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      completionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
      cancellationRate: orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0,
      paymentAnalysis,
      categoryAnalysis,
      orderTypeAnalysis,
      dailyAnalysis
    };
  };

  // Inicializar datos
  useEffect(() => {
    const orders = generateCashData();
    setFilteredData(orders);
    const metrics = calculateCashMetrics(orders);
    setCashMetrics(metrics);
    
    // Preparar datos para gráficos
    const paymentChartData = Object.entries(metrics.paymentAnalysis).map(([method, data]) => ({
      name: method,
      amount: data.amount,
      count: data.count,
      percentage: ((data.amount / metrics.totalRevenue) * 100).toFixed(1)
    }));

    const categoryChartData = Object.entries(metrics.categoryAnalysis).map(([category, data]) => ({
      name: getCategoryLabel(category),
      amount: data.amount,
      count: data.count,
      items: data.items
    }));

    setChartData({
      payment: paymentChartData,
      category: categoryChartData,
      daily: metrics.dailyAnalysis
    });
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const orders = generateCashData();
    let filtered = [...orders];

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= filters.dateRange.start && orderDate <= filters.dateRange.end;
      });
    }

    if (filters.category) {
      filtered = filtered.filter(order =>
        order.items.some(item => item.category === filters.category)
      );
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(order => order.paymentMethod === filters.paymentMethod);
    }

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.orderType) {
      filtered = filtered.filter(order => order.orderType === filters.orderType);
    }

    setFilteredData(filtered);
    const metrics = calculateCashMetrics(filtered);
    setCashMetrics(metrics);

    // Actualizar datos de gráficos
    const paymentChartData = Object.entries(metrics.paymentAnalysis).map(([method, data]) => ({
      name: method,
      amount: data.amount,
      count: data.count,
      percentage: metrics.totalRevenue > 0 ? ((data.amount / metrics.totalRevenue) * 100).toFixed(1) : 0
    }));

    const categoryChartData = Object.entries(metrics.categoryAnalysis).map(([category, data]) => ({
      name: getCategoryLabel(category),
      amount: data.amount,
      count: data.count,
      items: data.items
    }));

    setChartData({
      payment: paymentChartData,
      category: categoryChartData,
      daily: metrics.dailyAnalysis
    });
  }, [filters]);

  const getCategoryLabel = (category) => {
    const labels = {
      'comidas-rapidas': 'Comidas Rápidas',
      'platos-fuertes': 'Platos Fuertes',
      'bebidas': 'Bebidas',
      'postres': 'Postres'
    };
    return labels[category] || category;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Análisis de Caja
      </Typography>

      {/* Filtros */}
      <Filters onFilterChange={setFilters} filters={filters} />

      {/* KPIs Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(cashMetrics.totalRevenue || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ingresos Totales
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {cashMetrics.completedOrders || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Órdenes Completadas
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(cashMetrics.pendingRevenue || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ingresos Pendientes
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(cashMetrics.avgTicket || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ticket Promedio
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métricas de Estado */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Estado de Órdenes
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Tasa de Completado</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {(cashMetrics.completionRate || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={cashMetrics.completionRate || 0} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Tasa de Cancelación</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {(cashMetrics.cancellationRate || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={cashMetrics.cancellationRate || 0} 
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Resumen Financiero
              </Typography>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Ingresos Confirmados:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(cashMetrics.totalRevenue || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Ingresos Pendientes:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {formatCurrency(cashMetrics.pendingRevenue || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Ingresos Perdidos:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {formatCurrency(cashMetrics.lostRevenue || 0)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Potencial:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency((cashMetrics.totalRevenue || 0) + (cashMetrics.pendingRevenue || 0) + (cashMetrics.lostRevenue || 0))}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Estadísticas Generales
              </Typography>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Total de Órdenes:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {cashMetrics.totalOrders || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Órdenes Pendientes:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {cashMetrics.pendingOrders || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Órdenes Canceladas:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {cashMetrics.cancelledOrders || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos de Análisis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Tendencia Diaria */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tendencia de Ingresos (Últimos 7 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Ingresos' : name === 'orders' ? 'Órdenes' : 'Ticket Promedio'
                    ]}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    fill="#1976d2"
                    fillOpacity={0.3}
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Ingresos"
                  />
                  <Bar yAxisId="right" dataKey="orders" fill="#2e7d32" name="Órdenes" />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgTicket"
                    stroke="#ed6c02"
                    strokeWidth={2}
                    name="Ticket Promedio"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Métodos de Pago */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Ingresos por Método de Pago
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.payment || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {(chartData.payment || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análisis por Categorías */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Ingresos por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.category || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Detalle por Método de Pago
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Método</TableCell>
                      <TableCell align="right">Órdenes</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(chartData.payment || []).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: colors[index % colors.length] }}>
                              <CreditCardIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                            {row.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashAnalysis;
