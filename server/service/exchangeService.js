const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../models/Order");
const Exchange = require("../models/Exchange");
const Product = require("../models/Product");
const { ROLES } = require("../utils/constants");
const { applyOrderStatusTransition } = require("../utils/orderStatusHelpers");
const {
  EXCHANGE_TYPES,
  ACTIVE_EXCHANGE_STATUSES,
  EXCHANGE_WINDOW_DAYS,
} = require("../constants/exchangeConstants");
const {
  round2,
  calculateExchangePricing,
  resolveExchangeVariant,
  isSameVariant,
  getProductImage,
} = require("../helper/exchangeHelper");

class ExchangeError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ExchangeError";
  }
}

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

function getExchangeDeadline(deliveredAt) {
  const deadline = new Date(deliveredAt);
  deadline.setDate(deadline.getDate() + EXCHANGE_WINDOW_DAYS);
  return deadline;
}

function getOrderDeliveredAt(order) {
  if (order.deliveredAt) return order.deliveredAt;
  if (order.shiprocket?.status === "DELIVERED" && order.updatedAt) {
    return order.updatedAt;
  }
  return null;
}

function buildPricingMessage(pricing) {
  if (pricing.paymentRequired) {
    return `You need to pay ₹${pricing.extraAmountToPay} extra for this exchange`;
  }
  if (pricing.savingsAmount > 0) {
    return `New product costs ₹${pricing.savingsAmount} less. No cash refund — exchange only policy.`;
  }
  return "No extra payment required for this exchange";
}

function normalizeExtraPaymentMethod(method) {
  return String(method || "RAZORPAY").toUpperCase() === "COD" ? "COD" : "RAZORPAY";
}

function resolveExtraPaymentMethod(payload, order, paymentRequired) {
  if (!paymentRequired) return null;

  if (payload?.extraPaymentMethod) {
    return normalizeExtraPaymentMethod(payload.extraPaymentMethod);
  }

  return order.paymentMethod === "COD" ? "COD" : "RAZORPAY";
}

function getRazorpayClient() {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keyId || !keySecret) {
    throw new ExchangeError("Online payment is not configured on the server", 503);
  }
  return require("../config/razorpay");
}

function formatExchangeForClient(exchange) {
  if (!exchange) return null;

  const doc = exchange.toObject ? exchange.toObject() : exchange;

  return {
    id: doc._id,
    exchangeNumber: doc.exchangeNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    status: doc.status,
    type: doc.type,
    reason: doc.reason,
    requestedAt: doc.requestedAt,
    approvedAt: doc.approvedAt,
    completedAt: doc.completedAt,
    rejectedAt: doc.rejectedAt,
    cancelledAt: doc.cancelledAt,
    itemIndex: doc.itemIndex,
    details: {
      itemIndex: doc.itemIndex,
      quantity: doc.originalItem?.quantity,
      originalProductId: doc.originalItem?.productId,
      originalProductName: doc.originalItem?.name,
      originalColor: doc.originalItem?.color,
      originalSize: doc.originalItem?.size,
      originalUnitPrice: doc.originalItem?.unitPrice,
      originalLineTotal: doc.originalItem?.lineTotal,
      newProductId: doc.newItem?.productId,
      newProductName: doc.newItem?.name,
      newColor: doc.newItem?.color,
      newSize: doc.newItem?.size,
      newVariantId: doc.newItem?.variantId,
      newUnitPrice: doc.newItem?.unitPrice,
      newLineTotal: doc.newItem?.lineTotal,
      newImage: doc.newItem?.image,
    },
    originalItem: doc.originalItem,
    newItem: doc.newItem,
    pricing: doc.pricing,
    payment: doc.payment,
    adminNotes: doc.adminNotes,
    rejectionReason: doc.rejectionReason,
    cancellationReason: doc.cancellationReason,
    statusHistory: doc.statusHistory?.slice(-5) || [],
  };
}

async function loadOrderForExchange(orderId, userId, userRole, { requireOwner = true } = {}) {
  if (!isValidObjectId(orderId)) {
    throw new ExchangeError("Invalid order ID", 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ExchangeError("Order not found", 404);
  }

  const isAdmin = userRole === ROLES.admin;
  const isOwner = order.userId.toString() === String(userId);

  if (requireOwner && !isAdmin && !isOwner) {
    throw new ExchangeError("You are not authorized to access this order", 403);
  }

  return { order, isAdmin, isOwner };
}

async function validateOrderExchangeEligibility(order) {
  if (order.isCancelled || order.status === "CANCELLED") {
    throw new ExchangeError("Cancelled orders cannot be exchanged", 400);
  }

  if (order.status === "RETURNED") {
    throw new ExchangeError("Returned orders cannot be exchanged", 400);
  }

  if (order.status === "EXCHANGED") {
    throw new ExchangeError("This order has already been exchanged", 400);
  }

  if (order.status !== "DELIVERED") {
    throw new ExchangeError("Only delivered orders can be exchanged", 400);
  }

  if (["FAILED", "REFUNDED"].includes(order.paymentStatus)) {
    throw new ExchangeError("This order is not eligible for exchange", 400);
  }

  const deliveredAt = getOrderDeliveredAt(order);
  if (!deliveredAt) {
    throw new ExchangeError(
      "Delivery date not found. Please wait until the order is marked delivered.",
      400,
    );
  }

  if (new Date() > getExchangeDeadline(deliveredAt)) {
    throw new ExchangeError(
      `Exchange window has expired (${EXCHANGE_WINDOW_DAYS} days after delivery)`,
      400,
    );
  }

  const activeExchange = await Exchange.findActiveByOrderId(order._id);
  if (activeExchange) {
    throw new ExchangeError(
      "An active exchange request already exists for this order",
      400,
    );
  }

  return { deliveredAt };
}

function getOrderItem(order, itemIndex) {
  const idx = Number(itemIndex) || 0;
  const item = order.items[idx];

  if (!item) {
    throw new ExchangeError("Invalid item selected for exchange", 400);
  }

  if (!item.productId) {
    throw new ExchangeError("Order item is missing product information", 400);
  }

  return { item, idx };
}

function validateExchangePayload({ exchangeType, reason, newProductId }) {
  const type = String(exchangeType || "OTHER").toUpperCase();

  if (!EXCHANGE_TYPES.includes(type)) {
    throw new ExchangeError("Invalid exchange type", 400);
  }

  if (!reason || !String(reason).trim()) {
    throw new ExchangeError("Exchange reason is required", 400);
  }

  if (String(reason).trim().length > 500) {
    throw new ExchangeError("Exchange reason is too long (max 500 characters)", 400);
  }

  if (!newProductId || !isValidObjectId(newProductId)) {
    throw new ExchangeError("Please select a valid product to exchange with", 400);
  }

  return type;
}

async function resolveNewItem(orderItem, { newProductId, newColor, newSize, newVariantId }) {
  const { product, variant, availableStock } = await resolveExchangeVariant(Product, {
    newProductId,
    newColor,
    newSize,
    newVariantId,
  });

  const quantity = orderItem.quantity || 1;

  if (availableStock < quantity) {
    throw new ExchangeError("Selected product variant is out of stock", 400);
  }

  if (isSameVariant(orderItem, newProductId, variant)) {
    throw new ExchangeError("Please choose a different product or variant", 400);
  }

  const pricing = calculateExchangePricing(orderItem, product, variant);

  return { product, variant, pricing, quantity };
}

function plainOrderItem(item) {
  if (!item) return null;
  return item.toObject ? item.toObject() : { ...item };
}

function applyNewItemToOrderLine(order, exchange, product, variant) {
  const idx = exchange.itemIndex || 0;
  const oldItem = order.items[idx];
  if (!oldItem) {
    throw new ExchangeError("Order item not found for exchange", 400);
  }

  const old = plainOrderItem(oldItem);
  const qty = exchange.newItem.quantity || old.quantity || 1;
  const newUnitPrice = Number(exchange.newItem.unitPrice) || 0;
  const newLineTotal =
    Number(exchange.newItem.lineTotal) || round2(newUnitPrice * qty);
  const mrp = Number(variant?.price || product?.price || newUnitPrice) || newUnitPrice;

  order.items[idx] = {
    ...old,
    productId: exchange.newItem.productId,
    variantId: exchange.newItem.variantId,
    name: exchange.newItem.name,
    image: exchange.newItem.image || old.image,
    color: exchange.newItem.color,
    size: exchange.newItem.size,
    sku: exchange.newItem.sku || old.sku,
    quantity: qty,
    price: mrp,
    finalPrice: newUnitPrice,
    discountAmount: round2(Math.max(0, mrp - newUnitPrice)),
    discountPercent:
      mrp > 0 ? Math.round(((mrp - newUnitPrice) / mrp) * 100) : 0,
    lineTotal: newLineTotal,
  };

  recalculateOrderAmounts(order, exchange);
  return order;
}

function restoreOriginalOrderLine(order, exchange) {
  const idx = exchange.itemIndex || 0;
  const currentItem = order.items[idx];
  const orig = exchange.originalItem;

  if (!currentItem || !orig) return order;

  const old = plainOrderItem(currentItem);
  const qty = orig.quantity || old.quantity || 1;
  const unitPrice = Number(orig.unitPrice) || 0;

  order.items[idx] = {
    ...old,
    productId: orig.productId,
    variantId: orig.variantId,
    name: orig.name,
    image: orig.image || old.image,
    color: orig.color,
    size: orig.size,
    sku: orig.sku || old.sku,
    quantity: qty,
    price: unitPrice,
    finalPrice: unitPrice,
    discountAmount: 0,
    discountPercent: 0,
    lineTotal: Number(orig.lineTotal) || round2(unitPrice * qty),
  };

  recalculateOrderAmounts(order);
  return order;
}

function recalculateOrderAmounts(order, exchange = null) {
  const newSubtotal = order.items.reduce(
    (sum, item) => sum + (Number(item.lineTotal) || 0),
    0,
  );

  order.subtotal = round2(newSubtotal);

  let newTotal = round2(
    order.subtotal +
      (Number(order.shippingCharge) || 0) +
      (Number(order.taxAmount) || 0) -
      (Number(order.discount) || 0),
  );

  if (
    exchange?.pricing?.paymentRequired &&
    exchange?.payment?.status === "PAID"
  ) {
    newTotal = round2(
      newTotal + (Number(exchange.pricing.extraAmountToPay) || 0),
    );
  }

  order.totalAmount = newTotal;
  return order;
}

function buildPreviewResponse(orderItem, product, variant, pricing) {
  return {
    originalItem: {
      productId: orderItem.productId,
      variantId: orderItem.variantId,
      name: orderItem.name,
      color: orderItem.color,
      size: orderItem.size,
      quantity: pricing.quantity,
      unitPrice: pricing.originalUnitPrice,
      lineTotal: pricing.originalLineTotal,
      image: orderItem.image,
    },
    newItem: {
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      color: variant.color,
      size: variant.size,
      quantity: pricing.quantity,
      unitPrice: pricing.newUnitPrice,
      lineTotal: pricing.newLineTotal,
      image: getProductImage(product, variant.color),
    },
    pricing: {
      priceDifference: pricing.priceDifference,
      extraAmountToPay: pricing.extraAmountToPay,
      savingsAmount: pricing.savingsAmount,
      paymentRequired: pricing.paymentRequired,
      message: buildPricingMessage(pricing),
    },
  };
}

async function previewExchange(userId, userRole, payload) {
  const { orderId, itemIndex = 0, newProductId, newColor, newSize, newVariantId } =
    payload;

  const { order } = await loadOrderForExchange(orderId, userId, userRole);
  await validateOrderExchangeEligibility(order);
  const { item } = getOrderItem(order, itemIndex);
  validateExchangePayload({ exchangeType: payload.exchangeType || "OTHER", reason: "preview", newProductId });

  const { product, variant, pricing } = await resolveNewItem(item, {
    newProductId,
    newColor,
    newSize,
    newVariantId,
  });

  return buildPreviewResponse(item, product, variant, pricing);
}

async function createExchangeRequest(userId, userRole, payload) {
  const {
    orderId,
    reason,
    exchangeType,
    itemIndex = 0,
    newProductId,
    newColor,
    newSize,
    newVariantId,
    extraPaymentMethod,
  } = payload;

  const type = validateExchangePayload({ exchangeType, reason, newProductId });
  const { order } = await loadOrderForExchange(orderId, userId, userRole);
  await validateOrderExchangeEligibility(order);
  const { item, idx } = getOrderItem(order, itemIndex);

  const { product, variant, pricing, quantity } = await resolveNewItem(item, {
    newProductId,
    newColor,
    newSize,
    newVariantId,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const selectedPaymentMethod = resolveExtraPaymentMethod(
      { extraPaymentMethod },
      order,
      pricing.paymentRequired,
    );
    const payOnline = selectedPaymentMethod === "RAZORPAY";
    const paymentStatus = pricing.paymentRequired ? "PENDING" : "NOT_REQUIRED";
    const exchangeStatus =
      pricing.paymentRequired && payOnline ? "PAYMENT_PENDING" : "REQUESTED";

    const exchange = new Exchange({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      itemIndex: idx,
      status: exchangeStatus,
      type,
      reason: String(reason).trim(),
      originalItem: {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        color: item.color,
        size: item.size,
        sku: item.sku,
        image: item.image,
        quantity,
        unitPrice: pricing.originalUnitPrice,
        lineTotal: pricing.originalLineTotal,
      },
      newItem: {
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        image: getProductImage(product, variant.color),
        quantity,
        unitPrice: pricing.newUnitPrice,
        lineTotal: pricing.newLineTotal,
      },
      pricing: {
        priceDifference: pricing.priceDifference,
        extraAmountToPay: pricing.extraAmountToPay,
        savingsAmount: pricing.savingsAmount,
        paymentRequired: pricing.paymentRequired,
      },
      payment: {
        status: paymentStatus,
        amount: pricing.extraAmountToPay,
        method: selectedPaymentMethod || order.paymentMethod,
      },
      statusHistory: [
        {
          status: exchangeStatus,
          note: `Exchange requested: ${reason}`,
          changedBy: userId,
        },
      ],
    });

    await exchange.save({ session });

    applyOrderStatusTransition(order, "EXCHANGE_REQUESTED", {
      changedBy: userId,
      reason: `Exchange ${exchange.exchangeNumber || "request"} submitted`,
    });
    order.activeExchangeId = exchange._id;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    const formatted = formatExchangeForClient(exchange);
    const paymentMessage = pricing.paymentRequired
      ? payOnline
        ? ` Pay ₹${pricing.extraAmountToPay} online to complete your exchange request.`
        : ` Pay ₹${pricing.extraAmountToPay} in cash when the exchanged item is delivered.`
      : pricing.savingsAmount > 0
        ? " No cash refund for the price difference — exchange only policy."
        : "";

    return {
      exchange: formatted,
      message: `Exchange request submitted successfully.${paymentMessage}`,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      throw new ExchangeError(
        "An active exchange request already exists for this order",
        400,
      );
    }

    throw error;
  }
}

async function getExchangeById(exchangeId, userId, userRole) {
  if (!isValidObjectId(exchangeId)) {
    throw new ExchangeError("Invalid exchange ID", 400);
  }

  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) {
    throw new ExchangeError("Exchange request not found", 404);
  }

  const isAdmin = userRole === ROLES.admin;
  if (!isAdmin && exchange.userId.toString() !== String(userId)) {
    throw new ExchangeError("You are not authorized to view this exchange", 403);
  }

  return formatExchangeForClient(exchange);
}

async function getUserExchanges(userId, { page = 1, limit = 10, status } = {}) {
  const query = { userId };
  if (status) query.status = String(status).toUpperCase();

  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

  const [exchanges, total] = await Promise.all([
    Exchange.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Exchange.countDocuments(query),
  ]);

  return {
    exchanges: exchanges.map(formatExchangeForClient),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

async function getAllExchangesAdmin({ page = 1, limit = 20, status, search } = {}) {
  const query = {};
  if (status) query.status = String(status).toUpperCase();

  if (search && String(search).trim()) {
    const term = String(search).trim();
    query.$or = [
      { exchangeNumber: { $regex: term, $options: "i" } },
      { orderNumber: { $regex: term, $options: "i" } },
    ];
  }

  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

  const [exchanges, total] = await Promise.all([
    Exchange.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email phone"),
    Exchange.countDocuments(query),
  ]);

  return {
    exchanges: exchanges.map(formatExchangeForClient),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

async function getActiveExchangeForOrder(orderId) {
  if (!isValidObjectId(orderId)) return null;
  const exchange = await Exchange.findActiveByOrderId(orderId);
  return formatExchangeForClient(exchange);
}

async function canOrderBeExchanged(order) {
  try {
    await validateOrderExchangeEligibility(order);
    return true;
  } catch {
    return false;
  }
}

async function cancelExchange(exchangeId, userId, userRole, reason = "") {
  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  const isAdmin = userRole === ROLES.admin;
  if (!isAdmin && exchange.userId.toString() !== String(userId)) {
    throw new ExchangeError("You are not authorized to cancel this exchange", 403);
  }

  if (!exchange.canUserCancel() && !isAdmin) {
    throw new ExchangeError(
      "This exchange can no longer be cancelled. Contact support.",
      400,
    );
  }

  if (["COMPLETED", "REJECTED", "CANCELLED"].includes(exchange.status)) {
    throw new ExchangeError(`Exchange is already ${exchange.status.toLowerCase()}`, 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    exchange.status = "CANCELLED";
    exchange.cancelledAt = new Date();
    exchange.cancellationReason = reason || (isAdmin ? "Cancelled by admin" : "Cancelled by customer");
    exchange.statusHistory.push({
      status: "CANCELLED",
      note: exchange.cancellationReason,
      changedBy: userId,
    });
    await exchange.save({ session });

    const order = await Order.findById(exchange.orderId).session(session);
    if (order && order.status === "EXCHANGE_REQUESTED") {
      applyOrderStatusTransition(order, "DELIVERED", {
        changedBy: userId,
        reason: "Exchange request cancelled",
      });
      order.activeExchangeId = null;
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return formatExchangeForClient(exchange);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function approveExchange(exchangeId, adminId, adminNotes = "") {
  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  if (!["REQUESTED", "PAYMENT_PENDING"].includes(exchange.status)) {
    throw new ExchangeError(`Cannot approve exchange in ${exchange.status} status`, 400);
  }

  if (exchange.pricing?.paymentRequired && exchange.payment?.status !== "PAID") {
    const isCod = exchange.payment?.method === "COD";
    if (!isCod && exchange.payment?.status === "PENDING") {
      throw new ExchangeError(
        "Extra payment is pending. Mark payment as received before approval.",
        400,
      );
    }
  }

  const { product, variant, availableStock } = await resolveExchangeVariant(Product, {
    newProductId: exchange.newItem.productId,
    newVariantId: exchange.newItem.variantId,
    newColor: exchange.newItem.color,
    newSize: exchange.newItem.size,
  });

  if (availableStock < (exchange.newItem.quantity || 1)) {
    throw new ExchangeError("New product variant is now out of stock", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(exchange.orderId).session(session);
    if (!order) throw new ExchangeError("Order not found", 404);

    applyNewItemToOrderLine(order, exchange, product, variant);

    applyOrderStatusTransition(order, "EXCHANGE_APPROVED", {
      changedBy: adminId,
      reason: `Exchange ${exchange.exchangeNumber || exchange._id} approved — order item updated`,
    });

    exchange.status = "APPROVED";
    exchange.approvedAt = new Date();
    exchange.processedBy = adminId;
    exchange.adminNotes = adminNotes || exchange.adminNotes;
    exchange.statusHistory.push({
      status: "APPROVED",
      note: adminNotes || "Exchange approved — order updated with new item",
      changedBy: adminId,
    });

    await exchange.save({ session });
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return formatExchangeForClient(exchange);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function rejectExchange(exchangeId, adminId, rejectionReason) {
  if (!rejectionReason || !String(rejectionReason).trim()) {
    throw new ExchangeError("Rejection reason is required", 400);
  }

  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  if (["COMPLETED", "REJECTED", "CANCELLED"].includes(exchange.status)) {
    throw new ExchangeError(`Exchange is already ${exchange.status.toLowerCase()}`, 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    exchange.status = "REJECTED";
    exchange.rejectedAt = new Date();
    exchange.rejectionReason = String(rejectionReason).trim();
    exchange.processedBy = adminId;
    exchange.statusHistory.push({
      status: "REJECTED",
      note: exchange.rejectionReason,
      changedBy: adminId,
    });
    await exchange.save({ session });

    const order = await Order.findById(exchange.orderId).session(session);
    if (order && ["EXCHANGE_REQUESTED", "EXCHANGE_APPROVED"].includes(order.status)) {
      if (order.status === "EXCHANGE_APPROVED") {
        restoreOriginalOrderLine(order, exchange);
      }
      applyOrderStatusTransition(order, "DELIVERED", {
        changedBy: adminId,
        reason: `Exchange rejected: ${rejectionReason}`,
      });
      order.activeExchangeId = null;
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return formatExchangeForClient(exchange);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function completeExchange(exchangeId, adminId, adminNotes = "") {
  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  if (exchange.status !== "APPROVED") {
    throw new ExchangeError("Only approved exchanges can be completed", 400);
  }

  const orderForComplete = await Order.findById(exchange.orderId);
  if (
    orderForComplete &&
    orderForComplete.status !== "EXCHANGE_APPROVED" &&
    orderForComplete.status !== "EXCHANGE_REQUESTED"
  ) {
    throw new ExchangeError(
      "Order is not in a valid state to complete this exchange",
      400,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(exchange.newItem.productId).session(session);
    if (!product) throw new ExchangeError("New product no longer exists", 400);

    const variant = product.variants.id(exchange.newItem.variantId);
    if (!variant) throw new ExchangeError("New variant no longer exists", 400);

    const qty = exchange.newItem.quantity || 1;
    const availableStock = (variant.stock || 0) - (variant.reservedStock || 0);
    if (availableStock < qty) {
      throw new ExchangeError("New product variant is out of stock", 400);
    }

    const reserved = product.reserveVariantStock(variant._id, qty);
    if (!reserved) {
      throw new ExchangeError("Failed to reserve stock for exchange item", 400);
    }
    await product.save({ session });

    exchange.status = "COMPLETED";
    exchange.completedAt = new Date();
    exchange.processedBy = adminId;
    if (adminNotes) exchange.adminNotes = adminNotes;
    exchange.statusHistory.push({
      status: "COMPLETED",
      note: adminNotes || "Exchange completed",
      changedBy: adminId,
    });
    await exchange.save({ session });

    const order = await Order.findById(exchange.orderId).session(session);
    if (order) {
      applyOrderStatusTransition(order, "EXCHANGED", {
        changedBy: adminId,
        reason: `Exchange ${exchange.exchangeNumber} completed`,
      });
      order.activeExchangeId = null;
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return formatExchangeForClient(exchange);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function loadExchangeForPayment(exchangeId, userId, userRole) {
  if (!isValidObjectId(exchangeId)) {
    throw new ExchangeError("Invalid exchange ID", 400);
  }

  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  const isAdmin = userRole === ROLES.admin;
  if (!isAdmin && exchange.userId.toString() !== String(userId)) {
    throw new ExchangeError("You are not authorized to pay for this exchange", 403);
  }

  return exchange;
}

async function createExchangePaymentOrder(exchangeId, userId, userRole) {
  const exchange = await loadExchangeForPayment(exchangeId, userId, userRole);

  if (!exchange.pricing?.paymentRequired) {
    throw new ExchangeError("No extra payment required for this exchange", 400);
  }

  if (exchange.payment?.status === "PAID") {
    throw new ExchangeError("Extra payment already completed", 400);
  }

  if (exchange.payment?.method === "COD") {
    throw new ExchangeError(
      "This exchange uses cash on delivery. Pay the delivery agent when your item arrives.",
      400,
    );
  }

  if (!["PAYMENT_PENDING", "REQUESTED"].includes(exchange.status)) {
    throw new ExchangeError(
      `Cannot pay for exchange in ${exchange.status} status`,
      400,
    );
  }

  const amountInPaise = Math.round(Number(exchange.pricing.extraAmountToPay) * 100);
  if (amountInPaise <= 0) {
    throw new ExchangeError("Invalid payment amount", 400);
  }

  const receiptBase = String(exchange.exchangeNumber || exchange._id)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 32);
  const rpOrder = await getRazorpayClient().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `exc_${receiptBase}`.slice(0, 40),
    notes: {
      type: "EXCHANGE_EXTRA",
      exchangeId: String(exchange._id),
      orderId: String(exchange.orderId),
      userId: String(exchange.userId),
    },
  });

  exchange.payment.razorpayOrderId = rpOrder.id;
  exchange.payment.amount = exchange.pricing.extraAmountToPay;
  await exchange.save();

  return {
    exchangeId: exchange._id,
    razorpayOrderId: rpOrder.id,
    amount: rpOrder.amount,
    currency: rpOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
    extraAmountToPay: exchange.pricing.extraAmountToPay,
  };
}

async function verifyExchangePaymentOrder(exchangeId, userId, userRole, paymentDetails = {}) {
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = paymentDetails;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ExchangeError("Incomplete payment verification data", 400);
  }

  const exchange = await loadExchangeForPayment(exchangeId, userId, userRole);

  if (exchange.payment?.razorpayOrderId !== razorpayOrderId) {
    throw new ExchangeError("Payment order does not match this exchange", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ExchangeError("Payment verification failed", 400);
  }

  const rpOrder = await getRazorpayClient().orders.fetch(razorpayOrderId);
  const expectedPaise = Math.round(Number(exchange.pricing.extraAmountToPay) * 100);

  if (Number(rpOrder.amount) !== expectedPaise) {
    throw new ExchangeError("Paid amount does not match exchange difference", 400);
  }

  return markExchangePaymentPaid(exchangeId, userId, {
    paymentId: razorpayPaymentId,
    razorpayOrderId,
    paidBy: "USER",
  });
}

async function markExchangePaymentPaid(exchangeId, adminId, paymentDetails = {}) {
  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  if (!exchange.pricing?.paymentRequired) {
    throw new ExchangeError("No extra payment required for this exchange", 400);
  }

  if (exchange.payment?.status === "PAID") {
    throw new ExchangeError("Payment already marked as paid", 400);
  }

  exchange.payment.status = "PAID";
  exchange.payment.paidAt = new Date();
  if (paymentDetails.paymentId) exchange.payment.paymentId = paymentDetails.paymentId;
  if (paymentDetails.razorpayOrderId) {
    exchange.payment.razorpayOrderId = paymentDetails.razorpayOrderId;
  }

  if (exchange.status === "PAYMENT_PENDING") {
    exchange.status = "REQUESTED";
    exchange.statusHistory.push({
      status: "REQUESTED",
      note: "Extra payment received",
      changedBy: adminId,
    });
  }

  exchange.statusHistory.push({
    status: "PAYMENT_PAID",
    note: `Payment of ₹${exchange.payment.amount} received${
      paymentDetails.paidBy === "USER" ? " (online)" : ""
    }`,
    changedBy: adminId,
  });

  await exchange.save();
  return formatExchangeForClient(exchange);
}

async function updateExchangeStatus(exchangeId, adminId, newStatus, note = "") {
  const allowed = ["PICKUP_SCHEDULED", "IN_TRANSIT"];
  const status = String(newStatus).toUpperCase();

  if (!allowed.includes(status)) {
    throw new ExchangeError(`Invalid status update: ${status}`, 400);
  }

  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) throw new ExchangeError("Exchange request not found", 404);

  if (!["APPROVED", "PICKUP_SCHEDULED", "IN_TRANSIT"].includes(exchange.status)) {
    throw new ExchangeError(
      "Status can only be updated for approved/in-progress exchanges",
      400,
    );
  }

  exchange.status = status;
  exchange.statusHistory.push({
    status,
    note: note || `Status updated to ${status}`,
    changedBy: adminId,
  });
  await exchange.save();

  return formatExchangeForClient(exchange);
}

module.exports = {
  ExchangeError,
  formatExchangeForClient,
  previewExchange,
  createExchangeRequest,
  getExchangeById,
  getUserExchanges,
  getAllExchangesAdmin,
  getActiveExchangeForOrder,
  canOrderBeExchanged,
  cancelExchange,
  approveExchange,
  rejectExchange,
  completeExchange,
  markExchangePaymentPaid,
  createExchangePaymentOrder,
  verifyExchangePaymentOrder,
  updateExchangeStatus,
};
