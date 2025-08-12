import React, { useState } from 'react';
import Button from '../../components/common/Button';
import './WaiterCallModal.css';

const WaiterCallModal = ({ isOpen, onClose, onCallWaiter }) => {
  const [selectedTable, setSelectedTable] = useState('');
  const [reason, setReason] = useState('general');
  const [customMessage, setCustomMessage] = useState('');

  const reasons = [
    { id: 'general', label: 'Atención general', icon: '👋' },
    { id: 'order', label: 'Realizar pedido', icon: '📝' },
    { id: 'bill', label: 'Solicitar cuenta', icon: '💳' },
    { id: 'complaint', label: 'Problema o queja', icon: '❗' },
    { id: 'help', label: 'Necesito ayuda', icon: '🆘' },
    { id: 'custom', label: 'Otro motivo', icon: '💬' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedTable) {
      alert('Por favor selecciona el número de mesa');
      return;
    }

    const callData = {
      tableNumber: selectedTable,
      reason: reason,
      reasonLabel: reasons.find(r => r.id === reason)?.label || reason,
      message: reason === 'custom' ? customMessage : '',
      timestamp: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    onCallWaiter(callData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTable('');
    setReason('general');
    setCustomMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="waiter-call-modal-overlay">
      <div className="waiter-call-modal">
        <div className="waiter-call-header">
          <h3>🔔 Llamar Mesero</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="waiter-call-form">
          <div className="form-group">
            <label htmlFor="tableNumber">Número de Mesa *</label>
            <select
              id="tableNumber"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              required
            >
              <option value="">Selecciona tu mesa</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Mesa {num}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Motivo de la llamada</label>
            <div className="reasons-grid">
              {reasons.map(reasonOption => (
                <label key={reasonOption.id} className="reason-option">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.id}
                    checked={reason === reasonOption.id}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="reason-card">
                    <span className="reason-icon">{reasonOption.icon}</span>
                    <span className="reason-label">{reasonOption.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {reason === 'custom' && (
            <div className="form-group">
              <label htmlFor="customMessage">Mensaje personalizado</label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Describe brevemente lo que necesitas..."
                rows="3"
                maxLength="200"
              />
              <small className="char-counter">{customMessage.length}/200</small>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="call-waiter-btn"
            >
              🔔 Llamar Mesero
            </Button>
          </div>
        </form>

        <div className="call-info">
          <p>
            <strong>ℹ️ Información:</strong> Tu solicitud será enviada inmediatamente 
            a cocina y el mesero se dirigirá a tu mesa lo antes posible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaiterCallModal;
