// middleware/decryptRequest.js
const { CareerDecrypt } = require("../utils/crypto");

/**
 * Middleware to decrypt incoming encrypted requests
 * Expects request body with { encryptedData: "encrypted-string" }
 */
const decryptRequest = async (req, res, next) => {
  // Skip for file uploads or specific routes
  if (req.path.includes('/upload') || req.method === 'GET') {
    return next();
  }

  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  // Check if request has encrypted data
  if (req.body && req.body.encryptedData) {
    try {
      console.log('🔐 Decrypting request data...');
      
      // Decrypt the data
      const decryptedData = await CareerDecrypt(req.body.encryptedData);
      
      // Replace req.body with decrypted data
      req.body = decryptedData;
      
      console.log('✅ Request decrypted successfully');
      console.log('📦 Decrypted body:', req.body);
      
    } catch (error) {
      console.error('❌ Decryption failed:', error.message);
      return res.status(400).json({
        success: false,
        message: "Invalid or malformed encrypted data"
      });
    }
  } else {
    // Optional: Log when no encrypted data found
    console.log('ℹ️ No encrypted data in request, processing as plain JSON');
  }
  
  next();
};

module.exports = decryptRequest;