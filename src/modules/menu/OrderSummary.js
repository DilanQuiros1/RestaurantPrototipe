import React, { useState } from 'react';
import Button from '../../components/common/Button';
import customerService from '../../services/customerService';

const OrderSummary = ({ order, onClearOrder, onCheckout, onRemoveItem, onUpdateComments, onOpenCustomerRegistration, onCloseOrderSummary }) => {
  const [showComments, setShowComments] = useState({});
  const [showLoyaltySection, setShowLoyaltySection] = useState(false);
  const [customerCedula, setCustomerCedula] = useState('');
  const [validatedCustomer, setValidatedCustomer] = useState(null);
  const [loyaltyError, setLoyaltyError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const toggleComments = (itemId) => {
    setShowComments(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calcular puntos a acumular (1 punto por cada ₡100)
  const calculatePointsToEarn = () => {
    return Math.floor(totalAmount * 100); // Convertir $ a ₡ y calcular puntos
  };

  const handleToggleLoyaltySection = () => {
    setShowLoyaltySection(!showLoyaltySection);
    if (!showLoyaltySection) {
      // Reset cuando se abre la sección
      setCustomerCedula('');
      setValidatedCustomer(null);
      setLoyaltyError('');
    }
  };

  const handleValidateCustomer = async () => {
    if (!customerCedula.trim()) {
      setLoyaltyError('Por favor ingresa una cédula');
      return;
    }

    setIsValidating(true);
    setLoyaltyError('');

    try {
      const customer = customerService.getCustomerByCedula(customerCedula.trim());
      
      if (customer) {
        setValidatedCustomer(customer);
        setLoyaltyError('');
      } else {
        setValidatedCustomer(null);
        setLoyaltyError('Cliente no encontrado. ¿Está registrado en el programa de fidelización?');
      }
    } catch (error) {
      setLoyaltyError('Error al buscar cliente. Intenta nuevamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCedulaChange = (e) => {
    setCustomerCedula(e.target.value);
    setValidatedCustomer(null);
    setLoyaltyError('');
  };

  const handleOpenRegistration = () => {
    // Cerrar el modal del pedido antes de abrir el de registro
    if (onCloseOrderSummary) {
      onCloseOrderSummary();
    }
    // Abrir el modal de registro
    if (onOpenCustomerRegistration) {
      onOpenCustomerRegistration();
    }
  };

  if (order.length === 0) {
    return (
      <div className="order-summary">
        <div className="order-summary-header">
          <h3 className="order-summary-title">Tu Pedido</h3>
          <span className="order-count">0</span>
        </div>
        <div className="empty-order">
          <p>No has seleccionado ningún item</p>
          <p>¡Explora nuestro menú!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <div className="order-summary-header">
        <h3 className="order-summary-title">Tu Pedido</h3>
        <span className="order-count">{totalItems}</span>
      </div>
      
      <div className="order-items">
        {order.map((item, index) => (
          <div key={index} className="order-item">
            <div className="order-item-main">
              <span className="order-item-name">
                {item.name} x{item.quantity}
              </span>
              <div className="order-item-actions">
                <span className="order-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button 
                  className="remove-item-btn"
                  onClick={() => onRemoveItem(item.id)}
                  title="Eliminar item"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            {/* <div className="order-item-comments">
              <button
                className="add-comment-btn"
                onClick={() => toggleComments(item.id)}
                type="button"
              >
                {showComments[item.id] ? 'Ocultar Comentario' : 'Agregar Comentario'}
              </button>
              
              {showComments[item.id] && (
                <textarea
                  className="comments-input"
                  placeholder="Agregar comentarios (ej: sin lechuga, sin salsas, bien cocido...)"
                  value={item.comments || ''}
                  onChange={(e) => onUpdateComments(item.id, e.target.value)}
                  rows="2"
                />
              )}
            </div> */}
          </div>
        ))}
      </div>
      
      <div className="order-total">
        <span>Total:</span>
        <span className="total-amount">${totalAmount.toFixed(2)}</span>
      </div>

      {/* Sección de Programa de Fidelización */}
      <div className="loyalty-section">
        <button 
          className="loyalty-toggle-btn"
          onClick={handleToggleLoyaltySection}
          type="button"
        >
          {showLoyaltySection ? '🎯 Ocultar Puntos' : '🎯 Acumular Puntos'}
        </button>

        {showLoyaltySection && (
          <div className="loyalty-content">
            <div className="loyalty-input-section">
              <label htmlFor="customer-cedula">Cédula del Cliente:</label>
              <div className="cedula-input-group">
                <input
                  id="customer-cedula"
                  type="text"
                  value={customerCedula}
                  onChange={handleCedulaChange}
                  placeholder="Ingresa tu cédula"
                  className="cedula-input"
                  disabled={isValidating}
                />
                <button
                  onClick={handleValidateCustomer}
                  className="validate-btn"
                  disabled={isValidating || !customerCedula.trim()}
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </button>
              </div>
            </div>

            {loyaltyError && (
              <div className="loyalty-error">
                {loyaltyError}
                {loyaltyError.includes('Cliente no encontrado') && onOpenCustomerRegistration && (
                  <button 
                    className="register-link-btn"
                    onClick={handleOpenRegistration}
                    type="button"
                  >
                    Registrar nuevo cliente
                  </button>
                )}
              </div>
            )}

            {validatedCustomer && (
              <div className="customer-info">
                <div className="customer-details">
                  <h4>✅ Cliente Validado</h4>
                  <p><strong>Nombre:</strong> {validatedCustomer.nombre}</p>
                  <p><strong>Puntos Actuales:</strong> <span className="current-points">{validatedCustomer.points}</span></p>
                </div>
                
                <div className="points-calculation">
                  <div className="points-to-earn">
                    <span>Puntos a ganar con esta compra:</span>
                    <span className="points-value">+{calculatePointsToEarn()}</span>
                  </div>
                  <div className="total-points-after">
                    <span>Total después de la compra:</span>
                    <span className="points-value">{validatedCustomer.points + calculatePointsToEarn()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <Button 
          variant="secondary" 
          onClick={onClearOrder}
          style={{ flex: 1 }}
        >
          Limpiar
        </Button>
        <Button 
          variant="primary" 
          onClick={onCheckout}
          style={{ flex: 1 }}
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;

