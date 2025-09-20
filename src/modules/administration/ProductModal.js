import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { ImageUploader } from "../../components/common";
import { getImageByDishName } from "../menu/menuImages";
import imageService from "../../services/imageService";
import "./ProductModal.css";
import RouteHandler from "../../utils/routeHandler";

// Lista de imágenes disponibles organizadas por categoría (constante a nivel de módulo)
const AVAILABLE_IMAGES = {
  "comidas-rapidas": [
    { key: "Hamburguesa Clásica", name: "Hamburguesa Clásica" },
    { key: "Nachos Supremos", name: "Nachos Supremos" },
    { key: "Pizza Margherita", name: "Pizza Margherita" },
    { key: "Hot Dog Gourmet", name: "Hot Dog Gourmet" },
  ],
  "platos-fuertes": [
    { key: "Filete de Res", name: "Filete de Res" },
    { key: "Pollo a la Plancha", name: "Pollo a la Plancha" },
    { key: "Pasta Carbonara", name: "Pasta Carbonara" },
    { key: "Salmón Asado", name: "Salmón Asado" },
  ],
  bebidas: [
    { key: "Limonada Natural", name: "Limonada Natural" },
    { key: "Smoothie de Frutas", name: "Smoothie de Frutas" },
    { key: "Café Americano", name: "Café Americano" },
    { key: "Té Helado", name: "Té Helado" },
  ],
  postres: [
    { key: "Filete de Res", name: "Imagen Genérica 1" },
    { key: "Pasta Carbonara", name: "Imagen Genérica 2" },
  ],
  entradas: [
    { key: "Filete de Res", name: "Imagen Genérica 1" },
    { key: "Pasta Carbonara", name: "Imagen Genérica 2" },
  ],
};

const ProductModal = ({
  isOpen,
  product,
  onSave,
  onCancel,
  idNegocio: idNegocioProp,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "comidas-rapidas",
    ingredients: [""],
    image: "Filete de Res",
    preparationTime: 15,
    // Campos para API (derivados/ocultos)
    estado: "A",
    esPlatoDelDia: false,
    esPromo: false,
  });

  const [errors, setErrors] = useState({});
  const [imageType, setImageType] = useState("predefined"); // 'predefined' o 'custom'
  const [customImage, setCustomImage] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);

  // Estado para Adicionales (API)
  const [adicionalesCatalog, setAdicionalesCatalog] = useState([]); // catálogo completo (activos)
  const [adicionalesQuery, setAdicionalesQuery] = useState(""); // búsqueda local
  const [adicionalesSelected, setAdicionalesSelected] = useState([]); // IDs seleccionados
  const [adicionalesLoading, setAdicionalesLoading] = useState(false);
  const [adicionalesError, setAdicionalesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const categories = [
    { id: "comidas-rapidas", label: "Comidas Rápidas" },
    { id: "platos-fuertes", label: "Platos Fuertes" },
    { id: "bebidas", label: "Bebidas" },
    { id: "postres", label: "Postres" },
    { id: "entradas", label: "Entradas" },
  ];

  // Mapeo local de categoría (slug) a id numérico del backend
  // Ajusta estos valores si tu API usa otros IDs
  const CATEGORY_ID_MAP = {
    "comidas-rapidas": 1,
    "platos-fuertes": 2,
    bebidas: 3,
    postres: 4,
    entradas: 5,
  };

  // ...

  useEffect(() => {
    if (product) {
      // Cargar imagen personalizada si existe
      const savedImage = imageService.getImageByProductId(product.id);
      const isCustomImageUrl =
        savedImage ||
        (product.image &&
          (product.image.startsWith("data:image") ||
            product.image.startsWith("blob:") ||
            product.image.startsWith("http")));

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "comidas-rapidas",
        ingredients: product.ingredients || [""],
        image: isCustomImageUrl ? "custom" : product.image || "Filete de Res",
        preparationTime: product.preparationTime || 15,
        estado: product.estado || "A",
        esPlatoDelDia: Boolean(product.esPlatoDelDia) || false,
        esPromo: Boolean(product.esPromo) || false,
      });

      // Pre-cargar adicionales si vienen del producto (array de IDs)
      if (Array.isArray(product.adicionales)) {
        setAdicionalesSelected(product.adicionales);
      } else {
        setAdicionalesSelected([]);
      }

      if (savedImage) {
        setImageType("custom");
        setCustomImage(savedImage.data);
      } else if (isCustomImageUrl) {
        setImageType("custom");
        setCustomImage(product.image);
      } else {
        setImageType("predefined");
        setCustomImage(null);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "comidas-rapidas",
        ingredients: [""],
        image: "Filete de Res",
        preparationTime: 15,
        estado: "A",
        esPlatoDelDia: false,
        esPromo: false,
      });
      // Reset adicionales
      setAdicionalesSelected([]);
      setAdicionalesQuery("");
      setImageType("predefined");
      setCustomImage(null);
      setCustomImageFile(null);
    }
    setErrors({});
  }, [product, isOpen, idNegocioProp]);

  // Cargar catálogo de adicionales desde API al abrir el modal
  useEffect(() => {
    if (!isOpen) return;
    const fetchAdicionales = async () => {
      setAdicionalesLoading(true);
      setAdicionalesError("");
      try {
        let res = await fetch("/adicionales/", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          // intentar con URL absoluta si proxy no aplica
          res = await fetch("http://127.0.0.1:8000/adicionales/", {
            headers: { Accept: "application/json" },
          });
        }
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (!ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Respuesta no JSON al cargar adicionales (status ${
              res.status
            }). ${text?.slice(0, 120)}`
          );
        }
        const data = await res.json();
        const activos = Array.isArray(data)
          ? data.filter((a) => a.estado === "A")
          : [];
        setAdicionalesCatalog(activos);
      } catch (err) {
        console.error("Error cargando adicionales", err);
        setAdicionalesError("No se pudo cargar el catálogo de adicionales");
      } finally {
        setAdicionalesLoading(false);
      }
    };
    fetchAdicionales();
  }, [isOpen]);

  // Efecto para actualizar la imagen cuando cambia la categoría (solo para imágenes predefinidas)
  useEffect(() => {
    if (imageType === "predefined") {
      const currentCategoryImages = AVAILABLE_IMAGES[formData.category] || [];
      const currentImageExists = currentCategoryImages.some(
        (img) => img.key === formData.image
      );

      // Si la imagen actual no está disponible en la nueva categoría, seleccionar la primera disponible
      if (!currentImageExists && currentCategoryImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          image: currentCategoryImages[0].key,
        }));
      }
    }
  }, [formData.category, imageType, formData.image]);

  // Función para obtener las imágenes disponibles para la categoría actual
  const getCurrentCategoryImages = () => {
    return AVAILABLE_IMAGES[formData.category] || [];
  };

  // Funciones para manejar imágenes personalizadas
  const handleCustomImageChange = (imageUrl, file) => {
    setCustomImage(imageUrl);
    setCustomImageFile(file);
    setImageType("custom");
    setFormData((prev) => ({ ...prev, image: "custom" }));
  };

  const handleCustomImageRemove = () => {
    // Eliminar imagen guardada si existe un producto con ID
    if (product?.id) {
      imageService.removeImageByProductId(product.id);
    }

    setCustomImage(null);
    setCustomImageFile(null);
    setImageType("predefined");
    const currentCategoryImages = getCurrentCategoryImages();
    setFormData((prev) => ({
      ...prev,
      image:
        currentCategoryImages.length > 0
          ? currentCategoryImages[0].key
          : "Filete de Res",
    }));
  };

  // Función para cambiar el tipo de selector de imagen
  const handleImageTypeChange = (type) => {
    setImageType(type);
    if (type === "predefined") {
      setCustomImage(null);
      setCustomImageFile(null);
      const currentCategoryImages = getCurrentCategoryImages();
      setFormData((prev) => ({
        ...prev,
        image:
          currentCategoryImages.length > 0
            ? currentCategoryImages[0].key
            : "Filete de Res",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();

      // Imagen
      if (imageType === "custom" && customImageFile) {
        fd.append("imagen", customImageFile);
      } else {
        const url = getImageByDishName(formData.image);
        const resp = await fetch(url);
        const blob = await resp.blob();
        const filename = `${(formData.name || "producto").replace(
          /\s+/g,
          "_"
        )}.${(blob.type && blob.type.split("/")[1]) || "jpg"}`;
        const fileFromBlob = new File([blob], filename, {
          type: blob.type || "image/jpeg",
        });
        fd.append("imagen", fileFromBlob);
      }

      // Campos requeridos: id_negocio desde URL/prop, id_categoria desde categoría seleccionada
      const negocioId = idNegocioProp ?? RouteHandler.getBusinessIdFromURL();
      if (!negocioId || Number(negocioId) <= 0) {
        throw new Error("No se encontró un id_negocio válido en la URL");
      }
      const categoriaId = CATEGORY_ID_MAP[formData.category];
      if (!categoriaId) {
        throw new Error("Categoría seleccionada no válida (id no mapeado)");
      }

      fd.append("id_negocio", String(negocioId));
      fd.append("id_categoria", String(categoriaId));
      fd.append("nombre_producto", formData.name);
      fd.append("precio", String(parseFloat(formData.price)));

      // Opcionales
      if (formData.description) fd.append("descripcion", formData.description);
      fd.append("es_plato_del_dia", String(Boolean(formData.esPlatoDelDia)));
      fd.append("es_promo", String(Boolean(formData.esPromo)));
      fd.append("estado", formData.estado || "A");

      // Adicionales (JSON texto)
      if (adicionalesSelected.length > 0) {
        const adicionalesPayload = adicionalesSelected.map((id) => ({
          id_adicional: id,
        }));
        fd.append("adicionales", JSON.stringify(adicionalesPayload));
      }

      const res = await fetch("/productos/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error al registrar el producto");
      }
      const data = await res.json().catch(() => ({}));
      setSubmitSuccess("Producto registrado correctamente");
      if (typeof onSave === "function") onSave({ success: true, data });
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Error al registrar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Adicionales: helpers de UI ---
  const toggleAdicional = (id) => {
    setAdicionalesSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const clearAdicionales = () => setAdicionalesSelected([]);

  const filteredAdicionales = adicionalesCatalog.filter((a) =>
    a.nombre_adicional
      .toLowerCase()
      .includes(adicionalesQuery.trim().toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Se removió la edición de ingredientes en esta pantalla

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <div className="modal-header">
          <h2>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</h2>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="image">Imagen del Producto</label>

            {/* Selector de tipo de imagen */}
            <div className="image-type-selector">
              <button
                type="button"
                className={`type-option ${
                  imageType === "predefined" ? "active" : ""
                }`}
                onClick={() => handleImageTypeChange("predefined")}
              >
                📷 Usar Imagen Predefinida
              </button>
              <button
                type="button"
                className={`type-option ${
                  imageType === "custom" ? "active" : ""
                }`}
                onClick={() => handleImageTypeChange("custom")}
              >
                📁 Subir Mi Imagen
              </button>
            </div>

            {/* Selector de imágenes predefinidas */}
            {imageType === "predefined" && (
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
                  {getCurrentCategoryImages().map((imageOption, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`image-option ${
                        formData.image === imageOption.key ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleInputChange("image", imageOption.key)
                      }
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
            )}

            {/* Uploader de imágenes personalizadas */}
            {imageType === "custom" && (
              <ImageUploader
                currentImage={customImage}
                onImageChange={handleCustomImageChange}
                onImageRemove={handleCustomImageRemove}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre del Producto *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "error" : ""}
              placeholder="Ej: Hamburguesa Clásica"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "error" : ""}
              placeholder="Describe tu producto..."
              rows="3"
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <div className="price-input">
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className={errors.price ? "error" : ""}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adicionales (desde API) */}
          <div className="form-group">
            <label>Adicionales</label>
            <input
              type="text"
              placeholder="Buscar adicional..."
              value={adicionalesQuery}
              onChange={(e) => setAdicionalesQuery(e.target.value)}
              style={{ width: "100%", padding: 6, marginBottom: 8 }}
            />
            {adicionalesLoading && <div>Cargando adicionales...</div>}
            {adicionalesError && (
              <div className="error-message">{adicionalesError}</div>
            )}

            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
                border: "1px solid #eee",
                padding: 8,
              }}
            >
              {filteredAdicionales.length === 0 && !adicionalesLoading ? (
                <div>No hay resultados</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {filteredAdicionales.map((a) => (
                    <li key={a.id_adicional} style={{ marginBottom: 6 }}>
                      <label style={{ cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={adicionalesSelected.includes(a.id_adicional)}
                          onChange={() => toggleAdicional(a.id_adicional)}
                          style={{ marginRight: 8 }}
                        />
                        {a.nombre_adicional}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <strong>Seleccionados: {adicionalesSelected.length}</strong>
              {adicionalesSelected.length > 0 && (
                <button
                  type="button"
                  onClick={clearAdicionales}
                  className="btn btn-secondary"
                >
                  Limpiar
                </button>
              )}
            </div>

            {adicionalesSelected.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {adicionalesCatalog
                  .filter((a) => adicionalesSelected.includes(a.id_adicional))
                  .map((a) => (
                    <span
                      key={a.id_adicional}
                      style={{
                        border: "1px solid #ccc",
                        padding: "4px 8px",
                        marginRight: 6,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {a.nombre_adicional}
                      <button
                        type="button"
                        onClick={() => toggleAdicional(a.id_adicional)}
                      >
                        x
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Debug opcional */}
            {/* <div style={{ marginTop: 8 }}>IDs seleccionados: {JSON.stringify(adicionalesSelected)}</div> */}
          </div>

          {/* IDs ocultos: id_negocio se toma de la URL y id_categoria del selector de categoría */}

          {/* Campos ocultos: estado y flags se envían por defecto sin mostrarlos */}

          {/* Se removieron los campos de Ingredientes y Tiempo de preparación en esta pantalla */}

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? "Enviando..."
                : product
                ? "Actualizar Producto"
                : "Crear Producto"}
            </Button>
          </div>

          {submitError && (
            <div className="error-message" style={{ marginTop: 8 }}>
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="success-message" style={{ marginTop: 8 }}>
              {submitSuccess}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
