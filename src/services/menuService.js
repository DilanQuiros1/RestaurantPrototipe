import menuData from '../data/menuData.json';

class MenuService {
  constructor() {
    // En un demo, trabajamos con los datos en memoria
    // En producción, esto sería una API real
    this.data = this.loadFromLocalStorage() || { ...menuData };
    this.saveToLocalStorage();
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
}

// Crear una instancia singleton para usar en toda la aplicación
const menuService = new MenuService();

export default menuService;