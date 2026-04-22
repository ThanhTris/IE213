import { useState } from "react";
import { toast } from "sonner";
import { repairService } from "../../services/repairService";

const WrenchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const HashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

function LogRepairs() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    serialNumber: "",
    repairContent: "",
    warrantyCovered: "yes",
    status: "pending",
    cost: 0,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.serialNumber.trim()) errs.serialNumber = "Serial Number is required";
    if (!form.repairContent.trim()) errs.repairContent = "Repair Content is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setLoading(true);
      const payload = {
        serialNumber: form.serialNumber,
        repairContent: form.repairContent,
        isWarrantyCovered: form.warrantyCovered === "yes",
        status: form.status,
        cost: Number(form.cost) || 0,
        // technicianWallet and repairDate will be handled by backend usually, 
        // but we could pass them if needed.
      };
      await repairService.createRepair(payload);
      toast.success("Đã ghi nhận bản ghi sửa chữa thành công!");
      setSubmitted(true);
      setForm({
        serialNumber: "",
        repairContent: "",
        warrantyCovered: "yes",
        status: "pending",
        cost: 0,
      });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error("Lỗi khi lưu bản ghi sửa chữa: " + (err.message || "Không xác định"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Left: Form Card */}
        <div style={{ background: "white", borderRadius: 16, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {/* Card Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <span style={{ color: "#1e40af" }}><WrenchIcon /></span>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>Log Repair Activity</span>
          </div>

          {submitted && (
            <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", color: "#065f46", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
              ✓ Repair record submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Serial Number */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 7 }}>
                Serial Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="3" y2="6.01"/><line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="3" y2="12.01"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="3" y2="18.01"/><line x1="8" y1="18" x2="21" y2="18"/>
                  </svg>
                </span>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={update("serialNumber")}
                  placeholder="e.g., IP14-BLK-001"
                  style={{
                    width: "100%", padding: "10px 14px 10px 36px", boxSizing: "border-box",
                    border: `1.5px solid ${errors.serialNumber ? "#ef4444" : "#d1d5db"}`,
                    borderRadius: 8, fontSize: 14, color: "#374151", background: "white",
                    outline: "none", transition: "border 0.2s",
                  }}
                  onFocus={(e) => { if (!errors.serialNumber) e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.serialNumber ? "#ef4444" : "#d1d5db"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              {errors.serialNumber && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors.serialNumber}</div>}
            </div>

            {/* Repair Content */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 7 }}>
                Repair Content <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={form.repairContent}
                onChange={update("repairContent")}
                placeholder="e.g., Thay màn hình do vỡ"
                rows={4}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px",
                  border: `1.5px solid ${errors.repairContent ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: 8, fontSize: 14, color: "#374151", background: "white",
                  outline: "none", resize: "vertical", fontFamily: "inherit",
                  transition: "border 0.2s",
                }}
                onFocus={(e) => { if (!errors.repairContent) e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.repairContent ? "#ef4444" : "#d1d5db"; e.target.style.boxShadow = "none"; }}
              />
              {errors.repairContent && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors.repairContent}</div>}
            </div>

            {/* Warranty Covered */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 7 }}>
                Warranty Covered
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.warrantyCovered}
                  onChange={update("warrantyCovered")}
                  style={{
                    width: "100%", padding: "10px 36px 10px 14px", appearance: "none",
                    border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14,
                    color: "#374151", background: "white", cursor: "pointer",
                    outline: "none", fontFamily: "inherit",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                >
                  <option value="yes">Yes (Covered)</option>
                  <option value="no">No (Not Covered)</option>
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 7 }}>
                Status
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.status}
                  onChange={update("status")}
                  style={{
                    width: "100%", padding: "10px 36px 10px 14px", appearance: "none",
                    border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14,
                    color: "#374151", background: "white", cursor: "pointer",
                    outline: "none", fontFamily: "inherit",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                >
                  <option value="pending">Pending</option>
                  <option value="fixing">Fixing</option>
                  <option value="completed">Completed</option>
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Cost */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 7 }}>
                Repair Cost (VND)
              </label>
              <input
                type="number"
                value={form.cost}
                onChange={update("cost")}
                placeholder="e.g., 500000"
                style={{
                  width: "100%", padding: "10px 14px", boxSizing: "border-box",
                  border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14,
                  color: "#374151", background: "white", outline: "none",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #059669, #047857)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(16,185,129,0.4)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #10b981, #059669)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.3)"; }}
            >
              {loading ? "Submitting..." : "Submit Repair Record"}
            </button>
          </form>
        </div>

        {/* Right: Benefits Card */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Repair Tracking Benefits
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "All repairs are permanently recorded on the blockchain, creating a complete service history",
              "Increases trust and transparency for second-hand buyers",
              "Helps identify patterns and improve product quality",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}><HashIcon /></span>
                <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Note box */}
          <div style={{
            marginTop: 24, background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <span style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.6 }}>
              <strong>Note:</strong> Technician wallet and repair date will be automatically recorded from the current session.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LogRepairs;
