import { useState, useMemo, useEffect, useRef } from "react";
import { productService } from "../../services/productService";
import { repairService } from "../../services/repairService";

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Bộ lọc nâng cao</h3>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>

        <div style={{ padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: 12, fontWeight: 700 }}>Chọn Hãng</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button 
                className={`filter-btn${filterBrand === "all" ? " active" : ""}`}
                onClick={() => setFilterBrand("all")}
              >Tất cả Hãng</button>
              {brands.map(b => (
                <button 
                  key={b}
                  className={`filter-btn${filterBrand === b ? " active" : ""}`}
                  onClick={() => setFilterBrand(b)}
                >{b}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: 12, fontWeight: 700 }}>Khoảng giá (VND)</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {pricePresets.map(p => (
                <button 
                  key={p.label}
                  className={`filter-btn${priceRange.label === p.label ? " active" : ""}`}
                  onClick={() => setPriceRange(p)}
                >{p.label}</button>
              ))}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
              <input 
                type="number" 
                placeholder="Giá tối thiểu" 
                value={priceRange.min === 0 && priceRange.label !== "" ? "" : priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value), label: "Tùy chọn" })}
                style={{ background: "transparent", border: "none", width: "100%", fontSize: 14, outline: "none" }}
              />
              <div style={{ width: 12, height: 2, background: "#cbd5e1" }} />
              <input 
                type="number" 
                placeholder="Giá tối đa" 
                value={priceRange.max === Infinity ? "" : priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value), label: "Tùy chọn" })}
                style={{ background: "transparent", border: "none", width: "100%", fontSize: 14, outline: "none" }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 24px", background: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button 
            onClick={() => {
              setFilterBrand("all");
              setPriceRange({ min: 0, max: Infinity, label: "Tất cả mức giá" });
            }}
            style={{ padding: "10px 20px", borderRadius: 999, border: "1.5px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >Làm mới</button>
          <button 
            onClick={onClose}
            style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: "#1e40af", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >Áp dụng</button>
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
      } else {
        await onSave(product.productCode, data);
      }
      onClose();
    } catch (err) {
      console.error(isAdd ? "Lỗi khi tạo sản phẩm:" : "Lỗi khi cập nhật sản phẩm:", err);
      alert(isAdd ? "Tạo sản phẩm thất bại!" : "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 32, width: "100%", maxWidth: 650, maxHeight: "90vh", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 32px", borderBottom: "1.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {isAdd ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </h3>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#64748b", fontSize: 20 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32, overflowY: "auto", flex: 1 }} className="hide-scrollbar">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Image Upload Area */}
            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 24, background: "#f8fafc", padding: "24px 32px", borderRadius: 24, border: "2px dashed #e2e8f0" }}>
              <div style={{ width: 160, height: 160, borderRadius: 20, background: "white", border: "1.5px solid #e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}>
                {previewUrl ? <img src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div style={{ color: "#cbd5e1" }}>No img</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10, display: "block" }}>Hình ảnh sản phẩm</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 13, color: "#64748b" }} />
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 5MB.</p>
              </div>
            </div>

            <div style={{ gridColumn: isAdd ? "span 1" : "span 2" }}>
              <label style={fieldLabel}>Tên sản phẩm <span style={{ color: "#ef4444" }}>*</span></label>
              <input 
                type="text" 
                placeholder="VD: iPhone 15 Pro Max"
                value={formData.productName} 
                onChange={e => setFormData({ ...formData, productName: e.target.value })} 
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "white" }}
              />
            </div>

            {isAdd && (
              <div>
                <label style={fieldLabel}>Mã sản phẩm <span style={{ color: "#ef4444" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="VD: APL-IP15PM"
                  value={formData.productCode} 
                  onChange={e => setFormData({ ...formData, productCode: e.target.value })} 
                  required
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "white" }}
                />
              </div>
            )}

            <div>
              <label style={fieldLabel}>Hãng sản xuất <span style={{ color: "#ef4444" }}>*</span></label>
              <input 
                type="text" 
                placeholder="VD: Apple"
                value={formData.brand} 
                onChange={e => setFormData({ ...formData, brand: e.target.value })} 
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "white" }}
              />
            </div>

            <div>
              <label style={fieldLabel}>Giá tiền (VND) <span style={{ color: "#ef4444" }}>*</span></label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({ ...formData, price: e.target.value })} 
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "white" }}
              />
            </div>

            <div>
              <label style={fieldLabel}>Bảo hành (Tháng) <span style={{ color: "#ef4444" }}>*</span></label>
              <input 
                type="number" 
                value={formData.warrantyMonths} 
                onChange={e => setFormData({ ...formData, warrantyMonths: e.target.value })} 
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "white" }}
              />
            </div>

            {!isAdd && (
              <div>
                <label style={fieldLabel}>Trạng thái sản phẩm</label>
                <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 100 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 100, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: formData.isActive ? "#10b981" : "transparent",
                      color: formData.isActive ? "white" : "#64748b",
                      boxShadow: formData.isActive ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none"
                    }}
                  >
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 100, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: !formData.isActive ? "#ef4444" : "transparent",
                      color: !formData.isActive ? "white" : "#64748b",
                      boxShadow: !formData.isActive ? "0 4px 12px rgba(239, 68, 68, 0.3)" : "none"
                    }}
                  >
                    Tạm khóa
                  </button>
                </div>
              </div>
            )}

            <div style={{ gridColumn: "span 2" }}>
              <label style={fieldLabel}>Cấu hình chi tiết</label>
              <input 
                type="text" 
                value={formData.config} 
                onChange={e => setFormData({ ...formData, config: e.target.value })} 
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "white" }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={fieldLabel}>Mô tả sản phẩm</label>
              <textarea 
                rows="3"
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none", resize: "none", background: "white" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
            <button 
              type="button"
              onClick={onClose} 
              style={{ padding: "12px 24px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, cursor: "pointer" }}
            >Hủy</button>
            <button 
              type="submit"
              disabled={saving}
              style={{ padding: "12px 32px", borderRadius: 14, border: "none", background: "#1e40af", color: "white", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Đang xử lý..." : (isAdd ? "Tạo sản phẩm" : "Lưu thay đổi")}
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      {/* Container expanded to 1100px */}
      <div 
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 1100,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CSS to hide scrollbar */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* Modal Header */}
        <div style={{ padding: "16px 28px", borderBottom: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#eff6ff", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Chi tiết & Lịch sử dòng máy</h2>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{product.productName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#64748b", fontSize: 20 }}>×</button>
        </div>

        {/* Dual Panel Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          
          {/* LEFT PANEL: REPAIR HISTORY (40%) */}
          <div className="hide-scrollbar" style={{ width: "40%", borderRight: "1.5px solid #f1f5f9", overflowY: "auto", background: "white", padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.01em" }}>
              <span style={{ width: 8, height: 8, background: "#2563eb", borderRadius: "50%" }}></span>
              Lịch sử sửa chữa dòng máy
            </h3>

            {loadingRepairs ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Đang tải lịch sử...</div>
            ) : Object.keys(repairsByDevice).length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", background: "white", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Dòng máy này chưa có ghi nhận sửa chữa nào.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(repairsByDevice).map(([wid, repairs]) => (
                  <div key={wid} style={{ background: "#f8fafc", borderRadius: 16, padding: 16, border: "1.5px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                    <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>Thiết bị (IMEI)</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>{repairs[0].serialNumber}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {repairs.map((r, idx) => (
                        <div key={r.id} style={{ position: "relative", paddingLeft: 20, borderLeft: "2px solid #d1fae5" }}>
                          <div style={{ position: "absolute", left: -5, top: 4, width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)" }}></div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{new Date(r.repairDate).toLocaleDateString("vi-VN")}</div>
                            <div style={{ 
                               fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                               background: r.status === "done" ? "#d1fae5" : "#fee2e2",
                               color: r.status === "done" ? "#065f46" : "#991b1b"
                            }}>
                              {r.status === "done" ? "Hoàn tất" : r.status || "Chờ xử lý"}
                            </div>
                          </div>
                          <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 700, lineHeight: 1.4 }}>{r.repairContent}</div>
                          {r.cost > 0 && <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginTop: 4 }}>Chi phí: {r.cost.toLocaleString()} ₫</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: PRODUCT INFO (60%) */}
          <div className="hide-scrollbar" style={{ width: "60%", overflowY: "auto", padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              
              {/* IMAGE: Span 4 Rows on Left Side */}
              <div style={{ gridRow: "span 4", background: "#f8fafc", borderRadius: 16, border: "1.5px solid #f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")} 
                    alt={product.productName}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }}
                  />
                ) : <div style={{ color: "#cbd5e1", fontSize: 13 }}>Không có ảnh</div>}
              </div>

              {/* FIRST FOUR FIELDS: Flowing next to the image (sequentially) */}
              {allFields.slice(0, 4).map((field, idx) => (
                <div key={idx} style={infoBoxStyle}>
                  <span style={fieldLabel}>{field.label}</span>
                  <span style={fieldValue}>{field.value}</span>
                </div>
              ))}

              {/* REMAINING FIELDS: Below Image (in 2-column grid) */}
              {allFields.slice(4).map((field, idx) => (
                <div key={idx} style={infoBoxStyle}>
                  <span style={fieldLabel}>{field.label}</span>
                  <span style={{
                    ...fieldValue,
                    ...(field.label === "Trạng thái" ? {
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: (product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "#10b981" : "#ef4444",
                      color: "white", borderRadius: 20, padding: "2px 10px", fontSize: 11
                    } : {})
                  }}>
                    {field.value}
                  </span>
                </div>
              ))}

              {/* DESCRIPTION: Full Width */}
              <div style={{ ...infoBoxStyle, gridColumn: "span 2", marginTop: 8 }}>
                <span style={fieldLabel}>Mô tả sản phẩm</span>
                <p style={{ ...fieldValue, margin: 0, lineHeight: 1.6, color: "#475569", fontWeight: 500 }}>
                  {product.description || <span style={{ color: "#d1d5db" }}>Không có mô tả</span>}
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
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Admin:", err);
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
      setDeletingProduct(null);
      await fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert("Xóa thất bại!");
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
    <div ref={listTopRef} className="product-list-container">
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#eff6ff", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0f172a", letterSpacing: "-0.02em" }}>Danh sách sản phẩm</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button 
            onClick={() => setIsAddingProduct(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0 20px", 
              height: 40, borderRadius: 999, border: "none", background: "#1e40af", color: "white",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease",
              boxShadow: "0 4px 10px rgba(30, 64, 175, 0.2)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 12px rgba(30, 64, 175, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(30, 64, 175, 0.2)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm sản phẩm
          </button>
          <span style={{ 
            background: "#f1f5f9", border: "1.25px solid #e2e8f0", borderRadius: 999, 
            height: 40, padding: "0 16px", display: "flex", alignItems: "center",
            fontSize: 12, color: "#64748b", fontWeight: 600 
          }}>
            {filteredProducts.length} sản phẩm
          </span>
        </div>
      </div>

      {/* Search + Filter row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ height: 44, paddingLeft: 48, fontSize: 14 }}
          />
          <span className="search-icon" style={{ left: 18 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button 
          className="action-btn" 
          onClick={() => setIsFilterModalOpen(true)}
          style={{ 
            width: "auto", 
            padding: "0 24px", 
            height: 44,
            gap: 8, 
            display: "flex", 
            alignItems: "center", 
            fontSize: 14, 
            fontWeight: 700, 
            borderRadius: 999,
            background: (filterBrand !== "all" || priceRange.label !== "Tất cả mức giá") ? "#1e40af" : "white",
            borderColor: (filterBrand !== "all" || priceRange.label !== "Tất cả mức giá") ? "#1e40af" : "#cbd5e1",
            color: (filterBrand !== "all" || priceRange.label !== "Tất cả mức giá") ? "white" : "#475569",
            transition: "all 0.3s ease",
            boxShadow: (filterBrand !== "all" || priceRange.label !== "Tất cả mức giá") ? "0 4px 10px rgba(30, 64, 175, 0.2)" : "none"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Bộ lọc
        </button>
      </div>

      {/* Status + Category filter pills */}
      <div style={{ 
        display: "flex", 
        gap: 8, 
        marginBottom: 24, 
        overflowX: "auto", 
        paddingBottom: "8px"
      }}>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {["all", "active", "expired"].map((s) => (
            <button
              key={s}
              className={`filter-btn${filterStatus === s ? " active" : ""}`}
              onClick={() => setFilterStatus(s)}
              style={
                filterStatus === s 
                  ? { 
                      background: s === "active" ? "#10b981" : s === "expired" ? "#ef4444" : "#1e40af",
                      color: "white",
                      borderColor: s === "active" ? "#10b981" : s === "expired" ? "#ef4444" : "#1e40af",
                      boxShadow: `0 4px 12px ${s === "active" ? "rgba(16,185,129,0.3)" : s === "expired" ? "rgba(239,68,68,0.25)" : "rgba(30,64,175,0.25)"}`
                    }
                  : s === "active"
                  ? { borderColor: "#10b981", color: "#10b981", background: "rgba(16, 185, 129, 0.05)" }
                  : s === "expired"
                  ? { borderColor: "#ef4444", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)" }
                  : {}
              }
            >
              {s === "all" ? "Tất cả" : s === "active" ? "Đang hoạt động" : "Tạm khóa"}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 8px", flexShrink: 0, alignSelf: "center" }} />

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
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
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="product-table" style={{ tableLayout: "fixed", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "260px", fontSize: "0.85rem", textTransform: "none" }}>Sản phẩm</th>
              <th style={{ width: "90px", fontSize: "0.85rem", textTransform: "none" }}>Hãng</th>
              <th style={{ width: "135px", fontSize: "0.85rem", textTransform: "none" }}>Giá tiền</th>
              <th style={{ width: "105px", fontSize: "0.85rem", textTransform: "none" }}>Bảo hành</th>
              <th style={{ width: "170px", fontSize: "0.85rem", textTransform: "none" }}>Cấu hình</th>
              <th style={{ width: "auto", fontSize: "0.85rem", textTransform: "none" }}>Nội dung sửa chữa</th>
              <th style={{ width: "120px", fontSize: "0.85rem", textTransform: "none", textAlign: "center" }}>Thao tác</th>
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
                <td>
                  <div style={{ display: "flex", alignItems: "center", paddingLeft: 0, overflow: "hidden" }}>
                    {/* Image with Status Halo */}
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 10, overflow: "hidden", 
                      background: "#f8fafc", 
                      border: `2px solid ${(product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "#10b981" : "#ef4444"}`,
                      boxShadow: `0 0 10px ${(product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginRight: 12, transition: "all 0.3s ease"
                    }}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")} 
                          alt={product.productName}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
                      <div style={{ 
                        color: "#1e40af", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
                      }} title={product.productName}>
                        {product.productName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {product.productCode}
                        </span>
                        <span style={{ 
                          fontSize: "0.75rem", fontWeight: 700, textTransform: "lowercase", flexShrink: 0,
                          color: (product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "#10b981" : "#ef4444",
                        }}>
                          • {(product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "hoạt động" : "tạm khóa"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.brand || "N/A"}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
                    {product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "N/A"}
                  </div>
                </td>
                <td>
                   <div style={{ fontSize: "0.85rem", color: "#475569", textAlign: "left" }}>{product.warrantyMonths} tháng</div>
                </td>
                <td>
                  <div style={{ 
                    fontSize: "0.85rem", color: "#475569", maxWidth: 170, 
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
                  }} title={product.config}>
                    {product.config || "Tiêu chuẩn"}
                  </div>
                </td>
                <td>
                  {product.latestRepair ? (
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ 
                        fontWeight: 700, color: "#1e40af", fontSize: "0.85rem", lineHeight: 1.3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }} title={product.latestRepair.repairContent}>
                        {product.latestRepair.repairContent}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                        {new Date(product.latestRepair.repairDate).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Chưa sửa chữa</div>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <div className="action-buttons" style={{ justifyContent: "center", display: "flex", gap: "8px" }}>
                    {/* Nút Sửa */}
                    <button
                      className="action-btn view-btn"
                      title="Chỉnh sửa"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProduct(product);
                      }}
                      style={{ 
                        width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #1e40af", 
                        color: "#1e40af", background: "white", display: "flex", alignItems: "center", 
                        justifyContent: "center", cursor: "pointer" 
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {/* Nút Xóa */}
                    <button 
                      className="action-btn download-btn" 
                      title="Xóa sản phẩm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProduct(product);
                      }}
                      style={{ 
                        width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #ef4444", 
                        color: "#ef4444", background: "white", display: "flex", alignItems: "center", 
                        justifyContent: "center", cursor: "pointer" 
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
      {totalPages > 0 && (
        <div style={{ 
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", 
          marginTop: 24, padding: "0 8px"
        }}>
          {/* Left Spacer */}
          <div></div>

          {/* Center: Pagination Buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === 1 ? "not-allowed" : "pointer",
                color: currentPage === 1 ? "#cbd5e1" : "#475569", transition: "all 0.2s"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "1.5px solid",
                  borderColor: currentPage === page ? "#1e40af" : "#e2e8f0",
                  background: currentPage === page ? "#1e40af" : "white",
                  color: currentPage === page ? "white" : "#475569",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                color: currentPage === totalPages ? "#cbd5e1" : "#475569", transition: "all 0.2s"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Right: Display Info */}
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textAlign: "right" }}>
            Hiển thị <span style={{ color: "#0f172a" }}>{startIndex + 1}</span> - <span style={{ color: "#0f172a" }}>{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> trên <span style={{ color: "#1e40af" }}>{filteredProducts.length}</span> sản phẩm
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
