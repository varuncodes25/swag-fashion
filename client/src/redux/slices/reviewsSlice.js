import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-reviews/${productId}`,
      );

      if (res.data.success) {
        return { productId, reviews: res.data.data || [] };
      }
      return rejectWithValue(res.data.message || 'Failed to fetch reviews');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchReviewEligibility = createAsyncThunk(
  'reviews/fetchReviewEligibility',
  async (productId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { productId, canReview: false, reason: 'login' };
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/review-eligibility/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        return {
          productId,
          canReview: Boolean(res.data.data?.canReview),
          reason: res.data.data?.reason || null,
        };
      }
      return rejectWithValue(res.data.message || 'Failed to check eligibility');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('review', reviewData.review);
      formData.append('rating', reviewData.rating);
      formData.append('productId', reviewData.productId);

      if (reviewData.images?.length > 0) {
        reviewData.images.forEach((img) => {
          if (img.file) formData.append('images', img.file);
        });
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/create-review`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (res.data.success) {
        return {
          productId: reviewData.productId,
          review: res.data.data,
        };
      }
      return rejectWithValue(res.data.message || 'Failed to create review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, updateData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/update-review/${reviewId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || 'Failed to update review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/delete-review/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      if (res.data.success) return reviewId;
      return rejectWithValue(res.data.message || 'Failed to delete review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const addReply = createAsyncThunk(
  'reviews/addReply',
  async ({ reviewId, replyData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/reply-review/${reviewId}`,
        replyData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || 'Failed to add reply');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    productId: null,
    loading: false,
    error: null,
    eligibility: {
      loading: false,
      canReview: false,
      reason: null,
    },
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.productId = null;
      state.error = null;
      state.eligibility = {
        loading: false,
        canReview: false,
        reason: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state, action) => {
        const nextId = action.meta.arg;
        if (state.productId !== nextId) {
          state.reviews = [];
        }
        state.productId = nextId;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productId = action.payload.productId;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchReviewEligibility.pending, (state) => {
        state.eligibility.loading = true;
      })
      .addCase(fetchReviewEligibility.fulfilled, (state, action) => {
        state.eligibility.loading = false;
        state.eligibility.canReview = action.payload.canReview;
        state.eligibility.reason = action.payload.reason;
      })
      .addCase(fetchReviewEligibility.rejected, (state) => {
        state.eligibility.loading = false;
        state.eligibility.canReview = false;
        state.eligibility.reason = 'error';
      });

    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = [action.payload.review, ...state.reviews];
        state.eligibility.canReview = false;
        state.eligibility.reason = 'already_reviewed';
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const index = state.reviews.findIndex((r) => r._id === updatedReview._id);
        if (index !== -1) state.reviews[index] = updatedReview;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addReply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const index = state.reviews.findIndex((r) => r._id === updatedReview._id);
        if (index !== -1) state.reviews[index] = updatedReview;
      })
      .addCase(addReply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
