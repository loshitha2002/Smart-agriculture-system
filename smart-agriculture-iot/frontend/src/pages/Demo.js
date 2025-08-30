import React, { useState, useEffect } from 'react';
import DemoControl from '../components/Demo/DemoControl';
import './Demo.css';

const Demo = () => {
  const [demoStats, setDemoStats] = useState({
    totalScenarios: 4,
    activeDemo: true,
    lastUpdate: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    // Listen for demo scenario changes
    const handleScenarioChange = (event) => {
      setDemoStats(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    };

    window.addEventListener('demoScenarioChanged', handleScenarioChange);
    
    // Update clock every second
    const timer = setInterval(() => {
      setDemoStats(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 1000);

    return () => {
      window.removeEventListener('demoScenarioChanged', handleScenarioChange);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="demo-page">
      <div className="demo-header">
        <h1>🎯 Hackathon Demo Mode</h1>
        <p className="demo-subtitle">
          Switch between realistic scenarios to showcase your Smart Agriculture system
        </p>
        
        <div className="demo-stats-bar">
          <div className="demo-stat">
            <span className="stat-label">Total Scenarios:</span>
            <span className="stat-value">{demoStats.totalScenarios}</span>
          </div>
          <div className="demo-stat">
            <span className="stat-label">Demo Status:</span>
            <span className="stat-value status-active">
              {demoStats.activeDemo ? '🟢 ACTIVE' : '🔴 INACTIVE'}
            </span>
          </div>
          <div className="demo-stat">
            <span className="stat-label">Last Update:</span>
            <span className="stat-value">{demoStats.lastUpdate}</span>
          </div>
        </div>
      </div>

      <DemoControl />

      <div className="demo-features">
        <h2>🚀 Demo Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌡️</div>
            <h3>Real-time Sensors</h3>
            <p>Simulated sensor data with realistic values and variations for temperature, humidity, and soil conditions.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3>Alert System</h3>
            <p>Dynamic alerts based on current scenario - from optimal conditions to emergency situations.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💧</div>
            <h3>Smart Irrigation</h3>
            <p>Automated irrigation recommendations that adapt to current environmental conditions.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Disease Detection</h3>
            <p>AI-powered disease detection with confidence scores and treatment recommendations.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Historical data visualization with charts and trends for comprehensive analysis.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Interactive Demo</h3>
            <p>Switch scenarios instantly to demonstrate different farming conditions and system responses.</p>
          </div>
        </div>
      </div>

      <div className="demo-tips">
        <h2>💡 Presentation Tips</h2>
        <div className="tips-container">
          <div className="tip">
            <strong>1. Start with Optimal:</strong> Show normal operations and healthy farm conditions
          </div>
          <div className="tip">
            <strong>2. Switch to Drought:</strong> Demonstrate emergency response and critical alerts
          </div>
          <div className="tip">
            <strong>3. Show Disease Detection:</strong> Highlight AI capabilities and treatment suggestions
          </div>
          <div className="tip">
            <strong>4. End with Growth:</strong> Display optimal conditions and future predictions
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
