const mongoose = require("mongoose");
const Review = require("./Review");

// Size Chart for Clothing
const sizeChartSchema = new mongoose.Schema({
  chest: { type: Number },
  waist: { type: Number },
  hips: { type: Number },
  length: { type: Number },
  shoulder: { type: Number },
  sleeve: { type: Number }
}, { _id: false });

// Product Image Schema (Centralized)
const productImageSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true 
  },
  id: { 
    type: String, 
    required: true 
  },
  isMain: { 
    type: Boolean, 
    default: false 
  },
  color: { 
    type: String 
  },
  colorCode: { 
    type: String 
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Variant Schema - WITHOUT images
const variantSchema = new mongoose.Schema(
  {
    color: { 
      type: String, 
      required: true,
      trim: true
    },
    colorCode: {
      type: String,
      default: "#000000"
    },
    size: { 
      type: String, 
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"]
    },
    sizeDetails: sizeChartSchema,
    
    stock: { 
      type: Number, 
      required: true,
      min: 0,
      default: 0
    },
    
    // ✅ YE DO FIELDS ADD KARO:
    price: {      // MRP (Admin daalega)
      type: Number, 
      required: true,
      min: 0
    },
    
    sellingPrice: {       // Discount ke baad ka price (Auto calculate)
      type: Number, 
      required: true,
      min: 0
    },
    
    // ❌ 'price' field ko HATA DO ya comment karo
    // price: { type: Number, required: true, min: 0 },
    
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    
    barcode: String,
    
    reservedStock: {
      type: Number,
      default: 0
    }
  },
  { _id: true, timestamps: true }
);

// Main Product Schema - Only Clothing
const productSchema = new mongoose.Schema(
  {
    // ============== BASIC INFO ==============
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    
    // ============== DESCRIPTIONS ==============
    description: { 
      type: String, 
      required: true
    },
    
    shortDescription: {
      type: String,
      maxlength: 200
    },
    
    keyFeatures: {
      type: [String],
      default: []
    },
    
    fullDescription: {
      type: String
    },
    
    // ============== SPECIFICATIONS (STRUCTURED) ==============
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // ============== CENTRALIZED IMAGES STORAGE ==============
    allImages: [productImageSchema],
    
    // Quick lookup map for images by color
    imagesByColor: {
      type: Map,
      of: [{
        url: String,
        id: String,
        isMain: Boolean,
        sortOrder: Number
      }]
    },
    
    // ============== VARIANTS (NO DUPLICATE IMAGES) ==============
    variants: { 
      type: [variantSchema], 
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one variant is required'
      }
    },
    
    // ============== CATEGORY ==============
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory"
    },
    
    // ============== CLOTHING SPECIFIC ==============
    clothingType: {
      type: String,
      enum: [
        "T-Shirt", "Shirt", "Jeans", "Trousers", "Shorts",
        "Jacket", "Sweater", "Hoodie", "Sweatshirt",
        "Dress", "Skirt", "Top", "Kurta", "Sherwani",
        "Saree", "Lehenga", "Blouse", "Track Suit",
        "Innerwear", "Socks", "Cap", "Scarf", "Other"
      ],
      required: true
    },
    
    // ============== AGE GROUP ==============
    ageGroup: {
      type: String,
      required: true,
      enum: ["0-2 Years", "2-4 Years", "4-6 Years", "6-8 Years", "8-10 Years", 
             "10-12 Years", "12-14 Years", "14-16 Years", "16-18 Years", "Adult"],
      default: "Adult"
    },
    
    // ============== GENDER ==============
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Boys", "Girls", "Kids"],
      required: true
    },
    
    // ============== FABRIC & MATERIAL ==============
    fabric: {
      type: String,
      enum: [
        "Cotton", "Polyester", "Silk", "Wool", "Linen",
        "Denim", "Leather", "Nylon", "Rayon", "Spandex",
        "Velvet", "Chiffon", "Georgette", "Crepe", "Satin",
        "Blended", "Other"
      ],
      required: true
    },
    
    fabricComposition: {
      type: String,
      default: "100% Cotton"
    },
    
    // ============== CARE INSTRUCTIONS ==============
    careInstructions: {
      type: [String],
      enum: [
        "Machine Wash", "Hand Wash", "Dry Clean Only",
        "Do Not Bleach", "Tumble Dry Low", "Line Dry",
        "Iron Low Heat", "Do Not Iron", "Dry Flat"
      ],
      default: ["Machine Wash"]
    },
    
    // ============== FIT & STYLE ==============
    fit: {
      type: String,
      enum: ["Regular", "Slim", "Relaxed", "Oversized", "Skinny", "Boyfriend", "Bodycon"],
      default: "Regular"
    },
    
    pattern: {
      type: String,
      enum: [
        "Solid", "Striped", "Checked", "Printed", "Floral",
        "Geometric", "Abstract", "Polka Dot", "Ethnic", "Plain",
        "Embroidered", "Sequined", "Tie-Dye"
      ],
      default: "Solid"
    },
    
    sleeveType: {
      type: String,
      enum: ["Full Sleeve", "Half Sleeve", "Sleeveless", "Short Sleeve", "Three-Quarter", "Puff Sleeve", "Bell Sleeve"],
      default: "Full Sleeve"
    },
    
    neckType: {
      type: String,
      enum: ["Round Neck", "V-Neck", "Polo Neck", "Collared", "Hooded", "Turtleneck", "Square Neck"],
      default: "Round Neck"
    },
    
    // ============== BRAND ==============
    brand: {
      type: String,
      required: true,
      default: "Generic"
    },
    
    // ============== SEASON & OCCASION ==============
    season: {
      type: [String],
      enum: ["Summer", "Winter", "Spring", "Autumn", "All Season", "Monsoon"],
      default: ["All Season"]
    },
    
    occasion: {
      type: [String],
      enum: ["Casual", "Formal", "Party", "Wedding", "Sports", "Beach", "Office", "Travel", "Evening", "Traditional"],
      default: ["Casual"]
    },
    
    // ============== FEATURES ==============
    features: {
      type: [String],
      enum: [
        "Stretchable", "Wrinkle Free", "Quick Dry", "Breathable",
        "Water Resistant", "Anti-Bacterial", "UV Protection",
        "Thermal", "Moisture Wicking", "Odor Resistant",
        "Pocket", "Hood", "Zipper", "Buttons", "Drawstring"
      ],
      default: []
    },
    
    // ============== PACKAGE INFO ==============
    packageContent: {
      type: String,
      default: "1 Piece"
    },
    
    countryOfOrigin: {
      type: String,
      default: "India"
    },
    
    // ============== OFFER & DISCOUNT ==============
    discount: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    },
    
    offerTitle: String,
    offerDescription: String,
    
    // ============== OFFER VALIDITY ==============
    offerValidFrom: {
      type: Date,
      default: null
    },
    
    offerValidTill: {
      type: Date,
      default: null
    },
    
    offerCode: String,
    
    // ============== PRICING ==============
    mrp: { // Maximum Retail Price
      type: Number,
      min: 0
    },
    
    sellingPrice: { // Actual selling price
      type: Number,
      min: 0
    },
    
    // ============== INVENTORY FLAGS ==============
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isNewArrival: { 
      type: Boolean, 
      default: true 
    },
    isBestSeller: { 
      type: Boolean, 
      default: false 
    },
    isTrending: { 
      type: Boolean, 
      default: false 
    },
    
    // ============== SHIPPING ==============
    freeShipping: { 
      type: Boolean, 
      default: false 
    },
    handlingTime: { 
      type: Number, 
      default: 1 
    },
    estimatedDelivery: {
      type: Number,
      default: 7
    },
    
    // ============== RATINGS & REVIEWS ==============
    rating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    reviews: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Review" 
    }],
    
    // ============== SEO & SEARCH ==============
    slug: { 
      type: String, 
      unique: true,
      sparse: true
    },
    metaTitle: String,
    metaDescription: String,
    keywords: { 
      type: [String], 
      default: [] 
    },
    tags: { 
      type: [String], 
      default: [] 
    },
    
    // ============== DIMENSIONS ==============
    productDimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      weight: { type: Number, default: 0.2 }
    },
    
    // ============== STATUS ==============
    status: {
      type: String,
      enum: ["draft", "published", "out_of_stock", "discontinued"],
      default: "draft"
    },
    
    blacklisted: {
      type: Boolean,
      default: false
    },
    
    // ============== ANALYTICS ==============
    viewCount: { 
      type: Number, 
      default: 0 
    },
    soldCount: { 
      type: Number, 
      default: 0 
    },
    wishlistCount: { 
      type: Number, 
      default: 0 
    },
    
    // ============== WARRANTY ==============
    warranty: {
      type: String,
      default: "No Warranty"
    },
    
    // ============== RETURN POLICY ==============
    returnPolicy: {
      type: String,
      default: "7 Days Return Available"
    },
    returnWindow: {
      type: Number,
      default: 7
    },
    
    // ============== ADMIN ==============
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // ============== DERIVED FIELDS ==============
    colors: {
      type: [String],
      default: []
    },
    
    sizes: {
      type: [String],
      default: []
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ clothingType: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ blacklisted: 1 });
productSchema.index({ ageGroup: 1 });
productSchema.index({ offerValidTill: 1 });
productSchema.index({ colors: 1 });
productSchema.index({ sizes: 1 });

// ==================== PRE-SAVE MIDDLEWARE ====================
// ==================== PRE-VALIDATE MIDDLEWARE ====================
// ✅ पहले ये ADD करें (सबसे ऊपर)
productSchema.pre('validate', function(next) {

  
  this.variants.forEach((variant) => {
    // 1. Agar sellingPrice nahi hai ya 0 hai to calculate karo
    if (!variant.sellingPrice || variant.sellingPrice <= 0) {
      if (this.discount > 0) {
        // Product level discount apply करो
        variant.sellingPrice = Math.round(variant.price * (100 - this.discount) / 100);
      } else {
        // No discount
        variant.sellingPrice = variant.price;
      }
    }
    
    // 2. Safety check - kabhi bhi undefined ya 0 na ho
    if (!variant.sellingPrice || variant.sellingPrice <= 0) {
      variant.sellingPrice = variant.price || 100; // Default minimum price
    }
  });
  
  next();
});

// ==================== PRE-SAVE MIDDLEWARE ====================
productSchema.pre('save', function(next) {
  
  // Extract unique colors and sizes from variants
  const colorsSet = new Set();
  const sizesSet = new Set();
  
  this.variants.forEach(variant => {
    if (variant.color) colorsSet.add(variant.color);
    if (variant.size) sizesSet.add(variant.size);
  });
  
  this.colors = Array.from(colorsSet);
  this.sizes = Array.from(sizesSet);
  
  // ✅ पहले SKU generate करो
  this.variants.forEach((variant, index) => {
    if (!variant.sku) {
      const skuPrefix = (this.brand || 'GEN').substring(0, 3).toUpperCase();
      const colorCode = (variant.color || 'XX').substring(0, 2).toUpperCase();
      const sizeCode = variant.size;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      variant.sku = `${skuPrefix}-${randomNum}-${colorCode}-${sizeCode}`;
    }
  });
  
  // ✅ अब discount price और percentage calculate करो
  this.variants.forEach((variant) => {
    // 1. Discount price calculate करो
    variant.discountPrice = Math.max(variant.price - (variant.sellingPrice || variant.price), 0);
    
    // 2. Discount percentage calculate करो
    if (variant.price > 0 && variant.sellingPrice < variant.price) {
      variant.discountPercentage = Math.round(((variant.price - variant.sellingPrice) / variant.price) * 100);
    } else {
      variant.discountPercentage = 0;
    }
    
  });
  
  // Generate slug if not exists
  if (!this.slug) {
    const baseSlug = (this.name || 'product').toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  
  // Set default blacklisted to false if not set
  if (this.blacklisted === undefined) {
    this.blacklisted = false;
  }
  
  // ✅ CORRECT: Product level sellingPrice calculate करो (sabse minimum sellingPrice लो)
  if (this.variants.length > 0) {
    // Sabse minimum SELLING PRICE lo, price nahi
    const minSellingPrice = Math.min(...this.variants.map(v => v.sellingPrice || v.price || 0));
    const maxPrice = Math.max(...this.variants.map(v => v.price || 0));
    
    // Product level prices
    this.sellingPrice = minSellingPrice;
    
    // Calculate MRP with markup (optional)
    if (!this.mrp) {
      this.mrp = Math.round(maxPrice * 1.1); // 10% markup
    }
    
  }
  
  // Organize images by color for quick lookup
  if (this.allImages && this.allImages.length > 0) {
    const imagesMap = new Map();
    
    // Group images by color
    this.allImages.forEach((image, index) => {
      if (image.color) {
        if (!imagesMap.has(image.color)) {
          imagesMap.set(image.color, []);
        }
        
        // Add image to map
        imagesMap.get(image.color).push({
          url: image.url,
          id: image.id,
          isMain: image.isMain,
          sortOrder: image.sortOrder || index
        });
      }
    });
    
    // Sort images in each color group by sortOrder
    imagesMap.forEach((images, color) => {
      images.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    
    this.imagesByColor = imagesMap;
  }
  
  next();
});


// ==================== VIRTUAL PROPERTIES ====================
productSchema.virtual('isInStock').get(function() {
  return this.variants.some(v => v.stock > 0);
});

productSchema.virtual('isOfferActive').get(function() {
  if (this.discount <= 0) return false;
  if (!this.offerValidFrom || !this.offerValidTill) return false;
  
  const now = new Date();
  const validFrom = new Date(this.offerValidFrom);
  const validTill = new Date(this.offerValidTill);
  
  validTill.setHours(23, 59, 59, 999);
  
  return now >= validFrom && now <= validTill;
});

productSchema.virtual('offerDaysLeft').get(function() {
  if (!this.isOfferActive) return 0;
  
  const now = new Date();
  const validTill = new Date(this.offerValidTill);
  const diffTime = validTill - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
});

productSchema.virtual('availableStock').get(function() {
  return this.variants.reduce((sum, variant) => {
    const available = variant.stock - (variant.reservedStock || 0);
    return sum + Math.max(available, 0);
  }, 0);
});

// ==================== METHODS ====================

// Get minimum price from variants
productSchema.methods.getMinPrice = function() {
  if (this.variants.length === 0) return 0;
  return Math.min(...this.variants.map(v => v.price || 0));
};

// Get maximum price from variants
productSchema.methods.getMaxPrice = function() {
  if (this.variants.length === 0) return 0;
  return Math.max(...this.variants.map(v => v.price || 0));
};

// Get discounted price for variant
productSchema.methods.getDiscountedPrice = function(variantIndex = 0) {
  const variant = this.variants[variantIndex] || this.variants[0];
  if (!variant) return 0;
  
  if (this.isOfferActive && this.discount > 0) {
    const discounted = variant.price * (100 - this.discount) / 100;
    return Math.round(discounted * 100) / 100;
  }
  return variant.price;
};

// Get main image
productSchema.methods.getMainImage = function() {
  if (this.allImages && this.allImages.length > 0) {
    const mainImage = this.allImages.find(img => img.isMain);
    return mainImage || this.allImages[0];
  }
  return null;
};

// Get images for specific color
productSchema.methods.getImagesByColor = function(color) {
  if (this.imagesByColor && this.imagesByColor.has(color)) {
    return this.imagesByColor.get(color);
  }
  // Fallback: filter from allImages
  return this.allImages.filter(img => img.color === color);
};

// Get variant by color and size
productSchema.methods.getVariant = function(color, size) {
  return this.variants.find(v => 
    v.color.toLowerCase() === color.toLowerCase() && 
    v.size === size
  );
};

// Get variant with images
productSchema.methods.getVariantWithImages = function(color, size) {
  const variant = this.getVariant(color, size);
  if (!variant) return null;
  
  return {
    ...variant.toObject(),
    images: this.getImagesByColor(color)
  };
};

// Get all variants with images
productSchema.methods.getAllVariantsWithImages = function() {
  return this.variants.map(variant => ({
    ...variant.toObject(),
    images: this.getImagesByColor(variant.color)
  }));
};

// Update variant stock
productSchema.methods.updateVariantStock = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  if (variant) {
    variant.stock += quantity;
    if (variant.stock < 0) variant.stock = 0;
    return true;
  }
  return false;
};

// Reserve stock for order
productSchema.methods.reserveVariantStock = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  if (variant && variant.stock >= (variant.reservedStock || 0) + quantity) {
    variant.reservedStock = (variant.reservedStock || 0) + quantity;
    return true;
  }
  return false;
};

// Release reserved stock
productSchema.methods.releaseVariantStock = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  if (variant && (variant.reservedStock || 0) >= quantity) {
    variant.reservedStock = Math.max((variant.reservedStock || 0) - quantity, 0);
    return true;
  }
  return false;
};

// Get available sizes for a color
productSchema.methods.getAvailableSizesForColor = function(color) {
  return this.variants
    .filter(v => 
      v.color.toLowerCase() === color.toLowerCase() && 
      (v.stock - (v.reservedStock || 0)) > 0
    )
    .map(v => v.size);
};

// Get available colors for a size
productSchema.methods.getAvailableColorsForSize = function(size) {
  return this.variants
    .filter(v => 
      v.size === size && 
      (v.stock - (v.reservedStock || 0)) > 0
    )
    .map(v => v.color);
};

// Get product card data for listing
productSchema.methods.getProductCardData = function() {
  const allSellingPrices = this.variants.map(v => v.sellingPrice || 0);
  const minSellingPrice = Math.min(...allSellingPrices);
  const cheapestVariant = this.variants.find(v => v.sellingPrice === minSellingPrice);
  const originalPriceOfCheapest = cheapestVariant?.price || minSellingPrice;

  return {
    _id: this._id,
    name: this.name,
    brand: this.brand,
    clothingType: this.clothingType,
    gender: this.gender,
    ageGroup: this.ageGroup,
    description: this.shortDescription || this.description.substring(0, 100) + '...',
    sellingPrice: minSellingPrice,            // ✅ Selling price
    price: originalPriceOfCheapest,   // ✅ Original price
    discount: this.discount,   
    rating: this.rating,
    reviewCount: this.reviewCount,
    image: this.getMainImage(),
    isOfferActive: this.isOfferActive,
    offerValidTill: this.offerValidTill,
    offerDaysLeft: this.offerDaysLeft,
    isInStock: this.isInStock,
    totalStock: this.totalStock,
    availableStock: this.availableStock,
    colors: this.colors,
    sizes: this.sizes,
    isFeatured: this.isFeatured,
    isNewArrival: this.isNewArrival,
    isBestSeller: this.isBestSeller,
    freeShipping: this.freeShipping,
    slug: this.slug
  };
};

// Get specifications in readable format
// Get ALL specifications in ONE formatted object
productSchema.methods.getFormattedSpecifications = function() {
  const specs = {
    "Product Details": {
      "Brand": this.brand,
      "Type": this.clothingType,
      "Gender": this.gender,
      "Age Group": this.ageGroup,
      "Fabric": this.fabric,
      "Fabric Composition": this.fabricComposition,
      "Fit": this.fit,
      "Pattern": this.pattern,
      "Sleeve": this.sleeveType,
      "Neck": this.neckType
    },
    
    "Care Instructions": this.careInstructions,
    
    "Package Details": {
      "Package Content": this.packageContent,
      "Country of Origin": this.countryOfOrigin
    },
    
    "Dimensions & Weight": {
      "Length": `${this.productDimensions.length} cm`,
      "Width": `${this.productDimensions.width} cm`,
      "Height": `${this.productDimensions.height} cm`,
      "Weight": `${this.productDimensions.weight} kg`
    },
    
    "Season & Occasion": {
      "Season": this.season.join(", "),
      "Occasion": this.occasion.join(", ")
    },
    
    "Features": this.features
  };
  
  // Add custom specifications
  if (this.specifications && this.specifications.size > 0) {
    specs["Additional Specifications"] = Object.fromEntries(this.specifications);
  }
  
  return specs;
};

// Get offer details
productSchema.methods.getOfferDetails = function() {
  if (!this.isOfferActive) return null;
  
  return {
    title: this.offerTitle || `${this.discount}% Off`,
    description: this.offerDescription || `Get ${this.discount}% discount on this product`,
    discount: this.discount,
    validFrom: this.offerValidFrom,
    validTill: this.offerValidTill,
    daysLeft: this.offerDaysLeft,
    isActive: this.isOfferActive
  };
};

// Get product detail data (OPTIMIZED - NO DUPLICATE IMAGES)
productSchema.methods.getProductDetailData = function() {
  const cardData = this.getProductCardData();
  
  return {
    ...cardData,
    fullDescription: this.description || this.fullDescription,
    keyFeatures: this.keyFeatures,
    specifications: this.getFormattedSpecifications(),
    offerDetails: this.getOfferDetails(),
    
    // Variants WITHOUT duplicate images in each
    variants: this.variants.map(v => ({
      _id: v._id,
      color: v.color,
      colorCode: v.colorCode,
      size: v.size,
      stock: v.stock,
      price: v.price,
      sellingPrice: v.sellingPrice, 
      discountPrice: v.discountPrice, // ✅ Discount Amount
      discountPercentage: v.discountPercentage, // ✅ Discount %
      sku: v.sku,
      barcode: v.barcode,
      isInStock: v.stock > 0,
      availableStock: Math.max(v.stock - (v.reservedStock || 0), 0),
      sizeDetails: v.sizeDetails
    })),
    
    // Centralized images storage
    allImages: this.allImages,
    
    // Helper for frontend
    imagesByColor: Object.fromEntries(this.imagesByColor || new Map()),
    
    season: this.season,
    occasion: this.occasion,
    features: this.features,
    returnPolicy: this.returnPolicy,
    estimatedDelivery: this.estimatedDelivery,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};
productSchema.methods.getAdminProductData = function() {
  return {
    // Sab kuch jo user ko milta hai
    ...this.getProductDetailData(),
    
    // + Extra admin fields
    
    // Full descriptions
    fullDescription: this.fullDescription,
    keyFeatures: this.keyFeatures,
    shortDescription: this.shortDescription,
    
    // Complete specifications
    specifications: this.getFormattedSpecifications?.(),
    
    // Admin fields
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    status: this.status,
    blacklisted: this.blacklisted,
    
    // Analytics
    viewCount: this.viewCount,
    soldCount: this.soldCount,
    wishlistCount: this.wishlistCount,
    
    // Complete variants with ALL fields
    variants: this.variants.map(v => ({
      ...v.toObject(),
      reservedStock: v.reservedStock,
      sku: v.sku,
      barcode: v.barcode,
      sizeDetails: v.sizeDetails,
      discountPrice: v.discountPrice,
      discountPercentage: v.discountPercentage,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt
    })),
    
    // All images with metadata
    allImages: this.allImages,
    imagesByColor: Object.fromEntries(this.imagesByColor || new Map()),
    
    // Complete product details
    category: this.category,
    subCategory: this.subCategory,
    ageGroup: this.ageGroup,
    fabricComposition: this.fabricComposition,
    careInstructions: this.careInstructions,
    sleeveType: this.sleeveType,
    neckType: this.neckType,
    season: this.season,
    occasion: this.occasion,
    features: this.features,
    
    // Package & Shipping
    packageContent: this.packageContent,
    countryOfOrigin: this.countryOfOrigin,
    productDimensions: this.productDimensions,
    handlingTime: this.handlingTime,
    estimatedDelivery: this.estimatedDelivery,
    
    // Flags
    isFeatured: this.isFeatured,
    isNewArrival: this.isNewArrival,
    isBestSeller: this.isBestSeller,
    isTrending: this.isTrending,
    
    // Pricing
    mrp: this.mrp,
    sellingPrice: this.sellingPrice,
    
    // Offer
    offerTitle: this.offerTitle,
    offerDescription: this.offerDescription,
    offerValidFrom: this.offerValidFrom,
    offerValidTill: this.offerValidTill,
    offerCode: this.offerCode,
    
    // Warranty & Return
    warranty: this.warranty,
    returnPolicy: this.returnPolicy,
    returnWindow: this.returnWindow,
    
    // SEO
    metaTitle: this.metaTitle,
    metaDescription: this.metaDescription,
    keywords: this.keywords,
    tags: this.tags,
    
    // Stock analytics
    totalStock: this.totalStock,
    availableStock: this.availableStock,
    reservedStock: this.variants.reduce((sum, v) => sum + (v.reservedStock || 0), 0)
  };
};
// Add new variant
productSchema.methods.addVariant = function(variantData) {
  this.variants.push(variantData);
};

// Remove variant
productSchema.methods.removeVariant = function(variantId) {
  this.variants = this.variants.filter(v => v._id.toString() !== variantId);
};

// Add images for a color
productSchema.methods.addImagesForColor = function(color, images) {
  images.forEach(img => {
    this.allImages.push({
      ...img,
      color: color,
      colorCode: this.variants.find(v => v.color === color)?.colorCode
    });
  });
};

// Remove images for a color
productSchema.methods.removeImagesForColor = function(color) {
  this.allImages = this.allImages.filter(img => img.color !== color);
};

module.exports = mongoose.model("Product", productSchema)