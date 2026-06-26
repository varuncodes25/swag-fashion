// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { 
  
  getWishlist, 
  checkWishlistStatus, 
  toggleWishlist
} = require('../controllers/wishlistController');
const verifyToken = require('../middlewares/verifyToken');
const decryptRequest = require('../utils/decryptResponse');

router.post('/toggle', verifyToken, decryptRequest, toggleWishlist);
router.get('/wishlist',verifyToken, getWishlist);
router.get('/check/:productId',verifyToken, checkWishlistStatus);

module.exports = router;