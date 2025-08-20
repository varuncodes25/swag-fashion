var express = require("express");
var router = express.Router();

var cartController = require("../controllers/cartController");

// Add product to cart
router.post("/add", cartController.addToCart);

// Get user's cart
router.get("/cart/:userId", cartController.getCart);

// // Clear all items from user's cart
// router.delete("/:userId/clear", cartController.clearCart);

module.exports = router;
