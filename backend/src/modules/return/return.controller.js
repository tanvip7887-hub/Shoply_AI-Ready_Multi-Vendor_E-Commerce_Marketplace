import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as returnService from "./return.service.js";

// Customer
export const createReturn = asyncHandler(async (req, res) => {
  const returnReq = await returnService.createReturnRequest(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Return request submitted successfully", data: returnReq });
});

export const getMyReturns = asyncHandler(async (req, res) => {
  const returns = await returnService.getMyReturns(req.user.id);
  sendSuccess(res, { data: returns });
});

export const getMyReturnById = asyncHandler(async (req, res) => {
  const returnReq = await returnService.getReturnByIdForCustomer(req.user.id, req.params.id);
  sendSuccess(res, { data: returnReq });
});

export const cancelMyReturn = asyncHandler(async (req, res) => {
  const returnReq = await returnService.cancelReturnRequest(req.user.id, req.params.id);
  sendSuccess(res, { message: "Return request cancelled", data: returnReq });
});

// Seller
export const getSellerReturns = asyncHandler(async (req, res) => {
  const returns = await returnService.getSellerReturns(req.user.id, req.query);
  sendSuccess(res, { data: returns });
});

export const getSellerReturnById = asyncHandler(async (req, res) => {
  const returnReq = await returnService.getSellerReturnById(req.user.id, req.params.id);
  sendSuccess(res, { data: returnReq });
});

export const approveReturnBySeller = asyncHandler(async (req, res) => {
  const returnReq = await returnService.approveReturnBySeller(req.user.id, req.params.id);
  sendSuccess(res, { message: "Return approved successfully", data: returnReq });
});

export const rejectReturnBySeller = asyncHandler(async (req, res) => {
  const returnReq = await returnService.rejectReturnBySeller(req.user.id, req.params.id, req.body.rejectionReason);
  sendSuccess(res, { message: "Return rejected", data: returnReq });
});

export const inspectReturnBySeller = asyncHandler(async (req, res) => {
  const returnReq = await returnService.inspectReturnBySeller(req.user.id, req.params.id);
  sendSuccess(res, { message: "Inspection completed, refund initiated", data: returnReq });
});

export const processRefund = asyncHandler(async (req, res) => {
  const returnReq = await returnService.processRefundBySellerOrAdmin(req.user.id, req.params.id, req.user.role);
  sendSuccess(res, { message: "Refund completed successfully", data: returnReq });
});

// Delivery Agent
export const getAvailableReturnPickups = asyncHandler(async (req, res) => {
  const pickups = await returnService.getAvailableReturnPickups();
  sendSuccess(res, { data: pickups });
});

export const getMyReturnShipments = asyncHandler(async (req, res) => {
  const shipments = await returnService.getMyReturnShipments(req.user.id);
  sendSuccess(res, { data: shipments });
});

export const acceptReturnShipment = asyncHandler(async (req, res) => {
  const shipment = await returnService.acceptReturnShipment(req.user.id, req.params.id);
  sendSuccess(res, { message: "Return pickup claimed", data: shipment });
});

export const updateReturnShipmentStatus = asyncHandler(async (req, res) => {
  const shipment = await returnService.updateReturnShipmentStatus(req.user.id, req.params.id, req.body.status);
  sendSuccess(res, { message: "Return shipment status updated", data: shipment });
});

// Admin
export const getAllReturnsForAdmin = asyncHandler(async (req, res) => {
  const returns = await returnService.getAllReturnsForAdmin(req.query);
  sendSuccess(res, { data: returns });
});

export const getAllRefundsForAdmin = asyncHandler(async (req, res) => {
  const refunds = await returnService.getAllRefundsForAdmin(req.query);
  sendSuccess(res, { data: refunds });
});
