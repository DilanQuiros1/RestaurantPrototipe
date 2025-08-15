import menuData from '../data/menuData.json';

class MenuService {
  constructor() {
    // Cargar datos desde el JSON y sincronizar con localStorage para persistencia
    console.log(' MenuService: Inicializando con datos del JSON');
    
    // Siempre usar los datos del JSON como fuente principal
    this.data = { ...menuData };
    
    // Sincronizar con localStorage para mantener cambios de administración
    const savedData = this.loadFromLocalStorage();
    if (savedData && this.isValidMenuData(savedData)) {
      // Mantener estructura del JSON pero usar datos guardados si existen
      this.data = {
        ...menuData, // Estructura base del JSON
        ...savedData, // Datos modificados en administración
        categories: menuData.categories, // Siempre usar categorías del JSON
        promotions: savedData.promotions || menuData.promotions // Promociones actualizadas
      };
    }
    
    this.saveToLocalStorage();
    console.log(` MenuService: ${this.data.items.length} productos y ${this.data.promotions.length} promociones cargados`);
  }

  // Cargar datos del localStorage para persistencia en el demo
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('restaurantMenuData');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading menu data from localStorage:', error);
      return null;
    }
  }

  // Guardar datos en localStorage para persistencia en el demo
  saveToLocalStorage() {
    try {
      localStorage.setItem('restaurantMenuData', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving menu data to localStorage:', error);
    }
  }

  // Validar que los datos tienen la estructura correcta
  isValidMenuData(data) {
    return data && 
           Array.isArray(data.items) && 
           Array.isArray(data.categories) && 
           Array.isArray(data.promotions);
  }

  // Obtener todas las categorías
  getCategories() {
    return this.data.categories;
  }

  // Obtener todos los items del menú
  getAllItems() {
    return this.data.items;
  }

  // Obtener items por categoría
  getItemsByCategory(categoryId) {
    return this.data.items.filter(item => 
      item.category === categoryId && item.isVisible
    );
  }

  // Obtener items disponibles por categoría
  getAvailableItemsByCategory(categoryId) {
    return this.data.items.filter(item => 
      item.category === categoryId && item.isVisible && item.isAvailable
    );
  }

  // Obtener un item por ID
  getItemById(id) {
    return this.data.items.find(item => item.id === id);
  }

  // Agregar nuevo item
  addItem(item) {
    const newId = Math.max(...this.data.items.map(i => i.id), 0) + 1;
    const newItem = {
      ...item,
      id: newId,
      isVisible: true,
      isAvailable: true
    };
    
    this.data.items.push(newItem);
    this.saveToLocalStorage();
    return newItem;
  }

  // Actualizar item existente
  updateItem(id, updates) {
    const index = this.data.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.items[index] = { ...this.data.items[index], ...updates };
      this.saveToLocalStorage();
      return this.data.items[index];
    }
    return null;
  }

  // Eliminar item (marcar como no visible)
  deleteItem(id) {
    const index = this.data.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.items[index].isVisible = false;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  // Eliminar item permanentemente (para el demo)
  permanentlyDeleteItem(id) {
    const index = this.data.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.items.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  // Cambiar disponibilidad de un item
  toggleItemAvailability(id) {
    const item = this.getItemById(id);
    if (item) {
      item.isAvailable = !item.isAvailable;
      this.saveToLocalStorage();
      return item;
    }
    return null;
  }

  // Obtener estructura organizada para el menú
  getMenuStructure() {
    const structure = {};
    
    this.data.categories.forEach(category => {
      structure[category.id] = this.getAvailableItemsByCategory(category.id);
    });
    
    return structure;
  }

  // Buscar items por nombre o descripción
  searchItems(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.data.items.filter(item => 
      item.isVisible && 
      item.isAvailable &&
      (item.name.toLowerCase().includes(lowercaseQuery) ||
       item.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Resetear datos al estado original (útil para el demo)
  resetToOriginal() {
    this.data = { ...menuData };
    this.saveToLocalStorage();
    return this.data;
  }

  // Forzar recarga desde JSON (útil para desarrollo y debug)
  forceReloadFromJSON() {
    console.log('🔄 Forzando recarga desde menuData.json');
    this.data = { ...menuData };
    this.saveToLocalStorage();
    console.log(`✅ Datos recargados: ${this.data.items.length} productos, ${this.data.promotions.length} promociones`);
    return this.data;
  }

  // Exportar datos actuales (para backup)
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Importar datos (para restaurar backup)
  importData(jsonData) {
    try {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.data = parsedData;
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // === MÉTODOS PARA PROMOCIONES ===

  // Obtener todas las promociones
  getPromotions() {
    return this.data.promotions || [];
  }

  // Obtener promociones activas
  getActivePromotions() {
    const now = new Date();
    return this.getPromotions().filter(promo => 
      promo.isActive &&
      new Date(promo.startDate) <= now &&
      new Date(promo.endDate) >= now
    );
  }

  // Obtener productos con promociones activas
  getPromotedItems() {
    const activePromotions = this.getActivePromotions();
    const allItems = this.getAllItems();

    return activePromotions
      .map(promo => {
        const item = allItems.find(item => item.id === promo.menuItemId);
        return item ? { ...item, promotion: promo } : null;
      })
      .filter(item => item !== null)
      .sort((a, b) => a.promotion.priority - b.promotion.priority);
  }

  // Obtener IDs de productos promocionados
  getPromotedItemIds() {
    const activePromotions = this.getActivePromotions();
    return activePromotions.map(promo => promo.menuItemId);
  }

  // Filtrar productos promocionados de una lista
  filterPromotedItems(items) {
    const promotedIds = this.getPromotedItemIds();
    return items.filter(item => !promotedIds.includes(item.id));
  }

  // Obtener estructura del menú con categoría de promociones
  getMenuStructureWithPromotions() {
    const structure = this.getMenuStructure();
    const promotedItems = this.getPromotedItems();
    
    // Agregar categoría de promociones si hay items promocionados
    if (promotedItems.length > 0) {
      structure.promociones = promotedItems;
    }

    // Filtrar productos promocionados de otras categorías
    Object.keys(structure).forEach(categoryKey => {
      if (categoryKey !== 'promociones') {
        structure[categoryKey] = this.filterPromotedItems(structure[categoryKey] || []);
      }
    });

    return structure;
  }

  // Obtener categorías con promociones incluidas
  getCategoriesWithPromotions() {
    // Filtrar la categoría promociones del JSON para evitar duplicados
    const categories = this.getCategories().filter(cat => cat.id !== 'promociones');
    const promotedItems = this.getPromotedItems();
    
    // Agregar categoría de promociones si hay items promocionados
    if (promotedItems.length > 0) {
      const promotionsCategory = { id: 'promociones', name: '🎉 Promociones', icon: '🎉' };
      return [promotionsCategory, ...categories];
    }

    return categories;
  }

  // === MÉTODOS CRUD PARA PROMOCIONES ===

  // Agregar nueva promoción
  addPromotion(promotionData) {
    const newPromotion = {
      ...promotionData,
      id: Math.max(...this.data.promotions.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    this.data.promotions.push(newPromotion);
    this.saveToLocalStorage();
    return newPromotion;
  }

  // Actualizar promoción existente
  updatePromotion(id, promotionData) {
    const index = this.data.promotions.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.promotions[index] = {
        ...this.data.promotions[index],
        ...promotionData,
        id: id // Mantener el ID original
      };
      this.saveToLocalStorage();
      return this.data.promotions[index];
    }
    return null;
  }

  // Eliminar promoción
  deletePromotion(id) {
    const index = this.data.promotions.findIndex(p => p.id === id);
    if (index !== -1) {
      const deletedPromotion = this.data.promotions.splice(index, 1)[0];
      this.saveToLocalStorage();
      return deletedPromotion;
    }
    return null;
  }

  // Alternar estado activo de una promoción
  togglePromotionStatus(id) {
    const promotion = this.data.promotions.find(p => p.id === id);
    if (promotion) {
      promotion.isActive = !promotion.isActive;
      this.saveToLocalStorage();
      return promotion;
    }
    return null;
  }
}

// Crear una instancia singleton para usar en toda la aplicación
const menuService = new MenuService();

export default menuService;