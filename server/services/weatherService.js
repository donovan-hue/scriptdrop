const axios = require('axios');
const cache = require('./cacheService');
const { isEnvKeyMissing } = require('../utils/apiKeyUtils');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';

    if (isEnvKeyMissing(this.apiKey)) {
      console.warn('⚠️  OPENWEATHER_API_KEY no configurada - usando datos mock');
    }
  }

  async getCurrentWeather(latitude, longitude) {
    try {
      if (isEnvKeyMissing(this.apiKey)) return this.getDefaultWeather();

      const cacheKey = `weather_${latitude}_${longitude}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: { lat: latitude, lon: longitude, appid: this.apiKey, units: 'metric' },
        timeout: 5000
      });

      const weather = this.parseWeatherResponse(response.data);
      await cache.set(cacheKey, weather, 600); // 10 min TTL
      return weather;
    } catch (error) {
      console.error('Error fetching current weather:', error.message);
      return this.getDefaultWeather();
    }
  }

  async getWeatherForecast(latitude, longitude, hours = 2) {
    try {
      if (isEnvKeyMissing(this.apiKey)) return { forecasts: [] };

      const cacheKey = `forecast_${latitude}_${longitude}_${hours}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: latitude, lon: longitude, appid: this.apiKey, units: 'metric',
          cnt: Math.ceil(hours / 3) // API returns 3-hour intervals
        },
        timeout: 5000
      });

      const forecast = this.parseForecastResponse(response.data);
      await cache.set(cacheKey, forecast, 600);
      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error.message);
      return { forecasts: [] };
    }
  }

  /**
   * Get weather impact on delivery
   */
  async getWeatherImpact(latitude, longitude) {
    try {
      const weather = await this.getCurrentWeather(latitude, longitude);

      return {
        condition: weather.condition,
        severity: this.calculateSeverity(weather),
        deliveryImpact: this.calculateDeliveryImpact(weather),
        recommendations: this.generateWeatherRecommendations(weather),
        alerts: this.generateWeatherAlerts(weather)
      };
    } catch (error) {
      console.error('Error calculating weather impact:', error);
      return {
        condition: 'unknown',
        severity: 'unknown',
        deliveryImpact: 'none',
        recommendations: [],
        alerts: []
      };
    }
  }

  /**
   * Get weather for multiple locations (batch)
   */
  async getWeatherForLocations(locations) {
    try {
      const weatherData = await Promise.all(
        locations.map(loc =>
          this.getCurrentWeather(loc.latitude, loc.longitude)
        )
      );

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather for locations:', error);
      return locations.map(() => this.getDefaultWeather());
    }
  }

  // Helper methods
  parseWeatherResponse(data) {
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      cloudiness: data.clouds.all,
      condition: this.mapWeatherCondition(data.weather[0].main),
      description: data.weather[0].description,
      visibility: data.visibility,
      rain: data.rain?.['1h'] || 0,
      snow: data.snow?.['1h'] || 0,
      uvi: data.uvi || 0,
      timestamp: new Date(data.dt * 1000)
    };
  }

  parseForecastResponse(data) {
    return {
      forecasts: data.list.map(item => ({
        temperature: item.main.temp,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        condition: this.mapWeatherCondition(item.weather[0].main),
        rain: item.rain?.['3h'] || 0,
        snow: item.snow?.['3h'] || 0,
        timestamp: new Date(item.dt * 1000)
      }))
    };
  }

  mapWeatherCondition(condition) {
    const conditionMap = {
      'Clear': 'clear',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Smoke': 'foggy',
      'Haze': 'foggy',
      'Dust': 'dusty',
      'Fog': 'foggy',
      'Sand': 'dusty',
      'Ash': 'dusty',
      'Squall': 'windy',
      'Tornado': 'stormy'
    };

    return conditionMap[condition] || 'cloudy';
  }

  calculateSeverity(weather) {
    let severity = 0;

    // Temperature impact
    if (weather.temperature > 35 || weather.temperature < -5) severity += 2;
    else if (weather.temperature > 30 || weather.temperature < 0) severity += 1;

    // Wind impact
    if (weather.windSpeed > 15) severity += 2;
    else if (weather.windSpeed > 10) severity += 1;

    // Precipitation impact
    if (weather.rain > 5 || weather.snow > 2) severity += 3;
    else if (weather.rain > 0 || weather.snow > 0) severity += 2;

    // Visibility impact
    if (weather.visibility < 1000) severity += 2;
    else if (weather.visibility < 5000) severity += 1;

    if (severity <= 2) return 'low';
    if (severity <= 4) return 'medium';
    if (severity <= 6) return 'high';
    return 'severe';
  }

  calculateDeliveryImpact(weather) {
    const severity = this.calculateSeverity(weather);

    if (severity === 'low') return 'none';
    if (severity === 'medium') return 'minor';
    if (severity === 'high') return 'significant';
    return 'severe';
  }

  generateWeatherRecommendations(weather) {
    const recommendations = [];

    if (weather.condition === 'rainy') {
      recommendations.push('Use waterproof packaging for orders');
      recommendations.push('Allow extra time for delivery');
    }

    if (weather.condition === 'snowy') {
      recommendations.push('Consider suspending delivery temporarily');
      recommendations.push('Require experienced drivers only');
    }

    if (weather.condition === 'stormy') {
      recommendations.push('Suspend delivery until weather improves');
    }

    if (weather.windSpeed > 10) {
      recommendations.push('Secure all items in vehicle');
    }

    if (weather.temperature > 30) {
      recommendations.push('Use insulated bags for temperature-sensitive items');
    }

    if (weather.temperature < -5) {
      recommendations.push('Heat delivery vehicles');
    }

    if (weather.visibility < 1000) {
      recommendations.push('Advise drivers to use headlights');
    }

    return recommendations;
  }

  generateWeatherAlerts(weather) {
    const alerts = [];

    if (weather.condition === 'stormy') {
      alerts.push({
        type: 'severe_warning',
        message: 'Severe weather alert: Thunderstorm in area. Delivery suspension recommended.',
        severity: 'critical'
      });
    }

    if (weather.condition === 'snowy' && weather.temperature < -5) {
      alerts.push({
        type: 'warning',
        message: 'Heavy snow with extreme cold. Delivery risky.',
        severity: 'high'
      });
    }

    if (weather.windSpeed > 15) {
      alerts.push({
        type: 'warning',
        message: 'High winds detected. Use caution.',
        severity: 'medium'
      });
    }

    if (weather.rain > 5) {
      alerts.push({
        type: 'info',
        message: 'Heavy rainfall. Delivery time may increase.',
        severity: 'low'
      });
    }

    return alerts;
  }

  getDefaultWeather() {
    return {
      temperature: 20,
      feelsLike: 20,
      humidity: 60,
      pressure: 1013,
      windSpeed: 5,
      windDirection: 0,
      cloudiness: 50,
      condition: 'cloudy',
      description: 'Partly cloudy',
      visibility: 10000,
      rain: 0,
      snow: 0,
      uvi: 5,
      timestamp: new Date()
    };
  }

}

module.exports = new WeatherService();
