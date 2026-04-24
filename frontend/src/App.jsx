import { useState } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";

// Components
import HeaderTabs from "./components/HeaderTabs";
import WalletModal from "./components/WalletModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";

// Pages
import HomePage from "./pages/HomePage";
import GuestPage from "./pages/GuestPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import SignInUpPage from "./pages/SignInUpPage";
import SettingsPage from "./pages/SettingsPage";
import CreateNewProduct from "./pages/admin/CreateNewProduct";

// Utils & Styles
import { clearAuthStorage, loadAuthFromStorage } from "./utils/auth";
import "./assets/css/main.css";
import "./assets/css/home.css";
import "./assets/css/guest.css";
import "./assets/css/user.css";
// import "./assets/css/admin.css"; // Deleted and consolidated
import "./assets/css/auth.css";

/**
 * Main Layout component that includes the Header
 */
function MainLayout({ auth, onLogout, adminActiveTab, onAdminAction }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="App">
      <HeaderTabs
        auth={auth}
        onLogout={onLogout}
        adminActiveTab={adminActiveTab}
        onAdminAction={onAdminAction}
      />
      <main>
        <Outlet context={{ setModalOpen }} />
      </main>
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

      // Fallback to sessionStorage if not in URL but was previously set
      if (!devRole) {
        devRole = sessionStorage.getItem("bw_dev_role_active");
      } else {
        // Persist to sessionStorage if found in URL
        sessionStorage.setItem("bw_dev_role_active", devRole);
      }

      if (devRole === "admin" || devRole === "user") {
        console.warn(`[DEV MODE] Đang chạy với quyền giả lập: ${devRole}`);
        return {
          token: `DUMMY_TOKEN_FOR_${devRole.toUpperCase()}`,
          walletAddress: `0xDev${devRole}WalletAddress`,
          role: devRole,
        };
      }
    }
    return loadAuthFromStorage();
  });

  const isAuthenticated = Boolean(auth?.token);

  const handleLogout = () => {
    clearAuthStorage();
    setAuth(null);
    navigate("/");
  };

  const handleAuthSuccess = (nextAuth) => {
    setAuth(nextAuth);
    navigate(nextAuth?.role === "admin" ? "/admin/workspace" : "/user");
  };

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
              <UserPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/workspace"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={auth?.role}
              requiredRole="admin"
            >
              <AdminPage
                adminActiveTab={adminTab}
                onSetAdminTab={setAdminTab}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={auth?.role}
              requiredRole="admin"
            >
              <AdminPage
                adminActiveTab="dashboard"
                onSetAdminTab={setAdminTab}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SettingsPage auth={auth} onLogout={handleLogout} />
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
              to={auth?.role === "admin" ? "/admin/workspace" : "/user"}
              replace
            />
          ) : (
            <SignInUpPage
              onAuthSuccess={handleAuthSuccess}
              onCancel={() => navigate("/")}
            />
          )
        }
      />

      {/* Separate layout/no-header routes if any */}
      {/* <Route path="/create-new-product" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} userRole={auth?.role} requiredRole="admin">
          <CreateNewProduct />
        </ProtectedRoute>
      } /> */}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
