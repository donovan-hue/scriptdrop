const DeliveryPrediction = require('../models/DeliveryPrediction');
const Order = require('../models/Order');
const axios = require('axios');

// ML Prediction Function
const predictDeliveryTime = async (factors) => {
  const {
    distance,
    timeOfDay,
    dayOfWeek,
    traffic,
    weather,
    restaurantPrepTime,
    driverExperience
  } = factors;

  let basePrediction = (distance / 50) * 60; // 50 km/h average

  const timeMultipliers = {
    'morning': 1.2,
    'lunch': 1.5,
    'afternoon': 1.0,
    'dinner': 1.4,
    'night': 0.8
  };

  const trafficMultipliers = {
    'light': 1.0,
    'moderate': 1.3,
    'heavy': 1.7
  };

  const weatherImpact = {
    'clear': 0,
    'rain': 1.3,
    'snow': 1.8,
    'fog': 1.2
  };

  const dayMultipliers = {
    'Monday': 1.1,
    'Friday': 1.3,
    'Saturday': 1.4,
    'Sunday': 1.2
  };

  // Apply multipliers
  basePrediction *= (timeMultipliers[timeOfDay] || 1);
  basePrediction *= (trafficMultipliers[traffic] || 1);
  basePrediction *= (weatherImpact[weather] || 1);
  basePrediction *= (dayMultipliers[dayOfWeek] || 1);

  // Driver experience factor
  const experienceFactor = 1 - (driverExperience * 0.1);
  basePrediction *= Math.max(0.8, experimentFactor);

  // Add prep time
  basePrediction += (restaurantPrepTime || 15);

  return Math.round(basePrediction);
};

// Create delivery prediction
exports.predictDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const currentTime = new Date();
    const timeOfDay = currentTime.getHours() < 12 ? 'morning' : 
                     currentTime.getHours() < 17 ? 'afternoon' : 
                     currentTime.getHours() < 21 ? 'dinner' : 'night';

    const dayOfWeek = currentTime.toLocaleString('en-us', { weekday: 'long' });

    // Simulate ML prediction (replace with real ML model)
    const predictedMinutes = await predictDeliveryTime({
      distance: order.deliveryDistance || 5,
      timeOfDay,
      dayOfWeek,
      traffic: 'moderate',
      weather: 'clear',
      restaurantPrepTime: 15,
      driverExperience: 0.7
    });

    const prediction = new DeliveryPrediction({
      orderId,
      restaurantId: order.restaurantId,
      pickupLocation: {
        type: 'Point',
        coordinates: [order.restaurantLocation?.lng || 0, order.restaurantLocation?.lat || 0]
      },
      deliveryLocation: {
        type: 'Point',
        coordinates: [order.deliveryLocation?.lng || 0, order.deliveryLocation?.lat || 0]
      },
      predictedDeliveryTime: new Date(currentTime.getTime() + predictedMinutes * 60000),
      distance: order.deliveryDistance || 5,
      traffic: { level: 'moderate', congestionIndex: 0.5 },
      mlFactors: {
        timeOfDay,
        dayOfWeek,
        orderComplexity: order.items?.length || 1,
        restaurantPrepTime: 15,
        driverExperience: 0.7,
        demandLevel: 'high'
      },
      confidence: 0.85,
      modelVersion: '1.0.0'
    });

    await prediction.save();
    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get delivery prediction
exports.getPrediction = async (req, res) => {
  try {
    const { orderId } = req.params;
    const prediction = await DeliveryPrediction.findOne({ orderId });

    if (!prediction) return res.status(404).json({ success: false, error: 'Prediction not found' });

    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, note } = req.body;

    const prediction = await DeliveryPrediction.findOneAndUpdate(
      { orderId },
      {
        $push: {
          statusUpdates: {
            status,
            timestamp: new Date(),
            location,
            driverNote: note
          }
        }
      },
      { new: true }
    );

    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get delivery analytics
exports.getDeliveryAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const predictions = await DeliveryPrediction.find({
      createdAt: { $gte: startDate }
    });

    const avgAccuracy = predictions.reduce((acc, p) => acc + (p.timeAccuracy || 0), 0) / predictions.length;
    const avgConfidence = predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length;
    const totalDeliveries = predictions.length;
    const avgDeliveryTime = predictions.reduce((acc, p) => {
      if (p.actualDeliveryTime && p.predictedDeliveryTime) {
        return acc + Math.abs(p.actualDeliveryTime - p.predictedDeliveryTime) / 60000;
      }
      return acc;
    }, 0) / predictions.length;

    res.json({
      success: true,
      data: {
        totalDeliveries,
        avgAccuracy: (avgAccuracy * 100).toFixed(2) + '%',
        avgConfidence: (avgConfidence * 100).toFixed(2) + '%',
        avgDeliveryTimeError: Math.round(avgDeliveryTime) + ' minutes'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.optimizeRoute = async (req, res) => {
  try {
    const { orderId } = req.params;
    const prediction = await DeliveryPrediction.findOne({ orderId });

    if (!prediction) return res.status(404).json({ success: false, error: 'Prediction not found' });

    // Simulate route optimization (replace with real routing algorithm)
    prediction.routeOptimization = {
      suggestedRoute: [],
      alternativeRoutes: [],
      efficiency: 0.92
    };

    await prediction.save();
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
