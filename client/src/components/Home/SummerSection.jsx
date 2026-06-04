import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, SunMedium } from "lucide-react";
import ProductCard from "@/components/custom/ProductCard";
import HomeSectionHeader from "@/components/Home/HomeSectionHeader";
import {
  HOME_SECTION_CLASS,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "@/components/Home/homeSectionStyles";

export default function SummerSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummerProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/get-products`, {
          params: {
            season: "Summer",
            inStock: true,
            limit: 8,
            page: 1,
          },
        });

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setProducts(data);
      } catch (err) {
        console.error("Failed to load summer products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSummerProducts();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className={`${HOME_SECTION_CLASS} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <HomeSectionHeader
          badge="Summer"
          badgeIcon={SunMedium}
          title="Summer Picks"
          subtitle="Lightweight comfort and fresh fits for warm days."
          viewAllHref="/category/all?season=Summer"
        />

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
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:snap-none lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[min(72vw,220px)] shrink-0 snap-start sm:w-auto"
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        )}

        <Link
          to="/category/all?season=Summer"
          className="mt-6 flex w-full items-center justify-center gap-1 rounded-full border border-primary/30 bg-primary/10 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/15 sm:hidden"
        >
          View all summer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
