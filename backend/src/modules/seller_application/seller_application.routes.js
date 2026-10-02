import { Router } from "express";
import * as controller from "./seller_application.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import { saveDraftSchema, submitApplicationSchema } from "./seller_application.validation.js";

const router = Router();

router.use(authenticate);

router.post("/draft", validate(saveDraftSchema), controller.saveDraft);
router.post("/submit", validate(submitApplicationSchema), controller.submit);
router.get("/me", controller.getMine);
router.post("/documents", upload.single("document"), controller.uploadDocument);

export default router;