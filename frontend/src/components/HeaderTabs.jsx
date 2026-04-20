import { NavLink, Link } from "react-router-dom";
import { shortAddress } from "../utils/auth";

function HeaderTabs({ auth, onLogout, adminActiveTab, onAdminAction }) {
  const isAuthenticated = Boolean(auth?.token);
  const role = auth?.role || "";

  // Define tabs with their paths
  const tabs = [
    { key: "home", label: "Home", path: "/" },
    { key: "guest", label: "Public Search", path: "/search" },
  ];

  if (role === "admin") {
    tabs.push({ key: "admin", label: "Admin Portal", path: "/admin" });
  } else if (isAuthenticated && role === "user") {
    tabs.push({ key: "user", label: "User Wallet", path: "/user" });
  }

  if (isAuthenticated) {
    tabs.push({ key: "settings", label: "Settings", path: "/settings" });
  }

  return (
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
          <span className="brand-text">BlockWarranty</span>
        </Link>

        <nav className="nav-tabs" role="tablist" aria-label="Application views">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.path}
              className={({ isActive }) => 
                isActive && (tab.key !== "admin" || adminActiveTab !== "dashboard") 
                ? "active" 
                : ""
              }
              onClick={() => {
                if (tab.key === "admin") {
                  onAdminAction?.("create");
                }
              }}
              role="tab"
            >
              {tab.label}
            </NavLink>
          ))}

          {isAuthenticated && role === "admin" && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => 
                isActive || adminActiveTab === "dashboard" ? "nav-tab-dashboard active" : "nav-tab-dashboard"
              }
              role="tab"
              onClick={() => onAdminAction?.("dashboard")}
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {!isAuthenticated ? (
          <Link to="/auth" className="btn-login">
            Sign in
          </Link>
        ) : (
          <div className="header-user">
            <span className="header-user-address" aria-label="Connected wallet">
              {shortAddress(auth?.walletAddress)}
            </span>
            <button type="button" className="btn-login" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default HeaderTabs;
