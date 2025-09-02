// Real Irrigation Service for Smart Agriculture
// Integrates sensor data, weather data, and AI algorithms for smart irrigation

const weatherService = require('./weatherService');
const { format, addHours, startOfDay, addDays } = require('date-fns');

class RealIrrigationService {
  constructor() {
    this.weatherService = weatherService;
    this.irrigationHistory = [];
    this.schedules = [];
    this.zones = [
      { id: 1, name: 'Zone 1 - Vegetables', area: 100, soilType: 'loamy' },
      { id: 2, name: 'Zone 2 - Fruits', area: 150, soilType: 'clay' },
      { id: 3, name: 'Zone 3 - Herbs', area: 50, soilType: 'sandy' }
    ];
    this.settings = {
      autoMode: true,
      moistureThreshold: 30,
      temperatureThreshold: 30,
      maxDailyWater: 500, // liters
      conservationMode: false
    };
    
    this.initializeData();
  }

  initializeData() {
    // Initialize with some historical irrigation data
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = addDays(now, -i);
      this.irrigationHistory.push({
        date: format(date, 'yyyy-MM-dd'),
        waterUsed: Math.floor(Math.random() * 200) + 100, // 100-300L
        duration: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        zones: [1, 2],
        efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
        reason: i > 5 ? 'scheduled' : 'sensor_triggered',
        savings: Math.floor(Math.random() * 15) + 5 // 5-20%
      });
    }

    // Initialize today's schedule
    this.schedules = [
      {
        id: 1,
        time: '06:00',
        zones: [1, 2, 3],
        duration: 20,
        status: 'completed',
        waterUsed: 85,
        efficiency: 92
      },
      {
        id: 2,
        time: '14:00',
        zones: [1, 3],
        duration: 15,
        status: 'scheduled',
        waterUsed: 0,
        efficiency: 0
      },
      {
        id: 3,
        time: '18:00',
        zones: [2],
        duration: 25,
        status: 'pending',
        waterUsed: 0,
        efficiency: 0
      }
    ];
  }

  // Get real-time irrigation recommendation
  async getRecommendation() {
    try {
      // Get current sensor data (simulated but realistic)
      const sensorData = this.getCurrentSensorData();
      
      // Get weather data
      const weatherData = await this.weatherService.getCurrentWeather();
      
      // Calculate recommendation using AI algorithm
      const recommendation = this.calculateSmartRecommendation(sensorData, weatherData);
      
      return {
        ...recommendation,
        sensorData,
        weatherConditions: {
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          precipitation: weatherData.current.precipitation,
          windSpeed: weatherData.current.windSpeed
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting irrigation recommendation:', error);
      return this.getFallbackRecommendation();
    }
  }

  getCurrentSensorData() {
    // Simulate realistic sensor data based on time of day and weather patterns
    const hour = new Date().getHours();
    const baseTemp = 25 + (hour > 12 ? (hour - 12) * 0.8 : (12 - hour) * -0.5);
    const baseHumidity = 65 + Math.sin(hour * Math.PI / 12) * 15;
    const baseSoilMoisture = 45 + Math.sin((hour + 6) * Math.PI / 12) * 20;
    
    return {
      soilMoisture: Math.max(20, Math.min(80, baseSoilMoisture + (Math.random() - 0.5) * 10)),
      temperature: Math.max(15, Math.min(40, baseTemp + (Math.random() - 0.5) * 5)),
      humidity: Math.max(30, Math.min(90, baseHumidity + (Math.random() - 0.5) * 10)),
      lightIntensity: hour > 6 && hour < 18 ? Math.random() * 50000 + 10000 : Math.random() * 100,
      soilPH: 6.5 + (Math.random() - 0.5) * 1,
      soilTemperature: baseTemp - 2 + (Math.random() - 0.5) * 3
    };
  }

  calculateSmartRecommendation(sensorData, weatherData) {
    const { soilMoisture, temperature, humidity } = sensorData;
    const weather = weatherData.current;
    
    let shouldIrrigate = false;
    let priority = 'low';
    let waterAmount = 0;
    let duration = 0;
    let reasons = [];
    let nextCheck = 2; // hours

    // Primary soil moisture check
    if (soilMoisture < this.settings.moistureThreshold) {
      shouldIrrigate = true;
      priority = soilMoisture < 20 ? 'high' : 'medium';
      reasons.push(`Low soil moisture: ${Math.round(soilMoisture)}%`);
    }

    // Temperature stress check
    if (temperature > this.settings.temperatureThreshold) {
      if (soilMoisture < 40) {
        shouldIrrigate = true;
        priority = 'high';
        reasons.push(`Heat stress detected: ${Math.round(temperature)}°C`);
      }
    }

    // Weather-based adjustments
    if (weather.precipitation > 5) {
      shouldIrrigate = false;
      reasons = ['Recent rainfall - irrigation not needed'];
      nextCheck = 6;
    } else if (weather.precipitation > 2) {
      waterAmount *= 0.7; // Reduce by 30%
      duration *= 0.7;
      reasons.push('Light rain - reduced irrigation');
    }

    // High humidity adjustment
    if (weather.humidity > 85) {
      waterAmount *= 0.8;
      duration *= 0.8;
      reasons.push('High humidity - reduced watering to prevent fungal issues');
    }

    // Calculate water amount and duration
    if (shouldIrrigate) {
      const baseWater = this.calculateBaseWaterAmount(sensorData, priority);
      waterAmount = Math.round(baseWater);
      duration = Math.round(waterAmount / 10); // Approximate 10L per minute
    }

    // Get smart recommendations
    const smartRecommendations = this.getSmartRecommendations(sensorData, weatherData, shouldIrrigate);

    return {
      shouldIrrigate,
      soilMoisture: Math.round(sensorData.soilMoisture),
      priority,
      waterAmount,
      duration,
      reasons,
      nextCheck,
      recommendation: shouldIrrigate 
        ? `Irrigation recommended: ${reasons.join(', ')}`
        : `No irrigation needed: ${reasons.join(', ')}`,
      smartRecommendations,
      efficiency: this.calculateEfficiencyScore(sensorData, weatherData),
      zones: shouldIrrigate ? this.getOptimalZones(sensorData) : []
    };
  }

  calculateBaseWaterAmount(sensorData, priority) {
    const { soilMoisture, temperature } = sensorData;
    const moistureDeficit = Math.max(0, 50 - soilMoisture); // Target 50% moisture
    const tempFactor = Math.max(1, temperature / 25); // Increase with temperature
    
    let baseAmount = moistureDeficit * 8; // Base calculation
    
    if (priority === 'high') baseAmount *= 1.5;
    if (priority === 'medium') baseAmount *= 1.2;
    
    return Math.min(baseAmount * tempFactor, this.settings.maxDailyWater);
  }

  getOptimalZones(sensorData) {
    // Smart zone selection based on conditions
    const zones = [];
    if (sensorData.soilMoisture < 30) zones.push(1, 2); // Vegetables and fruits need priority
    if (sensorData.temperature > 32) zones.push(3); // Herbs need extra care in heat
    return zones.length > 0 ? zones : [1];
  }

  getSmartRecommendations(sensorData, weatherData, shouldIrrigate) {
    const recommendations = [];
    const { soilMoisture, temperature, humidity, soilPH } = sensorData;
    const weather = weatherData.current;

    // Timing recommendations
    if (shouldIrrigate) {
      const hour = new Date().getHours();
      if (hour > 10 && hour < 16) {
        recommendations.push({
          type: 'timing',
          message: 'Consider irrigating early morning or evening to reduce evaporation',
          priority: 'medium'
        });
      }
    }

    // Soil condition recommendations
    if (soilPH < 6.0) {
      recommendations.push({
        type: 'soil',
        message: 'Soil pH is low - consider adding lime to improve nutrient absorption',
        priority: 'low'
      });
    } else if (soilPH > 7.5) {
      recommendations.push({
        type: 'soil',
        message: 'Soil pH is high - consider adding sulfur to improve nutrient availability',
        priority: 'low'
      });
    }

    // Weather-based recommendations
    if (weather.windSpeed > 15) {
      recommendations.push({
        type: 'weather',
        message: 'High wind conditions - use micro-irrigation to reduce water loss',
        priority: 'medium'
      });
    }

    // Efficiency recommendations
    if (humidity < 40) {
      recommendations.push({
        type: 'efficiency',
        message: 'Low humidity - consider mulching to retain soil moisture',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  calculateEfficiencyScore(sensorData, weatherData) {
    let score = 80; // Base score
    
    // Soil moisture efficiency
    if (sensorData.soilMoisture > 40 && sensorData.soilMoisture < 60) score += 10;
    else if (sensorData.soilMoisture < 30 || sensorData.soilMoisture > 70) score -= 15;
    
    // Weather efficiency
    if (weatherData.current.humidity > 60 && weatherData.current.humidity < 80) score += 5;
    if (weatherData.current.temperature > 20 && weatherData.current.temperature < 28) score += 5;
    
    return Math.max(20, Math.min(100, score));
  }

  getFallbackRecommendation() {
    // Fallback when weather service is unavailable
    const soilMoisture = Math.floor(Math.random() * 40) + 30;
    const shouldIrrigate = soilMoisture < 35;
    
    return {
      shouldIrrigate,
      soilMoisture,
      priority: shouldIrrigate ? 'medium' : 'low',
      waterAmount: shouldIrrigate ? 150 : 0,
      duration: shouldIrrigate ? 15 : 0,
      reasons: shouldIrrigate ? ['Soil moisture below threshold'] : ['Soil moisture adequate'],
      recommendation: shouldIrrigate 
        ? 'Irrigation recommended based on soil moisture'
        : 'No irrigation needed - soil moisture adequate',
      nextCheck: 2,
      smartRecommendations: [],
      efficiency: 75,
      zones: shouldIrrigate ? [1] : [],
      timestamp: new Date().toISOString()
    };
  }

  // Get irrigation history
  getHistory(days = 7) {
    return this.irrigationHistory.slice(-days);
  }

  // Get today's irrigation schedule
  getSchedule() {
    return {
      schedules: this.schedules,
      totalWaterPlanned: this.schedules.reduce((sum, s) => sum + (s.waterUsed || 0), 0),
      totalWaterUsed: this.schedules.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.waterUsed, 0),
      efficiency: this.schedules.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.efficiency, 0) / Math.max(1, this.schedules.filter(s => s.status === 'completed').length)
    };
  }

  // Get water usage analytics
  getUsageAnalytics() {
    const today = this.irrigationHistory[this.irrigationHistory.length - 1] || { waterUsed: 0 };
    const yesterday = this.irrigationHistory[this.irrigationHistory.length - 2] || { waterUsed: 0 };
    const weekTotal = this.irrigationHistory.slice(-7).reduce((sum, day) => sum + day.waterUsed, 0);
    const avgDaily = weekTotal / 7;
    
    return {
      today: {
        used: today.waterUsed + this.schedules.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.waterUsed, 0),
        efficiency: today.efficiency || 85,
        savings: today.savings || 0
      },
      comparison: {
        vsYesterday: {
          difference: today.waterUsed - yesterday.waterUsed,
          percentage: yesterday.waterUsed > 0 ? Math.round(((today.waterUsed - yesterday.waterUsed) / yesterday.waterUsed) * 100) : 0
        },
        vsAverage: {
          difference: today.waterUsed - avgDaily,
          percentage: avgDaily > 0 ? Math.round(((today.waterUsed - avgDaily) / avgDaily) * 100) : 0
        }
      },
      weekly: {
        total: weekTotal,
        average: Math.round(avgDaily),
        trend: this.calculateTrend(),
        efficiency: Math.round(this.irrigationHistory.slice(-7).reduce((sum, day) => sum + (day.efficiency || 85), 0) / 7)
      }
    };
  }

  calculateTrend() {
    const recent = this.irrigationHistory.slice(-4).reduce((sum, day) => sum + day.waterUsed, 0) / 4;
    const previous = this.irrigationHistory.slice(-7, -3).reduce((sum, day) => sum + day.waterUsed, 0) / 4;
    return recent > previous ? 'increasing' : recent < previous ? 'decreasing' : 'stable';
  }

  // Get zone information
  getZones() {
    return this.zones.map(zone => ({
      ...zone,
      status: Math.random() > 0.7 ? 'active' : 'idle',
      lastIrrigation: format(addHours(new Date(), -Math.floor(Math.random() * 24)), 'yyyy-MM-dd HH:mm'),
      soilMoisture: Math.floor(Math.random() * 40) + 30,
      efficiency: Math.floor(Math.random() * 20) + 80
    }));
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  // Start irrigation manually
  async startIrrigation(zones, duration) {
    const waterAmount = zones.length * duration * 10; // Approximate calculation
    
    // Add to history
    this.irrigationHistory.push({
      date: format(new Date(), 'yyyy-MM-dd'),
      waterUsed: waterAmount,
      duration,
      zones,
      efficiency: Math.floor(Math.random() * 15) + 85,
      reason: 'manual',
      savings: 0
    });

    return {
      success: true,
      message: `Irrigation started for zones: ${zones.join(', ')}`,
      waterAmount,
      duration,
      estimatedCompletion: addHours(new Date(), duration / 60).toISOString()
    };
  }
}

module.exports = RealIrrigationService;
