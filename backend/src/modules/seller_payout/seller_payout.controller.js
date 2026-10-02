import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as payoutService from "./seller_payout.service.js";

export const getMine = asyncHandler(async (req, res) => {
    const bankAccount = await payoutService.getMyBankAccount(req.user.id);
    sendSuccess(res, { message: "Bank account fetched", data: bankAccount });
});

export const save = asyncHandler(async (req, res) => {
    const bankAccount = await payoutService.saveBankAccount(req.user.id, req.body);
    sendSuccess(res, { message: "Bank account saved. Payout setup complete.", data: bankAccount });
});

export const getPaymentsOverview = asyncHandler(async (req, res) => {
    const data = await payoutService.getSellerPaymentsSummary(req.user.id, req.query);
    sendSuccess(res, { message: "Seller payments overview fetched", data });
});