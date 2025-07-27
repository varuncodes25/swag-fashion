const { ROLES } = require("../utils/constants");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

const createProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { name, price, description, stock, colors, category, sizes } = req.body;

    // Validate required fields
    if (!name || !price || !description || !stock || !colors || !category || !sizes) {
      return res.status(400).json({
        success: false,
        message: "All fields including sizes are required.",
      });
    }

    const uploadedImages = [];

    for (const file in req.files) {
      const result = await cloudinary.uploader.upload(req.files[file].path, {
        folder: "products",
      });

      uploadedImages.push({
        url: result.secure_url,
        id: result.public_id,
      });
    }

    const product = new Product({
      name,
      price,
      description,
      stock,
      colors,
      category,
      sizes: Array.isArray(sizes) ? sizes : JSON.parse(sizes), // If sent as JSON string (e.g., from form-data)
      images: uploadedImages,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const updateProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { ...data } = req.body;
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, data, { new: true });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    let { page, limit, category, price, search, sort } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;

    const query = { blacklisted: false }; // Filter out blacklisted products

    // 🔍 Filter by category
    if (category && category.toLowerCase() !== "all") {
      const trimmedCategory = category.trim().toLowerCase();
      query.category = new RegExp(`^${trimmedCategory}$`, "i");
    }

    // 🔍 Search by product name
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // 🔍 Filter by max price
    if (price && !isNaN(price)) {
      query.price = { $lte: Number(price) };
    }

    // 📦 Total matching products
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // ⬇️ Optional sorting
    let sortBy = { createdAt: -1 }; // Newest first by default
    if (sort === "priceLowToHigh") sortBy = { price: 1 };
    if (sort === "priceHighToLow") sortBy = { price: -1 };

    // 🛒 Fetch paginated and sorted products
    const products = await Product.find(query)
      .select("name price images rating description blacklisted sizes")
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedProducts = products.map((product) => {
      const p = product.toObject();
      p.image = p.images[0]; // Primary image
      delete p.images;
      return p;
    });

    return res.status(200).json({
      success: true,
      message: "Products fetched",
      data: formattedProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getProductByName = async (req, res) => {
  const { name } = req.params;

  try {
    const product = await Product.findOne({
      name: {
        $regex: new RegExp(name, "i"),
      },
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res
      .status(200)
      .json({ success: true, message: "Product found", data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const blacklistProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: true },
      { new: true }
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: `The product ${product.name} has been blacklisted`,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromBlacklist = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: false },
      { new: true }
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: `The product ${product.name} has been removed from blacklisted`,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductByName,
  blacklistProduct,
  removeFromBlacklist,
};
