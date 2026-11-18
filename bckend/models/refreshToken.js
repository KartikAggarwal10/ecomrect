import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  familyId:  { type: String, required: true, index: true },  // one login = one family
  tokenHash: { type: String, required: true, unique: true }, // sha256 of the cookie value
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  userAgent: String,
  ip: String,
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Mongo deletes expired docs
export const RefreshToken = mongoose.model("refreshToken", refreshTokenSchema);