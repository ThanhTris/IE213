import { useState } from "react";
import AdminDashboard from "./admin/AdminDashboard";
import ProductList from "./admin/ProductList";
import CreateWarranty from "./admin/CreateWarranty";
import RepairHistory from "./admin/RepairHistory";
import Footer from "../components/Footer";
import "../assets/views/admin-portal.css";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ) 
    },
    { 
      id: "products", 
      label: "Product List", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <path d="m3.3 7 8.7 5 8.7-5"></path>
          <path d="M12 22V12"></path>
        </svg>
      ) 
    },
    { 
      id: "create", 
      label: "Create Warranty", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path>
        </svg>
      ) 
    },
    { 
      id: "repairs", 
      label: "Repair History", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      ) 
    },
  ];

  return (
    <>
      <div className="view active">
        <div className="admin-page-wrapper">
          {/* Admin Header */}
          <div className="admin-header">
            <div className="admin-header-content">
              <h1>Admin Management Portal</h1>
              <p>Manage warranties, products, and repair records</p>
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
            {activeTab === "dashboard" && <AdminDashboard />}
            {activeTab === "products" && <ProductList />}
            {activeTab === "create" && <CreateWarranty />}
            {activeTab === "repairs" && <RepairHistory />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPage;
