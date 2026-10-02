import { Router } from "express";
import * as brandController from "./brand.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  createBrandSchema,
  updateBrandSchema,
  brandIdParamSchema,
  brandStatusSchema,
} from "./brand.validation.js";

const router = Router();

// Public
router.get("/", brandController.getAll);
router.get("/:id", validate(brandIdParamSchema), brandController.getById);

// Admin only
router.post("/", authenticate, authorize("ADMIN"), validate(createBrandSchema), brandController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateBrandSchema), brandController.update);
router.patch("/:id/status", authenticate, authorize("ADMIN"), validate(brandStatusSchema), brandController.updateStatus);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(brandIdParamSchema), brandController.remove);

export default router;