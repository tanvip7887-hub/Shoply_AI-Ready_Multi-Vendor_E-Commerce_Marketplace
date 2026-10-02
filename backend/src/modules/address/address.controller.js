import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as addressService from "./address.service.js";

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  sendSuccess(res, { message: "Addresses fetched successfully", data: addresses });
});

export const getAddress = asyncHandler(async (req, res) => {
  const address = await addressService.getAddressById(req.user.id, parseInt(req.params.id, 10));
  sendSuccess(res, { message: "Address fetched successfully", data: address });
});

export const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Address created successfully", data: address });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, parseInt(req.params.id, 10), req.body);
  sendSuccess(res, { message: "Address updated successfully", data: address });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.user.id, parseInt(req.params.id, 10));
  sendSuccess(res, { message: "Address deleted successfully" });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user.id, parseInt(req.params.id, 10));
  sendSuccess(res, { message: "Default address updated successfully", data: address });
});
