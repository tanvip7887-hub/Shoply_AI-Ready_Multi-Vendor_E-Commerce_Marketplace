import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as brandService from "./brand.service.js";

export const create = asyncHandler(async (req, res) => {
  const brand = await brandService.createBrand(req.body);
  sendSuccess(res, { statusCode: 201, message: "Brand created", data: brand });
});

export const getAll = asyncHandler(async (req, res) => {
  const brands = await brandService.getAllBrands(req.query);
  sendSuccess(res, { message: "Brands fetched", data: brands });
});

export const getById = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandById(req.params.id);
  sendSuccess(res, { message: "Brand fetched", data: brand });
});

export const update = asyncHandler(async (req, res) => {
  const brand = await brandService.updateBrand(req.params.id, req.body);
  sendSuccess(res, { message: "Brand updated", data: brand });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const brand = await brandService.setBrandStatus(req.params.id, req.body.isActive);
  sendSuccess(res, { message: "Brand status updated", data: brand });
});

export const remove = asyncHandler(async (req, res) => {
  await brandService.deleteBrand(req.params.id);
  sendSuccess(res, { message: "Brand deleted" });
});