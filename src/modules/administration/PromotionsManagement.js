import React, { useState, useEffect } from 'react';
import './PromotionsManagement.css';

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    menuItemId: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isDailySpecial: false,
    priority: 1
  });

  // Datos de ejemplo de productos del menú
  useEffect(() => {
    const mockMenuItems = [
      { id: 1, name: 'Hamburguesa Clásica', price: 8.99, category: 'comidas-rapidas' },
      { id: 2, name: 'Pizza Margherita', price: 12.99, category: 'comidas-rapidas' },
      { id: 3, name: 'Filete de Res', price: 24.99, category: 'platos-fuertes' },
      { id: 4, name: 'Salmón a la Plancha', price: 22.99, category: 'platos-fuertes' },
      { id: 5, name: 'Pasta Alfredo', price: 14.99, category: 'platos-fuertes' },
      { id: 6, name: 'Ensalada César', price: 8.99, category: 'platos-fuertes' },
      { id: 7, name: 'Coca Cola', price: 2.50, category: 'bebidas' },
      { id: 8, name: 'Tiramisu', price: 6.99, category: 'postres' }
    ];
    setMenuItems(mockMenuItems);

    // Datos de ejemplo de promociones
    const mockPromotions = [
      {
        id: 1,
        name: 'Hamburguesa del Día',
        description: 'Hamburguesa clásica con descuento especial',
        menuItemId: 1,
        discountType: 'percentage',
        discountValue: 20,
        startDate: '2025-01-10',
        endDate: '2025-01-15',
        isActive: true,
        isDailySpecial: true,
        priority: 1,
        createdAt: '2025-01-10T10:00:00Z'
      },
      {
        id: 2,
        name: 'Oferta Filete Premium',
        description: 'Descuento en nuestro mejor filete',
        menuItemId: 3,
        discountType: 'fixed',
        discountValue: 5.00,
        startDate: '2025-01-12',
        endDate: '2025-01-20',
        isActive: true,
        isDailySpecial: false,
        priority: 2,
        createdAt: '2025-01-12T14:30:00Z'
      }
    ];
    setPromotions(mockPromotions);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingPromotion) {
      // Actualizar promoción existente
      setPromotions(prev => prev.map(promo => 
        promo.id === editingPromotion.id 
          ? { ...formData, id: editingPromotion.id, createdAt: editingPromotion.createdAt }
          : promo
      ));
    } else {
      // Crear nueva promoción
      const newPromotion = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setPromotions(prev => [...prev, newPromotion]);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      menuItemId: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      isActive: true,
      isDailySpecial: false,
      priority: 1
    });
    setEditingPromotion(null);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData(promotion);
    setIsModalOpen(true);
  };

  const handleDelete = (promotionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      setPromotions(prev => prev.filter(promo => promo.id !== promotionId));
    }
  };

  const togglePromotionStatus = (promotionId) => {
    setPromotions(prev => prev.map(promo => 
      promo.id === promotionId 
        ? { ...promo, isActive: !promo.isActive }
        : promo
    ));
  };

  const getMenuItemName = (menuItemId) => {
    const item = menuItems.find(item => item.id === parseInt(menuItemId));
    return item ? item.name : 'Producto no encontrado';
  };

  const getMenuItemPrice = (menuItemId) => {
    const item = menuItems.find(item => item.id === parseInt(menuItemId));
    return item ? item.price : 0;
  };

  const calculateDiscountedPrice = (promotion) => {
    const originalPrice = getMenuItemPrice(promotion.menuItemId);
    if (promotion.discountType === 'percentage') {
      return originalPrice * (1 - promotion.discountValue / 100);
    } else {
      return originalPrice - promotion.discountValue;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="promotions-management">
      <div className="promotions-header">
        <div className="header-content">
          <h2>🎉 Gestión de Promociones y Platos del Día</h2>
          <p>Crea y gestiona ofertas especiales para atraer más clientes</p>
        </div>
        <button 
          className="add-promotion-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="btn-icon">➕</span>
          Nueva Promoción
        </button>
      </div>

      <div className="promotions-stats">
        <div className="stat-card">
          <div className="stat-number">{promotions.filter(p => p.isActive).length}</div>
          <div className="stat-label">Promociones Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{promotions.filter(p => p.isDailySpecial && p.isActive).length}</div>
          <div className="stat-label">Platos del Día</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{promotions.length}</div>
          <div className="stat-label">Total Promociones</div>
        </div>
      </div>

      <div className="promotions-list">
        {promotions.length === 0 ? (
          <div className="no-promotions">
            <div className="no-promotions-content">
              <span className="no-promotions-icon">🎯</span>
              <h3>No hay promociones creadas</h3>
              <p>Crea tu primera promoción para atraer más clientes</p>
            </div>
          </div>
        ) : (
          <div className="promotions-grid">
            {promotions.map(promotion => (
              <div key={promotion.id} className={`promotion-card ${!promotion.isActive ? 'inactive' : ''}`}>
                <div className="promotion-header">
                  <div className="promotion-title">
                    <h3>{promotion.name}</h3>
                    <div className="promotion-badges">
                      {promotion.isDailySpecial && (
                        <span className="badge daily-special">Plato del Día</span>
                      )}
                      <span className={`badge status ${promotion.isActive ? 'active' : 'inactive'}`}>
                        {promotion.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                  <div className="promotion-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(promotion)}
                      title="Editar promoción"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn toggle"
                      onClick={() => togglePromotionStatus(promotion.id)}
                      title={promotion.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {promotion.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(promotion.id)}
                      title="Eliminar promoción"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="promotion-content">
                  <p className="promotion-description">{promotion.description}</p>
                  
                  <div className="promotion-item">
                    <span className="item-label">Producto:</span>
                    <span className="item-name">{getMenuItemName(promotion.menuItemId)}</span>
                  </div>

                  <div className="promotion-pricing">
                    <div className="original-price">
                      Precio original: <span className="price">${getMenuItemPrice(promotion.menuItemId).toFixed(2)}</span>
                    </div>
                    <div className="discount-info">
                      Descuento: <span className="discount">
                        {promotion.discountType === 'percentage' 
                          ? `${promotion.discountValue}%` 
                          : `$${promotion.discountValue.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="final-price">
                      Precio final: <span className="price discounted">${calculateDiscountedPrice(promotion).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="promotion-dates">
                    <div className="date-range">
                      <span className="date-label">📅 Vigencia:</span>
                      <span className="date-text">
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar promoción */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="promotion-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre de la Promoción *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Hamburguesa del Día"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe la promoción..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="menuItemId">Producto del Menú *</label>
                  <select
                    id="menuItemId"
                    name="menuItemId"
                    value={formData.menuItemId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ${item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="discountType">Tipo de Descuento *</label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="discountValue">Valor del Descuento *</label>
                  <input
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discountType === 'percentage' ? '20' : '5.00'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Fecha de Inicio *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">Fecha de Fin *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Prioridad de Visualización</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="1">Alta (se muestra primero)</option>
                    <option value="2">Media</option>
                    <option value="3">Baja</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isDailySpecial"
                      checked={formData.isDailySpecial}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Marcar como Plato del Día</span>
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Promoción Activa</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  {editingPromotion ? 'Actualizar' : 'Crear'} Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsManagement;
