const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const demoService = require('./services/demoService');
const weatherService = require('./services/weatherService');
const analyticsService = require('./services/analyticsService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Agriculture API is running!',
    timestamp: new Date().toISOString()
  });
});

// Mock sensor data endpoint
app.get('/api/sensors', (req, res) => {
  const mockSensorData = {
    soilMoisture: {
      value: Math.floor(Math.random() * 40) + 20, // 20-60%
      unit: '%',
      status: 'normal',
      lastUpdated: new Date().toISOString()
    },
    temperature: {
      value: Math.floor(Math.random() * 15) + 18, // 18-33°C
      unit: '°C',
      status: 'normal',
      lastUpdated: new Date().toISOString()
    },
    humidity: {
      value: Math.floor(Math.random() * 30) + 40, // 40-70%
      unit: '%',
      status: 'normal',
      lastUpdated: new Date().toISOString()
    },
    lightIntensity: {
      value: Math.floor(Math.random() * 50000) + 10000, // 10000-60000 lux
      unit: 'lux',
      status: 'normal',
      lastUpdated: new Date().toISOString()
    }
  };
  
  res.json(mockSensorData);
});

// Mock irrigation recommendation endpoint
app.get('/api/irrigation/recommendation', (req, res) => {
  const soilMoisture = Math.floor(Math.random() * 40) + 20;
  const shouldIrrigate = soilMoisture < 30;
  
  res.json({
    shouldIrrigate,
    soilMoisture,
    recommendation: shouldIrrigate 
      ? 'Irrigation needed - soil moisture is low' 
      : 'No irrigation needed - soil moisture is adequate',
    waterAmount: shouldIrrigate ? Math.floor(Math.random() * 500) + 200 : 0,
    nextCheck: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
  });
});

// Demo Mode Endpoints
app.get('/api/demo/scenarios', (req, res) => {
  res.json({
    scenarios: demoService.getScenarios(),
    current: demoService.currentScenario
  });
});

app.post('/api/demo/scenario/:scenario', (req, res) => {
  const { scenario } = req.params;
  const success = demoService.setScenario(scenario);
  
  if (success) {
    res.json({
      success: true,
      message: `Demo scenario set to: ${demoService.demoScenarios[scenario]}`,
      scenario: scenario,
      data: demoService.getDemoSensorData(scenario)
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid scenario'
    });
  }
});

app.get('/api/demo/sensors', (req, res) => {
  const scenario = req.query.scenario || demoService.currentScenario;
  res.json(demoService.getDemoSensorData(scenario));
});

app.get('/api/demo/history', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const scenario = req.query.scenario || demoService.currentScenario;
  res.json(demoService.getHistoricalData(hours, scenario));
});

app.get('/api/demo/irrigation', (req, res) => {
  const scenario = req.query.scenario || demoService.currentScenario;
  res.json(demoService.getIrrigationRecommendation(scenario));
});

app.get('/api/demo/disease', (req, res) => {
  const scenario = req.query.scenario || demoService.currentScenario;
  res.json(demoService.getDiseaseDetection(scenario));
});

// Weather Endpoints
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weatherData = await weatherService.getCurrentWeather(lat, lon);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const forecastData = await weatherService.getWeatherForecast(lat, lon);
    res.json(forecastData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch forecast data',
      message: error.message
    });
  }
});

app.get('/api/weather/irrigation', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weatherData = await weatherService.getCurrentWeather(lat, lon);
    const sensorData = demoService.getDemoSensorData();
    const recommendations = weatherService.getIrrigationRecommendations(weatherData, sensorData);
    
    res.json({
      weather: weatherData,
      sensor: sensorData,
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate irrigation recommendations',
      message: error.message
    });
  }
});

app.get('/api/weather/recommendations', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weatherData = await weatherService.getCurrentWeather(lat, lon);
    const forecastData = await weatherService.getWeatherForecast(lat, lon);
    const recommendations = weatherService.getCropRecommendations(weatherData, forecastData);
    
    res.json({
      current: weatherData,
      forecast: forecastData,
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate crop recommendations',
      message: error.message
    });
  }
});

// Advanced Analytics Endpoints
app.get('/api/analytics/historical', (req, res) => {
  try {
    const { days = 7 } = req.query;
    const data = analyticsService.getHistoricalData(parseInt(days));
    
    res.json({
      success: true,
      data: data,
      period: `Last ${days} days`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
});

app.get('/api/analytics/predictions', (req, res) => {
  try {
    const predictions = analyticsService.getPredictiveAnalytics();
    
    res.json({
      success: true,
      predictions: predictions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate predictions',
      message: error.message
    });
  }
});

app.get('/api/analytics/efficiency', (req, res) => {
  try {
    const metrics = analyticsService.getEfficiencyMetrics();
    
    res.json({
      success: true,
      metrics: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch efficiency metrics',
      message: error.message
    });
  }
});

app.get('/api/analytics/comparison', (req, res) => {
  try {
    const analysis = analyticsService.getComparativeAnalysis();
    
    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch comparative analysis',
      message: error.message
    });
  }
});

app.get('/api/analytics/realtime', (req, res) => {
  try {
    const metrics = analyticsService.getRealTimeMetrics();
    
    res.json({
      success: true,
      metrics: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch real-time metrics',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Agriculture API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Sensor data: http://localhost:${PORT}/api/sensors`);
  console.log(`🎯 Demo mode: http://localhost:${PORT}/api/demo/scenarios`);
  console.log(`🌤️ Weather API: http://localhost:${PORT}/api/weather/current`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/analytics/historical`);
});
