class CustomerService {
  constructor() {
    this.storageKey = 'restaurant_customers';
    this.initializeTestData();
  }

  // Inicializar datos de prueba
  initializeTestData() {
    const customers = this.getAllCustomers();
    
    // Si no existe el cliente de prueba, agregarlo
    const testCustomer = customers.find(customer => customer.cedula === '119170240');
    if (!testCustomer) {
      const testCustomerData = {
        cedula: '119170240',
        nombre: 'Juan Carlos Pérez',
        telefono: '88887777',
        id: 'test-customer-001',
        registrationDate: new Date('2024-01-15').toISOString(),
        points: 250,
        totalSpent: 15000,
        orderCount: 8,
        lastOrderDate: new Date('2024-12-10').toISOString()
      };
      
      customers.push(testCustomerData);
      localStorage.setItem(this.storageKey, JSON.stringify(customers));
    }

    // Agregar cliente con puntos suficientes para canje
    const redemptionTestCustomer = customers.find(customer => customer.cedula === '119170241');
    if (!redemptionTestCustomer) {
      const redemptionTestCustomerData = {
        cedula: '119170241',
        nombre: 'María Elena Rodríguez',
        telefono: '88889999',
        id: 'test-customer-002',
        registrationDate: new Date('2024-02-20').toISOString(),
        points: 1500,
        totalSpent: 50000,
        orderCount: 25,
        lastOrderDate: new Date('2024-12-15').toISOString()
      };
      
      customers.push(redemptionTestCustomerData);
      localStorage.setItem(this.storageKey, JSON.stringify(customers));
    } else {
      // Actualizar puntos si ya existe
      const customerIndex = customers.findIndex(customer => customer.cedula === '119170241');
      if (customerIndex !== -1) {
        customers[customerIndex].points = 1500;
        localStorage.setItem(this.storageKey, JSON.stringify(customers));
      }
    }
  }

  // Obtener todos los clientes
  getAllCustomers() {
    try {
      const customers = localStorage.getItem(this.storageKey);
      return customers ? JSON.parse(customers) : [];
    } catch (error) {
      console.error('Error loading customers:', error);
      return [];
    }
  }

  // Registrar nuevo cliente
  registerCustomer(customerData) {
    try {
      const customers = this.getAllCustomers();
      
      // Verificar si ya existe un cliente con esa cédula
      const existingCustomer = customers.find(customer => customer.cedula === customerData.cedula);
      if (existingCustomer) {
        throw new Error('Ya existe un cliente registrado con esta cédula');
      }

      // Crear nuevo cliente con timestamp
      const newCustomer = {
        ...customerData,
        id: Date.now().toString(),
        registrationDate: new Date().toISOString(),
        points: 0,
        totalSpent: 0,
        orderCount: 0
      };

      customers.push(newCustomer);
      localStorage.setItem(this.storageKey, JSON.stringify(customers));
      
      return { success: true, customer: newCustomer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Buscar cliente por cédula
  getCustomerByCedula(cedula) {
    const customers = this.getAllCustomers();
    return customers.find(customer => customer.cedula === cedula);
  }

  // Validar formato de cédula (básico para Costa Rica)
  validateCedula(cedula) {
    // Remover espacios y guiones
    const cleanCedula = cedula.replace(/[\s-]/g, '');
    
    // Verificar que tenga entre 9 y 12 dígitos (cédulas nacionales y residencias)
    if (!/^\d{9,12}$/.test(cleanCedula)) {
      return false;
    }
    
    return true;
  }

  // Validar teléfono (formato básico)
  validatePhone(phone) {
    // Remover espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Verificar que tenga 8 dígitos (teléfonos de Costa Rica)
    return /^\d{8}$/.test(cleanPhone);
  }

  // Actualizar puntos del cliente
  updateCustomerPoints(cedula, pointsToAdd, orderAmount = 0) {
    try {
      const customers = this.getAllCustomers();
      const customerIndex = customers.findIndex(customer => customer.cedula === cedula);
      
      if (customerIndex === -1) {
        return { success: false, error: 'Cliente no encontrado' };
      }

      customers[customerIndex].points += pointsToAdd;
      if (orderAmount > 0) {
        customers[customerIndex].totalSpent += orderAmount;
        customers[customerIndex].orderCount += 1;
      }
      customers[customerIndex].lastOrderDate = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(customers));
      
      return { success: true, customer: customers[customerIndex] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Establecer puntos específicos del cliente (para canjes)
  setCustomerPoints(cedula, newPointsAmount) {
    try {
      const customers = this.getAllCustomers();
      const customerIndex = customers.findIndex(customer => customer.cedula === cedula);
      
      if (customerIndex === -1) {
        return { success: false, error: 'Cliente no encontrado' };
      }

      customers[customerIndex].points = newPointsAmount;
      customers[customerIndex].lastOrderDate = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(customers));
      
      return { success: true, customer: customers[customerIndex] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new CustomerService();
