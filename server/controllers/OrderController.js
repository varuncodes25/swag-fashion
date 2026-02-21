const { ROLES } = require("../utils/constants");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
// controllers/orderController.js
const getShiprocketToken = require("../utils/shiprocket");
const { createShipment } = require("./shiprocketController"); // Import your Shiprocket logic
const address = require("../models/address");
const {
  calculateOrder,
  calculateOrderBase,
  calculateOrderValidation,
} = require("../helper/createOrder");
const {
  createShiprocketOrder,
  assignCourier,
  calculateShippingCharge,
} = require("../service/shiprocketService");
const axios = require("axios");
const Cart = require("../models/Cart");
const { default: mongoose } = require("mongoose");

const getOrdersByUserId = async (req, res) => {
  const userId = req.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Fetch orders with pagination - NO POPULATE NEEDED (items are embedded)
    const orders = await Order.find({ userId })
      .select("_id orderNumber createdAt status totalAmount paymentMethod paymentStatus shippingAddress items subtotal shippingCharge discount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Order.countDocuments({ userId });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      });
    }

    // Format data correctly
    const formattedOrders = orders.map(order => {
      // Get all items from the order
      const orderItems = order.items || [];
      
      // Calculate correct item count (sum of quantities)
      const itemCount = orderItems.reduce((total, item) => {
        return total + (item.quantity || 1);
      }, 0);
      
      // Get distinct product count
      const productCount = orderItems.length;
      
      // Get first item for thumbnail
      const firstItem = orderItems.length > 0 ? {
        name: orderItems[0].name || "Product",
        image: orderItems[0].image || "/placeholder.png",
        quantity: orderItems[0].quantity || 1,
        price: orderItems[0].finalPrice || orderItems[0].price || 0
      } : null;
      
      // Get all product images for UI
      const productImages = orderItems.map(item => ({
        image: item.image || "/placeholder.png",
        name: item.name || "Product",
        quantity: item.quantity || 1,
        color: item.color,
        size: item.size
      }));
      
      // Calculate total from order data
      const totalAmount = order.totalAmount || 0;
      
      return {
        id: order._id,
        orderNumber: order.orderNumber || `ORDER-${order._id.toString().slice(-8).toUpperCase()}`,
        date: order.createdAt,
        status: order.status || "PENDING",
        
        // Correct item counts
        summary: {
          itemCount: itemCount,  // Total quantity of all items
          productCount: productCount,  // Number of different products
          totalQuantity: itemCount
        },
        
        // Pricing information
        amount: totalAmount,
        pricing: {
          totalAmount: totalAmount,
          subtotal: order.subtotal || 0,
          shippingCharge: order.shippingCharge || 0,
          couponDiscount: order.discount || 0,
          taxAmount: order.taxAmount || 0
        },
        
        // Payment information
        payment: {
          method: order.paymentMethod || "COD",
          status: order.paymentStatus || "PENDING",
          isPaid: order.paymentStatus === "PAID"
        },
        
        // Items information for UI
        items: orderItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name || "Product",
          image: item.image || "/placeholder.png",
          quantity: item.quantity || 1,
          price: item.price || 0, // MRP
          finalPrice: item.finalPrice || 0, // Price after discount
          discountPercent: item.discountPercent || 0,
          discountAmount: item.discountAmount || 0,
          lineTotal: item.lineTotal || 0,
          color: item.color || "N/A",
          size: item.size || "N/A",
          sku: item.sku || "N/A"
        })),
        
        // Product images for thumbnail display
        productImages: productImages.slice(0, 4), // Max 4 for thumbnail
        
        // First item for quick preview
        firstItem: firstItem,
        
        // Delivery information
        delivery: {
          city: order.shippingAddress?.city || "N/A",
          state: order.shippingAddress?.state || "N/A",
          pincode: order.shippingAddress?.pincode || "N/A",
          name: order.shippingAddress?.name || "N/A",
          phone: order.shippingAddress?.phone || "N/A"
        }
      };
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      data: formattedOrders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error("Get orders list error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getOrderDetails = async (req, res) => {
  const userId = req.id;
  const { orderId } = req.params;

  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    // Fetch order with all details
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: userId 
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const orderItems = Array.isArray(order.items) ? order.items : [];
    
    // Calculate timeline
    const timeline = [];
    if (order.createdAt) {
      timeline.push({
        status: "ORDER_PLACED",
        date: order.createdAt,
        description: "Order placed successfully"
      });
    }
    if (order.confirmedAt) {
      timeline.push({
        status: "CONFIRMED",
        date: order.confirmedAt,
        description: "Order confirmed"
      });
    }
    if (order.shippedAt) {
      timeline.push({
        status: "SHIPPED",
        date: order.shippedAt,
        description: order.shiprocket?.awb 
          ? `Shipped via ${order.shippingMeta?.courierName || 'courier'} (AWB: ${order.shiprocket.awb})`
          : "Shipped"
      });
    }
    if (order.deliveredAt) {
      timeline.push({
        status: "DELIVERED",
        date: order.deliveredAt,
        description: "Delivered successfully"
      });
    }
    if (order.cancelledAt) {
      timeline.push({
        status: "CANCELLED",
        date: order.cancelledAt,
        description: `Cancelled${order.cancelReason ? `: ${order.cancelReason}` : ''}`
      });
    }

    // Format order details
    const formattedOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      
      // 📅 DATES
      dates: {
        ordered: order.createdAt,
        confirmed: order.confirmedAt,
        shipped: order.shippedAt,
        delivered: order.deliveredAt,
        cancelled: order.cancelledAt
      },
      
      // 📊 STATUS
      status: order.status || "PENDING",
      timeline: timeline.sort((a, b) => new Date(a.date) - new Date(b.date)),
      
      // 💰 PRICING BREAKDOWN
      pricing: {
        subtotal: order.subtotal || 0,
        shippingCharge: order.shippingCharge || 0,
        couponDiscount: order.discount || 0,
        taxAmount: order.taxAmount || 0,
        totalAmount: order.totalAmount || 0,
        mrpTotal: orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)
      },
      
      // 💳 PAYMENT DETAILS
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
        isPaid: order.paymentStatus === "PAID",
        gateway: order.paymentGateway || null,
        razorpayOrderId: order.paymentGateway?.orderId,
        razorpayPaymentId: order.paymentGateway?.paymentId
      },
      
      // 🚚 SHIPPING DETAILS
      shipping: {
        address: order.shippingAddress || {},
        meta: {
          courierId: order.shippingMeta?.courierId,
          courierName: order.shippingMeta?.courierName,
          estimatedDelivery: order.shippingMeta?.estimatedDelivery,
          serviceType: order.shippingMeta?.serviceType
        },
        shiprocket: {
          orderId: order.shiprocket?.orderId,
          shipmentId: order.shiprocket?.shipmentId,
          awb: order.shiprocket?.awb,
          status: order.shiprocket?.status || "PENDING",
          labelUrl: order.shiprocket?.labelUrl,
          manifestUrl: order.shiprocket?.manifestUrl,
          trackingUrl: order.shiprocket?.trackingUrl
        }
      },
      
      // 🛍️ ORDER ITEMS
      items: orderItems.map(item => {
        const mrp = item.price || 0;
        const sellingPrice = item.finalPrice || 0;
        const itemDiscountAmount = item.discountAmount || (mrp - sellingPrice);
        const itemDiscountPercent = item.discountPercent || 
          (mrp > 0 ? Math.round((itemDiscountAmount / mrp) * 100) : 0);
        
        return {
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          image: item.image,
          color: item.color,
          size: item.size,
          sku: item.sku,
          quantity: item.quantity,
          
          // PRICING DETAILS
          pricing: {
            mrp: mrp,
            sellingPrice: sellingPrice,
            itemDiscount: itemDiscountAmount,
            itemDiscountPercent: itemDiscountPercent,
            lineTotal: item.lineTotal || (sellingPrice * item.quantity)
          },
          
          // DIMENSIONS & WEIGHT
          weight: item.weight,
          dimensions: {
            length: item.length,
            width: item.width,
            height: item.height
          }
        };
      }),
      
      // 📊 SUMMARY
      summary: {
        itemCount: orderItems.length,
        totalQuantity: orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
        totalItemDiscount: orderItems.reduce((sum, item) => {
          const discount = item.discountAmount || (item.price - item.finalPrice) || 0;
          return sum + (discount * (item.quantity || 1));
        }, 0),
        totalWeight: orderItems.reduce((sum, item) => sum + ((item.weight || 0) * (item.quantity || 1)), 0)
      },
      
      // 📝 NOTES & REASONS
      notes: {
        customerNotes: order.customerNotes,
        cancelReason: order.cancelReason,
        returnReason: order.returnReason
      },
      
      // 🔄 STATUS HISTORY (last 5 entries)
      recentStatusHistory: order.statusHistory?.slice(-5) || []
    };

    return res.status(200).json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching order details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
const getAllOrders = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Fetch orders - NO PRODUCT POPULATION
    const orders = await Order.find()
      .select({
        orderNumber: 1,
        userId: 1,
        items: {
          productId: 1,
          variantId: 1,
          name: 1,
          image: 1,
          color: 1,
          size: 1,
          quantity: 1,
          price: 1,
          finalPrice: 1,
          lineTotal: 1
        },
        subtotal: 1,
        shippingCharge: 1,
        totalAmount: 1,
        status: 1,
        paymentStatus: 1,
        paymentMethod: 1,
        createdAt: 1,
        shippingAddress: { city: 1, state: 1, pincode: 1 },
        shiprocket: { awb: 1, status: 1 }
      })
      .populate("userId", "name email phone")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = await Order.countDocuments();

    // Simple formatting - sirf order snapshot data
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.userId ? {
        name: order.userId.name,
        phone: order.userId.phone
      } : {
        name: order.shippingAddress?.name
      },
      summary: {
        totalItems: order.items?.reduce((s, i) => s + i.quantity, 0) || 0,
        total: order.totalAmount || 0,
        status: order.status
      },
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderDate: order.createdAt,
      itemsPreview: order.items?.slice(0, 2).map(i => ({
        name: i.name,
        image: i.image,
        quantity: i.quantity,
        price: i.finalPrice
      })),
      shipping: {
        city: order.shippingAddress?.city,
        awb: order.shiprocket?.awb
      }
    }));

    return res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit)
      }
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

  try {
    // ============ GET YEAR & HALF FROM QUERY PARAM ============
    const selectedYear = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const half = req.query.half || "full"; // "full", "H1", "H2"
    
    console.log(`📅 Fetching metrics for year: ${selectedYear}, half: ${half}`);

    // ============ BUILD DATE RANGE BASED ON YEAR + HALF ============
    let startDate, endDate;

    if (half === "H1") {
      // Jan 1 to June 30
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 5, 30, 23, 59, 59);
    } else if (half === "H2") {
      // July 1 to Dec 31
      startDate = new Date(selectedYear, 6, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
    } else {
      // Full year
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
    }

    // ============ DATE RANGES FOR TODAY/YESTERDAY/THIS MONTH ============
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const lastHour = new Date(new Date().setHours(new Date().getHours() - 1));
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    yesterday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total users count
    const totalUsers = await User.countDocuments({ role: "user" });

    // ============ SINGLE AGGREGATION PIPELINE ============
    const metrics = await Order.aggregate([
      {
        $facet: {
          // 1️⃣ OVERALL METRICS
          overall: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
                totalCOD: {
                  $sum: { $cond: [{ $eq: ["$paymentMethod", "COD"] }, 1, 0] }
                },
                totalPrepaid: {
                  $sum: { $cond: [{ $eq: ["$paymentMethod", "RAZORPAY"] }, 1, 0] }
                },
                avgOrderValue: { $avg: "$totalAmount" }
              }
            }
          ],

          // 2️⃣ TODAY'S METRICS
          today: [
            {
              $match: {
                createdAt: { $gte: today }
              }
            },
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 3️⃣ LAST HOUR METRICS
          lastHour: [
            {
              $match: {
                createdAt: { $gte: lastHour }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 4️⃣ YESTERDAY METRICS
          yesterday: [
            {
              $match: {
                createdAt: {
                  $gte: yesterday,
                  $lt: today
                }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 5️⃣ THIS MONTH METRICS
          thisMonth: [
            {
              $match: {
                createdAt: { $gte: startOfMonth },
                status: { $ne: "CANCELLED" }
              }
            },
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 6️⃣ LAST MONTH METRICS
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lte: endOfLastMonth
                },
                status: { $ne: "CANCELLED" }
              }
            },
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 7️⃣ STATUS WISE COUNTS
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],

          // 8️⃣ PAYMENT STATUS COUNTS
          paymentStatusCounts: [
            {
              $group: {
                _id: "$paymentStatus",
                count: { $sum: 1 }
              }
            }
          ],

          // 9️⃣ RECENT ORDERS
          recentOrders: [
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 9
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $project: {
                _id: 1,
                orderNumber: 1,
                totalAmount: 1,
                status: 1,
                paymentMethod: 1,
                createdAt: 1,
                "user.name": 1,
                "user.email": 1,
                items: { $slice: ["$items", 2] }
              }
            }
          ],

          // 🔟 MONTHLY SALES (Based on selected year + half)
          monthlySales: [
            {
              $match: {
                createdAt: {
                  $gte: startDate,
                  $lte: endDate
                },
                status: { $ne: "CANCELLED" }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
              }
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 }
            }
          ],

          // 1️⃣1️⃣ CATEGORY WISE SALES (Based on selected year + half)
          categorySales: [
            {
              $match: {
                createdAt: {
                  $gte: startDate,
                  $lte: endDate
                },
                status: { $ne: "CANCELLED" }
              }
            },
            {
              $unwind: "$items"
            },
            {
              $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product"
              }
            },
            {
              $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
            },
            {
              $lookup: {
                from: "categories",
                localField: "product.category",
                foreignField: "_id",
                as: "category"
              }
            },
            {
              $group: {
                _id: {
                  month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                  category: { $arrayElemAt: ["$category.name", 0] }
                },
                count: { $sum: "$items.quantity" },
                revenue: { $sum: "$items.lineTotal" }
              }
            },
            {
              $sort: { "_id.month": 1 }
            }
          ],

          // 1️⃣2️⃣ TOP PRODUCTS
          topProducts: [
            {
              $match: {
                status: { $ne: "CANCELLED" }
              }
            },
            {
              $unwind: "$items"
            },
            {
              $group: {
                _id: {
                  productId: "$items.productId",
                  name: "$items.name"
                },
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: { $sum: "$items.lineTotal" },
                orderCount: { $sum: 1 }
              }
            },
            {
              $sort: { totalQuantity: -1 }
            },
            {
              $limit: 5
            }
          ],

          // 1️⃣3️⃣ AVERAGE DELIVERY TIME
          avgDeliveryTime: [
            {
              $match: {
                deliveredAt: { $ne: null },
                confirmedAt: { $ne: null }
              }
            },
            {
              $project: {
                deliveryDays: {
                  $divide: [
                    { $subtract: ["$deliveredAt", "$confirmedAt"] },
                    1000 * 60 * 60 * 24
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgDays: { $avg: "$deliveryDays" }
              }
            }
          ],

          // 1️⃣4️⃣ QUARTERLY SUMMARY
          quarterlySummary: [
            {
              $match: {
                createdAt: {
                  $gte: startDate,
                  $lte: endDate
                },
                status: { $ne: "CANCELLED" }
              }
            },
            {
              $group: {
                _id: {
                  quarter: {
                    $ceil: { $divide: [{ $month: "$createdAt" }, 3] }
                  }
                },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
              }
            },
            {
              $sort: { "_id.quarter": 1 }
            }
          ]
        }
      }
    ]);

    const result = metrics[0];

    // ============ FORMAT RESPONSE ============
    const formatCurrency = (amount) => Math.round(amount || 0);
    const formatGrowth = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return Number(((current - previous) / previous * 100).toFixed(1));
    };

    // Get counts with defaults
    const overall = result.overall[0] || { 
      totalOrders: 0, 
      totalRevenue: 0, 
      totalCOD: 0, 
      totalPrepaid: 0,
      avgOrderValue: 0 
    };
    
    const todayData = result.today[0] || { orders: 0, revenue: 0 };
    const yesterdayData = result.yesterday[0] || { count: 0, revenue: 0 };
    const lastHourData = result.lastHour[0] || { count: 0, revenue: 0 };
    const thisMonthData = result.thisMonth[0] || { orders: 0, revenue: 0 };
    const lastMonthData = result.lastMonth[0] || { orders: 0, revenue: 0 };
    const avgDelivery = result.avgDeliveryTime[0] || { avgDays: 0 };

    // Format monthly sales data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySalesData = (result.monthlySales || []).map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      revenue: item.revenue,
      orders: item.orders
    }));

    // Format category sales for chart
    const categoryChartData = {};
    (result.categorySales || []).forEach(item => {
      const month = item._id.month;
      const category = item._id.category || "Uncategorized";
      
      if (!categoryChartData[month]) {
        categoryChartData[month] = {};
      }
      categoryChartData[month][category] = item.count;
    });

    // Status counts object
    const statusCounts = {};
    (result.statusCounts || []).forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // Payment status counts
    const paymentStatusCounts = {};
    (result.paymentStatusCounts || []).forEach(item => {
      paymentStatusCounts[item._id] = item.count;
    });

    // Format quarterly data
    const quarterNames = ["Q1", "Q2", "Q3", "Q4"];
    const quarterlyData = (result.quarterlySummary || []).map(item => ({
      quarter: quarterNames[item._id.quarter - 1],
      revenue: item.revenue,
      orders: item.orders
    }));

    return res.status(200).json({
      success: true,
      data: {
        // ✅ Selected year & half info
        metadata: {
          selectedYear,
          half,
          availableYears: await getAvailableYears(),
          isCurrentYear: selectedYear === new Date().getFullYear()
        },

        // 🎯 OVERVIEW CARDS
        overview: {
          totalOrders: overall.totalOrders,
          totalRevenue: formatCurrency(overall.totalRevenue),
          totalCOD: overall.totalCOD,
          totalPrepaid: overall.totalPrepaid,
          avgOrderValue: formatCurrency(overall.avgOrderValue),
          
          todayOrders: todayData.orders,
          todayRevenue: formatCurrency(todayData.revenue),
          todayGrowth: formatGrowth(todayData.orders, yesterdayData.count),
          
          thisMonthOrders: thisMonthData.orders,
          thisMonthRevenue: formatCurrency(thisMonthData.revenue),
          monthlyGrowth: formatGrowth(thisMonthData.revenue, lastMonthData.revenue),
          
          activeOrders: lastHourData.count,
          activeRevenue: formatCurrency(lastHourData.revenue),
          activeGrowth: formatGrowth(lastHourData.count, yesterdayData.count / 24 || 0),
          
          avgDeliveryDays: Math.round(avgDelivery.avgDays * 10) / 10,
          
          // Year/Half specific
          periodRevenue: monthlySalesData.reduce((sum, m) => sum + m.revenue, 0),
          periodOrders: monthlySalesData.reduce((sum, m) => sum + m.orders, 0)
        },

        // 📊 QUARTERLY SUMMARY
        quarterlySummary: quarterlyData,

        // 📊 STATUS DISTRIBUTION
        statusDistribution: {
          pending: statusCounts["PENDING"] || 0,
          confirmed: statusCounts["CONFIRMED"] || 0,
          shipped: statusCounts["SHIPPED"] || 0,
          delivered: statusCounts["DELIVERED"] || 0,
          cancelled: statusCounts["CANCELLED"] || 0
        },

        // 💳 PAYMENT STATUS
        paymentStatus: {
          paid: paymentStatusCounts["PAID"] || 0,
          pending: paymentStatusCounts["PENDING"] || 0,
          failed: paymentStatusCounts["FAILED"] || 0,
          refunded: paymentStatusCounts["REFUNDED"] || 0
        },

        // 📈 CHARTS DATA
        charts: {
          monthlyRevenue: monthlySalesData.map(d => ({
            month: `${d.month} ${d.year}`,
            revenue: d.revenue,
            orders: d.orders
          })),
          
          categorySales: categoryChartData,
          
          topProducts: (result.topProducts || []).map(p => ({
            name: p._id.name || "Unknown Product",
            quantity: p.totalQuantity,
            revenue: formatCurrency(p.totalRevenue),
            orders: p.orderCount
          }))
        },

        // 🕒 RECENT ORDERS
        recentOrders: (result.recentOrders || []).map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          date: order.createdAt,
          customer: order.user?.[0] ? {
            name: order.user[0].name,
            email: order.user[0].email
          } : null,
          itemsPreview: (order.items || []).map(item => ({
            name: item.name,
            image: item.image,
            quantity: item.quantity
          }))
        })),

        // 📋 SUMMARY STATS
        summary: {
          totalRevenue: formatCurrency(overall.totalRevenue),
          totalOrders: overall.totalOrders,
          conversionRate: overall.totalOrders && totalUsers ? 
            Number(((overall.totalOrders / totalUsers) * 100).toFixed(1)) : 0,
          codPercentage: overall.totalOrders ? 
            Number(((overall.totalCOD / overall.totalOrders) * 100).toFixed(1)) : 0,
          prepaidPercentage: overall.totalOrders ? 
            Number(((overall.totalPrepaid / overall.totalOrders) * 100).toFixed(1)) : 0
        },

        // 📌 TIMESTAMPS
        timestamps: {
          fetchedAt: new Date(),
          period: {
            start: startDate,
            end: endDate
          }
        }
      }
    });

  } catch (error) {
    console.error("❌ Error in getMetrics:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Helper function to get available years
async function getAvailableYears() {
  const years = await Order.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  return years.map(y => y._id);
}

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.id;
    const {
      addressId,
      productId,
      variantId,
      quantity,
      shippingMeta,
      paymentMethod = "COD",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      couponCode,
      couponDiscount = 0
    } = req.body;

    // ============ 1. VALIDATION ============
    if (!addressId) throw new Error("Shipping address is required");
    if (!shippingMeta?.courierId) throw new Error("Shipping information is required");

    // ============ 2. GET ADDRESS SNAPSHOT ============
    const addressDoc = await address.findById(addressId).session(session);
    if (!addressDoc) throw new Error("Address not found");

    const shippingAddress = {
      name: addressDoc.name,
      phone: addressDoc.phone,
      email: addressDoc.email,
      addressLine1: addressDoc.addressLine1 || addressDoc.address_line1,
      addressLine2: addressDoc.addressLine2 || addressDoc.address_line2,
      city: addressDoc.city,
      state: addressDoc.state,
      pincode: addressDoc.pincode,
      country: addressDoc.country || "India",
    };

    // ============ 3. GET ORDER DATA FROM HELPER ============
    const orderData = await calculateOrderValidation(
      userId,
      { productId, variantId, quantity },
      shippingAddress
    );

   

    // ============ 4. VALIDATE SHIPPING ============
    let shippingCharge = 0;
    let shippingDetails = null;

    try {
      const shippingPreview = await calculateShippingCharge({
        deliveryPincode: shippingAddress.pincode,
        totalWeight: orderData.summary.totalWeight,
      });

      if (shippingPreview.courierId !== shippingMeta.courierId) {
        throw new Error("Shipping option expired. Please refresh and try again.");
      }

      shippingCharge = shippingPreview.shippingCharge;
      shippingDetails = {
        courierId: shippingPreview.courierId,
        courierName: shippingPreview.courierName,
        estimatedDelivery: shippingPreview.estimatedDelivery,
        serviceType: shippingPreview.serviceType || "Standard",
        shippingCharge: shippingPreview.shippingCharge
      };
    } catch (shippingError) {
      console.error("Shipping calculation failed:", shippingError);
      throw new Error("Unable to calculate shipping. Please try again.");
    }

    // ============ 5. CALCULATE TOTALS ============
    const subtotal = orderData.summary.subtotal;
    const itemLevelDiscount = orderData.summary.discount;
    const couponDiscountAmount = Number(couponDiscount) || 0;
    const taxAmount = 0;
    
    const totalAmount = subtotal + shippingCharge + taxAmount - couponDiscountAmount;

    // ============ 6. PREPARE ORDER ITEMS ============
    const orderItems = orderData.items.map(item => {
      const unitDiscount = (item.price - item.sellingPrice);
      const discountPercent = item.price > 0 ? (unitDiscount / item.price) * 100 : 0;
      
      return {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        image: item.image || "",
        price: item.price,
        finalPrice: item.sellingPrice,
        discountPercent: Math.round(discountPercent * 100) / 100,
        discountAmount: unitDiscount,
        quantity: item.quantity,
        lineTotal: item.sellingPrice * item.quantity,
        weight: item.weight || 0.5,
        length: item.length || 25,
        width: item.width || 20,
        height: item.height || 5,
        color: item.color || "",
        size: item.size || "",
        sku: item.sku || `SKU-${item.productId}`
      };
    });

    // ============ 7. DETERMINE PAYMENT STATUS ============
    const isPrepaidPaid = paymentMethod === "RAZORPAY" && razorpayPaymentId && razorpaySignature;
    const paymentMethodValue = paymentMethod === "COD" ? "COD" : "RAZORPAY";
    
    const paymentStatus = isPrepaidPaid ? "PAID" : "PENDING";
    const orderStatus = isPrepaidPaid ? "CONFIRMED" : "PENDING";

    // ============ 8. GENERATE ORDER NUMBER ============
    const orderNumber = await Order.generateOrderNumber();

    // ============ 9. CREATE ORDER ============
    const order = new Order({
      orderNumber, // ✅ IMPORTANT!
      userId,
      
      // Items
      items: orderItems,
      
      // Amounts
      subtotal,
      shippingCharge,
      discount: couponDiscountAmount, // Only coupon discount
      taxAmount,
      totalAmount,
      
      // Address
      shippingAddress,
      
      // Payment
      paymentMethod: paymentMethodValue,
      paymentStatus,
      paymentGateway: razorpayOrderId ? {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature || ""
      } : undefined,
      
      // Shipping
      shippingMeta: {
        courierId: shippingDetails.courierId,
        courierName: shippingDetails.courierName,
        estimatedDelivery: shippingDetails.estimatedDelivery,
        serviceType: shippingDetails.serviceType
      },
      
      // Shiprocket
      shiprocket: {
        status: "PENDING",
        channelId: shippingMeta?.channelId || "YOUR_CHANNEL_ID"
      },
      
      // Order status
      status: orderStatus,
      statusHistory: [{
        status: orderStatus,
        changedBy: userId,
        changedAt: new Date(),
        reason: "Order created"
      }],
      
      customerNotes: req.body.customerNotes,
      isCancelled: false
    });

    await order.save({ session });

    // ============ 10. ✅ RESERVE PRODUCT STOCK (NOT DEDUCT!) ============
    
    for (const item of orderData.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) throw new Error(`Variant ${item.variantId} not found`);
        
        // Check available stock
        const availableStock = variant.stock - (variant.reservedStock || 0);
        if (availableStock < item.quantity) {
          throw new Error(
            `${item.name} (${variant.color}-${variant.size}) out of stock. ` +
            `Available: ${availableStock}, Requested: ${item.quantity}`
          );
        }
        
        // ✅ RESERVE STOCK - NOT DEDUCT!
        const reserved = product.reserveVariantStock(item.variantId, item.quantity);
        
        if (!reserved) {
          throw new Error(`Failed to reserve stock for ${item.name}`);
        }
        
        
      } else {
        // Simple product (no variants)
        if (product.stock < item.quantity) {
          throw new Error(`${item.name} out of stock`);
        }
        product.reservedStock = (product.reservedStock || 0) + item.quantity;
      }
      
      await product.save({ session });
    }

    // ============ 11. CLEAR CART ============
    if (!productId) {
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { products: [] } }, // ✅ $set use karo
        { session }
      );
    }

    // ============ 12. COMMIT TRANSACTION ============
    await session.commitTransaction();
    session.endSession();


    // ============ 13. SEND RESPONSE ============
    res.status(201).json({
      success: true,
      message: `Order created successfully${paymentMethod === "COD" ? " (COD)" : ""}`,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          pricing: {
            mrpTotal: orderData.summary.mrpTotal,
            subtotal: order.subtotal,
            itemLevelDiscount: itemLevelDiscount,
            couponDiscount: order.discount,
            shippingCharge: order.shippingCharge,
            totalAmount: order.totalAmount
          },
          items: order.items.map(item => ({
            name: item.name,
            mrp: item.price,
            sellingPrice: item.finalPrice,
            itemDiscount: item.discountAmount,
            totalItemDiscount: item.discountAmount * item.quantity,
            quantity: item.quantity
          }))
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();



    let statusCode = 400;
    let message = error.message;

    if (error.message.includes("out of stock")) {
      statusCode = 409;
      message = "Some items are out of stock. Please update your cart.";
    } else if (error.message.includes("not found")) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Helper function
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.id;
    const userRole = req.role;
    const { orderId, reason } = req.body;

    // ============ 1. VALIDATE INPUT ============
    if (!orderId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    // ============ 2. FETCH ORDER WITH SESSION ============
    const order = await Order.findById(orderId).session(session);
    
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // ============ 3. AUTHORIZATION CHECK ============
    const isAdmin = userRole === ROLES.admin;
    const isOwner = order.userId.toString() === userId;
    
    if (!isAdmin && !isOwner) {
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to cancel this order" 
      });
    }

    // ============ 4. ALREADY CANCELLED? ============
    if (order.status === "CANCELLED" || order.isCancelled) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Order is already cancelled" 
      });
    }

    // ============ 5. ELIGIBILITY CHECK ============
    if (!order.canCancel()) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled in ${order.status} status` 
      });
    }

    // Time window check (24 hours) - Admin can bypass
    if (!isAdmin) {
      const hoursDiff = (new Date() - order.createdAt) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: "Cancellation allowed only within 24 hours of placing order" 
        });
      }
    }

    // Already shipped check
    if (order.shiprocket?.status === "SHIPPED" || order.shippedAt) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Order already shipped - cannot cancel. Please request return after delivery." 
      });
    }

    // ============ 6. ✅ RESTORE PRODUCT STOCK - USING METHODS ============
    const restoredItems = [];
    
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        restoredItems.push({
          name: item.name,
          restored: false,
          reason: "Product not found"
        });
        continue;
      }

      // ✅ USING PRODUCT SCHEMA METHODS - YE LO IMPORTANT PART!
      
      if (item.variantId) {
        // METHOD 1: updateVariantStock - Stock restore
        const stockUpdated = product.updateVariantStock(item.variantId, item.quantity);
        
        // METHOD 2: releaseVariantStock - Reserved stock release
        const released = product.releaseVariantStock(item.variantId, item.quantity);
        
        if (stockUpdated) {
          
          // Get variant details for response
          const variant = product.variants.id(item.variantId);
          restoredItems.push({
            name: item.name,
            variant: variant ? `${variant.color}-${variant.size}` : 'N/A',
            quantity: item.quantity,
            restored: true,
            method: 'updateVariantStock',
            reservedReleased: released
          });
        }
      } else {
        // ✅ Simple product - manual restore (no method for this)
        product.stock += item.quantity;
        
        restoredItems.push({
          name: item.name,
          quantity: item.quantity,
          restored: true,
          method: 'manual'
        });
      }

      // Decrease sold count - manual (no method for this)
      product.soldCount = Math.max((product.soldCount || 0) - item.quantity, 0);
      
      await product.save({ session });
    }

    // ============ 7. 💰 PROCESS REFUND (For Prepaid Orders) ============
    let refundDetails = null;
    
    if (order.paymentMethod !== "COD" && order.paymentStatus === "PAID") {
      try {
        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        if (order.paymentGateway?.paymentId) {
          const refund = await razorpay.payments.refund(
            order.paymentGateway.paymentId,
            {
              amount: Math.round(order.totalAmount * 100),
              notes: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                reason: reason || "Order cancelled by customer"
              }
            }
          );

          refundDetails = {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status === "processed" ? "COMPLETED" : "INITIATED",
            initiatedAt: new Date(),
            completedAt: refund.status === "processed" ? new Date() : null,
            reason: reason || "Order cancelled"
          };

        }
      } catch (refundError) {
        console.error("❌ Refund failed:", refundError);
        refundDetails = {
          status: "FAILED",
          error: refundError.message,
          initiatedAt: new Date(),
          reason: reason || "Order cancelled"
        };
      }
    }

    // ============ 8. 📝 UPDATE ORDER ============
    order.status = "CANCELLED";
    order.isCancelled = true;
    order.cancelReason = reason || (isAdmin ? "Cancelled by admin" : "Cancelled by customer");
    order.cancelledAt = new Date();
    order.cancelledBy = userId;
    
    if (refundDetails) {
      if (refundDetails.status === "COMPLETED" || refundDetails.status === "INITIATED") {
        order.paymentStatus = "REFUNDED";
      }
      order.refund = refundDetails;
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "CANCELLED",
      changedBy: userId,
      changedAt: new Date(),
      reason: order.cancelReason,
      meta: {
        stockRestored: restoredItems.length > 0,
        refundInitiated: !!refundDetails,
        cancelledBy: isAdmin ? "ADMIN" : "CUSTOMER",
        restoredItemsCount: restoredItems.filter(r => r.restored).length,
        methodsUsed: {
          updateVariantStock: restoredItems.some(i => i.method === 'updateVariantStock'),
          releaseVariantStock: restoredItems.some(i => i.reservedReleased)
        }
      }
    });

    await order.save({ session });

    // ============ 9. ✅ COMMIT TRANSACTION ============
    await session.commitTransaction();
    session.endSession();

    // ============ 10. 📤 SEND RESPONSE ============
    const response = {
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason,
        stockRestored: {
          total: restoredItems.length,
          successful: restoredItems.filter(r => r.restored).length,
          items: restoredItems,
          methods: {
            updateVariantStock: "✅ Used for variant products",
            releaseVariantStock: "✅ Used for reserved stock"
          }
        }
      }
    };

    if (refundDetails) {
      response.data.refund = {
        initiated: true,
        amount: refundDetails.amount,
        status: refundDetails.status,
        refundId: refundDetails.refundId,
        message: refundDetails.status === "FAILED" 
          ? "Refund failed. Our team will process it manually."
          : "Refund initiated successfully"
      };
      
      if (refundDetails.status === "FAILED") {
        response.message = "Order cancelled but refund failed. Our team will process it manually.";
      }
    }

    return res.status(200).json(response);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
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
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.json({
    success: true,
    tracking: resShip.data.data[0].tracking_data,
  });
};

module.exports = {
  getOrdersByUserId,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  getMetrics,
  createOrder,
  cancelOrder,
  exchangeOrder,
  trackShipment,
};
