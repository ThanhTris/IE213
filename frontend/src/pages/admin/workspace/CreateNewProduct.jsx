import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { productService } from "../../../services/productService";

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
);

function CreateNewProduct() {
  const fileInputRef = useRef(null);

  const initialForm = {
    productCode: "",
    productName: "",
    brand: "",
    color: "",
    config: "",
    warrantyPeriod: "12",
    price: "",
    description: "",
    imageFile: null,
  };

  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setForm((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => handleImageSelect(e.target.files[0]);

  const removeImage = (e) => {
    e.stopPropagation();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setForm((prev) => ({ ...prev, imageFile: null }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.productCode.trim()) errs.productCode = "Mã sản phẩm là bắt buộc";
    if (!form.productName.trim()) errs.productName = "Tên sản phẩm là bắt buộc";
    if (!form.brand.trim()) errs.brand = "Thương hiệu là bắt buộc";
    if (!form.price.trim()) errs.price = "Giá là bắt buộc";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("productCode", form.productCode);
      formData.append("productName", form.productName);
      formData.append("brand", form.brand);
      formData.append("color", form.color);
      formData.append("config", form.config);
      formData.append("warrantyMonths", form.warrantyPeriod);
      formData.append("price", form.price);
      formData.append("description", form.description);

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const res = await productService.createProduct(formData);

      if (res.success) {
        toast.success("Sản phẩm đã được tạo thành công!");
        setSubmitted(true);
        setForm(initialForm);
        setImagePreview("");
        setTimeout(() => setSubmitted(false), 3500);
      } else {
        toast.error(res.message || "Không thể tạo sản phẩm.");
      }
    } catch (err) {
      console.error("Create product error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tạo sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-grid">

        {/* Left: Form Column */}
        <div className="cp-form-col">
          <div className="cp-card cp-main-card">
            <div className="cp-card-header">
              <div className="cp-header-icon blue"><BoxIcon /></div>
              <h2 className="cp-card-title">Thông tin sản phẩm</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cp-row-split">
                <div className="cp-field">
                  <label className="cp-label">Mã sản phẩm <span className="cp-required">*</span></label>
                  <input
                    type="text" className={`cp-input ${errors.productCode ? "cp-input--error" : ""}`}
                    value={form.productCode} onChange={updateField("productCode")}
                    placeholder="VD: GLX-W-ULTRA"
                  />
                  {errors.productCode && <div className="cp-error-msg">{errors.productCode}</div>}
                </div>
                <div className="cp-field">
                  <label className="cp-label">Tên sản phẩm <span className="cp-required">*</span></label>
                  <input
                    type="text" className={`cp-input ${errors.productName ? "cp-input--error" : ""}`}
                    value={form.productName} onChange={updateField("productName")}
                    placeholder="VD: Samsung Galaxy Watch Ultra"
                  />
                  {errors.productName && <div className="cp-error-msg">{errors.productName}</div>}
                </div>
              </div>

              <div className="cp-row-split">
                <div className="cp-field">
                  <label className="cp-label">Thương hiệu <span className="cp-required">*</span></label>
                  <input
                    type="text" className={`cp-input ${errors.brand ? "cp-input--error" : ""}`}
                    value={form.brand} onChange={updateField("brand")}
                    placeholder="VD: Samsung"
                  />
                  {errors.brand && <div className="cp-error-msg">{errors.brand}</div>}
                </div>
                <div className="cp-field">
                  <label className="cp-label">Màu sắc</label>
                  <input
                    type="text" className="cp-input"
                    value={form.color} onChange={updateField("color")}
                    placeholder="VD: Titanium"
                  />
                </div>
              </div>

              <div className="cp-row-split">
                <div className="cp-field">
                  <label className="cp-label">Cấu hình</label>
                  <input
                    type="text" className="cp-input"
                    value={form.config} onChange={updateField("config")}
                    placeholder="VD: 47mm, Titanium, 10ATM"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label">Thời hạn bảo hành</label>
                  <div className="cp-select-wrap">
                    <select
                      className="cp-select"
                      value={form.warrantyPeriod} onChange={updateField("warrantyPeriod")}
                    >
                      <option value="6">6 Tháng</option>
                      <option value="12">12 Tháng</option>
                      <option value="18">18 Tháng</option>
                      <option value="24">24 Tháng</option>
                      <option value="36">36 Tháng</option>
                    </select>
                    <span className="cp-select-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <div className="cp-row-split">
                <div className="cp-field">
                  <label className="cp-label">Giá bán (VND) <span className="cp-required">*</span></label>
                  <div className="cp-input-icon-wrap">
                    <span className="cp-input-icon">₫</span>
                    <input
                      type="number" className={`cp-input ${errors.price ? "cp-input--error" : ""}`}
                      value={form.price} onChange={updateField("price")}
                      placeholder="0"
                    />
                  </div>
                  {errors.price && <div className="cp-error-msg">{errors.price}</div>}
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label">Hình ảnh sản phẩm</label>
                <div className="cp-upload-container">
                  <div className="cp-upload-box" onClick={() => fileInputRef.current?.click()}>
                    {imagePreview ? (
                      <div className="cp-image-preview-wrapper">
                        <img src={imagePreview} alt="Preview" className="cp-image-full" />
                        <button type="button" className="cp-remove-img-btn" onClick={removeImage}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="cp-upload-placeholder">
                        <CameraIcon />
                        <span>Nhấn để tải lên hình ảnh sản phẩm</span>
                        <p>PNG, JPG hoặc WebP (Tối đa 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="cp-file-input-hidden" onChange={handleImageChange} />
              </div>

              <div className="cp-field">
                <label className="cp-label">Mô tả sản phẩm</label>
                <textarea
                  className="cp-textarea"
                  value={form.description} onChange={updateField("description")}
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  rows={4}
                />
              </div>

              <button type="submit" disabled={isLoading} className="cp-submit-btn">
                {isLoading ? (
                  <>
                    <span className="cp-spinner"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <BoxIcon />
                    Tạo sản phẩm
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Preview Column */}
        <div className="cp-preview-col">
          <div className="cp-card cp-preview-card">
            <div className="cp-card-header">
              <div className="cp-header-icon green"><TagIcon /></div>
              <h2 className="cp-card-title">Xem trước trực tiếp</h2>
            </div>

            <div className="cp-preview-content">
              <div className="cp-preview-image-box">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product Preview" />
                ) : (
                  <div className="cp-preview-image-placeholder">
                    <BoxIcon />
                    <span>Chưa có hình ảnh</span>
                  </div>
                )}
              </div>

              <div className="cp-preview-main-info">
                <h3 className="cp-preview-name">{form.productName || "Tên sản phẩm"}</h3>
                <div className="cp-preview-code-badge">{form.productCode || "MÃ-000"}</div>
              </div>

              <div className="cp-preview-details">
                <div className="cp-preview-detail-row">
                  <span className="cp-preview-detail-label">Thương hiệu:</span>
                  <span className="cp-preview-detail-value">{form.brand || "—"}</span>
                </div>
                <div className="cp-preview-detail-row">
                  <span className="cp-preview-detail-label">Màu sắc:</span>
                  <span className="cp-preview-detail-value">{form.color || "—"}</span>
                </div>
                <div className="cp-preview-detail-row">
                  <span className="cp-preview-detail-label">Bảo hành:</span>
                  <span className="cp-preview-detail-value">{form.warrantyPeriod} Tháng</span>
                </div>
                <div className="cp-preview-detail-row price">
                  <span className="cp-preview-detail-label">Giá bán:</span>
                  <span className="cp-preview-detail-value">
                    {form.price ? `${Number(form.price).toLocaleString()} ₫` : "0 ₫"}
                  </span>
                </div>
              </div>

              <div className="cp-preview-footer">
                <div className="cp-preview-notice">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Hệ thống sẽ tự động tạo ID sản phẩm
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .cp-container {
          padding: 1rem 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .cp-grid {
          display: grid;
          grid-template-columns: 1fr 34rem;
          gap: 2.4rem;
          align-items: start;
        }

        .cp-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 0.1rem solid var(--grey-200);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .cp-main-card {
          padding: 3.2rem;
        }

        .cp-card-header {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          margin-bottom: 2.8rem;
        }

        .cp-header-icon {
          width: 3.8rem;
          height: 3.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1rem;
          margin-top: -0.2rem;
        }

        .cp-header-icon.blue { background: var(--grey-100); color: var(--navy-primary); }
        .cp-header-icon.green { background: var(--color-success-light); color: var(--color-success); }

        .cp-card-title {
          margin: 0;
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--navy-primary-dark);
          letter-spacing: -0.02em;
        }

        .cp-row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .cp-field {
          margin-bottom: 2rem;
        }

        .cp-label {
          display: block;
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--grey-600);
          margin-bottom: 0.8rem;
        }

        .cp-required { color: var(--color-danger); }

        .cp-input {
          width: 100%;
          padding: 1.2rem 1.4rem;
          background: var(--white);
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
          font-size: 1.4rem;
          outline: none;
          transition: all 0.2s;
        }

        .cp-input:focus {
          border-color: var(--navy-primary);
          box-shadow: 0 0 0 0.3rem rgba(41, 85, 206, 0.1);
        }

        .cp-input--error {
          border-color: var(--color-danger);
          background: var(--color-danger-light);
        }

        .cp-input-icon-wrap {
          position: relative;
        }

        .cp-input-icon {
          position: absolute;
          left: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.4rem;
          color: var(--grey-400);
          font-weight: 700;
        }

        .cp-input-icon-wrap .cp-input {
          padding-left: 3.2rem;
        }

        .cp-select-wrap {
          position: relative;
        }

        .cp-select {
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

        .cp-select-arrow {
          position: absolute;
          right: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--grey-400);
        }

        .cp-upload-container {
          display: flex;
          padding: 1rem 0;
        }

        .cp-upload-box {
          width: 32rem;
          height: 20rem;
          border: 0.2rem dashed var(--grey-400);
          border-radius: var(--radius-md);
          background: var(--grey-50);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s;
          position: relative;
        }

        .cp-upload-box:hover {
          border-color: var(--navy-primary);
          background: var(--grey-100);
        }

        .cp-upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          color: var(--grey-400);
        }

        .cp-upload-placeholder span {
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--grey-600);
        }

        .cp-upload-placeholder p {
          margin: 0;
          font-size: 1.1rem;
        }

        .cp-image-preview-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .cp-image-full {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cp-remove-img-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 3rem;
          height: 3rem;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-danger);
          cursor: pointer;
          box-shadow: 0 0.2rem 1rem rgba(0,0,0,0.15);
          transition: all 0.2s;
          z-index: 5;
        }

        .cp-remove-img-btn:hover {
          transform: scale(1.1);
          background: var(--white);
        }

        .cp-file-input-hidden { display: none; }

        .cp-textarea {
          width: 100%;
          padding: 1.2rem 1.4rem;
          border: 0.1rem solid var(--grey-400);
          border-radius: var(--radius-sm);
          font-size: 1.4rem;
          outline: none;
          font-family: inherit;
          resize: vertical;
        }

        .cp-submit-btn {
          width: 100%;
          padding: 1.4rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-primary-dark));
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
          box-shadow: 0 1rem 2rem rgba(37,99,235,0.2);
          transition: all 0.2s;
        }

        .cp-submit-btn:hover:not(:disabled) {
          transform: translateY(-0.2rem);
          box-shadow: 0 1.2rem 2.4rem rgba(37,99,235,0.3);
        }

        .cp-spinner {
          width: 1.8rem;
          height: 1.8rem;
          border: 0.3rem solid rgba(255,255,255,0.3);
          border-top-color: var(--white);
          border-radius: 50%;
          animation: cp-spin 0.8s linear infinite;
        }

        @keyframes cp-spin { to { transform: rotate(360deg); } }

        /* Preview Card Styles */
        .cp-preview-card {
          padding: 2.8rem;
        }

        .cp-preview-image-box {
          width: 100%;
          height: 18rem; /* Fixed height like warranty page */
          background: var(--grey-50);
          border-radius: var(--radius-md);
          border: 0.1rem solid var(--grey-100);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .cp-preview-image-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain; /* Professional product centering */
        }

        .cp-preview-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--grey-400);
        }

        .cp-preview-image-placeholder span {
          font-size: 1.3rem;
          font-weight: 500;
        }

        .cp-preview-main-info {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.2rem;
        }

        .cp-preview-name {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--navy-900);
          line-height: 1.2;
        }

        .cp-preview-code-badge {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--navy-primary);
          background: var(--grey-100);
          padding: 0.3rem 1rem;
          border-radius: 99rem;
          white-space: nowrap;
        }

        .cp-preview-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.6rem;
          background: var(--grey-50);
          border-radius: var(--radius-md);
          margin-bottom: 2.4rem;
        }

        .cp-preview-detail-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-base);
        }

        .cp-preview-detail-label { color: var(--grey-600); }
        .cp-preview-detail-value { color: var(--navy-900); font-weight: 600; }

        .cp-preview-detail-row.price {
          margin-top: 0.4rem;
          padding-top: 0.8rem;
          border-top: 0.1rem dashed var(--grey-200);
        }

        .cp-preview-detail-row.price .cp-preview-detail-value {
          color: var(--color-success);
          font-size: 1.6rem;
          font-weight: 800;
        }

        .cp-preview-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          font-size: var(--text-sm);
          color: var(--grey-400);
          font-weight: 500;
        }
        
        .cp-preview-notice svg {
          margin-top: 0.3rem;
        }

        @media (max-width: 1024px) {
          .cp-grid { grid-template-columns: 1fr; }
          .cp-preview-col { order: -1; }
        }
      `}</style>
    </div>
  );
}

export default CreateNewProduct;
