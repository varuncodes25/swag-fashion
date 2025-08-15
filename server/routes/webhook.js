// routes/webhook.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.post("/shiprocket-webhook", async (req, res) => {
  try {
    const { order_id, shipment_status } = req.body;
    const order = await Order.findOne({ shiprocketId: order_id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const statusMap = {
      Created: "pending",
      Packed: "packed",
      Shipped: "in_transit",
      Delivered: "delivered",
      Cancelled: "cancelled",
    };

    if (statusMap[shipment_status]) {
      order.status = statusMap[shipment_status];
      await order.save();
    }

    return res.status(200).json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
