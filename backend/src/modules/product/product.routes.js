import { Router } from "express";
import * as productController from "./product.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productSlugParamSchema,
  productStatusSchema,
  productQuerySchema,
  sellerProductQuerySchema,
} from "./product.validation.js";

const router = Router();

// Public
router.get("/", validate(productQuerySchema), productController.getAll);
router.get("/slug/:slug", validate(productSlugParamSchema), productController.getBySlug);

// Seller — own products list (must come before /:id)
router.get("/me", authenticate, authorize("SELLER", "ADMIN"), validate(sellerProductQuerySchema), productController.getMine);
router.get("/:id", validate(productIdParamSchema), productController.getById);

// Seller/Admin — create, update, delete, status, images
router.post("/", authenticate, authorize("SELLER", "ADMIN"), validate(createProductSchema), productController.create);
router.put("/:id", authenticate, authorize("SELLER", "ADMIN"), validate(updateProductSchema), productController.update);
router.patch("/:id/status", authenticate, authorize("SELLER", "ADMIN"), validate(productStatusSchema), productController.updateStatus);
router.delete("/:id", authenticate, authorize("SELLER", "ADMIN"), validate(productIdParamSchema), productController.remove);

router.post("/:id/images", authenticate, authorize("SELLER", "ADMIN"), upload.array("images", 5), productController.addImages);
router.delete("/:id/images/:imageId", authenticate, authorize("SELLER", "ADMIN"), productController.removeImage);
router.put("/:id/images/reorder", authenticate, authorize("SELLER", "ADMIN"), productController.reorderImages);

export default router;