import { Router } from "express";
import * as controller from "./seller_payout.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { bankAccountSchema } from "./seller_payout.validation.js";

const router = Router();
router.use(authenticate, authorize("SELLER"));

router.get("/", controller.getMine);
router.get("/payments", controller.getPaymentsOverview);
router.post("/", validate(bankAccountSchema), controller.save);

export default router;