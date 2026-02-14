// redux/slices/checkoutSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/axiosConfig";  // ✅ Import apiClient

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* =====================================================
   ASYNC THUNKS
===================================================== */

/* 1️⃣ INIT CHECKOUT (PREVIEW ONLY) */
export const initCheckout = createAsyncThunk(
  "checkout/init",
  async (
    {
      productId,
      variantId,
      qty,
      addressId,
      checkoutType = "PRODUCT",
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();

      if (checkoutType === "PRODUCT" && productId) {
        params.append("productId", productId);

        if (variantId) {
          params.append("variantId", variantId);
        } else {
          console.warn("⚠️ variantId missing for PRODUCT checkout");
        }

        params.append("qty", qty || 1);
        params.append("addressId", addressId);
      } else if (checkoutType === "CART") {
        params.append("checkoutType", "CART");
        params.append("addressId", addressId);
      }

      if (addressId) {
        params.append("addressId", addressId);
      }

      console.log("🔄 initCheckout API Call:", {
        url: `/checkout/init?${params.toString()}`,
        params: Object.fromEntries(params.entries()),
        hasVariantId: !!variantId,
      });

      // ✅ USE APICLIENT
      const res = await apiClient.get(`/checkout/init?${params.toString()}`);

      return {
        ...res.data,
        checkoutType,
      };
    } catch (err) {
      console.error("❌ initCheckout error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Checkout init failed",
      );
    }
  },
);

/* 2️⃣ FETCH ADDRESSES */
export const fetchAddresses = createAsyncThunk(
  "checkout/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ USE APICLIENT
      const res = await apiClient.get("/addresses");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load addresses",
      );
    }
  },
);

/* 3️⃣ CREATE ADDRESS */
export const createAddress = createAsyncThunk(
  "checkout/createAddress",
  async (data, { rejectWithValue }) => {
    try {
      // ✅ USE APICLIENT
      const res = await apiClient.post("/addresses", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add address",
      );
    }
  },
);

/* 4️⃣ UPDATE ADDRESS */
export const updateAddress = createAsyncThunk(
  "checkout/updateAddress",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // ✅ USE APICLIENT
      const res = await apiClient.put(`/addresses/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update address",
      );
    }
  },
);

/* 5️⃣ DELETE ADDRESS */
export const deleteAddress = createAsyncThunk(
  "checkout/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      // ✅ USE APICLIENT
      await apiClient.delete(`/addresses/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete address",
      );
    }
  },
);

/* 6️⃣ APPLY COUPON */
export const applyCoupon = createAsyncThunk(
  "checkout/applyCoupon",
  async (code, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { productId, qty } = state.checkout;

      const params = new URLSearchParams();
      if (productId) {
        params.append("productId", productId);
        params.append("qty", qty || 1);
      }

      // ✅ USE APICLIENT
      const res = await apiClient.post(
        `/coupons/apply?${params.toString()}`,
        { code }
      );

      return {
        code,
        summary: res.data.summary,
        discount: res.data.discount || 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid coupon");
    }
  },
);

/* 7️⃣ PLACE COD ORDER */
export const placeCodOrder = createAsyncThunk(
  "checkout/placeCodOrder",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { addressId, productId, qty, summary, variantId } = state.checkout;

      if (!addressId) {
        return rejectWithValue("Address is required");
      }
      
      const shippingInfo = summary.shippingInfo;
      if (!shippingInfo?.courierId) {
        return rejectWithValue("Shipping info missing. Please re-checkout.");
      }

      // ✅ USE APICLIENT
      const payload = productId
        ? {
            addressId,
            productId,
            quantity: qty || 1,
            variantId,
            shippingMeta: {
              courierId: shippingInfo.courierId,
            },
          }
        : {
            addressId,
            shippingMeta: {
              courierId: shippingInfo.courierId,
            },
          };

      const res = await apiClient.post("/orders/create", payload);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to place COD order",
      );
    }
  },
);

/* 8️⃣ CREATE RAZORPAY ORDER (Payment Initiation) */
export const createRazorpayOrder = createAsyncThunk(
  "checkout/createRazorpayOrder",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const {
        addressId,
        productId,
        variantId,
        qty,
        summary,
      } = state.checkout;

      console.log("🔄 createRazorpayOrder thunk:", {
        addressId,
        productId,
        variantId,
        qty,
        totalAmount: summary?.total,
      });

      if (!addressId) {
        throw new Error("Address is required");
      }

      if (productId && !variantId) {
        throw new Error("Variant ID is required for Buy Now");
      }

      // ✅ USE APICLIENT
      const res = await apiClient.post("/generate-payment", {
        addressId,
        productId,
        variantId,
        quantity: qty || 1,
      });

      console.log("✅ Razorpay order created:", {
        razorpayOrderId: res.data.razorpayOrderId,
        amount: res.data.amount,
        success: res.data.success,
      });

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      return res.data;
    } catch (err) {
      console.error("❌ createRazorpayOrder error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to create payment order",
      );
    }
  },
);

/* 9️⃣ VERIFY RAZORPAY PAYMENT & CREATE FINAL ORDER */
export const verifyRazorpayPayment = createAsyncThunk(
  "checkout/verifyPayment",
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const {
        addressId,
        productId,
        variantId,
        qty,
      } = state.checkout;

      console.log("🔍 verifyRazorpayPayment called:", {
        razorpayOrderId: paymentData.razorpay_order_id,
        productId,
        variantId,
        qty,
        addressId,
      });

      // ✅ USE APICLIENT
      const res = await apiClient.post("/verify-payment", {
        ...paymentData,
        addressId,
        productId,
        variantId,
        quantity: qty || 1,
      });

      console.log("✅ Payment verified:", res.data);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      return res.data;
    } catch (err) {
      console.error("❌ verifyRazorpayPayment error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Payment verification failed",
      );
    }
  },
);

/* =====================================================
   SLICE
===================================================== */

const checkoutSlice = createSlice({
  name: "checkout",

  initialState: {
    /* PREVIEW DATA */
    items: [],
    summary: {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    },

    /* CHECKOUT TYPE */
    productId: null,
    qty: 1,
    variantId: null,

    /* ADDRESS */
    addresses: [],
    addressId: null,

    /* PAYMENT */
    paymentMethod: "COD",

    /* COUPON */
    coupon: null,
    appliedCoupon: null,

    /* PAYMENT DATA */
    razorpayOrder: null,

    /* ORDER RESULT */
    placedOrder: null,

    /* UI */
    loading: false,
    error: null,
  },

  reducers: {
    setAddress(state, action) {
      state.addressId = action.payload;
    },

    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },

    setProductId(state, action) {
      state.productId = action.payload;
    },

    setQuantity(state, action) {
      state.qty = action.payload;
    },

    setVariantId(state, action) {
      state.variantId = action.payload;
    },

    setRazorpayOrder(state, action) {
      state.razorpayOrder = action.payload;
    },

    clearCoupon(state) {
      state.coupon = null;
      state.appliedCoupon = null;
    },

    resetCheckout() {
      return checkoutSlice.getInitialState();
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* INIT CHECKOUT */
      .addCase(initCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        
        if (action.payload.variantId) {
          state.variantId = action.payload.items[0]?.variantId;
        }
      })
      .addCase(initCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH ADDRESSES */
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state) => {
        state.loading = false;
      })

      /* CREATE ADDRESS */
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addresses.unshift(action.payload);
        state.addressId = action.payload._id;
      })

      /* UPDATE ADDRESS */
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(
          (addr) => addr._id === action.payload._id,
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })

      /* DELETE ADDRESS */
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload,
        );
        if (state.addressId === action.payload) {
          state.addressId = state.addresses[0]?._id || null;
        }
      })

      /* APPLY COUPON */
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = { code: action.payload.code };
        state.appliedCoupon = action.payload.code;
        state.summary = action.payload.summary;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* PLACE COD ORDER */
      .addCase(placeCodOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeCodOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.placedOrder = {
          id: action.payload.orderId,
          paymentMethod: "COD",
          totalAmount: action.payload.totalAmount || state.summary.total,
        };
      })
      .addCase(placeCodOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE RAZORPAY ORDER */
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = {
          id: action.payload.razorpayOrderId,
          amount: action.payload.amount,
          key: action.payload.key,
        };
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* VERIFY RAZORPAY PAYMENT */
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.placedOrder = {
          id: action.payload.orderId,
          paymentMethod: "RAZORPAY",
          totalAmount: action.payload.totalAmount || state.summary.total,
        };
        state.razorpayOrder = null;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.razorpayOrder = null;
      });
  },
});

export const {
  setAddress,
  setPaymentMethod,
  setProductId,
  setQuantity,
  setRazorpayOrder,
  clearCoupon,
  resetCheckout,
  clearError,
  setVariantId
} = checkoutSlice.actions;

export default checkoutSlice.reducer;