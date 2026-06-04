const { CareerEncrypt } = require("../utils/crypto");
const ApiResponse = require("../utils/handlar/ApiResponse");

const isDisabled = () => process.env.DISABLE_ENCRYPT_RESPONSE === "true";

/** Skip paths that must stay plain JSON for external providers */
const SKIP_PATH_PREFIXES = [
  // Razorpay/Shiprocket send webhooks to us; our ACK body can stay encrypted (they only check HTTP status).
];

function shouldSkipRequest(req) {
  if (isDisabled()) return true;
  const path = (req.originalUrl || req.url || "").split("?")[0];
  return SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isAlreadyEncrypted(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const keys = Object.keys(body);
  return (
    keys.length === 1 &&
    keys[0] === "data" &&
    typeof body.data === "string" &&
    body.data.length > 40
  );
}

function toApiPayload(body, statusCode) {
  const isApiResponse =
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    "statusCode" in body &&
    "data" in body &&
    "message" in body;

  if (isApiResponse) return body;

  const message =
    (body && typeof body === "object" && body.message) || "Success";
  return new ApiResponse(statusCode || 200, body, message);
}

/**
 * Encrypt every res.json() under /api (categories, products, cart, etc.).
 * Controllers that already call encryptResponse() return { data: cipher } — we skip those.
 */
function encryptResponseMiddleware(req, res, next) {
  if (shouldSkipRequest(req)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function encryptJsonBody(body) {
    if (isAlreadyEncrypted(body)) {
      return originalJson(body);
    }

    const statusCode = res.statusCode || 200;

    CareerEncrypt(toApiPayload(body, statusCode))
      .then((encrypted) => {
        res.setHeader("X-Response-Encrypted", "true");
        originalJson({ data: encrypted });
      })
      .catch((err) => {
        console.error("Response encryption failed:", err.message);
        try {
          originalJson(body);
        } catch (fallbackErr) {
          console.error(
            "Unencrypted fallback failed:",
            fallbackErr.message,
          );
          originalJson({
            success: false,
            message: "Response serialization failed",
          });
        }
      });

    return res;
  };

  next();
}

module.exports = encryptResponseMiddleware;
