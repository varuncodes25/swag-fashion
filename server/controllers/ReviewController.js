const { ROLES } = require("../utils/constants");
const Review = require("../models/Review");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

const createReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const userId = req.id;

  try {
    const { productId, review, rating } = req.body;
    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "review",
        });

        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const newReview = await Review.create({
      productId,
      review,
      userId,
      rating,
      images: uploadedImages, // ✅ include images here
    });

    await newReview.populate("userId", "name");

    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: newReview._id },
    });

    const product = await Product.findById(productId);
    await product.calculateRating();

    return res.status(201).json({
      success: true,
      message: "Thanks for the Review",
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const updateReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const { updatedReview, rating } = req.body; // ⬅️ Get rating too
    
    let review = await Review.findByIdAndUpdate(
      id,
      { review: updatedReview, rating }, // ⬅️ Include rating here
      { new: true }
    );
   console.log(req.body)
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    await review.populate("userId", "name");

    return res
      .status(200)
      .json({ success: true, data: review, message: "Review updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const replyReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const userId = req.id;
  const { id } = req.params;

  try {
    const { review } = req.body;

    let foundReview = await Review.findByIdAndUpdate(
      { _id: id },
      { $push: { replies: { userId, review } } },
      { new: true }
    )
      .populate("replies.userId", "name")
      .populate("userId", "name");

    if (!foundReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      data: foundReview,
      message: "Reply added successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;

    let review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    let product = await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: review._id },
    });

    await product.calculateRating();

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching reviews for product ID:", id);

    let reviews = await Review.find({ productId: id })
      .populate({
        path: "userId",
        select: "name",
      })
      .populate({
        path: "replies.userId",
        select: "name",
      });

    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reviews not found" });
    }

    return res
      .status(200)
      .json({ success: true, data: reviews, message: "Reviews found" });
  } catch (error) {
    console.error("Error in getReviews:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
  
};


module.exports = {
  createReview,
  updateReview,
  replyReview,
  deleteReview,
  getReviews,
};
