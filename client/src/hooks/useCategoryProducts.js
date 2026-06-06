// hooks/useCategoryProducts.js (Updated)
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const ALL_CATEGORY_SORT_MAP = {
  newest: "newest",
  price_low: "priceLowToHigh",
  price_high: "priceHighToLow",
  rating: "rating",
  best_seller: "best_seller",
  discount: "discount",
};

export const useCategoryProducts = (slug, subSlug = null, filters = {}, initialPageSize = 24) => {
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: initialPageSize
  });
  const [availableFilters, setAvailableFilters] = useState({});

  const fetchProducts = useCallback(async (page = 1, shouldAppend = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check if slug is available
      if (!slug) {
        setLoading(false);
        return;
      }

      const isAllCategory = String(slug).toLowerCase() === "all";
      const normalizedFilters = { ...filters };
      if (isAllCategory && normalizedFilters.sort) {
        normalizedFilters.sort =
          ALL_CATEGORY_SORT_MAP[normalizedFilters.sort] ?? normalizedFilters.sort;
      }

      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: initialPageSize.toString(),
        ...normalizedFilters
      });

      // Add includeFilters for first load
      if (page === 1) {
        queryParams.append('includeFilters', 'true');
      }

      const url = isAllCategory
        ? `${import.meta.env.VITE_API_URL}/get-products?${queryParams}`
        : subSlug
        ? `${import.meta.env.VITE_API_URL}/products/category/${slug}/${subSlug}?${queryParams}`
        : `${import.meta.env.VITE_API_URL}/products/category/${slug}?${queryParams}`;

     

      const response = await axios.get(url);
      const payload = response.data;
      const data = isAllCategory
        ? {
            products: payload?.data || [],
            pagination: payload?.pagination || {
              totalProducts: 0,
              totalPages: 1,
              currentPage: 1,
            },
            filters: {},
          }
        : payload.data;
     
      // Update products
      if (shouldAppend) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }

      // Update pagination
      setPagination({
        totalProducts: data.pagination.totalProducts,
        totalPages: data.pagination.totalPages,
        currentPage: page,
        pageSize: initialPageSize
      });

      // Update available filters (only on first load)
      if (page === 1 && data.filters) {
        setAvailableFilters(data.filters);
      }

      return data;

    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to fetch products';
      setError(errorMessage);
      console.error('Fetch products error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [slug, subSlug, filtersKey, initialPageSize]);

  // Load products when filters or slug changes
  useEffect(() => {
   
    setProducts([]);
    fetchProducts(1, false);
  }, [slug, subSlug, filtersKey, fetchProducts]);

  // Load more products
  const loadMore = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      fetchProducts(pagination.currentPage + 1, true);
    }
  }, [pagination, loading, fetchProducts]);

  // Refresh products (without clearing)
  const refresh = useCallback(() => {
    fetchProducts(pagination.currentPage, false);
  }, [fetchProducts, pagination]);

  return {
    products,
    loading,
    error,
    pagination,
    availableFilters,
    fetchProducts,
    loadMore,
    refresh,
    hasMore: pagination.currentPage < pagination.totalPages
  };
};