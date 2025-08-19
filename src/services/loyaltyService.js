// Loyalty Program Service
// Manages loyalty program configuration and settings

const LOYALTY_CONFIG_KEY = 'loyalty_program_config';

// Default configuration
const DEFAULT_CONFIG = {
  isActive: true,
  pointsPerAmount: 1, // Points earned per ₡100 spent
  amountPerPoint: 100, // ₡100 = 1 point
  pointValue: 5, // Each point is worth ₡5
  programName: 'Programa de Lealtad',
  description: 'Acumula puntos con cada compra y obtén descuentos especiales',
  minPointsToRedeem: 10, // Minimum points needed to redeem
  maxPointsPerTransaction: 1000, // Maximum points that can be redeemed per transaction
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

class LoyaltyService {
  // Get current loyalty program configuration
  static getConfig() {
    try {
      const config = localStorage.getItem(LOYALTY_CONFIG_KEY);
      return config ? JSON.parse(config) : DEFAULT_CONFIG;
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
    // This would typically come from a backend API
    // For now, return mock data based on stored customers
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
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

  // Get comprehensive analytics for the loyalty program
  static getLoyaltyAnalytics() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
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
      customerEngagement: activeCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
      averageRedemptionValue: totalPointsRedeemed > 0 ? Math.round(redeemedPointsValue / totalPointsRedeemed) : 0
    };
  }

  // Generate mock trend data for loyalty analytics
  static generateLoyaltyTrendData() {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const data = [];
    
    for (let i = 0; i < months.length; i++) {
      data.push({
        month: months[i],
        pointsIssued: Math.floor(Math.random() * 5000) + 2000,
        pointsRedeemed: Math.floor(Math.random() * 2000) + 500,
        newCustomers: Math.floor(Math.random() * 50) + 20,
        activeCustomers: Math.floor(Math.random() * 100) + 80
      });
    }
    
    return data;
  }

  // Get customer segmentation data
  static getCustomerSegmentation() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
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
