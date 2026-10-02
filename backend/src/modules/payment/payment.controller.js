import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as paymentService from "./payment.service.js";

export const createMockPayment = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;
  const paymentDetails = await paymentService.createMockPayment(req.user.id, orderIds);
  sendSuccess(res, { statusCode: 200, message: "Mock payment created", data: paymentDetails });
});

export const verifyMockPayment = asyncHandler(async (req, res) => {
  const { paymentReference, status } = req.body; // status should be "SUCCESS" or "FAILURE"
  const updatedOrders = await paymentService.verifyMockPayment(req.user.id, paymentReference, status);
  sendSuccess(res, { statusCode: 200, message: "Mock payment verified", data: updatedOrders });
});
