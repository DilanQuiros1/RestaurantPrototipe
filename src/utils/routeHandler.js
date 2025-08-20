// Utilidad para manejar rutas sin dependencias externas
class RouteHandler {
  // Detectar el tipo de menú basado en la URL actual
  static getMenuTypeFromURL() {
    const path = window.location.pathname;
    
    if (path.includes('/solrestaurante/internal')) {
      return 'internal';
    } else if (path.includes('/solrestaurante/digital')) {
      return 'digital';
    }
    
    // Por defecto, usar interno
    return 'internal';
  }

  // Navegar a una ruta específica
  static navigateTo(path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  // Configurar listener para cambios de URL
  static setupRouteListener(callback) {
    const handleRouteChange = () => {
      const menuType = this.getMenuTypeFromURL();
      callback(menuType);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }

  // Generar URLs para los diferentes tipos de menú
  static getMenuURL(type) {
    const baseURL = window.location.origin;
    switch (type) {
      case 'internal':
        return `${baseURL}/solrestaurante/internal`;
      case 'digital':
        return `${baseURL}/solrestaurante/digital`;
      default:
        return `${baseURL}/solrestaurante/internal`;
    }
  }
}

export default RouteHandler;
