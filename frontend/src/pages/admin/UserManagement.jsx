import { useState, useMemo } from "react";

const initialUsers = [
  {
    username: "manager1",
    name: "Nguyễn Văn Admin",
    email: "manager1@gis-apartment.vn",
    role: "Manager",
    status: "active",
  },
  {
    username: "manager2",
    name: "Trần Thị Quản Lý",
    email: "manager2@gis-apartment.vn",
    role: "Manager",
    status: "active",
  },
  {
    username: "user1",
    name: "Lê Văn Người Dùng",
    email: "user1@gis-apartment.vn",
    role: "User",
    status: "active",
  },
  {
    username: "user2",
    name: "Phạm Thị Hoa",
    email: "user2@gis-apartment.vn",
    role: "User",
    status: "active",
  },
  {
    username: "user3",
    name: "Hoàng Minh Tuấn",
    email: "user3@gis-apartment.vn",
    role: "User",
    status: "disabled",
  },
];

function UserManagement() {
  const [users] = useState(initialUsers);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "active"
          ? user.status === "active"
          : user.status !== "active");
      const searchMatch =
        searchTerm === "" ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [users, filterStatus, searchTerm]);

  return (
    <div className="user-management-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo username, họ tên, email, vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            Hoạt động
          </button>
          <button
            className={`filter-btn ${filterStatus === "disabled" ? "active" : ""}`}
            onClick={() => setFilterStatus("disabled")}
          >
            Vô hiệu
          </button>
        </div>
      </div>

      {/* User Count */}
      <div className="product-count">
        <span>{filteredUsers.length} người dùng</span>
      </div>

      {/* User Table */}
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.username}>
                <td>
                  <span
                    className="product-name"
                    style={{ color: "#2563eb", fontWeight: 500 }}
                  >
                    {user.username}
                  </span>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.role === "Manager" ? (
                    <span
                      className="category-badge"
                      style={{ background: "#e0edff", color: "#2563eb" }}
                    >
                      Manager
                    </span>
                  ) : (
                    <span className="category-badge">User</span>
                  )}
                </td>
                <td>
                  {user.status === "active" ? (
                    <span
                      className="status-badge"
                      style={{ background: "#d1fae5", color: "#059669" }}
                    >
                      Hoạt động
                    </span>
                  ) : (
                    <span
                      className="status-badge"
                      style={{ background: "#fee2e2", color: "#dc2626" }}
                    >
                      Vô hiệu
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      title={
                        user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
                      }
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <circle cx="12" cy="16" r="1" />
                      </svg>
                    </button>
                    <button className="action-btn" title="Chỉnh sửa">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button className="action-btn" title="Xóa">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
