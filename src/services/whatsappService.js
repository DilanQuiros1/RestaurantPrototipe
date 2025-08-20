// Servicio para manejar la integración con WhatsApp y generación de URLs
class WhatsAppService {
  // Generar URL con datos del pedido para registro interno
  static generateOrderURL(orderData) {
    const baseURL = window.location.origin;
    const orderParams = {
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
      timestamp: new Date().toISOString()
    };

    // Codificar los datos del pedido en base64 para la URL
    const encodedData = btoa(JSON.stringify(orderParams));
    return `${baseURL}/solrestaurante/internal?order=${encodedData}`;
  }

  // Generar mensaje de WhatsApp con detalles del pedido
  static generateWhatsAppMessage(orderData, orderURL) {
    const orderTypeText = orderData.orderType === 'takeout' ? 'Para Llevar' : 'Comer Aquí';
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
      `🔗 *Registrar pedido en sistema:*\n${orderURL}\n\n` +
      `_Haga clic en el enlace para registrar automáticamente este pedido en el sistema del restaurante._`;

    return message;
  }

  // Enviar mensaje a WhatsApp (abrir WhatsApp Web)
  static sendToWhatsApp(phoneNumber, message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  }

  // Función principal para procesar pedido digital
  static processDigitalOrder(orderData, restaurantPhone = '50684190735') {
    try {
      const orderURL = this.generateOrderURL(orderData);
      const whatsappMessage = this.generateWhatsAppMessage(orderData, orderURL);
      
      // Enviar a WhatsApp
      this.sendToWhatsApp(restaurantPhone, whatsappMessage);
      
      return {
        orderURL,
        whatsappMessage,
        success: true
      };
    } catch (error) {
      console.error('Error procesando pedido digital:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Procesar datos de pedido desde URL (para menú interno)
  static processOrderFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');
    
    if (orderParam) {
      try {
        const orderData = JSON.parse(atob(orderParam));
        return {
          success: true,
          data: orderData
        };
      } catch (error) {
        console.error('Error al procesar datos del pedido desde URL:', error);
        return {
          success: false,
          error: 'Datos de pedido inválidos'
        };
      }
    }
    
    return {
      success: false,
      error: 'No se encontraron datos de pedido en la URL'
    };
  }
}

export default WhatsAppService;
