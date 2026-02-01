const yup = require('yup');

// Size Chart Validation
const sizeChartSchema = yup.object({
  chest: yup.number().positive().optional(),
  waist: yup.number().positive().optional(),
  hips: yup.number().positive().optional(),
  length: yup.number().positive().optional(),
  shoulder: yup.number().positive().optional(),
  sleeve: yup.number().positive().optional()
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
    .oneOf(
      ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
      'Invalid size. Valid sizes: XS, S, M, L, XL, XXL, XXXL, Free Size'
    )
    .uppercase()
    .trim(),
  
  sizeDetails: sizeChartSchema.optional(),
  
  stock: yup
    .number()
    .required('Stock is required')
    .min(0, 'Stock cannot be negative')
    .default(0),
  
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
      "T-Shirt", "Shirt", "Jeans", "Trousers", "Shorts",
      "Jacket", "Sweater", "Hoodie", "Sweatshirt",
      "Dress", "Skirt", "Top", "Kurta", "Sherwani",
      "Saree", "Lehenga", "Blouse", "Track Suit",
      "Innerwear", "Socks", "Cap", "Scarf", "Other"
    ], 'Invalid clothing type'),
  
  // ============== AGE GROUP ==============
  ageGroup: yup
    .string()
    .required('Age group is required')
    .oneOf([
      "0-2 Years", "2-4 Years", "4-6 Years", "6-8 Years", "8-10 Years", 
      "10-12 Years", "12-14 Years", "14-16 Years", "16-18 Years", "Adult"
    ])
    .default('Adult'),
  
  // ============== GENDER ==============
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(["Men", "Women", "Unisex", "Boys", "Girls", "Kids"]),
  
  // ============== FABRIC & MATERIAL ==============
  fabric: yup
    .string()
    .required('Fabric is required')
    .oneOf([
      "Cotton", "Polyester", "Silk", "Wool", "Linen",
      "Denim", "Leather", "Nylon", "Rayon", "Spandex",
      "Velvet", "Chiffon", "Georgette", "Crepe", "Satin",
      "Blended", "Other"
    ]),
  
  fabricComposition: yup
    .string()
    .default('100% Cotton'),
  
  // ============== CARE INSTRUCTIONS ==============
  careInstructions: yup
    .array()
    .of(yup.string().oneOf([
      "Machine Wash", "Hand Wash", "Dry Clean Only",
      "Do Not Bleach", "Tumble Dry Low", "Line Dry",
      "Iron Low Heat", "Do Not Iron", "Dry Flat"
    ]))
    .default(["Machine Wash"]),
  
  // ============== FIT & STYLE ==============
  fit: yup
    .string()
    .oneOf(["Regular", "Slim", "Relaxed", "Oversized", "Skinny", "Boyfriend", "Bodycon"])
    .default("Regular"),
  
  pattern: yup
    .string()
    .oneOf([
      "Solid", "Striped", "Checked", "Printed", "Floral",
      "Geometric", "Abstract", "Polka Dot", "Ethnic", "Plain",
      "Embroidered", "Sequined", "Tie-Dye"
    ])
    .default("Solid"),
  
  sleeveType: yup
    .string()
    .oneOf(["Full Sleeve", "Half Sleeve", "Sleeveless", "Short Sleeve", "Three-Quarter", "Puff Sleeve", "Bell Sleeve"])
    .default("Full Sleeve"),
  
  neckType: yup
    .string()
    .oneOf(["Round Neck", "V-Neck", "Polo Neck", "Collared", "Hooded", "Turtleneck", "Square Neck"])
    .default("Round Neck"),
  
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
    .of(yup.string().oneOf(["Casual", "Formal", "Party", "Wedding", "Sports", "Beach", "Office", "Travel", "Evening", "Traditional"]))
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
    length: yup.number().min(0).default(0),
    width: yup.number().min(0).default(0),
    height: yup.number().min(0).default(0),
    weight: yup.number().min(0).default(0.2)
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