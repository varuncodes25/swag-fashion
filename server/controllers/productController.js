const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;
const ROLES = require("../utils/constants");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to get color code
function getColorCode(colorName) {
  const colorMap = {
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "Green": "#008000",
    "Black": "#000000",
    "White": "#FFFFFF",
    "Gray": "#808080",
    "Yellow": "#FFFF00",
    "Pink": "#FFC0CB",
    "Purple": "#800080",
    "Orange": "#FFA500",
    "Brown": "#A52A2A",
    "Navy": "#000080",
    "Maroon": "#800000",
    "Teal": "#008080",
    "Olive": "#808000",
    "Beige": "#F5F5DC",
    "Cream": "#FFFDD0",
    "Khaki": "#C3B091"
  };
  
  return colorMap[colorName] || "#000000";
}

// ==================== CREATE PRODUCT (VARIANT ONLY) ====================
const createProduct = async (req, res) => {

  try {
    const {
      name,
      description,
      shortDescription,
      category,
      clothingType,
      gender,
      fabric,
      brand,
      // Variant data
      colors,
      sizes,
      basePrice, // Base price for all variants
      stocks,
      colorCodes,
      // Optional fields
      ageGroup = "Adult",
      fabricComposition = "100% Cotton",
      fit = "Regular",
      pattern = "Solid",
      sleeveType = "Full Sleeve",
      neckType = "Round Neck",
      discount = 0,
      offerTitle,
      offerDescription,
      offerValidFrom,
      offerValidTill,
      freeShipping = false,
      season = "All Season",
      occasion = "Casual",
      features = [],
      packageContent = "1 Piece",
      countryOfOrigin = "India"
    } = req.body;

    // Basic validation
    if (!name || !description || !category || !clothingType || !gender || !fabric || !brand) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category, clothing type, gender, fabric and brand are required."
      });
    }

    if (!colors || !sizes || !basePrice) {
      return res.status(400).json({
        success: false,
        message: "Colors, sizes and base price are required for variants."
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image."
      });
    }

    // Parse arrays
    const colorsArray = Array.isArray(colors) ? colors : JSON.parse(colors || "[]");
    const sizesArray = Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]");
    const stocksArray = Array.isArray(stocks) ? stocks : JSON.parse(stocks || "[]");
    const colorCodesArray = Array.isArray(colorCodes) ? colorCodes : JSON.parse(colorCodes || "[]");
    const featuresArray = Array.isArray(features) ? features : JSON.parse(features || "[]");
    
    // Parse season and occasion (could be string or array)
    let seasonArray = ["All Season"];
    let occasionArray = ["Casual"];
    
    if (season) {
      if (Array.isArray(season)) {
        seasonArray = season;
      } else if (typeof season === 'string') {
        try {
          seasonArray = JSON.parse(season);
        } catch {
          seasonArray = [season];
        }
      }
    }
    
    if (occasion) {
      if (Array.isArray(occasion)) {
        occasionArray = occasion;
      } else if (typeof occasion === 'string') {
        try {
          occasionArray = JSON.parse(occasion);
        } catch {
          occasionArray = [occasion];
        }
      }
    }

    // Validate arrays
    if (colorsArray.length === 0 || sizesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one color and one size is required."
      });
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: "clothing/products",
            resource_type: "image"
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      
      uploadedImages.push({
        url: result.secure_url,
        id: result.public_id,
        isMain: i === 0
      });
    }

    // Group images by color (from frontend)
    const colorsForImages = req.body.colorsForImages 
      ? (Array.isArray(req.body.colorsForImages) ? req.body.colorsForImages : JSON.parse(req.body.colorsForImages))
      : [];
    
    const imagesByColor = {};
    colorsForImages.forEach((color, index) => {
      if (index < uploadedImages.length) {
        if (!imagesByColor[color]) imagesByColor[color] = [];
        imagesByColor[color].push(uploadedImages[index]);
      }
    });

    // If no color-image mapping, assign all images to all variants
    if (Object.keys(imagesByColor).length === 0) {
      colorsArray.forEach(color => {
        imagesByColor[color] = uploadedImages;
      });
    }

    // Create variants (all combinations of colors and sizes)
    const variants = [];
    const price = parseFloat(basePrice);
    
    colorsArray.forEach((color, colorIndex) => {
      sizesArray.forEach((size, sizeIndex) => {
        const variant = {
          color: color,
          colorCode: colorCodesArray[colorIndex] || getColorCode(color),
          size: size,
          price: price,
          stock: parseInt(stocksArray[colorIndex] || stocksArray[0] || 0),
          images: imagesByColor[color] || uploadedImages
        };
        
        variants.push(variant);
      });
    });

    // Create product (NO simple product fields - only variants)
    const product = new Product({
      name,
      description,
      shortDescription: shortDescription || description.substring(0, 150),
      category,
      clothingType,
      gender,
      ageGroup,
      fabric,
      fabricComposition,
      fit,
      pattern,
      sleeveType,
      neckType,
      brand,
      season: seasonArray,
      occasion: occasionArray,
      features: featuresArray,
      packageContent,
      countryOfOrigin,
      discount: parseInt(discount) || 0,
      offerTitle: offerTitle || null,
      offerDescription: offerDescription || null,
      offerValidFrom: offerValidFrom ? new Date(offerValidFrom) : null,
      offerValidTill: offerValidTill ? new Date(offerValidTill) : null,
      freeShipping: freeShipping === "true" || freeShipping === true,
      variants,
      createdBy: req.userId
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product.getProductDetailData()
    });

  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product"
    });
  }
};

// ==================== GET ALL PRODUCTS ====================
const getProducts = async (req, res) => {
  console.log("🔄 Fetching products...");
  try {
    let { page, limit, category, price, search, sort } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;

    // Base query
    const query = { };

    // Filters
    if (category && category.toLowerCase() !== "all") query.category = category.trim();
    if (search && search.trim() !== "") query.name = { $regex: search.trim(), $options: "i" };
    if (price && !isNaN(price)) query.price = { $lte: Number(price) };

    // Sorting
    let sortBy = { createdAt: -1 }; // default
    if (sort === "priceLowToHigh") sortBy = { price: 1 };
    if (sort === "priceHighToLow") sortBy = { price: -1 };

    const now = new Date();

    console.log("Query:", query);
    console.log("Page:", page, "Limit:", limit);

    // SIMPLIFIED APPROACH - No aggregation
    const skip = (page - 1) * limit;
    
    // Get total count
    const totalProducts = await Product.countDocuments(query);
    
    // Get products with proper filtering and sorting
    let productsQuery = Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JS objects
    
    // Execute query
    let products = await productsQuery;
    
    console.log(`📊 Found ${products.length} products`);

    // Process products to add calculated fields
    const enhancedProducts = products.map(product => {
      // Get min price from variants
      const minPrice = product.variants?.length > 0 
        ? Math.min(...product.variants.map(v => v.price || 0))
        : 0;
      
      // Get first variant's first image
      const image = product.variants?.[0]?.images?.[0] || null;
      
      // Check if offer is active
      const isOfferActive = product.discount > 0 && 
                           product.offerValidTill && 
                           new Date(product.offerValidTill) > now;
      
      // Calculate discounted price
      const discountedPrice = isOfferActive && product.discount > 0 
        ? minPrice - (minPrice * product.discount / 100)
        : minPrice;
      
      // Extract colors and sizes from variants
      const colors = [...new Set(product.variants?.map(v => v.color) || [])];
      const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
      
      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        discount: product.discount || 0,
        offerValidTill: product.offerValidTill,
        variants: product.variants || [],
        colors,
        sizes,
        clothingType: product.clothingType,
        gender: product.gender,
        fabric: product.fabric,
        brand: product.brand,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        freeShipping: product.freeShipping || false,
        price: minPrice,
        image,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        isOfferActive
      };
    });

    const totalPages = Math.ceil(totalProducts / limit);

    console.log(`✅ Returning ${enhancedProducts.length} products`);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: enhancedProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
    });
  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch products" 
    });
  }
};

// ==================== GET PRODUCT BY ID ====================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("reviews");
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Use the model method to get product details
    const productData = product.getProductDetailData();
    
    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productData
    });
  } catch (err) {
    console.error("Get product by ID error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ==================== GET PRODUCTS FOR ADMIN ====================
const getProductsforadmin = async (req, res) => {
  try {
    let { page, limit, category, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const query = {};

    // Category filter
    if (category && category.toLowerCase() !== "all") {
      query.category = category.trim();
    }

    // Search filter
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Get total count
    const totalProducts = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name");

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched for admin",
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get Products for Admin Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== UPDATE PRODUCT ====================
const updateProduct = async (req, res) => {
  if (req.role !== ROLES.admin && req.role !== ROLES.seller) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied" 
    });
  }

  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Handle arrays
    if (data.sizes && typeof data.sizes === "string") {
      try {
        data.sizes = JSON.parse(data.sizes);
      } catch {
        // keep as is if parsing fails
      }
    }

    if (data.colors && typeof data.colors === "string") {
      try {
        data.colors = JSON.parse(data.colors);
      } catch {
        // keep as is if parsing fails
      }
    }

    if (data.discount) data.discount = Number(data.discount);

    if (data.offerValidFrom)
      data.offerValidFrom = new Date(data.offerValidFrom);
    if (data.offerValidTill)
      data.offerValidTill = new Date(data.offerValidTill);

    // Handle variant updates if provided
    if (data.variants && typeof data.variants === "string") {
      try {
        data.variants = JSON.parse(data.variants);
      } catch {
        // keep as is if parsing fails
      }
    }

    // Handle images upload if any
    if (req.files && req.files.length > 0) {
      // If you need to update variant images, you'll need to handle this
      // For now, we'll skip image update in this simplified version
    }

    const product = await Product.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product.getProductDetailData()
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== DELETE PRODUCT ====================
const deleteProduct = async (req, res) => {
  if (req.role !== ROLES.admin && req.role !== ROLES.seller) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied" 
    });
  }

  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Delete images from Cloudinary
    for (const variant of product.variants) {
      for (const image of variant.images) {
        try {
          await cloudinary.uploader.destroy(image.id);
        } catch (error) {
          console.error(`Failed to delete image ${image.id}:`, error);
        }
      }
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== GET PRODUCT BY NAME ====================
const getProductByName = async (req, res) => {
  const { name } = req.params;

  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(name, "i") },
    }).populate("reviews");

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Use model method to get product data
    const productData = product.getProductDetailData();

    return res.status(200).json({
      success: true,
      message: "Product found",
      data: productData,
    });
  } catch (error) {
    console.error("Get product by name error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== BLACKLIST PRODUCT ====================
const blacklistProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied" 
    });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: `The product ${product.name} has been blacklisted`,
      data: product,
    });
  } catch (error) {
    console.error("Blacklist product error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== REMOVE FROM BLACKLIST ====================
const removeFromBlacklist = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied" 
    });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: `The product ${product.name} has been removed from blacklist`,
      data: product,
    });
  } catch (error) {
    console.error("Remove from blacklist error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== UPDATE VARIANT STOCK ====================
const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    if (req.role !== ROLES.admin && req.role !== ROLES.seller) {
      return res.status(403).json({
        success: false,
        message: "Access denied."
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check ownership (for sellers)
    if (req.role === ROLES.seller && product.createdBy && product.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products"
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    variant.stock = parseInt(stock);
    product.updatedBy = req.userId;
    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        variantId: variant._id,
        stock: variant.stock,
        productId: product._id
      }
    });

  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update stock"
    });
  }
};

// ==================== GET PRODUCT STATS ====================
const getProductStats = async (req, res) => {
  try {
    if (req.role !== ROLES.admin && req.role !== ROLES.seller) {
      return res.status(403).json({
        success: false,
        message: "Access denied."
      });
    }

    let query = {};
    if (req.role === ROLES.seller && req.userId) {
      query.createdBy = req.userId;
    }

    const stats = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          totalSold: { $sum: "$soldCount" },
          totalViews: { $sum: "$viewCount" }
        }
      }
    ]);

    const clothingTypeStats = await Product.aggregate([
      { $match: query },
      { $group: {
        _id: "$clothingType",
        count: { $sum: 1 },
        averagePrice: { $avg: { $arrayElemAt: ["$variants.price", 0] } }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        ...stats[0] || {},
        clothingTypeStats,
        lowStock: await Product.countDocuments({ 
          ...query, 
          "variants.stock": { $lt: 10 }
        })
      }
    });

  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get stats"
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductByName,
  blacklistProduct,
  removeFromBlacklist,
  getProductById,
  getProductsforadmin,
  updateVariantStock,
  getProductStats
};