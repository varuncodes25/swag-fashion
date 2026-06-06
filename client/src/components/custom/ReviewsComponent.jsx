import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronDown,
} from "lucide-react";
import WriteReviewForm from "../Review/WriteReviewForm";
import ProductPageReviews from "../Review/ProductPageReviews";
import {
  fetchReviews,
  fetchReviewEligibility,
  clearReviews,
} from "@/redux/slices/reviewsSlice";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

const ReviewsComponent = ({ productId, fullPage = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { reviews, loading, error, productId: loadedProductId, eligibility } =
    useSelector((state) => state.reviews);

  const reviewsForProduct =
    loadedProductId === productId ? reviews : [];

  useEffect(() => {
    dispatch(clearReviews());
    if (!productId) return;

    dispatch(fetchReviews(productId));
    if (isAuthenticated) {
      dispatch(fetchReviewEligibility(productId));
    }
  }, [productId, dispatch, isAuthenticated]);

  const handleReviewToggle = useCallback(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!eligibility.canReview) {
      const messages = {
        already_reviewed: "You have already reviewed this product",
        not_purchased: "You can review only after your order is delivered",
        login: "Please login to write a review",
      };
      toast({
        title: "Cannot write review",
        description:
          messages[eligibility.reason] ||
          "You are not eligible to review this product yet",
        variant: "destructive",
      });
      return;
    }

    setShowReviewForm((prev) => !prev);
  }, [isAuthenticated, eligibility, navigate, toast]);

  const handleReviewSuccess = useCallback(() => {
    dispatch(fetchReviews(productId));
    dispatch(fetchReviewEligibility(productId));
    setShowReviewForm(false);
    toast({
      title: "Review submitted successfully",
      description: "Thank you for sharing your feedback.",
      duration: 3000,
    });
  }, [dispatch, productId, toast]);

  const totalReviews = reviewsForProduct.length;

  const averageRating = useMemo(() => {
    if (!totalReviews) return "0.0";
    return (
      reviewsForProduct.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    ).toFixed(1);
  }, [reviewsForProduct, totalReviews]);

  const ratingCounts = useMemo(
    () =>
      [5, 4, 3, 2, 1].map(
        (stars) =>
          reviewsForProduct.filter((r) => Math.floor(r.rating) === stars)
            .length,
      ),
    [reviewsForProduct],
  );

  const photoCount = useMemo(
    () => reviewsForProduct.filter((r) => r.images?.length > 0).length,
    [reviewsForProduct],
  );

  const sortedReviews = useMemo(() => {
    const sorted = [...reviewsForProduct];
    switch (sortBy) {
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }
  }, [reviewsForProduct, sortBy]);

  const writeReviewLabel = !isAuthenticated
    ? "Login to Review"
    : eligibility.canReview
      ? "Write Review"
      : eligibility.reason === "already_reviewed"
        ? "Already Reviewed"
        : "Review After Delivery";

  if (error) {
    return (
      <div className="my-10 mx-auto max-w-6xl px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-destructive">
            Unable to load reviews. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 sm:my-16 -mx-4 w-full max-w-6xl mx-auto px-0 sm:mx-auto sm:px-4">
      <div className="w-full overflow-hidden rounded-none border-y border-border bg-white dark:bg-background sm:rounded-xl sm:border">
        <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 dark:bg-primary/20">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Customer Reviews
                </h2>
                {totalReviews > 0 && (
                  <div className="mt-1 flex items-center gap-3">
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
                      {totalReviews}{" "}
                      {totalReviews === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {totalReviews > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-1.5">
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
                type="button"
                onClick={handleReviewToggle}
                disabled={
                  isAuthenticated &&
                  !eligibility.canReview &&
                  eligibility.reason === "already_reviewed"
                }
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  showReviewForm
                    ? "bg-muted text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    : "bg-primary text-white hover:bg-primary/90"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {showReviewForm ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PenLine className="h-4 w-4" />
                    {writeReviewLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={showReviewForm ? "px-3 py-4 sm:p-6" : "p-4 sm:p-6"}>
          {showReviewForm && (
            <div className="mb-6 w-full max-w-none sm:mb-8">
              <WriteReviewForm
                productId={productId}
                onCancel={handleReviewToggle}
                onSuccess={handleReviewSuccess}
              />
            </div>
          )}

          {loading && totalReviews === 0 ? (
            <div className="space-y-4 py-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-lg bg-muted md:h-32"
                />
              ))}
            </div>
          ) : (
            <>
              {!showReviewForm && totalReviews > 0 && (
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="rounded-lg bg-muted/40 p-6">
                    <div className="text-center">
                      <div className="mb-2 text-4xl font-bold text-foreground">
                        {averageRating}
                      </div>
                      <div className="mb-3 flex justify-center gap-0.5">
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

                  <div className="rounded-lg bg-muted/40 p-6 lg:col-span-2">
                    <h3 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rating Distribution
                    </h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((stars, index) => {
                        const count = ratingCounts[index];
                        const percentage =
                          totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <div className="flex w-12 items-center gap-1">
                              <span className="text-sm text-muted-foreground">
                                {stars}
                              </span>
                              <Star className="h-3.5 w-3.5 fill-gray-400 text-gray-400" />
                            </div>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-sm text-muted-foreground">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!showReviewForm && totalReviews > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {sortedReviews.length} Reviews
                    </h3>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span>
                          Sort:{" "}
                          {
                            SORT_OPTIONS.find((opt) => opt.value === sortBy)
                              ?.label
                          }
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {showSortDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowSortDropdown(false)}
                          />
                          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-border bg-card shadow-lg">
                            {SORT_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSortBy(option.value);
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg ${
                                  sortBy === option.value
                                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <ProductPageReviews
                    productId={productId}
                    reviewsList={sortedReviews}
                    maxReviews={fullPage ? null : 2}
                    hideHeader
                  />
                </div>
              )}

              {!showReviewForm && !loading && totalReviews === 0 && (
                <div className="py-12 text-center">
                  <div className="mb-3 inline-flex rounded-full bg-muted p-3">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mb-1 text-base font-medium text-foreground">
                    No reviews yet
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Be the first to share your experience
                  </p>
                  {isAuthenticated && eligibility.canReview && (
                    <button
                      type="button"
                      onClick={handleReviewToggle}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90"
                    >
                      <PenLine className="h-4 w-4" />
                      Write a Review
                    </button>
                  )}
                  {isAuthenticated && !eligibility.canReview && (
                    <p className="text-xs text-muted-foreground">
                      Reviews open after your order is delivered
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0">
          {selectedImage && (
            <div className="relative overflow-hidden rounded-lg bg-black">
              <img
                src={selectedImage}
                alt="Review attachment"
                className="max-h-[80vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
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
