#!/usr/bin/env python3
"""
Display Real-Time Weather Intelligence for Smart Agriculture
"""
import requests
import json
from datetime import datetime

def display_weather_intelligence():
    print("🌤️" + "="*60)
    print("   REAL-TIME WEATHER INTELLIGENCE - SMART AGRICULTURE")
    print("="*62)
    print()
    
    try:
        # Get current weather
        print("📊 Current Weather Conditions:")
        response = requests.get('http://localhost:5000/api/weather/current')
        current = response.json()
        
        location = current['location']
        weather = current['current']
        
        print(f"📍 Location: {location['city']}, {location['country']}")
        print(f"🌡️  Temperature: {weather['temperature']}°C (feels like {weather['feelsLike']}°C)")
        print(f"💧 Humidity: {weather['humidity']}%")
        print(f"🔽 Pressure: {weather['pressure']} hPa")
        print(f"💨 Wind: {weather['windSpeed']} m/s")
        print(f"☁️  Conditions: {weather['description']}")
        print()
        
        # Get 5-day forecast
        print("📅 5-Day Forecast:")
        response = requests.get('http://localhost:5000/api/weather/forecast')
        forecast = response.json()
        
        for day in forecast['forecasts']:
            date = day['date']
            temp_min = day['temperature']['min']
            temp_max = day['temperature']['max']
            desc = day['description']
            print(f"  {date}: {temp_min}°C - {temp_max}°C, {desc}")
        print()
        
        # Get smart recommendations
        print("🧠 Smart Agriculture Recommendations:")
        response = requests.get('http://localhost:5000/api/weather/recommendations')
        recommendations = response.json()
        
        for rec in recommendations['recommendations']:
            priority = rec['priority'].upper()
            category = rec['category']
            message = rec['message']
            
            if priority == 'HIGH':
                icon = "🔴"
            elif priority == 'MEDIUM':
                icon = "🟡"
            else:
                icon = "🟢"
                
            print(f"  {icon} {category}: {message}")
            print(f"     Priority: {priority}")
            print()
        
        print("✅ Real-time weather intelligence is fully operational!")
        print(f"🕐 Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to weather service. Make sure the backend is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    display_weather_intelligence()
