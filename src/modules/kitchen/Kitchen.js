import React, { useState, useEffect } from 'react';
import KitchenQueue from './KitchenQueue';
import './Kitchen.css';

const Kitchen = () => {
  // Estado para manejar los pedidos
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados posibles de los pedidos
  const ORDER_STATES = {
    PENDING: 'pendiente',
    IN_PROGRESS: 'en_preparacion',
    READY: 'listo',
    DELIVERED: 'entregado'
  };

  // Simulación de pedidos iniciales para el prototipo
  const getMockOrders = () => [
    {
      id: 1,
      customerName: 'Dilan Quiros',
      orderType: 'dine-in',
      tableNumber: 5,
      items: [
        { 
          name: 'Hamburguesa Clásica', 
          quantity: 2, 
          preparationTime: 15,
          comments: 'Sin cebolla, extra queso'
        },
        { 
          name: 'Limonada Natural', 
          quantity: 2, 
          preparationTime: 3,
          comments: 'Sin azúcar'
        }
      ],
      status: ORDER_STATES.PENDING,
      orderTime: new Date(Date.now() - 10 * 60000), // Hace 10 minutos
      estimatedTime: 15,
      priority: 'normal',
      totalAmount: 25.96
    },
    {
      id: 2,
      customerName: 'Valeria Arias',
      orderType: 'dine-in',
      tableNumber: 3,
      items: [
        { 
          name: 'Filete de Res', 
          quantity: 1, 
          preparationTime: 25,
          comments: 'Término medio, sin sal'
        },
        { 
          name: 'Café Americano', 
          quantity: 1, 
          preparationTime: 2,
          comments: null
        }
      ],
      status: ORDER_STATES.IN_PROGRESS,
      orderTime: new Date(Date.now() - 5 * 60000), // Hace 5 minutos
      estimatedTime: 25,
      priority: 'alta',
      totalAmount: 27.98,
      startTime: new Date(Date.now() - 3 * 60000) // Empezó hace 3 minutos
    },
    {
      id: 3,
      customerName: 'Gabriel Rodriguez',
      orderType: 'takeout',
      tableNumber: null,
      items: [
        { 
          name: 'Pizza Margherita', 
          quantity: 1, 
          preparationTime: 20,
          comments: 'Extra albahaca, masa delgada'
        },
        { 
          name: 'Smoothie de Frutas', 
          quantity: 2, 
          preparationTime: 5,
          comments: 'Sin miel, con yogurt extra'
        }
      ],
      status: ORDER_STATES.READY,
      orderTime: new Date(Date.now() - 25 * 60000), // Hace 25 minutos
      estimatedTime: 20,
      priority: 'normal',
      totalAmount: 24.97,
      startTime: new Date(Date.now() - 20 * 60000), // Empezó hace 20 minutos
      readyTime: new Date(Date.now() - 2 * 60000) // Listo hace 2 minutos
    }
  ];

  // Inicializar con pedidos mock
  useEffect(() => {
    setOrders(getMockOrders());
  }, []);

  // Actualizar el tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Función para cambiar el estado de un pedido
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus };
          
          // Agregar timestamp según el estado
          if (newStatus === ORDER_STATES.IN_PROGRESS && !order.startTime) {
            updatedOrder.startTime = new Date();
          } else if (newStatus === ORDER_STATES.READY && !order.readyTime) {
            updatedOrder.readyTime = new Date();
          }
          
          return updatedOrder;
        }
        return order;
      })
    );
  };

  // Función para agregar un nuevo pedido (para cuando se conecte con el módulo de menú)
  // eslint-disable-next-line no-unused-vars
  const addNewOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: Date.now(), // ID temporal
      status: ORDER_STATES.PENDING,
      orderTime: new Date(),
      priority: 'normal'
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  // Filtrar pedidos por estado
  const pendingOrders = orders.filter(order => order.status === ORDER_STATES.PENDING);
  const inProgressOrders = orders.filter(order => order.status === ORDER_STATES.IN_PROGRESS);
  const readyOrders = orders.filter(order => order.status === ORDER_STATES.READY);

  return (
    <div className="kitchen-container">
      {/* Header de la cocina */}
      <div className="kitchen-header">
        <h1 className="kitchen-title">🍳 Panel de Cocina</h1>
        <div className="kitchen-time">
          {currentTime.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="kitchen-stats">
        <div className="stat-card">
          <span className="stat-number">{pendingOrders.length}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{inProgressOrders.length}</span>
          <span className="stat-label">En Preparación</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{readyOrders.length}</span>
          <span className="stat-label">Listos</span>
        </div>
      </div>

      {/* Colas de pedidos */}
      <div className="kitchen-queues">
        <KitchenQueue
          title="🔄 Pedidos Pendientes"
          orders={pendingOrders}
          onUpdateStatus={updateOrderStatus}
          allowedActions={[ORDER_STATES.IN_PROGRESS]}
          emptyMessage="No hay pedidos pendientes"
        />

        <KitchenQueue
          title="⏳ En Preparación"
          orders={inProgressOrders}
          onUpdateStatus={updateOrderStatus}
          allowedActions={[ORDER_STATES.PENDING, ORDER_STATES.READY]}
          emptyMessage="No hay pedidos en preparación"
        />

        <KitchenQueue
          title="✅ Listos para Servir"
          orders={readyOrders}
          onUpdateStatus={updateOrderStatus}
          allowedActions={[ORDER_STATES.IN_PROGRESS, ORDER_STATES.DELIVERED]}
          emptyMessage="No hay pedidos listos"
        />
      </div>
    </div>
  );
};

export default Kitchen;
