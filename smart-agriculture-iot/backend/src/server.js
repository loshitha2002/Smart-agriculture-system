const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const demoService = require('./services/demoService');
const weatherService = require('./services/weatherService');
const analyticsService = require('./services/analyticsService');
const RealAnalyticsService = require('./services/realAnalyticsService');
const RealIrrigationService = require('./services/realIrrigationService');
const dht22Service = require('./services/dht22Service');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services
const realAnalytics = new RealAnalyticsService();
const realIrrigation = new RealIrrigationService();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (disease detection)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`📁 File upload: ${file.originalname}, MIME: ${file.mimetype}`);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    
    // Check both MIME type and file extension
    const ext = file.originalname.toLowerCase().split('.').pop();
    const isMimeValid = allowedTypes.includes(file.mimetype);
    const isExtValid = allowedExtensions.includes(`.${ext}`);
    
    if (isMimeValid || isExtValid) {
      cb(null, true);
    } else {
      console.log(`❌ File rejected: ${file.originalname}, MIME: ${file.mimetype}, Ext: .${ext}`);
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

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

// Real irrigation recommendation endpoint
app.get('/api/irrigation/recommendation', async (req, res) => {
  try {
    const recommendation = await realIrrigation.getRecommendation();
    res.json(recommendation);
  } catch (error) {
    console.error('Error getting irrigation recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to get irrigation recommendation',
      fallback: await realIrrigation.getFallbackRecommendation()
    });
  }
});

// Get irrigation history
app.get('/api/irrigation/history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = realIrrigation.getHistory(days);
    res.json(history);
  } catch (error) {
    console.error('Error getting irrigation history:', error);
    res.status(500).json({ error: 'Failed to get irrigation history' });
  }
});

// Get irrigation schedule
app.get('/api/irrigation/schedule', (req, res) => {
  try {
    const schedule = realIrrigation.getSchedule();
    res.json(schedule);
  } catch (error) {
    console.error('Error getting irrigation schedule:', error);
    res.status(500).json({ error: 'Failed to get irrigation schedule' });
  }
});

// Get water usage analytics
app.get('/api/irrigation/usage', (req, res) => {
  try {
    const usage = realIrrigation.getUsageAnalytics();
    res.json(usage);
  } catch (error) {
    console.error('Error getting water usage analytics:', error);
    res.status(500).json({ error: 'Failed to get usage analytics' });
  }
});

// Get irrigation zones
app.get('/api/irrigation/zones', (req, res) => {
  try {
    const zones = realIrrigation.getZones();
    res.json(zones);
  } catch (error) {
    console.error('Error getting irrigation zones:', error);
    res.status(500).json({ error: 'Failed to get zones' });
  }
});

// Start manual irrigation
app.post('/api/irrigation/start', async (req, res) => {
  try {
    const { zones, duration } = req.body;
    if (!zones || !duration) {
      return res.status(400).json({ error: 'Missing zones or duration' });
    }
    const result = await realIrrigation.startIrrigation(zones, duration);
    res.json(result);
  } catch (error) {
    console.error('Error starting irrigation:', error);
    res.status(500).json({ error: 'Failed to start irrigation' });
  }
});

// Update irrigation settings
app.put('/api/irrigation/settings', (req, res) => {
  try {
    const settings = realIrrigation.updateSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating irrigation settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
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

// Advanced Analytics Endpoints - Using Real Data
app.get('/api/analytics/historical', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    console.log(`📊 Fetching ${days} days of real analytics data...`);
    
    const data = realAnalytics.getHistoricalData(parseInt(days));
    
    res.json({
      success: true,
      data: data.data,
      metadata: data.metadata,
      period: `Last ${days} days`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
});

app.get('/api/analytics/predictions', async (req, res) => {
  try {
    console.log('🔮 Generating predictions from real data...');
    const predictions = realAnalytics.getPredictions();
    
    res.json({
      success: true,
      predictions: predictions.predictions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Predictions error:', error);
    res.status(500).json({
      error: 'Failed to generate predictions',
      message: error.message
    });
  }
});

app.get('/api/analytics/efficiency', async (req, res) => {
  try {
    console.log('⚡ Calculating efficiency metrics...');
    const metrics = realAnalytics.getEfficiencyMetrics();
    
    res.json({
      success: true,
      metrics: metrics.metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Efficiency error:', error);
    res.status(500).json({
      error: 'Failed to fetch efficiency metrics',
      message: error.message
    });
  }
});

app.get('/api/analytics/comparison', async (req, res) => {
  try {
    console.log('📊 Generating comparative analysis...');
    const analysis = realAnalytics.getComparativeAnalysis();
    
    res.json({
      success: true,
      analysis: analysis.analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Comparison error:', error);
    res.status(500).json({
      error: 'Failed to fetch comparative analysis',
      message: error.message
    });
  }
});

app.get('/api/analytics/realtime', async (req, res) => {
  try {
    console.log('⚡ Fetching real-time metrics...');
    const todayData = realAnalytics.getHistoricalData(1);
    
    res.json({
      success: true,
      metrics: todayData.data[0] || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Real-time error:', error);
    res.status(500).json({
      error: 'Failed to fetch real-time metrics',
      message: error.message
    });
  }
});

// DHT22 Sensor Endpoints
app.post('/api/sensors/dht22/data', (req, res) => {
  try {
    console.log('📡 Received DHT22 data:', req.body);
    
    const processedData = dht22Service.storeSensorData(req.body);
    
    res.json({
      success: true,
      message: 'DHT22 data stored successfully',
      data: processedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error processing DHT22 data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process DHT22 data',
      message: error.message
    });
  }
});

app.get('/api/sensors/dht22/latest', (req, res) => {
  try {
    const { deviceId } = req.query;
    const latestData = dht22Service.getLatestReading(deviceId);
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No DHT22 data found'
      });
    }
    
    res.json({
      success: true,
      data: latestData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest DHT22 data',
      message: error.message
    });
  }
});

app.get('/api/sensors/dht22/history', (req, res) => {
  try {
    const { hours = 24, deviceId } = req.query;
    const historicalData = dht22Service.getHistoricalData(parseInt(hours), deviceId);
    
    res.json({
      success: true,
      data: historicalData,
      count: historicalData.length,
      period: `Last ${hours} hours`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DHT22 historical data',
      message: error.message
    });
  }
});

app.get('/api/sensors/dht22/statistics', (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const statistics = dht22Service.getDataStatistics(parseInt(hours));
    
    res.json({
      success: true,
      statistics: statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DHT22 statistics',
      message: error.message
    });
  }
});

app.get('/api/sensors/dht22/status/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    const deviceStatus = dht22Service.getDeviceStatus(deviceId);
    
    res.json({
      success: true,
      status: deviceStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device status',
      message: error.message
    });
  }
});

app.put('/api/sensors/dht22/thresholds', (req, res) => {
  try {
    const newThresholds = dht22Service.updateThresholds(req.body);
    
    res.json({
      success: true,
      message: 'Alert thresholds updated successfully',
      thresholds: newThresholds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update thresholds',
      message: error.message
    });
  }
});

app.get('/api/sensors/dht22/export', (req, res) => {
  try {
    const { format = 'json', hours = 24 } = req.query;
    const exportData = dht22Service.exportData(format, parseInt(hours));
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=dht22_data.csv');
      res.send(exportData);
    } else {
      res.json({
        success: true,
        export: exportData,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export DHT22 data',
      message: error.message
    });
  }
});

// Frontend-compatible DHT22 endpoints (shorter paths)
app.get('/api/dht22/latest', (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'DHT22_001';
    const latestData = dht22Service.getLatestReading(deviceId);
    
    if (latestData) {
      res.json(latestData);
    } else {
      res.status(404).json({
        success: false,
        message: 'No DHT22 data found'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching latest DHT22 data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest DHT22 data',
      message: error.message
    });
  }
});

app.get('/api/dht22/history', (req, res) => {
  try {
    const hours = req.query.hours || 24;
    const deviceId = req.query.deviceId;
    const limit = req.query.limit || 50;
    
    const historicalData = dht22Service.getHistoricalData(parseInt(hours), deviceId);
    res.json(historicalData.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('❌ Error fetching DHT22 history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DHT22 historical data',
      message: error.message
    });
  }
});

app.get('/api/dht22/statistics', (req, res) => {
  try {
    const hours = req.query.hours || 24;
    const statistics = dht22Service.getDataStatistics(parseInt(hours));
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error fetching DHT22 statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DHT22 statistics',
      message: error.message
    });
  }
});

app.get('/api/dht22/status', (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'DHT22_001';
    const deviceStatus = dht22Service.getDeviceStatus(deviceId);
    res.json(deviceStatus);
  } catch (error) {
    console.error('❌ Error fetching DHT22 device status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DHT22 device status',
      message: error.message
    });
  }
});

app.get('/api/dht22/export', (req, res) => {
  try {
    const hours = req.query.hours || 24;
    const format = req.query.format || 'json';
    const deviceId = req.query.deviceId;
    
    const data = dht22Service.getHistoricalData(parseInt(hours), deviceId);
    
    if (format === 'csv') {
      const csv = dht22Service.exportToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dht22_data_${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="dht22_data_${Date.now()}.json"`);
      res.json({
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        timeRange: `${hours} hours`,
        data: data
      });
    }
  } catch (error) {
    console.error('❌ Error exporting DHT22 data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export DHT22 data',
      message: error.message
    });
  }
});

// ===================================
// Disease Detection Endpoints
// ===================================

// Upload and analyze plant image for disease detection
app.post('/api/disease/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        message: 'Please upload an image file'
      });
    }

    console.log(`🔬 Processing disease detection for: ${req.file.originalname}`);

    // Try to forward to ML service
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      const response = await axios.post(`${ML_SERVICE_URL}/api/disease/detect`, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ ML service response received');
      
      // Record disease detection in analytics
      realAnalytics.recordDiseaseDetection(response.data);
      
      res.json(response.data);

    } catch (mlError) {
      console.log('⚠️ ML service unavailable, using fallback detection');
      
      // Fallback: Mock disease detection
      const mockResult = generateMockDiseaseDetection(req.file.originalname);
      res.json(mockResult);
    }

  } catch (error) {
    console.error('❌ Error in disease detection:', error);
    res.status(500).json({
      success: false,
      error: 'Disease detection failed',
      message: error.message
    });
  }
});

// Get disease information
app.get('/api/disease/info/:diseaseName', async (req, res) => {
  try {
    const { diseaseName } = req.params;
    
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/api/disease/info/${encodeURIComponent(diseaseName)}`);
      res.json(response.data);
    } catch (mlError) {
      // Fallback disease info
      const mockInfo = getMockDiseaseInfo(diseaseName);
      res.json(mockInfo);
    }

  } catch (error) {
    console.error('❌ Error fetching disease info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease information',
      message: error.message
    });
  }
});

// List all supported diseases
app.get('/api/disease/list', async (req, res) => {
  try {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/api/diseases/list`);
      res.json(response.data);
    } catch (mlError) {
      // Fallback disease list
      const mockList = getMockDiseaseList();
      res.json(mockList);
    }

  } catch (error) {
    console.error('❌ Error listing diseases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list diseases',
      message: error.message
    });
  }
});

// Mock disease detection function
function generateMockDiseaseDetection(filename) {
  const diseases = [
    {
      disease_name: 'Tomato Late Blight',
      confidence: 89.5,
      severity: 'Critical',
      symptoms: ['Dark water-soaked spots', 'White mold growth', 'Rapid spread'],
      treatment: 'Apply Metalaxyl + Mancozeb immediately. Remove affected plants.',
      prevention: 'Avoid overhead irrigation, improve drainage',
      recovery_time: '7-10 days',
      cost_per_hectare: '$40-60'
    },
    {
      disease_name: 'Corn Northern Leaf Blight',
      confidence: 92.3,
      severity: 'High',
      symptoms: ['Cigar-shaped lesions', 'Gray-green color', 'Tan centers'],
      treatment: 'Apply Strobilurin fungicides. Remove infected debris.',
      prevention: 'Crop rotation, resistant hybrids, balanced fertilization',
      recovery_time: '14-18 days',
      cost_per_hectare: '$30-40'
    },
    {
      disease_name: 'Apple Scab',
      confidence: 85.7,
      severity: 'Moderate',
      symptoms: ['Dark, scaly lesions on leaves', 'Olive-green spots', 'Premature leaf drop'],
      treatment: 'Apply fungicide spray (Captan or Mancozeb). Remove fallen leaves.',
      prevention: 'Choose resistant varieties, improve air circulation',
      recovery_time: '14-21 days',
      cost_per_hectare: '$25-35'
    },
    {
      disease_name: 'Wheat Rust',
      confidence: 88.9,
      severity: 'Moderate',
      symptoms: ['Orange pustules on leaves', 'Yellowing', 'Premature leaf drop'],
      treatment: 'Apply Propiconazole (0.1%) or Tebuconazole (0.1%) spray.',
      prevention: 'Plant resistant varieties, proper spacing, monitor weather',
      recovery_time: '14-21 days',
      cost_per_hectare: '$20-30'
    }
  ];

  const selectedDisease = diseases[Math.floor(Math.random() * diseases.length)];
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    prediction: selectedDisease,
    recommendations: [
      "🚨 Disease detected! Take immediate action to prevent spread.",
      "🔬 Consider laboratory confirmation for critical cases.",
      "📞 Consult with local agricultural extension services.",
      "💧 Adjust irrigation practices based on disease type.",
      "🌿 Monitor neighboring plants for similar symptoms."
    ],
    metadata: {
      filename: filename,
      processing_mode: 'mock',
      ml_service_available: false
    },
    is_mock: true
  };
}

function getMockDiseaseInfo(diseaseName) {
  return {
    success: true,
    disease_name: diseaseName,
    info: {
      name: diseaseName.replace(/_/g, ' '),
      severity: 'Moderate',
      symptoms: ['Consult agricultural expert for specific symptoms'],
      treatment: 'Professional diagnosis recommended',
      prevention: 'Follow good agricultural practices',
      recovery_time: 'Variable',
      cost_per_hectare: 'Estimate needed'
    },
    timestamp: new Date().toISOString()
  };
}

function getMockDiseaseList() {
  return {
    success: true,
    diseases: [
      { class_name: 'Tomato___Late_blight', display_name: 'Tomato Late Blight', severity: 'Critical' },
      { class_name: 'Corn___Northern_Leaf_Blight', display_name: 'Corn Northern Leaf Blight', severity: 'High' },
      { class_name: 'Apple___Apple_scab', display_name: 'Apple Scab', severity: 'Moderate' },
      { class_name: 'Wheat___Rust', display_name: 'Wheat Rust', severity: 'Moderate' }
    ],
    total_count: 4,
    timestamp: new Date().toISOString()
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Agriculture API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Sensor data: http://localhost:${PORT}/api/sensors`);
  console.log(`🎯 Demo mode: http://localhost:${PORT}/api/demo/scenarios`);
  console.log(`🌤️ Weather API: http://localhost:${PORT}/api/weather/current`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/analytics/historical`);
  console.log(`🌡️ DHT22 Sensor API: http://localhost:${PORT}/api/sensors/dht22/latest`);
  console.log(`🔬 Disease Detection API: http://localhost:${PORT}/api/disease/detect`);
  console.log(`🧠 ML Service URL: ${ML_SERVICE_URL}`);
});
