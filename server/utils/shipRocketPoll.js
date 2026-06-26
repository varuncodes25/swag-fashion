const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const getShiprocketToken = require("./shiprocket");
const {
  applyOrderStatusTransition,
  mapExternalShipmentToOrderStatus,
  mapExternalToShiprocketStatus,
} = require("./orderStatusHelpers");

const pollShiprocketStatus = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn("Shiprocket poll skipped: database not connected");
    return;
  }

  const orders = await Order.find({
    "shiprocket.orderId": { $ne: null },
    status: { $in: ["CONFIRMED", "PROCESSING", "SHIPPED"] },
  }).limit(50);

  if (!orders.length) return;

  let token;
  try {
    token = await getShiprocketToken();
  } catch (err) {
    console.error("Shiprocket poll auth failed:", err.message);
    return;
  }

  for (const order of orders) {
    try {
      const shipmentId = order.shiprocket?.shipmentId || order.shiprocket?.orderId;
      if (!shipmentId) continue;

      const res = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const trackData = res.data?.tracking_data || res.data?.data?.[0]?.tracking_data;
      const latest =
        (Array.isArray(trackData) ? trackData[0]?.current_status : trackData?.track_status) ||
        res.data?.data?.[0]?.tracking_data?.[0]?.status;

      if (!latest) continue;

      const mappedOrderStatus = mapExternalShipmentToOrderStatus(latest);
      const mappedShipStatus = mapExternalToShiprocketStatus(latest);

      if (mappedShipStatus) {
        order.shiprocket = order.shiprocket || {};
        order.shiprocket.status = mappedShipStatus;
      }

      const prevStatus = order.status;

      if (mappedOrderStatus) {
        applyOrderStatusTransition(order, mappedOrderStatus, {
          reason: `Shiprocket poll: ${latest}`,
        });
      }

      if (order.status !== prevStatus || mappedShipStatus) {
        await order.save();
      }
    } catch (err) {
      console.error(`Shiprocket poll error (${order._id}):`, err.message);
    }
  }
};

const POLL_INTERVAL_MS = 15 * 60 * 1000;

// Run once on startup, then every 15 minutes
pollShiprocketStatus().catch((err) =>
  console.error("Shiprocket poll startup run failed:", err.message),
);
setInterval(() => {
  pollShiprocketStatus().catch((err) =>
    console.error("Shiprocket poll failed:", err.message),
  );
}, POLL_INTERVAL_MS);

module.exports = { pollShiprocketStatus };
