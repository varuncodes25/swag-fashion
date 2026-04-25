// ✅ IMPORTANT: Sabse pehle dotenv load karo
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with all settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

  // Network settings
  timeout: 120000, // 2 minutes
  upload_prefix: "https://api.cloudinary.com",

  // Security
  secure: true,
  secure_distribution: null,
  private_cdn: false,

  // Upload settings
  chunk_size: 20000000, // 20MB chunks
  keep_alive: true,
});

// Test configuration
const testConfig = () => {
  console.log('📦 Cloudinary Configuration Status:');
  console.log('✓ Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Present ✅' : '❌ Missing');
  console.log('✓ API Key:', process.env.CLOUDINARY_API_KEY ? 'Present ✅' : '❌ Missing');
  console.log('✓ API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present ✅' : '❌ Missing');
  console.log('✓ Secure Mode:', 'Enabled');
  console.log('✓ Timeout:', '120 seconds');
  console.log('✓ Chunk Size:', '20MB');
  
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET);
};

// Upload buffer function
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      reject(new Error('No buffer provided for upload'));
      return;
    }
    
    const defaultOptions = {
      folder: "banners",
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 500, crop: "fill" },
        { quality: "auto:good" },
        { fetch_format: "auto" }
      ]
    };
    
    const uploadOptions = { ...defaultOptions, ...options };
    
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error.message);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    stream.end(buffer);
  });
};

// Delete image function
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      console.warn('No publicId provided for deletion');
      return null;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteImage,
  testConfig
};