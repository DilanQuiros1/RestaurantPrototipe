import React, { useState, useRef } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ currentImage, onImageChange, onImageRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  // Manejar drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Manejar drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Procesar archivo
  const handleFile = (file) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. El tamaño máximo es 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setPreview(imageUrl);
      onImageChange(imageUrl, file);
    };
    reader.readAsDataURL(file);
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Remover imagen
  const removeImage = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-image' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!preview ? openFileSelector : undefined}
      >
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-img" />
            <div className="image-overlay">
              <button
                type="button"
                className="change-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileSelector();
                }}
              >
                📷 Cambiar
              </button>
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
              >
                🗑️ Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <div className="upload-text">
              <p><strong>Arrastra una imagen aquí</strong></p>
              <p>o haz clic para seleccionar</p>
            </div>
            <div className="upload-info">
              <small>Formatos: JPG, PNG, GIF • Máximo 5MB</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
