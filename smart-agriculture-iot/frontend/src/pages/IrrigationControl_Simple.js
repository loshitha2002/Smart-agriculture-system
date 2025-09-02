import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IrrigationControl = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching irrigation data...');
        const response = await axios.get('http://localhost:5000/api/irrigation/recommendation');
        console.log('Response received:', response.data);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load irrigation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Smart Irrigation Control</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Smart Irrigation Control</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Please check that the backend is running on http://localhost:5000</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Smart Irrigation Control</h1>
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>Current Status</h2>
        {data ? (
          <div>
            <p><strong>Should Irrigate:</strong> {data.shouldIrrigate ? '✅ YES' : '❌ NO'}</p>
            <p><strong>Soil Moisture:</strong> {data.soilMoisture}%</p>
            {data.priority && <p><strong>Priority:</strong> {data.priority}</p>}
            {data.waterAmount > 0 && <p><strong>Water Amount:</strong> {data.waterAmount}L</p>}
            {data.duration > 0 && <p><strong>Duration:</strong> {data.duration} minutes</p>}
            {data.efficiency && <p><strong>Efficiency:</strong> {data.efficiency}%</p>}
            
            {data.reasons && data.reasons.length > 0 && (
              <div>
                <strong>Reasons:</strong>
                <ul>
                  {data.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#e0f0ff', 
        padding: '15px', 
        borderRadius: '8px' 
      }}>
        <h2>System Status</h2>
        <p>✅ Backend connected successfully</p>
        <p>📊 Real irrigation data loaded</p>
        <p>🌐 API: http://localhost:5000</p>
      </div>
    </div>
  );
};

export default IrrigationControl;
