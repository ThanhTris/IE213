import { useState } from "react";
import { repairLogService } from "../../services/repairLogService";

function LogRepairs() {
  const [repairForm, setRepairForm] = useState({
    tokenId: "",
    serialNumber: "",
    technicianName: "",
    repairDate: new Date().toISOString().slice(0, 10),
    completionDate: "",
    status: "completed",
    repairType: "",
    serviceCenter: "",
    partsReplaced: "",
    cost: "",
    repairContent: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field) => (event) => {
    setRepairForm((prev) => ({
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

  const validateForm = () => {
    const newErrors = {};
    if (!repairForm.tokenId.trim())
      newErrors.tokenId = "Warranty token ID is required";
    if (!repairForm.serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";
    if (!repairForm.technicianName.trim())
      newErrors.technicianName = "Technician name is required";
    if (!repairForm.repairType.trim())
      newErrors.repairType = "Repair type is required";
    if (!repairForm.serviceCenter.trim())
      newErrors.serviceCenter = "Service center is required";
    if (!repairForm.repairContent.trim())
      newErrors.repairContent = "Repair notes are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Chuyển đổi linh kiện thay thế từ chuỗi (phân tách bằng dấu phẩy) sang mảng
      const partsArray = repairForm.partsReplaced
        ? repairForm.partsReplaced.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

      const payload = {
        ...repairForm,
        partsReplaced: partsArray,
        cost: parseFloat(repairForm.cost) || 0,
      };

      await repairLogService.createLog(payload);

      setSubmitted(true);
      // Reset các trường nhập liệu sau khi thành công
      setRepairForm({ ...repairForm, repairContent: "", partsReplaced: "", cost: "", notes: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to log repair" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="log-repairs-container">
      <div className="log-repairs-layout">
        <div className="log-repairs-card">
          <div className="section-header">
            <span className="section-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </span>
            <div className="section-title">
              <h2>Log Repair Activity</h2>
              <p className="section-note">
                Capture repair details and warranty token metadata for each
                service event.
              </p>
            </div>
          </div>

          {submitted && (
            <div className="form-success" style={{ marginBottom: "20px" }}>
              Repair record submitted successfully.
            </div>
          )}

          {errors.submit && (
            <div className="form-error" style={{ marginBottom: "20px", color: "#dc2626" }}>
              {errors.submit}
            </div>
          )}

          <form className={`repair-log-form ${isLoading ? "form-loading" : ""}`} onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="tokenId">Warranty Token ID</label>
                <input
                  id="tokenId"
                  type="text"
                  value={repairForm.tokenId}
                  onChange={updateField("tokenId")}
                  placeholder="Enter token ID"
                  className={errors.tokenId ? "is-invalid" : ""}
                />
                {errors.tokenId && (
                  <div className="form-error">{errors.tokenId}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="serialNumber">Serial Number</label>
                <input
                  id="serialNumber"
                  type="text"
                  value={repairForm.serialNumber}
                  onChange={updateField("serialNumber")}
                  placeholder="Enter device serial"
                  className={errors.serialNumber ? "is-invalid" : ""}
                />
                {errors.serialNumber && (
                  <div className="form-error">{errors.serialNumber}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="repairType">Repair Type</label>
                <select
                  id="repairType"
                  value={repairForm.repairType}
                  onChange={updateField("repairType")}
                  className={errors.repairType ? "is-invalid" : ""}
                >
                  <option value="">Select repair type</option>
                  <option value="camera">Camera Repair</option>
                  <option value="screen">Screen Repair</option>
                  <option value="battery">Battery Replacement</option>
                  <option value="software">Software Repair</option>
                  <option value="other">Other</option>
                </select>
                {errors.repairType && (
                  <div className="form-error">{errors.repairType}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="serviceCenter">Service Center</label>
                <input
                  id="serviceCenter"
                  type="text"
                  value={repairForm.serviceCenter}
                  onChange={updateField("serviceCenter")}
                  placeholder="Enter service center"
                  className={errors.serviceCenter ? "is-invalid" : ""}
                />
                {errors.serviceCenter && (
                  <div className="form-error">{errors.serviceCenter}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="technicianName">Technician Name</label>
                <input
                  id="technicianName"
                  type="text"
                  value={repairForm.technicianName}
                  onChange={updateField("technicianName")}
                  placeholder="Enter technician name"
                  className={errors.technicianName ? "is-invalid" : ""}
                />
                {errors.technicianName && (
                  <div className="form-error">{errors.technicianName}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="repairDate">Repair Date</label>
                <input
                  id="repairDate"
                  type="date"
                  value={repairForm.repairDate}
                  onChange={updateField("repairDate")}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Repair Status</label>
                <select
                  id="status"
                  value={repairForm.status}
                  onChange={updateField("status")}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="completionDate">Completion Date</label>
                <input
                  id="completionDate"
                  type="date"
                  value={repairForm.completionDate}
                  onChange={updateField("completionDate")}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cost">Repair Cost</label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={repairForm.cost}
                  onChange={updateField("cost")}
                  placeholder="Enter cost"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="partsReplaced">Parts Replaced</label>
                <textarea
                  id="partsReplaced"
                  rows="3"
                  value={repairForm.partsReplaced}
                  onChange={updateField("partsReplaced")}
                  placeholder="List replaced parts"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="repairContent">Repair Notes</label>
                <textarea
                  id="repairContent"
                  rows="4"
                  value={repairForm.repairContent}
                  onChange={updateField("repairContent")}
                  placeholder="Describe the repair work performed"
                  className={errors.repairContent ? "is-invalid" : ""}
                />
                {errors.repairContent && (
                  <div className="form-error">{errors.repairContent}</div>
                )}
              </div>
              <div className="form-group full-width">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  rows="3"
                  value={repairForm.notes}
                  onChange={updateField("notes")}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Repair Record"}
              </button>
            </div>
          </form>
        </div>

        <aside className="repair-benefits-card">
          <h3>Repair Tracking Benefits</h3>
          <ul>
            <li>
              All repairs are permanently recorded on the blockchain, creating a
              complete service history
            </li>
            <li>Increases trust and transparency for second-hand buyers</li>
            <li>Helps identify patterns and improve product quality</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default LogRepairs;
