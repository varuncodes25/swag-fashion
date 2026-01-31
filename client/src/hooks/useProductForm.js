import { useState, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

// Constants
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
const MAX_IMAGES_PER_COLOR = 40;

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
  { name: "Khaki", code: "#C3B091" }
];

// Clothing Types
const CLOTHING_TYPES = [
  "T-Shirt", "Shirt", "Jeans", "Trousers", "Shorts",
  "Jacket", "Sweater", "Hoodie", "Sweatshirt",
  "Dress", "Skirt", "Top", "Kurta", "Sherwani",
  "Saree", "Lehenga", "Blouse", "Track Suit",
  "Innerwear", "Socks", "Cap", "Scarf", "Other"
];

// Genders
const GENDERS = ["Men", "Women", "Unisex", "Kids", "Boys", "Girls"];

// Fabrics
const FABRICS = [
  "Cotton", "Polyester", "Silk", "Wool", "Linen",
  "Denim", "Leather", "Nylon", "Rayon", "Spandex",
  "Velvet", "Chiffon", "Georgette", "Crepe", "Satin",
  "Blended", "Other"
];

// Fits
const FITS = ["Regular", "Slim", "Relaxed", "Oversized", "Skinny", "Boyfriend", "Bodycon"];

// Patterns
const PATTERNS = [
  "Solid", "Striped", "Checked", "Printed", "Floral",
  "Geometric", "Abstract", "Polka Dot", "Ethnic", "Plain",
  "Embroidered", "Sequined", "Tie-Dye"
];

// Sleeve types
const SLEEVE_TYPES = [
  "Full Sleeve", "Half Sleeve", "Sleeveless", 
  "Short Sleeve", "Three-Quarter", "Puff Sleeve", "Bell Sleeve"
];

// Neck types
const NECK_TYPES = [
  "Round Neck", "V-Neck", "Polo Neck", "Collared", 
  "Hooded", "Turtleneck", "Square Neck"
];

// Features for checklist
const ALL_FEATURES = [
  "Stretchable", "Wrinkle Free", "Quick Dry", "Breathable",
  "Water Resistant", "Anti-Bacterial", "UV Protection",
  "Thermal", "Moisture Wicking", "Odor Resistant",
  "Pocket", "Hood", "Zipper", "Buttons", "Drawstring"
];

// Seasons
const SEASONS = ["Summer", "Winter", "Spring", "Autumn", "All Season", "Monsoon"];

// Occasions
const OCCASIONS = ["Casual", "Formal", "Party", "Wedding", "Sports", "Beach", "Office", "Travel", "Evening", "Traditional"];

export const useProductForm = (initialData = null) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    clothingType: 'T-Shirt',
    gender: 'Men',
    fabric: 'Cotton',
    brand: '',
    basePrice: '',
    category: '',
    ageGroup: 'Adult',
    fabricComposition: '100% Cotton',
    fit: 'Regular',
    pattern: 'Solid',
    sleeveType: 'Full Sleeve',
    neckType: 'Round Neck',
    discount: '',
    offerTitle: '',
    offerDescription: '',
    offerValidFrom: '',
    offerValidTill: '',
    freeShipping: false,
    season: ['All Season'],
    occasion: ['Casual'],
    features: [],
    packageContent: '1 Piece',
    countryOfOrigin: 'India',
    keyFeatures: [],
    specifications: new Map(),
    careInstructions: ['Machine Wash'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    warranty: 'No Warranty',
    returnPolicy: '7 Days Return Available',
    returnWindow: 7,
  });

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [stockMatrix, setStockMatrix] = useState({}); // NEW: Changed from colorStocks to stockMatrix
  const [variantImages, setVariantImages] = useState({});
  const [colorImageMap, setColorImageMap] = useState({}); // NEW: For tracking image indices
  const [selectedSize, setSelectedSize] = useState('M');
  const [currentColor, setCurrentColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempSpecKey, setTempSpecKey] = useState('');
  const [tempSpecValue, setTempSpecValue] = useState('');
  
  const fileInputRefs = useRef({});
  const { toast } = useToast();

  // Initialize form with product data if editing
  const initializeForm = useCallback((product) => {
    if (!product) return;
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      clothingType: product.clothingType || 'T-Shirt',
      gender: product.gender || 'Men',
      fabric: product.fabric || 'Cotton',
      brand: product.brand || '',
      basePrice: product.variants?.[0]?.price || '',
      category: product.category?._id || product.category || '',
      ageGroup: product.ageGroup || 'Adult',
      fabricComposition: product.fabricComposition || '100% Cotton',
      fit: product.fit || 'Regular',
      pattern: product.pattern || 'Solid',
      sleeveType: product.sleeveType || 'Full Sleeve',
      neckType: product.neckType || 'Round Neck',
      discount: product.discount || '',
      offerTitle: product.offerTitle || '',
      offerDescription: product.offerDescription || '',
      offerValidFrom: product.offerValidFrom || '',
      offerValidTill: product.offerValidTill || '',
      freeShipping: product.freeShipping || false,
      season: product.season || ['All Season'],
      occasion: product.occasion || ['Casual'],
      features: product.features || [],
      packageContent: product.packageContent || '1 Piece',
      countryOfOrigin: product.countryOfOrigin || 'India',
      keyFeatures: product.keyFeatures || [],
      specifications: new Map(Object.entries(product.specifications || {})),
      careInstructions: product.careInstructions || ['Machine Wash'],
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival !== undefined ? product.isNewArrival : true,
      isBestSeller: product.isBestSeller || false,
      warranty: product.warranty || 'No Warranty',
      returnPolicy: product.returnPolicy || '7 Days Return Available',
      returnWindow: product.returnWindow || 7,
    });

    // Set colors and sizes from variants
    const productColors = [...new Set(product.variants?.map(v => v.color) || [])];
    const productSizes = [...new Set(product.variants?.map(v => v.size) || [])];
    
    setColors(productColors);
    setSizes(productSizes);

    // NEW: Create stock matrix from variants (color x size matrix)
    const matrix = {};
    product.variants?.forEach(variant => {
      if (!matrix[variant.color]) {
        matrix[variant.color] = {};
      }
      matrix[variant.color][variant.size] = variant.stock || 0;
    });
    setStockMatrix(matrix);

    // NEW: Create color-image map from allImages
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

    // Set variant images (for preview only - from imagesByColor)
    const images = {};
    if (product.imagesByColor) {
      Object.keys(product.imagesByColor).forEach(color => {
        images[color] = product.imagesByColor[color].map(img => ({
          file: null,
          preview: img.url,
          id: img.id,
          isMain: img.isMain || false,
        }));
      });
    }
    setVariantImages(images);
  }, []);

  // Form update handlers
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Rich text editor handler
  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  // Key features handlers
  const addKeyFeature = () => {
    if (formData.shortDescription && !formData.keyFeatures.includes(formData.shortDescription)) {
      setFormData(prev => ({
        ...prev,
        keyFeatures: [...prev.keyFeatures, prev.shortDescription]
      }));
      updateFormData('shortDescription', '');
    }
  };

  const removeKeyFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index)
    }));
  };

  // Specifications handlers
  const addSpecification = () => {
    if (tempSpecKey.trim() && tempSpecValue.trim()) {
      const newSpecs = new Map(formData.specifications);
      newSpecs.set(tempSpecKey.trim(), tempSpecValue.trim());
      setFormData(prev => ({ ...prev, specifications: newSpecs }));
      setTempSpecKey('');
      setTempSpecValue('');
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = new Map(formData.specifications);
    newSpecs.delete(key);
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  // Care instructions handlers
  const toggleCareInstruction = (instruction) => {
    const currentInstructions = formData.careInstructions;
    const updatedInstructions = currentInstructions.includes(instruction)
      ? currentInstructions.filter(item => item !== instruction)
      : [...currentInstructions, instruction];
    
    setFormData(prev => ({ ...prev, careInstructions: updatedInstructions }));
  };

  // Features handlers
  const toggleFeature = (feature) => {
    const currentFeatures = formData.features;
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(item => item !== feature)
      : [...currentFeatures, feature];
    
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  // Season handlers
  const toggleSeason = (season) => {
    const currentSeasons = formData.season;
    const updatedSeasons = currentSeasons.includes(season)
      ? currentSeasons.filter(item => item !== season)
      : [...currentSeasons, season];
    
    setFormData(prev => ({ ...prev, season: updatedSeasons }));
  };

  // Occasion handlers
  const toggleOccasion = (occasion) => {
    const currentOccasions = formData.occasion;
    const updatedOccasions = currentOccasions.includes(occasion)
      ? currentOccasions.filter(item => item !== occasion)
      : [...currentOccasions, occasion];
    
    setFormData(prev => ({ ...prev, occasion: updatedOccasions }));
  };

  // Size handlers
  const addSize = () => {
    if (selectedSize && !sizes.includes(selectedSize)) {
      setSizes(prev => [...prev, selectedSize]);
      
      // Update stock matrix for all colors with new size
      setStockMatrix(prev => {
        const updated = { ...prev };
        colors.forEach(color => {
          if (!updated[color]) {
            updated[color] = {};
          }
          if (!updated[color][selectedSize]) {
            updated[color][selectedSize] = 0;
          }
        });
        return updated;
      });
    }
  };

  const removeSize = (sizeToRemove) => {
    setSizes(prev => prev.filter(s => s !== sizeToRemove));
    
    // Remove size from stock matrix
    setStockMatrix(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(color => {
        if (updated[color][sizeToRemove]) {
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
      setColors(prev => [...prev, colorObj.name]);
      
      // Initialize stock matrix for new color
      setStockMatrix(prev => {
        const updated = { ...prev };
        if (!updated[colorObj.name]) {
          updated[colorObj.name] = {};
          sizes.forEach(size => {
            updated[colorObj.name][size] = 0;
          });
        }
        return updated;
      });
      
      setCurrentColor('');
    }
  };

  const removeColor = (colorName) => {
    setColors(prev => prev.filter(c => c !== colorName));
    
    // Remove from stock matrix
    setStockMatrix(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
    
    // Remove from variant images
    setVariantImages(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
    
    // Remove from color image map
    setColorImageMap(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
  };

  // NEW: Stock handlers for matrix
  const updateStock = (colorName, sizeName, stock) => {
    setStockMatrix(prev => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        [sizeName]: parseInt(stock) || 0
      }
    }));
  };

  // Image handlers
  // Image handlers - FIXED
const handleImageUpload = (colorName) => (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  setVariantImages((prev) => {
    const existingImages = prev[colorName] || [];
    const currentCount = existingImages.length;

    if (currentCount >= MAX_IMAGES_PER_COLOR) {
      toast({
        title: "Limit Reached",
        description: `You can upload a maximum of ${MAX_IMAGES_PER_COLOR} images for ${colorName}.`,
      });
      return prev;
    }

    // ✅ FIX: Define allowedFiles here
    const allowedFiles = files.slice(0, MAX_IMAGES_PER_COLOR - currentCount);
    const newFiles = allowedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: existingImages.length === 0,
    }));

    return {
      ...prev,
      [colorName]: [...existingImages, ...newFiles],
    };
  });

  // ✅ FIX: Calculate allowedFiles again for colorImageMap
  setColorImageMap(prev => {
    const existingImages = variantImages[colorName] || [];
    const currentCount = existingImages.length;
    const allowedFiles = files.slice(0, MAX_IMAGES_PER_COLOR - currentCount);
    
    const existingIndices = prev[colorName] || [];
    const newIndices = Array.from(
      { length: allowedFiles.length }, 
      (_, i) => currentCount + i
    );
    
    return {
      ...prev,
      [colorName]: [...existingIndices, ...newIndices]
    };
  });

  e.target.value = "";
};

  const removeImage = (colorName, index) => {
    setVariantImages((prev) => {
      const updatedImages = prev[colorName].filter((_, i) => i !== index);
      // If we removed the main image, make the first image main
      if (updatedImages.length > 0 && prev[colorName][index]?.isMain) {
        updatedImages[0].isMain = true;
      }
      return {
        ...prev,
        [colorName]: updatedImages,
      };
    });

    // Update colorImageMap indices
    setColorImageMap(prev => {
      const existingIndices = prev[colorName] || [];
      const updatedIndices = existingIndices
        .filter(idx => idx !== index)
        .map(idx => idx > index ? idx - 1 : idx);
      
      return {
        ...prev,
        [colorName]: updatedIndices
      };
    });
  };

  const setMainImage = (colorName, index) => {
    setVariantImages((prev) => {
      const updatedImages = prev[colorName].map((img, i) => ({
        ...img,
        isMain: i === index,
      }));
      return {
        ...prev,
        [colorName]: updatedImages,
      };
    });
  };

  // Prepare form data for submission - UPDATED FOR NEW SCHEMA
  const prepareFormData = () => {
    try {
      console.log("🚀 Preparing form data for new schema...");
      
      // Validate required fields first
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error("Name, description, and category are required");
      }

      const formDataObj = new FormData();
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        if (value === undefined || value === null) {
          return; // Skip undefined/null
        }
        
        if (key === 'season' || key === 'occasion' || key === 'features' || 
            key === 'keyFeatures' || key === 'careInstructions') {
          const arrayValue = Array.isArray(value) ? value : [];
          if (arrayValue.length > 0) {
            formDataObj.append(key, JSON.stringify(arrayValue));
          }
        } else if (key === 'specifications') {
          // Convert Map to object and stringify
          const specsObj = Object.fromEntries(value);
          if (Object.keys(specsObj).length > 0) {
            formDataObj.append(key, JSON.stringify(specsObj));
          }
        } else if (['freeShipping', 'isFeatured', 'isNewArrival', 'isBestSeller'].includes(key)) {
          formDataObj.append(key, value.toString());
        } else if (key === 'basePrice') {
          // Validate and add basePrice
          const price = parseFloat(value);
          if (isNaN(price) || price <= 0) {
            throw new Error("Please enter a valid price");
          }
          formDataObj.append(key, price.toString());
        } else if (key === 'discount') {
          // Only add discount if it has a value
          const discount = parseFloat(value);
          if (!isNaN(discount) && discount > 0) {
            formDataObj.append(key, discount.toString());
          }
        } else if (key === 'returnWindow') {
          const window = parseInt(value);
          if (!isNaN(window) && window > 0) {
            formDataObj.append(key, window.toString());
          }
        } else if (value !== '' && value !== false) {
          // Add other non-empty values
          formDataObj.append(key, value);
        }
      });

      // Validate colors and sizes
      if (colors.length === 0) {
        throw new Error("Please add at least one color");
      }
      if (sizes.length === 0) {
        throw new Error("Please add at least one size");
      }

      // Add colors and sizes
      formDataObj.append('colors', JSON.stringify(colors));
      formDataObj.append('sizes', JSON.stringify(sizes));
      
      // NEW: Add stock matrix (color x size)
      formDataObj.append('stockMatrix', JSON.stringify(stockMatrix));
      
      // Add color codes
      const colorCodesArray = colors.map(color => {
        const colorObj = COLOR_OPTIONS.find(c => c.name === color);
        return colorObj?.code || '#000000';
      });
      formDataObj.append('colorCodes', JSON.stringify(colorCodesArray));

      // NEW: Prepare images data for new schema
      const allImageFiles = [];
      let imageCount = 0;
      
      // Check if each color has at least one image
      colors.forEach(colorName => {
        const images = variantImages[colorName] || [];
        if (images.length === 0) {
          throw new Error(`Please upload at least one image for color: ${colorName}`);
        }
        
        images.forEach((imgObj) => {
          if (imgObj && imgObj.file) {
            allImageFiles.push(imgObj.file);
            imageCount++;
          }
        });
      });

      if (imageCount === 0) {
        throw new Error("No images uploaded. Please upload images for all colors.");
      }
      
      // Add all images to FormData
      allImageFiles.forEach((file) => {
        formDataObj.append('images', file);
      });
      
      // NEW: Add colorImageMap
      formDataObj.append('colorImageMap', JSON.stringify(colorImageMap));

      // Debug: Log what's being sent
      console.log("📤 FormData prepared successfully for new schema:", {
        name: formData.name,
        basePrice: formData.basePrice,
        colors: colors.length,
        sizes: sizes.length,
        images: imageCount,
        stockMatrix: stockMatrix,
        colorImageMap: colorImageMap,
        hasCategory: !!formData.category
      });

      return formDataObj;
      
    } catch (error) {
      console.error("❌ Error in prepareFormData:", error);
      throw error;
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      clothingType: 'T-Shirt',
      gender: 'Men',
      fabric: 'Cotton',
      brand: '',
      basePrice: '',
      category: '',
      ageGroup: 'Adult',
      fabricComposition: '100% Cotton',
      fit: 'Regular',
      pattern: 'Solid',
      sleeveType: 'Full Sleeve',
      neckType: 'Round Neck',
      discount: '',
      offerTitle: '',
      offerDescription: '',
      offerValidFrom: '',
      offerValidTill: '',
      freeShipping: false,
      season: ['All Season'],
      occasion: ['Casual'],
      features: [],
      packageContent: '1 Piece',
      countryOfOrigin: 'India',
      keyFeatures: [],
      specifications: new Map(),
      careInstructions: ['Machine Wash'],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      warranty: 'No Warranty',
      returnPolicy: '7 Days Return Available',
      returnWindow: 7,
    });
    setColors([]);
    setSizes([]);
    setStockMatrix({});
    setVariantImages({});
    setColorImageMap({});
    setSelectedSize('M');
    setCurrentColor('');
    setTempSpecKey('');
    setTempSpecValue('');
  };

  // Validation
  const validateForm = () => {
    try {
      // Check required fields
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

      // Validate basePrice
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

      // Validate colors and sizes
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

      // NEW: Validate stock for all color-size combinations
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

      // Validate images for each color
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

      // Validate date range if provided
      if (formData.offerValidFrom && formData.offerValidTill) {
        const fromDate = new Date(formData.offerValidFrom);
        const tillDate = new Date(formData.offerValidTill);
        
        if (isNaN(fromDate.getTime()) || isNaN(tillDate.getTime())) {
          toast({
            title: "Error",
            description: "Invalid date format for offer",
            variant: "destructive",
          });
          return false;
        }
        
        if (fromDate > tillDate) {
          toast({
            title: "Error",
            description: "Offer start date cannot be after end date",
            variant: "destructive",
          });
          return false;
        }
      }

      console.log("✅ Form validation passed");
      return true;
      
    } catch (error) {
      console.error("❌ Validation error:", error);
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
    return Object.values(stockMatrix[colorName]).reduce((sum, stock) => sum + (stock || 0), 0);
  };

  return {
    formData,
    updateFormData,
    colors,
    sizes,
    stockMatrix, // Changed from colorStocks
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
    
    // Constants
    SIZE_OPTIONS,
    COLOR_OPTIONS,
    CLOTHING_TYPES,
    GENDERS,
    FABRICS,
    FITS,
    PATTERNS,
    SLEEVE_TYPES,
    NECK_TYPES,
    ALL_FEATURES,
    SEASONS,
    OCCASIONS,
    MAX_IMAGES_PER_COLOR,

    // Handlers
    addSize,
    removeSize,
    setSelectedSize,
    addColor,
    removeColor,
    setCurrentColor,
    updateStock, // Changed from updateColorStock
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
    getTotalStockForColor, // New helper
  };
};