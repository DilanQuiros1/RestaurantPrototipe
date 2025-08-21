import React, { useState } from 'react';
import './CustomerPointsModal.css';
import customerService from '../services/customerService';

const CustomerPointsModal = ({ isOpen, onClose }) => {
  const [cedula, setCedula] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCustomer(null);
    setSearched(false);

    // Validar formato de cédula
    if (!customerService.validateCedula(cedula)) {
      setError('Por favor ingrese una cédula válida (9-12 dígitos)');
      setLoading(false);
      return;
    }

    // Simular delay de búsqueda
    setTimeout(() => {
      const foundCustomer = customerService.getCustomerByCedula(cedula);
      
      if (foundCustomer) {
        setCustomer(foundCustomer);
      } else {
        setError('No se encontró ningún cliente registrado con esta cédula');
      }
      
      setSearched(true);
      setLoading(false);
    }, 800);
  };

  const handleClose = () => {
    setCedula('');
    setCustomer(null);
    setError('');
    setSearched(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="points-modal-overlay" onClick={handleClose}>
      <div className="points-modal" onClick={(e) => e.stopPropagation()}>
        <div className="points-modal-header">
          <h2>🎯 Consultar Puntos de Lealtad</h2>
          <button className="points-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="points-modal-content">
          {!searched && !customer && (
            <form onSubmit={handleSubmit} className="points-search-form">
              <div className="form-group">
                <label htmlFor="cedula">Número de Cédula</label>
                <input
                  type="text"
                  id="cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ingrese su número de cédula"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="error-message">
                  <span>⚠️ {error}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="search-button"
                disabled={loading || !cedula.trim()}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Consultando...
                  </>
                ) : (
                  'Consultar Puntos'
                )}
              </button>
            </form>
          )}

          {customer && (
            <div className="customer-details">
              <div className="customer-header">
                <div className="customer-avatar">
                  {customer.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="customer-info">
                  <h3>{customer.nombre}</h3>
                  <p className="customer-phone">📞 {customer.telefono}</p>
                </div>
              </div>

              <div className="points-display">
                <div className="points-card">
                  <div className="points-icon">🏆</div>
                  <div className="points-info">
                    <span className="points-label">Puntos Acumulados</span>
                    <span className="points-value">{customer.points.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="points-actions">
                <button 
                  className="new-search-button"
                  onClick={() => {
                    setCedula('');
                    setCustomer(null);
                    setError('');
                    setSearched(false);
                  }}
                >
                  Nueva Consulta
                </button>
              </div>
            </div>
          )}

          {searched && !customer && !loading && (
            <div className="no-customer-found">
              <div className="no-customer-icon">😔</div>
              <h3>Cliente no encontrado</h3>
              <p>No se encontró ningún cliente registrado con la cédula <strong>{cedula}</strong></p>
              <p>¿Aún no estás registrado en nuestro programa de lealtad?</p>
              <button 
                className="new-search-button"
                onClick={() => {
                  setCedula('');
                  setError('');
                  setSearched(false);
                }}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPointsModal;
