import { store } from "./store";
import { logout } from "./userdt";

let refreshing = null; // every caller waits on the same refresh

function refreshSession() {
  refreshing ??= fetch("/api/user/refresh", { method: "POST", credentials: "include" })
    .then((r) => r.ok).catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function apiFetch(url, options = {}) {
  const opts = { ...options, credentials: "include" };
  const res = await fetch(url, opts);
  if (res.status !== 401 || url.includes("/user/login") || url.includes("/user/refresh")) return res;

  if (await refreshSession()) return fetch(url, opts); // retry once
  store.dispatch(logout());
  window.location.assign("/login");
  return res;
}