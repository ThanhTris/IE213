import axios from "axios";
import { toast } from "sonner";

const resolveApiRoot = () => {
  const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!configured) return "/api";

  const withoutTrailingSlash = configured.replace(/\/+$/, "");
  return /\/api$/i.test(withoutTrailingSlash)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const API_ROOT = resolveApiRoot();

const apiClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Auth Token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bw_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for common error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If unauthorized (401), logout and redirect to login
    if (error.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("bw_auth_token");
      // Only redirect if not already on the auth page to avoid loops
      if (!window.location.pathname.startsWith("/auth")) {
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      }
    }

    const message = error.response?.data?.message || "Lỗi kết nối máy chủ";
    // We don't show a global toast here for EVERY error to avoid double-toasts in components,
    // but we ensure the error is passed back correctly.
    return Promise.reject(error.response?.data || { message });
  }
);

export default apiClient;
