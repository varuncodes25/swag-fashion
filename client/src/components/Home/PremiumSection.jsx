import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Crown } from "lucide-react";
import ProductCard from "@/components/custom/ProductCard";

export default function PremiumSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremium = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-products`,
          {
            params: {
              isPremium: true,
              inStock: true,
              limit: 8,
              page: 1,
            },
          }
        );
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setProducts(data);
      } catch (err) {
        console.error("Failed to load premium products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPremium();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-amber-200/40 bg-gradient-to-b from-amber-50/80 via-white to-white py-10 dark:border-amber-900/30 dark:from-amber-950/20 dark:via-zinc-950 dark:to-zinc-950">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10"
        aria-hidden
      />

      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-200">
              <Crown className="h-3.5 w-3.5" />
              Premium
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Premium Designs
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Curated prints and standout styles, hand-picked for you.
            </p>
          </div>
          <Link
            to="/category/all?isPremium=true"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-amber-800 transition hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] w-[min(72vw,220px)] shrink-0 animate-pulse rounded-xl bg-muted sm:w-[220px]"
              />
            ))}
          </div>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[min(72vw,220px)] shrink-0 sm:w-auto"
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        )}

        <Link
          to="/category/all?isPremium=true"
          className="mt-6 flex w-full items-center justify-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/40 sm:hidden"
        >
          View all premium
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
