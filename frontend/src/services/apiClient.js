import axios from "axios";

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
      console.warn("[API 401] Unauthorized. Initializing logout redirect...");
      localStorage.removeItem("bw_auth_token");
      // Only redirect if not already on the auth page to avoid loops
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }

    const message = error.response?.data?.message || "Lỗi kết nối máy chủ";
    console.error("[API Error]", message);
    return Promise.reject(error.response?.data || { message });
  }
);

export default apiClient;
