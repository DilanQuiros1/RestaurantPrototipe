// Configuración de imágenes del menú
export const menuImages = {
  // Comidas Rápidas
  'hamburguesa-clasica': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'nachos-supremos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
  'pizza-margherita': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
  'hot-dog-gourmet': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  
  // Platos Fuertes
  'filete-de-res': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
  'pollo-a-la-plancha': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
  'pasta-carbonara': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
  'salmon-asado': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
  
  // Bebidas
  'limonada-natural': 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
  'smoothie-de-frutas': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop',
  'cafe-americano': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
  'café-americano': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
  'te-helado': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
  'té-helado': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
  
  // Platos adicionales
  'hamburguesa-clásica': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'nachos-supremos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
  'salmón-asado': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop'
};

// Función para obtener la imagen por nombre del plato
export const getImageByDishName = (dishName) => {
  const normalizedName = dishName.toLowerCase().replace(/\s+/g, '-');
  return menuImages[normalizedName] || 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Imagen+No+Disponible';
};
