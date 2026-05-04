const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String
    },
    available: {
      type: Boolean,
      default: true
    },
    preparationTime: {
      type: Number,
      default: 15
    },
    allergens: [String],
    tags: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
