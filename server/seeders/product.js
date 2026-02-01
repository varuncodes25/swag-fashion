const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://varuntare2:WqXPAnmVOLHauosC@cluster0.8hdzpwx.mongodb.net/test")
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
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
  
  // Product Names Templates
  nameTemplates: [
    'Premium {clothingType} for {gender}',
    'Comfort {clothingType} - {color}',
    'Stylish {brand} {clothingType}',
    'Trendy {pattern} {clothingType}',
    'Classic {fabric} {clothingType}',
    'Modern Fit {clothingType}',
    'Designer {clothingType} by {brand}',
    'Elegant {clothingType} for {occasion}'
  ],
  
  // Descriptions
  descriptions: [
    'Made with premium quality {fabric} for ultimate comfort and durability. Perfect for {occasion} occasions.',
    'This {clothingType} features a {fit} fit and {pattern} pattern. Ideal for everyday wear.',
    'Experience unmatched comfort with our {fabric} {clothingType}. Designed for modern lifestyle.',
    'Crafted with attention to detail, this {clothingType} offers both style and functionality.',
    'A versatile {clothingType} that can be dressed up or down for various occasions.',
    'Featuring {features}, this {clothingType} is perfect for active individuals.',
    'Premium {brand} {clothingType} with excellent craftsmanship and attention to detail.'
  ]
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
  const basePrice = Math.floor(Math.random() * 5000) + 299; // ₹299 - ₹5289
  return Math.round(basePrice / 100) * 100; // Round to nearest 100
};

// Generate Random Discount
const generateDiscount = () => {
  const discounts = [0, 5, 10, 15, 20, 25, 30, 40, 50];
  return getRandomElement(discounts);
};

// Generate Variants for Product
const generateVariants = (color, clothingType) => {
  const variants = [];
  const availableSizes = getRandomElements(sampleData.sizes, 3); // 3 random sizes
  
  availableSizes.forEach(size => {
    // Base price with some variation per size
    const basePrice = generatePrice();
    const sizeMultiplier = {
      'XS': 0.9,
      'S': 0.95,
      'M': 1.0,
      'L': 1.05,
      'XL': 1.1,
      'XXL': 1.15
    };
    
    const price = Math.round(basePrice * (sizeMultiplier[size] || 1.0));
    
    variants.push({
      color: color,
      colorCode: getColorCode(color),
      size: size,
      stock: Math.floor(Math.random() * 50) + 10, // 10-60 stock
      price: price,
      sku: `SKU-${Math.floor(Math.random() * 1000000)}`,
      barcode: `BAR${Math.floor(Math.random() * 1000000000)}`
    });
  });
  
  return variants;
};

// Get Color Code
const getColorCode = (color) => {
  const colorMap = {
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Gray': '#808080',
    'Brown': '#A52A2A',
    'Navy': '#000080',
    'Maroon': '#800000',
    'Orange': '#FFA500',
    'Teal': '#008080'
  };
  return colorMap[color] || '#000000';
};

// Generate Product Images
const generateImages = (color, productId) => {
  const imageCount = Math.floor(Math.random() * 4) + 2; // 2-5 images
  
  return Array.from({ length: imageCount }, (_, i) => ({
    url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?auto=format&fit=crop&w=800&q=80`,
    id: `${productId}-img-${i}`,
    isMain: i === 0,
    color: color,
    colorCode: getColorCode(color),
    sortOrder: i
  }));
};

// Generate Single Product
const generateProduct = async (index) => {
  const brand = getRandomElement(sampleData.brands);
  const clothingType = getRandomElement(sampleData.clothingTypes);
  const color = getRandomElement(sampleData.colors);
  const gender = getRandomElement(sampleData.genders);
  const fabric = getRandomElement(sampleData.fabrics);
  const fit = getRandomElement(sampleData.fits);
  const pattern = getRandomElement(sampleData.patterns);
  const occasion = getRandomElement(sampleData.occasions);
  const features = getRandomElements(sampleData.features, Math.floor(Math.random() * 3) + 1);
  
  // Generate name
  const nameTemplate = getRandomElement(sampleData.nameTemplates);
  const name = nameTemplate
    .replace('{clothingType}', clothingType)
    .replace('{gender}', gender)
    .replace('{color}', color)
    .replace('{brand}', brand)
    .replace('{pattern}', pattern)
    .replace('{fabric}', fabric)
    .replace('{occasion}', occasion);
  
  // Generate description
  const descTemplate = getRandomElement(sampleData.descriptions);
  const description = descTemplate
    .replace('{fabric}', fabric)
    .replace('{clothingType}', clothingType.toLowerCase())
    .replace('{occasion}', occasion)
    .replace('{fit}', fit)
    .replace('{pattern}', pattern)
    .replace('{features}', features.join(', '))
    .replace('{brand}', brand);
  
  // Get category (assuming you have categories in DB)
  const categories = await Category.find({});
  const category = categories.length > 0 ? getRandomElement(categories) : null;
  
  const productId = `PROD-${Date.now()}-${index}`;
  
  // Generate variants
  const variants = generateVariants(color, clothingType);
  
  // Calculate min price from variants
  const minPrice = Math.min(...variants.map(v => v.price));
  
  return {
    name: name,
    description: description,
    shortDescription: description.substring(0, 150) + '...',
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
    isFeatured: Math.random() > 0.7, // 30% chance
    isBestSeller: Math.random() > 0.8, // 20% chance
    isNewArrival: Math.random() > 0.5, // 50% chance
    freeShipping: Math.random() > 0.5, // 50% chance
    rating: parseFloat((Math.random() * 5).toFixed(1)), // 0-5 rating
    reviewCount: Math.floor(Math.random() * 100),
    status: 'published',
    blacklisted: false,
    variants: variants,
    allImages: generateImages(color, productId),
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
    estimatedDelivery: Math.floor(Math.random() * 7) + 3,
    // colors and sizes will be auto-populated by pre-save hook
    // slug will be auto-generated by pre-save hook
  };
};

// Main Seeder Function
const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    const deleteCount = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleteCount.deletedCount} existing products`);
    
    const totalProducts = 200;
    const batchSize = 50;
    let createdCount = 0;
    
    console.log(`🌱 Seeding ${totalProducts} products...`);
    
    for (let i = 0; i < totalProducts; i += batchSize) {
      const batchPromises = [];
      const batchEnd = Math.min(i + batchSize, totalProducts);
      
      // Create batch of products
      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(generateProduct(j));
      }
      
      // Generate products
      const productsData = await Promise.all(batchPromises);
      
      // Insert batch into database
      const result = await Product.insertMany(productsData);
      createdCount += result.length;
      
      console.log(`✅ Created batch ${Math.floor(i/batchSize) + 1}: ${result.length} products`);
      console.log(`📊 Total created: ${createdCount}/${totalProducts}`);
      
      // Small delay between batches
      if (i + batchSize < totalProducts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdCount} products!`);
    
    // Verify some products
    console.log('\n🔍 Sample Products Created:');
    const sampleProducts = await Product.find({}).limit(5);
    sampleProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Price: ₹${product.sellingPrice}`);
      console.log(`   Colors: ${product.colors.join(', ')}`);
      console.log(`   Sizes: ${product.sizes.join(', ')}`);
      console.log(`   Variants: ${product.variants.length}`);
    });
    
    // Statistics
    const totalInDB = await Product.countDocuments();
    console.log(`\n📈 Total products in database: ${totalInDB}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder
seedProducts();