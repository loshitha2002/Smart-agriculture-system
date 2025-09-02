# 🌤️ Real-Time Weather Integration Setup

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Free Weather API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to [API Keys page](https://home.openweathermap.org/api_keys)
5. Copy your API key

### Step 2: Configure API Key
1. Open `backend/.env` file
2. Add this line:
   ```
   WEATHER_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with your real API key

### Step 3: Test Real-Time Weather
1. Restart the backend server: `npm start`
2. Go to http://localhost:3000/weather
3. You should now see real weather data!

---

## 🌍 Location Configuration

### Default Location
Currently set to: **Colombo, Sri Lanka**
- Latitude: 6.9271
- Longitude: 79.8612

### Change Location
Edit in `backend/.env`:
```env
DEFAULT_LAT=your_latitude
DEFAULT_LON=your_longitude
DEFAULT_CITY=Your_City_Name
```

### Popular Locations:
```env
# New York, USA
DEFAULT_LAT=40.7128
DEFAULT_LON=-74.0060
DEFAULT_CITY=New_York

# London, UK
DEFAULT_LAT=51.5074
DEFAULT_LON=-0.1278
DEFAULT_CITY=London

# Tokyo, Japan
DEFAULT_LAT=35.6762
DEFAULT_LON=139.6503
DEFAULT_CITY=Tokyo

# Mumbai, India
DEFAULT_LAT=19.0760
DEFAULT_LON=72.8777
DEFAULT_CITY=Mumbai
```

---

## 📊 Weather Features

### ✅ Current Weather
- Real-time temperature, humidity, wind
- Weather conditions and descriptions
- Atmospheric pressure
- Cloud coverage

### ✅ 5-Day Forecast
- Daily temperature ranges
- Precipitation probability
- Weather conditions
- Wind speed and direction

### ✅ Smart Recommendations
- Irrigation scheduling
- Planting suggestions
- Harvest timing
- Weather alerts

---

## 🔧 Advanced Configuration

### Update Intervals
```env
WEATHER_UPDATE_INTERVAL=300000   # 5 minutes
FORECAST_UPDATE_INTERVAL=1800000 # 30 minutes
```

### API Limits (Free Tier)
- 1,000 calls per day
- 60 calls per minute
- Historical data: 5 days
- Current weather: Unlimited

### Upgrade to Paid Plan
For production use:
- 100,000+ calls per day
- 16-day forecast
- Historical weather data
- Weather maps and alerts

---

## 🛠️ Troubleshooting

### "Demo Mode" Still Showing?
1. Check your API key is correct
2. Restart the backend server
3. Check browser console for errors
4. Verify internet connection

### API Key Issues?
1. Confirm API key is active (may take 10 minutes)
2. Check for typos in `.env` file
3. Ensure no spaces around the key
4. Try regenerating the API key

### Location Not Working?
1. Check latitude/longitude format
2. Ensure coordinates are valid (-90 to 90 for lat, -180 to 180 for lon)
3. Try using a major city first

---

## 📱 Mobile & Geolocation

The weather system will automatically:
1. Try to get your current location
2. Fall back to default location if denied
3. Update weather based on your location
4. Cache data to reduce API calls

---

## 🌟 What You'll See

Once configured, your weather dashboard will show:
- **Real current temperature** instead of mock data
- **Actual 5-day forecast** for your area
- **Live weather alerts** and recommendations
- **Smart irrigation suggestions** based on real weather
- **Automatic updates** every 5 minutes

Ready to have real weather intelligence for your smart farm! 🚜🌾
