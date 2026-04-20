import { useState, useEffect, useRef } from "react";

const WRENCH_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const inputStyle = (hasError = false) => ({
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
  borderRadius: 8,
  fontSize: 14,
  color: "#374151",
  background: "white",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

const labelStyle = {
  display: "block",
  fontWeight: 600,
  fontSize: 13,
  color: "#374151",
  marginBottom: 6,
};

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
  const [isDragging, setIsDragging] = useState(false);

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
    if (errors.imageFile) setErrors((prev) => ({ ...prev, imageFile: "" }));
  };

  const handleImageChange = (e) => handleImageSelect(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setForm((prev) => ({ ...prev, imageFile: null }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.productCode.trim()) errs.productCode = "Product Code is required";
    if (!form.productName.trim()) errs.productName = "Product Name is required";
    if (!form.brand.trim()) errs.brand = "Brand is required";
    if (!form.price.trim()) errs.price = "Price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) formData.append(k, v);
      });
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      const log = {};
      for (let [k, v] of formData.entries()) log[k] = v instanceof File ? v.name : v;
      console.log("Create Product Payload:", log);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Failed to create product." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#3b82f6";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
  };
  const handleBlur = (e, hasError) => {
    e.target.style.borderColor = hasError ? "#ef4444" : "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <form onSubmit={handleSubmit}>
        {/* Success / Error banners */}
        {submitted && (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", color: "#065f46", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
            ✓ Product created successfully!
          </div>
        )}
        {errors.submit && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", color: "#991b1b", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
            {errors.submit}
          </div>
        )}

        {/* Main Card */}
        <div style={{ background: "white", borderRadius: 16, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 24 }}>
          {/* Section Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>Product Information</span>
          </div>

          {/* Row 1: Product Code + Product Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Product Code <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text" value={form.productCode} onChange={updateField("productCode")}
                placeholder="e.g., GLX-W-ULTRA"
                style={inputStyle(!!errors.productCode)}
                onFocus={handleFocus} onBlur={(e) => handleBlur(e, !!errors.productCode)}
              />
              {errors.productCode && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 500 }}>{errors.productCode}</div>}
            </div>
            <div>
              <label style={labelStyle}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text" value={form.productName} onChange={updateField("productName")}
                placeholder="e.g., Samsung Galaxy Watch Ultra"
                style={inputStyle(!!errors.productName)}
                onFocus={handleFocus} onBlur={(e) => handleBlur(e, !!errors.productName)}
              />
              {errors.productName && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 500 }}>{errors.productName}</div>}
            </div>
          </div>

          {/* Row 2: Brand + Color */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Brand <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text" value={form.brand} onChange={updateField("brand")}
                placeholder="e.g., Samsung"
                style={inputStyle(!!errors.brand)}
                onFocus={handleFocus} onBlur={(e) => handleBlur(e, !!errors.brand)}
              />
              {errors.brand && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 500 }}>{errors.brand}</div>}
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input
                type="text" value={form.color} onChange={updateField("color")}
                placeholder="e.g., Titanium" style={inputStyle()}
                onFocus={handleFocus} onBlur={(e) => handleBlur(e, false)}
              />
            </div>
          </div>

          {/* Row 3: Config + Warranty Period */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Config</label>
              <input
                type="text" value={form.config} onChange={updateField("config")}
                placeholder="e.g., 47mm, Titan, lặn sâu" style={inputStyle()}
                onFocus={handleFocus} onBlur={(e) => handleBlur(e, false)}
              />
            </div>
            <div>
              <label style={labelStyle}>Warranty Period (Months)</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.warrantyPeriod} onChange={updateField("warrantyPeriod")}
                  style={{ ...inputStyle(), appearance: "none", paddingRight: 36, cursor: "pointer" }}
                  onFocus={handleFocus} onBlur={(e) => handleBlur(e, false)}
                >
                  {["6","12","18","24","36"].map(m => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Image Upload + Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>
                Product Image <span style={{ color: "#94a3b8", fontWeight: 400 }}>(Upload from device)</span>
              </label>

              {/* Upload Zone */}
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    border: `2px dashed ${isDragging ? "#3b82f6" : errors.imageFile ? "#ef4444" : "#d1d5db"}`,
                    borderRadius: 8, padding: "20px 14px",
                    textAlign: "center", cursor: "pointer",
                    background: isDragging ? "#eff6ff" : "#f9fafb",
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#3b82f6" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px", display: "block" }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  <div style={{ fontSize: 13, color: isDragging ? "#3b82f6" : "#64748b", fontWeight: 500 }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>PNG, JPG, WebP up to 10MB</div>
                </div>
              ) : (
                <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1.5px solid #d1d5db" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                  <button
                    type="button" onClick={removeImage}
                    style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(0,0,0,0.6)", color: "white",
                      border: "none", borderRadius: "50%", width: 24, height: 24,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700,
                    }}
                  >×</button>
                  <div style={{ padding: "6px 10px", background: "#f8fafc", fontSize: 11, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>
                    {form.imageFile?.name}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file" accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {errors.imageFile && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 500 }}>{errors.imageFile}</div>}
            </div>

            <div>
              <label style={labelStyle}>Price (VND) <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text" value={form.price} onChange={updateField("price")}
                placeholder="e.g., 25000000"
                style={inputStyle(!!errors.price)}
                onFocus={handleFocus} onBlur={(e) => handleBlur(e, !!errors.price)}
              />
              {errors.price && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 500 }}>{errors.price}</div>}
            </div>
          </div>

          {/* Row 5: Description (full width) */}
          <div style={{ marginBottom: 4 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description} onChange={updateField("description")}
              placeholder="Đồng hồ thông minh cao cấp..."
              rows={4}
              style={{ ...inputStyle(), resize: "vertical" }}
              onFocus={handleFocus} onBlur={(e) => handleBlur(e, false)}
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="submit"
            disabled={isLoading || submitted}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: submitted ? "#10b981" : "linear-gradient(135deg, #10b981, #059669)",
              color: "white", border: "none", borderRadius: 10,
              padding: "12px 28px", fontWeight: 700, fontSize: 15,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { if (!isLoading && !submitted) e.currentTarget.style.boxShadow = "0 6px 20px rgba(16,185,129,0.4)"; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.3)"; }}
          >
            {isLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Creating...
              </>
            ) : submitted ? (
              <>✓ Created!</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Create Product
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default CreateNewProduct;
