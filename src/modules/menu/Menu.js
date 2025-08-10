import React, { useState } from 'react';
import MenuItem from './MenuItem';
import OrderSummary from './OrderSummary';
import { getImageByDishName } from './menuImages';
import './Menu.css';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('comidas-rapidas');
  const [order, setOrder] = useState([]);

  // Datos del menú organizados por categorías
  const menuData = {
    'comidas-rapidas': [
      {
        id: 1,
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa de res con lechuga, tomate, cebolla y queso cheddar',
        price: 8.99,
        image: getImageByDishName('Hot Dog Gourmet')
      },
      {
        id: 2,
        name: 'Nachos Supremos',
        description: 'Tortilla chips con queso fundido, jalapeños, guacamole y sour cream',
        price: 6.99,
        image: getImageByDishName('Hot Dog Gourmet')
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
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'
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
        image: getImageByDishName('Hot Dog Gourmet')
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
        image: getImageByDishName('Hot Dog Gourmet')
      },
      {
        id: 12,
        name: 'Té Helado',
        description: 'Té negro helado con limón y menta, endulzado naturalmente',
        price: 3.49,
        image: getImageByDishName('Hot Dog Gourmet')
      }
    ]
  };

  const categories = [
    { id: 'comidas-rapidas', name: 'Comidas Rápidas' },
    { id: 'platos-fuertes', name: 'Platos Fuertes' },
    { id: 'bebidas', name: 'Bebidas' }
  ];

  const handleSelectItem = (item) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
      
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [...prevOrder, { ...item, quantity: 1 }];
      }
    });
  };

  const handleClearOrder = () => {
    setOrder([]);
  };

  const handleCheckout = () => {
    if (order.length > 0) {
      alert('¡Gracias por tu pedido! Pronto estará listo.');
      setOrder([]);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">🍽️ Nuestro Menú</h1>
        <p className="menu-subtitle">Descubre los sabores que te harán volver por más</p>
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
      />
    </div>
  );
};

export default Menu;

