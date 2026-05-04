import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import RestaurantList from './RestaurantList';
import RestaurantMenu from './RestaurantMenu';
import FoodCart from './FoodCart';
import OrderTracking from './OrderTracking';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FoodModule() {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState(null);
  const [foodCart, setFoodCart] = useState(JSON.parse(localStorage.getItem('foodCart')) || []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      setRestaurantsError(null);
      try {
        const response = await axios.get(`${API_URL}/food/restaurants`);
        setRestaurants(response.data.restaurants || response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurantsError('No se pudieron cargar los restaurantes. Por favor intenta de nuevo.');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  const saveFoodCart = (newCart) => {
    setFoodCart(newCart);
    localStorage.setItem('foodCart', JSON.stringify(newCart));
  };

  const addToCart = (item) => {
    saveFoodCart([...foodCart, item]);
  };

  return (
    <Routes>
      <Route path="/" element={<RestaurantList restaurants={restaurants} loading={loadingRestaurants} error={restaurantsError} />} />
      <Route
        path="/restaurant/:restaurantId"
        element={<RestaurantMenu addToCart={addToCart} />}
      />
      <Route path="/cart" element={<FoodCart cart={foodCart} setCart={saveFoodCart} />} />
      <Route
        path="/order-tracking/:orderId"
        element={<OrderTracking />}
      />
    </Routes>
  );
}

export default FoodModule;
