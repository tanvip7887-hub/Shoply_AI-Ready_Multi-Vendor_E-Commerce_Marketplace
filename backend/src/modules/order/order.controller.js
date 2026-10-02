import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as orderService from "./order.service.js";

export const create = asyncHandler(async (req, res) => {
  const orders = await orderService.createOrder(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Order placed successfully", data: orders });
});

export const getMine = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  sendSuccess(res, { message: "Orders fetched", data: orders });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.getMyOrderById(req.user.id, req.params.id);
  sendSuccess(res, { message: "Order fetched", data: order });
});

export const cancel = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  sendSuccess(res, { message: "Order cancelled", data: order });
});

export const getSellerOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const orders = await orderService.getSellerOrders(req.user.id, { status });
  sendSuccess(res, { message: "Seller orders fetched", data: orders });
});

export const getSellerOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getSellerOrderById(req.user.id, req.params.id);
  sendSuccess(res, { message: "Seller order fetched", data: order });
});

export const updateStatusBySeller = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatusBySeller(req.user.id, req.params.id, req.body.orderStatus);
  sendSuccess(res, { message: "Order status updated", data: order });
});

export const getSellerDashboard = asyncHandler(async (req, res) => {
  const stats = await orderService.getSellerDashboardStats(req.user.id);
  sendSuccess(res, { message: "Seller dashboard fetched", data: stats });
});