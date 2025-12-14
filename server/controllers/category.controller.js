const Category = require("../models/Category");

/* ================= CATEGORY ================= */

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, image } = req.body;

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      image,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CATEGORY BY SLUG
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= SUB CATEGORY ================= */

// ADD SUBCATEGORY
exports.addSubCategory = async (req, res) => {
  try {
    const { name, slug, image } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const exists = category.subCategories.find(
      (sub) => sub.slug === slug
    );
    if (exists) {
      return res.status(400).json({ message: "SubCategory already exists" });
    }

    category.subCategories.push({ name, slug, image });
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE SUBCATEGORY
exports.updateSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const sub = category.subCategories.find(
      (s) => s.slug === req.params.subSlug
    );

    if (!sub) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    Object.assign(sub, req.body);
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SUBCATEGORY
exports.deleteSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.subCategories = category.subCategories.filter(
      (sub) => sub.slug !== req.params.subSlug
    );

    await category.save();
    res.json({ message: "SubCategory deleted", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
