import React from 'react';
import './PendingOrdersList.css';

const PendingOrdersList = ({ orders, onOrderSelect }) => {
  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <div className="no-orders-content">
          <span className="no-orders-icon">📋</span>
          <h3>No hay pedidos pendientes</h3>
          <p>Todos los pedidos han sido procesados o no hay coincidencias con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderPriority = (orderTime) => {
    const orderDate = new Date(`2000-01-01T${orderTime}`);
    const now = new Date();
    const currentTime = new Date(`2000-01-01T${now.getHours()}:${now.getMinutes()}`);
    const diffMinutes = (currentTime - orderDate) / (1000 * 60);
    
    if (diffMinutes > 60) return 'high';
    if (diffMinutes > 30) return 'medium';
    return 'low';
  };

  return (
    <div className="pending-orders-list">
      <div className="orders-header">
        <h3>📋 Pedidos Pendientes de Pago ({orders.length})</h3>
      </div>
      
      <div className="orders-grid">
        {orders.map(order => (
          <div 
            key={order.id} 
            className={`order-card ${order.status === 'pending_sinpe' ? 'pending-sinpe' : getOrderPriority(order.orderTime) + '-priority'}`}
            onClick={() => onOrderSelect(order)}
          >
            <div className="order-header">
              <div className="order-number">
                <span className="order-id">{order.orderNumber}</span>
                <span className={`priority-badge ${getOrderPriority(order.orderTime)}`}>
                  {getOrderPriority(order.orderTime) === 'high' && '🔴 Urgente'}
                  {getOrderPriority(order.orderTime) === 'medium' && '🟡 Medio'}
                  {getOrderPriority(order.orderTime) === 'low' && '🟢 Normal'}
                </span>
              </div>
              <div className="order-table">
                <span className="table-icon">🏷️</span>
                Mesa {order.tableNumber}
              </div>
            </div>

            <div className="order-customer">
              <span className="customer-icon">👤</span>
              <span className="customer-name">{order.customerName}</span>
            </div>

            <div className="order-details">
              <div className="order-time">
                <span className="time-icon">🕐</span>
                <span>{formatTime(order.orderTime)}</span>
              </div>
              <div className="order-waiter">
                <span className="waiter-icon">👨‍🍳</span>
                <span>{order.waiter}</span>
              </div>
            </div>

            <div className="order-items-summary">
              <div className="items-count">
                <span className="items-icon">🍽️</span>
                <span>{order.items.length} productos</span>
              </div>
              <div className="items-preview">
                {order.items.slice(0, 2).map((item, index) => (
                  <span key={index} className="item-name">
                    {item.quantity}x {item.name}
                    {index < Math.min(order.items.length, 2) - 1 && ', '}
                  </span>
                ))}
                {order.items.length > 2 && (
                  <span className="more-items">
                    +{order.items.length - 2} más...
                  </span>
                )}
              </div>
            </div>

            <div className="order-total">
              <div className="total-amount">
                {/* <span className="currency">$</span> */}
                <span className="amount">{order.total.toFixed(2)}</span>
              </div>
              <div className="total-breakdown">
                <span className="subtotal">Subtotal: ${order.subtotal.toFixed(2)}</span>
                <span className="tax">Impuesto: ${order.tax.toFixed(2)}</span>
              </div>
            </div>

            {order.status === 'pending_sinpe' && (
              <div className="pending-sinpe-info">
                <div className="pending-status">
                  <span className="pending-icon">⏳</span>
                  <span className="pending-text">SINPE Pendiente</span>
                </div>
                <div className="pending-customer">
                  <span className="pending-label">A nombre de:</span>
                  <span className="pending-name">{order.pendingDetails?.customerName}</span>
                </div>
              </div>
            )}

            <div className="order-actions">
              <button className="process-payment-btn">
                {order.status === 'pending_sinpe' ? '✅ Confirmar SINPE' : '💳 Procesar Pago'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingOrdersList;
