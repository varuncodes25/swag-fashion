const sendMail = require("./mailer");

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function formatMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return `₹${x.toFixed(2)}`;
}

function lineAmount(it) {
  if (it.lineTotal != null && Number.isFinite(Number(it.lineTotal))) {
    return Number(it.lineTotal);
  }
  const q = Number(it.quantity) || 1;
  const p = Number(it.finalPrice) || 0;
  return p * q;
}

function adminInbox() {
  return (
    process.env.ADMIN_RECEIVER?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    ""
  );
}

function customerOrderHtml(order, { codConfirmed = false } = {}) {
  const addr = order.shippingAddress || {};
  const rows = (order.items || [])
    .map(
      (it) =>
        `<tr><td>${escapeHtml(it.name)}</td><td>${escapeHtml(String(it.quantity))}</td><td>${formatMoney(lineAmount(it))}</td></tr>`,
    )
    .join("");

  const title = codConfirmed
    ? "Your COD order is confirmed"
    : "Thank you — order received";
  const sub = codConfirmed
    ? "<p>We have confirmed your order. You can pay on delivery when your package arrives.</p>"
    : "";

  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
    <h2 style="color:#111;">${escapeHtml(title)}</h2>
    ${sub}
    <p><strong>Order #:</strong> ${escapeHtml(order.orderNumber)}</p>
    <p><strong>Status:</strong> ${escapeHtml(order.status)} &nbsp;|&nbsp; <strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</p>
    <p><strong>Total:</strong> ${formatMoney(order.totalAmount)}</p>
    <h3>Items</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;"><thead><tr><th>Product</th><th>Qty</th><th>Line</th></tr></thead><tbody>${rows}</tbody></table>
    <h3>Shipping to</h3>
    <p>${escapeHtml(addr.name)}<br/>${escapeHtml(addr.phone)}<br/>${escapeHtml(addr.addressLine1 || "")} ${escapeHtml(addr.addressLine2 || "")}<br/>${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.pincode)}<br/>${escapeHtml(addr.country || "India")}</p>
    <p style="color:#666;font-size:14px;">Swag Fashion — we’ll update you when your order ships.</p>
  </div>`;
}

function adminNewOrderHtml(order) {
  const addr = order.shippingAddress || {};
  const rows = (order.items || [])
    .map(
      (it) =>
        `<tr><td>${escapeHtml(it.name)}</td><td>${escapeHtml(String(it.quantity))}</td><td>${formatMoney(lineAmount(it))}</td></tr>`,
    )
    .join("");

  return `
  <div style="font-family:system-ui,sans-serif;">
    <h2>New order</h2>
    <p><strong>Order #:</strong> ${escapeHtml(order.orderNumber)}</p>
    <p><strong>Order ID:</strong> ${escapeHtml(String(order._id))}</p>
    <p><strong>User ID:</strong> ${escapeHtml(String(order.userId))}</p>
    <p><strong>Status:</strong> ${escapeHtml(order.status)} | <strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</p>
    <p><strong>Total:</strong> ${formatMoney(order.totalAmount)}</p>
    <h3>Customer</h3>
    <p>${escapeHtml(addr.name)} — ${escapeHtml(addr.phone)} — ${escapeHtml(addr.email || "")}</p>
    <h3>Address</h3>
    <p>${escapeHtml(addr.addressLine1 || "")} ${escapeHtml(addr.addressLine2 || "")}<br/>${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.pincode)}</p>
    <h3>Items</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;"><thead><tr><th>Product</th><th>Qty</th><th>Line</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
}

/**
 * After order is committed: email customer + admin. Never throws (logs only).
 * @param {import("mongoose").Document} order — saved Order doc
 */
async function notifyOrderPlaced(order) {
  try {
    if (!sendMail.isConfigured?.()) {
      console.warn("orderNotificationEmails: mail not configured, skip");
      return;
    }

    const plain = order.toObject ? order.toObject() : order;
    const orderNumber = plain.orderNumber || String(plain._id);
    const customerEmail = (plain.shippingAddress?.email || "").trim();

    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      try {
        await sendMail(
          customerEmail,
          `Order confirmed — ${orderNumber}`,
          customerOrderHtml(plain),
        );
      } catch (e) {
        console.error("order customer mail failed:", e.message);
      }
    } else {
      console.warn(
        "orderNotificationEmails: no valid shippingAddress.email; customer mail skipped",
      );
    }

    const adminTo = adminInbox();
    if (adminTo) {
      try {
        await sendMail(
          adminTo,
          `[Swag Fashion] New order ${orderNumber}`,
          adminNewOrderHtml(plain),
        );
      } catch (e) {
        console.error("order admin mail failed:", e.message);
      }
    } else {
      console.warn(
        "orderNotificationEmails: ADMIN_RECEIVER / GMAIL_USER not set; admin alert skipped",
      );
    }
  } catch (e) {
    console.error("notifyOrderPlaced:", e.message);
  }
}

/** COD placed (PENDING): admin only — customer gets mail after admin confirms. */
async function notifyAdminCodPending(order) {
  try {
    if (!sendMail.isConfigured?.()) {
      console.warn("orderNotificationEmails: mail not configured, skip COD admin");
      return;
    }
    const adminTo = adminInbox();
    if (!adminTo) {
      console.warn(
        "orderNotificationEmails: ADMIN_RECEIVER / GMAIL_USER not set; COD admin alert skipped",
      );
      return;
    }
    const plain = order.toObject ? order.toObject() : order;
    const orderNumber = plain.orderNumber || String(plain._id);
    await sendMail(
      adminTo,
      `[Swag Fashion] COD pending — ${orderNumber}`,
      adminNewOrderHtml(plain),
    );
  } catch (e) {
    console.error("notifyAdminCodPending:", e.message);
  }
}

/** After admin sets COD order to CONFIRMED: customer + admin. */
async function notifyCodOrderConfirmed(order) {
  try {
    if (!sendMail.isConfigured?.()) {
      console.warn("orderNotificationEmails: mail not configured, skip COD confirm");
      return;
    }

    const plain = order.toObject ? order.toObject() : order;
    const orderNumber = plain.orderNumber || String(plain._id);
    const customerEmail = (plain.shippingAddress?.email || "").trim();

    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      try {
        await sendMail(
          customerEmail,
          `Order confirmed — ${orderNumber}`,
          customerOrderHtml(plain, { codConfirmed: true }),
        );
      } catch (e) {
        console.error("COD confirm customer mail failed:", e.message);
      }
    } else {
      console.warn(
        "orderNotificationEmails: no valid shippingAddress.email; COD confirm customer mail skipped",
      );
    }

    const adminTo = adminInbox();
    if (adminTo) {
      try {
        await sendMail(
          adminTo,
          `[Swag Fashion] COD confirmed — ${orderNumber}`,
          `<p>COD order <strong>${escapeHtml(orderNumber)}</strong> was marked <strong>CONFIRMED</strong>.</p><p>Total: ${formatMoney(plain.totalAmount)}</p>`,
        );
      } catch (e) {
        console.error("COD confirm admin mail failed:", e.message);
      }
    }
  } catch (e) {
    console.error("notifyCodOrderConfirmed:", e.message);
  }
}

module.exports = {
  notifyOrderPlaced,
  notifyAdminCodPending,
  notifyCodOrderConfirmed,
};
