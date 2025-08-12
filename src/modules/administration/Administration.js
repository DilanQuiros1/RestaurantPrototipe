import React, { useState } from 'react';
import MenuManagement from './MenuManagement';
import TableManagement from './TableManagement';
import Cashier from '../cashier/Cashier';
import './Administration.css';

const Administration = () => {
  const [activeTab, setActiveTab] = useState('menu');

  const tabs = [
    { id: 'menu', label: 'Gestión de Menú', icon: '🍽️' },
    { id: 'tables', label: 'Gestión de Mesas', icon: '🪑' },
    { id: 'cashier', label: 'Caja', icon: '💳' }
  ];

  return (
    <div className="administration-container">
      <div className="administration-header">
        <h1 className="administration-title">Panel de Administración</h1>
        <p className="administration-subtitle">Gestiona tu restaurante de manera eficiente</p>
      </div>

      <div className="administration-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`administration-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="administration-content">
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'tables' && <TableManagement />}
        {activeTab === 'cashier' && <Cashier />}
      </div>
    </div>
  );
};

export default Administration;
