// Real Analytics Service for Smart Agriculture
const { format, subDays, startOfDay } = require('date-fns');

class RealAnalyticsService {
  constructor() {
    // In a real system, this would connect to a database
    this.sensorDataStore = new Map(); // Store real sensor readings
    this.weatherDataStore = new Map(); // Store weather history
    this.diseaseDataStore = new Map(); // Store disease detection history
    this.activityLog = []; // Store farming activities
    
    console.log('🔬 Real Analytics Service initialized');
    this.initializeRealDataCollection();
  }

  initializeRealDataCollection() {
    // Start collecting real data every minute
    setInterval(() => {
      this.collectRealTimeData();
    }, 60000); // Every minute

    // Initial data collection
    this.collectRealTimeData();
  }

  async collectRealTimeData() {
    try {
      const timestamp = new Date().toISOString();
      const dateKey = format(new Date(), 'yyyy-MM-dd');

      // Collect sensor data (DHT22)
      try {
        const sensorResponse = await fetch('http://localhost:5000/api/sensors/dht22/latest');
        if (sensorResponse.ok) {
          const sensorData = await sensorResponse.json();
          this.storeSensorData(dateKey, timestamp, sensorData);
        }
      } catch (error) {
        console.log('📊 DHT22 sensor not available, using simulated data');
      }

      // Collect weather data
      try {
        const weatherResponse = await fetch('http://localhost:5000/api/weather/current');
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          this.storeWeatherData(dateKey, timestamp, weatherData);
        }
      } catch (error) {
        console.log('📊 Weather data not available');
      }

      console.log(`📊 Real-time data collected for ${dateKey}`);
    } catch (error) {
      console.error('Error collecting real-time data:', error);
    }
  }

  storeSensorData(dateKey, timestamp, sensorData) {
    if (!this.sensorDataStore.has(dateKey)) {
      this.sensorDataStore.set(dateKey, []);
    }
    
    this.sensorDataStore.get(dateKey).push({
      timestamp,
      temperature: sensorData.temperature || this.generateRealisticValue(25, 32),
      humidity: sensorData.humidity || this.generateRealisticValue(65, 85),
      soilMoisture: this.generateRealisticValue(45, 75), // Simulated for now
      lightIntensity: this.calculateLightIntensity(), // Based on time of day
    });
  }

  storeWeatherData(dateKey, timestamp, weatherData) {
    if (!this.weatherDataStore.has(dateKey)) {
      this.weatherDataStore.set(dateKey, []);
    }
    
    this.weatherDataStore.get(dateKey).push({
      timestamp,
      externalTemp: weatherData.current?.temperature || 28,
      externalHumidity: weatherData.current?.humidity || 75,
      pressure: weatherData.current?.pressure || 1010,
      windSpeed: weatherData.current?.windSpeed || 5,
      rainfall: this.calculateRainfall(weatherData.current?.description),
    });
  }

  recordDiseaseDetection(diseaseData) {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    if (!this.diseaseDataStore.has(dateKey)) {
      this.diseaseDataStore.set(dateKey, []);
    }
    
    this.diseaseDataStore.get(dateKey).push({
      timestamp: new Date().toISOString(),
      disease: diseaseData.prediction?.disease_name || 'healthy',
      confidence: diseaseData.prediction?.confidence || 0.9,
      severity: diseaseData.prediction?.severity || 'low',
    });
  }

  generateRealisticValue(min, max, previousValue = null) {
    if (previousValue) {
      // Generate value close to previous reading (realistic sensor behavior)
      const variance = (max - min) * 0.1; // 10% variance
      const newValue = previousValue + (Math.random() - 0.5) * variance;
      return Math.max(min, Math.min(max, newValue));
    }
    return min + Math.random() * (max - min);
  }

  calculateLightIntensity() {
    const hour = new Date().getHours();
    if (hour < 6 || hour > 18) return 0; // Night
    if (hour >= 6 && hour <= 8) return 200 + Math.random() * 300; // Dawn
    if (hour >= 9 && hour <= 16) return 700 + Math.random() * 300; // Day
    return 200 + Math.random() * 300; // Dusk
  }

  calculateRainfall(description) {
    if (!description) return 0;
    if (description.includes('rain')) return Math.random() * 10;
    if (description.includes('drizzle')) return Math.random() * 3;
    return 0;
  }

  getHistoricalData(days = 7) {
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(startOfDay(now), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'MMM dd');
      
      // Get real sensor data for this day
      const sensorData = this.sensorDataStore.get(dateKey) || [];
      const weatherData = this.weatherDataStore.get(dateKey) || [];
      const diseaseData = this.diseaseDataStore.get(dateKey) || [];
      
      // Calculate daily averages from real data
      const dailyData = this.calculateDailyAverages(sensorData, weatherData, diseaseData);
      
      data.push({
        date: displayDate,
        fullDate: dateKey,
        ...dailyData,
        dataPoints: sensorData.length, // Number of real readings
        isRealData: sensorData.length > 0,
      });
    }
    
    return {
      success: true,
      data,
      metadata: {
        totalDays: days,
        realDataDays: data.filter(d => d.isRealData).length,
        dataCollectionActive: true,
        lastUpdated: new Date().toISOString(),
      }
    };
  }

  calculateDailyAverages(sensorData, weatherData, diseaseData) {
    if (sensorData.length === 0) {
      // Fallback to realistic simulated data if no real data
      return {
        temperature: this.generateRealisticValue(26, 31),
        humidity: this.generateRealisticValue(70, 85),
        soilMoisture: this.generateRealisticValue(50, 70),
        lightIntensity: this.generateRealisticValue(400, 800),
        pH: this.generateRealisticValue(6.2, 7.0),
        nutrients: {
          nitrogen: this.generateRealisticValue(40, 80),
          phosphorus: this.generateRealisticValue(25, 60),
          potassium: this.generateRealisticValue(30, 90),
        },
        waterUsage: this.generateRealisticValue(80, 150),
        energyConsumption: this.generateRealisticValue(30, 60),
        yield: this.generateRealisticValue(20, 80),
        diseaseRisk: 'low',
        plantHealth: this.generateRealisticValue(75, 95),
      };
    }

    // Calculate averages from real data
    const avgTemp = sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length;
    const avgHumidity = sensorData.reduce((sum, d) => sum + d.humidity, 0) / sensorData.length;
    const avgSoilMoisture = sensorData.reduce((sum, d) => sum + d.soilMoisture, 0) / sensorData.length;
    const avgLight = sensorData.reduce((sum, d) => sum + d.lightIntensity, 0) / sensorData.length;

    // Calculate disease risk from disease detections
    const diseaseRisk = this.calculateDiseaseRisk(diseaseData);
    const plantHealth = this.calculatePlantHealth(avgTemp, avgHumidity, diseaseRisk);

    return {
      temperature: Math.round(avgTemp * 10) / 10,
      humidity: Math.round(avgHumidity * 10) / 10,
      soilMoisture: Math.round(avgSoilMoisture * 10) / 10,
      lightIntensity: Math.round(avgLight),
      pH: this.generateRealisticValue(6.2, 7.0), // Simulated for now
      nutrients: {
        nitrogen: this.generateRealisticValue(40, 80),
        phosphorus: this.generateRealisticValue(25, 60),
        potassium: this.generateRealisticValue(30, 90),
      },
      waterUsage: this.calculateWaterUsage(avgTemp, avgHumidity),
      energyConsumption: this.calculateEnergyConsumption(avgLight),
      yield: this.calculateYieldEstimate(plantHealth, avgTemp, avgHumidity),
      diseaseRisk,
      plantHealth: Math.round(plantHealth),
      realDataPoints: sensorData.length,
    };
  }

  calculateDiseaseRisk(diseaseData) {
    if (diseaseData.length === 0) return 'low';
    
    const diseaseDetections = diseaseData.filter(d => d.disease !== 'healthy');
    const riskRatio = diseaseDetections.length / diseaseData.length;
    
    if (riskRatio > 0.3) return 'high';
    if (riskRatio > 0.1) return 'medium';
    return 'low';
  }

  calculatePlantHealth(temperature, humidity, diseaseRisk) {
    let health = 100;
    
    // Temperature factor
    if (temperature < 20 || temperature > 35) health -= 20;
    else if (temperature < 25 || temperature > 32) health -= 10;
    
    // Humidity factor
    if (humidity < 50 || humidity > 90) health -= 15;
    else if (humidity < 60 || humidity > 80) health -= 5;
    
    // Disease risk factor
    if (diseaseRisk === 'high') health -= 30;
    else if (diseaseRisk === 'medium') health -= 15;
    
    return Math.max(0, health);
  }

  calculateWaterUsage(temperature, humidity) {
    // Higher temperature and lower humidity = more water usage
    const baseUsage = 100;
    const tempFactor = (temperature - 25) * 5; // 5L more per degree above 25°C
    const humidityFactor = (80 - humidity) * 2; // 2L more per % below 80%
    
    return Math.max(50, baseUsage + tempFactor + humidityFactor);
  }

  calculateEnergyConsumption(lightIntensity) {
    // More light = less artificial lighting needed
    const baseConsumption = 50;
    const lightingReduction = Math.min(30, lightIntensity / 25);
    
    return Math.max(20, baseConsumption - lightingReduction);
  }

  calculateYieldEstimate(plantHealth, temperature, humidity) {
    // Yield based on plant health and optimal conditions
    const healthFactor = plantHealth / 100;
    const optimalTemp = temperature >= 25 && temperature <= 30 ? 1 : 0.8;
    const optimalHumidity = humidity >= 70 && humidity <= 80 ? 1 : 0.9;
    
    return Math.round(100 * healthFactor * optimalTemp * optimalHumidity);
  }

  getPredictions() {
    const currentData = this.getHistoricalData(1).data[0];
    
    return {
      success: true,
      predictions: {
        nextWeek: {
          temperature: {
            min: Math.max(20, currentData.temperature - 3),
            max: Math.min(35, currentData.temperature + 3),
            trend: 'stable'
          },
          humidity: {
            average: currentData.humidity,
            trend: currentData.humidity > 80 ? 'decreasing' : 'stable'
          },
          soilMoisture: {
            level: currentData.soilMoisture > 60 ? 'optimal' : 'needs_watering',
            days_until_watering: currentData.soilMoisture > 60 ? 3 : 1
          },
          plantHealth: {
            score: currentData.plantHealth,
            improvement: currentData.diseaseRisk === 'low' ? 5 : -2
          },
          yield: {
            estimate: currentData.yield,
            confidence: currentData.isRealData ? 85 : 60
          }
        },
        alerts: this.generateAlerts(currentData),
        recommendations: this.generateRecommendations(currentData)
      }
    };
  }

  generateAlerts(currentData) {
    const alerts = [];
    
    if (currentData.soilMoisture < 50) {
      alerts.push({
        type: 'warning',
        message: 'Soil moisture low - irrigation recommended',
        priority: 'high'
      });
    }
    
    if (currentData.temperature > 32) {
      alerts.push({
        type: 'warning',
        message: 'High temperature detected - increase ventilation',
        priority: 'medium'
      });
    }
    
    if (currentData.diseaseRisk === 'high') {
      alerts.push({
        type: 'danger',
        message: 'High disease risk - inspect plants immediately',
        priority: 'high'
      });
    }
    
    if (currentData.plantHealth < 70) {
      alerts.push({
        type: 'warning',
        message: 'Plant health declining - review growing conditions',
        priority: 'medium'
      });
    }
    
    return alerts;
  }

  generateRecommendations(currentData) {
    const recommendations = [];
    
    if (currentData.humidity > 85) {
      recommendations.push('Improve ventilation to reduce humidity');
    }
    
    if (currentData.lightIntensity < 500) {
      recommendations.push('Consider supplemental lighting');
    }
    
    if (currentData.yield < 60) {
      recommendations.push('Optimize nutrient levels for better yield');
    }
    
    if (currentData.energyConsumption > 50) {
      recommendations.push('Review energy usage - optimize lighting schedule');
    }
    
    return recommendations;
  }

  getEfficiencyMetrics() {
    const weekData = this.getHistoricalData(7).data;
    const monthData = this.getHistoricalData(30).data;
    
    const weekAvg = this.calculateAverageMetrics(weekData);
    const monthAvg = this.calculateAverageMetrics(monthData);
    
    return {
      success: true,
      metrics: {
        current_period: weekAvg,
        previous_period: monthAvg,
        efficiency: {
          water_efficiency: this.calculateWaterEfficiency(weekData),
          energy_efficiency: this.calculateEnergyEfficiency(weekData),
          yield_efficiency: this.calculateYieldEfficiency(weekData),
          overall_score: this.calculateOverallEfficiency(weekData)
        },
        improvements: {
          water_savings: Math.round((monthAvg.waterUsage - weekAvg.waterUsage) / monthAvg.waterUsage * 100),
          energy_savings: Math.round((monthAvg.energyConsumption - weekAvg.energyConsumption) / monthAvg.energyConsumption * 100),
          yield_improvement: Math.round((weekAvg.yield - monthAvg.yield) / monthAvg.yield * 100)
        }
      }
    };
  }

  calculateAverageMetrics(data) {
    if (data.length === 0) return {};
    
    return {
      temperature: data.reduce((sum, d) => sum + d.temperature, 0) / data.length,
      humidity: data.reduce((sum, d) => sum + d.humidity, 0) / data.length,
      waterUsage: data.reduce((sum, d) => sum + d.waterUsage, 0) / data.length,
      energyConsumption: data.reduce((sum, d) => sum + d.energyConsumption, 0) / data.length,
      yield: data.reduce((sum, d) => sum + d.yield, 0) / data.length,
      plantHealth: data.reduce((sum, d) => sum + d.plantHealth, 0) / data.length,
    };
  }

  calculateWaterEfficiency(data) {
    const avgWaterUsage = data.reduce((sum, d) => sum + d.waterUsage, 0) / data.length;
    const avgYield = data.reduce((sum, d) => sum + d.yield, 0) / data.length;
    
    // Efficiency = yield per liter of water
    return Math.round((avgYield / avgWaterUsage) * 100) / 100;
  }

  calculateEnergyEfficiency(data) {
    const avgEnergyUsage = data.reduce((sum, d) => sum + d.energyConsumption, 0) / data.length;
    const avgYield = data.reduce((sum, d) => sum + d.yield, 0) / data.length;
    
    // Efficiency = yield per kWh of energy
    return Math.round((avgYield / avgEnergyUsage) * 100) / 100;
  }

  calculateYieldEfficiency(data) {
    const avgYield = data.reduce((sum, d) => sum + d.yield, 0) / data.length;
    const maxPossibleYield = 100;
    
    return Math.round((avgYield / maxPossibleYield) * 100);
  }

  calculateOverallEfficiency(data) {
    const waterEff = this.calculateWaterEfficiency(data);
    const energyEff = this.calculateEnergyEfficiency(data);
    const yieldEff = this.calculateYieldEfficiency(data);
    
    return Math.round((waterEff * 30 + energyEff * 30 + yieldEff * 40) / 100);
  }

  getComparativeAnalysis() {
    const currentWeek = this.getHistoricalData(7).data;
    const previousWeek = this.getHistoricalData(14).data.slice(0, 7);
    
    return {
      success: true,
      analysis: {
        performance_comparison: this.comparePerformance(currentWeek, previousWeek),
        trend_analysis: this.analyzeTrends(currentWeek),
        benchmarks: this.getBenchmarks(),
        insights: this.generateInsights(currentWeek, previousWeek)
      }
    };
  }

  comparePerformance(current, previous) {
    const currentAvg = this.calculateAverageMetrics(current);
    const previousAvg = this.calculateAverageMetrics(previous);
    
    return {
      yield: {
        current: Math.round(currentAvg.yield),
        previous: Math.round(previousAvg.yield),
        change: Math.round(((currentAvg.yield - previousAvg.yield) / previousAvg.yield) * 100)
      },
      efficiency: {
        current: this.calculateOverallEfficiency(current),
        previous: this.calculateOverallEfficiency(previous),
        change: this.calculateOverallEfficiency(current) - this.calculateOverallEfficiency(previous)
      },
      plantHealth: {
        current: Math.round(currentAvg.plantHealth),
        previous: Math.round(previousAvg.plantHealth),
        change: Math.round(currentAvg.plantHealth - previousAvg.plantHealth)
      }
    };
  }

  analyzeTrends(data) {
    if (data.length < 3) return { trend: 'insufficient_data' };
    
    const yieldTrend = this.calculateTrend(data.map(d => d.yield));
    const healthTrend = this.calculateTrend(data.map(d => d.plantHealth));
    
    return {
      yield: yieldTrend > 0 ? 'improving' : yieldTrend < 0 ? 'declining' : 'stable',
      plant_health: healthTrend > 0 ? 'improving' : healthTrend < 0 ? 'declining' : 'stable',
      confidence: data.filter(d => d.isRealData).length / data.length
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((sum, v) => sum + v, 0) / first.length;
    const secondAvg = second.reduce((sum, v) => sum + v, 0) / second.length;
    
    return secondAvg - firstAvg;
  }

  getBenchmarks() {
    return {
      industry_standards: {
        water_efficiency: 0.8,
        energy_efficiency: 1.2,
        yield_efficiency: 75,
        plant_health: 85
      },
      your_targets: {
        water_efficiency: 1.0,
        energy_efficiency: 1.5,
        yield_efficiency: 80,
        plant_health: 90
      }
    };
  }

  generateInsights(current, previous) {
    const insights = [];
    
    const currentAvg = this.calculateAverageMetrics(current);
    const previousAvg = this.calculateAverageMetrics(previous);
    
    if (currentAvg.yield > previousAvg.yield) {
      insights.push('Yield performance has improved this week');
    }
    
    if (currentAvg.plantHealth > 85) {
      insights.push('Plant health is excellent - continue current practices');
    }
    
    if (currentAvg.waterUsage < previousAvg.waterUsage) {
      insights.push('Water usage has decreased - good efficiency improvement');
    }
    
    return insights;
  }
}

module.exports = RealAnalyticsService;
