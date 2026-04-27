import { useState } from "react";
import { connectMetaMask, isValidWalletAddress } from "../utils/web3";
import { persistAuthToken } from "../utils/auth";
import { toast } from "sonner";
import { userService } from "../services/userService";

function SignInUpPage({ onAuthSuccess, onCancel }) {
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
      <div className="auth-logo">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          style={{ color: "#10b981" }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <h1 className="auth-title">Welcome to BlockWarranty</h1>
      <p className="auth-subtitle">Connect your wallet to access your digital warranty passport</p>

      <div className="auth-card">
        <div className="wallet-section">
          <h3 className="wallet-section-title">Connect Wallet</h3>
          <p className="wallet-section-subtitle">Secure authentication via Web3 wallet</p>

          <button
            type="button"
            className="btn btn-primary btn-connect-wallet"
            onClick={connectAndSignIn}
            disabled={busy}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px" }}>
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            {busy ? "Connecting..." : "Connect with MetaMask"}
          </button>

          <p className="coming-soon">Other wallets coming soon</p>
          <div className="other-wallets">
            <div className="wallet-option disabled">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span>WalletConnect</span>
            </div>
            <div className="wallet-option disabled">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span>Coinbase Wallet</span>
            </div>
          </div>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <div className="why-metamask">
          <h4>Why MetaMask?</h4>
          <div className="benefit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Your wallet, your keys – complete ownership</span>
          </div>
          <div className="benefit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>No passwords to remember or accounts to create</span>
          </div>
          <div className="benefit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Blockchain-verified secure authentication</span>
          </div>
        </div>

        <div className="no-wallet-prompt">
          <p>Don't have MetaMask installed?</p>
          <div className="auth-footer-actions">
            <button type="button" className="link-cancel" onClick={onCancel} disabled={busy}>
              ← Back to Home
            </button>
            <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="link">
              Download MetaMask →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInUpPage;
