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

// Interceptor: Tự động đính kèm Auth Token vào Header của mọi Request
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

// Interceptor: Xử lý lỗi chung từ Response của Backend
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu mã lỗi là 401 (Unauthorized), xóa token và chuyển hướng về trang đăng nhập
    if (error.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("bw_auth_token");
      // Chỉ chuyển hướng nếu chưa ở trang auth để tránh vòng lặp (loop)
      if (!window.location.pathname.startsWith("/auth")) {
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      }
    }

    const message = error.response?.data?.message || "Lỗi kết nối máy chủ";
    // Không tự động hiển thị Toast cho MỌI lỗi ở đây để tránh trùng lặp thông báo.
    // Lỗi sẽ được ném về cho Component tự xử lý.
    return Promise.reject(error.response?.data || { message });
  }
);

export default apiClient;
