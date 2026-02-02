// helpers/orderCalculator.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { calculateShippingCharge } = require("../service/shiprocketService");

exports.calculateOrder = async (userId, { productId, variantId, quantity, color, size }, addressDoc) => {
  console.log( productId, variantId,"hhhh")
  let items = [];
  let subtotal = 0;
  let discount = 0;
  let totalWeight = 0;

  const processItem = (product, variant, qty, extra = {}) => {
    // ✅ TEMPORARY FIX: Always use variant prices
    // If variant prices missing, use fallback
    const price = variant.price || product.price || 0;
    const sellingPrice = variant.sellingPrice || variant.price || product.sellingPrice || product.price || 0;
    
    console.log("🧪 PRICE DEBUG:", {
      variantPrice: variant.price,
      variantSellingPrice: variant.sellingPrice,
      productPrice: product.price,
      productSellingPrice: product.sellingPrice,
      finalPrice: price,
      finalSellingPrice: sellingPrice
    });
    
    const discountAmountPerUnit = Math.max(price - sellingPrice, 0);
    const discountPercent = price > 0 ? Math.round((discountAmountPerUnit / price) * 100) : 0;

    const quantity = Number(qty) || 1;
    
    // Calculate
    const itemSubtotal = price * quantity;
    const itemDiscount = discountAmountPerUnit * quantity;
    const itemWeight = (product.productDimensions?.weight || 0.2) * quantity;
    
    subtotal += itemSubtotal;
    discount += itemDiscount;
    totalWeight += itemWeight;

    items.push({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      brand: product.brand || "Generic",
      color: variant.color,
      size: variant.size,
      sku: variant.sku || `SKU-${product._id}-${variant.color}-${variant.size}`,
      image: product.getMainImage?.()?.url || 
             product.allImages?.[0]?.url || 
             product.image?.url || 
             "default.jpg",
      price,
      sellingPrice,
      discountPercent,
      discountAmount: discountAmountPerUnit,
      quantity,
      lineTotal: sellingPrice * quantity,
      weight: product.productDimensions?.weight || 0.2,
      length: product.productDimensions?.length || 0,
      width: product.productDimensions?.width || 0,
      height: product.productDimensions?.height || 0,
      ...extra,
    });
  };

  /* ---------------- PRODUCTS ---------------- */
  if (productId) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.blacklisted) throw new Error("Product not available");

    // Find variant
    let variant;
    if (variantId) {
      variant = product.variants.id(variantId);
    } else if (color && size) {
      variant = product.variants.find(v => 
        v.color === color && v.size === size
      );
    } else {
      variant = product.variants[0];
      color = variant?.color;
      size = variant?.size;
    }

    if (!variant) throw new Error("Variant not available");

    // Stock check
    const availableStock = variant.stock - (variant.reservedStock || 0);
    const qty = Number(quantity) || 1;
    
    if (availableStock < qty) {
      throw new Error(`${product.name} (${variant.color}-${variant.size}) out of stock`);
    }

    processItem(product, variant, qty);
  } else {
    // Cart logic (similar fixes)
  }

  /* ---------------- AMOUNT ---------------- */
  const payable = Math.max(subtotal - discount, 0);
  
  /* ---------------- SHIPPING ---------------- */
  let shipping = 0;
  if (addressDoc?.pincode && totalWeight > 0) {
    try {
      const shippingInfo = await calculateShippingCharge({
        deliveryPincode: addressDoc.pincode,
        totalWeight,
      });
      shipping = shippingInfo.shippingCharge || 0;
    } catch (err) {
      console.error("Shipping error:", err.message);
      shipping = payable > 500 ? 0 : 50;
    }
  } else {
    shipping = payable > 500 ? 0 : 50;
  }

  const total = payable + shipping;

  /* ---------------- RESULT ---------------- */
  return {
    items,
    summary: {
      subtotal: subtotal || 0,
      discount: discount || 0,
      payable: payable || 0,
      shipping: shipping || 0,
      total: total || 0,
      totalWeight: totalWeight || 0,
      shippingInfo: null,
    },
    checkoutType: productId ? "BUY_NOW" : "CART",
  };
};
exports.calculateOrderValidation = async (userId, { productId, quantity }, addressDoc) => {
  let items = [];
  let subtotal = 0;
  let discount = 0;
  let totalWeight = 0;

  const processItem = (product, qty, extra = {}) => {
    const price = product.price;
    const finalPrice = product.getDiscountedPrice();
    const q = Number(qty);

    const discountAmountPerUnit = price - finalPrice;

    subtotal += price * q;
    discount += discountAmountPerUnit * q;
    totalWeight += (product.dimensions?.weight || 0) * q;

    items.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price,
      discountPercent: product.discount || 0,
      discountAmount: discountAmountPerUnit,
      finalPrice,
      quantity: q,
      lineTotal: finalPrice * q,
      weight: product.dimensions?.weight || 0,
      length: product.dimensions?.length || 0,
      width: product.dimensions?.width || 0,
      height: product.dimensions?.height || 0,
      ...extra,
    });
  };

  /* -------- PRODUCTS -------- */

  if (productId) {
    const product = await Product.findById(productId);
    if (!product || product.blacklisted) throw new Error("Product not available");

    const qty = Number(quantity) || 1;
    if (product.stock < qty) throw new Error(`${product.name} out of stock`);

    processItem(product, qty);
  } else {
    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    if (!cart || cart.products.length === 0) throw new Error("Cart empty");

    for (const cartItem of cart.products) {
      const product = cartItem.product;
      if (product.stock < cartItem.quantity) {
        throw new Error(`${product.name} out of stock`);
      }

      processItem(product, cartItem.quantity, {
        color: cartItem.color,
        size: cartItem.size,
      });
    }
  }

  const payable = subtotal - discount;

  return {
    items,
    summary: {
      subtotal,
      discount,
      payable,
      totalWeight,
    },
    checkoutType: productId ? "BUY_NOW" : "CART",
  };
};

// ✅ Helper function file में (calculationHelpers.js)
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

// ✅ Main orderCalculator.js
// exports.calculateOrder = async (userId, { productId, quantity }) => {
//   console.log(productId, "productId");
//   let items = [];
//   let subtotal = 0;
//   let discount = 0;
//   let totalTax = 0;

//   const TAX_RATE = 0.18; // 18% GST

//   const processItem = (product, qty, extra = {}) => {
//     const price = product.price;
//     const finalPrice = product.getDiscountedPrice();
//     const quantity = Number(qty);

//     const discountAmountPerUnit = price - finalPrice;
//     const discountPercent = product.discount || 0;

//     // Calculations with rounding
//     const itemSubtotal = roundToTwo(price * quantity);
//     const itemDiscount = roundToTwo(discountAmountPerUnit * quantity);
//     const itemTotal = roundToTwo(finalPrice * quantity);
//     const itemTax = roundToTwo(itemTotal * TAX_RATE);

//     subtotal = roundToTwo(subtotal + itemSubtotal);
//     discount = roundToTwo(discount + itemDiscount);
//     totalTax = roundToTwo(totalTax + itemTax);

//     items.push({
//       productId: product._id,
//       name: product.name,
//       image: product.images?.[0]?.url,
//       price: roundToTwo(price),
//       discountPercent,
//       discountAmount: roundToTwo(discountAmountPerUnit),
//       finalPrice: roundToTwo(finalPrice),
//       quantity,
//       lineTotal: itemTotal,
//       taxAmount: itemTax,
//       taxRate: TAX_RATE,
//       weight: product.dimensions?.weight || 0,
//       length: product.dimensions?.length || 0,
//       width: product.dimensions?.width || 0,
//       height: product.dimensions?.height || 0,
//       ...extra,
//     });
//   };

//   if (productId) {
//     const product = await Product.findById(productId);
//     if (!product || product.blacklisted) {
//       throw new Error("Product not available");
//     }

//     const qty = Number(quantity) || 1;
//     if (product.stock < qty) {
//       throw new Error(`${product.name} out of stock`);
//     }

//     processItem(product, qty);
//   } else {
//     const cart = await Cart.findOne({ user: userId }).populate(
//       "products.product"
//     );
//     if (!cart || cart.products.length === 0) {
//       throw new Error("Cart empty");
//     }

//     for (const cartItem of cart.products) {
//       const product = cartItem.product;

//       if (product.stock < cartItem.quantity) {
//         throw new Error(`${product.name} out of stock`);
//       }

//       processItem(product, cartItem.quantity, {
//         color: cartItem.color,
//         size: cartItem.size,
//       });
//     }
//   }

//   const payable = roundToTwo(subtotal - discount);
//   const shipping = payable === 0 ? 0 : payable > 500 ? 0 : 50;

//   const total = roundToTwo(payable + shipping + totalTax);

//   return {
//     items,
//      summary: {
//     subtotal: roundToTwo(subtotal),
//     discount: roundToTwo(discount),
//     shipping,
//     tax: roundToTwo(totalTax),
//     taxRate: TAX_RATE * 100, // Percentage format (18)
//     taxableAmount: roundToTwo(subtotal - discount), // Tax लगने वाली amount
//     total,
//     itemsCount: items.length,
//     totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
//   },
//     checkoutType: productId ? "BUY_NOW" : "CART",
//   };
// };
// Helper for verifying payment and creating order
exports.processPaymentAndCreateOrder = async (
  userId,
  orderData,
  paymentDetails
) => {
  const { items, total } = orderData;
  const { addressId } = paymentDetails;

  // Verify and reduce stock
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if (!updated) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  return { items, total };
};

exports.calculateOrderBase = async (userId, { productId, quantity }) => {
  let items = [];
  let subtotal = 0;
  let discount = 0;
  let totalWeight = 0;

  const processItem = (product, qty, extra = {}) => {
    const price = product.price;
    const finalPrice = product.getDiscountedPrice();
    const q = Number(qty);

    subtotal += price * q;
    discount += (price - finalPrice) * q;
    totalWeight += (product.dimensions?.weight || 0) * q;
    const discountAmountPerUnit = price - finalPrice;
    discount += discountAmountPerUnit * quantity;
    items.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price,
      finalPrice,
      quantity: q,
      lineTotal: finalPrice * q,
      weight: product.dimensions?.weight || 0,
      ...extra,
    });
  };

  if (productId) {
    const product = await Product.findById(productId);
    if (!product || product.blacklisted)
      throw new Error("Product not available");

    const qty = Number(quantity) || 1;
    if (product.stock < qty) throw new Error(`${product.name} out of stock`);

    processItem(product, qty);
  } else {
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!cart || cart.products.length === 0) throw new Error("Cart empty");

    for (const cartItem of cart.products) {
      if (cartItem.product.stock < cartItem.quantity) {
        throw new Error(`${cartItem.product.name} out of stock`);
      }

      processItem(cartItem.product, cartItem.quantity, {
        color: cartItem.color,
        size: cartItem.size,
      });
    }
  }

  return {
    items,
    subtotal,
    discount,
    payable: subtotal - discount,
    totalWeight,
    checkoutType: productId ? "BUY_NOW" : "CART",
  };
};

exports.calculateOrderWithShipping = async (userId, params, addressDoc) => {
  const base = await exports.calculateOrderBase(userId, params);

  let shipping = 0;
  let shippingInfo = null;

  if (addressDoc?.pincode && base.totalWeight > 0) {
    try {
      shippingInfo = await calculateShippingCharge({
        deliveryPincode: addressDoc.pincode,
        totalWeight: base.totalWeight,
      });

      shipping = shippingInfo.shippingCharge || 0;
    } catch (err) {
      shipping = base.payable > 500 ? 0 : 50;
    }
  } else {
    shipping = base.payable > 500 ? 0 : 50;
  }

  return {
    items: base.items,
    summary: {
      subtotal: base.subtotal,
      discount: base.discount,
      shipping,
      total: base.payable + shipping,
      totalWeight: base.totalWeight,
      shippingInfo,
      discountPercent: product.discount || 0,
      discountAmount: discountAmountPerUnit,
    },
    checkoutType: base.checkoutType,
  };
};
