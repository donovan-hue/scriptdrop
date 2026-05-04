const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('../services/emailService');

// Crear orden
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, estimatedDeliveryTime } = req.body;

    // Calcular total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      customer: req.user.id,
      restaurant: restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      estimatedDeliveryTime
    });

    await order.save();
    await order.populate('customer', 'username email phone');
    await order.populate('restaurant', 'username email');

    if (order.customer?.email) {
      emailService.sendOrderConfirmation(order.customer.email, order._id, totalAmount)
        .catch(err => console.error('Order confirmation email failed:', err));
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener órdenes del cliente
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'username avatar')
      .populate('deliveryPerson', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener órdenes para restaurante
exports.getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.user.id })
      .populate('customer', 'username avatar email')
      .populate('deliveryPerson', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar estado de orden
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.restaurant.toString() !== req.user.id && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;

    // Agregar al historial de rastreo
    order.trackingHistory.push({
      status,
      location
    });

    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    const populated = await Order.findById(order._id).populate('customer', 'email');
    if (populated?.customer?.email) {
      emailService.sendDeliveryUpdate(populated.customer.email, order._id, status)
        .catch(err => console.error('Delivery update email failed:', err));
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Procesar pago con Stripe
exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethodId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        orderId: orderId
      }
    });

    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'completed';
      order.stripePaymentId = paymentIntent.id;
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment successful',
        order
      });
    }

    res.status(400).json({
      success: false,
      message: 'Payment failed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rastrear orden
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('deliveryPerson', 'username avatar location');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        deliveryPerson: order.deliveryPerson,
        trackingHistory: order.trackingHistory
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calificar orden
exports.rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { rating, notes },
      { new: true }
    );

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
