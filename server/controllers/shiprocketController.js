// controllers/shiprocketController.js
const axios = require("axios");
const Order = require("../models/Order");
const getShiprocketToken = require("../utils/shiprocket"); // Function to get auth token

/**
 * Create a shipment in Shiprocket for the given order ID
 * @param {String} orderId - MongoDB Order ID
 * @returns {Object} - Updated order with shiprocketId
 */
const createShipment = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // 1️⃣ Get Shiprocket authentication token
  const token = await getShiprocketToken();

  // 2️⃣ Prepare payload for Shiprocket
  const payload = {
    order_id: order._id.toString(),
    order_date: order.createdAt,
    pickup_location: "Primary Warehouse", // Customize if you have multiple warehouses
    shipping_customer_name: order.address.name || "Customer Name",
    shipping_customer_email: order.address.email || "customer@example.com",
    shipping_customer_phone: order.address.phone || "9999999999",
    shipping_customer_address: order.address.street || "Street",
    shipping_customer_city: order.address.city || "City",
    shipping_customer_state: order.address.state || "State",
    shipping_customer_country: "India",
    shipping_customer_zip: order.address.zip || "000000",
    order_items: order.products.map((p) => ({
      name: p.name || "Product",
      sku: p.id.toString(),
      units: p.quantity,
      selling_price: p.price || 0,
    })),
  };

  // 3️⃣ Call Shiprocket API
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // 4️⃣ Save shiprocketId in order
  const shiprocketId = res.data.data.order_id;
  order.shiprocketId = shiprocketId;
  await order.save();

  return order;
};

module.exports = { createShipment };
