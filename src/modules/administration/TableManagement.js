import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import TableModal from './TableModal';
import './TableManagement.css';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  // Estados de mesa
  const tableStates = {
    free: { label: 'Libre', color: '#28a745', icon: '🟢' },
    occupied: { label: 'Ocupada', color: '#dc3545', icon: '🔴' },
    waiting: { label: 'Esperando Pedido', color: '#ffc107', icon: '🟡' },
    reserved: { label: 'Reservada', color: '#6f42c1', icon: '🟣' }
  };

  // Datos de ejemplo - en un caso real vendrían de una API
  useEffect(() => {
    const initialTables = [
      { id: 1, number: 1, capacity: 4, state: 'free', position: { x: 0, y: 0 } },
      { id: 2, number: 2, capacity: 2, state: 'occupied', position: { x: 1, y: 0 } },
      { id: 3, number: 3, capacity: 6, state: 'waiting', position: { x: 2, y: 0 } },
      { id: 4, number: 4, capacity: 4, state: 'free', position: { x: 0, y: 1 } },
      { id: 5, number: 5, capacity: 8, state: 'reserved', position: { x: 1, y: 1 } },
      { id: 6, number: 6, capacity: 2, state: 'free', position: { x: 2, y: 1 } },
      { id: 7, number: 7, capacity: 4, state: 'free', position: { x: 0, y: 2 } },
      { id: 8, number: 8, capacity: 6, state: 'free', position: { x: 1, y: 2 } }
    ];
    setTables(initialTables);
  }, []);

  const handleAddTable = () => {
    setEditingTable(null);
    setIsModalOpen(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleDeleteTable = (tableId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
      setTables(tables.filter(t => t.id !== tableId));
    }
  };

  const handleSaveTable = (tableData) => {
    if (editingTable) {
      // Editar mesa existente
      setTables(tables.map(t => 
        t.id === editingTable.id ? { ...tableData, id: editingTable.id } : t
      ));
    } else {
      // Agregar nueva mesa
      const newTable = {
        ...tableData,
        id: Date.now(),
        state: 'free',
        position: { x: 0, y: 0 }
      };
      setTables([...tables, newTable]);
    }
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleStateChange = (tableId, newState) => {
    setTables(tables.map(t => 
      t.id === tableId ? { ...t, state: newState } : t
    ));
  };

  const handleTableMove = (tableId, direction) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        const newPosition = { ...t.position };
        switch (direction) {
          case 'up':
            newPosition.y = Math.max(0, newPosition.y - 1);
            break;
          case 'down':
            newPosition.y = Math.min(4, newPosition.y + 1);
            break;
          case 'left':
            newPosition.x = Math.max(0, newPosition.x - 1);
            break;
          case 'right':
            newPosition.x = Math.min(4, newPosition.x + 1);
            break;
          default:
            break;
        }
        return { ...t, position: newPosition };
      }
      return t;
    }));
  };

  const getTableAtPosition = (x, y) => {
    return tables.find(t => t.position.x === x && t.position.y === y);
  };

  const renderTableGrid = () => {
    const grid = [];
    for (let y = 0; y < 5; y++) {
      const row = [];
      for (let x = 0; x < 5; x++) {
        const table = getTableAtPosition(x, y);
        row.push(
          <div key={`${x}-${y}`} className="grid-cell">
            {table ? (
              <div
                className={`table-item ${table.state} ${selectedTable?.id === table.id ? 'selected' : ''}`}
                onClick={() => handleTableClick(table)}
                style={{ 
                  backgroundColor: tableStates[table.state].color,
                  cursor: 'pointer'
                }}
              >
                <div className="table-number">{table.number}</div>
                <div className="table-capacity">{table.capacity}p</div>
                <div className="table-state-icon">{tableStates[table.state].icon}</div>
              </div>
            ) : (
              <div className="empty-cell">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingTable({ position: { x, y } });
                    setIsModalOpen(true);
                  }}
                  className="add-table-btn"
                >
                  ➕
                </Button>
              </div>
            )}
          </div>
        );
      }
      grid.push(<div key={y} className="grid-row">{row}</div>);
    }
    return grid;
  };

  return (
    <div className="table-management">
      <div className="table-management-header">
        <div className="header-content">
          <h2>Gestión de Mesas</h2>
          <p>Organiza y administra las mesas de tu restaurante</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddTable}
          className="add-table-btn"
        >
          ➕ Agregar Mesa
        </Button>
      </div>

      <div className="table-management-content">
        <div className="table-layout-section">
          <h3>Layout de Mesas</h3>
          <div className="table-grid-container">
            {renderTableGrid()}
          </div>
          
          <div className="grid-controls">
            <h4>Controles de Movimiento</h4>
            <p>Haz clic en una mesa y usa las flechas para moverla</p>
            {selectedTable && (
              <div className="movement-controls">
                <Button
                  variant="secondary"
                  onClick={() => handleTableMove(selectedTable.id, 'up')}
                  disabled={selectedTable.position.y === 0}
                >
                  ⬆️
                </Button>
                <div className="horizontal-controls">
                  <Button
                    variant="secondary"
                    onClick={() => handleTableMove(selectedTable.id, 'left')}
                    disabled={selectedTable.position.x === 0}
                  >
                    ⬅️
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleTableMove(selectedTable.id, 'right')}
                    disabled={selectedTable.position.x === 4}
                  >
                    ➡️
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleTableMove(selectedTable.id, 'down')}
                  disabled={selectedTable.position.y === 4}
                >
                  ⬇️
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="table-details-section">
          <h3>Detalles de Mesa</h3>
          {selectedTable ? (
            <div className="table-details">
              <div className="table-info">
                <h4>Mesa {selectedTable.number}</h4>
                <p><strong>Capacidad:</strong> {selectedTable.capacity} personas</p>
                <p><strong>Estado:</strong> {tableStates[selectedTable.state].label}</p>
                <p><strong>Posición:</strong> ({selectedTable.position.x + 1}, {selectedTable.position.y + 1})</p>
              </div>

              <div className="table-actions">
                <Button
                  variant="secondary"
                  onClick={() => handleEditTable(selectedTable)}
                  className="edit-table-btn"
                >
                  ✏️ Editar Mesa
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteTable(selectedTable.id)}
                  className="delete-table-btn"
                >
                  🗑️ Eliminar Mesa
                </Button>
              </div>

              <div className="state-controls">
                <h4>Cambiar Estado</h4>
                <div className="state-buttons">
                  {Object.entries(tableStates).map(([state, config]) => (
                    <Button
                      key={state}
                      variant={selectedTable.state === state ? 'primary' : 'secondary'}
                      onClick={() => handleStateChange(selectedTable.id, state)}
                      className={`state-btn ${selectedTable.state === state ? 'active' : ''}`}
                    >
                      {config.icon} {config.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">🪑</div>
              <p>Selecciona una mesa para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      <div className="table-stats">
        <h3>Estadísticas de Mesas</h3>
        <div className="stats-grid">
          {Object.entries(tableStates).map(([state, config]) => {
            const count = tables.filter(t => t.state === state).length;
            return (
              <div key={state} className="stat-item">
                <div className="stat-icon">{config.icon}</div>
                <div className="stat-content">
                  <div className="stat-label">{config.label}</div>
                  <div className="stat-count">{count} mesa{count !== 1 ? 's' : ''}</div>
                </div>
              </div>
            );
          })}
          <div className="stat-item total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Total</div>
              <div className="stat-count">{tables.length} mesa{tables.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>

      <TableModal
        isOpen={isModalOpen}
        table={editingTable}
        onSave={handleSaveTable}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default TableManagement;
