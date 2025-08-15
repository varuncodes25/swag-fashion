// utils/shiprocketPoll.js
const axios = require("axios");
const Order = require("../models/Order");
const getShiprocketToken = require("./shiprocketAuth");

const pollShiprocketStatus = async () => {
  const orders = await Order.find({
    shiprocketId: { $ne: null },
    status: { $in: ["pending", "packed", "in_transit"] },
  });

  const token = await getShiprocketToken();

  for (let order of orders) {
    try {
      const res = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shiprocketId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const shipStatus = res.data.data[0].tracking_data[0].status;
      const statusMap = {
        Created: "pending",
        Packed: "packed",
        Shipped: "in_transit",
        Delivered: "delivered",
      };

      if (statusMap[shipStatus]) {
        order.status = statusMap[shipStatus];
        await order.save();
      }
    } catch (err) {
      console.error("Polling Error:", err.message);
    }
  }
};

// Run every 15 minutes
setInterval(pollShiprocketStatus, 15 * 60 * 1000);
