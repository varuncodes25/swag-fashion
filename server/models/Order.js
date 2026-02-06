const mongoose = require("mongoose");

/* =========================
   ORDER ITEM (SNAPSHOT)
========================= */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    name: { type: String, required: true },
    image: String,

    price: Number,           // MRP/Original Price
    discountPercent: Number,
    discountAmount: Number,
    finalPrice: Number,      // Price after discount

    quantity: Number,
    lineTotal: Number,       // finalPrice × quantity

    // Dimensions for shipping
    weight: { type: Number, required: true }, // kg
    length: { type: Number, required: true }, // cm
    width: { type: Number, required: true },
    height: { type: Number, required: true },

    color: String,
    size: String,
    sku: String,
  },
  { _id: false }
);

/* =========================
   ORDER SCHEMA
========================= */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { 
      type: String, 
      unique: true, 
      required: false 
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: { type: [orderItemSchema], required: true },

    /* 💰 AMOUNTS */
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    /* 📍 ADDRESS SNAPSHOT */
    shippingAddress: {
      name: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    /* 💳 PAYMENT */
    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "CARD", "UPI", "NETBANKING"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    paymentGateway: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    /* 🚚 SHIPPING */
    shippingMeta: {
      courierId: String,
      courierName: String,
      estimatedDelivery: String,
      serviceType: String,
    },

    shiprocket: {
      orderId: String,
      shipmentId: String,
      awb: String,
      channelId: String,
      status: { 
        type: String,
        enum: ["NEW", "PROCESSING", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "RTO", "CANCELLED", "PENDING"],
        default: "PENDING"
      },
      labelUrl: String,
      manifestUrl: String,
      trackingUrl: String,
    },

    /* 🧾 ORDER STATUS */
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"],
      default: "PENDING",
    },

    /* 📅 TIMESTAMPS */
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    /* 📝 NOTES & REASONS */
    customerNotes: String,
    cancelReason: String,
    returnReason: String,
    
    /* 🔄 TRACKING */
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

/* =========================
   INDEXES (Performance)
========================= */
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "shippingAddress.phone": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "shiprocket.orderId": 1 });
orderSchema.index({ "paymentGateway.orderId": 1 });

/* =========================
   HELPER METHODS
========================= */

// Check if order can be cancelled
orderSchema.methods.canCancel = function() {
  const nonCancellable = ['SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
  return !nonCancellable.includes(this.status);
};

// Check if order can be returned
orderSchema.methods.canReturn = function() {
  if (this.status !== 'DELIVERED') return false;
  
  const returnWindow = 7; // days
  const returnDeadline = new Date(this.deliveredAt);
  returnDeadline.setDate(returnDeadline.getDate() + returnWindow);
  
  return new Date() <= returnDeadline;
};
// Schema mein yeh hook add karo (line 170 ke baad):
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Format: SIS-YYYYMMDD-XXXXX
      const date = new Date();
      const dateStr =
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        date.getDate().toString().padStart(2, "0");

      // Get today's order count
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const todaysOrders = await mongoose.model("Order").countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const sequence = (todaysOrders + 1).toString().padStart(4, "0");
      this.orderNumber = `SIS-${dateStr}-${sequence}`;
    } catch (error) {
      // Fallback
      this.orderNumber = `SIS-${Date.now().toString().slice(-9)}`;
    }
  }
  next();
});
// Generate order summary for email
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    date: this.createdAt,
    status: this.status,
    total: this.totalAmount,
    shippingAddress: this.shippingAddress,
    items: this.items.map(item => ({
      name: item.name,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: item.finalPrice,
      total: item.lineTotal,
      image: item.image
    }))
  };
};

// Create Shiprocket payload
orderSchema.methods.getShiprocketPayload = function() {
  return {
    order_id: this.orderNumber,
    order_date: this.createdAt.toISOString().split('T')[0],
    channel_id: this.shiprocket.channelId || "YOUR_CHANNEL_ID",
    billing_customer_name: this.shippingAddress.name,
    billing_address: `${this.shippingAddress.addressLine1}, ${this.shippingAddress.city}`,
    billing_city: this.shippingAddress.city,
    billing_pincode: this.shippingAddress.pincode,
    billing_state: this.shippingAddress.state,
    billing_country: this.shippingAddress.country || "India",
    billing_email: this.shippingAddress.email,
    billing_phone: this.shippingAddress.phone,
    
    order_items: this.items.map(item => ({
      name: item.name,
      sku: item.sku || `SKU-${item.productId}`,
      units: item.quantity,
      selling_price: item.finalPrice,
      discount: item.discountAmount || 0,
      tax: this.taxAmount / this.items.length || 0,
      hsn: 6211
    })),
    
    payment_method: this.paymentMethod === "COD" ? "COD" : "Prepaid",
    shipping_charges: this.shippingCharge,
    total_discount: this.discount,
    sub_total: this.subtotal
  };
};

// Generate order number (static method)
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");

  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const todaysOrders = await this.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const sequence = (todaysOrders + 1).toString().padStart(4, "0");
  return `SIS-${dateStr}-${sequence}`;
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;