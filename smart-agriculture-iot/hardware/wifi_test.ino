/*
 * Simple WiFi Test for ESP32
 * Tests if WiFi hardware is working
 */

#include <WiFi.h>

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== ESP32 WiFi Hardware Test ===");
  Serial.println("ESP32 MAC Address: " + WiFi.macAddress());
  
  // Test WiFi scan capability
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  
  Serial.println("Scanning for WiFi networks...");
  int n = WiFi.scanNetworks();
  
  if (n == 0) {
    Serial.println("❌ No networks found - Check antenna/hardware");
  } else if (n < 0) {
    Serial.println("❌ WiFi scan failed - Hardware problem detected");
    Serial.println("Error code: " + String(n));
  } else {
    Serial.println("✅ WiFi hardware working! Found " + String(n) + " networks:");
    for (int i = 0; i < n; ++i) {
      Serial.println("  " + String(i + 1) + ": " + WiFi.SSID(i) + " (" + WiFi.RSSI(i) + " dBm)");
    }
  }
  
  Serial.println("=== Test Complete ===");
}

void loop() {
  // Do nothing
}
