import { Router } from "express";
import * as orderController from "./order.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  createOrderSchema,
  orderIdParamSchema,
  sellerOrderStatusSchema,
} from "./order.validation.js";

// ---- Customer routes: mounted at /orders ----
const orderRouter = Router();
orderRouter.use(authenticate, authorize("CUSTOMER"));

orderRouter.post("/", validate(createOrderSchema), orderController.create);
orderRouter.get("/", orderController.getMine);
orderRouter.get("/:id", validate(orderIdParamSchema), orderController.getById);
orderRouter.patch("/:id/cancel", validate(orderIdParamSchema), orderController.cancel);

// ---- Seller routes: mounted at /seller/orders ----
const sellerOrderRouter = Router();
sellerOrderRouter.use(authenticate, authorize("SELLER", "ADMIN"));

sellerOrderRouter.get("/", orderController.getSellerOrders);
sellerOrderRouter.get("/dashboard", orderController.getSellerDashboard);
sellerOrderRouter.get("/:id", validate(orderIdParamSchema), orderController.getSellerOrderById);
sellerOrderRouter.patch("/:id/status", validate(sellerOrderStatusSchema), orderController.updateStatusBySeller);

export default orderRouter;
export { sellerOrderRouter };