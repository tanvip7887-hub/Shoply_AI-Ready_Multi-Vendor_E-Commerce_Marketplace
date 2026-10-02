import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as deliveryService from "./delivery.service.js";

export const getAvailablePickups = asyncHandler(async (req, res) => {
  const shipments = await deliveryService.getAvailablePickups();
  sendSuccess(res, { message: "Available pickup shipments", data: shipments });
});

export const getMyShipments = asyncHandler(async (req, res) => {
  const shipments = await deliveryService.getMyShipments(req.user.id, req.query.status);
  sendSuccess(res, { message: "My assigned shipments", data: shipments });
});

export const getShipmentById = asyncHandler(async (req, res) => {
  const shipment = await deliveryService.getShipmentById(req.user.id, req.params.id);
  sendSuccess(res, { message: "Shipment details", data: shipment });
});

export const acceptShipment = asyncHandler(async (req, res) => {
  const shipment = await deliveryService.acceptShipment(req.user.id, req.params.id);
  sendSuccess(res, { message: "Shipment accepted successfully", data: shipment });
});

export const updateShipmentStatus = asyncHandler(async (req, res) => {
  const shipment = await deliveryService.updateShipmentStatus(req.user.id, req.params.id, req.body.shipmentStatus);
  sendSuccess(res, { message: "Shipment status updated successfully", data: shipment });
});
