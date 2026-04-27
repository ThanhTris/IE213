import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { repairService } from "../../services/repairService";
import { warrantyService } from "../../services/warrantyService";
import { API_ROOT } from "../../utils/api";

const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

function LogRepairs() {
  const [loading, setLoading] = useState(false);
  const [warranties, setWarranties] = useState([]);
  const [isFetchingWarranties, setIsFetchingWarranties] = useState(true);
  
  const [form, setForm] = useState({
    serialNumber: "",
    repairContent: "",
    warrantyCovered: "yes",
    status: "pending",
    type: "Khác",
    cost: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchWarranties = async () => {
      try {
        const res = await warrantyService.getAllWarranties();
        if (res.success && Array.isArray(res.data)) {
          setWarranties(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch warranties:", err);
      } finally {
        setIsFetchingWarranties(false);
      }
    };
    fetchWarranties();
  }, []);

  const filteredWarranties = useMemo(() => {
    if (!searchTerm) return warranties;
    const lower = searchTerm.toLowerCase();
    return warranties.filter(w => 
      w.serialNumber.toLowerCase().includes(lower) || 
      w.productCode.toLowerCase().includes(lower)
    );
  }, [warranties, searchTerm]);

  const selectedWarranty = useMemo(() => {
    return warranties.find(w => w.serialNumber === form.serialNumber);
  }, [warranties, form.serialNumber]);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.serialNumber) errs.serialNumber = "Vui lòng chọn thiết bị (Serial Number)";
    if (!form.repairContent.trim()) errs.repairContent = "Vui lòng nhập nội dung sửa chữa";
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
        note: form.repairContent,
        isWarrantyCovered: form.warrantyCovered === "yes",
        status: form.status,
        type: form.type,
        cost: Number(form.cost) || 0,
      };
      await repairService.createRepair(payload);
      toast.success("Đã ghi nhận bản ghi sửa chữa thành công!");
      setSubmitted(true);
      setForm({
        serialNumber: "",
        repairContent: "",
        warrantyCovered: "yes",
        status: "pending",
        type: "Khác",
        cost: 0,
      });
      setSearchTerm("");
      setTimeout(() => setSubmitted(false), 3500);
    } catch (err) {
      toast.error("Lỗi khi lưu bản ghi sửa chữa: " + (err.message || "Không xác định"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lr-container">
      <div className="lr-grid">
        
        {/* Left: Form Card */}
        <div className="lr-card lr-form-card">
          <div className="lr-card-header">
            <div className="lr-header-icon"><WrenchIcon /></div>
            <h2 className="lr-card-title">Log Repair Activity</h2>
          </div>

          {submitted && (
            <div className="lr-banner lr-banner--success">
              ✓ Repair record submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Serial Number Searchable Dropdown */}
            <div className="lr-field">
              <label className="lr-label">
                Serial Number <span className="lr-required">*</span>
              </label>
              
              <div className="lr-custom-select-container">
                <div 
                  className={`lr-dropdown-trigger ${errors.serialNumber ? "lr-dropdown-trigger--error" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedWarranty ? (
                    <div className="lr-selected-info">
                      <span className="lr-selected-code">{selectedWarranty.serialNumber}</span>
                      <span className="lr-selected-name">{selectedWarranty.productCode}</span>
                    </div>
                  ) : (
                    <span className="lr-placeholder">Search by Serial Number...</span>
                  )}
                  <span className={`lr-select-arrow ${isDropdownOpen ? "open" : ""}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {isDropdownOpen && (
                  <div className="lr-dropdown-panel">
                    <div className="lr-dropdown-search-wrap">
                      <SearchIcon />
                      <input 
                        type="text" 
                        className="lr-dropdown-search-input"
                        placeholder="Type to filter..."
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="lr-dropdown-list">
                      {isFetchingWarranties ? (
                        <div className="lr-dropdown-loading">Đang tải...</div>
                      ) : filteredWarranties.length > 0 ? (
                        filteredWarranties.map((w) => (
                          <div 
                            key={w._id} 
                            className="lr-dropdown-item"
                            onClick={() => {
                              setForm(prev => ({ ...prev, serialNumber: w.serialNumber }));
                              setIsDropdownOpen(false);
                              if (errors.serialNumber) setErrors(prev => ({ ...prev, serialNumber: "" }));
                            }}
                          >
                            <div className="lr-item-main">
                              <span className="lr-item-serial">{w.serialNumber}</span>
                              <span className="lr-item-model">{w.productCode}</span>
                            </div>
                            {w.status && <span className="lr-item-badge">Active</span>}
                          </div>
                        ))
                      ) : (
                        <div className="lr-dropdown-empty">Không tìm thấy thiết bị</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.serialNumber && <div className="lr-error-msg">{errors.serialNumber}</div>}
            </div>

            {/* Repair Content */}
            <div className="lr-field">
              <label className="lr-label">
                Repair Content <span className="lr-required">*</span>
              </label>
              <textarea
                className={`lr-textarea ${errors.repairContent ? "lr-textarea--error" : ""}`}
                value={form.repairContent}
                onChange={updateField("repairContent")}
                placeholder="e.g., Thay màn hình do vỡ, thay pin..."
                rows={4}
              />
              {errors.repairContent && <div className="lr-error-msg">{errors.repairContent}</div>}
            </div>

            {/* Split row for Coverage and Status */}
            <div className="lr-row-split">
              <div className="lr-field">
                <label className="lr-label">Warranty Covered</label>
                <div className="lr-select-wrap">
                  <select
                    className="lr-select"
                    value={form.warrantyCovered}
                    onChange={updateField("warrantyCovered")}
                  >
                    <option value="yes">Yes (Covered)</option>
                    <option value="no">No (Not Covered)</option>
                  </select>
                  <span className="lr-select-arrow-fixed">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="lr-field">
                <label className="lr-label">Trạng thái hiện tại</label>
                <div className="lr-select-wrap">
                  <select
                    className="lr-select"
                    value={form.status}
                    onChange={updateField("status")}
                  >
                    <option value="pending">Tiếp nhận</option>
                    <option value="waiting_parts">Chờ linh kiện</option>
                    <option value="fixing">Đang sửa</option>
                    <option value="completed">Sửa xong</option>
                    <option value="delivered">Đã giao</option>
                  </select>

                  <span className="lr-select-arrow-fixed">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Split row for Repair Type and Cost */}
            <div className="lr-row-split">
              <div className="lr-field">
                <label className="lr-label">Loại hình sửa chữa</label>
                <div className="lr-select-wrap">
                  <select
                    className="lr-select"
                    value={form.type}
                    onChange={updateField("type")}
                  >
                    <option value="screen">Màn hình</option>
                    <option value="battery">Pin/Nguồn</option>
                    <option value="hardware">Phần cứng</option>
                    <option value="software">Phần mềm</option>
                    <option value="other">Khác</option>
                  </select>

                  <span className="lr-select-arrow-fixed">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

            {/* Cost */}
            <div className="lr-field">
              <label className="lr-label">Repair Cost (VND)</label>
              <div className="lr-input-wrap">
                <span className="lr-input-currency">₫</span>
                <input
                  type="number"
                  className="lr-input"
                  value={form.cost}
                  onChange={updateField("cost")}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`lr-submit-btn ${loading ? "loading" : ""}`}
            >
              {loading ? (
                <>
                  <span className="lr-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <WrenchIcon />
                  Submit Repair Record
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Info Card */}
        <div className="lr-info-col">
          <div className="lr-card lr-info-card">
            <div className="lr-card-header">
              <div className="lr-header-icon blue"><ShieldCheckIcon /></div>
              <h3 className="lr-card-title">Repair Tracking Benefits</h3>
            </div>
            <div className="lr-info-list">
              {[
                "All repairs are permanently recorded on the blockchain, creating a complete service history",
                "Increases trust and transparency for second-hand buyers",
                "Helps identify patterns and improve product quality",
              ].map((text, i) => (
                <div key={i} className="lr-info-item">
                  <span className="lr-info-dot">•</span>
                  <p className="lr-info-text">{text}</p>
                </div>
              ))}
            </div>

            <div className="lr-note-box">
              <p><strong>Note:</strong> Technician wallet and repair date will be automatically recorded from the current session.</p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .lr-container {
          padding: 1rem 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .lr-grid {
          display: grid;
          grid-template-columns: 1fr 34rem;
          gap: 2.4rem;
          align-items: start;
        }

        .lr-card {
          background: #fff;
          border-radius: 1.6rem;
          border: 0.1rem solid #e2e8f0;
          box-shadow: 0 0.4rem 2rem rgba(15,23,42,0.05);
        }

        .lr-form-card {
          padding: 3.2rem;
        }

        .lr-card-header {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          margin-bottom: 2.8rem;
        }

        .lr-header-icon {
          width: 3.8rem;
          height: 3.8rem;
          background: #ecfdf5;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1rem;
        }

        .lr-header-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .lr-card-title {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .lr-banner {
          padding: 1.2rem 1.6rem;
          border-radius: 1rem;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 2.4rem;
        }

        .lr-banner--success {
          background: #f0fdf4;
          color: #16a34a;
          border: 0.1rem solid #bbf7d0;
        }

        .lr-field {
          margin-bottom: 2.2rem;
        }

        .lr-label {
          display: block;
          font-size: 1.35rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 0.8rem;
        }

        .lr-required {
          color: #ef4444;
        }

        /* Custom Select */
        .lr-custom-select-container {
          position: relative;
        }

        .lr-dropdown-trigger {
          width: 100%;
          padding: 1.2rem 1.4rem;
          background: #fff;
          border: 0.1rem solid #d1d5db;
          border-radius: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lr-dropdown-trigger:hover {
          border-color: #94a3b8;
        }

        .lr-dropdown-trigger--error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .lr-selected-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .lr-selected-code {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
        }

        .lr-selected-name {
          font-size: 1.2rem;
          background: #f1f5f9;
          padding: 0.2rem 0.8rem;
          border-radius: 99rem;
          color: #64748b;
          font-weight: 600;
        }

        .lr-placeholder {
          font-size: 1.4rem;
          color: #94a3b8;
        }

        .lr-select-arrow {
          color: #94a3b8;
          transition: transform 0.2s;
        }

        .lr-select-arrow.open {
          transform: rotate(180deg);
        }

        .lr-dropdown-panel {
          position: absolute;
          top: calc(100% + 0.6rem);
          left: 0;
          right: 0;
          background: #fff;
          border: 0.1rem solid #e2e8f0;
          border-radius: 1.2rem;
          box-shadow: 0 1rem 3rem rgba(15,23,42,0.12);
          z-index: 100;
          overflow: hidden;
        }

        .lr-dropdown-search-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 1.4rem;
          background: #f8fafc;
          border-bottom: 0.1rem solid #f1f5f9;
          color: #94a3b8;
        }

        .lr-dropdown-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1.4rem;
          outline: none;
          color: #0f172a;
        }

        .lr-dropdown-list {
          max-height: 25rem;
          overflow-y: auto;
        }

        .lr-dropdown-item {
          padding: 1.2rem 1.4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.15s;
        }

        .lr-dropdown-item:hover {
          background: #f1f5f9;
        }

        .lr-item-main {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .lr-item-serial {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
        }

        .lr-item-model {
          font-size: 1.15rem;
          color: #64748b;
        }

        .lr-item-badge {
          font-size: 1.1rem;
          background: #ecfdf5;
          color: #10b981;
          padding: 0.2rem 0.8rem;
          border-radius: 99rem;
          font-weight: 700;
        }

        /* Textarea */
        .lr-textarea {
          width: 100%;
          padding: 1.2rem 1.4rem;
          border: 0.1rem solid #d1d5db;
          border-radius: 1.1rem;
          font-size: 1.4rem;
          outline: none;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .lr-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.3rem rgba(59,130,246,0.1);
        }

        .lr-row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .lr-select-wrap {
          position: relative;
        }

        .lr-select {
          width: 100%;
          padding: 1.2rem 1.4rem;
          padding-right: 3.6rem;
          background: #fff;
          border: 0.1rem solid #d1d5db;
          border-radius: 1.1rem;
          font-size: 1.4rem;
          appearance: none;
          outline: none;
          cursor: pointer;
        }

        .lr-select-arrow-fixed {
          position: absolute;
          right: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #94a3b8;
        }

        .lr-input-wrap {
          position: relative;
        }

        .lr-input-currency {
          position: absolute;
          left: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.4rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .lr-input {
          width: 100%;
          padding: 1.2rem 1.4rem 1.2rem 3rem;
          border: 0.1rem solid #d1d5db;
          border-radius: 1.1rem;
          font-size: 1.4rem;
          outline: none;
        }

        .lr-submit-btn {
          width: 100%;
          padding: 1.4rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 1.2rem;
          font-size: 1.6rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          cursor: pointer;
          box-shadow: 0 1rem 2rem rgba(16,185,129,0.2);
          transition: all 0.2s;
          margin-top: 1rem;
        }

        .lr-submit-btn:hover:not(:disabled) {
          transform: translateY(-0.2rem);
          box-shadow: 0 1.2rem 2.4rem rgba(16,185,129,0.3);
        }

        .lr-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .lr-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .lr-spinner {
          width: 1.8rem;
          height: 1.8rem;
          border: 0.3rem solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .lr-info-card {
          padding: 2.8rem;
        }

        .lr-info-list {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          margin-bottom: 2.4rem;
        }

        .lr-info-item {
          display: flex;
          gap: 1.2rem;
        }

        .lr-info-dot {
          color: #10b981;
          font-size: 2rem;
          line-height: 1;
          margin-top: -0.2rem;
        }

        .lr-info-text {
          margin: 0;
          font-size: 1.4rem;
          color: #475569;
          line-height: 1.6;
        }

        .lr-note-box {
          background: #f0f9ff;
          border: 0.1rem solid #bae6fd;
          padding: 1.6rem;
          border-radius: 1.2rem;
        }

        .lr-note-box p {
          margin: 0;
          font-size: 1.3rem;
          color: #0369a1;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .lr-grid {
            grid-template-columns: 1fr;
          }
          .lr-info-col {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}

export default LogRepairs;
