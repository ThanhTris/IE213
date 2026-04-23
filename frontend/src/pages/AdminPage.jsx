import AdminDashboard from "./admin/AdminDashboard";
import CreateWarranty from "./admin/CreateWarranty";
import CreateNewProduct from "./admin/CreateNewProduct";
import LogRepairs from "./admin/LogRepairs";
import Footer from "../components/Footer";
import "../assets/css/admin-views.css";

import { useNavigate, Link } from "react-router-dom";

function AdminPage({ adminActiveTab, onSetAdminTab }) {
  const navigate = useNavigate();
  const activeTab = adminActiveTab ?? "create";
  const setActiveTab = onSetAdminTab ?? (() => { });

  const handleReturnToPortal = () => {
    setActiveTab("create");
    navigate("/admin/workspace");
  };

  const tabs = [
    {
      id: "create",
      label: "Cấp Bảo Hành",
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
      label: "Ghi Nhận Sửa Chữa",
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
    {
      id: "create-new-product",
      label: "Thêm Sản Phẩm",
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
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="view active">
        {activeTab === "dashboard" ? (
          <AdminDashboard onReturnToPortal={handleReturnToPortal} />
        ) : (
          <div className="admin-page-wrapper">
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
              {activeTab === "create-new-product" && <CreateNewProduct />}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdminPage;
