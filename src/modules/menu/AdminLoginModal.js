import React, { useState } from 'react';
import './AdminLoginModal.css';

const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prototipo: cualquier credencial funciona
    if (username.trim() && password.trim()) {
      onLogin();
      setUsername('');
      setPassword('');
    } else {
      alert('Por favor ingresa usuario y contraseña');
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-modal">
        <div className="admin-login-header">
          <h2>🔐 Acceso Administrativo</h2>
          <button className="admin-login-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
          </div>
          
          <div className="admin-login-field">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>
          
          <div className="admin-login-actions">
            <button type="button" onClick={handleClose} className="admin-btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="admin-btn-login">
              Ingresar
            </button>
          </div>
        </form>
        
        <div className="admin-login-note">
          <small>💡 Prototipo: Cualquier usuario/contraseña funciona</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
