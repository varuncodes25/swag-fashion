const { ROLES } = require("../utils/constants");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const cloudinary = require("../utils/cloudinary");

function isReviewOwner(review, userId) {
  return review?.userId && String(review.userId) === String(userId);
}

async function userHasDeliveredOrder(userId, productId) {
  const order = await Order.findOne({
    userId,
    status: "DELIVERED",
    "items.productId": productId,
  })
    .select("_id")
    .lean();
  return Boolean(order);
}

/* ======================================================
   CREATE REVIEW
====================================================== */
const createReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const userId = req.id;
    const { productId, review, rating } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!review?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review text is required",
      });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyReviewed = await Review.findOne({ productId, userId });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const hasDelivered = await userHasDeliveredOrder(userId, productId);
    if (!hasDelivered) {
      return res.status(403).json({
        success: false,
        message: "You can review only after your order is delivered",
      });
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "review" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              },
            );
            stream.end(file.buffer);
          });

          uploadedImages.push({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
        } catch (uploadError) {
          console.error("Error uploading image to cloudinary:", uploadError);
        }
      }
    }

    const newReview = await Review.create({
      productId,
      userId,
      review: review.trim(),
      rating: numericRating,
      images: uploadedImages,
    });

    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: newReview._id },
      $inc: { reviewCount: 1 },
    });

    await calculateAndUpdateProductRating(productId);

    const populated = await Review.findById(newReview._id)
      .populate("userId", "name")
      .populate("replies.userId", "name");

    return res.status(201).json({
      success: true,
      message: "Thanks for the review",
      data: populated,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/* ======================================================
   UPDATE REVIEW
====================================================== */
const updateReview = async (req, res) => {
  if (req.role !== ROLES.user && req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const { updatedReview, rating } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const reviewDoc = await Review.findById(id);
    if (!reviewDoc) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      !isReviewOwner(reviewDoc, req.id) &&
      req.role !== ROLES.admin
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews",
      });
    }

    reviewDoc.review = updatedReview?.trim() || reviewDoc.review;
    reviewDoc.rating = numericRating;
    await reviewDoc.save();

    await calculateAndUpdateProductRating(reviewDoc.productId);

    const populated = await Review.findById(reviewDoc._id)
      .populate("userId", "name")
      .populate("replies.userId", "name");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE REVIEW
====================================================== */
const deleteReview = async (req, res) => {
  if (req.role !== ROLES.user && req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!isReviewOwner(review, req.id) && req.role !== ROLES.admin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(id);

    await Product.findByIdAndUpdate(productId, {
      $pull: { reviews: review._id },
      $inc: { reviewCount: -1 },
    });

    await calculateAndUpdateProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   REPLY TO REVIEW (admin only)
====================================================== */
const replyReview = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "Only admins can reply to reviews",
    });
  }

  try {
    const userId = req.id;
    const { id } = req.params;
    const { review } = req.body;

    if (!review?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $push: { replies: { userId, review: review.trim() } } },
      { new: true },
    )
      .populate("userId", "name")
      .populate("replies.userId", "name");

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Reply review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET REVIEWS BY PRODUCT
====================================================== */
const getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ productId: id })
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .populate("replies.userId", "name");

    return res.status(200).json({
      success: true,
      message: reviews.length > 0 ? "Reviews fetched" : "No reviews yet",
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReviewEligibility = async (req, res) => {
  try {
    const { id: productId } = req.params;

    if (req.role !== ROLES.user) {
      return res.status(200).json({
        success: true,
        data: { canReview: false, reason: "login" },
      });
    }

    const product = await Product.findById(productId).select("_id").lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existing = await Review.findOne({
      productId,
      userId: req.id,
    }).select("_id");

    if (existing) {
      return res.status(200).json({
        success: true,
        data: { canReview: false, reason: "already_reviewed" },
      });
    }

    const hasDelivered = await userHasDeliveredOrder(req.id, productId);

    return res.status(200).json({
      success: true,
      data: {
        canReview: hasDelivered,
        reason: hasDelivered ? null : "not_purchased",
      },
    });
  } catch (error) {
    console.error("Review eligibility error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const calculateAndUpdateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      });
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });

    return averageRating;
  } catch (error) {
    console.error("Error calculating product rating:", error);
    return 0;
  }
};

const getProductReviewStats = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ productId: id });

    const stats = {
      total: reviews.length,
      average: 0,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      stats.average = parseFloat((totalRating / reviews.length).toFixed(1));

      reviews.forEach((review) => {
        stats.distribution[review.rating]++;
      });

      Object.keys(stats.distribution).forEach((rating) => {
        stats.distribution[rating] = Math.round(
          (stats.distribution[rating] / reviews.length) * 100,
        );
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review stats fetched",
      data: stats,
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFeaturedReviews = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 12);

    const reviews = await Review.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name")
      .populate("productId", "name")
      .lean();

    const data = reviews.map((review) => ({
      ...review,
      userId: review.userId
        ? { _id: review.userId._id, name: review.userId.name }
        : null,
      productId: review.productId
        ? { _id: review.productId._id, name: review.productId.name }
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: data.length ? "Featured reviews" : "No reviews yet",
      data,
    });
  } catch (error) {
    console.error("Featured reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  replyReview,
  getReviews,
  getFeaturedReviews,
  getProductReviewStats,
  getReviewEligibility,
  calculateAndUpdateProductRating,
};
