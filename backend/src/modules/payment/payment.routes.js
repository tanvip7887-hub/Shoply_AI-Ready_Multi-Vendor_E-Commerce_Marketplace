import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const paymentRouter = Router();

// All payment routes require customer authentication
paymentRouter.use(authenticate, authorize("CUSTOMER"));

paymentRouter.post("/create-mock", paymentController.createMockPayment);
paymentRouter.post("/verify-mock", paymentController.verifyMockPayment);

export default paymentRouter;
