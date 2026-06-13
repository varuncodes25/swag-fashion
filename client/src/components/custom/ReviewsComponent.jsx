import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  X,
  Star,
  PenLine,
  ChevronDown,
  ChevronRight,
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
    ? "Rate Product"
    : eligibility.canReview
      ? "Rate Product"
      : eligibility.reason === "already_reviewed"
        ? "Reviewed"
        : "Rate After Delivery";

  const renderStars = (rating, size = "sm") => {
    const starClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} ${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const ratingSummary = totalReviews > 0 && (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 lg:rounded-xl lg:p-4">
      <div className="flex items-center gap-3 lg:gap-6">
        <div className="flex shrink-0 flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none text-foreground lg:text-3xl">
            {averageRating}
          </span>
          <div className="mt-1">{renderStars(Number(averageRating))}</div>
          <span className="mt-1 text-[10px] text-muted-foreground lg:text-xs">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="hidden h-12 w-px bg-border/80 sm:block lg:h-16" />

        <div className="min-w-0 flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars, index) => {
            const count = ratingCounts[index];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-1.5 lg:gap-2">
                <span className="w-2.5 text-[10px] text-muted-foreground lg:w-3 lg:text-xs">{stars}</span>
                <Star className="h-2.5 w-2.5 shrink-0 fill-amber-400/70 text-amber-400/70" />
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted lg:h-2">
                  <div
                    className="h-full rounded-full bg-primary/80 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-4 text-right text-[10px] text-muted-foreground lg:w-5 lg:text-xs">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const sectionCardClass = fullPage
    ? "w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm lg:rounded-2xl lg:shadow-lg"
    : "mt-3 mb-3 w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-colors duration-200 lg:mt-4 lg:mb-6 lg:rounded-2xl lg:shadow-lg";

  const sectionPadding = "p-3 sm:p-4 lg:p-6";

  if (error) {
    return (
      <div className={fullPage ? "w-full" : "mt-4 mb-4 w-full lg:mb-6"}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-destructive">
            Unable to load reviews. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={sectionCardClass}>
        <div className={`${sectionPadding} border-b border-border/60`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 lg:gap-3">
              <div className="rounded-md bg-primary/10 p-1.5 lg:rounded-lg lg:p-2">
                <Star className="h-4 w-4 text-primary lg:h-5 lg:w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground lg:text-lg">
                  Ratings &amp; Reviews
                </h2>
                {totalReviews > 0 && !fullPage && (
                  <p className="text-[11px] text-muted-foreground lg:text-xs">
                    {averageRating} ★ · {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleReviewToggle}
              disabled={
                isAuthenticated &&
                !eligibility.canReview &&
                eligibility.reason === "already_reviewed"
              }
              className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors lg:rounded-lg lg:px-3 lg:py-2 lg:text-sm ${
                showReviewForm
                  ? "border-border bg-muted text-foreground"
                  : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {showReviewForm ? (
                <span className="inline-flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <PenLine className="h-3.5 w-3.5" />
                  {writeReviewLabel}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className={sectionPadding}>
          {showReviewForm && (
            <div className="mb-4">
              <WriteReviewForm
                productId={productId}
                onCancel={handleReviewToggle}
                onSuccess={handleReviewSuccess}
              />
            </div>
          )}

          {loading && totalReviews === 0 ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <>
              {!showReviewForm && totalReviews > 0 && (
                <div className={`mb-3 lg:mb-4 ${fullPage ? "" : "hidden sm:block"}`}>
                  {ratingSummary}
                </div>
              )}

              {!showReviewForm && totalReviews > 0 && (
                <div>
                  {fullPage && (
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {sortedReviews.length} Reviews
                      </h3>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowSortDropdown(!showSortDropdown)}
                          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:text-sm"
                        >
                          <span>
                            {
                              SORT_OPTIONS.find((opt) => opt.value === sortBy)
                                ?.label
                            }
                          </span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        {showSortDropdown && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowSortDropdown(false)}
                            />
                            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-border bg-card shadow-lg">
                              {SORT_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setSortBy(option.value);
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full px-3 py-2 text-left text-xs first:rounded-t-lg last:rounded-b-lg sm:text-sm ${
                                    sortBy === option.value
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground hover:bg-muted"
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
                  )}

                  <ProductPageReviews
                    productId={productId}
                    reviewsList={sortedReviews}
                    maxReviews={fullPage ? null : 1}
                    hideHeader
                    compact={!fullPage}
                  />

                  {!fullPage && totalReviews > 0 && (
                    <Link
                      to={`/product/${productId}/reviews`}
                      className="mt-2 flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-muted/40 lg:mt-4 lg:rounded-lg lg:px-4 lg:py-3 lg:text-sm"
                    >
                      <span>All {totalReviews} reviews</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}

              {!showReviewForm && !loading && totalReviews === 0 && (
                <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 py-6 text-center lg:rounded-xl lg:py-10">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 lg:mb-3 lg:h-12 lg:w-12">
                    <Star className="h-4 w-4 text-primary lg:h-5 lg:w-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground lg:text-sm">
                    No reviews yet
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground lg:mt-1 lg:text-xs">
                    Be the first to rate this product
                  </p>
                  {isAuthenticated && eligibility.canReview && (
                    <button
                      type="button"
                      onClick={handleReviewToggle}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <PenLine className="h-4 w-4" />
                      Rate Product
                    </button>
                  )}
                  {isAuthenticated && !eligibility.canReview && (
                    <p className="mt-3 text-xs text-muted-foreground">
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
