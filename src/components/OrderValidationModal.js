import React, { useState } from 'react';
import './OrderValidationModal.css';

const OrderValidationModal = ({ isOpen, orderData, onConfirm, onCancel }) => {
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

  const orderTypeText = orderData.orderType === 'takeout' ? 'Para Llevar' : 'Comer Restaurante';
  const locationInfo = orderData.orderType === 'takeout' 
    ? 'Recoger en mostrador' 
    : `Mesa: ${orderData.tableNumber || 'Por asignar'}`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay order-validation-overlay">
      <div className="modal-content order-validation-modal">
        <div className="modal-header">
          <h2>📱 Validar Pedido de WhatsApp</h2>
          <button className="modal-close" onClick={onCancel} disabled={isProcessing}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="validation-banner">
            <div className="banner-icon">🔍</div>
            <div className="banner-content">
              <h3>Pedido recibido por WhatsApp</h3>
              <p>Revisa los detalles y confirma para registrar en el sistema</p>
            </div>
          </div>

          <div className="order-details-grid">
            <div className="detail-section">
              <h4>👤 Información del Cliente</h4>
              <div className="detail-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{orderData.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID Pedido:</span>
                <span className="detail-value order-id">{orderData.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha y Hora:</span>
                <span className="detail-value">{formatDateTime(orderData.timestamp)}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>📋 Detalles del Servicio</h4>
              <div className="detail-item">
                <span className="detail-label">Tipo de Pedido:</span>
                <span className="detail-value service-type">{orderTypeText}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ubicación:</span>
                <span className="detail-value">{locationInfo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Origen:</span>
                <span className="detail-value">
                  <span className="source-badge">📱 WhatsApp</span>
                </span>
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h4>🛒 Productos Solicitados</h4>
            <div className="items-list">
              {orderData.items.map((item, index) => (
                <div key={index} className="order-item-card">
                  <div className="item-main-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-quantity">x{item.quantity}</div>
                    <div className="item-price">{formatCurrency(item.price * item.quantity)}</div>
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
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span className="summary-label">Subtotal:</span>
              <span className="summary-value">{formatCurrency(orderData.total)}</span>
            </div>
            <div className="summary-row total-row">
              <span className="summary-label">Total a Pagar:</span>
              <span className="summary-value total-amount">{formatCurrency(orderData.total)}</span>
            </div>
          </div>

          <div className="validation-actions">
            <button 
              className="btn-cancel" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              ❌ Cancelar
            </button>
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  ✅ Registrar Pedido
                </>
              )}
            </button>
          </div>

          <div className="validation-note">
            <p>
              <strong>Nota:</strong> Al confirmar, este pedido se registrará en el sistema y 
              aparecerá en el módulo de cocina para su preparación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderValidationModal;
