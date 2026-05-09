import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import TopBar from "@/components/category/TopBar";
import ProductGrid from "@/components/category/ProductGrid";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import MobileFilterButton from "@/components/category/MobileFilterButton";
import { applyJsonLd, applySeoMeta, getCanonicalFromPath } from "@/utils/seo";

const INITIAL_FILTERS = {
  priceRange: [],
  discount: [],
  rating: [],
  colors: [],
  sizes: [],
  brands: [],
  fit: [],
  pattern: [],
  sleeveType: [],
  neckType: [],
  fabric: [],
};

export default function CategoryPage() {
  const { slug, subSlug } = useParams();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const [mounted, setMounted] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [isMobileHeaderCompact, setIsMobileHeaderCompact] = useState(false);

  // ✅ MOBILE FILTER DRAWER STATE
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // ✅ FILTER STATE
  const [selectedFilters, setSelectedFilters] = useState(INITIAL_FILTERS);

  // ✅ Convert filters to query params format
  const queryFilters = useMemo(() => {
    const filters = {};
    // 🔥 T-SHIRT FILTERS ADD KAR
    if (selectedFilters.fit.length > 0) {
      filters.fit = selectedFilters.fit.join(',');
    }

    if (selectedFilters.pattern.length > 0) {
      filters.pattern = selectedFilters.pattern.join(',');
    }

    if (selectedFilters.sleeveType.length > 0) {
      filters.sleeveType = selectedFilters.sleeveType.join(',');
    }

    if (selectedFilters.neckType.length > 0) {
      filters.neckType = selectedFilters.neckType.join(',');
    }

    if (selectedFilters.fabric.length > 0) {
      filters.fabric = selectedFilters.fabric.join(',');
    }
    if (selectedFilters.priceRange.length > 0) {
      filters.priceRange = selectedFilters.priceRange.join(',');
    }
    if (selectedFilters.discount.length > 0) {
      filters.discount = selectedFilters.discount.join(',');
    }
    if (selectedFilters.rating.length > 0) {
      filters.rating = selectedFilters.rating.join(',');
    }
    if (selectedFilters.colors.length > 0) {
      filters.colors = selectedFilters.colors.join(',');
    }
    if (selectedFilters.sizes.length > 0) {
      filters.sizes = selectedFilters.sizes.join(',');
    }
    if (selectedFilters.brands.length > 0) {
      filters.brands = selectedFilters.brands.join(',');
    }
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    if (sortBy) {
      filters.sort = sortBy;
    }

    return filters;
  }, [selectedFilters, searchTerm, sortBy]);

  // ✅ Use the custom hook
  const {
    products,
    loading,
    error,
    pagination,
    availableFilters,
    loadMore,
    hasMore
  } = useCategoryProducts(slug, subSlug, queryFilters);

  // ✅ updateFilter FUNCTION
  const updateFilter = useCallback((filterKey, value) => {
    console.log("Updating filter:", filterKey, value); // ✅ Debug log 
    setSelectedFilters(prev => {
      const currentValues = prev[filterKey] || [];

      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterKey]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [filterKey]: [...currentValues, value]
        };
      }
    });
  }, []);

  // ✅ Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedFilters(INITIAL_FILTERS);
  }, []);

  // ✅ Clear specific filter
  const clearFilter = useCallback((filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  }, []);

  // ✅ Apply filters and close drawer
  const applyFilters = useCallback(() => {
    setIsFilterDrawerOpen(false);
  }, []);

  // Debounced search so API isn't called every key stroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);

    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const paramSearch = searchParams.get("search") || "";
    const paramSort = searchParams.get("sort") || "newest";
    setSearchInput(paramSearch);
    setSearchTerm(paramSearch);
    setSortBy(paramSort);
  }, [searchParams]);

  // ✅ Handle mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Shrink sticky mobile controls after small scroll.
  useEffect(() => {
    const onScroll = () => {
      setIsMobileHeaderCompact(window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const categoryName = (subSlug || slug || "all")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const searchSuffix = searchTerm ? ` for "${searchTerm}"` : "";
    const title = `${categoryName} Collection${searchSuffix} | Swag Fashion`;
    const description = `Shop ${categoryName} fashion${searchSuffix} at Swag Fashion. Explore latest styles, filters by size/color, and great prices.`;
    const canonical = getCanonicalFromPath(window.location.pathname);

    applySeoMeta({
      title,
      description,
      canonical,
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: getCanonicalFromPath("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: categoryName,
          item: canonical,
        },
      ],
    };
    applyJsonLd("category-breadcrumb", breadcrumbSchema);
  }, [slug, subSlug, searchTerm]);

  // Calculate applied filters count
  const appliedFilterCount = Object.values(selectedFilters)
    .flat()
    .filter(Boolean).length;

  // Don't render until mounted (to avoid hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className=" px-4 sm:px-6 lg:px-8">
        {/* Mobile Header: premium sticky controls */}
        <div className="sticky top-14 z-30 -mx-1 mb-2 border-b border-gray-200/70 bg-white/80 px-1 py-2 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80 lg:hidden">
          <div
            className={`rounded-2xl border border-gray-200/80 bg-white shadow-[0_10px_26px_rgba(0,0,0,0.08)] transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${
              isMobileHeaderCompact ? "p-2.5" : "p-3.5"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold capitalize text-gray-900 dark:text-zinc-100">
                  {slug?.replace(/-/g, " ")}
                </p>
                <p
                  className={`text-xs text-muted-foreground transition-all duration-300 ${
                    isMobileHeaderCompact ? "max-h-0 opacity-0 overflow-hidden" : "max-h-8 opacity-100"
                  }`}
                >
                  {pagination.totalProducts || 0} products found
                </p>
              </div>
              <div className="flex items-center gap-2">
                {appliedFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Clear
                  </button>
                )}
                <MobileFilterButton
                  selectedFilters={selectedFilters}
                  updateFilter={updateFilter}
                  clearAllFilters={clearAllFilters}
                  compact
                  className="shrink-0"
                />
              </div>
            </div>

            <div className={`${isMobileHeaderCompact ? "mt-2.5" : "mt-3.5"} relative transition-all duration-300`}>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, brand, type..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary dark:focus:bg-zinc-900"
              />
            </div>

            <div className={`${isMobileHeaderCompact ? "mt-2.5" : "mt-3"} transition-all duration-300`}>
              <div className={`mb-2 flex items-center justify-between gap-2 transition-all duration-300 ${isMobileHeaderCompact ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100 h-auto"}`}>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
                  <ArrowUpDown size={14} />
                  Sort by
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-primary dark:bg-primary/20">
                  {sortBy.replace("_", " ")}
                </span>
              </div>
              <div className="-mx-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-2 px-1 pb-1">
                  {[
                    { value: "newest", label: "Newest" },
                    { value: "price_low", label: "Price Low" },
                    { value: "price_high", label: "Price High" },
                    { value: "rating", label: "Top Rated" },
                    { value: "best_seller", label: "Best Seller" },
                    { value: "discount", label: "Discount" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                        sortBy === opt.value
                          ? "border-primary bg-primary text-white shadow"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 pt-4">
          {/* SIDEBAR - Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FiltersSidebar
                selectedFilters={selectedFilters}
                updateFilter={updateFilter}
                clearAllFilters={clearAllFilters}
                clearFilter={clearFilter}
                availableFilters={availableFilters}
              />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="lg:col-span-9">
            {/* Desktop Top Bar */}
            <div className="hidden lg:block mb-6">
              <TopBar
                title={
                  subSlug
                    ? `${slug?.replace(/-/g, " ")} / ${subSlug?.replace(/-/g, " ")}`
                    : `${slug?.replace(/-/g, " ")}`
                }
                productsCount={pagination.totalProducts || 0}
                searchTerm={searchInput}
                onSearchChange={setSearchInput}
                sortBy={sortBy}
                onSortChange={setSortBy}
                activeFilters={selectedFilters}
                clearAllFilters={clearAllFilters}
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* PRODUCTS */}
            <ProductGrid
              loading={loading}
              products={products}
            />

            {/* LOAD MORE */}
            {hasMore && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-primary dark:bg-blue-700 text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  Load More ({pagination.totalProducts - products.length} remaining)
                </button>
              </div>
            )}

            {/* LOADING INDICATOR */}
            {loading && products.length > 0 && (
              <div className="text-center mt-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary"></div>
              </div>
            )}

            {/* NO PRODUCTS FOUND */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
                {appliedFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-muted text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-card shadow-xl flex flex-col transition-transform duration-300 ease-in-out">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-muted-foreground transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersSidebar
                selectedFilters={selectedFilters}
                updateFilter={updateFilter}
                clearAllFilters={clearAllFilters}
                clearFilter={clearFilter}
                availableFilters={availableFilters}
              />
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border bg-muted/40/50">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 px-4 border border-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 px-4 bg-primary dark:bg-blue-700 text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}