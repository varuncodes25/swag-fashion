// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const verifyToken = require("../middlewares/verifyToken");

// ========== PUBLIC ROUTES (No authentication needed) ==========
// GET /api/cart/count - Cart items count (public for header)
router.get("/count", cartController.getCartCount);

// ========== PROTECTED ROUTES (Login required) ==========

// ✅ CART OPERATIONS
// GET /api/cart - Get user's cart
router.get("/cart", verifyToken, cartController.getCart);

// POST /api/cart - Add item to cart
router.post("/cart", verifyToken, cartController.addToCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", verifyToken, cartController.clearCart);

// GET /api/cart/check-stock - Check stock before checkout
router.get("/check-stock", verifyToken, cartController.checkStock);

// ========== CART ITEM OPERATIONS ==========

// PUT /api/cart/item/:itemId/increase - Increase quantity by 1
router.put("/cart/increase/:itemId", verifyToken, cartController.increaseQuantity);

// PUT /api/cart/item/:itemId/decrease - Decrease quantity by 1
router.put("/cart/decrease/:itemId", verifyToken, cartController.decreaseQuantity);

// PUT /api/cart/item/:itemId - Update quantity to specific number
router.put("/item/:itemId", verifyToken, cartController.updateQuantity);

// DELETE /api/cart/item/:itemId - Remove item from cart
router.delete("/cart/remove/:itemId", verifyToken, cartController.removeItem);

module.exports = router;