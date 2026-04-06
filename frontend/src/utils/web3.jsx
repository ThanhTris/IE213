export async function connectMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install/enable MetaMask.");
  }

  // Request accounts from the injected provider (MetaMask).
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("No wallet accounts found.");
  }
  return accounts[0];
}

export function isValidWalletAddress(address = "") {
  const v = String(address).trim();
  return /^0x[a-fA-F0-9]{40}$/.test(v);
}

