import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { userService } from "../services/userService";
import { warrantyService } from "../services/warrantyService";
import { ethers } from "ethers";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WarrantyNFT from "../contracts/WarrantyNFT.json";
import apiClient from "../services/apiClient";
import "../assets/css/AccountPage.css";

function AccountPage({ auth, onLogout }) {
  const navigate = useNavigate();
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

  // Warranties state
  const [myWarranties, setMyWarranties] = useState([]);
  const [loadingWarranties, setLoadingWarranties] = useState(false);

  // Transfer state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

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

  useEffect(() => {
    if (activeTab === "devices" && auth?.token) {
      loadWarranties();
    }
  }, [activeTab, auth]);

  const loadWarranties = async () => {
    setLoadingWarranties(true);
    try {
      const res = await warrantyService.getMyWarranties();
      if (res && res.success) {
        setMyWarranties(res.data || []);
      }
    } catch (err) {
      console.error("Error loading warranties:", err);
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoadingWarranties(false);
    }
  };

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

  const handleDownloadPDF = async (warranty) => {
    toast.info("Đang chuẩn bị bản in PDF...");
    // Chuyển hướng đến trang chi tiết nhưng truyền flag để tự động tải
    navigate(`/search/${warranty.serialNumber}?download=true`);
  };

  const openTransferWarning = (warranty) => {
    setSelectedWarranty(warranty);
    setShowWarningModal(true);
  };

  const proceedToTransfer = () => {
    setShowWarningModal(false);
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast.error("Vui lòng nhập địa chỉ ví hợp lệ!");
      return;
    }

    setIsTransferring(true);
    try {
      if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const contract = new ethers.Contract(contractAddress, WarrantyNFT, signer);

      toast.info("Đang yêu cầu xác nhận từ ví...");
      
      // NFT Transfer on blockchain
      const tx = await contract.transferFrom(walletAddress, recipientAddress, selectedWarranty.tokenId);
      const receipt = await tx.wait();
      
      // Update backend
      await apiClient.post("/transfers", {
        tokenId: selectedWarranty.tokenId,
        toAddress: recipientAddress,
        txHash: receipt.hash
      });

      toast.success("Chuyển nhượng thành công!");
      setShowTransferModal(false);
      loadWarranties(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi trong quá trình chuyển nhượng");
    } finally {
      setIsTransferring(false);
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
            <p className="info-value wallet-value">
              {walletAddress 
                ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
                : "Not connected"}
            </p>
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
              className={`tab-btn ${activeTab === "devices" ? "active" : ""}`}
              onClick={() => setActiveTab("devices")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Thiết bị của tôi
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

                {activeTab === "devices" && (
                  <div className="tab-pane">
                    {loadingWarranties ? (
                      <div className="loading-state">Đang tải danh sách thiết bị...</div>
                    ) : myWarranties.length > 0 ? (
                      <div className="devices-grid">
                        {myWarranties.map((w) => (
                          <div 
                            key={w._id} 
                            className="device-card"
                            onClick={() => navigate(`/search/${w.serialNumber}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="device-card-header">
                              <div className="device-type-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                  <line x1="12" y1="18" x2="12.01" y2="18" />
                                </svg>
                              </div>
                              <span className={`device-status ${w.status ? "active" : "expired"}`}>
                                {w.status ? "Đang hoạt động" : "Hết hạn"}
                              </span>
                            </div>
                            <div className="device-info">
                              <h4 className="device-name">{w.productCode}</h4>
                              <p className="device-serial">S/N: {w.serialNumber}</p>
                              <div className="device-meta">
                                <div>
                                  <label>Ngày mua</label>
                                  <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <label>Hết hạn</label>
                                  <span>{new Date(w.expiryDate * 1000).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="device-actions">
                              <div className="btn-group">
                                <button className="btn-download" onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPDF(w);
                                }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                  </svg>
                                  Tải xuống
                                </button>
                                <button className="btn-transfer" onClick={(e) => {
                                  e.stopPropagation();
                                  openTransferWarning(w);
                                }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="16 3 21 3 21 8" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                    <polyline points="8 21 3 21 3 16" />
                                    <line x1="3" y1="21" x2="14" y2="10" />
                                  </svg>
                                  Chuyển nhượng
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-devices">
                        <div className="empty-icon">📱</div>
                        <h3>Bạn chưa có thiết bị nào</h3>
                        <p>Các thiết bị được đăng ký bảo hành bằng ví của bạn sẽ xuất hiện tại đây.</p>
                      </div>
                    )}
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

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-content warning">
            <div className="modal-header">
              <div className="warning-icon">⚠️</div>
              <h3>Cảnh báo quan trọng</h3>
            </div>
            <div className="modal-body">
              <p>Bạn đang thực hiện chuyển nhượng quyền sở hữu thiết bị <strong>{selectedWarranty?.productCode}</strong>.</p>
              <p><strong>Lưu ý:</strong> Sau khi hoàn tất, bạn sẽ <strong>mất toàn bộ quyền sở hữu</strong> đối với NFT bảo hành này trên Blockchain. Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowWarningModal(false)}>Hủy bỏ</button>
              <button className="btn-danger" onClick={proceedToTransfer}>Tôi đã hiểu, tiếp tục</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content transfer">
            <div className="modal-header">
              <h3>Chuyển nhượng bảo hành</h3>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="transfer-device-preview">
                <div className="preview-icon">📱</div>
                <div className="preview-info">
                  <strong>{selectedWarranty?.productCode}</strong>
                  <span>S/N: {selectedWarranty?.serialNumber}</span>
                  <span className="token-id">Token ID: {selectedWarranty?.tokenId}</span>
                </div>
              </div>
              <div className="form-field">
                <label>Địa chỉ ví người nhận (EVM Wallet)</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="0x..." 
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <p className="field-hint">Đảm bảo địa chỉ ví người nhận là chính xác.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTransferModal(false)}>Hủy</button>
              <button 
                className="btn-primary" 
                onClick={handleTransfer}
                disabled={isTransferring}
              >
                {isTransferring ? "Đang xử lý..." : "Xác nhận chuyển nhượng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountPage;
