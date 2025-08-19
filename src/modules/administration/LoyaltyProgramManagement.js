import React, { useState, useEffect } from 'react';
import LoyaltyService from '../../services/loyaltyService';
import './LoyaltyProgramManagement.css';

const LoyaltyProgramManagement = () => {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = () => {
    try {
      const loyaltyConfig = LoyaltyService.getConfig();
      setConfig(loyaltyConfig);
      setFormData(loyaltyConfig);
      setLoading(false);
    } catch (error) {
      showMessage('error', 'Error al cargar la configuración');
      setLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const programStats = LoyaltyService.getProgramStats();
      setStats(programStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validation
    if (formData.pointsPerAmount <= 0 || formData.amountPerPoint <= 0 || formData.pointValue <= 0) {
      showMessage('error', 'Los valores deben ser mayores a 0');
      return;
    }

    if (formData.minPointsToRedeem < 1) {
      showMessage('error', 'El mínimo de puntos debe ser al menos 1');
      return;
    }

    const result = LoyaltyService.saveConfig(formData);
    
    if (result.success) {
      setConfig(result.config);
      setIsEditing(false);
      showMessage('success', 'Configuración guardada exitosamente');
      loadStats(); // Refresh stats
    } else {
      showMessage('error', 'Error al guardar la configuración');
    }
  };

  const handleCancel = () => {
    setFormData(config);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      const result = LoyaltyService.resetToDefaults();
      if (result.success) {
        setConfig(result.config);
        setFormData(result.config);
        setIsEditing(false);
        showMessage('success', 'Configuración restaurada a valores por defecto');
        loadStats();
      } else {
        showMessage('error', 'Error al restaurar la configuración');
      }
    }
  };

  const toggleProgramStatus = () => {
    const newStatus = !config.isActive;
    const updatedConfig = { ...config, isActive: newStatus };
    
    const result = LoyaltyService.saveConfig(updatedConfig);
    if (result.success) {
      setConfig(result.config);
      setFormData(result.config);
      showMessage('success', `Programa ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
      loadStats();
    } else {
      showMessage('error', 'Error al cambiar el estado del programa');
    }
  };

  if (loading) {
    return (
      <div className="loyalty-loading">
        <div className="loading-spinner"></div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="loyalty-management">
      <div className="loyalty-header">
        <div className="loyalty-title-section">
          <h2 className="loyalty-title">
            <span className="loyalty-icon">🎯</span>
            Programa de Lealtad
          </h2>
          <p className="loyalty-subtitle">
            Configura y gestiona el programa de puntos para tus clientes
          </p>
        </div>
        
        <div className="loyalty-status-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={config?.isActive || false}
              onChange={toggleProgramStatus}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`status-label ${config?.isActive ? 'active' : 'inactive'}`}>
            {config?.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {message.text && (
        <div className={`loyalty-message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '❌'}
          </span>
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="loyalty-stats">
          <div className="stats-card">
            <div className="stats-icon">👥</div>
            <div className="stats-content">
              <h3>{stats.totalCustomers}</h3>
              <p>Clientes Registrados</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">⭐</div>
            <div className="stats-content">
              <h3>{stats.activeCustomers}</h3>
              <p>Clientes con Puntos</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">🎁</div>
            <div className="stats-content">
              <h3>{stats.totalPointsIssued.toLocaleString()}</h3>
              <p>Puntos Emitidos</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">💰</div>
            <div className="stats-content">
              <h3>{stats.averagePointsPerCustomer}</h3>
              <p>Promedio por Cliente</p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="loyalty-config-section">
        <div className="config-header">
          <h3>Configuración del Programa</h3>
          <div className="config-actions">
            {!isEditing ? (
              <>
                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  <span className="btn-icon">✏️</span>
                  Editar
                </button>
                <button 
                  className="btn-reset"
                  onClick={handleReset}
                >
                  <span className="btn-icon">🔄</span>
                  Restaurar
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn-save"
                  onClick={handleSave}
                >
                  <span className="btn-icon">💾</span>
                  Guardar
                </button>
                <button 
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  <span className="btn-icon">❌</span>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="config-form">
          <div className="config-row">
            <div className="config-group">
              <label className="config-label">
                <span className="label-icon">💳</span>
                Puntos por cada ₡100 gastados
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.pointsPerAmount || 1}
                  onChange={(e) => handleInputChange('pointsPerAmount', parseInt(e.target.value) || 1)}
                  className="config-input"
                />
              ) : (
                <div className="config-value">{config.pointsPerAmount} punto(s)</div>
              )}
              <p className="config-description">
                Cantidad de puntos que gana el cliente por cada ₡100 que gaste
              </p>
            </div>

            <div className="config-group">
              <label className="config-label">
                <span className="label-icon">💰</span>
                Valor de cada punto
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.pointValue || 5}
                  onChange={(e) => handleInputChange('pointValue', parseInt(e.target.value) || 5)}
                  className="config-input"
                />
              ) : (
                <div className="config-value">₡{config.pointValue}</div>
              )}
              <p className="config-description">
                Valor monetario de cada punto al canjearlo
              </p>
            </div>
          </div>

          <div className="config-row">
            <div className="config-group">
              <label className="config-label">
                <span className="label-icon">🎯</span>
                Mínimo de puntos para canjear
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.minPointsToRedeem || 10}
                  onChange={(e) => handleInputChange('minPointsToRedeem', parseInt(e.target.value) || 10)}
                  className="config-input"
                />
              ) : (
                <div className="config-value">{config.minPointsToRedeem} puntos</div>
              )}
              <p className="config-description">
                Cantidad mínima de puntos necesarios para hacer un canje
              </p>
            </div>

            <div className="config-group">
              <label className="config-label">
                <span className="label-icon">🔒</span>
                Máximo de puntos por transacción
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={formData.maxPointsPerTransaction || 1000}
                  onChange={(e) => handleInputChange('maxPointsPerTransaction', parseInt(e.target.value) || 1000)}
                  className="config-input"
                />
              ) : (
                <div className="config-value">{config.maxPointsPerTransaction} puntos</div>
              )}
              <p className="config-description">
                Cantidad máxima de puntos que se pueden canjear por transacción
              </p>
            </div>
          </div>

          {/* Program Info */}
          <div className="config-row">
            <div className="config-group full-width">
              <label className="config-label">
                <span className="label-icon">📝</span>
                Nombre del programa
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.programName || ''}
                  onChange={(e) => handleInputChange('programName', e.target.value)}
                  className="config-input"
                  placeholder="Nombre del programa de lealtad"
                />
              ) : (
                <div className="config-value">{config.programName}</div>
              )}
            </div>
          </div>

          <div className="config-row">
            <div className="config-group full-width">
              <label className="config-label">
                <span className="label-icon">📄</span>
                Descripción
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="config-textarea"
                  placeholder="Descripción del programa para mostrar a los clientes"
                  rows="3"
                />
              ) : (
                <div className="config-value">{config.description}</div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="loyalty-preview">
          <h4>Vista Previa del Programa</h4>
          <div className="preview-card">
            <div className="preview-header">
              <span className="preview-icon">🎯</span>
              <h5>{formData.programName || config.programName}</h5>
            </div>
            <p className="preview-description">
              {formData.description || config.description}
            </p>
            <div className="preview-rules">
              <div className="preview-rule">
                <span className="rule-icon">💳</span>
                <span>Gana {formData.pointsPerAmount || config.pointsPerAmount} punto(s) por cada ₡100 gastados</span>
              </div>
              <div className="preview-rule">
                <span className="rule-icon">💰</span>
                <span>Cada punto vale ₡{formData.pointValue || config.pointValue}</span>
              </div>
              <div className="preview-rule">
                <span className="rule-icon">🎁</span>
                <span>Canjea desde {formData.minPointsToRedeem || config.minPointsToRedeem} puntos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramManagement;
