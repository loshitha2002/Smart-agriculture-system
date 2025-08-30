// Weather Service for Smart Agriculture
class WeatherService {
  constructor() {
    // Using OpenWeatherMap API (free tier: 1000 calls/day)
    this.apiKey = process.env.WEATHER_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.defaultLocation = {
      lat: 6.9271, // Colombo, Sri Lanka coordinates
      lon: 79.8612,
      city: 'Colombo',
      country: 'LK'
    };
  }

  // Get current weather data
  async getCurrentWeather(lat = this.defaultLocation.lat, lon = this.defaultLocation.lon) {
    try {
      if (this.apiKey === 'demo_key') {
        return this.getMockWeatherData();
      }

      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getMockWeatherData();
    }
  }

  // Get 5-day weather forecast
  async getWeatherForecast(lat = this.defaultLocation.lat, lon = this.defaultLocation.lon) {
    try {
      if (this.apiKey === 'demo_key') {
        return this.getMockForecastData();
      }

      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatForecastData(data);
    } catch (error) {
      console.error('Forecast service error:', error);
      return this.getMockForecastData();
    }
  }

  // Format weather data for our application
  formatWeatherData(data) {
    return {
      location: {
        city: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Not available in current weather
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        cloudCover: data.clouds.all
      },
      timestamp: new Date(data.dt * 1000).toISOString(),
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString()
    };
  }

  // Format forecast data
  formatForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          temperature: {
            min: item.main.temp,
            max: item.main.temp
          },
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          windSpeed: item.wind.speed,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          precipitation: item.rain ? item.rain['3h'] || 0 : 0
        };
      } else {
        dailyForecasts[date].temperature.min = Math.min(dailyForecasts[date].temperature.min, item.main.temp);
        dailyForecasts[date].temperature.max = Math.max(dailyForecasts[date].temperature.max, item.main.temp);
      }
    });

    return {
      location: {
        city: data.city.name,
        country: data.city.country
      },
      forecasts: Object.values(dailyForecasts).slice(0, 5).map(forecast => ({
        ...forecast,
        temperature: {
          min: Math.round(forecast.temperature.min),
          max: Math.round(forecast.temperature.max)
        }
      }))
    };
  }

  // Generate realistic mock weather data for demo
  getMockWeatherData() {
    const scenarios = ['sunny', 'cloudy', 'rainy', 'hot'];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const weatherData = {
      sunny: {
        temperature: 28 + Math.random() * 4,
        humidity: 55 + Math.random() * 15,
        windSpeed: 2 + Math.random() * 3,
        description: 'clear sky',
        icon: '01d',
        cloudCover: 10 + Math.random() * 20,
        precipitation: 0
      },
      cloudy: {
        temperature: 24 + Math.random() * 6,
        humidity: 70 + Math.random() * 15,
        windSpeed: 3 + Math.random() * 4,
        description: 'scattered clouds',
        icon: '03d',
        cloudCover: 60 + Math.random() * 30,
        precipitation: 0
      },
      rainy: {
        temperature: 22 + Math.random() * 4,
        humidity: 85 + Math.random() * 10,
        windSpeed: 4 + Math.random() * 6,
        description: 'light rain',
        icon: '10d',
        cloudCover: 80 + Math.random() * 20,
        precipitation: 2 + Math.random() * 8
      },
      hot: {
        temperature: 35 + Math.random() * 8,
        humidity: 40 + Math.random() * 20,
        windSpeed: 1 + Math.random() * 2,
        description: 'hot',
        icon: '01d',
        cloudCover: 5 + Math.random() * 15,
        precipitation: 0
      }
    };

    const current = weatherData[scenario];
    
    return {
      location: {
        city: 'Colombo',
        country: 'LK',
        coordinates: this.defaultLocation
      },
      current: {
        temperature: Math.round(current.temperature),
        feelsLike: Math.round(current.temperature + (Math.random() - 0.5) * 4),
        humidity: Math.round(current.humidity),
        pressure: Math.round(1010 + (Math.random() - 0.5) * 20),
        windSpeed: Math.round(current.windSpeed * 10) / 10,
        windDirection: Math.round(Math.random() * 360),
        visibility: Math.round((10 + Math.random() * 10) * 10) / 10,
        uvIndex: Math.round(Math.random() * 10),
        description: current.description,
        icon: current.icon,
        cloudCover: Math.round(current.cloudCover),
        precipitation: current.precipitation
      },
      timestamp: new Date().toISOString(),
      sunrise: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      sunset: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    };
  }

  // Generate mock forecast data
  getMockForecastData() {
    const forecasts = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const baseTemp = 26 + Math.random() * 8;
      forecasts.push({
        date: date.toDateString(),
        temperature: {
          min: Math.round(baseTemp - 3 - Math.random() * 3),
          max: Math.round(baseTemp + 2 + Math.random() * 4)
        },
        humidity: Math.round(60 + Math.random() * 25),
        pressure: Math.round(1010 + (Math.random() - 0.5) * 15),
        windSpeed: Math.round((2 + Math.random() * 4) * 10) / 10,
        description: ['clear sky', 'few clouds', 'scattered clouds', 'light rain'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
        precipitation: Math.round(Math.random() * 5 * 10) / 10
      });
    }

    return {
      location: {
        city: 'Colombo',
        country: 'LK'
      },
      forecasts
    };
  }

  // Get smart irrigation recommendations based on weather
  getIrrigationRecommendations(weatherData, sensorData) {
    const { current } = weatherData;
    const recommendations = {
      action: 'maintain',
      intensity: 'normal',
      duration: 15,
      frequency: 'twice_daily',
      reasoning: [],
      nextCheck: 2 // hours
    };

    // Temperature analysis
    if (current.temperature > 35) {
      recommendations.action = 'increase';
      recommendations.intensity = 'high';
      recommendations.duration = 25;
      recommendations.frequency = 'every_2_hours';
      recommendations.reasoning.push('Extreme heat detected - increase watering');
    } else if (current.temperature > 30) {
      recommendations.intensity = 'medium-high';
      recommendations.duration = 20;
      recommendations.reasoning.push('High temperature - slightly increase watering');
    }

    // Humidity analysis
    if (current.humidity < 40) {
      recommendations.action = 'increase';
      recommendations.reasoning.push('Low humidity - plants need more water');
    } else if (current.humidity > 85) {
      recommendations.action = 'reduce';
      recommendations.reasoning.push('High humidity - risk of fungal diseases');
    }

    // Precipitation analysis
    if (current.precipitation > 5) {
      recommendations.action = 'skip';
      recommendations.reasoning.push('Recent rainfall - skip irrigation');
      recommendations.nextCheck = 6;
    } else if (current.precipitation > 2) {
      recommendations.action = 'reduce';
      recommendations.reasoning.push('Light rain - reduce irrigation');
    }

    // Wind analysis
    if (current.windSpeed > 15) {
      recommendations.reasoning.push('High wind - consider windbreak protection');
    }

    // UV analysis
    if (current.uvIndex > 8) {
      recommendations.reasoning.push('High UV index - consider shade protection');
    }

    return recommendations;
  }

  // Get crop recommendations based on weather conditions
  getCropRecommendations(weatherData, forecastData) {
    const { current } = weatherData;
    const recommendations = [];

    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push({
        type: 'warning',
        category: 'temperature',
        message: 'Extreme heat stress risk - provide shade and increase irrigation',
        priority: 'high'
      });
    }

    // Humidity-based recommendations
    if (current.humidity > 85) {
      recommendations.push({
        type: 'warning',
        category: 'humidity',
        message: 'High humidity - increase ventilation to prevent fungal diseases',
        priority: 'medium'
      });
    }

    // Weather forecast recommendations
    const rainExpected = forecastData.forecasts.some(day => day.precipitation > 2);
    if (rainExpected) {
      recommendations.push({
        type: 'info',
        category: 'forecast',
        message: 'Rain expected in the next few days - adjust irrigation schedule',
        priority: 'low'
      });
    }

    return recommendations;
  }
}

module.exports = new WeatherService();
