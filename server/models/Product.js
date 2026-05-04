const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0
    },
    originalPrice: Number,
    category: {
      type: String,
      enum: ['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'outerwear'],
      required: true
    },
    images: [String],
    sizes: [
      {
        size: String,
        stock: Number
      }
    ],
    colors: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    inStock: {
      type: Boolean,
      default: true
    },
    totalSales: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
