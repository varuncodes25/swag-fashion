const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },

    // Address object (Shiprocket requires structured fields)
    address: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    paymentMode: { type: String, enum: ["Razorpay", "COD"], default: "Razorpay" },
    isPaid: { type: Boolean, default: false },

    // Shiprocket fields
    shiprocketId: { type: String, default: null },
    courierTrackingId: { type: String, default: null },

    products: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        price: { type: Number, required: true }, // price per product
        quantity: { type: Number, required: true },
        color: { type: String, required: true },
        size: { type: String },
      },
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "packed",
        "in_transit",
        "delivered",
        "cancelled",
        "exchanged",
        "returned",
        "failed",
      ],
      default: "pending",
    },

    // Cancel/Exchange/Return
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },

    isExchanged: { type: Boolean, default: false },
    exchangedAt: { type: Date, default: null },
    exchangeReason: { type: String, default: null },

    isReturned: { type: Boolean, default: false },
    returnedAt: { type: Date, default: null },
    returnReason: { type: String, default: null },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
