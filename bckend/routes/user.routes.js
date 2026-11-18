import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getUser, SignUpUser, logout, if_me, refresh } from "../controllers/user.controller.js";
import { authLimiter, refreshLimiter } from "../utils/sanitizers.js";
const router = Router();
router.post("/refresh", refreshLimiter, refresh); 
router.post("/login", authLimiter, getUser);   // login — POST so body is allowed
router.post("/", authLimiter, SignUpUser);      // signup
router.post("/logout", authLimiter, logout);
router.post("/auth/me", if_me);
export default router;