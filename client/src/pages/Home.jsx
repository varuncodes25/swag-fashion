import FilterMenu from "@/components/custom/FilterMenu";
import Banner from "@/components/custom/banner";
import ProductList from "@/components/custom/ProductList";
import HomeCollections from "@/components/Home/HomeCollection";
import PremiumSection from "@/components/Home/PremiumSection";
import SummerSection from "@/components/Home/SummerSection";
import HomeShowcaseSection from "@/components/Home/HomeShowcaseSection";
import ShopByMoodSection from "@/components/Home/ShopByMoodSection";
import HomeReviewsSection from "@/components/Home/HomeReviewsSection";
import HomeTrustStrip from "@/components/Home/HomeTrustStrip";
import { HOME_PAGE_WRAP } from "@/components/Home/homeSectionStyles";
import { useEffect, useState } from "react";
import { applyJsonLd, applySeoMeta, getCanonicalFromPath } from "@/utils/seo";
import { SITE } from "@/constants/siteConfig";

const Home = () => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    applySeoMeta({
      title: "Swag Fashion | Trending T-Shirts & Streetwear",
      description:
        "Discover trending t-shirts, oversized fits, and streetwear essentials at Swag Fashion. Shop men, women, and kids collections.",
      canonical: getCanonicalFromPath("/"),
    });

    applyJsonLd("organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.brand,
      url: getCanonicalFromPath("/"),
      logo: getCanonicalFromPath("/online-shopping.png"),
      email: SITE.email,
      telephone: `+91${SITE.phone}`,
      sameAs: [SITE.instagram.url, SITE.youtube, SITE.facebook],
    });
  }, []);

  return (
    <div>
      <Banner />
      <HomeTrustStrip />
      <div className={HOME_PAGE_WRAP}>
        <HomeShowcaseSection />
        <HomeCollections />
        <FilterMenu onSearch={setSearch} />
        <SummerSection />
        <PremiumSection />
        <ShopByMoodSection />
        <HomeReviewsSection />
        <ProductList search={search} excludePremium />
      </div>
    </div>
  );
};

export default Home;
