import axios from "axios";
import { CareerEncrypt, CareerDecrypt } from "../utils/crypto";

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============ TOKEN REFRESH LOGIC ============
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============ LOGOUT FUNCTION ============

const logout = () => {
  console.log("🚪 Logging out user...");

  // Clear storage
  localStorage.clear();
  sessionStorage.clear();

  // ✅ Event dispatch karo (Redux ko batane ke liye)
  window.dispatchEvent(new CustomEvent("auth:logout"));

  // Redirect
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// ============ REFRESH TOKEN FUNCTION ============
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    console.log("❌ No refresh token found");
     logout();
    throw new Error("No refresh token available");
  }
  
  try {
    console.log("🔄 Refreshing access token...");
    
    // Create separate axios instance to avoid interceptor loop
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      { refreshToken },
      { 
        headers: { 
          "Content-Type": "application/json" 
        } 
      }
    );
    
    // Handle decrypted response
    let data = response.data;
    
    // Check if response is encrypted
    if (typeof data === "string") {
      data = await CareerDecrypt(data);
    }
    if (data?.data && typeof data.data === "string") {
      data = await CareerDecrypt(data.data);
    }
    if (data?.encryptedData) {
      data = await CareerDecrypt(data.encryptedData);
    }
    
    // Extract tokens
    let newToken = null;
    let newRefreshToken = null;
    
    if (data?.data) {
      newToken = data.data.token || data.data.accessToken;
      newRefreshToken = data.data.refreshToken;
    } else if (data?.token) {
      newToken = data.token;
      newRefreshToken = data.refreshToken;
    }
    
    if (newToken) {
      localStorage.setItem("token", newToken);
      console.log("✅ Access token refreshed successfully");
    }
    
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
    
    return newToken;
    
  } catch (error) {
    console.error("❌ Refresh token failed:", error.response?.status);
    
    // Refresh token expired or invalid - logout user
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 400) {
      logout();
    }
    
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============
const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "web-" + Date.now() + "-" + Math.random().toString(36).substring(2);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

// ============ REQUEST INTERCEPTOR ============
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add device info
    config.headers["device-id"] = getDeviceId();
    config.headers["platform"] = "web";
    config.headers["timestamp"] = Date.now().toString();

    // Encrypt request data
    const shouldEncrypt = import.meta.env.VITE_ENCRYPT_REQUEST === "true";
  
    if (shouldEncrypt && config.data && config.method !== "get") {
      try {
        const encryptedData = await CareerEncrypt(config.data);
        config.data = { encryptedData };
        config.headers["X-Encrypted"] = "true";
      } catch (error) {
        console.error("❌ Encryption failed:", error);
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ============ RESPONSE INTERCEPTOR - WITH TOKEN REFRESH ============
apiClient.interceptors.response.use(
  async (response) => {
    // Decryption logic
    const shouldEncrypt = true;
    
    if (shouldEncrypt && response.data) {
      // Case 1: Direct encrypted data
      if (typeof response.data === "string") {
        try {
          const decryptedData = await CareerDecrypt(response.data);
          response.data = decryptedData;
        } catch (error) {
          console.error("❌ Decryption failed:", error);
        }
      }
      // Case 2: { data: "encrypted-string" }
      else if (response.data.data && typeof response.data.data === "string") {
        try {
          const decryptedData = await CareerDecrypt(response.data.data);
          response.data = decryptedData;
        } catch (error) {
          console.error("❌ Decryption failed:", error);
        }
      }
      // Case 3: { encryptedData: "encrypted-string" }
      else if (response.data.encryptedData) {
        try {
          const decryptedData = await CareerDecrypt(response.data.encryptedData);
          response.data = decryptedData;
        } catch (error) {
          console.error("❌ Decryption failed:", error);
        }
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log("🔴 Error status:", error.response?.status);
    console.log("🔴 Error message:", error.response?.data?.message);
    
    // ✅ Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Process queued requests
          processQueue(null, newToken);
          
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error("No token received");
        }
        
      } catch (refreshError) {
        console.error("❌ Refresh failed, logging out...");
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }
    
    // ✅ Handle 403 Forbidden
    if (error.response?.status === 403) {
      logout();
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;