import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useDispatch } from "react-redux";
import { setProducts as setReduxProducts } from "@/redux/slices/productSlice";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";
import { ChevronDown, Loader2 } from "lucide-react";

const ProductList = ({ category = "All", price = "", search = "" }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const dispatch = useDispatch();
  const limit = 12;

  // Fetch wishlist on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchWishlist());
    }
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-products`,
          {
            params: {
              page: pageNum,
              limit,
              category: category !== "All" ? category : "",
              price: price || "",
              search: search || "",
            },
          },
        );

        const { data, pagination } = res.data;
        const newProducts = Array.isArray(data) ? data : [];

        if (isLoadMore) {
          // Append new products
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          // Reset products
          setProducts(newProducts);
          setPage(1);
        }

        // Update Redux
        dispatch(setReduxProducts(data));

        // Pagination info
        const total = pagination?.totalProducts || 0;
        setTotalProducts(total);
        const totalPages = Math.ceil(total / limit);
        setHasMore(pageNum < totalPages);
        
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [category, price, search, limit, dispatch],
  );

  // Initial fetch or when filters change
  useEffect(() => {
    fetchProducts(1, false);
  }, [category, price, search, fetchProducts]);

  // Load more handler
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 dark:bg-black dark:from-black dark:via-black dark:to-black">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 dark:bg-black dark:from-black dark:via-black dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Search Header */}
        {search && (
          <div className="mb-6 animate-slideDown">
            <div className="inline-flex items-center px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <span className="text-gray-600 dark:text-gray-300">
                Showing results for: <span className="font-semibold text-gray-900 dark:text-white">"{search}"</span>
              </span>
              <span className="ml-3 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {products.length} items
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products.map((p) => (
                <div key={p._id} className="transform transition-all duration-300 hover:scale-[1.02]">
                  <ProductCard {...p} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-10 mb-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`
                    group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                    hover:from-blue-700 hover:to-purple-700 text-white font-semibold 
                    rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-3
                  `}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Products</span>
                      <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Products Count */}
            {!hasMore && products.length > 0 && (
              <div className="text-center mt-10 mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing all {products.length} products
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      {products.length > 8 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 z-50"
        >
          <svg className="w-5 h-5 mx-auto text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ProductList;