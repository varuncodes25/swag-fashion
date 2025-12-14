const mongoose = require("mongoose");

const imageSchema = {
  url: { type: String, required: true },
  id: { type: String }, // Cloudinary / S3 id
};

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: imageSchema, // ✅ subcategory image
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: imageSchema, // ✅ category image
    subCategories: [subCategorySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
