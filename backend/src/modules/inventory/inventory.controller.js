import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as inventoryService from "./inventory.service.js";

const parseId = (idStr) => {
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    const err = new Error("Invalid ID parameter");
    err.statusCode = 400;
    throw err;
  }
  return id;
};

export const getSellerInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getSellerInventory(req.user.id, req.query);
  sendSuccess(res, { message: "Inventory fetched successfully", data: result });
});

export const getAdminInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getAdminInventory(req.query);
  sendSuccess(res, { message: "Inventory fetched successfully", data: result });
});

export const getInventoryDetails = asyncHandler(async (req, res) => {
  const productId = parseId(req.params.productId);
  const result = await inventoryService.getInventoryDetails(productId, req.user);
  sendSuccess(res, { message: "Inventory details fetched", data: result });
});

export const updateStock = asyncHandler(async (req, res) => {
  const productId = parseId(req.params.productId);
  const result = await inventoryService.updateStock(productId, req.user, req.body);
  sendSuccess(res, { message: "Stock updated successfully", data: result });
});

export const getInventorySummary = asyncHandler(async (req, res) => {
  const result = await inventoryService.getInventorySummary(req.user.id);
  sendSuccess(res, { message: "Inventory summary fetched", data: result });
});