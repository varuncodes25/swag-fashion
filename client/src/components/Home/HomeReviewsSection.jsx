import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Star, Quote } from "lucide-react";
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
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/reviews/featured`,
          { params: { limit: 6 } },
        );
        const data = res.data?.data ?? res.data ?? [];
        setReviews(Array.isArray(data) ? data : []);
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
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Real customers
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Loved by the community
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            See what shoppers say about fit, print quality, and comfort.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scroll-smooth scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {reviews.map((review) => {
              const userName = review.userId?.name || review.user?.name || "Customer";
              const product = review.productId;
              const productName =
                typeof product === "object" ? product?.name : null;
              const productId =
                typeof product === "object" ? product?._id : product;

              return (
                <article
                  key={review._id}
                  className="w-[min(85vw,320px)] shrink-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:w-auto"
                >
                  <Quote className="mb-3 h-8 w-8 text-primary/25" />
                  <Stars rating={review.rating} />
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground">
                    {review.review}
                  </p>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    {productName && productId && (
                      <Link
                        to={`/product/${productId}`}
                        className="mt-0.5 block truncate text-xs text-primary hover:underline"
                      >
                        {productName}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
