const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://varuntare2:WqXPAnmVOLHauosC@cluster0.8hdzpwx.mongodb.net/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// ✅ Generate UNIQUE SLUG for each product
const generateUniqueSlug = (productName, index) => {
  let baseSlug = productName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);

  if (!baseSlug) {
    baseSlug = 'product';
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const uniqueSlug = `${baseSlug}-${index}-${timestamp}-${randomStr}`;
  
  return uniqueSlug;
};

// Sample Data Arrays
const sampleData = {
  brands: ['Nike', 'Adidas', 'Puma', 'Levi\'s', 'Allen Solly'],
  colors: ['Red', 'Blue', 'Black', 'White', 'Green'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  clothingTypes: ['T-Shirt', 'Shirt', 'Jeans', 'Hoodie'],
  genders: ['Men', 'Women', 'Unisex'],
  fabrics: ['Cotton', 'Polyester', 'Denim'],
  fits: ['Regular', 'Slim'],
  patterns: ['Solid', 'Striped', 'Checked'],
  occasions: ['Casual', 'Formal', 'Sports'],
  features: ['Stretchable', 'Breathable', 'Quick Dry'],
  
  // Different images for each variant
  variantImages: {
    'Red': [
      'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg',
      'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg',
      'https://images.pexels.com/photos/9558699/pexels-photo-9558699.jpeg',
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg',
      'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg'
    ],
    'Blue': [
      'https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
      'https://images.pexels.com/photos/9558601/pexels-photo-9558601.jpeg',
      'https://images.pexels.com/photos/6311394/pexels-photo-6311394.jpeg',
      'https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg'
    ],
    'Black': [
      'https://images.pexels.com/photos/948235/pexels-photo-948235.jpeg',
      'https://images.pexels.com/photos/12731785/pexels-photo-12731785.jpeg',
      'https://images.pexels.com/photos/9558761/pexels-photo-9558761.jpeg',
      'https://images.pexels.com/photos/6311391/pexels-photo-6311391.jpeg',
      'https://images.pexels.com/photos/948235/pexels-photo-948235.jpeg'
    ],
    'White': [
      'https://images.pexels.com/photos/4348403/pexels-photo-4348403.jpeg',
      'https://images.pexels.com/photos/12731788/pexels-photo-12731788.jpeg',
      'https://images.pexels.com/photos/9558750/pexels-photo-9558750.jpeg',
      'https://images.pexels.com/photos/6311389/pexels-photo-6311389.jpeg',
      'https://images.pexels.com/photos/4348403/pexels-photo-4348403.jpeg'
    ],
    'Green': [
      'https://images.pexels.com/photos/4050388/pexels-photo-4050388.jpeg',
      'https://images.pexels.com/photos/12731790/pexels-photo-12731790.jpeg',
      'https://images.pexels.com/photos/9558746/pexels-photo-9558746.jpeg',
      'https://images.pexels.com/photos/6311393/pexels-photo-6311393.jpeg',
      'https://images.pexels.com/photos/4050388/pexels-photo-4050388.jpeg'
    ]
  }
};

// Helper Functions
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate random price
const generatePrice = () => {
  const basePrice = Math.floor(Math.random() * 5000) + 299;
  return Math.round(basePrice / 100) * 100;
};

// Get color code
const getColorCode = (color) => {
  const colorMap = {
    'Red': '#FF0000', 'Blue': '#0000FF', 'Black': '#000000', 'White': '#FFFFFF',
    'Green': '#008000', 'Yellow': '#FFFF00', 'Purple': '#800080', 'Pink': '#FFC0CB',
    'Gray': '#808080', 'Brown': '#A52A2A', 'Navy': '#000080', 'Maroon': '#800000',
    'Orange': '#FFA500', 'Teal': '#008080'
  };
  return colorMap[color] || '#000000';
};

// ✅ Generate product with 5 variants, each with different images
const generateProduct = async (index) => {
  try {
    const brand = getRandomElement(sampleData.brands);
    const clothingType = getRandomElement(sampleData.clothingTypes);
    const gender = getRandomElement(sampleData.genders);
    const fabric = getRandomElement(sampleData.fabrics);
    const fit = getRandomElement(sampleData.fits);
    const pattern = getRandomElement(sampleData.patterns);
    
    // Create a unique product name
    const name = `${brand} Premium ${clothingType} Collection ${index + 1}`;
    const slug = generateUniqueSlug(name, index);
    
    // Description
    const description = `Premium ${clothingType} from ${brand}. Made with high-quality ${fabric} fabric in ${fit} fit. Features ${pattern.toLowerCase()} pattern. Perfect for ${gender}.`;
    
    // Get category
    const categories = await Category.find({});
    let category = null;
    
    if (categories.length > 0) {
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(gender.toLowerCase())
      );
      category = matchingCategory || getRandomElement(categories);
    }
    
    // ✅ Create 5 variants with different colors
    const variants = [];
    const allColors = [...sampleData.colors];
    const selectedColors = allColors.slice(0, 5); // Select first 5 colors
    
    selectedColors.forEach((color, variantIndex) => {
      const basePrice = generatePrice();
      const sizeMultiplier = { 'XS': 0.9, 'S': 0.95, 'M': 1.0, 'L': 1.05, 'XL': 1.1 };
      const size = sampleData.sizes[variantIndex % sampleData.sizes.length];
      const price = Math.round(basePrice * (sizeMultiplier[size] || 1.0));
      
      variants.push({
        color: color,
        colorCode: getColorCode(color),
        size: size,
        stock: Math.floor(Math.random() * 50) + 20,
        price: price,
        sellingPrice: Math.round(price * 0.9), // 10% discount
        sku: `${brand.substring(0, 3).toUpperCase()}-${color.substring(0, 2).toUpperCase()}-${size}-${Date.now()}`,
        barcode: `BAR${Date.now()}${variantIndex}${size}`,
        reservedStock: 0
      });
    });
    
    // Calculate min price
    const minPrice = Math.min(...variants.map(v => v.sellingPrice));
    
    // ✅ Create images for each variant
    const allImages = [];
    
    selectedColors.forEach((color, colorIndex) => {
      const colorImages = sampleData.variantImages[color] || sampleData.variantImages['Black'];
      
      // Add 5 different images for each color variant
      colorImages.forEach((imageUrl, imageIndex) => {
        allImages.push({
          url: imageUrl,
          id: `img-${slug}-${color.toLowerCase()}-${imageIndex}`,
          isMain: (colorIndex === 0 && imageIndex === 0), // First image of first color is main
          color: color,
          colorCode: getColorCode(color),
          sortOrder: colorIndex * 5 + imageIndex,
          variantId: variants[colorIndex]._id // Reference to variant
        });
      });
    });
    
    // ✅ Create imagesByColor Map
    const imagesByColor = new Map();
    selectedColors.forEach(color => {
      const colorImages = allImages.filter(img => img.color === color);
      imagesByColor.set(color, colorImages);
    });
    
    return {
      name: name,
      slug: slug,
      description: description,
      shortDescription: description.substring(0, 100) + '...',
      brand: brand,
      clothingType: clothingType,
      gender: gender,
      ageGroup: 'Adult',
      fabric: fabric,
      fabricComposition: `${Math.floor(Math.random() * 50) + 50}% ${fabric}, ${Math.floor(Math.random() * 50)}% Other`,
      fit: fit,
      pattern: pattern,
      sleeveType: getRandomElement(['Full Sleeve', 'Half Sleeve', 'Sleeveless', 'Short Sleeve']),
      neckType: getRandomElement(['Round Neck', 'V-Neck', 'Polo Neck', 'Collared']),
      season: getRandomElements(['Summer', 'Winter', 'Spring', 'Autumn', 'All Season'], 2),
      occasion: [getRandomElement(sampleData.occasions)],
      features: getRandomElements(sampleData.features, Math.floor(Math.random() * 2) + 1),
      discount: Math.floor(Math.random() * 40),
      sellingPrice: minPrice,
      mrp: Math.round(minPrice * 1.2),
      isFeatured: true,
      isBestSeller: Math.random() > 0.5,
      isNewArrival: true,
      freeShipping: true,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 100) + 20,
      status: 'published',
      blacklisted: false,
      variants: variants,
      allImages: allImages,
      imagesByColor: imagesByColor, // ✅ Add imagesByColor Map
      category: category ? category._id : null,
      packageContent: '1 Piece',
      countryOfOrigin: 'India',
      productDimensions: {
        length: Math.floor(Math.random() * 50) + 70,
        width: Math.floor(Math.random() * 20) + 40,
        height: Math.floor(Math.random() * 5) + 2,
        weight: parseFloat((Math.random() * 0.5 + 0.2).toFixed(2))
      },
      warranty: '6 Months',
      returnPolicy: '30 Days Return Policy',
      estimatedDelivery: Math.floor(Math.random() * 7) + 3
    };
  } catch (error) {
    console.error(`Error generating product ${index}:`, error);
    throw error;
  }
};

// ✅ Main Seeder Function - Creates only 2 products, keeps existing ones
const seedProducts = async () => {
  try {
    await connectDB();
    
    // Check categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('❌ No categories found! Please run category seeder first.');
      process.exit(1);
    }
    
    console.log(`📁 Found ${categories.length} categories`);
    
    // Check existing products count
    const existingCount = await Product.countDocuments();
    console.log(`📊 Existing products in database: ${existingCount}`);
    
    // Create only 2 new products
    const newProductsCount = 2;
    let createdCount = 0;
    
    console.log(`🌱 Creating ${newProductsCount} new products (keeping existing ${existingCount} products)...`);
    
    // Create products one by one
    for (let i = 0; i < newProductsCount; i++) {
      try {
        const productData = await generateProduct(i + existingCount);
        const product = new Product(productData);
        
        await product.save();
        createdCount++;
        
        console.log(`✅ Created product ${i + 1}: ${productData.name}`);
        console.log(`   Slug: ${productData.slug}`);
        console.log(`   Variants: ${productData.variants.length} colors (${productData.variants.map(v => v.color).join(', ')})`);
        console.log(`   Images: ${productData.allImages.length} total images`);
        console.log(`   Price Range: ₹${Math.min(...productData.variants.map(v => v.sellingPrice))} - ₹${Math.max(...productData.variants.map(v => v.sellingPrice))}`);
        console.log('---');
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to create product ${i}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully created ${createdCount} new products!`);
    
    // Verify
    console.log('\n🔍 Sample of New Products Created:');
    const newProducts = await Product.find({}).sort({ createdAt: -1 }).limit(newProductsCount);
    
    newProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Variants: ${product.variants.length}`);
      console.log(`   Colors: ${product.variants.map(v => v.color).join(', ')}`);
      console.log(`   Images by Color:`);
      
      // Show images by color
      if (product.imagesByColor) {
        for (const [color, images] of product.imagesByColor.entries()) {
          console.log(`     ${color}: ${images.length} images`);
        }
      }
    });
    
    const totalInDB = await Product.countDocuments();
    console.log(`\n📈 Total products in database now: ${totalInDB}`);
    
    // Show first variant images for verification
    console.log('\n📸 Sample Variant Images:');
    const firstProduct = await Product.findOne().sort({ createdAt: -1 });
    if (firstProduct && firstProduct.variants.length > 0) {
      console.log(`Product: ${firstProduct.name}`);
      firstProduct.variants.slice(0, 2).forEach((variant, idx) => {
        const variantImages = firstProduct.allImages.filter(img => img.color === variant.color);
        console.log(`Variant ${idx + 1} (${variant.color}):`);
        console.log(`  Size: ${variant.size}, Price: ₹${variant.sellingPrice}`);
        console.log(`  Images: ${variantImages.length}`);
        variantImages.slice(0, 2).forEach((img, imgIdx) => {
          console.log(`    ${imgIdx + 1}. ${img.url.substring(0, 60)}...`);
        });
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run seeder
seedProducts();