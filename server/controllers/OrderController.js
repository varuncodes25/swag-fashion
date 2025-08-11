const { ROLES } = require("../utils/constants");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const getOrdersByUserId = async (req, res) => {
  const userId = req.id;

  try {
    const orders = await Order.find({ userId }).populate({
      path: "products.id",
      select: "name price category images",
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
        select: "name price category images",
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
    const start = new Date(startDate || new Date().setMonth(new Date().getMonth() - 1));
    const end = new Date(endDate || new Date());

    // Orders in selected date range
    const ordersInRange = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    const totalSales = ordersInRange.reduce((acc, order) => acc + (order.amount || 0), 0);

    // This month & last month orders
    const thisMonthOrders = ordersInRange;
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));

    const lastMonthOrders = await Order.find({
      createdAt: { $gte: lastMonth, $lte: start },
    });

    const totalThisMonth = thisMonthOrders.reduce((acc, order) => acc + (order.amount || 0), 0);
    const totalLastMonth = lastMonthOrders.reduce((acc, order) => acc + (order.amount || 0), 0);

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
      ? ((thisMonthUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100
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
    const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6));

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



const createCODOrder = async (req, res) => {
  const userId = req.id;
  console.log("Creating COD Order for User ID:", req.body.products);
  try {
    const { amount, address, products } = req.body;

    if (!amount || !address || !products || products.length === 0) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ Update product stock and user's purchasedProducts
    for (const product of products) {
      await Product.findByIdAndUpdate(
        { _id: product.id },
        { $inc: { stock: -product.quantity } }
      );

      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { purchasedProducts: product.id } }
      );
    }

    // ✅ Create COD Order
    const order = await Order.create({
      amount,
      address,
      paymentMode: "COD",
      isPaid: false,
      products,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      data: order,
    });

  } catch (error) {
    console.error("COD Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  getMetrics,
  createCODOrder

};
