import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/axiosConfig";

// ============ AUTHENTICATION THUNKS ============

// 1. SIGNUP - FIXED
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/signup", userData);
      return response.data;
    } catch (error) {
      // ✅ Return complete error object from backend
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Registration failed",
        errors: errorData.errors || {}  // Field-specific errors
      });
    }
  }
);

// 2. LOGIN - FIXED
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/login", credentials);
      console.log("🔑 Login response:", response.data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Login failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 3. VERIFY EMAIL - FIXED
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/verify-email/${token}`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Email verification failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 4. REFRESH TOKEN - FIXED
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await apiClient.post("/refresh-token", { refreshToken });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Token refresh failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 5. LOGOUT - FIXED
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (deviceId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(
        "/logout",
        { deviceId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Clear localStorage
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("deviceId");
      
      return response.data;
    } catch (error) {
      // Still clear localStorage even if API fails
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Logout failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 6. FORGOT PASSWORD - FIXED
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to send reset email",
        errors: errorData.errors || {}
      });
    }
  }
);

// 7. RESET PASSWORD - FIXED
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Password reset failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 8. CHANGE PASSWORD - FIXED
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.put(
        "/change-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Password change failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 9. GET PROFILE - FIXED
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to fetch profile",
        errors: errorData.errors || {}
      });
    }
  }
);

// 10. UPDATE PROFILE - FIXED
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.put("/profile", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Profile update failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 11. TOGGLE WISHLIST - FIXED
export const toggleWishlist = createAsyncThunk(
  "auth/toggleWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(`/wishlist/${productId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to update wishlist",
        errors: errorData.errors || {}
      });
    }
  }
);

// 12. GET SESSIONS - FIXED
export const getSessions = createAsyncThunk(
  "auth/getSessions",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get("/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to fetch sessions",
        errors: errorData.errors || {}
      });
    }
  }
);

// 13. REQUEST OTP - FIXED
export const requestOTP = createAsyncThunk(
  "auth/requestOTP",
  async ({ email, phone }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(
        "/request-otp",
        { email, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to send OTP",
        errors: errorData.errors || {}
      });
    }
  }
);

// 14. VERIFY OTP - FIXED
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (otp, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(
        "/verify-otp",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "OTP verification failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// ============ ADMIN THUNKS ============

// 15. ADMIN SIGNUP - FIXED
export const adminSignup = createAsyncThunk(
  "auth/adminSignup",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/signup", adminData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Admin signup failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 16. ADMIN LOGIN - FIXED
export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/login", credentials);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Admin login failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 17. ADMIN REFRESH TOKEN - FIXED
export const adminRefreshToken = createAsyncThunk(
  "auth/adminRefreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("adminRefreshToken");
      const response = await apiClient.post("/admin/refresh-token", { refreshToken });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Admin token refresh failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// 18. ADMIN LOGOUT - FIXED
export const adminLogout = createAsyncThunk(
  "auth/adminLogout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.post(
        "/admin/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
      
      return response.data;
    } catch (error) {
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
      
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Admin logout failed",
        errors: errorData.errors || {}
      });
    }
  }
);

// ============ SLICE INITIAL STATE ============

const initialState = {
  // User auth state
  role: localStorage.getItem("role") || "",
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  isAuthenticated: !!localStorage.getItem("token"),
  
  // Admin auth state
  adminRole: localStorage.getItem("adminRole") || "",
  adminUser: JSON.parse(localStorage.getItem("adminUser")) || null,
  adminToken: localStorage.getItem("adminToken") || "",
  adminRefreshToken: localStorage.getItem("adminRefreshToken") || "",
  isAdminAuthenticated: !!localStorage.getItem("adminToken"),
  
  // Profile data
  profile: null,
  sessions: [],
  wishlist: [],
  
  // Loading states
  loading: false,
  error: null,
  message: "",
  success: false,
  
  // ✅ NEW: Field-specific errors
  fieldErrors: {},
  
  // Auth specific loading states
  signupLoading: false,
  signupError: null,
  signupSuccess: false,
  
  loginLoading: false,
  loginError: null,
  
  adminSignupLoading: false,
  adminSignupError: null,
  
  adminLoginLoading: false,
  adminLoginError: null,
  
  // Password states
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,
  
  resetPasswordLoading: false,
  resetPasswordSuccess: false,
  resetPasswordError: null,
  
  changePasswordLoading: false,
  changePasswordError: null,
  changePasswordSuccess: false,
  
  // OTP states
  otpLoading: false,
  otpSent: false,
  otpVerified: false,
  otpError: null,
  
  // Profile states
  profileLoading: false,
  profileError: null,
  profileUpdateLoading: false,
  profileUpdateSuccess: false,
  
  // Wishlist states
  wishlistLoading: false,
  wishlistError: null,
  
  // Sessions states
  sessionsLoading: false,
  sessionsError: null,
  
  // Email verification
  emailVerified: false,
  emailVerificationLoading: false,
  emailVerificationError: null,
};

// ============ SLICE ============

const authSlice = createSlice({
  name: "auth",
  initialState,
  
  reducers: {
    // Manual login setter
    setUserLogin: (state, action) => {
      state.role = action.payload.user?.role || "";
      state.user = action.payload.user || null;
      state.token = action.payload.token || "";
      state.refreshToken = action.payload.refreshToken || "";
      state.isAuthenticated = true;

      localStorage.setItem("role", state.role);
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("token", state.token);
      if (state.refreshToken) {
        localStorage.setItem("refreshToken", state.refreshToken);
      }
    },

    // Manual admin login setter
    setAdminLogin: (state, action) => {
      state.adminRole = action.payload.admin?.role || "";
      state.adminUser = action.payload.admin || null;
      state.adminToken = action.payload.token || "";
      state.adminRefreshToken = action.payload.refreshToken || "";
      state.isAdminAuthenticated = true;

      localStorage.setItem("adminRole", state.adminRole);
      localStorage.setItem("adminUser", JSON.stringify(state.adminUser));
      localStorage.setItem("adminToken", state.adminToken);
      if (state.adminRefreshToken) {
        localStorage.setItem("adminRefreshToken", state.adminRefreshToken);
      }
    },

    // Manual logout
    setUserLogout: (state) => {
      state.role = "";
      state.user = null;
      state.token = "";
      state.refreshToken = "";
      state.isAuthenticated = false;
      state.profile = null;
      state.sessions = [];
      state.wishlist = [];

      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },

    // Manual admin logout
    setAdminLogout: (state) => {
      state.adminRole = "";
      state.adminUser = null;
      state.adminToken = "";
      state.adminRefreshToken = "";
      state.isAdminAuthenticated = false;

      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
    },

    // Clear all errors
    clearAuthError: (state) => {
      state.error = null;
      state.fieldErrors = {};
      state.signupError = null;
      state.loginError = null;
      state.adminSignupError = null;
      state.adminLoginError = null;
      state.forgotPasswordError = null;
      state.resetPasswordError = null;
      state.changePasswordError = null;
      state.otpError = null;
      state.profileError = null;
      state.wishlistError = null;
      state.sessionsError = null;
      state.emailVerificationError = null;
      state.message = "";
    },

    // Clear specific states
    clearSignupState: (state) => {
      state.signupLoading = false;
      state.signupError = null;
      state.signupSuccess = false;
      state.fieldErrors = {};
    },

    clearLoginState: (state) => {
      state.loginLoading = false;
      state.loginError = null;
      state.fieldErrors = {};
    },

    clearPasswordState: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordError = null;
      state.resetPasswordLoading = false;
      state.resetPasswordSuccess = false;
      state.resetPasswordError = null;
      state.changePasswordLoading = false;
      state.changePasswordSuccess = false;
      state.changePasswordError = null;
      state.fieldErrors = {};
    },

    clearOTPState: (state) => {
      state.otpLoading = false;
      state.otpSent = false;
      state.otpVerified = false;
      state.otpError = null;
      state.fieldErrors = {};
    },

    // Update user in state
    updateUserState: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Update wishlist locally
    updateWishlistLocal: (state, action) => {
      state.wishlist = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // ============ SIGNUP ============
      .addCase(signupUser.pending, (state) => {
        state.signupLoading = true;
        state.signupError = null;
        state.signupSuccess = false;
        state.fieldErrors = {};
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.signupLoading = false;
        state.signupSuccess = true;
        state.loading = false;
        state.message = action.payload.message || "Registration successful!";
        state.fieldErrors = {};

        if (action.payload.data?.token) {
          state.role = action.payload.data.user?.role || "";
          state.user = action.payload.data.user || null;
          state.token = action.payload.data.token;
          state.refreshToken = action.payload.data.refreshToken || "";
          state.isAuthenticated = true;

          localStorage.setItem("role", state.role);
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", state.token);
          if (state.refreshToken) {
            localStorage.setItem("refreshToken", state.refreshToken);
          }
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupLoading = false;
        state.signupError = action.payload?.message || "Registration failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ LOGIN ============
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
        state.fieldErrors = {};
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loading = false;
        state.message = action.payload.message || "Login successful!";
        state.fieldErrors = {};

        const data = action.payload.data || {};
        state.role = data.user?.role || "";
        state.user = data.user || null;
        state.token = data.token || "";
        state.refreshToken = data.refreshToken || "";
        state.isAuthenticated = true;

        localStorage.setItem("role", state.role);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem("token", state.token);
        if (state.refreshToken) {
          localStorage.setItem("refreshToken", state.refreshToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload?.message || "Login failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ VERIFY EMAIL ============
      .addCase(verifyEmail.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
        state.emailVerified = false;
        state.fieldErrors = {};
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerified = true;
        state.message = action.payload.message || "Email verified successfully!";
        state.fieldErrors = {};
        
        if (state.user) {
          state.user.isEmailVerified = true;
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = action.payload?.message || "Email verification failed";
        state.fieldErrors = action.payload?.errors || {};
        state.emailVerified = false;
        state.error = action.payload?.message;
      })

      // ============ REFRESH TOKEN ============
      .addCase(refreshToken.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        state.token = data.token;
        state.refreshToken = data.refreshToken;
        localStorage.setItem("token", state.token);
        localStorage.setItem("refreshToken", state.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.token = "";
        state.refreshToken = "";
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })

      // ============ LOGOUT ============
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.role = "";
        state.user = null;
        state.token = "";
        state.refreshToken = "";
        state.isAuthenticated = false;
        state.profile = null;
        state.sessions = [];
        state.wishlist = [];
        state.loading = false;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(logoutUser.rejected, (state) => {
        state.role = "";
        state.user = null;
        state.token = "";
        state.refreshToken = "";
        state.isAuthenticated = false;
        state.profile = null;
        state.sessions = [];
        state.wishlist = [];
        state.loading = false;
      })

      // ============ FORGOT PASSWORD ============
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
        state.fieldErrors = {};
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.message = action.payload.message || "Reset email sent!";
        state.fieldErrors = {};
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload?.message || "Failed to send reset email";
        state.fieldErrors = action.payload?.errors || {};
        state.error = action.payload?.message;
      })

      // ============ RESET PASSWORD ============
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
        state.fieldErrors = {};
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
        state.message = action.payload.message || "Password reset successfully!";
        state.fieldErrors = {};
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload?.message || "Password reset failed";
        state.fieldErrors = action.payload?.errors || {};
        state.error = action.payload?.message;
      })

      // ============ CHANGE PASSWORD ============
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
        state.fieldErrors = {};
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = true;
        state.loading = false;
        state.message = action.payload.message || "Password updated successfully";
        state.fieldErrors = {};
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload?.message || "Password change failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ GET PROFILE ============
      .addCase(getProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
        state.fieldErrors = {};
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.loading = false;
        state.profile = action.payload.data || action.payload;
        state.fieldErrors = {};
        
        if (action.payload.data?.user) {
          state.user = { ...state.user, ...action.payload.data.user };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload?.message || "Failed to fetch profile";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
      })

      // ============ UPDATE PROFILE ============
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.profileError = null;
        state.fieldErrors = {};
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileUpdateSuccess = true;
        state.loading = false;
        state.message = action.payload.message || "Profile updated successfully";
        state.fieldErrors = {};
        
        if (action.payload.data?.user) {
          state.user = { ...state.user, ...action.payload.data.user };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
        if (action.payload.data?.profile) {
          state.profile = action.payload.data.profile;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileError = action.payload?.message || "Profile update failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ TOGGLE WISHLIST ============
      .addCase(toggleWishlist.pending, (state) => {
        state.wishlistLoading = true;
        state.wishlistError = null;
        state.fieldErrors = {};
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlistLoading = false;
        state.wishlist = action.payload.data?.wishlist || action.payload.wishlist || [];
        state.message = action.payload.message || "Wishlist updated";
        state.fieldErrors = {};
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.wishlistLoading = false;
        state.wishlistError = action.payload?.message || "Failed to update wishlist";
        state.fieldErrors = action.payload?.errors || {};
        state.error = action.payload?.message;
      })

      // ============ GET SESSIONS ============
      .addCase(getSessions.pending, (state) => {
        state.sessionsLoading = true;
        state.sessionsError = null;
        state.fieldErrors = {};
      })
      .addCase(getSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = action.payload.data?.sessions || action.payload.sessions || action.payload || [];
        state.fieldErrors = {};
      })
      .addCase(getSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError = action.payload?.message || "Failed to fetch sessions";
        state.fieldErrors = action.payload?.errors || {};
        state.error = action.payload?.message;
      })

      // ============ REQUEST OTP ============
      .addCase(requestOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
        state.otpSent = false;
        state.fieldErrors = {};
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.message = action.payload.message || "OTP sent successfully";
        state.fieldErrors = {};
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload?.message || "Failed to send OTP";
        state.fieldErrors = action.payload?.errors || {};
        state.error = action.payload?.message;
      })

      // ============ VERIFY OTP ============
      .addCase(verifyOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
        state.otpVerified = false;
        state.fieldErrors = {};
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpVerified = true;
        state.message = action.payload.message || "OTP verified successfully";
        state.fieldErrors = {};
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload?.message || "OTP verification failed";
        state.fieldErrors = action.payload?.errors || {};
        state.otpVerified = false;
        state.error = action.payload?.message;
      })

      // ============ ADMIN SIGNUP ============
      .addCase(adminSignup.pending, (state) => {
        state.adminSignupLoading = true;
        state.adminSignupError = null;
        state.fieldErrors = {};
      })
      .addCase(adminSignup.fulfilled, (state, action) => {
        state.adminSignupLoading = false;
        state.message = action.payload.message || "Admin created successfully";
        state.fieldErrors = {};
      })
      .addCase(adminSignup.rejected, (state, action) => {
        state.adminSignupLoading = false;
        state.adminSignupError = action.payload?.message || "Admin signup failed";
        state.fieldErrors = action.payload?.errors || {};
        state.error = action.payload?.message;
      })

      // ============ ADMIN LOGIN ============
      .addCase(adminLogin.pending, (state) => {
        state.adminLoginLoading = true;
        state.adminLoginError = null;
        state.fieldErrors = {};
        state.loading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.adminLoginLoading = false;
        state.loading = false;
        state.message = action.payload.message || "Admin login successful!";
        state.fieldErrors = {};

        const data = action.payload.data || {};
        state.adminRole = data.user?.role || "";
        state.adminUser = data.user || null;
        state.adminToken = data.token || "";
        state.adminRefreshToken = data.refreshToken || "";
        state.isAdminAuthenticated = true;

        localStorage.setItem("adminRole", state.adminRole);
        localStorage.setItem("adminUser", JSON.stringify(state.adminUser));
        localStorage.setItem("adminToken", state.adminToken);
        if (state.adminRefreshToken) {
          localStorage.setItem("adminRefreshToken", state.adminRefreshToken);
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.adminLoginLoading = false;
        state.adminLoginError = action.payload?.message || "Admin login failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ ADMIN REFRESH TOKEN ============
      .addCase(adminRefreshToken.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        state.adminToken = data.token;
        state.adminRefreshToken = data.refreshToken;
        localStorage.setItem("adminToken", state.adminToken);
        localStorage.setItem("adminRefreshToken", state.adminRefreshToken);
      })
      .addCase(adminRefreshToken.rejected, (state) => {
        state.adminToken = "";
        state.adminRefreshToken = "";
        state.isAdminAuthenticated = false;
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
      })

      // ============ ADMIN LOGOUT ============
      .addCase(adminLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminRole = "";
        state.adminUser = null;
        state.adminToken = "";
        state.adminRefreshToken = "";
        state.isAdminAuthenticated = false;
        state.loading = false;
        state.fieldErrors = {};
      })
      .addCase(adminLogout.rejected, (state) => {
        state.adminRole = "";
        state.adminUser = null;
        state.adminToken = "";
        state.adminRefreshToken = "";
        state.isAdminAuthenticated = false;
        state.loading = false;
      });
  },
});

// ============ EXPORTS ============

export const {
  setUserLogin,
  setAdminLogin,
  setUserLogout,
  setAdminLogout,
  clearAuthError,
  clearSignupState,
  clearLoginState,
  clearPasswordState,
  clearOTPState,
  updateUserState,
  updateWishlistLocal,
} = authSlice.actions;

export default authSlice.reducer;