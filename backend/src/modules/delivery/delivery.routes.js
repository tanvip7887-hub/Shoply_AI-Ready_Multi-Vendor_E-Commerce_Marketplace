import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import * as deliveryController from "./delivery.controller.js";
import { shipmentIdParamSchema, updateShipmentStatusSchema } from "./delivery.validation.js";

const router = Router();

// Require DELIVERY_AGENT role for all delivery endpoints
router.use(authenticate, authorize("DELIVERY_AGENT"));

router.get("/available", deliveryController.getAvailablePickups);
router.get("/mine", deliveryController.getMyShipments);
router.get("/:id", validate(shipmentIdParamSchema), deliveryController.getShipmentById);
router.post("/:id/accept", validate(shipmentIdParamSchema), deliveryController.acceptShipment);
router.patch("/:id/status", validate(updateShipmentStatusSchema), deliveryController.updateShipmentStatus);

export default router;
