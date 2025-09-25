import React, { useState, useEffect } from "react";
import MenuItem from "./MenuItem";
import OrderSummary from "./OrderSummary";
import CheckoutModal from "./CheckoutModal";
import AdminLoginModal from "./AdminLoginModal";
import WaiterCallModal from "./WaiterCallModal";
import CustomerRegistrationModal from "../loyalty/CustomerRegistrationModal";
import CustomerPointsModal from "../../components/CustomerPointsModal";
import OrderValidationModal from "../../components/OrderValidationModal";
import { getImageByDishName } from "./menuImages";
import productosService from "../../services/productosService";
import imageService from "../../services/imageService";
import whatsappService from "../../services/whatsappService";
import "./Menu.css";
import RouteHandler from "../../utils/routeHandler";

const Menu = ({ onAdminAccess, menuType = "internal" }) => {
  const [activeCategory, setActiveCategory] = useState("platos-del-dia");
  const [order, setOrder] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isWaiterCallOpen, setIsWaiterCallOpen] = useState(false);
  const [isCustomerRegistrationOpen, setIsCustomerRegistrationOpen] =
    useState(false);
  const [isCustomerPointsOpen, setIsCustomerPointsOpen] = useState(false);
  const [isOrderValidationOpen, setIsOrderValidationOpen] = useState(false);
  const [validationOrderData, setValidationOrderData] = useState(null);
  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Función para obtener la imagen correcta (URL backend, personalizada o predefinida)
  const getProductImage = (product) => {
    // Prioridad 1: url absoluta del backend o data/blob
    if (
      product.image &&
      (product.image.startsWith("http") ||
        product.image.startsWith("data:image") ||
        product.image.startsWith("blob:"))
    ) {
      return product.image;
    }
    // Si es una ruta relativa del backend, prefijar host del API para que <img> la pueda cargar
    if (product.image && product.image.startsWith("/")) {
      return `http://127.0.0.1:8000${product.image}`;
    }
    // Prioridad 2: imagen personalizada guardada localmente
    if (product.image === "custom") {
      const savedImage = imageService.getImageByProductId(product.id);
      if (savedImage) return savedImage.data;
    }
    // Fallback: predefinida por nombre/clave
    return getImageByDishName(product.image || "Filete de Res");
  };

  // Cargar datos del menú desde el backend por id_negocio
  useEffect(() => {
    const idNegocio = RouteHandler.getBusinessIdFromURL();
    if (!idNegocio) {
      setLoadError(
        "No se encontró id_negocio en la URL. Inicie sesión para continuar."
      );
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { categoriesList, menuData } =
          await productosService.fetchProductosPorNegocio(idNegocio);
        // Filtrar solo productos visibles (estado 'A')
        const filteredMenuData = Object.fromEntries(
          Object.entries(menuData).map(([cat, items]) => [
            cat,
            items.filter((it) => it.isVisible !== false),
          ])
        );
        // Remover categorías vacías tras filtrado
        const filteredCategories = categoriesList.filter(
          (c) => (filteredMenuData[c.id] || []).length > 0
        );
        setMenuData(filteredMenuData);
        setCategories(filteredCategories);
        // Ajustar categoría activa si no existe
        const firstCat = filteredCategories[0]?.id;
        setActiveCategory((prev) =>
          !filteredMenuData[prev] && firstCat ? firstCat : prev
        );
      } catch (err) {
        console.error("Error cargando productos del backend", err);
        setLoadError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [menuType, activeCategory]);

  const registerIncomingOrder = (orderData) => {
    // Simular registro en el sistema (en una app real esto iría a la base de datos)
    const registeredOrder = {
      id: Date.now(),
      ...orderData,
      status: "pending",
      registeredAt: new Date().toISOString(),
    };

    // Guardar en localStorage para simular persistencia
    const existingOrders = JSON.parse(
      localStorage.getItem("restaurant_orders") || "[]"
    );
    existingOrders.push(registeredOrder);
    localStorage.setItem("restaurant_orders", JSON.stringify(existingOrders));

    // Marcar el pedido como procesado en WhatsApp
    if (orderData.id) {
      whatsappService.markOrderAsProcessed(orderData.id);
    }

    alert(
      `✅ Pedido registrado exitosamente en el sistema!\n\nID: ${registeredOrder.id}\nCliente: ${orderData.customerName}\nEstado: Pendiente\n\nEl pedido aparecerá en el módulo de cocina.`
    );
  };

  // Se elimina loadMenuData basado en datos locales y promociones simuladas

  // Escuchar cambios en el localStorage para actualizar en tiempo real
  // El menú ahora se obtiene del backend; no es necesario escuchar cambios de localStorage

  const handleSelectItem = (itemWithDetails) => {
    setOrder((prevOrder) => {
      // Si el item ya existe con los mismos comentarios, aumentar cantidad
      const existingItem = prevOrder.find(
        (orderItem) =>
          orderItem.id === itemWithDetails.id &&
          orderItem.comments === itemWithDetails.comments
      );

      if (existingItem) {
        return prevOrder.map((orderItem) =>
          orderItem.id === itemWithDetails.id &&
          orderItem.comments === itemWithDetails.comments
            ? {
                ...orderItem,
                quantity: orderItem.quantity + itemWithDetails.quantity,
              }
            : orderItem
        );
      } else {
        // Crear un ID único para items con diferentes comentarios
        const uniqueId = `${itemWithDetails.id}-${Date.now()}`;
        return [
          ...prevOrder,
          {
            ...itemWithDetails,
            uniqueId,
            quantity: itemWithDetails.quantity || 1,
          },
        ];
      }
    });
  };

  const handleClearOrder = () => {
    setOrder([]);
  };

  const handleCheckout = () => {
    if (order.length > 0) {
      setShowOrderSummary(false); // Cerrar el modal del pedido
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCheckoutConfirm = (checkoutData) => {
    if (menuType === "digital") {
      // Flujo para menú digital: enviar a WhatsApp
      const result = whatsappService.processDigitalOrder(
        {
          ...checkoutData,
          order: order,
        },
        checkoutData.phoneNumber
      );

      if (result.success) {
        const message =
          `¡Pedido enviado a WhatsApp!\n\n` +
          `El restaurante recibirá tu pedido y se pondrá en contacto contigo para confirmar.\n\n` +
          `Cliente: ${checkoutData.customerName}\n` +
          `Tipo: ${
            checkoutData.orderType === "takeout"
              ? "Para Llevar"
              : "Comer Restaurante"
          }\n` +
          `${
            checkoutData.orderType === "takeout"
              ? "Recoger en mostrador"
              : `Mesa: ${checkoutData.tableNumber}`
          }\n\n` +
          `Total: ₡${order
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)}`;

        alert(message);
      } else {
        alert("Error al enviar el pedido. Por favor intenta nuevamente.");
      }
    } else {
      // Flujo para menú interno: procesar directamente
      const orderSummary = order
        .map((item) => {
          let summary = `${item.name} x${item.quantity}`;
          if (item.comments && item.comments.trim()) {
            summary += ` - ${item.comments}`;
          }
          return summary;
        })
        .join("\n");

      const orderTypeText =
        checkoutData.orderType === "takeout"
          ? "Para Llevar"
          : "Comer Restaurante";
      const locationInfo =
        checkoutData.orderType === "takeout"
          ? "Recoger en mostrador"
          : `Mesa: ${checkoutData.tableNumber}`;

      const message = `¡Pedido confirmado!\n\nCliente: ${checkoutData.customerName}\nTipo: ${orderTypeText}\n${locationInfo}\n\nResumen:\n${orderSummary}\n\nPronto estará listo.`;
      alert(message);
    }

    // Cerrar el modal y limpiar el pedido
    setIsCheckoutModalOpen(false);
    setOrder([]);
  };

  const handleCheckoutCancel = () => {
    setIsCheckoutModalOpen(false);
  };

  const handleRemoveItem = (itemId) => {
    setOrder((prevOrder) => prevOrder.filter((item) => item.id !== itemId));
  };

  const handleUpdateComments = (itemId, comments) => {
    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.id === itemId ? { ...item, comments } : item
      )
    );
  };

  const handleAdminLogin = () => {
    setIsAdminLoginOpen(false);
    if (onAdminAccess) {
      onAdminAccess();
    }
  };

  const handleWaiterCall = (callData) => {
    // En un caso real, esto enviaría la notificación al sistema de cocina/administración
    const message =
      `🔔 LLAMADA DE MESERO\n\n` +
      `📍 Mesa: ${callData.tableNumber}\n` +
      `📋 Motivo: ${callData.reasonLabel}\n` +
      `🕐 Hora: ${callData.timestamp}\n` +
      (callData.message ? `💬 Mensaje: ${callData.message}\n` : "") +
      `\n✅ Notificación enviada a cocina.\nEl mesero se dirigirá a tu mesa pronto.`;

    alert(message);
    console.log("Llamada de mesero enviada:", callData);
  };

  const handleCustomerRegistrationSuccess = (customer) => {
    console.log("Cliente registrado exitosamente:", customer);
    // Aquí podrías agregar lógica adicional como mostrar el ID del cliente en la interfaz
  };

  const handleOrderValidationConfirm = async (orderData) => {
    try {
      await registerIncomingOrder(orderData);
      setIsOrderValidationOpen(false);
      setValidationOrderData(null);
    } catch (error) {
      console.error("Error registering order:", error);
      alert("Error al registrar el pedido. Por favor intenta nuevamente.");
    }
  };

  const handleOrderValidationCancel = () => {
    setIsOrderValidationOpen(false);
    setValidationOrderData(null);
  };

  // TEMPORAL: Función para resetear datos y forzar recarga de platos del día
  const resetData = () => {
    localStorage.removeItem("restaurantMenuData");
    localStorage.removeItem("restaurant_custom_images"); // También limpiar imágenes si es necesario
    console.log(
      "🔄 localStorage limpiado - forzando recarga de datos del JSON"
    );
    alert(
      "Datos reseteados. La página se recargará para mostrar los platos del día."
    );
    window.location.reload();
  };

  // Si no hay datos del menú todavía, mostrar loading o error
  if (loading) {
    return (
      <div className="menu-container">
        <div className="menu-header">
          <h1 className="menu-title">🍽️ Cargando Menú...</h1>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="menu-container">
        <div className="menu-header">
          <h1 className="menu-title">⚠️ Error</h1>
          <p className="menu-subtitle">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Botón de registro de clientes - disponible en ambos tipos de menú */}
      <button
        className="customer-registration-btn"
        onClick={() => setIsCustomerRegistrationOpen(true)}
        title="Programa de Fidelización"
      >
        🎯 Únete
      </button>

      {/* Botón de consultar puntos - disponible en ambos tipos de menú */}
      <button
        className="customer-points-btn"
        onClick={() => setIsCustomerPointsOpen(true)}
        title="Consultar mis puntos"
      >
        🏆 Mis Puntos
      </button>

      {/* Botón discreto de administración - solo en menú interno */}
      {menuType === "internal" && (
        <button
          className="admin-access-btn"
          onClick={() => setIsAdminLoginOpen(true)}
          title="Acceso Administrativo"
        >
          ⚙️
        </button>
      )}

      <div className="menu-header">
        <h1 className="menu-title">
          🍽️ Nuestro Menú
          {menuType === "digital" && (
            <span className="menu-type-badge digital">📱 Digital</span>
          )}
          {menuType === "internal" && (
            <span className="menu-type-badge internal">🏪 Interno</span>
          )}
        </h1>
        <p className="menu-subtitle">
          {menuType === "digital"
            ? "Ordena desde tu mesa y envía tu pedido por WhatsApp"
            : "Descubre los sabores que te harán volver por más"}
        </p>

        {/* TEMPORAL: Botón de reset - solo en menú interno */}
        {menuType === "internal" && (
          <button
            onClick={resetData}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "5px 10px",
              fontSize: "12px",
              backgroundColor: "#ff6b6b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Reset
          </button>
        )}

        {/* Botón Llamar Mesero - solo en menú interno */}
        {menuType === "internal" && (
          <button
            className="call-waiter-btn"
            onClick={() => setIsWaiterCallOpen(true)}
            title="Solicitar atención del mesero"
          >
            🔔 Llamar Mesero
          </button>
        )}
      </div>

      <div className="categories-container">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${
              activeCategory === category.id ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div
        className={`menu-grid ${
          activeCategory === "platos-del-dia" ? "daily-specials-grid" : ""
        } ${activeCategory === "promociones" ? "promotions-grid" : ""}`}
      >
        {menuData[activeCategory] &&
          menuData[activeCategory].map((item) => (
            <MenuItem
              key={item.id}
              item={{
                ...item,
                image: getProductImage(item),
              }}
              onSelect={handleSelectItem}
            />
          ))}
      </div>

      {/* Botón flotante para mostrar pedido */}
      {order.length > 0 && (
        <button
          className="floating-order-btn"
          onClick={() => setShowOrderSummary(true)}
          title="Ver mi pedido"
        >
          🛒 {order.reduce((sum, item) => sum + item.quantity, 0)}
        </button>
      )}

      {/* Order Summary Modal */}
      {showOrderSummary && (
        <div
          className="order-summary-overlay"
          onClick={() => setShowOrderSummary(false)}
        >
          <div
            className="order-summary-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-order-summary"
              onClick={() => setShowOrderSummary(false)}
            >
              ✕
            </button>
            <OrderSummary
              order={order}
              onClearOrder={handleClearOrder}
              onCheckout={handleCheckout}
              onRemoveItem={handleRemoveItem}
              onUpdateComments={handleUpdateComments}
              onOpenCustomerRegistration={() =>
                setIsCustomerRegistrationOpen(true)
              }
              onCloseOrderSummary={() => setShowOrderSummary(false)}
            />
          </div>
        </div>
      )}

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCheckoutCancel}
        onConfirm={handleCheckoutConfirm}
        order={order}
        menuType={menuType}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />

      <WaiterCallModal
        isOpen={isWaiterCallOpen}
        onClose={() => setIsWaiterCallOpen(false)}
        onCallWaiter={handleWaiterCall}
      />

      <CustomerRegistrationModal
        isOpen={isCustomerRegistrationOpen}
        onClose={() => setIsCustomerRegistrationOpen(false)}
        onRegistrationSuccess={handleCustomerRegistrationSuccess}
      />

      <CustomerPointsModal
        isOpen={isCustomerPointsOpen}
        onClose={() => setIsCustomerPointsOpen(false)}
      />

      <OrderValidationModal
        isOpen={isOrderValidationOpen}
        orderData={validationOrderData}
        onConfirm={handleOrderValidationConfirm}
        onCancel={handleOrderValidationCancel}
      />
    </div>
  );
};

export default Menu;
