import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FoodCart({ cart, setCart }) {
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    zipCode: ''
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = 2.99;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city) {
      alert('Please enter your delivery address');
      return;
    }

    setIsPlacing(true);
    try {
      const restaurantId = cart[0].restaurantId;
      const response = await axios.post(`${API_URL}/orders`, {
        restaurantId,
        items: cart.map((item) => ({
          name: item.name,
          quantity: 1,
          price: item.price
        })),
        deliveryAddress,
        paymentMethod: 'cash',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60000)
      });

      alert('Order placed successfully!');
      navigate(`/food/order-tracking/${response.data.order._id}`);
    } catch (error) {
      alert('Error placing order: ' + error.message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Food Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty</p>
        <button
          onClick={() => navigate('/food')}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Order Food
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Food Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white rounded-lg shadow p-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>

                <button
                  onClick={() => removeFromCart(idx)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <FaMapMarkerAlt /> <span>Delivery Address</span>
            </h2>

            <input
              type="text"
              placeholder="Street Address"
              value={deliveryAddress.street}
              onChange={(e) =>
                setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded mb-3"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={deliveryAddress.city}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={deliveryAddress.zipCode}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded"
              />
            </div>

            <textarea
              placeholder="Special instructions..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full mt-3 px-4 py-2 border border-gray-300 rounded"
              rows="3"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-3 mb-6 border-b pb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cart.length} items)</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">${((total + deliveryFee) * 0.1).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total</span>
            <span>${((total + deliveryFee) * 1.1).toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {isPlacing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCart;
