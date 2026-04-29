import { useState } from "react";
import { connectMetaMask, isValidWalletAddress } from "../utils/web3";
import { persistAuthToken } from "../utils/auth";
import { toast } from "sonner";
import { userService } from "../services/userService";

function AuthPage({ onAuthSuccess, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const connectAndSignIn = async () => {
    setError("");
    setBusy(true);
    try {
      const addr = await connectMetaMask();
      if (!isValidWalletAddress(addr)) {
        const msg = "Địa chỉ ví không hợp lệ.";
        setError(msg);
        toast.error(msg);
        return;
      }

      // Sử dụng userService để đăng nhập
      const res = await userService.login({ walletAddress: addr });

      const token = res.data?.accessToken;

      if (!token) {
        const msg = "Đăng nhập thành công nhưng không nhận được token.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const auth = persistAuthToken(token);
      if (!auth) {
        const msg = "Không thể đọc thông tin xác thực từ token.";
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Đăng nhập thành công!");
      onAuthSuccess?.(auth);
    } catch (e) {
      console.error("[Login Error]", e);
      const msg = e?.message || "Kết nối ví thất bại.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <button type="button" className="btn-back-absolute" onClick={onCancel} disabled={busy}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Trang chủ
      </button>

      <div className="auth-card">
        {/* Header section moved INSIDE the card */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--navy-primary)" }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="auth-title">Chào mừng đến E-Warranty</h1>
          <p className="auth-subtitle">Kết nối ví của bạn để truy cập sổ bảo hành kỹ thuật số</p>
        </div>

        <div className="login-methods-box">
          <h3 className="methods-title">Đăng nhập qua Ví</h3>
          <p className="methods-subtitle">Định danh an toàn bằng chữ ký số Web3</p>

          <button
            type="button"
            className="btn btn-metamask-connect"
            onClick={connectAndSignIn}
            disabled={busy}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "10px" }}>
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            {busy ? "Đang kết nối..." : "Kết nối bằng MetaMask"}
          </button>

          <p className="upcoming-label">Các ví khác sẽ sớm hỗ trợ</p>
          <div className="upcoming-wallets-list">
            <div className="wallet-item disabled">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>WalletConnect</span>
            </div>
            <div className="wallet-item disabled">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>Coinbase Wallet</span>
            </div>
          </div>
        </div>

        {error && <div className="auth-error-alert" role="alert">{error}</div>}

        <div className="metamask-benefits">
          <h4>Tại sao nên dùng MetaMask?</h4>
          <div className="benefit-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" fill="var(--color-success-light)" />
              <path d="M7 10L9 12L13 8" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Ví của bạn, khóa của bạn – Quyền sở hữu tuyệt đối</span>
          </div>
          <div className="benefit-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" fill="var(--color-success-light)" />
              <path d="M7 10L9 12L13 8" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Không cần tạo tài khoản hay nhớ mật khẩu</span>
          </div>
          <div className="benefit-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" fill="var(--color-success-light)" />
              <path d="M7 10L9 12L13 8" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Xác thực an toàn được xác minh qua Blockchain</span>
          </div>
        </div>

        <div className="no-wallet-prompt">
          <p>Bạn chưa cài đặt tiện ích MetaMask?</p>
          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="link" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
            Tải MetaMask →
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
