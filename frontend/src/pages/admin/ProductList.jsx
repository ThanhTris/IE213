import { useState, useMemo } from "react";

function ProductList() {
  const [products] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      serial: "SN: FNQW8123XYZ",
      category: "Smartphones",
      owner: "John Doe (0x7426...08f)",
      purchaseDate: "2025-03-15",
      expiryDate: "2027-03-15",
      status: "active",
      repairs: 3,
    },
    {
      id: 2,
      name: 'MacBook Pro 16"',
      serial: "SN: C0ZZ456LMD6",
      category: "Laptops",
      owner: "Jane Smith (0x8a3d...0bc2)",
      purchaseDate: "2025-01-20",
      expiryDate: "2028-01-20",
      status: "active",
      repairs: 1,
    },
    {
      id: 3,
      name: "Apple Watch Ultra",
      serial: "SN: HTGM789FLQ",
      category: "Wearables",
      owner: "Mike Johnson (0x1f5a...9ac)",
      purchaseDate: "2023-06-10",
      expiryDate: "2024-06-10",
      status: "expired",
      repairs: 0,
    },
    {
      id: 4,
      name: "iPad Pro 12.9\"",
      serial: "SN: DMPH234ABC",
      category: "Tablets",
      owner: "Sarah Williams (0x9c2b...de3)",
      purchaseDate: "2025-08-05",
      expiryDate: "2027-08-05",
      status: "active",
      repairs: 2,
    },
    {
      id: 5,
      name: "AirPods Pro 2",
      serial: "SN: XYWZ567EFG",
      category: "Audio",
      owner: "David Chen (0x7d4c...df2a)",
      purchaseDate: "2025-11-12",
      expiryDate: "2026-11-12",
      status: "active",
      repairs: 0,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(dateStr)) {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by status
      const statusMatch = filterStatus === "all" || product.status === filterStatus;

      // Filter by search term
      const searchMatch = searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.owner.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [products, filterStatus, searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      active: { backgroundColor: "#10b981", color: "white" },
      expired: { backgroundColor: "#ef4444", color: "white" },
    };
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          ...styles[status],
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="product-list-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by name, serial, category, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Status
          </button>
          <button
            className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filterStatus === "expired" ? "active" : ""}`}
            onClick={() => setFilterStatus("expired")}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Product Count */}
      <div className="product-count">
        <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Product Table */}
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
                    <div className="product-name">{product.name}</div>
                    <div className="product-serial">{product.serial}</div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td>{product.owner}</td>
                <td>{formatDate(product.purchaseDate)}</td>
                <td>{formatDate(product.expiryDate)}</td>
                <td>{getStatusBadge(product.status)}</td>
                <td>
                  <span className="repair-count">{product.repairs} times</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view-btn" title="View Details">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button className="action-btn download-btn" title="Download">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;
