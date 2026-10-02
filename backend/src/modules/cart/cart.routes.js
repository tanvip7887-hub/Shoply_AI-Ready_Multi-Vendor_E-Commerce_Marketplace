import { Router } from "express";
import * as cartController from "./cart.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
} from "./cart.validation.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", cartController.getMyCart);
router.delete("/", cartController.clear);
router.post("/items", validate(addCartItemSchema), cartController.addItem);
router.patch("/items/:id", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:id", validate(cartItemIdParamSchema), cartController.removeItem);

export default router;