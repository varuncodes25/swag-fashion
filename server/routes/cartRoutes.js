// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const verifyToken = require("../middlewares/verifyToken");
const decryptRequest = require("../utils/decryptResponse");
const { buildLimiter, toNumber } = require("../utils/rateLimitConfig");

const cartReadLimiter = buildLimiter({
  envPrefix: "CART_READ",
  windowMs: toNumber(process.env.CART_READ_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.CART_READ_LIMIT_MAX, 120),
  message: { message: "Too many cart requests. Please retry shortly." },
});

const cartMutationLimiter = buildLimiter({
  envPrefix: "CART_MUTATION",
  windowMs: toNumber(process.env.CART_MUTATION_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.CART_MUTATION_LIMIT_MAX, 40),
  message: { message: "Too many cart updates. Please retry shortly." },
});

// ========== PUBLIC ROUTES (No authentication needed) ==========
// GET /api/cart/count - Cart items count (public for header)
router.get("/count", cartController.getCartCount);

// ========== PROTECTED ROUTES (Login required) ==========

// ✅ CART OPERATIONS
// GET /api/cart - Get user's cart
router.get("/cart", cartReadLimiter, verifyToken, cartController.getCart);

// POST /api/cart - Add item to cart
router.post(
  "/cart",
  cartMutationLimiter,
  verifyToken,
  decryptRequest,
  cartController.addToCart
);

// DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", cartMutationLimiter, verifyToken, cartController.clearCart);

// GET /api/cart/check-stock - Check stock before checkout
router.get("/check-stock", cartReadLimiter, verifyToken, cartController.checkStock);

// ========== CART ITEM OPERATIONS ==========

// PUT /api/cart/item/:itemId/increase - Increase quantity by 1
router.put(
  "/cart/increase/:itemId",
  cartMutationLimiter,
  verifyToken,
  decryptRequest,
  cartController.increaseQuantity
);

// PUT /api/cart/item/:itemId/decrease - Decrease quantity by 1
router.put(
  "/cart/decrease/:itemId",
  cartMutationLimiter,
  verifyToken,
  cartController.decreaseQuantity
);

// PUT /api/cart/item/:itemId - Update quantity to specific number
router.put("/item/:itemId", cartMutationLimiter, verifyToken, cartController.updateQuantity);

// DELETE /api/cart/item/:itemId - Remove item from cart
router.delete(
  "/cart/remove/:itemId",
  cartMutationLimiter,
  verifyToken,
  cartController.removeItem
);

module.exports = router;