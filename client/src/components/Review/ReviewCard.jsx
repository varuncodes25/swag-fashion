// components/Review/ReviewCard.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Edit2, MoreVertical, ZoomIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileImageZoom from "../Product/MobileImageZoom";
import ReviewUserAvatar from "./ReviewUserAvatar";
import { isSameUser } from "./reviewUtils";
import VerifiedPurchaseBadge, {
  isVerifiedPurchaseReview,
} from "./VerifiedPurchaseBadge";

const ReviewCard = ({
  review,
  user,
  isEditing,
  editing,
  setEditing,
  replyingTo,
  setReplyingTo,
  newReply,
  setNewReply,
  loading,
  handleAddReply,
  handleEditReview,
  handleDeleteReview,
  formatDate,
  compact = false,
}) => {
  // ✅ State for image zoom
  const [zoomImageIndex, setZoomImageIndex] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  const reviewUserData = review?.user || review?.userId;
  const reviewUserName = reviewUserData?.name || "Anonymous";
  const isReviewOwner = isSameUser(user, review);
  const isAdmin = user?.role === "admin";
  const showActions = Boolean(user && (isReviewOwner || isAdmin));
  
  // ✅ Handle image click - open zoom
  const handleImageClick = (index) => {
    setZoomImageIndex(index);
    setIsZoomOpen(true);
  };
  
  // ✅ Handle zoom close
  const handleZoomClose = () => {
    setIsZoomOpen(false);
    setZoomImageIndex(null);
  };
  
  // ✅ Handle zoom navigation
  const handleZoomPrev = () => {
    if (review?.images && review.images.length > 0) {
      setZoomImageIndex((prev) => 
        prev === 0 ? review.images.length - 1 : prev - 1
      );
    }
  };
  
  const handleZoomNext = () => {
    if (review?.images && review.images.length > 0) {
      setZoomImageIndex((prev) => 
        prev === review.images.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  const handleZoomSelect = (index) => {
    setZoomImageIndex(index);
  };

  return (
    <div
      className={`w-full ${
        compact
          ? "py-3.5"
          : "rounded-lg border border-border bg-card p-3 sm:p-4"
      }`}
    >
      <div className={`flex items-start justify-between ${compact ? "mb-2" : "mb-3"}`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <ReviewUserAvatar name={reviewUserName} size={compact ? "sm" : "md"} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`truncate font-medium text-foreground ${compact ? "text-sm" : ""}`}>
                {reviewUserName}
              </h4>
              {isVerifiedPurchaseReview(review) && (
                <VerifiedPurchaseBadge />
              )}
              {!compact && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(review?.createdAt)}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`${
                    compact ? "h-3 w-3" : "h-3.5 w-3.5"
                  } ${
                    i < (review?.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              {compact && (
                <span className="ml-1 text-[11px] text-muted-foreground">
                  {formatDate(review?.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit/Delete Dropdown - Only for owner or admin */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditing({
                    status: true,
                    reviewId: review._id,
                    review: review.review,
                    rating: review.rating,
                  });
                }}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Review
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteReview(review._id)}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Review Content */}
      {isEditing ? (
        <div className="space-y-3 mb-4">
          <Textarea
            value={editing.review}
            onChange={(e) =>
              setEditing({ ...editing, review: e.target.value })
            }
            placeholder="Edit your review..."
            className="min-h-[100px]"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => handleEditReview(review._id)}
              disabled={loading.update}
            >
              {loading.update ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setEditing({
                  status: false,
                  reviewId: null,
                  review: "",
                  rating: 0,
                })
              }
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p
            className={`text-foreground/90 ${
              compact
                ? "line-clamp-2 text-sm leading-snug"
                : "mb-3 text-sm sm:text-base"
            }`}
          >
            {review?.review || ""}
          </p>

          {review?.images && review.images.length > 0 && (
            <div className={`flex gap-2 overflow-x-auto ${compact ? "mt-2" : "mb-3"}`}>
              {review.images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative shrink-0 cursor-pointer"
                  onClick={() => handleImageClick(idx)}
                >
                  <img
                    src={img.url}
                    alt={`Review image ${idx + 1}`}
                    className={`rounded-md border border-border object-cover transition-all hover:border-primary ${
                      compact ? "h-14 w-14" : "h-16 w-16"
                    }`}
                  />
                  {!compact && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!compact && (
      <div className="border-t border-border pt-3">
        {isAdmin && replyingTo === review._id ? (
          <div className="space-y-2">
            <Textarea
              value={newReply.review}
              onChange={(e) => setNewReply({ review: e.target.value })}
              placeholder="Write your reply..."
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleAddReply(review._id)}
                disabled={loading.reply}
                size="sm"
              >
                {loading.reply ? "Posting..." : "Post Reply"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setNewReply({ review: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(review._id)}
              className="text-primary hover:text-primary"
            >
              Reply
            </Button>
          )
        )}

        {/* Existing Replies */}
        {review?.replies && review.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {review.replies.map((reply, idx) => (
              <div key={idx} className="pl-4 border-l-2 border-primary/25">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {reply.userId?.name || reply.user?.name || "Admin"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {reply.review}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* ✅ Mobile Image Zoom Modal */}
      {isZoomOpen && review?.images && review.images.length > 0 && (
        <MobileImageZoom
          images={review.images}
          activeIndex={zoomImageIndex}
          onClose={handleZoomClose}
          onPrev={handleZoomPrev}
          onNext={handleZoomNext}
          onSelect={handleZoomSelect}
        />
      )}
    </div>
  );
};

export default ReviewCard;