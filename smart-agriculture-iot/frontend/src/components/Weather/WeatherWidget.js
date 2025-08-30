import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/weather/current');
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  if (isLoading) {
    return (
      <div className="weather-widget">
        <div className="widget-header">
          <h3>🌤️ Weather</h3>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="weather-widget">
        <div className="widget-header">
          <h3>🌤️ Weather</h3>
        </div>
        <div className="error">Failed to load</div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="widget-header">
        <h3>🌤️ Weather</h3>
        <span className="location">{weatherData.location.city}</span>
      </div>
      
      <div className="weather-content">
        <div className="weather-main">
          <div className="weather-icon">
            {getWeatherIcon(weatherData.current.icon)}
          </div>
          <div className="weather-temp">
            <span className="temp">{weatherData.current.temperature}°C</span>
            <span className="description">{weatherData.current.description}</span>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail">
            <span className="detail-icon">💧</span>
            <span className="detail-value">{weatherData.current.humidity}%</span>
          </div>
          <div className="detail">
            <span className="detail-icon">🌬️</span>
            <span className="detail-value">{weatherData.current.windSpeed} m/s</span>
          </div>
          <div className="detail">
            <span className="detail-icon">☁️</span>
            <span className="detail-value">{weatherData.current.cloudCover}%</span>
          </div>
        </div>

        {weatherData.current.precipitation > 0 && (
          <div className="precipitation-alert">
            🌧️ Rain: {weatherData.current.precipitation}mm
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
