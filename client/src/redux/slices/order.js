// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/axiosConfig";  // ✅ Import apiClient

// ============ INITIAL STATE ============
const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  cancelLoading: false,
  cancelSuccess: false,
  refundStatus: null,
  exchangeLoading: false,
  exchangeSuccess: false,
  exchangePreview: null,
  exchangePreviewLoading: false,
};

// ============ 1. FETCH USER ORDERS ============
export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ USE APICLIENT
      const response = await apiClient.get("/get-orders-by-user-id");
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
      // ✅ USE APICLIENT
      const response = await apiClient.get(`/orders/${orderId}`);
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
      // ✅ USE APICLIENT
      const response = await apiClient.post("/cancel-order", {
        orderId, 
        reason 
      });

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

// ============ 4. PREVIEW EXCHANGE ============
export const previewExchangeOrder = createAsyncThunk(
  "order/previewExchangeOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/exchanges/preview", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to calculate exchange price"
      );
    }
  }
);

// ============ 5. EXCHANGE ORDER ============
export const exchangeOrder = createAsyncThunk(
  "order/exchangeOrder",
  async (
    {
      orderId,
      reason,
      exchangeType,
      itemIndex,
      newProductId,
      newColor,
      newSize,
      newVariantId,
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await apiClient.post("/exchanges", {
        orderId,
        reason,
        exchangeType,
        itemIndex,
        newProductId,
        newColor,
        newSize,
        newVariantId,
      });

      dispatch(fetchUserOrders());
      dispatch(fetchOrderDetails(orderId));

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit exchange request"
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
    clearExchangeStatus: (state) => {
      state.exchangeSuccess = false;
      state.exchangeLoading = false;
      state.exchangePreview = null;
    },
    clearExchangePreview: (state) => {
      state.exchangePreview = null;
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
          },
          canExchange: orderData.canExchange ?? false,
          exchange: orderData.exchange || null,
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
      })

      // ============ EXCHANGE ORDER ============
      .addCase(exchangeOrder.pending, (state) => {
        state.exchangeLoading = true;
        state.exchangeSuccess = false;
        state.error = null;
      })
      .addCase(exchangeOrder.fulfilled, (state, action) => {
        state.exchangeLoading = false;
        state.exchangeSuccess = true;

        const orderId = action.meta.arg.orderId;
        const exchangeData = action.payload.data?.exchange;

        if (state.orders.length > 0) {
          const index = state.orders.findIndex(
            (o) => o.id === orderId || o._id === orderId
          );
          if (index !== -1) {
            state.orders[index].status = "EXCHANGE_REQUESTED";
            state.orders[index].exchange = exchangeData;
          }
        }

        if (state.currentOrder) {
          const currentOrderId =
            state.currentOrder._id || state.currentOrder.id;
          if (currentOrderId === orderId) {
            state.currentOrder.status = "EXCHANGE_REQUESTED";
            state.currentOrder.exchange = exchangeData;
            state.currentOrder.canExchange = false;
          }
        }
      })
      .addCase(exchangeOrder.rejected, (state, action) => {
        state.exchangeLoading = false;
        state.exchangeSuccess = false;
        state.error = action.payload || "Failed to submit exchange request";
      })

      // ============ PREVIEW EXCHANGE ============
      .addCase(previewExchangeOrder.pending, (state) => {
        state.exchangePreviewLoading = true;
        state.error = null;
      })
      .addCase(previewExchangeOrder.fulfilled, (state, action) => {
        state.exchangePreviewLoading = false;
        state.exchangePreview = action.payload;
      })
      .addCase(previewExchangeOrder.rejected, (state, action) => {
        state.exchangePreviewLoading = false;
        state.exchangePreview = null;
        state.error = action.payload;
      });
  },
});

// ============ EXPORT ACTIONS & REDUCER ============
export const { 
  clearOrderError, 
  clearCancelStatus,
  clearExchangeStatus,
  clearExchangePreview,
  resetOrderState 
} = orderSlice.actions;

export default orderSlice.reducer;