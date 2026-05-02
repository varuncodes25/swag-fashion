const yup = require('yup');

// Size Chart Validation (tops, bottoms, footwear, innerwear)
const sizeChartSchema = yup.object({
  chest: yup.number().positive().optional(),
  waist: yup.number().positive().optional(),
  hips: yup.number().positive().optional(),
  length: yup.number().positive().optional(),
  shoulder: yup.number().positive().optional(),
  sleeve: yup.number().positive().optional(),
  inseam: yup.number().positive().optional(),
  rise: yup.string().optional(),
  thigh: yup.number().positive().optional(),
  legOpening: yup.number().positive().optional(),
  bottomWidth: yup.number().positive().optional(),
  footLength: yup.number().positive().optional(),
  headCircumference: yup.number().positive().optional(),
  band: yup.number().positive().optional(),
  cup: yup.string().optional(),
  modelHeight: yup.number().optional(),
  modelWeight: yup.number().optional(),
  modelWearing: yup.string().optional(),
  fitDescription: yup.string().optional(),
  age: yup.string().optional(),
  height: yup.string().optional(),
  unit: yup.string().oneOf(["inches", "cm"]).optional()
});

// Product Image Validation
const productImageSchema = yup.object({
  url: yup.string().url().required(),
  id: yup.string().required(),
  isMain: yup.boolean().default(false),
  color: yup.string().optional(),
  colorCode: yup.string().optional(),
  sortOrder: yup.number().default(0)
});

// Variant Validation
const variantSchema = yup.object({
  color: yup.string().trim().required('Color is required'),
  colorCode: yup.string().default('#000000'),
  size: yup
    .string()
    .required('Size is required')
    .trim()
    .min(1, 'Size is required'),

  sizeSystem: yup
    .string()
    .oneOf([
      "Alpha",
      "Numeric",
      "UK",
      "US",
      "EU",
      "IN",
      "Kids",
      "One Size",
      "Custom"
    ])
    .optional(),

  sizeDetails: sizeChartSchema.optional(),

  sellingPrice: yup.number().min(0).optional(),

  stock: yup
    .number()
    .required('Stock is required')
    .min(0, 'Stock cannot be negative')
    .default(20),
  
  price: yup
    .number()
    .required('Price is required')
    .min(10, 'Price must be at least ₹10')
    .max(100000, 'Price cannot exceed ₹1,00,000'),
  
  sku: yup.string().optional(),
  barcode: yup.string().optional(),
  reservedStock: yup.number().min(0).default(0)
});

// Main Product Validation Schema
const createProductSchema = yup.object({
  // ============== BASIC INFO ==============
  name: yup
    .string()
    .required('Product name is required')
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name cannot exceed 200 characters'),
  
  // ============== DESCRIPTIONS ==============
  description: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  
  shortDescription: yup
    .string()
    .max(200, 'Short description cannot exceed 200 characters')
    .optional(),
  
  fullDescription: yup.string().optional(),
  
  keyFeatures: yup
    .array()
    .of(yup.string().max(100))
    .default([]),
  
  // ============== CATEGORY ==============
  category: yup
    .string()
    .required('Category ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  
  subCategory: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid subcategory ID')
    .optional(),
  
  // ============== CLOTHING SPECIFIC ==============
  clothingType: yup
    .string()
    .required('Clothing type is required')
    .oneOf([
      "T-Shirt", "Polo Shirt", "Shirt", "Formal Shirt", "Casual Shirt",
      "Tank Top", "Crop Top", "Blouse", "Tunic", "Top", "Camisole",
      "Sweater", "Cardigan", "Pullover", "Hoodie", "Sweatshirt",
      "Jacket", "Blazer", "Coat", "Raincoat", "Windcheater", "Bomber Jacket",
      "Denim Jacket", "Shrug", "Waistcoat", "Gilet", "Vest",
      "Dress", "Gown", "Jumpsuit", "Romper", "Co-ord Set", "Suit Set",
      "Kurta", "Sherwani", "Nehru Jacket", "Anarkali", "Salwar Suit",
      "Saree", "Lehenga", "Dupatta", "Dhoti", "Lungi",
      "Jeans", "Trousers", "Chinos", "Cargo Pants", "Joggers", "Track Pants",
      "Leggings", "Palazzo", "Skirt", "Shorts",
      "Sneakers", "Sports Shoes", "Formal Shoes", "Loafers", "Boots",
      "Sandals", "Slippers", "Heels", "Flats", "Flip Flops",
      "Track Suit", "Sports Wear", "Swimwear", "Bikini", "Swim Trunks",
      "Nightwear", "Pyjama", "Night Suit", "Robe", "Loungewear",
      "Innerwear", "Bra", "Sports Bra", "Briefs", "Boxers", "Thermals",
      "Socks", "Stockings", "Tights",
      "Cap", "Hat", "Beanie", "Scarf", "Stole", "Shawl", "Gloves", "Mittens",
      "Tie", "Bow Tie", "Belt", "Suspenders",
      "Other"
    ], 'Invalid clothing type'),

  productFamily: yup
    .string()
    .oneOf([
      "Upper Body",
      "Lower Body",
      "Full Body",
      "Ethnic",
      "Footwear",
      "Innerwear",
      "Activewear",
      "Loungewear & Nightwear",
      "Accessories",
      "Other"
    ])
    .optional(),
  
  // ============== AGE GROUP ==============
  ageGroup: yup
    .string()
    .required('Age group is required')
    .oneOf([
      "Newborn", "0-2 Years", "2-4 Years", "4-6 Years", "6-8 Years", "8-10 Years",
      "10-12 Years", "12-14 Years", "14-16 Years", "16-18 Years", "Adult"
    ])
    .default('Adult'),
  
  // ============== GENDER ==============
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(["Men", "Women", "Unisex", "Boys", "Girls", "Kids", "Baby"]),
  
  // ============== FABRIC & MATERIAL ==============
  fabric: yup
    .string()
    .required('Fabric is required')
    .oneOf([
      "Cotton", "Organic Cotton", "Polyester", "Silk", "Wool", "Linen",
      "Denim", "Leather", "Faux Leather", "Suede", "Nylon", "Rayon", "Viscose",
      "Modal", "Tencel", "Spandex", "Elastane", "Lycra",
      "Velvet", "Chiffon", "Georgette", "Crepe", "Satin", "Mesh", "Fleece",
      "Canvas", "Jute", "Khadi", "Acrylic", "Cashmere", "Rubber", "EVA",
      "Blended", "Synthetic", "Not Applicable", "Other"
    ]),
  
  fabricComposition: yup
    .string()
    .default('100% Cotton'),
  
  // ============== CARE INSTRUCTIONS ==============
  careInstructions: yup
    .array()
    .of(yup.string().oneOf([
      "Machine Wash", "Machine Wash Cold", "Machine Wash Gentle",
      "Hand Wash", "Dry Clean Only", "Spot Clean",
      "Do Not Bleach", "Tumble Dry Low", "Line Dry", "Dry Flat",
      "Iron Low Heat", "Iron Medium Heat", "Do Not Iron", "Steam Only"
    ]))
    .default(["Machine Wash"]),
  
  // ============== FIT & STYLE ==============
  fit: yup
    .string()
    .oneOf([
      "Regular", "Slim", "Relaxed", "Oversized", "Skinny", "Boyfriend", "Bodycon",
      "Athletic", "Tailored", "Wide Leg", "Bootcut", "Flared", "Straight",
      "High Rise", "Mid Rise", "Low Rise", "Compression", "Not Applicable"
    ])
    .optional(),

  pattern: yup
    .string()
    .oneOf([
      "Solid", "Striped", "Checked", "Plaid", "Printed", "Floral",
      "Geometric", "Abstract", "Polka Dot", "Ethnic", "Plain",
      "Embroidered", "Sequined", "Tie-Dye", "Camouflage", "Animal Print",
      "Paisley", "Houndstooth", "Not Applicable"
    ])
    .optional(),

  sleeveType: yup
    .string()
    .oneOf([
      "Full Sleeve", "Half Sleeve", "Sleeveless", "Short Sleeve", "Three-Quarter",
      "Puff Sleeve", "Bell Sleeve", "Raglan", "Cap Sleeve", "Dolman",
      "Not Applicable"
    ])
    .optional(),

  neckType: yup
    .string()
    .oneOf([
      "Round Neck", "V-Neck", "Deep V-Neck", "Polo Neck", "Collared", "Hooded",
      "Turtleneck", "Square Neck", "Boat Neck", "Halter", "Off Shoulder",
      "Mandarin Collar", "Not Applicable"
    ])
    .optional(),
  
  // ============== BRAND ==============
  brand: yup
    .string()
    .required('Brand is required')
    .default('Generic'),
  
  // ============== SEASON & OCCASION ==============
  season: yup
    .array()
    .of(yup.string().oneOf(["Summer", "Winter", "Spring", "Autumn", "All Season", "Monsoon"]))
    .default(["All Season"]),
  
  occasion: yup
    .array()
    .of(yup.string().oneOf([
      "Casual", "Formal", "Party", "Wedding", "Sports", "Beach", "Office",
      "Travel", "Evening", "Traditional", "Festive", "Loungewear", "Sleepwear"
    ]))
    .default(["Casual"]),
  
  // ============== VARIANTS ==============
  variants: yup
    .array()
    .of(variantSchema)
    .required('At least one variant is required')
    .min(1, 'At least one variant is required')
    .test(
      'unique-color-size',
      'Duplicate color-size combination found',
      function(variants) {
        const seen = new Set();
        for (const variant of variants) {
          const key = `${variant.color}-${variant.size}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
        }
        return true;
      }
    ),
  
  // ============== IMAGES ==============
  allImages: yup
    .array()
    .of(productImageSchema)
    .required('At least one image is required')
    .min(1, 'At least one image is required'),
  
  // ============== PRICING ==============
  discount: yup
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
  
  mrp: yup
    .number()
    .min(0, 'MRP cannot be negative')
    .optional(),
  
  // ============== OFFER VALIDITY ==============
  offerValidFrom: yup
    .date()
    .nullable()
    .optional(),
  
  offerValidTill: yup
    .date()
    .nullable()
    .optional()
    .when('offerValidFrom', (offerValidFrom, schema) => {
      return offerValidFrom 
        ? schema.min(offerValidFrom, 'Offer end date must be after start date')
        : schema;
    }),
  
  // ============== DIMENSIONS ==============
  productDimensions: yup.object({
    length: yup.number().min(0).default(30),
    width: yup.number().min(0).default(25),
    height: yup.number().min(0).default(3),
    weight: yup.number().min(0).default(0.3)
  }).default({}),
  
  // ============== STATUS ==============
  status: yup
    .string()
    .oneOf(["draft", "published", "out_of_stock", "discontinued"])
    .default("draft"),
  
  // ============== SEO ==============
  slug: yup.string().optional(),
  metaTitle: yup.string().optional(),
  metaDescription: yup.string().optional(),
  keywords: yup.array().of(yup.string()).default([]),
  tags: yup.array().of(yup.string()).default([]),
  
  // ============== FLAGS ==============
  isFeatured: yup.boolean().default(false),
  isNewArrival: yup.boolean().default(true),
  isBestSeller: yup.boolean().default(false),
  isTrending: yup.boolean().default(false),
  freeShipping: yup.boolean().default(false),
  blacklisted: yup.boolean().default(false)
});

// Update Product Schema (optional fields)
const updateProductSchema = createProductSchema.partial();

// Validate Variants Only
const validateVariantsSchema = yup.object({
  variants: yup.array().of(variantSchema).min(1)
});

// Validate Stock Update
const stockUpdateSchema = yup.object({
  variantId: yup.string().required(),
  quantity: yup.number().required(),
  operation: yup.string().oneOf(['add', 'subtract', 'set']).default('set')
});

// Export all schemas
module.exports = {
  createProductSchema,
  updateProductSchema,
  validateVariantsSchema,
  stockUpdateSchema,
  variantSchema,
  productImageSchema,
  sizeChartSchema
};