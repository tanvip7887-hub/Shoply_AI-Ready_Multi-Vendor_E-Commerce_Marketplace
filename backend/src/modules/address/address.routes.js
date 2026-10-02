import { Router } from "express";
import * as addressController from "./address.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { addressSchema, addressIdParamSchema } from "./address.validation.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", addressController.getAddresses);
router.post("/", validate(addressSchema), addressController.createAddress);
router.get("/:id", validate(addressIdParamSchema), addressController.getAddress);
router.patch("/:id", validate(addressIdParamSchema), validate(addressSchema), addressController.updateAddress);
router.delete("/:id", validate(addressIdParamSchema), addressController.deleteAddress);
router.patch("/:id/default", validate(addressIdParamSchema), addressController.setDefaultAddress);

export default router;
