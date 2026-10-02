import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import * as validation from "./delivery_application.validation.js";
import * as controller from "./delivery_application.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(validation.applyDeliveryPartnerSchema), controller.apply);
router.get("/mine", controller.getMyStatus);
router.get("/", authorize("ADMIN"), controller.getAll);
router.get("/:id", controller.getById);
router.patch("/:id/approve", authorize("ADMIN"), controller.approve);
router.patch("/:id/reject", authorize("ADMIN"), validate(validation.rejectDeliveryApplicationSchema), controller.reject);

export default router;
