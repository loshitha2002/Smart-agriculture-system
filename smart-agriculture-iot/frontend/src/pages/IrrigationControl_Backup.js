import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IrrigationControl = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [usage, setUsage] = useState(null);
  const [zones, setZones] = useState([]);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [recResponse, scheduleResponse, usageResponse, zonesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/irrigation/recommendation'),
        axios.get('http://localhost:5000/api/irrigation/schedule'),
        axios.get('http://localhost:5000/api/irrigation/usage'),
        axios.get('http://localhost:5000/api/irrigation/zones')
      ]);
      
      setRecommendation(recResponse.data);
      setSchedule(scheduleResponse.data);
      setUsage(usageResponse.data);
      setZones(zonesResponse.data.zones || []);
    } catch (error) {
      console.error('Error fetching irrigation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleIrrigation = async () => {
    setIsIrrigating(true);
    try {
      // Simulate irrigation API call
      await new Promise(resolve => setTimeout(resolve, 5000));
      fetchAllData(); // Refresh after irrigation
    } catch (error) {
      console.error('Error starting irrigation:', error);
    } finally {
      setIsIrrigating(false);
    }
  };

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading irrigation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Smart Irrigation Control</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Current Status</h2>
          {recommendation && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                recommendation.shouldIrrigate 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className={`font-bold ${
                  recommendation.shouldIrrigate ? 'text-red-800' : 'text-green-800'
                }`}>
                  {recommendation.shouldIrrigate ? '🌊 Irrigation Needed' : '✅ No irrigation needed'}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Soil moisture: <span className="font-bold">{recommendation.soilMoisture}%</span></p>
                  {recommendation.priority && (
                    <p>Priority: <span className={`font-bold ${
                      recommendation.priority === 'HIGH' ? 'text-red-600' :
                      recommendation.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{recommendation.priority}</span></p>
                  )}
                  {recommendation.waterAmount > 0 && (
                    <p>Water needed: <span className="font-bold">{recommendation.waterAmount}L</span></p>
                  )}
                  {recommendation.duration > 0 && (
                    <p>Duration: <span className="font-bold">{recommendation.duration} min</span></p>
                  )}
                  {recommendation.efficiency && (
                    <p>Efficiency: <span className="font-bold">{recommendation.efficiency}%</span></p>
                  )}
                </div>
                
                {recommendation.reasons && recommendation.reasons.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-700">Reasons:</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {recommendation.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {recommendation.shouldIrrigate && (
                <button
                  onClick={handleIrrigation}
                  disabled={isIrrigating}
                  className={`w-full py-3 px-6 rounded-lg font-bold ${
                    isIrrigating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isIrrigating ? '💧 Irrigating...' : '💧 Start Irrigation'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Irrigation Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
          {schedule && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-3">
                <p>Scheduled events: <span className="font-bold">{schedule.totalEvents}</span></p>
                <p>Total water planned: <span className="font-bold">{schedule.totalWaterPlanned}L</span></p>
                <p>Efficiency: <span className="font-bold">{schedule.overallEfficiency}%</span></p>
              </div>
              
              <div className="space-y-2">
                {schedule.events && schedule.events.map((event, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded ${
                    event.status === 'completed' ? 'bg-green-50 border border-green-200' :
                    event.status === 'scheduled' ? 'bg-blue-50 border border-blue-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}>
                    <div>
                      <span className="font-medium">{formatTime(event.time)}</span>
                      <p className="text-xs text-gray-600">
                        Zones: {Array.isArray(event.zones) ? event.zones.join(', ') : event.zones}
                      </p>
                    </div>
                    <span className={`font-bold ${
                      event.status === 'completed' ? 'text-green-600' :
                      event.status === 'scheduled' ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {event.status === 'completed' ? '✓ Completed' :
                       event.status === 'scheduled' ? '📋 Scheduled' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Water Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Water Usage</h2>
          {usage && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-800">Today's Usage</h3>
                <p className="text-blue-700 text-2xl font-bold">{usage.today.waterUsed}L</p>
                <p className="text-blue-600 text-sm">
                  Efficiency: {usage.today.efficiency}%
                </p>
                <p className="text-blue-600 text-sm">
                  Savings: {usage.today.savings}%
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-700">Comparisons</h4>
                <div className="text-sm space-y-1">
                  <p className="flex justify-between">
                    <span>vs Yesterday:</span>
                    <span className={`font-bold ${
                      usage.comparisons.vsYesterday.change >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {usage.comparisons.vsYesterday.change >= 0 ? '📈' : '📉'} 
                      {Math.abs(usage.comparisons.vsYesterday.change)}% 
                      ({usage.comparisons.vsYesterday.amount}L)
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>vs Average:</span>
                    <span className={`font-bold ${
                      usage.comparisons.vsAverage.change >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {usage.comparisons.vsAverage.change >= 0 ? '📈' : '📉'} 
                      {Math.abs(usage.comparisons.vsAverage.change)}% 
                      ({usage.comparisons.vsAverage.amount}L)
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-bold text-gray-700 mb-2">Weekly Summary</h4>
                <div className="text-sm space-y-1">
                  <p>Total: <span className="font-bold">{usage.weekly.total}L</span></p>
                  <p>Average: <span className="font-bold">{usage.weekly.average}L/day</span></p>
                  <p>Trend: <span className={`font-bold ${
                    usage.weekly.trend === 'increasing' ? 'text-red-600' : 'text-green-600'
                  }`}>{usage.weekly.trend}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Irrigation Zones */}
      {zones.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Irrigation Zones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className={`p-4 rounded-lg border-2 ${
                zone.status === 'active' ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{zone.name}</h3>
                  <span className={`w-3 h-3 rounded-full ${
                    zone.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                </div>
                <div className="text-sm space-y-1">
                  <p>Area: <span className="font-medium">{zone.area} m²</span></p>
                  <p>Soil: <span className="font-medium">{zone.soilType}</span></p>
                  <p>Moisture: <span className="font-medium">{zone.soilMoisture}%</span></p>
                  <p>Efficiency: <span className="font-medium">{zone.efficiency}%</span></p>
                  <p className="text-xs text-gray-600">
                    Last: {formatTime(zone.lastIrrigation)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IrrigationControl;
