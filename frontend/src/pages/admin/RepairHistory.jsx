import { useState, useMemo, useEffect } from "react";
import { repairLogService } from "../../services/repairLogService";

function RepairHistory() {
  const [repairRecords, setRepairRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await repairLogService.getAllLogs();
        if (res.success) {
          setRepairRecords(res.data);
        }
      } catch (err) {
        setError(err.message || "Failed to load repair history");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(dateStr)) {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    }
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("vi-VN");
      }
    } catch (e) {
      return dateStr;
    }
    return dateStr;
  };

  const renderStatus = (record) => {
    if (record.status && record.status !== "completed") {
      return getStatusBadge(record.status);
    }
    return getStatusBadge("completed");
  };

  const filteredRecords = useMemo(() => {
    return repairRecords.filter((record) => {
      // Filter by status
      const statusMatch = filterStatus === "all" || record.status === filterStatus;

      // Filter by search term
      const searchMatch = searchTerm === "" ||
        record.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.tokenId && record.tokenId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.repairType && record.repairType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.repairContent && record.repairContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.technicianName && record.technicianName.toLowerCase().includes(searchTerm.toLowerCase()));

      return statusMatch && searchMatch;
    });
  }, [repairRecords, filterStatus, searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      completed: { backgroundColor: "#10b981", color: "white" },
      "in-progress": { backgroundColor: "#f59e0b", color: "white" },
      pending: { backgroundColor: "#6b7280", color: "white" },
      expired: { backgroundColor: "#ef4444", color: "white" },
    };
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          display: "inline-block",
          ...styles[status],
        }}
      >
        {status === "in-progress" ? "In Progress" : status === "expired" ? "Expired" : status}
      </span>
    );
  };

  return (
    <div className="repair-history-container">
      {/* Search and Filter Section */}
      {error && <div style={{ color: "#dc2626", marginBottom: "20px" }}>{error}</div>}

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by product name, serial, owner, issue type, or technician..."
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
            All
          </button>
          <button
            className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filterStatus === "in-progress" ? "active" : ""}`}
            onClick={() => setFilterStatus("in-progress")}
          >
            In Progress
          </button>
        </div>
      </div>

      {/* Record Count */}
      <div className="record-count">
        <span>{filteredRecords.length} repair record{filteredRecords.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Repair Table */}
      <div className="table-wrapper">
        <table className="repair-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Owner</th>
              <th>Issue Type</th>
              <th>Repair Date</th>
              <th>Completion Date</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Technician</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>Loading records...</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>No repair records found.</td>
              </tr>
            ) : filteredRecords.map((record) => (
              <tr key={record.id || record._id}>
                <td>
                  <div className="device-cell">
                    <div className="device-serial">{record.serialNumber}</div>
                    {record.tokenId && <div style={{ fontSize: "11px", color: "#64748b" }}>Token: {record.tokenId}</div>}
                  </div>
                </td>
                <td>{record.serviceCenter || "N/A"}</td>
                <td>
                  <span className="issue-type">{record.repairType || "General"}</span>
                </td>
                <td>{formatDate(record.repairDate)}</td>
                <td>{formatDate(record.completionDate)}</td>
                <td>
                  {record.warrantyId?.expiryDate && record.warrantyId.expiryDate < Math.floor(Date.now() / 1000)
                    ? getStatusBadge("expired")
                    : getStatusBadge(record.status || "completed")}
                </td>
                <td className="cost-cell">${record.cost || 0}</td>
                <td>{record.technicianName}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view-btn" title="View Details">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button className="action-btn edit-btn" title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics Footer */}
      <div className="repair-stats">
        <div className="stat-box">
          <span className="stat-label">Total Repairs</span>
          <span className="stat-value">{repairRecords.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Avg Repair Time</span>
          <span className="stat-value">4.2 days</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Cost</span>
          <span className="stat-value">$647.00</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Success Rate</span>
          <span className="stat-value">100%</span>
        </div>
      </div>
    </div>
  );
}

export default RepairHistory;
