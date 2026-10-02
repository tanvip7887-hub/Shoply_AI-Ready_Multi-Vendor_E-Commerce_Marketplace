import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as checkoutService from "./checkout.service.js";

export const getCheckout = asyncHandler(async (req, res) => {
  const addressId = req.query.addressId ? parseInt(req.query.addressId, 10) : null;
  const checkoutData = await checkoutService.getCheckoutReview(req.user.id, addressId);
  
  sendSuccess(res, {
    message: "Checkout data fetched",
    data: checkoutData
  });
});
