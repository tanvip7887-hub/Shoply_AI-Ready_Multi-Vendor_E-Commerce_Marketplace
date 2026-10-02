import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  sendSuccess(res, { message: "Profile fetched", data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  sendSuccess(res, { message: "Profile updated", data: user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error("No image file provided");
    err.statusCode = 400;
    throw err;
  }
  const user = await userService.updateAvatar(req.user.id, req.file.buffer);
  sendSuccess(res, { message: "Profile picture updated", data: user });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.listAddresses(req.user.id);
  sendSuccess(res, { message: "Addresses fetched", data: addresses });
});

export const addAddress = asyncHandler(async (req, res) => {
  const address = await userService.createAddress(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Address added", data: address });
});

export const editAddress = asyncHandler(async (req, res) => {
  const address = await userService.updateAddress(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Address updated", data: address });
});

export const removeAddress = asyncHandler(async (req, res) => {
  await userService.deleteAddress(req.user.id, req.params.id);
  sendSuccess(res, { message: "Address deleted" });
});

export const markDefaultAddress = asyncHandler(async (req, res) => {
  await userService.setDefaultAddress(req.user.id, req.params.id);
  sendSuccess(res, { message: "Default address updated" });
});