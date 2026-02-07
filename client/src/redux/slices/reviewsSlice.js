import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + `/get-reviews/${productId}`
      );
      
      if (res.data.success) {
        return { productId, reviews: res.data.data || [] };
      } else {
        return rejectWithValue(res.data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("review", reviewData.review);
      formData.append("rating", reviewData.rating);
      formData.append("productId", reviewData.productId);

      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((img) => {
          if (img.file) {
            formData.append("images", img.file);
          }
        });
      }

      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/create-review",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        return {
          productId: reviewData.productId,
          review: res.data.data
        };
      } else {
        return rejectWithValue(res.data.message || 'Failed to create review');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, updateData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/update-review/${reviewId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        return res.data.data;
      } else {
        return rejectWithValue(res.data.message || 'Failed to update review');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        import.meta.env.VITE_API_URL + `/delete-review/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        return reviewId;
      } else {
        return rejectWithValue(res.data.message || 'Failed to delete review');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addReply = createAsyncThunk(
  'reviews/addReply',
  async ({ reviewId, replyData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/reply-review/${reviewId}`,
        replyData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        return res.data.data;
      } else {
        return rejectWithValue(res.data.message || 'Failed to add reply');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],  // सभी reviews store करने के लिए
    loading: false,
    error: null
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Reviews
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Review
    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = [action.payload.review, ...state.reviews];
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Review
    builder
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const index = state.reviews.findIndex(r => r._id === updatedReview._id);
        if (index !== -1) {
          state.reviews[index] = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Review
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Reply
    builder
      .addCase(addReply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const index = state.reviews.findIndex(r => r._id === updatedReview._id);
        if (index !== -1) {
          state.reviews[index] = updatedReview;
        }
      })
      .addCase(addReply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReviews, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;