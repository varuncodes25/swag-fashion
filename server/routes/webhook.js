const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const {
  applyOrderStatusTransition,
  mapExternalShipmentToOrderStatus,
  mapExternalToShiprocketStatus,
} = require("../utils/orderStatusHelpers");

router.post("/shiprocket-webhook", async (req, res) => {
  try {
    const { order_id, shipment_status, awb, current_status } = req.body;
    const externalStatus = shipment_status || current_status;

    if (!order_id) {
      return res.status(400).json({ success: false, message: "order_id required" });
    }

    const order = await Order.findOne({
      $or: [
        { "shiprocket.orderId": String(order_id) },
        { "shiprocket.shipmentId": String(order_id) },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const mappedOrderStatus = mapExternalShipmentToOrderStatus(externalStatus);
    const mappedShipStatus = mapExternalToShiprocketStatus(externalStatus);

    if (mappedShipStatus) {
      order.shiprocket = order.shiprocket || {};
      order.shiprocket.status = mappedShipStatus;
    }
    if (awb) {
      order.shiprocket.awb = String(awb);
    }

    if (mappedOrderStatus) {
      applyOrderStatusTransition(order, mappedOrderStatus, {
        reason: `Shiprocket webhook: ${externalStatus}`,
      });
    }

    await order.save();

    return res.status(200).json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error("Shiprocket webhook error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
