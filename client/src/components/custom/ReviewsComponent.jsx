import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  X,
  Star,
  PenLine,
  MessageSquare,
  Users,
  Camera,
  Filter,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import WriteReviewForm from "../Review/WriteReviewForm";
import ProductPageReviews from "../Review/ProductPageReviews";
import { fetchReviews } from "@/redux/slices/reviewsSlice";

const ReviewsComponent = ({ productId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reviews, loading, error } = useSelector((state) => state.reviews);

  useEffect(() => {
    if (productId) {
      dispatch(fetchReviews(productId));
    }
  }, [productId, dispatch]);

  const handleReviewToggle = useCallback(() => {
    setShowReviewForm((prev) => !prev);
  }, []);

  const handleReviewSuccess = useCallback(() => {
    dispatch(fetchReviews(productId));
    setShowReviewForm(false);
    toast({
      title: "Review submitted successfully",
      description: "Thank you for sharing your feedback.",
      duration: 3000,
    });
  }, [dispatch, productId, toast]);

  const handleImageClick = useCallback((img) => {
    setSelectedImage(img);
    setDrawerOpen(true);
  }, []);

  // Memoized calculations
  const totalReviews = reviews?.length || 0;
  
  const averageRating = useMemo(() => {
    if (!reviews?.length) return 0;
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map(stars => 
      reviews?.filter((r) => Math.floor(r.rating) === stars).length || 0
    );
  }, [reviews]);

  const photoCount = useMemo(() => 
    reviews?.filter(r => r.images?.length > 0).length || 0,
    [reviews]
  );

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    
    const sorted = [...reviews];
    switch (sortBy) {
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [reviews, sortBy]);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
    { value: 'helpful', label: 'Most Helpful' },
  ];

  if (error) {
    return (
      <div className="my-10 max-w-6xl mx-auto px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-destructive text-sm">
            Unable to load reviews. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 sm:my-16 max-w-6xl mx-auto sm:px-4">
      <div className="bg-white dark:bg-background rounded-xl border border-border overflow-hidden">
        
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Title and Rating */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary dark:text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Customer Reviews
                </h2>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-foreground">
                        {averageRating}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {totalReviews > 0 && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-muted rounded-lg">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{totalReviews}</span>
                  </div>
                  {photoCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>{photoCount}</span>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={handleReviewToggle}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                  text-sm font-medium transition-colors
                  ${showReviewForm
                    ? "bg-muted text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    : "bg-primary hover:bg-primary/90 text-white"
                  }
                `}
              >
                {showReviewForm ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PenLine className="h-4 w-4" />
                    Write Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <div className="bg-muted/40/50 rounded-lg p-6">
                <h3 className="text-base font-medium text-foreground mb-4">
                  Share Your Experience
                </h3>
                <WriteReviewForm
                  productId={productId}
                  onCancel={handleReviewToggle}
                  onSuccess={handleReviewSuccess}
                />
              </div>
            </div>
          )}

          {/* Rating Distribution */}
          {!showReviewForm && totalReviews > 0 && (
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Average Score Card */}
              <div className="bg-muted/40/50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {averageRating}
                  </div>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall Rating
                  </p>
                </div>
              </div>

              {/* Rating Distribution Bars */}
              <div className="lg:col-span-2 bg-muted/40/50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars, index) => {
                    const count = ratingCounts[index];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm text-muted-foreground">
                            {stars}
                          </span>
                          <Star className="h-3.5 w-3.5 fill-gray-400 text-gray-400" />
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {!showReviewForm && (
            <>
              {totalReviews > 0 ? (
                <div className="space-y-6">
                  {/* Sort Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {sortedReviews.length} Reviews
                    </h3>
                    
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <span>Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      
                      {showSortDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setShowSortDropdown(false)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-20">
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSortBy(option.value);
                                  setShowSortDropdown(false);
                                }}
                                className={`
                                  w-full text-left px-4 py-2 text-sm
                                  ${sortBy === option.value
                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }
                                  first:rounded-t-lg last:rounded-b-lg
                                `}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Reviews */}
                  <ProductPageReviews
                    productId={productId}
                    reviews={sortedReviews}
                    loading={loading}
                    onImageClick={handleImageClick}
                  />
                </div>
              ) : (
                !loading && (
                  <div className="text-center py-12">
                    <div className="inline-flex p-3 bg-muted rounded-full mb-3">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-1">
                      No reviews yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to share your experience
                    </p>
                    <button
                      onClick={handleReviewToggle}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm transition-colors"
                    >
                      <PenLine className="h-4 w-4" />
                      Write a Review
                    </button>
                  </div>
                )
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Loading reviews...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <img
                src={selectedImage}
                alt="Review attachment"
                className="max-h-[80vh] w-full object-contain"
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsComponent;