import jwt from "jsonwebtoken";

// Read the secret when verifying, not at import time. Pinning the algorithm
// stops tokens signed with a different algorithm from being accepted.
const verifyAccess = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

// Never rejects: sets req.user if the access cookie is valid, else stays anonymous
export const optionalAuthenticate = (req, _res, next) => {
  const token = req.cookies?.access_token;
  if (token) {
    try {
      req.user = verifyAccess(token);
    } catch {
      // Expired or invalid: browsing stays available, just not personalised
    }
  }
  next();
};

export const authenticate = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
};