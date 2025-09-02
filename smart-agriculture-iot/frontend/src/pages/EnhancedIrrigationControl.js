import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const EnhancedIrrigationControl = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [usage, setUsage] = useState(null);
  const [zones, setZones] = useState([]);
  const [history, setHistory] = useState([]);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedZones, setSelectedZones] = useState([]);
  const [duration, setDuration] = useState(15);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [recResponse, schedResponse, usageResponse, zonesResponse, historyResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/irrigation/recommendation'),
        axios.get('http://localhost:5000/api/irrigation/schedule'),
        axios.get('http://localhost:5000/api/irrigation/usage'),
        axios.get('http://localhost:5000/api/irrigation/zones'),
        axios.get('http://localhost:5000/api/irrigation/history?days=7')
      ]);

      setRecommendation(recResponse.data);
      setSchedule(schedResponse.data);
      setUsage(usageResponse.data);
      setZones(zonesResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching irrigation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleManualIrrigation = async () => {
    if (selectedZones.length === 0) {
      alert('Please select at least one zone');
      return;
    }

    setIsIrrigating(true);
    try {
      await axios.post('http://localhost:5000/api/irrigation/start', {
        zones: selectedZones,
        duration: duration
      });
      setTimeout(() => {
        setIsIrrigating(false);
        fetchAllData(); // Refresh data after irrigation
      }, 5000);
    } catch (error) {
      console.error('Error starting irrigation:', error);
      setIsIrrigating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-blue-600';
      case 'scheduled': return 'text-yellow-600';
      case 'pending': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'scheduled': return '📋';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading irrigation data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🚿 Smart Irrigation Control</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {recommendation ? format(new Date(recommendation.timestamp), 'HH:mm:ss') : '--'}
          </div>
          <button
            onClick={fetchAllData}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Status */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">🌊 Current Status & Recommendation</h2>
          {recommendation && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${getPriorityColor(recommendation.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">
                    {recommendation.shouldIrrigate ? '💧 Irrigation Recommended' : '✅ No Irrigation Needed'}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {recommendation.priority?.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-sm mb-3">{recommendation.recommendation}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Soil Moisture:</span>
                    <span className="font-bold ml-2">{recommendation.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency Score:</span>
                    <span className="font-bold ml-2">{recommendation.efficiency}%</span>
                  </div>
                  {recommendation.waterAmount > 0 && (
                    <>
                      <div>
                        <span className="text-gray-600">Water Amount:</span>
                        <span className="font-bold ml-2">{recommendation.waterAmount}L</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-bold ml-2">{recommendation.duration} min</span>
                      </div>
                    </>
                  )}
                </div>

                {recommendation.reasons && recommendation.reasons.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Reasons:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {recommendation.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Weather Conditions */}
              {recommendation.weatherConditions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-bold text-blue-800 mb-2">🌤️ Current Weather</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Temperature: <span className="font-bold">{Math.round(recommendation.weatherConditions.temperature)}°C</span></div>
                    <div>Humidity: <span className="font-bold">{Math.round(recommendation.weatherConditions.humidity)}%</span></div>
                    <div>Precipitation: <span className="font-bold">{recommendation.weatherConditions.precipitation}mm</span></div>
                    <div>Wind: <span className="font-bold">{recommendation.weatherConditions.windSpeed} km/h</span></div>
                  </div>
                </div>
              )}

              {/* Smart Recommendations */}
              {recommendation.smartRecommendations && recommendation.smartRecommendations.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-bold text-purple-800 mb-2">🤖 AI Recommendations</h4>
                  <div className="space-y-1">
                    {recommendation.smartRecommendations.map((rec, index) => (
                      <div key={index} className="text-sm">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          rec.priority === 'high' ? 'bg-red-400' : 
                          rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></span>
                        {rec.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Control */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">🎮 Manual Control</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Zones:</label>
              <div className="space-y-2">
                {zones.map(zone => (
                  <label key={zone.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedZones.includes(zone.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedZones([...selectedZones, zone.id]);
                        } else {
                          setSelectedZones(selectedZones.filter(id => id !== zone.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{zone.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="1"
                max="60"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleManualIrrigation}
              disabled={isIrrigating || selectedZones.length === 0}
              className={`w-full py-3 px-6 rounded-lg font-bold ${
                isIrrigating || selectedZones.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isIrrigating ? '💧 Irrigating...' : '🚿 Start Manual Irrigation'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📅 Today's Schedule</h2>
          {schedule && (
            <div className="space-y-3">
              {schedule.schedules.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.time}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Zones: {item.zones.join(', ')})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                    {item.waterUsed > 0 && (
                      <div className="text-xs text-gray-500">{item.waterUsed}L used</div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total Planned:</span>
                    <span className="font-bold ml-2">{schedule.totalWaterPlanned}L</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Efficiency:</span>
                    <span className="font-bold ml-2">{Math.round(schedule.efficiency)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Water Usage Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📊 Water Usage Analytics</h2>
          {usage && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-800">💧 Today's Usage</h3>
                <div className="text-2xl font-bold text-green-700">{usage.today.used}L</div>
                <div className="text-sm text-green-600">
                  {usage.comparison.vsYesterday.percentage > 0 ? '📈' : '📉'} 
                  {Math.abs(usage.comparison.vsYesterday.percentage)}% vs yesterday
                </div>
                <div className="text-sm text-green-600">
                  Efficiency: {usage.today.efficiency}% | Savings: {usage.today.savings}%
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">📈 Weekly Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total: <span className="font-bold">{usage.weekly.total}L</span></div>
                  <div>Average: <span className="font-bold">{usage.weekly.average}L/day</span></div>
                  <div>Trend: <span className="font-bold capitalize">{usage.weekly.trend}</span></div>
                  <div>Efficiency: <span className="font-bold">{usage.weekly.efficiency}%</span></div>
                </div>
              </div>

              {/* Zone Status */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🏡 Zone Status</h4>
                <div className="space-y-1">
                  {zones.map(zone => (
                    <div key={zone.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{zone.name}</span>
                      <div className="text-right">
                        <span className={`font-bold ${zone.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                          {zone.status === 'active' ? '🟢 Active' : '⚪ Idle'}
                        </span>
                        <div className="text-xs text-gray-500">{zone.soilMoisture}% moisture</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedIrrigationControl;
