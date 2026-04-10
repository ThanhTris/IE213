
import { shortAddress } from "../utils/auth";

function HeaderTabs({ activeView, onChangeView, auth, onLogout, adminActiveTab, onAdminAction }) {
  const isAuthenticated = Boolean(auth?.token);
  const role = auth?.role || "";

  // Keep Home + Public Search visible always.
  // When authenticated, show the correct portal tab based on role.
  const tabs = [
    { key: "home", label: "Home" },
    { key: "guest", label: "Public Search" },
  ];

  if (isAuthenticated && role === "admin") {
    tabs.push({ key: "admin", label: "Admin Portal" });
  } else if (isAuthenticated) {
    tabs.push({ key: "user", label: "User Wallet" });
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <button type="button" className="brand" onClick={() => onChangeView("home")}>
          <span className="brand-text">BlockWarranty</span>
        </button>

        <nav className="nav-tabs" role="tablist" aria-label="Application views">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeView === tab.key && adminActiveTab !== "dashboard"}
              onClick={() => {
                // When switching away from dashboard back to admin portal, reset adminTab
                if (tab.key === "admin" && adminActiveTab === "dashboard") {
                  onAdminAction?.("create");
                }
                onChangeView(tab.key);
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Dashboard tab — only shown when admin is logged in */}
          {isAuthenticated && role === "admin" && (
            <button
              type="button"
              role="tab"
              aria-selected={adminActiveTab === "dashboard"}
              className="nav-tab-dashboard"
              onClick={() => onAdminAction?.("dashboard")}
            >
              Dashboard
            </button>
          )}
        </nav>

        {!isAuthenticated ? (
          <button type="button" className="btn-login" onClick={() => onChangeView("auth")}>
            Sign in
          </button>
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
