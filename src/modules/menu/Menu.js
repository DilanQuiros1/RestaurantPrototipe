import React, { useState } from 'react';
import MenuItem from './MenuItem';
import OrderSummary from './OrderSummary';
import CheckoutModal from './CheckoutModal';
import AdminLoginModal from './AdminLoginModal';
import WaiterCallModal from './WaiterCallModal';
import { getImageByDishName } from './menuImages';
import './Menu.css';

const Menu = ({ onAdminAccess }) => {
  const [activeCategory, setActiveCategory] = useState('comidas-rapidas');
  const [order, setOrder] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isWaiterCallOpen, setIsWaiterCallOpen] = useState(false);

  // Datos del menú organizados por categorías
  const menuData = {
    'comidas-rapidas': [
      {
        id: 1,
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa de res con lechuga, tomate, cebolla y queso cheddar',
        price: 8.99,
        image: getImageByDishName('Filete de Res')
      },
      {
        id: 2,
        name: 'Nachos Supremos',
        description: 'Tortilla chips con queso fundido, jalapeños, guacamole y sour cream',
        price: 6.99,
        image: getImageByDishName('Pasta Carbonara')
      },
      {
        id: 3,
        name: 'Pizza Margherita',
        description: 'Pizza tradicional con salsa de tomate, mozzarella y albahaca fresca',
        price: 12.99,
        image: getImageByDishName('Pizza Margherita')
      },
      {
        id: 4,
        name: 'Hot Dog Gourmet',
        description: 'Salchicha premium con cebolla caramelizada, mostaza y relish',
        price: 5.99,
        image: getImageByDishName('Hot Dog Gourmet')
      }
    ],
    'platos-fuertes': [
      {
        id: 5,
        name: 'Filete de Res',
        description: 'Filete de res a la parrilla con vegetales asados y puré de papas',
        price: 24.99,
        image: getImageByDishName('Filete de Res')
      },
      {
        id: 6,
        name: 'Pollo a la Plancha',
        description: 'Pechuga de pollo marinada con hierbas y limón, servida con arroz',
        price: 18.99,
        image: getImageByDishName('Pollo a la Plancha')
      },
      {
        id: 7,
        name: 'Pasta Carbonara',
        description: 'Espagueti con salsa cremosa, panceta, huevo y queso parmesano',
        price: 16.99,
        image: getImageByDishName('Pasta Carbonara')
      },
      {
        id: 8,
        name: 'Salmón Asado',
        description: 'Filete de salmón con costra de hierbas y vegetales de temporada',
        price: 22.99,
        image: getImageByDishName('Pollo a la Plancha')
      }
    ],
    'bebidas': [
      {
        id: 9,
        name: 'Limonada Natural',
        description: 'Limonada fresca preparada con limones orgánicos y menta',
        price: 3.99,
        image: getImageByDishName('Limonada Natural')
      },
      {
        id: 10,
        name: 'Smoothie de Frutas',
        description: 'Mezcla de frutas frescas con yogurt griego y miel',
        price: 5.99,
        image: getImageByDishName('Smoothie de Frutas')
      },
      {
        id: 11,
        name: 'Café Americano',
        description: 'Café negro preparado con granos premium de origen único',
        price: 2.99,
        image: getImageByDishName('Café Americano')
      },
      {
        id: 12,
        name: 'Té Helado',
        description: 'Té negro helado con limón y menta, endulzado naturalmente',
        price: 3.49,
        image: getImageByDishName('Té Helado')
      }
    ]
  };

  const categories = [
    { id: 'comidas-rapidas', name: 'Comidas Rápidas' },
    { id: 'platos-fuertes', name: 'Platos Fuertes' },
    { id: 'bebidas', name: 'Bebidas' }
  ];

  const handleSelectItem = (itemWithDetails) => {
    setOrder(prevOrder => {
      // Si el item ya existe con los mismos comentarios, aumentar cantidad
      const existingItem = prevOrder.find(orderItem => 
        orderItem.id === itemWithDetails.id && 
        orderItem.comments === itemWithDetails.comments
      );
      
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.id === itemWithDetails.id && orderItem.comments === itemWithDetails.comments
            ? { ...orderItem, quantity: orderItem.quantity + itemWithDetails.quantity }
            : orderItem
        );
      } else {
        // Crear un ID único para items con diferentes comentarios
        const uniqueId = `${itemWithDetails.id}-${Date.now()}`;
        return [...prevOrder, { 
          ...itemWithDetails, 
          uniqueId,
          quantity: itemWithDetails.quantity || 1 
        }];
      }
    });
  };

  const handleClearOrder = () => {
    setOrder([]);
  };

  const handleCheckout = () => {
    if (order.length > 0) {
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCheckoutConfirm = (checkoutData) => {
    // Crear un resumen del pedido con comentarios
    const orderSummary = order.map(item => {
      let summary = `${item.name} x${item.quantity}`;
      if (item.comments && item.comments.trim()) {
        summary += ` - ${item.comments}`;
      }
      return summary;
    }).join('\n');

    const message = `¡Pedido confirmado!\n\nCliente: ${checkoutData.customerName}\nMesa: ${checkoutData.tableNumber}\n\nResumen:\n${orderSummary}\n\nPronto estará listo.`;
    alert(message);
    
    // Cerrar el modal y limpiar el pedido
    setIsCheckoutModalOpen(false);
    setOrder([]);
  };

  const handleCheckoutCancel = () => {
    setIsCheckoutModalOpen(false);
  };

  const handleRemoveItem = (itemId) => {
    setOrder(prevOrder => prevOrder.filter(item => item.id !== itemId));
  };

  const handleUpdateComments = (itemId, comments) => {
    setOrder(prevOrder => 
      prevOrder.map(item => 
        item.id === itemId 
          ? { ...item, comments } 
          : item
      )
    );
  };

  const handleAdminLogin = () => {
    setIsAdminLoginOpen(false);
    if (onAdminAccess) {
      onAdminAccess();
    }
  };

  const handleWaiterCall = (callData) => {
    // En un caso real, esto enviaría la notificación al sistema de cocina/administración
    const message = `🔔 LLAMADA DE MESERO\n\n` +
      `📍 Mesa: ${callData.tableNumber}\n` +
      `📋 Motivo: ${callData.reasonLabel}\n` +
      `🕐 Hora: ${callData.timestamp}\n` +
      (callData.message ? `💬 Mensaje: ${callData.message}\n` : '') +
      `\n✅ Notificación enviada a cocina.\nEl mesero se dirigirá a tu mesa pronto.`;
    
    alert(message);
    console.log('Llamada de mesero enviada:', callData);
  };

  return (
    <div className="menu-container">
      {/* Botón discreto de administración */}
      <button 
        className="admin-access-btn"
        onClick={() => setIsAdminLoginOpen(true)}
        title="Acceso Administrativo"
      >
        ⚙️
      </button>

      <div className="menu-header">
        <h1 className="menu-title">🍽️ Nuestro Menú</h1>
        <p className="menu-subtitle">Descubre los sabores que te harán volver por más</p>
        
        {/* Botón Llamar Mesero */}
        <button 
          className="call-waiter-btn"
          onClick={() => setIsWaiterCallOpen(true)}
          title="Solicitar atención del mesero"
        >
          🔔 Llamar Mesero
        </button>
      </div>

      <div className="categories-container">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {menuData[activeCategory].map(item => (
          <MenuItem
            key={item.id}
            item={item}
            onSelect={handleSelectItem}
          />
        ))}
      </div>

      <OrderSummary
        order={order}
        onClearOrder={handleClearOrder}
        onCheckout={handleCheckout}
        onRemoveItem={handleRemoveItem}
        onUpdateComments={handleUpdateComments}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCheckoutCancel}
        onConfirm={handleCheckoutConfirm}
        order={order}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />

      <WaiterCallModal
        isOpen={isWaiterCallOpen}
        onClose={() => setIsWaiterCallOpen(false)}
        onCallWaiter={handleWaiterCall}
      />
    </div>
  );
};

export default Menu;

