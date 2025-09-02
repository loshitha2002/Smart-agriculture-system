import React, { useState, useEffect } from 'react';
import './DHT22Monitor.css';

const DHT22Monitor = () => {
  const [latestData, setLatestData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Fetch latest DHT22 data
  const fetchLatestData = async () => {
    try {
      const response = await fetch('/api/dht22/latest');
      if (response.ok) {
        const data = await response.json();
        setLatestData(data);
      }
    } catch (err) {
      console.error('Error fetching latest DHT22 data:', err);
    }
  };

  // Fetch DHT22 statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/dht22/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Error fetching DHT22 statistics:', err);
    }
  };

  // Fetch device status
  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch('/api/dht22/status');
      if (response.ok) {
        const data = await response.json();
        setDeviceStatus(data);
      }
    } catch (err) {
      console.error('Error fetching device status:', err);
    }
  };

  // Fetch recent history
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/dht22/history?limit=20');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching DHT22 history:', err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchLatestData(),
        fetchStatistics(),
        fetchDeviceStatus(),
        fetchHistory()
      ]);
    } catch (err) {
      setError('Failed to load DHT22 sensor data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh setup
  useEffect(() => {
    loadAllData();
    
    const interval = setInterval(loadAllData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Get value status (normal/warning/critical)
  const getValueStatus = (type, value) => {
    if (!value && value !== 0) return 'unknown';
    
    if (type === 'temperature') {
      if (value < 10 || value > 40) return 'critical';
      if (value < 15 || value > 35) return 'warning';
      return 'normal';
    }
    
    if (type === 'humidity') {
      if (value < 20 || value > 90) return 'critical';
      if (value < 30 || value > 80) return 'warning';
      return 'normal';
    }
    
    return 'normal';
  };

  if (loading) {
    return (
      <div className="dht22-monitor">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading DHT22 sensor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dht22-monitor">
        <div className="error-message">
          <h3>⚠️ DHT22 Sensor Error</h3>
          <p>{error}</p>
          <button onClick={loadAllData} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dht22-monitor">
      <div className="monitor-header">
        <h2>🌡️ DHT22 Environmental Monitor</h2>
        <div className="refresh-controls">
          <label>
            Auto-refresh:
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1min</option>
              <option value={300}>5min</option>
            </select>
          </label>
          <button onClick={loadAllData} className="manual-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Device Status */}
      {deviceStatus && (
        <div className="device-status">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(deviceStatus.status) }}
          ></div>
          <span className="status-text">
            Device: {deviceStatus.status.toUpperCase()}
          </span>
          {deviceStatus.lastSeen && (
            <span className="last-seen">
              Last seen: {formatTime(deviceStatus.lastSeen)}
            </span>
          )}
        </div>
      )}

      {/* Current Readings */}
      {latestData ? (
        <div className="current-readings">
          <div className={`reading-card temperature ${getValueStatus('temperature', latestData.temperature?.celsius)}`}>
            <div className="reading-icon">🌡️</div>
            <div className="reading-value">
              {latestData.temperature?.celsius?.toFixed(1) || '--'}°C
            </div>
            <div className="reading-label">Temperature</div>
            <div className="reading-time">
              {formatTime(latestData.timestamp)}
            </div>
          </div>

          <div className={`reading-card humidity ${getValueStatus('humidity', latestData.humidity?.value)}`}>
            <div className="reading-icon">💧</div>
            <div className="reading-value">
              {latestData.humidity?.value?.toFixed(1) || '--'}%
            </div>
            <div className="reading-label">Humidity</div>
            <div className="reading-time">
              {formatTime(latestData.timestamp)}
            </div>
          </div>

          {latestData.heatIndex && (
            <div className={`reading-card heat-index ${getValueStatus('temperature', latestData.heatIndex?.celsius)}`}>
              <div className="reading-icon">🔥</div>
              <div className="reading-value">
                {latestData.heatIndex?.celsius?.toFixed(1) || '--'}°C
              </div>
              <div className="reading-label">Heat Index</div>
              <div className="reading-time">
                {formatTime(latestData.timestamp)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          <p>📡 No current sensor data available</p>
          <p>Make sure your DHT22 sensor is connected and sending data</p>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="statistics-section">
          <h3>📊 24-Hour Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Temperature Range:</label>
              <span>
                {statistics.temperature?.min?.toFixed(1) || '--'}°C - {statistics.temperature?.max?.toFixed(1) || '--'}°C
              </span>
            </div>
            <div className="stat-item">
              <label>Average Temperature:</label>
              <span>{statistics.temperature?.avg?.toFixed(1) || '--'}°C</span>
            </div>
            <div className="stat-item">
              <label>Humidity Range:</label>
              <span>
                {statistics.humidity?.min?.toFixed(1) || '--'}% - {statistics.humidity?.max?.toFixed(1) || '--'}%
              </span>
            </div>
            <div className="stat-item">
              <label>Average Humidity:</label>
              <span>{statistics.humidity?.avg?.toFixed(1) || '--'}%</span>
            </div>
            <div className="stat-item">
              <label>Total Readings:</label>
              <span>{statistics.totalReadings || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <div className="history-section">
          <h3>📈 Recent Readings</h3>
          <div className="history-table">
            <div className="table-header">
              <span>Time</span>
              <span>Temperature</span>
              <span>Humidity</span>
              <span>Heat Index</span>
            </div>
            {history.slice(0, 10).map((reading, index) => (
              <div key={index} className="table-row">
                <span className="timestamp">
                  {formatTime(reading.timestamp)}
                </span>
                <span className={`value ${getValueStatus('temperature', reading.temperature?.celsius)}`}>
                  {reading.temperature?.celsius?.toFixed(1) || '--'}°C
                </span>
                <span className={`value ${getValueStatus('humidity', reading.humidity?.value)}`}>
                  {reading.humidity?.value?.toFixed(1) || '--'}%
                </span>
                <span className="value">
                  {reading.heatIndex?.celsius?.toFixed(1) || '--'}°C
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => window.open('/api/dht22/export', '_blank')}
          className="export-btn"
        >
          📊 Export Data
        </button>
        <button 
          onClick={loadAllData}
          className="refresh-btn"
        >
          🔄 Refresh All
        </button>
      </div>
    </div>
  );
};

export default DHT22Monitor;
