import { Router } from "express";
import * as userController from "./user.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from "./user.validation.js";

const router = Router();

// Every route in this module requires a logged-in user
router.use(authenticate);

router.get("/me", userController.getMe);
router.put("/me", validate(updateProfileSchema), userController.updateMe);
router.patch("/me/avatar", upload.single("avatar"), userController.uploadAvatar);

router.get("/me/addresses", userController.getAddresses);
router.post("/me/addresses", validate(createAddressSchema), userController.addAddress);
router.put("/me/addresses/:id", validate(updateAddressSchema), userController.editAddress);
router.delete("/me/addresses/:id", validate(addressIdParamSchema), userController.removeAddress);
router.patch("/me/addresses/:id/default", validate(addressIdParamSchema), userController.markDefaultAddress);

export default router;