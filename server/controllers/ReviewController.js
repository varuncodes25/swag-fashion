const { ROLES } = require("../utils/constants");
const Review = require("../models/Review");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

/* ======================================================
   CREATE REVIEW - FIXED VERSION
====================================================== */
const createReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  console.log(req.body, "body");
  console.log(req.files, "files");

  try {
    const userId = req.id;
    const { productId, review, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // ✅ FIX: LEAN use karo, document nahi
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

    const uploadedImages = [];
    
    if (req.files && req.files.length > 0) {
      console.log("Processing files:", req.files.length);
      
      for (const file of req.files) {
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "review" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            
            stream.end(file.buffer);
          });
          
          uploadedImages.push({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
          
          console.log("Image uploaded successfully:", uploadResult.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image to cloudinary:", uploadError);
        }
      }
    } else {
      console.log("No files received in req.files");
    }

    // ✅ FIX: Review create karo
    const newReview = await Review.create({
      productId,
      userId,
      review,
      rating,
      images: uploadedImages,
    });

    // ✅ FIX: Product ko DIRECT UPDATE karo, save() nahi
    await Product.findByIdAndUpdate(
      productId,
      {
        $push: { reviews: newReview._id },
        $inc: { reviewCount: 1 }
      }
    );

    // ✅ FIX: Alag function se rating calculate karo
    await calculateAndUpdateProductRating(productId);

    return res.status(201).json({
      success: true,
      message: "Thanks for the review",
      data: newReview,
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
   UPDATE REVIEW - FIXED VERSION
====================================================== */
const updateReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const { updatedReview, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
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

    reviewDoc.review = updatedReview;
    reviewDoc.rating = rating;
    await reviewDoc.save();

    // ✅ FIX: Product ko direct update karo
    await calculateAndUpdateProductRating(reviewDoc.productId);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: reviewDoc,
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
   DELETE REVIEW - FIXED VERSION
====================================================== */
const deleteReview = async (req, res) => {
  if (req.role !== ROLES.user) {
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

    // Delete images from cloudinary
    if (review.images?.length) {
      for (const img of review.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    const productId = review.productId;

    // ✅ FIX: Pehle review delete karo
    await Review.findByIdAndDelete(id);
    
    // ✅ FIX: Phir product ko direct update karo
    await Product.findByIdAndUpdate(
      productId,
      {
        $pull: { reviews: review._id },
        $inc: { reviewCount: -1 }
      }
    );

    // ✅ FIX: Rating alag se calculate karo
    await calculateAndUpdateProductRating(productId);

    return res.status(200).json({
      success: false,
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
   REPLY TO REVIEW - FIXED VERSION
====================================================== */
const replyReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const userId = req.id;
    const { id } = req.params;
    const { review } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $push: { replies: { userId, review } } },
      { new: true }
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
   GET REVIEWS BY PRODUCT - FIXED VERSION
====================================================== */
const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "abhi");

    const reviews = await Review.find({ productId: id })
      .populate("userId", "name")
      .populate("replies.userId", "name");

    // ❌ WRONG: 404 return करना
    // if (!reviews.length) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No reviews found",
    //   });
    // }

    // ✅ CORRECT: हमेशा 200 OK return करो
    return res.status(200).json({
      success: true,
      message: reviews.length > 0 ? "Reviews fetched" : "No reviews yet",
      data: reviews, // Empty array भी send करो
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   HELPER FUNCTION: Calculate Product Rating
====================================================== */
// ✅ FIX: Alag helper function banaye
const calculateAndUpdateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ productId });
    
    if (reviews.length === 0) {
      // Agar koi review nahi hai
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      });
      return 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    
    // ✅ FIX: Direct update karo
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviewCount: reviews.length
    });
    
    return averageRating;
  } catch (error) {
    console.error("Error calculating product rating:", error);
    return 0;
  }
};

/* ======================================================
   EXTRA: Get Product Reviews with Stats
====================================================== */
const getProductReviewStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reviews = await Review.find({ productId: id });
    
    const stats = {
      total: reviews.length,
      average: 0,
      distribution: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      stats.average = parseFloat((totalRating / reviews.length).toFixed(1));
      
      reviews.forEach(review => {
        stats.distribution[review.rating]++;
      });
      
      // Convert to percentages
      Object.keys(stats.distribution).forEach(rating => {
        stats.distribution[rating] = Math.round((stats.distribution[rating] / reviews.length) * 100);
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Review stats fetched",
      data: stats
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  replyReview,
  getReviews,
  getProductReviewStats,
  calculateAndUpdateProductRating // Export karo agar dusre jagah use karna hai
};