const AUTH_TOKEN_KEY = "bw_auth_token";

export function decodeJwtPayload(token = "") {
  const parts = String(token).split(".");
  if (parts.length < 2) return null;
  try {
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadB64.padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

export function getAuthFromToken(token = "") {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const walletAddress = payload.walletAddress || payload.sub || "";
  const role = payload.role || "";
  if (!walletAddress || !role) return null;
  return {
    token,
    walletAddress: String(walletAddress),
    role: String(role),
    userId: payload.userId ? String(payload.userId) : undefined,
  };
}

export function loadAuthFromStorage() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    return getAuthFromToken(token);
  } catch (_e) {
    return null;
  }
}

export function persistAuthToken(token = "") {
  if (!token) return null;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return loadAuthFromStorage();
  } catch (_e) {
    return getAuthFromToken(token);
  }
}

export function clearAuthStorage() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (_e) {
    // ignore
  }
}

export function shortAddress(address = "", head = 6, tail = 4) {
  const addr = String(address);
  if (!addr) return "";
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

