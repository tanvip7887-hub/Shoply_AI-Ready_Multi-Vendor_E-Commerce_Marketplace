import { Router } from "express";
import * as categoryController from "./category.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
} from "./category.validation.js";

const router = Router();

// Public routes — anyone can browse categories, no login required
router.get("/", categoryController.getAll);
router.get("/slug/:slug", validate(categorySlugParamSchema), categoryController.getBySlug);
router.get("/:id", validate(categoryIdParamSchema), categoryController.getById);

// Admin-only routes — creation/modification of the catalog structure
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateCategorySchema), categoryController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(categoryIdParamSchema), categoryController.remove);

export default router;