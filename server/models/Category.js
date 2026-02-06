const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    id: { type: String }
  },
  { _id: false }
);

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: imageSchema
  },
  { _id: true }
);

const categorySchema = new mongoose.Schema(
  {
    // ✅ सिर्फ 4 Essential Fields
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: imageSchema,
    subCategories: [subCategorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);