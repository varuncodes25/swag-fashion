import FilterMenu from "@/components/custom/FilterMenu";
import Banner from "@/components/custom/banner";
import ProductList from "@/components/custom/ProductList";
import HomeCollections from "@/components/Home/HomeCollection";
import { useEffect, useState } from "react";
import { applyJsonLd, applySeoMeta, getCanonicalFromPath } from "@/utils/seo";

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
      name: "Swag Fashion",
      url: getCanonicalFromPath("/"),
      logo: getCanonicalFromPath("/online-shopping.png"),
      sameAs: [],
    });
  }, []);

  return (
    <div>
      <Banner />
      <HomeCollections />
      <FilterMenu onSearch={setSearch} />
      <ProductList search={search} />
    </div>
  );
};

export default Home;
