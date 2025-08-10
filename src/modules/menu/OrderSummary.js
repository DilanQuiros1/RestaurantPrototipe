import React from 'react';
import Button from '../../components/common/Button';

const OrderSummary = ({ order, onClearOrder, onCheckout }) => {
  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
            <span className="order-item-name">
              {item.name} x{item.quantity}
            </span>
            <span className="order-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="order-total">
        <span>Total:</span>
        <span className="total-amount">${totalAmount.toFixed(2)}</span>
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

