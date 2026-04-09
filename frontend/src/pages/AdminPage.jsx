import { useState } from "react";
import AdminDashboard from "./admin/AdminDashboard";
import CreateWarranty from "./admin/CreateWarranty";
import LogRepairs from "./admin/LogRepairs";
import Footer from "../components/Footer";
import "../assets/views/admin-portal.css";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    {
      id: "create",
      label: "Create Warranty",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path>
        </svg>
      ),
    },
    {
      id: "log-repairs",
      label: "Log Repairs",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="view active">
        {activeTab === "dashboard" ? (
          <AdminDashboard onReturnToPortal={() => setActiveTab("create")} />
        ) : (
          <div className="admin-page-wrapper">
            {/* Admin Header */}
            <div className="admin-header">
              <div className="admin-header-content">
                <h1>Admin Management Portal</h1>
                <p>
                  Issue warranties, log repairs, and manage your warranty
                  program
                </p>
              </div>
              <div className="admin-header-actions">
                <button
                  type="button"
                  className={`header-action secondary ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveTab("dashboard")}
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
                      <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2-3h4a2 2 0 0 1 2 2v3h4a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  Dashboard
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

            {/* Tab Navigation */}
            <div className="admin-tabs-container">
              <div className="admin-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="admin-content">
              {activeTab === "create" && <CreateWarranty />}
              {activeTab === "log-repairs" && <LogRepairs />}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdminPage;
