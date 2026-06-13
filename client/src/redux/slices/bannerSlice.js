import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/api/axiosConfig';

const BANNERS_BASE = '/banners';

export const fetchBanners = createAsyncThunk(
  'banner/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${BANNERS_BASE}/active`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createBanner = createAsyncThunk(
  'banner/createBanner',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(BANNERS_BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateBanner = createAsyncThunk(
  'banner/updateBanner',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`${BANNERS_BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteBanner = createAsyncThunk(
  'banner/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${BANNERS_BASE}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  banners: [],
  currentBanner: null,
  loading: false,
  error: null,
  success: false,
};

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentBanner: (state, action) => {
      state.currentBanner = action.payload;
    },
    clearBanners: (state) => {
      state.banners = [];
      state.currentBanner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
        state.success = true;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch banners';
      })
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.unshift(action.payload);
        state.success = true;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create banner';
      })
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update banner';
      })
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter((b) => b._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete banner';
      });
  },
});

export const { clearError, clearSuccess, setCurrentBanner, clearBanners } = bannerSlice.actions;
export default bannerSlice.reducer;
