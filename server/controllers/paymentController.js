// controllers/paymentController.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Address = require("../models/address");
const { calculateOrder } = require("../helper/createOrder");
const mongoose = require("mongoose");
const { createShiprocketOrder } = require("../service/shiprocketService");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.id;
    const { productId, variantId, quantity, addressId, shippingMeta } = req.body; // ✅ ADD shippingMeta
    console.log("📦 createRazorpayOrder request body:", {
      userId,
      productId,
      variantId,
      quantity,
      addressId,
      shippingMeta  // ✅ Log shippingMeta
    });

    /* ================= BASIC VALIDATION ================= */
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    if (!addressId) {
      return res.status(400).json({ 
        success: false,
        message: "Address is required" 
      });
    }

    // ✅ VALIDATE shippingMeta
    if (!shippingMeta || !shippingMeta.courierId) {
      return res.status(400).json({ 
        success: false,
        message: "Shipping information is required. Please select a courier service." 
      });
    }

    if (productId && !variantId) {
      return res.status(400).json({
        success: false,
        message: "Variant ID is required for Buy Now"
      });
    }

    // Get address
    const addressDoc = await Address.findOne({
      _id: addressId,
      userId: userId
    });
    
    if (!addressDoc) {
      return res.status(400).json({ 
        success: false,
        message: "Address not found or doesn't belong to you" 
      });
    }

    /* ================= SERVER-SIDE PRICE CALC WITH ADDRESS ================= */
    const orderData = await calculateOrder(
      userId, 
      { 
        productId, 
        variantId,
        quantity 
      },
      addressDoc
    );

    console.log("✅ Order calculation complete:", {
      itemsCount: orderData.items?.length || 0,
      subtotal: orderData.summary?.subtotal,
      shipping: orderData.summary?.shipping,
      total: orderData.summary?.total,
      checkoutType: orderData.checkoutType
    });

    if (!orderData || !orderData.summary || typeof orderData.summary.total !== "number") {
      return res.status(400).json({
        success: false,
        message: "Invalid order calculation",
      });
    }

    if (orderData.summary.total <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order amount must be greater than zero",
      });
    }

    /* ================= RAZORPAY AMOUNT ================= */
    const amountInPaise = Math.round(orderData.summary.total * 100);

    /* ================= CREATE RAZORPAY ORDER WITH SHIPPING META IN NOTES ================= */
    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${userId.slice(-5)}`,
      notes: {
        // Existing fields
        userId: userId.toString(),
        productId: productId || null,
        variantId: variantId || null,
        addressId: addressId,
        checkoutType: orderData.checkoutType || "BUY_NOW",
        quantity: quantity?.toString() || "1",
        
        // 🔥 CRITICAL: Store shippingMeta in notes
        courierId: shippingMeta.courierId.toString(),
        courierName: shippingMeta.courierName || "",
        estimatedDelivery: shippingMeta.estimatedDelivery || "",
        serviceType: shippingMeta.serviceType || "STANDARD",
        shippingCharge: orderData.summary.shipping.toString()
      },
    });

    console.log("✅ Razorpay order created with shipping in notes:", {
      razorpayOrderId: rpOrder.id,
      courierId: shippingMeta.courierId,
      courierName: shippingMeta.courierName
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderSummary: orderData.summary,
      checkoutType: orderData.checkoutType
    });

  } catch (error) {
    console.error("❌ Create Razorpay Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate payment",
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log("🔍 verifyRazorpayPayment called with body:", req.body);
  
  try {
    const userId = req.user?.id || req.user?._id || req.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      variantId,
      quantity,
      addressId,
    } = req.body;

    // ✅ Basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment details");
    }

    if (!addressId) {
      throw new Error("Address ID is required");
    }

    // ✅ Signature verify
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // ✅ Get Razorpay order to check notes
    const rpOrder = await razorpay.orders.fetch(razorpay_order_id);
    const notes = rpOrder.notes || {};
    
    console.log("📝 Razorpay order notes:", notes);
    
    // ✅ Extract shippingMeta from notes
    const shippingMeta = {
      courierId: notes.courierId ? parseInt(notes.courierId) : null,
      courierName: notes.courierName || "",
      estimatedDelivery: notes.estimatedDelivery || "",
      serviceType: notes.serviceType || "STANDARD",
      shippingCharge: parseFloat(notes.shippingCharge) || 0
    };
    
    // ✅ Validate courierId
    if (!shippingMeta.courierId) {
      throw new Error("Shipping information missing in payment order");
    }
    
    console.log("📦 Retrieved shippingMeta:", shippingMeta);

    // ✅ Idempotency check
    const existingOrder = await Order.findOne(
      { "paymentGateway.paymentId": razorpay_payment_id },
      null,
      { session }
    );

    if (existingOrder) {
      await session.commitTransaction();
      session.endSession();
      return res.json({ 
        success: true, 
        orderId: existingOrder._id,
        orderNumber: existingOrder.orderNumber,
        message: "Order already verified" 
      });
    }

    // ✅ Get address
    const addressDoc = await Address.findOne({
      _id: addressId,
      userId: userId
    }).session(session);
    
    if (!addressDoc) {
      throw new Error("Address not found or doesn't belong to you");
    }

    // ✅ Recalculate order
    const orderData = await calculateOrder(
      userId, 
      { 
        productId, 
        variantId,
        quantity 
      },
      addressDoc
    );

    // ✅ Amount verify
    const expectedAmount = Math.round(orderData.summary.total * 100);

    if (rpOrder.amount !== expectedAmount) {
      console.error("❌ Amount Mismatch:", {
        razorpayAmount: rpOrder.amount,
        calculatedAmount: expectedAmount,
        orderTotal: orderData.summary.total
      });
      throw new Error(`Payment amount mismatch. Expected: ₹${orderData.summary.total}, Got: ₹${rpOrder.amount/100}`);
    }

    // ✅ Prepare shipping address
    const shippingAddress = {
      name: addressDoc.name,
      phone: addressDoc.phone,
      email: addressDoc.email || req.user?.email,
      addressLine1: addressDoc.address_line1,
      addressLine2: addressDoc.address_line2 || "",
      city: addressDoc.city,
      state: addressDoc.state,
      pincode: addressDoc.pincode,
      country: addressDoc.country || "India"
    };

    // ✅ Prepare order items with dimensions
    const orderItems = orderData.items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      image: item.image || "",
      price: item.price,
      discountPercent: item.discountPercent || 0,
      discountAmount: (item.price - item.sellingPrice) * item.quantity,
      finalPrice: item.sellingPrice,
      quantity: item.quantity,
      lineTotal: item.sellingPrice * item.quantity,
      weight: item.weight || 0.5,
      length: item.length || 20,
      width: item.width || 15,
      height: item.height || 10,
      color: item.color || "",
      size: item.size || "",
      sku: item.sku || ""
    }));

    // ✅ Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // ✅ Create order WITH shippingMeta from notes
    const [order] = await Order.create(
      [
        {
          orderNumber,
          userId,
          items: orderItems,
          
          subtotal: orderData.summary.subtotal,
          shippingCharge: orderData.summary.shipping,
          taxAmount: orderData.summary.tax || 0,
          discount: orderData.summary.discount,
          totalAmount: orderData.summary.total,
          
          shippingAddress,
          
          paymentMethod: "RAZORPAY",
          paymentStatus: "PAID",
          paymentGateway: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature
          },
          
          // ✅ FIXED: Use shippingMeta from notes
          shippingMeta: {
            courierId: shippingMeta.courierId,
            courierName: shippingMeta.courierName,
            estimatedDelivery: shippingMeta.estimatedDelivery,
            serviceType: shippingMeta.serviceType
          },
          
          shiprocket: {
            status: "PENDING"
          },
          
          status: "CONFIRMED",
          confirmedAt: new Date(),
          
          statusHistory: [
            {
              status: "CONFIRMED",
              changedAt: new Date(),
              reason: "Payment verified successfully"
            }
          ],
          
          isCancelled: false
        }
      ],
      { session }
    );

    console.log("✅ Order created with courier:", {
      orderId: order._id,
      courierId: order.shippingMeta.courierId,
      courierName: order.shippingMeta.courierName
    });

    // ✅ Reserve stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const variant = product.getVariant(item.color, item.size);
      if (!variant) {
        throw new Error(`Variant not found`);
      }

      const reserved = product.reserveVariantStock(variant._id, item.quantity);
      if (!reserved) {
        throw new Error(`Failed to reserve stock for ${product.name}`);
      }

      await product.save({ session });
    }

    // ✅ Clear cart if cart checkout
    if (orderData.checkoutType === "CART") {
      await Cart.deleteOne({ user: userId }).session(session);
      console.log("🛒 Cart cleared for user:", userId);
    }

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log("✅ Database transaction committed");

    // ✅ Call Shiprocket (ab courierId milega!)
    let shiprocketCreated = false;
    try {
      const shiprocketResponse = await createShiprocketOrder(order);
      shiprocketCreated = true;
      
      await Order.findByIdAndUpdate(order._id, {
        "shiprocket.orderId": shiprocketResponse.order_id,
        "shiprocket.shipmentId": shiprocketResponse.shipment_id,
        "shiprocket.awb": shiprocketResponse.awb,
        "shiprocket.status": "CONFIRMED"
      });
      
      console.log("🚀 Shiprocket order created successfully");
    } catch (shiprocketError) {
      console.error("⚠️ Shiprocket order creation failed:", {
        error: shiprocketError.message,
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    }

    return res.json({
      success: true,
      message: "Payment verified & order confirmed",
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderSummary: {
        subtotal: order.subtotal,
        shipping: order.shippingCharge,
        discount: order.discount,
        totalAmount: order.totalAmount
      },
      shiprocketCreated,
      nextStep: "/order-confirmation"
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.log("🔄 Transaction aborted due to error");
    }
    session.endSession();

    console.error("❌ Verify Razorpay Payment Error:", {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(400).json({ 
      success: false,
      message: error.message || "Payment verification failed" 
    });
  }
};