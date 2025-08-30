import React, { useState, useEffect } from 'react';
import './DemoControl.css';

const DemoControl = () => {
  const [scenarios, setScenarios] = useState({});
  const [currentScenario, setCurrentScenario] = useState('optimal');
  const [isLoading, setIsLoading] = useState(false);
  const [demoData, setDemoData] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/demo/scenarios');
      const data = await response.json();
      setScenarios(data.scenarios);
      setCurrentScenario(data.current);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const switchScenario = async (scenario) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/demo/scenario/${scenario}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setCurrentScenario(scenario);
        setDemoData(data.data);
        // Trigger page refresh or state update in parent components
        window.dispatchEvent(new CustomEvent('demoScenarioChanged', { 
          detail: { scenario, data: data.data } 
        }));
      }
    } catch (error) {
      console.error('Error switching scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScenarioColor = (scenario) => {
    const colors = {
      optimal: '#4CAF50',
      drought: '#FF5722',
      disease: '#FF9800',
      growth: '#2196F3'
    };
    return colors[scenario] || '#757575';
  };

  const getScenarioIcon = (scenario) => {
    const icons = {
      optimal: '✅',
      drought: '🌵',
      disease: '⚠️',
      growth: '🌱'
    };
    return icons[scenario] || '📊';
  };

  return (
    <div className="demo-control">
      <div className="demo-control-header">
        <h3>🎯 Demo Control Panel</h3>
        <span className="current-scenario">
          Current: {getScenarioIcon(currentScenario)} {scenarios[currentScenario]}
        </span>
      </div>

      <div className="scenario-grid">
        {Object.entries(scenarios).map(([key, name]) => (
          <button
            key={key}
            className={`scenario-btn ${currentScenario === key ? 'active' : ''}`}
            onClick={() => switchScenario(key)}
            disabled={isLoading}
            style={{ borderColor: getScenarioColor(key) }}
          >
            <div className="scenario-icon">{getScenarioIcon(key)}</div>
            <div className="scenario-name">{name}</div>
            {currentScenario === key && <div className="active-indicator">ACTIVE</div>}
          </button>
        ))}
      </div>

      {demoData && (
        <div className="demo-preview">
          <h4>Latest Demo Data:</h4>
          <div className="demo-stats">
            <div className="stat">
              <span>Temperature:</span>
              <span>{demoData.temperature}°C</span>
            </div>
            <div className="stat">
              <span>Humidity:</span>
              <span>{demoData.humidity}%</span>
            </div>
            <div className="stat">
              <span>Soil Moisture:</span>
              <span>{demoData.soilMoisture}%</span>
            </div>
            <div className="stat">
              <span>Status:</span>
              <span className={`status ${demoData.status}`}>{demoData.status}</span>
            </div>
          </div>
          
          {demoData.alerts && demoData.alerts.length > 0 && (
            <div className="demo-alerts">
              <h5>Active Alerts:</h5>
              {demoData.alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  {alert}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="demo-instructions">
        <h4>📋 Demo Instructions:</h4>
        <ul>
          <li><strong>Optimal:</strong> Perfect growing conditions for presentation</li>
          <li><strong>Drought:</strong> Emergency scenario with high temperatures</li>
          <li><strong>Disease:</strong> Disease detection and prevention demo</li>
          <li><strong>Growth:</strong> Rapid growth phase with optimal nutrients</li>
        </ul>
      </div>
    </div>
  );
};

export default DemoControl;
