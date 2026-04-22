import { useMemo, useState, useCallback, useEffect } from "react";
import { API_ROOT } from "../../utils/api";
import { buildFakeHash } from "../../utils/hashPreview";
import { toast } from "sonner";
import { warrantyService } from "../../services/warrantyService";

function CreateWarranty() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const initialForm = {
    deviceModel: "",
    serialNumber: "",
    walletAddress: "",
    warrantyMonths: "12",
  };

  const [form, setForm] = useState(initialForm);
  const [deviceModels, setDeviceModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("bw_auth_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_ROOT}/products`, { headers });
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok || data.success === false) {
           throw new Error(data.error?.message || data.message || "Lỗi tải danh sách sản phẩm");
        }
        
        if (data.success && Array.isArray(data.data)) {
          setDeviceModels(data.data);
          if (data.data.length > 0) {
            setForm((prev) => ({ ...prev, deviceModel: data.data[0].productCode }));
          }
        }
      } catch (err) {
        toast.error(err.message);
        setErrors((prev) => ({ ...prev, fetchError: err.message }));
      } finally {
        setIsFetchingModels(false);
      }
    };
    fetchProducts();
  }, []);

  const selectedProduct = useMemo(() => {
    return deviceModels.find((p) => p.productCode === form.deviceModel);
  }, [deviceModels, form.deviceModel]);

  const previewHash = useMemo(() => buildFakeHash(form), [form]);

  const previewTokenId = useMemo(() => {
    if (!previewHash) return "Auto-generated";
    return `0x${previewHash.slice(0, 5)}...${previewHash.slice(-4)}`;
  }, [previewHash]);

  const maskedSerial = useMemo(() => {
    if (!form.serialNumber) return "••••••••••••";
    return form.serialNumber.slice(0, 3) + "•".repeat(Math.max(0, form.serialNumber.length - 3));
  }, [form.serialNumber]);

  const calculatedExpiryDate = useMemo(() => {
    if (!form.warrantyMonths) return "";
    const date = new Date();
    date.setMonth(date.getMonth() + parseInt(form.warrantyMonths, 10));
    return date.toISOString().slice(0, 10);
  }, [form.warrantyMonths]);

  const validateEthereumAddress = (address) =>
    /^0x[a-fA-F0-9]{40}$/.test(address);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.deviceModel) newErrors.deviceModel = "Please select a device model";
    if (!form.serialNumber.trim()) newErrors.serialNumber = "Serial number is required";
    if (!form.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    } else if (!validateEthereumAddress(form.walletAddress)) {
      newErrors.walletAddress = "Invalid Ethereum address (0x + 40 hex characters)";
    }
    if (!form.warrantyMonths) newErrors.warrantyMonths = "Please select warranty months";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      await warrantyService.processWarrantyMinting(form, imageFile, calculatedExpiryDate, (stepMsg) => {
        setCurrentStep(stepMsg);
      });

      toast.success("Warranty NFT issued successfully on blockchain!");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);

    } catch (err) {
      const msg = err.message || "Gặp lỗi khi tạo thẻ bảo hành NFT. Vui lòng thử lại.";
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setCurrentStep("");
    }
  };

  return (
    <div className="cw-wrapper">
      <div className="cw-layout">

        {/* ─── LEFT: Form ─── */}
        <div className="cw-form-card">
          {/* Card Header */}
          <div className="cw-card-header">
            <span className="cw-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <h2 className="cw-card-title">Issue New Warranty NFT</h2>
          </div>

          {/* Success / Error banners */}
          {submitted && (
            <div className="cw-banner cw-banner--success">
              ✓ Warranty NFT issued successfully on blockchain!
            </div>
          )}
          {errors.fetchError && (
            <div className="cw-banner cw-banner--error">Lỗi tải dữ liệu: {errors.fetchError}</div>
          )}
          {errors.submit && (
            <div className="cw-banner cw-banner--error">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className={isLoading ? "cw-form-loading" : ""}>
            {/* Device Model */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="deviceModel">Device Model</label>
              <div className="cw-select-wrap">
                <select
                  id="deviceModel"
                  className={`cw-select ${errors.deviceModel ? "cw-input--error" : ""}`}
                  value={form.deviceModel}
                  onChange={updateField("deviceModel")}
                  disabled={isLoading || isFetchingModels}
                >
                  {isFetchingModels ? (
                    <option value="">Đang tải...</option>
                  ) : deviceModels.length === 0 ? (
                    <option value="">Không có dữ liệu</option>
                  ) : (
                    deviceModels.map((p) => (
                      <option key={p.productCode} value={p.productCode}>
                        {p.productName} ({p.productCode})
                      </option>
                    ))
                  )}
                </select>
                <span className="cw-select-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
              {errors.deviceModel && <p className="cw-error-msg">{errors.deviceModel}</p>}
            </div>

            {/* Serial Number */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="serialNumber">Serial Number</label>
              <div className="cw-input-wrap">
                <span className="cw-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="3" height="16" rx="1" />
                    <rect x="7" y="4" width="1.5" height="16" rx="0.5" />
                    <rect x="10.5" y="4" width="3" height="16" rx="1" />
                    <rect x="15.5" y="4" width="1.5" height="16" rx="0.5" />
                    <rect x="19" y="4" width="3" height="16" rx="1" />
                  </svg>
                </span>
                <input
                  id="serialNumber"
                  type="text"
                  className={`cw-input ${errors.serialNumber ? "cw-input--error" : ""}`}
                  placeholder="Enter device serial number"
                  value={form.serialNumber}
                  onChange={updateField("serialNumber")}
                  disabled={isLoading}
                />
              </div>
              {errors.serialNumber && <p className="cw-error-msg">{errors.serialNumber}</p>}
            </div>

            {/* Customer Wallet Address */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="walletAddress">Customer Wallet Address</label>
              <div className="cw-input-wrap">
                <span className="cw-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="walletAddress"
                  type="text"
                  className={`cw-input ${errors.walletAddress ? "cw-input--error" : ""}`}
                  placeholder="0x..."
                  value={form.walletAddress}
                  onChange={updateField("walletAddress")}
                  disabled={isLoading}
                />
              </div>
              {errors.walletAddress && <p className="cw-error-msg">{errors.walletAddress}</p>}
            </div>

            {/* Warranty Months */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="warrantyMonths">Thời hạn bảo hành (Tháng)</label>
              <div className="cw-select-wrap">
                <select
                  id="warrantyMonths"
                  className={`cw-select ${errors.warrantyMonths ? "cw-input--error" : ""}`}
                  value={form.warrantyMonths}
                  onChange={updateField("warrantyMonths")}
                  disabled={isLoading}
                >
                  <option value="6">6 Tháng</option>
                  <option value="12">12 Tháng</option>
                  <option value="24">24 Tháng</option>
                  <option value="36">36 Tháng</option>
                </select>
                <span className="cw-select-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
              {errors.warrantyMonths && <p className="cw-error-msg">{errors.warrantyMonths}</p>}
            </div>

            {/* Device Image */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="deviceImage">Product Image (Optional)</label>
              <div className="cw-input-wrap">
                <input
                  id="deviceImage"
                  type="file"
                  accept="image/*"
                  className="cw-input"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  disabled={isLoading}
                  style={{ padding: '8px 14px' }}
                />
              </div>
            </div>

            {/* Smart contract notice */}
            <div className="cw-notice">
              <span className="cw-notice-icon">#</span>
              <span>Smart contract will automatically verify and issue NFT</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={`cw-btn-submit ${submitted ? "cw-btn-submit--success" : ""}`}
              disabled={isLoading || submitted}
            >
              {isLoading ? (
                <>
                  <span className="cw-spinner" />
                  {currentStep || "Đang xử lý..."}
                </>
              ) : submitted ? (
                <>✓ Issued Successfully!</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Issue Warranty on Blockchain
                </>
              )}
            </button>
          </form>
        </div>

        {/* ─── RIGHT: Preview ─── */}
        <div className="cw-preview-col">

          {/* Preview Card */}
          <div className="cw-preview-card">
            {/* Preview header label */}
            <div className="cw-preview-header-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Warranty NFT Preview</span>
            </div>

            {/* Device name row */}
            <div className="cw-nft-name-row">
              <div>
                <h3 className="cw-nft-device-name">
                  {selectedProduct ? selectedProduct.productName : (form.deviceModel || "Select Device Model")}
                </h3>
                <p className="cw-nft-serial">Serial: {maskedSerial}</p>
              </div>
              <span className="cw-nft-badge">NFT</span>
            </div>

            {/* Details grid */}
            <div className="cw-nft-details">
              <div className="cw-nft-row">
                <span className="cw-nft-row-label">Token ID</span>
                <span className="cw-nft-row-value cw-nft-row-value--blue">
                  {previewTokenId}
                </span>
              </div>
              <div className="cw-nft-row">
                <span className="cw-nft-row-label">Owner</span>
                <span className="cw-nft-row-value cw-nft-row-value--muted">
                  {form.walletAddress ? `${form.walletAddress.slice(0, 8)}...` : "Not set"}
                </span>
              </div>
              <div className="cw-nft-row">
                <span className="cw-nft-row-label">Issued</span>
                <span className="cw-nft-row-value">{today}</span>
              </div>
              <div className="cw-nft-row">
                <span className="cw-nft-row-label">Expires</span>
                <span className={`cw-nft-row-value ${calculatedExpiryDate ? "" : "cw-nft-row-value--orange"}`}>
                  {calculatedExpiryDate || "Not set"}
                </span>
              </div>
            </div>

            {/* Blockchain hash */}
            <div className="cw-hash-bar">
              <div>
                <p className="cw-hash-label">Blockchain Hash</p>
                <code className="cw-hash-code">
                  {previewHash
                    ? `0x${previewHash.slice(0, 6)}...${previewHash.slice(-6)}`
                    : "0x000...000"}
                </code>
              </div>
              <span className="cw-hash-icon">#</span>
            </div>
          </div>

          {/* Warranty Details card */}
          <div className="cw-details-card">
            <h4 className="cw-details-title">Warranty Details</h4>
            <ul className="cw-details-list">
              <li>NFT minted on Ethereum blockchain</li>
              <li>Transferable to new owners</li>
              <li>Immutable proof of authenticity</li>
              <li>Globally verifiable warranty status</li>
            </ul>
          </div>

          {/* Gas fee note */}
          <div className="cw-gas-note">
            Gas fees will be calculated at time of minting. Ensure wallet has sufficient funds.
          </div>
        </div>

      </div>

      {/* Inline styles scoped to this component */}
      <style>{`
        .cw-wrapper {
          width: 100%;
        }

        .cw-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        /* ─── Form card ─── */
        .cw-form-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(15,23,42,0.07);
        }

        .cw-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .cw-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #eff6ff;
          border-radius: 10px;
          color: #2563eb;
          flex-shrink: 0;
        }

        .cw-card-title {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
        }

        /* Banner */
        .cw-banner {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .cw-banner--success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }
        .cw-banner--error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        /* Fields */
        .cw-field {
          margin-bottom: 20px;
        }

        .cw-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .cw-input-wrap,
        .cw-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .cw-input-icon {
          position: absolute;
          left: 13px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .cw-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          font-size: 14px;
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #fff;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .cw-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }

        .cw-input--error {
          border-color: #ef4444;
        }

        .cw-input--error:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
        }

        /* Select */
        .cw-select {
          width: 100%;
          padding: 11px 40px 11px 14px;
          font-size: 14px;
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #fff;
          color: #0f172a;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .cw-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }

        .cw-select-arrow {
          position: absolute;
          right: 13px;
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .cw-error-msg {
          margin: 5px 0 0;
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
        }

        /* Notice */
        .cw-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 13px 16px;
          color: #16a34a;
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .cw-notice-icon {
          font-size: 16px;
          font-weight: 800;
          color: #16a34a;
          flex-shrink: 0;
        }

        /* Submit button */
        .cw-btn-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          color: #fff;
          background: linear-gradient(135deg, #2d4fc4 0%, #1e3a8a 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(30,64,175,0.25);
        }

        .cw-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          box-shadow: 0 8px 24px rgba(30,64,175,0.35);
          transform: translateY(-1px);
        }

        .cw-btn-submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
        }

        .cw-btn-submit--success {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          box-shadow: 0 4px 16px rgba(22,163,74,0.3);
        }

        .cw-form-loading {
          opacity: 0.75;
          pointer-events: none;
        }

        /* Spinner */
        .cw-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cw-spin 0.7s linear infinite;
        }

        @keyframes cw-spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Preview column ─── */
        .cw-preview-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Preview card */
        .cw-preview-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 24px rgba(15,23,42,0.07);
        }

        .cw-preview-header-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cw-nft-name-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .cw-nft-device-name {
          margin: 0 0 4px;
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .cw-nft-serial {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        .cw-nft-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 13px;
          background: #10b981;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          border-radius: 999px;
          flex-shrink: 0;
          letter-spacing: 0.05em;
        }

        /* NFT detail rows */
        .cw-nft-details {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-top: 1px solid #f1f5f9;
          margin-bottom: 20px;
        }

        .cw-nft-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .cw-nft-row-label {
          font-size: 13.5px;
          color: #475569;
          font-weight: 500;
        }

        .cw-nft-row-value {
          font-size: 13.5px;
          color: #0f172a;
          font-weight: 600;
          text-align: right;
        }

        .cw-nft-row-value--blue { color: #2563eb; }
        .cw-nft-row-value--muted { color: #94a3b8; }
        .cw-nft-row-value--orange { color: #f59e0b; }

        /* Hash bar */
        .cw-hash-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #1e3a8a;
          border-radius: 12px;
          padding: 16px 18px;
          color: #fff;
        }

        .cw-hash-label {
          margin: 0 0 4px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
        }

        .cw-hash-code {
          font-family: "JetBrains Mono", "Monaco", monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
          word-break: break-all;
        }

        .cw-hash-icon {
          font-size: 28px;
          font-weight: 900;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
          line-height: 1;
        }

        /* Details card */
        .cw-details-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: 0 2px 10px rgba(15,23,42,0.05);
        }

        .cw-details-title {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
        }

        .cw-details-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cw-details-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13.5px;
          color: #475569;
          line-height: 1.45;
        }

        .cw-details-list li::before {
          content: "•";
          color: #475569;
          font-size: 16px;
          line-height: 1.2;
          flex-shrink: 0;
        }

        /* Gas note */
        .cw-gas-note {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 12.5px;
          color: #92400e;
          line-height: 1.55;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .cw-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default CreateWarranty;
