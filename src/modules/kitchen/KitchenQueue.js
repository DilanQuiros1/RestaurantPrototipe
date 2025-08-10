import React from 'react';
import OrderCard from './OrderCard';

const KitchenQueue = ({ 
  title, 
  orders, 
  onUpdateStatus, 
  allowedActions, 
  emptyMessage 
}) => {
  return (
    <div className="kitchen-queue">
      <h2 className="queue-title">{title}</h2>
      <div className="queue-count">
        {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
      </div>
      
      <div className="queue-content">
        {orders.length === 0 ? (
          <div className="empty-queue">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              allowedActions={allowedActions}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenQueue;
