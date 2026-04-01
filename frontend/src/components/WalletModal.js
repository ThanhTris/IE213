
function WalletModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          x
        </button>
        <h3 id="modal-title">Service center check-in</h3>
        <p className="muted">
          Show this QR at the counter. Staff scans to pull your on-chain warranty record.
        </p>
        <div className="qr-placeholder">
          <p>QR Placeholder</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary">
            Transfer Ownership
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;
