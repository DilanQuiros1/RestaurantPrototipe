import React, { useState } from 'react';
import { Menu } from './modules/menu';
import { Kitchen } from './modules/kitchen';
import { Administration } from './modules/administration';
import './App.css';

function App() {
  // Estado para manejar la vista actual
  const [currentView, setCurrentView] = useState('menu');

  // Función para renderizar el componente actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'menu':
        return <Menu />;
      case 'kitchen':
        return <Kitchen />;
      case 'administration':
        return <Administration />;
      default:
        return <Menu />;
    }
  };

  return (
    <div className="App">
      {/* Navegación principal entre módulos */}
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
            className={`nav-button ${currentView === 'administration' ? 'active' : ''}`}
            onClick={() => setCurrentView('administration')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Administración</span>
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="app-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
