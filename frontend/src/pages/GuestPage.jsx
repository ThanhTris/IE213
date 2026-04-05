import { useState } from "react";
import { API_ROOT } from "../utils/api";
import Footer from "../components/Footer";

function GuestPage({ onChangeView, isAuthenticated }) {
  const initialPrefill = (() => {
    try {
      return sessionStorage.getItem("bw_search_prefill") || "SN-7K2M-2024-X9";
    } catch (_e) {
      return "SN-7K2M-2024-X9";
    }
  })();
  const [serialOrToken, setSerialOrToken] = useState(initialPrefill);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const formatExpiry = (expiryDateNumber) => {
    const epochSeconds = Number(expiryDateNumber);
    if (!epochSeconds || Number.isNaN(epochSeconds)) return "";
    const d = new Date(epochSeconds * 1000);
    return d.toLocaleDateString();
  };

  const doSearch = async () => {
    setError("");
    setLoading(true);
    setResult(null);

    if (!isAuthenticated) {
      setLoading(false);
      setError("Please sign in to perform warranty search.");
      return;
    }

    try {
      const tokenId = String(serialOrToken || "").trim();
      if (!tokenId) {
        setError("Please enter a serial/token id.");
        return;
      }

      const res = await fetch(
        `${API_ROOT}/warranties/${encodeURIComponent(tokenId)}`,
      );
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error?.message || "Warranty not found.");
        return;
      }

      // Backend returns: { success, data: warranty }
      setResult(json?.data || json);
    } catch (e) {
      setError(e?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="view active">
        <div className="guest-wrap">
          <div className="guest-head">
            <h1>Track Your Warranty</h1>
            <p>Enter a device serial/token id to verify warranty status.</p>
          </div>
          <div className="search-bar-wrap">
            <div className="search-bar">
              <span className="search-input-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Enter Device Serial Number / Token ID"
                value={serialOrToken}
                onChange={(e) => setSerialOrToken(e.target.value)}
                disabled={loading}
              />
              <div className="search-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Scan QR"
                  aria-label="Scan QR code"
                  disabled
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                    <rect x="7" y="7" width="5" height="5" />
                    <rect x="12" y="12" width="5" height="5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="search-submit"
                  onClick={doSearch}
                  disabled={loading}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    style={{ marginRight: 8 }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  {loading ? "Searching..." : "Search Warranty"}
                </button>
              </div>
            </div>
            <p className="guest-search-hint">
              Or scan QR code from product packaging.
            </p>
            {!isAuthenticated && (
              <p className="guest-search-hint">
                Search is available after signing in.{" "}
                <button
                  type="button"
                  className="btn-login"
                  onClick={() => onChangeView("auth")}
                >
                  Sign in
                </button>
              </p>
            )}
            {error && (
              <p
                className="guest-search-hint"
                style={{ color: "#b42318", fontWeight: 700 }}
              >
                {error}
              </p>
            )}
          </div>

          <article className="result-card" aria-label="Warranty result">
            {result ? (
              <div className="result-top">
                <div className="result-meta">
                  <span className="warranty-badge">
                    {result.status ? "Active Warranty" : "Inactive Warranty"}
                  </span>
                  <h2 className="device-name">
                    {result.productInfo?.productName || "Warranty record"}
                  </h2>
                  <p className="serial-muted">Serial - {result.serialNumber}</p>
                  <span className="token-id">Token ID - {result.tokenId}</span>
                  <p className="serial-muted">
                    Expiry - {formatExpiry(result.expiryDate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="result-top">
                <div className="result-meta">
                  <span className="warranty-badge">Waiting for search</span>
                  <h2 className="device-name">Enter a serial/token id</h2>
                  <p className="serial-muted">No result yet.</p>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default GuestPage;
