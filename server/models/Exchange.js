const mongoose = require("mongoose");
const {
  EXCHANGE_TYPES,
  EXCHANGE_STATUSES,
  PAYMENT_STATUSES,
} = require("../constants/exchangeConstants");

const exchangeItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    color: String,
    size: String,
    sku: String,
    image: String,
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false },
);

const exchangeSchema = new mongoose.Schema(
  {
    exchangeNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    itemIndex: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: EXCHANGE_STATUSES,
      default: "REQUESTED",
      index: true,
    },

    type: {
      type: String,
      enum: EXCHANGE_TYPES,
      required: true,
    },

    reason: { type: String, required: true, trim: true },

    originalItem: { type: exchangeItemSchema, required: true },
    newItem: { type: exchangeItemSchema, required: true },

    pricing: {
      priceDifference: { type: Number, default: 0 },
      extraAmountToPay: { type: Number, default: 0 },
      savingsAmount: { type: Number, default: 0 },
      paymentRequired: { type: Boolean, default: false },
    },

    payment: {
      status: {
        type: String,
        enum: PAYMENT_STATUSES,
        default: "NOT_REQUIRED",
      },
      amount: { type: Number, default: 0 },
      method: String,
      razorpayOrderId: String,
      paymentId: String,
      paidAt: Date,
    },

    statusHistory: [
      {
        status: String,
        note: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    adminNotes: String,
    rejectionReason: String,
    cancellationReason: String,

    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    completedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

exchangeSchema.index({ userId: 1, createdAt: -1 });
exchangeSchema.index({ status: 1, createdAt: -1 });
exchangeSchema.index(
  { orderId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["REQUESTED", "PAYMENT_PENDING", "APPROVED", "PICKUP_SCHEDULED", "IN_TRANSIT"],
      },
    },
  },
);

exchangeSchema.pre("save", async function generateExchangeNumber(next) {
  if (!this.isNew || this.exchangeNumber) return next();

  try {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const todaysCount = await mongoose.model("Exchange").countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequence = (todaysCount + 1).toString().padStart(4, "0");
    this.exchangeNumber = `EXC-${dateStr}-${sequence}`;
  } catch {
    this.exchangeNumber = `EXC-${Date.now().toString().slice(-9)}`;
  }

  next();
});

exchangeSchema.methods.isActive = function () {
  const { ACTIVE_EXCHANGE_STATUSES } = require("../constants/exchangeConstants");
  return ACTIVE_EXCHANGE_STATUSES.includes(this.status);
};

exchangeSchema.methods.canUserCancel = function () {
  return ["REQUESTED", "PAYMENT_PENDING"].includes(this.status);
};

exchangeSchema.statics.findActiveByOrderId = function (orderId) {
  const { ACTIVE_EXCHANGE_STATUSES } = require("../constants/exchangeConstants");
  return this.findOne({ orderId, status: { $in: ACTIVE_EXCHANGE_STATUSES } });
};

const Exchange = mongoose.model("Exchange", exchangeSchema);
module.exports = Exchange;
