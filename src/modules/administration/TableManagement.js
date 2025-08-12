import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import TableModal from './TableModal';
import './TableManagement.css';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [gridRows, setGridRows] = useState(4);
  const [gridColumns, setGridColumns] = useState(6);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [mergeCandidate, setMergeCandidate] = useState(null);

  // Estados de mesa
  const tableStates = {
    free: { label: 'Libre', color: '#28a745', icon: '🟢' },
    occupied: { label: 'Ocupada', color: '#dc3545', icon: '🔴' },
    waiting: { label: 'Esperando Pedido', color: '#ffc107', icon: '🟡' },
    reserved: { label: 'Reservada', color: '#6f42c1', icon: '🟣' },
    merged: { label: 'Mesa Combinada', color: '#17a2b8', icon: '🔗' }
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
      { id: 8, number: 8, capacity: 6, state: 'free', position: { x: 1, y: 2 } },
      // Ejemplo de mesa combinada
      { 
        id: 9, 
        number: '9-10', 
        capacity: 8, 
        state: 'merged', 
        position: { x: 3, y: 0 }, 
        mergedWith: { x: 4, y: 0 },
        originalTables: [9, 10],
        isMerged: true
      }
    ];
    setTables(initialTables);
  }, []);

  const handleAddTable = () => {
    // Buscar la primera posición libre
    let foundPosition = null;
    for (let y = 0; y < gridRows && !foundPosition; y++) {
      for (let x = 0; x < gridColumns && !foundPosition; x++) {
        if (!getTableAtPosition(x, y)) {
          foundPosition = { x, y };
        }
      }
    }
    
    setEditingTable(foundPosition ? { position: foundPosition } : { position: { x: 0, y: 0 } });
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
    if (editingTable && editingTable.id) {
      // Editar mesa existente
      setTables(prevTables => prevTables.map(t => 
        t.id === editingTable.id ? { ...t, ...tableData } : t
      ));
    } else {
      // Agregar nueva mesa
      const newTable = {
        ...tableData,
        id: Date.now(),
        state: 'free',
        position: editingTable?.position || { x: 0, y: 0 }
      };
      setTables(prevTables => [...prevTables, newTable]);
      // Seleccionar automáticamente la nueva mesa creada
      setSelectedTable(newTable);
      console.log('Nueva mesa creada:', newTable); // Debug
    }
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleTableClick = (table) => {
    if (mergeMode) {
      // En modo combinar, manejar selección múltiple
      handleTableSelection(table);
    } else {
      // Modo normal, selección única
      setSelectedTable(table);
      setSelectedTables([]);
    }
  };

  // Manejar selección de mesas en modo combinar
  const handleTableSelection = (table) => {
    if (table.isMerged) {
      alert('⚠️ No se pueden seleccionar mesas que ya están combinadas');
      return;
    }

    setSelectedTables(prevSelected => {
      const isAlreadySelected = prevSelected.some(t => t.id === table.id);
      
      if (isAlreadySelected) {
        // Deseleccionar mesa
        return prevSelected.filter(t => t.id !== table.id);
      } else {
        // Seleccionar mesa (máximo 2 para combinar)
        if (prevSelected.length >= 2) {
          alert('⚠️ Solo puedes seleccionar máximo 2 mesas para combinar');
          return prevSelected;
        }
        return [...prevSelected, table];
      }
    });
  };

  const handleStateChange = (tableId, newState) => {
    setTables(tables.map(t => 
      t.id === tableId ? { ...t, state: newState } : t
    ));
  };

  const handleTableMove = (tableId, direction) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(t => {
        if (t.id === tableId) {
          const newPosition = { ...t.position };
          switch (direction) {
            case 'up':
              newPosition.y = Math.max(0, newPosition.y - 1);
              break;
            case 'down':
              newPosition.y = Math.min(gridRows - 1, newPosition.y + 1);
              break;
            case 'left':
              newPosition.x = Math.max(0, newPosition.x - 1);
              break;
            case 'right':
              newPosition.x = Math.min(gridColumns - 1, newPosition.x + 1);
              break;
            default:
              break;
          }
          const updatedTable = { ...t, position: newPosition };
          // Actualizar selectedTable si es la mesa que se está moviendo
          if (selectedTable && selectedTable.id === tableId) {
            setSelectedTable(updatedTable);
          }
          return updatedTable;
        }
        return t;
      });
      return updatedTables;
    });
  };

  // Verificar si dos mesas son adyacentes
  const areTablesAdjacent = (table1, table2) => {
    const dx = Math.abs(table1.position.x - table2.position.x);
    const dy = Math.abs(table1.position.y - table2.position.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  // Combinar dos mesas
  const handleMergeTables = (table1, table2) => {
    if (!areTablesAdjacent(table1, table2)) {
      alert('⚠️ Las mesas deben estar adyacentes para poder combinarlas');
      setMergeMode(false);
      setSelectedTables([]);
      return;
    }

    if (table1.isMerged || table2.isMerged) {
      alert('⚠️ No se pueden combinar mesas que ya están combinadas');
      setMergeMode(false);
      setSelectedTables([]);
      return;
    }

    const mergedTable = {
      id: Date.now(),
      number: `${table1.number}-${table2.number}`,
      capacity: table1.capacity + table2.capacity,
      state: 'merged',
      position: table1.position,
      mergedWith: table2.position,
      originalTables: [table1.id, table2.id],
      isMerged: true
    };

    // Remover las mesas originales y agregar la mesa combinada
    setTables(prevTables => {
      const filteredTables = prevTables.filter(t => t.id !== table1.id && t.id !== table2.id);
      return [...filteredTables, mergedTable];
    });

    setSelectedTable(mergedTable);
    setMergeMode(false);
    setSelectedTables([]);
    setMergeCandidate(null);
    
    // Mostrar mensaje de éxito
    alert(`✨ ¡Mesas ${table1.number} y ${table2.number} combinadas exitosamente!\nCapacidad total: ${mergedTable.capacity} personas`);
  };

  // Separar mesa combinada
  const handleSeparateTables = (mergedTable) => {
    if (!mergedTable.isMerged) return;

    const [table1Id, table2Id] = mergedTable.originalTables;
    const capacity1 = Math.floor(mergedTable.capacity / 2);
    const capacity2 = mergedTable.capacity - capacity1;

    const separatedTables = [
      {
        id: Date.now(),
        number: table1Id,
        capacity: capacity1,
        state: 'free',
        position: mergedTable.position
      },
      {
        id: Date.now() + 1,
        number: table2Id,
        capacity: capacity2,
        state: 'free',
        position: mergedTable.mergedWith
      }
    ];

    setTables(prevTables => {
      const filteredTables = prevTables.filter(t => t.id !== mergedTable.id);
      return [...filteredTables, ...separatedTables];
    });

    setSelectedTable(separatedTables[0]);
    alert(`✨ Mesa combinada separada exitosamente en Mesa ${table1Id} y Mesa ${table2Id}`);
  };

  // Activar modo combinar
  const handleActivateMergeMode = () => {
    setMergeMode(true);
    setSelectedTables([]);
    setSelectedTable(null);
    alert('🎯 Modo combinar activado. Selecciona 2 mesas adyacentes para combinarlas.');
  };

  // Cancelar modo combinar
  const handleCancelMergeMode = () => {
    setMergeMode(false);
    setSelectedTables([]);
    alert('❌ Modo combinar cancelado');
  };

  // Confirmar combinación de mesas seleccionadas
  const handleConfirmMerge = () => {
    if (selectedTables.length !== 2) {
      alert('⚠️ Debes seleccionar exactamente 2 mesas para combinar');
      return;
    }

    const [table1, table2] = selectedTables;
    handleMergeTables(table1, table2);
  };

  const getTableAtPosition = (x, y) => {
    // Buscar mesa en posición principal
    const table = tables.find(t => t.position.x === x && t.position.y === y);
    if (table) return table;
    
    // Buscar mesa combinada que ocupe esta posición
    return tables.find(t => t.isMerged && t.mergedWith && t.mergedWith.x === x && t.mergedWith.y === y);
  };

  const renderTableGrid = () => {
    const grid = [];
    for (let y = 0; y < gridRows; y++) {
      const row = [];
      for (let x = 0; x < gridColumns; x++) {
        const table = getTableAtPosition(x, y);
        row.push(
          <div key={`${x}-${y}`} className="grid-cell">
            {table ? (
              <div
                className={`table-item ${table.state} ${
                  selectedTable?.id === table.id ? 'selected' : ''
                } ${
                  selectedTables.some(t => t.id === table.id) ? 'merge-selected' : ''
                } ${
                  mergeMode ? 'merge-mode' : ''
                }`}
                onClick={() => handleTableClick(table)}
                style={{ 
                  backgroundColor: selectedTables.some(t => t.id === table.id) 
                    ? '#ff6b6b' 
                    : tableStates[table.state].color,
                  cursor: 'pointer',
                  border: selectedTables.some(t => t.id === table.id) 
                    ? '3px solid #fff' 
                    : '3px solid transparent'
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
          <div className="layout-header">
            <h3>Layout de Mesas</h3>
            <div className="grid-size-controls">
              <div className="grid-control">
                <label>Filas:</label>
                <select 
                  value={gridRows} 
                  onChange={(e) => setGridRows(parseInt(e.target.value))}
                  className="grid-select"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div className="grid-control">
                <label>Columnas:</label>
                <select 
                  value={gridColumns} 
                  onChange={(e) => setGridColumns(parseInt(e.target.value))}
                  className="grid-select"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
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
                    disabled={selectedTable.position.x === gridColumns - 1}
                  >
                    ➡️
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleTableMove(selectedTable.id, 'down')}
                  disabled={selectedTable.position.y === gridRows - 1}
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
                {selectedTable.isMerged ? (
                  <Button
                    variant="warning"
                    onClick={() => handleSeparateTables(selectedTable)}
                    className="separate-table-btn"
                  >
                    ↔️ Separar Mesa
                  </Button>
                ) : (
                  <Button
                    variant="info"
                    onClick={handleActivateMergeMode}
                    className="merge-table-btn"
                  >
                    🔗 Combinar Mesa
                  </Button>
                )}
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
          ) : mergeMode ? (
            <div className="merge-mode-panel">
              <div className="merge-mode-header">
                <h4>🔗 Modo Combinar Mesas</h4>
                <p>Selecciona 2 mesas adyacentes para combinar</p>
              </div>
              
              <div className="selected-tables-info">
                <h5>Mesas Seleccionadas: {selectedTables.length}/2</h5>
                {selectedTables.map((table, index) => (
                  <div key={table.id} className="selected-table-item">
                    <span>Mesa {table.number} - {table.capacity}p</span>
                    <Button
                      variant="secondary"
                      onClick={() => handleTableSelection(table)}
                      className="deselect-btn"
                    >
                      ❌
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="merge-actions">
                <Button
                  variant="primary"
                  onClick={handleConfirmMerge}
                  disabled={selectedTables.length !== 2}
                  className="confirm-merge-btn"
                >
                  ✅ Confirmar Combinación
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancelMergeMode}
                  className="cancel-merge-btn"
                >
                  ❌ Cancelar
                </Button>
              </div>
              
              <div className="merge-instructions">
                <p><strong>Instrucciones:</strong></p>
                <ul>
                  <li>Haz clic en las mesas que quieres combinar</li>
                  <li>Las mesas deben estar una al lado de la otra</li>
                  <li>Las mesas seleccionadas se ven en rojo</li>
                  <li>Máximo 2 mesas por combinación</li>
                </ul>
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
