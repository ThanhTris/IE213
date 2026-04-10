import { useMemo, useState } from "react";
import { walletCards, transferRecords } from "../data/mockData";
import Footer from "../components/Footer";

function UserPage({ sideTab, onChangeSideTab }) {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferMessage, setTransferMessage] = useState("");

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return dateStr;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(dateStr)) {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  const getDaysRemaining = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "";
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return "";
    const diffDays = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} days` : "Expired";
  };

  const walletSummary = useMemo(() => {
    const active = walletCards.filter(
      (item) => item.status === "Active",
    ).length;
    const expired = walletCards.filter(
      (item) => item.status === "Expired",
    ).length;
    return {
      active,
      expired,
      total: walletCards.length,
    };
  }, []);

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setShowQRModal(false);
    setShowTransferModal(false);
  };

  const selected = selectedDevice;

  const handleTransferSubmit = (event) => {
    event.preventDefault();

    if (!recipientAddress.trim()) {
      setTransferMessage("Please enter a recipient wallet address.");
      return;
    }

    setTransferMessage(
      "Transfer request submitted. Confirm with your connected wallet.",
    );
    setRecipientAddress("");
    setTimeout(() => setTransferMessage(""), 3500);
  };

  return (
    <>
      <div className="view active">
        <div className="user-layout">
          <aside className="user-sidebar" aria-label="Wallet navigation">
            <button
              type="button"
              className={`side-link ${sideTab === "devices" ? "active" : ""}`}
              onClick={() => onChangeSideTab("devices")}
            >
              My Devices
            </button>
            {/* <button
              type="button"
              className={`side-link ${sideTab === "transfer" ? "active" : ""}`}
              onClick={() => onChangeSideTab("transfer")}
            >
              Transfer History
            </button> */}

            <div className="wallet-summary-card">
              <p className="summary-title">Wallet Status</p>
              <div className="summary-row">
                <span>Active</span>
                <strong>{walletSummary.active}</strong>
              </div>
              <div className="summary-row">
                <span>Expired</span>
                <strong>{walletSummary.expired}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Value</span>
                <strong>$3,899</strong>
              </div>
            </div>
          </aside>

          <div className="user-main">
            <div className="user-header-row">
              <div>
                <h2>My Digital Warranty Wallet</h2>
                <p className="sub">
                  Manage NFT warranties, view device details, scan QR codes, and
                  transfer ownership.
                </p>
              </div>
            </div>

            {sideTab === "devices" && (
              <>
                {!selected ? (
                  <div className="cards-grid">
                    {walletCards.map((card) => (
                      <article
                        key={card.id}
                        className={`warranty-card ${card.status === "Expired" ? "expired-card" : "active-card"}`}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleSelectDevice(card)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectDevice(card);
                          }
                        }}
                      >
                        <div className="card-header">
                          <div className="device-icon">
                            {card.name.toLowerCase().includes("iphone") && (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="5"
                                  y="2"
                                  width="14"
                                  height="20"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                              </svg>
                            )}
                            {card.name.toLowerCase().includes("macbook") && (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="2"
                                  y="3"
                                  width="20"
                                  height="14"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <path d="M2 17h20"></path>
                              </svg>
                            )}
                            {card.name.toLowerCase().includes("watch") && (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="7"></circle>
                                <path d="M12 5V1M12 23v-4"></path>
                              </svg>
                            )}
                          </div>
                          <span
                            className={`status-badge ${card.status.toLowerCase()}`}
                          >
                            {card.status}
                          </span>
                        </div>

                        <div className="card-body">
                          <h3>{card.name}</h3>
                          <p className="serial">Serial: {card.serial}</p>
                          <div className="card-field">
                            <span>Token ID</span>
                            <strong>{card.tokenId}</strong>
                          </div>

                          <div className="card-row">
                            <div className="card-field small">
                              <span>Purchased</span>
                              <strong>{formatDate(card.purchased)}</strong>
                            </div>
                            <div className="card-field small">
                              <span>Expires</span>
                              <strong
                                className={
                                  card.status === "Expired"
                                    ? "text-danger"
                                    : "text-success"
                                }
                              >
                                {formatDate(card.expires)}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button
                            type="button"
                            className={`action-button ${card.status === "Expired" ? "outline full-width" : "view-button"}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectDevice(card);
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ marginRight: "8px" }}
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View Details
                          </button>
                          {card.status !== "Expired" && (
                            <div className="card-buttons-row">
                              <button
                                type="button"
                                className="action-button outline-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDevice(card);
                                  setTimeout(() => setShowQRModal(true), 0);
                                }}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ marginRight: "8px" }}
                                >
                                  <rect x="3" y="3" width="7" height="7"></rect>
                                  <rect
                                    x="14"
                                    y="3"
                                    width="7"
                                    height="7"
                                  ></rect>
                                  <rect
                                    x="14"
                                    y="14"
                                    width="7"
                                    height="7"
                                  ></rect>
                                  <rect
                                    x="3"
                                    y="14"
                                    width="7"
                                    height="7"
                                  ></rect>
                                </svg>
                                QR Code
                              </button>
                              <button
                                type="button"
                                className="action-button outline-button transfer-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDevice(card);
                                  setTimeout(
                                    () => setShowTransferModal(true),
                                    0,
                                  );
                                }}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ marginRight: "8px" }}
                                >
                                  <polyline points="16 3 21 3 21 8"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                  <polyline points="8 21 3 21 3 16"></polyline>
                                  <line x1="3" y1="21" x2="14" y2="10"></line>
                                </svg>
                                Transfer
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <section className="device-detail-page">
                    <div className="detail-header-panel">
                      <button
                        type="button"
                        className="action-button back-link"
                        onClick={() => setSelectedDevice(null)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="19" y1="12" x2="5" y2="12"></line>
                          <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Wallet
                      </button>

                      <span
                        className={`status-pill ${selected.status.toLowerCase()}`}
                      >
                        {selected.status === "Active"
                          ? "Active Warranty"
                          : selected.status}
                      </span>

                      <div className="detail-header-copy">
                        <h2>{selected.name}</h2>
                        <p className="detail-sub thin">
                          Serial: {selected.serial}
                        </p>
                        <p className="detail-sub thin">
                          Token ID: {selected.tokenId}
                        </p>
                      </div>
                    </div>

                    {/* <div className="detail-grid-two">
                      <div className="detail-overview-card">
                        <div className="detail-image" aria-hidden="true">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1e40af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="5"
                              y="2"
                              width="14"
                              height="20"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                        </div>
                        <div className="detail-summary">
                          <h3>Product Information</h3>
                          <div className="info-row">
                            <span>Model</span>
                            <strong>{selected.tokenId.slice(0, 8)}...</strong>
                          </div>
                          <div className="info-row">
                            <span>Color</span>
                            <strong>{selected.color}</strong>
                          </div>
                          <div className="info-row">
                            <span>Storage</span>
                            <strong>{selected.storage}</strong>
                          </div>
                          <div className="info-row">
                            <span>Device Condition</span>
                            <strong>{selected.status}</strong>
                          </div>
                        </div>
                      </div>

                      <aside className="detail-owner-card">
                        <div className="info-card">
                          <div className="card-header-sep">
                            <div className="title-group">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e40af"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <h4>Owner Information</h4>
                            </div>
                          </div>
                          <div className="info-row">
                            <span>Name</span>
                            <strong>{selected.ownerName}</strong>
                          </div>
                          <div className="info-row">
                            <span>Wallet Address</span>
                            <strong
                              className="mono"
                              title={selected.walletAddress}
                            >
                              {selected.walletAddress &&
                              selected.walletAddress.length > 12
                                ? `${selected.walletAddress.slice(0, 6)}...${selected.walletAddress.slice(-4)}`
                                : selected.walletAddress}
                            </strong>
                          </div>
                          <div className="info-row">
                            <span>Email</span>
                            <strong>{selected.ownerEmail}</strong>
                          </div>
                          <div className="info-row">
                            <span>Phone</span>
                            <strong>{selected.ownerPhone}</strong>
                          </div>
                        </div>
                      </aside>
                    </div> */}

                    <div className="detail-content-grid">
                      <div className="detail-overview-card">
                        <div className="detail-image" aria-hidden="true">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1e40af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="5"
                              y="2"
                              width="14"
                              height="20"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                        </div>
                        <div className="detail-summary">
                          <h3>Product Information</h3>
                          <div className="info-row">
                            <span>Model</span>
                            <strong>{selected.tokenId.slice(0, 8)}...</strong>
                          </div>
                          <div className="info-row">
                            <span>Color</span>
                            <strong>{selected.color}</strong>
                          </div>
                          <div className="info-row">
                            <span>Storage</span>
                            <strong>{selected.storage}</strong>
                          </div>
                          <div className="info-row">
                            <span>Device Condition</span>
                            <strong>{selected.status}</strong>
                          </div>
                        </div>
                      </div>

                      <aside className="detail-owner-card">
                        <div className="info-card">
                          <div className="card-header-sep">
                            <div className="title-group">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e40af"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <h4>Owner Information</h4>
                            </div>
                          </div>
                          <div className="info-row">
                            <span>Name</span>
                            <strong>{selected.ownerName}</strong>
                          </div>
                          <div className="info-row">
                            <span>Wallet Address</span>
                            <strong
                              className="mono"
                              title={selected.walletAddress}
                            >
                              {selected.walletAddress &&
                              selected.walletAddress.length > 12
                                ? `${selected.walletAddress.slice(0, 6)}...${selected.walletAddress.slice(-4)}`
                                : selected.walletAddress}
                            </strong>
                          </div>
                          <div className="info-row">
                            <span>Email</span>
                            <strong>{selected.ownerEmail}</strong>
                          </div>
                          <div className="info-row">
                            <span>Phone</span>
                            <strong>{selected.ownerPhone}</strong>
                          </div>
                        </div>
                      </aside>
                      <div className="detail-left-column">
                        <div className="warranty-details-card">
                          <div className="section-title">
                            <div className="title-group">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e40af"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                              </svg>
                              <h3>Warranty Details</h3>
                            </div>
                          </div>
                          <div className="warranty-grid">
                            <div className="warranty-item">
                              <div className="warranty-item-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#1e40af"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                              </div>
                              <div className="warranty-item-text">
                                <span className="warranty-item-label">
                                  Purchase Date
                                </span>
                                <strong className="warranty-item-value">
                                  {formatDate(selected.purchased)}
                                </strong>
                              </div>
                            </div>
                            <div className="warranty-item">
                              <div className="warranty-item-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#1e40af"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 21H3V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16z"></path>
                                  <line x1="7" y1="10" x2="7" y2="16"></line>
                                  <line x1="11" y1="10" x2="11" y2="16"></line>
                                  <line x1="15" y1="10" x2="15" y2="16"></line>
                                </svg>
                              </div>
                              <div className="warranty-item-text">
                                <span className="warranty-item-label">
                                  Warranty Period
                                </span>
                                <strong className="warranty-item-value">
                                  {selected.warrantyPeriod}
                                </strong>
                              </div>
                            </div>
                            <div className="warranty-item">
                              <div className="warranty-item-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                              </div>
                              <div className="warranty-item-text">
                                <span className="warranty-item-label">
                                  Expiry Date
                                </span>
                                <strong className="warranty-item-value">
                                  {formatDate(selected.expires)}
                                </strong>
                              </div>
                            </div>
                            <div className="warranty-item">
                              <div className="warranty-item-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#1e40af"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="18" cy="6" r="3"></circle>
                                  <circle cx="6" cy="6" r="3"></circle>
                                  <circle cx="12" cy="18" r="3"></circle>
                                </svg>
                              </div>
                              <div className="warranty-item-text">
                                <span className="warranty-item-label">
                                  Days Remaining
                                </span>
                                <strong className="warranty-item-value">
                                  {getDaysRemaining(selected.expires)}
                                </strong>
                              </div>
                            </div>
                          </div>
                          <div className="status-banner">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>
                              Warranty verified and secured on Sepolia
                              Blockchain
                            </span>
                          </div>
                        </div>

                        <div className="repair-history-card">
                          <div className="section-title">
                            <div className="title-group">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e40af"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                              </svg>
                              <h3>Repair History</h3>
                            </div>
                            <span className="badge-count">
                              {selected.history.length} Events
                            </span>
                          </div>
                          <div className="repair-list">
                            {selected.history.map((entry) => (
                              <article
                                key={entry.date}
                                className="repair-entry"
                              >
                                <div>
                                  <strong>{formatDate(entry.date)}</strong>
                                  <p>{entry.event}</p>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="detail-right-column">
                        <div className="info-card purchase-card">
                          <div className="card-header-sep">
                            <div className="title-group">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e40af"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="2"
                                  y="7"
                                  width="20"
                                  height="14"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                              </svg>
                              <h4>Purchase Details</h4>
                            </div>
                          </div>
                          <div className="info-row compact">
                            <span>Retailer</span>
                            <strong>{selected.retailer}</strong>
                          </div>
                          <div className="info-row compact">
                            <span>Location</span>
                            <strong>{selected.retailer}</strong>
                          </div>
                          <div className="info-row compact">
                            <span>Purchase Price</span>
                            <strong>{selected.purchasePrice}</strong>
                          </div>
                        </div>

                        <div className="actions-card">
                          <button
                            type="button"
                            className="action-button primary full-width"
                          >
                            Download Certificate
                          </button>
                          <button
                            type="button"
                            className="action-button outline full-width"
                          >
                            Share Warranty
                          </button>
                          <button
                            type="button"
                            className="action-button secondary full-width"
                            onClick={() => setShowTransferModal(true)}
                          >
                            Transfer Ownership
                          </button>
                        </div>

                        <div className="secure-card secure-card-detail">
                          <div
                            className="secure-icon"
                            style={{
                              padding: "10px",
                              borderRadius: "50%",
                              display: "flex",
                            }}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                          </div>
                          <h4>Blockchain Secured</h4>
                          <p>
                            This warranty is immutably stored on-chain and
                            cannot be tampered with or forged.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {sideTab === "transfer" && (
              <section className="transfer-history-section">
                <div className="section-header">
                  <div>
                    <h3>Transfer History</h3>
                    <p className="sub">
                      Review all warranty ownership transfers and status
                      updates.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="action-button outline"
                    onClick={() => setShowTransferModal(true)}
                  >
                    Start New Transfer
                  </button>
                </div>
                <div className="transfer-list">
                  {transferRecords.map((record) => (
                    <article key={record.id} className="transfer-card">
                      <div>
                        <span className="transfer-device">{record.device}</span>
                        <p className="detail-sub">To {record.to}</p>
                      </div>
                      <div className="transfer-info">
                        <span>{formatDate(record.date)}</span>
                        <span
                          className={`transfer-status ${record.status.toLowerCase()}`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {showQRModal && selected && (
        <div
          className="modal-backdrop open"
          onClick={() => setShowQRModal(false)}
          role="presentation"
        >
          <div
            className="modal-panel qr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowQRModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 id="qr-modal-title">Service Center QR Code</h3>
            <p className="muted">
              Show this QR at an authorized service counter to verify your
              warranty instantly.
            </p>
            <div className="qr-box">
              <svg
                viewBox="0 0 120 120"
                width="220"
                height="220"
                aria-hidden="true"
              >
                <rect width="120" height="120" fill="#eef2ff" rx="16" />
                <rect x="12" y="12" width="24" height="24" fill="#1e3a8a" />
                <rect x="12" y="42" width="12" height="12" fill="#1e3a8a" />
                <rect x="42" y="12" width="12" height="12" fill="#1e3a8a" />
                <rect x="84" y="12" width="24" height="24" fill="#1e3a8a" />
                <rect x="84" y="42" width="12" height="12" fill="#1e3a8a" />
                <rect x="24" y="84" width="12" height="12" fill="#1e3a8a" />
                <rect x="36" y="96" width="12" height="12" fill="#1e3a8a" />
                <rect x="72" y="72" width="12" height="12" fill="#1e3a8a" />
                <rect x="96" y="84" width="12" height="12" fill="#1e3a8a" />
              </svg>
            </div>
            <div className="qr-detail">
              <p>{selected.name}</p>
              <p className="mono">Token: {selected.tokenId}</p>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && selected && (
        <div
          className="modal-backdrop open"
          onClick={() => setShowTransferModal(false)}
          role="presentation"
        >
          <div
            className="modal-panel transfer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowTransferModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 id="transfer-modal-title">Transfer Ownership</h3>
            <p className="muted">
              Enter a recipient wallet address to begin the transfer process for
              this warranty.
            </p>
            <form className="transfer-form" onSubmit={handleTransferSubmit}>
              <label htmlFor="recipientAddress">Recipient Wallet Address</label>
              <input
                id="recipientAddress"
                type="text"
                value={recipientAddress}
                onChange={(event) => setRecipientAddress(event.target.value)}
                placeholder="0x..."
              />
              {transferMessage && (
                <p className="form-message info">{transferMessage}</p>
              )}
              <button
                type="submit"
                className="action-button primary full-width"
              >
                Confirm Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default UserPage;
