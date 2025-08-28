import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IrrigationControl = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [isIrrigating, setIsIrrigating] = useState(false);

  const fetchRecommendation = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/irrigation/recommendation');
      setRecommendation(response.data);
    } catch (error) {
      console.error('Error fetching irrigation recommendation:', error);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  const handleIrrigation = () => {
    setIsIrrigating(true);
    setTimeout(() => {
      setIsIrrigating(false);
      fetchRecommendation(); // Refresh after irrigation
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Smart Irrigation Control</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  {recommendation.recommendation}
                </h3>
                <p className="text-gray-600">
                  Current soil moisture: {recommendation.soilMoisture}%
                </p>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Irrigation Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Morning (6:00 AM)</span>
              <span className="text-green-600 font-bold">✓ Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Afternoon (2:00 PM)</span>
              <span className="text-blue-600 font-bold">📋 Scheduled</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Evening (6:00 PM)</span>
              <span className="text-gray-500">⏳ Pending</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800">Water Usage Today</h3>
            <p className="text-blue-700 text-2xl font-bold">245L</p>
            <p className="text-blue-600 text-sm">15% less than yesterday</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationControl;
