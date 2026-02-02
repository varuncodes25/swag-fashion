// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ✅ 1. GET CART - User ka cart dikhao
exports.getCart = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    console.log("User ID in getCart:", userId);
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          totalDiscount: 0,
          message: "Your cart is empty"
        }
      });
    }
    
    const cartItems = [];
    let totalPrice = 0;
    let totalItems = 0;
    let totalDiscount = 0;
    
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        console.log(`Product not found: ${item.productId}`);
        continue;
      }
      
      const variant = product.variants.id(item.variantId);
      
      if (!variant) {
        console.log(`Variant not found: ${item.variantId}`);
        continue;
      }
      
      // ✅ Selected variant ki image lo
      let selectedImage = null;
      
      if (product.imagesByColor && product.imagesByColor.has(variant.color)) {
        const colorImages = product.imagesByColor.get(variant.color);
        selectedImage = colorImages.length > 0 ? colorImages[0] : null;
      }
      
      if (!selectedImage) {
        selectedImage = product.getMainImage();
      }
      
      const itemPrice = variant.sellingPrice || variant.price;
      const itemTotal = itemPrice * item.quantity;
      const itemDiscount = (variant.price - itemPrice) * item.quantity;
      
      cartItems.push({
        _id: item._id,
        productId: product._id,
        name: product.name,
        brand: product.brand,
        color: variant.color,
        size: variant.size,
        price: itemPrice,
        quantity: item.quantity,
        stock: variant.stock,
        image: selectedImage ? selectedImage.url : product.images[0]?.url,
        variantId: variant._id,
        addedAt: item.createdAt
      });
      
      totalPrice += itemTotal;
      totalItems += item.quantity;
      totalDiscount += itemDiscount;
    }
    
    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cartItems,
        summary: {
          totalItems,
          totalPrice,
          totalDiscount,
          itemsCount: cartItems.length,
          estimatedDelivery: "3-7 business days"
        },
        updatedAt: cart.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 2. ADD TO CART - Item cart me dalo
exports.addToCart = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.id to req.id (same)
    const { productId, variantId, quantity = 1 } = req.body;
    console.log("Add to cart - User ID:", userId, "Body:", req.body);
    
    if (!productId || !variantId) {
      return res.status(400).json({
        success: false,
        error: "Product and variant are required"
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1"
      });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        error: "Selected size/color not available"
      });
    }
    
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${variant.stock} items available`
      });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ 
        userId, 
        items: [] 
      });
    }
    
    const existingItemIndex = cart.items.findIndex(item => 
      item.variantId.toString() === variantId && 
      item.productId.toString() === productId
    );
    
    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (variant.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add more. Only ${variant.stock} items available`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      cart.items.push({
        productId,
        variantId,
        quantity
      });
    }
    
    await cart.save();
    
    // Fetch updated cart
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
    
    res.json({
      success: true,
      message: "Added to cart successfully",
      cart: {
        itemsCount: cart.items.length,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        items: cart.items
      }
    });
    
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 3. INCREASE QUANTITY (+1) - Increase button ke liye
exports.increaseQuantity = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }
    
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }
    
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    const variant = product.variants.id(cartItem.variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        error: "Variant not available"
      });
    }
    
    const newQuantity = cartItem.quantity + 1;
    
    if (variant.stock < newQuantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${variant.stock} items available`
      });
    }
    
    cartItem.quantity = newQuantity;
    cartItem.updatedAt = new Date();
    await cart.save();
    
    const itemPrice = variant.sellingPrice || variant.price;
    
    res.json({
      success: true,
      message: "Quantity increased",
      item: {
        _id: cartItem._id,
        quantity: cartItem.quantity,
        price: itemPrice,
        total: itemPrice * cartItem.quantity,
        stock: variant.stock
      },
      cart: {
        itemsCount: cart.items.length,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error("Increase quantity error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 4. DECREASE QUANTITY (-1) - Decrease button ke liye
exports.decreaseQuantity = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }
    
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }
    
    const newQuantity = cartItem.quantity - 1;
    
    // Agar quantity 0 ya negative ho jaye to item remove karo
    if (newQuantity <= 0) {
      cartItem.remove();
      await cart.save();
      
      return res.json({
        success: true,
        message: "Item removed from cart",
        removed: true,
        cart: {
          itemsCount: cart.items.length,
          totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        }
      });
    }
    
    // Quantity decrease karo
    cartItem.quantity = newQuantity;
    cartItem.updatedAt = new Date();
    await cart.save();
    
    const product = await Product.findById(cartItem.productId);
    const variant = product?.variants?.id(cartItem.variantId);
    const itemPrice = variant ? (variant.sellingPrice || variant.price) : 0;
    
    res.json({
      success: true,
      message: "Quantity decreased",
      item: {
        _id: cartItem._id,
        quantity: cartItem.quantity,
        price: itemPrice,
        total: itemPrice * cartItem.quantity,
        stock: variant?.stock || 0
      },
      cart: {
        itemsCount: cart.items.length,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error("Decrease quantity error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 5. UPDATE QUANTITY (Specific number) - Input box ke liye
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: "Valid quantity is required"
      });
    }
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }
    
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }
    
    if (quantity === 0) {
      cartItem.remove();
      await cart.save();
      
      return res.json({
        success: true,
        message: "Item removed from cart",
        cart: {
          itemsCount: cart.items.length,
          totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        }
      });
    }
    
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    const variant = product.variants.id(cartItem.variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        error: "Variant not available"
      });
    }
    
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${variant.stock} items available`
      });
    }
    
    cartItem.quantity = quantity;
    cartItem.updatedAt = new Date();
    await cart.save();
    
    const itemPrice = variant.sellingPrice || variant.price;
    
    res.json({
      success: true,
      message: "Quantity updated",
      item: {
        _id: cartItem._id,
        quantity: cartItem.quantity,
        price: itemPrice,
        total: itemPrice * cartItem.quantity,
        stock: variant.stock
      }
    });
    
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 6. REMOVE ITEM - Trash button ke liye
// controllers/cartController.js - Line ~477
exports.removeItem = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }
    
    // FIXED: Use filter() instead of remove()
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }
    
    // Remove item using splice
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.json({
      success: true,
      message: "Item removed from cart",
      cart: {
        itemsCount: cart.items.length,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 7. CLEAR CART - Saara cart khali karo
exports.clearCart = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        itemsCount: 0,
        totalItems: 0
      }
    });
    
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ✅ 8. GET CART COUNT (Header icon ke liye)
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.json({
        success: true,
        count: 0,
        totalItems: 0
      });
    }
    
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      count: cart.items.length,
      totalItems: totalItems
    });
    
  } catch (error) {
    console.error("Get cart count error:", error);
    res.json({
      success: true,
      count: 0,
      totalItems: 0
    });
  }
};

// ✅ 9. CHECK STOCK - Checkout se pehle stock verify karo
exports.checkStock = async (req, res) => {
  try {
    const userId = req.id; // Changed from req.user._id to req.id
    
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        inStock: true,
        items: []
      });
    }
    
    const stockStatus = [];
    let allInStock = true;
    
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        stockStatus.push({
          itemId: item._id,
          inStock: false,
          message: "Product not found",
          available: 0
        });
        allInStock = false;
        continue;
      }
      
      const variant = product.variants.id(item.variantId);
      
      if (!variant) {
        stockStatus.push({
          itemId: item._id,
          inStock: false,
          message: "Variant not available",
          available: 0
        });
        allInStock = false;
        continue;
      }
      
      const availableStock = variant.stock - (variant.reservedStock || 0);
      
      if (availableStock < item.quantity) {
        stockStatus.push({
          itemId: item._id,
          inStock: false,
          message: `Only ${availableStock} items available`,
          available: availableStock,
          requested: item.quantity
        });
        allInStock = false;
      } else {
        stockStatus.push({
          itemId: item._id,
          inStock: true,
          message: "In stock",
          available: availableStock
        });
      }
    }
    
    res.json({
      success: true,
      inStock: allInStock,
      items: stockStatus
    });
    
  } catch (error) {
    console.error("Check stock error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};