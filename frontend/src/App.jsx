import { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";

// Components
import HeaderTabs from "./components/HeaderTabs";
import WalletModal from "./components/WalletModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import { Toaster } from "sonner";

// Hooks
import useWalletEvents from "./hooks/useWalletEvents";

// Pages (non-admin: eager load)
import HomePage from "./pages/HomePage";
import GuestPage from "./pages/GuestPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";

// Admin Pages (lazy load để giảm bundle size ban đầu)
const AdminPage       = lazy(() => import("./pages/admin/workspace/AdminWorkspacePage"));
const AdminDashboard  = lazy(() => import("./pages/admin/dashboard/AdminDashboard"));
const ProductList     = lazy(() => import("./pages/admin/dashboard/ProductList"));
const RepairHistory   = lazy(() => import("./pages/admin/dashboard/RepairHistory"));
const UserManagement  = lazy(() => import("./pages/admin/dashboard/UserManagement"));
const CreateWarranty  = lazy(() => import("./pages/admin/workspace/CreateWarranty"));
const LogRepairs      = lazy(() => import("./pages/admin/workspace/LogRepairs"));
const CreateNewProduct = lazy(() => import("./pages/admin/workspace/CreateNewProduct"));

// Utils & Styles
import { clearAuthStorage, loadAuthFromStorage } from "./utils/auth";
import "./assets/css/main.css";
import "./assets/css/home.css";
import "./assets/css/guest.css";
import "./assets/css/user.css";
import "./assets/css/auth.css";

/**
 * Fallback UI khi lazy-loaded Admin pages đang tải
 */
function AdminLoadingFallback() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      flexDirection: "column",
      gap: "16px",
      color: "var(--grey-500, #6b7280)",
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "3px solid transparent",
        borderTopColor: "var(--navy-primary, #1e40af)",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: "14px", fontWeight: 500 }}>Đang tải trang...</span>
    </div>
  );
}

/**
 * Main Layout component that includes the Header
 */
function MainLayout({ auth, onLogout, adminActiveTab, onAdminAction }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderTabs
        auth={auth}
        onLogout={onLogout}
        adminActiveTab={adminActiveTab}
        onAdminAction={onAdminAction}
      />
      <main style={{ flex: 1 }}>
        <Outlet context={{ setModalOpen }} />
      </main>
      <Footer />
      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [adminTab, setAdminTab] = useState("create");

  const [auth, setAuth] = useState(() => {
    // DEV MODE: check for simulated roles in URL or sessionStorage
    if (import.meta.env.VITE_ENABLE_DEV_ROLE === "true") {
      const urlParams = new URLSearchParams(window.location.search);
      let devRole = urlParams.get("devRole");

      if (!devRole) {
        devRole = sessionStorage.getItem("bw_dev_role_active");
      } else {
        sessionStorage.setItem("bw_dev_role_active", devRole);
      }

      if (devRole === "admin" || devRole === "user") {
        console.warn(`[DEV MODE] Đang chạy với quyền giả lập: ${devRole}`);
        return {
          token: `DUMMY_TOKEN_FOR_${devRole.toUpperCase()}`,
          walletAddress: devRole === "admin" 
            ? "0x1c20a9c843c4a63d59c2970bf3b061616e8eae26" // Admin wallet thật
            : "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Ví phụ test
          role: devRole,
        };
      }
    }
    return loadAuthFromStorage();
  });

  const isAuthenticated = Boolean(auth?.token);

  const handleLogout = () => {
    clearAuthStorage();
    sessionStorage.removeItem("bw_dev_role_active");
    setAuth(null);
    navigate("/");
  };

  const handleAuthSuccess = (nextAuth) => {
    setAuth(nextAuth);
    navigate(nextAuth?.role === "admin" ? "/admin/workspace" : "/account");
  };

  // Lắng nghe sự kiện đổi ví / đổi mạng MetaMask
  useWalletEvents(isAuthenticated, handleLogout);

  return (
    <Routes>
      <Route
        element={
          <MainLayout
            auth={auth}
            onLogout={handleLogout}
            adminActiveTab={adminTab}
            onAdminAction={setAdminTab}
          />
        }
      >
        <Route
          path="/"
          element={
            <HomePage isAuthenticated={isAuthenticated} role={auth?.role} />
          }
        />
        <Route
          path="/search"
          element={<GuestPage isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/search/:id"
          element={<GuestPage isAuthenticated={isAuthenticated} />}
        />

        {/* Protected Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={auth?.role}
            >
              <AccountPage auth={auth} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes — bọc trong Suspense để lazy load hoạt động */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={auth?.role}
              requiredRole="admin"
            >
              <Suspense fallback={<AdminLoadingFallback />}>
                <Outlet />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductList />} />
            <Route path="repair-history" element={<RepairHistory />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>

          <Route path="workspace" element={<AdminPage />}>
            <Route index element={<Navigate to="warranty" replace />} />
            <Route path="warranty" element={<CreateWarranty />} />
            <Route path="repair" element={<LogRepairs />} />
            <Route path="product" element={<CreateNewProduct />} />
          </Route>
        </Route>

        <Route
          path="/account"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AccountPage auth={auth} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Route - No Header */}
      <Route
        path="/auth"
        element={
          isAuthenticated ? (
            <Navigate
              to={auth?.role === "admin" ? "/admin/dashboard" : "/user"}
              replace
            />
          ) : (
            <AuthPage
              onAuthSuccess={handleAuthSuccess}
              onCancel={() => navigate("/")}
            />
          )
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
