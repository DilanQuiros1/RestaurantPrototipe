import React, { useState } from 'react';
import Button from '../../components/common/Button';
import CommentModal from './CommentModal';

const MenuItem = ({ item, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar si el item tiene promoción (viene del menuService)
  const hasPromotion = item.promotion && item.promotion.isActive;
  const activePromotion = item.promotion;

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
      <div className={`menu-item ${hasPromotion ? 'has-promotion premium-promotion' : ''}`}>
        {hasPromotion ? (
          // Diseño especial para productos promocionados
          <>
            {/* Header de promoción con efectos visuales
            <div className="promotion-header">
              <div className="promotion-glow"></div>
              <div className="promotion-ribbon">
                <div className="ribbon-content">
                  {activePromotion.isDailySpecial && (
                    <div className="daily-special-badge">
                      <span className="star-icon">⭐</span>
                      <span>PLATO DEL DÍA</span>
                      <span className="star-icon">⭐</span>
                    </div>
                  )}
                  <div className="discount-badge">
                    <div className="discount-value">
                      {activePromotion.discountType === 'percentage' 
                        ? `${activePromotion.discountValue}%` 
                        : `$${activePromotion.discountValue.toFixed(2)}`}
                    </div>
                    <div className="discount-text">DESCUENTO</div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Imagen con overlay de promoción */}
            <div className="promotion-image-container">
              <img 
                src={item.image} 
                alt={item.name} 
                className="menu-item-image promotion-image"
                onError={(e) => {
                  console.error(`Error loading image for ${item.name}:`, e.target.src);
                  e.target.src = 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Imagen+No+Disponible';
                }}
                onLoad={() => {
                  console.log(`Image loaded successfully for ${item.name}`);
                }}
              />
              <div className="promotion-overlay">
                <div className="promotion-flash">¡OFERTA ESPECIAL!</div>
              </div>
            </div>
            
            {/* Contenido premium para promociones */}
            <div className="menu-item-content promotion-content">
              <div className="promotion-title-section">
                <h3 className="menu-item-name promotion-name">{item.name}</h3>
                <div className="promotion-tag">
                  <span className="fire-icon">🔥</span>
                  <span>{activePromotion.name}</span>
                </div>
              </div>
              
              <p className="menu-item-description promotion-description">{item.description}</p>
              
              {/* Sección de precios premium */}
              <div className="promotion-pricing-section">
                <div className="pricing-container">
                  <div className="price-comparison">
                    <div className="original-price-section">
                      <span className="price-label">Precio regular:</span>
                      <span className="original-price">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="discounted-price-section">
                      <span className="price-label">¡Tu precio especial!</span>
                      <span className="discounted-price">
                        ${calculateDiscountedPrice(item.price, activePromotion).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="savings-highlight">
                    <div className="savings-badge">
                      <span className="savings-icon">💰</span>
                      <span className="savings-text">
                        ¡AHORRAS ${(item.price - calculateDiscountedPrice(item.price, activePromotion)).toFixed(2)}!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción de la promoción con estilo */}
              <div className="promotion-details">
                <div className="promotion-description-card">
                  <span className="promotion-icon">🎉</span>
                  <span className="promotion-text">{activePromotion.description}</span>
                </div>
              </div>
              
              {/* Botón de acción premium */}
              <div className="promotion-action">
                <Button 
                  variant="select" 
                  onClick={handleSelectClick}
                  className="promotion-button"
                >
                  <span className="button-icon">⚡</span>
                  <span>¡APROVECHAR OFERTA!</span>
                  <span className="button-icon">⚡</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Diseño normal para productos sin promoción
          <>
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
              <div className="menu-item-pricing">
                <div className="menu-item-price">${item.price.toFixed(2)}</div>
              </div>
              
              <Button 
                variant="select" 
                onClick={handleSelectClick}
              >
                Seleccionar
              </Button>
            </div>
          </>
        )}
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

