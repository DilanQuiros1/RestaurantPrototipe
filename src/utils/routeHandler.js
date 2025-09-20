// Utilidad para manejar rutas sin dependencias externas
class RouteHandler {
  // Detectar el tipo de menú basado en la URL actual
  static getMenuTypeFromURL() {
    const path = window.location.pathname;

    if (path.includes("/solrestaurante/internal")) {
      return "internal";
    } else if (path.includes("/solrestaurante/digital")) {
      return "digital";
    }

    // Por defecto, usar interno
    return "internal";
  }

  // Navegar a una ruta específica
  static navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Configurar listener para cambios de URL
  static setupRouteListener(callback) {
    const handleRouteChange = () => {
      const menuType = this.getMenuTypeFromURL();
      callback(menuType);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }

  // Generar URLs para los diferentes tipos de menú
  static getMenuURL(type) {
    const baseURL = window.location.origin;
    switch (type) {
      case "internal":
        return `${baseURL}/solrestaurante/internal`;
      case "digital":
        return `${baseURL}/solrestaurante/digital`;
      default:
        return `${baseURL}/solrestaurante/internal`;
    }
  }

  // ======== id_negocio helpers ========
  static getBusinessIdFromURL() {
    try {
      const url = new URL(window.location.href);
      const id = url.searchParams.get("id_negocio");
      return id ? Number(id) : null;
    } catch {
      return null;
    }
  }

  static setBusinessIdInURL(idNegocio, preservePath = true) {
    try {
      const url = new URL(window.location.href);
      if (!preservePath) {
        // default to internal menu base when not preserving
        url.pathname = "/solrestaurante/internal";
      }
      url.searchParams.set("id_negocio", String(idNegocio));
      this.navigateTo(url.toString());
    } catch {}
  }

  static removeBusinessIdFromURL() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("id_negocio");
      this.navigateTo(url.toString());
    } catch {}
  }
}

export default RouteHandler;
