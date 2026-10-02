import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getSellerCustomers, getSellerCustomerById } from "./seller_customer.service.js";

export const getCustomersController = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const result = await getSellerCustomers(req.user.id, { search });
  sendSuccess(res, {
    message: "Seller customers fetched successfully",
    data: result,
  });
});

export const getCustomerDetailsController = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const result = await getSellerCustomerById(req.user.id, customerId);
  sendSuccess(res, {
    message: "Seller customer details fetched successfully",
    data: result,
  });
});
