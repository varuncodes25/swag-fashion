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
   
    // ✅ Add auth token
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Add device info
    config.headers["device-id"] = getDeviceId();
    config.headers["platform"] = "web";
    config.headers["timestamp"] = Date.now().toString();

    // ✅ Encrypt request data
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

// ============ RESPONSE INTERCEPTOR ============
// ============ RESPONSE INTERCEPTOR - FIXED ============
apiClient.interceptors.response.use(
  async (response) => {
    
    
    // ✅ DECRYPTION ENABLE KARO
    const shouldEncrypt = true;  // 👈 TRUE KARO
    
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
          
          response.data = decryptedData;  // Replace entire response
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
    console.error("❌ RESPONSE ERROR:", error.response?.status);
    return Promise.reject(error);
  }
);

export default apiClient;