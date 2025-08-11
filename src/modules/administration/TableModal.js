import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import './TableModal.css';

const TableModal = ({ isOpen, table, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: 2
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (table && table.id) {
      // Editando mesa existente
      setFormData({
        number: table.number || '',
        capacity: table.capacity || 2
      });
    } else {
      // Nueva mesa
      setFormData({
        number: '',
        capacity: 2
      });
    }
    setErrors({});
  }, [table, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number || formData.number <= 0) {
      newErrors.number = 'El número de mesa debe ser mayor a 0';
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 12) {
      newErrors.capacity = 'La capacidad debe estar entre 1 y 12 personas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const tableData = {
        ...formData,
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity),
        position: table?.position || { x: 0, y: 0 }
      };
      onSave(tableData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="table-modal">
        <div className="modal-header">
          <h2>{table && table.id ? 'Editar Mesa' : 'Agregar Nueva Mesa'}</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="table-form">
          <div className="form-group">
            <label htmlFor="number">Número de Mesa *</label>
            <input
              type="number"
              id="number"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={errors.number ? 'error' : ''}
              placeholder="Ej: 1"
              min="1"
            />
            {errors.number && <span className="error-message">{errors.number}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacidad (personas) *</label>
            <select
              id="capacity"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className={errors.capacity ? 'error' : ''}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(cap => (
                <option key={cap} value={cap}>
                  {cap} {cap === 1 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
            {errors.capacity && <span className="error-message">{errors.capacity}</span>}
          </div>

          {table?.position && (
            <div className="form-group">
              <label>Posición en el Layout</label>
              <div className="position-info">
                <span>Fila: {table.position.y + 1}</span>
                <span>Columna: {table.position.x + 1}</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {table && table.id ? 'Actualizar Mesa' : 'Crear Mesa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;
