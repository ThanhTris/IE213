import { useEffect } from "react";
import { toast } from "sonner";
import { setupWalletListeners } from "../utils/web3";
import { clearAuthStorage } from "../utils/auth";

/**
 * useWalletEvents — Lắng nghe sự kiện thay đổi ví MetaMask
 *
 * Hành vi:
 *  - accountsChanged: tự động logout + redirect về /auth
 *  - chainChanged: toast cảnh báo + reload trang
 *
 * @param {boolean}  isAuthenticated - Chỉ kích hoạt khi user đã đăng nhập
 * @param {Function} onLogout        - Hàm logout từ App.jsx (xóa auth state)
 */
function useWalletEvents(isAuthenticated, onLogout) {
  useEffect(() => {
    // Không lắng nghe nếu chưa đăng nhập hoặc không có MetaMask
    if (!isAuthenticated || typeof window === "undefined" || !window.ethereum) return;

    const handleAccountChange = (accounts) => {
      if (!isAuthenticated) return;

      if (!accounts || accounts.length === 0) {
        // Ví bị disconnect hoàn toàn
        toast.warning("Ví đã bị ngắt kết nối. Đang đăng xuất...");
      } else {
        // Chuyển sang ví khác
        toast.warning(
          "Phát hiện thay đổi ví MetaMask. Đang đăng xuất để bảo mật tài khoản..."
        );
      }

      // Dọn dẹp auth storage và logout
      clearAuthStorage();
      sessionStorage.removeItem("bw_dev_role_active");

      // Delay nhỏ để toast hiển thị trước khi redirect
      setTimeout(() => {
        onLogout?.();
      }, 1500);
    };

    const handleChainChange = (_chainId) => {
      toast.warning(
        "Phát hiện thay đổi mạng blockchain. Đang tải lại trang...",
        { duration: 2000 }
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };

    const cleanup = setupWalletListeners(handleAccountChange, handleChainChange);

    return cleanup;
  }, [isAuthenticated, onLogout]);
}

export default useWalletEvents;
