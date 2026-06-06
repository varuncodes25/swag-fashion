import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "./use-toast";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "@/constants/uploadLimits";

const SIZE_OPTIONS = ["S", "M", "L", "XL","XXL"];

const SIZE_CHART_TEMPLATES = {
  regularTshirt: {
    label: "Regular T-Shirt",
    productFit: "Regular",
    measurements: {
      S: { chest: 38, length: 26, shoulder: 17, sleeve: 8, waist: 18 },
      M: { chest: 40, length: 27, shoulder: 18, sleeve: 8.5, waist: 19 },
      L: { chest: 42, length: 28, shoulder: 19, sleeve: 9, waist: 20 },
      XL: { chest: 44, length: 29, shoulder: 20, sleeve: 9.5, waist: 21 },
    },
    defaults: {
      fitDescription: "True to size",
      unit: "inches",
    },
  },
  oversizedTshirt: {
    label: "Oversized T-Shirt",
    productFit: "Oversized",
    measurements: {
      S: { chest: 43, length: 27, shoulder: 20.5, sleeve: 9.5, waist: 22.5 },
      M: { chest: 46, length: 27, shoulder: 21, sleeve: 10, waist: 23.5 },
      L: { chest: 48, length: 28, shoulder: 22.5, sleeve: 10, waist: 24.5 },
      XL: { chest: 50, length: 30, shoulder: 23.5, sleeve: 11, waist: 25.5 },
    },
    defaults: {
      fitDescription: "Oversized",
      unit: "inches",
    },
  },
  poloShirt: {
    label: "Polo T-Shirt (Regular fit)",
    productFit: "Regular",
    measurements: {
      S: { chest: 39, length: 27, shoulder: 17.5, sleeve: 8.5, waist: 19 },
      M: { chest: 41, length: 28, shoulder: 18.5, sleeve: 9, waist: 20 },
      L: { chest: 43, length: 29, shoulder: 19.5, sleeve: 9.5, waist: 21 },
      XL: { chest: 45, length: 30, shoulder: 20.5, sleeve: 10, waist: 22 },
    },
    defaults: {
      fitDescription: "True to size",
      unit: "inches",
    },
  },
};
const MAX_IMAGES_PER_COLOR = 40;
const DEFAULT_VARIANT_STOCK = 20;

/** Resolve Cloudinary public_id for edit saves (DB id or URL fallback) */
const extractCloudinaryPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/i);
  if (!match?.[1]) return null;
  return match[1].replace(/\.[^/.]+$/, "");
};

const resolveExistingImageId = (img) => {
  if (!img) return null;
  if (img.id) return String(img.id);
  if (img.public_id) return String(img.public_id);
  return extractCloudinaryPublicIdFromUrl(img.url || img.preview) || null;
};

const DEFAULT_PRODUCT_DIMENSIONS = {
  length: 30,
  width: 25,
  height: 3,
  weight: 0.3,
};

const COLOR_OPTIONS = [
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Green", code: "#008000" },
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Gray", code: "#808080" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Purple", code: "#800080" },
  { name: "Orange", code: "#FFA500" },
  { name: "Brown", code: "#A52A2A" },
  { name: "Navy", code: "#000080" },
  { name: "Maroon", code: "#800000" },
  { name: "Teal", code: "#008080" },
  { name: "Olive", code: "#808000" },
  { name: "Beige", code: "#F5F5DC" },
  { name: "Cream", code: "#FFFDD0" },
  { name: "Khaki", code: "#C3B091" },
];
// Bottom Wear Specific Options (Naye add karo)
const BOTTOM_STYLES = [
  "Regular",
  "Slim Fit",
  "Skinny",
  "Straight",
  "Relaxed",
  "Loose",
  "Bootcut",
  "Flared",
  "Wide Leg",
  "Cargo",
  "Jogger",
  "Palazzo",
  "Capri",
  "Bermuda",
  "Culottes",
  "Not Applicable",
];

const WAIST_TYPES = [
  "High Rise",
  "Mid Rise",
  "Low Rise",
  "Elastic",
  "Drawstring",
  "Button",
  "Zip Fly",
  "Hook & Bar",
  "Not Applicable",
];

const BOTTOM_LENGTHS = [
  "Micro Short",
  "Short",
  "Bermuda",
  "Knee Length",
  "Capri",
  "Three-Quarter",
  "Ankle Length",
  "Full Length",
  "Floor Length",
  "Not Applicable",
];

const POCKET_STYLES = [
  "5 Pocket",
  "Cargo",
  "Slant",
  "Patch",
  "No Pocket",
  "Back Pocket",
  "Side Pocket",
  "Coin Pocket",
  "Not Applicable",
];

const HEM_STYLES = [
  "Plain",
  "Fringed",
  "Raw",
  "Rolled",
  "Stitched",
  "Elasticated",
  "Zipped",
  "Not Applicable",
];

const BOTTOM_CLOSURES = [
  "Zip Fly",
  "Button",
  "Hook & Bar",
  "Elastic",
  "Drawstring",
  "Pull On",
  "Not Applicable",
];

const TOP_WEAR_TYPES = [
  "T-Shirt",
  "Polo T-Shirt",
  "Shirt",
  "Formal Shirt",
  "Casual Shirt",
  "Tank Top",
  "Crop Top",
  "Blouse",
  "Tunic",
  "Top",
  "Camisole",
  "Sweater",
  "Cardigan",
  "Pullover",
  "Hoodie",
  "Sweatshirt",
  "Jacket",
  "Blazer",
  "Coat",
  "Raincoat",
  "Windcheater",
  "Bomber Jacket",
  "Denim Jacket",
  "Shrug",
  "Waistcoat",
  "Gilet",
  "Vest",
  "Kurta",
  "Nehru Jacket",
];

const BOTTOM_WEAR_TYPES = [
  "Jeans",
  "Trousers",
  "Chinos",
  "Cargo Pants",
  "Joggers",
  "Track Pants",
  "Leggings",
  "Palazzo",
  "Skirt",
  "Shorts",
  "Dhoti",
  "Lungi",
];
// Clothing Types (must match server/models/Product.js)
const CLOTHING_TYPES = [
  "T-Shirt",
  "Polo T-Shirt",
  "Shirt",
  "Formal Shirt",
  "Casual Shirt",
  "Tank Top",
  "Crop Top",
  "Blouse",
  "Tunic",
  "Top",
  "Camisole",
  "Sweater",
  "Cardigan",
  "Pullover",
  "Hoodie",
  "Sweatshirt",
  "Jacket",
  "Blazer",
  "Coat",
  "Raincoat",
  "Windcheater",
  "Bomber Jacket",
  "Denim Jacket",
  "Shrug",
  "Waistcoat",
  "Gilet",
  "Vest",
  "Dress",
  "Gown",
  "Jumpsuit",
  "Romper",
  "Co-ord Set",
  "Suit Set",
  "Kurta",
  "Sherwani",
  "Nehru Jacket",
  "Anarkali",
  "Salwar Suit",
  "Saree",
  "Lehenga",
  "Dupatta",
  "Dhoti",
  "Lungi",
  "Jeans",
  "Trousers",
  "Chinos",
  "Cargo Pants",
  "Joggers",
  "Track Pants",
  "Leggings",
  "Palazzo",
  "Skirt",
  "Shorts",
  "Sneakers",
  "Sports Shoes",
  "Formal Shoes",
  "Loafers",
  "Boots",
  "Sandals",
  "Slippers",
  "Heels",
  "Flats",
  "Flip Flops",
  "Track Suit",
  "Sports Wear",
  "Swimwear",
  "Bikini",
  "Swim Trunks",
  "Nightwear",
  "Pyjama",
  "Night Suit",
  "Robe",
  "Loungewear",
  "Innerwear",
  "Bra",
  "Sports Bra",
  "Briefs",
  "Boxers",
  "Thermals",
  "Socks",
  "Stockings",
  "Tights",
  "Cap",
  "Hat",
  "Beanie",
  "Scarf",
  "Stole",
  "Shawl",
  "Gloves",
  "Mittens",
  "Tie",
  "Bow Tie",
  "Belt",
  "Suspenders",
  "Other",
];

const PRODUCT_FAMILIES = [
  "Upper Body",
  "Lower Body",
  "Full Body",
  "Ethnic",
  "Footwear",
  "Innerwear",
  "Activewear",
  "Loungewear & Nightwear",
  "Accessories",
  "Other",
];

// Genders
const GENDERS = ["Men", "Women", "Unisex", "Kids", "Boys", "Girls", "Baby"];

// Fabrics
const FABRICS = [
  "Cotton",
  "Organic Cotton",
  "Polyester",
  "Silk",
  "Wool",
  "Linen",
  "Denim",
  "Leather",
  "Faux Leather",
  "Suede",
  "Nylon",
  "Rayon",
  "Viscose",
  "Modal",
  "Tencel",
  "Spandex",
  "Elastane",
  "Lycra",
  "Velvet",
  "Chiffon",
  "Georgette",
  "Crepe",
  "Satin",
  "Mesh",
  "Fleece",
  "Canvas",
  "Jute",
  "Khadi",
  "Acrylic",
  "Cashmere",
  "Rubber",
  "EVA",
  "Blended",
  "Synthetic",
  "Not Applicable",
  "Other",
];

// Fits
const FITS = [
  "Regular",
  "Slim",
  "Relaxed",
  "Oversized",
  "Skinny",
  "Boyfriend",
  "Bodycon",
  "Athletic",
  "Tailored",
  "Wide Leg",
  "Bootcut",
  "Flared",
  "Straight",
  "High Rise",
  "Mid Rise",
  "Low Rise",
  "Compression",
  "Not Applicable",
];

/** Size chart fitDescription → Specifications Fit (storefront filter) */
const FIT_DESCRIPTION_TO_PRODUCT_FIT = {
  Oversized: "Oversized",
  "Relaxed fit": "Relaxed",
  "Slim fit": "Slim",
};

/** Specifications Fit → default size chart fitDescription */
const PRODUCT_FIT_TO_FIT_DESCRIPTION = {
  Oversized: "Oversized",
  Regular: "True to size",
  Slim: "Slim fit",
  Relaxed: "Relaxed fit",
};

const productFitToFitDescription = (fit) =>
  PRODUCT_FIT_TO_FIT_DESCRIPTION[fit] || null;

const fitDescriptionToProductFit = (fitDescription) =>
  FIT_DESCRIPTION_TO_PRODUCT_FIT[fitDescription] || null;

const inferFitFromSizeCharts = (charts) => {
  for (const colorCharts of Object.values(charts || {})) {
    for (const sizeChart of Object.values(colorCharts || {})) {
      const mapped = fitDescriptionToProductFit(sizeChart?.fitDescription);
      if (mapped) return mapped;
    }
  }
  return null;
};

const syncFitDescriptionOnCharts = (charts, productFit) => {
  const fitDescription = productFitToFitDescription(productFit);
  if (!fitDescription) return charts;

  const next = { ...charts };
  Object.keys(next).forEach((color) => {
    next[color] = { ...next[color] };
    Object.keys(next[color]).forEach((size) => {
      next[color][size] = {
        ...next[color][size],
        fitDescription,
      };
    });
  });
  return next;
};

// Patterns
const PATTERNS = [
  "Solid",
  "Striped",
  "Checked",
  "Plaid",
  "Printed",
  "Floral",
  "Geometric",
  "Abstract",
  "Polka Dot",
  "Ethnic",
  "Plain",
  "Embroidered",
  "Sequined",
  "Tie-Dye",
  "Camouflage",
  "Animal Print",
  "Paisley",
  "Graphic",
  "Houndstooth",
  "Not Applicable",
];

const WASH_TYPES = [
  "Normal Wash",
  "Acid Wash",
  "Stone Wash",
  "Enzyme Wash",
  "Bio Wash",
  "Distressed Wash",
  "Not Applicable",
];

// Sleeve types
const SLEEVE_TYPES = [
  "Full Sleeve",
  "Half Sleeve",
  "Sleeveless",
  "Short Sleeve",
  "Three-Quarter",
  "Puff Sleeve",
  "Bell Sleeve",
  "Raglan",
  "Cap Sleeve",
  "Dolman",
  "Not Applicable",
];

// Neck types
const NECK_TYPES = [
  "Round Neck",
  "V-Neck",
  "Deep V-Neck",
  "Polo Neck",
  "Collared",
  "Hooded",
  "Turtleneck",
  "Square Neck",
  "Boat Neck",
  "Halter",
  "Off Shoulder",
  "Mandarin Collar",
  "Not Applicable",
];

// Features for checklist
const ALL_FEATURES = [
  "Stretchable",
  "Wrinkle Free",
  "Quick Dry",
  "Breathable",
  "Water Resistant",
  "Waterproof",
  "Anti-Bacterial",
  "UV Protection",
  "Thermal",
  "Moisture Wicking",
  "Odor Resistant",
  "Pocket",
  "Hood",
  "Zipper",
  "Buttons",
  "Drawstring",
  "Elastic Waist",
  "Lined",
  "Padded",
  "Underwire",
  "Removable Straps",
  "Non-Slip Sole",
];

// Seasons
const SEASONS = [
  "Summer",
  "Winter",
  "Spring",
  "Autumn",
  "All Season",
  "Monsoon",
];

// Occasions
const OCCASIONS = [
  "Casual",
  "College",
  "Streetwear",
  "Formal",
  "Party",
  "Wedding",
  "Sports",
  "Beach",
  "Office",
  "Travel",
  "Evening",
  "Traditional",
  "Festive",
  "Loungewear",
  "Sleepwear",
];

const CARE_INSTRUCTIONS = [
  "Machine Wash",
  "Machine Wash Cold",
  "Machine Wash Gentle",
  "Hand Wash",
  "Dry Clean Only",
  "Spot Clean",
  "Do Not Bleach",
  "Tumble Dry Low",
  "Line Dry",
  "Dry Flat",
  "Iron Low Heat",
  "Iron Medium Heat",
  "Do Not Iron",
  "Steam Only",
];

const AGE_GROUPS = [
  "Newborn",
  "0-2 Years",
  "2-4 Years",
  "4-6 Years",
  "6-8 Years",
  "8-10 Years",
  "10-12 Years",
  "12-14 Years",
  "14-16 Years",
  "16-18 Years",
  "Adult",
];

const FORMATTED_SPEC_SECTION_KEYS = new Set([
  "Product Details",
  "Care Instructions",
  "Package Details",
  "Dimensions & Weight",
  "Season & Occasion",
  "Features",
]);

const formatDateInputValue = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const resolveCategoryId = (category) => {
  if (!category) return "";
  if (typeof category === "object" && category._id != null) {
    return String(category._id);
  }
  return String(category);
};

const normalizeSpecificationsForEdit = (specifications) => {
  if (!specifications || typeof specifications !== "object") return new Map();

  let source = specifications;
  // Unwrap recursive "Additional Specifications" nesting from formatted payloads.
  for (let depth = 0; depth < 5; depth += 1) {
    const nested = source?.["Additional Specifications"];
    if (!nested || typeof nested !== "object" || Array.isArray(nested)) break;
    source = nested;
  }

  const entries = Object.entries(source).filter(([key, value]) => {
    if (key === "Additional Specifications") return false;
    if (FORMATTED_SPEC_SECTION_KEYS.has(key)) return false;
    if (value === undefined || value === null || value === "") return false;
    return true;
  });

  return new Map(entries);
};

export const useProductForm = (editProductId = null) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    clothingType: "T-Shirt",
    gender: "Men",
    fabric: "Cotton",
    brand: "",
    basePrice: "",
    category: "",
    ageGroup: "Adult",
    productFamily: "",
    fabricComposition: "100% Cotton",
    fit: "Regular",
    pattern: "Solid",
    washType: "Not Applicable",
    sleeveType: "Full Sleeve",
    neckType: "Round Neck",
    bottomStyle: "Regular",
    waistType: "Mid Rise",
    bottomLength: "Full Length",
    pocketStyle: "5 Pocket",
    hemStyle: "Plain",
    bottomClosure: "Zip Fly",
    discount: "",
    offerTitle: "",
    offerDescription: "",
    offerValidFrom: "",
    offerValidTill: "",
    freeShipping: false,
    season: ["All Season"],
    occasion: ["Casual"],
    features: [],
    packageContent: "1 Piece",
    countryOfOrigin: "India",
    keyFeatures: [],
    specifications: new Map(),
    careInstructions: ["Machine Wash"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isPremium: false,
    warranty: "No Warranty",
    returnPolicy: "7 Days Return Available",
    returnWindow: 7,
    handlingTime: 1,
    estimatedDelivery: 7,
    productDimensions: { ...DEFAULT_PRODUCT_DIMENSIONS },
  });

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [stockMatrix, setStockMatrix] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [colorImageMap, setColorImageMap] = useState({});
  const [selectedSize, setSelectedSize] = useState("M");
  const [currentColor, setCurrentColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempSpecKey, setTempSpecKey] = useState("");
  const [tempSpecValue, setTempSpecValue] = useState("");
  const [sizeCharts, setSizeCharts] = useState({});
  const [editingProductId, setEditingProductId] = useState(editProductId);

  const fileInputRefs = useRef({});
  const { toast } = useToast();

  useEffect(() => {
    if (editProductId) {
      setEditingProductId(editProductId);
    }
  }, [editProductId]);

  const mapExistingImageForEdit = (img) => {
    const imageId = resolveExistingImageId(img);
    return {
      file: null,
      preview: img.url || img.preview,
      id: imageId,
      isMain: img.isMain || false,
      isExisting: true,
    };
  };

  // Initialize form with product data if editing
  const initializeForm = useCallback((product) => {
    if (!product) return;

    setEditingProductId(product._id || null);

    // ✅ FIX 1: Base price properly calculate karo
    let basePrice = product.basePrice || "";
    if (!basePrice && product.variants && product.variants.length > 0) {
      const uniquePrices = [...new Set(product.variants.map((v) => v.price))];
      basePrice = uniquePrices[0] || "";
    }

    const charts = {};
    if (product.variants) {
      product.variants.forEach((variant) => {
        if (
          variant.sizeDetails &&
          Object.keys(variant.sizeDetails).length > 0
        ) {
          if (!charts[variant.color]) {
            charts[variant.color] = {};
          }
          charts[variant.color][variant.size] = variant.sizeDetails;
        }
      });
    }
    const loadedFit =
      product.fit || inferFitFromSizeCharts(charts) || "Regular";

    setFormData({
      name: product.name ?? "",
      description:
        product.fullDescription || product.description || "",
      shortDescription: product.shortDescription ?? "",
      clothingType: product.clothingType ?? "T-Shirt",
      gender: product.gender ?? "Men",
      fabric: product.fabric ?? "Cotton",
      brand: product.brand ?? "",
      basePrice: basePrice,
      category: resolveCategoryId(product.category),
      ageGroup: product.ageGroup ?? "Adult",
      productFamily: product.productFamily ?? "",
      fabricComposition: product.fabricComposition ?? "100% Cotton",
      fit: loadedFit,
      pattern: product.pattern ?? "Solid",
      washType: product.washType ?? "Not Applicable",
      sleeveType: product.sleeveType ?? "Full Sleeve",
      neckType: product.neckType ?? "Round Neck",
      bottomStyle: product.bottomStyle ?? "Regular",
      waistType: product.waistType ?? "Mid Rise",
      bottomLength: product.bottomLength ?? "Full Length",
      pocketStyle: product.pocketStyle ?? "5 Pocket",
      hemStyle: product.hemStyle ?? "Plain",
      bottomClosure: product.bottomClosure ?? "Zip Fly",
      discount: product.discount ?? "",
      offerTitle: product.offerTitle ?? "",
      offerDescription: product.offerDescription ?? "",
      offerValidFrom: formatDateInputValue(product.offerValidFrom),
      offerValidTill: formatDateInputValue(product.offerValidTill),
      freeShipping: Boolean(product.freeShipping),
      season:
        Array.isArray(product.season) && product.season.length > 0
          ? product.season
          : ["All Season"],
      occasion:
        Array.isArray(product.occasion) && product.occasion.length > 0
          ? product.occasion
          : typeof product.occasion === "string" && product.occasion.trim()
            ? [product.occasion.trim()]
            : ["Casual"],
      features: Array.isArray(product.features) ? product.features : [],
      packageContent: product.packageContent ?? "1 Piece",
      countryOfOrigin: product.countryOfOrigin ?? "India",
      keyFeatures: Array.isArray(product.keyFeatures) ? product.keyFeatures : [],
      specifications: normalizeSpecificationsForEdit(product.specifications),
      careInstructions:
        Array.isArray(product.careInstructions) &&
        product.careInstructions.length > 0
          ? product.careInstructions
          : ["Machine Wash"],
      isFeatured: Boolean(product.isFeatured),
      isNewArrival:
        product.isNewArrival !== undefined ? Boolean(product.isNewArrival) : true,
      isBestSeller: Boolean(product.isBestSeller),
      isPremium: Boolean(product.isPremium),
      warranty: product.warranty ?? "No Warranty",
      returnPolicy: product.returnPolicy ?? "7 Days Return Available",
      returnWindow: product.returnWindow ?? 7,
      handlingTime: product.handlingTime ?? 1,
      estimatedDelivery: product.estimatedDelivery ?? 7,
      productDimensions: {
        ...DEFAULT_PRODUCT_DIMENSIONS,
        ...(product.productDimensions || {}),
      },
    });

    setSizeCharts(syncFitDescriptionOnCharts(charts, loadedFit));

    // Set colors and sizes from variants
    const productColors = [
      ...new Set(product.variants?.map((v) => v.color) || []),
    ];
    const productSizes = [
      ...new Set(product.variants?.map((v) => v.size) || []),
    ];

    setColors(productColors);
    setSizes(productSizes);

    // Create stock matrix from variants
    const matrix = {};
    product.variants?.forEach((variant) => {
      if (!matrix[variant.color]) {
        matrix[variant.color] = {};
      }
      matrix[variant.color][variant.size] =
        variant.stock ?? DEFAULT_VARIANT_STOCK;
    });
    setStockMatrix(matrix);

    // Create color-image map from allImages
    const imageMap = {};
    if (product.allImages) {
      product.allImages.forEach((img, index) => {
        if (img.color) {
          if (!imageMap[img.color]) {
            imageMap[img.color] = [];
          }
          imageMap[img.color].push(index);
        }
      });
    }
    setColorImageMap(imageMap);

    // Set variant images for preview (dedupe imagesByColor + allImages)
    const images = {};
    const seenImageIds = new Set();

    const assignToColor = (img, colorName) => {
      if (!colorName) return;
      const mapped = mapExistingImageForEdit(img);
      if (mapped.id) {
        if (seenImageIds.has(mapped.id)) return;
        seenImageIds.add(mapped.id);
      }
      if (!images[colorName]) images[colorName] = [];
      images[colorName].push(mapped);
    };

    if (product.imagesByColor && Object.keys(product.imagesByColor).length > 0) {
      Object.keys(product.imagesByColor).forEach((color) => {
        product.imagesByColor[color].forEach((img) => assignToColor(img, color));
      });
    }

    if (product.allImages?.length) {
      const fallbackColor = productColors[0];
      product.allImages.forEach((img) => {
        assignToColor(img, img.color || fallbackColor);
      });
    }

    setVariantImages(images);

    if (productColors.length > 0) {
      setCurrentColor(productColors[0]);
    }
  }, []);

  // Form update handlers — Fit dropdown syncs size chart fitDescription
  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "fit" && TOP_WEAR_TYPES.includes(next.clothingType)) {
        setSizeCharts((charts) => syncFitDescriptionOnCharts(charts, value));
      }
      return next;
    });
  };

  // Rich text editor handler
  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  // Key features handlers
  const addKeyFeature = () => {
    if (
      formData.shortDescription &&
      !formData.keyFeatures.includes(formData.shortDescription)
    ) {
      setFormData((prev) => ({
        ...prev,
        keyFeatures: [...prev.keyFeatures, prev.shortDescription],
      }));
      updateFormData("shortDescription", "");
    }
  };

  const removeKeyFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  // Specifications handlers
  const addSpecification = () => {
    if (tempSpecKey.trim() && tempSpecValue.trim()) {
      const newSpecs = new Map(formData.specifications);
      newSpecs.set(tempSpecKey.trim(), tempSpecValue.trim());
      setFormData((prev) => ({ ...prev, specifications: newSpecs }));
      setTempSpecKey("");
      setTempSpecValue("");
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = new Map(formData.specifications);
    newSpecs.delete(key);
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  // Care instructions handlers
  const toggleCareInstruction = (instruction) => {
    const currentInstructions = formData.careInstructions;
    const updatedInstructions = currentInstructions.includes(instruction)
      ? currentInstructions.filter((item) => item !== instruction)
      : [...currentInstructions, instruction];

    setFormData((prev) => ({ ...prev, careInstructions: updatedInstructions }));
  };

  // Features handlers
  const toggleFeature = (feature) => {
    const currentFeatures = formData.features;
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((item) => item !== feature)
      : [...currentFeatures, feature];

    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  // Season handlers
  const toggleSeason = (season) => {
    const currentSeasons = formData.season;
    const updatedSeasons = currentSeasons.includes(season)
      ? currentSeasons.filter((item) => item !== season)
      : [...currentSeasons, season];

    setFormData((prev) => ({ ...prev, season: updatedSeasons }));
  };

  // Occasion handlers
  const toggleOccasion = (occasion) => {
    const currentOccasions = formData.occasion;
    const updatedOccasions = currentOccasions.includes(occasion)
      ? currentOccasions.filter((item) => item !== occasion)
      : [...currentOccasions, occasion];

    setFormData((prev) => ({ ...prev, occasion: updatedOccasions }));
  };

  // Size handlers — pass optional explicit size for custom inputs (e.g. "UK 9", "32x34")
  const addSize = (explicitSize) => {
    const sizeToAdd = (
      explicitSize != null ? String(explicitSize) : selectedSize
    )?.trim();
    if (sizeToAdd && !sizes.includes(sizeToAdd)) {
      setSizes((prev) => [...prev, sizeToAdd]);

      setStockMatrix((prev) => {
        const updated = { ...prev };
        colors.forEach((color) => {
          if (!updated[color]) {
            updated[color] = {};
          }
          if (updated[color][sizeToAdd] === undefined) {
            updated[color][sizeToAdd] = DEFAULT_VARIANT_STOCK;
          }
        });
        return updated;
      });
    }
  };

  const removeSize = (sizeToRemove) => {
    setSizes((prev) => prev.filter((s) => s !== sizeToRemove));

    setStockMatrix((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((color) => {
        if (updated[color][sizeToRemove]) {
          delete updated[color][sizeToRemove];
        }
      });
      return updated;
    });

    setSizeCharts((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((color) => {
        if (updated[color]?.[sizeToRemove]) {
          delete updated[color][sizeToRemove];
        }
      });
      return updated;
    });
  };

  // Color handlers
  const addColor = () => {
    if (!currentColor) return;
    const colorObj = COLOR_OPTIONS.find((c) => c.code === currentColor);
    if (colorObj && !colors.includes(colorObj.name)) {
      setColors((prev) => [...prev, colorObj.name]);

      setStockMatrix((prev) => {
        const updated = { ...prev };
        if (!updated[colorObj.name]) {
          updated[colorObj.name] = {};
          sizes.forEach((size) => {
            updated[colorObj.name][size] = DEFAULT_VARIANT_STOCK;
          });
        }
        return updated;
      });

      setCurrentColor("");
    }
  };

  const removeColor = (colorName) => {
    setColors((prev) => prev.filter((c) => c !== colorName));

    setStockMatrix((prev) => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });

    setVariantImages((prev) => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });

    setColorImageMap((prev) => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });

    setSizeCharts((prev) => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
  };

  // Stock handlers
  const updateStock = (colorName, sizeName, stock) => {
    setStockMatrix((prev) => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        [sizeName]: parseInt(stock) || 0,
      },
    }));
  };

  // Image Handlers
  const handleImageUpload = (colorName) => (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const existingImages = variantImages[colorName] || [];
    const currentCount = existingImages.length;

    if (currentCount >= MAX_IMAGES_PER_COLOR) {
      toast({
        title: "Limit Reached",
        description: `You can upload a maximum of ${MAX_IMAGES_PER_COLOR} images for ${colorName}.`,
      });
      return;
    }

    const allowedFiles = files.slice(0, MAX_IMAGES_PER_COLOR - currentCount);

    const oversized = allowedFiles.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized.length > 0) {
      toast({
        title: "File too large",
        description: `${oversized.length} image(s) exceed ${MAX_IMAGE_SIZE_MB}MB. Compress or choose smaller files.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const newFiles = allowedFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: existingImages.length === 0 && index === 0,
      isExisting: false,
    }));

    setVariantImages((prev) => ({
      ...prev,
      [colorName]: [...existingImages, ...newFiles],
    }));

    e.target.value = "";
  };

  const removeImage = (colorName, index) => {
    setVariantImages((prev) => {
      const existingImages = prev[colorName] || [];
      const updatedImages = existingImages.filter((_, i) => i !== index);

      if (updatedImages.length > 0 && existingImages[index]?.isMain) {
        updatedImages[0].isMain = true;
      }

      return {
        ...prev,
        [colorName]: updatedImages,
      };
    });
  };

  const setMainImage = (colorName, index) => {
    setVariantImages((prev) => {
      const existingImages = prev[colorName] || [];
      const updatedImages = existingImages.map((img, i) => ({
        ...img,
        isMain: i === index,
      }));
      return {
        ...prev,
        [colorName]: updatedImages,
      };
    });
  };

  // Size Chart Functions
  const updateSizeChart = (colorName, size, field, value) => {
    setSizeCharts((prev) => {
      const colorCharts = prev[colorName] || {};
      const sizeChart = colorCharts[size] || {};

      return {
        ...prev,
        [colorName]: {
          ...colorCharts,
          [size]: {
            ...sizeChart,
            [field]: value,
          },
        },
      };
    });

    if (field === "fitDescription") {
      const mappedFit = fitDescriptionToProductFit(value);
      if (mappedFit) {
        setFormData((prev) => ({ ...prev, fit: mappedFit }));
      }
    }
  };

  const getSizeChartForColor = (colorName) => {
    return sizeCharts[colorName] || {};
  };

  const getSizeChartForVariant = (colorName, size) => {
    return sizeCharts[colorName]?.[size] || {};
  };

  const resetSizeCharts = () => {
    setSizeCharts({});
  };

  const applySizeChartTemplate = (templateKey) => {
    const template = SIZE_CHART_TEMPLATES[templateKey];

    if (!template) {
      toast({
        title: "Error",
        description: "Please select a valid size chart template",
        variant: "destructive",
      });
      return false;
    }

    if (colors.length === 0 || sizes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one color and size before applying a size chart",
        variant: "destructive",
      });
      return false;
    }

    const templateFit = template.productFit || null;
    if (templateFit) {
      setFormData((prev) => ({ ...prev, fit: templateFit }));
    }

    setSizeCharts((prev) => {
      const nextCharts = { ...prev };

      colors.forEach((colorName) => {
        const colorCharts = nextCharts[colorName] || {};

        sizes.forEach((size) => {
          const templateMeasurements = template.measurements[size];
          if (!templateMeasurements) return;

          colorCharts[size] = {
            ...colorCharts[size],
            ...template.defaults,
            ...templateMeasurements,
          };
        });

        nextCharts[colorName] = colorCharts;
      });

      if (templateFit) {
        return syncFitDescriptionOnCharts(nextCharts, templateFit);
      }
      return nextCharts;
    });

    toast({
      title: "Size chart applied",
      description: `${template.label} measurements added for matching sizes`,
    });

    return true;
  };

  /** Fast listing: Black + S–XL, default stock, common copy */
  const applyQuickListingPreset = useCallback(() => {
    const presetSizes = ["S", "M", "L", "XL"];
    const presetColor = "Black";
    const template = SIZE_CHART_TEMPLATES.oversizedTshirt;

    setFormData((prev) => ({
      ...prev,
      brand: prev.brand || "swag fashion",
      clothingType: "T-Shirt",
      gender: "Men",
      fabric: "Cotton",
      ageGroup: "Adult",
      productFamily: "Upper Body",
      fit: "Oversized",
      pattern: "Solid",
      washType: "Not Applicable",
      fabricComposition: "100% Cotton",
      packageContent: "1 Piece",
      countryOfOrigin: "India",
      careInstructions: ["Machine Wash"],
      season: ["All Season"],
      occasion: ["Casual"],
      description:
        prev.description?.trim() ||
        "Premium cotton tee with bold graphic print. Soft fabric and comfortable fit, ideal for everyday street style.",
      shortDescription:
        prev.shortDescription?.trim() ||
        "Premium graphic tee - soft cotton, street-ready fit.",
    }));

    setSizes(presetSizes);
    setColors([presetColor]);

    const stock = { [presetColor]: {} };
    presetSizes.forEach((size) => {
      stock[presetColor][size] = DEFAULT_VARIANT_STOCK;
    });
    setStockMatrix(stock);

    if (template) {
      const charts = {
        [presetColor]: {},
      };
      presetSizes.forEach((size) => {
        const m = template.measurements[size];
        if (!m) return;
        charts[presetColor][size] = {
          ...template.defaults,
          ...m,
        };
      });
      setSizeCharts(charts);
    }
  }, []);

  // Helper function for selling price
  const calculateSellingPrice = (price, discount) => {
    if (discount > 0) {
      return Math.round((price * (100 - discount)) / 100);
    }
    return price;
  };

  // Prepare form data for submission
const prepareFormData = () => {
  try {
    if (!formData.name || !formData.description || !formData.category) {
      throw new Error("Name, description, and category are required");
    }

    const formDataObj = new FormData();

    const isEdit = Boolean(editingProductId || editProductId);

    const isBottomWear = BOTTOM_WEAR_TYPES.includes(formData.clothingType);
    const isTopWear = TOP_WEAR_TYPES.includes(formData.clothingType);

    let resolvedFit = formData.fit || "Regular";
    if (resolvedFit === "Regular" && isTopWear) {
      const inferred = inferFitFromSizeCharts(sizeCharts);
      if (inferred) resolvedFit = inferred;
    }

    // Always send fit — storefront filter uses this field
    formDataObj.append("fit", resolvedFit);

    const defaultFitDescription = isTopWear
      ? productFitToFitDescription(resolvedFit)
      : null;

    // Add basic fields
    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      if (value === undefined || value === null) {
        return;
      }

      if (key === "fit") {
        return;
      }

      // ✅ SKIP IRRELEVANT FIELDS BASED ON CLOTHING TYPE
      if (isBottomWear && (key === 'sleeveType' || key === 'neckType')) {
        return; // Bottom wear ke liye top fields skip
      }
      
      if (isTopWear && (key === 'bottomStyle' || key === 'waistType' || 
          key === 'bottomLength' || key === 'pocketStyle' || 
          key === 'hemStyle' || key === 'bottomClosure')) {
        return; // Top wear ke liye bottom fields skip
      }

      if (
        key === "season" ||
        key === "occasion" ||
        key === "features" ||
        key === "keyFeatures" ||
        key === "careInstructions"
      ) {
        if (Array.isArray(value) && value.length > 0) {
          formDataObj.append(key, JSON.stringify(value));
        }
      } else if (key === "specifications") {
        const specsObj = Object.fromEntries(value);
        if (Object.keys(specsObj).length > 0) {
          formDataObj.append(key, JSON.stringify(specsObj));
        }
      } else if (key === "productDimensions") {
        if (value && typeof value === "object") {
          formDataObj.append(key, JSON.stringify(value));
        } else {
          formDataObj.append(key, value || "{}");
        }
      } else if (
        [
          "freeShipping",
          "isFeatured",
          "isNewArrival",
          "isBestSeller",
          "isPremium",
        ].includes(key)
      ) {
        formDataObj.append(key, value.toString());
      } else if (key === "basePrice") {
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) {
          throw new Error("Please enter a valid price");
        }
        formDataObj.append(key, price.toString());
      } else if (key === "discount") {
        const discount = parseFloat(value);
        if (!isNaN(discount) && discount > 0) {
          formDataObj.append(key, discount.toString());
        }
      } else if (key === "returnWindow") {
        const window = parseInt(value);
        if (!isNaN(window) && window > 0) {
          formDataObj.append(key, window.toString());
        }
      } else if (value !== "" && value !== false) {
        formDataObj.append(key, value);
      }
    });

    // ✅ VARIANTS - HAMESHA SABHI COLOR-SIZE COMBINATIONS KE LIYE ADD KARO
    if (colors.length === 0) {
      throw new Error("Please add at least one color");
    }
    if (sizes.length === 0) {
      throw new Error("Please add at least one size");
    }

    // Create variants with size charts
    const variants = [];

    colors.forEach((colorName) => {
      sizes.forEach((sizeName) => {
        const stock = stockMatrix[colorName]?.[sizeName];
        // ✅ HAMESHA VARIANT ADD KARO, CHAHE STOCK 0 HO
        variants.push({
          color: colorName,
          colorCode: COLOR_OPTIONS.find((c) => c.name === colorName)?.code || "#000000",
          size: sizeName,
          stock:
            stock !== undefined && !isNaN(stock)
              ? parseInt(stock)
              : DEFAULT_VARIANT_STOCK,
          price: parseFloat(formData.basePrice) || 0,
          sellingPrice: calculateSellingPrice(
            parseFloat(formData.basePrice) || 0,
            parseFloat(formData.discount) || 0,
          ),
          sizeDetails: (() => {
            const raw = sizeCharts[colorName]?.[sizeName] || {};
            if (!defaultFitDescription) return raw;
            return {
              ...raw,
              fitDescription: raw.fitDescription || defaultFitDescription,
            };
          })(),
        });
      });
    });

    if (variants.length === 0) {
      throw new Error("Please add at least one variant");
    }

    formDataObj.append("variants", JSON.stringify(variants));
    formDataObj.append("colors", JSON.stringify(colors));
    formDataObj.append("sizes", JSON.stringify(sizes));
    formDataObj.append("stockMatrix", JSON.stringify(stockMatrix));

    const colorCodesArray = colors.map((color) => {
      const colorObj = COLOR_OPTIONS.find((c) => c.name === color);
      return colorObj?.code || "#000000";
    });
    formDataObj.append("colorCodes", JSON.stringify(colorCodesArray));

    // Handle images — preserve UI order for edit (existing + new interleaved)
    const allImageFiles = [];
    const imageOrder = [];
    const finalColorImageMap = {};
    let globalIndex = 0;

    colors.forEach((colorName) => {
      const images = variantImages[colorName] || [];
      if (images.length === 0) {
        throw new Error(
          `Please upload at least one image for color: ${colorName}`,
        );
      }

      const indices = [];

      images.forEach((imgObj) => {
        if (imgObj?.file) {
          indices.push(globalIndex);
          imageOrder.push({ type: "new", fileIndex: allImageFiles.length });
          allImageFiles.push(imgObj.file);
          globalIndex++;
          return;
        }

        const existingId = resolveExistingImageId(imgObj);
        const existingUrl = imgObj?.preview || imgObj?.url;

        if (imgObj?.isExisting || existingId || existingUrl) {
          if (!existingId && !existingUrl) {
            throw new Error(
              `Could not identify an existing image for ${colorName}. Please re-upload it.`,
            );
          }
          indices.push(globalIndex);
          imageOrder.push({
            type: "existing",
            ...(existingId ? { id: existingId } : {}),
            ...(existingUrl ? { url: existingUrl } : {}),
          });
          globalIndex++;
        }
      });

      if (indices.length > 0) {
        finalColorImageMap[colorName] = indices;
      }
    });

    if (isEdit) {
      const existingImageIds = imageOrder
        .filter((entry) => entry.type === "existing")
        .map((entry) => entry.id);
      formDataObj.append("existingImages", JSON.stringify(existingImageIds));
      formDataObj.append("imageOrder", JSON.stringify(imageOrder));
    }

    allImageFiles.forEach((file) => {
      formDataObj.append("images", file);
    });

    formDataObj.append("colorImageMap", JSON.stringify(finalColorImageMap));

    return formDataObj;
  } catch (error) {
    console.error("Error in prepareFormData:", error);
    throw error;
  }
};

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      clothingType: "T-Shirt",
      gender: "Men",
      fabric: "Cotton",
      brand: "",
      basePrice: "",
      category: "",
      ageGroup: "Adult",
      productFamily: "",
      fabricComposition: "100% Cotton",
      fit: "Regular",
      pattern: "Solid",
      washType: "Not Applicable",
      sleeveType: "Full Sleeve",
      neckType: "Round Neck",
      bottomStyle: "Regular",
      waistType: "Mid Rise",
      bottomLength: "Full Length",
      pocketStyle: "5 Pocket",
      hemStyle: "Plain",
      bottomClosure: "Zip Fly",
      discount: "",
      offerTitle: "",
      offerDescription: "",
      offerValidFrom: "",
      offerValidTill: "",
      freeShipping: false,
      season: ["All Season"],
      occasion: ["Casual"],
      features: [],
      packageContent: "1 Piece",
      countryOfOrigin: "India",
      keyFeatures: [],
      specifications: new Map(),
      careInstructions: ["Machine Wash"],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isPremium: false,
      warranty: "No Warranty",
      returnPolicy: "7 Days Return Available",
      returnWindow: 7,
      handlingTime: 1,
      estimatedDelivery: 7,
      productDimensions: { ...DEFAULT_PRODUCT_DIMENSIONS },
    });
    setColors([]);
    setSizes([]);
    setStockMatrix({});
    setVariantImages({});
    setColorImageMap({});
    setSizeCharts({});
    setSelectedSize("M");
    setCurrentColor("");
    setTempSpecKey("");
    setTempSpecValue("");
    setEditingProductId(null);
  };

  // Validation
  const validateForm = () => {
    try {
      if (!formData.name?.trim()) {
        toast({
          title: "Error",
          description: "Product name is required",
          variant: "destructive",
        });
        return false;
      }

      if (!formData.description?.trim()) {
        toast({
          title: "Error",
          description: "Product description is required",
          variant: "destructive",
        });
        return false;
      }

      const price = parseFloat(formData.basePrice);
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid price greater than 0",
          variant: "destructive",
        });
        return false;
      }

      if (!formData.category) {
        toast({
          title: "Error",
          description: "Please select a category",
          variant: "destructive",
        });
        return false;
      }

      if (colors.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one color",
          variant: "destructive",
        });
        return false;
      }

      if (sizes.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one size",
          variant: "destructive",
        });
        return false;
      }

      for (const colorName of colors) {
        for (const sizeName of sizes) {
          const stock = stockMatrix[colorName]?.[sizeName];
          if (stock === undefined || stock === null || isNaN(stock)) {
            toast({
              title: "Error",
              description: `Please enter stock for ${colorName} - ${sizeName}`,
              variant: "destructive",
            });
            return false;
          }
        }
      }

      for (const colorName of colors) {
        const images = variantImages[colorName];
        if (!images || images.length === 0) {
          toast({
            title: "Error",
            description: `Please upload at least one image for color: ${colorName}`,
            variant: "destructive",
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Error",
        description: "An error occurred during validation",
        variant: "destructive",
      });
      return false;
    }
  };

  // Helper to get total stock for a color
  const getTotalStockForColor = (colorName) => {
    if (!stockMatrix[colorName]) return 0;
    return Object.values(stockMatrix[colorName]).reduce(
      (sum, stock) => sum + (stock || 0),
      0,
    );
  };

  return {
    formData,
    updateFormData,
    colors,
    sizes,
    stockMatrix,
    variantImages,
    colorImageMap,
    selectedSize,
    currentColor,
    isLoading,
    setIsLoading,
    fileInputRefs,
    tempSpecKey,
    tempSpecValue,
    setTempSpecKey,
    setTempSpecValue,

    SIZE_OPTIONS,
    COLOR_OPTIONS,
    CLOTHING_TYPES,
    PRODUCT_FAMILIES,
    AGE_GROUPS,
    GENDERS,
    FABRICS,
    FITS,
    PATTERNS,
    WASH_TYPES,
    SIZE_CHART_TEMPLATES,
    SLEEVE_TYPES,
    NECK_TYPES,
    ALL_FEATURES,
    SEASONS,
    OCCASIONS,
    CARE_INSTRUCTIONS,
    MAX_IMAGES_PER_COLOR,
    TOP_WEAR_TYPES,
    BOTTOM_WEAR_TYPES,
    BOTTOM_STYLES,
    WAIST_TYPES,
    BOTTOM_LENGTHS,
    POCKET_STYLES,
    HEM_STYLES,
    BOTTOM_CLOSURES,
    addSize,
    removeSize,
    setSelectedSize,
    addColor,
    removeColor,
    setCurrentColor,
    updateStock,
    handleImageUpload,
    removeImage,
    setMainImage,
    prepareFormData,
    resetForm,
    validateForm,
    initializeForm,
    handleDescriptionChange,
    addKeyFeature,
    removeKeyFeature,
    addSpecification,
    removeSpecification,
    toggleCareInstruction,
    toggleFeature,
    toggleSeason,
    toggleOccasion,
    getTotalStockForColor,

    sizeCharts,
    updateSizeChart,
    getSizeChartForColor,
    getSizeChartForVariant,
    resetSizeCharts,
    applySizeChartTemplate,
    applyQuickListingPreset,
  };
};
