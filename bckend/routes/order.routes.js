import { Router } from "express";
import { adminOnly, authenticate } from "../middleware/auth.js";
import { authLimiter } from "../utils/sanitizers.js";
import { add_order, get_orders, order_for_admin , admin_update_order, order_for_mcp, get_orders_for_mcp, get_all_orders,change_order_by_admin_mcp} from "../controllers/order.controller.js";
const router = Router()
router.get("/" , authenticate,get_orders)
router.post("/", authenticate,  add_order)
router.get("/for_admin", authenticate,adminOnly, order_for_admin)
router.post("/admin_update",authenticate,adminOnly,admin_update_order)
router.post("/create_order_for_mcps",order_for_mcp)
router.get("/:id/:user",get_orders_for_mcp)
router.get("/get_all_orders_for_mcp",get_all_orders)
router.post("/change_order_by_admin_mcp",change_order_by_admin_mcp)
export default router;
