// Mock data para métricas y reportes del restaurante
export const generateMockData = () => {
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

  // Generar órdenes de los últimos 30 días
  for (let i = 0; i < 500; i++) {
    const orderDate = new Date(today);
    orderDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    
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
    const discount = Math.random() > 0.8 ? subtotal * 0.1 : 0; // 10% descuento aleatorio
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
      completedAt: new Date(orderDate.getTime() + (Math.floor(Math.random() * 30) + 10) * 60000).toISOString()
    });
  }

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

export default { generateMockData, calculateKPIs, generateChartData, getComparisonData };
