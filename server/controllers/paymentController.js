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
    const { productId, variantId, quantity, addressId } = req.body; // ✅ ADD variantId
    
    console.log("🔄 createRazorpayOrder called:", {
      userId,
      productId,
      variantId, // ✅ Log variantId
      quantity,
      addressId
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

    // ✅ VALIDATION: For Buy Now, variantId is REQUIRED
    if (productId && !variantId) {
      return res.status(400).json({
        success: false,
        message: "Variant ID is required for Buy Now"
      });
    }

    // ✅ Address pehle get karo
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
        variantId, // ✅ PASS VARIANT ID
        quantity 
      },
      addressDoc
    );

    console.log("✅ Order calculation complete:", {
      itemsCount: orderData.items?.length || 0,
      subtotal: orderData.summary?.subtotal,
      shipping: orderData.summary?.shipping,
      total: orderData.summary?.total
    });

    // ✅ Debug first item details
    if (orderData.items && orderData.items.length > 0) {
      console.log("📦 First item details:", {
        variantId: orderData.items[0].variantId,
        color: orderData.items[0].color,
        size: orderData.items[0].size,
        price: orderData.items[0].price
      });
    }

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

    /* ================= CREATE RAZORPAY ORDER ================= */
    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${userId.slice(-5)}`,
      notes: {
        userId: userId.toString(),
        productId: productId || null,
        variantId: variantId || null, // ✅ Store variantId in notes
        addressId: addressId,
        checkoutType: orderData.checkoutType || "BUY_NOW"
      },
    });

    /* ================= SUCCESS RESPONSE ================= */
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

  try {
    const userId = req.user?.id || req.user?._id || req.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      variantId, // ✅ ADD THIS
      quantity,
      addressId,
    } = req.body;

    console.log("🔍 verifyRazorpayPayment called:", {
      userId,
      razorpay_order_id,
      productId,
      variantId,
      quantity,
      addressId
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment details");
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
        orderId: existingOrder._id 
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
        variantId, // ✅ PASS VARIANT ID
        quantity 
      },
      addressDoc
    );

    console.log("✅ Recalculated order data:", {
      items: orderData.items?.map(item => ({
        variantId: item.variantId,
        productId: item.productId,
        color: item.color,
        size: item.size,
        quantity: item.quantity
      })),
      total: orderData.summary?.total
    });

    // ✅ Amount verify
    const expectedAmount = Math.round(orderData.summary.total * 100);

    if (rpOrder.amount !== expectedAmount) {
      console.error("❌ Amount Mismatch:", {
        razorpayAmount: rpOrder.amount,
        calculatedAmount: expectedAmount,
        orderTotal: orderData.summary.total,
        shipping: orderData.summary.shipping,
        subtotal: orderData.summary.subtotal
      });
      throw new Error(`Payment amount mismatch. Expected: ₹${orderData.summary.total}, Got: ₹${rpOrder.amount/100}`);
    }

    // ✅ Shipping address
    const shippingAddress = {
      name: addressDoc.name,
      phone: addressDoc.phone,
      email: addressDoc.email || `${userId}@example.com`,
      address: addressDoc.address_line1,
      city: addressDoc.city,
      state: addressDoc.state,
      pincode: addressDoc.pincode,
      country: addressDoc.country || "India"
    };

    // ✅ Prepare order items with snapshot
    const orderItems = orderData.items.map(item => {
      return {
        productId: item.productId,
        variantId: item.variantId, // ✅ Store variantId
        quantity: item.quantity,
        priceAtOrder: item.sellingPrice,
        
        snapshot: {
          name: item.name,
          brand: item.brand,
          color: item.color,
          size: item.size,
          sku: item.sku,
          image: item.image,
          price: item.price,
          sellingPrice: item.sellingPrice
        }
      };
    });

    // ✅ Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD${year}${month}${day}${random}`;

    // ✅ Create order
    const [order] = await Order.create(
      [
        {
          orderNumber,
          userId,
          products: orderItems, // ✅ Use products field (not items)
          subtotal: orderData.summary.subtotal,
          shipping: orderData.summary.shipping,
          discount: orderData.summary.discount,
          amount: orderData.summary.total,
          shippingAddress,
          payment: {
            mode: "prepaid",
            status: "paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
          },
          shiprocket: {
            status: "NEW"
          },
          status: "confirmed",
          confirmedAt: new Date()
        }
      ],
      { session }
    );

    console.log("✅ Order created in DB:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      productsCount: order.products.length
    });

    // ✅ Reduce stock for each variant
    for (const item of order.products) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const variant = product.variants.id(item.variantId);
      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found in product ${product.name}`);
      }

      // Check stock
      const availableStock = variant.stock - (variant.reservedStock || 0);
      if (availableStock < item.quantity) {
        throw new Error(`${product.name} (${variant.color}-${variant.size}) out of stock`);
      }

      // Reserve stock
      variant.reservedStock = (variant.reservedStock || 0) + item.quantity;
      await product.save({ session });
      
      console.log(`📦 Stock reserved for ${product.name}:`, {
        variantId: variant._id,
        color: variant.color,
        size: variant.size,
        quantity: item.quantity,
        reservedStock: variant.reservedStock
      });
    }

    // ✅ Clear cart if cart checkout
    if (orderData.checkoutType === "CART") {
      await Cart.deleteOne({ user: userId }).session(session);
      console.log("🛒 Cart cleared for user:", userId);
    }

    // ✅ Commit transaction FIRST
    await session.commitTransaction();
    session.endSession();

    console.log("✅ Database transaction committed");

    // ✅ NOW call Shiprocket (outside transaction)
    let shiprocketCreated = false;
    try {
      await createShiprocketOrder(order);
      shiprocketCreated = true;
      console.log("🚀 Shiprocket order created successfully");
    } catch (shiprocketError) {
      console.error("⚠️ Shiprocket order creation failed:", shiprocketError.message);
      // Continue even if Shiprocket fails
    }

    return res.json({
      success: true,
      message: "Payment verified & order confirmed",
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderSummary: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discount,
        totalAmount: order.amount
      },
      shiprocketCreated,
      nextStep: "/order-confirmation"
    });

  } catch (error) {
    // ✅ Rollback if still in transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.log("🔄 Transaction aborted due to error");
    }
    session.endSession();

    console.error("❌ Verify Razorpay Payment Error:", error);
    
    return res.status(400).json({ 
      success: false,
      message: error.message || "Payment verification failed" 
    });
  }
};