import React, { useState } from 'react';
import Button from '../../components/common/Button';
import './OrderDetailModal.css';

const OrderDetailModal = ({ isOpen, order, onClose, onProceedToPayment }) => {
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  if (!isOpen || !order) return null;

  // Promociones disponibles (en un caso real vendrían de la base de datos)
  const availablePromos = {
    'DESCUENTO10': { type: 'percentage', value: 10, description: '10% de descuento' },
    'PROMO15': { type: 'percentage', value: 15, description: '15% de descuento' },
    'FIJO5': { type: 'fixed', value: 5, description: '₡5 de descuento' },
    'ESTUDIANTE': { type: 'percentage', value: 20, description: '20% descuento estudiante' }
  };

  const calculateDiscount = () => {
    let discountAmount = 0;
    
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        discountAmount = (order.subtotal * appliedPromo.value) / 100;
      } else {
        discountAmount = appliedPromo.value;
      }
    } else if (discount > 0) {
      if (discountType === 'percentage') {
        discountAmount = (order.subtotal * discount) / 100;
      } else {
        discountAmount = discount;
      }
    }
    
    return Math.min(discountAmount, order.subtotal); // No puede ser mayor al subtotal
  };

  const discountAmount = calculateDiscount();
  const newSubtotal = order.subtotal - discountAmount;
  const newTax = newSubtotal * 0.13; // 13% de impuesto
  const newTotal = newSubtotal + newTax;

  const handleApplyPromo = () => {
    const promo = availablePromos[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo(promo);
      setDiscount(0); // Limpiar descuento manual
      alert(`✅ Promoción aplicada: ${promo.description}`);
    } else {
      alert('❌ Código promocional no válido');
    }
    setPromoCode('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const handleProceedToPayment = () => {
    const orderWithDiscounts = {
      ...order,
      originalSubtotal: order.subtotal,
      originalTax: order.tax,
      originalTotal: order.total,
      discountAmount: discountAmount,
      discountType: appliedPromo ? 'promo' : discountType,
      discountDescription: appliedPromo ? appliedPromo.description : `${discount}${discountType === 'percentage' ? '%' : '₡'} descuento`,
      subtotal: newSubtotal,
      tax: newTax,
      total: newTotal
    };
    
    onProceedToPayment(orderWithDiscounts);
  };

  return (
    <div className="order-detail-modal-overlay">
      <div className="order-detail-modal">
        <div className="modal-header">
          <div className="header-info">
            <h3>📋 Detalle del Pedido</h3>
            <div className="order-info">
              <span className="order-number">{order.orderNumber}</span>
              <span className="separator">•</span>
              <span className="table-number">Mesa {order.tableNumber}</span>
              <span className="separator">•</span>
              <span className="order-time">{order.orderTime}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="customer-section">
            <div className="customer-info">
              <span className="customer-icon">👤</span>
              <div className="customer-details">
                <span className="customer-name">{order.customerName}</span>
                <span className="waiter-info">Atendido por: {order.waiter}</span>
              </div>
            </div>
          </div>

          <div className="items-section">
            <h4>🍽️ Productos Solicitados</h4>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-info">
                    <span className="item-quantity">{item.quantity}x</span>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      {item.notes && (
                        <span className="item-notes">📝 {item.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-pricing">
                    <span className="unit-price">₡{item.unitPrice.toFixed(2)} c/u</span>
                    <span className="total-price">₡{(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="discounts-section">
            <h4>🎯 Descuentos y Promociones</h4>
            
            <div className="promo-code-section">
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="Código promocional"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <button 
                  className="apply-promo-btn"
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim()}
                >
                  Aplicar
                </button>
              </div>
              
              {appliedPromo && (
                <div className="applied-promo">
                  <span className="promo-description">✅ {appliedPromo.description}</span>
                  <button className="remove-promo-btn" onClick={handleRemovePromo}>
                    ❌ Quitar
                  </button>
                </div>
              )}
            </div>

            {!appliedPromo && (
              <div className="manual-discount-section">
                <h5>Descuento Manual</h5>
                <div className="discount-controls">
                  <div className="discount-type">
                    <label>
                      <input
                        type="radio"
                        value="percentage"
                        checked={discountType === 'percentage'}
                        onChange={(e) => setDiscountType(e.target.value)}
                      />
                      Porcentaje (%)
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="fixed"
                        checked={discountType === 'fixed'}
                        onChange={(e) => setDiscountType(e.target.value)}
                      />
                      Monto Fijo (₡)
                    </label>
                  </div>
                  <div className="discount-input">
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? 100 : order.subtotal}
                      step={discountType === 'percentage' ? 1 : 0.01}
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      placeholder={`Descuento ${discountType === 'percentage' ? '(%)' : '(₡)'}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="totals-section">
            <h4>💰 Resumen de Cobro</h4>
            <div className="totals-breakdown">
              <div className="total-row">
                <span className="label">Subtotal:</span>
                <span className="amount">₡{order.subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="total-row discount-row">
                  <span className="label">
                    Descuento {appliedPromo ? `(${appliedPromo.description})` : 
                    `(${discount}${discountType === 'percentage' ? '%' : '₡'})`}:
                  </span>
                  <span className="amount discount">{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="total-row">
                <span className="label">Subtotal con descuento:</span>
                <span className="amount">₡{newSubtotal.toFixed(2)}</span>
              </div>
              
              <div className="total-row">
                <span className="label">Impuesto (13%):</span>
                <span className="amount">₡{newTax.toFixed(2)}</span>
              </div>
              
              <div className="total-row final-total">
                <span className="label">Total a Pagar:</span>
                <span className="amount">₡{newTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleProceedToPayment}
            className="proceed-payment-btn"
          >
            💳 Proceder al Pago
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
