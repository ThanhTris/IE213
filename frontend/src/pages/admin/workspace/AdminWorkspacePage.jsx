import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Footer from "../../../components/Footer";
import "../../../assets/css/adminWorkspace.css";

function AdminPage() {
  const navigate = useNavigate();

  const handleReturnToPortal = () => {
    navigate("/admin/dashboard");
  };

  const tabs = [
    {
      id: "warranty",
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
      id: "repair",
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
      id: "product",
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
        <div className="admin-page-wrapper">
          {/* Tab Navigation */}
          <div className="admin-tabs-container">
            <div className="admin-tabs">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.id}
                  className={({ isActive }) => `admin-tab ${isActive ? "active" : ""}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPage;
