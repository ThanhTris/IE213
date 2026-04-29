import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { repairService } from "../../../services/repairService";
import { warrantyService } from "../../../services/warrantyService";
import { API_ROOT } from "../../../utils/api";

const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
        serialNumber: form.serialNumber.trim().toUpperCase(),
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
            <h2 className="lr-card-title">Ghi nhận hoạt động sửa chữa</h2>
          </div>

          {submitted && (
            <div className="lr-banner lr-banner--success">
              ✓ Bản ghi sửa chữa đã được gửi thành công.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Serial Number Searchable Dropdown */}
            <div className="lr-field">
              <label className="lr-label">
                Số Serial thiết bị <span className="lr-required">*</span>
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
                    <span className="lr-placeholder">Tìm kiếm theo số Serial...</span>
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
                        placeholder="Nhập để lọc..."
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
                            {w.status && <span className="lr-item-badge">Hoạt động</span>}
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
                Nội dung sửa chữa <span className="lr-required">*</span>
              </label>
              <textarea
                className={`lr-textarea ${errors.repairContent ? "lr-textarea--error" : ""}`}
                value={form.repairContent}
                onChange={updateField("repairContent")}
                placeholder="VD: Thay màn hình do vỡ, thay pin..."
                rows={4}
              />
              {errors.repairContent && <div className="lr-error-msg">{errors.repairContent}</div>}
            </div>

            {/* Split row for Coverage and Status */}
            <div className="lr-row-split">
              <div className="lr-field">
                <label className="lr-label">Bảo hành chi trả</label>
                <div className="lr-select-wrap">
                  <select
                    className="lr-select"
                    value={form.warrantyCovered}
                    onChange={updateField("warrantyCovered")}
                  >
                    <option value="yes">Có (Trong bảo hành)</option>
                    <option value="no">Không (Ngoài bảo hành)</option>
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
                <label className="lr-label">Chi phí sửa chữa (VND)</label>
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
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <WrenchIcon />
                  Ghi nhận sửa chữa
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
              <h3 className="lr-card-title">Lợi ích của việc theo dõi</h3>
            </div>
            <div className="lr-info-list">
              {[
                "Tất cả các lần sửa chữa được ghi lại vĩnh viễn trên blockchain, tạo ra một lịch sử dịch vụ hoàn chỉnh",
                "Tăng sự tin tưởng và minh bạch cho những người mua lại thiết bị cũ",
                "Giúp xác định các mẫu lỗi và cải thiện chất lượng sản phẩm",
              ].map((text, i) => (
                <div key={i} className="lr-info-item">
                  <span className="lr-info-dot">•</span>
                  <p className="lr-info-text">{text}</p>
                </div>
              ))}
            </div>

            <div className="lr-note-box">
              <p><strong>Lưu ý:</strong> Địa chỉ ví kỹ thuật viên và ngày sửa chữa sẽ được ghi lại tự động từ phiên làm việc hiện tại.</p>
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
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 0.1rem solid var(--grey-200);
          box-shadow: var(--shadow-sm);
        }

        .lr-form-card {
          padding: 3.2rem;
        }

        .lr-card-header {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          margin-bottom: 2.8rem;
        }

        .lr-header-icon {
          width: 3.8rem;
          height: 3.8rem;
          background: var(--color-success-light);
          color: var(--color-success);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          margin-top: -0.2rem;
        }

        .lr-header-icon.blue {
          background: var(--grey-100);
          color: var(--navy-primary);
        }

        .lr-card-title {
          margin: 0;
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--navy-primary-dark);
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
          background: var(--color-success-light);
          color: var(--emerald-600);
          border: 0.1rem solid var(--emerald-500);
        }

        .lr-field {
          margin-bottom: 2.2rem;
        }

        .lr-label {
          display: block;
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--grey-600);
          margin-bottom: 0.8rem;
        }

        .lr-required {
          color: var(--color-danger);
        }

        /* Custom Select */
        .lr-custom-select-container {
          position: relative;
        }

        .lr-dropdown-trigger {
          width: 100%;
          padding: 1.2rem 1.4rem;
          background: var(--white);
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lr-dropdown-trigger:hover {
          border-color: var(--grey-600);
        }

        .lr-dropdown-trigger--error {
          border-color: var(--color-danger);
          background: var(--color-danger-light);
        }

        .lr-selected-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .lr-selected-code {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--navy-900);
        }

        .lr-selected-name {
          font-size: 1.2rem;
          background: var(--grey-100);
          padding: 0.2rem 0.8rem;
          border-radius: 99rem;
          color: var(--grey-600);
          font-weight: 600;
        }

        .lr-placeholder {
          font-size: 1.4rem;
          color: var(--grey-400);
        }

        .lr-select-arrow {
          color: var(--grey-400);
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
          background: var(--white);
          border: 0.1rem solid var(--grey-200);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
        }

        .lr-dropdown-search-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 1.4rem;
          background: var(--grey-50);
          border-bottom: 0.1rem solid var(--grey-100);
          color: var(--grey-400);
        }

        .lr-dropdown-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1.4rem;
          outline: none;
          color: var(--navy-900);
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
          background: var(--grey-100);
        }

        .lr-item-main {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .lr-item-serial {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--navy-900);
        }

        .lr-item-model {
          font-size: 1.15rem;
          color: var(--grey-600);
        }

        .lr-item-badge {
          font-size: 1.1rem;
          background: var(--color-success-light);
          color: var(--color-success);
          padding: 0.2rem 0.8rem;
          border-radius: 99rem;
          font-weight: 700;
        }

        /* Textarea */
        .lr-textarea {
          width: 100%;
          padding: 1.2rem 1.4rem;
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
          font-size: 1.4rem;
          outline: none;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .lr-textarea:focus {
          border-color: var(--navy-primary);
          box-shadow: 0 0 0 0.3rem rgba(41, 85, 206, 0.1);
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
          background: var(--white);
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
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
          color: var(--grey-400);
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
          color: var(--grey-400);
          font-weight: 700;
        }

        .lr-input {
          width: 100%;
          padding: 1.2rem 1.4rem 1.2rem 3rem;
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
          font-size: 1.4rem;
          outline: none;
        }

        .lr-submit-btn {
          width: 100%;
          padding: 1.4rem;
          background: linear-gradient(135deg, var(--color-success), var(--emerald-600));
          color: var(--white);
          border: none;
          border-radius: var(--radius-sm);
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
          align-items: flex-start;
          gap: 1.2rem;
        }

        .lr-info-dot {
          color: var(--color-success);
          font-size: 2rem;
          line-height: 1;
          margin-top: -0.2rem;
        }

        .lr-info-text {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--grey-600);
          line-height: 1.6;
        }

        .lr-note-box {
          background: var(--grey-100);
          border: 0.1rem solid var(--grey-200);
          padding: 1.6rem;
          border-radius: var(--radius-sm);
        }

        .lr-note-box p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--navy-primary-dark);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default LogRepairs;
