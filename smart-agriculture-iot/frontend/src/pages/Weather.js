import React from 'react';
import WeatherDashboard from '../components/Weather/WeatherDashboard';
import './Weather.css';

const Weather = () => {
  return (
    <div className="weather-page">
      <div className="weather-page-header">
        <h1>🌤️ Weather Intelligence</h1>
        <p className="weather-subtitle">
          Real-time weather data integrated with smart farming decisions
        </p>
      </div>
      
      <WeatherDashboard />
      
      <div className="weather-info">
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🌡️</div>
            <h3>Temperature Monitoring</h3>
            <p>Track temperature changes and their impact on crop growth and irrigation needs.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">💧</div>
            <h3>Humidity Analysis</h3>
            <p>Monitor humidity levels to prevent disease and optimize growing conditions.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🌬️</div>
            <h3>Wind & Pressure</h3>
            <p>Track wind patterns and atmospheric pressure for better crop protection.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🌦️</div>
            <h3>Smart Irrigation</h3>
            <p>Automatically adjust watering schedules based on weather forecasts and conditions.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📅</div>
            <h3>5-Day Forecast</h3>
            <p>Plan ahead with detailed weather forecasts for optimal farming decisions.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">💡</div>
            <h3>AI Recommendations</h3>
            <p>Get intelligent suggestions based on current and forecasted weather conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
