import React, { useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import StarRating from "../StarRating";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { createReview } from "@/redux/slices/reviewsSlice";

const WriteReviewForm = ({
  productId,
  onSuccess,
  onCancel,
}) => {
  const [images, setImages] = useState([]);
  const [newReview, setNewReview] = useState({
    review: "",
    rating: 0,
  });
  const fileInputRef = useRef(null);
  const MAX_IMAGES = 15;
  const { toast } = useToast();

  // Direct Redux use
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.reviews);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        preview: URL.createObjectURL(file),
        file,
      }));
      const combined = [...images, ...newImages].slice(0, MAX_IMAGES);
      setImages(combined);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (!newReview.review.trim()) {
        return toast({
          title: "Review required",
          description: "Please write your review",
          variant: "destructive",
        });
      }

      if (!newReview.rating) {
        return toast({
          title: "Rating required",
          description: "Please select a rating",
          variant: "destructive",
        });
      }

      // Direct dispatch createReview action
      await dispatch(
        createReview({
          review: newReview.review,
          rating: newReview.rating,
          productId,
          images,
        }),
      ).unwrap();

      setNewReview({ review: "", rating: 0 });
      setImages([]);

      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handling from Redux thunk
      toast({
        title: "Error",
        description: error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-none rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6 sm:shadow-lg md:p-8">
      <div className="mb-5 flex items-start gap-3 sm:mb-6">
        <div className="shrink-0 rounded-lg bg-primary/10 p-2 dark:bg-primary/20">
          <User className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-bold text-foreground sm:text-xl">
            Write Your Review
          </h4>
          <p className="text-sm text-muted-foreground">
            Your feedback helps others make better decisions
          </p>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Rating */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How would you rate this product?
          </Label>
          <div className="flex items-center gap-2">
            <StarRating
              rating={newReview.rating}
              onRate={(value) => setNewReview({ ...newReview, rating: value })}
              size="lg"
            />
            {newReview.rating > 0 && (
              <span className="ml-3 text-lg font-semibold text-highlight dark:text-amber-500">
                {newReview.rating}.0
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Your Review
          </Label>
          <Textarea
            placeholder="What did you like or dislike? What should others know about this product?"
            className="min-h-[120px] w-full resize-none"
            value={newReview.review}
            onChange={(e) =>
              setNewReview({ ...newReview, review: e.target.value })
            }
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Add Photos (Optional)
          </Label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {images.map((image, index) => (
                <div className="relative group" key={index}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border group-hover:border-primary transition-all">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex flex-col items-center justify-center"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Add
                  </span>
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />

            <p className="text-sm text-muted-foreground">
              Upload up to {MAX_IMAGES} images. Max 5MB per image.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !newReview.review.trim() || !newReview.rating
            }
            className="w-full flex-1 px-6 py-3 text-base font-semibold sm:px-8"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : (
              "Submit Review"
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full flex-1 px-6 py-3 text-base sm:px-8"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteReviewForm;