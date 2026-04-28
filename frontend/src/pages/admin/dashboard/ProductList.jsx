import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { productService } from "../../../services/productService";
import { repairService } from "../../../services/repairService";
import { getStatusConfig } from "../../../utils/statusStyles";


const BASE_CATEGORIES = ["Samsung", "Apple"];

const fieldLabel = { fontWeight: 600, fontSize: 12, color: "#64748b", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: "0.03em" };
const fieldValue = { fontSize: 14, color: "#0f172a", fontWeight: 400 };

const UI_CATEGORIES = ["Tất cả", "Điện thoại", "Máy tính", "Máy tính bảng", "Tai nghe", "Khác"];

const categorizeProduct = (name = "") => {
  const n = name.toLowerCase();
  if (/\b(iphone|galaxy|oppo|redmi|mobile|s24|note|pixel|vsmart|sony|htc|xiaomi)\b/.test(n)) return "Điện thoại";
  if (/\b(macbook|dell|asus|hp|laptop|pc|legion|vivobook|thinkpad|vostro|gaming)\b/.test(n)) return "Máy tính";
  if (/\b(ipad|tab|tablet|surface go)\b/.test(n)) return "Máy tính bảng";
  if (/\b(airpods|buds|headphone|earphone|tai nghe|freebuds|freelace|pro 2|pro 3)\b/.test(n)) return "Tai nghe";
  return "Khác";
};

function FilterModal({ isOpen, onClose, brands, filterBrand, setFilterBrand, priceRange, setPriceRange }) {
  if (!isOpen) return null;

  const pricePresets = [
    { label: "Tất cả mức giá", min: 0, max: Infinity },
    { label: "Dưới 10 triệu", min: 0, max: 10000000 },
    { label: "10tr - 20tr", min: 10000000, max: 20000000 },
    { label: "20tr - 35tr", min: 20000000, max: 35000000 },
    { label: "Trên 35 triệu", min: 35000000, max: Infinity },
  ];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" style={{ maxWidth: "50rem" }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Bộ lọc nâng cao</h3>
          <button onClick={onClose} className="admin-modal-close-btn">×</button>
        </div>

        <div className="admin-modal-body hide-scrollbar" style={{ maxHeight: "70vh" }}>
          <div className="filter-section">
            <h4 className="detail-section-title filter-section-header">Chọn Hãng</h4>
            <div className="filter-button-group">
              <button
                className={`filter-btn ${filterBrand === "all" ? "active" : ""}`}
                onClick={() => setFilterBrand("all")}
              >
                Tất cả Hãng
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  className={`filter-btn ${filterBrand === b ? "active" : ""}`}
                  onClick={() => setFilterBrand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="detail-section-title filter-section-header">Khoảng giá (VND)</h4>
            <div className="filter-button-group" style={{ marginBottom: "1.6rem" }}>
              {pricePresets.map((p) => (
                <button
                  key={p.label}
                  className={`filter-btn ${priceRange.label === p.label ? "active" : ""}`}
                  onClick={() => setPriceRange(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="filter-range-container">
              <input
                type="number"
                placeholder="Giá tối thiểu"
                value={priceRange.min === 0 && priceRange.label !== "" ? "" : priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value), label: "Tùy chọn" })}
                className="filter-range-input"
              />
              <div className="filter-range-separator" />
              <input
                type="number"
                placeholder="Giá tối đa"
                value={priceRange.max === Infinity ? "" : priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value), label: "Tùy chọn" })}
                className="filter-range-input"
              />
            </div>
          </div>
        </div>

        <div className="admin-modal-footer light-bg">
          <button
            onClick={() => {
              setFilterBrand("all");
              setPriceRange({ min: 0, max: Infinity, label: "Tất cả mức giá" });
            }}
            className="admin-secondary-btn"
          >
            Làm mới
          </button>
          <button
            onClick={onClose}
            className="admin-primary-btn"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ product, onClose, onConfirm }) {
  if (!product) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 400, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 32, textAlign: "center" }}>
          <div style={{ background: "#fef2f2", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#ef4444" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 9 2 2 4-4" />
            </svg>
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Xác nhận xóa?</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{product.productName}</strong>? Hành động này sẽ chuyển trạng thái sản phẩm sang "Tạm khóa".
          </p>
        </div>
        <div style={{ padding: "0 24px 24px", display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, cursor: "pointer" }}
          >Hủy bỏ</button>
          <button
            onClick={() => onConfirm(product)}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#ef4444", color: "white", fontWeight: 700, cursor: "pointer" }}
          >Xác nhận xóa</button>
        </div>
      </div>
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave, mode = "edit" }) {
  const isAdd = mode === "add";

  const [formData, setFormData] = useState({
    productCode: product?.productCode || "",
    productName: product?.productName || "",
    brand: product?.brand || "",
    color: product?.color || "",
    price: product?.price || 0,
    warrantyMonths: product?.warrantyMonths || 0,
    config: product?.config || "",
    description: product?.description || "",
    isActive: product?.isActive ?? true
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl ? product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") : null);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (isAdd) {
        await productService.createProduct(data);
        toast.success("Tạo sản phẩm thành công!");
      } else {
        await onSave(product.productCode, data);
        toast.success("Cập nhật sản phẩm thành công!");
      }
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || (isAdd ? "Tạo sản phẩm thất bại!" : "Cập nhật thất bại!");
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {isAdd ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </h3>
          <button onClick={onClose} className="admin-modal-close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body hide-scrollbar">
          <div className="admin-modal-form-grid">
            {/* Image Upload Area */}
            <div className="admin-modal-image-upload">
              <div className="admin-modal-image-preview">
                {previewUrl ? (
                  <img src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ color: "var(--grey-300)", fontSize: "var(--text-sm)" }}>No img</div>
                )}
              </div>
              <div className="admin-modal-image-info">
                <label className="admin-modal-label">Hình ảnh sản phẩm</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: "var(--text-xs)", color: "var(--grey-500)" }} />
                <p>Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 5MB.</p>
              </div>
            </div>

            <div className="admin-modal-form-group" style={{ gridColumn: isAdd ? "span 1" : "span 2" }}>
              <label className="admin-modal-label">Tên sản phẩm <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input
                type="text"
                placeholder="VD: iPhone 15 Pro Max"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
                className="admin-modal-input"
              />
            </div>

            {isAdd && (
              <div className="admin-modal-form-group">
                <label className="admin-modal-label">Mã sản phẩm <span style={{ color: "var(--color-danger)" }}>*</span></label>
                <input
                  type="text"
                  placeholder="VD: APL-IP15PM"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  required
                  className="admin-modal-input"
                />
              </div>
            )}

            <div className="admin-modal-form-group">
              <label className="admin-modal-label">Hãng sản xuất <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input
                type="text"
                placeholder="VD: Apple"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                className="admin-modal-input"
              />
            </div>

            <div className="admin-modal-form-group">
              <label className="admin-modal-label">Màu sắc</label>
              <input
                type="text"
                placeholder="VD: Titan xanh"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="admin-modal-input"
              />
            </div>

            <div className="admin-modal-form-group">
              <label className="admin-modal-label">Giá tiền (VND) <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="admin-modal-input"
              />
            </div>

            <div className="admin-modal-form-group">
              <label className="admin-modal-label">Bảo hành (Tháng) <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input
                type="number"
                value={formData.warrantyMonths}
                onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                required
                className="admin-modal-input"
              />
            </div>

            {!isAdd && (
              <div className="admin-modal-form-group">
                <label className="admin-modal-label">Trạng thái sản phẩm</label>
                <div className="admin-status-switch">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`status-switch-btn ${formData.isActive ? "active success" : ""}`}
                  >
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    className={`status-switch-btn ${!formData.isActive ? "active danger" : ""}`}
                  >
                    Tạm khóa
                  </button>
                </div>
              </div>
            )}

            <div className="admin-modal-form-group full-width">
              <label className="admin-modal-label">Cấu hình chi tiết</label>
              <input
                type="text"
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                className="admin-modal-input"
              />
            </div>

            <div className="admin-modal-form-group full-width">
              <label className="admin-modal-label">Mô tả sản phẩm</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="admin-modal-textarea"
                style={{ resize: "none" }}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="admin-secondary-btn"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-primary-btn"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Đang xử lý..." : isAdd ? "Tạo sản phẩm" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductDetailModal({ product, onClose }) {
  const [allRepairs, setAllRepairs] = useState([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);

  useEffect(() => {
    if (product?.productCode) {
      fetchRepairHistory();
    }
  }, [product?.productCode]);

  const fetchRepairHistory = async () => {
    try {
      setLoadingRepairs(true);
      const res = await repairService.getRepairsByModel(product.productCode);
      setAllRepairs(res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử sửa chữa dòng máy:", err);
    } finally {
      setLoadingRepairs(false);
    }
  };

  if (!product) return null;

  // Group repairs by warrantyId
  const repairsByDevice = allRepairs.reduce((acc, repair) => {
    const wid = repair.warrantyId;
    if (!acc[wid]) acc[wid] = [];
    acc[wid].push(repair);
    return acc;
  }, {});

  const fieldLabel = { fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 4, display: "block", letterSpacing: "0.05em" };
  const fieldValue = { fontSize: 13, fontWeight: 600, color: "#1e293b", display: "block" };
  const infoBoxStyle = { background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1.5px solid #f1f5f9" };

  const allFields = [
    { label: "Tên sản phẩm", value: product.productName },
    { label: "Màu sắc", value: product.color || "-" },
    { label: "Mã sản phẩm", value: product.productCode },
    { label: "Hãng sản xuất", value: product.brand },
    { label: "Cấu hình máy", value: product.config || "-" },
    { label: "Thời hạn bảo hành", value: `${product.warrantyMonths} tháng` },
    { label: "Giá bán (VNĐ)", value: product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "-" },
    { label: "Trạng thái", value: (product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "Hoạt động" : "Tạm khóa" },
    { label: "Ngày tạo hệ thống", value: product.createdAt ? new Date(product.createdAt).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-" },
    { label: "Cập nhật cuối", value: product.updatedAt ? new Date(product.updatedAt).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-" },
  ];

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ backdropFilter: "blur(8px)" }}>
      <div className="admin-modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="admin-list-title-icon-box" style={{ background: "var(--grey-50)", color: "var(--navy-primary)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h2 className="admin-modal-title" style={{ fontSize: "var(--text-md)" }}>Chi tiết & Lịch sử dòng máy</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--grey-500)", fontWeight: 500 }}>{product.productName}</span>
            </div>
          </div>
          <button onClick={onClose} className="admin-modal-close-btn">×</button>
        </div>

        {/* Dual Panel Body */}
        <div className="detail-panels">

          {/* LEFT PANEL: REPAIR HISTORY (40%) */}
          <div className="detail-panel-sidebar hide-scrollbar">
            <h3 className="detail-section-title">
              Lịch sử sửa chữa dòng máy
            </h3>

            {loadingRepairs ? (
              <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--grey-400)" }}>Đang tải lịch sử...</div>
            ) : Object.keys(repairsByDevice).length === 0 ? (
              <div style={{ padding: "6rem 2rem", textAlign: "center", background: "var(--white)", borderRadius: "1.6rem", border: "1.5px dashed var(--grey-100)" }}>
                <p style={{ margin: 0, color: "var(--grey-500)" }}>Dòng máy này chưa có ghi nhận sửa chữa nào.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                {Object.entries(repairsByDevice).map(([wid, repairs]) => (
                  <div key={wid} className="repair-history-card">
                    <div className="repair-history-device">
                      <span className="detail-info-label">Thiết bị (IMEI)</span>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--navy-primary)" }}>{repairs[0].serialNumber}</div>
                    </div>
                    <div className="repair-timeline-mini">
                      {repairs.map((r) => (
                        <div key={r.id} className="repair-timeline-item">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--grey-400)", fontWeight: 600 }}>{new Date(r.repairDate).toLocaleDateString("vi-VN")}</div>
                            <div className="status-badge" style={{
                              fontSize: "1rem",
                              background: getStatusConfig(r.status).background,
                              color: getStatusConfig(r.status).color,
                              borderColor: getStatusConfig(r.status).borderColor,
                            }}>
                              {getStatusConfig(r.status).label}
                            </div>
                          </div>
                          <div style={{ fontSize: "var(--text-sm)", color: "var(--navy-900)", fontWeight: 700, lineHeight: 1.4 }}>{r.repairContent}</div>
                          {r.cost > 0 && <div style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", fontWeight: 700, marginTop: "0.4rem" }}>Chi phí: {r.cost.toLocaleString()} ₫</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: PRODUCT INFO (60%) */}
          <div className="detail-panel-main hide-scrollbar">
            <div className="detail-info-grid">

              {/* IMAGE: Span 4 Rows on Left Side */}
              <div style={{ gridRow: "span 4", background: "var(--grey-50)", borderRadius: "1.6rem", border: "1.5px solid var(--grey-100)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                    alt={product.productName}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1.2rem" }}
                  />
                ) : <div style={{ color: "var(--grey-300)" }}>Không có ảnh</div>}
              </div>

              {/* FIRST FOUR FIELDS: Flowing next to the image */}
              {allFields.slice(0, 4).map((field, idx) => (
                <div key={idx} className="detail-info-item">
                  <span className="detail-info-label">{field.label}</span>
                  <span className="detail-info-value">{field.value}</span>
                </div>
              ))}

              {/* REMAINING FIELDS: Below Image */}
              {allFields.slice(4).map((field, idx) => (
                <div key={idx} className="detail-info-item">
                  <span className="detail-info-label">{field.label}</span>
                  <span className={`detail-info-value ${field.label === "Trạng thái" ? "status-badge-inline" : ""}`}
                    style={field.label === "Trạng thái" ? {
                      background: (product.isActive === true || product.isActive === "active") ? "var(--color-success)" : "var(--color-danger)",
                      color: "white", borderRadius: "2rem", padding: "0.2rem 1rem", fontSize: "1.1rem", display: "inline-block", width: "fit-content"
                    } : {}}>
                    {field.value}
                  </span>
                </div>
              ))}

              {/* DESCRIPTION: Full Width */}
              <div className="detail-info-item" style={{ gridColumn: "span 2", marginTop: "0.8rem" }}>
                <span className="detail-info-label">Mô tả sản phẩm</span>
                <p style={{ margin: 0, lineHeight: 1.6, color: "var(--grey-600)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
                  {product.description || <span style={{ color: "var(--grey-300)" }}>Không có mô tả</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("Tất cả"); // Quick Filter (Nút ngoài)
  const [filterBrand, setFilterBrand] = useState("all"); // Lọc theo hãng (Trong Popup)
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity, label: "Tất cả mức giá" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // Click hàng xem chi tiết
  const [editingProduct, setEditingProduct] = useState(null);   // Click Sửa
  const [isAddingProduct, setIsAddingProduct] = useState(false); // Click Thêm mới
  const [deletingProduct, setDeletingProduct] = useState(null); // Click Xóa
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      setProducts(res.data || []);
      toast.success("Đã tải danh sách sản phẩm.");
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu Admin: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (code, data) => {
    try {
      await productService.updateProduct(code, data);
      await fetchProducts(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      await productService.deleteProduct(product.productCode);
      toast.success(`Đã xóa sản phẩm ${product.productName}`);
      setDeletingProduct(null);
      await fetchProducts(); // Refresh list
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Xóa thất bại!";
      toast.error(errorMsg);
    }
  };

  const allCategories = useMemo(() => {
    // Normalize and collect unique brands
    const categories = new Set(BASE_CATEGORIES.map(b => b.trim()));
    products.forEach(p => {
      if (p.brand) {
        // Ensure we don't add duplicates with different casing
        const exists = Array.from(categories).some(c => c.toLowerCase() === p.brand.toLowerCase());
        if (!exists) categories.add(p.brand.trim());
      }
    });
    return Array.from(categories).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isActiveStatus = p.isActive === true || p.status === "active";
      const isExpiredStatus = p.isActive === false || p.status === "expired";

      // Logic lọc theo yêu cầu:
      // - Nếu chọn "Tất cả" hoặc "Hoạt động": Chỉ hiện máy đang hoạt động (ẩn máy đã xóa/khóa)
      // - Nếu chọn "Tạm khóa": Hiện máy đã khóa/hết hạn
      const statusMatch =
        (filterStatus === "all" && isActiveStatus) ||
        (filterStatus === "active" && isActiveStatus) ||
        (filterStatus === "expired" && isExpiredStatus);

      // Phân loại tự động (quick filter ngoài màn hình)
      const derivedType = categorizeProduct(p.productName);
      const typeMatch = filterType === "Tất cả" || derivedType === filterType;

      // Lọc theo hãng (trong Popup)
      const brandMatch = filterBrand === "all" ||
        (p.brand && p.brand.toLowerCase() === filterBrand.toLowerCase());

      // Lọc theo giá (trong Popup)
      const prodPrice = Number(p.price) || 0;
      const priceMatch = prodPrice >= priceRange.min && prodPrice <= priceRange.max;

      const searchMatch =
        searchTerm === "" ||
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode?.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && typeMatch && brandMatch && priceMatch && searchMatch;
    });
  }, [products, filterStatus, filterType, filterBrand, priceRange, searchTerm]);

  // Logic Phân trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Tự động quay về trang 1 khi lọc hoặc tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType, filterBrand, priceRange, searchTerm]);

  // Cuộn lên đầu bảng khi chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={listTopRef} className="admin-list-container">
      {/* Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Add Modal */}
      {isAddingProduct && (
        <ProductFormModal
          mode="add"
          onClose={() => setIsAddingProduct(false)}
          onSave={fetchProducts}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <ProductFormModal
          mode="edit"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        brands={allCategories}
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      {/* Header */}
      <div className="admin-list-header">
        <div className="admin-list-title-group">
          <div className="admin-list-title-icon-box" style={{ background: "#eff6ff", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
          </div>
          <h2 className="admin-list-title">Danh sách sản phẩm</h2>
          <span className="admin-list-count-badge">
            {filteredProducts.length} sản phẩm
          </span>
        </div>
        <div className="admin-list-actions">
          <button
            onClick={() => setIsAddingProduct(true)}
            className="admin-primary-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="admin-list-toolbar">
        <div className="admin-list-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button
          className={`admin-secondary-btn ${ (filterBrand !== "all" || priceRange.label !== "Tất cả mức giá") ? "active-filter" : "" }`}
          onClick={() => setIsFilterModalOpen(true)}
          style={ (filterBrand !== "all" || priceRange.label !== "Tất cả mức giá") ? { background: "var(--navy-primary)", color: "white", borderColor: "var(--navy-primary)" } : {} }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Bộ lọc
        </button>
      </div>

      {/* Status + Category filter pills */}
      <div className="admin-list-filters-row product-list-filters">
        {["all", "active", "expired"].map((s) => (
          <button
            key={s}
            className={`filter-btn ${filterStatus === s ? "active" : ""} ${s === "active" ? "success" : s === "expired" ? "danger" : ""}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === "all" ? "Tất cả" : s === "active" ? "Đang hoạt động" : "Tạm khóa"}
          </button>
        ))}

        <div className="admin-list-filters-divider" />

        {UI_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${filterType === cat ? " active" : ""}`}
            onClick={() => setFilterType(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="product-table" style={{ tableLayout: "fixed", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Sản phẩm</th>
              <th style={{ width: "10%" }}>Hãng</th>
              <th style={{ width: "12%" }}>Giá tiền</th>
              <th style={{ width: "10%" }}>Bảo hành</th>
              <th style={{ width: "15%" }}>Cấu hình</th>
              <th style={{ width: "18%" }}>Nội dung sửa chữa</th>
              <th style={{ width: "10%", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr
                key={product._id}
                className="product-row"
                onClick={() => setSelectedProduct(product)}
                onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td onClick={() => setSelectedProduct(product)} style={{ cursor: "pointer" }}>
                  <div className="product-cell-box">
                    <div className="product-cell-img-wrapper" style={{ border: `2px solid ${(product.isActive === true || product.isActive === "active") ? "var(--color-success)" : "var(--color-danger)"}` }}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                          alt={product.productName}
                        />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="product-cell-info">
                      <div className="product-cell-title" title={product.productName}>
                        {product.productName}
                      </div>
                      <div className="product-cell-subtitle">
                        <span>{product.productCode}</span>
                        <span className="product-cell-status-dot" style={{ color: (product.isActive === true || product.isActive === "active") ? "var(--color-success)" : "var(--color-danger)" }}>
                          • {(product.isActive === true || product.isActive === "active") ? "hoạt động" : "tạm khóa"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.brand || "N/A"}</span>
                </td>
                <td>
                  <div className="product-cell-price">
                    {product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "N/A"}
                  </div>
                </td>
                <td>
                  <div className="product-cell-text">{product.warrantyMonths} tháng</div>
                </td>
                <td>
                  <div className="product-cell-text product-cell-truncate" title={product.config}>
                    {product.config || "Tiêu chuẩn"}
                  </div>
                </td>
                <td>
                  {product.latestRepair ? (
                    <div className="product-cell-info">
                      <div className="product-cell-title product-cell-truncate" title={product.latestRepair.repairContent}>
                        {product.latestRepair.repairContent}
                      </div>
                      <div className="product-cell-meta">
                        {new Date(product.latestRepair.repairDate).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="product-cell-meta">Chưa sửa chữa</div>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="table-action-btn danger"
                      title="Xóa sản phẩm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProduct(product);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                    <button
                      className="table-action-btn primary"
                      title="Chỉnh sửa"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProduct(product);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Không tìm thấy sản phẩm nào.</div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          {/* Left: Spacer */}
          <div></div>

          {/* Center: Controls */}
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-btn ${currentPage === page ? "active" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Right: Info */}
          <div className="pagination-info">
            Hiển thị <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</strong> trên <strong>{filteredProducts.length}</strong> sản phẩm
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
