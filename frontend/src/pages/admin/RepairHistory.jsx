import { useState, useMemo } from "react";

const mockRepairs = [
  {
    id: 1,
    productName: "iPhone 14 Pro",
    serial: "SN: IP14-BLK-001",
    repairContent: "Thay màn hình do vỡ",
    repairDate: "2025-03-15",
    warrantyCovered: false,
    status: "completed",
  },
  {
    id: 2,
    productName: "Galaxy Watch Ultra",
    serial: "SN: GLX-W-ULTRA-001",
    repairContent: "Kiểm tra và thay pin",
    repairDate: "2025-11-10",
    warrantyCovered: true,
    status: "completed",
  },
  {
    id: 3,
    productName: "iPhone 15 Pro Max",
    serial: "SN: IP15-PM-001",
    repairContent: "Sửa camera bị mờ",
    repairDate: "2026-02-14",
    warrantyCovered: true,
    status: "completed",
  },
  {
    id: 4,
    productName: 'MacBook Pro 16"',
    serial: "SN: MBP-M3-001",
    repairContent: "Thay bàn phím",
    repairDate: "2026-04-10",
    warrantyCovered: true,
    status: "fixing",
  },
  {
    id: 5,
    productName: 'iPad Pro 12.9"',
    serial: "SN: IPAD-PRO-001",
    repairContent: "Thay màn hình",
    repairDate: "2026-04-13",
    warrantyCovered: false,
    status: "pending",
  },
];

const STATUS_STYLES = {
  completed: { background: "#10b981", color: "white" },
  fixing: { background: "#f59e0b", color: "white" },
  pending: { background: "#3b82f6", color: "white" },
};

function RepairHistory() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return mockRepairs;
    return mockRepairs.filter(
      (r) =>
        r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.repairContent.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const coveredCount = mockRepairs.filter((r) => r.warrantyCovered).length;
  const notCoveredCount = mockRepairs.filter((r) => !r.warrantyCovered).length;

  return (
    <div className="repair-history-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Complete Repair History</span>
        </div>
        <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
          {mockRepairs.length} repairs
        </span>
      </div>

      {/* Search */}
      <div className="search-input-wrapper" style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by product, serial, customer, or repair type..."
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
              <th>Product</th>
              <th>Repair Content</th>
              <th>Repair Date</th>
              <th>Warranty Covered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="device-cell">
                    <div className="device-name" style={{ color: "#1e40af" }}>{record.productName}</div>
                    <div className="device-serial">{record.serial}</div>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    <span style={{ color: "#475569" }}>{record.repairContent}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {record.repairDate}
                  </div>
                </td>
                <td>
                  <span style={{
                    display: "inline-block",
                    background: record.warrantyCovered ? "#10b981" : "#ef4444",
                    color: "white",
                    borderRadius: 20, padding: "3px 12px",
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {record.warrantyCovered ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    borderRadius: 20, padding: "4px 12px",
                    fontSize: 12, fontWeight: 700,
                    ...STATUS_STYLES[record.status],
                  }}>
                    {record.status === "completed" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No repair records found.</div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="repair-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-box">
          <span className="stat-label">Total Repairs</span>
          <span className="stat-value" style={{ color: "#0f172a" }}>{mockRepairs.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Covered by Warranty</span>
          <span className="stat-value" style={{ color: "#10b981" }}>{coveredCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Not Covered</span>
          <span className="stat-value" style={{ color: "#ef4444" }}>{notCoveredCount}</span>
        </div>
      </div>
    </div>
  );
}

export default RepairHistory;
