const mongoose = require("mongoose");

/* ================= IMAGE SCHEMA ================= */
const imageSchema = {
  url: { type: String, required: true },
  id: { type: String }, // cloudinary / s3 id
};

/* ================= PRODUCT SCHEMA ================= */
const productSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    /* ================= CATEGORY (HYBRID) ================= */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    subCategorySlug: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    /* ================= PRICING ================= */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number, // %
      default: 0,
      min: 0,
      max: 100,
    },

    offerTitle: {
      type: String,
      default: null,
    },

    offerDescription: {
      type: String,
      default: null,
    },

    offerValidFrom: {
      type: Date,
      default: null,
    },

    offerValidTill: {
      type: Date,
      default: null,
    },

    /* ================= INVENTORY ================= */
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ================= VARIANTS ================= */
    variants: [
      {
        color: {
          type: String,
          required: true,
        },
        images: [imageSchema],
      },
    ],

    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      required: true,
    },

    /* ================= RATINGS ================= */
    ratingsAverage: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },

    /* ================= SEARCH / COLLECTION ================= */
    tags: {
      type: [String], // eg: ["oversized", "summer", "printed"]
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ================= METHODS ================= */

// Offer active check
productSchema.methods.isOfferActive = function () {
  if (!this.offerValidFrom || !this.offerValidTill) return false;
  const now = new Date();
  return now >= this.offerValidFrom && now <= this.offerValidTill;
};

/* ================= VIRTUALS ================= */

// Discounted price (calculated, not stored)
productSchema.virtual("discountedPrice").get(function () {
  if (this.discount > 0 && this.isOfferActive()) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

/* ================= INDEXES ================= */

// Fast listing & filters
productSchema.index({ categorySlug: 1, subCategorySlug: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discount: -1 });
productSchema.index({ ratingsAverage: -1 });

/* ================= MODEL ================= */
module.exports = mongoose.model("Product", productSchema);
