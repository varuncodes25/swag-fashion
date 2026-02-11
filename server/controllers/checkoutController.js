const { calculateOrder } = require("../helper/createOrder");
const Address = require("../models/address");

exports.checkoutInit = async (req, res) => {
  try {
    
    
    // Get user ID
    const userId = req.id || req.user?._id;
    console.log("User ID:", userId);
    
    const { productId, variantId, qty, addressId } = req.query; // ✅ ADD variantId

   

    // ✅ VALIDATION: For Buy Now, variantId is REQUIRED
    if (productId && !variantId) {
      console.warn("⚠️ Variant ID missing for product checkout");
      return res.status(400).json({ 
        success: false, 
        message: "Variant ID is required for product checkout" 
      });
    }

    // Validate address
    if (!addressId) {
      return res.status(400).json({ 
        success: false, 
        message: "Address is required" 
      });
    }

    // Get user's address
    const userAddress = await Address.findOne({
      _id: addressId,
      userId: userId
    });
console.log(userAddress)
    if (!userAddress) {
      console.log("❌ Address not found or doesn't belong to user");
      return res.status(403).json({ 
        success: false, 
        message: "Address not found or doesn't belong to you"
      });
    }

    console.log("✅ Address verified:", {
      pincode: userAddress.pincode,
      city: userAddress.city,
      state: userAddress.state
    });

    // ✅ Calculate order WITH variantId
    console.log("🧮 Calling calculateOrder with:", {
      productId,
      variantId, // ✅ Pass variantId
      quantity: qty,
      userId
    });

    const order = await calculateOrder(
      userId,
      { 
        productId, 
        variantId, // ✅ PASS VARIANT ID
        quantity: qty || 1 
      },
      userAddress
    );

    // console.log("✅ Order calculated:", {
    //   itemsCount: order.items?.length || 0,
    //   firstItem: order.items?.[0] ? {
    //     variantId: order.items[0].variantId,
    //     color: order.items[0].color,
    //     size: order.items[0].size,
    //     price: order.items[0].price
    //   } : null
    // });

    return res.status(200).json({
      success: true,
      ...order
    });

  } catch (error) {
    console.error("❌ Checkout init error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Checkout failed"
    });
  }
};