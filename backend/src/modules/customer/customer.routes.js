import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getProfile } from "../user/index.js";

const router = Router();

// Demonstrates the generic authorize() pattern for a CUSTOMER-only route.
// 401 if no/invalid token (authenticate), 403 if wrong role (authorize).
router.get(
    "/profile",
    authenticate,
    authorize("CUSTOMER"),
    asyncHandler(async (req, res) => {
        const profile = await getProfile(req.user.id);
        sendSuccess(res, { message: "Customer profile fetched", data: profile });
    })
);

export default router;