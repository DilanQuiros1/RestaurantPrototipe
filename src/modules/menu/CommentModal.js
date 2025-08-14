import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import observacionesData from '../../data/observacionesComunes.json';
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

  // Obtener observaciones comunes para la categoría del producto
  const getCommonCommentsForCategory = () => {
    const categoryComments = observacionesData.observacionesPorCategoria[item?.category] || [];
    const generalComments = observacionesData.observacionesGenerales || [];
    return [...categoryComments, ...generalComments];
  };

  // Obtener ingredientes del producto para permitir eliminarlos
  const getProductIngredients = () => {
    return item?.ingredients || [];
  };

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

  // Agregar comentario personalizado sin duplicados
  const addCustomComment = (newComment) => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    // Verificar si ya existe este comentario
    const currentComments = comment.split(',').map(c => c.trim()).filter(c => c);
    if (!currentComments.includes(trimmedComment)) {
      if (comment.trim()) {
        setComment(prev => `${prev}, ${trimmedComment}`);
      } else {
        setComment(trimmedComment);
      }
    }
  };

  const handleSubmit = () => {
    // Combinar todos los comentarios seleccionados
    const allComments = [
      ...selectedCommonComments,
      ...ingredientsToRemove,
      comment.trim()
    ].filter(c => c).join(', ');

    onConfirm({
      ...item,
      quantity,
      comments: allComments || null
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

          {/* Observaciones comunes por categoría */}
          <div className="suggestions-section">
            <label>Observaciones comunes:</label>
            <div className="suggestions-grid">
              {getCommonCommentsForCategory().map((suggestion, index) => {
                const isSelected = selectedCommonComments.includes(suggestion);
                return (
                  <button
                    key={index}
                    type="button"
                    className={`suggestion-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCommonComment(suggestion)}
                  >
                    <span className="suggestion-icon">
                      {isSelected ? '✓' : '+'}
                    </span>
                    {suggestion}
                  </button>
                );
              })}
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
