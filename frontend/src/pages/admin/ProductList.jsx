import { useState, useMemo, useEffect } from "react";
import { productService } from "../../services/productService";
import { repairService } from "../../services/repairService";

const BASE_CATEGORIES = ["Samsung", "Apple"];

const fieldLabel = { fontWeight: 600, fontSize: 12, color: "#64748b", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: "0.03em" };
const fieldValue = { fontSize: 14, color: "#0f172a", fontWeight: 400 };

function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const rows = [
    [
      { label: "Product Code", value: product.productCode },
      { label: "Product Name", value: product.productName },
    ],
    [
      { label: "Brand", value: product.brand },
      { label: "Color", value: product.color },
    ],
    [
      { label: "Config", value: product.config },
      { label: "Warranty Period", value: `${product.warrantyMonths} months` },
    ],
    [
      { label: "Price (VND)", value: product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "-" },
      { label: "Status", value: product.isActive ? "Active" : "Inactive" },
    ],
    [
      { label: "Created At", value: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-" },
      { label: "Updated At", value: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "-" },
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
              <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>{product.productName}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{product.productCode}</div>
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
          <div style={{
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: 12, height: 260, marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative",
          }}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")} 
                alt={product.productName}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#94a3b8" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: 14 }}>Không có hình ảnh</span>
              </div>
            )}
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
                      background: (product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "#10b981" : "#ef4444",
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
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
    fetchProducts();
  }, []);

  const allCategories = useMemo(() => {
    const categories = new Set(BASE_CATEGORIES);
    products.forEach(p => { if (p.brand) categories.add(p.brand); });
    return Array.from(categories);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isActiveStatus = p.isActive === true || p.status === "active";
      const isExpiredStatus = p.isActive === false || p.status === "expired";
      
      const statusMatch = 
        filterStatus === "all" || 
        (filterStatus === "active" && isActiveStatus) ||
        (filterStatus === "expired" && isExpiredStatus);

      const categoryMatch = filterCategory === "all" || p.brand === filterCategory;
      const searchMatch =
        searchTerm === "" ||
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode?.toLowerCase().includes(searchTerm.toLowerCase());
        
      return statusMatch && categoryMatch && searchMatch;
    });
  }, [products, filterStatus, filterCategory, searchTerm]);

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
        {allCategories.map((cat) => (
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
              <th>Brand</th>
              <th>Price</th>
              <th>Warranty</th>
              <th>Config</th>
              <th>Repairs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td style={{ width: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    {/* Image with Status Halo */}
                    <div style={{ 
                      width: 50, height: 50, borderRadius: 12, overflow: "hidden", 
                      background: "#f8fafc", 
                      border: `2px solid ${(product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "#10b981" : "#ef4444"}`,
                      boxShadow: `0 0 10px ${(product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginRight: 14, transition: "all 0.3s ease"
                    }}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")} 
                          alt={product.productName}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                      <div style={{ 
                        color: "#1e40af", fontWeight: 700, fontSize: 13, lineHeight: 1.2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
                      }} title={product.productName}>
                        {product.productName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                          {product.productCode}
                        </span>
                        <span style={{ 
                          fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                          color: (product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "#10b981" : "#ef4444",
                          letterSpacing: "0.5px"
                        }}>
                          • {(product.isActive === true || product.isActive === "active" || product.isActive === "Active") ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.brand || "N/A"}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                    {product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "N/A"}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13, color: "#475569" }}>{product.warrantyMonths} months</div>
                </td>
                <td>
                  <div style={{ 
                    fontSize: 12, color: "#475569", maxWidth: 180, 
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
                  }} title={product.config}>
                    {product.config || "Standard"}
                  </div>
                </td>
                <td>
                  {product.latestRepair ? (
                    <div>
                      <div style={{ 
                        fontWeight: 700, color: "#1e40af", fontSize: 12, lineHeight: 1.3,
                        maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }} title={product.latestRepair.repairContent}>
                        {product.latestRepair.repairContent}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                        Last: {new Date(product.latestRepair.repairDate).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#cbd5e1" }}>No repairs</div>
                  )}
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
