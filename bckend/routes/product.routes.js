import { Router } from "express";
import { adminOnly, authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { authLimiter } from "../utils/sanitizers.js";
import { add_product, see_products, update_product ,see_particular_product, add_product_mcp, see_products_mcp,see_products_to_admin_by_by_him} from "../controllers/product.controller.js";
const router = Router();
router.post("/update",authenticate,adminOnly,update_product)
router.get("/", optionalAuthenticate, see_products)
router.post("/upload",authenticate,adminOnly, upload.array("img",5) ,add_product)
router.get("/single_post:id",see_particular_product)
router.post("/add_product_mcp",add_product_mcp)
router.get("/see_products_mcp",see_products_mcp)
router.get("/give_products_made_by_admin",authenticate,adminOnly,see_products_to_admin_by_by_him)
export default router
