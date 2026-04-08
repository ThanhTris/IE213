function AdminDashboard({ onReturnToPortal }) {
  return (
    <div className="admin-page-wrapper">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <p>Monitor products, warranties, and repair activities</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="header-action secondary"
            onClick={onReturnToPortal}
          >
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h18"></path>
                <path d="M3 6h18"></path>
                <path d="M3 18h18"></path>
              </svg>
            </span>
            Admin Portal
          </button>
          <button type="button" className="header-action primary">
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
            </span>
            Create New Product
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1e40af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">1,247</div>
            <div className="metric-label">Total Warranties Issued</div>
          </div>
          <div className="metric-trend">↑ trend</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">892</div>
            <div className="metric-label">Active Warranties</div>
          </div>
          <div className="metric-trend">↑ trend</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">342</div>
            <div className="metric-label">Repairs Logged</div>
          </div>
          <div className="metric-trend">↓ trend</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">156</div>
            <div className="metric-label">This Month</div>
          </div>
          <div className="metric-trend">↑ trend</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Monthly Repair Trends</h3>
          <div className="chart-placeholder">
            {/* Placeholder for chart - can integrate Chart.js or similar */}
            <p style={{ color: "#ccc", textAlign: "center", padding: "40px" }}>
              📊 Chart: Monthly repair trend (Jan-Jun)
            </p>
          </div>
        </div>

        <div className="chart-container">
          <h3>Product Categories</h3>
          <div className="chart-placeholder">
            <p style={{ color: "#ccc", textAlign: "center", padding: "40px" }}>
              📈 Chart: Category distribution pie chart
            </p>
          </div>
        </div>
      </div>

      {/* Recent Statistics */}
      <div className="dashboard-stats">
        <div className="stat-item">
          <h4>Top Issue Type</h4>
          <p className="stat-value">Screen Damage</p>
        </div>
        <div className="stat-item">
          <h4>Average Repair Time</h4>
          <p className="stat-value">4.2 days</p>
        </div>
        <div className="stat-item">
          <h4>Customer Satisfaction</h4>
          <p className="stat-value">4.8/5.0 ⭐</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
