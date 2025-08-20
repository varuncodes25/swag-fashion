const Razorpay = require("razorpay");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const crypto = require("crypto");

var {
  validatePaymentVerification,
} = require("razorpay/dist/utils/razorpay-utils");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RW5A57UKh8Dv3F",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YourKeySecretHereHgijUZmybpNNR67lBrY4OumS",

});
console.log("Razorpay instance created with key_id:", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
console.log("Razorpay key_secret is set");
const generatePayment = async (req, res) => {
  const userId = req.id;
  console.log("Generating payment for user:", userId);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const { amount } = req.body;
    console.log("Amount received for payment generation:", amount);
    const options = {
      amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      receipt: Math.random().toString(36).substring(2),
    };

    const user = await User.findById(userId);
    console.log("User found:", user ? user.name : "Not found");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    instance.orders.create(options, async (err, order) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...order,
          name: user.name,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const userId = req.id;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      productArray,
      address,
    } = req.body;

    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const validatedPayment = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!validatedPayment) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    for (const product of productArray) {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { purchasedProducts: product.id } }
      );

      await Product.findByIdAndUpdate(
        { _id: product.id },
        { $inc: { stock: -product.quantity } }
      );
    }

    // remove purchased items from cart
    const purchasedProductIds = productArray.map((p) => p.id);

    await Cart.updateOne(
      { user: userId },
      { $pull: { products: { product: { $in: purchasedProductIds } } } }
    );

    await Order.create({
      amount: amount / 100,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: signature,
      products: productArray,
      address: address,
      userId: userId,
    });

    return res.status(200).json({ success: true, message: "Payment Verified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generatePayment, verifyPayment };
