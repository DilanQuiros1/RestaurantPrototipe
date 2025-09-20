import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import ProductModal from "./ProductModal";
import menuService from "../../services/menuService";
import imageService from "../../services/imageService";
import { getImageByDishName } from "../menu/menuImages";
import "./MenuManagement.css";

const MenuManagement = ({ idNegocio }) => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Cargar productos desde el servicio
  useEffect(() => {
    loadProducts();
  }, []);

  // Función para obtener la imagen correcta (personalizada o predefinida)
  const getProductImage = (product) => {
    // Seguridad: producto o image pueden venir indefinidos
    if (!product) {
      return getImageByDishName("Filete de Res");
    }

    // Si el producto usa imagen personalizada, buscar en el servicio
    if (product.image === "custom") {
      const savedImage = imageService.getImageByProductId(product.id);
      if (savedImage?.data) {
        return savedImage.data;
      }
    }

    // Si la imagen comienza con data:, blob: o http, es una imagen personalizada legacy
    if (
      typeof product.image === "string" &&
      product.image &&
      (product.image.startsWith("data:image") ||
        product.image.startsWith("blob:") ||
        product.image.startsWith("http"))
    ) {
      return product.image;
    }

    // Si no hay nombre válido, usar una imagen por defecto
    const dishName =
      typeof product.image === "string" && product.image.trim()
        ? product.image
        : "Filete de Res";

    // Servicio de imágenes predefinidas
    return getImageByDishName(dishName);
  };

  const loadProducts = () => {
    const allItems = menuService.getAllItems();
    setProducts(allItems);
  };

  const categories = [
    { id: "all", label: "Todos los productos", icon: "📋" },
    { id: "comidas-rapidas", label: "Comidas Rápidas", icon: "🍔" },
    { id: "platos-fuertes", label: "Platos Fuertes", icon: "🍽️" },
    { id: "bebidas", label: "Bebidas", icon: "🥤" },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product?.category === activeCategory);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      // Eliminar imagen asociada si existe
      imageService.removeImageByProductId(productId);

      // Eliminar producto
      menuService.permanentlyDeleteItem(productId);
      loadProducts(); // Recargar lista
    }
  };

  const handleToggleVisibility = (productId) => {
    const product = menuService.getItemById(productId);
    if (product) {
      menuService.updateItem(productId, { isVisible: !product.isVisible });
      loadProducts(); // Recargar lista
    }
  };

  const handleToggleAvailability = (productId) => {
    menuService.toggleItemAvailability(productId);
    loadProducts(); // Recargar lista
  };

  const handleSaveProduct = (productData) => {
    // Si viene de ProductModal tras una llamada real a la API
    if (productData && productData.success) {
      // Aquí podríamos recargar desde API si tuviéramos un endpoint GET.
      // Por ahora, cerramos el modal y mantenemos el listado actual local.
      setIsModalOpen(false);
      setEditingProduct(null);
      return;
    }

    let savedProduct;

    if (editingProduct) {
      // Editar producto existente
      savedProduct = menuService.updateItem(editingProduct.id, productData);
    } else {
      // Agregar nuevo producto
      savedProduct = menuService.addItem(productData);

      // Si había una imagen temporal, actualizarla con el ID real del producto
      if (productData.tempImageId && savedProduct?.id) {
        try {
          // Obtener la imagen temporal
          const tempImage =
            imageService.getAllImages()[productData.tempImageId];
          if (tempImage) {
            // Guardar con el ID real del producto
            imageService.saveImage(
              savedProduct.id,
              tempImage.data,
              tempImage.fileName
            );
            // Eliminar la imagen temporal
            imageService.removeImageById(productData.tempImageId);
          }
        } catch (error) {
          console.error("Error al actualizar imagen del producto:", error);
        }
      }
    }

    loadProducts(); // Recargar lista
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // const handleResetMenu = () => {
  //   if (window.confirm('¿Estás seguro de que quieres resetear el menú a los valores originales? Esto eliminará todos los cambios.')) {
  //     menuService.resetToOriginal();
  //     loadProducts();
  //   }
  // };

  return (
    <div className="menu-management">
      <div className="menu-management-header">
        <div className="header-content">
          <h2>Gestión de Menú</h2>
          <p>Administra los productos de tu menú</p>
        </div>
        <div className="header-actions">
          {/* <Button 
            variant="secondary" 
            onClick={handleResetMenu}
            className="reset-menu-btn"
          >
            🔄 Resetear Menú
          </Button> */}
          <Button
            variant="primary"
            onClick={handleAddProduct}
            className="add-product-btn"
          >
            ➕ Agregar Producto
          </Button>
        </div>
      </div>

      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-filter ${
              activeCategory === category.id ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="filter-icon">{category.icon}</span>
            <span className="filter-label">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`product-card ${!product.isVisible ? "invisible" : ""}`}
          >
            <div className="product-header">
              <div className="product-image">
                <img
                  src={getProductImage(product)}
                  alt={product?.name || "Producto"}
                  className="product-img"
                />
              </div>
              <div className="product-controls">
                <button
                  className={`availability-toggle ${
                    product.isAvailable ? "available" : "unavailable"
                  }`}
                  onClick={() => handleToggleAvailability(product.id)}
                  title={
                    product.isAvailable
                      ? "Marcar como no disponible"
                      : "Marcar como disponible"
                  }
                >
                  {product.isAvailable ? "✅" : "❌"}
                </button>
                <button
                  className={`visibility-toggle ${
                    product.isVisible ? "visible" : "hidden"
                  }`}
                  onClick={() => handleToggleVisibility(product.id)}
                  title={
                    product.isVisible ? "Ocultar producto" : "Mostrar producto"
                  }
                >
                  {product.isVisible ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="product-content">
              <h3 className="product-name">{product?.name || "Sin nombre"}</h3>
              <div className="product-status">
                <span
                  className={`status-badge ${
                    product.isVisible ? "visible" : "hidden"
                  }`}
                >
                  {product.isVisible ? "Visible" : "Oculto"}
                </span>
                <span
                  className={`status-badge ${
                    product.isAvailable ? "available" : "unavailable"
                  }`}
                >
                  {product.isAvailable ? "Disponible" : "No disponible"}
                </span>
              </div>
              <p className="product-description">
                {product?.description || ""}
              </p>
              <div className="product-info">
                <div className="product-price">
                  ${Number(product?.price || 0).toFixed(2)}
                </div>
                <div className="preparation-time">
                  ⏱️ {Number(product?.preparationTime || 15)} min
                </div>
              </div>

              <div className="product-ingredients">
                <strong>Ingredientes:</strong>
                <div className="ingredients-list">
                  {(product?.ingredients || []).map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">
                      {ingredient}
                    </span>
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
        idNegocio={idNegocio}
      />
    </div>
  );
};

export default MenuManagement;
