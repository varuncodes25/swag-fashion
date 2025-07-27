const router = require("express").Router();
const {
  generatePayment,
  verifyPayment,
} = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/generate-payment", verifyToken, generatePayment);
router.post("/verify-payment", verifyToken, verifyPayment);
module.exports = router;
