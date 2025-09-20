import React, { useState, useEffect } from "react";
import { Menu } from "./modules/menu";
import { Kitchen } from "./modules/kitchen";
import { Administration } from "./modules/administration";
import { Dashboard } from "./modules/analytics";
import "./App.css";
import Login from "./modules/auth/Login";
import RouteHandler from "./utils/routeHandler";

function App() {
  // Estado para manejar la vista actual
  const [currentView, setCurrentView] = useState("menu");
  const [menuType, setMenuType] = useState("internal"); // 'internal' or 'digital'
  const [businessId, setBusinessId] = useState(null); // id_negocio from URL

  // Funciones para navegación discreta (mantener compatibilidad con sistema anterior)
  const handleAdminAccess = () => {
    setCurrentView("admin");
  };

  const handleBackToMenu = () => {
    setCurrentView("menu");
  };

  // Detectar tipo de menú basado en URL
  useEffect(() => {
    const updateMenuType = () => {
      const path = window.location.pathname;
      if (path.includes("/solrestaurante/internal")) {
        setMenuType("internal");
      } else if (path.includes("/solrestaurante/digital")) {
        setMenuType("digital");
      } else {
        // Por defecto, usar interno
        setMenuType("internal");
      }
    };

    updateMenuType();

    // Detect business id on url
    const updateBusinessId = () => {
      const id = RouteHandler.getBusinessIdFromURL();
      setBusinessId(id);
    };
    updateBusinessId();

    // Escuchar cambios en la URL
    const handlePopState = () => {
      updateMenuType();
      updateBusinessId();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Función para renderizar el componente actual
  const renderCurrentView = () => {
    switch (currentView) {
      case "menu":
        return <Menu onAdminAccess={handleAdminAccess} menuType={menuType} />;
      case "kitchen":
        return <Kitchen />;
      case "administration":
      case "admin": // Mantener compatibilidad con sistema discreto
        return <Administration idNegocio={businessId} />;
      case "analytics":
        return <Dashboard />;
      default:
        return <Menu onAdminAccess={handleAdminAccess} menuType={menuType} />;
    }
  };

  return (
    <div className="App">
      {/* If no business id on URL, show login first */}
      {businessId == null && (
        <Login
          onSuccess={({ id_negocio }) => {
            setBusinessId(id_negocio);
            // keep current path & set id_negocio param
            RouteHandler.setBusinessIdInURL(id_negocio, true);
          }}
        />
      )}
      {businessId != null && (
        <>
          {/* Navegación principal entre módulos - solo visible cuando no está en vista de menú Y es menú interno */}
          {currentView !== "menu" && menuType === "internal" && (
            <nav className="app-navigation">
              {/* <div className="nav-brand">
            <h1>🍽️ RestaurantApp</h1>
          </div> */}

              <div className="nav-buttons">
                <button
                  className={`nav-button ${
                    currentView === "menu" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("menu")}
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-label">Menú Cliente</span>
                </button>

                <button
                  className={`nav-button ${
                    currentView === "kitchen" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("kitchen")}
                >
                  <span className="nav-icon">🍳</span>
                  <span className="nav-label">Cocina</span>
                </button>

                <button
                  className={`nav-button ${
                    currentView === "administration" || currentView === "admin"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setCurrentView("administration")}
                >
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-label">Administración</span>
                </button>

                <button
                  className={`nav-button ${
                    currentView === "analytics" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("analytics")}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-label">Analytics</span>
                </button>
              </div>
            </nav>
          )}

          {/* Contenido principal */}
          <main className="app-content">
            {/* Vista de administración con botón de regreso discreto */}
            {(currentView === "admin" || currentView === "administration") && (
              <div className="admin-view">
                <button
                  className="back-to-menu-btn"
                  onClick={handleBackToMenu}
                  title="Volver al Menú"
                >
                  ← Volver al Menú
                </button>
                <Administration idNegocio={businessId} />
              </div>
            )}

            {/* Vista de analytics */}
            {currentView === "analytics" && <Dashboard />}

            {/* Otras vistas */}
            {currentView !== "admin" &&
              currentView !== "administration" &&
              currentView !== "analytics" &&
              renderCurrentView()}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
