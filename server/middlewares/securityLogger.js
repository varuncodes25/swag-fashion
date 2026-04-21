const crypto = require("crypto");
const { logger } = require("../utils/logger");

const SENSITIVE_PATHS = [
  "/api/login",
  "/api/signup",
  "/api/admin-login",
  "/api/verify-payment",
  "/api/generate-payment",
];

const normalizeIp = (value) => {
  if (!value || typeof value !== "string") return "unknown";
  const ip = value.replace("::ffff:", "");
  if (ip === "::1") return "127.0.0.1";
  return ip;
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded && typeof forwarded === "string") {
    return normalizeIp(forwarded.split(",")[0].trim());
  }
  const realIp = req.headers["x-real-ip"];
  if (realIp && typeof realIp === "string") {
    return normalizeIp(realIp.trim());
  }
  return normalizeIp(req.ip || req.socket?.remoteAddress || "unknown");
};

const securityLogger = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);

  const startedAt = Date.now();
  const ip = getClientIp(req);
  req.clientIp = ip;
  const ua = req.headers["user-agent"] || "unknown";
  const path = req.originalUrl || req.url;
  const method = req.method;

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const durationMs = Date.now() - startedAt;
    const isSensitive = SENSITIVE_PATHS.some((p) => path.includes(p));
    const isInteresting =
      statusCode >= 400 || isSensitive || path.includes("/api/admin");

    if (!isInteresting) return;

    logger.info("Security event", {
      type: "security_event",
      requestId: req.requestId,
      method,
      path,
      statusCode,
      durationMs,
      ip,
      ua,
      userId: req.user?._id || req.user?.id || req.id || null,
      hasAuthHeader: Boolean(req.headers.authorization),
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

module.exports = securityLogger;
