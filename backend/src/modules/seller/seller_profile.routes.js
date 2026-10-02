import { Router } from "express";
import * as controller from "./seller_profile.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import { updateSellerProfileSchema } from "./seller_profile.validation.js";

const router = Router();
router.use(authenticate, authorize("SELLER"));

router.get("/", controller.getProfile);
router.put("/", validate(updateSellerProfileSchema), controller.updateProfile);
router.patch("/avatar", upload.single("avatar"), controller.uploadAvatar);

export default router;