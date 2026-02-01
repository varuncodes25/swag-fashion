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

// ✅ FIXED: Generate UNIQUE SLUG for each product
const generateUniqueSlug = (productName, index) => {
  // Create base slug from product name
  let baseSlug = productName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .trim()
    .substring(0, 50);        // Limit length

  // If slug is empty, use default
  if (!baseSlug) {
    baseSlug = 'product';
  }

  // ✅ ADD unique identifier to prevent duplicates
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8); // 6 char random string
  const uniqueSlug = `${baseSlug}-${index}-${timestamp}-${randomStr}`;
  
  return uniqueSlug;
};

// Sample Data Arrays
const sampleData = {
  brands: ['Nike', 'Adidas', 'Puma', 'Levi\'s', 'Allen Solly', 'Van Heusen', 'Peter England', 'Raymond', 'US Polo', 'Jack & Jones'],
  colors: ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Purple', 'Pink', 'Gray', 'Brown', 'Navy', 'Maroon', 'Orange', 'Teal'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  clothingTypes: ['T-Shirt', 'Shirt', 'Jeans', 'Trousers', 'Shorts', 'Jacket', 'Sweater', 'Hoodie'],
  genders: ['Men', 'Women', 'Unisex'],
  fabrics: ['Cotton', 'Polyester', 'Denim', 'Wool', 'Linen', 'Silk', 'Rayon'],
  fits: ['Regular', 'Slim', 'Relaxed', 'Oversized'],
  patterns: ['Solid', 'Striped', 'Checked', 'Printed', 'Floral'],
  occasions: ['Casual', 'Formal', 'Party', 'Sports', 'Travel'],
  features: ['Stretchable', 'Wrinkle Free', 'Quick Dry', 'Breathable', 'Water Resistant'],
  
  // ✅ Use category images from your category seeder
  categoryImages: {
    'Men': 'https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg',
    'Women': 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg',
    'Kids': 'https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg',
    'Collections': 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
    'Style': 'https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg',
    'default': 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'
  }
};

// Get Random Element from Array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Get Multiple Random Elements
const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate Random Price
const generatePrice = () => {
  const basePrice = Math.floor(Math.random() * 5000) + 299;
  return Math.round(basePrice / 100) * 100;
};

// Generate Random Discount
const generateDiscount = () => {
  const discounts = [0, 5, 10, 15, 20, 25, 30, 40, 50];
  return getRandomElement(discounts);
};

// Get Color Code
const getColorCode = (color) => {
  const colorMap = {
    'Red': '#FF0000', 'Blue': '#0000FF', 'Black': '#000000', 'White': '#FFFFFF',
    'Green': '#008000', 'Yellow': '#FFFF00', 'Purple': '#800080', 'Pink': '#FFC0CB',
    'Gray': '#808080', 'Brown': '#A52A2A', 'Navy': '#000080', 'Maroon': '#800000',
    'Orange': '#FFA500', 'Teal': '#008080'
  };
  return colorMap[color] || '#000000';
};

// ✅ FIXED: Get category image based on gender
const getCategoryImage = (gender) => {
  if (gender === 'Men') return sampleData.categoryImages.Men;
  if (gender === 'Women') return sampleData.categoryImages.Women;
  if (gender === 'Kids') return sampleData.categoryImages.Kids;
  return sampleData.categoryImages.default;
};

// ✅ FIXED: Generate product with UNIQUE SLUG
const generateProduct = async (index) => {
  try {
    const brand = getRandomElement(sampleData.brands);
    const clothingType = getRandomElement(sampleData.clothingTypes);
    const color = getRandomElement(sampleData.colors);
    const gender = getRandomElement(sampleData.genders);
    const fabric = getRandomElement(sampleData.fabrics);
    const fit = getRandomElement(sampleData.fits);
    const pattern = getRandomElement(sampleData.patterns);
    const occasion = getRandomElement(sampleData.occasions);
    const features = getRandomElements(sampleData.features, Math.floor(Math.random() * 3) + 1);
    
    // Generate product name
    const name = `${brand} ${color} ${clothingType} ${pattern} for ${gender}`;
    
    // ✅ Generate UNIQUE SLUG
    const slug = generateUniqueSlug(name, index);
    
    // Generate description
    const descriptions = [
      `Premium ${clothingType} from ${brand} in ${color} color. Made with ${fabric} fabric.`,
      `Stylish ${clothingType} with ${fit} fit and ${pattern} pattern. Perfect for ${occasion}.`,
      `High-quality ${clothingType} featuring ${features.join(', ')}.`
    ];
    
    const description = getRandomElement(descriptions);
    
    // Get random category from database
    const categories = await Category.find({});
    let category = null;
    
    if (categories.length > 0) {
      // Match category based on gender if possible
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(gender.toLowerCase())
      );
      category = matchingCategory || getRandomElement(categories);
    }
    
    // Generate variants
    const variants = [];
    const availableSizes = getRandomElements(sampleData.sizes, 3);
    
    availableSizes.forEach(size => {
      const basePrice = generatePrice();
      const sizeMultiplier = { 'XS': 0.9, 'S': 0.95, 'M': 1.0, 'L': 1.05, 'XL': 1.1, 'XXL': 1.15 };
      const price = Math.round(basePrice * (sizeMultiplier[size] || 1.0));
      
      variants.push({
        color: color,
        colorCode: getColorCode(color),
        size: size,
        stock: Math.floor(Math.random() * 50) + 10,
        price: price,
        sku: `${brand.substring(0, 3).toUpperCase()}-${Date.now()}-${index}-${size}`,
        barcode: `BAR${Date.now()}${index}${size}`
      });
    });
    
    // Calculate min price
    const minPrice = Math.min(...variants.map(v => v.price));
    
    // ✅ Use category image for product image
    const categoryImage = getCategoryImage(gender);
    
    return {
      name: name,
      slug: slug, // ✅ UNIQUE SLUG
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
      occasion: [occasion],
      features: features,
      discount: generateDiscount(),
      sellingPrice: minPrice,
      mrp: Math.round(minPrice * 1.2),
      isFeatured: Math.random() > 0.7,
      isBestSeller: Math.random() > 0.8,
      isNewArrival: Math.random() > 0.5,
      freeShipping: Math.random() > 0.5,
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 100),
      status: 'published',
      blacklisted: false,
      variants: variants,
      allImages: [
        {
          url: categoryImage, // ✅ Use category image
          id: `img-${slug}-1`,
          isMain: true,
          color: color,
          colorCode: getColorCode(color),
          sortOrder: 0
        },
        {
          url: `https://picsum.photos/800/1000?random=${index}`,
          id: `img-${slug}-2`,
          isMain: false,
          color: color,
          colorCode: getColorCode(color),
          sortOrder: 1
        }
      ],
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
      returnPolicy: '15 Days Return Policy',
      estimatedDelivery: Math.floor(Math.random() * 7) + 3
    };
  } catch (error) {
    console.error(`Error generating product ${index}:`, error);
    throw error;
  }
};

// ✅ FIXED: Main Seeder Function
const seedProducts = async () => {
  try {
    await connectDB();
    
    // First, ensure categories exist
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('❌ No categories found! Please run category seeder first.');
      process.exit(1);
    }
    
    console.log(`📁 Found ${categories.length} categories`);
    
    // Clear existing products
    const deleteCount = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleteCount.deletedCount} existing products`);
    
    const totalProducts = 50; // Start with 50 for testing
    let createdCount = 0;
    
    console.log(`🌱 Seeding ${totalProducts} products...`);
    
    // ✅ Create products ONE BY ONE to ensure unique slugs
    for (let i = 0; i < totalProducts; i++) {
      try {
        const productData = await generateProduct(i);
        const product = new Product(productData);
        
        // Save individually
        await product.save();
        createdCount++;
        
        // Show progress
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Created ${i + 1}/${totalProducts} products...`);
          console.log(`   Latest slug: ${productData.slug}`);
        }
        
        // Small delay to avoid overwhelming the DB
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Failed to create product ${i}:`, error.message);
        // Continue with next product
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdCount} products!`);
    
    // Verify
    console.log('\n🔍 Sample Products Created:');
    const sampleProducts = await Product.find({}).limit(3);
    sampleProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Price: ₹${product.sellingPrice}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ${product.allImages?.[0]?.url?.substring(0, 50)}...`);
    });
    
    const totalInDB = await Product.countDocuments();
    console.log(`\n📈 Total products in database: ${totalInDB}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    
    // Specific error handling
    if (error.code === 11000) {
      console.error('⚠️  Duplicate key error detected!');
      console.error('Duplicate field:', error.keyValue);
    }
    
    process.exit(1);
  }
};

// Run seeder
seedProducts();