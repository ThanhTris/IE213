import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { warrantyService } from "../services/warrantyService";
import { repairService } from "../services/repairService";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../assets/css/guest.css";

function GuestPage() {
  const { id: urlSerialNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [serialOrToken, setSerialOrToken] = useState("");
  const [result, setResult] = useState(null);
  const [repairLogs, setRepairLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const certificateRef = useRef(null);

  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    setLoading(true);
    try {
      window.scrollTo(0, 0);
      const element = certificateRef.current;
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc",
        windowWidth: 1400 
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "l" : "p",
        unit: "mm",
        format: [imgWidth, imgHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Warranty_Certificate_${result?.serialNumber}.pdf`);
      toast.success("Tải xuống thành công!");
    } catch (err) {
      toast.error("Lỗi khi tạo PDF.");
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  };

  const performSearch = useCallback(async (tokenId) => {
    if (!tokenId) return;
    setLoading(true);
    setError("");
    setResult(null);
    setRepairLogs([]);

    try {
      const res = await warrantyService.verifyWarranty(tokenId);
      if (res && res.success) {
        setResult(res.data);
        try {
          const repairRes = await repairService.getRepairsBySerial(res.data.serialNumber);
          if (repairRes && repairRes.success) setRepairLogs(repairRes.data);
        } catch (err) {
          console.error("Error fetching repair logs:", err);
        }
      } else {
        const msg = res?.message || "Không tìm thấy thiết bị.";
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Tra cứu thất bại.";
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

  const handleSearchSubmit = () => {
    const tokenId = String(serialOrToken || "").trim();
    if (!tokenId) {
      toast.error("Vui lòng nhập số Serial.");
      return;
    }
    navigate(`/search/${tokenId}`);
  };

  return (
    <div className="view active">
      <div className="guest-wrap">
        <div className="guest-header-v3">
          <h1 className="guest-title-v3">Tra cứu Bảo hành Công khai</h1>
          <p className="guest-subtitle-v3">Nhập số serial thiết bị hoặc quét mã QR để kiểm tra tình trạng bảo hành</p>
        </div>

        <div className="search-container-v3" style={{ marginBottom: 0 }}>
          <div className="search-input-group-v3">
            <span className="search-icon-v3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Nhập số Serial thiết bị (ví dụ: W01-APL-IP15PM-001)"
              value={serialOrToken}
              onChange={(e) => setSerialOrToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              disabled={loading}
            />
            <button type="button" className="btn-search-v3" onClick={handleSearchSubmit} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '10px' }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              {loading ? "Đang tra cứu..." : "Tra cứu Bảo hành"}
            </button>
          </div>
          {loading && <div className="loader" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1.8rem' }}>Đang tra cứu dữ liệu...</div>}
          {error && !loading && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Không tìm thấy thiết bị</h2>
              <p>{error}</p>
              <button className="btn-retry" onClick={() => setError("")}>Thử lại</button>
            </div>
          )}
        </div>

        {result && (
          <div className="dashboard-wrapper-v2" ref={certificateRef}>
            <div className="dashboard-layout">
              {/* Cột 1: Lịch sử sửa chữa */}
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
                          <div key={index} className="timeline-item">
                            <div className="timeline-meta">
                              <span className="timeline-date">{new Date(log.createdAt).toLocaleDateString("vi-VN")}</span>
                              <span className={`status-badge status-${log.status}`}>{log.status}</span>
                            </div>
                            <p className="timeline-desc">{log.description || "Bảo trì định kỳ"}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-msg">Chưa có lịch sử sửa chữa.</p>
                    )}
                  </div>
                </div>
              </aside>

              {/* Cột 2: Thông tin sản phẩm */}
              <main className="product-info-v2">
                <article className="info-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <h3>Thông tin thiết bị</h3>
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
                        <div className="data-block">
                          <span className="label">Tên sản phẩm</span>
                          <p className="value-large">{result.productInfo?.productName}</p>
                        </div>
                        <div className="data-block">
                          <span className="label">Số Serial</span>
                          <p className="value-mono">{result.serialNumber}</p>
                        </div>
                        <div className="stats-grid">
                          <div className="stat-box">
                            <span className="label">Ngày mua</span>
                            <p className="value-bold">{new Date(result.purchaseDate).toLocaleDateString("vi-VN")}</p>
                          </div>
                          <div className="stat-box">
                            <span className="label">Hạn bảo hành</span>
                            <p className="value-bold">{new Date(result.expiryDate).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {!isExporting && (
                  <div className="floating-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn-search-v3" onClick={handleDownloadPDF}>
                      Tải chứng nhận bảo hành (PDF)
                    </button>
                  </div>
                )}
              </main>

              {/* Cột 3: Xác thực sở hữu */}
              <aside className="owner-column">
                <article className="info-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <h3>Xác thực sở hữu</h3>
                  </div>
                  <div className="card-body">
                    <div className="info-item-box">
                      <span className="label">Địa chỉ ví chủ sở hữu</span>
                      <p className="value-important">{result.ownerAddress}</p>
                    </div>
                    <div className="info-item-box" style={{ marginTop: '1.5rem' }}>
                      <span className="label">Còn lại (ngày)</span>
                      <p className="value-important text-success" style={{ fontSize: '2.5rem' }}>{getDaysRemaining(result.expiryDate)}</p>
                    </div>
                    {result.isMinted && (
                      <div className="blockchain-proof" style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                        <div className="proof-tag" style={{ color: '#166534', fontWeight: '800', fontSize: '1.6rem', textTransform: 'uppercase', marginBottom: '5px' }}>Đã xác thực Blockchain</div>
                        <p className="token-link" style={{ margin: 0, fontSize: '1.6rem', color: '#15803d' }}>Token ID: {result.tokenId}</p>
                      </div>
                    )}
                  </div>
                </article>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestPage;
