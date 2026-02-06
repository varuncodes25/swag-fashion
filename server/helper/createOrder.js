// helpers/orderCalculator.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { calculateShippingCharge } = require("../service/shiprocketService");

exports.calculateOrder = async (userId, { productId, variantId, quantity, color, size }, addressDoc) => {
  console.log("🧮 CALCULATE ORDER:", { productId, variantId, quantity, color, size });
  
  let items = [];
  let subtotal = 0;
  let discount = 0;
  let totalWeight = 0;
  let shippingInfo = null;

  // ✅ HELPER: Round to 2 decimals
  const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // ✅ PROCESS ITEM FUNCTION
  const processItem = (product, variant, qty, extra = {}) => {
    if (!product || !variant) {
      console.error("❌ Invalid product or variant in processItem");
      return;
    }

    // ✅ PRICE CALCULATION FIXED
    // Get prices from variant first, fallback to product
    const variantPrice = variant.price || 0;
    const productPrice = product.price || 0;
    const variantSellingPrice = variant.sellingPrice || 0;
    const productSellingPrice = product.sellingPrice || 0;
    
    // Use variant prices if available, otherwise product prices
    const price = variantPrice || productPrice || 0;
    const sellingPrice = variantSellingPrice || productSellingPrice || price || 0;
    
    console.log("💰 PRICE DEBUG:", {
      variantPrice,
      productPrice,
      variantSellingPrice,
      productSellingPrice,
      finalPrice: price,
      finalSellingPrice: sellingPrice
    });

    // Calculate discount
    const discountAmountPerUnit = Math.max(price - sellingPrice, 0);
    const discountPercent = price > 0 ? roundToTwo((discountAmountPerUnit / price) * 100) : 0;

    const itemQuantity = Number(qty) || 1;
    
    // Calculate totals
    const itemSubtotal = price * itemQuantity;
    const itemDiscount = discountAmountPerUnit * itemQuantity;
    const itemWeight = (product.productDimensions?.weight || 0.2) * itemQuantity;
    
    subtotal += itemSubtotal;
    discount += itemDiscount;
    totalWeight += itemWeight;

    // ✅ IMAGE FIX: Handle different image formats
    let imageUrl = "default.jpg";
    if (product.getMainImage && typeof product.getMainImage === 'function') {
      const mainImage = product.getMainImage();
      imageUrl = mainImage?.url || imageUrl;
    } else if (product.allImages && product.allImages.length > 0) {
      imageUrl = product.allImages[0]?.url || imageUrl;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0]?.url || imageUrl;
    } else if (product.image) {
      imageUrl = typeof product.image === 'string' ? product.image : product.image?.url || imageUrl;
    }

    items.push({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      brand: product.brand || "Generic",
      color: variant.color || color || "Default",
      size: variant.size || size || "M",
      sku: variant.sku || `SKU-${product._id}-${variant.color || 'default'}-${variant.size || 'M'}`,
      image: imageUrl,
      price: roundToTwo(price),
      sellingPrice: roundToTwo(sellingPrice),
      discountPercent,
      discountAmount: roundToTwo(discountAmountPerUnit),
      quantity: itemQuantity,
      lineTotal: roundToTwo(sellingPrice * itemQuantity),
      weight: product.productDimensions?.weight || 0.2,
      length: product.productDimensions?.length || 0,
      width: product.productDimensions?.width || 0,
      height: product.productDimensions?.height || 0,
      ...extra,
    });
  };

  // ============ BUY_NOW FLOW ============
  if (productId) {
    console.log("🛒 BUY_NOW flow for product:", productId);
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    if (product.blacklisted) {
      throw new Error("Product not available");
    }

    // Find variant
    let variant;
    if (variantId) {
      variant = product.variants.id(variantId);
      console.log("🔍 Searching variant by ID:", variantId, "Found:", !!variant);
    } else if (color && size) {
      variant = product.variants.find(v => 
        v.color === color && v.size === size
      );
      console.log("🔍 Searching variant by color/size:", { color, size, found: !!variant });
    } else {
      // Get first available variant
      variant = product.variants[0];
      if (variant) {
        color = variant.color;
        size = variant.size;
        console.log("🔍 Using first variant:", { color, size });
      }
    }

    if (!variant) {
      throw new Error("Variant not available. Please select color and size.");
    }

    // Stock check
    const availableStock = variant.stock || 0;
    const reservedStock = variant.reservedStock || 0;
    const netStock = availableStock - reservedStock;
    const qty = Number(quantity) || 1;
    
    console.log("📦 Stock check:", { 
      availableStock, 
      reservedStock, 
      netStock, 
      required: qty 
    });
    
    if (netStock < qty) {
      throw new Error(`${product.name} (${variant.color}-${variant.size}) out of stock. Available: ${netStock}`);
    }

    processItem(product, variant, qty);

  } else {
    // ============ CART FLOW ============
    console.log("🛒 CART flow for user:", userId);
    
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    if (!cart || cart.products.length === 0) {
      throw new Error("Cart is empty");
    }

    // Process each cart item
    for (const cartItem of cart.products) {
      const product = cartItem.product;
      if (!product) {
        console.warn("⚠️ Skipping invalid cart item - product not found");
        continue;
      }

      if (product.blacklisted) {
        throw new Error(`${product.name} is no longer available`);
      }

      // Find variant
      let variant;
      if (cartItem.variantId) {
        variant = product.variants.id(cartItem.variantId);
      } else if (cartItem.color && cartItem.size) {
        variant = product.variants.find(v => 
          v.color === cartItem.color && v.size === cartItem.size
        );
      } else {
        variant = product.variants[0];
      }

      if (!variant && product.variants?.length > 0) {
        throw new Error(`Invalid variant for ${product.name}. Please re-add to cart.`);
      }

      // Stock check for cart items
      if (variant) {
        const availableStock = variant.stock || 0;
        const reservedStock = variant.reservedStock || 0;
        const netStock = availableStock - reservedStock;
        
        if (netStock < cartItem.quantity) {
          throw new Error(`${product.name} (${variant.color}-${variant.size}) out of stock. Available: ${netStock}`);
        }
      } else {
        // For products without variants
        const availableStock = product.stock || 0;
        const reservedStock = product.reservedStock || 0;
        const netStock = availableStock - reservedStock;
        
        if (netStock < cartItem.quantity) {
          throw new Error(`${product.name} out of stock. Available: ${netStock}`);
        }
      }

      processItem(product, variant, cartItem.quantity, {
        color: cartItem.color,
        size: cartItem.size,
        variantId: cartItem.variantId,
      });
    }

    if (items.length === 0) {
      throw new Error("No valid items in cart");
    }
  }

  // ============ CALCULATE FINAL AMOUNTS ============
  const payable = Math.max(roundToTwo(subtotal - discount), 0);
  
  console.log("📊 Amounts calculated:", {
    subtotal: roundToTwo(subtotal),
    discount: roundToTwo(discount),
    payable,
    totalWeight
  });

  // ============ SHIPPING CALCULATION ============
  let shipping = 0;
  
  if (addressDoc?.pincode && totalWeight > 0) {
    try {
      shippingInfo = await calculateShippingCharge({
        deliveryPincode: addressDoc.pincode,
        totalWeight: roundToTwo(totalWeight),
      });
      shipping = shippingInfo.shippingCharge || 0;
      console.log("🚚 Shipping calculated:", shipping);
    } catch (err) {
      console.error("⚠️ Shipping calculation error:", err.message);
      // Fallback shipping logic
      shipping = payable > 500 ? 0 : 50;
      shippingInfo = { 
        shippingCharge: shipping, 
        estimatedDays: 5,
        note: "Standard shipping applied"
      };
    }
  } else {
    shipping = payable > 500 ? 0 : 50;
    shippingInfo = { 
      shippingCharge: shipping, 
      estimatedDays: 5,
      note: "Free shipping on orders above ₹500"
    };
    console.log("🚚 Default shipping applied:", shipping);
  }

  const total = roundToTwo(payable + shipping);

  // ============ FINAL RESULT ============
  const result = {
    items,
    summary: {
      subtotal: roundToTwo(subtotal),
      discount: roundToTwo(discount),
      payable: payable,
      shipping: shipping,
      total: total,
      totalWeight: roundToTwo(totalWeight),
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      shippingInfo
    },
    checkoutType: productId ? "BUY_NOW" : "CART",
  };

  console.log("✅ FINAL CALCULATION:", result.summary);
  return result;
};
// helpers/orderCalculator.js

exports.calculateOrderValidation = async (
  userId,
  { productId, variantId, quantity },
  shippingAddress
) => {

  let items = [];

  let mrpTotal = 0;
  let sellingSubtotal = 0;
  let totalWeight = 0;

  const round2 = (n) =>
    Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  /* ---------------- HELPERS ---------------- */

  const buildItem = (product, variant, qty) => {
    const mrp = variant?.price ?? product.price;
    const selling =
      variant?.sellingPrice ??
      product.sellingPrice ??
      mrp;

    if (!mrp || !selling)
      throw new Error(`Invalid pricing for ${product.name}`);

    const lineMrp = mrp * qty;
    const lineSelling = selling * qty;

    mrpTotal += lineMrp;
    sellingSubtotal += lineSelling;

    const unitWeight =
      product.productDimensions?.weight ??
      product.dimensions?.weight ??
      0.2;

    totalWeight += unitWeight * qty;

    items.push({
      productId: product._id,
      variantId: variant?._id || null,
      name: product.name,
      sku: variant?.sku || product.sku,
      price: round2(mrp),
      sellingPrice: round2(selling),
      quantity: qty,
      lineTotal: round2(lineSelling),
      weight: unitWeight,
      color: variant?.color || null,
      size: variant?.size || null,
      image:
        product.getMainImage?.()?.url ||
        product.images?.[0]?.url ||
        "default.jpg",
    });
  };

  /* ---------------- BUY NOW ---------------- */

  if (productId) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.blacklisted) throw new Error("Product unavailable");

    let variant = null;

    if (product.variants?.length) {
      if (!variantId)
        throw new Error("Variant selection required");

      variant = product.variants.id(variantId);
      if (!variant)
        throw new Error("Invalid variant selected");
    }

    const stock = variant ? variant.stock : product.stock;
    const qty = Number(quantity) || 1;

    if (stock < qty)
      throw new Error(`${product.name} out of stock`);

    buildItem(product, variant, qty);
  }

  /* ---------------- CART ---------------- */

  else {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.products.length)
      throw new Error("Cart empty");

    const productIds = cart.products.map(p => p.product);

    const products = await Product.find({
      _id: { $in: productIds }
    });

    const map = new Map(
      products.map(p => [p._id.toString(), p])
    );

    for (const c of cart.products) {
      const product = map.get(c.product.toString());
      if (!product) continue;

      if (product.blacklisted)
        throw new Error(`${product.name} unavailable`);

      let variant = null;

      if (product.variants?.length) {
        if (!c.variantId)
          throw new Error(`Variant missing for ${product.name}`);

        variant = product.variants.id(c.variantId);
        if (!variant)
          throw new Error(`Invalid variant for ${product.name}`);
      }

      const stock = variant ? variant.stock : product.stock;

      if (stock < c.quantity)
        throw new Error(`${product.name} out of stock`);

      buildItem(product, variant, c.quantity);
    }

    if (!items.length)
      throw new Error("No valid items to order");
  }

  /* ---------------- SUMMARY ---------------- */

  const discount = round2(mrpTotal - sellingSubtotal);

  return {
    items,
    summary: {
      subtotal: round2(sellingSubtotal),   // selling total
      mrpTotal: round2(mrpTotal),
      discount,
      payable: round2(sellingSubtotal),
      totalWeight: round2(totalWeight),
      itemCount: items.length,
      totalQuantity: items.reduce(
        (s, i) => s + i.quantity, 0
      ),
    },
    checkoutType: productId ? "BUY_NOW" : "CART",
  };
};


