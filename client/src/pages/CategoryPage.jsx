import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import FiltersSidebar from "@/components/category/FiltersSidebar";
import TopBar from "@/components/category/TopBar";
import ProductGrid from "@/components/category/ProductGrid";

export default function CategoryPage() {
  const { slug, subSlug } = useParams();
  const { products, loading } = useSelector((state) => state.product);

  return (
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-10 min-h-screen">
      {/* SIDEBAR */}
      <aside className="col-span-12 md:col-span-3">
        <FiltersSidebar />
      </aside>

      {/* MAIN CONTENT */}
      <section className="col-span-12 md:col-span-9 space-y-6">
        <TopBar
          title={
            subSlug
              ? `${slug.replace("-", " ")} / ${subSlug.replace("-", " ")}`
              : `${slug.replace("-", " ")} – All Products`
          }
          productsCount={products?.length || 0}
        />

        {/* ✅ PRODUCTS ALWAYS SHOWN */}
        <ProductGrid loading={loading} products={products} />
      </section>
    </div>
  );
}
