import { Router } from "express";
import * as returnController from "./return.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createReturnSchema, rejectReturnSchema } from "./return.validation.js";

const router = Router();

// Customer Return Routes
router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  validate(createReturnSchema),
  returnController.createReturn
);
router.get("/my", authenticate, authorize("CUSTOMER"), returnController.getMyReturns);
router.get("/my/:id", authenticate, authorize("CUSTOMER"), returnController.getMyReturnById);
router.patch("/my/:id/cancel", authenticate, authorize("CUSTOMER"), returnController.cancelMyReturn);

// Seller Return Routes
router.get(
  "/seller",
  authenticate,
  authorize("SELLER"),
  returnController.getSellerReturns
);
router.get(
  "/seller/:id",
  authenticate,
  authorize("SELLER"),
  returnController.getSellerReturnById
);
router.patch(
  "/seller/:id/approve",
  authenticate,
  authorize("SELLER"),
  returnController.approveReturnBySeller
);
router.patch(
  "/seller/:id/reject",
  authenticate,
  authorize("SELLER"),
  validate(rejectReturnSchema),
  returnController.rejectReturnBySeller
);
router.patch(
  "/seller/:id/inspect",
  authenticate,
  authorize("SELLER"),
  returnController.inspectReturnBySeller
);
router.patch(
  "/seller/:id/process-refund",
  authenticate,
  authorize("SELLER", "ADMIN"),
  returnController.processRefund
);

// Delivery Agent Return Pickup Routes
router.get(
  "/delivery/pickups",
  authenticate,
  authorize("DELIVERY_AGENT"),
  returnController.getAvailableReturnPickups
);
router.get(
  "/delivery/mine",
  authenticate,
  authorize("DELIVERY_AGENT"),
  returnController.getMyReturnShipments
);
router.post(
  "/delivery/pickups/:id/accept",
  authenticate,
  authorize("DELIVERY_AGENT"),
  returnController.acceptReturnShipment
);
router.patch(
  "/delivery/pickups/:id/status",
  authenticate,
  authorize("DELIVERY_AGENT"),
  returnController.updateReturnShipmentStatus
);

// Admin Return Oversight Routes
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  returnController.getAllReturnsForAdmin
);
router.get(
  "/admin/refunds",
  authenticate,
  authorize("ADMIN"),
  returnController.getAllRefundsForAdmin
);

export default router;
