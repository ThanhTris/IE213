import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import "../assets/views/SettingsPage.css";

function SettingsPage({ auth }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editProfile, setEditProfile] = useState({ ...profile });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    warrantyExpiry: true,
    repairUpdates: true,
    transferActivity: true,
    securityAlerts: true,
    newsletter: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Mock activity log
  const activityLog = [
    { action: "Profile updated", location: "New York, US", time: "2026-04-10 14:30" },
    { action: "Logged in", location: "New York, US", time: "2026-04-10 09:15" },
    { action: "Warranty transferred", location: "New York, US", time: "2026-04-08 18:45" },
  ];

  // Derived info
  const walletAddress = auth?.walletAddress || "0x742d35Cc6634C0532925a3b8448c9e7595f0d8f";
  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "JD";
  const warrantyCount = 3;
  const activeCount = 2;

  useEffect(() => {
    async function loadProfile() {
      if (!auth?.token) return;
      setProfileLoading(true);
      try {
        const res = await userService.getMe();
        if (res && res.success) {
          const loaded = {
            fullName: res.data?.fullName || "",
            email: res.data?.email || "",
            phone: res.data?.phone || "",
            address: res.data?.address || "",
          };
          setProfile(loaded);
          setEditProfile(loaded);
        }
      } catch {
        // silently fail
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
    setProfileMessage("");
    setProfileError("");
    try {
      const res = await userService.updateProfile(editProfile);
      if (res && res.success) {
        setProfile({ ...editProfile });
        setProfileMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setProfileError(res?.message || "Failed to update profile");
      }
    } catch {
      setProfileError("Connection error while updating profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
    setProfileError("");
  };

  const handleToggleNotif = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = () => {
    setNotifSaving(true);
    setTimeout(() => {
      setNotifSaving(false);
    }, 1000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>

      <div className="settings-layout">
        {/* Left Card - Profile Summary */}
        <div className="profile-card">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              <span>{initials}</span>
            </div>
            <button className="avatar-camera-btn" title="Change photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          <h2 className="profile-card-name">{profile.fullName || "John Doe"}</h2>
          <p className="profile-card-email">{profile.email || "john.doe@example.com"}</p>

          <div className="wallet-section">
            <label>Wallet Address</label>
            <div className="wallet-row">
              <span className="wallet-addr">
                {walletAddress
                  ? walletAddress.slice(0, 12) + "..." + walletAddress.slice(-6)
                  : "Not connected"}
              </span>
              <button
                className="copy-btn"
                title="Copy address"
                onClick={() => walletAddress && navigator.clipboard.writeText(walletAddress)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Warranties</span>
              <span className="stat-value">{warrantyCount}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Active</span>
              <span className="stat-value active">{activeCount}</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="settings-panel">
          {/* Tab Navigation */}
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>
            <button
              className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              Notifications
            </button>
            <button
              className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="tab-pane">
                {profileLoading ? (
                  <div className="loading-state">Loading profile...</div>
                ) : (
                  <>
                    <div className="section-header">
                      <div className="section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <h3>Personal Information</h3>
                      </div>
                      {!isEditing ? (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>
                          Edit Profile
                        </button>
                      ) : (
                        <div className="edit-actions">
                          <button className="btn-cancel" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                          <button
                            className="btn-save-profile"
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                          >
                            {profileSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      )}
                    </div>

                    {profileMessage && (
                      <div className="alert-success">{profileMessage}</div>
                    )}
                    {profileError && (
                      <div className="alert-error">{profileError}</div>
                    )}

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
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
                        <label>Email Address</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
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
                        <label>Phone Number</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
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
                        <label>Wallet Address</label>
                        <div className="input-wrapper">
                          <svg className="input-icon green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 12V22H4V12"/>
                            <path d="M22 7H2v5h20V7z"/>
                            <path d="M12 22V7"/>
                            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
                            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                          </svg>
                          <input
                            type="text"
                            value={walletAddress}
                            readOnly
                            className="readonly-input"
                          />
                        </div>
                      </div>

                      <div className="form-field full-width">
                        <label>Address</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <input
                            type="text"
                            name="address"
                            value={isEditing ? editProfile.address : profile.address}
                            onChange={handleEditChange}
                            placeholder="123 Main Street, New York, NY 10001"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="tab-pane">
                <div className="section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                  <h3>Notification Preferences</h3>
                </div>

                <div className="notif-list">
                  {[
                    {
                      key: "emailNotifications",
                      title: "Email Notifications",
                      desc: "Receive notifications via email",
                    },
                    {
                      key: "warrantyExpiry",
                      title: "Warranty Expiry Alerts",
                      desc: "Get notified before warranty expires",
                    },
                    {
                      key: "repairUpdates",
                      title: "Repair Updates",
                      desc: "Notifications for repair status changes",
                    },
                    {
                      key: "transferActivity",
                      title: "Transfer Activity",
                      desc: "Alerts for warranty transfers",
                    },
                    {
                      key: "securityAlerts",
                      title: "Security Alerts",
                      desc: "Important security notifications",
                    },
                    {
                      key: "newsletter",
                      title: "Newsletter",
                      desc: "Product updates and news",
                    },
                  ].map(({ key, title, desc }) => (
                    <div className="notif-item" key={key}>
                      <div className="notif-info">
                        <span className="notif-title">{title}</span>
                        <span className="notif-desc">{desc}</span>
                      </div>
                      <button
                        className={`toggle-btn ${notifications[key] ? "on" : "off"}`}
                        onClick={() => handleToggleNotif(key)}
                        aria-label={`Toggle ${title}`}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="tab-footer">
                  <button
                    className="btn-save-notif"
                    onClick={handleSaveNotifications}
                    disabled={notifSaving}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    {notifSaving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="tab-pane">
                <div className="section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <h3>Security Settings</h3>
                </div>

                {/* MetaMask Connected */}
                <div className="metamask-card">
                  <div className="metamask-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>MetaMask Connected</span>
                  </div>
                  <p className="metamask-desc">Your wallet is securely connected via MetaMask</p>
                  <p className="metamask-addr">{walletAddress}</p>
                </div>

                {/* Activity Log */}
                <div className="activity-section">
                  <h4>Activity Log</h4>
                  <div className="activity-list">
                    {activityLog.map((item, i) => (
                      <div className="activity-item" key={i}>
                        <div className="activity-info">
                          <span className="activity-action">{item.action}</span>
                          <span className="activity-location">{item.location}</span>
                        </div>
                        <span className="activity-time">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2FA */}
                <div className="twofa-section">
                  <h4>Two-Factor Authentication</h4>
                  <div className="twofa-card">
                    <div className="twofa-info">
                      <span className="twofa-title">Enable 2FA</span>
                      <span className="twofa-desc">Add an extra layer of security</span>
                    </div>
                    <button className="btn-enable-2fa">Enable</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
