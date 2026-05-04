import * as tf from '@tensorflow/tfjs';

/**
 * Client-side ML service for delivery predictions
 * Uses TensorFlow.js for local inference
 */
class MLClientService {
  constructor() {
    this.model = null;
    this.modelLoaded = false;
    this.initialized = false;
  }

  /**
   * Initialize and load the model
   */
  async initialize() {
    try {
      if (this.initialized) return;

      // In production, load pre-trained model from server
      // For now, create a simple model
      await this.createSimpleModel();

      this.initialized = true;
      console.log('ML Client Service initialized');
    } catch (error) {
      console.error('Error initializing ML service:', error);
      throw error;
    }
  }

  /**
   * Create a simple neural network model for delivery prediction
   */
  async createSimpleModel() {
    try {
      // Create a simple feedforward neural network
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [8], // 8 input features
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 8,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 1, // Output: predicted delivery time
            activation: 'linear'
          })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      this.modelLoaded = true;
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  }

  /**
   * Load pre-trained model from server
   */
  async loadPreTrainedModel(modelUrl) {
    try {
      this.model = await tf.loadLayersModel(modelUrl);
      this.modelLoaded = true;
      console.log('Pre-trained model loaded');
    } catch (error) {
      console.error('Error loading pre-trained model:', error);
      // Fall back to simple model
      await this.createSimpleModel();
    }
  }

  /**
   * Predict delivery time from features
   */
  async predictDeliveryTime(features) {
    try {
      if (!this.modelLoaded) {
        await this.initialize();
      }

      // Normalize features
      const normalizedFeatures = this.normalizeFeatures(features);

      // Create tensor
      const input = tf.tensor2d([normalizedFeatures], [1, 8]);

      // Predict
      const prediction = this.model.predict(input);
      const result = await prediction.data();

      // Denormalize result
      const predictedTime = Math.max(5, Math.round(result[0] * 60)); // Convert to minutes

      // Clean up tensors
      input.dispose();
      prediction.dispose();

      return {
        minutes: predictedTime,
        confidence: this.calculateConfidence(features),
        factors: {
          distance: features.distance,
          traffic: features.traffic,
          weather: features.weather,
          timeOfDay: features.timeOfDay
        }
      };
    } catch (error) {
      console.error('Error predicting delivery time:', error);
      throw error;
    }
  }

  /**
   * Train model with historical data
   */
  async trainModel(trainingData, epochs = 50, batchSize = 32) {
    try {
      if (!this.modelLoaded) {
        await this.initialize();
      }

      // Prepare training data
      const { features, labels } = this.prepareTrainingData(trainingData);

      // Create tensors
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      // Train
      const history = await this.model.fit(xs, ys, {
        epochs,
        batchSize,
        validationSplit: 0.2,
        verbose: 1,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
          }
        }
      });

      // Clean up
      xs.dispose();
      ys.dispose();

      return history;
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  /**
   * Save model to local storage
   */
  async saveModel() {
    try {
      if (!this.modelLoaded) {
        throw new Error('No model to save');
      }

      await this.model.save('indexeddb://delivery-predictor-model');
      console.log('Model saved to IndexedDB');
    } catch (error) {
      console.error('Error saving model:', error);
      throw error;
    }
  }

  /**
   * Load model from local storage
   */
  async loadModelFromStorage() {
    try {
      this.model = await tf.loadLayersModel('indexeddb://delivery-predictor-model');
      this.modelLoaded = true;
      console.log('Model loaded from IndexedDB');
    } catch (error) {
      console.error('Error loading model from storage:', error);
      // Fall back to default model
      await this.createSimpleModel();
    }
  }

  /**
   * Predict route efficiency
   */
  predictRouteEfficiency(route) {
    try {
      const distances = [];

      for (let i = 0; i < route.length - 1; i++) {
        const dist = this.haversineDistance(route[i], route[i + 1]);
        distances.push(dist);
      }

      const totalDistance = distances.reduce((a, b) => a + b, 0);
      const avgDistance = totalDistance / distances.length;
      const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;

      // Lower variance = better route
      const efficiency = Math.max(0, 100 - Math.sqrt(variance) * 10);

      return {
        efficiency: Math.round(efficiency),
        totalDistance: Math.round(totalDistance * 10) / 10,
        smoothness: 100 - Math.sqrt(variance) * 5
      };
    } catch (error) {
      console.error('Error predicting route efficiency:', error);
      return { efficiency: 50, totalDistance: 0, smoothness: 50 };
    }
  }

  /**
   * Analyze demand pattern from historical data
   */
  analyzeDemandPattern(historicalData) {
    try {
      const hourlyData = {};

      historicalData.forEach(record => {
        const hour = new Date(record.timestamp).getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      });

      // Fill missing hours
      for (let i = 0; i < 24; i++) {
        if (!hourlyData[i]) {
          hourlyData[i] = 0;
        }
      }

      // Find peaks
      const peaks = [];
      const avgOrders = Object.values(hourlyData).reduce((a, b) => a + b) / 24;

      for (let i = 0; i < 24; i++) {
        if (hourlyData[i] > avgOrders * 1.5) {
          peaks.push(i);
        }
      }

      return {
        hourlyPattern: hourlyData,
        peakHours: peaks,
        averageOrders: Math.round(avgOrders),
        variance: this.calculateVariance(Object.values(hourlyData))
      };
    } catch (error) {
      console.error('Error analyzing demand pattern:', error);
      return { hourlyPattern: {}, peakHours: [], averageOrders: 0, variance: 0 };
    }
  }

  /**
   * Detect anomalies in delivery data
   */
  detectAnomalies(deliveryData) {
    try {
      const times = deliveryData.map(d => d.actualDeliveryTime);
      const mean = times.reduce((a, b) => a + b) / times.length;
      const stdDev = Math.sqrt(
        times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length
      );

      const anomalies = [];

      deliveryData.forEach((record, index) => {
        const deviation = Math.abs(record.actualDeliveryTime - mean) / stdDev;

        // Flag if more than 2 standard deviations
        if (deviation > 2) {
          anomalies.push({
            index,
            value: record.actualDeliveryTime,
            deviation,
            likely_cause: this.identifyAnomalyCause(record)
          });
        }
      });

      return {
        anomalies,
        mean: Math.round(mean),
        stdDev: Math.round(stdDev),
        anomalyCount: anomalies.length,
        anomalyPercentage: (anomalies.length / deliveryData.length) * 100
      };
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return { anomalies: [], anomalyCount: 0, anomalyPercentage: 0 };
    }
  }

  /**
   * Calculate fairness of dynamic pricing
   */
  calculatePricingFairness(pricingHistory) {
    try {
      const pricings = pricingHistory.map(p => p.surgeFactor);
      const mean = pricings.reduce((a, b) => a + b) / pricings.length;
      const variance = pricings.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pricings.length;

      // Lower variance = more fair/consistent pricing
      let fairnessScore = Math.max(0, 100 - Math.sqrt(variance) * 50);

      // Check for excessive surges
      const excessiveSurges = pricings.filter(p => p > 1.5).length;
      fairnessScore -= excessiveSurges * 5;

      return {
        fairnessScore: Math.max(0, Math.round(fairnessScore)),
        averageSurgeFactor: Math.round(mean * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        excessiveSurges
      };
    } catch (error) {
      console.error('Error calculating pricing fairness:', error);
      return { fairnessScore: 50, averageSurgeFactor: 1, variance: 0, excessiveSurges: 0 };
    }
  }

  // Helper methods
  normalizeFeatures(features) {
    return [
      features.distance / 10, // Normalize by typical max distance
      this.mapTrafficToNumber(features.traffic) / 4,
      this.mapWeatherToNumber(features.weather) / 5,
      this.mapTimeOfDayToNumber(features.timeOfDay) / 24,
      features.humidity / 100,
      features.windSpeed / 20,
      this.mapDemandToNumber(features.demandLevel) / 4,
      features.driverExperience / 5
    ];
  }

  mapTrafficToNumber(traffic) {
    const map = { low: 1, medium: 2, high: 3, severe: 4 };
    return map[traffic] || 2;
  }

  mapWeatherToNumber(weather) {
    const map = { clear: 1, cloudy: 2, rainy: 3, snowy: 4, stormy: 5 };
    return map[weather] || 2;
  }

  mapTimeOfDayToNumber(timeOfDay) {
    const map = { night: 0, morning: 6, afternoon: 12, evening: 18 };
    return map[timeOfDay] || 12;
  }

  mapDemandToNumber(demand) {
    const map = { low: 1, medium: 2, high: 3, very_high: 4 };
    return map[demand] || 2;
  }

  calculateConfidence(features) {
    let confidence = 85;

    if (!features.traffic) confidence -= 10;
    if (!features.weather) confidence -= 5;

    return Math.max(50, confidence);
  }

  prepareTrainingData(trainingData) {
    const features = [];
    const labels = [];

    trainingData.forEach(record => {
      features.push(this.normalizeFeatures(record.factors));
      labels.push([record.actualDeliveryTime / 60]); // Normalize to hours
    });

    return { features, labels };
  }

  haversineDistance(loc1, loc2) {
    const R = 6371; // Earth radius in km
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  identifyAnomalyCause(record) {
    if (record.factors?.weather === 'stormy') return 'severe_weather';
    if (record.factors?.traffic === 'severe') return 'severe_traffic';
    if (record.factors?.distance > 10) return 'long_distance';
    return 'unknown';
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.modelLoaded = false;
    }
  }
}

export default new MLClientService();
