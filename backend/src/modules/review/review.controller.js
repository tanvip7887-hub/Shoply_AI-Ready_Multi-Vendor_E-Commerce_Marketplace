import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import {
  createReview,
  getProductReviews,
  getOrderReviewStatus,
  deleteReview,
  getSellerReviews,
} from "./review.service.js";

export const createReviewController = asyncHandler(async (req, res) => {
  const review = await createReview(req.user.id, req.body);
  sendSuccess(res, {
    message: "Review submitted successfully",
    data: review,
  });
});

export const getProductReviewsController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = await getProductReviews(productId);
  sendSuccess(res, {
    message: "Product reviews fetched successfully",
    data,
  });
});

export const getOrderReviewStatusController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const data = await getOrderReviewStatus(req.user.id, orderId);
  sendSuccess(res, {
    message: "Order review status fetched successfully",
    data,
  });
});

export const deleteReviewController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteReview(req.user.id, id);
  sendSuccess(res, {
    message: "Review deleted successfully",
    data: deleted,
  });
});

export const getSellerReviewsController = asyncHandler(async (req, res) => {
  const data = await getSellerReviews(req.user.id);
  sendSuccess(res, {
    message: "Seller product reviews fetched successfully",
    data,
  });
});
