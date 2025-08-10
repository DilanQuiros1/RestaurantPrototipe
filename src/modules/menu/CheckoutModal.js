import React, { useState } from 'react';
import Button from '../../components/common/Button';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, onConfirm, order }) => {
  const [customerName, setCustomerName] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [error, setError] = useState('');

  // Simulación de mesas - en una aplicación real esto vendría de una API
  const tables = [
    { id: 1, number: 1, isOccupied: false },
    { id: 2, number: 2, isOccupied: true },
    { id: 3, number: 3, isOccupied: false },
    { id: 4, number: 4, isOccupied: true },
    { id: 5, number: 5, isOccupied: false },
    { id: 6, number: 6, isOccupied: false },
    { id: 7, number: 7, isOccupied: true },
    { id: 8, number: 8, isOccupied: false },
    { id: 9, number: 9, isOccupied: false },
    { id: 10, number: 10, isOccupied: true },
    { id: 11, number: 11, isOccupied: false },
    { id: 12, number: 12, isOccupied: false }
  ];

  const handleConfirm = () => {
    if (!customerName.trim()) {
      setError('Por favor ingresa el nombre del cliente');
      return;
    }
    
    if (!selectedTable) {
      setError('Por favor selecciona una mesa');
      return;
    }

    onConfirm({
      customerName: customerName.trim(),
      tableNumber: selectedTable,
      order: order
    });
  };

  const handleTableSelect = (table) => {
    if (!table.isOccupied) {
      setSelectedTable(table.number);
      setError('');
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setSelectedTable(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Finalizar Pedido</h2>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="customerName">Nombre del Cliente *</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ingresa el nombre del cliente"
              className="customer-name-input"
            />
          </div>

          <div className="form-group">
            <label>Selecciona una Mesa *</label>
            <div className="tables-grid">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`table-item ${table.isOccupied ? 'occupied' : 'available'} ${
                    selectedTable === table.number ? 'selected' : ''
                  }`}
                  onClick={() => handleTableSelect(table)}
                >
                  <span className="table-number">{table.number}</span>
                  <span className="table-status">
                    {table.isOccupied ? 'Ocupada' : 'Disponible'}
                  </span>
                </div>
              ))}
            </div>
            <div className="table-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <div className="legend-color occupied"></div>
                <span>Ocupada</span>
              </div>
              <div className="legend-item">
                <div className="legend-color selected"></div>
                <span>Seleccionada</span>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="order-summary-preview">
            <h4>Resumen del Pedido:</h4>
            <div className="order-items-preview">
              {order.map((item, index) => (
                <div key={index} className="order-item-preview">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  {item.comments && (
                    <div className="item-comments-preview">
                      <small>💬 {item.comments}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="order-total-preview">
              <strong>Total: ${order.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Finalizar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
