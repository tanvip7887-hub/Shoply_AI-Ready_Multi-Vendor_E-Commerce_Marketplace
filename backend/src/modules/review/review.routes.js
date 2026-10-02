import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import {
  createReviewController,
  getProductReviewsController,
  getOrderReviewStatusController,
  deleteReviewController,
  getSellerReviewsController,
} from "./review.controller.js";

const router = Router();

// Public: GET product reviews
router.get("/products/:productId/reviews", getProductReviewsController);
router.get("/product/:productId", getProductReviewsController);

// Customer Review endpoints
router.post("/", authenticate, createReviewController);
router.get("/orders/:orderId/review-status", authenticate, getOrderReviewStatusController);
router.get("/order/:orderId/status", authenticate, getOrderReviewStatusController);
router.delete("/:id", authenticate, deleteReviewController);

// Seller Reviews endpoint
router.get("/seller/reviews", authenticate, authorize("SELLER"), getSellerReviewsController);
router.get("/seller", authenticate, authorize("SELLER"), getSellerReviewsController);

export default router;
