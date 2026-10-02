import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getHealth = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});