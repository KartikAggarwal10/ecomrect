import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/refreshToken.js";

const isProd = process.env.NODE_ENV === "production";
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const REFRESH_PATH = process.env.REFRESH_COOKIE_PATH || "/api/user"; // see gotcha 1

const base = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
const accessCookie  = { ...base, path: "/", maxAge: ACCESS_TTL_MS };
const refreshCookie = { ...base, path: REFRESH_PATH, maxAge: REFRESH_TTL_MS };

export const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

export const signAccessToken = (u) =>
  jwt.sign({ userId: String(u._id), email: u.emil, isAdmin: !!u.isdm },
           process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "15m" });

async function issueRefreshToken(u, req, familyId) {
  const raw = crypto.randomBytes(48).toString("base64url"); // opaque, not a JWT
  await RefreshToken.create({
    userId: u._id, familyId, tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent: req.get("user-agent")?.slice(0, 200), ip: req.ip,
  });
  return raw;
}

export async function startSession(u, req, res, familyId = crypto.randomUUID()) {
  res.cookie("access_token", signAccessToken(u), accessCookie);
  res.cookie("refresh_token", await issueRefreshToken(u, req, familyId), refreshCookie);
}

export function clearSession(res) {
  res.clearCookie("access_token", { ...base, path: "/" });
  res.clearCookie("refresh_token", { ...base, path: REFRESH_PATH });
  res.clearCookie("token", { ...base, path: "/" }); // old single-JWT cookie
}