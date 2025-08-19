var express = require("express");
var router = express.Router();

var cartController = require("../controllers/cartController");

// Add product to cart
router.post("/add", cartController.addToCart);

// Get user's cart
router.get("/:userId", cartController.getCart);

// Remove product from cart
router.post("/remove", cartController.removeFromCart);

module.exports = router;
