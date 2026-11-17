import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../utils/sanitizers.js";
import { add_to_favourite, get_favourite, remove_from_favourite } from "../controllers/favourite.controller.js";
const router = Router();
router.get("/", authenticate,  get_favourite)
router.post("/",authenticate,add_to_favourite)
router.post("/remove",authenticate,remove_from_favourite)
export default router