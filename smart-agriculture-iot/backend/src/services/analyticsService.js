const { format, subDays, startOfDay } = require('date-fns');

class AnalyticsService {
  constructor() {
    this.generateHistoricalData();
  }

  generateHistoricalData() {
    const now = new Date();
    this.historicalData = {};
    
    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(startOfDay(now), i), 'yyyy-MM-dd');
      this.historicalData[date] = {
        temperature: this.generateRandomValue(22, 35, 2),
        humidity: this.generateRandomValue(60, 90, 5),
        soilMoisture: this.generateRandomValue(40, 80, 3),
        lightIntensity: this.generateRandomValue(300, 1000, 50),
        pH: this.generateRandomValue(6.0, 7.5, 0.1),
        nutrients: {
          nitrogen: this.generateRandomValue(20, 100, 5),
          phosphorus: this.generateRandomValue(15, 80, 3),
          potassium: this.generateRandomValue(25, 120, 8),
        },
        waterUsage: this.generateRandomValue(50, 200, 10),
        energyConsumption: this.generateRandomValue(20, 80, 5),
        yield: this.generateRandomValue(0, 100, 10),
      };
    }
  }

  generateRandomValue(min, max, variance) {
    const base = min + Math.random() * (max - min);
    const variation = (Math.random() - 0.5) * variance;
    return Math.max(min, Math.min(max, base + variation));
  }

  getHistoricalData(days = 7) {
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(startOfDay(now), i), 'yyyy-MM-dd');
      const dayData = this.historicalData[date] || this.generateDayData();
      data.push({
        date: format(subDays(now, i), 'MMM dd'),
        fullDate: date,
        ...dayData,
      });
    }
    
    return data;
  }

  generateDayData() {
    return {
      temperature: this.generateRandomValue(22, 35, 2),
      humidity: this.generateRandomValue(60, 90, 5),
      soilMoisture: this.generateRandomValue(40, 80, 3),
      lightIntensity: this.generateRandomValue(300, 1000, 50),
      pH: this.generateRandomValue(6.0, 7.5, 0.1),
      nutrients: {
        nitrogen: this.generateRandomValue(20, 100, 5),
        phosphorus: this.generateRandomValue(15, 80, 3),
        potassium: this.generateRandomValue(25, 120, 8),
      },
      waterUsage: this.generateRandomValue(50, 200, 10),
      energyConsumption: this.generateRandomValue(20, 80, 5),
      yield: this.generateRandomValue(0, 100, 10),
    };
  }

  getPredictiveAnalytics() {
    const historical = this.getHistoricalData(7);
    const avgTemp = historical.reduce((sum, day) => sum + day.temperature, 0) / historical.length;
    const avgHumidity = historical.reduce((sum, day) => sum + day.humidity, 0) / historical.length;
    const avgSoilMoisture = historical.reduce((sum, day) => sum + day.soilMoisture, 0) / historical.length;
    
    return {
      yieldPrediction: {
        value: Math.round(85 + (avgTemp - 28) * 2 + (avgSoilMoisture - 60) * 0.5),
        trend: avgTemp > 28 && avgSoilMoisture > 60 ? 'increasing' : 'stable',
        confidence: 87,
      },
      diseaseRisk: {
        value: Math.round(Math.max(0, Math.min(100, (avgHumidity - 70) * 2 + (avgTemp - 30) * 1.5))),
        level: avgHumidity > 80 && avgTemp > 30 ? 'high' : avgHumidity > 70 ? 'medium' : 'low',
        factors: ['High humidity', 'Temperature fluctuation'],
      },
      waterOptimization: {
        currentUsage: Math.round(historical.reduce((sum, day) => sum + day.waterUsage, 0)),
        optimizedUsage: Math.round(historical.reduce((sum, day) => sum + day.waterUsage, 0) * 0.85),
        savings: 15,
        recommendations: ['Adjust irrigation timing', 'Use soil moisture data'],
      },
      harvestPrediction: {
        estimatedDate: format(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
        daysRemaining: 21,
        quality: 'Excellent',
      },
    };
  }

  getEfficiencyMetrics() {
    const data = this.getHistoricalData(30);
    const totalWater = data.reduce((sum, day) => sum + day.waterUsage, 0);
    const totalEnergy = data.reduce((sum, day) => sum + day.energyConsumption, 0);
    const avgYield = data.reduce((sum, day) => sum + day.yield, 0) / data.length;

    return {
      waterEfficiency: {
        value: Math.round((avgYield / (totalWater / 30)) * 100) / 100,
        unit: 'kg/L',
        trend: 'improving',
        target: 2.5,
      },
      energyEfficiency: {
        value: Math.round((avgYield / (totalEnergy / 30)) * 100) / 100,
        unit: 'kg/kWh',
        trend: 'stable',
        target: 3.0,
      },
      resourceUtilization: {
        water: Math.round((totalWater / (30 * 150)) * 100), // Target: 150L/day
        energy: Math.round((totalEnergy / (30 * 60)) * 100), // Target: 60kWh/day
        nutrients: 92,
      },
      carbonFootprint: {
        value: Math.round(totalEnergy * 0.5 + totalWater * 0.001),
        unit: 'kg CO2',
        trend: 'decreasing',
        reduction: 12,
      },
    };
  }

  getComparativeAnalysis() {
    return {
      industryBenchmark: {
        yield: { yours: 87, industry: 75, difference: 16 },
        waterUsage: { yours: 120, industry: 180, difference: -33 },
        energyEfficiency: { yours: 92, industry: 78, difference: 18 },
        diseaseResistance: { yours: 94, industry: 82, difference: 15 },
      },
      seasonalComparison: {
        currentSeason: 'Summer 2025',
        seasons: [
          { name: 'Spring 2025', yield: 82, efficiency: 88 },
          { name: 'Summer 2025', yield: 87, efficiency: 92 },
          { name: 'Summer 2024', yield: 79, efficiency: 85 },
          { name: 'Spring 2024', yield: 76, efficiency: 82 },
        ],
      },
      cropVarieties: [
        { name: 'Tomato - Hybrid A', yield: 92, resistance: 88, efficiency: 95 },
        { name: 'Lettuce - Variety B', yield: 85, resistance: 92, efficiency: 87 },
        { name: 'Cucumber - Type C', yield: 78, resistance: 85, efficiency: 90 },
        { name: 'Pepper - Strain D', yield: 88, resistance: 90, efficiency: 93 },
      ],
    };
  }

  getRealTimeMetrics() {
    return {
      currentConditions: {
        temperature: Math.round(this.generateRandomValue(25, 30, 1)),
        humidity: Math.round(this.generateRandomValue(65, 75, 2)),
        soilMoisture: Math.round(this.generateRandomValue(55, 65, 3)),
        lightIntensity: Math.round(this.generateRandomValue(700, 900, 50)),
        pH: Math.round(this.generateRandomValue(6.2, 6.8, 0.1) * 10) / 10,
      },
      alerts: [
        {
          type: 'warning',
          message: 'Soil moisture below optimal range',
          timestamp: new Date().toISOString(),
          priority: 'medium',
        },
        {
          type: 'info',
          message: 'Temperature within ideal range',
          timestamp: new Date().toISOString(),
          priority: 'low',
        },
      ],
      recommendations: [
        'Increase irrigation frequency for next 2 days',
        'Monitor humidity levels during afternoon',
        'Consider nutrient supplementation',
      ],
    };
  }
}

module.exports = new AnalyticsService();
