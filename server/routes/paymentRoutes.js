const router = require("express").Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");
const decryptRequest = require("../utils/decryptResponse");
const { buildLimiter, toNumber } = require("../utils/rateLimitConfig");

const paymentLimiter = buildLimiter({
  envPrefix: "PAYMENT",
  windowMs: toNumber(process.env.PAYMENT_LIMIT_WINDOW_MS, 5 * 60 * 1000),
  max: toNumber(process.env.PAYMENT_LIMIT_MAX, 20),
  message: { message: "Too many payment requests. Try again later." },
});

const verifyPaymentLimiter = buildLimiter({
  envPrefix: "PAYMENT_VERIFY",
  windowMs: toNumber(process.env.PAYMENT_VERIFY_LIMIT_WINDOW_MS, 5 * 60 * 1000),
  max: toNumber(process.env.PAYMENT_VERIFY_LIMIT_MAX, 10),
  message: { message: "Too many verify attempts. Try again shortly." },
});

// Routes with limiter applied
router.post(
  "/generate-payment",
  verifyToken,
  paymentLimiter,
  decryptRequest,
  createRazorpayOrder
);
router.post(
  "/verify-payment",
  verifyToken,
  verifyPaymentLimiter,
  decryptRequest,
  verifyRazorpayPayment
);

module.exports = router;
