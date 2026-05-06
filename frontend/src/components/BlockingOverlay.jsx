/**
 * BlockingOverlay.jsx
 * Overlay che phủ toàn màn hình khi đang chờ giao dịch blockchain.
 * Hiển thị spinner + bước hiện tại để user biết tiến trình.
 */

/**
 * @param {boolean} isVisible  - Hiển thị hay ẩn overlay
 * @param {string}  step       - Chuỗi mô tả bước hiện tại (vd: "3/4 Đang đúc NFT...")
 * @param {string}  title      - Tiêu đề phụ (mặc định: "Đang xử lý giao dịch blockchain")
 */
function BlockingOverlay({ isVisible, step, title = "Đang xử lý giao dịch blockchain" }) {
  if (!isVisible) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Đang xử lý">
      <div style={styles.card}>
        {/* Spinner */}
        <div style={styles.spinnerWrap}>
          <div style={styles.spinnerOuter}>
            <div style={styles.spinnerInner} />
          </div>
          {/* Blockchain icon ở giữa */}
          <div style={styles.iconCenter}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="var(--navy-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        {/* Tiêu đề */}
        <p style={styles.title}>{title}</p>

        {/* Bước hiện tại */}
        {step && (
          <div style={styles.stepBadge}>
            <span style={styles.stepDot} />
            <span style={styles.stepText}>{step}</span>
          </div>
        )}

        {/* Cảnh báo nhỏ */}
        <p style={styles.warning}>
          ⚠️ Vui lòng không đóng tab hoặc thoát trang trong khi xử lý
        </p>
      </div>

      <style>{`
        @keyframes bw-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bw-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 15, 40, 0.78)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "var(--white, #fff)",
    borderRadius: "20px",
    padding: "40px 36px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
    border: "1px solid rgba(41, 85, 206, 0.15)",
  },
  spinnerWrap: {
    position: "relative",
    width: "72px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerOuter: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid transparent",
    borderTopColor: "var(--navy-primary, #1e40af)",
    borderRightColor: "var(--navy-primary, #1e40af)",
    animation: "bw-spin 0.9s linear infinite",
  },
  spinnerInner: {
    position: "absolute",
    inset: "8px",
    borderRadius: "50%",
    border: "2px solid transparent",
    borderBottomColor: "rgba(41, 85, 206, 0.35)",
    animation: "bw-spin 1.4s linear infinite reverse",
  },
  iconCenter: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "bw-pulse 2s ease-in-out infinite",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--navy-primary-dark, #1e3a8a)",
    textAlign: "center",
    letterSpacing: "-0.01em",
  },
  stepBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(41, 85, 206, 0.07)",
    border: "1px solid rgba(41, 85, 206, 0.2)",
    borderRadius: "100px",
    padding: "8px 16px",
  },
  stepDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--navy-primary, #1e40af)",
    animation: "bw-pulse 1.2s ease-in-out infinite",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--navy-primary, #1e40af)",
  },
  warning: {
    margin: 0,
    fontSize: "12px",
    color: "var(--grey-500, #6b7280)",
    textAlign: "center",
    lineHeight: "1.5",
  },
};

export default BlockingOverlay;
