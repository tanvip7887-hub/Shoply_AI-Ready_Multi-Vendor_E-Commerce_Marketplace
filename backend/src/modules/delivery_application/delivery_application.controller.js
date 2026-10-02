import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./delivery_application.service.js";

export const apply = asyncHandler(async (req, res) => {
  const application = await service.createApplication(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Application submitted successfully", data: application });
});

export const getMyStatus = asyncHandler(async (req, res) => {
  const application = await service.getMyApplication(req.user.id);
  sendSuccess(res, { message: "Current application status", data: application });
});

export const getAll = asyncHandler(async (req, res) => {
  const applications = await service.getAllApplications(req.query.status);
  sendSuccess(res, { message: "Delivery applications fetched", data: applications });
});

export const getById = asyncHandler(async (req, res) => {
  const application = await service.getApplicationById(req.params.id);
  if (req.user.role !== "ADMIN" && application.userId !== req.user.id) {
    const err = new Error("Forbidden: You do not have permission to view this application");
    err.statusCode = 403;
    throw err;
  }
  sendSuccess(res, { message: "Application details", data: application });
});

export const approve = asyncHandler(async (req, res) => {
  const application = await service.approveApplication(req.params.id, req.user.id);
  sendSuccess(res, { message: "Application approved. User promoted to DELIVERY_AGENT.", data: application });
});

export const reject = asyncHandler(async (req, res) => {
  const application = await service.rejectApplication(req.params.id, req.user.id, req.body.rejectionReason);
  sendSuccess(res, { message: "Application rejected.", data: application });
});
