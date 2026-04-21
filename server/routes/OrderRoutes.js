const router = require("express").Router();
const {
  getOrdersByUserId,
  getAllOrders,
  getMetrics,
  updateOrderStatus,
  createOrder,
  trackShipment,
  getOrderDetails,
  cancelOrder,
  createShipmentForOrder,
} = require("../controllers/OrderController");
const verifyToken = require("../middlewares/verifyToken");
const decryptRequest = require("../utils/decryptResponse");
const { buildLimiter, toNumber } = require("../utils/rateLimitConfig");

const ordersReadLimiter = buildLimiter({
  envPrefix: "ORDERS_READ",
  windowMs: toNumber(process.env.ORDERS_READ_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.ORDERS_READ_LIMIT_MAX, 90),
  message: { message: "Too many order requests. Please retry shortly." },
});

const ordersMutationLimiter = buildLimiter({
  envPrefix: "ORDERS_MUTATION",
  windowMs: toNumber(process.env.ORDERS_MUTATION_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.ORDERS_MUTATION_LIMIT_MAX, 30),
  message: { message: "Too many order updates. Please retry shortly." },
});

router.get("/get-orders-by-user-id", ordersReadLimiter, verifyToken, getOrdersByUserId);

router.get("/get-all-orders", ordersReadLimiter, verifyToken, getAllOrders);

router.get("/get-metrics", ordersReadLimiter, verifyToken, getMetrics);

router.put(
  "/update-order-status/:paymentId",
  ordersMutationLimiter,
  verifyToken,
  decryptRequest,
  updateOrderStatus,
);

router.post("/orders/create", ordersMutationLimiter, verifyToken, decryptRequest, createOrder);

router.get("/track/:id", ordersReadLimiter, trackShipment);
router.post(
  "/admin/orders/:id/create-shipment",
  ordersMutationLimiter,
  verifyToken,
  decryptRequest,
  createShipmentForOrder,
);

router.post("/cancel-order", ordersMutationLimiter, verifyToken, decryptRequest, cancelOrder);
router.get("/orders/:orderId", ordersReadLimiter, verifyToken, getOrderDetails);

module.exports = router;
