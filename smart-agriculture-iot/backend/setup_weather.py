#!/usr/bin/env python3
"""
Real-Time Weather Setup Script
Helps you configure OpenWeatherMap API for real weather data
"""

import os
import sys
import requests
import json

def print_banner():
    print("🌤️" + "="*50)
    print("  SMART AGRICULTURE - REAL-TIME WEATHER SETUP")
    print("="*52)
    print()

def check_current_status():
    """Check if the weather service is already configured"""
    print("📊 Checking current weather configuration...")
    
    # Check if API key is set
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    api_key = None
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('WEATHER_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
                    break
    
    if not api_key or api_key == 'demo_key' or api_key == 'your_openweathermap_api_key_here':
        print("❌ No valid API key found")
        return False
    
    # Test the API key
    try:
        print(f"🔑 Testing API key: {api_key[:8]}...")
        url = f"https://api.openweathermap.org/data/2.5/weather?q=London&appid={api_key}"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            print("✅ API key is valid and working!")
            return True
        elif response.status_code == 401:
            print("❌ API key is invalid")
            return False
        else:
            print(f"⚠️ API test failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def setup_api_key():
    """Guide user through API key setup"""
    print("\n🔧 Setting up OpenWeatherMap API...")
    print()
    print("Step 1: Get your FREE API key")
    print("1. Go to: https://openweathermap.org/api")
    print("2. Click 'Sign Up' (it's free!)")
    print("3. Verify your email")
    print("4. Go to: https://home.openweathermap.org/api_keys")
    print("5. Copy your API key")
    print()
    
    api_key = input("Enter your OpenWeatherMap API key: ").strip()
    
    if not api_key:
        print("❌ No API key provided")
        return False
    
    # Test the API key
    print("🧪 Testing your API key...")
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q=London&appid={api_key}"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            print("✅ API key works!")
        elif response.status_code == 401:
            print("❌ Invalid API key. Please check and try again.")
            return False
        else:
            print(f"⚠️ API test returned status: {response.status_code}")
            print("The key might work, but there was an issue. Proceeding anyway...")
    except Exception as e:
        print(f"⚠️ Couldn't test API key: {e}")
        print("Proceeding with configuration anyway...")
    
    # Save to .env file
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    env_content = []
    
    # Read existing .env file if it exists
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if not line.startswith('WEATHER_API_KEY='):
                    env_content.append(line.rstrip())
    
    # Add the new API key
    env_content.append(f'WEATHER_API_KEY={api_key}')
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        f.write('\n'.join(env_content) + '\n')
    
    print(f"💾 API key saved to {env_file}")
    return True

def setup_location():
    """Configure default location"""
    print("\n📍 Setting up default location...")
    print()
    print("Current default: Colombo, Sri Lanka (6.9271, 79.8612)")
    
    change = input("Do you want to change the default location? (y/N): ").strip().lower()
    
    if change in ['y', 'yes']:
        print("\nEnter your location coordinates:")
        print("(You can find these at: https://www.latlong.net/)")
        
        try:
            lat = float(input("Latitude: ").strip())
            lon = float(input("Longitude: ").strip())
            city = input("City name: ").strip()
            
            if not city:
                city = "Custom Location"
            
            # Validate coordinates
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                print("❌ Invalid coordinates")
                return False
            
            # Update .env file
            env_file = os.path.join(os.path.dirname(__file__), '.env')
            env_content = []
            
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    for line in f:
                        if not (line.startswith('DEFAULT_LAT=') or 
                               line.startswith('DEFAULT_LON=') or 
                               line.startswith('DEFAULT_CITY=')):
                            env_content.append(line.rstrip())
            
            # Add location settings
            env_content.extend([
                f'DEFAULT_LAT={lat}',
                f'DEFAULT_LON={lon}',
                f'DEFAULT_CITY={city}'
            ])
            
            with open(env_file, 'w') as f:
                f.write('\n'.join(env_content) + '\n')
            
            print(f"✅ Default location set to: {city} ({lat}, {lon})")
            return True
            
        except ValueError:
            print("❌ Invalid coordinates format")
            return False
    
    print("✅ Using default location: Colombo, Sri Lanka")
    return True

def test_weather_api():
    """Test the complete weather API"""
    print("\n🧪 Testing weather API endpoints...")
    
    try:
        # Test current weather
        response = requests.get('http://localhost:5000/api/weather/current', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Current weather: {data.get('location', {}).get('city', 'Unknown')} - {data.get('current', {}).get('temperature', 'N/A')}°C")
        else:
            print(f"❌ Current weather API failed: {response.status_code}")
            
        # Test forecast
        response = requests.get('http://localhost:5000/api/weather/forecast', timeout=10)
        if response.status_code == 200:
            data = response.json()
            forecasts = data.get('forecasts', [])
            print(f"✅ Forecast: {len(forecasts)} days available")
        else:
            print(f"❌ Forecast API failed: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Make sure the backend server is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False
    
    return True

def main():
    print_banner()
    
    # Check current status
    if check_current_status():
        print("\n🎉 Weather service is already configured and working!")
        
        test_api = input("\nDo you want to test the API endpoints? (Y/n): ").strip().lower()
        if test_api not in ['n', 'no']:
            test_weather_api()
        
        print("\n✨ Setup complete! Your weather dashboard should now show real-time data.")
        print("🌐 Visit: http://localhost:3000/weather")
        return
    
    print("\n🔧 Let's set up real-time weather data!")
    
    # Setup API key
    if not setup_api_key():
        print("\n❌ Setup failed. Please try again.")
        return
    
    # Setup location
    setup_location()
    
    print("\n🔄 Please restart your backend server for changes to take effect:")
    print("   1. Stop the current server (Ctrl+C)")
    print("   2. Run: cd backend && node src/server.js")
    print()
    print("🌐 Then visit: http://localhost:3000/weather")
    print()
    print("🎉 Setup complete! You should now see real weather data instead of demo data.")

if __name__ == "__main__":
    main()
