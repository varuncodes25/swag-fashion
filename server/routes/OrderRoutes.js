const router = require("express").Router();
const {
  getOrdersByUserId,
  getAllOrders,
  getMetrics,
  updateOrderStatus,
  createCODOrder,
  trackShipment,
  cancelOrder,
} = require("../controllers/OrderController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/get-orders-by-user-id", verifyToken, getOrdersByUserId);

router.get("/get-all-orders", verifyToken, getAllOrders);

router.get("/get-metrics", verifyToken, getMetrics);

router.put("/update-order-status/:paymentId", verifyToken, updateOrderStatus);

router.post("/cod-order", verifyToken, createCODOrder);

router.get("/track/:id", trackShipment);

router.put("/cancel-order", cancelOrder);

module.exports = router;
