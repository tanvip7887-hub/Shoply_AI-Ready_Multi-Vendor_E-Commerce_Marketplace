import express from "express";
import * as inventoryController from "./inventory.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { updateStockSchema, sellerInventoryQuerySchema, adminInventoryQuerySchema } from "./inventory.validation.js";

const router = express.Router();

// Seller Routes
router.use("/seller", authenticate, authorize("SELLER"));

router.get("/seller", validate(sellerInventoryQuerySchema), inventoryController.getSellerInventory);
router.get("/seller/summary", inventoryController.getInventorySummary);
router.get("/seller/:productId", inventoryController.getInventoryDetails);
router.patch("/seller/:productId/stock", validate(updateStockSchema), inventoryController.updateStock);

// Admin Routes
router.use("/admin", authenticate, authorize("ADMIN"));

router.get("/admin", validate(adminInventoryQuerySchema), inventoryController.getAdminInventory);
router.get("/admin/:productId", inventoryController.getInventoryDetails);

export default router;