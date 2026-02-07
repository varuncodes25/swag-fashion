import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import TopBar from "@/components/category/TopBar";
import ProductGrid from "@/components/category/ProductGrid";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import MobileFilterButton from "@/components/category/MobileFilterButton";

export default function CategoryPage() {
  const { slug, subSlug } = useParams();
  
  // ✅ MOBILE FILTER DRAWER STATE
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // ✅ FILTER STATE
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [],
    discount: [],
    rating: [],
    colors: [],
    sizes: [],
    brands: []
  });

  // ✅ Convert filters to query params format
  const queryFilters = useMemo(() => {
    const filters = {};
    
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
    
    return filters;
  }, [selectedFilters]);

  // ✅ Use the custom hook
  const {
    products,
    loading,
    error,
    pagination,
    availableFilters,
    fetchProducts,
    loadMore,
    hasMore
  } = useCategoryProducts(slug, subSlug, queryFilters);

  // ✅ updateFilter FUNCTION
  const updateFilter = useCallback((filterKey, value) => {
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
    setSelectedFilters({
      priceRange: [],
      discount: [],
      rating: [],
      colors: [],
      sizes: [],
      brands: []
    });
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
    fetchProducts(1, false);
  }, [fetchProducts]);

  // ✅ Filter update effect
  useEffect(() => {
    fetchProducts(1, false);
  }, [queryFilters, slug, subSlug, fetchProducts]);

  // Calculate applied filters count
  const appliedFilterCount = Object.values(selectedFilters)
    .flat()
    .filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <div className=" px-4 sm:px-6 lg:px-8">
        {/* Mobile Header with Filter Button */}
        <div className="lg:hidden py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {subSlug
                  ? `${slug?.replace(/-/g, " ")} / ${subSlug?.replace(/-/g, " ")}`
                  : `${slug?.replace(/-/g, " ")}`
                }
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {pagination.totalProducts || 0} products
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {appliedFilterCount} filter{appliedFilterCount !== 1 ? 's' : ''}
                </span>
              </div>
              <MobileFilterButton
                isOpen={isFilterDrawerOpen}
                onOpen={() => setIsFilterDrawerOpen(true)}
                onClose={() => setIsFilterDrawerOpen(false)}
                appliedFilterCount={appliedFilterCount}
              />
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
                activeFilters={selectedFilters}
                clearAllFilters={clearAllFilters}
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Load More ({pagination.totalProducts - products.length} remaining)
                </button>
              </div>
            )}

            {/* LOADING INDICATOR */}
            {loading && products.length > 0 && (
              <div className="text-center mt-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
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
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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