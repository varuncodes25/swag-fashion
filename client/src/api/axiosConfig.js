import axios from "axios";
import { CareerEncrypt } from "../utils/crypto";
import { decryptApiResponse } from "./decryptApiResponse";
import { clearUserSession } from "../utils/authStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(success);
    }
  });
  failedQueue = [];
};

function isPublicBrowsePath(pathname) {
  if (pathname === "/") return true;
  if (pathname.startsWith("/product/")) return true;
  if (pathname.startsWith("/category/")) return true;
  const publicExact = [
    "/about",
    "/contact",
    "/faq",
    "/termsandconditions",
    "/terms",
    "/privacy-policy",
    "/track-order",
    "/login",
    "/signup",
    "/forgot-password",
    "/admin/login",
    "/auth/callback",
  ];
  return publicExact.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const logout = () => {
  clearUserSession();
  window.dispatchEvent(new CustomEvent("auth:logout"));

  const path = window.location.pathname;
  if (!isPublicBrowsePath(path)) {
    window.location.href = "/login";
  }
};

const refreshAccessToken = async () => {
  try {
    let refreshBody = {};
    const headers = { "Content-Type": "application/json" };

    if (import.meta.env.VITE_ENCRYPT_REQUEST === "true") {
      refreshBody = { encryptedData: await CareerEncrypt({}) };
      headers["X-Encrypted"] = "true";
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      refreshBody,
      { headers, withCredentials: true },
    );

    await decryptApiResponse(response.data);
    return true;
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.response?.status === 400
    ) {
      logout();
    }
    throw error;
  }
};

const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "web-" + Date.now() + "-" + Math.random().toString(36).substring(2);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

apiClient.interceptors.request.use(
  async (config) => {
    config.withCredentials = true;
    config.headers["device-id"] = getDeviceId();
    config.headers["platform"] = "web";
    config.headers["timestamp"] = Date.now().toString();

    const shouldEncrypt = import.meta.env.VITE_ENCRYPT_REQUEST === "true";

    if (shouldEncrypt && config.data && config.method !== "get") {
      try {
        const encryptedData = await CareerEncrypt(config.data);
        config.data = { encryptedData };
        config.headers["X-Encrypted"] = "true";
      } catch (error) {
        console.error("Encryption failed:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

function registerDecryptInterceptor(instance) {
  instance.interceptors.response.use(
    async (response) => {
      if (response.data != null) {
        response.data = await decryptApiResponse(response.data);
      }
      return response;
    },
    async (error) => {
      if (error.response?.data != null) {
        error.response.data = await decryptApiResponse(error.response.data);
      }
      return Promise.reject(error);
    },
  );
}

registerDecryptInterceptor(apiClient);
registerDecryptInterceptor(axios);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token") &&
      !originalRequest.url?.includes("/auth/session")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();
        processQueue(null, true);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403 && !originalRequest.url?.includes("/auth/")) {
      logout();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
