import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import ProductModal from './ProductModal';
import './MenuManagement.css';

const MenuManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Datos de ejemplo - en un caso real vendrían de una API
  useEffect(() => {
    const initialProducts = [
      {
        id: 1,
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa de res con lechuga, tomate, cebolla y queso cheddar',
        price: 8.99,
        category: 'comidas-rapidas',
        ingredients: ['Pan de hamburguesa', 'Carne de res', 'Lechuga', 'Tomate', 'Cebolla', 'Queso cheddar'],
        image: '🍔',
        isVisible: true
      },
      {
        id: 2,
        name: 'Filete de Res',
        description: 'Filete de res a la parrilla con vegetales asados y puré de papas',
        price: 24.99,
        category: 'platos-fuertes',
        ingredients: ['Filete de res', 'Vegetales asados', 'Puré de papas', 'Salsa de vino'],
        image: '🥩',
        isVisible: true
      },
      {
        id: 3,
        name: 'Limonada Natural',
        description: 'Limonada fresca preparada con limones orgánicos y menta',
        price: 3.99,
        category: 'bebidas',
        ingredients: ['Limones', 'Menta', 'Azúcar', 'Agua'],
        image: '🍋',
        isVisible: true
      }
    ];
    setProducts(initialProducts);
  }, []);

  const categories = [
    { id: 'all', label: 'Todos los productos', icon: '📋' },
    { id: 'comidas-rapidas', label: 'Comidas Rápidas', icon: '🍔' },
    { id: 'platos-fuertes', label: 'Platos Fuertes', icon: '🍽️' },
    { id: 'bebidas', label: 'Bebidas', icon: '🥤' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleToggleVisibility = (productId) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isVisible: !p.isVisible } : p
    ));
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // Editar producto existente
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
      ));
    } else {
      // Agregar nuevo producto
      const newProduct = {
        ...productData,
        id: Date.now(),
        isVisible: true
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="menu-management">
      <div className="menu-management-header">
        <div className="header-content">
          <h2>Gestión de Menú</h2>
          <p>Administra los productos de tu menú</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddProduct}
          className="add-product-btn"
        >
          ➕ Agregar Producto
        </Button>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="filter-icon">{category.icon}</span>
            <span className="filter-label">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className={`product-card ${!product.isVisible ? 'invisible' : ''}`}>
            <div className="product-header">
              <div className="product-image">{product.image}</div>
              <div className="product-visibility">
                <button
                  className={`visibility-toggle ${product.isVisible ? 'visible' : 'hidden'}`}
                  onClick={() => handleToggleVisibility(product.id)}
                  title={product.isVisible ? 'Ocultar producto' : 'Mostrar producto'}
                >
                  {product.isVisible ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
            
            <div className="product-content">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-status">
                <span className={`status-badge ${product.isVisible ? 'visible' : 'hidden'}`}>
                  {product.isVisible ? 'Visible' : 'Oculto'}
                </span>
                <span className={`status-badge ${product.isAvailable ? 'available' : 'unavailable'}`}>
                  {product.isAvailable ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="product-description">{product.description}</p>
              <div className="product-price">${product.price.toFixed(2)}</div>
              
              <div className="product-ingredients">
                <strong>Ingredientes:</strong>
                <div className="ingredients-list">
                  {product.ingredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">{ingredient}</span>
                  ))}
                </div>
              </div>

              <div className="product-actions">
                <Button 
                  variant="secondary" 
                  onClick={() => handleEditProduct(product)}
                  className="edit-btn"
                >
                  ✏️ Editar
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="delete-btn"
                >
                  🗑️ Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No hay productos</h3>
          <p>Comienza agregando tu primer producto al menú</p>
          <Button variant="primary" onClick={handleAddProduct}>
            Agregar Producto
          </Button>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default MenuManagement;
