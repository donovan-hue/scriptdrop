const axios = require('axios');
const DeliveryPrediction = require('../models/DeliveryPrediction');

class MLService {
  constructor() {
    // Simple linear regression model parameters
    // These would be loaded from trained model in production
    this.modelWeights = {
      distance: 0.5,
      traffic: 1.2,
      weather: 0.8,
      timeOfDay: 0.6,
      dayOfWeek: 0.3,
      demandLevel: 0.4,
      driverExperience: -0.15,
      restaurantBusiness: 0.3
    };

    this.baseTime = 5; // Base preparation + pickup time in minutes
  }

  /**
   * Predict delivery time based on factors
   */
  async predictDeliveryTime(factors) {
    try {
      let predictedTime = this.baseTime;

      // Distance: ~1 minute per km + traffic
      const distanceTime = (factors.distance || 0) * 1.2;
      predictedTime += distanceTime * this.modelWeights.distance;

      // Traffic factor
      const trafficMultiplier = this.getTrafficMultiplier(factors.traffic);
      predictedTime *= trafficMultiplier * this.modelWeights.traffic;

      // Weather factor
      const weatherMultiplier = this.getWeatherMultiplier(factors.weather);
      predictedTime *= weatherMultiplier * this.modelWeights.weather;

      // Time of day factor
      const timeMultiplier = this.getTimeOfDayMultiplier(factors.timeOfDay);
      predictedTime *= timeMultiplier * this.modelWeights.timeOfDay;

      // Demand level (higher demand = longer wait)
      const demandMultiplier = this.getDemandMultiplier(factors.demandLevel);
      predictedTime *= demandMultiplier * this.modelWeights.demandLevel;

      // Restaurant business hours impact
      const businessMultiplier = this.getBusinessMultiplier(factors.restaurantBusiness);
      predictedTime *= businessMultiplier * this.modelWeights.restaurantBusiness;

      // Driver experience reduces time
      const experienceReduction = (factors.driverExperience || 3) / 10;
      predictedTime -= experienceReduction * this.modelWeights.driverExperience;

      // Round to nearest minute
      predictedTime = Math.max(5, Math.round(predictedTime));

      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence(factors);

      return {
        minutes: predictedTime,
        confidence,
        breakdown: {
          baseTime: this.baseTime,
          distanceImpact: Math.round(distanceTime * this.modelWeights.distance),
          trafficImpact: Math.round((trafficMultiplier - 1) * 100),
          weatherImpact: Math.round((weatherMultiplier - 1) * 100),
          demandImpact: Math.round((demandMultiplier - 1) * 100)
        }
      };
    } catch (error) {
      console.error('Error predicting delivery time:', error);
      // Fallback to base estimate
      return {
        minutes: 30,
        confidence: 50,
        error: error.message
      };
    }
  }

  /**
   * Optimize delivery route for multiple stops (simplified TSP)
   */
  async optimizeRoute(pickupLocation, deliveryLocations, currentLocation = null) {
    try {
      const locations = [
        pickupLocation,
        ...deliveryLocations,
      ];

      // Simple nearest neighbor algorithm for demo
      // In production, use more sophisticated algorithms (2-opt, genetic, etc.)
      const optimizedRoute = this.nearestNeighborTSP(
        currentLocation || pickupLocation,
        locations
      );

      return {
        route: optimizedRoute,
        totalDistance: this.calculateTotalDistance(optimizedRoute),
        estimatedTime: this.estimateRouteTime(optimizedRoute),
        efficiency: this.calculateEfficiency(optimizedRoute, deliveryLocations.length)
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      return {
        route: [pickupLocation, ...deliveryLocations],
        error: error.message
      };
    }
  }

  /**
   * Forecast demand for next 24 hours
   */
  async forecastDemand(restaurantId, options = {}) {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalData(restaurantId, 7); // Last 7 days

      // Extract patterns
      const hourlyPatterns = this.analyzeHourlyPatterns(historicalData);
      const weeklyPatterns = this.analyzeWeeklyPatterns(historicalData);

      // Generate forecast
      const nextHours = [];
      const now = new Date();
      const currentHour = now.getHours();

      for (let i = 0; i < 24; i++) {
        const forecastHour = (currentHour + i) % 24;
        const baseOrders = hourlyPatterns[forecastHour] || 5;
        const weeklyFactor = weeklyPatterns[now.getDay()] || 1;
        const weatherFactor = await this.getWeatherDemandImpact(restaurantId) || 1;

        const predictedOrders = Math.round(baseOrders * weeklyFactor * weatherFactor);
        const confidence = 85 - (i * 2); // Less confident further in future

        nextHours.push({
          hour: forecastHour,
          predictedOrders: Math.max(0, predictedOrders),
          confidence: Math.max(60, confidence)
        });
      }

      // Identify peak hours
      const peakHours = this.identifyPeakHours(nextHours);

      return {
        nextHours,
        peakHours,
        estimatedPeakIntensity: this.calculatePeakIntensity(nextHours),
        totalPredictedOrders: nextHours.reduce((sum, h) => sum + h.predictedOrders, 0),
        recommendations: this.generateRecommendations(nextHours)
      };
    } catch (error) {
      console.error('Error forecasting demand:', error);
      return {
        error: error.message,
        nextHours: []
      };
    }
  }

  /**
   * Predict available drivers
   */
  async predictAvailableDrivers(restaurantId, deliveryLocation) {
    try {
      // This would integrate with driver data
      // For now, return estimated availability based on time and demand
      const demand = await this.forecastDemand(restaurantId);
      const currentHour = new Date().getHours();
      const currentHourData = demand.nextHours[0];

      const totalDrivers = Math.ceil(currentHourData.predictedOrders / 2);
      const nearbyDrivers = Math.ceil(totalDrivers * 0.6); // Assume 60% nearby

      return {
        total: Math.max(1, totalDrivers),
        nearby: Math.max(1, nearbyDrivers),
        estimated: Math.ceil(totalDrivers * 0.4), // Will be available soon
        surge: totalDrivers < 2
      };
    } catch (error) {
      console.error('Error predicting driver availability:', error);
      return { total: 1, nearby: 1, estimated: 0, surge: false };
    }
  }

  /**
   * Calculate dynamic pricing
   */
  calculateDynamicPricing(baseFare, factors) {
    let surgeFactor = 1.0;
    let reason = 'normal pricing';

    // High demand surge
    if (factors.demandLevel === 'high') {
      surgeFactor += 0.25;
      reason = 'high demand';
    } else if (factors.demandLevel === 'very_high') {
      surgeFactor += 0.5;
      reason = 'very high demand';
    }

    // Weather surge
    if (factors.weather && (factors.weather.condition === 'rainy' || factors.weather.condition === 'snowy')) {
      surgeFactor += 0.15;
      reason += ', adverse weather';
    }

    // Peak hour surge
    if (factors.isPeakHour) {
      surgeFactor += 0.1;
      reason += ', peak hours';
    }

    // Distance surcharge for longer distances
    if (factors.distance > 5) {
      const distanceSurge = (factors.distance - 5) * 0.05;
      surgeFactor += distanceSurge;
      reason += `, long distance (${factors.distance}km)`;
    }

    const totalFare = Math.round(baseFare * surgeFactor * 100) / 100;

    return {
      baseFare,
      surgeFactor,
      totalFare,
      savings: baseFare < totalFare ? 0 : Math.round((baseFare - totalFare) * 100) / 100,
      reason,
      fairnessScore: this.calculateFairnessScore(surgeFactor)
    };
  }

  // Helper methods
  getTrafficMultiplier(traffic) {
    const multipliers = {
      'low': 1.0,
      'medium': 1.3,
      'high': 1.6,
      'severe': 2.0
    };
    return multipliers[traffic] || 1.1;
  }

  getWeatherMultiplier(weather) {
    if (!weather) return 1.0;
    const multipliers = {
      'clear': 1.0,
      'cloudy': 1.05,
      'rainy': 1.3,
      'snowy': 1.5,
      'stormy': 2.0
    };
    return multipliers[weather.condition] || 1.0;
  }

  getTimeOfDayMultiplier(timeOfDay) {
    const multipliers = {
      'night': 0.8, // Less traffic
      'early_morning': 0.9,
      'morning': 1.2, // Rush hour
      'afternoon': 1.0,
      'evening': 1.3, // Peak dinner time
      'peak': 1.5
    };
    return multipliers[timeOfDay] || 1.0;
  }

  getDemandMultiplier(demand) {
    const multipliers = {
      'low': 0.9,
      'medium': 1.0,
      'high': 1.3,
      'very_high': 1.6
    };
    return multipliers[demand] || 1.0;
  }

  getBusinessMultiplier(business) {
    const multipliers = {
      'low': 0.9,
      'medium': 1.0,
      'high': 1.15,
      'peak': 1.3
    };
    return multipliers[business] || 1.0;
  }

  calculateConfidence(factors) {
    let confidence = 85; // Base confidence

    // Reduce if missing critical data
    if (!factors.traffic) confidence -= 10;
    if (!factors.weather) confidence -= 5;
    if (!factors.driverExperience) confidence -= 10;

    return Math.max(50, confidence);
  }

  nearestNeighborTSP(start, locations) {
    const route = [start];
    const remaining = locations.filter(loc =>
      loc.latitude !== start.latitude || loc.longitude !== start.longitude
    );

    while (remaining.length > 0) {
      const current = route[route.length - 1];
      let nearest = remaining[0];
      let nearestDist = this.distance(current, nearest);

      for (const loc of remaining) {
        const dist = this.distance(current, loc);
        if (dist < nearestDist) {
          nearest = loc;
          nearestDist = dist;
        }
      }

      route.push(nearest);
      remaining.splice(remaining.indexOf(nearest), 1);
    }

    return route;
  }

  distance(loc1, loc2) {
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

  calculateTotalDistance(route) {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += this.distance(route[i], route[i + 1]);
    }
    return Math.round(total * 10) / 10;
  }

  estimateRouteTime(route) {
    const distance = this.calculateTotalDistance(route);
    // Assume average speed of 30 km/h in urban area
    return Math.round((distance / 30) * 60); // in minutes
  }

  calculateEfficiency(route, numberOfStops) {
    const distance = this.calculateTotalDistance(route);
    const idealDistance = numberOfStops * 0.5; // Rough ideal
    return Math.min(100, Math.round((idealDistance / distance) * 100));
  }

  async getHistoricalData(restaurantId, days) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const predictions = await DeliveryPrediction.find({
        restaurantId,
        createdAt: { $gte: startDate },
        actualDeliveryTime: { $exists: true }
      }).lean();

      return predictions;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  analyzeHourlyPatterns(historicalData) {
    const hourlyOrders = {};

    historicalData.forEach(record => {
      const hour = new Date(record.createdAt).getHours();
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });

    // Fill missing hours with average
    const avgOrders = historicalData.length / 24 || 5;
    for (let i = 0; i < 24; i++) {
      hourlyOrders[i] = hourlyOrders[i] || Math.round(avgOrders);
    }

    return hourlyOrders;
  }

  analyzeWeeklyPatterns(historicalData) {
    const weeklyOrders = { 0: 1.1, 1: 0.9, 2: 0.9, 3: 0.9, 4: 0.95, 5: 1.2, 6: 1.3 };

    return weeklyOrders;
  }

  async getWeatherDemandImpact(restaurantId) {
    // Weather positive impact on delivery demand
    // Would integrate with weather service in production
    return 1.0;
  }

  identifyPeakHours(nextHours) {
    const threshold = Math.max(...nextHours.map(h => h.predictedOrders)) * 0.7;
    return nextHours
      .filter(h => h.predictedOrders >= threshold)
      .map(h => h.hour);
  }

  calculatePeakIntensity(nextHours) {
    const max = Math.max(...nextHours.map(h => h.predictedOrders));
    if (max > 20) return 'high';
    if (max > 10) return 'medium';
    return 'low';
  }

  generateRecommendations(nextHours) {
    const peakHours = this.identifyPeakHours(nextHours);
    const recommendations = [];

    if (peakHours.length > 0) {
      recommendations.push({
        type: 'staffing',
        message: `Expect peak demand at hours: ${peakHours.join(', ')}. Consider scheduling more drivers.`
      });
    }

    const avgOrders = Math.round(nextHours.reduce((sum, h) => sum + h.predictedOrders, 0) / 24);
    if (avgOrders > 15) {
      recommendations.push({
        type: 'inventory',
        message: 'High predicted demand. Ensure adequate inventory levels.'
      });
    }

    return recommendations;
  }

  calculateFairnessScore(surgeFactor) {
    // Score from 0 (unfair) to 100 (fair)
    if (surgeFactor <= 1.1) return 95;
    if (surgeFactor <= 1.25) return 85;
    if (surgeFactor <= 1.5) return 70;
    return 50;
  }
}

module.exports = new MLService();
