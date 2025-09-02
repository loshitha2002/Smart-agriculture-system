/*
 * Smart Agriculture IoT System
 * DHT22 Temperature & Humidity Sensor Integration
 * 
 * Hardware Setup:
 * - DHT22 VCC -> 3.3V or 5V
 * - DHT22 GND -> GND
 * - DHT22 DATA -> Digital Pin 2
 * - Add 4.7K-10K pullup resistor between VCC and DATA
 * 
 * Required Libraries:
 * - DHT sensor library by Adafruit
 * - WiFi library (for ESP32) or WiFiNINA (for Arduino)
 * - ArduinoJson library
 */

#include "DHT.h"
#include <WiFi.h>          // For ESP32
// #include <WiFiNINA.h>   // For Arduino Nano 33 IoT
#include <HTTPClient.h>
#include <ArduinoJson.h>

// DHT22 Configuration
#define DHT_PIN 2        // Try GPIO 2 (D2) instead of GPIO 4
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// WiFi Configuration - Use your mobile hotspot
const char* ssid = "Loshitha";          // Back to your original hotspot name
const char* password = "LU123456";      // Back to your original password

// Alternative options to try if above doesn't work:
// const char* ssid = "ESP32Test";       // Simple test name
// const char* password = "12345678";    // Simple password

// Server Configuration
const char* serverURL = "http://172.20.10.3:5000"; // ✅ Your computer's IP address
const String deviceID = "DHT22_001";
const String location = "greenhouse_1";

// Timing variables
unsigned long lastReading = 0;
const unsigned long readingInterval = 120000; // 2 minutes (120 seconds) - DHT22 needs longer intervals
unsigned long lastWiFiCheck = 0;
const unsigned long wifiCheckInterval = 300000; // 5 minutes

// Data validation
struct SensorData {
  float temperature;
  float humidity;
  float heatIndex;
  bool isValid;
  String timestamp;
};

void setup() {
  Serial.begin(115200);
  Serial.println("🌱 Smart Agriculture DHT22 Sensor Starting...");
  
  // Initialize DHT22 sensor
  dht.begin();
  Serial.println("DHT22 sensor initialized");
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("✅ Setup complete! Starting sensor readings...");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check WiFi connection
  if (currentTime - lastWiFiCheck >= wifiCheckInterval) {
    checkWiFiConnection();
    lastWiFiCheck = currentTime;
  }
  
  // Read sensor data
  if (currentTime - lastReading >= readingInterval) {
    SensorData data = readSensorData();
    
    if (data.isValid) {
      // Print to Serial Monitor
      printSensorData(data);
      
      // Send to server
      if (WiFi.status() == WL_CONNECTED) {
        sendDataToServer(data);
      } else {
        Serial.println("⚠️ WiFi not connected, storing data locally");
        // TODO: Store data in EEPROM for later transmission
      }
    } else {
      Serial.println("❌ Invalid sensor reading, skipping...");
      Serial.println("🔄 Reinitializing DHT22 sensor...");
      dht.begin(); // Reinitialize the sensor
      delay(2000);  // Give it time to initialize
    }
    
    lastReading = currentTime;
  }
  
  delay(1000); // Small delay to prevent overwhelming the system
}

void connectToWiFi() {
  // Clear any previous WiFi config
  WiFi.disconnect();
  WiFi.mode(WIFI_OFF); // Turn off WiFi first
  delay(1000);
  
  WiFi.mode(WIFI_STA); // Set to station mode
  WiFi.setSleep(false); // Disable WiFi sleep mode
  
  Serial.println("=== WiFi Connection Debug ===");
  Serial.println("SSID: " + String(ssid));
  Serial.println("Password length: " + String(strlen(password)));
  Serial.println("ESP32 MAC: " + WiFi.macAddress());
  
  // Test WiFi scan first
  Serial.println("Testing WiFi scan capability...");
  WiFi.scanDelete(); // Clear previous scan results
  int scanResult = WiFi.scanNetworks();
  
  if (scanResult == WIFI_SCAN_FAILED || scanResult < 0) {
    Serial.println("❌ WiFi scan failed! Hardware issue detected.");
    Serial.println("Try: 1) Reset ESP32, 2) Check antenna, 3) Try different ESP32");
    return;
  } else {
    Serial.println("✅ WiFi scan successful! Found " + String(scanResult) + " networks:");
    for (int i = 0; i < scanResult; i++) {
      Serial.println("  " + String(i+1) + ". " + WiFi.SSID(i) + " (" + String(WiFi.RSSI(i)) + " dBm)");
    }
  }
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) { // Reduced attempts
    delay(1500); // Longer delay
    Serial.print(".");
    attempts++;
    
    // Print connection status for debugging
    if (attempts % 5 == 0) {
      Serial.println();
      Serial.print("WiFi status: ");
      Serial.print(WiFi.status());
      Serial.print(" | Attempt ");
      Serial.print(attempts);
      Serial.println("/20");
    }
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("Gateway: ");
    Serial.println(WiFi.gatewayIP());
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed!");
    Serial.print("Final status code: ");
    Serial.println(WiFi.status());
    Serial.println("Status meanings:");
    Serial.println("0=IDLE, 1=NO_SSID, 3=CONNECTED, 4=CONNECT_FAILED, 5=CONNECTION_LOST, 6=DISCONNECTED");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("🔄 WiFi disconnected, attempting to reconnect...");
    connectToWiFi();
  }
}

SensorData readSensorData() {
  SensorData data;
  
  Serial.println("--- Reading DHT22 Sensor ---");
  Serial.println("DHT22 Pin: " + String(DHT_PIN) + " (GPIO 2)");
  
  // DHT22 needs longer initialization delay
  delay(5000); // Increased to 5 seconds for better stability
  
  // Try multiple readings if first fails
  int attempts = 0;
  bool readingSuccess = false;
  
  while (attempts < 3 && !readingSuccess) {
    attempts++;
    Serial.println("Reading attempt " + String(attempts) + "/3...");
    
    // Power cycle simulation - give sensor time to reset
    if (attempts > 1) {
      Serial.println("Giving sensor extra recovery time...");
      delay(5000); // Extra 5 seconds between failed attempts
    }
    
    // Read temperature and humidity
    data.humidity = dht.readHumidity();
    data.temperature = dht.readTemperature(); // Celsius
    
    // Debug raw readings
    Serial.println("Raw temperature: " + String(data.temperature));
    Serial.println("Raw humidity: " + String(data.humidity));
    
    // Check if reading is valid
    if (!isnan(data.temperature) && !isnan(data.humidity)) {
      readingSuccess = true;
      Serial.println("✅ Reading successful on attempt " + String(attempts));
    } else {
      Serial.println("❌ Attempt " + String(attempts) + " failed, retrying...");
      delay(3000); // Wait 3 seconds before retry
    }
  }
  
  // Check for NaN values
  if (isnan(data.temperature)) {
    Serial.println("❌ Temperature reading is NaN after all attempts!");
  }
  if (isnan(data.humidity)) {
    Serial.println("❌ Humidity reading is NaN after all attempts!");
  }
  
  data.heatIndex = dht.computeHeatIndex(data.temperature, data.humidity, false);
  data.timestamp = getFormattedTime();
  
  // Validate readings
  data.isValid = !isnan(data.temperature) && !isnan(data.humidity);
  
  // Additional validation ranges
  if (data.isValid) {
    if (data.temperature < -40 || data.temperature > 80) {
      data.isValid = false;
      Serial.println("⚠️ Temperature out of valid range: " + String(data.temperature));
    }
    if (data.humidity < 0 || data.humidity > 100) {
      data.isValid = false;
      Serial.println("⚠️ Humidity out of valid range: " + String(data.humidity));
    }
    Serial.println("✅ Sensor readings are valid!");
  } else {
    Serial.println("❌ Invalid sensor readings detected");
    Serial.println("DHT22 troubleshooting tips:");
    Serial.println("1. DHT22 needs 2+ minutes between readings");
    Serial.println("2. Check wiring: VCC→3.3V, DATA→GPIO2, GND→GND");
    Serial.println("3. Ensure 10kΩ pullup resistor between VCC and DATA");
    Serial.println("4. DHT22 may need power cycle (unplug/replug VCC)");
    Serial.println("5. Try increasing reading interval to 120+ seconds");
    Serial.println("6. Check for loose connections or power supply issues");
  }
  
  return data;
}

void printSensorData(SensorData data) {
  Serial.println("=== DHT22 Sensor Reading ===");
  Serial.println("Timestamp: " + data.timestamp);
  Serial.println("Temperature: " + String(data.temperature, 2) + "°C");
  Serial.println("Humidity: " + String(data.humidity, 2) + "%");
  Serial.println("Heat Index: " + String(data.heatIndex, 2) + "°C");
  Serial.println("Device ID: " + deviceID);
  Serial.println("Location: " + location);
  Serial.println("============================");
}

void sendDataToServer(SensorData data) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/sensors/dht22/data");
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    DynamicJsonDocument doc(1024);
    doc["deviceId"] = deviceID;
    doc["location"] = location;
    doc["timestamp"] = data.timestamp;
    doc["sensorType"] = "DHT22";
    doc["data"]["temperature"] = data.temperature;
    doc["data"]["humidity"] = data.humidity;
    doc["data"]["heatIndex"] = data.heatIndex;
    doc["data"]["temperatureFahrenheit"] = (data.temperature * 9.0/5.0) + 32;
    doc["metadata"]["firmwareVersion"] = "1.0.0";
    doc["metadata"]["wifiSignalStrength"] = WiFi.RSSI();
    doc["metadata"]["uptimeSeconds"] = millis() / 1000;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Send HTTP POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("✅ Data sent successfully!");
      Serial.println("Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("❌ Error sending data");
      Serial.println("Error code: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi not connected, cannot send data");
  }
}

String getFormattedTime() {
  // Simple timestamp - in production, use NTP for accurate time
  unsigned long currentTime = millis();
  return String(currentTime);
}

// Emergency reset function
void factoryReset() {
  Serial.println("🔄 Performing factory reset...");
  // Clear WiFi credentials and restart
  WiFi.disconnect(true);
  delay(1000);
  ESP.restart();
}
