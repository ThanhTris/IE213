import { useEffect, useState } from "react";
import HeaderTabs from "./components/HeaderTabs";
import WalletModal from "./components/WalletModal";
import HomePage from "./pages/HomePage";
import GuestPage from "./pages/GuestPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import SignInUpPage from "./pages/SignInUpPage";
import "./assets/views/styles.css";
import "./assets/views/shared.css";
import "./assets/views/home.css";
import "./assets/views/guest.css";
import "./assets/views/user.css";
import "./assets/views/admin.css";
import "./assets/views/auth.css";
import { clearAuthStorage, loadAuthFromStorage } from "./utils/auth";

function BlockWarrantyApp() {
  const [activeView, setActiveView] = useState("home");
  const [sideTab, setSideTab] = useState("devices");
  const [modalOpen, setModalOpen] = useState(false);
  const [auth, setAuth] = useState(() => loadAuthFromStorage());

  const isAuthenticated = Boolean(auth?.token);

  const handleChangeView = (nextView) => {
    if ((nextView === "user" || nextView === "admin") && !isAuthenticated) {
      setActiveView("auth");
      return;
    }
    if (nextView === "admin" && isAuthenticated && auth?.role !== "admin") {
      setActiveView("user");
      return;
    }
    if (nextView === "user" && isAuthenticated && auth?.role === "admin") {
      setActiveView("admin");
      return;
    }

    if (nextView === "auth" && isAuthenticated) {
      setActiveView(auth?.role === "admin" ? "admin" : "user");
      return;
    }

    setActiveView(nextView);
  };

  useEffect(() => {
    // After loading auth from storage, normalize the default landing view.
    if (!isAuthenticated) {
      setActiveView((v) => (v === "user" || v === "admin" ? "home" : v));
      return;
    }

    if (activeView === "auth") {
      setActiveView(auth?.role === "admin" ? "admin" : "user");
      return;
    }

    if (activeView === "admin" && auth?.role !== "admin") {
      setActiveView("user");
      return;
    }

    if (activeView === "user" && auth?.role === "admin") {
      setActiveView("admin");
    }
  }, [auth, isAuthenticated, activeView]);

  const handleLogout = () => {
    clearAuthStorage();
    setAuth(null);
    setActiveView("home");
  };

  return (
    <div>
      <HeaderTabs activeView={activeView} onChangeView={handleChangeView} auth={auth} onLogout={handleLogout} />
      <main>
        {activeView === "home" && <HomePage onChangeView={handleChangeView} isAuthenticated={isAuthenticated} role={auth?.role} />}
        {activeView === "guest" && <GuestPage onChangeView={handleChangeView} isAuthenticated={isAuthenticated} />}
        {activeView === "user" && (
          <UserPage sideTab={sideTab} onChangeSideTab={setSideTab} onOpenModal={() => setModalOpen(true)} />
        )}
        {activeView === "admin" && <AdminPage />}
        {activeView === "auth" && (
          <SignInUpPage
            onAuthSuccess={(nextAuth) => {
              setAuth(nextAuth);
              setActiveView(nextAuth?.role === "admin" ? "admin" : "user");
            }}
            onCancel={() => setActiveView("home")}
          />
        )}
      </main>
      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default BlockWarrantyApp;
