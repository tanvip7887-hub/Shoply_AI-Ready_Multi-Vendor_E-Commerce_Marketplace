import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as wishlistService from "./wishlist.service.js";

export const add = asyncHandler(async (req, res) => {
  const item = await wishlistService.addToWishlist(req.user.id, req.params.productId);
  sendSuccess(res, { statusCode: 201, message: "Added to wishlist", data: item });
});

export const getMyWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.getWishlist(req.user.id);
  sendSuccess(res, { message: "Wishlist fetched", data: items });
});

export const remove = asyncHandler(async (req, res) => {
  await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
  sendSuccess(res, { message: "Removed from wishlist" });
});