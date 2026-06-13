import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Quote } from "lucide-react";
import apiClient from "@/api/axiosConfig";
import {
  HOME_SECTION_CLASS,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "./homeSectionStyles";

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function HomeReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiClient.get("/reviews/featured", {
          params: { limit: 6 },
        });
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        setReviews(list);
      } catch (err) {
        console.error("Featured reviews failed", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className={`${HOME_SECTION_CLASS} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="mb-4 text-center sm:mb-8">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary sm:mb-2 sm:text-xs">
            Real customers
          </p>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
            Loved by the community
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground sm:mt-2 sm:text-sm">
            Tap a review to see all reviews for that product.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted sm:h-40 sm:rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3">
            {reviews.map((review) => {
              const userName = review.userId?.name || review.user?.name || "Customer";
              const product = review.productId;
              const productName = typeof product === "object" ? product?.name : null;
              const productId = typeof product === "object" ? product?._id : product;

              const cardClass =
                "group w-[min(78vw,280px)] shrink-0 rounded-xl border border-border bg-card p-3.5 shadow-sm transition hover:border-primary/40 hover:shadow-md sm:w-auto sm:rounded-2xl sm:p-5";

              const cardBody = (
                <>
                  <Quote className="mb-2 h-6 w-6 text-primary/25 sm:mb-3 sm:h-8 sm:w-8" />
                  <Stars rating={review.rating} />
                  <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-foreground sm:mt-3 sm:text-sm">
                    {review.review}
                  </p>
                  <div className="mt-3 border-t border-border pt-2.5 sm:mt-4 sm:pt-3">
                    <p className="text-xs font-semibold text-foreground sm:text-sm">{userName}</p>
                    {productName && (
                      <p className="mt-0.5 truncate text-xs text-primary group-hover:underline">
                        {productName}
                      </p>
                    )}
                  </div>
                </>
              );

              if (!productId) {
                return (
                  <article key={review._id} className={cardClass}>
                    {cardBody}
                  </article>
                );
              }

              return (
                <Link
                  key={review._id}
                  to={`/product/${productId}/reviews`}
                  className={cardClass}
                >
                  {cardBody}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
