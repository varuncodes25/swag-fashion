const axios = require("axios");
const getShiprocketToken = require("../helper/shiprocket");
const shipmentSchema = require("../models/shipmentSchema");
const Order = require("../models/Order");

// 🔥 AUTO-DETECT MODE - No need to change anything manually!
const IS_TESTING = process.env.NODE_ENV !== 'production' || process.env.MOCK_SHIPROCKET === 'true';

async function createShiprocketOrder(order) {

  const token = await getShiprocketToken();

  if (!order.shippingMeta?.courierId) {
    throw new Error("Courier not locked in order");
  }

  try {
    // 1) Create order on Shiprocket
    const shiprocketOrder = await createAdhocOrderOnShiprocket(order, token);
    console.log("✅ Adhoc order created:", shiprocketOrder.order_id);

    // 2) Generate AWB with locked courier (auto mock if testing)
    let courierData = null;
    try {
      courierData = await assignLockedCourier(
        shiprocketOrder.order_id,
        order.shippingMeta.courierId,
        token
      );
      console.log(`✅ AWB ${IS_TESTING ? '(MOCK) ' : ''}generated:`, courierData.awb_code);
    } catch (awbError) {
      console.error("⚠️ AWB generation failed, but order created:", awbError.message);
      courierData = {
        awb_code: null,
        courier_name: order.shippingMeta.courierName,
        tracking_url: null,
        error: awbError.message
      };
    }

    // 3) Generate Invoice (NEW FEATURE)
    let invoiceData = null;
    try {
      invoiceData = await generateInvoice(shiprocketOrder.order_id, token);
      console.log(`✅ Invoice ${IS_TESTING ? '(MOCK) ' : ''}generated:`, invoiceData.invoiceUrl);
    } catch (invoiceError) {
      console.error("⚠️ Invoice generation failed:", invoiceError.message);
      invoiceData = {
        invoiceUrl: null,
        irnNo: null,
        error: invoiceError.message
      };
    }

    // 4) Save shipment in DB with invoice details
    const shipment = await saveShipment(order, shiprocketOrder, courierData, invoiceData);
    return shipment;
  } catch (error) {
    console.error("❌ Shiprocket order creation failed:", error);
    throw error;
  }
}

// 🆕 NEW FUNCTION: Generate Invoice
async function generateInvoice(shiprocketOrderId, token) {
  // Mock mode for testing
  // if (IS_TESTING) {
  //   console.log("🔧 [TESTING MODE] Generating mock invoice (no API call)");
  //   return {
  //     invoiceUrl: `https://testing.shiprocket.com/invoice/${shiprocketOrderId}`,
  //     irnNo: `MOCK_IRN_${Date.now()}`,
  //     _mock: true
  //   };
  // }

  // Real mode - production
  console.log("🔒 [PRODUCTION MODE] Generating real invoice");
  
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/print/invoice",
      {
        ids: [parseInt(shiprocketOrderId)]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📄 Invoice Response:", response.data);

    if (response.data.is_invoice_created) {
      return {
        invoiceUrl: response.data.invoice_url,
        irnNo: response.data.irn_no || null,
        _mock: false
      };
    } else {
      throw new Error("Invoice creation failed");
    }
  } catch (error) {
    console.error("❌ Invoice generation error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

async function createAdhocOrderOnShiprocket(order, token) {
  const fullName = order.shippingAddress.name.trim();
  const parts = fullName.split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "Customer";

  const totalWeight = Math.max(0.2, order.items.reduce(
    (sum, item) => sum + (Number(item.weight) || 0.2) * Number(item.quantity),
    0
  ));

  const boxLength = Math.max(10, ...order.items.map((i) => Number(i.length) || 10));
  const boxWidth = Math.max(10, ...order.items.map((i) => Number(i.width) || 10));
  const boxHeight = Math.max(10, ...order.items.map((i) => Number(i.height) || 10));

  const order_items = order.items.map((item) => {
    const sellingPrice = Number(item.finalPrice ?? item.sellingPrice ?? item.price);
    
    return {
      name: item.name.substring(0, 100),
      units: Number(item.quantity),
      selling_price: sellingPrice,
      discount: 0,
      sku: (item.sku || `SKU-${item.productId}`).substring(0, 50),
      hsn: "999999",
    };
  });

  /**
   * `order.subtotal` DB = selling total (checkout `summary.subtotal`).
   * Line sum verify / fallback — Shiprocket sub_total must match line items.
   */
  const sellingSubtotal = order.items.reduce((sum, item) => {
    const line =
      item.lineTotal != null
        ? Number(item.lineTotal)
        : Number(item.finalPrice ?? item.sellingPrice ?? item.price) *
          Number(item.quantity || 1);
    return sum + line;
  }, 0);

  const taxAmt = Number(order.taxAmount || 0);
  const subTotalForRocket = Math.round(sellingSubtotal * 100) / 100;
  const recomputedTotal =
    Math.round((subTotalForRocket + Number(order.shippingCharge || 0) + taxAmt) * 100) / 100;
  if (Math.abs(recomputedTotal - Number(order.totalAmount)) > 0.05) {
    console.warn("⚠️ Shiprocket amounts check: totalAmount vs parts", {
      totalAmount: order.totalAmount,
      recomputedTotal,
      subTotalForRocket,
      shipping: order.shippingCharge,
      tax: taxAmt,
    });
  }

  const payload = {
    order_id: String(order.orderNumber),
    order_date: new Date().toISOString().split("T")[0],
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    
    sub_total: subTotalForRocket,
    shipping_charges: Number(order.shippingCharge),
    pickup_location: "Home",
    total_price: Number(order.totalAmount),

    ...(order.paymentMethod === "COD" && {
      cod_amount: Number(order.totalAmount),
    }),
    
    billing_customer_name: firstName.substring(0, 50),
    billing_last_name: lastName.substring(0, 50),
    billing_phone: String(order.shippingAddress.phone).replace(/\D/g, '').slice(0, 10),
    billing_email: (order.shippingAddress.email || "customer@example.com").substring(0, 100),
    billing_address: order.shippingAddress.addressLine1.substring(0, 100),
    billing_address_2: (order.shippingAddress.addressLine2 || "").substring(0, 100),
    billing_city: order.shippingAddress.city.substring(0, 50),
    billing_state: order.shippingAddress.state.substring(0, 50),
    billing_pincode: String(order.shippingAddress.pincode).replace(/\D/g, '').slice(0, 6),
    billing_country: (order.shippingAddress.country || "India").substring(0, 50),

    shipping_is_billing: true,
    order_items: order_items,

    length: Math.round(boxLength),
    breadth: Math.round(boxWidth),
    height: Math.round(boxHeight),
    weight: Math.round(totalWeight * 100) / 100,

    auto_assign: false,
    is_pickup: false,
  };

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📦 Shiprocket Response:", response.data);

 // ✅ Accept both status 1 (NEW) and 2 (INVOICED)
if (response.data.status_code !== 1 && response.data.status_code !== 2) {
  throw new Error(`Adhoc order failed: ${JSON.stringify(response.data)}`);
}

    return response.data;
  } catch (error) {
    console.error("❌ Shiprocket Adhoc Error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      errors: error.response?.data?.errors
    });
    throw error;
  }
}

async function assignLockedCourier(orderId, courierId, token) {
  // 🔥 AUTO MOCK MODE - Testing mode automatically detected
  if (IS_TESTING) {
    console.log("🔧 [TESTING MODE] Generating mock AWB (no API call)");
    console.log(`   Order ID: ${orderId}, Courier ID: ${courierId}`);
    
    // Generate realistic mock data
    const mockAwb = `MOCK${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const mockShipmentId = Math.floor(Math.random() * 10000000000);
    
    return {
      awb_code: mockAwb,
      courier_name: "Mock Courier (Testing)",
      tracking_url: `https://testing.shiprocket.com/track/${mockAwb}`,
      shipment_id: mockShipmentId,
      _mock: true,
      charges: 57
    };
  }
  
  // 🔥 REAL MODE - Only runs in production
  console.log("🔒 [PRODUCTION MODE] Generating real AWB:", { orderId, courierId });
  
  try {
    // Step 1: Assign courier to order
    const assignResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/assign-courier",
      {
        order_id: parseInt(orderId),
        courier_id: parseInt(courierId)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📦 Courier Assign Response:", assignResponse.data);

    if (assignResponse.data.status_code !== 1) {
      throw new Error(`Courier assignment failed: ${JSON.stringify(assignResponse.data)}`);
    }

    // Step 2: Generate AWB
    const awbResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/generate/awb",
      {
        order_id: parseInt(orderId)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📦 AWB Response:", awbResponse.data);

    if (awbResponse.data.status_code !== 1) {
      throw new Error(`AWB generation failed: ${JSON.stringify(awbResponse.data)}`);
    }

    if (!awbResponse.data.awb_code) {
      throw new Error("No AWB code received");
    }

    return {
      awb_code: awbResponse.data.awb_code,
      courier_name: assignResponse.data.courier_name || awbResponse.data.courier_name,
      tracking_url: awbResponse.data.tracking_url || null,
      shipment_id: awbResponse.data.shipment_id,
      _mock: false,
      charges: assignResponse.data.charges || 57
    };
  } catch (error) {
    console.error("❌ AWB generation error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// 🔥 UPDATED: Save shipment with invoice data
async function saveShipment(order, shiprocketOrder, courierData, invoiceData) {
  const shippingStatus = courierData.awb_code ? "COURIER_ASSIGNED" : "CREATED";
  
  const shipment = await shipmentSchema.create({
    orderId: order._id,
    provider: "Shiprocket",
    shiprocketOrderId: shiprocketOrder.order_id,
    awb: courierData.awb_code,
    courier: courierData.courier_name,
    trackingUrl: courierData.tracking_url || null,
    invoiceUrl: invoiceData?.invoiceUrl || null,  // 🆕 Save invoice URL
    irnNo: invoiceData?.irnNo || null,           // 🆕 Save e-invoice number
    shippingStatus: shippingStatus,
    charges: {
      estimated: order.shippingCharge,
      actual: courierData.charges || order.shippingCharge
    },
    statusHistory: [
      {
        status: shippingStatus,
        source: "shiprocket",
        remark: courierData.awb_code 
          ? `AWB ${courierData.awb_code} generated with ${courierData.courier_name}${courierData._mock ? ' (MOCK MODE)' : ''}`
          : `Order created on Shiprocket but AWB generation failed: ${courierData.error || ''}`,
        at: new Date()
      },
      ...(invoiceData?.invoiceUrl ? [{
        status: "INVOICE_GENERATED",
        source: "shiprocket",
        remark: `Invoice generated${invoiceData._mock ? ' (MOCK MODE)' : ''}`,
        at: new Date()
      }] : [])
    ],
  });

  await Order.findByIdAndUpdate(order._id, {
    currentShipmentId: shipment._id,
    "shiprocket.orderId": shiprocketOrder.order_id,
    "shiprocket.awb": courierData.awb_code,
    "shiprocket.courierName": courierData.courier_name,
    "shiprocket.status": shippingStatus,
    "shiprocket.mode": courierData._mock ? "TESTING" : "PRODUCTION",
    "shiprocket.invoiceUrl": invoiceData?.invoiceUrl || null,  // 🆕 Save to order
    "shiprocket.irnNo": invoiceData?.irnNo || null             // 🆕 Save to order
  });

  return shipment;
}

async function calculateShippingCharge({ deliveryPincode, totalWeight }) {
  const token = await getShiprocketToken();
  
  const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=400053&delivery_postcode=${deliveryPincode}&weight=${totalWeight}&cod=0`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = res.data?.data;
  if (!data || !data.available_courier_companies?.length) {
    throw new Error("Shipping not available for this pincode");
  }

  const couriers = data.available_courier_companies;

  const recommendedId =
    data.shiprocket_recommended_courier_id ||
    data.recommended_courier_company_id;

  const recommendedCourier = couriers.find(
    (c) => c.courier_company_id === recommendedId
  );

  if (!recommendedCourier) {
    throw new Error("Recommended courier not found");
  }

  return {
    shippingCharge: Number(recommendedCourier.rate),
    courierId: recommendedCourier.courier_company_id,
    courierName: recommendedCourier.courier_name,
    estimatedDelivery: recommendedCourier.etd,
    deliveryDays: recommendedCourier.estimated_delivery_days,
    courierRating: recommendedCourier.rating,
  };
}

// 🆕 NEW FUNCTION: Get invoice by order ID (for frontend)
async function getInvoiceByOrderId(orderId) {
  const order = await Order.findById(orderId);
  if (!order || !order.shiprocket?.invoiceUrl) {
    throw new Error("Invoice not found");
  }
  
  return {
    invoiceUrl: order.shiprocket.invoiceUrl,
    irnNo: order.shiprocket.irnNo,
    awb: order.shiprocket.awb,
    orderNumber: order.orderNumber
  };
}

module.exports = {
  createShiprocketOrder,
  calculateShippingCharge,
  getInvoiceByOrderId,  // 🆕 Export new function
  generateInvoice       // 🆕 Export for manual invoice generation
};