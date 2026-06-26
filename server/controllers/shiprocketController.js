const axios = require("axios");
const Order = require("../models/Order");
const getShiprocketToken = require("../utils/shiprocket");
const { calculateShippingCharge } = require("../service/shiprocketService");

const createShipment = async (orderId) => {
  const order = await Order.findById(orderId);
  console.log(order, "Order for shipment");
  if (!order) throw new Error("Order not found");

  const token = await getShiprocketToken();

  const addr = order.address;
  if (
    !addr.name ||
    !addr.phone ||
    !addr.street ||
    !addr.city ||
    !addr.state ||
    !addr.zip
  ) {
    throw new Error("Incomplete address for shipment");
  }

  const orderDate = new Date().toISOString().replace("T", " ").slice(0, 16);

  const payload = {
    order_id: `order_${order._id}`, // better unique ID
    order_date: orderDate,
    pickup_location: "Home",
    channel_id: 7722014,

    // Billing
    billing_customer_name: "Varun Tare",
    billing_last_name: "",
    billing_address: "23, T-251, Cidco colony, Boisar, palghar, Maharashtra",
    billing_city: "Boisar",
    billing_pincode: "401501",
    billing_state: "Maharashtra",
    billing_country: "India",
    billing_email: "varuntare2@gmail.com",
    billing_phone: "9702447092",

    shipping_is_billing: true,

    // Items
    order_items: [
      {
        name: "Macaw Sunflower - L Blue",
        sku: "TSHIRT001",
        units: 1,
        selling_price: 439,
        discount: 0,
        tax: 0,
        hsn: "",
      },
    ],

    payment_method: "COD",
    sub_total: 439,
    length: 10,
    breadth: 10,
    height: 2,
    weight: 0.5,
  };

  console.log("🚀 Shiprocket payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Shiprocket response:", res.data);

    if (res.data && res.data.status_code === 1) {
      order.shiprocketId = res.data.order_id;
      order.shipmentId = res.data.shipment_id;
      await order.save();
      return order;
    } else {
      throw new Error(
        `Shiprocket order create failed: ${JSON.stringify(res.data)}`
      );
    }
  } catch (err) {
    console.error(
      "❌ Shiprocket API error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

function isPincodeNotServiceable(error) {
  return (
    error?.code === "PINCODE_NOT_SERVICEABLE" ||
    error?.message === "Shipping not available for this pincode"
  );
}

function shouldUseDeliveryFallback(error) {
  if (isPincodeNotServiceable(error)) return false;

  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("failed to authenticate with shiprocket") ||
    message.includes("unable to verify the first certificate") ||
    message.includes("network error") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("certificate")
  );
}

function buildFallbackDeliveryEstimate(pincode, deliveryDays = 5) {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return {
    success: true,
    available: true,
    pincode,
    estimatedDate: formattedDate,
    deliveryDays,
    message: `Estimated delivery by ${formattedDate}`,
    estimated: true,
  };
}

const checkDeliveryDate = async (req, res) => {
  try {
    const normalizedPincode = String(req.body?.pincode ?? "").trim();

    if (!normalizedPincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
      });
    }

    if (normalizedPincode.length !== 6 || !/^\d{6}$/.test(normalizedPincode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit pincode",
      });
    }

    const totalWeight = 0.5;

    let shippingInfo;
    try {
      shippingInfo = await calculateShippingCharge({
        deliveryPincode: normalizedPincode,
        totalWeight,
      });
    } catch (error) {
      if (isPincodeNotServiceable(error)) {
        return res.json({
          success: true,
          available: false,
          message: "Delivery not available at this pincode",
          pincode: normalizedPincode,
        });
      }

      if (shouldUseDeliveryFallback(error)) {
        console.warn(
          "Shiprocket API unavailable, using fallback estimate:",
          error.message
        );
        return res.json(buildFallbackDeliveryEstimate(normalizedPincode));
      }

      throw error;
    }

    const deliveryDate = new Date(shippingInfo.estimatedDelivery);
    const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    res.json({
      success: true,
      available: true,
      pincode: normalizedPincode,
      estimatedDate: formattedDate,
      deliveryDays: shippingInfo.deliveryDays,
      message: `Delivery by ${formattedDate}`,
    });
  } catch (error) {
    console.error("Delivery check error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


module.exports = { createShipment,checkDeliveryDate };
