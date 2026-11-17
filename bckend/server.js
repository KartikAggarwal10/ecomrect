import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import "./config/db.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRouter from "./routes/user.routes.js";
import cartRouter from "./routes/cart.routes.js";
import favouriteRoute from "./routes/favourite.routes.js";
import orderRoute from "./routes/order.routes.js";
import productRouter from "./routes/product.routes.js";
import { HttpError } from "./utils/HttpError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "node:fs/promises";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set (32+ chars)");
  process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
app.disable("x-powered-by");
if (isProd) app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new HttpError(403, "Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Basic CSRF protection (origin check on mutating methods) ────────────────
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const o = req.get("origin");
  if (o && !allowedOrigins.includes(o))
    return res.status(403).json({ error: "Forbidden origin" });
  next();
});

// ── Rate limiting ───────────────────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ── Body parsers ────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ── MongoDB operator injection sanitizer ─────────────────────────────────────
// express-mongo-sanitize@2.2.0 is incompatible with Express 5 (req.query is
// read-only). This inline sanitizer achieves the same protection without
// touching req.query directly.
function stripMongoOperators(value, replaceWith = "_") {
  if (Array.isArray(value)) return value.map((v) => stripMongoOperators(v, replaceWith));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k.replace(/^\$/, replaceWith),
        stripMongoOperators(v, replaceWith),
      ])
    );
  }
  return value;
}

app.use((req, _res, next) => {
  if (req.body) req.body = stripMongoOperators(req.body);
  // req.query is read-only in Express 5 — sanitize a shadow copy instead
  if (req.query) req.sanitizedQuery = stripMongoOperators({ ...req.query });
  if (req.params) req.params = stripMongoOperators(req.params);
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/user", userRouter);
app.use("/favorite", favouriteRoute);
app.use("/order", orderRoute);

// ── 404 catch-all ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

app.listen(5000, () => console.log("Backend running on port 5000"));