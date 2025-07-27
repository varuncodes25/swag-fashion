const router = require("express").Router();
const {
  getOrdersByUserId,
  getAllOrders,
  getMetrics,
  updateOrderStatus,
  createCODOrder,
} = require("../controllers/OrderController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/get-orders-by-user-id", verifyToken, getOrdersByUserId);

router.get("/get-all-orders", verifyToken, getAllOrders);

router.get("/get-metrics", verifyToken, getMetrics);

router.put("/update-order-status/:paymentId", verifyToken, updateOrderStatus);

router.post("/cod-order", verifyToken, createCODOrder);

module.exports = router;
