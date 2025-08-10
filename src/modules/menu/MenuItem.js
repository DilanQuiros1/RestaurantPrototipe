import React from 'react';
import Button from '../../components/common/Button';

const MenuItem = ({ item, onSelect }) => {
  return (
    <div className="menu-item">
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
        <div className="menu-item-price">{item.price}</div>
        <Button 
          variant="select" 
          onClick={() => onSelect(item)}
        >
          Seleccionar
        </Button>
      </div>
    </div>
  );
};

export default MenuItem;

