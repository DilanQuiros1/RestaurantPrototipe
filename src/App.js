import React, { useState } from 'react';
import { Menu } from './modules/menu';
import { Administration } from './modules/administration';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('menu');

  const handleAdminAccess = () => {
    setCurrentView('admin');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  return (
    <div className="App">
      {currentView === 'menu' && (
        <Menu onAdminAccess={handleAdminAccess} />
      )}
      {currentView === 'admin' && (
        <div className="admin-view">
          <button 
            className="back-to-menu-btn"
            onClick={handleBackToMenu}
            title="Volver al Menú"
          >
            ← Volver al Menú
          </button>
          <Administration />
        </div>
      )}
    </div>
  );
}

export default App;
