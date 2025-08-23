// Mock data para métricas y reportes del restaurante
export const generateMockData = (daysBack = 90, orderCount = 800) => {
  const today = new Date();
  const orders = [];
  const products = [
    { id: 1, name: 'Hamburguesa Clásica', category: 'comidas-rapidas', price: 4500 },
    { id: 2, name: 'Nachos Supremos', category: 'comidas-rapidas', price: 5000 },
    { id: 3, name: 'Pizza Margherita', category: 'comidas-rapidas', price: 7500 },
    { id: 4, name: 'Hot Dog Gourmet', category: 'comidas-rapidas', price: 3500 },
    { id: 5, name: 'Filete de Res', category: 'platos-fuertes', price: 5500 },
    { id: 6, name: 'Pollo a la Plancha', category: 'platos-fuertes', price: 5500 },
    { id: 7, name: 'Pasta Carbonara', category: 'platos-fuertes', price: 4800 },
    { id: 8, name: 'Salmón Asado', category: 'platos-fuertes', price: 4500 },
    { id: 9, name: 'Limonada Natural', category: 'bebidas', price: 1300 },
    { id: 10, name: 'Smoothie de Frutas', category: 'bebidas', price: 1500 },
    { id: 11, name: 'Café Americano', category: 'bebidas', price: 1200 },
    { id: 12, name: 'Té Helado', category: 'bebidas', price: 1500 }
  ];

  const paymentMethods = ['Efectivo', 'Tarjeta', 'SINPE Móvil'];
  const orderTypes = ['dine-in', 'takeout'];

  // Generar órdenes con patrones realistas para el período especificado
  for (let i = 0; i < orderCount; i++) {
    const orderDate = new Date(today);
    orderDate.setDate(today.getDate() - Math.floor(Math.random() * daysBack));
    
    // Simular patrones de horas pico (11-14h y 18-21h)
    const hour = Math.random() < 0.7 
      ? (Math.random() < 0.5 ? 11 + Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 4))
      : Math.floor(Math.random() * 24);
    orderDate.setHours(hour, Math.floor(Math.random() * 60));
    
    // Patrones por día de la semana (menos ventas domingo/lunes)
    const dayOfWeek = orderDate.getDay();
    const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 1 ? 0.6 : 
                         dayOfWeek === 5 || dayOfWeek === 6 ? 1.3 : 1.0;
    
    // Patrones estacionales (más actividad en meses recientes)
    const monthsBack = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24 * 30));
    const seasonalMultiplier = Math.max(0.7, 1 - (monthsBack * 0.1));
    
    if (Math.random() > (dayMultiplier * seasonalMultiplier * 0.8)) continue;
    
    const orderItems = [];
    const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items por orden
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
        quantity: quantity,
        subtotal: product.price * quantity
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.13; // 13% IVA
    const discount = Math.random() > 0.8 ? subtotal * (0.05 + Math.random() * 0.15) : 0; // 5-20% descuento aleatorio
    const total = subtotal + tax - discount;

    orders.push({
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      date: orderDate.toISOString(),
      customerName: `Cliente ${i + 1}`,
      orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
      tableNumber: orderTypes[0] === 'dine-in' ? Math.floor(Math.random() * 12) + 1 : null,
      items: orderItems,
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total: total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: Math.random() > 0.1 ? 'completed' : 'cancelled',
      preparationTime: Math.floor(Math.random() * 30) + 10, // 10-40 minutos
      createdAt: orderDate.toISOString(),
      completedAt: new Date(orderDate.getTime() + (Math.floor(Math.random() * 30) + 10) * 60000).toISOString(),
      // Agregar más variabilidad en los datos
      waiterName: `Mesero ${Math.floor(Math.random() * 8) + 1}`,
      customerAge: Math.floor(Math.random() * 50) + 18,
      customerType: Math.random() > 0.7 ? 'frequent' : 'occasional'
    });
  }

  // Ordenar por fecha para mejor análisis
  orders.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return { orders, products };
};

// Función para calcular KPIs
export const calculateKPIs = (orders, period = 'today') => {
  const now = new Date();
  let filteredOrders = orders.filter(order => order.status === 'completed');

  // Filtrar por período
  switch (period) {
    case 'today':
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.toDateString() === now.toDateString();
      });
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= weekStart;
      });
      break;
    case 'month':
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= monthStart;
      });
      break;
  }

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Productos más vendidos
  const productSales = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productName]) {
        productSales[item.productName] = {
          name: item.productName,
          category: item.category,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.productName].quantity += item.quantity;
      productSales[item.productName].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalSales,
    totalOrders,
    averageTicket,
    topProducts,
    totalTax: filteredOrders.reduce((sum, order) => sum + order.tax, 0),
    totalDiscount: filteredOrders.reduce((sum, order) => sum + order.discount, 0)
  };
};

// Función para generar datos de gráficos
export const generateChartData = (orders, type = 'sales', period = 'week') => {
  const now = new Date();
  const data = [];

  if (type === 'sales') {
    // Datos de ventas por día
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.toDateString() === date.toDateString() && order.status === 'completed';
      });

      const dayTotal = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      data.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        sales: dayTotal,
        orders: dayOrders.length
      });
    }
  } else if (type === 'categories') {
    // Datos por categoría
    const categoryData = {};
    orders.filter(order => order.status === 'completed').forEach(order => {
      order.items.forEach(item => {
        if (!categoryData[item.category]) {
          categoryData[item.category] = 0;
        }
        categoryData[item.category] += item.subtotal;
      });
    });

    Object.entries(categoryData).forEach(([category, value]) => {
      data.push({
        name: category.replace('-', ' ').toUpperCase(),
        value: value
      });
    });
  } else if (type === 'payment') {
    // Datos por método de pago
    const paymentData = {};
    orders.filter(order => order.status === 'completed').forEach(order => {
      if (!paymentData[order.paymentMethod]) {
        paymentData[order.paymentMethod] = 0;
      }
      paymentData[order.paymentMethod] += order.total;
    });

    Object.entries(paymentData).forEach(([method, value]) => {
      data.push({
        name: method,
        value: value
      });
    });
  }

  return data;
};

// Función para obtener datos de comparación
export const getComparisonData = (orders, currentPeriod = 'week') => {
  const now = new Date();
  let currentStart, currentEnd, previousStart, previousEnd;

  if (currentPeriod === 'week') {
    currentEnd = new Date(now);
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 7);
    
    previousEnd = new Date(currentStart);
    previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 7);
  } else if (currentPeriod === 'month') {
    currentEnd = new Date(now);
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 30);
    
    previousEnd = new Date(currentStart);
    previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 30);
  }

  const currentOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= currentStart && orderDate <= currentEnd && order.status === 'completed';
  });

  const previousOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= previousStart && orderDate <= previousEnd && order.status === 'completed';
  });

  const currentKPIs = calculateKPIs(currentOrders, 'custom');
  const previousKPIs = calculateKPIs(previousOrders, 'custom');

  return {
    current: currentKPIs,
    previous: previousKPIs,
    salesGrowth: previousKPIs.totalSales > 0 
      ? ((currentKPIs.totalSales - previousKPIs.totalSales) / previousKPIs.totalSales) * 100 
      : 0,
    ordersGrowth: previousKPIs.totalOrders > 0 
      ? ((currentKPIs.totalOrders - previousKPIs.totalOrders) / previousKPIs.totalOrders) * 100 
      : 0,
    ticketGrowth: previousKPIs.averageTicket > 0 
      ? ((currentKPIs.averageTicket - previousKPIs.averageTicket) / previousKPIs.averageTicket) * 100 
      : 0
  };
};

// Función para análisis de patrones de comportamiento
export const getBehavioralPatterns = (orders, filters = {}) => {
  const completedOrders = orders.filter(order => order.status === 'completed');
  
  // Análisis de horas pico
  const hourlyData = {};
  const dailyData = {};
  const customerPatterns = {};
  
  completedOrders.forEach(order => {
    const orderDate = new Date(order.date);
    const hour = orderDate.getHours();
    const dayOfWeek = orderDate.getDay();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Patrones por hora
    if (!hourlyData[hour]) {
      hourlyData[hour] = { orders: 0, sales: 0 };
    }
    hourlyData[hour].orders += 1;
    hourlyData[hour].sales += order.total;
    
    // Patrones por día de la semana
    const dayName = dayNames[dayOfWeek];
    if (!dailyData[dayName]) {
      dailyData[dayName] = { orders: 0, sales: 0, dayIndex: dayOfWeek };
    }
    dailyData[dayName].orders += 1;
    dailyData[dayName].sales += order.total;
    
    // Patrones de compra por cliente
    if (!customerPatterns[order.customerName]) {
      customerPatterns[order.customerName] = {
        orders: [],
        favoriteDay: {},
        favoriteProducts: {},
        totalSpent: 0
      };
    }
    
    customerPatterns[order.customerName].orders.push(order);
    customerPatterns[order.customerName].totalSpent += order.total;
    
    if (!customerPatterns[order.customerName].favoriteDay[dayName]) {
      customerPatterns[order.customerName].favoriteDay[dayName] = 0;
    }
    customerPatterns[order.customerName].favoriteDay[dayName] += 1;
    
    order.items.forEach(item => {
      if (!customerPatterns[order.customerName].favoriteProducts[item.productName]) {
        customerPatterns[order.customerName].favoriteProducts[item.productName] = 0;
      }
      customerPatterns[order.customerName].favoriteProducts[item.productName] += item.quantity;
    });
  });
  
  // Procesar datos de horas pico
  const peakHours = Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      hourLabel: `${hour}:00`,
      orders: data.orders,
      sales: data.sales,
      avgTicket: data.orders > 0 ? data.sales / data.orders : 0
    }))
    .sort((a, b) => b.orders - a.orders);
  
  // Procesar datos diarios
  const weeklyPatterns = Object.entries(dailyData)
    .map(([day, data]) => ({
      day,
      dayIndex: data.dayIndex,
      orders: data.orders,
      sales: data.sales,
      avgTicket: data.orders > 0 ? data.sales / data.orders : 0
    }))
    .sort((a, b) => a.dayIndex - b.dayIndex);
  
  // Identificar clientes frecuentes y sus patrones
  const frequentCustomers = Object.entries(customerPatterns)
    .filter(([_, data]) => data.orders.length >= 3)
    .map(([customer, data]) => {
      const favoriteDay = Object.entries(data.favoriteDay)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
      
      const favoriteProduct = Object.entries(data.favoriteProducts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
      
      return {
        customer,
        orderCount: data.orders.length,
        totalSpent: data.totalSpent,
        avgSpent: data.totalSpent / data.orders.length,
        favoriteDay,
        favoriteProduct,
        lastOrder: Math.max(...data.orders.map(o => new Date(o.date).getTime()))
      };
    })
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 10);
  
  return {
    peakHours: peakHours.slice(0, 8),
    weeklyPatterns,
    frequentCustomers,
    totalCustomers: Object.keys(customerPatterns).length,
    repeatCustomerRate: (frequentCustomers.length / Object.keys(customerPatterns).length) * 100
  };
};

// Función para análisis comparativo avanzado
export const getAdvancedComparison = (orders, filters = {}) => {
  const now = new Date();
  let completedOrders = orders.filter(order => order.status === 'completed');
  
  // Aplicar filtros de fecha si están disponibles
  if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
    completedOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= filters.dateRange.start && orderDate <= filters.dateRange.end;
    });
  }
  
  // Aplicar filtros de categoría
  if (filters.category) {
    completedOrders = completedOrders.filter(order =>
      order.items.some(item => item.category === filters.category)
    );
  }
  
  // Aplicar filtros de método de pago
  if (filters.paymentMethod) {
    completedOrders = completedOrders.filter(order => 
      order.paymentMethod === filters.paymentMethod
    );
  }
  
  // Determinar rango de comparación basado en filtros o usar por defecto
  const getComparisonRange = () => {
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 31) {
        return { type: 'daily', periods: diffDays };
      } else if (diffDays <= 365) {
        return { type: 'weekly', periods: Math.ceil(diffDays / 7) };
      } else {
        return { type: 'monthly', periods: Math.min(12, Math.ceil(diffDays / 30)) };
      }
    }
    return { type: 'monthly', periods: 6 };
  };
  
  const comparisonRange = getComparisonRange();
  const monthlyComparison = [];
  
  if (comparisonRange.type === 'monthly') {
    for (let i = comparisonRange.periods - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });
    
    const monthSales = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    
    monthlyComparison.push({
      period: monthName,
      sales: monthSales,
      orders: monthOrders.length,
      avgTicket: monthOrders.length > 0 ? monthSales / monthOrders.length : 0
    });
  }
  
  } else if (comparisonRange.type === 'weekly') {
    for (let i = comparisonRange.periods - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 6);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const weekOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });
      
      const weekSales = weekOrders.reduce((sum, order) => sum + order.total, 0);
      const weekName = `Sem ${comparisonRange.periods - i}`;
      
      monthlyComparison.push({
        period: weekName,
        sales: weekSales,
        orders: weekOrders.length,
        avgTicket: weekOrders.length > 0 ? weekSales / weekOrders.length : 0
      });
    }
  }
  
  // Comparación día vs día
  const dailyPeriod = filters.dateRange && filters.dateRange.start && filters.dateRange.end 
    ? Math.min(28, Math.ceil(Math.abs(filters.dateRange.end - filters.dateRange.start) / (1000 * 60 * 60 * 24)))
    : 28;
  
  const dailyComparison = [];
  for (let i = dailyPeriod - 1; i >= 0; i--) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - i);
    
    const dayOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === dayDate.toDateString();
    });
    
    const daySales = dayOrders.reduce((sum, order) => sum + order.total, 0);
    
    dailyComparison.push({
      date: dayDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      fullDate: dayDate,
      sales: daySales,
      orders: dayOrders.length,
      dayOfWeek: dayDate.getDay()
    });
  }
  
  // Análisis comparativo de períodos (configurable)
  const getSeasonalComparison = (comparisonType = 'previousYear') => {
    const currentPeriodSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const currentPeriodOrders = completedOrders.length;
    
    let previousPeriodStart, previousPeriodEnd, periodLabel;
    
    switch (comparisonType) {
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        previousPeriodStart = new Date(yesterday);
        previousPeriodStart.setHours(0, 0, 0, 0);
        previousPeriodEnd = new Date(yesterday);
        previousPeriodEnd.setHours(23, 59, 59, 999);
        periodLabel = { current: 'Hoy', previous: 'Ayer' };
        break;
        
      case 'lastWeek':
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay());
        previousPeriodStart = new Date(thisWeekStart);
        previousPeriodStart.setDate(thisWeekStart.getDate() - 7);
        previousPeriodEnd = new Date(thisWeekStart);
        previousPeriodEnd.setDate(thisWeekStart.getDate() - 1);
        periodLabel = { current: 'Esta Semana', previous: 'Semana Anterior' };
        break;
        
      case 'lastMonth':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        periodLabel = { current: 'Este Mes', previous: 'Mes Anterior' };
        break;
        
      case 'lastQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousPeriodStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousPeriodEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
        periodLabel = { current: 'Este Trimestre', previous: 'Trimestre Anterior' };
        break;
        
      case 'previousYear':
      default:
        // Usar el mismo período del año anterior
        if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
          const currentStart = new Date(filters.dateRange.start);
          const currentEnd = new Date(filters.dateRange.end);
          previousPeriodStart = new Date(currentStart);
          previousPeriodStart.setFullYear(currentStart.getFullYear() - 1);
          previousPeriodEnd = new Date(currentEnd);
          previousPeriodEnd.setFullYear(currentEnd.getFullYear() - 1);
        } else {
          previousPeriodStart = new Date(now);
          previousPeriodStart.setFullYear(now.getFullYear() - 1);
          previousPeriodStart.setDate(now.getDate() - 30);
          previousPeriodEnd = new Date(now);
          previousPeriodEnd.setFullYear(now.getFullYear() - 1);
        }
        periodLabel = { current: 'Período Actual', previous: 'Año Anterior' };
        break;
    }
    
    // Obtener datos del período anterior
    const allOrders = orders.filter(order => order.status === 'completed');
    const previousPeriodOrders = allOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= previousPeriodStart && orderDate <= previousPeriodEnd;
    });
    
    // Aplicar los mismos filtros al período anterior
    let filteredPreviousPeriodOrders = previousPeriodOrders;
    if (filters.category) {
      filteredPreviousPeriodOrders = filteredPreviousPeriodOrders.filter(order =>
        order.items.some(item => item.category === filters.category)
      );
    }
    if (filters.paymentMethod) {
      filteredPreviousPeriodOrders = filteredPreviousPeriodOrders.filter(order => 
        order.paymentMethod === filters.paymentMethod
      );
    }
    
    const previousPeriodSales = filteredPreviousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const previousPeriodOrderCount = filteredPreviousPeriodOrders.length;
    
    // Calcular crecimiento
    const salesGrowth = previousPeriodSales > 0 
      ? ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100 
      : 0;
    const ordersGrowth = previousPeriodOrderCount > 0 
      ? ((currentPeriodOrders - previousPeriodOrderCount) / previousPeriodOrderCount) * 100 
      : 0;
    
    return {
      currentPeriod: {
        sales: currentPeriodSales,
        orders: currentPeriodOrders
      },
      previousPeriod: {
        sales: previousPeriodSales,
        orders: previousPeriodOrderCount
      },
      growthRate: salesGrowth,
      ordersGrowthRate: ordersGrowth,
      periodLabel,
      comparisonType
    };
  };
  
  const seasonalComparison = getSeasonalComparison(filters.comparisonPeriod || 'previousYear');
  
  return {
    monthlyComparison,
    dailyComparison,
    seasonalComparison,
    comparisonType: comparisonRange.type,
    totalPeriods: comparisonRange.periods,
    availableComparisons: ['yesterday', 'lastWeek', 'lastMonth', 'lastQuarter', 'previousYear']
  };
};

// Función para análisis de productos con bajo rendimiento
export const getUnderperformingProducts = (orders, filters = {}) => {
  const completedOrders = orders.filter(order => order.status === 'completed');
  const productPerformance = {};
  const allProducts = [
    { id: 1, name: 'Hamburguesa Clásica', category: 'comidas-rapidas', price: 4500 },
    { id: 2, name: 'Nachos Supremos', category: 'comidas-rapidas', price: 5000 },
    { id: 3, name: 'Pizza Margherita', category: 'comidas-rapidas', price: 7500 },
    { id: 4, name: 'Hot Dog Gourmet', category: 'comidas-rapidas', price: 3500 },
    { id: 5, name: 'Filete de Res', category: 'platos-fuertes', price: 5500 },
    { id: 6, name: 'Pollo a la Plancha', category: 'platos-fuertes', price: 5500 },
    { id: 7, name: 'Pasta Carbonara', category: 'platos-fuertes', price: 4800 },
    { id: 8, name: 'Salmón Asado', category: 'platos-fuertes', price: 4500 },
    { id: 9, name: 'Limonada Natural', category: 'bebidas', price: 1300 },
    { id: 10, name: 'Smoothie de Frutas', category: 'bebidas', price: 1500 },
    { id: 11, name: 'Café Americano', category: 'bebidas', price: 1200 },
    { id: 12, name: 'Té Helado', category: 'bebidas', price: 1500 }
  ];
  
  // Inicializar todos los productos
  allProducts.forEach(product => {
    productPerformance[product.name] = {
      name: product.name,
      category: product.category,
      price: product.price,
      totalSold: 0,
      revenue: 0,
      orderCount: 0,
      lastSold: null,
      avgDaysBetweenSales: 0
    };
  });
  
  // Calcular métricas de rendimiento
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (productPerformance[item.productName]) {
        productPerformance[item.productName].totalSold += item.quantity;
        productPerformance[item.productName].revenue += item.subtotal;
        productPerformance[item.productName].orderCount += 1;
        
        const orderDate = new Date(order.date);
        if (!productPerformance[item.productName].lastSold || 
            orderDate > productPerformance[item.productName].lastSold) {
          productPerformance[item.productName].lastSold = orderDate;
        }
      }
    });
  });
  
  // Calcular días desde última venta y identificar productos con bajo rendimiento
  const referenceDate = filters.dateRange && filters.dateRange.end 
    ? new Date(filters.dateRange.end) 
    : new Date();
  
  const analysisPeriodDays = filters.dateRange && filters.dateRange.start && filters.dateRange.end
    ? Math.ceil(Math.abs(filters.dateRange.end - filters.dateRange.start) / (1000 * 60 * 60 * 24))
    : 30;
  const underperformingProducts = Object.values(productPerformance)
    .map(product => {
      const daysSinceLastSale = product.lastSold 
        ? Math.floor((referenceDate - product.lastSold) / (1000 * 60 * 60 * 24))
        : 999;
      
      const salesRate = product.totalSold / analysisPeriodDays; // ventas por día promedio
      const revenuePercentage = (product.revenue / completedOrders.reduce((sum, order) => sum + order.total, 0)) * 100;
      
      return {
        ...product,
        daysSinceLastSale,
        salesRate,
        revenuePercentage,
        performanceScore: (salesRate * 0.4) + (revenuePercentage * 0.4) + ((analysisPeriodDays - daysSinceLastSale) * 0.2)
      };
    })
    .sort((a, b) => a.performanceScore - b.performanceScore);
  
  // Identificar productos que necesitan atención (ajustado según período de análisis)
  const attentionThreshold = Math.max(3, Math.floor(analysisPeriodDays * 0.25));
  const salesRateThreshold = 1 / analysisPeriodDays; // al menos 1 venta en el período
  
  const needsAttention = underperformingProducts.filter(product => 
    product.daysSinceLastSale > attentionThreshold || 
    product.salesRate < salesRateThreshold || 
    product.revenuePercentage < 2
  );
  
  // Sugerencias de mejora
  const suggestions = needsAttention.slice(0, 5).map(product => {
    let suggestion = '';
    const longPeriodThreshold = Math.floor(analysisPeriodDays * 0.5);
    const lowSalesThreshold = 0.5 / analysisPeriodDays;
    
    if (product.daysSinceLastSale > longPeriodThreshold) {
      suggestion = 'Considerar promoción especial o descuento';
    } else if (product.salesRate < lowSalesThreshold) {
      suggestion = 'Revisar precio o presentación del producto';
    } else if (product.revenuePercentage < 1) {
      suggestion = 'Evaluar si mantener en el menú';
    } else {
      suggestion = 'Mejorar visibilidad en el menú';
    }
    
    return {
      ...product,
      suggestion
    };
  });
  
  return {
    allProducts: underperformingProducts,
    needsAttention,
    suggestions,
    totalProducts: allProducts.length,
    underperformingCount: needsAttention.length,
    analysisPeriodDays,
    attentionThreshold
  };
};

// Función para generar datos de prueba específicos para diferentes escenarios
export const generateTestData = () => {
  const scenarios = {
    // Datos para últimos 7 días
    week: generateMockData(7, 150),
    // Datos para último mes
    month: generateMockData(30, 400),
    // Datos para últimos 3 meses
    quarter: generateMockData(90, 800),
    // Datos para último año
    year: generateMockData(365, 2500)
  };
  
  return scenarios;
};

// Función para simular diferentes tipos de comportamiento de ventas
export const generateScenarioData = (scenario = 'normal') => {
  const baseData = generateMockData();
  
  switch (scenario) {
    case 'growth':
      // Simular crecimiento constante
      return {
        ...baseData,
        orders: baseData.orders.map(order => ({
          ...order,
          total: order.total * (1 + Math.random() * 0.3) // 0-30% más
        }))
      };
    
    case 'decline':
      // Simular declive
      return {
        ...baseData,
        orders: baseData.orders.map(order => ({
          ...order,
          total: order.total * (0.7 + Math.random() * 0.2) // 20-30% menos
        }))
      };
    
    case 'seasonal':
      // Simular patrones estacionales fuertes
      return {
        ...baseData,
        orders: baseData.orders.map(order => {
          const date = new Date(order.date);
          const dayOfWeek = date.getDay();
          const multiplier = dayOfWeek === 5 || dayOfWeek === 6 ? 1.5 : 
                           dayOfWeek === 0 || dayOfWeek === 1 ? 0.4 : 1.0;
          return {
            ...order,
            total: order.total * multiplier
          };
        })
      };
    
    default:
      return baseData;
  }
};

export default { 
  generateMockData, 
  calculateKPIs, 
  generateChartData, 
  getComparisonData,
  getBehavioralPatterns,
  getAdvancedComparison,
  getUnderperformingProducts,
  generateTestData,
  generateScenarioData
};
