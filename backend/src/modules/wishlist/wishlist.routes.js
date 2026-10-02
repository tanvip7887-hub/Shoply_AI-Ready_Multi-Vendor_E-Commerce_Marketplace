import { Router } from "express";
import * as wishlistController from "./wishlist.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { productIdParamSchema } from "./wishlist.validation.js";

const router = Router();

router.use(authenticate);

router.get("/", wishlistController.getMyWishlist);
router.post("/:productId", validate(productIdParamSchema), wishlistController.add);
router.delete("/:productId", validate(productIdParamSchema), wishlistController.remove);

export default router;