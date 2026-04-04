const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");
const decryptRequest = require("../utils/decryptResponse");

// 🔹 Payment-specific rate limiter
const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 20,
  message: { message: "Too many payment requests, try again later." },
});

// Routes with limiter applied
router.post("/generate-payment", verifyToken, paymentLimiter,decryptRequest, createRazorpayOrder);
router.post("/verify-payment", verifyToken, paymentLimiter,decryptRequest, verifyRazorpayPayment);

module.exports = router;
