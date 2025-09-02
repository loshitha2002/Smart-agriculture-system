import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import WeatherWidget from '../components/Weather/WeatherWidget';
import PWAStatus from '../components/PWA/PWAStatus';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);
  const [dht22Data, setDht22Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const fetchSensorData = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Fetch regular sensor data
      const response = await axios.get('http://localhost:5000/api/sensors');
      setSensorData(response.data);
      
      // Fetch DHT22 data
      try {
        const dht22Response = await axios.get('http://localhost:5000/api/dht22/latest');
        setDht22Data(dht22Response.data);
      } catch (dht22Error) {
        console.log('DHT22 sensor not available yet');
        setDht22Data(null);
      }
      
      setLastUpdated(new Date());
      setConnectionStatus('connected');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setConnectionStatus('disconnected');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const SensorCard = ({ title, data, icon, color = 'primary' }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'normal': return 'text-success';
        case 'warning': return 'text-warning';
        case 'critical': return 'text-error';
        default: return 'text-gray-500';
      }
    };

    const getCardStyle = () => {
      switch (color) {
        case 'primary': return 'border-l-primary';
        case 'secondary': return 'border-l-secondary';
        case 'success': return 'border-l-success';
        case 'warning': return 'border-l-warning';
        default: return 'border-l-primary';
      }
    };

    return (
      <div className={`metric-card ${getCardStyle()} animate-fadeIn`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl opacity-80">{icon}</div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {title}
              </p>
              <p className="text-3xl font-bold text-gray-900 leading-none">
                {data?.value || '--'} 
                <span className="text-lg text-gray-500 ml-1">{data?.unit}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`status-indicator ${
              data?.status === 'normal' ? 'status-success' : 
              data?.status === 'warning' ? 'status-warning' : 
              'status-error'
            }`}>
              {data?.status || 'unknown'}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : '--:--'}
          </div>
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <button 
      onClick={onClick}
      className={`card card-body text-left w-full group hover:scale-105 transition-all duration-300 bg-gradient-${color}`}
    >
      <div className="flex items-center justify-between text-white">
        <div>
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
        <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>
    </button>
  );

  const ConnectionIndicator = () => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        connectionStatus === 'connected' ? 'bg-success animate-pulse' :
        connectionStatus === 'connecting' ? 'bg-warning animate-pulse' :
        'bg-error'
      }`}></div>
      <span className="text-sm font-medium text-gray-600">
        {connectionStatus === 'connected' ? 'Connected' :
         connectionStatus === 'connecting' ? 'Connecting...' :
         'Disconnected'}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Farm Data</h2>
          <p className="text-gray-500">Connecting to sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Farm Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Real-time monitoring and intelligent insights for your farm
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <ConnectionIndicator />
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchSensorData}
                className="btn btn-primary btn-sm flex items-center space-x-2"
                disabled={connectionStatus === 'connecting'}
              >
                <span>🔄</span>
                <span>{connectionStatus === 'connecting' ? 'Updating...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sensor Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SensorCard
            title="Soil Moisture"
            data={sensorData?.soilMoisture}
            icon="💧"
            color="primary"
          />
          
          {/* DHT22 Temperature Card */}
          {dht22Data ? (
            <SensorCard
              title="DHT22 Temperature"
              data={{
                value: `${dht22Data.temperature?.celsius?.toFixed(1)}°C`,
                status: dht22Data.temperature?.celsius > 35 ? 'warning' : 
                        dht22Data.temperature?.celsius < 15 ? 'critical' : 'normal',
                lastUpdate: dht22Data.timestamp
              }}
              icon="🌡️"
              color="warning"
            />
          ) : (
            <SensorCard
              title="Temperature"
              data={sensorData?.temperature}
              icon="🌡️"
              color="warning"
            />
          )}
          
          {/* DHT22 Humidity Card */}
          {dht22Data ? (
            <SensorCard
              title="DHT22 Humidity"
              data={{
                value: `${dht22Data.humidity?.value?.toFixed(1)}%`,
                status: dht22Data.humidity?.value > 80 ? 'warning' : 
                        dht22Data.humidity?.value < 30 ? 'critical' : 'normal',
                lastUpdate: dht22Data.timestamp
              }}
              icon="💨"
              color="secondary"
            />
          ) : (
            <SensorCard
              title="Humidity"
              data={sensorData?.humidity}
              icon="💨"
              color="secondary"
            />
          )}
          
          <SensorCard
            title="Light Intensity"
            data={sensorData?.lightIntensity}
            icon="☀️"
            color="success"
          />
        </div>

        {/* Weather Widget */}
        <div className="mb-8">
          <WeatherWidget />
        </div>

        {/* DHT22 Real Sensor Status */}
        {dht22Data && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-l-green-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🌡️ Real DHT22 Sensor Connected
                  </h3>
                  <p className="text-gray-600">
                    Live environmental data from hardware sensor
                  </p>
                </div>
                <Link 
                  to="/dht22"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
                >
                  View Details →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dht22Data.temperature?.celsius?.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-gray-500">Temperature</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dht22Data.humidity?.value?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Humidity</div>
                </div>
                {dht22Data.heatIndex && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {dht22Data.heatIndex?.celsius?.toFixed(1)}°C
                    </div>
                    <div className="text-sm text-gray-500">Heat Index</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600">
                    ✅ Live
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(dht22Data.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickActionCard
                title="AI Plant Analysis"
                description="Detect diseases and get treatment recommendations"
                icon="🔬"
                color="secondary"
                onClick={() => window.location.href = '/disease-detection'}
              />
              <QuickActionCard
                title="Smart Irrigation"
                description="Optimize water usage with AI recommendations"
                icon="💧"
                color="primary"
                onClick={() => window.location.href = '/irrigation'}
              />
              <QuickActionCard
                title="Performance Analytics"
                description="View detailed insights and trends"
                icon="�"
                color="success"
                onClick={() => window.location.href = '/analytics'}
              />
            </div>
          </div>

          {/* PWA Status */}
          <div className="mb-6">
            <PWAStatus />
          </div>

          {/* System Status */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
            <div className="card space-y-4">
              <div className="card-header">
                <h3 className="font-bold text-gray-800">Farm Overview</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Sensors</span>
                  <span className="font-bold text-success">4/4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data Quality</span>
                  <span className="font-bold text-success">Excellent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Irrigation System</span>
                  <span className="font-bold text-primary">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Analysis</span>
                  <span className="font-bold text-secondary">Running</span>
                </div>
              </div>
              <div className="card-footer">
                <div className="flex items-center text-success text-sm">
                  <span className="mr-2">✅</span>
                  All systems operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
