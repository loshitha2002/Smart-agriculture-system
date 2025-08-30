// Demo Service for Hackathon Presentation
class DemoService {
  constructor() {
    this.demoScenarios = {
      optimal: 'Optimal Growing Conditions',
      drought: 'Drought Emergency',
      disease: 'Disease Outbreak Detection',
      growth: 'Rapid Growth Phase'
    };
    
    this.currentScenario = 'optimal';
    this.isRunning = false;
    this.dataHistory = [];
  }

  // Get demo sensor data based on scenario
  getDemoSensorData(scenario = this.currentScenario) {
    const baseTime = new Date();
    
    const scenarios = {
      optimal: {
        temperature: this.generateValue(22, 26, 1),
        humidity: this.generateValue(60, 70, 2),
        soilMoisture: this.generateValue(65, 75, 3),
        ph: this.generateValue(6.0, 7.0, 0.2),
        nitrogen: this.generateValue(80, 90, 5),
        phosphorus: this.generateValue(40, 50, 3),
        potassium: this.generateValue(60, 70, 4),
        lightIntensity: this.generateValue(800, 1000, 50),
        status: 'optimal',
        alerts: []
      },
      
      drought: {
        temperature: this.generateValue(35, 42, 2),
        humidity: this.generateValue(25, 35, 2),
        soilMoisture: this.generateValue(15, 25, 3),
        ph: this.generateValue(7.5, 8.2, 0.1),
        nitrogen: this.generateValue(40, 50, 5),
        phosphorus: this.generateValue(20, 30, 3),
        potassium: this.generateValue(30, 40, 4),
        lightIntensity: this.generateValue(1200, 1500, 100),
        status: 'critical',
        alerts: [
          'Extreme heat warning',
          'Low soil moisture detected',
          'Immediate irrigation required'
        ]
      },
      
      disease: {
        temperature: this.generateValue(28, 32, 1),
        humidity: this.generateValue(80, 90, 2),
        soilMoisture: this.generateValue(85, 95, 2),
        ph: this.generateValue(5.5, 6.0, 0.1),
        nitrogen: this.generateValue(30, 40, 3),
        phosphorus: this.generateValue(15, 25, 2),
        potassium: this.generateValue(25, 35, 3),
        lightIntensity: this.generateValue(400, 600, 30),
        status: 'warning',
        alerts: [
          'High humidity detected',
          'Fungal disease risk',
          'Reduce watering frequency'
        ]
      },
      
      growth: {
        temperature: this.generateValue(24, 28, 1),
        humidity: this.generateValue(65, 75, 2),
        soilMoisture: this.generateValue(70, 80, 2),
        ph: this.generateValue(6.2, 6.8, 0.1),
        nitrogen: this.generateValue(90, 100, 3),
        phosphorus: this.generateValue(60, 70, 3),
        potassium: this.generateValue(80, 90, 4),
        lightIntensity: this.generateValue(900, 1100, 50),
        status: 'excellent',
        alerts: [
          'Optimal growth conditions',
          'Nutrient levels perfect',
          'Continue current regimen'
        ]
      }
    };

    const data = scenarios[scenario];
    return {
      ...data,
      timestamp: baseTime.toISOString(),
      scenario: scenario,
      scenarioName: this.demoScenarios[scenario]
    };
  }

  // Generate realistic sensor values with some variation
  generateValue(min, max, variance) {
    const base = min + Math.random() * (max - min);
    const variation = (Math.random() - 0.5) * variance;
    return Math.round((base + variation) * 100) / 100;
  }

  // Get historical data for charts
  getHistoricalData(hours = 24, scenario = this.currentScenario) {
    const data = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const sensorData = this.getDemoSensorData(scenario);
      
      data.push({
        ...sensorData,
        timestamp: timestamp.toISOString()
      });
    }
    
    return data;
  }

  // Switch demo scenario
  setScenario(scenario) {
    if (this.demoScenarios[scenario]) {
      this.currentScenario = scenario;
      return true;
    }
    return false;
  }

  // Get available scenarios
  getScenarios() {
    return this.demoScenarios;
  }

  // Get irrigation recommendations based on scenario
  getIrrigationRecommendation(scenario = this.currentScenario) {
    const recommendations = {
      optimal: {
        action: 'maintain',
        duration: 15,
        frequency: 'twice_daily',
        message: 'Continue regular watering schedule'
      },
      drought: {
        action: 'increase',
        duration: 30,
        frequency: 'hourly',
        message: 'Emergency irrigation required immediately'
      },
      disease: {
        action: 'reduce',
        duration: 5,
        frequency: 'daily',
        message: 'Reduce watering to prevent fungal growth'
      },
      growth: {
        action: 'optimize',
        duration: 20,
        frequency: 'three_times_daily',
        message: 'Increase nutrients during rapid growth'
      }
    };

    return recommendations[scenario];
  }

  // Generate disease detection results
  getDiseaseDetection(scenario = this.currentScenario) {
    const diseases = {
      optimal: {
        detected: false,
        confidence: 95,
        disease: null,
        recommendations: ['Continue monitoring', 'Maintain current care']
      },
      drought: {
        detected: true,
        confidence: 78,
        disease: 'Heat Stress',
        recommendations: [
          'Increase shade coverage',
          'Emergency watering',
          'Apply mulch to retain moisture'
        ]
      },
      disease: {
        detected: true,
        confidence: 89,
        disease: 'Powdery Mildew',
        recommendations: [
          'Apply fungicide treatment',
          'Improve air circulation',
          'Reduce humidity levels',
          'Remove affected leaves'
        ]
      },
      growth: {
        detected: false,
        confidence: 97,
        disease: null,
        recommendations: [
          'Plants are healthy',
          'Continue optimal care',
          'Monitor for pests'
        ]
      }
    };

    return diseases[scenario];
  }
}

module.exports = new DemoService();
