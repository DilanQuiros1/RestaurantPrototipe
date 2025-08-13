import React, { useState } from 'react';
import Button from '../../components/common/Button';
import './CommentModal.css';

const CommentModal = ({ isOpen, item, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Sugerencias de comentarios comunes
  const commonComments = [
    'Sin cebolla',
    'Sin lechuga',
    'Sin tomate',
    'Extra queso',
    'Sin mayonesa',
    'Sin mostaza',
    'Término medio',
    'Bien cocido',
    'Sin azúcar',
    'Con azúcar extra',
    'Sin sal',
    'Picante',
    'No picante',
    'Sin salsa',
    'Salsa aparte'
  ];

  const handleSubmit = () => {
    onConfirm({
      ...item,
      quantity,
      comments: comment.trim() || null
    });
    
    // Limpiar el modal
    setComment('');
    setQuantity(1);
    onClose();
  };

  const handleCancel = () => {
    setComment('');
    setQuantity(1);
    onClose();
  };

  const addCommonComment = (commonComment) => {
    if (comment.trim()) {
      setComment(prev => `${prev}, ${commonComment}`);
    } else {
      setComment(commonComment);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal">
        <div className="comment-modal-header">
          <h3>Personalizar Pedido</h3>
          <button className="close-button" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className="comment-modal-content">
          {/* Información del producto */}
          <div className="selected-item-info">
            <img 
              src={item.image} 
              alt={item.name}
              className="modal-item-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80x80/f8f9fa/6c757d?text=Imagen';
              }}
            />
            <div className="modal-item-details">
              <h4>{item.name}</h4>
              <p className="modal-item-description">{item.description}</p>
              <span className="modal-item-price">${item.price}</span>
            </div>
          </div>

          {/* Cantidad */}
          <div className="quantity-section">
            <label htmlFor="quantity">Cantidad:</label>
            <div className="quantity-controls">
              <button 
                type="button"
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="quantity-input"
              />
              <button 
                type="button"
                className="quantity-btn"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Comentarios sugeridos */}
          <div className="suggestions-section">
            <label>Observaciones comunes:</label>
            <div className="suggestions-grid">
              {commonComments.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => addCommonComment(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de comentarios personalizados */}
          <div className="comment-section">
            <label htmlFor="custom-comment">
              Observaciones especiales:
            </label>
            <textarea
              id="custom-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ejemplo: Sin lechuga, término medio, sin azúcar..."
              maxLength={200}
              className="comment-textarea"
            />
            <div className="character-count">
              {comment.length}/200 caracteres
            </div>
          </div>

          {/* Total */}
          <div className="modal-total">
            <span className="total-label">Total:</span>
            <span className="total-amount">
              ${(item.price * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="comment-modal-actions">
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Agregar al Pedido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
