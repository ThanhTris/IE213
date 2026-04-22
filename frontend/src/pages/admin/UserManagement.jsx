import { useState, useMemo, useEffect } from "react";
import { userService } from "../../services/userService";

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "??";
  return name.trim().split(" ").map(p => p[0].toUpperCase()).slice(0, 2).join("");
};

const ROLE_STYLES = {
  admin:  { background: "#f59e0b", color: "white" },
  user:   { background: "#3b82f6", color: "white" },
  guest:  { background: "white",   color: "#475569", border: "1.5px solid #d1d5db" },
};

const ROLE_ICON = {
  user: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
  ),
  admin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  guest: null,
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
  const [newUser, setNewUser] = useState({ fullName: "", email: "", walletAddress: "", role: "user", phone: "" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      // Chuyển đổi dữ liệu backend sang format frontend mong đợi (nếu cần)
      const formatted = (res.data || []).map(u => ({
        id: u._id || u.id,
        fullName: u.fullName || "Unnamed",
        initials: getInitials(u.fullName),
        email: u.email || "No email",
        walletAddress: u.walletAddress,
        phone: u.phone || "N/A",
        role: u.role || "user",
        status: u.isActive ? "active" : "inactive",
        joinDate: new Date(u.createdAt).toLocaleDateString(),
        lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "N/A",
        warrantyCount: 0, 
      }));
      setUsers(formatted);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
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
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.walletAddress.toLowerCase().includes(q);
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus = filterStatus === "all" || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const handleAddUser = async () => {
    if (!newUser.walletAddress) { alert("Cần wallet address!"); return; }
    try {
      // Backend upsertUserByWallet chỉ cần walletAddress
      await userService.login({ walletAddress: newUser.walletAddress, fullName: newUser.fullName, email: newUser.email, role: newUser.role, phone: newUser.phone });
      fetchUsers();
      setNewUser({ fullName: "", email: "", walletAddress: "", role: "user" });
      setIsAddOpen(false);
    } catch (err) {
      alert("Lỗi khi thêm người dùng: " + (err.message || "Không xác định"));
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      // API Backend: update role/status riêng biệt hoặc chung
      // Ở đây ta dùng updateMyProfile logic cho admin nếu được, hoặc mockup action
      // Giả sử backend hỗ trợ cập nhật theo wallet qua admin route
      const payload = {
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
        isActive: editUser.status === "active"
      };
      // Gọi API cập nhật của Admin (Cần kiểm tra lại method backend)
      // fetch(`${API_ROOT}/users/${editUser.walletAddress}`, ...)
      // Tạm thời dùng payload để update
      await fetchUsers(); // Re-fetch for now
      setEditUser(null);
    } catch (err) {
      alert("Lỗi khi cập nhật");
    }
  };

  const handleDelete = (userId, name) => {
    if (window.confirm(`Delete ${name}? (Note: API deletion not yet implemented in backend)`)) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const shortWallet = (addr) => `${addr.slice(0, 8)}...${addr.slice(-4)}`;

  return (
    <div className="product-list-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Tất Cả Người Dùng</span>
          <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "3px 12px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            {filteredUsers.length} người dùng
          </span>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#10b981", color: "white", border: "none",
            borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14,
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#059669")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#10b981")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
          </svg>
          Thêm Người Dùng
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc địa chỉ ví..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button className="action-btn" style={{ width: "auto", padding: "0 16px", gap: 6, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Bộ lọc
        </button>
      </div>

      {/* Role + Status filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {["all", "admin", "user", "guest"].map((r) => (
          <button
            key={r}
            className={`filter-btn${filterRole === r ? " active" : ""}`}
            onClick={() => setFilterRole(r)}
            style={
              filterRole !== r && r === "admin"
                ? { borderColor: "#f59e0b", color: "#f59e0b" }
                : filterRole !== r && r === "user"
                ? { borderColor: "#3b82f6", color: "#3b82f6" }
                : {}
            }
          >
            {r === "all" ? "Tất Cả" : r === "admin" ? "Quản trị viên" : r === "user" ? "Người dùng" : "Khách"}
          </button>
        ))}
        <div style={{ width: 1, background: "#e2e8f0", margin: "0 4px" }} />
        {["all", "active", "inactive"].map((s) => (
          <button
            key={s}
            className={`filter-btn${filterStatus === s ? " active" : ""}`}
            onClick={() => setFilterStatus(s)}
            style={
              filterStatus !== s && s === "active"
                ? { borderColor: "#10b981", color: "#10b981" }
                : filterStatus !== s && s === "inactive"
                ? { borderColor: "#ef4444", color: "#ef4444" }
                : {}
            }
          >
            {s === "all" ? "Mọi Trạng Thái" : s === "active" ? "Hoạt động" : "Tạm dừng"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Địa chỉ ví</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Số điện thoại</th>
              <th>Bảo hành</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                      color: "white", fontWeight: 700, fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {user.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{user.fullName}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
                    {shortWallet(user.walletAddress)}
                  </span>
                </td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700,
                    ...ROLE_STYLES[user.role],
                  }}>
                    {ROLE_ICON[user.role]}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700,
                    background: user.status === "active" ? "#10b981" : "#ef4444",
                    color: "white",
                  }}>
                    {user.status === "active" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    )}
                    {s === "active" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </td>
                <td style={{ color: "#475569", fontSize: 13 }}>{user.phone}</td>
                <td style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{user.warrantyCount}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      title="Edit"
                      onClick={() => setEditUser({ ...user })}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="action-btn"
                      title="Delete"
                      style={{ borderColor: "#fca5a5" }}
                      onClick={() => handleDelete(user.id, user.fullName)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", color: "#0f172a", fontSize: 18, fontWeight: 700 }}>Thêm Người Dùng Mới</h3>
            {[
              { label: "Họ và tên", key: "fullName", type: "text", placeholder: "Nhập họ và tên" },
              { label: "Email", key: "email", type: "email", placeholder: "Nhập email" },
              { label: "Địa chỉ ví", key: "walletAddress", type: "text", placeholder: "0x..." },
              { label: "Số điện thoại", key: "phone", type: "text", placeholder: "Nhập số điện thoại" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#475569" }}>{label}</label>
                <input
                  type={type}
                  value={newUser[key]}
                  onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="search-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#475569" }}>Vai trò</label>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="search-input" style={{ width: "100%", cursor: "pointer" }}>
                <option value="admin">Quản trị viên</option>
                <option value="user">Người dùng</option>
                <option value="guest">Khách</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddUser} style={{ flex: 1, background: "#10b981", color: "white", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Thêm Người Dùng
              </button>
              <button onClick={() => setIsAddOpen(false)} style={{ background: "white", color: "#ef4444", border: "1.5px solid #ef4444", borderRadius: 10, padding: "12px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", color: "#0f172a", fontSize: 18, fontWeight: 700 }}>Chỉnh Sửa Người Dùng</h3>
            {[
              { label: "Email", key: "email", type: "email" },
              { label: "Số điện thoại", key: "phone", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#475569" }}>{label}</label>
                <input type={type} value={editUser[key]} onChange={(e) => setEditUser({ ...editUser, [key]: e.target.value })}
                  className="search-input" style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#475569" }}>Vai trò</label>
              <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="search-input" style={{ width: "100%", cursor: "pointer" }}>
                <option value="admin">Quản trị viên</option>
                <option value="user">Người dùng</option>
                <option value="guest">Khách</option>
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#475569" }}>Trạng thái</label>
              <select value={editUser.status} onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                className="search-input" style={{ width: "100%", cursor: "pointer" }}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSaveEdit} style={{ flex: 1, background: "#10b981", color: "white", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Lưu Thay Đổi
              </button>
              <button onClick={() => setEditUser(null)} style={{ background: "white", color: "#ef4444", border: "1.5px solid #ef4444", borderRadius: 10, padding: "12px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
