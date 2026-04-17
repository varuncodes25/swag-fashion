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

router.get("/get-orders-by-user-id", verifyToken, getOrdersByUserId);

router.get("/get-all-orders", verifyToken, getAllOrders);

router.get("/get-metrics", verifyToken, getMetrics);

router.put(
  "/update-order-status/:paymentId",
  verifyToken,
  decryptRequest,
  updateOrderStatus,
);

router.post("/orders/create", verifyToken, decryptRequest, createOrder);

router.get("/track/:id", trackShipment);
router.post(
  "/admin/orders/:id/create-shipment",
  verifyToken,
  decryptRequest,
  createShipmentForOrder,
);

router.post("/cancel-order", verifyToken, decryptRequest, cancelOrder);
router.get("/orders/:orderId", verifyToken, getOrderDetails);

module.exports = router;
