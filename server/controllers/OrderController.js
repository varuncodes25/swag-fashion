const { ROLES } = require("../utils/constants");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
// controllers/orderController.js
const getShiprocketToken = require("../utils/shiprocket");
const { createShipment } = require("./shiprocketController"); // Import your Shiprocket logic

const axios = require("axios");
const Cart = require("../models/Cart");
const getOrdersByUserId = async (req, res) => {
  const userId = req.id;

  try {

    const orders = await Order.find({ userId }).populate({
      path: "products.id",
      select: "name price category variants", // ye sahi hai
    });
    if (!orders)
      return res
        .status(500)
        .json({ success: false, message: "No orders to show" });

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }

  const { page, limit } = req.query;

  try {
    const orders = await Order.find()
      .populate({
        path: "products.id",
        select: "name price category variants",
      })
      .populate({
        path: "userId",
        select: "name email",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "No orders to show" });

    const count = await Order.countDocuments();

    return res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }

  const { paymentId } = req.params;
  const { status } = req.body;

  try {
    // Try to find by razorpayPaymentId (prepaid)
    let order = await Order.findOne({ razorpayPaymentId: paymentId });

    // If not found, try by _id (for COD)
    if (!order) {
      order = await Order.findById(paymentId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      data: order,
      message: "Order status updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getMetrics = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }

  const { startDate, endDate } = req.query;

  try {
    const start = new Date(
      startDate || new Date().setMonth(new Date().getMonth() - 1)
    );
    const end = new Date(endDate || new Date());

    // Orders in selected date range
    const ordersInRange = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    const totalSales = ordersInRange.reduce(
      (acc, order) => acc + (order.amount || 0),
      0
    );

    // This month & last month orders
    const thisMonthOrders = ordersInRange;
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));

    const lastMonthOrders = await Order.find({
      createdAt: { $gte: lastMonth, $lte: start },
    });

    const totalThisMonth = thisMonthOrders.reduce(
      (acc, order) => acc + (order.amount || 0),
      0
    );
    const totalLastMonth = lastMonthOrders.reduce(
      (acc, order) => acc + (order.amount || 0),
      0
    );

    const salesGrowth = totalLastMonth
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : 0;

    // Users this month vs last month
    const thisMonthUsers = await User.find({
      createdAt: { $gte: start, $lte: end },
    });
    const lastMonthUsers = await User.find({
      createdAt: { $gte: lastMonth, $lte: start },
    });

    const usersGrowth = lastMonthUsers.length
      ? ((thisMonthUsers.length - lastMonthUsers.length) /
        lastMonthUsers.length) *
      100
      : 0;

    // Active now (last hour) vs previous day
    const lastHour = new Date(new Date().setHours(new Date().getHours() - 1));
    const lastHourOrders = await Order.find({
      createdAt: { $gte: lastHour, $lte: new Date() },
    });

    const previousDayOrders = await Order.find({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    });

    const lastHourGrowth = previousDayOrders.length
      ? (lastHourOrders.length / previousDayOrders.length) * 100
      : 0;

    // Recent sales
    const recentOrders = await Order.find()
      .populate({ path: "userId", select: "name email" })
      .select("amount")
      .sort({ createdAt: -1 })
      .limit(9);

    // Products delivered in last 6 months grouped by category/month
    const sixMonthsAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 6)
    );

    const sixMonthsOrders = await Order.find({
      createdAt: { $gte: sixMonthsAgo },
    }).populate({
      path: "products.id",
      select: "category",
    });

    const monthWise = sixMonthsOrders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });

      order.products.forEach((product) => {
        // Skip missing or unlinked products
        if (!product.id || !product.id.category) return;

        if (!acc[month]) acc[month] = {};
        if (!acc[month][product.id.category]) {
          acc[month][product.id.category] = 1;
        } else {
          acc[month][product.id.category]++;
        }
      });

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalSales: { count: totalSales, growth: salesGrowth },
        users: { count: thisMonthUsers.length, growth: usersGrowth },
        sales: { count: totalThisMonth, growth: salesGrowth },
        activeNow: { count: lastHourOrders.length, growth: lastHourGrowth },
        recentSales: { count: totalThisMonth, users: recentOrders },
        sixMonthsBarChartData: monthWise,
      },
    });
  } catch (error) {
    console.error("Error in getMetrics:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createOrder = async (orderData) => {
  // 1. Prepare products with snapshot
  const productsWithSnapshot = await Promise.all(
    orderData.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const variant = product.variants.id(item.variantId);
      const images = product.getImagesByColor(variant.color);
      
      return {
        productId: product._id,
        variantId: variant._id,
        quantity: item.quantity,
        priceAtOrder: item.price,
        snapshot: {
          name: product.name,
          brand: product.brand,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          image: images[0] || product.image,
          price: variant.price,
          sellingPrice: item.price
        }
      };
    })
  );
  
  // 2. Create order
  const order = new Order({
    userId: orderData.userId,
    shippingAddress: orderData.address,
    products: productsWithSnapshot,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    discount: orderData.discount,
    payment: {
      mode: orderData.paymentMode,
      razorpayOrderId: orderData.razorpayOrderId
    }
  });
  
  // 3. Save order (hooks will auto-generate order number, calculate amount)
  await order.save();
  
  // 4. Create Shiprocket order
  const shiprocketData = order.getShiprocketPayload();
  const shiprocketResponse = await createShiprocketOrder(shiprocketData);
  
  // 5. Update with Shiprocket details
  order.shiprocket = {
    orderId: shiprocketResponse.order_id,
    shipmentId: shiprocketResponse.shipment_id,
    awb: shiprocketResponse.awb_code,
    status: "NEW",
    labelUrl: shiprocketResponse.label_url,
    trackingUrl: shiprocketResponse.tracking_url
  };
  
  await order.save();
  
  return order;
};

// Cancel COD orders within 24 hours
const cancelOrder = async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.paymentMode !== "COD")
    return res.status(400).json({ message: "Only COD can cancel" });
  if (!["pending", "packed"].includes(order.status))
    return res.status(400).json({ message: "Cannot cancel now" });

  const hoursDiff = (new Date() - order.createdAt) / 36e5;
  if (hoursDiff > 24)
    return res.status(400).json({ message: "Cancel allowed within 24h only" });

  order.isCancelled = true;
  order.cancelReason = reason;
  order.cancelledAt = new Date();
  order.status = "cancelled";
  await order.save();

  res.json({ success: true, message: "Order cancelled", order });
};

// Exchange Paid Delivered Orders
const exchangeOrder = async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!order.isPaid)
    return res
      .status(400)
      .json({ message: "Only paid orders can be exchanged" });
  if (order.status !== "delivered")
    return res
      .status(400)
      .json({ message: "Only delivered orders can be exchanged" });

  order.isExchanged = true;
  order.exchangeReason = reason;
  order.exchangedAt = new Date();
  order.status = "exchanged";
  await order.save();

  res.json({ success: true, message: "Order exchanged", order });
};

const trackShipment = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !order.shiprocketId)
    return res
      .status(404)
      .json({ success: false, message: "Order not found or not shipped" });

  const token = await getShiprocketToken();

  const resShip = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shiprocketId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.json({
    success: true,
    tracking: resShip.data.data[0].tracking_data,
  });
};

module.exports = {
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  getMetrics,
  createOrder,
  cancelOrder,
  exchangeOrder,
  trackShipment,
};
