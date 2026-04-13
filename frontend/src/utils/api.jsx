function resolveApiRoot() {
  const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!configured) return "/api";

  const withoutTrailingSlash = configured.replace(/\/+$/, "");
  return /\/api$/i.test(withoutTrailingSlash)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export const API_ROOT = resolveApiRoot();

export async function apiPostUserAuth(payload) {
  const res = await fetch(`${API_ROOT}/users/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

export async function apiGetMyProfile(token) {
  const res = await fetch(`${API_ROOT}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

export async function apiUpdateMyProfile(token, payload) {
  const res = await fetch(`${API_ROOT}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}
