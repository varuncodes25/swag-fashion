import { useEffect, useState } from "react";
import axios from "axios";
import { Crown } from "lucide-react";
import ProductCard from "@/components/custom/ProductCard";
import HomeSectionHeader from "@/components/Home/HomeSectionHeader";
import HomeViewAllLink from "@/components/Home/HomeViewAllLink";
import {
  HOME_SECTION_CLASS,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "@/components/Home/homeSectionStyles";

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
    <section className={`${HOME_SECTION_CLASS} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <HomeSectionHeader
          badge="Premium"
          badgeIcon={Crown}
          title="Premium Designs"
          subtitle="Curated prints and standout styles, hand-picked for you."
          viewAllHref="/category/all?isPremium=true"
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
          <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[min(68vw,200px)] shrink-0 sm:w-auto"
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        )}

        <HomeViewAllLink to="/category/all?isPremium=true">
          View all premium
        </HomeViewAllLink>
      </div>
    </section>
  );
}
