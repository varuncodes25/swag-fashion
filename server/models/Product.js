const mongoose = require("mongoose");
const Review = require("./Review");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    rating: {
      type: Number,
      default: 5,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    colors: {
      type: Array,
      required: true,
    },
    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["All Category", "Men", "Women", "Kid", "Men & Women"],
      required: true,
    },
     discount: {
      type: Number, // percentage
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
  },
  { timestamps: true }
);

productSchema.methods.calculateRating = async function () {
  const reviews = await Review.find({ productId: this._id });
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = totalRating / reviews.length;
  } else {
    this.rating = 5;
  }
  await this.save();
};
// Check if offer is active based on current date
productSchema.methods.isOfferActive = function () {
  if (!this.offerValidFrom || !this.offerValidTill) return false;
  const now = new Date();
  return now >= this.offerValidFrom && now <= this.offerValidTill;
};

// Get discounted price if offer is active
productSchema.methods.getDiscountedPrice = function () {
  if (this.isOfferActive() && this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
};
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
