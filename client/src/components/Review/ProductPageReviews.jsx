import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
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
    maxReviews != null && reviewsList.length > maxReviews;

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
    <div className={hideHeader ? "" : "mt-8 md:mt-12 md:px-0"}>
      {!hideHeader && (
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h3 className="text-xl font-bold text-foreground md:text-2xl">
            Customer Reviews ({reviewsList.length})
          </h3>
        </div>
      )}

      <div className="w-full space-y-4 md:space-y-6">
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
          />
        ))}
      </div>

      {showViewAllLink && (
        <div className="mt-6 flex flex-col items-center md:mt-8">
          <Link to={`/product/${productId}/reviews`} className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full border-primary text-sm text-primary hover:bg-primary/10 hover:text-primary"
            >
              <span>View All Reviews</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            See all {reviewsList.length} reviews
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductPageReviews;
