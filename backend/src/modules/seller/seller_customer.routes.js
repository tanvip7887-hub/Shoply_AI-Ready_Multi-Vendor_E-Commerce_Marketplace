import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import {
  getCustomersController,
  getCustomerDetailsController,
} from "./seller_customer.controller.js";

const router = Router();

router.use(authenticate, authorize("SELLER"));

router.get("/", getCustomersController);
router.get("/:customerId", getCustomerDetailsController);

export default router;
