import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';

// Mock menu data
const MENU_DATA = {
  '1': {
    name: 'Pizza Place',
    items: [
      { id: '1', name: 'Pepperoni Pizza', price: 12.99, description: 'Classic pepperoni pizza' },
      { id: '2', name: 'Margherita Pizza', price: 11.99, description: 'Fresh mozzarella and basil' },
      { id: '3', name: 'Coke 2L', price: 3.99, description: 'Soft drink' }
    ]
  },
  '2': {
    name: 'Sushi Master',
    items: [
      { id: '1', name: 'California Roll', price: 8.99, description: 'Crab and avocado' },
      { id: '2', name: 'Spicy Tuna Roll', price: 9.99, description: 'Spicy tuna mixture' },
      { id: '3', name: 'Sake', price: 5.99, description: 'Japanese rice wine' }
    ]
  }
};

function RestaurantMenu({ addToCart }) {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const restaurant = MENU_DATA[restaurantId];

  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/food')}
        className="text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Back to Restaurants
      </button>

      <h1 className="text-3xl font-bold mb-8">{restaurant.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurant.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
            <p className="text-2xl font-bold text-blue-600 mt-3">${item.price}</p>

            <button
              onClick={() => addToCart({ ...item, restaurantId })}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
            >
              <FaShoppingCart /> <span>Add to Cart</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantMenu;
