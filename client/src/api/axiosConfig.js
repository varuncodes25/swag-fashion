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
    console.log("🚀 REQUEST:", config.method.toUpperCase(), config.url);
    console.log("📤 REQUEST DATA:", config.data);
    
    // ✅ Add auth token
    const token = localStorage.getItem("token");
    console.log("🔑 Token from localStorage:", token ? "Present" : "Not present");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Add device info
    config.headers["device-id"] = getDeviceId();
    config.headers["platform"] = "web";
    config.headers["timestamp"] = Date.now().toString();

    // ✅ Encrypt request data
    const shouldEncrypt = import.meta.env.VITE_ENCRYPT_REQUEST === "true";
    console.log("🔐 Encryption enabled:", shouldEncrypt);
    
    if (shouldEncrypt && config.data && config.method !== "get") {
      try {
        console.log("🔒 Encrypting data:", config.data);
        const encryptedData = await CareerEncrypt(config.data);
        console.log("🔒 Encrypted result:", encryptedData);
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
    console.log("✅ RESPONSE:", response.status, response.config.url);
    console.log("📥 RAW RESPONSE DATA:", response.data);
    
    // ✅ DECRYPTION ENABLE KARO
    const shouldEncrypt = true;  // 👈 TRUE KARO
    
    if (shouldEncrypt && response.data) {
      // Case 1: Direct encrypted data
      if (typeof response.data === "string") {
        try {
          console.log("🔓 Decrypting string response...");
          const decryptedData = await CareerDecrypt(response.data);
          console.log("🔓 Decrypted data:", decryptedData);
          response.data = decryptedData;
        } catch (error) {
          console.error("❌ Decryption failed:", error);
        }
      }
      // Case 2: { data: "encrypted-string" }
      else if (response.data.data && typeof response.data.data === "string") {
        try {
          console.log("🔓 Decrypting data field...");
          const decryptedData = await CareerDecrypt(response.data.data);
          console.log("🔓 Decrypted data:", decryptedData);
          response.data = decryptedData;  // Replace entire response
        } catch (error) {
          console.error("❌ Decryption failed:", error);
        }
      }
      // Case 3: { encryptedData: "encrypted-string" }
      else if (response.data.encryptedData) {
        try {
          console.log("🔓 Decrypting encryptedData...");
          const decryptedData = await CareerDecrypt(response.data.encryptedData);
          console.log("🔓 Decrypted data:", decryptedData);
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