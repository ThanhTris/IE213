import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { warrantyService } from "../services/warrantyService";
import { repairService } from "../services/repairService";
import { getStatusConfig } from "../utils/statusStyles";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function GuestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlSerialNumber } = useParams();
  const certificateRef = useRef(null);

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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    toast.info("Đang chuẩn bị bản in PDF...");

    try {
      // Đảm bảo trang ở đầu để tránh lỗi cắt ảnh
      window.scrollTo(0, 0);
      
      const element = certificateRef.current;
      
      // Chờ một chút để UI ổn định sau khi scroll
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2, // Scale 2 là đủ nét và dung lượng file vừa phải
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc",
        // Ép width cố định khi chụp để đảm bảo layout grid không bị vỡ
        windowWidth: 1400 
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // Tính toán kích thước PDF (đơn vị mm)
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Tạo PDF với kích thước khớp hoàn toàn với nội dung (không ép A4 nếu nội dung ngắn)
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "l" : "p",
        unit: "mm",
        format: [imgWidth, imgHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      pdf.save(`Warranty_Certificate_${result?.serialNumber}.pdf`);
      toast.success("Tải xuống thành công!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Lỗi khi tạo file PDF");
    } finally {
      setIsExporting(false);
    }
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

      const res = await warrantyService.verifyWarranty(tokenId);
      
      if (res && res.success) {
        setResult(res.data);
        
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

  useEffect(() => {
    if (urlSerialNumber) {
      setSerialOrToken(urlSerialNumber);
      performSearch(urlSerialNumber);
    }
  }, [urlSerialNumber, performSearch]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("download") === "true" && result && !loading && !isExporting) {
      // Đợi UI render xong rồi mới chụp
      setTimeout(() => {
        handleDownloadPDF();
      }, 1000);
    }
  }, [location.search, result, loading]);

  const handleSearchSubmit = () => {
    const tokenId = String(serialOrToken || "").trim();
    if (!tokenId) {
      setError("Vui lòng nhập số Serial hoặc Token ID.");
      return;
    }
    navigate(`/search/${tokenId}`);
  };

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
            <div className="dashboard-wrapper-v2" ref={certificateRef}>
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
                            <div key={log.id || index} className="timeline-item">
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
                      <h3>Thông tin sản phẩm</h3>
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
                            <span className="label">Mã sản phẩm</span>
                            <p className="value-important">{result.productInfo?.productCode}</p>
                          </div>
                          <div className="info-item-box">
                            <span className="label">Số Serial</span>
                            <p className="value-important">{result.serialNumber}</p>
                          </div>
                          <div className="info-item-box">
                            <span className="label">Hãng sản xuất</span>
                            <p className="value-important">{result.productInfo?.brand || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="product-secondary-details">
                        <div className="info-item-box">
                          <span className="label">Cấu hình</span>
                          <p className="value-important">{result.productInfo?.config || "Tiêu chuẩn"}</p>
                        </div>
                        <div className="info-item-box">
                          <span className="label">Màu sắc</span>
                          <p className="value-important">{result.productInfo?.color || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                  
                  {/* Floating Action Button for Download (only visible in UI, not in PDF) */}
                  {!isExporting && (
                    <div className="floating-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                      <button className="btn-export-pdf" onClick={handleDownloadPDF} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 32px',
                        background: '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '100px',
                        fontWeight: '700',
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(30, 58, 138, 0.2)'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Tải xuống bản sao bảo hành (PDF)
                      </button>
                    </div>
                  )}
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
                      <h3>Thông tin sở hữu</h3>
                    </div>
                    <div className="card-body">
                      <div className="data-block">
                        <span className="label">Chủ sở hữu</span>
                        <p className="value-large">{result.ownerInfo?.fullName || "Chưa cập nhật"}</p>
                      </div>
                      <div className="data-block">
                        <span className="label">Địa chỉ ví</span>
                        <p className="value-mono" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{result.ownerInfo?.walletAddress}</p>
                      </div>
                    </div>
                  </article>

                  {/* Warranty Details */}
                  <article className="info-card warranty-details">
                    <div className="card-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <h3>Chi tiết bảo hành</h3>
                    </div>
                    <div className="card-body">
                      <div className="stats-grid">
                        <div className="stat-box">
                          <span className="label">Ngày mua</span>
                          <p className="value-bold">{formatDate(result.purchaseDate)}</p>
                        </div>
                        <div className="stat-box">
                          <span className="label">Thời hạn</span>
                          <p className="value-bold">{result.productInfo?.warrantyMonths || 12}T</p>
                        </div>
                        <div className="stat-box">
                          <span className="label">Ngày hết hạn</span>
                          <p className="value-bold text-success">{formatExpiry(result.expiryDate)}</p>
                        </div>
                        <div className="stat-box">
                          <span className="label">Còn lại (ngày)</span>
                          <p className="value-bold text-success">{getDaysRemaining(result.expiryDate)}</p>
                        </div>
                      </div>
                      {result.isMinted && (
                        <div className="blockchain-proof" style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                          <div className="proof-tag" style={{ color: '#166534', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px' }}>Đã xác thực Blockchain</div>
                          <p className="token-link" style={{ margin: 0, fontSize: '12px', color: '#15803d' }}>Token ID: {result.tokenId}</p>
                        </div>
                      )}
                    </div>
                  </article>
                </aside>
              </div>
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
