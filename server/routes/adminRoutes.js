const { adminSignup, adminLogin } = require("../controllers/adminController");
const decryptRequest = require("../utils/decryptResponse");
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

module.exports = router;
