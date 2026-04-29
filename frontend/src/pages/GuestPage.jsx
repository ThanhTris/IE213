import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { warrantyService } from "../services/warrantyService";
import { repairService } from "../services/repairService";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Footer from "../components/Footer";
import "../assets/css/guest.css";

function GuestPage() {
  const { id: urlSerialNumber } = useParams();
  const navigate = useNavigate();

  const [serialOrToken, setSerialOrToken] = useState("");
  const [result, setResult] = useState(null);
  const [repairLogs, setRepairLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const certificateRef = useRef(null);

  const maskString = (str, start = 6, end = 4) => {
    if (!str) return "N/A";
    if (str.length <= start + end) return str;
    return `${str.substring(0, start)}...${str.substring(str.length - end)}`;
  };

  const maskContact = (str) => {
    if (!str) return "N/A";
    if (str.includes("@")) {
      const [user, domain] = str.split("@");
      return `${user.charAt(0)}***@${domain}`;
    }
    if (str.length > 6) {
      return `${str.substring(0, 3)}***${str.substring(str.length - 3)}`;
    }
    return str;
  };

  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate * 1000); 
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
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1600 
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
      pdf.save(`Warranty_${result?.serialNumber}.pdf`);
      toast.success("Tải xuống thành công!");
    } catch (err) {
      toast.error("Lỗi khi tạo PDF.");
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  };

  const performSearch = useCallback(async (tokenId) => {
    if (!tokenId) return false;
    setLoading(true);
    setError("");
    setResult(null);
    setRepairLogs([]);

    try {
      const res = await warrantyService.verifyWarranty(tokenId);
      if (res && res.success) {
        setResult(res.data);
        const repairRes = await repairService.getRepairsBySerial(res.data.serialNumber);
        if (repairRes && repairRes.success) setRepairLogs(repairRes.data);
        return true;
      } else {
        setError(res?.message || "Không tìm thấy thiết bị.");
        return false;
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Tra cứu thất bại.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlSerialNumber) {
      setSerialOrToken(urlSerialNumber);
      performSearch(urlSerialNumber).then((success) => {
        if (!success) {
          navigate("/search", { replace: true });
        }
      });
    }
  }, [urlSerialNumber, performSearch, navigate]);

  const handleSearchSubmit = () => {
    const val = serialOrToken.trim().toUpperCase();
    if (!val) return toast.error("Vui lòng nhập số Serial.");
    navigate(`/search/${val}`);
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: "Đang xử lý",
      waiting_parts: "Chờ linh kiện",
      fixing: "Đang sửa",
      completed: "Đã xong",
      delivered: "Đã giao",
      cancelled: "Đã hủy"
    };
    return map[status] || status;
  };

  return (
    <div className="view active">
      <div className="guest-wrap">
        <header className="guest-header-v3">
          <h1 className="guest-title-v3">Tra cứu Bảo hành Công khai</h1>
          <p className="guest-subtitle-v3">Mọi thông tin bảo hành được minh bạch trên Blockchain</p>
        </header>

        <section className="search-container-v3">
          <div className="search-input-group-v3">
            <span className="search-icon-v3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Nhập số Serial thiết bị (ví dụ: W01-APL-IP15PM-001)"
              value={serialOrToken}
              onChange={(e) => setSerialOrToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            />
            <button className="btn-search-v3" onClick={handleSearchSubmit} disabled={loading}>
              {loading ? "Đang tra cứu..." : "Tra cứu Bảo hành"}
            </button>
          </div>
          {loading && <div className="loader">Đang đồng bộ dữ liệu Blockchain...</div>}
        </section>

        {error && !loading && (
          <div className="error-overlay-v4">
            <div className="error-modal-v4">
              <button className="error-close-v4" onClick={() => {
                setError("");
                setSerialOrToken("");
              }}>
                &times;
              </button>
              <div className="error-icon-v4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 className="error-title-v4">Không tìm thấy thiết bị</h2>
              <p className="error-desc-v4">
                Mã số IMEI / Serial <strong>{serialOrToken}</strong> không tồn tại trong hệ thống hoặc chưa được đăng ký bảo hành trên Blockchain.
              </p>
              <button className="btn-retry-v4" onClick={() => {
                setError("");
                setSerialOrToken("");
              }}>
                Thử lại mã khác
              </button>
            </div>
          </div>
        )}

        {result && (
          <main className="dashboard-layout" ref={certificateRef}>
            {/* Cột 1: Lịch sử */}
            <article className="column-card guest-timeline-card">
              <div className="card-header-v4">
                <div className="icon-box-v4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="header-text-v4">
                  <h2 className="card-title-v4">Lịch sử bảo hành</h2>
                  <p className="card-desc-v4">IMEI: {result.serialNumber}</p>
                </div>
              </div>

              <div className="card-content-v4">
                <div className="timeline-v4">
                  {repairLogs.length > 0 ? (
                    repairLogs.map((log, idx) => (
                      <div key={idx} className="timeline-item-v4">
                        <div className="timeline-marker"></div>
                        <div className="timeline-body-v4">
                          <div className="item-meta">
                            <span className="item-date">{new Date(log.createdAt).toLocaleDateString("vi-VN")}</span>
                            <span className={`status-badge-v4 ${log.status}`}>{getStatusLabel(log.status)}</span>
                          </div>
                          <p className="item-text">{log.description || "Bảo trì định kỳ"}</p>
                          {log.cost > 0 && <p className="item-price">{log.cost.toLocaleString("vi-VN")} đ</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-msg">Chưa có lịch sử sửa chữa.</p>
                  )}
                </div>
              </div>
            </article>

            {/* Cột 2: Sản phẩm */}
            <article className="column-card guest-product-card">
              <div className="card-header-v4">
                <div className="icon-box-v4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="header-text-v4">
                  <h2 className="card-title-v4">Thông tin thiết bị</h2>
                  <p className="card-desc-v4">Chi tiết cấu hình sản phẩm</p>
                </div>
              </div>

              <div className="card-content-v4">
                <div className="product-grid-v4">
                  <div className="img-container-v4">
                    <img 
                      src={result.productInfo?.imageUrl?.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") || "https://placehold.co/600x400?text=Product"} 
                      alt="Product" 
                    />
                  </div>
                  
                  <div className="spec-box">
                    <span className="spec-label">Tên sản phẩm</span>
                    <p className="spec-val">{result.productInfo?.productName}</p>
                  </div>
                  <div className="spec-box">
                    <span className="spec-label">Màu sắc</span>
                    <p className="spec-val">{result.productInfo?.color || "N/A"}</p>
                  </div>
                  <div className="spec-box">
                    <span className="spec-label">Mã sản phẩm</span>
                    <p className="spec-val">{result.productInfo?.productCode}</p>
                  </div>
                  <div className="spec-box">
                    <span className="spec-label">Hãng sản xuất</span>
                    <p className="spec-val">{result.productInfo?.brand}</p>
                  </div>
                  
                  <div className="spec-box">
                    <span className="spec-label">Cấu hình máy</span>
                    <p className="spec-val-sm">{result.productInfo?.config}</p>
                  </div>
                  <div className="spec-box">
                    <span className="spec-label">Thời hạn bảo hành</span>
                    <p className="spec-val">{result.productInfo?.warrantyMonths} tháng</p>
                  </div>
                  <div className="spec-box">
                    <span className="spec-label">Giá bán (VNĐ)</span>
                    <p className="spec-val">{result.productInfo?.price?.toLocaleString("vi-VN")} đ</p>
                  </div>
                  <div className="spec-box">
                    <span className="spec-label">Trạng thái</span>
                    <p className="spec-val">
                      <span className="status-badge-v4 active">Hoạt động</span>
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Cột 3: Sở hữu */}
            <article className="column-card guest-owner-card">
              <div className="card-header-v4">
                <div className="icon-box-v4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="header-text-v4">
                  <h2 className="card-title-v4">Xác thực sở hữu</h2>
                  <p className="card-desc-v4">Dữ liệu bảo mật chủ thẻ</p>
                </div>
              </div>

              <div className="card-content-v4">
                <div className="owner-list-v4">
                  <div className="owner-item">
                    <span className="item-label">Chủ sở hữu</span>
                    <p className="item-val-bold">{result.ownerInfo?.fullName || "N/A"}</p>
                  </div>
                  <div className="owner-item">
                    <span className="item-label">Địa chỉ ví Blockchain</span>
                    <p className="item-val-code">{maskString(result.ownerInfo?.walletAddress)}</p>
                  </div>
                  <div className="owner-item">
                    <span className="item-label">Liên hệ</span>
                    <p className="item-val">{maskContact(result.ownerInfo?.phone || result.ownerInfo?.email)}</p>
                  </div>
                  <div className="days-remaining-v4">
                    <span className="label">Bảo hành còn lại</span>
                    <div className="days-box">
                      <span className="days-num">{getDaysRemaining(result.expiryDate)}</span>
                      <span className="days-text">ngày</span>
                    </div>
                  </div>
                  
                  {result.isMinted && (
                    <div className="nft-badge-v4">
                      <p className="nft-tag">Verified On-chain</p>
                      <p className="nft-id">Token ID: {result.tokenId}</p>
                    </div>
                  )}

                  {!isExporting && (
                    <button className="btn-action-pdf" onClick={handleDownloadPDF}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Xuất PDF
                    </button>
                  )}
                </div>
              </div>
            </article>
          </main>
        )}
      </div>
    </div>
  );
}

export default GuestPage;
