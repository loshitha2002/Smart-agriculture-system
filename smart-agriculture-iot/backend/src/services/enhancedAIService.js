// Enhanced AI Service with Machine Learning
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

class EnhancedAIService {
  constructor() {
    this.models = {
      yieldPrediction: null,
      diseaseDetection: null,
      weatherPrediction: null,
      irrigationOptimization: null
    };
    this.trainingData = [];
    this.isTraining = false;
  }

  // Collect and prepare training data
  async collectTrainingData(sensorData, weatherData, yieldData) {
    const dataPoint = {
      features: [
        sensorData.temperature,
        sensorData.humidity,
        sensorData.soilMoisture,
        sensorData.pH,
        sensorData.lightIntensity,
        weatherData.temperature,
        weatherData.humidity,
        weatherData.pressure,
        this.getDayOfYear(),
        this.getGrowthStage()
      ],
      labels: {
        yield: yieldData.actualYield,
        diseaseRisk: yieldData.diseaseOccurred ? 1 : 0,
        waterNeeded: yieldData.waterUsed,
        energyEfficiency: yieldData.energyEfficiency
      },
      timestamp: new Date().toISOString()
    };

    this.trainingData.push(dataPoint);
    
    // Auto-retrain when we have enough new data
    if (this.trainingData.length % 100 === 0) {
      await this.retrainModels();
    }
  }

  // Advanced yield prediction model
  async trainYieldPredictionModel() {
    if (this.trainingData.length < 50) {
      throw new Error('Insufficient training data');
    }

    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse', 'mae']
    });

    // Prepare training data
    const features = tf.tensor2d(this.trainingData.map(d => d.features));
    const labels = tf.tensor2d(this.trainingData.map(d => [d.labels.yield]));

    // Train the model
    await model.fit(features, labels, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
        }
      }
    });

    this.models.yieldPrediction = model;
    await this.saveModel('yieldPrediction', model);
  }

  // Disease detection using image classification
  async trainDiseaseDetectionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 5, activation: 'softmax' }) // 5 disease classes
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.models.diseaseDetection = model;
  }

  // Advanced prediction with uncertainty estimation
  async predictWithUncertainty(inputData, modelType = 'yieldPrediction') {
    const model = this.models[modelType];
    if (!model) {
      throw new Error(`Model ${modelType} not loaded`);
    }

    // Monte Carlo Dropout for uncertainty estimation
    const predictions = [];
    const numSamples = 100;

    for (let i = 0; i < numSamples; i++) {
      const prediction = model.predict(tf.tensor2d([inputData]));
      predictions.push(await prediction.data());
    }

    // Calculate mean and standard deviation
    const mean = predictions.reduce((sum, pred) => sum + pred[0], 0) / numSamples;
    const variance = predictions.reduce((sum, pred) => sum + Math.pow(pred[0] - mean, 2), 0) / numSamples;
    const uncertainty = Math.sqrt(variance);

    return {
      prediction: mean,
      uncertainty: uncertainty,
      confidence: Math.max(0, 1 - uncertainty / mean),
      recommendations: this.generateRecommendations(mean, uncertainty)
    };
  }

  // Real-time learning from farmer feedback
  async updateModelWithFeedback(predictionId, actualResult, feedback) {
    const feedbackData = {
      predictionId,
      actualResult,
      feedback,
      timestamp: new Date().toISOString()
    };

    // Store feedback for retraining
    this.trainingData.push(feedbackData);

    // Immediate model adjustment using online learning
    if (feedback.type === 'correction') {
      await this.onlineLearningUpdate(feedbackData);
    }

    return { success: true, message: 'Feedback incorporated for model improvement' };
  }

  // Generate actionable recommendations
  generateRecommendations(prediction, uncertainty) {
    const recommendations = [];

    if (uncertainty > 0.2) {
      recommendations.push({
        type: 'data_collection',
        priority: 'high',
        message: 'Collect more sensor data to improve prediction accuracy'
      });
    }

    if (prediction < 0.6) {
      recommendations.push({
        type: 'intervention',
        priority: 'urgent',
        message: 'Consider immediate agricultural interventions'
      });
    }

    return recommendations;
  }

  // Model performance metrics
  async evaluateModelPerformance() {
    const metrics = {};
    
    for (const [modelName, model] of Object.entries(this.models)) {
      if (model) {
        metrics[modelName] = {
          accuracy: await this.calculateAccuracy(model),
          precision: await this.calculatePrecision(model),
          recall: await this.calculateRecall(model),
          f1Score: await this.calculateF1Score(model)
        };
      }
    }

    return metrics;
  }

  // Save model for persistence
  async saveModel(modelName, model) {
    const modelPath = `./models/${modelName}`;
    await model.save(`file://${modelPath}`);
    console.log(`✅ Model ${modelName} saved successfully`);
  }

  // Load pre-trained models
  async loadModels() {
    try {
      for (const modelName of Object.keys(this.models)) {
        const modelPath = `./models/${modelName}/model.json`;
        if (fs.existsSync(modelPath)) {
          this.models[modelName] = await tf.loadLayersModel(`file://${modelPath}`);
          console.log(`✅ Model ${modelName} loaded successfully`);
        }
      }
    } catch (error) {
      console.log('⚠️ No pre-trained models found, using default models');
    }
  }

  getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  getGrowthStage() {
    // Simplified growth stage calculation
    const dayOfYear = this.getDayOfYear();
    if (dayOfYear < 90) return 1; // Germination
    if (dayOfYear < 180) return 2; // Growth
    if (dayOfYear < 270) return 3; // Flowering
    return 4; // Harvest
  }
}

module.exports = new EnhancedAIService();
