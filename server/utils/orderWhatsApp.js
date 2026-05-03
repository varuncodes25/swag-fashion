/**
 * Admin order alerts on WhatsApp (optional).
 *
 * Option A — Meta WhatsApp Cloud API:
 *   WHATSAPP_CLOUD_API_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   ADMIN_WHATSAPP_NUMBER   (digits only, e.g. 919876543210)
 *
 * Option B — Twilio WhatsApp:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM    (e.g. whatsapp:+14155238886)
 *   ADMIN_WHATSAPP_TO       (e.g. whatsapp:+919876543210)
 *
 * Note: Meta often requires an approved *template* for first contact; plain `text`
 * works in the 24h session or sandbox. If API returns an error, check Meta Business docs.
 */

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

function buildOrderText(plain, headline) {
  const addr = plain.shippingAddress || {};
  const itemLines = (plain.items || []).map(
    (it) => `• ${it.name} x${it.quantity} → ${formatMoney(lineAmount(it))}`,
  );
  return [
    `*Swag Fashion*`,
    headline,
    "",
    `Order: *${plain.orderNumber}*`,
    `Total: *${formatMoney(plain.totalAmount)}*`,
    `Pay: ${plain.paymentMethod} (${plain.paymentStatus})`,
    `Status: ${plain.status}`,
    "",
    `Customer: ${addr.name || "—"}`,
    `Phone: ${addr.phone || "—"}`,
    `Email: ${addr.email || "—"}`,
    `${addr.addressLine1 || ""} ${addr.city || ""} ${addr.pincode || ""}`.trim(),
    "",
    ...itemLines,
  ]
    .join("\n")
    .slice(0, 4000);
}

function metaConfigured() {
  return Boolean(
    process.env.WHATSAPP_CLOUD_API_TOKEN?.trim() &&
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() &&
      process.env.ADMIN_WHATSAPP_NUMBER?.trim(),
  );
}

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_WHATSAPP_FROM?.trim() &&
      process.env.ADMIN_WHATSAPP_TO?.trim(),
  );
}

function isConfigured() {
  return metaConfigured() || twilioConfigured();
}

async function sendMetaCloud(toDigits, body) {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID.trim();
  const to = String(toDigits).replace(/\D/g, "");
  if (to.length < 10) {
    console.warn("[whatsapp] ADMIN_WHATSAPP_NUMBER invalid");
    return false;
  }
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[whatsapp] Meta API:", res.status, JSON.stringify(data));
    return false;
  }
  return true;
}

async function sendTwilio(body) {
  const sid = process.env.TWILIO_ACCOUNT_SID.trim();
  const token = process.env.TWILIO_AUTH_TOKEN.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM.trim();
  const to = process.env.ADMIN_WHATSAPP_TO.trim();
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({
    From: from,
    To: to,
    Body: body.slice(0, 1600),
  });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error("[whatsapp] Twilio:", res.status, text);
    return false;
  }
  return true;
}

/**
 * Send admin a WhatsApp text about an order. No-op if not configured. Never throws.
 */
async function notifyAdminOrderWhatsApp(orderDocOrPlain, headline) {
  try {
    if (!isConfigured()) return;

    const plain = orderDocOrPlain.toObject
      ? orderDocOrPlain.toObject()
      : orderDocOrPlain;
    const body = buildOrderText(plain, headline);

    if (metaConfigured()) {
      const ok = await sendMetaCloud(
        process.env.ADMIN_WHATSAPP_NUMBER.trim(),
        body,
      );
      if (ok) return;
    }
    if (twilioConfigured()) {
      await sendTwilio(body);
    }
  } catch (e) {
    console.error("[whatsapp] notifyAdminOrderWhatsApp:", e.message);
  }
}

module.exports = {
  notifyAdminOrderWhatsApp,
  whatsappOrderNotifyConfigured: isConfigured,
};
