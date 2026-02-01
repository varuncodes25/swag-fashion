// hooks/useCategoryProducts.js (Updated)
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useCategoryProducts = (slug, subSlug = null, filters = {}, initialPageSize = 12) => {
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

      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: initialPageSize.toString(),
        ...filters
      });

      // Add includeFilters for first load
      if (page === 1) {
        queryParams.append('includeFilters', 'true');
      }

      const url = subSlug 
        ? `${import.meta.env.VITE_API_URL}/products/category/${slug}/${subSlug}?${queryParams}`
        : `${import.meta.env.VITE_API_URL}/products/category/${slug}?${queryParams}`;

      console.log('Fetching products:', url);

      const response = await axios.get(url);
      const { data } = response.data;
     console.log(data,"hhhrttfuf")
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
  }, [slug, subSlug, filters, initialPageSize]);

  // Load products when filters or slug changes
  useEffect(() => {
    console.log('Filters changed, fetching products...');
    setProducts([]);
    fetchProducts(1, false);
  }, [slug, subSlug, filters, fetchProducts]);

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