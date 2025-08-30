import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7');
  const [isRealTime, setIsRealTime] = useState(true);
  const [data, setData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [efficiency, setEfficiency] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch historical data
        const historicalResponse = await fetch(`http://localhost:5000/api/analytics/historical?days=${dateRange}`);
        const historicalData = await historicalResponse.json();
        
        // Fetch predictions
        const predictionsResponse = await fetch('http://localhost:5000/api/analytics/predictions');
        const predictionsData = await predictionsResponse.json();
        
        // Fetch efficiency metrics
        const efficiencyResponse = await fetch('http://localhost:5000/api/analytics/efficiency');
        const efficiencyData = await efficiencyResponse.json();
        
        // Fetch comparative analysis
        const comparisonResponse = await fetch('http://localhost:5000/api/analytics/comparison');
        const comparisonData = await comparisonResponse.json();
        
        setData(historicalData.data);
        setPredictions(predictionsData.predictions);
        setEfficiency(efficiencyData.metrics);
        setComparison(comparisonData.analysis);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Fallback to mock data
        generateMockData();
      } finally {
        setLoading(false);
      }
    };

    const generateMockData = () => {
      const now = new Date();
      const days = parseInt(dateRange);
      const mockData = Array.from({ length: days }, (_, i) => {
        const date = new Date(now - (days - 1 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          temperature: Math.round(22 + Math.random() * 15),
          humidity: Math.round(60 + Math.random() * 30),
          soilMoisture: Math.round(40 + Math.random() * 40),
          lightIntensity: Math.round(300 + Math.random() * 700),
          waterUsage: Math.round(50 + Math.random() * 150),
          energyConsumption: Math.round(20 + Math.random() * 60),
          yield: Math.round(Math.random() * 100),
        };
      });
      
      setData(mockData);
      setPredictions({
        yieldPrediction: { value: 87, trend: 'increasing', confidence: 92 },
        diseaseRisk: { value: 15, level: 'low' },
        waterOptimization: { savings: 18 },
        harvestPrediction: { estimatedDate: 'Sep 15, 2025', daysRemaining: 16 }
      });
      setEfficiency({
        waterEfficiency: { value: 2.3, trend: 'improving' },
        energyEfficiency: { value: 2.8, trend: 'stable' },
        resourceUtilization: { water: 78, energy: 85, nutrients: 92 },
        carbonFootprint: { value: 45, reduction: 12 }
      });
      setComparison({
        industryBenchmark: {
          yield: { yours: 87, industry: 75, difference: 16 },
          waterUsage: { yours: 120, industry: 180, difference: -33 },
          energyEfficiency: { yours: 92, industry: 78, difference: 18 }
        }
      });
    };

    fetchAnalyticsData();
    
    if (isRealTime) {
      const interval = setInterval(fetchAnalyticsData, 30000);
      return () => clearInterval(interval);
    }
  }, [dateRange, isRealTime]);

  // Simple Chart Component using SVG
  const SimpleLineChart = ({ data, title, color = '#4CAF50' }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 100 - ((item.value - minValue) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="simple-chart">
        <h4>{title}</h4>
        <svg width="320" height="120" viewBox="0 0 320 120">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 300;
            const y = 100 - ((item.value - minValue) / range) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
              />
            );
          })}
        </svg>
        <div className="chart-labels">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>📈 Advanced Analytics</h1>
          <p>Loading analytics data...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>📈 Advanced Analytics</h1>
          <p>Comprehensive insights and predictive analysis for your smart farm</p>
        </div>
        
        <div className="analytics-controls">
          <div className="control-group">
            <label>Time Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="date-range-select"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="real-time-toggle">
              <input 
                type="checkbox" 
                checked={isRealTime} 
                onChange={(e) => setIsRealTime(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              Real-time Updates
            </label>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Yield Prediction</h3>
            <div className="metric-value">
              {predictions?.yieldPrediction?.value || 0}%
            </div>
            <div className="metric-trend positive">
              ↗ {predictions?.yieldPrediction?.trend || 'stable'}
            </div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">💧</div>
          <div className="metric-content">
            <h3>Water Efficiency</h3>
            <div className="metric-value">
              {efficiency?.waterEfficiency?.value || 0} kg/L
            </div>
            <div className="metric-trend positive">
              ↗ {efficiency?.waterEfficiency?.trend || 'stable'}
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Energy Efficiency</h3>
            <div className="metric-value">
              {efficiency?.energyEfficiency?.value || 0} kg/kWh
            </div>
            <div className="metric-trend positive">
              ↗ {efficiency?.energyEfficiency?.trend || 'stable'}
            </div>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">🌱</div>
          <div className="metric-content">
            <h3>Disease Risk</h3>
            <div className="metric-value">
              {predictions?.diseaseRisk?.value || 0}%
            </div>
            <div className="metric-trend negative">
              ↓ {predictions?.diseaseRisk?.level || 'low'} risk
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-container">
          <SimpleLineChart
            data={data?.map(item => ({ date: item.date, value: item.temperature })) || []}
            title="🌡️ Temperature Trends"
            color="#FF6B6B"
          />
        </div>

        <div className="chart-container">
          <SimpleLineChart
            data={data?.map(item => ({ date: item.date, value: item.humidity })) || []}
            title="💧 Humidity Levels"
            color="#2196F3"
          />
        </div>

        <div className="chart-container">
          <SimpleLineChart
            data={data?.map(item => ({ date: item.date, value: item.soilMoisture })) || []}
            title="🌱 Soil Moisture"
            color="#4CAF50"
          />
        </div>

        <div className="chart-container">
          <SimpleLineChart
            data={data?.map(item => ({ date: item.date, value: item.lightIntensity })) || []}
            title="☀️ Light Intensity"
            color="#FF9800"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-grid">
        <div className="performance-card">
          <h3>🏆 Performance vs Industry</h3>
          <div className="comparison-item">
            <span>Yield Performance</span>
            <div className="comparison-bar">
              <div className="bar yours" style={{ width: `${comparison?.industryBenchmark?.yield?.yours || 0}%` }}>
                Your Farm: {comparison?.industryBenchmark?.yield?.yours || 0}%
              </div>
              <div className="bar industry" style={{ width: `${comparison?.industryBenchmark?.yield?.industry || 0}%` }}>
                Industry: {comparison?.industryBenchmark?.yield?.industry || 0}%
              </div>
            </div>
          </div>
          
          <div className="comparison-item">
            <span>Water Efficiency</span>
            <div className="comparison-bar">
              <div className="bar yours" style={{ width: `${100 - (comparison?.industryBenchmark?.waterUsage?.yours || 0) / 2}%` }}>
                Your Farm: {comparison?.industryBenchmark?.waterUsage?.yours || 0}L
              </div>
              <div className="bar industry" style={{ width: `${100 - (comparison?.industryBenchmark?.waterUsage?.industry || 0) / 2}%` }}>
                Industry: {comparison?.industryBenchmark?.waterUsage?.industry || 0}L
              </div>
            </div>
          </div>
        </div>

        <div className="performance-card">
          <h3>💡 Efficiency Metrics</h3>
          <div className="efficiency-metrics">
            <div className="efficiency-item">
              <span className="label">Water Efficiency</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(efficiency?.waterEfficiency?.value || 0) * 40}%` }}
                ></div>
              </div>
              <span className="value">{efficiency?.waterEfficiency?.value || 0} kg/L</span>
            </div>
            
            <div className="efficiency-item">
              <span className="label">Energy Efficiency</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill energy" 
                  style={{ width: `${(efficiency?.energyEfficiency?.value || 0) * 33}%` }}
                ></div>
              </div>
              <span className="value">{efficiency?.energyEfficiency?.value || 0} kg/kWh</span>
            </div>
            
            <div className="efficiency-item">
              <span className="label">Carbon Reduction</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill carbon" 
                  style={{ width: `${efficiency?.carbonFootprint?.reduction || 0}%` }}
                ></div>
              </div>
              <span className="value">{efficiency?.carbonFootprint?.reduction || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="insights-panel">
        <h3>🧠 AI-Powered Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Harvest Prediction</h4>
            <p>Estimated harvest date: <strong>{predictions?.harvestPrediction?.estimatedDate || 'Sep 15, 2025'}</strong></p>
            <p>Days remaining: <strong>{predictions?.harvestPrediction?.daysRemaining || 16} days</strong></p>
          </div>
          
          <div className="insight-card">
            <h4>💧 Water Optimization</h4>
            <p>Potential water savings: <strong>{predictions?.waterOptimization?.savings || 18}%</strong></p>
            <p>Recommendation: Adjust irrigation timing based on soil moisture data</p>
          </div>
          
          <div className="insight-card">
            <h4>📊 Performance Comparison</h4>
            <p>Your yield is <strong>{comparison?.industryBenchmark?.yield?.difference || 16}% above</strong> industry average</p>
            <p>Water usage is <strong>{Math.abs(comparison?.industryBenchmark?.waterUsage?.difference || 33)}% below</strong> industry average</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
