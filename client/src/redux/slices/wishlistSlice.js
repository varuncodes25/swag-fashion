// store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axiosConfig';
import { setUserLogout, logoutUser } from './authSlice';

function resetWishlistState(state) {
  state.items = [];
  state.wishlistStatus = {};
  state.error = null;
  state.loading = false;
  state.lastUpdated = null;
}

// ✅ Async thunks - Toggle + Fetch (apiClient adds token + decrypts responses)
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/wishlist');
      const body = response.data?.data ?? response.data;
      return Array.isArray(body) ? body : body?.items || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/toggle', { productId });
      const body = response.data?.data ?? response.data;

      return {
        productId,
        action: body?.action ?? response.data?.action,
        isInWishlist: body?.isInWishlist ?? response.data?.isInWishlist,
        product: body?.product,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to toggle wishlist'
      );
    }
  }
);

// Initial state
const initialState = {
  items: [],
  wishlistStatus: {},
  loading: false,
  error: null,
  lastUpdated: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      resetWishlistState(state);
    },

    optimisticToggle: (state, action) => {
      const productId = action.payload;
      const currentStatus = state.wishlistStatus[productId] || false;
      state.wishlistStatus[productId] = !currentStatus;
    },

    revertOptimisticToggle: (state, action) => {
      const productId = action.payload;
      const currentStatus = state.wishlistStatus[productId] || false;
      state.wishlistStatus[productId] = !currentStatus;
    },

    setWishlistStatus: (state, action) => {
      const { productId, status } = action.payload;
      state.wishlistStatus[productId] = status;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;

        state.wishlistStatus = {};
        action.payload.forEach(product => {
          const productId = product._id || product.productId || product.id;
          if (productId) {
            state.wishlistStatus[productId] = true;
          }
        });

        state.lastUpdated = Date.now();
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, isInWishlist, product } = action.payload;

        state.wishlistStatus[productId] = isInWishlist;

        if (isInWishlist) {
          if (product && !state.items.some(item => item._id === productId)) {
            state.items.push(product);
          }
        } else {
          state.items = state.items.filter(item => item._id !== productId);
        }

        state.lastUpdated = Date.now();
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setUserLogout, resetWishlistState)
      .addCase(logoutUser.fulfilled, resetWishlistState)
      .addCase(logoutUser.rejected, resetWishlistState);
  }
});

export const {
  clearWishlist,
  optimisticToggle,
  revertOptimisticToggle,
  setWishlistStatus
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
