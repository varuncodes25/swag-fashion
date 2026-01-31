import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        throw new Error("User not authenticated");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wishlist/toggle`,
        {
          userId: user.id,
          productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wishlist/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // Array of product IDs
    wishlistStatus: {}, // { productId: boolean }
    loading: false,
    error: null,
    optimisticUpdates: {}, // Track optimistic updates
  },
  reducers: {
    // Optimistic update helpers
    optimisticToggle: (state, action) => {
      const productId = action.payload;
      const currentStatus = state.wishlistStatus[productId] || false;
      
      // Store the current state for possible revert
      if (!state.optimisticUpdates[productId]) {
        state.optimisticUpdates[productId] = currentStatus;
      }
      
      // Optimistically update
      state.wishlistStatus[productId] = !currentStatus;
      
      // Update items array
      if (!currentStatus) {
        // Add to wishlist
        if (!state.items.includes(productId)) {
          state.items.push(productId);
        }
      } else {
        // Remove from wishlist
        state.items = state.items.filter(id => id !== productId);
      }
    },
    
    revertOptimisticToggle: (state, action) => {
      const productId = action.payload;
      const originalStatus = state.optimisticUpdates[productId];
      
      if (originalStatus !== undefined) {
        state.wishlistStatus[productId] = originalStatus;
        
        // Revert items array
        if (originalStatus && !state.items.includes(productId)) {
          state.items.push(productId);
        } else if (!originalStatus) {
          state.items = state.items.filter(id => id !== productId);
        }
        
        delete state.optimisticUpdates[productId];
      }
    },
    
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistStatus = {};
      state.optimisticUpdates = {};
    },
    
    syncWishlistStatus: (state, action) => {
      const { productIds } = action.payload;
      
      // Initialize wishlistStatus based on items array
      const status = {};
      productIds.forEach(id => {
        status[id] = true;
      });
      
      state.wishlistStatus = { ...state.wishlistStatus, ...status };
    },
  },
  extraReducers: (builder) => {
    // Toggle wishlist
    builder
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, action: actionType } = action.payload;
        
        // Clear optimistic update tracking
        delete state.optimisticUpdates[productId];
        
        // Update status based on server response
        state.wishlistStatus[productId] = actionType === "added";
        
        // Ensure items array matches the status
        if (actionType === "added" && !state.items.includes(productId)) {
          state.items.push(productId);
        } else if (actionType === "removed") {
          state.items = state.items.filter(id => id !== productId);
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
    
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const wishlistItems = action.payload.data || [];
        
        // Update items array
        state.items = wishlistItems.map(item => 
          typeof item === "object" ? item.productId || item._id : item
        );
        
        // Update wishlistStatus
        const status = {};
        wishlistItems.forEach(item => {
          const productId = typeof item === "object" ? item.productId || item._id : item;
          status[productId] = true;
        });
        state.wishlistStatus = status;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  optimisticToggle,
  revertOptimisticToggle,
  clearWishlist,
  syncWishlistStatus,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;