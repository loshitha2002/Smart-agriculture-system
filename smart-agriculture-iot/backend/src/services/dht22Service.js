// DHT22 Sensor Data Handler
const express = require('express');

class DHT22Service {
  constructor() {
    this.sensorData = [];
    this.realTimeClients = [];
    this.alertThresholds = {
      temperature: { min: 15, max: 35 },
      humidity: { min: 40, max: 80 }
    };
  }

  // Store incoming DHT22 data
  storeSensorData(data) {
    const processedData = {
      id: this.generateId(),
      deviceId: data.deviceId,
      location: data.location,
      timestamp: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      sensorType: 'DHT22',
      temperature: {
        celsius: parseFloat(data.data.temperature),
        fahrenheit: parseFloat(data.data.temperatureFahrenheit || (data.data.temperature * 9/5 + 32)),
        unit: 'C',
        status: this.getTemperatureStatus(data.data.temperature)
      },
      humidity: {
        value: parseFloat(data.data.humidity),
        unit: '%',
        status: this.getHumidityStatus(data.data.humidity)
      },
      heatIndex: {
        celsius: parseFloat(data.data.heatIndex),
        fahrenheit: parseFloat(data.data.heatIndex * 9/5 + 32),
        unit: 'C'
      },
      metadata: {
        firmwareVersion: data.metadata?.firmwareVersion || 'unknown',
        wifiSignalStrength: data.metadata?.wifiSignalStrength || 0,
        uptimeSeconds: data.metadata?.uptimeSeconds || 0,
        batteryLevel: data.metadata?.batteryLevel || null
      },
      alerts: this.checkAlerts(data.data)
    };

    // Store in memory (in production, use database)
    this.sensorData.push(processedData);
    
    // Keep only last 1000 readings to prevent memory issues
    if (this.sensorData.length > 1000) {
      this.sensorData = this.sensorData.slice(-1000);
    }

    // Broadcast to real-time clients
    this.broadcastRealTimeData(processedData);

    // Check for critical alerts
    if (processedData.alerts.length > 0) {
      this.triggerAlerts(processedData);
    }

    return processedData;
  }

  // Get latest sensor reading
  getLatestReading(deviceId = null) {
    let data = this.sensorData;
    
    if (deviceId) {
      data = data.filter(reading => reading.deviceId === deviceId);
    }
    
    return data.length > 0 ? data[data.length - 1] : null;
  }

  // Get historical data
  getHistoricalData(hours = 24, deviceId = null) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    let data = this.sensorData.filter(reading => 
      new Date(reading.timestamp) > cutoffTime
    );

    if (deviceId) {
      data = data.filter(reading => reading.deviceId === deviceId);
    }

    return data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Get data statistics
  getDataStatistics(hours = 24) {
    const historicalData = this.getHistoricalData(hours);
    
    if (historicalData.length === 0) {
      return { error: 'No data available for the specified period' };
    }

    const temperatures = historicalData.map(d => d.temperature.celsius);
    const humidities = historicalData.map(d => d.humidity.value);

    return {
      period: `Last ${hours} hours`,
      dataPoints: historicalData.length,
      temperature: {
        current: temperatures[temperatures.length - 1],
        average: this.calculateAverage(temperatures),
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
        trend: this.calculateTrend(temperatures)
      },
      humidity: {
        current: humidities[humidities.length - 1],
        average: this.calculateAverage(humidities),
        min: Math.min(...humidities),
        max: Math.max(...humidities),
        trend: this.calculateTrend(humidities)
      },
      alerts: {
        total: historicalData.reduce((sum, d) => sum + d.alerts.length, 0),
        critical: historicalData.filter(d => 
          d.alerts.some(alert => alert.severity === 'critical')
        ).length
      }
    };
  }

  // Check sensor status and health
  getDeviceStatus(deviceId) {
    const latestReading = this.getLatestReading(deviceId);
    
    if (!latestReading) {
      return {
        deviceId,
        status: 'offline',
        lastSeen: null,
        health: 'unknown'
      };
    }

    const lastSeenMinutes = (Date.now() - new Date(latestReading.timestamp)) / (1000 * 60);
    const isOnline = lastSeenMinutes < 5; // Consider offline if no data for 5 minutes

    return {
      deviceId,
      status: isOnline ? 'online' : 'offline',
      lastSeen: latestReading.timestamp,
      lastSeenMinutesAgo: Math.round(lastSeenMinutes),
      health: this.assessDeviceHealth(latestReading),
      signalStrength: latestReading.metadata.wifiSignalStrength,
      uptime: latestReading.metadata.uptimeSeconds,
      firmwareVersion: latestReading.metadata.firmwareVersion
    };
  }

  // Temperature status assessment
  getTemperatureStatus(temperature) {
    const temp = parseFloat(temperature);
    if (temp < this.alertThresholds.temperature.min) return 'too_cold';
    if (temp > this.alertThresholds.temperature.max) return 'too_hot';
    if (temp >= 20 && temp <= 30) return 'optimal';
    return 'normal';
  }

  // Humidity status assessment
  getHumidityStatus(humidity) {
    const hum = parseFloat(humidity);
    if (hum < this.alertThresholds.humidity.min) return 'too_dry';
    if (hum > this.alertThresholds.humidity.max) return 'too_humid';
    if (hum >= 50 && hum <= 70) return 'optimal';
    return 'normal';
  }

  // Check for alerts
  checkAlerts(data) {
    const alerts = [];
    const temp = parseFloat(data.temperature);
    const hum = parseFloat(data.humidity);

    // Temperature alerts
    if (temp < this.alertThresholds.temperature.min) {
      alerts.push({
        type: 'temperature',
        severity: 'warning',
        message: `Temperature too low: ${temp}°C (minimum: ${this.alertThresholds.temperature.min}°C)`,
        value: temp,
        threshold: this.alertThresholds.temperature.min
      });
    } else if (temp > this.alertThresholds.temperature.max) {
      alerts.push({
        type: 'temperature',
        severity: temp > 40 ? 'critical' : 'warning',
        message: `Temperature too high: ${temp}°C (maximum: ${this.alertThresholds.temperature.max}°C)`,
        value: temp,
        threshold: this.alertThresholds.temperature.max
      });
    }

    // Humidity alerts
    if (hum < this.alertThresholds.humidity.min) {
      alerts.push({
        type: 'humidity',
        severity: 'warning',
        message: `Humidity too low: ${hum}% (minimum: ${this.alertThresholds.humidity.min}%)`,
        value: hum,
        threshold: this.alertThresholds.humidity.min
      });
    } else if (hum > this.alertThresholds.humidity.max) {
      alerts.push({
        type: 'humidity',
        severity: hum > 90 ? 'critical' : 'warning',
        message: `Humidity too high: ${hum}% (maximum: ${this.alertThresholds.humidity.max}%)`,
        value: hum,
        threshold: this.alertThresholds.humidity.max
      });
    }

    return alerts;
  }

  // Real-time data broadcasting
  broadcastRealTimeData(data) {
    // In production, use WebSockets or Server-Sent Events
    console.log(`📡 Broadcasting DHT22 data: ${data.temperature.celsius}°C, ${data.humidity.value}%`);
    
    // Store for SSE clients
    this.realTimeClients.forEach(client => {
      if (client.readyState === 1) { // WebSocket OPEN state
        client.send(JSON.stringify({
          type: 'dht22_update',
          data: data
        }));
      }
    });
  }

  // Trigger alerts
  triggerAlerts(data) {
    data.alerts.forEach(alert => {
      console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
      
      // In production, send notifications via:
      // - Email
      // - SMS
      // - Push notifications
      // - Slack/Discord webhooks
    });
  }

  // Assess device health
  assessDeviceHealth(reading) {
    const signalStrength = reading.metadata.wifiSignalStrength;
    const uptime = reading.metadata.uptimeSeconds;
    
    if (signalStrength > -50 && uptime > 3600) return 'excellent';
    if (signalStrength > -70 && uptime > 1800) return 'good';
    if (signalStrength > -85) return 'fair';
    return 'poor';
  }

  // Utility functions
  calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    const recent = values.slice(-5); // Last 5 readings
    const older = values.slice(-10, -5); // Previous 5 readings
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  // Update alert thresholds
  updateThresholds(newThresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    return this.alertThresholds;
  }

  // Export data for analysis
  exportData(format = 'json', hours = 24) {
    const data = this.getHistoricalData(hours);
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return {
      exportDate: new Date().toISOString(),
      dataPoints: data.length,
      period: `${hours} hours`,
      data: data
    };
  }

  convertToCSV(data) {
    const headers = [
      'timestamp', 'deviceId', 'location', 'temperature_celsius', 
      'temperature_fahrenheit', 'humidity', 'heat_index', 'wifi_signal'
    ];
    
    const rows = data.map(d => [
      d.timestamp,
      d.deviceId,
      d.location,
      d.temperature.celsius,
      d.temperature.fahrenheit,
      d.humidity.value,
      d.heatIndex.celsius,
      d.metadata.wifiSignalStrength
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

module.exports = new DHT22Service();
