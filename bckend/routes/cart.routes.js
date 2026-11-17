import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../utils/sanitizers.js";
import { add_to_cart, find_cart_by_id, remove_from_cart, update_cart } from "../controllers/cart.controller.js";
const router = Router();
router.get("/id",    authenticate, find_cart_by_id);
router.post("/", authenticate, add_to_cart)
router.post("/removeItem",authenticate,remove_from_cart)
router.post("/update",authenticate,update_cart)
export default router;