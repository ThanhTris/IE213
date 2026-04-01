import { useMemo, useState } from "react";
import { adminMetrics } from "../data/mockData";
import { buildFakeHash } from "../utils/hashPreview";
import Footer from "../components/Footer";

function AdminPage() {
  const [form, setForm] = useState({
    model: "Aurora Phone 14 Pro",
    serial: "SN-NEW-2025-001",
    wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    expiry: "2027-03-22",
  });
  const [minting, setMinting] = useState(false);

  const previewHash = useMemo(() => buildFakeHash(form), [form]);

  const updateField = (field) => (event) =>
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

  const handleMint = () => {
    setMinting(true);
    setTimeout(() => setMinting(false), 2200);
  };

  return (
    <>
      <div className="view active">
        <div className="admin-wrap">
          <h2>Management portal</h2>
          <p className="sub">Mint NFT warranties and log repairs for your authorized service network.</p>
          <div className="admin-metrics">
            {adminMetrics.map((metric) => (
              <div className="metric-tile" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
          <div className="mint-split">
            <div className="mint-form-col">
              <h3>Mint warranty</h3>
              <div className="field">
                <label htmlFor="device-model">Device model</label>
                <select id="device-model" value={form.model} onChange={updateField("model")}>
                  <option>Aurora Phone 14 Pro</option>
                  <option>Nimbus Tablet Air</option>
                  <option>Pulse Watch S5</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="serial">Serial number</label>
                <input id="serial" type="text" value={form.serial} onChange={updateField("serial")} />
              </div>
              <div className="field">
                <label htmlFor="wallet">Customer wallet address</label>
                <input id="wallet" type="text" value={form.wallet} onChange={updateField("wallet")} />
              </div>
              <div className="field">
                <label htmlFor="expiry">Expiry date</label>
                <input id="expiry" type="date" value={form.expiry} onChange={updateField("expiry")} />
              </div>
            </div>
            <div className="mint-preview-col">
              <span className="preview-label">Live preview - content hash</span>
              <div className="hash-preview">{previewHash}</div>
              <div className="submit-block">
                <button type="button" className="btn btn-primary" onClick={handleMint} disabled={minting}>
                  {minting ? "Submitted - Confirm in wallet..." : "Issue Warranty on Blockchain"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPage;
