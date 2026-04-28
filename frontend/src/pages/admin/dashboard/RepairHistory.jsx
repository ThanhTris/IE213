import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { repairService } from "../../../services/repairService";
import { getStatusConfig } from "../../../utils/statusStyles";


function RepairHistory() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" hoặc "edit"
  const [updateForm, setUpdateForm] = useState({
    status: "",
    note: "",
    cost: 0,
    type: "",
    isWarrantyCovered: false
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await repairService.getAllRepairs();
      setRepairs(res.data || []);
    } catch (err) {
      toast.error("Lỗi khi tải lịch sử sửa chữa: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return repairs;
    return repairs.filter(
      (r) =>
        r.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.repairContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.technicianWallet?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [repairs, searchTerm]);

  const openDetail = (repair, mode = "view") => {
    setSelectedRepair(repair);
    setModalMode(mode);
    setUpdateForm({
      status: "",
      note: "",
      cost: repair.cost || 0,
      type: repair.type || "Khác",
      isWarrantyCovered: repair.isWarrantyCovered || false
    });
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setSelectedRepair(null);
    setIsModalOpen(false);
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsUpdating(true);
      const payload = {
        cost: updateForm.cost,
        type: updateForm.type,
        isWarrantyCovered: updateForm.isWarrantyCovered
      };

      if (updateForm.status) {
        payload.status = updateForm.status;
        payload.note = updateForm.note || `Cập nhật trạng thái sang ${updateForm.status}`;
      }

      await repairService.updateRepairStatus(selectedRepair.id, payload);
      toast.success("Đã cập nhật thông tin sửa chữa.");
      closeDetail();
      fetchRepairs();
    } catch (err) {
      toast.error("Lỗi khi cập nhật: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = (e, repair) => {
    e.stopPropagation(); // Ngăn sự kiện click row
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY phiếu sửa chữa cho thiết bị ${repair.serialNumber}?`)) return;

    try {
      repairService.updateRepairStatus(repair.id, {
        status: "cancelled",
        note: "Hủy phiếu sửa chữa bởi Admin"
      }).then(() => {
        toast.success("Đã hủy phiếu sửa chữa.");
        fetchRepairs();
      });
    } catch (err) {
      toast.error("Lỗi khi hủy: " + (err.response?.data?.message || err.message));
    }
  };

  const coveredCount = repairs.filter((r) => r.isWarrantyCovered).length;
  const notCoveredCount = repairs.filter((r) => !r.isWarrantyCovered).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="repair-history-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Lịch Sử Sửa Chữa Hệ Thống</span>
        </div>
        <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
          {repairs.length} lượt sửa chữa
        </span>
      </div>

      {/* Stats Cards */}
      <div className="repair-stats-v4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <div className="stat-card-v4" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tổng lượt sửa chữa</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{repairs.length}</span>
        </div>
        <div className="stat-card-v4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trong bảo hành</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#16a34a" }}>{coveredCount}</span>
        </div>
        <div className="stat-card-v4" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ngoài bảo hành</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>{notCoveredCount}</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-input-wrapper" style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo sản phẩm, serial, khách hàng hoặc nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="repair-table">
          <thead>
            <tr>
              <th>Số Serial</th>
              <th>Loại hình</th>
              <th>Nội dung chính</th>
              <th>Chi phí</th>
              <th>Kỹ thuật viên</th>
              <th>Ngày thực hiện</th>
              <th>Bảo hành</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                onClick={() => openDetail(record, "view")}
                style={{ cursor: "pointer" }}
                className="hoverable-row"
              >
                <td>
                  <div style={{ fontWeight: 600, color: "#1e40af", fontSize: 13 }}>{record.serialNumber}</div>
                </td>
                <td>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{record.type || "Khác"}</div>
                </td>
                <td>
                  <div style={{ color: "#475569", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.repairContent}</div>
                </td>
                <td style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                  {record.cost > 0 ? Number(record.cost).toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                </td>
                <td>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }} title={record.technicianWallet}>
                    {record.technicianWallet ? `${record.technicianWallet.slice(0, 6)}...` : "N/A"}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: "#475569" }}>
                  {record.repairDate ? new Date(record.repairDate).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td>
                  <span style={{
                    display: "inline-block",
                    background: record.isWarrantyCovered ? "#10b981" : "#ef4444",
                    color: "white",
                    borderRadius: 20, padding: "2px 10px",
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {record.isWarrantyCovered ? "Có" : "Không"}
                  </span>
                </td>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    borderRadius: 20, padding: "4px 12px",
                    fontSize: 12, fontWeight: 700,
                    background: getStatusConfig(record.status).background,
                    color: getStatusConfig(record.status).color,
                    border: `1px solid ${getStatusConfig(record.status).borderColor}`,
                  }}>
                    {getStatusConfig(record.status).label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Không tìm thấy ghi nhận sửa chữa nào.</div>
        )}
      </div>

      {/* Table */}

      {/* Detail & Update Modal */}
      {isModalOpen && selectedRepair && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: "hidden" }}>
            <div className="modal-header" style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Chi tiết phiếu sửa chữa</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Serial: {selectedRepair.serialNumber}</p>
              </div>
              <button className="close-btn" onClick={closeDetail}>&times;</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: "70vh" }}>
              {/* Left: Timeline & Info */}
              <div style={{ padding: 24, borderRight: "1px solid #e2e8f0", overflowY: "auto", background: "#fff" }}>
                <h4 style={{ marginTop: 0, marginBottom: 20, fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#1e40af" }}>Dòng thời gian</h4>
                <div className="repair-timeline-v2">
                  {selectedRepair.timeline?.map((step, idx) => (
                    <div key={idx} className="timeline-step-v2">
                      <div className="step-marker-v2">
                        <div className="step-dot-v2" style={{ background: getStatusConfig(step.status).color }}></div>
                        {idx < selectedRepair.timeline.length - 1 && <div className="step-line-v2"></div>}
                      </div>
                      <div className="step-content-v2">
                        <div className="step-header-v2">
                          <span className="step-status-v2" style={{ color: getStatusConfig(step.status).color }}>{getStatusConfig(step.status).label}</span>
                          <span className="step-time-v2">{formatDate(step.timestamp)}</span>
                        </div>
                        <p className="step-note-v2">{step.note || "Không có ghi chú"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 30, padding: 16, background: "#f1f5f9", borderRadius: 12 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#475569" }}>Thông tin bổ sung</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Loại hình</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedRepair.type}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Chi phí</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedRepair.cost?.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Update Form */}
              <div style={{ padding: 24, background: "#f8fafc", overflowY: "auto" }}>
                <h4 style={{ marginTop: 0, marginBottom: 20, fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#059669" }}>Cập nhật thông tin</h4>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Chuyển trạng thái sang</label>
                    <select
                      value={updateForm.status}
                      onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
                    >
                      <option value="">-- Giữ nguyên trạng thái --</option>
                      <option value="waiting_parts">Chờ linh kiện</option>
                      <option value="fixing">Đang sửa chữa</option>
                      <option value="completed">Sửa chữa hoàn tất</option>
                      <option value="delivered">Đã giao khách hàng</option>
                      <option value="cancelled">Hủy phiếu</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Ghi chú cập nhật</label>
                    <textarea
                      placeholder="Ví dụ: Đã thay xong màn hình, đang test cảm ứng..."
                      value={updateForm.note}
                      onChange={e => setUpdateForm({ ...updateForm, note: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, minHeight: 80 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Loại hình</label>
                      <select
                        value={updateForm.type}
                        onChange={e => setUpdateForm({ ...updateForm, type: e.target.value })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
                      >
                        <option value="Màn hình">Màn hình</option>
                        <option value="Pin/Nguồn">Pin/Nguồn</option>
                        <option value="Phần cứng">Phần cứng</option>
                        <option value="Phần mềm">Phần mềm</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Chi phí (VND)</label>
                      <input
                        type="number"
                        value={updateForm.cost}
                        onChange={e => setUpdateForm({ ...updateForm, cost: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      id="warrantyCheck"
                      checked={updateForm.isWarrantyCovered}
                      onChange={e => setUpdateForm({ ...updateForm, isWarrantyCovered: e.target.checked })}
                    />
                    <label htmlFor="warrantyCheck" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Được bảo hành chi phí</label>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)"
                      }}
                    >
                      {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .repair-timeline-v2 { display: flex; flexDirection: column; gap: 0; }
        .timeline-step-v2 { display: flex; gap: 16px; }
        .step-marker-v2 { display: flex; flex-direction: column; align-items: center; padding-top: 6px; }
        .step-dot-v2 { width: 10px; height: 10px; border-radius: 50%; z-index: 1; }
        .step-line-v2 { width: 2px; flex: 1; background: #e2e8f0; margin-top: 4px; margin-bottom: 4px; }
        .step-content-v2 { flex: 1; padding-bottom: 20px; }
        .step-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .step-status-v2 { font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .step-time-v2 { font-size: 11px; color: #94a3b8; font-weight: 600; }
        .step-note-v2 { font-size: 13px; color: #475569; margin: 0; line-height: 1.5; }
        .repair-timeline-v2 { display: flex; flex-direction: column; gap: 0; }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 500px;
          max-width: 95vw;
          max-height: 90vh;
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-large {
          width: 1000px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: rotate(90deg);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .action-btn { transition: all 0.2s; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .hoverable-row:hover { background-color: #f8fafc !important; }
      `}</style>
    </div>
  );
}

export default RepairHistory;
