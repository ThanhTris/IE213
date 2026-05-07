/**
 * web3.jsx — Các tiện ích Web3 / MetaMask
 * Bao gồm:
 *  - connectMetaMask(): kết nối ví
 *  - isValidWalletAddress(): validate địa chỉ EVM
 *  - parseMetaMaskError(): phân loại & dịch 4 loại lỗi MetaMask
 *  - setupWalletListeners(): lắng nghe sự kiện đổi ví / đổi mạng
 */

// ─── Kết nối MetaMask ──────────────────────────────────────────────────────
export async function connectMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask chưa được cài đặt. Vui lòng cài MetaMask để tiếp tục.");
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("Không tìm thấy tài khoản ví nào.");
  }
  return accounts[0];
}

// ─── Validate địa chỉ EVM ─────────────────────────────────────────────────
export function isValidWalletAddress(address = "") {
  const v = String(address).trim();
  return /^0x[a-fA-F0-9]{40}$/.test(v);
}

// ─── Phân loại lỗi MetaMask ───────────────────────────────────────────────
/**
 * Nhận một Error object từ MetaMask/ethers và trả về chuỗi thông báo
 * tiếng Việt thân thiện với người dùng.
 *
 * 4 loại lỗi được xử lý:
 *  1. User reject  (code 4001)
 *  2. Thiếu Gas    (code -32000 + "insufficient funds")
 *  3. Sai mạng     (code 4902 / "wrong network" / "chain")
 *  4. Lỗi RPC      (code -32603)
 */
export function parseMetaMaskError(err) {
  if (!err) return "Đã xảy ra lỗi không xác định.";

  // Chuyển toàn bộ object lỗi sang chuỗi để quét sâu hơn
  const errString = JSON.stringify(err).toLowerCase();
  const code = err?.code ?? err?.error?.code ?? err?.data?.code;
  const message = (err?.message ?? err?.reason ?? "").toLowerCase();
  const innerMessage = (err?.error?.message ?? "").toLowerCase();
  const combinedMsg = `${message} ${innerMessage}`;

  // 1. User hủy giao dịch
  if (
    code === 4001 ||
    errString.includes("4001") ||
    combinedMsg.includes("user rejected") ||
    combinedMsg.includes("user denied") ||
    combinedMsg.includes("rejected the request")
  ) {
    return "Bạn đã hủy giao dịch. Vui lòng thử lại nếu muốn tiếp tục.";
  }

  // 2. Thiếu Gas / không đủ ETH
  if (
    code === -32000 ||
    errString.includes("-32000") ||
    combinedMsg.includes("insufficient funds") ||
    combinedMsg.includes("gas required exceeds") ||
    combinedMsg.includes("intrinsic gas too low")
  ) {
    return "Ví không đủ ETH để trả phí gas. Vui lòng nạp thêm ETH vào ví.";
  }

  // 3. Sai mạng blockchain
  if (
    code === 4902 ||
    errString.includes("4902") ||
    combinedMsg.includes("unrecognized chain") ||
    combinedMsg.includes("wrong network") ||
    combinedMsg.includes("chain id") ||
    combinedMsg.includes("network changed")
  ) {
    return "Bạn đang ở sai mạng blockchain. Vui lòng chuyển sang Sepolia Testnet.";
  }

  // 4. Lỗi RPC nội bộ / -32603
  if (
    code === -32603 ||
    errString.includes("-32603") ||
    errString.includes("rpc endpoint") ||
    combinedMsg.includes("internal json-rpc") ||
    combinedMsg.includes("internal error") ||
    combinedMsg.includes("execution reverted") ||
    combinedMsg.includes("coalesce")
  ) {
    return "Lỗi từ mạng Blockchain (RPC Error). Mạng đang quá tải hoặc lỗi kết nối, vui lòng thử lại sau hoặc đổi RPC trên MetaMask.";
  }

  // Fallback: trả lại message gốc nếu không khớp
  return err?.message || "Đã xảy ra lỗi khi tương tác với ví. Vui lòng thử lại.";
}

// ─── Lắng nghe sự kiện ví ─────────────────────────────────────────────────
/**
 * Đăng ký lắng nghe 2 sự kiện MetaMask:
 *  - accountsChanged: user đổi sang ví khác
 *  - chainChanged: user đổi mạng blockchain
 *
 * @param {Function} onAccountChange  - callback(newAccounts[]) khi đổi ví
 * @param {Function} onChainChange    - callback(chainId) khi đổi mạng
 * @returns {Function} cleanup — gọi để hủy đăng ký listener
 */
export function setupWalletListeners(onAccountChange, onChainChange) {
  if (typeof window === "undefined" || !window.ethereum) return () => {};

  const handleAccountsChanged = (accounts) => {
    onAccountChange?.(accounts);
  };

  const handleChainChanged = (chainId) => {
    onChainChange?.(chainId);
  };

  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", handleChainChanged);

  // Trả về cleanup function để useEffect có thể gọi khi unmount
  return () => {
    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    window.ethereum.removeListener("chainChanged", handleChainChanged);
  };
}
