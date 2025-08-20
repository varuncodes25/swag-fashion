var Cart = require("../models/Cart");
var Product = require("../models/Product");

// Add product to cart
exports.addToCart = async function(req, res) {
  console.log("Adding product to cart", req.body);
  try {
    var userId = req.body.userId;
    var productId = req.body.productId;
    var quantity = req.body.quantity;
    var color = req.body.color;
    var size = req.body.size;

    var cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity: quantity, color: color, size: size }],
      });
    } else {
      var existingProductIndex = cart.products.findIndex(function(p) {
        return p.product.toString() === productId && p.color === color && p.size === size;
      });

      if (existingProductIndex > -1) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity: quantity, color: color, size: size });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Product added to cart", cart: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's cart
exports.getCart = async function(req, res) {
  try {
    var userId = req.params.userId;
    var cart = await Cart.findOne({ user: userId }).populate("products.product");
    res.status(200).json({ success: true, cart: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product from cart

exports.removeFromCart = async function (req, res) {
  try {
    const { userId, cartItemId } = req.body; // cartItemId is the _id of the cart item
    console.log(req.body, "Remove cart item payload");

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    // Remove the exact cart item
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(p => p._id.toString() !== cartItemId);

    if (cart.products.length === initialLength) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    await cart.save();

    res.status(200).json({ success: true, message: "Product removed", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

