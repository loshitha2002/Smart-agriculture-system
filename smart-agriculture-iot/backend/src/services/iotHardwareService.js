// IoT Hardware Integration Service
const mqtt = require('mqtt');
const SerialPort = require('serialport');

class IoTHardwareService {
  constructor() {
    this.sensors = new Map();
    this.actuators = new Map();
    this.mqttClient = null;
    this.serialPorts = new Map();
  }

  // Initialize MQTT connection for ESP32/Arduino
  async initializeMQTT(brokerUrl = 'mqtt://localhost:1883') {
    this.mqttClient = mqtt.connect(brokerUrl);
    
    this.mqttClient.on('connect', () => {
      console.log('🔗 Connected to MQTT broker');
      // Subscribe to sensor topics
      this.mqttClient.subscribe('sensors/+/data');
      this.mqttClient.subscribe('actuators/+/status');
    });

    this.mqttClient.on('message', (topic, message) => {
      this.handleSensorData(topic, JSON.parse(message.toString()));
    });
  }

  // Initialize Serial connection for Arduino
  async initializeSerial(port = '/dev/ttyUSB0', baudRate = 9600) {
    const serialPort = new SerialPort(port, { baudRate });
    
    serialPort.on('data', (data) => {
      this.handleSerialData(data.toString());
    });

    this.serialPorts.set(port, serialPort);
  }

  // Handle incoming sensor data
  handleSensorData(topic, data) {
    const sensorId = topic.split('/')[1];
    const timestamp = new Date().toISOString();
    
    const sensorReading = {
      sensorId,
      timestamp,
      ...data,
      source: 'hardware'
    };

    // Store in database
    this.storeSensorReading(sensorReading);
    
    // Real-time broadcasting
    this.broadcastSensorData(sensorReading);
    
    // Check thresholds and trigger alerts
    this.checkThresholds(sensorReading);
  }

  // Send commands to actuators
  async controlActuator(actuatorId, command, value) {
    const topic = `actuators/${actuatorId}/command`;
    const payload = JSON.stringify({ command, value, timestamp: new Date().toISOString() });
    
    if (this.mqttClient) {
      this.mqttClient.publish(topic, payload);
    }
    
    return { success: true, actuatorId, command, value };
  }

  // Hardware sensor configurations
  getSensorConfigurations() {
    return {
      soilMoisture: {
        type: 'analog',
        pin: 'A0',
        calibration: { dry: 1023, wet: 300 },
        thresholds: { low: 30, high: 70 }
      },
      temperature: {
        type: 'DHT22',
        pin: 2,
        thresholds: { low: 15, high: 35 }
      },
      humidity: {
        type: 'DHT22',
        pin: 2,
        thresholds: { low: 40, high: 80 }
      },
      pH: {
        type: 'analog',
        pin: 'A1',
        calibration: { acidic: 0, neutral: 512, basic: 1023 }
      },
      lightIntensity: {
        type: 'LDR',
        pin: 'A2',
        thresholds: { low: 200, high: 800 }
      }
    };
  }

  // Automated irrigation control
  async automatedIrrigation(sensorData) {
    const { soilMoisture, temperature, humidity } = sensorData;
    
    if (soilMoisture < 30 && temperature > 25) {
      await this.controlActuator('water_pump', 'start', { duration: 30000 }); // 30 seconds
      return { action: 'irrigation_started', reason: 'low_soil_moisture' };
    }
    
    return { action: 'no_action', reason: 'conditions_optimal' };
  }
}

module.exports = new IoTHardwareService();
