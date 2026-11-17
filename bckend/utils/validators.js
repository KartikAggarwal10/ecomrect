
import xss from "xss";
import crypto from "crypto";

import { Types } from "mongoose";
// XSS: strips all HTML
export const cleanText = (v, max = 200) => {
  if (typeof v !== "string") return null;
  const t = xss(v.trim(), { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ["script", "style"] }).slice(0, max);
  return t.length ? t : null;
};
// Type manipulation: only real strings (rejects arrays / {$ne:1})
export const str = (v, max = 100) => (typeof v === "string" && v.trim() && v.length <= max ? v.trim() : null);
export const num = (v, { min = -Infinity, max = Infinity, int = false } = {}) => {
  if (typeof v === "string" && v.trim() !== "") v = Number(v);
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  if (v < min || v > max) return null;
  if (int && !Number.isInteger(v)) return null;
  return v;
};
export const oid = (v) => (typeof v === "string" && /^[a-f\d]{24}$/i.test(v) ? v : null);
export const email_check = (v) => {
  if (typeof v !== "string") return null;
  const e = v.trim().toLowerCase();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
};
export const bool = (v) => (v === true || v === "true" ? true : v === false || v === "false" ? false : null);
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // ReDoS
export const safeUrl = (v) => {
  if (typeof v !== "string" || v.length > 500) return null;
  if (v.startsWith("/uploads/")) return v;
  try { return ["http:", "https:"].includes(new URL(v).protocol) ? v : null; } catch { return null; }
};
export const cleanAddress = (a) => {
  if (typeof a === "string") return cleanText(a, 500);
  if (a && typeof a === "object" && !Array.isArray(a)) {
    const out = {};
    for (const k of Object.keys(a).slice(0, 10)) {
      const val = cleanText(String(a[k] ?? ""), 200);
      if (val) out[cleanText(k, 30) || "field"] = val;
    }
    return Object.keys(out).length ? JSON.stringify(out) : null;
  }
  return null;
};
