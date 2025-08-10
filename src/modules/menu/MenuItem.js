import React, { useState } from 'react';
import Button from '../../components/common/Button';
import CommentModal from './CommentModal';

const MenuItem = ({ item, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectClick = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = (itemWithComments) => {
    onSelect(itemWithComments);
  };

  return (
    <>
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
          <div className="menu-item-price">${item.price}</div>
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

