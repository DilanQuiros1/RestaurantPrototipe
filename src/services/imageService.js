// Servicio para gestionar las imágenes personalizadas del restaurante
class ImageService {
  constructor() {
    this.storageKey = 'restaurant_custom_images';
  }

  // Obtener todas las imágenes almacenadas
  getAllImages() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      return {};
    }
  }

  // Guardar imagen personalizada
  saveImage(productId, imageData, fileName = null) {
    try {
      const images = this.getAllImages();
      const timestamp = Date.now();
      const imageId = `${productId}_${timestamp}`;
      
      // Crear objeto de imagen
      const imageInfo = {
        id: imageId,
        productId: productId,
        data: imageData, // Base64 string
        fileName: fileName || `product_${productId}_${timestamp}`,
        createdAt: timestamp,
        lastModified: timestamp
      };

      // Guardar en el storage
      images[imageId] = imageInfo;
      localStorage.setItem(this.storageKey, JSON.stringify(images));
      
      console.log(`Imagen guardada para producto ${productId}:`, imageId);
      return imageId;
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      throw new Error('No se pudo guardar la imagen');
    }
  }

  // Obtener imagen por ID de producto
  getImageByProductId(productId) {
    try {
      const images = this.getAllImages();
      const productImages = Object.values(images).filter(img => img.productId === productId);
      
      // Devolver la más reciente
      if (productImages.length > 0) {
        return productImages.sort((a, b) => b.lastModified - a.lastModified)[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      return null;
    }
  }

  // Eliminar imagen por ID de producto
  removeImageByProductId(productId) {
    try {
      const images = this.getAllImages();
      const imagesToRemove = Object.keys(images).filter(id => 
        images[id].productId === productId
      );

      imagesToRemove.forEach(imageId => {
        delete images[imageId];
        console.log(`Imagen eliminada: ${imageId}`);
      });

      localStorage.setItem(this.storageKey, JSON.stringify(images));
      return imagesToRemove.length;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return 0;
    }
  }

  // Eliminar imagen específica por ID
  removeImageById(imageId) {
    try {
      const images = this.getAllImages();
      if (images[imageId]) {
        delete images[imageId];
        localStorage.setItem(this.storageKey, JSON.stringify(images));
        console.log(`Imagen eliminada: ${imageId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return false;
    }
  }

  // Limpiar imágenes huérfanas (productos que ya no existen)
  cleanOrphanedImages(existingProductIds) {
    try {
      const images = this.getAllImages();
      const orphanedImages = Object.keys(images).filter(id => 
        !existingProductIds.includes(images[id].productId)
      );

      orphanedImages.forEach(imageId => {
        delete images[imageId];
      });

      if (orphanedImages.length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(images));
        console.log(`Eliminadas ${orphanedImages.length} imágenes huérfanas`);
      }

      return orphanedImages.length;
    } catch (error) {
      console.error('Error al limpiar imágenes huérfanas:', error);
      return 0;
    }
  }

  // Obtener estadísticas de almacenamiento
  getStorageStats() {
    try {
      const images = this.getAllImages();
      const imageCount = Object.keys(images).length;
      const storageData = localStorage.getItem(this.storageKey);
      const storageSize = new Blob([storageData]).size;
      
      return {
        imageCount,
        storageSizeBytes: storageSize,
        storageSizeMB: (storageSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { imageCount: 0, storageSizeBytes: 0, storageSizeMB: '0.00' };
    }
  }
}

// Crear instancia singleton
const imageService = new ImageService();
export default imageService;
