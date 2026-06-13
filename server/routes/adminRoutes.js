const { adminSignup, adminLogin, adminRefreshToken, adminLogout } = require("../controllers/adminController");
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

router.post("/admin-signup", adminAuthLimiter, adminSignup);

router.post("/admin-login", adminAuthLimiter, decryptRequest, adminLogin);
router.post("/admin/refresh-token", adminAuthLimiter, decryptRequest, adminRefreshToken);
router.post("/admin/logout", adminAuthLimiter, verifyToken, adminLogout);

module.exports = router;
