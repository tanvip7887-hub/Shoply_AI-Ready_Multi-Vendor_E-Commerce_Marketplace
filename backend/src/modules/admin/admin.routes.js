import { Router } from "express";
import * as adminController from "./admin.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  userIdParamSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  sellerIdParamSchema,
  productIdParamSchema,
  productStatusSchema,
  orderIdParamSchema,
  applicationIdParamSchema,
  rejectApplicationSchema,
  sellerQuerySchema,
  customerQuerySchema,
  adminProductQuerySchema,
  rejectProductSchema,
  adminOrderQuerySchema,
} from "./admin.validation.js";
const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", adminController.getDashboard);

router.get("/users", adminController.getUsers);
router.get("/users/:id", validate(userIdParamSchema), adminController.getUserById);
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);
router.patch("/users/:id/status", validate(updateUserStatusSchema), adminController.updateUserStatus);

router.get("/seller-applications/pending", adminController.getPendingApplications);
router.get("/seller-applications", adminController.getApplications);
router.get("/seller-applications/:id", validate(applicationIdParamSchema), adminController.getApplicationById);
router.patch("/seller-applications/:id/approve", validate(applicationIdParamSchema), adminController.approveApplication);
router.patch("/seller-applications/:id/reject", validate(rejectApplicationSchema), adminController.rejectApplication);
router.patch("/sellers/:id/suspend", validate(sellerIdParamSchema), adminController.suspendSeller);
router.patch("/sellers/:id/unsuspend", validate(sellerIdParamSchema), adminController.unsuspendSeller);

router.get("/products", validate(adminProductQuerySchema), adminController.getProducts);
router.patch("/products/:id/status", validate(productStatusSchema), adminController.updateProductStatus);
router.delete("/products/:id", validate(productIdParamSchema), adminController.deleteProduct);
router.patch("/products/:id/approve", validate(productIdParamSchema), adminController.approveProduct);
router.patch("/products/:id/reject", validate(rejectProductSchema), adminController.rejectProduct);

router.get("/sellers", validate(sellerQuerySchema), adminController.getSellers);
router.get("/sellers/:id", validate(sellerIdParamSchema), adminController.getSellerById);
router.get("/customers", validate(customerQuerySchema), adminController.getCustomers);
router.get("/customers/:id", validate(userIdParamSchema), adminController.getCustomerById);

router.get("/orders/stats", adminController.getOrderStats);
router.get("/orders", validate(adminOrderQuerySchema), adminController.getOrders);
router.get("/orders/:id", validate(orderIdParamSchema), adminController.getOrderById);
router.get("/analytics", adminController.getAnalytics);

export default router;