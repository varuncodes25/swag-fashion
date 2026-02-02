// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Initial State
const initialState = {
  items: [],
  cartItems: [], // For CartDrawer compatibility
  loading: false,
  error: null,
  cartCount: 0,
  totalItems: 0,
  totalQuantity: 0, // For CartDrawer compatibility
  totalPrice: 0,
  totalDiscount: 0,
  lastUpdated: null
};

// ✅ Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  };
};

// ✅ Get cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cart`,
        getAuthHeaders()
      );
      
      // Transform response to match your state structure
      const cartData = response.data.cart;
      const items = cartData.items || [];
      
      return {
        items: items,
        cartItems: items, // For CartDrawer compatibility
        cartCount: cartData.summary?.itemsCount || items.length,
        totalItems: cartData.summary?.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
        totalQuantity: cartData.summary?.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cartData.summary?.totalPrice || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalDiscount: cartData.summary?.totalDiscount || 0,
      };
    } catch (error) {
      console.error("Fetch cart error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// ✅ Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, variantId, quantity = 1 }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart`,
        { productId, variantId, quantity },
        getAuthHeaders()
      );
      
      // ✅ Dispatch fetchCart to refresh cart data
      if (dispatch) {
        dispatch(fetchCart());
      }
      
      return response.data;
    } catch (error) {
      console.error("Add to cart error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

// ✅ Increase quantity - FIXED: Use your backend endpoint structure
export const increaseQuantity = createAsyncThunk(
  "cart/increaseQuantity",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/increase/${itemId}`,
        {},
        getAuthHeaders()
      );
      return { itemId, data: response.data };
    } catch (error) {
      console.error("Increase quantity error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to increase quantity"
      );
    }
  }
);

// ✅ Decrease quantity - FIXED: Use your backend endpoint structure
export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/decrease/${itemId}`,
        {},
        getAuthHeaders()
      );
      return { itemId, data: response.data };
    } catch (error) {
      console.error("Decrease quantity error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to decrease quantity"
      );
    }
  }
);

// ✅ Update quantity - FIXED: Use your backend endpoint structure
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/update/${itemId}`,
        { quantity },
        getAuthHeaders()
      );
      return { itemId, data: response.data };
    } catch (error) {
      console.error("Update quantity error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to update quantity"
      );
    }
  }
);

// ✅ Remove item - FIXED: Use your backend endpoint structure
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/cart/remove/${itemId}`,
        getAuthHeaders()
      );
      return { itemId, data: response.data };
    } catch (error) {
      console.error("Remove item error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to remove item"
      );
    }
  }
);

// ✅ Clear cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/cart/clear`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Clear cart error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);

// ✅ Get cart count
export const fetchCartCount = createAsyncThunk(
  "cart/fetchCartCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cart/count`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Fetch cart count error:", error);
      return rejectWithValue("Failed to fetch cart count");
    }
  }
);

// ✅ Check stock
export const checkStock = createAsyncThunk(
  "cart/checkStock",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cart/stock-check`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Check stock error:", error);
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to check stock"
      );
    }
  }
);

// ✅ Cart Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Sync actions
    resetCart: (state) => {
      state.items = [];
      state.cartItems = [];
      state.cartCount = 0;
      state.totalItems = 0;
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.totalDiscount = 0;
      state.error = null;
      state.lastUpdated = null;
    },
    
    updateCartTotals: (state) => {
      state.cartCount = state.items.length;
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalQuantity = state.totalItems; // Sync for CartDrawer
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.totalDiscount = state.items.reduce((sum, item) => 
        sum + ((item.originalPrice || item.price * 1.2) - item.price) * item.quantity, 0
      );
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // For optimistic updates
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.cartItems = action.payload;
      state.cartCount = action.payload.length;
      state.totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      state.totalQuantity = state.totalItems;
      state.totalPrice = action.payload.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
    },
  },
  
  extraReducers: (builder) => {
    // ✅ Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.cartItems = action.payload.cartItems;
        state.cartCount = action.payload.cartCount;
        state.totalItems = action.payload.totalItems;
        state.totalQuantity = action.payload.totalQuantity;
        state.totalPrice = action.payload.totalPrice;
        state.totalDiscount = action.payload.totalDiscount;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Update cart count from response
        if (action.payload.cart) {
          state.cartCount = action.payload.cart.itemsCount || state.cartCount + 1;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Increase Quantity - FIXED: Proper state update
    builder
      .addCase(increaseQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(increaseQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, data } = action.payload;
        
        // Find and update item
        const itemIndex = state.items.findIndex(item => item._id === itemId);
        if (itemIndex !== -1 && data.item) {
          // Update item quantity
          state.items[itemIndex].quantity = data.item.quantity;
          state.cartItems[itemIndex].quantity = data.item.quantity;
          
          // Update totals
          state.totalItems += 1;
          state.totalQuantity += 1;
          state.totalPrice += state.items[itemIndex].price;
        }
        
        // Update cart count from response
        if (data.cart) {
          state.cartCount = data.cart.itemsCount || state.cartCount;
        }
      })
      .addCase(increaseQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Decrease Quantity - FIXED: Handle both removal and quantity decrease
    builder
      .addCase(decreaseQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, data } = action.payload;
        
        if (data.removed) {
          // Remove item from cart
          state.items = state.items.filter(item => item._id !== itemId);
          state.cartItems = state.cartItems.filter(item => item._id !== itemId);
          state.cartCount = state.items.length;
        } else if (data.item) {
          // Update item quantity
          const itemIndex = state.items.findIndex(item => item._id === itemId);
          if (itemIndex !== -1) {
            state.items[itemIndex].quantity = data.item.quantity;
            state.cartItems[itemIndex].quantity = data.item.quantity;
            
            // Update totals
            state.totalItems -= 1;
            state.totalQuantity -= 1;
            state.totalPrice -= state.items[itemIndex].price;
          }
        }
        
        // Update cart count from response
        if (data.cart) {
          state.cartCount = data.cart.itemsCount || state.cartCount;
        }
      })
      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Update Quantity
    builder
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, data } = action.payload;
        
        const itemIndex = state.items.findIndex(item => item._id === itemId);
        if (itemIndex !== -1 && data.item) {
          const oldQuantity = state.items[itemIndex].quantity;
          const newQuantity = data.item.quantity;
          const price = state.items[itemIndex].price;
          
          // Update item
          state.items[itemIndex].quantity = newQuantity;
          state.cartItems[itemIndex].quantity = newQuantity;
          
          // Update totals
          const quantityDiff = newQuantity - oldQuantity;
          state.totalItems += quantityDiff;
          state.totalQuantity += quantityDiff;
          state.totalPrice += price * quantityDiff;
        }
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Remove Item - FIXED: Proper state update
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, data } = action.payload;
        
        // Find the item to get its details before removing
        const itemIndex = state.items.findIndex(item => item._id === itemId);
        if (itemIndex !== -1) {
          const item = state.items[itemIndex];
          // Update totals before removing
          state.totalItems -= item.quantity;
          state.totalQuantity -= item.quantity;
          state.totalPrice -= item.price * item.quantity;
          
          // Remove item
          state.items.splice(itemIndex, 1);
          state.cartItems.splice(itemIndex, 1);
          state.cartCount = state.items.length;
        }
        
        // Update cart count from response
        if (data.cart) {
          state.cartCount = data.cart.itemsCount || state.cartCount;
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Clear Cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.cartItems = [];
        state.cartCount = 0;
        state.totalItems = 0;
        state.totalQuantity = 0;
        state.totalPrice = 0;
        state.totalDiscount = 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ Fetch Cart Count
    builder
      .addCase(fetchCartCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.loading = false;
        state.cartCount = action.payload.count || 0;
        state.totalItems = action.payload.totalItems || 0;
        state.totalQuantity = action.payload.totalItems || 0;
      })
      .addCase(fetchCartCount.rejected, (state) => {
        state.loading = false;
      });
    
    // ✅ Check Stock
    builder
      .addCase(checkStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions and reducer
export const { 
  resetCart, 
  updateCartTotals, 
  clearError, 
  setCartItems 
} = cartSlice.actions;

export default cartSlice.reducer;