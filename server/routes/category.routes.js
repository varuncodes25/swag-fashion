const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");

/* CATEGORY */
router.post("/categories", controller.createCategory);
router.get("/categories", controller.getAllCategories);
router.get("/categories/:slug", controller.getCategoryBySlug);
router.put("/categories/:id", controller.updateCategory);
router.delete("/categories/:id", controller.deleteCategory);

/* SUBCATEGORY */
router.post("/categories/:id/subcategory", controller.addSubCategory);
router.put("/categories/:id/subcategory/:subSlug", controller.updateSubCategory);
router.delete("categories//:id/subcategory/:subSlug", controller.deleteSubCategory);

module.exports = router;
