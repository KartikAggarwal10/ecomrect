import { email_check,cleanText } from "../utils/validators.js";
import { HttpError } from "../utils/HttpError.js";
import { user } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { wrap } from "../middleware/asyncHandler.js";
import { clearSession, sha256, startSession } from "../utils/tokens.js";
import { RefreshToken } from "../models/refreshToken.js";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set (32+ chars)");
  process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

// Safe user shape returned to the client
const publicUser = (u) => ({
  id: String(u._id),
  name: u.nme,
  email: u.emil,
  isAdmin: !!u.isdm,
  user_name: u.user_name,
});
export const getUser = wrap(async (req, res) => {
    const emil = email_check(req.body.emil);
    const psswrd = typeof req.body.psswrd === "string" && req.body.psswrd.length <= 72 ? req.body.psswrd : null;
    if (!emil || !psswrd) throw new HttpError(400, "Email and password are required");
    const existingUser = await user.findOne({ emil });
    const ok = await bcrypt.compare(psswrd, existingUser ? existingUser.psswrd : DUMMY_HASH);
    if (!existingUser || !ok) throw new HttpError(401, "Invalid email or password");
    await startSession(existingUser, req, res);
    res.json({ success: true, user: publicUser(existingUser) });
});

const GRACE_MS = 10_000; // two tabs refreshing at once is not an attack

export const refresh = wrap(async (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (!raw) throw new HttpError(401, "No refresh token");

  const stored = await RefreshToken.findOne({ tokenHash: sha256(raw) });
  if (!stored || stored.expiresAt < new Date()) { clearSession(res); throw new HttpError(401, "Session expired"); }

  if (stored.revokedAt) {            // an already-rotated token was replayed
    if (Date.now() - stored.revokedAt.getTime() > GRACE_MS) {
      await RefreshToken.updateMany({ familyId: stored.familyId, revokedAt: null }, { revokedAt: new Date() });
      clearSession(res);
    }
    throw new HttpError(401, "Session expired");
  }

  // atomic rotate: only one request can flip revokedAt from null
  const rotated = await RefreshToken.findOneAndUpdate({ _id: stored._id, revokedAt: null }, { revokedAt: new Date() });
  if (!rotated) throw new HttpError(401, "Session expired");

  const u = await user.findById(stored.userId);   // fresh role/email from the DB
  if (!u) { clearSession(res); throw new HttpError(401, "Session expired"); }

  await startSession(u, req, res, stored.familyId);
  res.json({ success: true, user: publicUser(u) });
});

export const logout = wrap(async (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (raw) {
    const t = await RefreshToken.findOne({ tokenHash: sha256(raw) });
    if (t) await RefreshToken.deleteMany({ familyId: t.familyId });
  }
  clearSession(res);
  res.json({ success: true });
});

export const SignUpUser = wrap(async (req, res) => {
    console.log("user signup entered")
    const nme = cleanText(req.body.nme, 60);
      const emil = email_check(req.body.emil);
      const psswrd = req.body.psswrd;
      if (!nme || !emil || typeof psswrd !== "string") throw new HttpError(400, "Valid name, email and password required");
      if (psswrd.length < 8 || psswrd.length > 72) throw new HttpError(400, "Password must be 8-72 characters");
            const existingUser = await user.findOne({ emil });
    
            if (existingUser) {
                return res.status(409).json({
                    error: "User with same email already exists"
                });
            }
    
            const hashedPassword = await bcrypt.hash(psswrd, 12);
    
             const newUser = new user({ nme, user_name: nme, psswrd: hashedPassword, emil, isdm: false }); // was Boolean(isdm)
             await newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    
})

export const if_me = wrap(async (req, res) => {

    const existingUser = await user.findById(
        req.user.userId
    ).select("-psswrd");

    if (!existingUser) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    res.json({
        success: true,
        user: existingUser
    });
})