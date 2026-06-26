// controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Add to wishlist
// backend/controllers/wishlistController.js

// ✅ Single toggle endpoint
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: userId,
      product: productId
    });

    let action, isInWishlist;

    if (existingItem) {
      // Remove from wishlist
      await Wishlist.findByIdAndDelete(existingItem._id);
      action = 'removed';
      isInWishlist = false;
      
      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        action,
        isInWishlist
      });
    } else {
      // Add to wishlist
      await Wishlist.create({
        user: userId,
        product: productId
      });
      action = 'added';
      isInWishlist = true;
      
      return res.status(200).json({
        success: true,
        message: "Added to wishlist",
        action,
        isInWishlist,
        product: { // Optional: product data भेजें
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          // ... other fields
        }
      });
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




// Get user's wishlist
// controllers/wishlist.controller.js

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.id;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // 1️⃣ Fetch wishlist + populate product WITHOUT lean()
    const [wishlistItems, totalItems] = await Promise.all([
      Wishlist.find({ user: userId })
        .populate('product') // Populate full product
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit),
        // ❌ No lean() - so methods are available
      Wishlist.countDocuments({ user: userId }),
    ]);

    // 2️⃣ Filter deleted/blacklisted products
    const validItems = wishlistItems.filter(
      (item) => item.product && !item.product.blacklisted
    );

    // 3️⃣ DIRECTLY USE getProductCardData() method! 🎯
    const data = validItems.map((item) => {
      const product = item.product;
      
      // ✅ Just call the method - it returns everything properly formatted!
      const cardData = product.getProductCardData();
      
      return {
        ...cardData,
        // Add wishlist-specific fields
        wishlistId: item._id,
        addedAt: item.addedAt
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
    
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};


// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.id;

    const exists = await Wishlist.findOne({
      user: userId,
      product: productId
    });

    res.status(200).json({
      success: true,
      isInWishlist: !!exists
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};