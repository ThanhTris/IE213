import { useState, useEffect } from "react";

function CreateNewProduct() {
  const initialForm = {
    product_type: "",
    model_name: "",
    brand: "",
    color: "",
    config: "",
    imageFile: null,
  };

  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.product_type.trim()) newErrors.product_type = "Product type is required";
    if (!form.model_name.trim()) newErrors.model_name = "Model name is required";
    if (!form.brand.trim()) newErrors.brand = "Brand is required";
    if (!form.imageFile) newErrors.imageFile = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.imageFile) {
        setErrors((prev) => ({ ...prev, imageFile: "" }));
      }
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setImagePreview("");
    setErrors({});
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // In a real app, you would use FormData to upload the file
      const formData = new FormData();
      formData.append("product_type", form.product_type);
      formData.append("model_name", form.model_name);
      formData.append("brand", form.brand);
      formData.append("color", form.color);
      formData.append("config", form.config);
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }
      
      // Simulate API call 
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
      // Log entries for debugging
      const payloadLog = {};
      for (let [key, value] of formData.entries()) {
        payloadLog[key] = value instanceof File ? value.name : value;
      }
      console.log("Product Created Payload:", payloadLog);
      
    } catch (error) {
      console.error("Error creating product:", error);
      setErrors({ submit: "Failed to create product. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-warranty-container" style={{ padding: "0" }}>
      <div className="create-warranty-layout" style={{ margin: "0 auto" }}>
        <form
          onSubmit={handleSubmit}
          className={`warranty-form ${isLoading ? "form-loading" : ""}`}
        >
          {errors.submit && (
            <div className="form-error" style={{ marginBottom: "20px" }}>
              {errors.submit}
            </div>
          )}

          {submitted && (
            <div className="form-success" style={{ marginBottom: "20px" }}>
              Product created successfully!
            </div>
          )}

          {/* Core Information Section */}
          <div className="form-section">
            <h3>📦 Core Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="product_type">Product Type *</label>
                <input
                  id="product_type"
                  type="text"
                  value={form.product_type}
                  onChange={updateField("product_type")}
                  placeholder="e.g., MacBook"
                  className={errors.product_type ? "is-invalid" : ""}
                />
                {errors.product_type && (
                  <div className="form-error">{errors.product_type}</div>
                )}
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label htmlFor="model_name">Model Name *</label>
                <input
                  id="model_name"
                  type="text"
                  value={form.model_name}
                  onChange={updateField("model_name")}
                  placeholder="e.g., MacBook Pro 16 M4 Pro"
                  className={errors.model_name ? "is-invalid" : ""}
                />
                {errors.model_name && (
                  <div className="form-error">{errors.model_name}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="brand">Brand *</label>
                <input
                  id="brand"
                  type="text"
                  value={form.brand}
                  onChange={updateField("brand")}
                  placeholder="e.g., Apple"
                  className={errors.brand ? "is-invalid" : ""}
                />
                {errors.brand && (
                  <div className="form-error">{errors.brand}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  id="color"
                  type="text"
                  value={form.color}
                  onChange={updateField("color")}
                  placeholder="e.g., Bạc"
                />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label htmlFor="config">Configuration</label>
                <input
                  id="config"
                  type="text"
                  value={form.config}
                  onChange={updateField("config")}
                  placeholder="e.g., 24GB RAM, 1TB SSD, M4 Pro"
                />
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="form-section">
            <h3>🖼️ Product Image</h3>
            <div className="form-group" style={{ width: "100%" }}>
              <label htmlFor="imageFile">Upload Image *</label>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={errors.imageFile ? "is-invalid" : ""}
                style={{ width: "100%", padding: "10px 0" }}
              />
              {errors.imageFile && (
                <div className="form-error">{errors.imageFile}</div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading || submitted}
            >
              {isLoading
                ? "Creating..."
                : submitted
                  ? "✓ Created Successfully!"
                  : "Create Product"}
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </button>
            <button type="button" className="btn-cancel" disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>

        <aside className="preview-panel">
          <div className="preview-card">
            <div className="preview-card-head">
              <div>
                <p className="preview-label">Product Tracking</p>
                <h4>{form.model_name || "Model Name"}</h4>
                <p className="preview-subtitle">
                  {form.product_type || "Type"} • {form.brand || "Brand"}
                </p>
              </div>
            </div>

            {imagePreview ? (
              <div 
                style={{ 
                  marginTop: "15px", 
                  borderRadius: "8px", 
                  overflow: "hidden", 
                  border: "1px solid #eee", 
                  background: "#f9f9f9", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  minHeight: "150px" 
                }}
              >
                <img 
                  src={imagePreview} 
                  alt="Product Preview" 
                  style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div 
                style={{ 
                  marginTop: "15px", 
                  borderRadius: "8px", 
                  overflow: "hidden", 
                  border: "2px dashed #ddd", 
                  background: "#f9f9f9", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  minHeight: "150px" 
                }}
              >
                <div style={{ padding: "20px", color: "#888", fontSize: "14px", textAlign: "center" }}>
                  <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>📸</span>
                  No Image Selected
                </div>
              </div>
            )}

            <div className="preview-details-grid" style={{ marginTop: "20px" }}>
              <div>
                <span>Color</span>
                <strong>{form.color || "-"}</strong>
              </div>
            </div>
            
            <div className="preview-info-card" style={{ marginTop: "20px" }}>
              <h4>Configuration Details</h4>
              <p style={{ margin: 0, lineHeight: "1.5", fontSize: "14px" }}>
                {form.config || "No configuration specified."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CreateNewProduct;
