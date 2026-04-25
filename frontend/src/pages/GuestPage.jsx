import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { warrantyService } from "../services/warrantyService";
import { repairService } from "../services/repairService";
import { getStatusConfig } from "../utils/statusStyles";
import Footer from "../components/Footer";


function GuestPage() {
  const navigate = useNavigate();
  const { id: urlSerialNumber } = useParams();

  const initialPrefill = (() => {
    try {
      return urlSerialNumber || sessionStorage.getItem("bw_search_prefill") || "W01-APL-IP15PM-001";
    } catch (_e) {
      return urlSerialNumber || "W01-APL-IP15PM-001";
    }
  })();
  const [serialOrToken, setSerialOrToken] = useState(initialPrefill);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [repairLogs, setRepairLogs] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN");
  };

  const formatExpiry = (expiryDateNumber) => {
    const epochSeconds = Number(expiryDateNumber);
    if (!epochSeconds || Number.isNaN(epochSeconds)) return "N/A";
    const d = new Date(epochSeconds * 1000);
    return d.toLocaleDateString("vi-VN");
  };

  const getDaysRemaining = (expiryDateNumber) => {
    const epochSeconds = Number(expiryDateNumber);
    if (!epochSeconds || Number.isNaN(epochSeconds)) return 0;
    const expiry = epochSeconds * 1000;
    const now = Date.now();
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const performSearch = useCallback(async (tokenId) => {
    setError("");
    setLoading(true);
    setResult(null);
    setRepairLogs([]);

    try {
      if (!tokenId) {
        setLoading(false);
        return;
      }

      // 1. Verify Warranty (Includes Product and Owner Info now)
      const res = await warrantyService.verifyWarranty(tokenId);
      
      if (res && res.success) {
        setResult(res.data);
        
        // 2. Fetch Repair Logs
        try {
          const repairRes = await repairService.getRepairsBySerial(res.data.serialNumber);
          if (repairRes && repairRes.success) {
            setRepairLogs(repairRes.data || []);
          }
        } catch (repairErr) {
          console.error("Failed to fetch repair logs:", repairErr);
        }
      } else {
        const msg = res?.message || "Không tìm thấy thông tin bảo hành.";
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Tìm kiếm thất bại.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (urlSerialNumber) {
      setSerialOrToken(urlSerialNumber);
      performSearch(urlSerialNumber);
    }
  }, [urlSerialNumber, performSearch]);

  const handleSearchSubmit = () => {
    const tokenId = String(serialOrToken || "").trim();
    if (!tokenId) {
      setError("Vui lòng nhập số Serial hoặc Token ID.");
      return;
    }
    // Navigate to URL with the serial number - this will trigger the useEffect
    navigate(`/search/${tokenId}`);
  };

  // Trạng thái đã được quản lý tập trung trong statusStyles.js


  // Các style đã được quản lý tập trung trong statusStyles.js


  return (
    <>
      <div className="view active">
        <div className="guest-wrap">
          {!urlSerialNumber && (
            <>
              <div className="guest-head">
                <h1>Track Your Warranty</h1>
                <p>Enter a device serial/token id to verify warranty status.</p>
              </div>
              
              <div className="search-bar-wrap">
                <div className="search-bar">
                  <span className="search-input-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    placeholder="Enter Device Serial Number / Token ID"
                    value={serialOrToken}
                    onChange={(e) => setSerialOrToken(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    disabled={loading}
                  />
                  <div className="search-actions">
                    <button type="button" className="search-submit" onClick={handleSearchSubmit} disabled={loading}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                      {loading ? "Searching..." : "Search Warranty"}
                    </button>
                  </div>
                </div>
                {error && <p className="guest-search-hint error-msg">{error}</p>}
              </div>
            </>
          )}

          {result ? (
            <div className="dashboard-layout">
              {/* Left Column: Repair Timeline */}
              <aside className="timeline-sidebar">
                <div className="timeline-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    <h3>Lịch sử sửa chữa</h3>
                  </div>
                  <div className="timeline-content">
                    {repairLogs.length > 0 ? (
                      <div className="timeline-list">
                        {repairLogs.map((log, index) => (
                          <div key={log.id} className="timeline-item">
                            <div className="timeline-dot-wrap">
                              <div className="timeline-dot"></div>
                              {index !== repairLogs.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            <div className="timeline-details">
                              <div className="timeline-meta">
                                <span className="timeline-date">{formatDate(log.repairDate)}</span>
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  background: getStatusConfig(log.status).background,
                                  color: getStatusConfig(log.status).color,
                                  border: `1px solid ${getStatusConfig(log.status).borderColor}`,
                                  textTransform: "uppercase"
                                }}>
                                  {getStatusConfig(log.status).label}
                                </span>
                              </div>
                              <p className="timeline-desc">{log.repairContent}</p>
                              
                              {log.timeline && log.timeline.length > 0 && (
                                <div className="sub-timeline">
                                  {log.timeline.map((h, i) => (
                                    <div key={i} className="sub-item-v3">
                                      <div className="sub-dot-v3" style={{ background: getStatusConfig(h.status).color }}></div>
                                      <div className="sub-content-v3">
                                        <div className="sub-header-v3">
                                          <span className="sub-status-v3" style={{ color: getStatusConfig(h.status).color }}>
                                            {getStatusConfig(h.status).label}
                                          </span>
                                          <span className="sub-date-v3">{formatDate(h.timestamp)}</span>
                                        </div>
                                        <p className="sub-note-v3">{h.note}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Chưa có lịch sử sửa chữa cho thiết bị này.</p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* Middle Column: Product Information */}
              <div className="info-main">
                <article className="info-card product-info-v2">
                  <div className="card-header">
                    <h3>Product Information</h3>
                  </div>
                  <div className="card-body-v2">
                    <div className="product-main-row">
                      <div className="product-visual-large">
                        <img 
                          src={result.productInfo?.imageUrl?.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") || "https://placehold.co/400x400?text=Product"} 
                          alt={result.productInfo?.productName} 
                        />
                      </div>
                      <div className="product-primary-details">
                        <div className="info-item-box">
                          <span className="label">Tên sản phẩm</span>
                          <p className="value-important">{result.productInfo?.productName}</p>
                        </div>
                        <div className="info-item-box">
                          <span className="label">Màu sắc</span>
                          <p className="value-important">{result.productInfo?.color || "N/A"}</p>
                        </div>
                        <div className="info-item-box">
                          <span className="label">Mã sản phẩm</span>
                          <p className="value-important">{result.productInfo?.productCode}</p>
                        </div>
                        <div className="info-item-box">
                          <span className="label">Hãng sản xuất</span>
                          <p className="value-important">{result.productInfo?.brand || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="product-secondary-details">
                      <div className="info-item-box">
                        <span className="label">Cấu hình máy</span>
                        <p className="value-important">{result.productInfo?.config || "N/A"}</p>
                      </div>
                      <div className="info-item-box">
                        <span className="label">Thời hạn bảo hành</span>
                        <p className="value-important">{result.productInfo?.warrantyMonths || 12} tháng</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* Right Column: Owner & Other Details */}
              <aside className="owner-column">
                {/* Owner Information */}
                <article className="info-card owner-info">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <h3>Owner Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="data-block">
                      <span className="label">Name</span>
                      <p className="value-large">{result.ownerInfo?.fullName || "Chưa cập nhật"}</p>
                    </div>
                    <div className="data-block">
                      <span className="label">Wallet Address</span>
                      <p className="value-mono">{result.ownerInfo?.walletAddress}</p>
                    </div>
                  </div>
                </article>

                {/* Warranty Details */}
                <article className="info-card warranty-details">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <h3>Warranty Details</h3>
                  </div>
                  <div className="card-body">
                    <div className="stats-grid">
                      <div className="stat-box">
                        <span className="label">Purchase Date</span>
                        <p className="value-bold">{formatDate(result.purchaseDate)}</p>
                      </div>
                      <div className="stat-box">
                        <span className="label">Warranty Period</span>
                        <p className="value-bold">{result.productInfo?.warrantyMonths || 12}m</p>
                      </div>
                      <div className="stat-box">
                        <span className="label">Expiry Date</span>
                        <p className="value-bold text-success">{formatExpiry(result.expiryDate)}</p>
                      </div>
                      <div className="stat-box">
                        <span className="label">Days Remaining</span>
                        <p className="value-bold text-success">{getDaysRemaining(result.expiryDate)}d</p>
                      </div>
                    </div>
                    {result.isMinted && (
                      <div className="blockchain-proof">
                        <div className="proof-tag">Verified on Blockchain</div>
                        <p className="token-link">Token ID: {result.tokenId}</p>
                      </div>
                    )}
                  </div>
                </article>
              </aside>
            </div>
          ) : (
            <div className="empty-search-state">
              {!loading && !error && (
                <div className="welcome-msg">
                  <div className="welcome-icon">🔍</div>
                  <h2>Tìm kiếm thông tin thiết bị</h2>
                  <p>Nhập số Serial hoặc Token ID để xem chi tiết sản phẩm và lịch sử bảo hành.</p>
                </div>
              )}
              {loading && <div className="loader">Đang tải dữ liệu...</div>}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default GuestPage;

