import { useMemo, useState } from "react";
import { connectMetaMask, isValidWalletAddress } from "../utils/web3";
import { API_ROOT } from "../utils/api";
import { persistAuthToken, shortAddress } from "../utils/auth";

function extractBearerToken(headerValue = "") {
  const v = String(headerValue || "");
  if (!v) return "";
  return v.startsWith("Bearer ") ? v.slice(7).trim() : v.trim();
}

function SignInUpPage({ onAuthSuccess, onCancel }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [walletAddress, setWalletAddress] = useState("");

  const heading = useMemo(
    () => (mode === "signin" ? "Welcome Back" : "Welcome"),
    [mode],
  );

  const connectWallet = async () => {
    setError("");
    setBusy(true);
    try {
      const addr = await connectMetaMask();
      setWalletAddress(addr);
      return addr;
    } catch (e) {
      setError(e?.message || "Failed to connect wallet.");
      return "";
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    let addr = walletAddress;
    if (!addr) {
      // Try to connect first.
      addr = await connectWallet();
      if (!addr) return;
    }

    const trimmedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const trimmedFullName = String(fullName || "").trim();
    const trimmedPhone = String(phone || "").trim();

    if (mode === "signup" && password) {
      if (password !== confirmPassword) {
        setError("Password confirmation does not match.");
        return;
      }
    }

    if (!isValidWalletAddress(addr)) {
      setError("Invalid wallet address.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_ROOT}/users/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: addr,
          fullName: trimmedFullName || undefined,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json?.error?.message || json?.message || "Sign in/up failed.";
        setError(msg);
        return;
      }

      const token =
        extractBearerToken(res.headers.get("authorization")) ||
        extractBearerToken(res.headers.get("x-access-token")) ||
        "";

      if (!token) {
        setError("Authentication succeeded but token was not returned.");
        return;
      }

      const auth = persistAuthToken(token);
      if (!auth) {
        setError("Unable to read auth payload.");
        return;
      }
      onAuthSuccess?.(auth);
    } catch (e) {
      setError(e?.message || "Unexpected error.");
    } finally {
      setBusy(false);
    }
  };

  const onKeySubmit = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="auth-wrap">
      <div
        className="auth-card"
        onKeyDown={onKeySubmit}
        role="region"
        aria-label="Sign in/up"
      >
        <div className="auth-brand">
          <span className="brand-mini">BlockWarranty</span>
        </div>
        <h2 className="auth-heading">{heading}</h2>
        <p className="auth-sub">
          Sign in to access your warranty dashboard
          {mode === "signup" ? " and create your profile" : ""}.
        </p>

        <div
          className="auth-mode-tabs"
          role="tablist"
          aria-label="Sign in/up mode"
        >
          <button
            type="button"
            className={`auth-mode-btn ${mode === "signin" ? "active" : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <div className="wallet-connect-section">
          <div className="wallet-connect-title">Web3 Wallet</div>
          <div className="wallet-connect-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={connectWallet}
              disabled={busy}
            >
              Connect MetaMask
            </button>
            <button type="button" className="btn" disabled>
              WalletConnect (coming soon)
            </button>
            <button type="button" className="btn" disabled>
              Coinbase Wallet (coming soon)
            </button>
          </div>
          <div className="wallet-connected">
            <span className="muted">Connected:</span>{" "}
            <span className="mono">
              {walletAddress ? shortAddress(walletAddress) : "Not connected"}
            </span>
          </div>

          <div className="field">
            <label htmlFor="walletAddress">Or enter wallet address</label>
            <input
              id="walletAddress"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.trim())}
              placeholder="0x..."
              disabled={busy}
            />
          </div>
        </div>

        <div className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={busy}
            />
          </div>

          {mode === "signup" && (
            <div className="field">
              <label htmlFor="fullName">Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                autoComplete="name"
                disabled={busy}
              />
            </div>
          )}

          {mode === "signup" && (
            <div className="field">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84..."
                autoComplete="tel"
                disabled={busy}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="password">
              {mode === "signin" ? "Password" : "Password"}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              disabled={busy}
            />
          </div>

          {mode === "signup" && (
            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={busy}
              />
            </div>
          )}

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary auth-submit"
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy
              ? "Working..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>

          <div className="auth-footer-actions">
            <button
              type="button"
              className="btn auth-cancel"
              onClick={onCancel}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInUpPage;
