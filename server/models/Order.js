const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        specialInstructions: String
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    deliveryAddress: {
      street: String,
      city: String,
      zipCode: String,
      notes: String
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
      default: 'pending'
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'cash', 'wallet'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    stripePaymentId: String,
    rating: Number,
    notes: String,
    trackingHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        location: String
      }
    ]
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ customer: 1, status: 1 }); // queries: orders by user filtered by status
orderSchema.index({ customer: 1, createdAt: -1 }); // queries: order history per user

module.exports = mongoose.model('Order', orderSchema);
