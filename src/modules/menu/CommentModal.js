import React, { useState, useEffect, useMemo } from 'react';
import Button from '../../components/common/Button';
import './CommentModal.css';

const CommentModal = ({ isOpen, item, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCommonComments, setSelectedCommonComments] = useState([]);
  const [ingredientsToRemove, setIngredientsToRemove] = useState([]);

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setQuantity(1);
      setSelectedCommonComments([]);
      setIngredientsToRemove([]);
    }
  }, [isOpen, item]);

  // Obtener observaciones específicas del producto
  const getProductObservations = () => {
    return item?.observacionesPersonalizadas || [];
  };

  // Obtener ingredientes específicos del producto
  const getProductIngredients = () => {
    return item?.ingredients || [];
  };

    // Calcular costo extra de observaciones con precio
  const extrasCost = useMemo(() => {
    const productObservations = item?.observacionesPersonalizadas || [];
    return selectedCommonComments.reduce((total, commentName) => {
      const observation = productObservations.find(obs => obs.nombre === commentName);
      return total + (observation?.precio || 0);
    }, 0);
  }, [selectedCommonComments, item]);

  // Manejar toggle de observaciones comunes
  const toggleCommonComment = (commonComment) => {
    setSelectedCommonComments(prev => {
      if (prev.includes(commonComment)) {
        // Si ya está seleccionado, lo quitamos
        return prev.filter(c => c !== commonComment);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prev, commonComment];
      }
    });
  };

  // Manejar toggle de ingredientes para eliminar
  const toggleIngredientRemoval = (ingredient) => {
    setIngredientsToRemove(prev => {
      const ingredientText = `Sin ${ingredient.toLowerCase()}`;
      if (prev.includes(ingredientText)) {
        return prev.filter(ing => ing !== ingredientText);
      } else {
        return [...prev, ingredientText];
      }
    });
  };

  const handleSubmit = () => {
    // Combinar todos los comentarios seleccionados
    const allComments = [
      ...selectedCommonComments,
      ...ingredientsToRemove,
      comment.trim()
    ].filter(c => c).join(', ');

    // Calcular precio total incluyendo extras
    const totalPrice = (item.price + extrasCost) * quantity;

    onConfirm({
      ...item,
      quantity,
      comments: allComments || null,
      extrasCost,
      totalPrice
    });
    
    handleCancel();
  };

  const handleCancel = () => {
    setComment('');
    setQuantity(1);
    setSelectedCommonComments([]);
    setIngredientsToRemove([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={handleCancel}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>Personalizar Pedido</h3>
          <button className="close-button" onClick={handleCancel} type="button">
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

          {/* Ingredientes del plato - opción de quitar */}
          {getProductIngredients().length > 0 && (
            <div className="ingredients-section">
              <label>Ingredientes (toca para quitar):</label>
              <div className="ingredients-grid">
                {getProductIngredients().map((ingredient, index) => {
                  const ingredientText = `Sin ${ingredient.toLowerCase()}`;
                  const isSelected = ingredientsToRemove.includes(ingredientText);
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`ingredient-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleIngredientRemoval(ingredient)}
                    >
                      <span className="ingredient-icon">
                        {isSelected ? '✓' : '−'}
                      </span>
                      {ingredient}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observaciones específicas del producto */}
          {getProductObservations().length > 0 && (
            <div className="suggestions-section">
              <label>Observaciones disponibles:</label>
              <div className="suggestions-grid">
                {getProductObservations().map((observation, index) => {
                  const isSelected = selectedCommonComments.includes(observation.nombre);
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`suggestion-chip ${isSelected ? 'selected' : ''} ${observation.precio > 0 ? 'has-price' : ''}`}
                      onClick={() => toggleCommonComment(observation.nombre)}
                    >
                      <span className="suggestion-icon">
                        {isSelected ? '✓' : '+'}
                      </span>
                      <span className="suggestion-text">
                        {observation.nombre}
                        {observation.precio > 0 && (
                          <span className="suggestion-price">
                            +${observation.precio.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              ${((item.price + extrasCost) * quantity).toFixed(2)}
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
