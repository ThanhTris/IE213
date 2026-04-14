import { API_ROOT } from "../utils/api";

const getHeaders = () => {
  const token = localStorage.getItem("bw_auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const repairLogService = {
  async createLog(payload) {
    const res = await fetch(`${API_ROOT}/repair-logs`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Không thể tạo nhật ký sửa chữa");
    return json;
  },

  async getAllLogs() {
    const res = await fetch(`${API_ROOT}/repair-logs`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Không thể tải danh sách sửa chữa");
    return json;
  },

  async getLogsBySerial(serialNumber) {
    const res = await fetch(`${API_ROOT}/repair-logs/device/${serialNumber}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Không tìm thấy lịch sử sửa chữa");
    return json;
  }
};