const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Agriculture API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Sensor data: http://localhost:${PORT}/api/sensors`);
});
