import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as cartService from "./cart.service.js";

export const addItem = asyncHandler(async (req, res) => {
  const item = await cartService.addItemToCart(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Item added to cart", data: item });
});

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  sendSuccess(res, { message: "Cart fetched", data: cart });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await cartService.updateCartItem(req.user.id, req.params.id, req.body.quantity);
  sendSuccess(res, { message: "Cart item updated", data: item });
});

export const removeItem = asyncHandler(async (req, res) => {
  await cartService.removeCartItem(req.user.id, req.params.id);
  sendSuccess(res, { message: "Item removed from cart" });
});

export const clear = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  sendSuccess(res, { message: "Cart cleared" });
});