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
  
  // Custom Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Customer Wallet States
  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Image Preview State
  const [imagePreview, setImagePreview] = useState(null);

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

    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const token = localStorage.getItem("bw_auth_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_ROOT}/users`, { headers });
        const data = await res.json().catch(() => ({}));
        
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsFetchingUsers(false);
      }
    };

    fetchProducts();
    fetchUsers();
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
            <h2 className="cw-card-title">Cấp thẻ bảo hành NFT mới</h2>
          </div>

          {/* Success / Error banners */}
          {submitted && (
            <div className="cw-banner cw-banner--success">
              ✓ Thẻ bảo hành NFT đã được cấp thành công trên blockchain!
            </div>
          )}
          {errors.fetchError && (
            <div className="cw-banner cw-banner--error">Lỗi tải dữ liệu: {errors.fetchError}</div>
          )}
          {errors.submit && (
            <div className="cw-banner cw-banner--error">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className={isLoading ? "cw-form-loading" : ""}>
            {/* Device Model - Optimized Searchable Dropdown */}
            <div className="cw-field">
              <label className="cw-label">Mẫu thiết bị</label>
              <div className="cw-custom-select-container">
                <button
                  type="button"
                  className={`cw-dropdown-trigger ${errors.deviceModel ? "cw-input--error" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading || isFetchingModels}
                >
                  <div className="cw-trigger-content">
                    {isFetchingModels ? (
                      <span className="cw-muted-text">Đang tải...</span>
                    ) : selectedProduct ? (
                      <div className="cw-selected-info">
                        <span className="cw-selected-name">{selectedProduct.productName}</span>
                        <span className="cw-selected-code">{selectedProduct.productCode}</span>
                      </div>
                    ) : (
                      <span className="cw-muted-text">Chọn mẫu thiết bị</span>
                    )}
                  </div>
                  <span className={`cw-select-arrow ${isDropdownOpen ? "open" : ""}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="cw-dropdown-panel">
                    <div className="cw-dropdown-search-wrap">
                      <svg className="cw-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text"
                        className="cw-dropdown-search-input"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="cw-dropdown-list">
                      {deviceModels
                        .filter(p => 
                          p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.productCode.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map((p) => (
                          <div
                            key={p.productCode}
                            className={`cw-dropdown-item ${form.deviceModel === p.productCode ? "active" : ""}`}
                            onClick={() => {
                              setForm(prev => ({ ...prev, deviceModel: p.productCode }));
                              setIsDropdownOpen(false);
                              setProductSearch("");
                              if (errors.deviceModel) setErrors(prev => ({ ...prev, deviceModel: "" }));
                            }}
                          >
                            <div className="cw-item-main">
                              <span className="cw-item-name">{p.productName}</span>
                              <span className="cw-item-code">{p.productCode}</span>
                            </div>
                            {form.deviceModel === p.productCode && (
                              <svg className="cw-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {isDropdownOpen && <div className="cw-dropdown-overlay" onClick={() => setIsDropdownOpen(false)} />}
              </div>
              {errors.deviceModel && <p className="cw-error-msg">{errors.deviceModel}</p>}
            </div>

            {/* Serial Number */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="serialNumber">Số Serial</label>
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
                  placeholder="Nhập số serial của thiết bị"
                  value={form.serialNumber}
                  onChange={updateField("serialNumber")}
                  disabled={isLoading}
                />
              </div>
              {errors.serialNumber && <p className="cw-error-msg">{errors.serialNumber}</p>}
            </div>

            {/* Customer Wallet Address - Optimized Searchable Search */}
            <div className="cw-field">
              <label className="cw-label" htmlFor="walletAddress">Địa chỉ ví khách hàng</label>
              <div className="cw-custom-select-container">
                <div className="cw-input-combined-wrap">
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
                    className={`cw-input cw-input-searchable ${errors.walletAddress ? "cw-input--error" : ""}`}
                    placeholder="Tìm theo tên/email hoặc nhập 0x..."
                    value={form.walletAddress}
                    onChange={(e) => {
                      updateField("walletAddress")(e);
                      setIsUserDropdownOpen(true);
                      setUserSearch(e.target.value);
                    }}
                    onFocus={() => {
                      setIsUserDropdownOpen(true);
                      setUserSearch(form.walletAddress);
                    }}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {users.find(u => u.walletAddress.toLowerCase() === form.walletAddress.toLowerCase()) && (
                    <div className="cw-user-mini-badge">
                      <span className="cw-user-badge-name">{users.find(u => u.walletAddress.toLowerCase() === form.walletAddress.toLowerCase()).fullName || "User"}</span>
                    </div>
                  )}
                </div>

                {isUserDropdownOpen && (userSearch.trim().length > 0 || users.length > 0) && (
                  <div className="cw-dropdown-panel">
                    <div className="cw-dropdown-list">
                      {users
                        .filter(u => 
                          u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.walletAddress?.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((u) => (
                          <div
                            key={u.walletAddress}
                            className={`cw-dropdown-item cw-user-item ${form.walletAddress === u.walletAddress ? "active" : ""}`}
                            onClick={() => {
                              setForm(prev => ({ ...prev, walletAddress: u.walletAddress }));
                              setIsUserDropdownOpen(false);
                              setUserSearch("");
                            }}
                          >
                            <div className="cw-user-item-content">
                              <div className="cw-user-primary">
                                <span className="cw-user-name">{u.fullName || "Ẩn danh"}</span>
                                <span className="cw-user-email">{u.email || "Không có email"}</span>
                              </div>
                              <code className="cw-user-wallet">{u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}</code>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {isUserDropdownOpen && <div className="cw-dropdown-overlay" onClick={() => setIsUserDropdownOpen(false)} />}
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

            {/* Device Image - Enhanced Upload UI */}
            <div className="cw-field">
              <label className="cw-label">Hình ảnh sản phẩm (Tùy chọn)</label>
              <div className="cw-image-upload-area">
                {imagePreview ? (
                  <div className="cw-image-preview-wrapper">
                    <img src={imagePreview} alt="Preview" className="cw-image-thumb" />
                    <button
                      type="button"
                      className="cw-remove-img-overlay"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>Đổi hình ảnh</span>
                    </button>
                  </div>
                ) : (
                  <label className="cw-upload-trigger">
                    <input
                      type="file"
                      accept="image/*"
                      className="cw-file-input-hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      disabled={isLoading}
                    />
                    <div className="cw-upload-empty">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Nhấn để tải lên hình ảnh</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Smart contract notice */}
            <div className="cw-notice">
              <span className="cw-notice-icon">#</span>
              <span>Hợp đồng thông minh sẽ tự động xác thực và cấp NFT</span>
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
                <>✓ Cấp thẻ thành công!</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Cấp thẻ bảo hành trên Blockchain
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
                stroke="var(--navy-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Xem trước thẻ bảo hành NFT</span>
            </div>

            {/* NFT Horizontal Header */}
            <div className="cw-nft-horizontal-header">
              <div className="cw-nft-thumb-box">
                {imagePreview ? (
                  <img src={imagePreview} alt="NFT" className="cw-nft-thumb-img" />
                ) : (
                  <div className="cw-nft-thumb-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Chưa có hình ảnh</span>
                  </div>
                )}
              </div>
              <div className="cw-nft-header-info">
                <div className="cw-nft-name-row">
                  <div>
                    <h3 className="cw-nft-title">{selectedProduct?.productName || "Tên sản phẩm"}</h3>
                    <p className="cw-nft-serial">Số Serial: {maskedSerial}</p>
                  </div>
                  <span className="cw-nft-badge">NFT</span>
                </div>
              </div>
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
                <span className="cw-nft-row-label">Chủ sở hữu</span>
                <span className="cw-nft-row-value cw-nft-row-value--muted">
                  {form.walletAddress ? `${form.walletAddress.slice(0, 8)}...` : "Chưa thiết lập"}
                </span>
              </div>
              <div className="cw-nft-row">
                <span className="cw-nft-row-label">Ngày cấp</span>
                <span className="cw-nft-row-value">{today}</span>
              </div>
              <div className="cw-nft-row">
                <span className="cw-nft-row-label">Ngày hết hạn</span>
                <span className={`cw-nft-row-value ${calculatedExpiryDate ? "" : "cw-nft-row-value--orange"}`}>
                  {calculatedExpiryDate || "Chưa thiết lập"}
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
            <h4 className="cw-details-title">Chi tiết bảo hành</h4>
            <ul className="cw-details-list">
              <li>Thẻ NFT được đúc trên blockchain Ethereum</li>
              <li>Có thể chuyển nhượng cho chủ sở hữu mới</li>
              <li>Bằng chứng bất biến về tính xác thực</li>
              <li>Trạng thái bảo hành có thể xác minh toàn cầu</li>
            </ul>
          </div>

          {/* Gas fee note */}
          <div className="cw-gas-note">
            Phí gas sẽ được tính tại thời điểm đúc thẻ. Hãy đảm bảo ví có đủ số dư.
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
          background: var(--white);
          border: 1px solid var(--grey-200);
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: var(--shadow-sm);
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
          background: var(--grey-100);
          border-radius: var(--radius-sm);
          color: var(--navy-primary);
          flex-shrink: 0;
        }

        .cw-card-title {
          margin: 0;
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--navy-primary-dark);
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
          background: var(--color-success-light);
          color: var(--emerald-600);
          border: 1px solid var(--emerald-500);
        }
        .cw-banner--error {
          background: var(--color-danger-light);
          color: var(--danger-600);
          border: 1px solid #fecaca;
        }

        /* Fields */
        .cw-field {
          margin-bottom: 20px;
        }

        .cw-label {
          display: block;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--grey-600);
          margin-bottom: 8px;
        }

        .cw-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .cw-input-icon {
          position: absolute;
          left: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--grey-400);
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 2;
        }

        .cw-input {
          width: 100%;
          padding: 1.1rem 1.4rem 1.1rem 4rem; /* Left padding for icon */
          font-size: 1.4rem;
          font-family: inherit;
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
          background: var(--white);
          color: var(--navy-900);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .cw-input:focus {
          border-color: var(--navy-primary);
          box-shadow: 0 0 0 3px rgba(41, 85, 206, 0.15);
        }

        .cw-input--error {
          border-color: var(--color-danger);
        }

        .cw-input-searchable {
          padding-left: 4rem;
          padding-right: 12rem; /* Extra space for user badge on the right */
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
          border: 1px solid var(--grey-400);
          border-radius: var(--radius-sm);
          background: var(--white);
          color: var(--navy-900);
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .cw-select:focus {
          border-color: var(--navy-primary);
          box-shadow: 0 0 0 3px rgba(41, 85, 206, 0.15);
        }

        .cw-select-arrow {
          position: absolute;
          right: 13px;
          color: var(--grey-400);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .cw-error-msg {
          margin: 5px 0 0;
          font-size: 12px;
          color: var(--color-danger);
          font-weight: 500;
        }

        /* Notice */
        .cw-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: var(--color-success-light);
          border: 1px solid var(--emerald-500);
          border-radius: var(--radius-sm);
          padding: 13px 16px;
          color: var(--emerald-600);
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: 24px;
        }

        .cw-notice-icon {
          font-size: 16px;
          font-weight: 800;
          color: var(--emerald-600);
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
          color: var(--white);
          background: linear-gradient(135deg, var(--navy-primary) 0%, var(--navy-primary-dark) 100%);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(30,64,175,0.25);
        }

        .cw-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--navy-primary) 0%, var(--navy-primary-dark) 100%);
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
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--navy-primary-dark);
          margin-bottom: 20px;
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
          font-size: var(--text-base);
          color: #475569;
          font-weight: 500;
        }

        .cw-nft-row-value {
          font-size: var(--text-base);
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
          font-size: var(--text-base);
          font-weight: 600;
          color: rgba(255,255,255,0.75);
        }

        .cw-hash-code {
          font-family: "JetBrains Mono", "Monaco", monospace;
          font-size: var(--text-base);
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

        .cw-select-arrow.open {
          transform: rotate(180deg);
        }

        /* Searchable Dropdowns */
        .cw-custom-select-container {
          position: relative;
          width: 100%;
        }

        .cw-dropdown-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 1.4rem;
          background: #fff;
          border: 0.1rem solid #d1d5db;
          border-radius: 1rem;
          cursor: pointer;
          text-align: left;
        }

        .cw-selected-info {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .cw-selected-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
        }

        .cw-selected-code {
          font-size: 1.1rem;
          color: #2563eb;
          background: #eff6ff;
          padding: 0.2rem 1rem;
          border-radius: 99rem;
          font-weight: 700;
          border: 0.1rem solid #bfdbfe;
        }

        .cw-dropdown-panel {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: #fff;
          border: 0.1rem solid #e2e8f0;
          border-radius: 1.2rem;
          box-shadow: 0 1rem 2.5rem rgba(0,0,0,0.1);
          z-index: 100;
          overflow: hidden;
        }

        .cw-dropdown-search-wrap {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 1.4rem;
          border-bottom: 0.1rem solid #f1f5f9;
          background: #f8fafc;
        }

        .cw-dropdown-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1.3rem;
          outline: none;
        }

        .cw-dropdown-list {
          max-height: 25rem;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .cw-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.2rem;
          border-radius: 0.8rem;
          cursor: pointer;
        }

        .cw-dropdown-item:hover {
          background: #f8fafc;
        }

        .cw-item-main {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .cw-item-name {
          font-size: 1.4rem;
          font-weight: 600;
        }

        .cw-item-code {
          font-size: 1.1rem;
          background: #f1f5f9;
          padding: 0.1rem 0.8rem;
          border-radius: 99rem;
          color: #64748b;
        }

        .cw-input-combined-wrap {
          position: relative;
          width: 100%;
        }

        .cw-user-mini-badge {
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          background: #eff6ff;
          border: 0.1rem solid #bfdbfe;
          border-radius: 99rem;
          padding: 0.2rem 1rem;
          pointer-events: none;
        }

        .cw-user-badge-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e40af;
        }

        .cw-user-item-content {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
        }

        .cw-user-primary {
          display: flex;
          flex-direction: column;
        }

        .cw-user-name {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .cw-user-email {
          font-size: 1.1rem;
          color: #64748b;
        }

        .cw-user-wallet {
          font-size: 1.1rem;
          background: #f1f5f9;
          padding: 0.1rem 0.8rem;
          border-radius: 99rem;
        }

        /* Custom Image Upload */
        .cw-image-upload-area {
          width: 100%;
        }

        .cw-upload-trigger {
          display: block;
          border: 0.2rem dashed #d1d5db;
          border-radius: 1.2rem;
          width: 32rem; /* Fixed width */
          height: 20rem; /* Fixed height */
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .cw-upload-trigger:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .cw-file-input-hidden {
          display: none;
        }

        .cw-upload-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          color: #64748b;
        }

        .cw-image-preview-wrapper {
          position: relative;
          width: 32rem; /* Fixed width */
          height: 20rem; /* Fixed height */
          background: #f1f5f9;
          border-radius: 1.2rem;
          overflow: hidden;
          border: 0.1rem solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cw-image-thumb {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .cw-remove-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          opacity: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          color: white;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          z-index: 2;
        }

        .cw-image-preview-wrapper:hover .cw-remove-img-overlay {
          opacity: 1;
        }

        /* NFT Preview Redesign - Horizontal Header */
        .cw-nft-horizontal-header {
          display: flex;
          align-items: center;
          gap: 1.6rem;
          margin-bottom: 0.8rem; /* Minimal margin */
        }

        .cw-nft-thumb-box {
          flex: 0 0 11.5rem;
          height: 11.5rem;
          border-radius: 1.8rem;
          overflow: hidden;
          background: #f8fafc;
          border: 0.15rem dashed #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cw-nft-thumb-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 0.5rem;
        }

        .cw-nft-thumb-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          color: #94a3b8;
          text-align: center;
          padding: 1rem;
        }

        .cw-nft-thumb-placeholder span {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .cw-nft-header-info {
          flex: 1;
        }

        .cw-nft-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center; /* Centered with image */
        }

        .cw-nft-title {
          font-size: 2.4rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .cw-nft-serial {
          font-size: 1.5rem;
          color: #64748b;
          font-weight: 500;
          margin-top: 0.2rem;
        }

        .cw-nft-badge {
          background: #10b981;
          color: #fff;
          padding: 0.4rem 1.2rem;
          border-radius: 99rem;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .cw-details-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: var(--text-sm);
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
          font-size: var(--text-sm);
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
