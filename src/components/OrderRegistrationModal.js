import React, { useState } from 'react';
import Button from './common/Button';
import './OrderRegistrationModal.css';

const OrderRegistrationModal = ({ isOpen, onClose, orderData, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !orderData) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(orderData);
    } finally {
      setIsProcessing(false);
    }
  };

  const orderTypeText = orderData.orderType === 'takeout' ? 'Para Llevar' : 'Comer Aquí';
  const locationInfo = orderData.orderType === 'takeout' 
    ? 'Recoger en mostrador' 
    : `Mesa: ${orderData.tableNumber}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content order-registration-modal">
        <div className="modal-header">
          <h2>📱 Pedido Recibido por WhatsApp</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="order-info-section">
            <h3>Información del Cliente</h3>
            <div className="customer-info-grid">
              <div className="info-item">
                <span className="info-label">👤 Cliente:</span>
                <span className="info-value">{orderData.customerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📋 Tipo:</span>
                <span className="info-value">{orderTypeText}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📍 Ubicación:</span>
                <span className="info-value">{locationInfo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🕐 Hora:</span>
                <span className="info-value">{new Date(orderData.timestamp).toLocaleString('es-CR')}</span>
              </div>
            </div>
          </div>

          <div className="order-details-section">
            <h3>Detalle del Pedido</h3>
            <div className="order-items-list">
              {orderData.items.map((item, index) => (
                <div key={index} className="order-item-detail">
                  <div className="item-main-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">₡{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.comments && (
                    <div className="item-comments">
                      <span className="comment-icon">💬</span>
                      <span className="comment-text">{item.comments}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="order-total-section">
              <div className="total-line">
                <span className="total-label">TOTAL:</span>
                <span className="total-amount">₡{orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="confirmation-section">
            <p className="confirmation-text">
              ¿Deseas registrar este pedido en el sistema del restaurante?
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? '⏳ Registrando...' : '✅ Registrar Pedido'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderRegistrationModal;
