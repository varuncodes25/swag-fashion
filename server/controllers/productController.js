const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;
const { resolveTagsForFilter } = require("../constants/productTagGroups");

/** Support both names: CLOUDINARY_* (docs) and CLOUD_* (Render / legacy). */
function getCloudinaryCloudName() {
  return (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUD_NAME ||
    ""
  ).trim();
}
function getCloudinaryApiKey() {
  return (
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUD_API_KEY ||
    ""
  ).trim();
}
function getCloudinaryApiSecret() {
  return (
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUD_API_SECRET ||
    ""
  ).trim();
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: getCloudinaryCloudName(),
  api_key: getCloudinaryApiKey(),
  api_secret: getCloudinaryApiSecret(),

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
  keep_alive: true,
});

// Additional: Global axios timeout (agar Cloudinary axios use karta hai)
require("axios").defaults.timeout = 120000;

function isCloudinaryConfigured() {
  return Boolean(
    getCloudinaryCloudName() &&
      getCloudinaryApiKey() &&
      getCloudinaryApiSecret(),
  );
}

function respondCloudinaryMissing(res) {
  return res.status(503).json({
    success: false,
    code: "CLOUDINARY_NOT_CONFIGURED",
    message:
      "Cloudinary is not set on this server. Add either CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET, or the same values under CLOUD_NAME + CLOUD_API_KEY + CLOUD_API_SECRET (Render), then redeploy.",
  });
}

function isLikelyCloudinaryAuthError(err) {
  const msg = `${err?.message || ""} ${err?.http_code || ""} ${err?.error?.message || ""}`;
  return /api key|Invalid|invalid|401|403|credentials|Unauthorized|not allowed/i.test(
    msg,
  );
}

// Helper function to get color code
function getColorCode(colorName) {
  const colorMap = {
    Red: "#FF0000",
    Blue: "#0000FF",
    Green: "#008000",
    Black: "#000000",
    White: "#FFFFFF",
    Gray: "#808080",
    Yellow: "#FFFF00",
    Pink: "#FFC0CB",
    Purple: "#800080",
    Orange: "#FFA500",
    Brown: "#A52A2A",
    Navy: "#000080",
    Maroon: "#800000",
    Teal: "#008080",
    Olive: "#808000",
    Beige: "#F5F5DC",
    Cream: "#FFFDD0",
    Khaki: "#C3B091",
  };

  return colorMap[colorName] || "#000000";
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseCsvParam(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function applyExactEnumFilter(query, field, paramValue) {
  const values = parseCsvParam(paramValue);
  if (values.length === 0) return;
  query[field] = {
    $in: values.map((v) => new RegExp(`^${escapeRegex(v)}$`, "i")),
  };
}

const DESIGN_PATTERN_REGEXES = [
  "Graphic",
  "Printed",
  "Abstract",
  "Geometric",
  "Floral",
  "Striped",
  "Checked",
  "Plaid",
  "Embroidered",
  "Sequined",
  "Tie-Dye",
  "Camouflage",
  "Animal Print",
  "Paisley",
  "Ethnic",
  "Polka Dot",
  "Houndstooth",
].map((v) => new RegExp(`^${escapeRegex(v)}$`, "i"));

const DESIGN_NAME_REGEX =
  /graphic|anime|print(?:ed)?|typography|logo|slogan|cartoon|illustration/i;

const STYLE_PRESET_TAG_FALLBACKS = {
  graphic: "Graphic",
  solids: "Solids",
  minimalist: "Minimalist",
  "acid-wash": "Acid Wash",
};

function tagFallbackMatch(tagName) {
  return { tags: new RegExp(`^${escapeRegex(tagName)}$`, "i") };
}

function applyStylePreset(query, style) {
  const styleKey = String(style).toLowerCase();
  const tagFallback = STYLE_PRESET_TAG_FALLBACKS[styleKey];
  const and = [{ pattern: { $nin: DESIGN_PATTERN_REGEXES } }];

  switch (styleKey) {
    case "solids":
      and.unshift({ pattern: { $in: [/^Solid$/i] } });
      break;
    case "minimalist":
      and.unshift({ pattern: { $in: [/^Plain$/i, /^Solid$/i] } });
      break;
    case "acid-wash":
      and.unshift(
        { washType: { $in: [/^Acid Wash$/i] } },
        { pattern: { $in: [/^Solid$/i, /^Plain$/i] } },
      );
      break;
    case "graphic": {
      const fieldMatch = {
        pattern: { $in: [/^Graphic$/i, /^Printed$/i] },
      };
      query.$and = query.$and || [];
      query.$and.push(
        tagFallback
          ? { $or: [fieldMatch, tagFallbackMatch(tagFallback)] }
          : fieldMatch,
      );
      return;
    }
    default:
      return;
  }

  and.push({ name: { $not: DESIGN_NAME_REGEX } });
  const fieldMatch = { $and: and };
  query.$and = query.$and || [];
  query.$and.push(
    tagFallback
      ? { $or: [fieldMatch, tagFallbackMatch(tagFallback)] }
      : fieldMatch,
  );
}

function resolveProductSort(sort) {
  switch (sort) {
    case "priceLowToHigh":
    case "price_low":
      return { sellingPrice: 1, createdAt: -1 };
    case "priceHighToLow":
    case "price_high":
      return { sellingPrice: -1, createdAt: -1 };
    case "rating":
      return { rating: -1, createdAt: -1 };
    case "best_seller":
      return { soldCount: -1, createdAt: -1 };
    case "discount":
      return { discount: -1, createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "popular":
      return { viewCount: -1, createdAt: -1 };
    case "newest":
    default:
      return { updatedAt: -1, createdAt: -1 };
  }
}

function applyTagsFilter(query, tagsParam, tagGroupParam) {
  const tags = resolveTagsForFilter(tagsParam, tagGroupParam);
  if (tags.length === 0) return;
  query.tags = {
    $in: tags.map((t) => new RegExp(`^${escapeRegex(t.trim())}$`, "i")),
  };
}

function applyProductFilters(query, queryParams) {
  const hasStylePreset = Boolean(queryParams.style);
  if (hasStylePreset) {
    applyStylePreset(query, queryParams.style);
  }

  applyExactEnumFilter(query, "fit", queryParams.fit);
  if (!hasStylePreset) {
    applyExactEnumFilter(query, "pattern", queryParams.pattern);
  }
  applyExactEnumFilter(query, "sleeveType", queryParams.sleeveType);
  applyExactEnumFilter(query, "neckType", queryParams.neckType);
  applyExactEnumFilter(query, "fabric", queryParams.fabric);
  if (!hasStylePreset) {
    applyExactEnumFilter(query, "washType", queryParams.washType);
  }

  if (queryParams.search && queryParams.search.trim() !== "") {
    const keyword = queryParams.search.trim();
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { brand: { $regex: keyword, $options: "i" } },
      { clothingType: { $regex: keyword, $options: "i" } },
      { tags: { $regex: keyword, $options: "i" } },
    ];
  }

  applyTagsFilter(query, queryParams.tags, queryParams.tagGroup);

  if (queryParams.priceRange) {
    const priceRanges = queryParams.priceRange.split(",");
    const priceConditions = [];
    priceRanges.forEach((range) => {
      const [min, max] = range.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        priceConditions.push({
          "variants.sellingPrice": { $gte: min, $lte: max },
        });
      }
    });
    if (priceConditions.length === 1) {
      Object.assign(query, priceConditions[0]);
    } else if (priceConditions.length > 1) {
      query.$or = query.$or || [];
      query.$or.push(...priceConditions);
    }
  }

  if (queryParams.discount) {
    const discounts = queryParams.discount
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));
    if (discounts.length > 0) query.discount = { $in: discounts };
  }

  if (queryParams.rating) {
    const ratings = queryParams.rating
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));
    if (ratings.length > 0) query.rating = { $in: ratings };
  }

  if (queryParams.colors) {
    const colors = queryParams.colors
      .split(",")
      .map((c) => c.trim().toLowerCase());
    query.colors = {
      $in: colors.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i")),
    };
  }

  const sizeParam = queryParams.size || queryParams.sizes;
  if (sizeParam) {
    const sizes = sizeParam.split(",").map((s) => s.toUpperCase().trim());
    query.sizes = { $in: sizes };
  }

  const brandParam = queryParams.brand || queryParams.brands;
  if (brandParam) {
    const brands = parseCsvParam(brandParam);
    query.brand = { $in: brands.map((b) => new RegExp(escapeRegex(b), "i")) };
  }

  if (queryParams.gender) {
    const genders = queryParams.gender
      .split(",")
      .map((g) => g.trim().toLowerCase());
    query.gender = { $in: genders.map((g) => new RegExp(`^${escapeRegex(g)}$`, "i")) };
  }

  if (queryParams.ageGroup) {
    const ageGroups = parseCsvParam(queryParams.ageGroup);
    query.ageGroup = { $in: ageGroups.map((a) => new RegExp(escapeRegex(a), "i")) };
  }

  if (queryParams.clothingType) {
    const CLOTHING_TYPE_ALIASES = {
      "polo shirt": "Polo T-Shirt",
      "polo t shirt": "Polo T-Shirt",
      "polo tee": "Polo T-Shirt",
    };
    const clothingTypes = parseCsvParam(queryParams.clothingType).map((t) => {
      const key = t.trim().toLowerCase();
      return CLOTHING_TYPE_ALIASES[key] || t.trim();
    });
    const clothingTypePatterns = new Set();
    clothingTypes.forEach((t) => {
      clothingTypePatterns.add(t);
      if (t === "Polo T-Shirt") clothingTypePatterns.add("Polo Shirt");
    });
    query.clothingType = {
      $in: [...clothingTypePatterns].map(
        (t) => new RegExp(`^${escapeRegex(t)}$`, "i"),
      ),
    };
  }

  if (queryParams.season) {
    const seasons = parseCsvParam(queryParams.season);
    if (seasons.length > 0) query.season = { $in: seasons };
  }

  applyExactEnumFilter(query, "occasion", queryParams.occasion);

  if (queryParams.isFeatured === "true") query.isFeatured = true;
  if (queryParams.isBestSeller === "true") query.isBestSeller = true;
  if (queryParams.isNewArrival === "true") query.isNewArrival = true;
  if (queryParams.isPremium === "true") query.isPremium = true;
  if (queryParams.excludePremium === "true") query.isPremium = { $ne: true };
  if (queryParams.inStock === "true") query["variants.stock"] = { $gt: 0 };
}

const createProduct = async (req, res) => {
  try {
    console.log("🚀 ============ CREATE PRODUCT STARTED ============");
    console.log(req.body);
    const {
      name,
      description,
      shortDescription,
      category,
      clothingType,
      gender,
      fabric,
      brand,
      colors,
      sizes,
      basePrice,
      colorCodes,
      colorImageMap,
      ageGroup = "Adult",
      productFamily,
      fabricComposition = "100% Cotton",
      fit = "Regular",
      pattern = "Solid",
      washType = "Not Applicable",
      discount = 0,
      offerTitle,
      offerDescription,
      offerValidFrom,
      offerValidTill,
      freeShipping = false,
      season = "All Season",
      occasion = "Casual",
      tags = [],
      features = [],
      packageContent = "1 Piece",
      countryOfOrigin = "India",
      careInstructions,
      productDimensions,
      warranty = "No Warranty",
      returnPolicy = "7 Days Return Available",
      variants,
    } = req.body;

    // ============ VALIDATION ============
    if (
      !name ||
      !description ||
      !category ||
      !clothingType ||
      !gender ||
      !fabric ||
      !brand
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }
    if (!variants || variants.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one variant is required." });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image." });
    }

    if (!isCloudinaryConfigured()) {
      return respondCloudinaryMissing(res);
    }

    // ============ PARSING HELPER ============
    const parse = (data, def) =>
      !data
        ? def
        : Array.isArray(data)
          ? data
          : (() => {
            try {
              return JSON.parse(data);
            } catch {
              return def;
            }
          })();
    const sleeveType = req.body.sleeveType;
    const neckType = req.body.neckType;
    const bottomStyle = req.body.bottomStyle;
    const waistType = req.body.waistType;
    const bottomLength = req.body.bottomLength;
    const pocketStyle = req.body.pocketStyle;
    const hemStyle = req.body.hemStyle;
    const bottomClosure = req.body.bottomClosure;
    // ============ PARSE ALL DATA ============
    const colorsArray = parse(colors, []);
    const sizesArray = parse(sizes, []);
    const featuresArray = parse(features, []);
    const colorCodesArray = parse(colorCodes, []);
    const colorImageMapping = parse(colorImageMap, {});
    const seasonArray = parse(season, ["All Season"]);
    const occasionArray = parse(occasion, ["Casual"]);
    const tagsArray = parse(tags, [])
      .map((t) => String(t ?? "").trim())
      .filter(Boolean);
    const careInstructionsArray = parse(careInstructions, ["Machine Wash"]);

    // ============ PARSE VARIANTS ============
    let variantsArray = [];
    if (variants) {
      if (typeof variants === "string") {
        try {
          variantsArray = JSON.parse(variants);
        } catch (e) {
          console.error("❌ Failed to parse variants:", e);
        }
      } else if (Array.isArray(variants)) {
        variantsArray = variants;
      }
    }

    // Parse dimensions
    const parsedDimensions = productDimensions
      ? typeof productDimensions === "string"
        ? JSON.parse(productDimensions)
        : productDimensions
      : { length: 30, width: 25, height: 3, weight: 0.3 };

    // ============ UPLOAD IMAGES ============
    const uploadedImages = await Promise.all(
      req.files.map(async (file, index) => {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "clothing/products",
              transformation: [{ width: 800, height: 800, crop: "limit" }],
            },
            (error, result) => (error ? reject(error) : resolve(result)),
          );
          stream.end(file.buffer);
        });
        return {
          url: result.secure_url,
          id: result.public_id,
          isMain: index === 0,
          sortOrder: index,
        };
      }),
    );

    // Fit from form (default Regular only if missing)
    const productFit = (req.body.fit || fit || "Regular").trim();

    // ============ CREATE PRODUCT ============
    const product = new Product({
      // Basic Info
      name,
      description,
      shortDescription: shortDescription || description.substring(0, 150),
      category,
      clothingType,
      gender,
      ageGroup,
      ...(productFamily ? { productFamily } : {}),
      fabric,
      fabricComposition,

      // ✅ TOP WEAR FIELDS
      fit: productFit,
      pattern,
      washType,
      sleeveType,
      neckType,

      // ✅ BOTTOM WEAR FIELDS
      bottomStyle,
      waistType,
      bottomLength,
      pocketStyle,
      hemStyle,
      bottomClosure,

      brand,

      // Arrays
      season: seasonArray,
      occasion: occasionArray,
      tags: tagsArray,
      features: featuresArray,
      careInstructions: careInstructionsArray,

      // Dimensions
      productDimensions: parsedDimensions,

      // Images
      allImages: uploadedImages.map((img, idx) => ({
        ...img,
        color: colorsArray[0] || "Default",
        colorCode: colorCodesArray[0] || "#808080",
      })),

      // Variants
      variants: variantsArray.map((v) => ({
        color: v.color,
        colorCode: v.colorCode,
        size: v.size,
        price: parseFloat(v.price || basePrice),
        stock: v.stock || 0,
        sizeDetails: v.sizeDetails || {},
      })),

      // Offer & Discount
      discount: parseInt(discount) || 0,
      offerTitle,
      offerDescription,
      offerValidFrom: offerValidFrom ? new Date(offerValidFrom) : null,
      offerValidTill: offerValidTill ? new Date(offerValidTill) : null,
      freeShipping: freeShipping === "true" || freeShipping === true,
      isFeatured:
        req.body.isFeatured === "true" || req.body.isFeatured === true,
      isNewArrival:
        req.body.isNewArrival === undefined ||
        req.body.isNewArrival === "true" ||
        req.body.isNewArrival === true,
      isBestSeller:
        req.body.isBestSeller === "true" || req.body.isBestSeller === true,
      isPremium: req.body.isPremium === "true" || req.body.isPremium === true,

      // Other
      warranty,
      returnPolicy,
      packageContent,
      countryOfOrigin,
      createdBy: req.userId,
      status: "published",
    });

    // ============ FIX COLOR-IMAGE MAPPING ============
    if (Object.keys(colorImageMapping).length > 0) {
      const fixedImages = [];
      const colorToIndex = {};

      Object.entries(colorImageMapping).forEach(([color, indices]) => {
        colorToIndex[color] = indices;
      });

      colorsArray.forEach((color) => {
        const indices = colorToIndex[color] || [];
        indices.forEach((idx) => {
          if (idx < uploadedImages.length) {
            fixedImages.push({
              ...uploadedImages[idx],
              color,
              colorCode:
                colorCodesArray[colorsArray.indexOf(color)] || "#808080",
            });
          }
        });
      });

      product.allImages = fixedImages;
    }

    // ============ SAVE ============
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product.getProductDetailData(),
    });
  } catch (error) {
    console.error("❌ Error:", error);
    if (isLikelyCloudinaryAuthError(error)) {
      return res.status(503).json({
        success: false,
        code: "CLOUDINARY_AUTH_FAILED",
        message:
          "Cloudinary rejected the upload (wrong API key/secret or cloud name). Copy CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from Cloudinary dashboard into Render Environment — no spaces or quotes around values.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// ==================== GET ALL PRODUCTS ====================
const getProducts = async (req, res) => {
  try {
    let { page, limit, category, price, search, sort } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;

    // Base query
    const query = {
      status: "published",
      blacklisted: false,
      isVisible: { $ne: false },
    };

    // Filters
    if (category && category.toLowerCase() !== "all") {
      const categoryDoc = await Category.findOne({
        $or: [
          { slug: category.trim().toLowerCase() },
          { name: { $regex: new RegExp(`^${category.trim()}$`, "i") } },
        ],
      });
      if (categoryDoc) query.category = categoryDoc._id;
    }
    if (price && !isNaN(price)) query.price = { $lte: Number(price) };

    if (req.query.clothingType) {
      const types = req.query.clothingType.split(",").map((t) => t.trim());
      query.clothingType = { $in: types.map((t) => new RegExp(t, "i")) };
    }
    if (req.query.gender) {
      const genders = req.query.gender
        .split(",")
        .map((g) => g.trim().toLowerCase());
      query.gender = { $in: genders.map((g) => new RegExp(`^${g}$`, "i")) };
    }
    if (req.query.washType) {
      const washTypes = req.query.washType
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);
      if (washTypes.length > 0) {
        query.washType = { $in: washTypes.map((w) => new RegExp(`^${w}$`, "i")) };
      }
    }
    if (req.query.season) {
      const seasons = req.query.season
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (seasons.length > 0) {
        query.season = { $in: seasons };
      }
    }
    if (req.query.occasion) {
      applyExactEnumFilter(query, "occasion", req.query.occasion);
    }
    if (req.query.tags || req.query.tagGroup) {
      applyTagsFilter(query, req.query.tags, req.query.tagGroup);
    }

    if (req.query.isPremium === "true") query.isPremium = true;
    if (req.query.excludePremium === "true") {
      query.isPremium = { $ne: true };
    }
    if (req.query.isFeatured === "true") query.isFeatured = true;
    if (req.query.isBestSeller === "true") query.isBestSeller = true;
    if (req.query.isNewArrival === "true") query.isNewArrival = true;
    if (req.query.inStock === "true") {
      query["variants.stock"] = { $gt: 0 };
    }

    applyProductFilters(query, req.query);

    const sortBy = resolveProductSort(sort);

    const skip = (page - 1) * limit;

    // Get total count
    const totalProducts = await Product.countDocuments(query);

    // ✅ CORRECT: Get products as Mongoose documents (NOT .lean())
    let products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);
    // ❌ REMOVE: .lean() - We need Mongoose documents for methods

    const enhancedProducts = products.map((product) => {
      // ✅ This returns ALL card data including image
      const cardData = product.getProductCardData();

      return cardData;
    });

    const totalPages = Math.ceil(totalProducts / limit);

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
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// ==================== GET PRODUCT BY ID ====================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("reviews");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.blacklisted || product.status !== "published" || product.isVisible === false) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Use the model method to get product details
    const productData = product.getProductDetailData();

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productData,
    });
  } catch (err) {
    console.error("Get product by ID error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getProductByIdForAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subCategory")
      .populate("reviews")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Admin method use karo
    const productData = product.getAdminProductData();

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productData,
    });
  } catch (err) {
    console.error("Get product by ID error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ==================== GET PRODUCTS FOR ADMIN ====================
const getProductsforadmin = async (req, res) => {
  try {
    let {
      page,
      limit,
      category,
      price,
      search,
      sort,
      minPrice,
      maxPrice,
      gender,
      inStock,
    } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;

    // ==================== BASE AGGREGATION PIPELINE ====================
    const pipeline = [];

    // ==================== MATCH STAGE (FILTERS) ====================
    const matchStage = {};

    // 1️⃣ CATEGORY FILTER
    if (category && category.toLowerCase() !== "all") {
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category.trim()}$`, "i") },
      });

      if (categoryDoc) {
        matchStage.category = categoryDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          message: "Products fetched successfully",
          data: [],
          pagination: {
            totalProducts: 0,
            totalPages: 0,
            currentPage: page,
            pageSize: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }
    }

    // 2️⃣ SEARCH FILTER
    if (search && search.trim() !== "") {
      matchStage.name = { $regex: search.trim(), $options: "i" };
    }

    // 3️⃣ GENDER FILTER
    if (gender && gender !== "all") {
      matchStage.gender = gender;
    }

    // 4️⃣ IN STOCK FILTER
    if (inStock && inStock !== "all") {
      if (inStock === "true") {
        matchStage["variants.stock"] = { $gt: 0 };
      } else if (inStock === "false") {
        matchStage["variants.stock"] = { $lte: 0 };
      }
    }

    // Add match stage to pipeline
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // ==================== PRICE FILTER (CRITICAL FIX) ====================
    // Price filter variants ke andar se check karna hoga
    if (price && !isNaN(price)) {
      pipeline.push({
        $match: {
          "variants.sellingPrice": { $lte: Number(price) },
        },
      });
    }

    // Min-Max Price Filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice && !isNaN(minPrice)) priceFilter.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) priceFilter.$lte = Number(maxPrice);

      pipeline.push({
        $match: {
          "variants.sellingPrice": priceFilter,
        },
      });
    }

    // ==================== ADD MIN SELLING PRICE FIELD ====================
    pipeline.push({
      $addFields: {
        minSellingPrice: {
          $min: "$variants.sellingPrice",
        },
      },
    });

    // ==================== SORTING ====================
    if (sort === "priceLowToHigh") {
      pipeline.push({ $sort: { minSellingPrice: 1 } });
    } else if (sort === "priceHighToLow") {
      pipeline.push({ $sort: { minSellingPrice: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // Default
    }

    // ==================== GET TOTAL COUNT ====================
    // Count ke liye alag pipeline
    const countPipeline = [...pipeline];
    // Remove sorting and pagination from count pipeline
    const finalCountPipeline = countPipeline.filter(
      (stage) => !stage.$sort && !stage.$skip && !stage.$limit,
    );

    const countResult = await Product.aggregate([
      ...finalCountPipeline,
      { $count: "total" },
    ]);

    const totalProducts = countResult.length > 0 ? countResult[0].total : 0;

    // ==================== PAGINATION ====================
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    // ==================== EXECUTE AGGREGATION ====================
    let products = await Product.aggregate(pipeline);

    // Convert to Mongoose documents for methods
    products = products.map((p) => new Product(p));

    // ==================== ENHANCE PRODUCTS ====================
    const enhancedProducts = products.map((product) => {
      const cardData = product.getProductCardData();
      return cardData;
    });

    const totalPages = Math.ceil(totalProducts / limit);

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
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};
// ==================== UPDATE PRODUCT ====================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    console.log("🔄 Updating product:", id);
    console.log("📦 Received data keys:", Object.keys(data));

    // ============ HELPER FUNCTION FOR PARSING ============
    const parse = (item) => {
      if (!item) return null;
      if (typeof item === "string") {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return item;
    };

    // ============ PARSE ALL FIELDS ============
    const fieldsToParse = [
      "variants",
      "colors",
      "sizes",
      "colorCodes",
      "colorImageMap",
      "existingImages",
      "imageOrder",
      "specifications",
      "features",
      "season",
      "occasion",
      "tags",
      "careInstructions",
      "keyFeatures",
      "stockMatrix",
      "productDimensions",
    ];

    fieldsToParse.forEach((field) => {
      if (data[field] !== undefined) {
        data[field] = parse(data[field]);
      }
    });

    const OCCASION_VALUES = Product.schema.path("occasion").caster.enumValues;
    if (data.occasion !== undefined && data.occasion !== null) {
      const rawOccasions = Array.isArray(data.occasion)
        ? data.occasion
        : parseCsvParam(String(data.occasion));
      data.occasion = rawOccasions
        .map((value) => {
          const text = String(value ?? "").trim();
          if (!text) return null;
          return (
            OCCASION_VALUES.find(
              (allowed) => allowed.toLowerCase() === text.toLowerCase(),
            ) || text
          );
        })
        .filter(Boolean);
    }

    if (data.tags !== undefined && data.tags !== null) {
      const rawTags = Array.isArray(data.tags)
        ? data.tags
        : parseCsvParam(String(data.tags));
      data.tags = [...new Set(
        rawTags
          .map((value) => String(value ?? "").trim())
          .filter(Boolean),
      )];
    }

    // ============ CONVERT TYPES ============
    if (data.basePrice) data.basePrice = Number(data.basePrice);
    if (data.discount) data.discount = Number(data.discount);
    if (data.returnWindow) data.returnWindow = Number(data.returnWindow);
    if (data.handlingTime) data.handlingTime = Number(data.handlingTime);
    if (data.estimatedDelivery)
      data.estimatedDelivery = Number(data.estimatedDelivery);

    // Boolean fields
    const booleanFields = [
      "freeShipping",
      "isFeatured",
      "isNewArrival",
      "isBestSeller",
      "isPremium",
    ];
    booleanFields.forEach((field) => {
      if (data[field] !== undefined) {
        data[field] = data[field] === "true" || data[field] === true;
      }
    });

    // Date fields
    if (data.offerValidFrom)
      data.offerValidFrom = new Date(data.offerValidFrom);
    if (data.offerValidTill)
      data.offerValidTill = new Date(data.offerValidTill);

    // ============ GET EXISTING PRODUCT ============
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ============ HANDLE IMAGES ============
    let allImages = [...(product.allImages || [])];
    let existingImageIds = [];

    if (data.existingImages !== undefined) {
      try {
        existingImageIds = Array.isArray(data.existingImages)
          ? data.existingImages
          : JSON.parse(data.existingImages);
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
        existingImageIds = [];
      }
    }

    const imageOrder = Array.isArray(data.imageOrder) ? data.imageOrder : null;
    const oldImagesById = new Map(
      (product.allImages || [])
        .filter((img) => img?.id)
        .map((img) => [img.id, img]),
    );
    const oldImagesByUrl = new Map(
      (product.allImages || [])
        .filter((img) => img?.url)
        .map((img) => [img.url, img]),
    );

    let newUploadedImages = [];
    if (req.files && req.files.length > 0) {
      if (!isCloudinaryConfigured()) {
        return respondCloudinaryMissing(res);
      }
      console.log(`📸 Uploading ${req.files.length} new images...`);

      newUploadedImages = await Promise.all(
        req.files.map(async (file, index) => {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "clothing/products",
                transformation: [{ width: 800, height: 800, crop: "limit" }],
              },
              (error, result) => (error ? reject(error) : resolve(result)),
            );
            stream.end(file.buffer);
          });

          return {
            url: result.secure_url,
            id: result.public_id,
            isMain: false,
            sortOrder: index,
          };
        }),
      );
    }

    const expectsNewUploads =
      imageOrder?.some((entry) => entry.type === "new") ?? false;

    if (imageOrder && imageOrder.length > 0) {
      allImages = [];
      imageOrder.forEach((entry, index) => {
        if (entry.type === "existing") {
          let existingImg = null;
          if (entry.id && oldImagesById.has(entry.id)) {
            existingImg = oldImagesById.get(entry.id);
          } else if (entry.url && oldImagesByUrl.has(entry.url)) {
            existingImg = oldImagesByUrl.get(entry.url);
          } else if (entry.url) {
            existingImg = (product.allImages || []).find(
              (img) => img.url === entry.url,
            );
          }
          if (existingImg) {
            allImages.push({
              ...existingImg,
              sortOrder: index,
            });
          }
        } else if (
          entry.type === "new" &&
          typeof entry.fileIndex === "number" &&
          newUploadedImages[entry.fileIndex]
        ) {
          allImages.push({
            ...newUploadedImages[entry.fileIndex],
            sortOrder: index,
          });
        }
      });

      if (expectsNewUploads && newUploadedImages.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "New images were not uploaded. Please try again or check Cloudinary settings on the server.",
        });
      }

      if (allImages.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "No images could be saved. Remove old images, upload new ones, and try again.",
        });
      }
    } else {
      if (data.existingImages !== undefined) {
        if (existingImageIds.length > 0) {
          allImages = allImages.filter((img) =>
            existingImageIds.includes(img.id),
          );
        } else {
          allImages = [];
        }
      }

      if (newUploadedImages.length > 0) {
        const startIndex = allImages.length;
        allImages = [
          ...allImages,
          ...newUploadedImages.map((img, index) => ({
            ...img,
            sortOrder: startIndex + index,
          })),
        ];
      }
    }

    // Apply color-image mapping
    if (data.colorImageMap && Object.keys(data.colorImageMap).length > 0) {
      console.log("🎨 Applying color-image mapping...");
      const colorImageMap = data.colorImageMap;
      const colorsArray = data.colors || product.colors;
      const colorCodesArray = data.colorCodes || [];

      const fixedImages = [];
      let mainImageSet = false;

      Object.entries(colorImageMap).forEach(([color, indices]) => {
        const colorIndex = colorsArray.indexOf(color);
        const colorCode = colorCodesArray[colorIndex] || "#808080";

        if (Array.isArray(indices)) {
          indices.forEach((idx) => {
            if (idx < allImages.length) {
              const img = { ...allImages[idx], color, colorCode };
              if (!mainImageSet) {
                img.isMain = true;
                mainImageSet = true;
              } else {
                img.isMain = false;
              }
              fixedImages.push(img);
            }
          });
        }
      });

      if (fixedImages.length > 0) {
        allImages = fixedImages;
      }
    }

    // Ensure at least one main image
    if (allImages.length > 0 && !allImages.some((img) => img.isMain)) {
      allImages[0].isMain = true;
    }

    data.allImages = allImages;

    // ============ REMOVE FIELDS THAT SHOULDN'T BE UPDATED DIRECTLY ============
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.slug; // Let pre-save regenerate if needed
    delete data.createdBy;
    delete data.existingImages;
    delete data.imageOrder;

    // ============ MERGE DATA INTO EXISTING PRODUCT ============
    Object.assign(product, data);

    const updateFit =
      data.fit != null && String(data.fit).trim()
        ? String(data.fit).trim()
        : req.body.fit != null && String(req.body.fit).trim()
          ? String(req.body.fit).trim()
          : null;
    if (updateFit) {
      product.fit = updateFit;
    }

    // ============ SAVE PRODUCT (TRIGGERS MIDDLEWARE) ============
    console.log("💾 Saving product with middleware...", { fit: product.fit });
    await product.save();

    console.log("✅ Product updated successfully");
    console.log(`📊 Total variants: ${product.variants.length}`);
    console.log(`📸 Total images: ${product.allImages.length}`);

    // ============ RESPONSE ============
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product.getProductDetailData(),
    });
  } catch (error) {
    console.error("❌ Update product error:", error);

    if (isLikelyCloudinaryAuthError(error)) {
      return res.status(503).json({
        success: false,
        code: "CLOUDINARY_AUTH_FAILED",
        message:
          "Cloudinary rejected the upload. Fix CLOUDINARY_* environment variables on Render (must match Cloudinary dashboard API Keys).",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ==================== DELETE PRODUCT ====================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete product from database (Cloudinary cleanup is manual)
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET PRODUCT BY NAME ====================
const getProductByName = async (req, res) => {
  const { name } = req.params;
  console.log(name);
  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(name, "i") },
    }).populate("reviews");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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
      message: error.message,
    });
  }
};

// ==================== BLACKLIST PRODUCT ====================
const blacklistProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({
      success: false,
      message: "Access denied",
    });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: true },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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
      message: error.message,
    });
  }
};

// ==================== REMOVE FROM BLACKLIST ====================
const removeFromBlacklist = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({
      success: false,
      message: "Access denied",
    });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: false },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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
      message: error.message,
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
        message: "Access denied.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership (for sellers)
    if (
      req.role === ROLES.seller &&
      product.createdBy &&
      product.createdBy.toString() !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
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
        productId: product._id,
      },
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update stock",
    });
  }
};

// ==================== GET PRODUCT STATS ====================
const getProductStats = async (req, res) => {
  try {
    if (req.role !== ROLES.admin && req.role !== ROLES.seller) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
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
          totalViews: { $sum: "$viewCount" },
        },
      },
    ]);

    const clothingTypeStats = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$clothingType",
          count: { $sum: 1 },
          averagePrice: { $avg: { $arrayElemAt: ["$variants.price", 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        ...(stats[0] || {}),
        clothingTypeStats,
        lowStock: await Product.countDocuments({
          ...query,
          "variants.stock": { $lt: 10 },
        }),
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get stats",
    });
  }
};

// ==================== GET PRODUCTS BY CATEGORY WITH FILTERS ====================
const getProductsByCategory = async (req, res) => {
  try {
    const { slug, subSlug } = req.params;
    const queryParams = req.query;
    console.log("Incoming queryParams:", queryParams);

    // ============ 1. FIND CATEGORY (men/women/kids) or legacy path slug ============
    const MAIN_SLUGS = ["men", "women", "kids"];
    const normalizedSlug = (slug || "").toLowerCase().trim();
    const category = MAIN_SLUGS.includes(normalizedSlug)
      ? await Category.findOne({ slug: normalizedSlug })
      : null;

    const query = {
      status: "published",
      blacklisted: false,
      isVisible: { $ne: false },
    };

    if (category) {
      query.category = category._id;
    } else if (slug && !MAIN_SLUGS.includes(normalizedSlug)) {
      // Legacy URLs: /category/T-Shirt/Unisex — slug is clothing type, not category
      const fromPath = decodeURIComponent(slug).trim();
      query.clothingType = {
        $regex: fromPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
      if (subSlug) {
        const g = decodeURIComponent(subSlug).trim().toLowerCase();
        query.gender = { $regex: new RegExp(`^${g}$`, "i") };
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Add subcategory when main category exists
    let subCategory = null;
    if (category && subSlug) {
      subCategory = category.subCategories?.find(
        (sub) => sub.slug === subSlug && sub.isActive !== false,
      );
      if (subCategory) {
        query.subCategory = subCategory._id;
      }
    }
    applyProductFilters(query, queryParams);

    // ============ 4. DEBUG: LOG FINAL QUERY ============
    console.log("Final MongoDB Query:", JSON.stringify(query, null, 2));

    // ============ 5. SORTING ============
    const sortBy = resolveProductSort(queryParams.sort);

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
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    const totalProducts = await Product.countDocuments(query);

    console.log(
      `Found ${products.length} products out of ${totalProducts} total`,
    );

    // ============ 8. FORMAT RESPONSE ============
    const formattedProducts = products.map((product) =>
      product.getProductCardData ? product.getProductCardData() : product,
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
          hasPrevPage: page > 1,
        },
        filtersApplied: Object.keys(queryParams).filter(
          (key) => !["page", "limit", "sort", "includeFilters"].includes(key),
        ),
      },
    };

    if (queryParams.includeFilters === "true") {
      const [
        clothingTypes,
        fits,
        patterns,
        sleeveTypes,
        neckTypes,
        fabrics,
        brands,
        colors,
        sizes,
      ] = await Promise.all([
        Product.distinct("clothingType", query),
        Product.distinct("fit", query),
        Product.distinct("pattern", query),
        Product.distinct("sleeveType", query),
        Product.distinct("neckType", query),
        Product.distinct("fabric", query),
        Product.distinct("brand", query),
        Product.distinct("colors", query),
        Product.distinct("sizes", query),
      ]);

      const cleanValues = (arr) =>
        (arr || [])
          .filter((v) => typeof v === "string" && v.trim().length > 0)
          .map((v) => v.trim())
          .sort((a, b) => a.localeCompare(b));

      response.data.filters = {
        clothingType: cleanValues(clothingTypes),
        fit: cleanValues(fits),
        pattern: cleanValues(patterns),
        sleeveType: cleanValues(sleeveTypes),
        neckType: cleanValues(neckTypes),
        fabric: cleanValues(fabrics),
        brands: cleanValues(brands),
        colors: cleanValues(colors),
        sizes: cleanValues(sizes),
      };
    }

    // Add debug info in development
    if (process.env.NODE_ENV === "development") {
      response.debug = {
        query: query,
        queryParams: queryParams,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ==================== GET SINGLE PRODUCT ====================
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("reviews");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product.getProductDetailData(),
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// ==================== GET RELATED PRODUCTS ====================
const getSimilarProducts = async (req, res) => {
  try {
    console.log("📦 Similar products request:", req.params, req.query);

    let { productId } = req.params;
    let { limit } = req.query;

    // Default limit
    limit = parseInt(limit) || 6;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    console.log("🔍 Getting similar products for:", productId);

    // 1. Find current product
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Get current product's card data (if needed)
    const currentProductCardData = currentProduct.getProductCardData();

    // 3. Build query for similar products
    // यहाँ similarity logic डालो - category, tags, price range, etc.
    const query = {
      _id: { $ne: productId },
      status: "published",
      blacklisted: false,
      isVisible: { $ne: false },
    };

    if (currentProduct.category) {
      query.category = currentProduct.category;
    }
    if (currentProduct.gender) {
      query.gender = new RegExp(`^${String(currentProduct.gender).trim()}$`, "i");
    }
    if (currentProduct.clothingType) {
      query.clothingType = new RegExp(
        `^${String(currentProduct.clothingType).trim()}$`,
        "i",
      );
    }

    // Option 2: Same tags (at least one matching tag)
    // if (currentProduct.tags && currentProduct.tags.length > 0) {
    //   query.tags = { $in: currentProduct.tags };
    // }

    // // Option 3: Similar price range (±20%)
    // const minPrice = currentProduct.price * 0.8;
    // const maxPrice = currentProduct.price * 1.2;
    // query.price = { $gte: minPrice, $lte: maxPrice };

    // 4. Fetch similar products
    const similarProducts = await Product.find(query)
      .limit(limit)
      .sort({
        // Sorting logic - most relevant first
        rating: -1, // Higher rating first
        reviewCount: -1, // More reviews first
        createdAt: -1, // Newer products first
      })
      .lean(); // For better performance

    console.log(`✅ Found ${similarProducts.length} similar products`);

    // 5. Format each product using your existing method
    const formattedProducts = similarProducts.map((product) => {
      // Create a temporary Product instance to call the method
      const productInstance = new Product(product);
      return productInstance.getProductCardData();
    });

    return res.status(200).json({
      success: true,
      message:
        formattedProducts.length > 0
          ? `Found ${formattedProducts.length} similar products`
          : "No similar products found",
      data: formattedProducts,
      currentProduct: currentProductCardData, // Optional: include current product info
    });
  } catch (error) {
    console.error("❌ Get similar products error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/** Clone product with same images/variants — change name & photos on edit page */
const duplicateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await Product.findById(id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const doc = source.toObject();
    delete doc._id;
    delete doc.slug;
    delete doc.__v;
    delete doc.createdAt;
    delete doc.updatedAt;

    doc.name = `${String(source.name).trim()} (Copy)`;
    doc.status = "published";
    doc.soldCount = 0;
    doc.reviewCount = 0;
    doc.rating = 0;
    doc.isNewArrival = true;

    const newProduct = new Product(doc);
    await newProduct.save();

    return res.status(201).json({
      success: true,
      message:
        "Product duplicated. Update the name and swap images if needed, then save.",
      data: {
        _id: newProduct._id,
        name: newProduct.name,
        slug: newProduct.slug,
      },
    });
  } catch (error) {
    console.error("❌ Duplicate product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to duplicate product",
    });
  }
};

const toggleProductVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    if (typeof isVisible !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVisible must be a boolean value",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { isVisible, updatedBy: req.userId },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product ${isVisible ? "shown" : "hidden"} successfully`,
      data: product.getAdminProductData
        ? product.getAdminProductData()
        : product,
    });
  } catch (error) {
    console.error("Toggle product visibility error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update visibility",
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
  getSimilarProducts,
  getProductByIdForAdmin,
  duplicateProduct,
  toggleProductVisibility,
};
