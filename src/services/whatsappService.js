// Servicio para manejar la integración con WhatsApp y generación de URLs
class WhatsAppService {
  // Generar ID único para el pedido
  static generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  // Guardar pedido en localStorage con ID único
  static saveOrderForWhatsApp(orderData) {
    const orderId = this.generateOrderId();
    const orderParams = {
      id: orderId,
      customerName: orderData.customerName,
      orderType: orderData.orderType,
      tableNumber: orderData.tableNumber,
      items: orderData.order.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        comments: item.comments || ''
      })),
      total: orderData.order.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      status: 'pending_validation',
      source: 'whatsapp'
    };

    // Guardar en localStorage
    const existingOrders = JSON.parse(localStorage.getItem('whatsapp_pending_orders') || '[]');
    existingOrders.push(orderParams);
    localStorage.setItem('whatsapp_pending_orders', JSON.stringify(existingOrders));
    
    return orderId;
  }

  // Generar URL con ID del pedido
  static generateOrderURL(orderId) {
    const baseURL = 'https://restaurant-prototipe.vercel.app';
    return `${baseURL}?orderId=${orderId}`;
  }

  // Generar mensaje de WhatsApp con detalles del pedido
  static generateWhatsAppMessage(orderData, orderId) {
    const orderTypeText = orderData.orderType === 'takeout' ? 'Para Llevar' : 'Comer Restaurante';
    const locationInfo = orderData.orderType === 'takeout' 
      ? 'Recoger en mostrador' 
      : 'Reservar mesa al llegar';

    const total = orderData.order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const itemsList = orderData.order.map(item => {
      let itemText = `• ${item.name} x${item.quantity} - ₡${(item.price * item.quantity).toFixed(2)}`;
      if (item.comments && item.comments.trim()) {
        itemText += `\n  💬 ${item.comments}`;
      }
      return itemText;
    }).join('\n');

    const message = `🍽️ *NUEVO PEDIDO - SOL RESTAURANTE*\n\n` +
      `👤 *Cliente:* ${orderData.customerName}\n` +
      `📋 *Tipo:* ${orderTypeText}\n` +
      `📍 *Ubicación:* ${locationInfo}\n` +
      `🕐 *Hora:* ${new Date().toLocaleString('es-CR')}\n\n` +
      `*DETALLE DEL PEDIDO:*\n${itemsList}\n\n` +
      `💰 *TOTAL: ₡${total.toFixed(2)}*\n\n` +
      `🔢 *NÚMERO DE PEDIDO:* \`${orderId}\`\n\n` +
      `_Para registrar este pedido en el sistema, ingrese el número de pedido en el módulo de administración del restaurante._`;

    return message;
  }

  // Enviar mensaje a WhatsApp (abrir WhatsApp Web)
  static sendToWhatsApp(phoneNumber, message) {
    // Limpiar y formatear el número de teléfono
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remover todo excepto dígitos
    
    // Agregar código de país si no lo tiene (Costa Rica +506)
    const formattedPhone = cleanPhoneNumber.startsWith('506') ? cleanPhoneNumber : `506${cleanPhoneNumber}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log('WhatsApp URL generada:', whatsappURL);
    console.log('Número original:', phoneNumber);
    console.log('Número formateado:', formattedPhone);
    
    window.open(whatsappURL, '_blank');
  }

  // Función principal para procesar pedido digital y enviar por WhatsApp
  static processDigitalOrder(orderData, phoneNumber) {
    try {
      // Guardar pedido y obtener ID
      const orderId = this.saveOrderForWhatsApp(orderData);
      
      // Generar mensaje de WhatsApp con solo el número de pedido
      const message = this.generateWhatsAppMessage(orderData, orderId);
      
      // Enviar a WhatsApp
      this.sendToWhatsApp(phoneNumber, message);
      
      return {
        success: true,
        orderId: orderId,
        message: 'Pedido enviado a WhatsApp exitosamente'
      };
    } catch (error) {
      console.error('Error procesando pedido digital:', error);
      return {
        success: false,
        error: 'Error al procesar el pedido'
      };
    }
  }

  // Obtener pedido por ID desde localStorage
  static getOrderById(orderId) {
    try {
      const pendingOrders = JSON.parse(localStorage.getItem('whatsapp_pending_orders') || '[]');
      const order = pendingOrders.find(o => o.id === orderId);
      
      if (!order) {
        return { success: false, error: 'Pedido no encontrado o ya procesado' };
      }
      
      return { success: true, data: order };
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Procesar pedido desde URL (cuando se abre desde WhatsApp)
  static processOrderFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      
      if (!orderId) {
        return { success: false, error: 'No order ID found in URL' };
      }
      
      // Obtener datos del pedido por ID
      return this.getOrderById(orderId);
    } catch (error) {
      console.error('Error processing order from URL:', error);
      return { success: false, error: error.message };
    }
  }

  // Marcar pedido como procesado (remover de pendientes)
  static markOrderAsProcessed(orderId) {
    try {
      const pendingOrders = JSON.parse(localStorage.getItem('whatsapp_pending_orders') || '[]');
      const filteredOrders = pendingOrders.filter(o => o.id !== orderId);
      localStorage.setItem('whatsapp_pending_orders', JSON.stringify(filteredOrders));
      
      return { success: true };
    } catch (error) {
      console.error('Error marking order as processed:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todos los pedidos pendientes de WhatsApp
  static getPendingWhatsAppOrders() {
    try {
      const pendingOrders = JSON.parse(localStorage.getItem('whatsapp_pending_orders') || '[]');
      return { success: true, orders: pendingOrders };
    } catch (error) {
      console.error('Error getting pending orders:', error);
      return { success: false, error: error.message };
    }
  }
}

export default WhatsAppService;
