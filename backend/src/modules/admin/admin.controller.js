import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as adminService from "./admin.service.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, { message: "Dashboard stats fetched", data: stats });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers(req.query);
  sendSuccess(res, { message: "Users fetched", data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  sendSuccess(res, { message: "User fetched", data: user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(req.user.id, req.params.id, req.body.role);
  sendSuccess(res, { message: "User role updated", data: user });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.user.id, req.params.id, req.body.status);
  sendSuccess(res, { message: "User status updated", data: user });
});

export const getPendingApplications = asyncHandler(async (req, res) => {
  const applications = await adminService.getPendingApplications();
  sendSuccess(res, { message: "Pending applications fetched", data: applications });
});

export const getApplications = asyncHandler(async (req, res) => {
  const applications = await adminService.getAllApplications(req.query);
  sendSuccess(res, { message: "Applications fetched", data: applications });
});

export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await adminService.getApplicationById(req.params.id);
  sendSuccess(res, { message: "Application fetched", data: application });
});

export const approveApplication = asyncHandler(async (req, res) => {
  const seller = await adminService.approveApplication(req.user.id, req.params.id);
  sendSuccess(res, { message: "Application approved, seller activated", data: seller });
});

export const rejectApplication = asyncHandler(async (req, res) => {
  const application = await adminService.rejectApplication(req.user.id, req.params.id, req.body.reason);
  sendSuccess(res, { message: "Application rejected", data: application });
});


export const suspendSeller = asyncHandler(async (req, res) => {
  const seller = await adminService.suspendSeller(req.user.id, req.params.id);
  sendSuccess(res, { message: "Seller suspended", data: seller });
});

export const unsuspendSeller = asyncHandler(async (req, res) => {
  const seller = await adminService.unsuspendSeller(req.user.id, req.params.id);
  sendSuccess(res, { message: "Seller unsuspended", data: seller });
});

export const getProducts = asyncHandler(async (req, res) => {
  const products = await adminService.getAllProductsForAdmin(req.query);
  sendSuccess(res, { message: "Products fetched", data: products });
});

export const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await adminService.updateProductStatusByAdmin(req.user.id, req.params.id, req.body.isActive);
  sendSuccess(res, { message: "Product status updated", data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await adminService.softDeleteProduct(req.user.id, req.params.id);
  sendSuccess(res, { message: "Product deleted" });
});

export const approveProduct = asyncHandler(async (req, res) => {
  const product = await adminService.approveProduct(req.user.id, req.params.id);
  sendSuccess(res, { message: "Product approved", data: product });
});

export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await adminService.rejectProduct(req.user.id, req.params.id, req.body.reason);
  sendSuccess(res, { message: "Product rejected", data: product });
});

export const getOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getAllOrdersForAdmin(req.query);
  sendSuccess(res, { message: "Orders fetched", data: result });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await adminService.getOrderByIdForAdmin(req.params.id);
  sendSuccess(res, { message: "Order fetched", data: order });
});

export const getSellers = asyncHandler(async (req, res) => {
  const sellers = await adminService.getAllSellersForAdmin(req.query);
  sendSuccess(res, { message: "Sellers fetched", data: sellers });
});

export const getSellerById = asyncHandler(async (req, res) => {
  const seller = await adminService.getSellerByIdForAdmin(req.params.id);
  sendSuccess(res, { message: "Seller fetched", data: seller });
});

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await adminService.getAllCustomers(req.query);
  sendSuccess(res, { message: "Customers fetched", data: customers });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await adminService.getCustomerByIdForAdmin(req.params.id);
  sendSuccess(res, { message: "Customer fetched", data: customer });
});

export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getOrderStatsForAdmin();
  sendSuccess(res, { message: "Order stats fetched", data: stats });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalyticsForAdmin();
  sendSuccess(res, { message: "Analytics fetched", data: analytics });
});