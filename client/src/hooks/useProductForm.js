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
    productDimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0.2
    },
  });

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [stockMatrix, setStockMatrix] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [colorImageMap, setColorImageMap] = useState({});
  const [selectedSize, setSelectedSize] = useState('M');
  const [currentColor, setCurrentColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempSpecKey, setTempSpecKey] = useState('');
  const [tempSpecValue, setTempSpecValue] = useState('');
  const [sizeCharts, setSizeCharts] = useState({});
  
  const fileInputRefs = useRef({});
  const { toast } = useToast();

  // Initialize form with product data if editing
  const initializeForm = useCallback((product) => {
    if (!product) return;
    
    // ✅ FIX 1: Base price properly calculate karo
    let basePrice = product.basePrice || '';
    if (!basePrice && product.variants && product.variants.length > 0) {
      const uniquePrices = [...new Set(product.variants.map(v => v.price))];
      basePrice = uniquePrices[0] || '';
    }
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      clothingType: product.clothingType || 'T-Shirt',
      gender: product.gender || 'Men',
      fabric: product.fabric || 'Cotton',
      brand: product.brand || '',
      basePrice: basePrice, // ✅ Fixed
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
      productDimensions: product.productDimensions || { length: 0, width: 0, height: 0, weight: 0.2 }
    });

    // Initialize size charts from variants
    const charts = {};
    if (product.variants) {
      product.variants.forEach(variant => {
        if (variant.sizeDetails && Object.keys(variant.sizeDetails).length > 0) {
          if (!charts[variant.color]) {
            charts[variant.color] = {};
          }
          charts[variant.color][variant.size] = variant.sizeDetails;
        }
      });
    }
    setSizeCharts(charts);

    // Set colors and sizes from variants
    const productColors = [...new Set(product.variants?.map(v => v.color) || [])];
    const productSizes = [...new Set(product.variants?.map(v => v.size) || [])];
    
    setColors(productColors);
    setSizes(productSizes);

    // Create stock matrix from variants
    const matrix = {};
    product.variants?.forEach(variant => {
      if (!matrix[variant.color]) {
        matrix[variant.color] = {};
      }
      matrix[variant.color][variant.size] = variant.stock || 0;
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

    // Set variant images for preview
    const images = {};
    if (product.imagesByColor) {
      Object.keys(product.imagesByColor).forEach(color => {
        images[color] = product.imagesByColor[color].map(img => ({
          file: null,
          preview: img.url,
          id: img.id,
          isMain: img.isMain || false,
          isExisting: true
        }));
      });
    } else if (product.allImages) {
      const imagesByColor = {};
      product.allImages.forEach(img => {
        if (img.color) {
          if (!imagesByColor[img.color]) {
            imagesByColor[img.color] = [];
          }
          imagesByColor[img.color].push(img);
        }
      });
      
      Object.keys(imagesByColor).forEach(color => {
        images[color] = imagesByColor[color].map(img => ({
          file: null,
          preview: img.url,
          id: img.id,
          isMain: img.isMain || false,
          isExisting: true
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
    
    setStockMatrix(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(color => {
        if (updated[color][sizeToRemove]) {
          delete updated[color][sizeToRemove];
        }
      });
      return updated;
    });
    
    setSizeCharts(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(color => {
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
      setColors(prev => [...prev, colorObj.name]);
      
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
    
    setStockMatrix(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
    
    setVariantImages(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
    
    setColorImageMap(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
    
    setSizeCharts(prev => {
      const updated = { ...prev };
      delete updated[colorName];
      return updated;
    });
  };

  // Stock handlers
  const updateStock = (colorName, sizeName, stock) => {
    setStockMatrix(prev => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        [sizeName]: parseInt(stock) || 0
      }
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
    
    const newFiles = allowedFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: existingImages.length === 0 && index === 0,
      isExisting: false
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
    setSizeCharts(prev => {
      const colorCharts = prev[colorName] || {};
      const sizeChart = colorCharts[size] || {};
      
      return {
        ...prev,
        [colorName]: {
          ...colorCharts,
          [size]: {
            ...sizeChart,
            [field]: value
          }
        }
      };
    });
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

  // Helper function for selling price
  const calculateSellingPrice = (price, discount) => {
    if (discount > 0) {
      return Math.round(price * (100 - discount) / 100);
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
      
      // ✅ FIX 2: Edit mode ke liye productId add karo
      if (initialData?._id) {
        formDataObj.append('productId', initialData._id);
      }
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        if (value === undefined || value === null) {
          return;
        }
        
        if (key === 'season' || key === 'occasion' || key === 'features' || 
            key === 'keyFeatures' || key === 'careInstructions') {
          if (Array.isArray(value) && value.length > 0) {
            formDataObj.append(key, JSON.stringify(value));
          }
        } 
        else if (key === 'specifications') {
          const specsObj = Object.fromEntries(value);
          if (Object.keys(specsObj).length > 0) {
            formDataObj.append(key, JSON.stringify(specsObj));
          }
        } 
        else if (key === 'productDimensions') {
          if (value && typeof value === 'object') {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value || '{}');
          }
        }
        else if (['freeShipping', 'isFeatured', 'isNewArrival', 'isBestSeller'].includes(key)) {
          formDataObj.append(key, value.toString());
        } 
        else if (key === 'basePrice') {
          const price = parseFloat(value);
          if (isNaN(price) || price <= 0) {
            throw new Error("Please enter a valid price");
          }
          formDataObj.append(key, price.toString());
        } 
        else if (key === 'discount') {
          const discount = parseFloat(value);
          if (!isNaN(discount) && discount > 0) {
            formDataObj.append(key, discount.toString());
          }
        } 
        else if (key === 'returnWindow') {
          const window = parseInt(value);
          if (!isNaN(window) && window > 0) {
            formDataObj.append(key, window.toString());
          }
        } 
        else if (value !== '' && value !== false) {
          formDataObj.append(key, value);
        }
      });

      if (colors.length === 0) {
        throw new Error("Please add at least one color");
      }
      if (sizes.length === 0) {
        throw new Error("Please add at least one size");
      }

      // Create variants with size charts
      const variants = [];
      
      colors.forEach(colorName => {
        sizes.forEach(sizeName => {
          const stock = stockMatrix[colorName]?.[sizeName] || 0;
          if (stock > 0 || (sizeCharts[colorName]?.[sizeName] && Object.keys(sizeCharts[colorName][sizeName]).length > 0)) {
            variants.push({
              color: colorName,
              colorCode: COLOR_OPTIONS.find(c => c.name === colorName)?.code || '#000000',
              size: sizeName,
              stock: parseInt(stock) || 0,
              price: parseFloat(formData.basePrice) || 0,
              sellingPrice: calculateSellingPrice(parseFloat(formData.basePrice) || 0, parseFloat(formData.discount) || 0),
              sizeDetails: sizeCharts[colorName]?.[sizeName] || {}
            });
          }
        });
      });

      formDataObj.append('variants', JSON.stringify(variants));
      formDataObj.append('colors', JSON.stringify(colors));
      formDataObj.append('sizes', JSON.stringify(sizes));
      formDataObj.append('stockMatrix', JSON.stringify(stockMatrix));
      
      const colorCodesArray = colors.map(color => {
        const colorObj = COLOR_OPTIONS.find(c => c.name === color);
        return colorObj?.code || '#000000';
      });
      formDataObj.append('colorCodes', JSON.stringify(colorCodesArray));

      // ✅ FIX 3: Handle images properly (new + existing)
      const allImageFiles = [];
      const existingImageIds = [];
      const finalColorImageMap = {};
      let globalIndex = 0;
      
      colors.forEach(colorName => {
        const images = variantImages[colorName] || [];
        if (images.length === 0) {
          throw new Error(`Please upload at least one image for color: ${colorName}`);
        }
        
        const indices = [];
        
        images.forEach((imgObj) => {
          if (imgObj && imgObj.file) {
            // New image
            allImageFiles.push(imgObj.file);
            indices.push(globalIndex);
            globalIndex++;
          } else if (imgObj && imgObj.id) {
            // Existing image
            existingImageIds.push(imgObj.id);
            indices.push(globalIndex);
            globalIndex++;
          }
        });
        
        if (indices.length > 0) {
          finalColorImageMap[colorName] = indices;
        }
      });

      // Add existing image IDs
      if (existingImageIds.length > 0) {
        formDataObj.append('existingImages', JSON.stringify(existingImageIds));
      }
      
      // Add new images
      allImageFiles.forEach((file, index) => {
        formDataObj.append('images', file);
      });
      
      // Add colorImageMap
      formDataObj.append('colorImageMap', JSON.stringify(finalColorImageMap));

      return formDataObj;
      
    } catch (error) {
      console.error("Error in prepareFormData:", error);
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
      productDimensions: { length: 0, width: 0, height: 0, weight: 0.2 }
    });
    setColors([]);
    setSizes([]);
    setStockMatrix({});
    setVariantImages({});
    setColorImageMap({});
    setSizeCharts({});
    setSelectedSize('M');
    setCurrentColor('');
    setTempSpecKey('');
    setTempSpecValue('');
  };

  // Validation
  const validateForm = () => {
    try {
      if (!formData.name?.trim()) {
        toast({ title: "Error", description: "Product name is required", variant: "destructive" });
        return false;
      }

      if (!formData.description?.trim()) {
        toast({ title: "Error", description: "Product description is required", variant: "destructive" });
        return false;
      }

      const price = parseFloat(formData.basePrice);
      if (isNaN(price) || price <= 0) {
        toast({ title: "Error", description: "Please enter a valid price greater than 0", variant: "destructive" });
        return false;
      }

      if (!formData.category) {
        toast({ title: "Error", description: "Please select a category", variant: "destructive" });
        return false;
      }

      if (colors.length === 0) {
        toast({ title: "Error", description: "Please add at least one color", variant: "destructive" });
        return false;
      }

      if (sizes.length === 0) {
        toast({ title: "Error", description: "Please add at least one size", variant: "destructive" });
        return false;
      }

      for (const colorName of colors) {
        for (const sizeName of sizes) {
          const stock = stockMatrix[colorName]?.[sizeName];
          if (stock === undefined || stock === null || isNaN(stock)) {
            toast({ title: "Error", description: `Please enter stock for ${colorName} - ${sizeName}`, variant: "destructive" });
            return false;
          }
        }
      }

      for (const colorName of colors) {
        const images = variantImages[colorName];
        if (!images || images.length === 0) {
          toast({ title: "Error", description: `Please upload at least one image for color: ${colorName}`, variant: "destructive" });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      toast({ title: "Error", description: "An error occurred during validation", variant: "destructive" });
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
  };
};