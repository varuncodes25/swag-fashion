// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ============ INITIAL STATE ============
const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  cancelLoading: false,
  cancelSuccess: false,
  refundStatus: null
};

// ============ GET AUTH HEADERS ============
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============ 1. FETCH USER ORDERS ============
export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-orders-by-user-id`,
        getAuthHeaders()
      );
      return response.data.data || response.data.orders || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// ============ 2. FETCH SINGLE ORDER DETAILS ============
export const fetchOrderDetails = createAsyncThunk(
  "order/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        getAuthHeaders()
      );
      return response.data.data || response.data.order || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

// ============ 3. CANCEL ORDER ============
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cancel-order`,
        { orderId, reason },
        getAuthHeaders()
      );

      // ✅ Order list refresh karo
      dispatch(fetchUserOrders());
      
      // ✅ Order details bhi refresh karo agar currentOrder open hai
      dispatch(fetchOrderDetails(orderId));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

// ============ ORDER SLICE ============
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCancelStatus: (state) => {
      state.cancelSuccess = false;
      state.cancelLoading = false;
      state.refundStatus = null;
    },
    resetOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ============ FETCH USER ORDERS ============
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ FETCH ORDER DETAILS ============
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        
        // ✅ Properly format order data
        const orderData = action.payload;
        state.currentOrder = {
          ...orderData,
          id: orderData.id || orderData._id,
          _id: orderData._id || orderData.id,
          status: orderData.status || "PENDING",
          items: orderData.items || [],
          pricing: orderData.pricing || {
            subtotal: orderData.subtotal || 0,
            shippingCharge: orderData.shippingCharge || 0,
            totalAmount: orderData.totalAmount || 0,
            couponDiscount: orderData.discount || 0
          }
        };
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentOrder = null;
      })

      // ============ CANCEL ORDER ============
      .addCase(cancelOrder.pending, (state) => {
        state.cancelLoading = true;
        state.cancelSuccess = false;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.cancelSuccess = true;
        
        // ✅ Refund info store karo agar prepaid ho
        if (action.payload.data?.refund) {
          state.refundStatus = action.payload.data.refund;
        }
        
        // ✅ IMPORTANT: Current order ko turant update karo (API refresh se pehle)
        const orderId = action.meta.arg.orderId;
        
        // 1. Orders list mein update karo
        if (state.orders.length > 0) {
          const index = state.orders.findIndex(
            (o) => o.id === orderId || o._id === orderId
          );
          if (index !== -1) {
            state.orders[index].status = "CANCELLED";
            state.orders[index].isCancelled = true;
          }
        }
        
        // 2. Current order ko update karo (UI ke liye turant)
        if (state.currentOrder) {
          const currentOrderId = state.currentOrder._id || state.currentOrder.id;
          if (currentOrderId === orderId) {
            state.currentOrder.status = "CANCELLED";
            state.currentOrder.isCancelled = true;
            state.currentOrder.cancelReason = action.meta.arg.reason;
            state.currentOrder.cancelledAt = new Date().toISOString();
          }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelSuccess = false;
        state.error = action.payload || "Failed to cancel order";
      });
  },
});

// ============ EXPORT ACTIONS & REDUCER ============
export const { 
  clearOrderError, 
  clearCancelStatus, 
  resetOrderState 
} = orderSlice.actions;

export default orderSlice.reducer;