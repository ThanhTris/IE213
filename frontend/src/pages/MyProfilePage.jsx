import { useState, useEffect } from "react";
import { apiGetMyProfile, apiUpdateMyProfile } from "../utils/api";
import "../assets/views/MyProfilePage.css";

function MyProfilePage({ auth }) {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!auth?.token) return;
      setLoading(true);
      setMessage("");
      setError("");
      try {
        const { json } = await apiGetMyProfile(auth.token);
        if (json && json.success) {
          setProfile({
            fullName: json.data?.fullName || "",
            email: json.data?.email || "",
            phone: json.data?.phone || "",
          });
        } else {
          setError(json?.message || "Lỗi tải thông tin cá nhân");
        }
      } catch {
        setError("Lỗi kết nối khi tải thông tin");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { json } = await apiUpdateMyProfile(auth.token, profile);
      if (json && json.success) {
        setMessage("Cập nhật thông tin thành công!");
      } else {
        setError(json?.message || "Cập nhật thông tin thất bại");
      }
    } catch {
      setError("Lỗi kết nối khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="profile-container fade-in">
      <h2>Hồ Sơ Của Tôi</h2>
      <p className="wallet-info">
        <strong>Ví kết nối:</strong> {auth?.walletAddress}
      </p>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Họ và Tên</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <button type="submit" className="btn-save" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}

export default MyProfilePage;
