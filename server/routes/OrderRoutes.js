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
} = require("../controllers/OrderController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/get-orders-by-user-id", verifyToken, getOrdersByUserId);

router.get("/get-all-orders", verifyToken, getAllOrders);

router.get("/get-metrics", verifyToken, getMetrics);

router.put("/update-order-status/:paymentId", verifyToken, updateOrderStatus);

router.post("/orders/create", verifyToken, createOrder);

router.get("/track/:id", trackShipment);

router.post("/cancel-order", verifyToken,cancelOrder);
router.get("/orders/:orderId", verifyToken, getOrderDetails);

module.exports = router;
