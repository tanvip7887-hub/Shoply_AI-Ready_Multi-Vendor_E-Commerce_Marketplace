import { Router } from "express";
import * as checkoutController from "./checkout.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = Router();

// All checkout routes require customer authentication
router.use(authenticate, authorize("CUSTOMER"));

router.get("/", checkoutController.getCheckout);

export default router;
