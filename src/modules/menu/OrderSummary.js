import React, { useState } from 'react';
import Button from '../../components/common/Button';
import customerService from '../../services/customerService';
import loyaltyService from '../../services/loyaltyService';

const OrderSummary = ({ order, onClearOrder, onCheckout, onRemoveItem, onUpdateComments, onOpenCustomerRegistration, onCloseOrderSummary }) => {
  const [showComments, setShowComments] = useState({});
  const [showLoyaltySection, setShowLoyaltySection] = useState(false);
  const [customerCedula, setCustomerCedula] = useState('');
  const [validatedCustomer, setValidatedCustomer] = useState(null);
  const [loyaltyError, setLoyaltyError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [redemptionDiscount, setRedemptionDiscount] = useState(0);
  const [showRedemptionSection, setShowRedemptionSection] = useState(false);
  const [redemptionCustomerCedula, setRedemptionCustomerCedula] = useState('');
  const [validatedRedemptionCustomer, setValidatedRedemptionCustomer] = useState(null);
  const [redemptionError, setRedemptionError] = useState('');
  const [isValidatingRedemption, setIsValidatingRedemption] = useState(false);
  
  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalAmount = totalAmount - redemptionDiscount;

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
      setShowRedemptionSection(false);
      setPointsToRedeem(0);
      setRedemptionDiscount(0);
    }
  };

  const handleToggleRedemptionSection = () => {
    setShowRedemptionSection(!showRedemptionSection);
    if (!showRedemptionSection) {
      // Reset cuando se abre la sección
      setRedemptionCustomerCedula('');
      setValidatedRedemptionCustomer(null);
      setRedemptionError('');
      setPointsToRedeem(0);
      setRedemptionDiscount(0);
    }
  };

  const handleValidateRedemptionCustomer = async () => {
    if (!redemptionCustomerCedula.trim()) {
      setRedemptionError('Por favor ingresa una cédula');
      return;
    }

    setIsValidatingRedemption(true);
    setRedemptionError('');

    try {
      const customer = customerService.getCustomerByCedula(redemptionCustomerCedula.trim());
      
      if (customer) {
        setValidatedRedemptionCustomer(customer);
        setRedemptionError('');
      } else {
        setValidatedRedemptionCustomer(null);
        setRedemptionError('Cliente no encontrado. ¿Está registrado en el programa de fidelización?');
      }
    } catch (error) {
      setRedemptionError('Error al buscar cliente. Intenta nuevamente.');
    } finally {
      setIsValidatingRedemption(false);
    }
  };

  const handleRedemptionCedulaChange = (e) => {
    setRedemptionCustomerCedula(e.target.value);
    setValidatedRedemptionCustomer(null);
    setRedemptionError('');
  };

  const handlePointsRedemption = () => {
    if (!validatedRedemptionCustomer) {
      setRedemptionError('No hay cliente validado');
      return;
    }

    const config = loyaltyService.getConfig();
    
    // Si no hay puntos, no se puede canjear
    if (validatedRedemptionCustomer.points <= 0) {
      setRedemptionError('No tienes puntos disponibles para canjear');
      return;
    }

    // Calcular el valor total de los puntos disponibles
    const totalPointsValue = loyaltyService.calculatePointsValue(validatedRedemptionCustomer.points);
    
    // Determinar el descuento real (no puede exceder el subtotal)
    const actualDiscount = Math.min(totalPointsValue, totalAmount);
    
    // Calcular cuántos puntos se necesitan para ese descuento
    const pointsToUse = Math.ceil(actualDiscount / config.pointValue);
    
    setRedemptionDiscount(actualDiscount);
    setPointsToRedeem(pointsToUse);
    setRedemptionError('');
    
    // Actualizar puntos del cliente (restar solo los puntos utilizados)
    const updatedCustomer = {
      ...validatedRedemptionCustomer,
      points: validatedRedemptionCustomer.points - pointsToUse
    };
    setValidatedRedemptionCustomer(updatedCustomer);
    
    // Actualizar también en el servicio de clientes para persistir el cambio
    customerService.setCustomerPoints(validatedRedemptionCustomer.cedula, updatedCustomer.points);
    
    // Mensaje personalizado según el caso
    let message = `✅ ¡Puntos canjeados exitosamente!\n\nPuntos utilizados: ${pointsToUse}\nDescuento aplicado: $${actualDiscount.toFixed(2)}`;
    
    if (actualDiscount >= totalAmount) {
      message += `\n\n🎉 ¡Tu pedido está completamente cubierto con puntos!`;
      message += `\nTotal a pagar: $0.00`;
    } else {
      message += `\nTotal a pagar: $${(totalAmount - actualDiscount).toFixed(2)}`;
    }
    
    message += `\nPuntos restantes: ${updatedCustomer.points}`;
    
    if (updatedCustomer.points > 0) {
      message += `\nValor restante de puntos: $${loyaltyService.calculatePointsValue(updatedCustomer.points).toFixed(2)}`;
    }
    
    alert(message);
  };

  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    setPointsToRedeem(points);
    
    if (points > 0 && validatedCustomer) {
      const config = loyaltyService.getConfig();
      const validation = loyaltyService.canRedeemPoints(points, validatedCustomer.points);
      
      if (!validation.valid) {
        setLoyaltyError(validation.reason);
      } else {
        const discount = loyaltyService.calculatePointsValue(points);
        if (discount > totalAmount) {
          setLoyaltyError(`El descuento máximo es $${totalAmount.toFixed(2)}`);
        } else {
          setLoyaltyError('');
        }
      }
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
      
      {/* Sección de Programa de Fidelización */}
      <div className="loyalty-section">
        <div className="loyalty-buttons-row">
          <button 
            className="loyalty-toggle-btn"
            onClick={handleToggleLoyaltySection}
            type="button"
          >
            {showLoyaltySection ? '🎯 Ocultar Puntos' : '🎯 Acumular Puntos'}
          </button>
          
          <button 
            className="redeem-toggle-btn"
            onClick={handleToggleRedemptionSection}
            type="button"
          >
            {showRedemptionSection ? '💎 Ocultar Canje' : '💎 Canjear Puntos'}
          </button>
        </div>

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

        {showRedemptionSection && (
          <div className="redemption-content">
            <div className="redemption-input-section">
              <label htmlFor="redemption-customer-cedula">Cédula del Cliente:</label>
              <div className="cedula-input-group">
                <input
                  id="redemption-customer-cedula"
                  type="text"
                  value={redemptionCustomerCedula}
                  onChange={handleRedemptionCedulaChange}
                  placeholder="Ingresa tu cédula"
                  className="cedula-input"
                  disabled={isValidatingRedemption}
                />
                <button
                  onClick={handleValidateRedemptionCustomer}
                  className="validate-btn"
                  disabled={isValidatingRedemption || !redemptionCustomerCedula.trim()}
                >
                  {isValidatingRedemption ? 'Validando...' : 'Validar'}
                </button>
              </div>
            </div>

            {redemptionError && (
              <div className="loyalty-error">
                {redemptionError}
                {redemptionError.includes('Cliente no encontrado') && onOpenCustomerRegistration && (
                  <button 
                    className="register-link-btn"
                    onClick={() => {
                      if (onCloseOrderSummary) onCloseOrderSummary();
                      if (onOpenCustomerRegistration) onOpenCustomerRegistration();
                    }}
                    type="button"
                  >
                    Registrar nuevo cliente
                  </button>
                )}
              </div>
            )}

            {validatedRedemptionCustomer && (
              <div className="customer-info">
                <div className="customer-details">
                  <h4>✅ Cliente Validado</h4>
                  <p><strong>Nombre:</strong> {validatedRedemptionCustomer.nombre}</p>
                  <p><strong>Puntos Actuales:</strong> <span className="current-points">{validatedRedemptionCustomer.points}</span></p>
                </div>
                
                <div className="redemption-action">
                  <button
                    onClick={handlePointsRedemption}
                    className="redeem-points-btn"
                    disabled={validatedRedemptionCustomer.points <= 0}
                  >
                    💎 Canjear Todos los Puntos
                  </button>
                  
                  {validatedRedemptionCustomer.points <= 0 && (
                    <p className="min-points-warning">
                      ⚠️ No tienes puntos disponibles para canjear
                    </p>
                  )}
                  
                  {validatedRedemptionCustomer.points > 0 && (
                    <p className="redemption-info">
                      💰 Valor total de tus puntos: ${loyaltyService.calculatePointsValue(validatedRedemptionCustomer.points).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumen de Totales - Movido al final */}
      <div className="order-summary-totals">
        {redemptionDiscount > 0 ? (
          <>
            <div className="subtotal-line">
              <span>Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="discount-line">
              <span>Descuento por puntos:</span>
              <span className="discount-amount">-${redemptionDiscount.toFixed(2)}</span>
            </div>
            <div className="final-total">
              <span>Total a pagar:</span>
              <span className="total-amount">${finalAmount.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="simple-total">
            <span>Total:</span>
            <span className="total-amount">${totalAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="action-buttons">
        <Button 
          variant="secondary" 
          onClick={onClearOrder}
          className="clear-btn"
        >
          Limpiar
        </Button>
        <Button 
          variant="primary" 
          onClick={onCheckout}
          className="checkout-btn"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;

