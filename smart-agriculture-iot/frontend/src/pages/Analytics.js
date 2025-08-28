import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [isRealTime, setIsRealTime] = useState(true);
  const [data, setData] = useState(null);

  // Mock real-time data generator
  useEffect(() => {
    const generateData = () => {
      const now = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          temperature: Math.round(22 + Math.random() * 15),
          humidity: Math.round(60 + Math.random() * 30),
          soilMoisture: Math.round(40 + Math.random() * 40),
          lightIntensity: Math.round(300 + Math.random() * 700),
        };
      });

      const realTimeMetrics = {
        temperature: Math.round(25 + Math.random() * 6),
        humidity: Math.round(65 + Math.random() * 15),
        soilMoisture: Math.round(55 + Math.random() * 20),
        lightIntensity: Math.round(700 + Math.random() * 300),
        carbonFootprint: 145,
        waterUsage: 2340,
        energyEfficiency: 87
      };

      setData({
        historical: last7Days,
        realTime: realTimeMetrics,
        predictions: {
          yieldIncrease: 15.2,
          waterSavings: 23,
          diseaseRisk: 12,
          harvestDate: 'Sep 15'
        }
      });
    };

    generateData();
    
    if (isRealTime) {
      const interval = setInterval(generateData, 3000);
      return () => clearInterval(interval);
    }
  }, [isRealTime, dateRange]);

  const MetricChart = ({ title, data, color, unit, icon }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    
    return (
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h3 className="font-bold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              color === 'primary' ? 'text-blue-600' : 
              color === 'success' ? 'text-green-600' : 
              color === 'warning' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {data[data.length - 1]}{unit}
            </div>
            <div className="text-xs text-gray-500">
              {data[data.length - 1] > data[data.length - 2] ? '↗' : '↘'} 
              {Math.abs(data[data.length - 1] - data[data.length - 2]).toFixed(1)}
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="relative h-24 mt-4">
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <polyline
                fill="none"
                stroke={
                  color === 'primary' ? '#3B82F6' : 
                  color === 'success' ? '#10B981' : 
                  color === 'warning' ? '#F59E0B' : 
                  '#EF4444'
                }
                strokeWidth="2"
                points={data.map((value, index) => {
                  const x = (index / (data.length - 1)) * 280 + 10;
                  const y = 80 - ((value - minValue) / (maxValue - minValue)) * 60;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {data.map((value, index) => {
                const x = (index / (data.length - 1)) * 280 + 10;
                const y = 80 - ((value - minValue) / (maxValue - minValue)) * 60;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={
                      color === 'primary' ? '#3B82F6' : 
                      color === 'success' ? '#10B981' : 
                      color === 'warning' ? '#F59E0B' : 
                      '#EF4444'
                    }
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Mon</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  };

  const PredictionCard = ({ title, value, unit, trend, description, icon }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-bold text-indigo-800">{title}</h3>
        </div>
        <div className={`status-indicator ${trend > 0 ? 'status-success' : 'status-warning'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      </div>
      <div className="text-3xl font-bold text-indigo-900 mb-1">
        {value}{unit}
      </div>
      <p className="text-sm text-indigo-600">{description}</p>
    </div>
  );

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Smart Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Real-time insights and predictive analytics for optimal farming
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Real-time:</label>
              <button
                onClick={() => setIsRealTime(!isRealTime)}
                className={`toggle-switch ${isRealTime ? 'active' : ''}`}
              >
                <div className="toggle-handle"></div>
              </button>
            </div>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
          </div>
        </div>

        {/* Real-time Status Bar */}
        {isRealTime && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                <span className="font-semibold">🔴 Live Data Stream Active</span>
              </div>
              <div className="text-sm opacity-90">Last update: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {/* Current Conditions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card text-center">
            <div className="text-2xl mb-2">🌡️</div>
            <div className="text-2xl font-bold text-blue-600">{data.realTime.temperature}°C</div>
            <div className="text-gray-600 font-medium">Temperature</div>
            <div className="text-xs text-gray-500 mt-1">Optimal: 20-30°C</div>
          </div>
          
          <div className="metric-card text-center">
            <div className="text-2xl mb-2">💧</div>
            <div className="text-2xl font-bold text-cyan-600">{data.realTime.humidity}%</div>
            <div className="text-gray-600 font-medium">Humidity</div>
            <div className="text-xs text-gray-500 mt-1">Optimal: 60-80%</div>
          </div>
          
          <div className="metric-card text-center">
            <div className="text-2xl mb-2">🌱</div>
            <div className="text-2xl font-bold text-green-600">{data.realTime.soilMoisture}%</div>
            <div className="text-gray-600 font-medium">Soil Moisture</div>
            <div className="text-xs text-gray-500 mt-1">Optimal: 40-70%</div>
          </div>
          
          <div className="metric-card text-center">
            <div className="text-2xl mb-2">☀️</div>
            <div className="text-2xl font-bold text-yellow-600">{data.realTime.lightIntensity}</div>
            <div className="text-gray-600 font-medium">Light (lux)</div>
            <div className="text-xs text-gray-500 mt-1">Optimal: 500-1000</div>
          </div>
        </div>

        {/* Historical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MetricChart
            title="Temperature Trend"
            data={data.historical.map(d => d.temperature)}
            color="primary"
            unit="°C"
            icon="🌡️"
          />
          
          <MetricChart
            title="Humidity Levels"
            data={data.historical.map(d => d.humidity)}
            color="info"
            unit="%"
            icon="💧"
          />
          
          <MetricChart
            title="Soil Moisture"
            data={data.historical.map(d => d.soilMoisture)}
            color="success"
            unit="%"
            icon="🌱"
          />
          
          <MetricChart
            title="Light Intensity"
            data={data.historical.map(d => d.lightIntensity)}
            color="warning"
            unit=" lux"
            icon="☀️"
          />
        </div>

        {/* AI Predictions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🤖 AI Predictions & Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PredictionCard
              title="Yield Forecast"
              value={data.predictions.yieldIncrease}
              unit="% ↗"
              trend={15.2}
              description="Expected yield vs last season"
              icon="📈"
            />
            
            <PredictionCard
              title="Water Savings"
              value={data.predictions.waterSavings}
              unit="% ↗"
              trend={23}
              description="Smart irrigation efficiency"
              icon="💧"
            />
            
            <PredictionCard
              title="Disease Risk"
              value={data.predictions.diseaseRisk}
              unit="% ↘"
              trend={-12}
              description="Early warning system"
              icon="🛡️"
            />
            
            <PredictionCard
              title="Harvest Date"
              value={data.predictions.harvestDate}
              unit=""
              trend={5}
              description="Optimal harvest timing"
              icon="🌾"
            />
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-800">🌍 Carbon Impact</h3>
              <p className="text-gray-600 text-sm">Environmental savings</p>
            </div>
            <div className="card-body text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{data.realTime.carbonFootprint}</div>
              <div className="text-gray-600">kg CO₂ saved/month</div>
              <div className="mt-4 bg-green-100 rounded-lg p-3">
                <div className="text-sm text-green-700 font-medium">25% reduction vs last year</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-800">🚿 Water Efficiency</h3>
              <p className="text-gray-600 text-sm">Smart irrigation gains</p>
            </div>
            <div className="card-body text-center">
              <div className="text-4xl font-bold text-cyan-600 mb-2">{data.realTime.waterUsage}</div>
              <div className="text-gray-600">liters saved/month</div>
              <div className="mt-4 bg-cyan-100 rounded-lg p-3">
                <div className="text-sm text-cyan-700 font-medium">30% more efficient</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-800">⚡ Energy Score</h3>
              <p className="text-gray-600 text-sm">System optimization</p>
            </div>
            <div className="card-body text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{data.realTime.energyEfficiency}%</div>
              <div className="text-gray-600">efficiency rating</div>
              <div className="mt-4 bg-yellow-100 rounded-lg p-3">
                <div className="text-sm text-yellow-700 font-medium">Excellent performance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
