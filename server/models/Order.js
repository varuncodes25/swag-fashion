const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    products: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        size: {
          type: String,
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "packed", "in transit", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
