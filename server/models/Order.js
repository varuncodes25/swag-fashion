const mongoose = require("mongoose");

const orderProductSnapshotSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true },
  
  snapshot: {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    sku: { type: String, required: true },
    
    image: {
      url: { type: String, required: true },
      id: { type: String }
    },
    
    price: { type: Number, required: true },
    sellingPrice: { type: Number, required: true }
  }
}, { _id: true });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    amount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" }
    },
    
    products: [orderProductSnapshotSchema],
    
    payment: {
      mode: { type: String, enum: ["prepaid", "cod"], default: "prepaid" },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String }
    },
    
    shiprocket: {
      orderId: { type: String },
      shipmentId: { type: String },
      awb: { type: String },
      channelId: { type: String },
      status: { 
        type: String,
        enum: ["NEW", "PROCESSING", "PICKED UP", "IN TRANSIT", "DELIVERED", "RTO", "CANCELLED"],
        default: "NEW"
      },
      labelUrl: { type: String },
      manifestUrl: { type: String },
      trackingUrl: { type: String }
    },
    
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending"
    },
    
    confirmedAt: { type: Date },
    packedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    
    customerNotes: { type: String },
    
    returnRequested: { type: Boolean, default: false },
    returnReason: { type: String }
  },
  { timestamps: true }
);

// ==================== IMPORTANT HOOKS ONLY ====================

// ✅ HOOK 1: Auto-generate order number (MOST IMPORTANT)
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    
    this.orderNumber = `ORD${year}${month}${day}${random}`;
  }
  next();
});

// ✅ HOOK 2: Auto-calculate subtotal from products
orderSchema.pre('save', function(next) {
  if (this.isModified('products')) {
    this.subtotal = this.products.reduce((sum, product) => {
      return sum + (product.priceAtOrder * product.quantity);
    }, 0);
    
    // Auto-calculate total amount
    this.amount = this.subtotal + this.shipping - this.discount;
  }
  next();
});

// ✅ HOOK 3: Set timestamps on status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'confirmed':
        this.confirmedAt = now;
        break;
      case 'packed':
        this.packedAt = now;
        break;
      case 'shipped':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
    }
  }
  next();
});

// ✅ HOOK 4: Update product stock when order status changes (CRITICAL)
orderSchema.post('save', async function(doc, next) {
  try {
    const Product = mongoose.model('Product');
    
    // Only process if status changed
    if (doc.isModified('status')) {
      
      for (const item of doc.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        
        const variant = product.variants.id(item.variantId);
        if (!variant) continue;
        
        // 🔴 WHEN ORDER CONFIRMED: Reserve stock
        if (doc.status === 'confirmed' && !doc.confirmedAt) {
          variant.reservedStock = (variant.reservedStock || 0) + item.quantity;
          console.log(`📦 Reserved ${item.quantity} units for ${item.snapshot.name}`);
        }
        
        // 🔴 WHEN ORDER CANCELLED: Release stock
        else if (doc.status === 'cancelled' && doc.cancelledAt) {
          if (variant.reservedStock >= item.quantity) {
            variant.reservedStock -= item.quantity;
            variant.stock += item.quantity;
            console.log(`🔄 Released ${item.quantity} units for ${item.snapshot.name}`);
          }
        }
        
        // 🔴 WHEN ORDER DELIVERED: Deduct stock
        else if (doc.status === 'delivered' && doc.deliveredAt) {
          if (variant.reservedStock >= item.quantity) {
            variant.reservedStock -= item.quantity;
            variant.stock -= item.quantity;
            product.soldCount += item.quantity;
            console.log(`📤 Deducted ${item.quantity} units for ${item.snapshot.name}`);
          }
        }
        
        await product.save();
      }
    }
  } catch (error) {
    console.error('Stock update error:', error);
  }
  
  next();
});

// ✅ HOOK 5: Sync Shiprocket status with order status
orderSchema.pre('save', function(next) {
  if (this.isModified('shiprocket.status')) {
    // Map Shiprocket status to our order status
    const statusMap = {
      'NEW': 'confirmed',
      'PROCESSING': 'confirmed',
      'PICKED UP': 'shipped',
      'IN TRANSIT': 'shipped',
      'DELIVERED': 'delivered',
      'RTO': 'returned',
      'CANCELLED': 'cancelled'
    };
    
    if (statusMap[this.shiprocket.status]) {
      this.status = statusMap[this.shiprocket.status];
    }
  }
  next();
});

// ==================== INDEXES (IMPORTANT FOR PERFORMANCE) ====================
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'shiprocket.awb': 1 });
orderSchema.index({ 'shippingAddress.phone': 1 });
orderSchema.index({ createdAt: -1 });

// ==================== HELPER METHODS ====================

// Check if order can be cancelled
orderSchema.methods.canCancel = function() {
  const nonCancellable = ['shipped', 'delivered', 'cancelled', 'returned'];
  return !nonCancellable.includes(this.status);
};

// Check if order can be returned
orderSchema.methods.canReturn = function() {
  if (this.status !== 'delivered') return false;
  
  const returnWindow = 7; // days
  const returnDeadline = new Date(this.deliveredAt);
  returnDeadline.setDate(returnDeadline.getDate() + returnWindow);
  
  return new Date() <= returnDeadline;
};

// Generate order summary for email
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    date: this.createdAt,
    status: this.status,
    total: this.amount,
    shippingAddress: this.shippingAddress,
    items: this.products.map(item => ({
      name: item.snapshot.name,
      color: item.snapshot.color,
      size: item.snapshot.size,
      quantity: item.quantity,
      price: item.priceAtOrder,
      total: item.priceAtOrder * item.quantity,
      image: item.snapshot.image.url
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
    billing_address: this.shippingAddress.address,
    billing_city: this.shippingAddress.city,
    billing_pincode: this.shippingAddress.pincode,
    billing_state: this.shippingAddress.state,
    billing_country: this.shippingAddress.country || "India",
    billing_email: this.shippingAddress.email,
    billing_phone: this.shippingAddress.phone,
    
    order_items: this.products.map(item => ({
      name: item.snapshot.name,
      sku: item.snapshot.sku,
      units: item.quantity,
      selling_price: item.priceAtOrder,
      discount: "",
      tax: "",
      hsn: 6211
    })),
    
    payment_method: this.payment.mode === "cod" ? "COD" : "Prepaid",
    shipping_charges: this.shipping,
    total_discount: this.discount,
    sub_total: this.subtotal
  };
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;