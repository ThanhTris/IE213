import { useState, useMemo } from "react";

function RepairHistory() {
  const [repairRecords] = useState([
    {
      id: 1,
      serialNumber: "FNQW8123XYZ",
      productName: "iPhone 15 Pro Max",
      owner: "John Doe (0x7426...08f)",
      issueType: "Screen Damage",
      repairDate: "2025-12-10",
      completionDate: "2025-12-14",
      status: "completed",
      repairCost: "$149.00",
      technician: "Tech Service Center #1",
    },
    {
      id: 2,
      serialNumber: "C0ZZ456LMD6",
      productName: 'MacBook Pro 16"',
      owner: "Jane Smith (0x8a3d...0bc2)",
      issueType: "Battery Replacement",
      repairDate: "2025-11-20",
      completionDate: "2025-11-25",
      status: "completed",
      repairCost: "$199.00",
      technician: "Apple Service",
    },
    {
      id: 3,
      serialNumber: "DMPH234ABC",
      productName: "iPad Pro 12.9\"",
      owner: "Sarah Williams (0x9c2b...de3)",
      issueType: "Display Issue",
      repairDate: "2025-12-01",
      completionDate: null,
      status: "in-progress",
      repairCost: "Pending",
      technician: "Tech Service Center #2",
    },
    {
      id: 4,
      serialNumber: "XYWZ567EFG",
      productName: "AirPods Pro 2",
      owner: "David Chen (0x7d4c...df2a)",
      issueType: "Audio Problem",
      repairDate: "2025-10-15",
      completionDate: "2025-10-18",
      status: "completed",
      repairCost: "$99.00",
      technician: "Apple Service",
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

  const filteredRecords = useMemo(() => {
    return repairRecords.filter((record) => {
      // Filter by status
      const statusMatch = filterStatus === "all" || record.status === filterStatus;

      // Filter by search term
      const searchMatch = searchTerm === "" ||
        record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.technician.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [repairRecords, filterStatus, searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      completed: { backgroundColor: "#10b981", color: "white" },
      "in-progress": { backgroundColor: "#f59e0b", color: "white" },
      pending: { backgroundColor: "#6b7280", color: "white" },
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
        {status === "in-progress" ? "In Progress" : status}
      </span>
    );
  };

  return (
    <div className="repair-history-container">
      {/* Search and Filter Section */}
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
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="device-cell">
                    <div className="device-name">{record.productName}</div>
                    <div className="device-serial">{record.serialNumber}</div>
                  </div>
                </td>
                <td>{record.owner}</td>
                <td>
                  <span className="issue-type">{record.issueType}</span>
                </td>
                <td>{formatDate(record.repairDate)}</td>
                <td>{formatDate(record.completionDate) || "-"}</td>
                <td>{getStatusBadge(record.status)}</td>
                <td className="cost-cell">{record.repairCost}</td>
                <td>{record.technician}</td>
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
