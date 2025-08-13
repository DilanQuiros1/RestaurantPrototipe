import React, { useState } from 'react';
import { Menu } from './modules/menu';
import { Kitchen } from './modules/kitchen';
import { Administration } from './modules/administration';
import './App.css';

function App() {
  // Estado para manejar la vista actual
  const [currentView, setCurrentView] = useState('menu');

  // Funciones para navegación discreta (mantener compatibilidad con sistema anterior)
  const handleAdminAccess = () => {
    setCurrentView('admin');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  // Función para renderizar el componente actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'menu':
        return <Menu onAdminAccess={handleAdminAccess} />;
      case 'kitchen':
        return <Kitchen />;
      case 'administration':
      case 'admin': // Mantener compatibilidad con sistema discreto
        return <Administration />;
      default:
        return <Menu onAdminAccess={handleAdminAccess} />;
    }
  };

  return (
    <div className="App">
      {/* Navegación principal entre módulos - solo visible cuando no está en vista de menú */}
      {currentView !== 'menu' && (
        <nav className="app-navigation">
          <div className="nav-brand">
            <h1>🍽️ RestaurantApp</h1>
          </div>
          
          <div className="nav-buttons">
            <button 
              className={`nav-button ${currentView === 'menu' ? 'active' : ''}`}
              onClick={() => setCurrentView('menu')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">Menú Cliente</span>
            </button>
            
            <button 
              className={`nav-button ${currentView === 'kitchen' ? 'active' : ''}`}
              onClick={() => setCurrentView('kitchen')}
            >
              <span className="nav-icon">🍳</span>
              <span className="nav-label">Cocina</span>
            </button>
            
            <button 
              className={`nav-button ${(currentView === 'administration' || currentView === 'admin') ? 'active' : ''}`}
              onClick={() => setCurrentView('administration')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Administración</span>
            </button>
          </div>
        </nav>
      )}

      {/* Contenido principal */}
      <main className="app-content">
        {/* Vista de administración con botón de regreso discreto */}
        {(currentView === 'admin' || currentView === 'administration') && (
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
        
        {/* Otras vistas */}
        {currentView !== 'admin' && currentView !== 'administration' && renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
