// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/axiosConfig";  // ✅ Import apiClient

// ✅ Initial State - ADD isCartOpen
const initialState = {
  items: [],
  cartItems: [],
  loading: false,
  error: null,
  cartCount: 0,
  totalItems: 0,
  totalQuantity: 0,
  totalPrice: 0,
  totalDiscount: 0,
  lastUpdated: null,
  isCartOpen: false,  // ✅ ADD THIS - Cart open/close state
  previousItems: [],  // For rollback
  removedItem: null,  // For rollback
  removedIndex: -1,   // For rollback
};

// ✅ Helper function to get auth headers (apiClient already handles token)
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

// ✅ Calculate cart totals
const calculateTotals = (items) => {
  return {
    cartCount: items.length,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0),
    totalDiscount: items.reduce((sum, item) => 
      sum + ((item.price - item.sellingPrice) * item.quantity), 0
    ),
  };
};

// ✅ FETCH CART - Using apiClient
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Use apiClient instead of axios
      const response = await apiClient.get("/cart");
      
      // ✅ Response structure based on your apiClient
      const cartData = response.data?.data || response.data?.cart || response.data;
      const items = cartData.items || [];
      
      return {
        items: items,
        cartItems: items,
        cartCount: cartData.summary?.itemsCount || items.length,
        totalItems: cartData.summary?.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
        totalQuantity: cartData.summary?.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cartData.summary?.totalPrice || items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0),
        totalDiscount: cartData.summary?.totalDiscount || 0,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch cart"
      );
    }
  }
);

// ✅ ADD TO CART - WITH OPTIMISTIC UPDATE 🚀
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, variantId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    
    // 🟢 STEP 1: PEHLE UI UPDATE KARO - INSTANT!
    dispatch(cartSlice.actions.optimisticAddToCart({
      productId,
      variantId,
      quantity
    }));
    
    try {
      // 🟡 STEP 2: API CALL USING API CLIENT
      const response = await apiClient.post("/cart", { 
        productId, 
        variantId, 
        quantity 
      });
      
      // 🟢 STEP 3: SERVER SE CONFIRMATION - FETCH LATEST CART
      dispatch(fetchCart());
      
      return response.data;
      
    } catch (error) {
      // 🔴 STEP 4: ERROR AAYA TO UI ROLLBACK KARO
      dispatch(cartSlice.actions.rollbackAddToCart({
        productId,
        variantId,
        quantity
      }));
      
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

// ✅ INCREASE QUANTITY - OPTIMISTIC
export const increaseQuantity = createAsyncThunk(
  "cart/increaseQuantity",
  async (itemId, { dispatch, rejectWithValue }) => {
    
    // 🟢 PEHLE UI UPDATE
    dispatch(cartSlice.actions.optimisticIncreaseQuantity(itemId));
    
    try {
      // ✅ Use apiClient
      const response = await apiClient.put(`/cart/increase/${itemId}`, {});
      
      dispatch(fetchCart());
      return { itemId, data: response.data };
      
    } catch (error) {
      // 🔴 ROLLBACK
      dispatch(cartSlice.actions.rollbackIncreaseQuantity(itemId));
      return rejectWithValue(error.response?.data?.message || "Failed to increase quantity");
    }
  }
);

// ✅ DECREASE QUANTITY - OPTIMISTIC
export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",
  async (itemId, { dispatch, rejectWithValue }) => {
    
    // 🟢 PEHLE UI UPDATE
    dispatch(cartSlice.actions.optimisticDecreaseQuantity(itemId));
    
    try {
      // ✅ Use apiClient
      const response = await apiClient.put(`/cart/decrease/${itemId}`, {});
      
      dispatch(fetchCart());
      return { itemId, data: response.data };
      
    } catch (error) {
      // 🔴 ROLLBACK
      dispatch(cartSlice.actions.rollbackDecreaseQuantity(itemId));
      return rejectWithValue(error.response?.data?.message || "Failed to decrease quantity");
    }
  }
);

// ✅ REMOVE ITEM - OPTIMISTIC
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { dispatch, rejectWithValue }) => {
    
    // 🟢 PEHLE UI UPDATE - ITEM HATAO INSTANTLY
    dispatch(cartSlice.actions.optimisticRemoveFromCart(itemId));
    
    try {
      // ✅ Use apiClient
      const response = await apiClient.delete(`/cart/remove/${itemId}`);
      
      dispatch(fetchCart());
      return { itemId, data: response.data };
      
    } catch (error) {
      // 🔴 ROLLBACK - API FAIL TO WAPIS ITEM ADD KARO
      dispatch(fetchCart()); // Full refresh as rollback
      return rejectWithValue(error.response?.data?.message || "Failed to remove item");
    }
  }
);

// ✅ CLEAR CART
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch, rejectWithValue }) => {
    
    // 🟢 PEHLE UI CLEAR KARO
    dispatch(cartSlice.actions.optimisticClearCart());
    
    try {
      // ✅ Use apiClient
      const response = await apiClient.delete("/cart/clear");
      
      return response.data;
      
    } catch (error) {
      // 🔴 ROLLBACK - FETCH OLD CART
      dispatch(fetchCart());
      return rejectWithValue(error.response?.data?.message || "Failed to clear cart");
    }
  }
);

// ✅ FETCH CART COUNT
export const fetchCartCount = createAsyncThunk(
  "cart/fetchCartCount",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Use apiClient
      const response = await apiClient.get("/cart/count");
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch cart count");
    }
  }
);

// ✅ CART SLICE
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    
    // ✅ OPEN CART - ADD THIS REDUCER
    openCart: (state) => {
      console.log("🔓 Opening cart...");
      state.isCartOpen = true;
    },
    
    // ✅ CLOSE CART - ADD THIS REDUCER
    closeCart: (state) => {
      console.log("🔒 Closing cart...");
      state.isCartOpen = false;
    },
    
    // ✅ TOGGLE CART - ADD THIS REDUCER
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
      console.log("🔄 Toggling cart to:", state.isCartOpen);
    },
    
    // 🟢 OPTIMISTIC ADD TO CART - INSTANT UI UPDATE
    optimisticAddToCart: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      
      const existingItem = state.items.find(
        item => item.productId === productId && 
        (variantId ? item.variantId === variantId : true)
      );
      
      if (existingItem) {
        // Existing item - quantity badhao
        existingItem.quantity += quantity;
        existingItem.isOptimistic = true;
      } else {
        // Naya item - add karo
        state.items.push({
          _id: `temp_${Date.now()}`,
          productId,
          variantId,
          quantity,
          name: "Adding...",
          price: 0,
          sellingPrice: 0,
          image: null,
          isOptimistic: true,
          isPending: true
        });
      }
      
      // Totals update INSTANTLY
      state.cartCount = state.items.length;
      state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalQuantity = state.totalItems;
      state.cartItems = [...state.items];
      state.error = null;
    },
    
    // 🔴 ROLLBACK ADD TO CART
    rollbackAddToCart: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      
      const index = state.items.findIndex(
        item => item.productId === productId && 
        (variantId ? item.variantId === variantId : true)
      );
      
      if (index !== -1) {
        const item = state.items[index];
        
        if (item.quantity > quantity) {
          // Quantity kam karo
          item.quantity -= quantity;
          delete item.isOptimistic;
          delete item.isPending;
        } else {
          // Item hata do
          state.items.splice(index, 1);
        }
      }
      
      // Totals recalculate
      state.cartCount = state.items.length;
      state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalQuantity = state.totalItems;
      state.cartItems = [...state.items];
      state.error = "Failed to add item. Please try again.";
    },
    
    // 🟢 OPTIMISTIC INCREASE QUANTITY
    optimisticIncreaseQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(i => i._id === itemId);
      
      if (item) {
        item.quantity += 1;
        item.isOptimistic = true;
        
        // Totals update
        state.totalItems += 1;
        state.totalQuantity += 1;
        state.totalPrice += item.sellingPrice;
      }
    },
    
    // 🔴 ROLLBACK INCREASE QUANTITY
    rollbackIncreaseQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(i => i._id === itemId);
      
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        delete item.isOptimistic;
        
        // Totals update
        state.totalItems -= 1;
        state.totalQuantity -= 1;
        state.totalPrice -= item.sellingPrice;
      }
    },
    
    // 🟢 OPTIMISTIC DECREASE QUANTITY
    optimisticDecreaseQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(i => i._id === itemId);
      
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          item.isOptimistic = true;
          
          // Totals update
          state.totalItems -= 1;
          state.totalQuantity -= 1;
          state.totalPrice -= item.sellingPrice;
        }
      }
    },
    
    // 🔴 ROLLBACK DECREASE QUANTITY
    rollbackDecreaseQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(i => i._id === itemId);
      
      if (item) {
        item.quantity += 1;
        delete item.isOptimistic;
        
        // Totals update
        state.totalItems += 1;
        state.totalQuantity += 1;
        state.totalPrice += item.sellingPrice;
      }
    },
    
    // 🟢 OPTIMISTIC REMOVE FROM CART
    optimisticRemoveFromCart: (state, action) => {
      const itemId = action.payload;
      const index = state.items.findIndex(i => i._id === itemId);
      
      if (index !== -1) {
        const item = state.items[index];
        
        // Store for potential rollback
        state.removedItem = item;
        state.removedIndex = index;
        
        // Update totals before removing
        state.totalItems -= item.quantity;
        state.totalQuantity -= item.quantity;
        state.totalPrice -= item.sellingPrice * item.quantity;
        
        // Remove item
        state.items.splice(index, 1);
        state.cartCount = state.items.length;
        state.cartItems = [...state.items];
      }
    },
    
    // 🟢 OPTIMISTIC CLEAR CART
    optimisticClearCart: (state) => {
      state.previousItems = [...state.items];
      state.items = [];
      state.cartItems = [];
      state.cartCount = 0;
      state.totalItems = 0;
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
    
    // 🟢 RESET CART
    resetCart: (state) => {
      state.items = [];
      state.cartItems = [];
      state.cartCount = 0;
      state.totalItems = 0;
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.totalDiscount = 0;
      state.error = null;
    },
    
    // 🟢 CLEAR ERROR
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    // ✅ FETCH CART
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
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
        state.error = null;
        
        // Clear optimistic flags
        state.items.forEach(item => {
          delete item.isOptimistic;
          delete item.isPending;
        });
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ ADD TO CART
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // ✅ FETCH CART COUNT
    builder
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.cartCount = action.payload.count || state.cartCount;
      });
  }
});

// Export actions
export const { 
  openCart,           // ✅ ADD THIS
  closeCart,          // ✅ ADD THIS
  toggleCart,         // ✅ ADD THIS
  resetCart, 
  clearError,
  optimisticAddToCart,
  rollbackAddToCart,
  optimisticIncreaseQuantity,
  rollbackIncreaseQuantity,
  optimisticDecreaseQuantity,
  rollbackDecreaseQuantity,
  optimisticRemoveFromCart,
  optimisticClearCart
} = cartSlice.actions;

export default cartSlice.reducer;