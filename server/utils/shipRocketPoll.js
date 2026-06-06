const axios = require("axios");
const Order = require("../models/Order");
const getShiprocketToken = require("./shiprocketAuth");
const {
  applyOrderStatusTransition,
  mapExternalShipmentToOrderStatus,
  mapExternalToShiprocketStatus,
} = require("./orderStatusHelpers");

const pollShiprocketStatus = async () => {
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

      if (mappedOrderStatus) {
        applyOrderStatusTransition(order, mappedOrderStatus, {
          reason: `Shiprocket poll: ${latest}`,
        });
      }

      await order.save();
    } catch (err) {
      console.error(`Shiprocket poll error (${order._id}):`, err.message);
    }
  }
};

// Run every 15 minutes
setInterval(pollShiprocketStatus, 15 * 60 * 1000);

module.exports = { pollShiprocketStatus };
