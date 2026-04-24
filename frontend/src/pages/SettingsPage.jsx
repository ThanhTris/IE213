import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userService } from "../services/userService";
import { warrantyService } from "../services/warrantyService";
import "../assets/css/SettingsPage.css";

function SettingsPage({ auth, onLogout }) {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "user",
    createdAt: null,
    isActive: true,
  });
  const [editProfile, setEditProfile] = useState({ ...profile });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const walletAddress = auth?.walletAddress || "";
  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  useEffect(() => {
    async function loadProfile() {
      if (!auth?.token) return;
      setProfileLoading(true);
      try {
        const res = await userService.getMe();
        if (res && res.success) {
          const userData = res.data || {};
          const loaded = {
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            role: userData.role || "user",
            isActive: userData.isActive,
            createdAt: userData.createdAt,
          };
          setProfile(loaded);
          setEditProfile({
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });

          // Fetch stats
          const sRes = await warrantyService.getMyStats();
          if (sRes && sRes.success) {
            setStats({
              total: sRes.data?.total || 0,
              active: sRes.data?.active || 0,
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, [auth]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await userService.updateProfile(editProfile);
      if (res && res.success) {
        setProfile({ ...profile, ...editProfile });
        toast.success("Hồ sơ đã được cập nhật thành công!");
        setIsEditing(false);
      } else {
        toast.error(res?.message || "Cập nhật hồ sơ thất bại");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi kết nối khi cập nhật hồ sơ");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
    });
    setIsEditing(false);
  };

  const handleLockAccount = async () => {
    const confirm = window.confirm(
      "BẠN CÓ CHẮC CHẮN MUỐN KHÓA TÀI KHOẢN? \n\nSau khi khóa, bạn sẽ bị đăng xuất và không thể đăng nhập lại cho đến khi được Admin mở khóa."
    );
    if (!confirm) return;

    try {
      const res = await userService.updateProfile({ isActive: false });
      if (res && res.success) {
        toast.success("Tài khoản đã được khóa. Đang đăng xuất...");
        setTimeout(() => {
          onLogout();
        }, 2000);
      } else {
        toast.error(res?.message || "Lỗi khi khóa tài khoản");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi kết nối");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-layout">
        {/* Left Card - Profile Summary */}
        <div className="profile-card">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              <span>{initials}</span>
            </div>
          </div>

          <h2 className="profile-name">{profile.fullName || "User Name"}</h2>
          <p className="profile-email">{profile.email || "user@example.com"}</p>

          <div className="role-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{profile.role === "admin" ? "Administrator" : "User"}</span>
          </div>

          <div className="info-box wallet-box">
            <div className="info-header">
              <label>Wallet Address</label>
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="info-value wallet-value">{walletAddress || "Not connected"}</p>
          </div>

          <div className="info-box member-box">
            <div className="info-header">
              <label>Member Since</label>
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="info-value">
              {profile.createdAt ? new Date(profile.createdAt).toISOString().split('T')[0] : "2024-01-01"}
            </p>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Warranties</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Active</span>
              <span className="stat-value active">{stats.active}</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Tabs */}
        <div className="settings-panel">
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Thông tin cá nhân
            </button>
            <button
              className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Quản lý tài khoản
            </button>
          </div>

          <div className="tab-content">
            {profileLoading ? (
              <div className="loading-state">Đang tải hồ sơ...</div>
            ) : (
              <>
                {activeTab === "info" && (
                  <div className="tab-pane">
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Họ và Tên</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <input
                            type="text"
                            name="fullName"
                            value={isEditing ? editProfile.fullName : profile.fullName}
                            onChange={handleEditChange}
                            placeholder="John Doe"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Địa chỉ Email</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <input
                            type="email"
                            name="email"
                            value={isEditing ? editProfile.email : profile.email}
                            onChange={handleEditChange}
                            placeholder="john.doe@example.com"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Số điện thoại</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <input
                            type="tel"
                            name="phone"
                            value={isEditing ? editProfile.phone : profile.phone}
                            onChange={handleEditChange}
                            placeholder="+1 234 567 8900"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Ngày tham gia</label>
                        <div className="input-wrapper disabled">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <input
                            type="text"
                            value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Địa chỉ ví</label>
                        <div className="input-wrapper disabled">
                          <svg className="input-icon green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 12V22H4V12" />
                            <path d="M22 7H2v5h20V7z" />
                            <path d="M12 22V7" />
                            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                          </svg>
                          <input type="text" value={walletAddress} readOnly />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Vai trò</label>
                        <div className="input-wrapper disabled">
                          <svg className="input-icon orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <input
                            type="text"
                            value={profile.role === "admin" ? "Administrator" : (profile.role || "USER").toUpperCase()}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-actions-bottom">
                      {!isEditing ? (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>
                          Chỉnh sửa hồ sơ
                        </button>
                      ) : (
                        <div className="edit-actions">
                          <button className="btn-cancel" onClick={handleCancelEdit}>
                            Hủy
                          </button>
                          <button
                            className="btn-save-profile"
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                          >
                            {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "account" && (
                  <div className="tab-pane">
                    <div className="danger-zone" style={{ marginTop: 0, border: "none", paddingTop: 0 }}>
                      <div className="danger-card">
                        <div className="danger-info">
                          <span className="danger-title">Khóa tài khoản</span>
                          <span className="danger-desc">
                            Hành động này sẽ vô hiệu hóa tài khoản của bạn. Bạn sẽ không thể đăng nhập cho đến khi liên hệ Admin để mở khóa.
                          </span>
                        </div>
                        <button className="btn-lock-account" onClick={handleLockAccount}>
                          Khóa ngay
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
