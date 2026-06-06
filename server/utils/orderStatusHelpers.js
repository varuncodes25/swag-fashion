const VALID_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

/** Apply business order.status + timestamps + history in one place */
function applyOrderStatusTransition(order, newStatus, options = {}) {
  const status = String(newStatus || "").toUpperCase();
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  const prev = order.status;
  if (prev === status) return order;

  const now = new Date();
  order.status = status;

  if (status === "CONFIRMED" && !order.confirmedAt) order.confirmedAt = now;
  if (status === "PROCESSING" && !order.confirmedAt) order.confirmedAt = now;
  if (status === "SHIPPED" && !order.shippedAt) order.shippedAt = now;
  if (status === "DELIVERED" && !order.deliveredAt) order.deliveredAt = now;
  if (status === "CANCELLED") {
    order.cancelledAt = now;
    order.isCancelled = true;
  }

  if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
  order.statusHistory.push({
    status,
    changedBy: options.changedBy || null,
    changedAt: now,
    reason:
      options.reason ||
      `Status updated${prev ? ` from ${prev}` : ""} to ${status}`,
  });

  return order;
}

/** Shiprocket / webhook text → order.status */
function mapExternalShipmentToOrderStatus(externalStatus) {
  const key = String(externalStatus || "").trim().toLowerCase();
  const map = {
    delivered: "DELIVERED",
    shipped: "SHIPPED",
    "in transit": "SHIPPED",
    "in_transit": "SHIPPED",
    "out for delivery": "SHIPPED",
    picked_up: "SHIPPED",
    "picked up": "SHIPPED",
    packed: "PROCESSING",
    processing: "PROCESSING",
    created: "CONFIRMED",
    new: "CONFIRMED",
    confirmed: "CONFIRMED",
    cancelled: "CANCELLED",
    canceled: "CANCELLED",
    rto: "RETURNED",
    returned: "RETURNED",
    pending: "PENDING",
  };
  return map[key] || null;
}

/** Shiprocket courier status → order.shiprocket.status enum */
function mapExternalToShiprocketStatus(externalStatus) {
  const key = String(externalStatus || "").trim().toLowerCase();
  const map = {
    delivered: "DELIVERED",
    shipped: "IN_TRANSIT",
    "in transit": "IN_TRANSIT",
    "in_transit": "IN_TRANSIT",
    picked_up: "PICKED_UP",
    "picked up": "PICKED_UP",
    packed: "PROCESSING",
    processing: "PROCESSING",
    created: "NEW",
    new: "NEW",
    cancelled: "CANCELLED",
    canceled: "CANCELLED",
    rto: "RTO",
    pending: "PENDING",
  };
  return map[key] || null;
}

module.exports = {
  VALID_ORDER_STATUSES,
  applyOrderStatusTransition,
  mapExternalShipmentToOrderStatus,
  mapExternalToShiprocketStatus,
};
