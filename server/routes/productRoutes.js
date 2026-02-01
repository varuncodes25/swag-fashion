const router = require("express").Router();
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductByName,
  blacklistProduct,
  removeFromBlacklist,
  getProductById,
  getProductsforadmin,
  getProductsByCategory  // ✅ Ensure this is imported
} = require("../controllers/productController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/multer");
const { createProductSchema } = require("../validation/productValidation");
const validate = require("../middlewares/validate");

// ============ PRODUCT CRUD ROUTES ============
router.post(
  "/create-product",
  validate(createProductSchema),
  verifyToken,
  upload.array("images", 15),
  createProduct
);

router.put("/update-product/:id", verifyToken, updateProduct);
router.delete("/delete-product/:id", verifyToken, deleteProduct);

// ============ GET PRODUCT ROUTES ============
router.get("/get-products", getProducts);
router.get("/get-product-by-id/:id", getProductById);
router.get("/get-products-admin", getProductsforadmin);
router.get("/get-product-by-name/:name", getProductByName);

// ============ CATEGORY ROUTES ============
// ✅ IMPORTANT: Category routes ko specific path dena
router.get("/products/category/:slug", getProductsByCategory);
router.get("/products/category/:slug/:subSlug", getProductsByCategory);

// ============ ADMIN ROUTES ============
router.put("/blacklist-product/:id", verifyToken, blacklistProduct);
router.put("/remove-from-blacklist/:id", verifyToken, removeFromBlacklist);

module.exports = router;