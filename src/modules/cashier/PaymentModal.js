import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, order, onClose, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [sinpeDetails, setSinpeDetails] = useState({
    customerName: ''
  });
  const [pendingDetails, setPendingDetails] = useState({
    customerName: '',
    notes: ''
  });
  const [change, setChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'cash', label: 'Efectivo', icon: '💵', description: 'Pago en efectivo' },
    { id: 'card', label: 'Tarjeta', icon: '💳', description: 'Débito/Crédito' },
    { id: 'sinpe', label: 'SINPE Móvil', icon: '📱', description: 'Transferencia móvil' },
    { id: 'pending', label: 'Pendiente', icon: '⏳', description: 'SINPE pendiente' }
  ];

  // Calcular cambio automáticamente para efectivo
  useEffect(() => {
    if (paymentMethod === 'cash' && cashReceived && order) {
      const receivedAmount = parseFloat(cashReceived);
      const changeAmount = receivedAmount - order.total;
      setChange(changeAmount > 0 ? changeAmount : 0);
    } else {
      setChange(0);
    }
  }, [cashReceived, paymentMethod, order]);

  if (!isOpen || !order) return null;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validaciones según el método de pago
    if (paymentMethod === 'cash') {
      const receivedAmount = parseFloat(cashReceived);
      if (!receivedAmount || receivedAmount < order.total) {
        alert('❌ El monto recibido debe ser mayor o igual al total a pagar');
        setIsProcessing(false);
        return;
      }
    }

    if (paymentMethod === 'sinpe') {
      if (!sinpeDetails.customerName.trim()) {
        alert('❌ Por favor ingrese a nombre de quién sale el SINPE');
        setIsProcessing(false);
        return;
      }
    }

    if (paymentMethod === 'pending') {
      if (!pendingDetails.customerName.trim()) {
        alert('❌ Por favor ingrese el nombre de la persona que realizará el SINPE');
        setIsProcessing(false);
        return;
      }
    }

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    const paymentData = {
      method: paymentMethods.find(m => m.id === paymentMethod).label,
      methodId: paymentMethod,
      amount: order.total,
      timestamp: new Date().toLocaleString('es-ES'),
      details: getPaymentDetails()
    };

    onPaymentComplete(paymentData);
    setIsProcessing(false);
    resetForm();
  };

  const getPaymentDetails = () => {
    switch (paymentMethod) {
      case 'cash':
        return {
          cashReceived: parseFloat(cashReceived),
          change: change
        };
      case 'card':
        return {
          paymentType: 'Tarjeta de débito/crédito'
        };
      case 'sinpe':
        return {
          customerName: sinpeDetails.customerName
        };
      case 'pending':
        return {
          customerName: pendingDetails.customerName,
          notes: pendingDetails.notes,
          status: 'pending_sinpe'
        };
      default:
        return {};
    }
  };

  const resetForm = () => {
    setCashReceived('');
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setSinpeDetails({
      customerName: ''
    });
    setPendingDetails({
      customerName: '',
      notes: ''
    });
    setChange(0);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <div className="header-info">
            <h3>💳 Procesar Pago</h3>
            <div className="order-summary">
              <span>{order.orderNumber}</span>
              <span className="separator">•</span>
              <span>Mesa {order.tableNumber}</span>
              <span className="separator">•</span>
              <span className="total-amount">${order.total.toFixed(2)}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handlePaymentSubmit} className="payment-form">
          <div className="payment-methods">
            <h4>Método de Pago</h4>
            <div className="methods-grid">
              {paymentMethods.map(method => (
                <label key={method.id} className="method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="method-card">
                    <span className="method-icon">{method.icon}</span>
                    <div className="method-info">
                      <span className="method-label">{method.label}</span>
                      <span className="method-description">{method.description}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="payment-details">
            {paymentMethod === 'cash' && (
              <div className="cash-payment">
                <h4>💵 Pago en Efectivo</h4>
                <div className="cash-input-group">
                  <label>Monto Recibido:</label>
                  <div className="amount-input">
                    <span className="currency">$</span>
                    <input
                      type="number"
                      min={order.total}
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                {change > 0 && (
                  <div className="change-display">
                    <div className="change-info">
                      <span className="change-label">Cambio a entregar:</span>
                      <span className="change-amount">${change.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="card-payment">
                <h4>💳 Pago con Tarjeta</h4>
                <div className="card-info">
                  <div className="payment-confirmation">
                    <span className="confirmation-icon">✅</span>
                    <div className="confirmation-text">
                      <p><strong>Pago con tarjeta seleccionado</strong></p>
                      <p>El cliente pagará con tarjeta de débito o crédito.</p>
                      <p>Total a cobrar: <strong>${order.total.toFixed(2)}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'sinpe' && (
              <div className="sinpe-payment">
                <h4>📱 SINPE Móvil</h4>
                <div className="sinpe-form">
                  <div className="form-group">
                    <label>A nombre de quién sale el SINPE: *</label>
                    <input
                      type="text"
                      value={sinpeDetails.customerName}
                      onChange={(e) => setSinpeDetails({
                        ...sinpeDetails,
                        customerName: e.target.value
                      })}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  
                  <div className="sinpe-info">
                    <p><strong>ℹ️ Información:</strong></p>
                    <p>Se registrará el pago por SINPE móvil a nombre de <strong>{sinpeDetails.customerName || '[Nombre]'}</strong></p>
                    <p>Total a recibir: <strong>${order.total.toFixed(2)}</strong></p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'pending' && (
              <div className="pending-payment">
                <h4>⏳ SINPE Pendiente</h4>
                <div className="pending-form">
                  <div className="form-group">
                    <label>Nombre de la persona que realizará el SINPE: *</label>
                    <input
                      type="text"
                      value={pendingDetails.customerName}
                      onChange={(e) => setPendingDetails({
                        ...pendingDetails,
                        customerName: e.target.value
                      })}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Notas adicionales (opcional):</label>
                    <textarea
                      value={pendingDetails.notes}
                      onChange={(e) => setPendingDetails({
                        ...pendingDetails,
                        notes: e.target.value
                      })}
                      placeholder="Información adicional sobre el pago pendiente..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="pending-info">
                    <p><strong>ℹ️ Información:</strong></p>
                    <p>Este pedido quedará marcado como <strong>"SINPE Pendiente"</strong> hasta que se confirme el pago.</p>
                    <p>Total a recibir: <strong>${order.total.toFixed(2)}</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Total a Pagar:</span>
              <span className="total">${order.total.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Descuento Aplicado:</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="payment-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing}
              className="process-payment-btn"
            >
              {isProcessing ? (
                <>
                  <span className="processing-spinner">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  ✅ Confirmar Pago
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
