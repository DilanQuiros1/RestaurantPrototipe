// Loyalty Program Service
// Manages loyalty program configuration and settings

const LOYALTY_CONFIG_KEY = 'loyalty_program_config';

// Default configuration
const DEFAULT_CONFIG = {
  isActive: true,
  pointsPerAmount: 1, // Points earned per ₡100 spent
  amountPerPoint: 100, // ₡100 = 1 point
  pointValue: 5, // Each point is worth ₡5
  programName: 'Programa de Fidelizacion',
  description: 'Acumula puntos con cada compra y obtén descuentos especiales',
  minPointsToRedeem: 0, // No minimum points needed to redeem
  maxPointsPerTransaction: 999999, // No maximum limit for points per transaction
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

class LoyaltyService {
  // Get current loyalty program configuration
  static getConfig() {
    try {
      const config = localStorage.getItem(LOYALTY_CONFIG_KEY);
      const parsedConfig = config ? JSON.parse(config) : DEFAULT_CONFIG;
      
      // Force reset if minPointsToRedeem is wrong
      if (parsedConfig.minPointsToRedeem === 1000) {
        console.log('Resetting loyalty config - wrong minPointsToRedeem detected');
        localStorage.removeItem(LOYALTY_CONFIG_KEY);
        return DEFAULT_CONFIG;
      }
      
      return parsedConfig;
    } catch (error) {
      console.error('Error loading loyalty config:', error);
      return DEFAULT_CONFIG;
    }
  }

  // Save loyalty program configuration
  static saveConfig(config) {
    try {
      const updatedConfig = {
        ...config,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(updatedConfig));
      return { success: true, config: updatedConfig };
    } catch (error) {
      console.error('Error saving loyalty config:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate points earned for a given amount
  static calculatePointsEarned(amount) {
    const config = this.getConfig();
    if (!config.isActive) return 0;
    
    return Math.floor(amount / config.amountPerPoint) * config.pointsPerAmount;
  }

  // Calculate monetary value of points
  static calculatePointsValue(points) {
    const config = this.getConfig();
    return points * config.pointValue;
  }

  // Validate if points can be redeemed
  static canRedeemPoints(points, availablePoints) {
    const config = this.getConfig();
    
    if (!config.isActive) return { valid: false, reason: 'Programa no activo' };
    if (points < config.minPointsToRedeem) return { valid: false, reason: `Mínimo ${config.minPointsToRedeem} puntos` };
    if (points > config.maxPointsPerTransaction) return { valid: false, reason: `Máximo ${config.maxPointsPerTransaction} puntos por transacción` };
    if (points > availablePoints) return { valid: false, reason: 'Puntos insuficientes' };
    
    return { valid: true };
  }

  // Reset configuration to defaults
  static resetToDefaults() {
    try {
      const defaultConfig = { ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(defaultConfig));
      return { success: true, config: defaultConfig };
    } catch (error) {
      console.error('Error resetting loyalty config:', error);
      return { success: false, error: error.message };
    }
  }

  // Get program statistics (if needed for admin dashboard)
  static getProgramStats() {
    // Use mock data for better visualization
    const mockData = this.getMockLoyaltyData();
    const customers = mockData.customers;
    const config = this.getConfig();
    
    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.points > 0).length,
      totalPointsIssued: customers.reduce((sum, c) => sum + (c.points || 0), 0),
      totalPointsRedeemed: customers.reduce((sum, c) => sum + (c.redeemedPoints || 0), 0),
      programActive: config.isActive,
      averagePointsPerCustomer: customers.length > 0 ? 
        Math.round(customers.reduce((sum, c) => sum + (c.points || 0), 0) / customers.length) : 0
    };
  }

  // Get mock loyalty data for testing
  static getMockLoyaltyData() {
    // Import mock data - in a real app this would come from an API
    const mockData = {
      "customers": [
        {
          "id": "1",
          "cedula": "123456789",
          "nombre": "María González",
          "telefono": "88887777",
          "registrationDate": "2024-01-15T10:30:00.000Z",
          "points": 245,
          "redeemedPoints": 50,
          "totalSpent": 24500,
          "orderCount": 12,
          "lastOrderDate": "2024-08-15T19:20:00.000Z",
          "segment": "frecuente"
        },
        {
          "id": "2",
          "cedula": "987654321",
          "nombre": "Carlos Rodríguez",
          "telefono": "77776666",
          "registrationDate": "2024-02-20T14:15:00.000Z",
          "points": 580,
          "redeemedPoints": 120,
          "totalSpent": 58000,
          "orderCount": 28,
          "lastOrderDate": "2024-08-18T18:45:00.000Z",
          "segment": "vip"
        },
        {
          "id": "3",
          "cedula": "456789123",
          "nombre": "Ana Martínez",
          "telefono": "66665555",
          "registrationDate": "2024-03-10T09:45:00.000Z",
          "points": 75,
          "redeemedPoints": 25,
          "totalSpent": 7500,
          "orderCount": 5,
          "lastOrderDate": "2024-08-10T12:30:00.000Z",
          "segment": "activo"
        },
        {
          "id": "4",
          "cedula": "789123456",
          "nombre": "Luis Fernández",
          "telefono": "55554444",
          "registrationDate": "2024-04-05T16:20:00.000Z",
          "points": 1250,
          "redeemedPoints": 300,
          "totalSpent": 125000,
          "orderCount": 45,
          "lastOrderDate": "2024-08-18T17:15:00.000Z",
          "segment": "vip"
        },
        {
          "id": "5",
          "cedula": "321654987",
          "nombre": "Sofia Vargas",
          "telefono": "44443333",
          "registrationDate": "2024-05-12T11:10:00.000Z",
          "points": 0,
          "redeemedPoints": 0,
          "totalSpent": 0,
          "orderCount": 0,
          "lastOrderDate": null,
          "segment": "nuevo"
        },
        {
          "id": "6",
          "cedula": "654987321",
          "nombre": "Roberto Jiménez",
          "telefono": "33332222",
          "registrationDate": "2024-01-08T13:25:00.000Z",
          "points": 890,
          "redeemedPoints": 200,
          "totalSpent": 89000,
          "orderCount": 35,
          "lastOrderDate": "2024-08-17T20:10:00.000Z",
          "segment": "vip"
        },
        {
          "id": "7",
          "cedula": "147258369",
          "nombre": "Patricia Morales",
          "telefono": "22221111",
          "registrationDate": "2024-06-18T15:40:00.000Z",
          "points": 165,
          "redeemedPoints": 40,
          "totalSpent": 16500,
          "orderCount": 8,
          "lastOrderDate": "2024-08-16T14:20:00.000Z",
          "segment": "frecuente"
        },
        {
          "id": "8",
          "cedula": "963852741",
          "nombre": "Diego Herrera",
          "telefono": "11119999",
          "registrationDate": "2024-07-02T08:55:00.000Z",
          "points": 45,
          "redeemedPoints": 0,
          "totalSpent": 4500,
          "orderCount": 3,
          "lastOrderDate": "2024-08-12T16:30:00.000Z",
          "segment": "activo"
        },
        {
          "id": "9",
          "cedula": "852741963",
          "nombre": "Carmen Solís",
          "telefono": "99998888",
          "registrationDate": "2024-02-28T12:05:00.000Z",
          "points": 320,
          "redeemedPoints": 80,
          "totalSpent": 32000,
          "orderCount": 16,
          "lastOrderDate": "2024-08-14T19:45:00.000Z",
          "segment": "frecuente"
        },
        {
          "id": "10",
          "cedula": "741963852",
          "nombre": "Fernando Castro",
          "telefono": "88889999",
          "registrationDate": "2024-03-22T10:15:00.000Z",
          "points": 0,
          "redeemedPoints": 0,
          "totalSpent": 0,
          "orderCount": 0,
          "lastOrderDate": null,
          "segment": "nuevo"
        },
        {
          "id": "11",
          "cedula": "159753486",
          "nombre": "Gabriela Ramírez",
          "telefono": "77778888",
          "registrationDate": "2024-04-30T17:30:00.000Z",
          "points": 680,
          "redeemedPoints": 150,
          "totalSpent": 68000,
          "orderCount": 22,
          "lastOrderDate": "2024-08-18T13:20:00.000Z",
          "segment": "vip"
        },
        {
          "id": "12",
          "cedula": "486159753",
          "nombre": "Andrés Villalobos",
          "telefono": "66667777",
          "registrationDate": "2024-05-25T14:50:00.000Z",
          "points": 95,
          "redeemedPoints": 20,
          "totalSpent": 9500,
          "orderCount": 6,
          "lastOrderDate": "2024-08-11T15:40:00.000Z",
          "segment": "activo"
        },
        {
          "id": "13",
          "cedula": "753486159",
          "nombre": "Isabella Mora",
          "telefono": "55556666",
          "registrationDate": "2024-06-08T09:20:00.000Z",
          "points": 420,
          "redeemedPoints": 100,
          "totalSpent": 42000,
          "orderCount": 18,
          "lastOrderDate": "2024-08-16T11:15:00.000Z",
          "segment": "frecuente"
        },
        {
          "id": "14",
          "cedula": "357159486",
          "nombre": "Javier Montero",
          "telefono": "44445555",
          "registrationDate": "2024-07-15T16:45:00.000Z",
          "points": 30,
          "redeemedPoints": 0,
          "totalSpent": 3000,
          "orderCount": 2,
          "lastOrderDate": "2024-08-08T18:25:00.000Z",
          "segment": "activo"
        },
        {
          "id": "15",
          "cedula": "951357486",
          "nombre": "Valeria Esquivel",
          "telefono": "33334444",
          "registrationDate": "2024-01-30T11:35:00.000Z",
          "points": 1150,
          "redeemedPoints": 400,
          "totalSpent": 115000,
          "orderCount": 52,
          "lastOrderDate": "2024-08-18T16:50:00.000Z",
          "segment": "vip"
        }
      ],
      "monthlyMetrics": [
        {
          "month": "Ene",
          "pointsIssued": 4250,
          "pointsRedeemed": 850,
          "newCustomers": 45,
          "activeCustomers": 120
        },
        {
          "month": "Feb",
          "pointsIssued": 3890,
          "pointsRedeemed": 920,
          "newCustomers": 38,
          "activeCustomers": 135
        },
        {
          "month": "Mar",
          "pointsIssued": 5120,
          "pointsRedeemed": 1150,
          "newCustomers": 52,
          "activeCustomers": 158
        },
        {
          "month": "Abr",
          "pointsIssued": 4680,
          "pointsRedeemed": 1280,
          "newCustomers": 41,
          "activeCustomers": 172
        },
        {
          "month": "May",
          "pointsIssued": 5890,
          "pointsRedeemed": 1450,
          "newCustomers": 48,
          "activeCustomers": 185
        },
        {
          "month": "Jun",
          "pointsIssued": 6320,
          "pointsRedeemed": 1680,
          "newCustomers": 55,
          "activeCustomers": 198
        }
      ]
    };
    
    return mockData;
  }

  // Get comprehensive analytics for the loyalty program
  static getLoyaltyAnalytics() {
    const mockData = this.getMockLoyaltyData();
    const customers = mockData.customers;
    const config = this.getConfig();
    
    // Calculate basic metrics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => (c.points || 0) > 0).length;
    const totalPointsIssued = customers.reduce((sum, c) => sum + (c.points || 0), 0);
    const totalPointsRedeemed = customers.reduce((sum, c) => sum + (c.redeemedPoints || 0), 0);
    
    // Calculate utilization percentage
    const utilizationRate = totalPointsIssued > 0 ? 
      Math.round((totalPointsRedeemed / totalPointsIssued) * 100) : 0;
    
    // Calculate monetary values
    const totalPointsValue = totalPointsIssued * config.pointValue;
    const redeemedPointsValue = totalPointsRedeemed * config.pointValue;
    
    // Estimate total customer spending (reverse calculation from points)
    const estimatedTotalSpending = totalPointsIssued * config.amountPerPoint;
    
    // Calculate net benefit (estimated revenue - redeemed points cost)
    const netBenefit = estimatedTotalSpending - redeemedPointsValue;
    
    // Average points per customer
    const averagePointsPerCustomer = totalCustomers > 0 ? 
      Math.round(totalPointsIssued / totalCustomers) : 0;
    
    // Generate trend data (mock data for demonstration)
    const trendData = this.generateLoyaltyTrendData();
    
    return {
      // Basic metrics
      totalCustomers,
      activeCustomers,
      totalPointsIssued,
      totalPointsRedeemed,
      utilizationRate,
      averagePointsPerCustomer,
      
      // Financial metrics
      totalPointsValue,
      redeemedPointsValue,
      estimatedTotalSpending,
      netBenefit,
      
      // Program status
      programActive: config.isActive,
      config,
      
      // Trend data for charts
      trendData,
      
      // Additional insights
      participacionClientes: activeCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
      averageRedemptionValue: totalPointsRedeemed > 0 ? Math.round(redeemedPointsValue / totalPointsRedeemed) : 0
    };
  }

  // Generate mock trend data for loyalty analytics
  static generateLoyaltyTrendData() {
    const mockData = this.getMockLoyaltyData();
    return mockData.monthlyMetrics;
  }

  // Get customer segmentation data
  static getCustomerSegmentation() {
    const mockData = this.getMockLoyaltyData();
    const customers = mockData.customers;
    
    const segments = {
      nuevos: customers.filter(c => (c.points || 0) === 0).length,
      activos: customers.filter(c => (c.points || 0) > 0 && (c.points || 0) < 100).length,
      frecuentes: customers.filter(c => (c.points || 0) >= 100 && (c.points || 0) < 500).length,
      vip: customers.filter(c => (c.points || 0) >= 500).length
    };
    
    return segments;
  }
}

export default LoyaltyService;
