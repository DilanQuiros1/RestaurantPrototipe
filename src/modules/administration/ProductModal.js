import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import { menuImages, getImageByDishName } from '../menu/menuImages';
import './ProductModal.css';

const ProductModal = ({ isOpen, product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'comidas-rapidas',
    ingredients: [''],
    image: 'Filete de Res',
    preparationTime: 15
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'comidas-rapidas', label: 'Comidas Rápidas' },
    { id: 'platos-fuertes', label: 'Platos Fuertes' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'postres', label: 'Postres' },
    { id: 'entradas', label: 'Entradas' }
  ];

  // Lista de imágenes disponibles organizadas por categoría
  const availableImages = {
    'comidas-rapidas': [
      { key: 'Hamburguesa Clásica', name: 'Hamburguesa Clásica' },
      { key: 'Nachos Supremos', name: 'Nachos Supremos' },
      { key: 'Pizza Margherita', name: 'Pizza Margherita' },
      { key: 'Hot Dog Gourmet', name: 'Hot Dog Gourmet' }
    ],
    'platos-fuertes': [
      { key: 'Filete de Res', name: 'Filete de Res' },
      { key: 'Pollo a la Plancha', name: 'Pollo a la Plancha' },
      { key: 'Pasta Carbonara', name: 'Pasta Carbonara' },
      { key: 'Salmón Asado', name: 'Salmón Asado' }
    ],
    'bebidas': [
      { key: 'Limonada Natural', name: 'Limonada Natural' },
      { key: 'Smoothie de Frutas', name: 'Smoothie de Frutas' },
      { key: 'Café Americano', name: 'Café Americano' },
      { key: 'Té Helado', name: 'Té Helado' }
    ],
    'postres': [
      { key: 'Filete de Res', name: 'Imagen Genérica 1' },
      { key: 'Pasta Carbonara', name: 'Imagen Genérica 2' }
    ],
    'entradas': [
      { key: 'Filete de Res', name: 'Imagen Genérica 1' },
      { key: 'Pasta Carbonara', name: 'Imagen Genérica 2' }
    ]
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'comidas-rapidas',
        ingredients: product.ingredients || [''],
        image: product.image || 'Filete de Res',
        preparationTime: product.preparationTime || 15
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'comidas-rapidas',
        ingredients: [''],
        image: 'Filete de Res',
        preparationTime: 15
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.preparationTime || formData.preparationTime <= 0) {
      newErrors.preparationTime = 'El tiempo de preparación debe ser mayor a 0';
    }

    if (formData.ingredients.length === 0 || formData.ingredients[0].trim() === '') {
      newErrors.ingredients = 'Al menos un ingrediente es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const cleanIngredients = formData.ingredients.filter(ingredient => ingredient.trim() !== '');
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime),
        ingredients: cleanIngredients
      };
      onSave(productData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }));
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <div className="modal-header">
          <h2>{product ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="image">Imagen del Producto</label>
            <div className="image-selector">
              <div className="current-image">
                <img 
                  src={getImageByDishName(formData.image)} 
                  alt="Imagen actual"
                  className="preview-image"
                />
                <span className="image-name">{formData.image}</span>
              </div>
              <div className="image-options">
                {availableImages[formData.category]?.map((imageOption, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`image-option ${formData.image === imageOption.key ? 'selected' : ''}`}
                    onClick={() => handleInputChange('image', imageOption.key)}
                    title={imageOption.name}
                  >
                    <img 
                      src={getImageByDishName(imageOption.key)} 
                      alt={imageOption.name}
                      className="option-image"
                    />
                    <span className="option-name">{imageOption.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre del Producto *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              placeholder="Ej: Hamburguesa Clásica"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              placeholder="Describe tu producto..."
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <div className="price-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={errors.price ? 'error' : ''}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="preparationTime">Tiempo de Preparación (minutos) *</label>
              <div className="time-input">
                <input
                  type="number"
                  id="preparationTime"
                  value={formData.preparationTime}
                  onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                  className={errors.preparationTime ? 'error' : ''}
                  placeholder="15"
                  min="1"
                  max="120"
                />
                <span className="time-unit">min</span>
              </div>
              {errors.preparationTime && <span className="error-message">{errors.preparationTime}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ingredientes *</label>
            <div className="ingredients-container">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-input">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="Ingrediente..."
                    className={errors.ingredients ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="remove-ingredient-btn"
                    onClick={() => removeIngredient(index)}
                    disabled={formData.ingredients.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={addIngredient}
                className="add-ingredient-btn"
              >
                ➕ Agregar Ingrediente
              </Button>
            </div>
            {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {product ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
