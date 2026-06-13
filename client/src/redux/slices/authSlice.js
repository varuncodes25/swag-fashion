import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import apiClient from "../../api/axiosConfig";
import {
  extractAuthFromResponse,
  saveUserSession,
  clearUserSession,
  getCachedUser,
} from "../../utils/authStorage";

function applyUserSession(state, { user, role, message }) {
  if (!user) return false;
  state.role = role || user.role || "";
  state.user = user;
  state.isAuthenticated = true;
  state.sessionChecked = true;
  if (message) state.message = message;
  saveUserSession({ user, role: state.role });
  return true;
}

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
        errors: errorData.errors || {}, // Field-specific errors
      });
    }
  },
);

// 2. LOGIN - FIXED
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/login", credentials);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Login failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// 2b. RESTORE SESSION (HttpOnly cookie)
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/auth/session");
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Session restore failed",
      });
    }
  },
);

// 3. REFRESH TOKEN - cookie-based
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/refresh-token", {});
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Token refresh failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// 5. LOGOUT
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (deviceId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/logout", { deviceId });
      clearUserSession();
      return response.data;
    } catch (error) {
      clearUserSession();
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Logout failed",
        errors: errorData.errors || {},
      });
    }
  },
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
        errors: errorData.errors || {},
      });
    }
  },
);

// 7. RESET PASSWORD - FIXED
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Password reset failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// 8. CHANGE PASSWORD - FIXED
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/user/change-password", passwordData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Password change failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// 9. GET PROFILE - FIXED
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/users/profile");
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to fetch profile",
        errors: errorData.errors || {},
      });
    }
  },
);

// 10. UPDATE PROFILE - FIXED
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/users/profile", profileData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Profile update failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// 11. TOGGLE WISHLIST - FIXED
export const toggleWishlist = createAsyncThunk(
  "auth/toggleWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/wishlist/${productId}`, {});
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to update wishlist",
        errors: errorData.errors || {},
      });
    }
  },
);

// 12. GET SESSIONS - FIXED
export const getSessions = createAsyncThunk(
  "auth/getSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/sessions");
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to fetch sessions",
        errors: errorData.errors || {},
      });
    }
  },
);

// 13. REQUEST OTP - FIXED
export const requestOTP = createAsyncThunk(
  "auth/requestOTP",
  async ({ email, phone }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/request-otp", { email, phone });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Failed to send OTP",
        errors: errorData.errors || {},
      });
    }
  },
);

// 14. VERIFY OTP - FIXED
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (otp, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/verify-otp", { otp });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "OTP verification failed",
        errors: errorData.errors || {},
      });
    }
  },
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
        errors: errorData.errors || {},
      });
    }
  },
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
        errors: errorData.errors || {},
      });
    }
  },
);

// 17. ADMIN REFRESH TOKEN - FIXED
export const adminRefreshToken = createAsyncThunk(
  "auth/adminRefreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/refresh-token", {});
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || "Admin token refresh failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// 18. ADMIN LOGOUT - FIXED
export const adminLogout = createAsyncThunk(
  "auth/adminLogout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/logout", {});
      clearUserSession();

      return response.data;
    } catch (error) {
      clearUserSession();

      const errorData = error.response?.data || {};
      return rejectWithValue({
        message: errorData.message || error.message || "Admin logout failed",
        errors: errorData.errors || {},
      });
    }
  },
);

// ============ SLICE INITIAL STATE ============

const initialState = {
  role: localStorage.getItem("role") || "",
  user: getCachedUser(),
  isAuthenticated: false,
  sessionChecked: false,

  adminRole: "",
  adminUser: null,
  isAdminAuthenticated: false,

  // Profile data
  profile: null,  // ✅ Complete profile data (phone, addresses, etc.)
  profileLoading: false,
  profileError: null,
  profileUpdateLoading: false,
  profileUpdateSuccess: false,
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
      const { user, role, message } = extractAuthFromResponse(action.payload);
      if (!applyUserSession(state, { user, role, message })) {
        state.isAuthenticated = false;
      }
    },
    setAdminLogin: (state, action) => {
      const { user, role, message } = extractAuthFromResponse(action.payload);
      if (!user) {
        state.isAuthenticated = false;
        return;
      }
      applyUserSession(state, { user, role, message });
      state.isAdminAuthenticated = true;
      state.adminUser = user;
      state.adminRole = role || user.role || "admin";
    },

    setUserLogout: (state) => {
      state.role = "";
      state.user = null;
      state.isAuthenticated = false;
      state.sessionChecked = true;
      state.isAdminAuthenticated = false;
      state.adminRole = "";
      state.adminUser = null;
      state.profile = null;
      state.sessions = [];
      state.wishlist = [];

      clearUserSession();
    },

    setAdminLogout: (state) => {
      state.adminRole = "";
      state.adminUser = null;
      state.isAdminAuthenticated = false;
      if (state.role === "admin") {
        state.role = "";
        state.user = null;
        state.isAuthenticated = false;
      }
      clearUserSession();
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
        state.message =
          action.payload?.message ||
          action.payload?.data?.message ||
          "Registration successful!";
        state.fieldErrors = {};

        const signupAuth = extractAuthFromResponse(action.payload);
        if (signupAuth.user) {
          applyUserSession(state, signupAuth);
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
        state.fieldErrors = {};

        const auth = extractAuthFromResponse(action.payload);

        if (!auth.user) {
          state.loginError =
            "Login succeeded but user data was not received. Please try again.";
          state.isAuthenticated = false;
          state.message = state.loginError;
          return;
        }

        state.message = auth.message || "Login successful!";
        applyUserSession(state, auth);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
      
        state.loginError = action.payload?.message || "Login failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ REFRESH TOKEN ============
      .addCase(refreshToken.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.sessionChecked = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = "";
        state.sessionChecked = true;
        clearUserSession();
      })

      // ============ RESTORE SESSION ============
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionChecked = true;
        const payload = action.payload?.data || action.payload;
        if (payload?.authenticated && payload?.user) {
          applyUserSession(state, {
            user: payload.user,
            role: payload.role || payload.user?.role,
          });
          if (payload.role === "admin") {
            state.isAdminAuthenticated = true;
            state.adminUser = payload.user;
            state.adminRole = payload.role;
          }
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.role = "";
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.sessionChecked = true;
        state.isAuthenticated = false;
        state.user = null;
        state.role = "";
      })

      // ============ LOGOUT ============
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.role = "";
        state.user = null;
        state.isAuthenticated = false;
        state.sessionChecked = true;
        state.isAdminAuthenticated = false;
        state.adminRole = "";
        state.adminUser = null;
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
        state.isAuthenticated = false;
        state.sessionChecked = true;
        state.isAdminAuthenticated = false;
        state.adminRole = "";
        state.adminUser = null;
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
        state.forgotPasswordError =
          action.payload?.message || "Failed to send reset email";
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
        state.message =
          action.payload.message || "Password reset successfully!";
        state.fieldErrors = {};
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError =
          action.payload?.message || "Password reset failed";
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
        state.message =
          action.payload.message || "Password updated successfully";
        state.fieldErrors = {};
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError =
          action.payload?.message || "Password change failed";
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
        console.log("Full profile response:", action.payload);
  console.log("Profile data structure:", action.payload.data || action.payload);
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
        state.profileError =
          action.payload?.message || "Failed to fetch profile";
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
        state.message =
          action.payload.message || "Profile updated successfully";
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
        state.wishlist =
          action.payload.data?.wishlist || action.payload.wishlist || [];
        state.message = action.payload.message || "Wishlist updated";
        state.fieldErrors = {};
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.wishlistLoading = false;
        state.wishlistError =
          action.payload?.message || "Failed to update wishlist";
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
        state.sessions =
          action.payload.data?.sessions ||
          action.payload.sessions ||
          action.payload ||
          [];
        state.fieldErrors = {};
      })
      .addCase(getSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError =
          action.payload?.message || "Failed to fetch sessions";
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
        state.adminSignupError =
          action.payload?.message || "Admin signup failed";
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

        const data = action.payload.data || action.payload;
        state.adminRole = data.user?.role || "";
        state.adminUser = data.user || null;
        state.isAdminAuthenticated = true;
        applyUserSession(state, {
          user: data.user,
          role: data.user?.role || "admin",
          message: action.payload.message,
        });
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.adminLoginLoading = false;
        state.adminLoginError = action.payload?.message || "Admin login failed";
        state.fieldErrors = action.payload?.errors || {};
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ============ ADMIN REFRESH TOKEN ============
      .addCase(adminRefreshToken.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.isAdminAuthenticated = true;
      })
      .addCase(adminRefreshToken.rejected, (state) => {
        state.isAdminAuthenticated = false;
        state.isAuthenticated = false;
        state.adminRole = "";
        state.adminUser = null;
        clearUserSession();
      })

      // ============ ADMIN LOGOUT ============
      .addCase(adminLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminRole = "";
        state.adminUser = null;
        state.isAdminAuthenticated = false;
        state.isAuthenticated = false;
        state.role = "";
        state.user = null;
        state.loading = false;
        state.fieldErrors = {};
      })
      .addCase(adminLogout.rejected, (state) => {
        state.adminRole = "";
        state.adminUser = null;
        state.isAdminAuthenticated = false;
        state.isAuthenticated = false;
        state.role = "";
        state.user = null;
        state.loading = false;
      })

      .addCase(REHYDRATE, (state, action) => {
        const auth = action.payload?.auth;
        if (!auth) return;
        state.user = auth.user || getCachedUser();
        state.role = auth.role || auth.user?.role || "";
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
