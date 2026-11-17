import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getUser, SignUpUser, logout, if_me } from "../controllers/user.controller.js";
import { authLimiter } from "../utils/sanitizers.js";
const router = Router();
router.post("/login", authLimiter, getUser);   // login — POST so body is allowed
router.post("/", authLimiter, SignUpUser);      // signup
router.post("/logout", authLimiter, logout);
router.post("/auth/me", if_me);
export default router;