const mongoose = require('mongoose');

const deliveryPredictionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    predictedDeliveryTime: {
      type: Date,
      required: true
    },
    actualDeliveryTime: Date,
    timeAccuracy: Number,
    distance: Number,
    estimatedDistance: Number,
    traffic: {
      level: { type: String, enum: ['light', 'moderate', 'heavy'] },
      congestionIndex: Number
    },
    weatherData: {
      condition: String,
      temperature: Number,
      windSpeed: Number,
      riskFactor: Number
    },
    mlFactors: {
      timeOfDay: String,
      dayOfWeek: String,
      orderComplexity: Number,
      restaurantPrepTime: Number,
      driverExperience: Number,
      demandLevel: String
    },
    routeOptimization: {
      suggestedRoute: [Object],
      alternativeRoutes: [[Object]],
      efficiency: Number
    },
    statusUpdates: [
      {
        status: String,
        timestamp: Date,
        location: Object,
        driverNote: String
      }
    ],
    confidence: { type: Number, min: 0, max: 1 },
    modelVersion: String
  },
  { timestamps: true }
);

deliveryPredictionSchema.index({ orderId: 1 });
deliveryPredictionSchema.index({ driverId: 1 });
deliveryPredictionSchema.index({ 'pickupLocation': '2dsphere' });
deliveryPredictionSchema.index({ 'deliveryLocation': '2dsphere' });

module.exports = mongoose.model('DeliveryPrediction', deliveryPredictionSchema);
