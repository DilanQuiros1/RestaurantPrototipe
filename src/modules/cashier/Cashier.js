import React, { useState, useEffect } from 'react';
import PendingOrdersList from './PendingOrdersList';
import OrderDetailModal from './OrderDetailModal';
import PaymentModal from './PaymentModal';
import './Cashier.css';

const Cashier = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTable, setFilterTable] = useState('');

  // Datos de ejemplo de pedidos pendientes
  useEffect(() => {
    const mockOrders = [
      {
        id: 'PED-001',
        orderNumber: 'PED-001',
        tableNumber: 5,
        customerName: 'Juan Pérez',
        items: [
          { id: 1, name: 'Hamburguesa Clásica', quantity: 2, unitPrice: 8.99, notes: 'Sin cebolla' },
          { id: 2, name: 'Papas Fritas', quantity: 2, unitPrice: 3.99, notes: '' },
          { id: 3, name: 'Coca Cola', quantity: 2, unitPrice: 2.50, notes: 'Con hielo' }
        ],
        subtotal: 30.96,
        tax: 4.02,
        total: 34.98,
        status: 'pending_payment',
        orderDate: '2025-01-11',
        orderTime: '19:30',
        waiter: 'María González'
      },
      {
        id: 'PED-002',
        orderNumber: 'PED-002',
        tableNumber: 3,
        customerName: 'Ana Rodríguez',
        items: [
          { id: 4, name: 'Filete de Res', quantity: 1, unitPrice: 24.99, notes: 'Término medio' },
          { id: 5, name: 'Ensalada César', quantity: 1, unitPrice: 8.99, notes: 'Aderezo aparte' },
          { id: 6, name: 'Vino Tinto', quantity: 1, unitPrice: 15.99, notes: '' }
        ],
        subtotal: 49.97,
        tax: 6.50,
        total: 56.47,
        status: 'pending_payment',
        orderDate: '2025-01-11',
        orderTime: '20:15',
        waiter: 'Carlos Méndez'
      },
      {
        id: 'PED-003',
        orderNumber: 'PED-003',
        tableNumber: 8,
        customerName: 'Roberto Silva',
        items: [
          { id: 7, name: 'Pizza Margherita', quantity: 1, unitPrice: 12.99, notes: 'Extra queso' },
          { id: 8, name: 'Limonada Natural', quantity: 2, unitPrice: 3.99, notes: '' }
        ],
        subtotal: 20.97,
        tax: 2.73,
        total: 23.70,
        status: 'pending_payment',
        orderDate: '2025-01-11',
        orderTime: '20:45',
        waiter: 'María González'
      },
      {
        id: 'PED-004',
        orderNumber: 'PED-004',
        tableNumber: 12,
        customerName: 'Laura Jiménez',
        items: [
          { id: 9, name: 'Pasta Carbonara', quantity: 1, unitPrice: 16.99, notes: '' },
          { id: 10, name: 'Pan de Ajo', quantity: 1, unitPrice: 4.99, notes: '' },
          { id: 11, name: 'Agua Mineral', quantity: 1, unitPrice: 1.99, notes: 'Con gas' }
        ],
        subtotal: 23.97,
        tax: 3.12,
        total: 27.09,
        status: 'pending_payment',
        orderDate: '2025-01-11',
        orderTime: '21:00',
        waiter: 'Carlos Méndez'
      }
    ];
    
    setPendingOrders(mockOrders);
  }, []);

  // Filtrar pedidos según criterios de búsqueda
  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber.toString().includes(searchTerm);
    
    const matchesDate = filterDate === '' || order.orderDate === filterDate;
    const matchesTable = filterTable === '' || order.tableNumber.toString() === filterTable;
    
    return matchesSearch && matchesDate && matchesTable;
  });

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleProceedToPayment = (orderWithDiscounts) => {
    setSelectedOrder(orderWithDiscounts);
    setIsOrderDetailOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (paymentData) => {
    if (paymentData.methodId === 'pending') {
      // Para pagos pendientes, actualizar el estado pero mantener en la lista
      setPendingOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { 
                ...order, 
                status: 'pending_sinpe',
                pendingDetails: paymentData.details
              }
            : order
        )
      );
      
      // Mostrar confirmación para pago pendiente
      alert(`⏳ Pago registrado como PENDIENTE\n\nPedido: ${selectedOrder.orderNumber}\nMesa: ${selectedOrder.tableNumber}\nTotal: $${selectedOrder.total.toFixed(2)}\nA nombre de: ${paymentData.details.customerName}\n\n⚠️ El pedido permanecerá en la lista hasta confirmar el SINPE.`);
    } else {
      // Para pagos completados, remover de la lista
      setPendingOrders(prevOrders => 
        prevOrders.filter(order => order.id !== selectedOrder.id)
      );
      
      // Mostrar confirmación para pago completado
      alert(`✅ Pago procesado exitosamente\n\nPedido: ${selectedOrder.orderNumber}\nMesa: ${selectedOrder.tableNumber}\nTotal: $${selectedOrder.total.toFixed(2)}\nMétodo: ${paymentData.method}`);
    }
    
    // En un caso real, aquí se enviaría la información al backend
    console.log('Pago procesado:', {
      order: selectedOrder,
      payment: paymentData
    });
    
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseModals = () => {
    setIsOrderDetailOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="cashier-container">
      <div className="cashier-header">
        <div className="header-content">
          <h2>💳 Módulo de Caja</h2>
          <p>Gestión de cobros y facturación</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{pendingOrders.length}</span>
            <span className="stat-label">Pedidos Pendientes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              ${pendingOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </span>
            <span className="stat-label">Total Pendiente</span>
          </div>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar por pedido, mesa o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label>📅 Fecha:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>🏷️ Mesa:</label>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="filter-select"
            >
              <option value="">Todas las mesas</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Mesa {num}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
              setFilterTable('');
            }}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      <PendingOrdersList
        orders={filteredOrders}
        onOrderSelect={handleOrderSelect}
      />

      <OrderDetailModal
        isOpen={isOrderDetailOpen}
        order={selectedOrder}
        onClose={handleCloseModals}
        onProceedToPayment={handleProceedToPayment}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        order={selectedOrder}
        onClose={handleCloseModals}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default Cashier;
