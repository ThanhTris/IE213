import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { userService } from "../../../services/userService";
import { warrantyService } from "../../../services/warrantyService";

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "??";
  return name.trim().split(" ").map(p => p[0].toUpperCase()).slice(0, 2).join("");
};

function FilterModal({ isOpen, onClose, priceRange, setPriceRange }) {
  if (!isOpen) return null;

  const countPresets = [
    { label: "Tất cả mức giá", min: 0, max: Infinity },
    { label: "0 sản phẩm", min: 0, max: 0 },
    { label: "1 - 3 sản phẩm", min: 1, max: 3 },
    { label: "Trên 3 sản phẩm", min: 4, max: Infinity },
  ];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" style={{ maxWidth: "50rem" }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Bộ lọc nâng cao</h3>
          <button onClick={onClose} className="admin-modal-close-btn">×</button>
        </div>

        <div className="admin-modal-body hide-scrollbar" style={{ maxHeight: "70vh" }}>
          <div>
            <h4 className="detail-section-title filter-section-header" style={{ fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 12, textTransform: "uppercase" }}>Số lượng sản phẩm bảo hành</h4>
            <div className="filter-button-group" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.6rem" }}>
              {countPresets.map((p) => (
                <button
                  key={p.label}
                  className={`filter-btn ${priceRange.label === p.label ? "active" : ""}`}
                  onClick={() => setPriceRange(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="filter-range-container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="number"
                placeholder="Tối thiểu"
                value={priceRange.min === 0 && priceRange.label !== "Tất cả" ? "" : priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value), label: "Tùy chọn" })}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}
              />
              <div style={{ width: 12, height: 1.5, background: "#cbd5e1" }} />
              <input
                type="number"
                placeholder="Tối đa"
                value={priceRange.max === Infinity ? "" : priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value), label: "Tùy chọn" })}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        <div className="admin-modal-footer light-bg" style={{ padding: 20, display: "flex", gap: 12, borderTop: "1px solid #f1f5f9", justifyContent: "center" }}>
          <button
            onClick={() => {
              setPriceRange({ min: 0, max: Infinity, label: "Tất cả" });
            }}
            className="admin-secondary-btn"
            style={{ padding: "12px 24px", minWidth: "140px", textAlign: "center" }}
          >
            Làm mới bộ lọc
          </button>
          <button
            onClick={onClose}
            className="admin-primary-btn"
            style={{ padding: "12px 32px", minWidth: "140px", textAlign: "center" }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

const ROLE_STYLES = {
  admin: { background: "#f59e0b", color: "white" },
  staff: { background: "#2955ce", color: "white" },
  technician: { background: "#8b5cf6", color: "white" },
  user: { background: "#10b981", color: "white" },
};

const ROLE_ICON = {
  admin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  staff: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  technician: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  user: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
  ),
};

const AVATAR_COLORS = ["#1e40af", "#7c3aed", "#0f766e", "#b45309", "#9f1239"];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userWarranties, setUserWarranties] = useState([]);
  const [loadingWarranties, setLoadingWarranties] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", walletAddress: "", role: "user", phone: "" });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterBrand, setFilterBrand] = useState("all");
  const [priceRange, setPriceRange] = useState({ label: "Tất cả mức giá", min: 0, max: Infinity });

  const fetchUserWarranties = async (wallet) => {
    try {
      setLoadingWarranties(true);
      const res = await warrantyService.getWarrantiesByUser(wallet);
      setUserWarranties(res.data || []);
    } catch (err) {
      const msg = err.error?.message || err.message || "Lỗi không xác định";
      toast.error("Lỗi khi tải danh sách sản phẩm: " + msg);
    } finally {
      setLoadingWarranties(false);
    }
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    if (user.walletAddress) {
      fetchUserWarranties(user.walletAddress);
    } else {
      setUserWarranties([]);
      setLoadingWarranties(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [userRes, warrantyRes] = await Promise.all([
        userService.getAllUsers(),
        warrantyService.getAllWarranties()
      ]);

      const warranties = warrantyRes.data || [];
      const countMap = warranties.reduce((acc, w) => {
        const wallet = w.ownerWallet?.toLowerCase();
        if (wallet) acc[wallet] = (acc[wallet] || 0) + 1;
        return acc;
      }, {});

      const formatted = (userRes.data || []).map(u => {
        const wallet = u.walletAddress?.toLowerCase();
        return {
          ...u,
          id: u._id || u.id,
          initials: getInitials(u.fullName),
          status: u.isActive ? "active" : "inactive",
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : null,
          lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : null,
          warrantyCount: countMap[wallet] || 0,
        };
      });
      setUsers(formatted);
      toast.success("Đã tải danh sách người dùng và dữ liệu bảo hành.");
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (u.fullName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.walletAddress || "").toLowerCase().includes(q);
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus = filterStatus === "all" || u.status === filterStatus;
      const matchCount = u.warrantyCount >= priceRange.min && u.warrantyCount <= priceRange.max;
      return matchSearch && matchRole && matchStatus && matchCount;
    });
  }, [users, searchQuery, filterRole, filterStatus, priceRange]);

  const handleAddUser = async () => {
    if (!newUser.walletAddress) { toast.error("Cần địa chỉ ví!"); return; }
    try {
      await userService.login({
        walletAddress: newUser.walletAddress,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      });
      toast.success("Thêm người dùng thành công!");
      fetchUsers();
      setNewUser({ fullName: "", email: "", walletAddress: "", role: "user", phone: "" });
      setIsAddOpen(false);
    } catch (err) {
      toast.error("Lỗi khi thêm người dùng: " + (err.message || "Không xác định"));
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      const original = users.find(u => u.id === editUser.id);
      if (!original) throw new Error("Không tìm thấy dữ liệu gốc");

      const updatePromises = [];

      // 1. Update Profile (fullName, email, phone) if changed
      const isProfileChanged =
        (editUser.fullName || "") !== (original.fullName || "") ||
        (editUser.email || "") !== (original.email || "") ||
        (editUser.phone || "") !== (original.phone || "");

      if (isProfileChanged) {
        updatePromises.push(userService.updateUser(editUser.walletAddress, {
          fullName: editUser.fullName,
          email: editUser.email,
          phone: editUser.phone
        }));
      }

      // 2. Update Role if changed
      if (editUser.role !== original.role) {
        updatePromises.push(userService.updateUserRole(editUser.walletAddress, editUser.role));
      }

      // 3. Update Status if changed
      const newIsActive = editUser.status === "active";
      const oldIsActive = original.status === "active";
      if (newIsActive !== oldIsActive) {
        updatePromises.push(userService.updateUserStatus(editUser.walletAddress, newIsActive));
      }

      if (updatePromises.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật.");
        setEditUser(null);
        return;
      }

      await Promise.all(updatePromises);
      toast.success("Cập nhật thông tin người dùng thành công!");
      await fetchUsers();
      setEditUser(null);
    } catch (err) {
      const msg = err.error?.message || err.message || "Lỗi khi cập nhật";
      toast.error("Lỗi khi cập nhật: " + msg);
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.updateUserStatus(userToDelete.walletAddress, false);
      toast.success(`Đã tạm dừng người dùng ${userToDelete.fullName} thành công.`);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      const msg = err.error?.message || err.message || "Lỗi khi xóa người dùng";
      toast.error("Lỗi: " + msg);
    }
  };

  const handleUnlock = async (user) => {
    try {
      await userService.updateUserStatus(user.walletAddress, true);
      toast.success(`Đã mở khóa người dùng ${user.fullName || "Unnamed"} thành công.`);
      fetchUsers();
    } catch (err) {
      const msg = err.error?.message || err.message || "Lỗi khi mở khóa";
      toast.error("Lỗi: " + msg);
    }
  };

  const shortWallet = (addr) => addr ? `${addr.slice(0, 8)}...${addr.slice(-4)}` : "N/A";

  return (
    <div className="admin-list-container">
      {/* Header */}
      <div className="admin-list-header">
        <div className="admin-list-title-group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
          </svg>
          <h2 className="admin-list-title">Tất Cả Người Dùng</h2>
          <span className="admin-list-count-badge">
            {filteredUsers.length} người dùng
          </span>
        </div>
        <div className="admin-list-actions">
          <button
            onClick={() => setIsAddOpen(true)}
            className="admin-primary-btn"
            style={{ boxShadow: "0 4px 10px rgba(41, 85, 206, 0.2)" }}

          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
            </svg>
            Thêm Người Dùng
          </button>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="admin-list-toolbar">
        <div className="admin-list-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc địa chỉ ví..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button
          className={`admin-secondary-btn ${(filterRole !== "all" || filterStatus !== "all" || priceRange.min !== 0 || priceRange.max !== Infinity) ? "active-filter" : ""}`}
          onClick={() => setIsFilterModalOpen(true)}
          style={(filterRole !== "all" || filterStatus !== "all" || priceRange.min !== 0 || priceRange.max !== Infinity) ? { background: "var(--navy-primary)", color: "white", borderColor: "var(--navy-primary)" } : {}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Bộ lọc
        </button>
      </div>

      {/* Role + Status filters */}
      <div className="admin-list-filters-row">
        {["all", "admin", "staff", "technician", "user"].map((r) => (
          <button
            key={r}
            className={`filter-btn ${filterRole === r ? "active" : ""} ${r === "admin" ? "warning" :
              r === "staff" ? "info" :
                r === "technician" ? "purple" :
                  r === "user" ? "success" : ""
              }`}
            onClick={() => setFilterRole(r)}
          >
            {r === "all" ? "Tất Cả" : r === "admin" ? "Quản trị viên" : r === "staff" ? "Nhân viên" : r === "technician" ? "Kỹ thuật viên" : "Người dùng"}
          </button>
        ))}
        <div className="admin-list-filters-divider" />
        {["all", "active", "inactive"].map((s) => (
          <button
            key={s}
            className={`filter-btn ${filterStatus === s ? "active" : ""} ${s === "active" ? "success" : s === "inactive" ? "danger" : ""}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === "all" ? "Mọi Trạng Thái" : s === "active" ? "Hoạt động" : "Tạm dừng"}
          </button>
        ))}
      </div>

      {/* Table */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th style={{ width: "32%" }}>Người dùng</th>
              <th style={{ width: "16%" }}>Địa chỉ ví</th>
              <th style={{ width: "10%" }}>Vai trò</th>
              <th style={{ width: "10%" }}>Trạng thái</th>
              <th style={{ width: "12%" }}>Số điện thoại</th>
              <th style={{ width: "10%" }}>Bảo hành</th>
              <th style={{ width: "10%", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr
                key={user.id}
                onClick={() => handleOpenDetail(user)}
                onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.2s ease" }}
              >
                <td onClick={() => handleOpenDetail(user)} style={{ cursor: "pointer" }}>
                  <div className="product-cell-box">
                    <div className="product-cell-img-wrapper" style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: "white", fontSize: "1.6rem", fontWeight: 700 }}>
                      {user.initials}
                    </div>
                    <div className="product-cell-info">
                      <div className="product-cell-title">{user.fullName || "Unnamed"}</div>
                      <div className="product-cell-meta">{user.email || "No email"}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: "var(--text-base)", color: "var(--grey-600)", background: "var(--grey-50)", padding: "0.2rem 0.8rem", borderRadius: "0.6rem", border: "1px solid var(--grey-200)" }}>
                    {shortWallet(user.walletAddress)}
                  </span>
                </td>
                <td>
                  <span className="role-badge-v2" style={{ background: ROLE_STYLES[user.role]?.background || "#94a3b8", color: "white" }}>
                    {ROLE_ICON[user.role]}
                    {user.role === "admin" ? "Admin" : user.role === "staff" ? "Staff" : user.role === "technician" ? "Technician" : "User"}
                  </span>
                </td>
                <td>
                  <span className={`status-badge-v2 ${user.status === "active" ? "success" : "danger"}`}>
                    {user.status === "active" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    )}
                    {user.status === "active" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </td>
                <td className="product-cell-text">{user.phone}</td>
                <td className="product-cell-price">{user.warrantyCount}</td>
                <td>
                  <div className="action-buttons">
                    {user.isActive ? (
                      <button
                        className="table-action-btn danger"
                        title="Khóa người dùng"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="table-action-btn success"
                        title="Mở khóa người dùng"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(user);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                      </button>
                    )}

                    <button
                      className="table-action-btn primary"
                      title="Chỉnh sửa"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditUser({ ...user });
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Không tìm thấy người dùng nào.</div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div style={{ background: "white", borderRadius: 28, width: 680, boxShadow: "0 25px 70px rgba(0,0,0,0.3)", overflow: "hidden", animation: "modalIn 0.3s ease-out" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Thêm Người Dùng Mới</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Điền thông tin để tạo tài khoản mới trên hệ thống</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  {
                    label: "Họ và tên", key: "fullName", type: "text", placeholder: "Nguyễn Văn A", icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    )
                  },
                  {
                    label: "Email", key: "email", type: "email", placeholder: "email@example.com", icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    )
                  },
                  {
                    label: "Địa chỉ ví", key: "walletAddress", type: "text", placeholder: "0x...", full: true, icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                    )
                  },
                  {
                    label: "Số điện thoại", key: "phone", type: "text", placeholder: "090...", icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    )
                  },
                ].map(({ label, key, type, placeholder, full, icon }) => (
                  <div key={key} style={{ gridColumn: full ? "span 2" : "span 1" }}>
                    <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#475569", textTransform: "uppercase", letterSpacing: "0.02em" }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>{icon}</span>
                      <input
                        type={type}
                        value={newUser[key] || ""}
                        onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={{
                          width: "100%", padding: "12px 16px 12px 44px", borderRadius: 14,
                          border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14,
                          fontWeight: 500, color: "#1e293b", transition: "all 0.2s", boxSizing: "border-box"
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.1)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#475569", textTransform: "uppercase" }}>Vai trò</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0",
                      background: "#f8fafc", fontSize: 14, fontWeight: 600, color: "#1e293b", cursor: "pointer"
                    }}
                  >
                    <option value="admin">Quản trị viên</option>
                    <option value="staff">Nhân viên</option>
                    <option value="technician">Kỹ thuật viên</option>
                    <option value="user">Người dùng</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 32, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setIsAddOpen(false)}
                  style={{
                    background: "white", color: "#64748b", border: "1.5px solid #e2e8f0",
                    borderRadius: 14, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer"
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleAddUser}
                  style={{
                    background: "var(--navy-primary)",
                    color: "white",
                    border: "none", borderRadius: 14, padding: "14px 40px", fontWeight: 800, fontSize: 15,
                    cursor: "pointer", boxShadow: "0 10px 20px -10px rgba(41, 85, 206, 0.5)", transition: "0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  Xác nhận thêm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div style={{ background: "white", borderRadius: 28, width: 680, boxShadow: "0 25px 70px rgba(0,0,0,0.3)", overflow: "hidden", animation: "modalIn 0.3s ease-out" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Chỉnh Sửa Người Dùng</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Cập nhật thông tin tài khoản: {editUser.fullName}</p>
                </div>
              </div>
              <button onClick={() => setEditUser(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { label: "Họ và tên", key: "fullName", type: "text", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
                  { label: "Email", key: "email", type: "email", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
                  { label: "Số điện thoại", key: "phone", type: "text", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> },
                ].map(({ label, key, type, icon }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#475569", textTransform: "uppercase" }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>{icon}</span>
                      <input
                        type={type}
                        value={editUser[key] || ""}
                        onChange={(e) => setEditUser({ ...editUser, [key]: e.target.value })}
                        style={{
                          width: "100%", padding: "12px 16px 12px 44px", borderRadius: 14,
                          border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14,
                          fontWeight: 500, boxSizing: "border-box", transition: "0.2s"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#475569", textTransform: "uppercase" }}>Vai trò</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0",
                      background: "#f8fafc", fontSize: 14, fontWeight: 600, color: "#1e293b", cursor: "pointer"
                    }}
                  >
                    <option value="admin">Quản trị viên</option>
                    <option value="staff">Nhân viên</option>
                    <option value="technician">Kỹ thuật viên</option>
                    <option value="user">Người dùng</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#475569", textTransform: "uppercase" }}>Trạng thái tài khoản</label>
                  <div style={{ display: "flex", gap: 12 }}>
                    {["active", "inactive"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditUser({ ...editUser, status: s })}
                        style={{
                          flex: 1, padding: "12px", borderRadius: 14, border: "2px solid",
                          borderColor: editUser.status === s ? (s === "active" ? "#10b981" : "#ef4444") : "#e2e8f0",
                          background: editUser.status === s ? (s === "active" ? "#f0fdf4" : "#fef2f2") : "white",
                          color: editUser.status === s ? (s === "active" ? "#10b981" : "#ef4444") : "#64748b",
                          fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "0.2s"
                        }}
                      >
                        {s === "active" ? "Đang hoạt động" : "Tạm dừng / Khóa"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 32, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEditUser(null)}
                  style={{
                    background: "white", color: "#64748b", border: "1.5px solid #e2e8f0",
                    borderRadius: 14, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer"
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    background: "var(--navy-primary)", color: "white",
                    border: "none", borderRadius: 14, padding: "14px 40px", fontWeight: 800, fontSize: 15,
                    cursor: "pointer", boxShadow: "0 10px 20px -10px rgba(41, 85, 206, 0.5)", transition: "0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  Lưu thay đổi                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 24, width: 1200, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: AVATAR_COLORS[users.findIndex(u => u.id === selectedUser.id) % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                  fontSize: 18, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  {selectedUser.initials}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Chi tiết & Sản phẩm bảo hành</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{selectedUser.fullName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"} onMouseOut={(e) => e.currentTarget.style.background = "#f1f5f9"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", flex: 1, overflow: "hidden" }}>
              {/* Left Column: Warranty Products */}
              <div style={{ padding: 32, borderRight: "1px solid #f1f5f9", overflowY: "auto", background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e40af" }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Sản phẩm đang bảo hành ({userWarranties.length})</span>
                </div>

                {loadingWarranties ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "#94a3b8" }}>
                    <div className="spinner" style={{ width: 30, height: 30, border: "3px solid #f3f3f3", borderTop: "3px solid #1e40af", borderRadius: "50%", marginBottom: 12 }}></div>
                    <span style={{ fontSize: 13 }}>Đang tải danh sách...</span>
                  </div>
                ) : userWarranties.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                    {userWarranties.map((w) => (
                      <div key={w._id} style={{ padding: 16, borderRadius: 16, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", gap: 14, transition: "0.2s" }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; }}>
                        <div style={{ width: 60, height: 60, borderRadius: 12, background: "white", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                          {w.productImage ? (
                            <img src={w.productImage.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")} style={{ width: "85%", height: "85%", objectFit: "contain" }} alt={w.productName} />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M21 15l-5-5L5 21" />
                            </svg>
                          )}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1e40af", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={w.productName}>
                            {w.productName}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", display: "flex", flexDirection: "column", gap: 1 }}>
                            <span style={{ fontWeight: 600 }}>SN: <span style={{ color: "#0f172a" }}>{w.serialNumber}</span></span>
                            <span>Hết hạn: {new Date(w.expiryDate * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: 16, color: "#94a3b8", fontSize: 13, border: "1px dashed #e2e8f0" }}>
                    Người dùng này chưa có sản phẩm bảo hành nào.
                  </div>
                )}
              </div>

              {/* Right Column: User Info */}
              <div style={{ padding: 32, background: "#f8fafc", overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Thông tin tài khoản</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  {[
                    { label: "Địa chỉ ví", value: selectedUser.walletAddress, mono: true, fullWidth: true },
                    { label: "Email", value: selectedUser.email || "Chưa cập nhật" },
                    { label: "Số điện thoại", value: selectedUser.phone || "Chưa cập nhật" },
                    { label: "Vai trò", value: selectedUser.role.toUpperCase(), badge: true, color: ROLE_STYLES[selectedUser.role]?.background },
                    { label: "Trạng thái", value: selectedUser.isActive ? "ĐANG HOẠT ĐỘNG" : "TẠM DỪNG", badge: true, color: selectedUser.isActive ? "#10b981" : "#ef4444" },
                    { label: "Ngày tham gia", value: selectedUser.joinDate || "N/A" },
                    { label: "Hoạt động cuối", value: selectedUser.lastActive || "N/A" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      gridColumn: item.fullWidth ? "span 2" : "span 1",
                      background: "white", padding: "12px 16px", borderRadius: 16,
                      border: "1px solid #f1f5f9", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                    }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>{item.label}</label>
                      {item.badge ? (
                        <div style={{ display: "flex" }}>
                          <span style={{ background: item.color, color: "white", padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>{item.value}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: item.mono ? "monospace" : "inherit", wordBreak: "break-all" }}>
                          {item.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {userToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 24, width: 420, padding: "40px 32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.2s ease-out" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Xác nhận khóa?</h3>
            <p style={{ margin: "0 0 32px", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
              Bạn có chắc chắn muốn khóa người dùng <strong style={{ color: "#1e293b" }}>"{userToDelete.fullName}"</strong>?
              Hành động này sẽ chuyển trạng thái tài khoản sang <span style={{ color: "#ef4444", fontWeight: 700 }}>"Tạm dừng"</span>.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={(e) => e.currentTarget.style.background = "white"}
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#ef4444", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 8px 16px -4px rgba(239,68,68,0.3)", transition: "0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
