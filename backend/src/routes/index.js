import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "../modules/auth/index.js";
import userRoutes from "../modules/user/index.js";
import categoryRoutes from "../modules/category/index.js";
import brandRoutes from "../modules/brand/index.js";
import productRoutes from "../modules/product/index.js";
import inventoryRoutes from "../modules/inventory/index.js";
import cartRoutes from "../modules/cart/index.js";
import wishlistRoutes from "../modules/wishlist/index.js";
import addressRoutes from "../modules/address/index.js";
import checkoutRoutes from "../modules/checkout/index.js";
import orderRoutes, { sellerOrderRouter } from "../modules/order/index.js";
import paymentRoutes from "../modules/payment/index.js";
import adminRoutes from "../modules/admin/index.js";
import sellerApplicationRoutes from "../modules/seller_application/index.js";
import sellerDashboardRoutes from "../modules/seller/seller_dashboard.routes.js";
import sellerPayoutRoutes from "../modules/seller_payout/index.js";
import sellerProfileRoutes from "../modules/seller/seller_profile.routes.js";
import sellerCustomerRoutes from "../modules/seller/seller_customer.routes.js";
import deliveryRoutes from "../modules/delivery/index.js";
import deliveryApplicationRoutes from "../modules/delivery_application/index.js";
import notificationRoutes from "../modules/notification/notification.routes.js";
import reviewRoutes from "../modules/review/review.routes.js";
import returnRoutes from "../modules/return/return.routes.js";
import {
  getProductReviewsController,
  getOrderReviewStatusController,
  getSellerReviewsController,
} from "../modules/review/review.controller.js";
import authenticate from "../middleware/authenticate.middleware.js";
import authorize from "../middleware/authorize.middleware.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/seller/orders", sellerOrderRouter);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.get("/products/:productId/reviews", getProductReviewsController);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", addressRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/wishlist", wishlistRoutes);
router.get("/orders/:orderId/review-status", authenticate, getOrderReviewStatusController);
router.use("/orders", orderRoutes);
router.use("/returns", returnRoutes);
router.use("/payment", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/seller-applications", sellerApplicationRoutes);
router.use("/delivery-applications", deliveryApplicationRoutes);
router.use("/seller", sellerDashboardRoutes);
router.use("/seller/payout", sellerPayoutRoutes);
router.use("/seller/profile", sellerProfileRoutes);
router.use("/seller/customers", sellerCustomerRoutes);
router.get("/seller/reviews", authenticate, authorize("SELLER"), getSellerReviewsController);
router.use("/delivery", deliveryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reviews", reviewRoutes);

export default router;