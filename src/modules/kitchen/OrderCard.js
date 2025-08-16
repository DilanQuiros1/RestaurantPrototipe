import React from "react";
import Button from "../../components/common/Button";

const OrderCard = ({ order, onUpdateStatus, allowedActions }) => {
  // Función para calcular el tiempo transcurrido
  const getElapsedTime = (startTime) => {
    if (!startTime) return null;
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 60000); // en minutos
    return elapsed;
  };

  // Función para calcular el tiempo de espera desde que se hizo el pedido
  const getWaitingTime = (orderTime) => {
    const now = new Date();
    const waiting = Math.floor((now - orderTime) / 60000); // en minutos
    return waiting;
  };

  // Función para obtener la clase CSS según la prioridad y tiempo
  const getCardClassName = () => {
    let className = "order-card";

    if (order.priority === "alta") {
      className += " high-priority";
    }

    // Marcar como urgente si lleva mucho tiempo esperando
    const waitingTime = getWaitingTime(order.orderTime);
    if (waitingTime > 20) {
      className += " urgent";
    }

    return className;
  };

  // Función para obtener el texto del botón según las acciones permitidas
  // Función para obtener el texto del botón según las acciones permitidas
  const getActionButtons = () => {
    if (!allowedActions || allowedActions.length === 0) return null;

    const actionTexts = {
      pendiente: "Devolver a Pendiente",
      en_preparacion: "Devolver a Preparación",
      listo: "Marcar como Listo",
      entregado: "Marcar como Entregado",
    };

    const actionVariants = {
      pendiente: "warning",
      en_preparacion: "primary",
      listo: "success",
      entregado: "secondary",
    };

    return allowedActions.map((action) => (
      <Button
        key={action}
        variant={actionVariants[action]}
        onClick={() => onUpdateStatus(order.id, action)}
        className="action-button"
      >
        {actionTexts[action]}
      </Button>
    ));
  };

  return (
    <div className={getCardClassName()}>
      {/* Header de la tarjeta */}
      <div className="order-card-header">
        <div className="order-info">
          <span className="order-number">Pedido #{order.id}</span>
          <span className="table-number">Mesa {order.tableNumber}</span>
        </div>
        {order.priority === "alta" && (
          <span className="priority-badge">⚡ PRIORIDAD ALTA</span>
        )}
      </div>

      {/* Items del pedido */}
      <div className="order-items">
        {order.items.map((item, index) => (
          <div key={index} className="order-item">
            <div className="item-main-info">
              <span className="item-quantity">{item.quantity}x</span>
              <span className="item-name">{item.name}</span>
              <span className="item-time">({item.preparationTime}min)</span>
            </div>
            {item.comments && (
              <div className="item-comments">
                <span className="comments-icon">📝</span>
                <span className="comments-text">{item.comments}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Información de tiempo */}
      <div className="order-timing">
        <div className="timing-info">
          <span className="timing-label">Pedido hace:</span>
          <span className="timing-value">
            {getWaitingTime(order.orderTime)} min
          </span>
        </div>

        {order.startTime && (
          <div className="timing-info">
            <span className="timing-label">En cocina:</span>
            <span className="timing-value">
              {getElapsedTime(order.startTime)} min
            </span>
          </div>
        )}

        <div className="timing-info">
          <span className="timing-label">Tiempo estimado:</span>
          <span className="timing-value">{order.estimatedTime} min</span>
        </div>
      </div>

      {/* Total del pedido */}
      <div className="order-total">
        <span className="total-label">Total:</span>
        <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
      </div>

      {/* Botón de acción */}
      <div className="order-actions">{getActionButtons()}</div>

      {/* Indicador de estado */}
      <div className="order-status-indicator">
        {order.status === "pendiente" && "🔄 Pendiente"}
        {order.status === "en_preparacion" && "⏳ En Preparación"}
        {order.status === "listo" && "✅ Listo"}
        {order.status === "entregado" && "🚀 Entregado"}
      </div>
    </div>
  );
};

export default OrderCard;
