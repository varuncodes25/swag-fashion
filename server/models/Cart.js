// models/Cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  
  variantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true  
  },
  
  quantity: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1,
    max: 99 // Max limit
  }
}, { 
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true,
    index: true
  },
  
  items: [cartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("Cart", cartSchema);