import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/api/axiosConfig';

// Async Thunks - Updated to match your backend routes
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 9,
        ...(params.category && params.category !== 'all' && { category: params.category }),
        ...(params.search && params.search.trim() && { search: params.search.trim() }),
        ...(params.price && !isNaN(params.price) && { price: params.price }),
        ...(params.minPrice && !isNaN(params.minPrice) && { minPrice: params.minPrice }),
        ...(params.maxPrice && !isNaN(params.maxPrice) && { maxPrice: params.maxPrice }),
        ...(params.gender && params.gender !== 'all' && { gender: params.gender }),
        ...(params.inStock && params.inStock !== 'all' && { inStock: params.inStock }),
        ...(params.sort && params.sort !== 'createdAt' && { sort: params.sort }),
      };
      
      const response = await apiClient.get('/get-products-admin', {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      // Using your route: /create-product
      const response = await apiClient.post('/create-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/update-product/${id}`, data);
      return response.data;
    } catch (error) {
      const payload = error.response?.data;
      return rejectWithValue(
        payload?.message || payload?.error || error.message,
      );
    }
  }
);

export const duplicateProduct = createAsyncThunk(
  'products/duplicateProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/duplicate-product/${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      // Using your route: /delete-product/:id
      const response = await apiClient.delete(
        `/delete-product/${id}`,
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'adminProducts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      // ✅ Admin route with token
      const response = await apiClient.get(`/admin/product/${id}`);
      
      // Response structure: { success, message, data }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductByName = createAsyncThunk(
  'products/fetchProductByName',
  async (name, { rejectWithValue }) => {
    try {
      // Using your route: /get-product-by-name/:name
      const response = await apiClient.get(`/product/get-product-by-name/${name}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ slug, subSlug = '' }, { rejectWithValue }) => {
    try {
      // Using your route: /products/category/:slug or /products/category/:slug/:subSlug
      const url = subSlug 
        ? `/product/products/category/${slug}/${subSlug}`
        : `/product/products/category/${slug}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const blacklistProduct = createAsyncThunk(
  'products/blacklistProduct',
  async (id, { rejectWithValue }) => {
    try {
      // Using your route: /blacklist-product/:id
      const response = await apiClient.put(
        `/product/blacklist-product/${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromBlacklist = createAsyncThunk(
  'products/removeFromBlacklist',
  async (id, { rejectWithValue }) => {
    try {
      // Using your route: /remove-from-blacklist/:id
      const response = await apiClient.put(
        `/product/remove-from-blacklist/${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSimilarProducts = createAsyncThunk(
  'products/fetchSimilarProducts',
  async (productId, { rejectWithValue }) => {
    try {
      // Using your route: /similar-products/:productId
      const response = await apiClient.get(`/product/similar-products/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleProductVisibility = createAsyncThunk(
  'products/toggleProductVisibility',
  async ({ id, isVisible }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/toggle-visibility/${id}`, { isVisible });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial State
const initialState = {
  products: [],
  currentProduct: null,
  similarProducts: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    pageSize: 9,
  },
  filters: {},
};

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProducts: (state) => {
      state.products = [];
      state.currentProduct = null;
      state.error = null;
      state.similarProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload.data || [];
       if (action.payload.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.currentPage || 1,
            totalPages: action.payload.pagination.totalPages || 1,
            totalProducts: action.payload.pagination.totalProducts || 0,
            pageSize: action.payload.pagination.pageSize || 9,
            hasNextPage: action.payload.pagination.hasNextPage || false,
            hasPrevPage: action.payload.pagination.hasPrevPage || false
          };
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload.product || action.payload.data);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.product || action.payload.data;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        if (state.currentProduct?._id === updatedProduct._id) {
          state.currentProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload.id);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload?.data ?? null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product by Name
      .addCase(fetchProductByName.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductByName.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product || action.payload.data;
      })
      .addCase(fetchProductByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Products by Category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload.data || [];
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Blacklist Product
      .addCase(blacklistProduct.fulfilled, (state, action) => {
        const product = action.payload.product || action.payload.data;
        const index = state.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          state.products[index].isBlacklisted = true;
        }
        if (state.currentProduct?._id === product._id) {
          state.currentProduct.isBlacklisted = true;
        }
      })

      // Remove from Blacklist
      .addCase(removeFromBlacklist.fulfilled, (state, action) => {
        const product = action.payload.product || action.payload.data;
        const index = state.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          state.products[index].isBlacklisted = false;
        }
        if (state.currentProduct?._id === product._id) {
          state.currentProduct.isBlacklisted = false;
        }
      })

      .addCase(toggleProductVisibility.fulfilled, (state, action) => {
        const product = action.payload.product || action.payload.data;
        const index = state.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          state.products[index].isVisible = product.isVisible;
        }
        if (state.currentProduct?._id === product._id) {
          state.currentProduct.isVisible = product.isVisible;
        }
      })

      // Fetch Similar Products
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload.products || action.payload.data || [];
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct, setFilters, clearError, resetProducts } = productSlice.actions;
export default productSlice.reducer;