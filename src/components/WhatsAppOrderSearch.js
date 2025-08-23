import React, { useState } from 'react';
import OrderValidationModal from './OrderValidationModal';
import whatsappService from '../services/whatsappService';
import './WhatsAppOrderSearch.css';

const WhatsAppOrderSearch = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setSearchError('Por favor ingrese un número de pedido');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const result = whatsappService.getOrderById(orderId.trim());
      
      if (result.success) {
        setFoundOrder(result.data);
        setIsValidationModalOpen(true);
      } else {
        setSearchError(result.error || 'Pedido no encontrado');
        setFoundOrder(null);
      }
    } catch (error) {
      setSearchError('Error al buscar el pedido');
      console.error('Error searching order:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOrderValidationConfirm = async (orderData) => {
    try {
      // Marcar como procesado
      whatsappService.markOrderAsProcessed(orderData.id);
      
      // Simular registro en el sistema
      const registeredOrder = {
        id: Date.now(),
        ...orderData,
        status: 'registered',
        registeredAt: new Date().toISOString()
      };

      console.log('Pedido registrado:', registeredOrder);
      
      // Cerrar modales y limpiar
      setIsValidationModalOpen(false);
      setFoundOrder(null);
      setOrderId('');
      onClose();
      
      alert(`✅ Pedido ${orderData.id} registrado exitosamente en el sistema`);
    } catch (error) {
      console.error('Error registering order:', error);
      alert('Error al registrar el pedido. Por favor intenta nuevamente.');
    }
  };

  const handleOrderValidationCancel = () => {
    setIsValidationModalOpen(false);
    setFoundOrder(null);
  };

  const handleClose = () => {
    setOrderId('');
    setSearchError('');
    setFoundOrder(null);
    setIsValidationModalOpen(false);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="whatsapp-search-overlay" onClick={handleClose}>
        <div className="whatsapp-search-modal" onClick={(e) => e.stopPropagation()}>
          <div className="whatsapp-search-header">
            <h2>📱 Buscar Pedido de WhatsApp</h2>
            <button className="whatsapp-search-close" onClick={handleClose}>×</button>
          </div>

          <div className="whatsapp-search-content">
            <div className="whatsapp-search-info">
              <p>🔍 Ingrese el número de pedido recibido por WhatsApp para buscarlo y registrarlo en el sistema.</p>
            </div>

            <div className="whatsapp-search-form">
              <div className="search-input-group">
                <label htmlFor="orderId">Número de Pedido:</label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: ORD-1692734567890-123"
                  className={searchError ? 'error' : ''}
                  disabled={isSearching}
                />
              </div>

              {searchError && (
                <div className="search-error">
                  ⚠️ {searchError}
                </div>
              )}

              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={isSearching || !orderId.trim()}
              >
                {isSearching ? (
                  <>
                    <span className="loading-spinner"></span>
                    Buscando...
                  </>
                ) : (
                  <>
                    🔍 Buscar Pedido
                  </>
                )}
              </button>
            </div>

            <div className="whatsapp-search-help">
              <h4>💡 Ayuda:</h4>
              <ul>
                <li>El número de pedido se encuentra en el mensaje de WhatsApp</li>
                <li>Formato: ORD-[timestamp]-[número]</li>
                <li>Ejemplo: ORD-1692734567890-123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <OrderValidationModal
        isOpen={isValidationModalOpen}
        orderData={foundOrder}
        onConfirm={handleOrderValidationConfirm}
        onCancel={handleOrderValidationCancel}
      />
    </>
  );
};

export default WhatsAppOrderSearch;
