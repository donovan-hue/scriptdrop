import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMotorcycle, FaClock } from 'react-icons/fa';

function RestaurantList({ restaurants }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Food</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant._id}
            to={`/food/restaurant/${restaurant._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
          >
            <img
              src={restaurant.avatar}
              alt={restaurant.username}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900">{restaurant.username}</h3>

              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{restaurant.rating}</span>
                </div>

                <div className="flex items-center space-x-1 text-gray-600">
                  <FaClock size={14} />
                  <span className="text-sm">{restaurant.deliveryTime}</span>
                </div>

                <div className="flex items-center space-x-1 text-gray-600">
                  <FaMotorcycle size={14} />
                  <span className="text-sm">${restaurant.deliveryFee}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RestaurantList;
