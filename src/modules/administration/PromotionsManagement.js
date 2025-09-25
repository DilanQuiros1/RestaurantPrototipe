import React, { useState, useEffect } from "react";
import menuService from "../../services/menuService";
import "./PromotionsManagement.css";
import RouteHandler from "../../utils/routeHandler";

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    menuItemId: "",
    // ID de producto del backend seleccionado
    id_producto: "",
    // id del tipo de promoción desde backend (/tipos-promo/)
    id_tipo_promo: "",
    discountType: "percentage", // 'percentage' or 'fixed'
    discountValue: "",
    isActive: true,
    // Campos eliminados del modal: startDate, endDate, isDailySpecial, priority
  });

  // Estado para tipos de promoción desde API
  const [tiposPromo, setTiposPromo] = useState([]);
  const [tiposPromoLoading, setTiposPromoLoading] = useState(false);
  const [tiposPromoError, setTiposPromoError] = useState("");

  // Estado para productos por negocio desde backend
  const [productosNegocio, setProductosNegocio] = useState([]);
  const [productosLoading, setProductosLoading] = useState(false);
  const [productosError, setProductosError] = useState("");

  // Cargar datos reales del menuService
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Cargar items del menú desde menuService
    const allItems = menuService.getAllItems();
    setMenuItems(allItems);

    // Cargar promociones desde menuService
    const currentPromotions = menuService.getPromotions();

    console.log("=== DEBUG ADMIN ===");
    console.log("Items cargados:", allItems.length);
    console.log("Promociones cargadas:", currentPromotions.length);
    currentPromotions.forEach((p) =>
      console.log(`  ${p.id}: ${p.name} (Item: ${p.menuItemId})`)
    );

    setPromotions(currentPromotions);
  };

  // Cargar tipos de promoción al abrir el modal
  useEffect(() => {
    if (!isModalOpen) return;
    const fetchTiposPromo = async () => {
      setTiposPromoLoading(true);
      setTiposPromoError("");
      try {
        let res = await fetch("/tipos-promo/", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          res = await fetch("http://127.0.0.1:8000/tipos-promo/", {
            headers: { Accept: "application/json" },
          });
        }
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (!ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Respuesta no JSON al cargar tipos de promoción (status ${
              res.status
            }). ${text?.slice(0, 120)}`
          );
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        // Normalizar a { id, nombre }
        const normalized = list
          .map((t) => {
            const id =
              t.id_tipo_promo ??
              t.id_tipo ??
              t.id_tipo_promocion ??
              t.id ??
              t.codigo ??
              t.value ??
              "";
            let nombre =
              t.nombre_tipo ??
              t.tipo ??
              t.tipo_promo ??
              t.nombre ??
              t.nombre_promocion ??
              t.titulo ??
              t.descripcion ??
              t.descripcion_tipo ??
              t.name ??
              (id ? `Tipo ${id}` : "Tipo");
            if (typeof nombre === "string") nombre = nombre.trim();
            if (!nombre) nombre = id ? `Tipo ${id}` : "Tipo";
            return { id, nombre };
          })
          .filter((t) => t.id !== "");
        setTiposPromo(normalized);
      } catch (err) {
        console.error("Error cargando tipos de promoción", err);
        setTiposPromoError("No se pudieron cargar los tipos de promoción");
      } finally {
        setTiposPromoLoading(false);
      }
    };
    fetchTiposPromo();
  }, [isModalOpen]);

  // Cargar productos por negocio (backend) al abrir el modal
  useEffect(() => {
    if (!isModalOpen) return;
    const fetchProductos = async () => {
      setProductosLoading(true);
      setProductosError("");
      try {
        const idNegocio = RouteHandler.getBusinessIdFromURL();
        if (!idNegocio) throw new Error("No se encontró id_negocio en la URL");
        const path = `/productos/por-negocio?id_negocio=${encodeURIComponent(
          idNegocio
        )}`;
        let res = await fetch(path, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          const abs = `http://127.0.0.1:8000${
            path.startsWith("/") ? "" : "/"
          }${path}`;
          res = await fetch(abs, { headers: { Accept: "application/json" } });
        }
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (!ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Respuesta no JSON al cargar productos (status ${
              res.status
            }). ${text?.slice(0, 120)}`
          );
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProductosNegocio(list);
      } catch (err) {
        console.error("Error cargando productos por negocio", err);
        setProductosError("No se pudieron cargar los productos");
      } finally {
        setProductosLoading(false);
      }
    };
    fetchProductos();
  }, [isModalOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val,
      // Si seleccionamos id_producto, sincronizar menuItemId por compatibilidad UI
      ...(name === "id_producto" ? { menuItemId: val } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (editingPromotion) {
        // Actualizar promoción existente
        const updatedPromotion = menuService.updatePromotion(
          editingPromotion.id,
          formData
        );
        if (updatedPromotion) {
          // Recargar datos
          loadData();
          setIsModalOpen(false);
          resetForm();
          alert("Promoción actualizada exitosamente");
        } else {
          alert("Error al actualizar la promoción");
        }
      } else {
        // Registrar nueva promoción en backend
        (async () => {
          try {
            // Validaciones mínimas
            const idNegocio = RouteHandler.getBusinessIdFromURL();
            if (!idNegocio)
              throw new Error("No se encontró id_negocio en la URL");
            if (!formData.id_producto)
              throw new Error("Debe seleccionar un producto");
            if (!formData.id_tipo_promo)
              throw new Error("Debe seleccionar un tipo de promoción");
            if (!formData.name?.trim())
              throw new Error("El nombre de la promoción es requerido");
            if (formData.discountType !== "percentage") {
              // El endpoint actual acepta descuento_porcentaje; si el usuario eligió monto fijo, avisar
              throw new Error(
                "Por ahora solo se admite descuento en porcentaje para el registro"
              );
            }
            const payload = {
              id_negocio: Number(idNegocio),
              id_producto: Number(formData.id_producto),
              id_tipo_promo: Number(formData.id_tipo_promo),
              nombre_promo: formData.name,
              descripcion: formData.description || "",
              descuento_porcentaje: Number(formData.discountValue || 0),
            };
            let res = await fetch("/promociones/registrar", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              // Fallback a URL absoluta
              res = await fetch("http://127.0.0.1:8000/promociones/registrar", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(payload),
              });
            }
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText || "Error al registrar la promoción");
            }
            // Intentar parsear JSON (opcional)
            const ct = (res.headers.get("content-type") || "").toLowerCase();
            if (ct.includes("application/json")) {
              await res.json().catch(() => null);
            }
            alert("Promoción creada exitosamente");
            // Cerrar y limpiar
            setIsModalOpen(false);
            resetForm();
            // Opcional: reflejar en UI local (demo). Si quieres verlo en la lista, descomenta:
            // menuService.addPromotion({
            //   name: payload.nombre_promo,
            //   description: payload.descripcion,
            //   menuItemId: String(payload.id_producto),
            //   discountType: "percentage",
            //   discountValue: payload.descuento_porcentaje,
            //   startDate: formData.startDate,
            //   endDate: formData.endDate,
            //   isActive: true,
            //   isDailySpecial: false,
            //   priority: formData.priority || 1,
            // });
            // loadData();
          } catch (err) {
            console.error("Error registrando promoción:", err);
            alert(err.message || "Error al crear la promoción");
          }
        })();
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      alert("Error al procesar la promoción");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      menuItemId: "",
      id_producto: "",
      id_tipo_promo: "",
      discountType: "percentage",
      discountValue: "",
      isActive: true,
      // Campos eliminados del modal: startDate, endDate, isDailySpecial, priority
    });
    setEditingPromotion(null);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData(promotion);
    setIsModalOpen(true);
  };

  const handleDelete = (promotionId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta promoción?")
    ) {
      const deleted = menuService.deletePromotion(promotionId);
      if (deleted) {
        loadData(); // Recargar datos
        alert("Promoción eliminada exitosamente");
      } else {
        alert("Error al eliminar la promoción");
      }
    }
  };

  const togglePromotionStatus = (promotionId) => {
    const updated = menuService.togglePromotionStatus(promotionId);
    if (updated) {
      loadData(); // Recargar datos
    } else {
      alert("Error al cambiar el estado de la promoción");
    }
  };

  const getMenuItemName = (menuItemId) => {
    const item = menuItems.find((item) => item.id === parseInt(menuItemId));
    return item ? item.name : "Producto no encontrado";
  };

  const getMenuItemPrice = (menuItemId) => {
    const item = menuItems.find((item) => item.id === parseInt(menuItemId));
    return item ? item.price : 0;
  };

  const calculateDiscountedPrice = (promotion) => {
    const originalPrice = getMenuItemPrice(promotion.menuItemId);
    if (promotion.discountType === "percentage") {
      return originalPrice * (1 - promotion.discountValue / 100);
    } else {
      return originalPrice - promotion.discountValue;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  return (
    <div className="promotions-management">
      <div className="promotions-header">
        <div className="header-content">
          <h2>🎉 Gestión de Promociones y Platos del Día</h2>
          <p>Crea y gestiona ofertas especiales para atraer más clientes</p>
        </div>
        <button
          className="add-promotion-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="btn-icon">➕</span>
          Nueva Promoción
        </button>
      </div>

      <div className="promotions-stats">
        <div className="stat-card">
          <div className="stat-number">
            {promotions.filter((p) => p.isActive).length}
          </div>
          <div className="stat-label">Promociones Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {promotions.filter((p) => p.isDailySpecial && p.isActive).length}
          </div>
          <div className="stat-label">Platos del Día</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{promotions.length}</div>
          <div className="stat-label">Total Promociones</div>
        </div>
      </div>

      <div className="promotions-list">
        {promotions.length === 0 ? (
          <div className="no-promotions">
            <div className="no-promotions-content">
              <span className="no-promotions-icon">🎯</span>
              <h3>No hay promociones creadas</h3>
              <p>Crea tu primera promoción para atraer más clientes</p>
            </div>
          </div>
        ) : (
          <div className="promotions-grid">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className={`promotion-card ${
                  !promotion.isActive ? "inactive" : ""
                }`}
              >
                <div className="promotion-header">
                  <div className="promotion-title">
                    <h3>{promotion.name}</h3>
                    <div className="promotion-badges">
                      {promotion.isDailySpecial && (
                        <span className="badge daily-special">Plato del Día</span>
                      )}
                      <span
                        className={`badge status ${
                          promotion.isActive ? "active" : "inactive"
                        }`}
                      >
                        {promotion.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                  <div className="promotion-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(promotion)}
                      title="Editar promoción"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn toggle"
                      onClick={() => togglePromotionStatus(promotion.id)}
                      title={promotion.isActive ? "Desactivar" : "Activar"}
                    >
                      {promotion.isActive ? "⏸️" : "▶️"}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(promotion.id)}
                      title="Eliminar promoción"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="promotion-content">
                  <p className="promotion-description">{promotion.description}</p>

                  <div className="promotion-item">
                    <span className="item-label">Producto:</span>
                    <span className="item-name">
                      {getMenuItemName(promotion.menuItemId)}
                    </span>
                  </div>

                  <div className="promotion-pricing">
                    <div className="original-price">
                      Precio original:
                      <span className="price">
                        ₡{getMenuItemPrice(promotion.menuItemId).toFixed(2)}
                      </span>
                    </div>
                    <div className="discount-info">
                      Descuento:
                      <span className="discount">
                        {promotion.discountType === "percentage"
                          ? `${promotion.discountValue}%`
                          : `₡${promotion.discountValue.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="final-price">
                      Precio final:
                      <span className="price discounted">
                        ₡{calculateDiscountedPrice(promotion).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="promotion-dates">
                    <div className="date-range">
                      <span className="date-label">📅 Vigencia:</span>
                      <span className="date-text">
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar promoción */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingPromotion ? "Editar Promoción" : "Nueva Promoción"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="promotion-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre de la Promoción *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Hamburguesa del Día"
                  />
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="id_tipo_promo">Tipo de Promoción *</label>
                      <select
                        id="id_tipo_promo"
                        name="id_tipo_promo"
                        value={formData.id_tipo_promo}
                        onChange={handleInputChange}
                        required
                        disabled={tiposPromoLoading}
                      >
                        <option value="">
                          {tiposPromoLoading
                            ? "Cargando tipos..."
                            : "Selecciona un tipo"}
                        </option>
                        {tiposPromo.map((tp) => (
                          <option key={tp.id} value={tp.id}>
                            {tp.nombre}
                          </option>
                        ))}
                      </select>
                      {tiposPromoError && (
                        <div className="error-message" style={{ marginTop: 6 }}>
                          {tiposPromoError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe la promoción..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="id_producto">Producto del Menú *</label>
                  <select
                    id="id_producto"
                    name="id_producto"
                    value={formData.id_producto}
                    onChange={handleInputChange}
                    required
                    disabled={productosLoading}
                  >
                    <option value="">
                      {productosLoading
                        ? "Cargando productos..."
                        : "Selecciona un producto"}
                    </option>
                    {productosNegocio.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre_producto}
                      </option>
                    ))}
                  </select>
                  {productosError && (
                    <div className="error-message" style={{ marginTop: 6 }}>
                      {productosError}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="discountType">Tipo de Descuento *</label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo (₡)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="discountValue">Valor del Descuento *</label>
                  <input
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={
                      formData.discountType === "percentage" ? "20" : "5.00"
                    }
                  />
                </div>
              </div>

              {/* Campos eliminados: Fechas y Prioridad */}

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Promoción Activa</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  {editingPromotion ? "Actualizar" : "Crear"} Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsManagement;
