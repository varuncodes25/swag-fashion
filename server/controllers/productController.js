const { ROLES } = require("../utils/constants");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

const createProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const {
      name,
      price,
      description,
      stock,
      category,
      sizes,
      colors,
      discount,
      offerTitle,
      offerDescription,
      offerValidFrom,
      offerValidTill,
      colorsForImages
    } = req.body;

    if (!name || !price || !description || !stock || !category || !sizes || !colors) {
      return res.status(400).json({
        success: false,
        message: "All fields including sizes and colors are required.",
      });
    }
    console.log(req.files, "hjvgcvuiuihvuhfgvfvvjhvvrhvirvhjvehivevchjhiobvejrvivercirfjjhreioerfwh")
    const sizesArray = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
    const colorsArray = Array.isArray(colors) ? colors : JSON.parse(colors);
    const colorsImagesArray = Array.isArray(colorsForImages) ? colorsForImages : JSON.parse(colorsForImages);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    // Upload images to Cloudinary using buffer
    const uploadedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      uploadedImages.push({ url: result.secure_url, id: result.public_id });
    }

    // Map images to colors
    const variantData = {};
    for (let i = 0; i < uploadedImages.length; i++) {
      const color = colorsImagesArray[i];
      if (!variantData[color]) variantData[color] = [];
      variantData[color].push(uploadedImages[i]);
    }

    const variants = Object.entries(variantData).map(([color, images]) => ({ color, images }));

    const product = new Product({
      name,
      price,
      description,
      stock,
      category,
      colors: colorsArray,
      sizes: sizesArray,
      variants,
      discount: discount ? Number(discount) : 0,
      offerTitle: offerTitle || null,
      offerDescription: offerDescription || null,
      offerValidFrom: offerValidFrom ? new Date(offerValidFrom) : null,
      offerValidTill: offerValidTill ? new Date(offerValidTill) : null,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.sizes && typeof data.sizes === "string") {
      try {
        data.sizes = JSON.parse(data.sizes);
      } catch {
        // keep as is if parsing fails
      }
    }

    if (data.discount) data.discount = Number(data.discount);

    if (data.offerValidFrom)
      data.offerValidFrom = new Date(data.offerValidFrom); // Add this
    if (data.offerValidTill)
      data.offerValidTill = new Date(data.offerValidTill);

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

     // Unique cache key per query
    var cacheKey = `products:${page}:${limit}:${category || "all"}:${price || "all"}:${search || "all"}:${sort || "default"}`;

    // Check Redis cache
    var cachedData = await redisClient.get(cacheKey);
    if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    // Build query
   
    if (category && category.toLowerCase() !== "all") query.category = category.trim();
    if (search && search.trim() !== "") query.name = { $regex: search.trim(), $options: "i" };
    if (price && !isNaN(price)) query.price = { $lte: Number(price) };
    const query = { blacklisted: false };

    // Category filter
    if (category && category.toLowerCase() !== "all") {
      query.category = category.trim();
    }

    // Search filter
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Price filter
    if (price && !isNaN(price)) {
      query.price = { $lte: Number(price) };
    }

    // Sorting
    let sortBy = { createdAt: -1 };
    if (sort === "priceLowToHigh") sortBy = { price: 1 };
    if (sort === "priceHighToLow") sortBy = { price: -1 };

    // Aggregation pipeline (fast & single query)
    const now = new Date();

    const pipeline = [
      { $match: query },
      {
        $facet: {
          products: [
            { $sort: sortBy },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                name: 1,
                price: 1,
                rating: 1,
                description: 1,
                sizes: 1,
                discount: 1,
                offerValidTill: 1,
                variants: 1, // ✅ directly include the field from the document

                discountedPrice: {
                  $round: [
                    {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$discount", 0] },
                            { $gt: ["$offerValidTill", now] }, // Use variable here
                          ],
                        },
                        {
                          $multiply: [
                            "$price",
                            { $subtract: [1, { $divide: ["$discount", 100] }] },
                          ],
                        },
                        "$price",
                      ],
                    },
                    1,
                  ],
                },
                image: { $arrayElemAt: ["$images", 0] },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    const products = result[0].products;
    const totalProducts = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched",
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getProductsforadmin = async (req, res) => {
  try {
    let { page, limit, category, price, search, sort } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;

    const query = { blacklisted: false };

    // Category filter
    if (category && category.toLowerCase() !== "all") {
      query.category = category.trim();
    }

    // Search filter
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Price filter
    if (price && !isNaN(price)) {
      query.price = { $lte: Number(price) };
    }

    // Sorting
    let sortBy = { createdAt: -1 };
    if (sort === "priceLowToHigh") sortBy = { price: 1 };
    if (sort === "priceHighToLow") sortBy = { price: -1 };

    // Aggregation pipeline without projection
    const pipeline = [
      { $match: query },
      {
        $facet: {
          products: [
            { $sort: sortBy },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            // ❌ Removed $project so we return full documents
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    const products = result[0].products;
    const totalProducts = result.totalCount?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched",
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductByName = async (req, res) => {
  const { name } = req.params;

  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(name, "i") },
    }).populate("reviews");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Call the method on the product instance
    const discountedPrice = product.getDiscountedPrice();

    // Convert product to plain object to add discountedPrice
    const productObj = product.toObject();
    productObj.discountedPrice = discountedPrice;
    console.log(productObj, "ygyfgh")
    return res.status(200).json({
      success: true,
      message: "Product found",
      data: productObj,
    });
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

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const discountedPrice = product.getDiscountedPrice();

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product,
        discountedPrice,
        isOfferActive: product.isOfferActive(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
  getProductById,
  getProductsforadmin,
};
