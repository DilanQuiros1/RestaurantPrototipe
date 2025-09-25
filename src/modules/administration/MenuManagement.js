import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import ProductModal from "./ProductModal";
import productosService from "../../services/productosService";
import imageService from "../../services/imageService";
import { getImageByDishName } from "../menu/menuImages";
import RouteHandler from "../../utils/routeHandler";
import "./MenuManagement.css";

const MenuManagement = ({ idNegocio }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar productos desde backend
  useEffect(() => {
    const negocioId = idNegocio ?? RouteHandler.getBusinessIdFromURL();
    if (!negocioId) {
      setError("No se encontró id_negocio en la URL. Inicie sesión primero.");
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { categoriesList, menuData } =
          await productosService.fetchProductosPorNegocio(negocioId);
        // Flatten products
        const flat = Object.values(menuData).flat();
        setProducts(flat);
        // categoriesList ya incluye promociones / platos del día; añadimos 'all'
        setCategories([
          { id: "all", name: "Todos los productos" },
          ...categoriesList,
        ]);
        // Ajustar categoría activa si no existe
        setActiveCategory((prev) =>
          prev === "all" || categoriesList.some((c) => c.id === prev)
            ? prev
            : "all"
        );
      } catch (err) {
        console.error("Error cargando productos admin", err);
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idNegocio]);

  // Función para obtener la imagen correcta (personalizada o predefinida)
  const getProductImage = (product) => {
    // Seguridad: producto o image pueden venir indefinidos
    if (!product) {
      return getImageByDishName("Filete de Res");
    }
    // Ruta absoluta o data/blob
    if (typeof product.image === "string" && product.image) {
      if (
        product.image.startsWith("http") ||
        product.image.startsWith("data:image") ||
        product.image.startsWith("blob:")
      ) {
        return product.image;
      }
      if (product.image.startsWith("/")) {
        return `http://127.0.0.1:8000${product.image}`;
      }
    }
    // Imagen personalizada local (legacy)
    if (product.image === "custom") {
      const savedImage = imageService.getImageByProductId(product.id);
      if (savedImage?.data) return savedImage.data;
    }
    return getImageByDishName("Filete de Res");
  };
  const filteredProducts = products.filter((p) => {
    if (activeCategory === "all") return true;
    // p.categorySlug asignado por productosService
    if (p.esPlatoDelDia && activeCategory === "platos-del-dia") return true;
    if (p.esPromo && activeCategory === "promociones") return true;
    return p.categorySlug === activeCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (!productId) return;
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?"))
      return;
    const negocioId = idNegocio ?? RouteHandler.getBusinessIdFromURL();
    if (!negocioId) {
      alert("No se encontró id_negocio en la URL");
      return;
    }
    // Optimista: quitar de la lista, guardar copia para posible rollback
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, __deleting: true } : p))
    );
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    productosService
      .eliminarProducto(negocioId, productId)
      .then(() => {
        // Opcional: podríamos refetch si el backend devuelve algo relevante
      })
      .catch((err) => {
        console.error("Error eliminando producto", err);
        alert("No se pudo eliminar el producto");
        // Rollback
        setProducts(previous);
      });
  };

  const handleToggleVisibility = (productId) => {
    const negocioId = idNegocio ?? RouteHandler.getBusinessIdFromURL();
    if (!negocioId) return;
    // Determinar estado actual antes de modificar
    const current = products.find((p) => p.id === productId);
    const nuevoEstado = current && current.isVisible ? "I" : "A";
    // Optimista
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              __prevVisible: p.isVisible,
              isVisible: nuevoEstado === "A",
              __updatingVisibility: true,
            }
          : p
      )
    );
    productosService
      .actualizarEstadoProducto(negocioId, productId, nuevoEstado)
      .then((res) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, __updatingVisibility: false } : p
          )
        );
      })
      .catch((err) => {
        console.error("Error actualizando estado", err);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  isVisible: p.__prevVisible,
                  __updatingVisibility: false,
                  __prevVisible: undefined,
                }
              : p
          )
        );
        alert("No se pudo actualizar el estado del producto");
      });
  };

  const handleToggleAvailability = (productId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
      )
    );
  };

  const handleSaveProduct = (productData) => {
    // Si ProductModal reporta éxito (creación real en backend), refrescar lista completa
    if (productData && productData.success) {
      // Forzar recarga llamando de nuevo al backend
      const negocioId = idNegocio ?? RouteHandler.getBusinessIdFromURL();
      if (negocioId) {
        productosService
          .fetchProductosPorNegocio(negocioId)
          .then(({ categoriesList, menuData }) => {
            setProducts(Object.values(menuData).flat());
            setCategories((prev) => [
              { id: "all", name: "Todos los productos" },
              ...categoriesList,
            ]);
          })
          .catch((e) =>
            console.error("Error refrescando productos tras guardar", e)
          );
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      return;
    }

    if (editingProduct) {
      // Actualización local optimista
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...productData } : p
        )
      );
    } else {
      // Creación local optimista (ID temporal)
      const tempId = `temp-${Date.now()}`;
      setProducts((prev) => [
        ...prev,
        { id: tempId, isVisible: true, isAvailable: true, ...productData },
      ]);
    }
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

  if (loading) {
    return (
      <div className="menu-management">
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-management">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

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
            <span className="filter-icon">🍽️</span>
            <span className="filter-label">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`product-card ${!product.isVisible ? "invisible" : ""} ${
              product.__deleting ? "deleting" : ""
            }`}
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
                  } ${product.__updatingVisibility ? "loading" : ""}`}
                  onClick={() =>
                    !product.__updatingVisibility &&
                    handleToggleVisibility(product.id)
                  }
                  title={
                    product.isVisible ? "Ocultar producto" : "Mostrar producto"
                  }
                >
                  {product.__updatingVisibility
                    ? "⏳"
                    : product.isVisible
                    ? "👁️"
                    : "🙈"}
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
                  ₡{Number(product?.price || 0).toLocaleString("es-CR")}
                </div>
                <div className="preparation-time">
                  ⏱️ {Number(product?.preparationTime || 15)} min
                </div>
              </div>

              {Array.isArray(product?.adicionales) &&
                product.adicionales.length > 0 && (
                  <div className="product-ingredients">
                    <strong>Adicionales:</strong>
                    <div className="ingredients-list">
                      {product.adicionales.slice(0, 6).map((a, idx) => (
                        <span key={idx} className="ingredient-tag">
                          {a.nombre}
                          {a.precio
                            ? ` (+₡${Number(a.precio).toLocaleString("es-CR")})`
                            : ""}
                        </span>
                      ))}
                      {product.adicionales.length > 6 && (
                        <span className="ingredient-tag">y más...</span>
                      )}
                    </div>
                  </div>
                )}

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
                  onClick={() =>
                    !product.__deleting && handleDeleteProduct(product.id)
                  }
                  className="delete-btn"
                  disabled={product.__deleting}
                >
                  {product.__deleting ? "Eliminando..." : "🗑️ Eliminar"}
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
