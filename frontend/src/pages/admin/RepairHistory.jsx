import { getStatusConfig } from "../../utils/statusStyles";


function RepairHistory() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await repairService.getAllRepairs();
      setRepairs(res.data || []);
      toast.success("Đã tải lịch sử sửa chữa.");
    } catch (err) {
      toast.error("Lỗi khi tải lịch sử sửa chữa: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return repairs;
    return repairs.filter(
      (r) =>
        r.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.repairContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.technicianWallet?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [repairs, searchTerm]);

  const coveredCount = repairs.filter((r) => r.isWarrantyCovered).length;
  const notCoveredCount = repairs.filter((r) => !r.isWarrantyCovered).length;

  return (
    <div className="repair-history-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Lịch Sử Sửa Chữa Hệ Thống</span>
        </div>
        <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
          {repairs.length} lượt sửa chữa
        </span>
      </div>

      {/* Search */}
      <div className="search-input-wrapper" style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo sản phẩm, serial, khách hàng hoặc nội dung..."
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

      {/* Table */}
      <div className="table-wrapper">
        <table className="repair-table">
          <thead>
            <tr>
               <th>Số Serial</th>
               <th>Nội dung sửa chữa</th>
               <th>Chi phí</th>
               <th>Kỹ thuật viên</th>
               <th>Ngày thực hiện</th>
               <th>Bảo hành</th>
               <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                 <td>
                   <div style={{ fontWeight: 600, color: "#1e40af", fontSize: 13 }}>{record.serialNumber}</div>
                 </td>
                 <td>
                   <div style={{ color: "#475569", fontSize: 13 }}>{record.repairContent}</div>
                 </td>
                 <td style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                   {record.cost > 0 ? Number(record.cost).toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                 </td>
                 <td>
                   <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }} title={record.technicianWallet}>
                     {record.technicianWallet ? `${record.technicianWallet.slice(0, 6)}...${record.technicianWallet.slice(-4)}` : "N/A"}
                   </div>
                 </td>
                 <td style={{ fontSize: 13, color: "#475569" }}>
                   {record.repairDate ? new Date(record.repairDate).toLocaleDateString() : "-"}
                 </td>
                 <td>
                   <span style={{
                     display: "inline-block",
                     background: record.isWarrantyCovered ? "#10b981" : "#ef4444",
                     color: "white",
                     borderRadius: 20, padding: "3px 12px",
                     fontSize: 12, fontWeight: 700,
                   }}>
                     {record.isWarrantyCovered ? "Có" : "Không"}
                   </span>
                 </td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    borderRadius: 20, padding: "4px 12px",
                    fontSize: 12, fontWeight: 700,
                    background: getStatusConfig(record.status).background,
                    color: getStatusConfig(record.status).color,
                    border: `1px solid ${getStatusConfig(record.status).borderColor}`,
                  }}>
                    {getStatusConfig(record.status).label}
                  </span>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Không tìm thấy ghi nhận sửa chữa nào.</div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="repair-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-box">
          <span className="stat-label">Tổng Lượt Sửa Chữa</span>
          <div className="stat-value" style={{ color: "#0f172a" }}>{repairs.length}</div>
        </div>
        <div className="stat-box">
          <span className="stat-label">Trong Bảo Hành</span>
          <span className="stat-value" style={{ color: "#10b981" }}>{coveredCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Ngoài Bảo Hành</span>
          <span className="stat-value" style={{ color: "#ef4444" }}>{notCoveredCount}</span>
        </div>
      </div>
    </div>
  );
}

export default RepairHistory;
