import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { shortAddress } from "../utils/auth";

function HeaderTabs({ auth, onLogout, adminActiveTab, onAdminAction }) {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isAuthenticated = Boolean(auth?.token);
  const role = auth?.role || "";

  // Define tabs with their paths
  const tabs = [
    { key: "home", label: "Trang chủ", path: "/" },
    { key: "guest", label: "Tra cứu", path: "/search" },
  ];

  if (role === "admin") {
    tabs.push({ key: "admin_workspace", label: "Không gian làm việc", path: "/admin/workspace" });
    tabs.push({ key: "admin_dashboard", label: "Bảng điều khiển", path: "/admin/dashboard" });
  }

  if (isAuthenticated) {
    tabs.push({ key: "account", label: "Tài khoản", path: "/account" });
  }

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--navy-primary)" }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="brand-text">E-Warranty</span>
          </Link>

          <nav className="nav-tabs" role="tablist" aria-label="Application views">
            {tabs.map((tab) => (
              <NavLink
                key={tab.key}
                to={tab.path}
                className={({ isActive }) => 
                  isActive || (tab.path === "/" && location.pathname === "/") ? "active" : ""
                }
                role="tab"
                end={tab.path === "/"}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          {!isAuthenticated ? (
            <div className="header-user">
              <Link to="/auth" className="btn-login btn-login-primary">
                Đăng nhập
              </Link>
            </div>
          ) : (
            <div className="header-user">
              <span className="header-user-address" aria-label="Connected wallet">
                {shortAddress(auth?.walletAddress)}
              </span>
              <button 
                type="button" 
                className="btn-login btn-login-ghost" 
                onClick={() => setShowLogoutModal(true)}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-backdrop open" onClick={() => setShowLogoutModal(false)} role="presentation">
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="logout-modal-title" style={{ marginTop: 0, fontSize: '1.8rem', fontWeight: 800 }}>Xác nhận đăng xuất</h3>
            <p className="muted" style={{ fontSize: '1.4rem', color: 'var(--grey-600)', marginBottom: '2.4rem' }}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
            </p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.2rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn-login btn-danger" 
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
              >
                Đăng xuất
              </button>
              <button 
                type="button" 
                className="btn-login btn-login-ghost" 
                onClick={() => setShowLogoutModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HeaderTabs;
