import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildFakeHash } from "../../utils/hashPreview";

function CreateNewProduct() {
  const navigate = useNavigate();
  const initialForm = {
    productName: "iPhone 15 Pro Max",
    manufacturer: "Apple Inc.",
    modelNumber: "A2849",
    serialNumber: "FNQW8123XYZ",
    category: "smartphones",
    condition: "new",
    color: "Natural Titanium",
    storage: "256GB",
    purchaseDate: "2025-03-15",
    warrantyPeriod: "12",
    purchasePrice: "1199.00",
    ownerName: "John Doe",
    walletAddress: "0x7426...08f",
    ownerEmail: "owner@example.com",
    ownerPhone: "+1 (555) 123-4567",
    retailerName: "Apple Store NYC",
    retailerLocation: "Fifth Avenue, New York, NY",
    processor: "A17 Pro",
    memory: "8GB",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previewHash = useMemo(() => buildFakeHash(form), [form]);
  const issueDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const expiryDate = useMemo(() => {
    if (!form.purchaseDate || !form.warrantyPeriod) return "Not set";
    const d = new Date(form.purchaseDate);
    d.setMonth(d.getMonth() + Number(form.warrantyPeriod));
    return d.toISOString().slice(0, 10);
  }, [form.purchaseDate, form.warrantyPeriod]);
  const previewTokenId = useMemo(() => {
    if (!previewHash) return "Not set";
    return `0x${previewHash.slice(0, 5)}...${previewHash.slice(-4)}`;
  }, [previewHash]);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return true;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const validateEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields
    if (!form.productName.trim())
      newErrors.productName = "Product name is required";
    if (!form.manufacturer.trim())
      newErrors.manufacturer = "Manufacturer is required";
    if (!form.modelNumber.trim())
      newErrors.modelNumber = "Model number is required";
    if (!form.serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.purchaseDate)
      newErrors.purchaseDate = "Purchase date is required";
    if (!form.warrantyPeriod)
      newErrors.warrantyPeriod = "Warranty period is required";
    if (!form.ownerName.trim()) newErrors.ownerName = "Owner name is required";

    // Wallet address validation
    if (!form.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    } else if (!validateEthereumAddress(form.walletAddress)) {
      newErrors.walletAddress =
        "Invalid Ethereum address (must be 0x followed by 40 hex characters)";
    }

    // Email validation (optional but must be valid if provided)
    if (form.ownerEmail && !validateEmail(form.ownerEmail)) {
      newErrors.ownerEmail = "Invalid email address";
    }

    // Purchase price validation (optional but must be positive if provided)
    if (form.purchasePrice && parseFloat(form.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        // Optionally reset form after success
        // setForm(initialForm);
      }, 3000);
      console.log("Warranty Created:", form);
    } catch (error) {
      console.error("Error creating warranty:", error);
      setErrors({ submit: "Failed to create warranty. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="create-warranty-container"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0" }}
    >
      {/* Banner Section */}
      <div
        style={{
          background: "linear-gradient(120deg, #2242a6 0%, #2563eb 100%)",
          borderRadius: 32,
          padding: "36px 40px 32px 40px",
          marginBottom: 36,
          color: "#fff",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
          minHeight: 180,
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.13)",
              border: "none",
              borderRadius: 16,
              padding: "14px 32px",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 32,
              boxShadow: "0 2px 8px #0002",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.13)")
            }
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back
          </button>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              margin: 0,
              marginBottom: 10,
              letterSpacing: -1,
            }}
          >
            Create New Product
          </h1>
          <div style={{ fontSize: 18, opacity: 0.93, marginTop: 2 }}>
            Fill in the product and warranty information below
          </div>
        </div>
        {/* You can add a status badge or icon here if needed */}
      </div>
      <div
        className="create-warranty-layout"
        style={{ maxWidth: 1000, margin: "0 auto" }}
      >
        <form
          onSubmit={handleSubmit}
          className={`warranty-form ${isLoading ? "form-loading" : ""}`}
        >
          {/* Error Message */}
          {errors.submit && (
            <div className="form-error" style={{ marginBottom: "20px" }}>
              {errors.submit}
            </div>
          )}

          {/* Success Message */}
          {submitted && (
            <div className="form-success" style={{ marginBottom: "20px" }}>
              Warranty NFT created successfully and recorded on blockchain!
            </div>
          )}

          {/* Product Information Section */}
          <div className="form-section">
            <h3>📦 Product Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="productName">Product Name *</label>
                <input
                  id="productName"
                  type="text"
                  value={form.productName}
                  onChange={updateField("productName")}
                  placeholder="e.g., iPhone 15 Pro Max"
                  className={errors.productName ? "is-invalid" : ""}
                />
                {errors.productName && (
                  <div className="form-error">{errors.productName}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="manufacturer">Manufacturer *</label>
                <input
                  id="manufacturer"
                  type="text"
                  value={form.manufacturer}
                  onChange={updateField("manufacturer")}
                  placeholder="e.g., Apple Inc."
                  className={errors.manufacturer ? "is-invalid" : ""}
                />
                {errors.manufacturer && (
                  <div className="form-error">{errors.manufacturer}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="modelNumber">Model Number *</label>
                <input
                  id="modelNumber"
                  type="text"
                  value={form.modelNumber}
                  onChange={updateField("modelNumber")}
                  placeholder="e.g., A2849"
                  className={errors.modelNumber ? "is-invalid" : ""}
                />
                {errors.modelNumber && (
                  <div className="form-error">{errors.modelNumber}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="serialNumber">Serial Number *</label>
                <input
                  id="serialNumber"
                  type="text"
                  value={form.serialNumber}
                  onChange={updateField("serialNumber")}
                  placeholder="e.g., FNQW8123XYZ"
                  className={errors.serialNumber ? "is-invalid" : ""}
                />
                {errors.serialNumber && (
                  <div className="form-error">{errors.serialNumber}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={updateField("category")}
                  className={errors.category ? "is-invalid" : ""}
                >
                  <option value="">Select category</option>
                  <option value="smartphones">Smartphones</option>
                  <option value="laptops">Laptops</option>
                  <option value="tablets">Tablets</option>
                  <option value="wearables">Wearables</option>
                  <option value="audio">Audio</option>
                </select>
                {errors.category && (
                  <div className="form-error">{errors.category}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  value={form.condition}
                  onChange={updateField("condition")}
                >
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  id="color"
                  type="text"
                  value={form.color}
                  onChange={updateField("color")}
                  placeholder="e.g., Natural Titanium"
                />
              </div>
              <div className="form-group">
                <label htmlFor="storage">Storage/Capacity</label>
                <input
                  id="storage"
                  type="text"
                  value={form.storage}
                  onChange={updateField("storage")}
                  placeholder="e.g., 256GB"
                />
              </div>
            </div>
          </div>

          {/* Warranty Information Section */}
          <div className="form-section">
            <h3>🛡️ Warranty Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="purchaseDate">Purchase Date *</label>
                <input
                  id="purchaseDate"
                  type="date"
                  value={form.purchaseDate}
                  onChange={updateField("purchaseDate")}
                  className={errors.purchaseDate ? "is-invalid" : ""}
                />
                {errors.purchaseDate && (
                  <div className="form-error">{errors.purchaseDate}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="warrantyPeriod">
                  Warranty Period (months) *
                </label>
                <select
                  id="warrantyPeriod"
                  value={form.warrantyPeriod}
                  onChange={updateField("warrantyPeriod")}
                  className={errors.warrantyPeriod ? "is-invalid" : ""}
                >
                  <option value="">Select warranty period</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months (1 year)</option>
                  <option value="24">24 months (2 years)</option>
                  <option value="36">36 months (3 years)</option>
                </select>
                {errors.warrantyPeriod && (
                  <div className="form-error">{errors.warrantyPeriod}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="purchasePrice">Purchase Price</label>
                <input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={updateField("purchasePrice")}
                  placeholder="e.g., 1199.00"
                  className={errors.purchasePrice ? "is-invalid" : ""}
                />
                {errors.purchasePrice && (
                  <div className="form-error">{errors.purchasePrice}</div>
                )}
              </div>
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="form-section">
            <h3>👤 Owner Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="ownerName">Owner Name *</label>
                <input
                  id="ownerName"
                  type="text"
                  value={form.ownerName}
                  onChange={updateField("ownerName")}
                  placeholder="e.g., John Doe"
                  className={errors.ownerName ? "is-invalid" : ""}
                />
                {errors.ownerName && (
                  <div className="form-error">{errors.ownerName}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="walletAddress">Wallet Address *</label>
                <input
                  id="walletAddress"
                  type="text"
                  value={form.walletAddress}
                  onChange={updateField("walletAddress")}
                  placeholder="0x..."
                  className={errors.walletAddress ? "is-invalid" : ""}
                />
                {errors.walletAddress && (
                  <div className="form-error">{errors.walletAddress}</div>
                )}
                <div className="form-helping">
                  Must be a valid Ethereum address (0x...)
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ownerEmail">Email</label>
                <input
                  id="ownerEmail"
                  type="email"
                  value={form.ownerEmail}
                  onChange={updateField("ownerEmail")}
                  placeholder="owner@example.com"
                  className={errors.ownerEmail ? "is-invalid" : ""}
                />
                {errors.ownerEmail && (
                  <div className="form-error">{errors.ownerEmail}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="ownerPhone">Phone</label>
                <input
                  id="ownerPhone"
                  type="tel"
                  value={form.ownerPhone}
                  onChange={updateField("ownerPhone")}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Retailer Information Section */}
          <div className="form-section">
            <h3>🏪 Retailer Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="retailerName">Retailer Name</label>
                <input
                  id="retailerName"
                  type="text"
                  value={form.retailerName}
                  onChange={updateField("retailerName")}
                  placeholder="e.g., Apple Store NYC"
                />
              </div>
              <div className="form-group">
                <label htmlFor="retailerLocation">Location</label>
                <input
                  id="retailerLocation"
                  type="text"
                  value={form.retailerLocation}
                  onChange={updateField("retailerLocation")}
                  placeholder="e.g., Fifth Avenue, New York, NY"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="form-section">
            <h3>⚙️ Technical Specifications</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="processor">Processor</label>
                <input
                  id="processor"
                  type="text"
                  value={form.processor}
                  onChange={updateField("processor")}
                  placeholder="e.g., A17 Pro"
                />
              </div>
              <div className="form-group">
                <label htmlFor="memory">Memory (RAM)</label>
                <input
                  id="memory"
                  type="text"
                  value={form.memory}
                  onChange={updateField("memory")}
                  placeholder="e.g., 8GB"
                />
              </div>
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
                  : "Create Warranty NFT"}
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
                <p className="preview-label">Warranty NFT Preview</p>
                <h4>{form.productName || "Select Device Model"}</h4>
                <p className="preview-subtitle">
                  Serial: {form.serialNumber || "Not set"}
                </p>
              </div>
              <span className="preview-badge">NFT</span>
            </div>

            <div className="preview-details-grid">
              <div>
                <span>Token ID</span>
                <strong>{previewTokenId}</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>{form.ownerName || "Not set"}</strong>
              </div>
              <div>
                <span>Issued</span>
                <strong>{issueDate}</strong>
              </div>
              <div>
                <span>Expires</span>
                <strong>{expiryDate}</strong>
              </div>
            </div>

            <div className="preview-hash-card">
              <p>Blockchain Hash</p>
              <code>{previewHash}</code>
            </div>
          </div>

          <div className="preview-info-card">
            <h4>Warranty Details</h4>
            <ul>
              <li>NFT minted on Ethereum blockchain</li>
              <li>Transferable to new owners</li>
              <li>Immutable proof of authenticity</li>
              <li>Globally verifiable warranty status</li>
            </ul>
          </div>

          <div className="preview-note">
            Gas fees will be calculated at time of minting. Ensure wallet has
            sufficient funds.
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CreateNewProduct;
