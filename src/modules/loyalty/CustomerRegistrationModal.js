import React, { useState } from 'react';
import customerService from '../../services/customerService';
import './CustomerRegistrationModal.css';

const CustomerRegistrationModal = ({ isOpen, onClose, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar cédula
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!customerService.validateCedula(formData.cedula)) {
      newErrors.cedula = 'Formato de cédula inválido (debe tener 9-12 dígitos)';
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!customerService.validatePhone(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido (debe tener 8 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = customerService.registerCustomer({
        cedula: formData.cedula.trim(),
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim()
      });

      if (result.success) {
        setSuccessMessage('¡Cliente registrado exitosamente! Ahora puedes acumular puntos en tus pedidos.');
        setFormData({ cedula: '', nombre: '', telefono: '' });
        setErrors({});
        
        // Notificar al componente padre
        if (onRegistrationSuccess) {
          onRegistrationSuccess(result.customer);
        }

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 2000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Error al registrar cliente. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ cedula: '', nombre: '', telefono: '' });
    setErrors({});
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="customer-registration-overlay" onClick={handleClose}>
      <div className="customer-registration-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Programa de Fidelización</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {successMessage ? (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <p className="success-message">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="registration-form">
            <p className="form-description">
              Regístrate para acumular puntos en cada compra y obtener descuentos especiales.
            </p>

            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cedula">Cédula de Identidad *</label>
              <input
                type="text"
                id="cedula"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                placeholder="Ej: 123456789"
                className={errors.cedula ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.cedula && <span className="error-text">{errors.cedula}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
                className={errors.nombre ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: 88887777"
                className={errors.telefono ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.telefono && <span className="error-text">{errors.telefono}</span>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-btn"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>

            <div className="benefits-info">
              <h4>🎁 Beneficios del programa:</h4>
              <ul>
                <li>• Acumula 1 punto por cada ₡100 gastados</li>
                <li>• Canjea 100 puntos por ₡1000 de descuento</li>
                <li>• Ofertas exclusivas para miembros</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerRegistrationModal;
