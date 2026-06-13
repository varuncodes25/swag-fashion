const { CareerEncrypt } = require("../utils/crypto");
const ApiResponse = require("../utils/handlar/ApiResponse");

const isDisabled = () => process.env.DISABLE_ENCRYPT_RESPONSE === "true";

/** External webhooks only need HTTP status — body can stay encrypted. */
const SKIP_PATH_PREFIXES = [];

function shouldSkipRequest(req) {
  if (isDisabled()) return true;
  const path = (req.originalUrl || req.url || "").split("?")[0];
  if (!path.startsWith("/api")) return true;
  return SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** Controller already called encryptResponse() → { data: cipher } */
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

async function sendEncryptedJson(originalJson, res, body) {
  const statusCode = res.statusCode || 200;

  try {
    const encrypted = await CareerEncrypt(toApiPayload(body, statusCode));
    res.setHeader("X-Response-Encrypted", "true");
    return originalJson({ data: encrypted });
  } catch (err) {
    console.error("Response encryption failed:", err.message);
    try {
      const fallback = new ApiResponse(
        statusCode >= 400 ? statusCode : 500,
        null,
        "Response encryption failed",
      );
      const encrypted = await CareerEncrypt(fallback);
      res.setHeader("X-Response-Encrypted", "true");
      return originalJson({ data: encrypted });
    } catch (fallbackErr) {
      console.error("Encrypted fallback failed:", fallbackErr.message);
      return originalJson({
        data: "",
      });
    }
  }
}

/**
 * Encrypt every res.json() under /api.
 * Pre-encrypted { data: cipher } from controllers is passed through unchanged.
 */
function encryptResponseMiddleware(req, res, next) {
  if (shouldSkipRequest(req)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function encryptJsonBody(body) {
    if (isAlreadyEncrypted(body)) {
      res.setHeader("X-Response-Encrypted", "true");
      return originalJson(body);
    }

    return sendEncryptedJson(originalJson, res, body);
  };

  next();
}

module.exports = encryptResponseMiddleware;
