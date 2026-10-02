import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as categoryService from "./category.service.js";

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, { statusCode: 201, message: "Category created", data: category });
});

export const getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.query);
  sendSuccess(res, { message: "Categories fetched", data: categories });
});

export const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  sendSuccess(res, { message: "Category fetched", data: category });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  sendSuccess(res, { message: "Category fetched", data: category });
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, { message: "Category updated", data: category });
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, { message: "Category deleted" });
});