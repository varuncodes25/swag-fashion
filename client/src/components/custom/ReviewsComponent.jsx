import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  X,
  Star,
  PenLine,
  MessageSquare,
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Users,
  Clock,
  ThumbsUp,
  Camera,
  Heart,
  Share2,
  Flag,
} from "lucide-react";
import WriteReviewForm from "../Review/WriteReviewForm";
import ProductPageReviews from "../Review/ProductPageReviews";
import { fetchReviews } from "@/redux/slices/reviewsSlice";

const ReviewsComponent = ({ productId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reviews, loading, error } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchReviews(productId));
  }, [productId, dispatch]);

  const handleReviewToggle = () => {
    setShowReviewForm((prev) => !prev);
  };

  const handleReviewSuccess = () => {
    dispatch(fetchReviews(productId));
    setShowReviewForm(false);
    toast({
      title: "✨ Review Submitted!",
      description: "Thank you for sharing your experience.",
      duration: 3000,
    });
  };

  // Calculate average rating
  const averageRating =
    reviews?.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="my-10 sm:my-20 max-w-6xl mx-auto sm:px-2">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* ===== SIMPLE HEADER ===== */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            
            {/* Left: Title & Rating */}
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-white/90" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Customer Reviews
                </h2>
                {reviews?.length > 0 && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                      <span className="text-sm font-medium text-white ml-1">
                        {averageRating}
                      </span>
                    </div>
                    <span className="text-xs text-white/70">
                      ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Write Review Button */}
            <button
              onClick={handleReviewToggle}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                text-sm font-medium transition-all w-full sm:w-auto
                ${showReviewForm
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white text-gray-900 hover:shadow-md"
                }
              `}
            >
              {showReviewForm ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4" />
                  <span>Write a Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6">
          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <WriteReviewForm
                productId={productId}
                onCancel={handleReviewToggle}
                onSuccess={handleReviewSuccess}
              />
            </div>
          )}

          {/* Reviews List */}
          {!showReviewForm && (
            <>
              {reviews?.length > 0 ? (
                <ProductPageReviews
                  productId={productId}
                  reviews={reviews}
                  loading={loading}
                  onImageClick={(img) => {
                    setSelectedImage(img);
                    setDrawerOpen(true);
                  }}
                />
              ) : (
                !loading && (
                  <div className="text-center py-12">
                    <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                      <MessageSquare className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      No Reviews Yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Be the first to share your experience!
                    </p>
                    <button
                      onClick={handleReviewToggle}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                    >
                      <PenLine className="h-4 w-4" />
                      Write a Review
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative rounded-lg overflow-hidden bg-black/90">
              <img
                src={selectedImage}
                alt="Review"
                className="max-h-[80vh] w-full object-contain"
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsComponent;