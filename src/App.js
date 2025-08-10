import React, { useState } from 'react';
import { Menu } from './modules/menu';
import { Kitchen } from './modules/kitchen';
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
      default:
        return <Menu />;
    }
  };

  return (
    <div className="App">
      {/* Navegación simple entre módulos */}
      <nav className="app-navigation">
        <button 
          className={`nav-button ${currentView === 'menu' ? 'active' : ''}`}
          onClick={() => setCurrentView('menu')}
        >
          🍽️ Menú Cliente
        </button>
        <button 
          className={`nav-button ${currentView === 'kitchen' ? 'active' : ''}`}
          onClick={() => setCurrentView('kitchen')}
        >
          🍳 Cocina
        </button>
      </nav>

      {/* Contenido principal */}
      <main className="app-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
