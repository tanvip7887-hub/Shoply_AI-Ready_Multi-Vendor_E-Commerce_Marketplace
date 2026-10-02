import axiosClient from "./axiosClient.js";
import { categoryApi } from "./category.api.js";

export const adminApi = {
  getDashboard: () => axiosClient.get("/admin/dashboard"),

  getPendingApplications: () => axiosClient.get("/admin/seller-applications/pending"),
  getApplications: (params) => axiosClient.get("/admin/seller-applications", { params }),
  getApplicationById: (id) => axiosClient.get(`/admin/seller-applications/${id}`),
  approveApplication: (id) => axiosClient.patch(`/admin/seller-applications/${id}/approve`),
  rejectApplication: (id, reason) => axiosClient.patch(`/admin/seller-applications/${id}/reject`, { reason }),

  getUsers: (params) => axiosClient.get("/admin/users", { params }),
  getUserById: (id) => axiosClient.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => axiosClient.patch(`/admin/users/${id}/status`, { status }),

  getSellers: (params) => axiosClient.get("/admin/sellers", { params }),
  getSellerById: (id) => axiosClient.get(`/admin/sellers/${id}`),
  suspendSeller: (id) => axiosClient.patch(`/admin/sellers/${id}/suspend`),
  unsuspendSeller: (id) => axiosClient.patch(`/admin/sellers/${id}/unsuspend`),

  getProducts: (params) => axiosClient.get("/admin/products", { params }),
  updateProductStatus: (id, isActive) => axiosClient.patch(`/admin/products/${id}/status`, { isActive }),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  approveProduct: (id) => axiosClient.patch(`/admin/products/${id}/approve`),
  rejectProduct: (id, reason) => axiosClient.patch(`/admin/products/${id}/reject`, { reason }),

  getCustomers: (params) => axiosClient.get("/admin/customers", { params }),
  getCustomerById: (id) => axiosClient.get(`/admin/customers/${id}`),

  getOrders: (params) => axiosClient.get("/admin/orders", { params }),
  getOrderStats: () => axiosClient.get("/admin/orders/stats"),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
  getAnalytics: () => axiosClient.get("/admin/analytics"),

};