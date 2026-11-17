
import multer from "multer";
import { HttpError } from "../utils/HttpError.js";

const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage: multer.memoryStorage(), // Keeps file in memory (req.files[i].buffer)
  limits: { fileSize: 2 * 1024 * 1024, files: 5 }, // 2MB max per image, up to 5 images
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new HttpError(400, "Only JPEG, PNG, and WEBP images are allowed"));
    }
  },
});
