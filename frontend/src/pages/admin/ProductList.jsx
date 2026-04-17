import { useState, useMemo } from "react";

const mockProducts = [
  {
    id: 1,
    name: "Samsung Galaxy Watch Ultra",
    serial: "SN: GLX-W-ULTRA",
    productCode: "GLX-W-ULTRA",
    category: "Samsung",
    brand: "Samsung",
    color: "Titanium",
    config: "47mm, Titan, lặn sâu 100m",
    warrantyPeriod: "24",
    price: "12990000",
    description: "Đồng hồ thông minh cao cấp Samsung Galaxy Watch Ultra với thiết kế titan bền bỉ.",
    owner: "John Doe",
    ownerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0d8f",
    purchaseDate: "2025-03-15",
    expiryDate: "2027-03-15",
    status: "active",
    repairs: 3,
    lastRepair: "2026-02-14",
    image: null,
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max",
    serial: "SN: IP15-PM-001",
    productCode: "IP15-PM-001",
    category: "Apple",
    brand: "Apple",
    color: "Natural Titanium",
    config: "256GB, A17 Pro, USB-C",
    warrantyPeriod: "12",
    price: "34990000",
    description: "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP và thiết kế titan cao cấp.",
    owner: "John Doe",
    ownerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0d8f",
    purchaseDate: "2025-03-15",
    expiryDate: "2027-03-15",
    status: "active",
    repairs: 3,
    lastRepair: "2026-02-14",
    image: null,
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    serial: "SN: MBP-M3-16",
    productCode: "MBP-M3-16",
    category: "Apple",
    brand: "Apple",
    color: "Space Black",
    config: "M3 Pro, 18GB RAM, 512GB SSD",
    warrantyPeriod: "12",
    price: "59990000",
    description: "MacBook Pro 16 inch với chip M3 Pro, màn hình Liquid Retina XDR và pin lên đến 22 giờ.",
    owner: "John Doe",
    ownerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0d8f",
    purchaseDate: "2025-03-15",
    expiryDate: "2027-03-15",
    status: "active",
    repairs: 3,
    lastRepair: "2026-02-14",
    image: null,
  },
  {
    id: 4,
    name: "Apple Watch Ultra 2",
    serial: "SN: AWATCH-ULT",
    productCode: "AWATCH-ULT",
    category: "Apple",
    brand: "Apple",
    color: "Natural Titanium",
    config: "49mm, S9 chip, GPS + Cellular",
    warrantyPeriod: "12",
    price: "22990000",
    description: "Apple Watch Ultra 2 - đồng hồ thông minh cứng cáp nhất của Apple dành cho thể thao khắc nghiệt.",
    owner: "John Doe",
    ownerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0d8f",
    purchaseDate: "2025-03-15",
    expiryDate: "2027-03-15",
    status: "active",
    repairs: 3,
    lastRepair: "2026-02-14",
    image: null,
  },
  {
    id: 5,
    name: "AirPods Pro 2",
    serial: "SN: AIRPODS-P2",
    productCode: "AIRPODS-P2",
    category: "Apple",
    brand: "Apple",
    color: "White",
    config: "H2 chip, ANC, USB-C",
    warrantyPeriod: "12",
    price: "6490000",
    description: "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động ANC cải tiến và âm thanh không gian.",
    owner: "John Doe",
    ownerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0d8f",
    purchaseDate: "2025-03-15",
    expiryDate: "2027-03-15",
    status: "active",
    repairs: 3,
    lastRepair: "2026-02-14",
    image: null,
  },
];

const ALL_CATEGORIES = ["Samsung", "Apple"];

const fieldLabel = { fontWeight: 600, fontSize: 12, color: "#64748b", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: "0.03em" };
const fieldValue = { fontSize: 14, color: "#0f172a", fontWeight: 400 };

function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const rows = [
    [
      { label: "Product Code", value: product.productCode },
      { label: "Product Name", value: product.name },
    ],
    [
      { label: "Brand", value: product.brand },
      { label: "Color", value: product.color },
    ],
    [
      { label: "Config", value: product.config },
      { label: "Warranty Period", value: `${product.warrantyPeriod} months` },
    ],
    [
      { label: "Price (VND)", value: product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "-" },
      { label: "Status", value: product.status },
    ],
    [
      { label: "Purchase Date", value: product.purchaseDate },
      { label: "Expiry Date", value: product.expiryDate },
    ],
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 18,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1.5px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>{product.name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{product.serial}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none", background: "#f1f5f9", borderRadius: "50%",
              width: 32, height: 32, cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b", transition: "background 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"}
            onMouseOut={(e) => e.currentTarget.style.background = "#f1f5f9"}
          >×</button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Product image placeholder */}
          <div style={{
            background: "#f8fafc", border: "1.5px dashed #d1d5db",
            borderRadius: 10, height: 140, marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8, color: "#94a3b8",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: 13 }}>No image available</span>
          </div>

          {/* Fields grid */}
          {rows.map((pair, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", marginBottom: 18 }}>
              {pair.map((field, fi) => (
                <div key={fi} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", border: "1.5px solid #e2e8f0" }}>
                  <span style={fieldLabel}>{field.label}</span>
                  <span style={{
                    ...fieldValue,
                    ...(field.label === "Status" ? {
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: product.status === "active" ? "#10b981" : "#ef4444",
                      color: "white", borderRadius: 20, padding: "2px 10px",
                      fontSize: 12, fontWeight: 700
                    } : {})
                  }}>
                    {field.value || <span style={{ color: "#d1d5db" }}>—</span>}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* Description */}
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", border: "1.5px solid #e2e8f0", marginBottom: 18 }}>
            <span style={fieldLabel}>Description</span>
            <p style={{ ...fieldValue, margin: 0, lineHeight: 1.6, color: "#475569" }}>
              {product.description || <span style={{ color: "#d1d5db" }}>No description</span>}
            </p>
          </div>

          {/* Owner info */}
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: "12px 14px", border: "1.5px solid #bfdbfe" }}>
            <span style={{ ...fieldLabel, color: "#1e40af" }}>Owner</span>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{product.owner}</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#3b82f6", marginTop: 2, wordBreak: "break-all" }}>
              {product.ownerWallet}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", color: "#475569", border: "none",
              borderRadius: 10, padding: "10px 24px", fontWeight: 600,
              fontSize: 14, cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"}
            onMouseOut={(e) => e.currentTarget.style.background = "#f1f5f9"}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductList() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      const statusMatch = filterStatus === "all" || p.status === filterStatus;
      const categoryMatch = filterCategory === "all" || p.category === filterCategory;
      const searchMatch =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && categoryMatch && searchMatch;
    });
  }, [filterStatus, filterCategory, searchTerm]);

  return (
    <div className="product-list-container">
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>All Warranty Products</span>
        </div>
        <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
          {filteredProducts.length} products
        </span>
      </div>

      {/* Search + Filter row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search by name, serial, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button className="action-btn" style={{ width: "auto", padding: "0 16px", gap: 6, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
        </button>
      </div>

      {/* Status + Category filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {["all", "active", "expired"].map((s) => (
          <button
            key={s}
            className={`filter-btn${filterStatus === s ? " active" : ""}`}
            onClick={() => setFilterStatus(s)}
            style={
              filterStatus !== s && s === "active"
                ? { borderColor: "#10b981", color: "#10b981" }
                : filterStatus !== s && s === "expired"
                ? { borderColor: "#ef4444", color: "#ef4444" }
                : {}
            }
          >
            {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div style={{ width: 1, background: "#e2e8f0", margin: "0 4px" }} />

        <button className={`filter-btn${filterCategory === "all" ? " active" : ""}`} onClick={() => setFilterCategory("all")}>
          All Categories
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${filterCategory === cat ? " active" : ""}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Purchase Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Repairs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-name" style={{ color: "#1e40af" }}>{product.name}</div>
                    <div className="product-serial">{product.serial}</div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{product.owner}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                    {product.ownerWallet}
                  </div>
                </td>
                <td>{product.purchaseDate}</td>
                <td>{product.expiryDate}</td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: product.status === "active" ? "#10b981" : "#ef4444",
                    color: "white", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "inline-block" }} />
                    {product.status}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{product.repairs} times</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Last: {product.lastRepair}</div>
                </td>
                <td>
                  <div className="action-buttons">
                    {/* Eye button — opens detail modal */}
                    <button
                      className="action-btn view-btn"
                      title="View Details"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button className="action-btn download-btn" title="Download">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No products found.</div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
