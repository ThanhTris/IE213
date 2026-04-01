import { walletCards } from "../data/mockData";
import Footer from "../components/Footer";

function UserPage({ sideTab, onChangeSideTab, onOpenModal }) {
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
            <button
              type="button"
              className={`side-link ${sideTab === "transfer" ? "active" : ""}`}
              onClick={() => onChangeSideTab("transfer")}
            >
              Transfer History
            </button>
          </aside>
          <div className="user-main">
            <h2>Digital warranty wallet</h2>
            <p className="sub">Tap a card to show the in-store QR and transfer options.</p>
            {sideTab === "devices" ? (
              <div className="cards-grid">
                {walletCards.map((card) => (
                  <article
                    key={card.id}
                    className="warranty-card"
                    tabIndex={0}
                    role="button"
                    onClick={onOpenModal}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenModal();
                      }
                    }}
                  >
                    <span className="brand-mini">BlockWarranty</span>
                    <div className="chip" />
                    <h3>{card.name}</h3>
                    <p className="serial">{card.serial}</p>
                    <span className={`expiry ${card.expired ? "expired" : ""}`}>{card.expiry}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="sub transfer-panel">
                <strong>Transfer history</strong> - Last outbound: Aurora Phone 14 Pro -&gt; 0x8f...3a2
                (demo) - Pending signature.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserPage;
