import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as productService from "./product.service.js";

const parseId = (idStr) => {
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    const err = new Error("Invalid ID parameter");
    err.statusCode = 400;
    throw err;
  }
  return id;
};

export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Product created", data: product });
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  sendSuccess(res, { message: "Products fetched", data: result });
});

export const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(parseId(req.params.id));
  sendSuccess(res, { message: "Product fetched", data: product });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  sendSuccess(res, { message: "Product fetched", data: product });
});

export const getMine = asyncHandler(async (req, res) => {
  const result = await productService.getMyProducts(req.user.id, req.query);
  sendSuccess(res, { message: "Your products fetched", data: result });
});

export const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(parseId(req.params.id), req.user, req.body);
  sendSuccess(res, { message: "Product updated", data: product });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const product = await productService.setProductStatus(parseId(req.params.id), req.user, req.body.isActive);
  sendSuccess(res, { message: "Product status updated", data: product });
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(parseId(req.params.id), req.user);
  sendSuccess(res, { message: "Product deleted" });
});

export const addImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    const err = new Error("No image files provided");
    err.statusCode = 400;
    throw err;
  }
  const product = await productService.addProductImages(parseId(req.params.id), req.user, req.files);
  sendSuccess(res, { message: "Images added", data: product });
});

export const removeImage = asyncHandler(async (req, res) => {
  await productService.deleteProductImage(parseId(req.params.id), parseId(req.params.imageId), req.user);
  sendSuccess(res, { message: "Image removed" });
});

export const reorderImages = asyncHandler(async (req, res) => {
  const { imageIds } = req.body;
  if (!Array.isArray(imageIds)) {
    const err = new Error("imageIds must be an array");
    err.statusCode = 400;
    throw err;
  }
  // Coerce imageIds to Int as well since they might be passed as strings from frontend
  const parsedImageIds = imageIds.map(parseId);
  const product = await productService.reorderProductImages(parseId(req.params.id), req.user, parsedImageIds);
  sendSuccess(res, { message: "Images reordered", data: product });
});