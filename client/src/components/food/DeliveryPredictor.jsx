import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import useDeliveryAI from '../../hooks/useDeliveryAI';
import './DeliveryPredictor.css';

const DeliveryPredictor = ({ orderId, pickupLocation, deliveryLocation, distance, restaurantId }) => {
  const { prediction, loading, error, predictDeliveryTime, getLiveStatus } = useDeliveryAI();
  const [liveStatus, setLiveStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (orderId && !prediction) {
      handlePredictDelivery();
    }
  }, [orderId]);

  useEffect(() => {
    if (prediction && prediction.predictedArrival) {
      updateTimeRemaining();

      const interval = setInterval(() => {
        updateTimeRemaining();
      }, 30000); // Update every 30 seconds

      setRefreshInterval(interval);

      return () => clearInterval(interval);
    }
  }, [prediction]);

  const handlePredictDelivery = async () => {
    try {
      await predictDeliveryTime({
        orderId,
        restaurantId,
        customerId: 'current_user', // Would come from auth context
        pickupLocation,
        deliveryLocation,
        distance
      });

      // Get live status
      const status = await getLiveStatus(orderId);
      setLiveStatus(status);
    } catch (err) {
      console.error('Error predicting delivery:', err);
    }
  };

  const updateTimeRemaining = () => {
    if (prediction && prediction.predictedArrival) {
      const now = new Date();
      const arrivalTime = new Date(prediction.predictedArrival);
      const remaining = Math.max(0, arrivalTime - now);
      setTimeRemaining(Math.ceil(remaining / 60000)); // Convert to minutes
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return '#4ade80'; // Green
    if (confidence >= 70) return '#fbbf24'; // Amber
    return '#ef4444'; // Red
  };

  const getAccuracyBadge = (confidence) => {
    if (confidence >= 85) return 'Very High Confidence';
    if (confidence >= 70) return 'High Confidence';
    return 'Moderate Confidence';
  };

  if (loading && !prediction) {
    return (
      <div className="delivery-predictor loading">
        <div className="spinner" />
        <p>Calculating estimated delivery time...</p>
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="delivery-predictor error">
        <AlertCircle size={24} />
        <p>{error}</p>
        <button onClick={handlePredictDelivery} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="delivery-predictor">
        <button onClick={handlePredictDelivery} className="predict-btn">
          Get Delivery Estimate
        </button>
      </div>
    );
  }

  return (
    <div className="delivery-predictor">
      <div className="prediction-header">
        <h2>Delivery Estimate</h2>
        <div className="confidence-badge" style={{ backgroundColor: getConfidenceColor(prediction.confidence) }}>
          {getAccuracyBadge(prediction.confidence)}
        </div>
      </div>

      <div className="prediction-content">
        {/* Main Time Display */}
        <div className="time-display">
          <Clock size={32} className="icon" />
          <div className="time-info">
            <div className="estimated-time">
              {formatTime(prediction.predictedDeliveryTime?.minutes || 0)}
            </div>
            {timeRemaining !== null && (
              <div className="remaining-time">
                {formatTime(timeRemaining)} remaining
              </div>
            )}
          </div>
        </div>

        {/* Arrival Time */}
        <div className="arrival-info">
          <div className="info-row">
            <span className="label">Estimated Arrival:</span>
            <span className="value">
              {new Date(prediction.predictedArrival).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {liveStatus && liveStatus.updatedETA && (
            <div className="info-row eta-update">
              <span className="label">Updated ETA:</span>
              <span className="value">
                {new Date(liveStatus.updatedETA).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {liveStatus.etaChange > 0 && <span className="delay"> (+{liveStatus.etaChange}m)</span>}
                {liveStatus.etaChange < 0 && <span className="early"> ({liveStatus.etaChange}m)</span>}
              </span>
            </div>
          )}
        </div>

        {/* Location Information */}
        <div className="location-info">
          <div className="location-item">
            <MapPin size={20} className="pickup-icon" />
            <div className="location-details">
              <span className="label">Pickup</span>
              <span className="address">{pickupLocation?.address || 'Restaurant'}</span>
            </div>
          </div>
          <div className="distance-indicator">
            <span className="distance">{distance?.toFixed(1) || '?'} km</span>
          </div>
          <div className="location-item">
            <MapPin size={20} className="delivery-icon" />
            <div className="location-details">
              <span className="label">Delivery</span>
              <span className="address">{deliveryLocation?.address || 'Your Location'}</span>
            </div>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="factors-breakdown">
          <h3>Factors Affecting Your Delivery</h3>

          <div className="factor">
            <span className="factor-name">Traffic</span>
            <div className="factor-bar">
              <div
                className={`factor-fill traffic-${prediction.factors?.traffic || 'medium'}`}
                style={{
                  width: this.getFactorWidth(prediction.factors?.traffic)
                }}
              />
            </div>
            <span className="factor-value">{prediction.factors?.traffic || 'Medium'}</span>
          </div>

          <div className="factor">
            <span className="factor-name">Weather</span>
            <div className="factor-bar">
              <div
                className={`factor-fill weather-${prediction.factors?.weather?.condition || 'clear'}`}
                style={{
                  width: this.getWeatherImpact(prediction.factors?.weather)
                }}
              />
            </div>
            <span className="factor-value">{prediction.factors?.weather?.condition || 'Clear'}</span>
          </div>

          <div className="factor">
            <span className="factor-name">Demand</span>
            <div className="factor-bar">
              <div
                className={`factor-fill demand-${prediction.factors?.demandLevel || 'medium'}`}
                style={{
                  width: this.getFactorWidth(prediction.factors?.demandLevel)
                }}
              />
            </div>
            <span className="factor-value">{prediction.factors?.demandLevel || 'Medium'}</span>
          </div>

          <div className="factor">
            <span className="factor-name">Confidence</span>
            <div className="factor-bar">
              <div
                className="factor-fill confidence"
                style={{
                  width: `${prediction.confidence}%`
                }}
              />
            </div>
            <span className="factor-value">{prediction.confidence}%</span>
          </div>
        </div>

        {/* Pricing Information */}
        {prediction.suggestedPricing && (
          <div className="pricing-info">
            <h3>Delivery Pricing</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Base Fare</span>
                <span className="price">${prediction.suggestedPricing.baseFare}</span>
              </div>
              {prediction.suggestedPricing.surgeFactor > 1 && (
                <div className="price-row surge">
                  <span>Surge Multiplier</span>
                  <span className="price">{prediction.suggestedPricing.surgeFactor.toFixed(2)}x</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total Fare</span>
                <span className="price">${prediction.suggestedPricing.totalFare}</span>
              </div>
              <div className="price-reason">{prediction.suggestedPricing.reason}</div>
            </div>
          </div>
        )}

        {/* Driver Information */}
        {prediction.availableDrivers && (
          <div className="driver-info">
            <h3>Driver Status</h3>
            <div className="driver-stats">
              <div className="stat">
                <span className="stat-value">{prediction.availableDrivers.nearby}</span>
                <span className="stat-label">Drivers Nearby</span>
              </div>
              <div className="stat">
                <span className="stat-value">{prediction.availableDrivers.total}</span>
                <span className="stat-label">Total Available</span>
              </div>
              {prediction.availableDrivers.surge && (
                <div className="stat warning">
                  <AlertCircle size={16} />
                  <span className="stat-label">High Demand</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Status */}
        {liveStatus && (
          <div className="live-status">
            <div className="status-header">
              <CheckCircle size={20} className="status-icon" />
              <span>Live Tracking</span>
            </div>
            <div className="live-details">
              <p>Status: <strong>{liveStatus.currentStatus}</strong></p>
              {liveStatus.currentTraffic && (
                <p>Traffic: <strong>{liveStatus.currentTraffic.level}</strong></p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="actions">
          <button onClick={handlePredictDelivery} className="refresh-btn">
            Refresh Estimate
          </button>
          <a href={`https://maps.google.com/maps?daddr=${deliveryLocation?.latitude},${deliveryLocation?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-btn">
            View on Map
          </a>
        </div>
      </div>
    </div>
  );
};

// Helper function for factor width
DeliveryPredictor.getFactorWidth = function(factor) {
  const widths = {
    low: '30%',
    medium: '60%',
    high: '85%',
    severe: '100%'
  };
  return widths[factor] || '50%';
};

DeliveryPredictor.getWeatherImpact = function(weather) {
  if (!weather) return '30%';
  const impacts = {
    clear: '20%',
    cloudy: '35%',
    rainy: '70%',
    snowy: '90%',
    stormy: '100%'
  };
  return impacts[weather.condition] || '50%';
};

export default DeliveryPredictor;
