import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered'];

function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/${orderId}/track`);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Connect to Socket.io for real-time updates
    const socket = io(SOCKET_URL);
    socket.emit('track_order', orderId);

    socket.on('order_status_change', (data) => {
      if (data.orderId === orderId) {
        setOrder((prev) => ({
          ...prev,
          status: data.status,
          estimatedDeliveryTime: data.estimatedTime
        }));
      }
    });

    return () => socket.close();
  }, [orderId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!order) return <div className="text-center py-10">Order not found</div>;

  const currentStatusIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>

      <div className="bg-white rounded-lg shadow p-8">
        {/* Timeline */}
        <div className="mb-8">
          <div className="flex justify-between relative">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    idx <= currentStatusIndex
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {idx <= currentStatusIndex ? '✓' : idx + 1}
                </div>
                <p className="text-sm text-gray-600 mt-2 capitalize text-center whitespace-nowrap">
                  {step === 'on_the_way' ? 'On the Way' : step.replace('_', ' ')}
                </p>
              </div>
            ))}

            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 -z-10">
              <div
                className="h-full bg-green-600"
                style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-6 border-t pt-8">
          <div>
            <p className="text-gray-600 text-sm mb-1">Order ID</p>
            <p className="font-semibold text-lg">{order._id}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-1">Status</p>
            <p className="font-semibold text-lg uppercase text-green-600">{order.status}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-1">Estimated Delivery</p>
            <p className="font-semibold text-lg">
              {order.estimatedDeliveryTime
                ? new Date(order.estimatedDeliveryTime).toLocaleTimeString()
                : 'Calculating...'}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-1">Total Amount</p>
            <p className="font-semibold text-lg">${order.totalAmount}</p>
          </div>
        </div>

        {/* Delivery Person */}
        {order.deliveryPerson && (
          <div className="mt-8 pt-8 border-t bg-blue-50 p-4 rounded">
            <p className="text-gray-600 text-sm mb-3">Delivery Person</p>
            <div className="flex items-center space-x-4">
              <img
                src={order.deliveryPerson.avatar}
                alt={order.deliveryPerson.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{order.deliveryPerson.username}</p>
                <p className="text-sm text-gray-600">Driver</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;
