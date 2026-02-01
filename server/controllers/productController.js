const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;
const ROLES = require("../utils/constants");

// Configure Cloudinary
// const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  
  // Network settings
  timeout: 120000, // 2 minutes
  upload_prefix: "https://api.cloudinary.com", 
  api_proxy: process.env.PROXY_URL, // Agar proxy use karte ho
  
  // Security
  secure: true,
  secure_distribution: null,
  private_cdn: false,
  
  // Upload settings
  chunk_size: 20000000, // 20MB chunks
  keep_alive: true
});

// Additional: Global axios timeout (agar Cloudinary axios use karta hai)
require('axios').defaults.timeout = 120000;

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
      basePrice,
      stocks,
      colorCodes,
      // Stock matrix for better stock management
      stockMatrix,
      // Color-Image mapping
      colorImageMap,
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
      countryOfOrigin = "India",
      productDimensions = {},
      warranty = "No Warranty",
      returnPolicy = "7 Days Return Available"
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

    // Parse stock matrix if provided
    let stockMatrixObj = {};
    if (stockMatrix) {
      try {
        stockMatrixObj = typeof stockMatrix === 'string'
          ? JSON.parse(stockMatrix)
          : stockMatrix;
      } catch (error) {
        console.warn("Invalid stock matrix format:", error);
      }
    }

    // Parse color-image mapping
    let colorImageMapping = {};
    if (colorImageMap) {
      try {
        colorImageMapping = typeof colorImageMap === 'string'
          ? JSON.parse(colorImageMap)
          : colorImageMap;
      } catch (error) {
        console.warn("Invalid colorImageMap format:", error);
      }
    }

    // Parse season and occasion
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
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" }
            ]
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });

      uploadedImages.push({
        url: result.secure_url,
        id: result.public_id,
        isMain: i === 0,
        sortOrder: i
      });
    }

    // ============ CRITICAL CHANGE 1: Create centralized allImages ============
    const allImages = [];

    // If color-image mapping provided, assign colors to images
    if (Object.keys(colorImageMapping).length > 0) {
      // Example colorImageMapping: { "Red": [0, 1], "Black": [2, 3] }
      Object.entries(colorImageMapping).forEach(([color, indices]) => {
        const colorIndex = colorsArray.indexOf(color);
        const colorCode = colorCodesArray[colorIndex] || getColorCode(color);

        indices.forEach(imgIndex => {
          if (imgIndex < uploadedImages.length) {
            allImages.push({
              ...uploadedImages[imgIndex],
              color: color,
              colorCode: colorCode
            });
          }
        });
      });
    } else {
      // Default: All images belong to first color
      const firstColor = colorsArray[0];
      const firstColorCode = colorCodesArray[0] || getColorCode(firstColor);

      uploadedImages.forEach((img, index) => {
        allImages.push({
          ...img,
          color: firstColor,
          colorCode: firstColorCode
        });
      });
    }

    // ============ CRITICAL CHANGE 2: Create variants WITHOUT images array ============
    const variants = [];
    const price = parseFloat(basePrice);
    let variantCounter = 0;

    colorsArray.forEach((color, colorIndex) => {
      sizesArray.forEach((size, sizeIndex) => {
        // Calculate stock - using stockMatrix if available, otherwise flat array
        let stockValue = 0;

        if (stockMatrixObj[color] && stockMatrixObj[color][size] !== undefined) {
          stockValue = parseInt(stockMatrixObj[color][size]);
        } else if (stocksArray.length > 0) {
          // Try to get stock from flat array
          const flatIndex = colorIndex * sizesArray.length + sizeIndex;
          stockValue = parseInt(stocksArray[flatIndex] || stocksArray[colorIndex] || 0);
        }

        const variant = {
          color: color,
          colorCode: colorCodesArray[colorIndex] || getColorCode(color),
          size: size,
          price: price,
          stock: stockValue,
          // NO images field here - saving database space
        };

        variants.push(variant);
        variantCounter++;
      });
    });

    // Parse product dimensions
    let parsedDimensions = {
      length: 0,
      width: 0,
      height: 0,
      weight: 0.2
    };

    if (productDimensions) {
      try {
        const dims = typeof productDimensions === 'string'
          ? JSON.parse(productDimensions)
          : productDimensions;

        parsedDimensions = {
          ...parsedDimensions,
          ...dims
        };
      } catch (error) {
        console.warn("Invalid dimensions format:", error);
      }
    }

    // ============ CRITICAL CHANGE 3: Create product with optimized structure ============
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

      // Centralized images storage
      allImages: allImages,

      // Variants WITHOUT duplicate images
      variants,

      // Additional fields
      discount: parseInt(discount) || 0,
      offerTitle: offerTitle || null,
      offerDescription: offerDescription || null,
      offerValidFrom: offerValidFrom ? new Date(offerValidFrom) : null,
      offerValidTill: offerValidTill ? new Date(offerValidTill) : null,
      freeShipping: freeShipping === "true" || freeShipping === true,

      // Dimensions
      productDimensions: parsedDimensions,

      // Warranty & Returns
      warranty,
      returnPolicy,

      // Admin
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
    const query = {};

    // Filters
    if (category && category.toLowerCase() !== "all") query.category = category.trim();
    if (search && search.trim() !== "") query.name = { $regex: search.trim(), $options: "i" };
    if (price && !isNaN(price)) query.price = { $lte: Number(price) };

    // Sorting
    let sortBy = { createdAt: -1 }; // default
    if (sort === "priceLowToHigh") sortBy = { sellingPrice: 1 };
    if (sort === "priceHighToLow") sortBy = { sellingPrice: -1 };

    const skip = (page - 1) * limit;

    // Get total count
    const totalProducts = await Product.countDocuments(query);

    // ✅ CORRECT: Get products as Mongoose documents (NOT .lean())
    let products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);
      // ❌ REMOVE: .lean() - We need Mongoose documents for methods

    console.log(`📊 Found ${products.length} products`);

    // ✅ USE THE EXISTING METHOD: getProductCardData()
    const enhancedProducts = products.map(product => {
      console.log(`Processing: ${product.name}`);
      console.log("Using getProductCardData() method");
      
      // ✅ This returns ALL card data including image
      const cardData = product.getProductCardData();
      
      console.log("Card data image:", cardData.image?.url);
      
      return cardData;
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
  console.log("iiiiii")
  const { name } = req.params;
console.log(name)
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
      {
        $group: {
          _id: "$clothingType",
          count: { $sum: 1 },
          averagePrice: { $avg: { $arrayElemAt: ["$variants.price", 0] } }
        }
      },
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

// ==================== GET PRODUCTS BY CATEGORY WITH FILTERS ====================
const getProductsByCategory = async (req, res) => {
  try {
    const { slug, subSlug } = req.params;
    const queryParams = req.query;
    console.log("Incoming queryParams:", queryParams);

    // ============ 1. FIND CATEGORY ============
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // ============ 2. BUILD BASE QUERY ============
    const query = {
      category: category._id,
      status: "published",
      blacklisted: false
    };

    // Add subcategory if exists
    let subCategory = null;
    if (subSlug) {
      subCategory = category.subCategories?.find(
        sub => sub.slug === subSlug && sub.isActive !== false
      );
      if (subCategory) {
        query.subCategory = subCategory._id;
      }
    }

    // ============ 3. APPLY FILTERS ============
    console.log("Applying filters from query params:", queryParams);

    // PRICE RANGE FILTER - CORRECTED
    if (queryParams.priceRange) {
      const priceRanges = queryParams.priceRange.split(',');
      console.log("Price ranges:", priceRanges);
      
      const priceConditions = [];
      
      priceRanges.forEach(range => {
        const [min, max] = range.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          priceConditions.push({
            "variants.price": { $gte: min, $lte: max }
          });
        }
      });
      
      if (priceConditions.length > 0) {
        if (priceConditions.length === 1) {
          Object.assign(query, priceConditions[0]);
        } else {
          query.$or = query.$or || [];
          query.$or.push(...priceConditions);
        }
      }
    }

    // DISCOUNT FILTER - CORRECTED
    if (queryParams.discount) {
      const discounts = queryParams.discount.split(',').map(Number).filter(n => !isNaN(n));
      if (discounts.length > 0) {
        query.discount = { $in: discounts };
      }
      console.log("Discount query:", discounts);
    }

    // RATING FILTER - CORRECTED
    if (queryParams.rating) {
      const ratings = queryParams.rating.split(',').map(Number).filter(n => !isNaN(n));
      if (ratings.length > 0) {
        query.rating = { $in: ratings };
      }
      console.log("Rating query:", query.rating);
    }

    // ✅ COLOR FILTER - FIXED
    if (queryParams.color) {
      const colors = queryParams.color.split(',').map(c => c.trim().toLowerCase());
      // Aapke schema mein field ka naam "colors" hai (array)
      query.colors = { $in: colors.map(c => new RegExp(`^${c}$`, 'i')) };
      console.log("✅ Color filter applied:", query.colors);
    }

    // ✅ SIZE FILTER - FIXED
    if (queryParams.size) {
      const sizes = queryParams.size.split(',').map(s => s.toUpperCase().trim());
      // Aapke schema mein field ka naam "sizes" hai (array)
      query.sizes = { $in: sizes };
      console.log("✅ Size filter applied:", query.sizes);
    }

    // BRAND FILTER - CORRECTED
    if (queryParams.brand) {
      const brands = queryParams.brand.split(',').map(b => b.trim());
      query.brand = { $in: brands.map(b => new RegExp(b, 'i')) };
      console.log("Brand query:", brands);
    }

    // GENDER FILTER - CORRECTED
    if (queryParams.gender) {
      const genders = queryParams.gender.split(',').map(g => g.trim().toLowerCase());
      query.gender = { $in: genders.map(g => new RegExp(`^${g}$`, 'i')) };
      console.log("Gender query:", genders);
    }

    // AGE GROUP FILTER
    if (queryParams.ageGroup) {
      const ageGroups = queryParams.ageGroup.split(',').map(a => a.trim());
      query.ageGroup = { $in: ageGroups.map(a => new RegExp(a, 'i')) };
    }

    // FABRIC FILTER
    if (queryParams.fabric) {
      const fabrics = queryParams.fabric.split(',').map(f => f.trim());
      query.fabric = { $in: fabrics.map(f => new RegExp(f, 'i')) };
    }

    // FIT FILTER
    if (queryParams.fit) {
      const fits = queryParams.fit.split(',').map(f => f.trim());
      query.fit = { $in: fits };
    }

    // CLOTHING TYPE FILTER
    if (queryParams.clothingType) {
      const clothingTypes = queryParams.clothingType.split(',').map(t => t.trim());
      query.clothingType = { $in: clothingTypes.map(t => new RegExp(t, 'i')) };
    }

    // FEATURED/BESTSELLER/NEW ARRIVAL FILTERS
    if (queryParams.isFeatured === 'true') query.isFeatured = true;
    if (queryParams.isBestSeller === 'true') query.isBestSeller = true;
    if (queryParams.isNewArrival === 'true') query.isNewArrival = true;

    // STOCK AVAILABILITY - FIXED
    if (queryParams.inStock === 'true') {
      query["variants.stock"] = { $gt: 0 };
    }

    // ============ 4. DEBUG: LOG FINAL QUERY ============
    console.log("Final MongoDB Query:", JSON.stringify(query, null, 2));

    // ============ 5. SORTING ============
    let sortBy = { createdAt: -1 };
    
    if (queryParams.sort) {
      switch(queryParams.sort) {
        case "price_low": sortBy = { sellingPrice: 1 }; break;
        case "price_high": sortBy = { sellingPrice: -1 }; break;
        case "rating": sortBy = { rating: -1 }; break;
        case "popular": sortBy = { viewCount: -1 }; break;
        case "discount": sortBy = { discount: -1 }; break; // Fixed: discount not discountPercentage
        case "newest": sortBy = { createdAt: -1 }; break;
        case "oldest": sortBy = { createdAt: 1 }; break;
        case "best_seller": sortBy = { soldCount: -1 }; break;
      }
    }

    // ============ 6. PAGINATION ============
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 12;
    const skip = (page - 1) * limit;

    // ============ 7. EXECUTE QUERY ============
    console.log("Executing query with sort:", sortBy);
    
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');

    const totalProducts = await Product.countDocuments(query);

    console.log(`Found ${products.length} products out of ${totalProducts} total`);

    // ============ 8. FORMAT RESPONSE ============
    const formattedProducts = products.map(product => 
      product.getProductCardData ? product.getProductCardData() : product
    );

    const response = {
      success: true,
      message: "Products fetched successfully",
      data: {
        products: formattedProducts,
        pagination: {
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < Math.ceil(totalProducts / limit),
          hasPrevPage: page > 1
        },
        filtersApplied: Object.keys(queryParams).filter(key => !['page', 'limit', 'sort', 'includeFilters'].includes(key))
      }
    };

    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        query: query,
        queryParams: queryParams
      };
    }

    res.status(200).json(response);

  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



// ==================== GET AVAILABLE FILTER OPTIONS ====================
const getAvailableFilters = async (categoryId, currentQuery) => {
  try {
    // Remove pagination fields
    const filterQuery = { ...currentQuery };
    delete filterQuery.limit;
    delete filterQuery.skip;
    delete filterQuery.sort;

    const products = await Product.find(filterQuery);

    // Extract unique values with counts
    const colors = [...new Set(products.flatMap(p => p.colors))];
    const sizes = [...new Set(products.flatMap(p => p.sizes))];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const fabrics = [...new Set(products.map(p => p.fabric).filter(Boolean))];
    const genders = [...new Set(products.map(p => p.gender).filter(Boolean))];
    const ageGroups = [...new Set(products.map(p => p.ageGroup).filter(Boolean))];
    const clothingTypes = [...new Set(products.map(p => p.clothingType).filter(Boolean))];

    // Price range
    const prices = products.map(p => p.getMinPrice()).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Discounts
    const discounts = [...new Set(products.map(p => p.discount).filter(d => d > 0))].sort((a, b) => a - b);

    // Ratings
    const ratings = [...new Set(products.map(p => Math.floor(p.rating)).filter(r => r > 0))].sort((a, b) => a - b);

    return {
      priceRange: { min: minPrice, max: maxPrice },
      discounts: discounts.map(d => ({ value: d.toString(), count: products.filter(p => p.discount >= d).length })),
      ratings: ratings.map(r => ({ value: r.toString(), count: products.filter(p => Math.floor(p.rating) >= r).length })),
      colors: colors.map(c => ({ value: c, count: products.filter(p => p.colors.includes(c)).length })),
      sizes: sizes.map(s => ({ value: s, count: products.filter(p => p.sizes.includes(s)).length })),
      brands: brands.map(b => ({ value: b, count: products.filter(p => p.brand === b).length })),
      fabrics: fabrics.map(f => ({ value: f, count: products.filter(p => p.fabric === f).length })),
      genders: genders.map(g => ({ value: g, count: products.filter(p => p.gender === g).length })),
      ageGroups: ageGroups.map(a => ({ value: a, count: products.filter(p => p.ageGroup === a).length })),
      clothingTypes: clothingTypes.map(c => ({ value: c, count: products.filter(p => p.clothingType === c).length }))
    };
  } catch (error) {
    console.error("Get filter options error:", error);
    return {};
  }
};

// ==================== GET SINGLE PRODUCT ====================
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('reviews');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product.getProductDetailData()
    });

  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product"
    });
  }
};

// ==================== GET RELATED PRODUCTS ====================
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: productId },
      status: "published",
      blacklisted: false
    })
    .limit(8)
    .sort({ rating: -1, createdAt: -1 });

    const formattedProducts = relatedProducts.map(p => p.getProductCardData());

    res.status(200).json({
      success: true,
      data: formattedProducts
    });

  } catch (error) {
    console.error("Get related products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch related products"
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
  getProductStats,
  getProductsByCategory,
  getProductBySlug,
  getRelatedProducts
};