import { HttpError } from "../utils/HttpError.js";
import multer from "multer";
export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Payload too large" });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ error: "Invalid JSON" });
  if (err.code === 11000) return res.status(409).json({ error: "Duplicate value" });
  if (err.name === "CastError" || err.name === "ValidationError") return res.status(400).json({ error: "Invalid data" });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};