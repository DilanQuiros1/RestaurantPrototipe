import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import OrderSummary from './OrderSummary';
import CheckoutModal from './CheckoutModal';
import AdminLoginModal from './AdminLoginModal';
import WaiterCallModal from './WaiterCallModal';
import { getImageByDishName } from './menuImages';
import menuService from '../../services/menuService';
import imageService from '../../services/imageService';
import './Menu.css';

const Menu = ({ onAdminAccess }) => {
  const [activeCategory, setActiveCategory] = useState('promociones');
  const [order, setOrder] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isWaiterCallOpen, setIsWaiterCallOpen] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Función para obtener la imagen correcta (personalizada o predefinida)
  const getProductImage = (product) => {
    // Si el producto usa imagen personalizada, buscar en el servicio
    if (product.image === 'custom') {
      const savedImage = imageService.getImageByProductId(product.id);
      if (savedImage) {
        return savedImage.data;
      }
    }

    // Si la imagen comienza con data:, blob: o http, es una imagen personalizada legacy
    if (product.image && (
      product.image.startsWith('data:image') || 
      product.image.startsWith('blob:') || 
      product.image.startsWith('http')
    )) {
      return product.image;
    }
    
    // Si no, usar el servicio de imágenes predefinidas
    return getImageByDishName(product.image);
  };

  // Cargar datos del menú desde el servicio
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = () => {
    const menuStructure = menuService.getMenuStructureWithPromotions();
    const categoriesData = menuService.getCategoriesWithPromotions();
    
    console.log('=== DEBUG MENU CLIENT ===');
    console.log('Menu structure:', menuStructure);
    console.log('Categories:', categoriesData);
    console.log('Promociones en structure:', menuStructure.promociones);
    console.log('Promociones count:', menuStructure.promociones ? menuStructure.promociones.length : 0);
    
    // Verificar datos en localStorage
    const localData = localStorage.getItem('restaurantMenuData');
    if (localData) {
      const parsed = JSON.parse(localData);
      console.log('Promociones en localStorage:', parsed.promotions?.length || 0);
    }
    
    setMenuData(menuStructure);
    setCategories(categoriesData);
    
    // Si no hay promociones activas y la categoría actual es promociones, cambiar a la primera disponible
    if (!menuStructure.promociones && activeCategory === 'promociones' && categoriesData.length > 0) {
      const firstAvailableCategory = categoriesData.find(cat => cat.id !== 'promociones');
      if (firstAvailableCategory) {
        setActiveCategory(firstAvailableCategory.id);
      }
    }
  };

  // Escuchar cambios en el localStorage para actualizar en tiempo real
  useEffect(() => {
    const handleStorageChange = () => {
      loadMenuData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      setShowOrderSummary(false); // Cerrar el modal del pedido
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

    const orderTypeText = checkoutData.orderType === 'takeout' ? 'Para Llevar' : 'Comer Aquí';
    const locationInfo = checkoutData.orderType === 'takeout' 
      ? 'Recoger en mostrador' 
      : `Mesa: ${checkoutData.tableNumber}`;

    const message = `¡Pedido confirmado!\n\nCliente: ${checkoutData.customerName}\nTipo: ${orderTypeText}\n${locationInfo}\n\nResumen:\n${orderSummary}\n\nPronto estará listo.`;
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

  // TEMPORAL: Función para resetear datos
  const resetData = () => {
    localStorage.removeItem('restaurantMenuData');
    localStorage.removeItem('restaurant_custom_images'); // También limpiar imágenes si es necesario
    alert('Datos reseteados. La página se recargará.');
    window.location.reload();
  };

  // Si no hay datos del menú todavía, mostrar loading
  if (!categories.length || !Object.keys(menuData).length) {
    return (
      <div className="menu-container">
        <div className="menu-header">
          <h1 className="menu-title">🍽️ Cargando Menú...</h1>
        </div>
      </div>
    );
  }

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
        
        {/* TEMPORAL: Botón de reset */}
        <button 
          onClick={resetData}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset
        </button>
        
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
        {menuData[activeCategory] && menuData[activeCategory].map(item => (
          <MenuItem
            key={item.id}
            item={{
              ...item,
              image: getProductImage(item)
            }}
            onSelect={handleSelectItem}
          />
        ))}
      </div>

      {/* Botón flotante para mostrar pedido */}
      {order.length > 0 && (
        <button 
          className="floating-order-btn"
          onClick={() => setShowOrderSummary(true)}
          title="Ver mi pedido"
        >
          🛒 {order.reduce((sum, item) => sum + item.quantity, 0)}
        </button>
      )}

      {/* Order Summary Modal */}
      {showOrderSummary && (
        <div className="order-summary-overlay" onClick={() => setShowOrderSummary(false)}>
          <div className="order-summary-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-order-summary"
              onClick={() => setShowOrderSummary(false)}
            >
              ✕
            </button>
            <OrderSummary
              order={order}
              onClearOrder={handleClearOrder}
              onCheckout={handleCheckout}
              onRemoveItem={handleRemoveItem}
              onUpdateComments={handleUpdateComments}
            />
          </div>
        </div>
      )}

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

