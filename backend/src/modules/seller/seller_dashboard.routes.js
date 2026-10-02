import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getSellerDashboardStats } from "../order/order.service.js";

const router = Router();
router.use(authenticate, authorize("SELLER"));

router.get("/dashboard", asyncHandler(async (req, res) => {
    const stats = await getSellerDashboardStats(req.user.id);
    sendSuccess(res, { message: "Seller dashboard fetched", data: stats });
}));

export default router;