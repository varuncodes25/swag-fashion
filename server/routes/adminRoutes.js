const { adminSignup, adminLogin, adminRefreshToken, adminLogout } = require("../controllers/adminController");
const {
  getAdminExchanges,
  approveExchangeRequest,
  rejectExchangeRequest,
  completeExchangeRequest,
  markExchangePaid,
  updateExchangeProgress,
} = require("../controllers/exchangeController");
const decryptRequest = require("../utils/decryptResponse");
const verifyToken = require("../middlewares/verifyToken");
const { buildLimiter, toNumber } = require("../utils/rateLimitConfig");

const router = require("express").Router();

const adminAuthLimiter = buildLimiter({
  envPrefix: "ADMIN_AUTH",
  windowMs: toNumber(process.env.ADMIN_AUTH_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toNumber(process.env.ADMIN_AUTH_LIMIT_MAX, 5),
  message: { message: "Too many admin auth attempts. Please wait 15 minutes." },
});

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

router.post("/admin-signup", adminAuthLimiter, adminSignup);

router.post("/admin-login", adminAuthLimiter, decryptRequest, adminLogin);
router.post("/admin/refresh-token", adminAuthLimiter, decryptRequest, adminRefreshToken);
router.post("/admin/logout", adminAuthLimiter, verifyToken, adminLogout);

// Admin exchange management (also registered in exchangeRoutes.js)
router.get("/admin/exchanges", exchangeReadLimiter, verifyToken, getAdminExchanges);

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

module.exports = router;
