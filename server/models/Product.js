const mongoose = require("mongoose");
const Review = require("./Review");

// Size Chart for Clothing
const sizeChartSchema = new mongoose.Schema({
  chest: { type: Number }, // in inches/cm
  waist: { type: Number },
  hips: { type: Number },
  length: { type: Number },
  shoulder: { type: Number },
  sleeve: { type: Number }
}, { _id: false });

// Variant Schema - Only for Clothing
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
    
    price: { 
      type: Number, 
      required: true,
      min: 0
    },
    
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    
    images: [
      {
        url: { type: String, required: true },
        id: { type: String, required: true },
        isMain: { type: Boolean, default: false }
      }
    ],
    
    barcode: String
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
    
    // ============== SPECIFICATIONS (STRUCTURED) ==============
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    
    // ============== VARIANTS ==============
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
      weight: { type: Number, default: 0.2 } // in kg
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
  
  // Generate SKU if not exists
  this.variants.forEach((variant, index) => {
    if (!variant.sku) {
      const skuPrefix = this.brand.substring(0, 3).toUpperCase();
      const colorCode = variant.color.substring(0, 2).toUpperCase();
      const sizeCode = variant.size;
      variant.sku = `${skuPrefix}-${Date.now().toString().slice(-6)}-${colorCode}-${sizeCode}-${index}`;
    }
  });
  
  // Generate slug if not exists
  if (!this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);
  }
  
  // Set default blacklisted to false if not set
  if (this.blacklisted === undefined) {
    this.blacklisted = false;
  }
  
  // Calculate selling price from variants
  if (this.variants.length > 0) {
    const minPrice = Math.min(...this.variants.map(v => v.price || 0));
    this.sellingPrice = minPrice;
    
    // Calculate MRP with markup (optional)
    if (!this.mrp) {
      this.mrp = Math.round(minPrice * 1.2); // 20% markup
    }
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
  
  // Set time to end of day for validTill
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

// Get discounted price
productSchema.methods.getDiscountedPrice = function(variantIndex = 0) {
  const variant = this.variants[variantIndex] || this.variants[0];
  if (!variant) return 0;
  
  if (this.isOfferActive && this.discount > 0) {
    const discounted = variant.price * (100 - this.discount) / 100;
    return Math.round(discounted * 100) / 100;
  }
  return variant.price;
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

// Get specifications in readable format
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
    "Dimensions": {
      "Length": `${this.productDimensions.length} cm`,
      "Width": `${this.productDimensions.width} cm`,
      "Height": `${this.productDimensions.height} cm`,
      "Weight": `${this.productDimensions.weight} kg`
    }
  };
  
  // Add custom specifications
  if (this.specifications && this.specifications.size > 0) {
    specs["Additional Specifications"] = Object.fromEntries(this.specifications);
  }
  
  return specs;
};

// Get product description with HTML formatting
productSchema.methods.getFormattedDescription = function() {
  let description = `<h3>${this.name}</h3>`;
  
  if (this.shortDescription) {
    description += `<p><strong>${this.shortDescription}</strong></p>`;
  }
  
  description += `<p>${this.description}</p>`;
  
  if (this.keyFeatures && this.keyFeatures.length > 0) {
    description += `<h4>Key Features:</h4><ul>`;
    this.keyFeatures.forEach(feature => {
      description += `<li>${feature}</li>`;
    });
    description += `</ul>`;
  }
  
  if (this.features && this.features.length > 0) {
    description += `<h4>Product Features:</h4><ul>`;
    this.features.forEach(feature => {
      description += `<li>${feature}</li>`;
    });
    description += `</ul>`;
  }
  
  return description;
};

// Get main image (first image from first variant)
productSchema.methods.getMainImage = function() {
  if (this.variants.length > 0 && this.variants[0].images.length > 0) {
    const mainImage = this.variants[0].images.find(img => img.isMain);
    return mainImage || this.variants[0].images[0];
  }
  return null;
};

// Get all images from all variants
productSchema.methods.getAllImages = function() {
  const allImages = [];
  this.variants.forEach(variant => {
    variant.images.forEach(img => {
      allImages.push(img);
    });
  });
  return allImages;
};

// Get variant by color and size
productSchema.methods.getVariant = function(color, size) {
  return this.variants.find(v => 
    v.color.toLowerCase() === color.toLowerCase() && 
    v.size === size
  );
};

// Check if specific variant is in stock
productSchema.methods.isVariantInStock = function(color, size) {
  const variant = this.getVariant(color, size);
  return variant ? variant.stock > 0 : false;
};

// Get available sizes for a color
productSchema.methods.getSizesForColor = function(color) {
  return this.variants
    .filter(v => v.color.toLowerCase() === color.toLowerCase() && v.stock > 0)
    .map(v => v.size);
};

// Get available colors for a size
productSchema.methods.getColorsForSize = function(size) {
  return this.variants
    .filter(v => v.size === size && v.stock > 0)
    .map(v => v.color);
};

// Get product card data for listing
productSchema.methods.getProductCardData = function() {
  const minPrice = this.getMinPrice();
  const maxPrice = this.getMaxPrice();
  const isOfferActive = this.isOfferActive;
  const discountedPrice = this.getDiscountedPrice();

  return {
    _id: this._id,
    name: this.name,
    brand: this.brand,
    clothingType: this.clothingType,
    gender: this.gender,
    ageGroup: this.ageGroup,
    description: this.shortDescription || this.description.substring(0, 100) + '...',
    price: minPrice,
    maxPrice: maxPrice !== minPrice ? maxPrice : undefined,
    discountedPrice: discountedPrice,
    discount: this.discount,
    rating: this.rating,
    reviewCount: this.reviewCount,
    image: this.getMainImage(),
    isOfferActive: isOfferActive,
    offerValidTill: this.offerValidTill,
    offerDaysLeft: this.offerDaysLeft,
    isInStock: this.isInStock,
    totalStock: this.totalStock,
    colors: this.colors,
    sizes: this.sizes,
    isFeatured: this.isFeatured,
    isNewArrival: this.isNewArrival,
    isBestSeller: this.isBestSeller,
    freeShipping: this.freeShipping,
    slug: this.slug
  };
};

// Get product detail data
productSchema.methods.getProductDetailData = function() {
  const cardData = this.getProductCardData();
  
  return {
    ...cardData,
    fullDescription: this.description,
    keyFeatures: this.keyFeatures,
    specifications: this.getFormattedSpecifications(),
    fabric: this.fabric,
    fabricComposition: this.fabricComposition,
    careInstructions: this.careInstructions,
    fit: this.fit,
    pattern: this.pattern,
    sleeveType: this.sleeveType,
    neckType: this.neckType,
    season: this.season,
    occasion: this.occasion,
    features: this.features,
    offerDetails: this.getOfferDetails(),
    variants: this.variants.map(v => ({
      _id: v._id,
      color: v.color,
      colorCode: v.colorCode,
      size: v.size,
      stock: v.stock,
      price: v.price,
      images: v.images,
      sku: v.sku,
      isInStock: v.stock > 0
    })),
    allImages: this.getAllImages(),
    packageContent: this.packageContent,
    countryOfOrigin: this.countryOfOrigin,
    dimensions: this.productDimensions,
    warranty: this.warranty,
    returnPolicy: this.returnPolicy,
    estimatedDelivery: this.estimatedDelivery,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
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

// Add variant
productSchema.methods.addVariant = function(variantData) {
  this.variants.push(variantData);
};

// Remove variant
productSchema.methods.removeVariant = function(variantId) {
  this.variants = this.variants.filter(v => v._id.toString() !== variantId);
};

module.exports = mongoose.model("Product", productSchema);