// components/Review/ProductPageReviews.js - DIRECT REDUX
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux"; // ✅ Direct Redux
import { MessageCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import divided components
import ReviewCard from "./ReviewCard";
import {
  getRandomAvatar,
  formatDate,
  calculateAverageRating,
} from "./reviewUtils";

// ✅ Import Redux actions directly
import { 
  fetchReviews, 
  deleteReview, 
  updateReview, 
  addReply 
} from "../../redux/slices/reviewsSlice";

const ProductPageReviews = ({ productId, productSlug }) => {
  const [newReply, setNewReply] = useState({ review: "" });
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState({
    status: false,
    reviewId: null,
    review: "",
    rating: 0,
  });

  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  // ✅ DIRECT REDUX HOOKS
  const dispatch = useDispatch();
  
  // ✅ DIRECT SELECTORS - नए structure के according
  const { reviews, loading, error } = useSelector((state) => state.reviews);
  
  // ✅ DIRECT FETCH
  useEffect(() => {
    console.log("🚀 Direct Redux: Fetching reviews for", productId);
    dispatch(fetchReviews(productId));
  }, [productId, dispatch]);

  // ✅ Debug log when reviews change
  useEffect(() => {
    console.log("📊 Direct Redux: Reviews updated", reviews.length);
  }, [reviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    console.log("🗑️ Direct Redux: Deleting review", reviewId);
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      
      // ✅ Auto refresh
      dispatch(fetchReviews(productId));
      
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully",
      });
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast({
        title: "Error",
        description: error || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleEditReview = async (reviewId) => {
    if (!confirm("Are you sure you want to save changes?")) return;

    console.log("✏️ Direct Redux: Updating review", reviewId);
    try {
      await dispatch(updateReview({ 
        reviewId, 
        updateData: {
          updatedReview: editing.review,
          rating: editing.rating,
        }
      })).unwrap();
      
      setEditing({
        status: false,
        reviewId: null,
        review: "",
        rating: 0,
      });
      
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully",
      });
      
      // ✅ Auto refresh
      dispatch(fetchReviews(productId));
    } catch (error) {
      console.error("❌ Update error:", error);
      toast({
        title: "Error",
        description: error || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (reviewId) => {
    if (!newReply.review.trim()) {
      toast({
        title: "Reply required",
        description: "Please write your reply",
        variant: "destructive",
      });
      return;
    }

    console.log("💬 Direct Redux: Adding reply to", reviewId);
    try {
      await dispatch(addReply({ 
        reviewId, 
        replyData: { review: newReply.review } 
      })).unwrap();
      
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully",
      });
      
      setNewReply({ review: "" });
      setReplyingTo(null);
      // ✅ Auto refresh
      dispatch(fetchReviews(productId));
    } catch (error) {
      console.error("❌ Reply error:", error);
      toast({
        title: "Error",
        description: error || "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="mt-8 md:mt-12">
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Customer Reviews
          </h3>
        </div>
        <div className="space-y-3 md:space-y-4 px-4 md:px-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-800 h-24 md:h-32 rounded-lg md:rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

 

  // Debug info
  console.log("🎯 Rendering with reviews:", reviews.length);

  const displayedReviews = reviews.slice(0, 2);

  return (
    <div className="mt-8 md:mt-12 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Customer Reviews ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                {reviews.length} reviews • {calculateAverageRating(reviews)}/5 average
              </p>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {productSlug && (
          <Link to={`/product/${productId}/reviews`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </Link>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800">
          <MessageCircle className="h-10 w-10 md:h-12 md:w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3 md:mb-4" />
          <h4 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No reviews yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base px-4 mb-6">
            Be the first to share your thoughts
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:space-y-6">
            {displayedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                user={user}
                isEditing={editing.status && editing.reviewId === review._id}
                editing={editing}
                setEditing={setEditing}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                newReply={newReply}
                setNewReply={setNewReply}
                loading={loading}
                handleAddReply={() => handleAddReply(review._id)}
                handleEditReview={() => handleEditReview(review._id)}
                handleDeleteReview={() => handleDeleteReview(review._id)}
                formatDate={formatDate}
                getRandomAvatar={getRandomAvatar}
              />
            ))}
          </div>

          {/* View All Reviews Button */}
          {reviews.length > 2 && (
            <div className="mt-6 md:mt-8 flex flex-col items-center">
              <Link
                to={`/product/${productId}/reviews`}
                className="w-full md:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full text-sm border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>View All Reviews</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Click to see all {reviews.length} reviews
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Debug Section - Remove in production */}
      {/* <div className="mt-4 p-2 bg-yellow-100 text-xs">
        <strong>Debug Info:</strong><br />
        Product ID: {productId}<br />
        Reviews Count: {reviews.length}<br />
        Loading: {loading ? "Yes" : "No"}<br />
        Error: {error || "None"}
      </div> */}
    </div>
  );
};

export default ProductPageReviews;