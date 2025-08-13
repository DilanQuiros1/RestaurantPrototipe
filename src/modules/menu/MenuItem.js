import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import CommentModal from './CommentModal';

const MenuItem = ({ item, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePromotion, setActivePromotion] = useState(null);

  // Datos de ejemplo de promociones activas (en una app real, esto vendría de un contexto o API)
  const mockPromotions = [
    {
      id: 1,
      name: 'Hamburguesa del Día',
      description: 'Hamburguesa clásica con descuento especial',
      menuItemId: 1,
      discountType: 'percentage',
      discountValue: 20,
      startDate: '2025-01-10',
      endDate: '2025-01-15',
      isActive: true,
      isDailySpecial: true,
      priority: 1
    },
    {
      id: 2,
      name: 'Oferta Filete Premium',
      description: 'Descuento en nuestro mejor filete',
      menuItemId: 3,
      discountType: 'fixed',
      discountValue: 5.00,
      startDate: '2025-01-12',
      endDate: '2025-01-20',
      isActive: true,
      isDailySpecial: false,
      priority: 2
    }
  ];

  useEffect(() => {
    // Buscar promoción activa para este producto
    const promotion = mockPromotions.find(promo => 
      promo.menuItemId === item.id && 
      promo.isActive &&
      new Date(promo.startDate) <= new Date() &&
      new Date(promo.endDate) >= new Date()
    );
    setActivePromotion(promotion);
  }, [item.id]);

  const calculateDiscountedPrice = (originalPrice, promotion) => {
    if (!promotion) return originalPrice;
    
    if (promotion.discountType === 'percentage') {
      return originalPrice * (1 - promotion.discountValue / 100);
    } else {
      return originalPrice - promotion.discountValue;
    }
  };

  const handleSelectClick = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = (itemWithComments) => {
    // Si hay promoción activa, incluir el precio con descuento
    if (activePromotion) {
      const discountedPrice = calculateDiscountedPrice(item.price, activePromotion);
      itemWithComments.originalPrice = item.price;
      itemWithComments.price = discountedPrice;
      itemWithComments.promotion = activePromotion;
    }
    onSelect(itemWithComments);
  };

  return (
    <>
      <div className={`menu-item ${activePromotion ? 'has-promotion' : ''}`}>
        {/* Badges de promoción */}
        {activePromotion && (
          <div className="promotion-badges">
            {activePromotion.isDailySpecial && (
              <div className="promotion-badge daily-special">
                🌟 Plato del Día
              </div>
            )}
            <div className="promotion-badge discount">
              {activePromotion.discountType === 'percentage' 
                ? `${activePromotion.discountValue}% OFF` 
                : `$${activePromotion.discountValue.toFixed(2)} OFF`}
            </div>
          </div>
        )}

        <img 
          src={item.image} 
          alt={item.name} 
          className="menu-item-image"
          onError={(e) => {
            console.error(`Error loading image for ${item.name}:`, e.target.src);
            e.target.src = 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Imagen+No+Disponible';
          }}
          onLoad={() => {
            console.log(`Image loaded successfully for ${item.name}`);
          }}
        />
        
        <div className="menu-item-content">
          <h3 className="menu-item-name">{item.name}</h3>
          <p className="menu-item-description">{item.description}</p>
          
          {/* Mostrar precios con promoción */}
          <div className="menu-item-pricing">
            {activePromotion ? (
              <>
                <div className="original-price">${item.price.toFixed(2)}</div>
                <div className="discounted-price">
                  ${calculateDiscountedPrice(item.price, activePromotion).toFixed(2)}
                </div>
                <div className="savings">
                  ¡Ahorras ${(item.price - calculateDiscountedPrice(item.price, activePromotion)).toFixed(2)}!
                </div>
              </>
            ) : (
              <div className="menu-item-price">${item.price.toFixed(2)}</div>
            )}
          </div>

          {/* Mostrar descripción de la promoción */}
          {activePromotion && (
            <div className="promotion-description">
              <span className="promotion-icon">🎉</span>
              <span className="promotion-text">{activePromotion.name}</span>
            </div>
          )}
          
          <Button 
            variant="select" 
            onClick={handleSelectClick}
          >
            Seleccionar
          </Button>
        </div>
      </div>

      <CommentModal
        isOpen={isModalOpen}
        item={item}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </>
  );
};

export default MenuItem;

