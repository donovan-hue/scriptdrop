const axios = require('axios');

class TrafficService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'demo';
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes for traffic data
  }

  /**
   * Get current traffic for route
   */
  async getTrafficForRoute(origin, destination) {
    try {
      const cacheKey = `traffic_${this.getLocationKey(origin)}_${this.getLocationKey(destination)}`;
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        return cached;
      }

      // Using Google Maps Distance Matrix API
      // Alternative: TomTom Traffic API
      const traffic = this.estimateTraffic(origin, destination);
      this.setCache(cacheKey, traffic);

      return traffic;
    } catch (error) {
      console.error('Error getting traffic data:', error);
      return this.getDefaultTraffic();
    }
  }

  /**
   * Get real-time traffic conditions
   */
  async getRealTimeTraffic(latitude, longitude, radius = 1) {
    try {
      // Estimate based on time of day and historical patterns
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();

      let traffic = 'low';
      let congestionLevel = 0;

      // Rush hour patterns
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        traffic = 'high';
        congestionLevel = 0.7;
      } else if ((hour >= 12 && hour <= 13) || (hour >= 19 && hour <= 21)) {
        traffic = 'medium';
        congestionLevel = 0.4;
      } else if (hour >= 23 || hour <= 5) {
        traffic = 'low';
        congestionLevel = 0.1;
      }

      // Weekend adjustment
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        congestionLevel *= 0.7;
        if (congestionLevel < 0.3) traffic = 'low';
      }

      return {
        level: traffic,
        congestionLevel,
        timestamp: now,
        location: { latitude, longitude },
        radius,
        speed: this.estimateAverageSpeed(traffic),
        incidents: await this.getTrafficIncidents(latitude, longitude, radius)
      };
    } catch (error) {
      console.error('Error getting real-time traffic:', error);
      return this.getDefaultTraffic();
    }
  }

  /**
   * Get traffic incidents and hazards
   */
  async getTrafficIncidents(latitude, longitude, radius = 1) {
    try {
      // In production, would integrate with real traffic incident APIs
      // Simulating traffic incidents based on location and time
      const incidents = [];

      // Random incident generation (for demo)
      if (Math.random() > 0.8) {
        incidents.push({
          type: 'accident',
          severity: 'high',
          description: 'Vehicle accident on main route',
          location: { latitude: latitude + Math.random() * 0.01, longitude: longitude + Math.random() * 0.01 },
          delayMinutes: 15,
          timestamp: new Date()
        });
      }

      if (Math.random() > 0.85) {
        incidents.push({
          type: 'construction',
          severity: 'medium',
          description: 'Road construction in progress',
          delayMinutes: 10,
          timestamp: new Date()
        });
      }

      if (Math.random() > 0.9) {
        incidents.push({
          type: 'weather',
          severity: 'low',
          description: 'Heavy rain reducing visibility',
          delayMinutes: 5,
          timestamp: new Date()
        });
      }

      return incidents;
    } catch (error) {
      console.error('Error fetching traffic incidents:', error);
      return [];
    }
  }

  /**
   * Predict traffic for future time
   */
  async predictTrafficForTime(origin, destination, departureTime) {
    try {
      const hour = new Date(departureTime).getHours();
      const dayOfWeek = new Date(departureTime).getDay();

      let traffic = 'medium';

      // Predict based on historical patterns
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        traffic = 'high';
      } else if ((hour >= 12 && hour <= 13) || (hour >= 19 && hour <= 21)) {
        traffic = 'medium';
      } else if (hour >= 23 || hour <= 5) {
        traffic = 'low';
      }

      // Weekend impact
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (traffic === 'high') traffic = 'medium';
        else if (traffic === 'medium') traffic = 'low';
      }

      const distance = this.calculateDistance(origin, destination);
      const baseTime = this.calculateTravelTime(distance);
      const adjustedTime = this.adjustTimeForTraffic(baseTime, traffic);

      return {
        traffic,
        distance,
        estimatedDuration: adjustedTime,
        confidence: 0.85,
        departureTime,
        arrivalTime: new Date(new Date(departureTime).getTime() + adjustedTime * 60000)
      };
    } catch (error) {
      console.error('Error predicting traffic:', error);
      return {
        traffic: 'unknown',
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Get optimal departure time to avoid traffic
   */
  async getOptimalDepartureTime(origin, destination, targetArrivalTime) {
    try {
      const times = [];

      // Test different departure times
      for (let offset = -60; offset <= 60; offset += 15) {
        const departureTime = new Date(targetArrivalTime.getTime() - offset * 60000);
        const prediction = await this.predictTrafficForTime(origin, destination, departureTime);

        times.push({
          departureTime,
          ...prediction
        });
      }

      // Sort by estimated duration
      times.sort((a, b) => a.estimatedDuration - b.estimatedDuration);

      return {
        optimal: times[0],
        alternatives: times.slice(1, 4),
        recommendation: this.generateTrafficRecommendation(times[0])
      };
    } catch (error) {
      console.error('Error finding optimal departure time:', error);
      return { error: error.message };
    }
  }

  /**
   * Get route alternatives based on traffic
   */
  async getAlternativeRoutes(origin, destination, count = 3) {
    try {
      // In production, would fetch from Google Maps Routes API
      // Simulating alternative routes
      const distance = this.calculateDistance(origin, destination);
      const baseTime = this.calculateTravelTime(distance);

      const routes = [
        {
          name: 'Fastest Route',
          distance: distance,
          estimatedTime: baseTime,
          traffic: 'medium',
          polyline: 'fastest_route_polyline',
          toll: false
        },
        {
          name: 'Scenic Route',
          distance: distance * 1.2,
          estimatedTime: baseTime * 1.1,
          traffic: 'low',
          polyline: 'scenic_route_polyline',
          toll: false
        },
        {
          name: 'Toll Route',
          distance: distance * 0.95,
          estimatedTime: baseTime * 0.85,
          traffic: 'medium',
          polyline: 'toll_route_polyline',
          toll: true
        }
      ];

      return routes.slice(0, count);
    } catch (error) {
      console.error('Error getting alternative routes:', error);
      return [];
    }
  }

  // Helper methods
  estimateTraffic(origin, destination) {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let traffic = 'low';

    // Rush hour patterns
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      traffic = 'high';
    } else if ((hour >= 12 && hour <= 13) || (hour >= 19 && hour <= 21)) {
      traffic = 'medium';
    }

    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (traffic === 'high') traffic = 'medium';
    }

    return {
      level: traffic,
      direction: 'from_origin_to_destination',
      timestamp: now,
      congestionLevel: this.getCongestionLevel(traffic)
    };
  }

  getCongestionLevel(trafficLevel) {
    const levels = {
      'low': 0.1,
      'medium': 0.5,
      'high': 0.8,
      'severe': 1.0
    };
    return levels[trafficLevel] || 0.5;
  }

  estimateAverageSpeed(trafficLevel) {
    const speeds = {
      'low': 40, // km/h
      'medium': 25,
      'high': 15,
      'severe': 5
    };
    return speeds[trafficLevel] || 25;
  }

  calculateDistance(origin, destination) {
    // Haversine formula for distance
    const R = 6371; // Earth radius in km
    const lat1 = origin.latitude;
    const lon1 = origin.longitude;
    const lat2 = destination.latitude;
    const lon2 = destination.longitude;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  calculateTravelTime(distance) {
    // Average 30 km/h in urban area
    return Math.round((distance / 30) * 60); // in minutes
  }

  adjustTimeForTraffic(baseTime, trafficLevel) {
    const multipliers = {
      'low': 1.0,
      'medium': 1.3,
      'high': 1.6,
      'severe': 2.0
    };

    return Math.round(baseTime * (multipliers[trafficLevel] || 1.0));
  }

  generateTrafficRecommendation(timing) {
    if (timing.traffic === 'low') {
      return 'Perfect time to depart! Light traffic expected.';
    } else if (timing.traffic === 'medium') {
      return 'Moderate traffic expected. Depart soon to ensure timely arrival.';
    }
    return 'Heavy traffic expected. Consider leaving earlier or using alternative route.';
  }

  getDefaultTraffic() {
    return {
      level: 'medium',
      congestionLevel: 0.5,
      timestamp: new Date(),
      speed: 25,
      incidents: []
    };
  }

  getLocationKey(location) {
    return `${location.latitude}_${location.longitude}`;
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.cacheExpiry
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new TrafficService();
