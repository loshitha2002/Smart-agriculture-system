import React, { useState, useEffect } from 'react';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting');

  useEffect(() => {
    getCurrentLocation();
    const interval = setInterval(fetchWeatherData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = () => {
    setLocationStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setLocation(newLocation);
          setLocationStatus('success');
          console.log('📍 Location detected:', newLocation);
          fetchWeatherData(newLocation);
        },
        (error) => {
          console.log('⚠️ Geolocation denied, using default location');
          setLocationStatus('default');
          fetchWeatherData();
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      console.log('⚠️ Geolocation not supported, using default location');
      setLocationStatus('default');
      fetchWeatherData();
    }
  };

  const fetchWeatherData = async (customLocation = null) => {
    setIsLoading(true);
    try {
      const params = customLocation ? `?lat=${customLocation.lat}&lon=${customLocation.lon}` : '';
      
      // Fetch current weather
      const weatherResponse = await fetch(`http://localhost:5000/api/weather/current${params}`);
      const weather = await weatherResponse.json();
      console.log('🌤️ Weather data received:', weather);
      setWeatherData(weather);

      // Fetch forecast
      const forecastResponse = await fetch(`http://localhost:5000/api/weather/forecast${params}`);
      const forecast = await forecastResponse.json();
      console.log('🔮 Forecast data received:', forecast);
      setForecastData(forecast);

      // Fetch recommendations
      const recommendationsResponse = await fetch(`http://localhost:5000/api/weather/recommendations${params}`);
      const recData = await recommendationsResponse.json();
      setRecommendations(recData.recommendations);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
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

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: '#4CAF50' };
    if (uvIndex <= 5) return { level: 'Moderate', color: '#FF9800' };
    if (uvIndex <= 7) return { level: 'High', color: '#FF5722' };
    if (uvIndex <= 10) return { level: 'Very High', color: '#9C27B0' };
    return { level: 'Extreme', color: '#F44336' };
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="weather-dashboard">
        <div className="loading-spinner">
          <div className="spinner-animation">🌍</div>
          <p>
            {locationStatus === 'detecting' 
              ? 'Detecting your location...' 
              : 'Loading weather data...'}
          </p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="weather-dashboard">
        <div className="error-message">
          <p>Failed to load weather data</p>
          <button onClick={() => fetchWeatherData()} className="retry-btn">
            Retry
          </button>
          <button onClick={getCurrentLocation} className="location-btn">
            📍 Detect Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-dashboard">
      <div className="weather-header">
        <h2>🌤️ Weather Conditions</h2>
        <div className="header-controls">
          <div className="location-status">
            {locationStatus === 'success' && <span className="status-icon">📍</span>}
            {locationStatus === 'default' && <span className="status-icon">🌍</span>}
            {locationStatus === 'detecting' && <span className="status-icon">🔍</span>}
            {locationStatus === 'success' ? 'Current Location' : 
             locationStatus === 'default' ? 'Default Location' : 'Detecting...'}
          </div>
          <div className="last-update">
            {weatherData.is_real_data === false && <span className="demo-badge">DEMO</span>}
            Last updated: {lastUpdate?.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Current Weather */}
      <div className="current-weather">
        <div className="weather-main">
          <div className="weather-icon">
            {getWeatherIcon(weatherData.current.icon)}
          </div>
          <div className="weather-info">
            <div className="temperature">
              {weatherData.current.temperature}°C
            </div>
            <div className="feels-like">
              Feels like {weatherData.current.feelsLike}°C
            </div>
            <div className="description">
              {weatherData.current.description}
            </div>
          </div>
          <div className="location">
            <div className="city">{weatherData.location.city}</div>
            <div className="country">{weatherData.location.country}</div>
          </div>
        </div>

        <div className="weather-details">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-icon">💧</span>
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weatherData.current.humidity}%</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">🌬️</span>
              <span className="detail-label">Wind</span>
              <span className="detail-value">
                {weatherData.current.windSpeed} m/s {getWindDirection(weatherData.current.windDirection)}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">🔆</span>
              <span className="detail-label">UV Index</span>
              <span className="detail-value" style={{ color: getUVLevel(weatherData.current.uvIndex).color }}>
                {weatherData.current.uvIndex} ({getUVLevel(weatherData.current.uvIndex).level})
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📊</span>
              <span className="detail-label">Pressure</span>
              <span className="detail-value">{weatherData.current.pressure} hPa</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">👁️</span>
              <span className="detail-label">Visibility</span>
              <span className="detail-value">{weatherData.current.visibility} km</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">☁️</span>
              <span className="detail-label">Cloud Cover</span>
              <span className="detail-value">{weatherData.current.cloudCover}%</span>
            </div>
          </div>
        </div>

        <div className="sun-times">
          <div className="sun-time">
            <span className="sun-icon">🌅</span>
            <span className="sun-label">Sunrise</span>
            <span className="sun-value">{formatTime(weatherData.sunrise)}</span>
          </div>
          <div className="sun-time">
            <span className="sun-icon">🌇</span>
            <span className="sun-label">Sunset</span>
            <span className="sun-value">{formatTime(weatherData.sunset)}</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecastData && (
        <div className="forecast-section">
          <h3>📅 5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecastData.forecasts.map((day, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-date">
                  {index === 0 ? 'Today' : formatDate(day.date)}
                </div>
                <div className="forecast-icon">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className="forecast-temps">
                  <span className="temp-max">{day.temperature.max}°</span>
                  <span className="temp-min">{day.temperature.min}°</span>
                </div>
                <div className="forecast-desc">{day.description}</div>
                {day.precipitation > 0 && (
                  <div className="forecast-rain">
                    🌧️ {day.precipitation}mm
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>💡 Smart Recommendations</h3>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.type} ${rec.priority}`}>
                <div className="rec-category">{rec.category.toUpperCase()}</div>
                <div className="rec-message">{rec.message}</div>
                <div className="rec-priority">Priority: {rec.priority}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="refresh-section">
        <button onClick={fetchWeatherData} className="refresh-btn" disabled={isLoading}>
          🔄 Refresh Weather Data
        </button>
      </div>
    </div>
  );
};

export default WeatherDashboard;
