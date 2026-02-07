// components/Review/ReviewCard.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Edit2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  getRandomAvatar,
}) => {
  // Check if current user is review owner
  const isReviewOwner = user?._id === review?.user?._id;

  return (
    <div className="p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Review Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img
            src={review?.user?.avatar || getRandomAvatar()}
            alt={review?.user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {review?.user?.name}
              </h4>
              <span className="text-xs text-gray-500">
                {formatDate(review?.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review?.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Edit/Delete Dropdown - Only show for review owner */}
        {isReviewOwner && (
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
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {review.review}
          </p>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Review image ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Reply Section */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        {replyingTo === review._id ? (
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(review._id)}
            className="text-blue-600 hover:text-blue-700"
          >
            Reply
          </Button>
        )}

        {/* Existing Replies */}
        {review.replies && review.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {review.replies.map((reply, idx) => (
              <div key={idx} className="pl-4 border-l-2 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {reply.user?.name || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reply.review}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;