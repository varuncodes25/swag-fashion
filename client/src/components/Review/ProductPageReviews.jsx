import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReviewCard from "./ReviewCard";
import { formatDate } from "./reviewUtils";
import { isSameUser } from "./reviewUtils";
import {
  deleteReview,
  updateReview,
  addReply,
} from "../../redux/slices/reviewsSlice";

const ProductPageReviews = ({
  productId,
  reviewsList = [],
  maxReviews = 2,
  hideHeader = false,
  compact = false,
}) => {
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
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.reviews);

  const displayedReviews =
    maxReviews == null ? reviewsList : reviewsList.slice(0, maxReviews);
  const showViewAllLink =
    !compact && maxReviews != null && reviewsList.length > maxReviews;

  const handleDeleteReview = async (reviewId) => {
    const reviewToDelete = reviewsList.find((r) => r._id === reviewId);
    const isOwner = isSameUser(user, reviewToDelete);
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You can only delete your own reviews",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleEditReview = async (reviewId) => {
    const reviewToEdit = reviewsList.find((r) => r._id === reviewId);
    const isOwner = isSameUser(user, reviewToEdit);
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own reviews",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to save changes?")) return;

    try {
      await dispatch(
        updateReview({
          reviewId,
          updateData: {
            updatedReview: editing.review,
            rating: editing.rating,
          },
        }),
      ).unwrap();

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
    } catch (error) {
      toast({
        title: "Error",
        description: error || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (reviewId) => {
    if (user?.role !== "admin") {
      toast({
        title: "Unauthorized",
        description: "Only admins can reply to reviews",
        variant: "destructive",
      });
      return;
    }

    if (!newReply.review.trim()) {
      toast({
        title: "Reply required",
        description: "Please write your reply",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        addReply({
          reviewId,
          replyData: { review: newReply.review },
        }),
      ).unwrap();

      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully",
      });

      setNewReply({ review: "" });
      setReplyingTo(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error || "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  if (!reviewsList.length) return null;

  return (
    <div className={hideHeader ? "" : "mt-6 md:mt-8"}>
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">
            Customer Reviews ({reviewsList.length})
          </h3>
        </div>
      )}

      <div className={`w-full ${compact ? "divide-y divide-border/60" : "space-y-3 sm:space-y-4"}`}>
        {displayedReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            user={user}
            compact={compact}
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
          />
        ))}
      </div>

      {showViewAllLink && (
        <div className="mt-4 flex justify-center">
          <Link to={`/product/${productId}/reviews`} className="text-sm font-medium text-primary">
            <span className="inline-flex items-center gap-1">
              View all {reviewsList.length} reviews
              <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductPageReviews;
