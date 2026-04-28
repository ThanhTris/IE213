import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { repairService } from "../../../services/repairService";
import { getStatusConfig, REPAIR_STATUS_CONFIG } from "../../../utils/statusStyles";


const ITEMS_PER_PAGE = 10;


function FilterModal({ isOpen, onClose, filterStatus, setFilterStatus, filterType, setFilterType, technicianWallet, setTechnicianWallet, priceRange, setPriceRange, uniqueTechnicians }) {
  if (!isOpen) return null;

  const costPresets = [
    { label: "Tất cả mức giá", min: 0, max: Infinity },
    { label: "Dưới 500k", min: 0, max: 500000 },
    { label: "500k - 2tr", min: 500000, max: 2000000 },
    { label: "Trên 2 triệu", min: 2000000, max: Infinity },
  ];

  const allStatuses = [
    { id: "all", label: "Tất cả trạng thái" },
    { id: "pending", label: "Tiếp nhận" },
    { id: "waiting_parts", label: "Chờ linh kiện" },
    { id: "fixing", label: "Đang sửa" },
    { id: "completed", label: "Sửa xong" },
    { id: "delivered", label: "Đã giao" },
    { id: "cancelled", label: "Đã hủy" }
  ];

  const allTypes = [
    { id: "all", label: "Tất cả loại hình" },
    { id: "Màn hình", label: "Màn hình" },
    { id: "Pin/Nguồn", label: "Pin/Nguồn" },
    { id: "Phần cứng", label: "Phần cứng" },
    { id: "Phần mềm", label: "Phần mềm" },
    { id: "Khác", label: "Khác" }
  ];

  const getRepairTypeLabel = (type) => {
    const map = {
      "Màn hình": "Màn hình",
      "Pin/Nguồn": "Pin/Nguồn",
      "Phần cứng": "Phần cứng",
      "Phần mềm": "Phần mềm",
      "Khác": "Khác",
      "other": "Khác",
      "hardware": "Phần cứng",
      "software": "Phần mềm",
      "screen": "Màn hình",
      "battery": "Pin/Nguồn"
    };
    return map[type] || map[type?.toLowerCase()] || type || "Khác";
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" style={{ maxWidth: "55rem" }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Bộ lọc nâng cao</h3>
          <button onClick={onClose} className="admin-modal-close-btn">×</button>
        </div>

        <div className="admin-modal-body hide-scrollbar" style={{ maxHeight: "75vh", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Status Filter */}
            <div>
              <label style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 8, display: "block", textTransform: "uppercase" }}>Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}
              >
                {allStatuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 8, display: "block", textTransform: "uppercase" }}>Loại hình</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}
              >
                {allTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Technician Filter */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 8, display: "block", textTransform: "uppercase" }}>Kỹ thuật viên thực hiện</label>
              <select
                value={technicianWallet}
                onChange={(e) => setTechnicianWallet(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "monospace" }}
              >
                <option value="all">Tất cả kỹ thuật viên</option>
                {uniqueTechnicians.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Cost Range */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 12, display: "block", textTransform: "uppercase" }}>Khoảng chi phí (VND)</label>
              <div className="filter-button-group" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.2rem" }}>
                {costPresets.map((p) => (
                  <button
                    key={p.label}
                    className={`filter-btn ${priceRange.label === p.label ? "active" : ""}`}
                    onClick={() => setPriceRange(p)}
                    style={{
                      borderColor: priceRange.label === p.label ? "var(--navy-primary)" : "var(--grey-200)",
                      background: priceRange.label === p.label ? "var(--navy-primary)" : "transparent",
                      color: priceRange.label === p.label ? "var(--white)" : "var(--grey-600)"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer light-bg" style={{ padding: "20px 24px", display: "flex", gap: 12, borderTop: "1px solid #f1f5f9", justifyContent: "center" }}>
          <button
            onClick={() => {
              setFilterStatus("all");
              setFilterType("all");
              setTechnicianWallet("all");
              setPriceRange({ min: 0, max: Infinity, label: "Tất cả mức giá" });
            }}
            className="admin-secondary-btn"
            style={{ padding: "12px 24px", minWidth: "140px", textAlign: "center" }}
          >
            Làm mới bộ lọc
          </button>
          <button
            onClick={onClose}
            className="admin-primary-btn"
            style={{ padding: "12px 32px", minWidth: "140px", textAlign: "center" }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}


function RepairHistory() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRepair, setIsAddingRepair] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" hoặc "edit"
  const [updateForm, setUpdateForm] = useState({
    status: "",
    note: "",
    cost: 0,
    type: "",
    isWarrantyCovered: false
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [technicianWallet, setTechnicianWallet] = useState("all");
  const [priceRange, setPriceRange] = useState({ label: "Tất cả mức giá", min: 0, max: Infinity });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueTechnicians = useMemo(() => {
    const wallets = repairs.map(r => r.technicianWallet).filter(Boolean);
    return Array.from(new Set(wallets));
  }, [repairs]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await repairService.getAllRepairs();
      setRepairs(res.data || []);
    } catch (err) {
      toast.error("Lỗi khi tải lịch sử sửa chữa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType, technicianWallet, priceRange]);

  const getRepairTypeLabel = (type) => {
    const map = {
      "Màn hình": "Màn hình",
      "Pin/Nguồn": "Pin/Nguồn",
      "Phần cứng": "Phần cứng",
      "Phần mềm": "Phần mềm",
      "Khác": "Khác",
      "other": "Khác",
      "hardware": "Phần cứng",
      "software": "Phần mềm",
      "screen": "Màn hình",
      "battery": "Pin/Nguồn"
    };
    return map[type] || map[type?.toLowerCase()] || type || "Khác";
  };

  const filteredRecords = useMemo(() => {
    return repairs.filter((r) => {
      // 1. Tìm kiếm theo text
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        (r.serialNumber || "").toLowerCase().includes(q) ||
        (r.repairContent || "").toLowerCase().includes(q) ||
        (r.technicianWallet || "").toLowerCase().includes(q);

      // 2. Lọc theo trạng thái
      const matchStatus = filterStatus === "all" || r.status === filterStatus;

      // 3. Lọc theo thể loại
      const matchType = filterType === "all" || getRepairTypeLabel(r.type) === getRepairTypeLabel(filterType);

      // 4. Lọc theo kỹ thuật viên
      const matchTechnician = technicianWallet === "all" || r.technicianWallet === technicianWallet;

      // 5. Lọc theo giá
      const matchPrice = r.cost >= priceRange.min && r.cost <= priceRange.max;

      return matchSearch && matchStatus && matchType && matchTechnician && matchPrice;
    });
  }, [repairs, searchTerm, filterStatus, filterType, technicianWallet, priceRange]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableElement = document.querySelector(".table-wrapper");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openDetail = (repair, mode = "view") => {
    setSelectedRepair(repair);
    setModalMode(mode);
    setUpdateForm({
      status: "",
      note: "",
      cost: repair.cost || 0,
      type: repair.type || "Khác",
      isWarrantyCovered: repair.isWarrantyCovered || false
    });
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setSelectedRepair(null);
    setIsModalOpen(false);
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsUpdating(true);
      const payload = {
        cost: updateForm.cost,
        type: updateForm.type,
        isWarrantyCovered: updateForm.isWarrantyCovered
      };

      if (updateForm.status) {
        payload.status = updateForm.status;
        payload.note = updateForm.note || `Cập nhật trạng thái sang ${updateForm.status}`;
      }

      await repairService.updateRepairStatus(selectedRepair.id, payload);
      toast.success("Đã cập nhật thông tin sửa chữa.");
      closeDetail();
      fetchRepairs();
    } catch (err) {
      toast.error("Lỗi khi cập nhật: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = (e, repair) => {
    e.stopPropagation(); // Ngăn sự kiện click row
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY phiếu sửa chữa cho thiết bị ${repair.serialNumber}?`)) return;

    try {
      repairService.updateRepairStatus(repair.id, {
        status: "cancelled",
        note: "Hủy phiếu sửa chữa bởi Admin"
      }).then(() => {
        toast.success("Đã hủy phiếu sửa chữa.");
        fetchRepairs();
      });
    } catch (err) {
      toast.error("Lỗi khi hủy: " + (err.response?.data?.message || err.message));
    }
  };

  const coveredCount = repairs.filter((r) => r.isWarrantyCovered).length;
  const notCoveredCount = repairs.filter((r) => !r.isWarrantyCovered).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="admin-list-container">
      {/* Header */}
      <div className="admin-list-header">
        <div className="admin-list-title-group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <h2 className="admin-list-title">Lịch Sử Sửa Chữa Hệ Thống</h2>
          <span className="admin-list-count-badge">
            {repairs.length} lượt sửa chữa
          </span>
        </div>
        <div className="admin-list-actions">
          <button
            onClick={() => setIsAddingRepair(true)}
            className="admin-primary-btn"
            style={{ boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm phiếu sửa chữa
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="repair-stats-v4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <div className="stat-card-v4" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tổng lượt sửa chữa</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{repairs.length}</span>
        </div>
        <div className="stat-card-v4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trong bảo hành</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#16a34a" }}>{coveredCount}</span>
        </div>
        <div className="stat-card-v4" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ngoài bảo hành</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>{notCoveredCount}</span>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="admin-list-toolbar" style={{ marginBottom: 24 }}>
        <div className="admin-list-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo serial, nội dung, kỹ thuật viên..."
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
          className={`admin-secondary-btn ${(filterStatus !== "all" || filterType !== "all" || technicianWallet !== "all" || priceRange.label !== "Tất cả mức giá") ? "active-filter" : ""}`}
          onClick={() => setIsFilterModalOpen(true)}
          style={(filterStatus !== "all" || filterType !== "all" || technicianWallet !== "all" || priceRange.label !== "Tất cả mức giá") ? { background: "var(--navy-primary)", color: "white", borderColor: "var(--navy-primary)" } : {}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Bộ lọc
        </button>
      </div>

      {/* Status + Type filter pills */}
      <div className="admin-list-filters-row" style={{ marginBottom: 24 }}>
        {[
          { id: "all", label: "Tất cả", colorVar: "var(--navy-primary)" },
          { id: "pending", label: "Tiếp nhận", colorVar: "var(--status-pending)" },
          { id: "fixing", label: "Đang sửa", colorVar: "var(--status-fixing)" },
          { id: "completed", label: "Sửa xong", colorVar: "var(--status-completed)" },
          { id: "cancelled", label: "Đã hủy", colorVar: "var(--status-cancelled)" }
        ].map((s) => (
          <button
            key={s.id}
            className={`filter-btn ${filterStatus === s.id ? "active" : ""}`}
            onClick={() => setFilterStatus(s.id)}
            style={{
              borderColor: s.colorVar,
              color: filterStatus === s.id ? "var(--white)" : s.colorVar,
              background: filterStatus === s.id ? s.colorVar : "transparent"
            }}
          >
            {s.label}
          </button>
        ))}

        <div className="admin-list-filters-divider" />

        {[
          { id: "all", label: "Tất cả" },
          { id: "Màn hình", label: "Màn hình" },
          { id: "Pin/Nguồn", label: "Pin/Nguồn" },
          { id: "Khác", label: "Khác" }
        ].map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn${filterType === cat.id ? " active" : ""}`}
            onClick={() => setFilterType(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="repair-table">
          <thead>
            <tr>
              <th style={{ width: "14%" }}>Số Serial</th>
              <th style={{ width: "8%" }}>Loại hình</th>
              <th style={{ width: "20%" }}>Nội dung chính</th>
              <th style={{ width: "14%" }}>Chi phí</th>
              <th style={{ width: "10%" }}>Kỹ thuật viên</th>
              <th style={{ width: "12%" }}>Ngày thực hiện</th>
              <th style={{ width: "10%" }}>Bảo hành</th>
              <th style={{ width: "12%" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((record) => (
              <tr
                key={record._id}
                onClick={() => openDetail(record, "view")}
                style={{ cursor: "pointer" }}
                className="hoverable-row"
              >
                <td className="product-cell-text product-cell-title">{record.serialNumber}</td>
                <td className="product-cell-text" style={{ fontWeight: 700, color: "var(--grey-600)" }}>
                  {getRepairTypeLabel(record.type)}
                </td>
                <td style={{ maxWidth: "180px" }}>
                  <div className="product-cell-text product-cell-truncate" title={record.repairContent}>
                    {record.repairContent}
                  </div>
                </td>
                <td className="product-cell-price">
                  {record.cost > 0 ? Number(record.cost).toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                </td>
                <td>
                  <div className="product-cell-meta" style={{ fontFamily: "monospace" }} title={record.technicianWallet}>
                    {record.technicianWallet ? `${record.technicianWallet.slice(0, 8)}...` : "N/A"}
                  </div>
                </td>
                <td className="product-cell-text">
                  {record.repairDate ? new Date(record.repairDate).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td>
                  <span className={`filter-btn active ${record.isWarrantyCovered ? "success" : "danger"}`} style={{ padding: "0.6rem 1.4rem", fontSize: "1.4rem", height: "auto", minHeight: "unset" }}>
                    {record.isWarrantyCovered ? "Có" : "Không"}
                  </span>
                </td>
                <td>
                  <span className="filter-btn active" style={{
                    padding: "0.8rem 1.4rem",
                    fontSize: "1.4rem",
                    height: "auto",
                    minHeight: "unset",
                    background: getStatusConfig(record.status).background,
                    color: getStatusConfig(record.status).color,
                    borderColor: getStatusConfig(record.status).borderColor
                  }}>
                    {getStatusConfig(record.status).label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedRecords.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Không tìm thấy ghi nhận sửa chữa nào.</div>
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
            Hiển thị <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + ITEMS_PER_PAGE, filteredRecords.length)}</strong> trên <strong>{filteredRecords.length}</strong> lượt sửa
          </div>
        </div>
      )}

      {/* Table */}

      {/* Detail & Update Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        technicianWallet={technicianWallet}
        setTechnicianWallet={setTechnicianWallet}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        uniqueTechnicians={uniqueTechnicians}
      />

      {isModalOpen && selectedRepair && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: "hidden" }}>
            <div className="modal-header" style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Chi tiết phiếu sửa chữa</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Serial: {selectedRepair.serialNumber}</p>
              </div>
              <button className="close-btn" onClick={closeDetail}>&times;</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: "70vh" }}>
              {/* Left: Timeline & Info */}
              <div style={{ padding: 24, borderRight: "1px solid #e2e8f0", overflowY: "auto", background: "#fff" }}>
                <h4 style={{ marginTop: 0, marginBottom: 20, fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#1e40af" }}>Dòng thời gian</h4>
                <div className="repair-timeline-v2">
                  {selectedRepair.timeline?.map((step, idx) => (
                    <div key={idx} className="timeline-step-v2">
                      <div className="step-marker-v2">
                        <div className="step-dot-v2" style={{ background: getStatusConfig(step.status).color }}></div>
                        {idx < selectedRepair.timeline.length - 1 && <div className="step-line-v2"></div>}
                      </div>
                      <div className="step-content-v2">
                        <div className="step-header-v2">
                          <span className="step-status-v2" style={{ color: getStatusConfig(step.status).color }}>{getStatusConfig(step.status).label}</span>
                          <span className="step-time-v2">{formatDate(step.timestamp)}</span>
                        </div>
                        <p className="step-note-v2">{step.note || "Không có ghi chú"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 30, padding: 16, background: "#f1f5f9", borderRadius: 12 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#475569" }}>Thông tin bổ sung</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Loại hình</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedRepair.type}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Chi phí</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedRepair.cost?.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Update Form */}
              <div style={{ padding: 24, background: "#f8fafc", overflowY: "auto" }}>
                <h4 style={{ marginTop: 0, marginBottom: 20, fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#059669" }}>Cập nhật thông tin</h4>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Chuyển trạng thái sang</label>
                    <select
                      value={updateForm.status}
                      onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
                    >
                      <option value="">-- Giữ nguyên trạng thái --</option>
                      <option value="waiting_parts">Chờ linh kiện</option>
                      <option value="fixing">Đang sửa chữa</option>
                      <option value="completed">Sửa chữa hoàn tất</option>
                      <option value="delivered">Đã giao khách hàng</option>
                      <option value="cancelled">Hủy phiếu</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Ghi chú cập nhật</label>
                    <textarea
                      placeholder="Ví dụ: Đã thay xong màn hình, đang test cảm ứng..."
                      value={updateForm.note}
                      onChange={e => setUpdateForm({ ...updateForm, note: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, minHeight: 80 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Loại hình</label>
                      <select
                        value={updateForm.type}
                        onChange={e => setUpdateForm({ ...updateForm, type: e.target.value })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
                      >
                        <option value="Màn hình">Màn hình</option>
                        <option value="Pin/Nguồn">Pin/Nguồn</option>
                        <option value="Phần cứng">Phần cứng</option>
                        <option value="Phần mềm">Phần mềm</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Chi phí (VND)</label>
                      <input
                        type="number"
                        value={updateForm.cost}
                        onChange={e => setUpdateForm({ ...updateForm, cost: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      id="warrantyCheck"
                      checked={updateForm.isWarrantyCovered}
                      onChange={e => setUpdateForm({ ...updateForm, isWarrantyCovered: e.target.checked })}
                    />
                    <label htmlFor="warrantyCheck" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Được bảo hành chi phí</label>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)"
                      }}
                    >
                      {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .repair-timeline-v2 { display: flex; flexDirection: column; gap: 0; }
        .timeline-step-v2 { display: flex; gap: 16px; }
        .step-marker-v2 { display: flex; flex-direction: column; align-items: center; padding-top: 6px; }
        .step-dot-v2 { width: 10px; height: 10px; border-radius: 50%; z-index: 1; }
        .step-line-v2 { width: 2px; flex: 1; background: #e2e8f0; margin-top: 4px; margin-bottom: 4px; }
        .step-content-v2 { flex: 1; padding-bottom: 20px; }
        .step-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .step-status-v2 { font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .step-time-v2 { font-size: 11px; color: #94a3b8; font-weight: 600; }
        .step-note-v2 { font-size: 13px; color: #475569; margin: 0; line-height: 1.5; }
        .repair-timeline-v2 { display: flex; flex-direction: column; gap: 0; }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 500px;
          max-width: 95vw;
          max-height: 90vh;
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-large {
          width: 1000px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: rotate(90deg);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .hoverable-row:hover { background-color: #f8fafc !important; }
      `}</style>
      {/* Add Repair Modal */}
      {isAddingRepair && (
        <AddRepairModal
          isOpen={isAddingRepair}
          onClose={() => setIsAddingRepair(false)}
          onSuccess={() => {
            setIsAddingRepair(false);
            fetchRepairs();
          }}
        />
      )}
    </div>
  );
}

function AddRepairModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    serialNumber: "",
    repairContent: "",
    warrantyCovered: "yes",
    status: "pending",
    type: "Khác",
    cost: 0,
  });

  const [errors, setErrors] = useState({});

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.serialNumber.trim()) errs.serialNumber = "Vui lòng nhập Số Serial thiết bị";
    if (!form.repairContent.trim()) errs.repairContent = "Vui lòng nhập nội dung sửa chữa";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        serialNumber: form.serialNumber.trim(),
        note: form.repairContent,
        isWarrantyCovered: form.warrantyCovered === "yes",
        status: form.status,
        type: form.type,
        cost: Number(form.cost) || 0,
      };
      await repairService.createRepair(payload);
      toast.success("Đã thêm phiếu sửa chữa thành công!");
      onSuccess();
    } catch (err) {
      toast.error("Lỗi khi thêm phiếu sửa chữa: " + (err.message || "Không xác định"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Tạo Phiếu Sửa Chữa Mới</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Serial Number Input */}
          <div className="form-group-v2">
            <label className="lr-label" style={{ fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "block" }}>
              Số Serial thiết bị <span className="lr-required" style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              className={`lr-input ${errors.serialNumber ? "error" : ""}`}
              placeholder="Nhập số Serial thiết bị (VD: W01-X...)"
              value={form.serialNumber}
              onChange={updateField("serialNumber")}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: errors.serialNumber ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14px"
              }}
            />
            {errors.serialNumber && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.serialNumber}</div>}
          </div>

          {/* Repair Content */}
          <div className="form-group-v2">
            <label className="lr-label" style={{ fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "block" }}>
              Nội dung sửa chữa <span className="lr-required" style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              className={`lr-textarea ${errors.repairContent ? "error" : ""}`}
              value={form.repairContent}
              onChange={updateField("repairContent")}
              placeholder="VD: Thay màn hình do vỡ, thay pin..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: errors.repairContent ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14px",
                resize: "none"
              }}
            />
            {errors.repairContent && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.repairContent}</div>}
          </div>

          {/* Row 1: Coverage & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="lr-label" style={{ fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "block" }}>Bảo hành chi trả</label>
              <select className="lr-select" value={form.warrantyCovered} onChange={updateField("warrantyCovered")} style={{ width: "100%", padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", fontSize: "14px" }}>
                <option value="yes">Có (Trong bảo hành)</option>
                <option value="no">Không (Ngoài bảo hành)</option>
              </select>
            </div>
            <div>
              <label className="lr-label" style={{ fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "block" }}>Trạng thái</label>
              <select className="lr-select" value={form.status} onChange={updateField("status")} style={{ width: "100%", padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", fontSize: "14px" }}>
                <option value="pending">Tiếp nhận</option>
                <option value="waiting_parts">Chờ linh kiện</option>
                <option value="fixing">Đang sửa</option>
                <option value="completed">Sửa xong</option>
                <option value="delivered">Đã giao</option>
              </select>
            </div>
          </div>

          {/* Row 2: Type & Cost */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="lr-label" style={{ fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "block" }}>Loại hình</label>
              <select className="lr-select" value={form.type} onChange={updateField("type")} style={{ width: "100%", padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", fontSize: "14px" }}>
                <option value="Màn hình">Màn hình</option>
                <option value="Pin/Nguồn">Pin/Nguồn</option>
                <option value="Phần cứng">Phần cứng</option>
                <option value="Phần mềm">Phần mềm</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="lr-label" style={{ fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", display: "block" }}>Chi phí (VND)</label>
              <input type="number" className="lr-input" value={form.cost} onChange={updateField("cost")} style={{ width: "100%", padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", fontSize: "14px" }} />
            </div>
          </div>

          <div className="admin-modal-footer" style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" className="admin-secondary-btn" onClick={onClose} style={{ padding: "10px 20px" }}>Hủy</button>
            <button type="submit" className="admin-primary-btn" disabled={loading} style={{ padding: "10px 24px", border: "none", color: "white", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>
              {loading ? "Đang xử lý..." : "Tạo Phiếu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RepairHistory;
