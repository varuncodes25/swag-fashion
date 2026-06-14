const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const decryptRequest = require("../utils/decryptResponse");
const { buildLimiter, toNumber } = require("../utils/rateLimitConfig");
const {
  previewExchangeRequest,
  createExchange,
  getMyExchanges,
  getExchangeDetails,
  cancelExchangeRequest,
  getAdminExchanges,
  approveExchangeRequest,
  rejectExchangeRequest,
  completeExchangeRequest,
  markExchangePaid,
  updateExchangeProgress,
} = require("../controllers/exchangeController");

const exchangeReadLimiter = buildLimiter({
  envPrefix: "EXCHANGE_READ",
  windowMs: toNumber(process.env.EXCHANGE_READ_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.EXCHANGE_READ_LIMIT_MAX, 60),
  message: { success: false, message: "Too many exchange requests. Please retry shortly." },
});

const exchangeMutationLimiter = buildLimiter({
  envPrefix: "EXCHANGE_MUTATION",
  windowMs: toNumber(process.env.EXCHANGE_MUTATION_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.EXCHANGE_MUTATION_LIMIT_MAX, 20),
  message: { success: false, message: "Too many exchange updates. Please retry shortly." },
});

// ============ USER ROUTES ============
router.post(
  "/exchanges/preview",
  exchangeReadLimiter,
  verifyToken,
  decryptRequest,
  previewExchangeRequest,
);

router.post(
  "/exchanges",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  createExchange,
);

router.get("/exchanges/my", exchangeReadLimiter, verifyToken, getMyExchanges);
router.get("/exchanges/:id", exchangeReadLimiter, verifyToken, getExchangeDetails);

router.post(
  "/exchanges/:id/cancel",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  cancelExchangeRequest,
);

// ============ ADMIN ROUTES ============
router.get(
  "/admin/exchanges",
  exchangeReadLimiter,
  verifyToken,
  getAdminExchanges,
);

router.put(
  "/admin/exchanges/:id/approve",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  approveExchangeRequest,
);

router.put(
  "/admin/exchanges/:id/reject",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  rejectExchangeRequest,
);

router.put(
  "/admin/exchanges/:id/complete",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  completeExchangeRequest,
);

router.put(
  "/admin/exchanges/:id/mark-paid",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  markExchangePaid,
);

router.put(
  "/admin/exchanges/:id/status",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  updateExchangeProgress,
);

// ============ LEGACY ALIASES (backward compatible) ============
router.post(
  "/exchange-order/preview",
  exchangeReadLimiter,
  verifyToken,
  decryptRequest,
  previewExchangeRequest,
);

router.post(
  "/exchange-order",
  exchangeMutationLimiter,
  verifyToken,
  decryptRequest,
  createExchange,
);

module.exports = router;
